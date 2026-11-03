import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { assertWorkflowExecutionAllowed, explicitTaskId, isAdmittedRecoveryContinuation, resolveAssignedTask, taskPrompt, taskResult, type PaperclipRequest } from "./task-context.js";

const execFileAsync = promisify(execFile);
export const type = "ai_company_external";
export const label = "AI Software Company";
export const models = [
  { id: "gpt-6-sol", label: "GPT-6 Sol (Codex)" },
  { id: "gpt-5.6-luna", label: "GPT-5.6 Luna (Codex)" },
  { id: "runtime-configured", label: "Configured at runtime" },
];
export const agentConfigurationDoc = `# AI Software Company adapter

Uses the Core API for workflow state and the Codex CLI for assigned worktree tasks.
Model, timeout, sandbox and Core API URL are runtime configuration; secrets stay in environment variables.
`;

function skillSnapshot(context: any, desiredSkills: string[] = []) {
  const config = context?.config ?? {};
  const configured = Array.isArray(config.paperclipSkillSync?.desiredSkills)
    ? config.paperclipSkillSync.desiredSkills.filter((value: unknown): value is string => typeof value === "string")
    : desiredSkills;
  const runtimeEntries = Array.isArray(config.paperclipRuntimeSkills)
    ? config.paperclipRuntimeSkills
        .filter((entry: any) => typeof entry?.key === "string")
        .map((entry: any) => ({ key: entry.key, runtimeName: entry.runtimeName ?? entry.name ?? entry.key.split("/").at(-1) }))
    : [];
  const entries = [...new Map([
    ...runtimeEntries,
    ...configured.map((key: string) => ({ key, runtimeName: key.split("/").at(-1) ?? key })),
  ].map((entry) => [entry.key, entry])).values()].map((entry) => ({
    key: entry.key,
    runtimeName: entry.runtimeName,
    desired: configured.includes(entry.key),
    managed: true,
    state: configured.includes(entry.key) ? "configured" : "available",
    origin: "company_managed",
    originLabel: "AI Software Company",
    detail: "Available to the assigned AI Software Company role.",
  }));
  return {
    adapterType: type,
    supported: true,
    mode: "ephemeral",
    desiredSkills: configured,
    desiredSkillEntries: configured.map((key: string) => ({ key, versionId: null })),
    entries,
    warnings: [],
  };
}

export async function listSkills(context: any) { return skillSnapshot(context); }
export async function syncSkills(context: any, desiredSkills: string[]) { return skillSnapshot(context, desiredSkills); }

function coreConfiguration() {
  return {
    url: (process.env.CORE_API_URL ?? "http://core-api:8000").replace(/\/$/, ""),
    publicUrl: (process.env.CORE_PUBLIC_URL ?? "http://localhost:8001").replace(/\/$/, ""),
    token: process.env.SERVICE_TOKEN ?? "dev-service-token",
  };
}

function extractChangeId(context: any, prompt: string) {
  const explicit = context?.changeId ?? context?.metadata?.change_id ?? context?.task?.changeId ?? context?.task?.metadata?.change_id;
  if (explicit) return String(explicit);
  const match = prompt.match(/(?:change[_ -]?id|core change id)\s*[:=]\s*([0-9a-f-]{36})/i);
  return match?.[1] ?? null;
}

function paperclipSyncConfig(context: any) {
  return {
    apiUrl: String(context?.paperclipApiUrl ?? process.env.PAPERCLIP_API_URL ?? "http://paperclip:3100").replace(/\/$/, ""),
    apiKey: context?.paperclipApiKey ?? process.env.PAPERCLIP_API_KEY,
    issueId: context?.issueId ?? context?.task?.issueId ?? context?.task?.id,
  };
}

async function syncTerminalRun(context: any, runId: string, links: Record<string, string>) {
  const sync = paperclipSyncConfig(context);
  if (!sync.apiKey || !sync.issueId) return { status: "skipped", reason: "Paperclip API key or issue id is not configured" };
  const core = coreConfiguration();
  let snapshot: any = null;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(`${core.url}/api/runs/${runId}`, { headers: { "x-service-token": core.token } });
      if (response.ok) {
        snapshot = await response.json();
        if (["awaiting_acceptance", "accepted", "rejected", "failed", "blocked", "cancelled"].includes(snapshot?.run?.status)) break;
      }
    } catch { /* keep polling; the Core API may be restarting */ }
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  const status = String(snapshot?.run?.status ?? "unknown");
  const body = [
    `AI Software Company run ${runId} finished with status: ${status}.`,
    `Core run: ${links.run}`,
    `Artifacts: ${links.artifacts}`,
    `Evidence: ${links.evidence}`,
    `Preview: ${links.preview}`,
    `Baseline/candidate diff: ${links.diff}`,
  ].join("\n");
  try {
    const response = await fetch(`${sync.apiUrl}/api/issues/${encodeURIComponent(String(sync.issueId))}/comments`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${sync.apiKey}` },
      body: JSON.stringify({ body, authorType: "agent", metadata: { version: "1", sourceChannel: "ai_company", sourceRunId: runId, sections: { status, links } } }),
    });
    return response.ok ? { status: "synced", issueId: sync.issueId, runStatus: status } : { status: "failed", httpStatus: response.status, runStatus: status };
  } catch (error: any) {
    return { status: "failed", error: String(error?.message ?? error).slice(0, 500), runStatus: status };
  }
}

let cachedCodexProbe: { at: number; result: { ok: boolean; detail: string } } | null = null;
let pendingCodexProbe: Promise<{ ok: boolean; detail: string }> | null = null;

async function codexProbe() {
  if (cachedCodexProbe && Date.now() - cachedCodexProbe.at < 60_000) return cachedCodexProbe.result;
  if (!pendingCodexProbe) pendingCodexProbe = (async () => {
    try {
      const gateway = (process.env.CODEX_GATEWAY_URL ?? "http://host.docker.internal:8400").replace(/\/$/, "");
      const health = await fetch(`${gateway}/health`, { signal: AbortSignal.timeout(5_000) });
      if (!health.ok) return { ok: false, detail: `Codex gateway health returned HTTP ${health.status}` };
      const response = await fetch(`${gateway}/run`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-gateway-token": process.env.CODEX_GATEWAY_TOKEN ?? "dev-codex-gateway" },
        body: JSON.stringify({ cwd: "/workspace", sandbox: "read-only", provider: "ollama", model: process.env.OLLAMA_MODEL ?? "llama3.2:3b", timeout_seconds: 90, prompt: "Reply with exactly READY and do not use tools." }),
        signal: AbortSignal.timeout(100_000),
      });
      if (!response.ok) return { ok: false, detail: `Codex gateway probe returned HTTP ${response.status}` };
      const body = await response.json() as { status?: string; summary?: string };
      return { ok: body.status === "completed", detail: body.status === "completed" ? "Codex CLI completed an authenticated read-only probe" : String(body.summary ?? body.status ?? "unknown failure").slice(0, 300) };
    } catch (error: any) {
      return { ok: false, detail: `Codex gateway unavailable: ${String(error?.message ?? error).slice(0, 200)}` };
    }
  })().then((result) => {
    cachedCodexProbe = { at: Date.now(), result };
    return result;
  }).finally(() => { pendingCodexProbe = null; });
  return pendingCodexProbe;
}

export async function testEnvironment() {
  const checks: Array<{ code: string; level: "info" | "error"; message: string }> = [];
  const core = coreConfiguration();
  try {
    const response = await fetch(`${core.url}/health`, { headers: { "x-service-token": core.token } });
    checks.push({ code: "core_api_health", level: response.ok ? "info" : "error", message: response.ok ? "Core API reachable" : `Core API returned HTTP ${response.status}` });
  } catch (error: any) {
    checks.push({ code: "core_api_health", level: "error", message: `Core API is unreachable: ${String(error?.message ?? error).slice(0, 300)}` });
  }
  const probe = await codexProbe();
  checks.push({ code: probe.ok ? "codex_hello_probe_passed" : "codex_hello_probe_failed", level: probe.ok ? "info" : "error", message: probe.detail });
  return { adapterType: type, status: checks.some((check) => check.level === "error") ? "fail" : "pass", checks, testedAt: new Date().toISOString() };
}

const roleDirectories: Record<string, string> = {
  "Solution Architect": "architect", "Project Manager": "project-manager",
  "Backend Engineer": "backend-developer", "Frontend Engineer": "frontend-developer",
  "UI UX Designer": "ui-ux-designer", "QA Tester": "tester",
  "Code Reviewer": "code-reviewer", "DevOps Engineer": "devops",
};

function executionResult(ok: boolean, summary: string, resultJson: Record<string, unknown> = {}) {
  return { exitCode: ok ? 0 : 1, signal: null, timedOut: false, errorMessage: ok ? null : summary, summary, resultJson };
}

async function dispatchCoreRun(ctx: any, context: any, taskId: string, changeId: string) {
    const core = coreConfiguration();
    const idempotencyKey = String(context.idempotencyKey || taskId || `paperclip-${changeId}`);
    try {
      const response = await fetch(`${core.url}/api/integrations/paperclip/wake`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-service-token": core.token },
        body: JSON.stringify({ change_id: changeId, idempotency_key: idempotencyKey }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) return executionResult(false, `Core API wake returned HTTP ${response.status}`, { body });
      const runId = String(body.run_id);
      const publicCore = core.publicUrl;
      const links = {
        run: `${publicCore}/api/runs/${runId}`,
        events: `${publicCore}/api/runs/${runId}/events`,
        artifacts: `${publicCore}/api/runs/${runId}/artifacts`,
        evidence: `${publicCore}/api/runs/${runId}/evidence`,
        preview: `${publicCore}/api/runs/${runId}/preview`,
        diff: `${publicCore}/api/runs/${runId}/diff`,
      };
      const sync = paperclipSyncConfig({ ...context, paperclipApiKey: ctx.authToken ?? context.paperclipApiKey });
      void syncTerminalRun({ ...context, paperclipApiKey: sync.apiKey, issueId: taskId }, runId, links).then(result => console.log(JSON.stringify({ type: "paperclip.core.sync", runId, ...result })));
      await ctx.onLog?.("stdout", `Core run ${runId} accepted. Review: ${links.run}\n`);
      return executionResult(true, `Core run ${runId} accepted`, { runId, links });
    } catch (error: any) {
      return executionResult(false, `Core API wake failed: ${String(error?.message ?? error).slice(0, 300)}`);
    }
}

export async function execute(ctx: any) {
  const context = ctx.context ?? {};
  const wake = context.paperclipWake ?? {};
  let prompt = String(context.prompt ?? context.task?.description ?? wake.prompt ?? wake.message ?? "");
  let taskId = explicitTaskId(ctx);
  const changeId = extractChangeId(context, prompt);
  if (changeId) return dispatchCoreRun(ctx, context, taskId, changeId);
  if (!ctx.authToken) return executionResult(false, "Paperclip did not provide the run-scoped agent credential. Reload the adapter with supportsLocalAgentJwt enabled.");
  const apiUrl = (process.env.PAPERCLIP_INTERNAL_API_URL ?? "http://127.0.0.1:3101").replace(/\/$/, "");
  const request: PaperclipRequest = async (path, options = {}) => {
    const response = await fetch(`${apiUrl}${path}`, {
      method: options.method ?? "GET",
      headers: { "content-type": "application/json", ...(ctx.authToken ? { authorization: `Bearer ${ctx.authToken}` } : {}), ...(ctx.runId ? { "x-paperclip-run-id": ctx.runId } : {}) },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(`Paperclip ${options.method ?? "GET"} ${path.split("?")[0]} returned HTTP ${response.status}: ${detail.error ?? response.statusText}`);
    }
    return response.json();
  };
  let issue: any = null;
  let checkedOut = false;
  let phase = "paperclip";
  let gatewaySubmitted = false;
  const gateway = (process.env.CODEX_GATEWAY_URL ?? "http://host.docker.internal:8400").replace(/\/$/, "");
  try {
    const resolved = await resolveAssignedTask(ctx, request);
    if (!resolved.issue) {
      const summary = `Waiting: ${resolved.reason}`;
      await ctx.onLog?.("stdout", `${summary}\n`);
      return executionResult(true, summary, { outcome: "waiting", dispatched: false });
    }
    issue = resolved.issue;
    taskId = issue.id;
    // This is the last backend admission check before either scheduling an
    // issue-scoped run or checking the issue out. Paperclip dependencies are
    // useful defence in depth, but the published run snapshot is authoritative.
    await assertWorkflowExecutionAllowed(issue, ctx, request);
    // A company-scoped Run now cannot write to a task thread. Start a proper
    // issue-scoped run so Paperclip owns attribution, locks and access checks.
    if (!resolved.explicit) {
      const scoped = await request(`/api/agents/${ctx.agent.id}/heartbeat/invoke`, {
        method: "POST",
        body: { payload: { issueId: taskId }, reason: "assigned_task_selected", idempotencyKey: `${ctx.runId}:${taskId}` },
      });
      if (!scoped.id) {
        throw new Error(`Paperclip did not admit the task run (${scoped.status ?? "skipped"}). Open ${issue.identifier} and retry the issue as the operator; check task recovery and wake-on-demand settings.`);
      }
      const summary = `Selected ${issue.identifier}. Issue-scoped execution ${scoped.id ?? scoped.status ?? "queued"} scheduled.`;
      await ctx.onLog?.("stdout", `${summary}\n`);
      return executionResult(true, summary, { issueId: taskId, issueIdentifier: issue.identifier, scopedRunId: scoped.id ?? null, outcome: "scheduled", dispatched: false });
    }
    prompt = await taskPrompt(issue, request);
    const issueChangeId = extractChangeId(context, [issue.title, issue.description].filter(Boolean).join("\n"));
    if (issueChangeId) return dispatchCoreRun(ctx, context, taskId, issueChangeId);
    await ctx.onLog?.("stdout", `Selected ${issue.identifier}: ${issue.title}. Loading project requirements and completed dependencies.\n`);
    const roleDir = roleDirectories[ctx.agent?.name];
    const rolePrompt = roleDir ? await readFile(`/opt/role-assets/${roleDir}/prompt.md`, "utf8") : "";
    const roleSkills = roleDir ? await readFile(`/opt/role-assets/${roleDir}/skills.md`, "utf8") : "";
    const planning = ["project-manager", "architect", "ui-ux-designer", "code-reviewer"].includes(roleDir ?? "");
    const cwd = ctx.config?.gatewayCwd ?? issue.project?.codebase?.localFolder ?? "/workspace";
    // Codex CLI's read-only sandbox on this Windows host rejects even file
    // reads through its shell tool. Planning stays read-only by instruction;
    // the workspace-write runner is required for repository inspection.
    const sandbox = "workspace-write";
    const workPrompt = [rolePrompt, roleSkills, prompt, `Paperclip issue ID: ${taskId}`,
      "Return your substantive deliverable in the final response so Paperclip can save it as a task comment. Explain completed work, evidence, and remaining blockers. Finish with <paperclip-result>{\"status\":\"done\"}</paperclip-result> only if this assigned task's deliverables are complete. Use status blocked for missing prerequisites or in_progress for unfinished work. Never claim completion on a question, tool failure, or plan for an implementation task.",
      planning ? "This is a read-only planning/review task. Provide the full plan, specification, or review in your final response. Do not implement code or deploy." : "Do not modify unrelated projects or deploy without the user's approval.",
    ].filter(Boolean).join("\n\n");
    // Refuse an unavailable runtime before checkout or posting a started comment.
    phase = "gateway_health";
    const health = await fetch(`${gateway}/health`, { signal: AbortSignal.timeout(5000) });
    if (!health.ok || (await health.json() as { status?: string }).status !== "ok") {
      throw new Error(`Gateway health check failed (HTTP ${health.status}).`);
    }
    phase = "paperclip";
    const expectedStatuses = ["todo", "in_progress", "backlog"];
    if (issue.status === "blocked" && isAdmittedRecoveryContinuation(issue, ctx)) expectedStatuses.push("blocked");
    await request(`/api/issues/${taskId}/checkout`, { method: "POST", body: { agentId: ctx.agent.id, expectedStatuses } });
    checkedOut = true;
    await request(`/api/issues/${taskId}/comments`, { method: "POST", body: { body: `${ctx.agent.name} started ${issue.identifier}.\n\nRun: ${ctx.runId}\nModel: ${ctx.config?.model ?? "runtime default"}\nProject requirements and dependencies loaded.`, } });
    phase = "gateway_run";
    ctx.onDispatch?.();
    const response = await fetch(`${gateway}/run`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-gateway-token": process.env.CODEX_GATEWAY_TOKEN ?? "dev-codex-gateway" },
      body: JSON.stringify({ cwd, sandbox, timeout_seconds: Number(ctx.config?.timeoutSec ?? 900), provider: ctx.config?.provider ?? "ollama", model: ctx.config?.model, prompt: workPrompt }),
      signal: ctx.signal,
    });
    if (!response.ok) throw new Error(`Codex gateway returned HTTP ${response.status}`);
    gatewaySubmitted = true;
    const body = await response.json() as { status?: string; summary?: string; events?: Array<{ type?: string; item?: { type?: string; text?: string } }> };
    phase = "paperclip_result";
    const assistantText = body.events?.filter((event) => event.type === "item.completed" && event.item?.type === "agent_message").map((event) => event.item?.text ?? "").filter(Boolean).at(-1);
    const summary = assistantText || body.summary || "Codex gateway returned no summary";
    await ctx.onLog?.("stdout", `${summary}\n`);
    const outcome = taskResult(summary);
    await request(`/api/issues/${taskId}/comments`, { method: "POST", body: { body: `${ctx.agent.name}: ${body.status === "completed" ? outcome.status : "execution failed"}\n\n${outcome.report}` } });
    if (body.status === "completed" && outcome.status !== "in_progress") {
      const update = outcome.status === "blocked"
        ? { status: "blocked", unblockDescriptor: { owner: { agentId: ctx.agent.id }, action: "Review the blocker report in this issue, supply the missing prerequisite, then move the task to Todo and retry." } }
        : { status: outcome.status };
      await request(`/api/issues/${taskId}`, { method: "PATCH", body: update });
    }
    return executionResult(body.status === "completed", outcome.report.slice(0, 4000), { issueId: taskId, issueIdentifier: issue.identifier, taskStatus: body.status === "completed" ? outcome.status : "in_progress", gatewayStatus: body.status, model: ctx.config?.model ?? null, eventCount: body.events?.length ?? 0 });
  } catch (error: any) {
    const connectionCode = String(error?.cause?.code ?? "");
    const summary = phase === "gateway_health" || phase === "gateway_run"
      ? `Task execution failed: Codex gateway ${new URL(gateway).host} ${phase === "gateway_health" ? "is unavailable before task execution" : "request failed"} (${connectionCode || String(error?.message ?? error)}). ${phase === "gateway_health" ? "Start the host gateway, then retry this task." : "Inspect the previous run before retrying; the request outcome may be uncertain."}`
      : `Task execution failed: ${String(error?.message ?? error).slice(0, 500)}`;
    await ctx.onLog?.("stderr", `${summary}\n`);
    if (issue && taskId && checkedOut) {
      try { await request(`/api/issues/${taskId}/comments`, { method: "POST", body: { body: summary } }); } catch { /* Preserve the original error if reporting also fails. */ }
    }
    return executionResult(false, summary, { issueId: taskId || null, failurePhase: phase, connectionCode: connectionCode || null, gatewaySubmitted });
  }
}

export function createServerAdapter() { return { type, execute, testEnvironment, listSkills, syncSkills, models, agentConfigurationDoc, supportsLocalAgentJwt: true }; }
