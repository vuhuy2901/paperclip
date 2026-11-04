import { readFile } from "node:fs/promises";
import { explicitTaskId, isAdmittedRecoveryContinuation, nativeTaskActions, resolveAssignedTask, taskPrompt, taskResult, type NativeTaskAction, type PaperclipRequest } from "./task-context.js";

export const type = "ai_company_external";
export const label = "AI Software Company";
export const models = [
  { id: "qwen2.5-coder:3b", label: "Qwen 2.5 Coder 3B (Ollama)" },
  { id: "llama3.2:3b", label: "Llama 3.2 3B (Ollama)" },
  { id: "runtime-configured", label: "Configured at runtime" },
];
export const agentConfigurationDoc = `# AI Software Company adapter

Runs Paperclip-assigned work through Ollama directly. Paperclip remains
the source of truth for task assignment, task hierarchy, dependencies, wakeups,
heartbeat history, and activity logs.
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

let cachedOllamaProbe: { at: number; result: { ok: boolean; detail: string } } | null = null;
let pendingOllamaProbe: Promise<{ ok: boolean; detail: string }> | null = null;

async function ollamaProbe() {
  if (cachedOllamaProbe && Date.now() - cachedOllamaProbe.at < 60_000) return cachedOllamaProbe.result;
  if (!pendingOllamaProbe) pendingOllamaProbe = (async () => {
    try {
      const ollama = (process.env.OLLAMA_BASE_URL ?? "http://ollama:11434").replace(/\/$/, "");
      const health = await fetch(`${ollama}/api/tags`, { signal: AbortSignal.timeout(5_000) });
      if (!health.ok) return { ok: false, detail: `Ollama health returned HTTP ${health.status}` };
      const response = await fetch(`${ollama}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model: process.env.OLLAMA_MODEL ?? "llama3.2:3b", stream: false, messages: [{ role: "user", content: "Reply with exactly READY and do not use tools." }] }),
        signal: AbortSignal.timeout(100_000),
      });
      if (!response.ok) return { ok: false, detail: `Ollama probe returned HTTP ${response.status}` };
      const body = await response.json() as { message?: { content?: string } };
      const ready = String(body.message?.content ?? "").trim();
      return { ok: Boolean(ready), detail: ready ? "Ollama model probe completed" : "Ollama returned no assistant message" };
    } catch (error: any) {
      return { ok: false, detail: `Ollama unavailable: ${String(error?.message ?? error).slice(0, 200)}` };
    }
  })().then((result) => {
    cachedOllamaProbe = { at: Date.now(), result };
    return result;
  }).finally(() => { pendingOllamaProbe = null; });
  return pendingOllamaProbe;
}

export async function testEnvironment() {
  const checks: Array<{ code: string; level: "info" | "error"; message: string }> = [];
  const probe = await ollamaProbe();
  checks.push({ code: probe.ok ? "ollama_probe_passed" : "ollama_probe_failed", level: probe.ok ? "info" : "error", message: probe.detail });
  return { adapterType: type, status: checks.some((check) => check.level === "error") ? "fail" : "pass", checks, testedAt: new Date().toISOString() };
}

const roleDirectories: Record<string, string> = {
  "PO": "product-owner",
  "Solution Architect": "architect", "Project Manager": "project-manager",
  "Backend Engineer": "backend-developer", "Frontend Engineer": "frontend-developer",
  "QA Tester": "tester",
  "Code Reviewer": "code-reviewer", "DevOps Engineer": "devops",
};

function executionResult(ok: boolean, summary: string, resultJson: Record<string, unknown> = {}) {
  return { exitCode: ok ? 0 : 1, signal: null, timedOut: false, errorMessage: ok ? null : summary, summary, resultJson };
}

function identityText(agent: any): string {
  return `${String(agent?.role ?? "")} ${String(agent?.name ?? "")}`.toLowerCase().replace(/[_\s]+/g, "-");
}

function allowedDelegationTarget(actor: any, target: any): boolean {
  const actorText = identityText(actor);
  const targetText = identityText(target);
  if (actorText.includes("product-owner") || actorText.endsWith("-po") || actorText === "po") {
    return targetText.includes("project-manager") || targetText.endsWith("-pm") || targetText === "pm";
  }
  if (actorText.includes("project-manager") || actorText.endsWith("-pm") || actorText === "pm") {
    return ["solution-architect", "code-reviewer", "qa-tester"].some((role) => targetText.includes(role));
  }
  if (actorText.includes("architect") || actorText.includes("cto")) {
    return ["backend-engineer", "frontend-engineer", "devops-engineer"].some((role) => targetText.includes(role));
  }
  return false;
}

function delegationTargetMatchesTask(actor: any, target: any, action: NativeTaskAction): boolean {
  const actorText = identityText(actor);
  if (!(actorText.includes("project-manager") || actorText.endsWith("-pm") || actorText === "pm")) return true;
  const targetText = identityText(target);
  const taskText = `${String(action.title ?? "")} ${String(action.description ?? "")}`.toLowerCase();
  const hasAny = (terms: string[]) => terms.some((term) => taskText.includes(term));
  if (targetText.includes("code-reviewer")) return hasAny(["review", "pull request", "pr ", "security audit", "correctness"]);
  if (targetText.includes("qa-tester")) return hasAny(["test", "qa", "regression", "e2e", "acceptance", "validation"]);
  if (targetText.includes("solution-architect")) return !hasAny(["review only", "code review", "pull request", "security audit", "regression test", "e2e test", "qa test"]);
  return true;
}

function preferredDelegationRole(action: NativeTaskAction): string {
  const title = String(action.title ?? "").toLowerCase();
  const taskText = `${title} ${String(action.description ?? "")}`.toLowerCase();
  if (/(review|pull request|\bpr\b|security audit|correctness)/.test(taskText)) return "code-reviewer";
  if (/(wireframe|user flow|usability|visual design|prototype|design system|ui\/ux)/.test(taskText)) return "solution-architect";
  if (/^(test|qa|regression|e2e|acceptance)|\b(run|execute) (the )?(test|qa|regression|e2e)/.test(title)) return "qa-tester";
  return "solution-architect";
}

function resolveDelegationTarget(actor: any, requested: any, action: NativeTaskAction, directReports: any[]): any {
  if (requested && directReports.some((candidate) => String(candidate.id) === String(requested.id)) && delegationTargetMatchesTask(actor, requested, action)) {
    return requested;
  }
  const preferred = preferredDelegationRole(action);
  return directReports.find((candidate) => identityText(candidate).includes(preferred))
    ?? directReports.find((candidate) => delegationTargetMatchesTask(actor, candidate, action));
}

async function nativeAgentInstructions(agentId: string, request: PaperclipRequest): Promise<string> {
  try {
    const bundle = await request(`/api/agents/${encodeURIComponent(agentId)}/instructions-bundle`);
    const entryFile = typeof bundle?.entryFile === "string" ? bundle.entryFile : "AGENTS.md";
    const file = await request(`/api/agents/${encodeURIComponent(agentId)}/instructions-bundle/file?path=${encodeURIComponent(entryFile)}`);
    return typeof file?.content === "string" ? file.content.trim() : "";
  } catch {
    // The adapter remains usable while a newly-created agent has no managed
    // instruction bundle yet. Local role assets provide the fallback.
    return "";
  }
}

async function applyNativeTaskActions(
  actions: NativeTaskAction[],
  issue: any,
  agent: any,
  request: PaperclipRequest,
): Promise<Array<{ identifier?: string; id: string; title: string }>> {
  if (actions.length === 0) return [];
  // Workflow templates already provision every native issue and blocker edge.
  // Agents complete their assigned step; creating children here would start a
  // second, parallel orchestration path and bypass the template dependencies.
  if (String(issue.originKind ?? "") === "plugin:ai-company-native-workflow") return [];
  // Only managers with reporting scope may fan work out. This is an
  // authorization boundary, not a workflow: specialists still execute their
  // assigned Paperclip task directly and cannot accidentally recurse work.
  const role = `${String(agent?.role ?? "")} ${String(agent?.name ?? "")}`.toLowerCase().replace(/[_\s]+/g, "-");
  if (!(role.includes("product-owner") || role.includes("project-manager") || role.includes("architect") || role.includes("cto") || role.endsWith("-po") || role.endsWith("-pm") || role === "po" || role === "pm")) {
    throw new Error(`${agent?.name ?? "This agent"} has no reporting scope for child-task delegation.`);
  }
  const companyId = String(issue.companyId ?? "");
  if (!companyId) throw new Error("The assigned issue has no company scope for native delegation.");
  const agents = await request(`/api/companies/${encodeURIComponent(companyId)}/agents`);
  const knownAgents = new Map((Array.isArray(agents) ? agents : []).map((agent: any) => [String(agent.id), agent]));
  const directReports = (Array.isArray(agents) ? agents : []).filter((candidate: any) =>
    String(candidate.reportsTo ?? "") === String(agent.id) &&
    candidate.status !== "terminated" &&
    candidate.lifecycleState !== "terminated" &&
    candidate.lifecycleState !== "rejected" &&
    allowedDelegationTarget(agent, candidate),
  );
  const eligible = directReports.map((candidate: any) =>
    `${candidate.name ?? candidate.id} (${candidate.role ?? "role unknown"}; ${candidate.capabilities ?? "capabilities not recorded"})`,
  );
  if (directReports.length === 0) {
    throw new Error(`${agent?.name ?? agent.id} has no eligible direct reports in the current native Paperclip hierarchy.`);
  }
  const existing = issue.projectId
    ? await request(`/api/companies/${encodeURIComponent(companyId)}/issues?projectId=${encodeURIComponent(issue.projectId)}&limit=200&offset=0`)
    : [];
  const created: Array<{ identifier?: string; id: string; title: string }> = [];
  const isPoOrPm = role.includes("product-owner") || role.includes("project-manager") || role.endsWith("-po") || role.endsWith("-pm") || role === "po" || role === "pm";
  const authorizedActions = isPoOrPm ? actions.slice(0, 1) : actions;
  for (const action of authorizedActions) {
    const requested = knownAgents.get(action.assigneeAgentId);
    const target = resolveDelegationTarget(agent, requested, action, directReports);
    if (!target) throw new Error(`No valid direct report can receive "${action.title}". Route implementation and design work to Solution Architect, review work to Code Reviewer, and testing work to QA Tester.`);
    const routedAction = target.id === action.assigneeAgentId ? action : { ...action, assigneeAgentId: target.id };
    const duplicate = Array.isArray(existing) ? existing.find((candidate: any) =>
      candidate.parentId === issue.id &&
      candidate.assigneeAgentId === routedAction.assigneeAgentId &&
      candidate.title === routedAction.title &&
      candidate.status !== "done" &&
      candidate.status !== "cancelled",
    ) : null;
    if (duplicate) {
      created.push({ id: duplicate.id, identifier: duplicate.identifier, title: duplicate.title });
      continue;
    }
    const child = await request(`/api/companies/${encodeURIComponent(companyId)}/issues`, {
      method: "POST",
      body: {
        title: action.title,
        description: action.description,
        status: "todo",
        priority: action.priority ?? "medium",
        assigneeAgentId: routedAction.assigneeAgentId,
        parentId: issue.id,
        ...(issue.projectId ? { projectId: issue.projectId } : {}),
      },
    });
    created.push({ id: child.id, identifier: child.identifier, title: child.title });
  }
  return created;
}

export async function execute(ctx: any) {
  const context = ctx.context ?? {};
  const wake = context.paperclipWake ?? {};
  let prompt = String(context.prompt ?? context.task?.description ?? wake.prompt ?? wake.message ?? "");
  let taskId = explicitTaskId(ctx);
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
  let ollamaSubmitted = false;
  const ollama = (process.env.OLLAMA_BASE_URL ?? "http://ollama:11434").replace(/\/$/, "");
  try {
    const resolved = await resolveAssignedTask(ctx, request);
    if (!resolved.issue) {
      const summary = `Waiting: ${resolved.reason}`;
      await ctx.onLog?.("stdout", `${summary}\n`);
      return executionResult(true, summary, { outcome: "waiting", dispatched: false });
    }
    issue = resolved.issue;
    taskId = issue.id;
    // A company-scoped Run cannot write to a task thread. Ask Paperclip's
    // native wakeup coordinator to create an issue-scoped run instead.
    if (!resolved.explicit) {
      const scoped = await request(`/api/agents/${ctx.agent.id}/wakeup`, {
        method: "POST",
        body: { source: "on_demand", triggerDetail: "system", payload: { issueId: taskId }, reason: "assigned_task_selected", idempotencyKey: `${ctx.runId}:${taskId}` },
      });
      if (!scoped.id) {
        throw new Error(`Paperclip did not admit the task run (${scoped.status ?? "skipped"}). Open ${issue.identifier} and retry the issue as the operator; check task recovery and wake-on-demand settings.`);
      }
      const summary = `Selected ${issue.identifier}. Issue-scoped execution ${scoped.id ?? scoped.status ?? "queued"} scheduled.`;
      await ctx.onLog?.("stdout", `${summary}\n`);
      return executionResult(true, summary, { issueId: taskId, issueIdentifier: issue.identifier, scopedRunId: scoped.id ?? null, outcome: "scheduled", dispatched: false });
    }
    prompt = await taskPrompt(issue, request);
    await ctx.onLog?.("stdout", `Selected ${issue.identifier}: ${issue.title}. Loading project requirements and completed dependencies.\n`);
    const roleDir = roleDirectories[ctx.agent?.name];
    const rolePrompt = roleDir ? await readFile(`/opt/role-assets/${roleDir}/prompt.md`, "utf8") : "";
    const roleSkills = roleDir ? await readFile(`/opt/role-assets/${roleDir}/skills.md`, "utf8") : "";
    const planning = ["project-manager", "architect", "code-reviewer"].includes(roleDir ?? "");
    const cwd = ctx.config?.gatewayCwd ?? issue.project?.codebase?.localFolder ?? "/workspace";
    // Codex CLI's read-only sandbox on this Windows host rejects even file
    // reads through its shell tool. Planning stays read-only by instruction;
    // the workspace-write runner is required for repository inspection.
    const sandbox = "workspace-write";
    const companyAgents = await request(`/api/companies/${encodeURIComponent(issue.companyId)}/agents`);
    const roster = (Array.isArray(companyAgents) ? companyAgents : []).map((agent: any) => ({ id: agent.id, name: agent.name, role: agent.role, reportsTo: agent.reportsTo, capabilities: agent.capabilities })).filter((agent: any) => agent.id && agent.name);
    const directReports = roster.filter((agent: any) => String(agent.reportsTo ?? "") === String(ctx.agent.id) && allowedDelegationTarget(ctx.agent, agent));
    const eligibleDelegationTargets = directReports
      .map((agent: any) => `${agent.name} [${agent.id}] capabilities=${agent.capabilities ?? "not recorded"}`)
      .join("; ");
    const companyGoals = await request(`/api/companies/${encodeURIComponent(issue.companyId)}/goals`);
    const nativeInstructions = await nativeAgentInstructions(ctx.agent.id, request);
    const normalizedRole = `${String(ctx.agent.role ?? "")} ${String(ctx.agent.name ?? "")}`.toLowerCase().replace(/[_\s]+/g, "-");
    const mayDelegate = directReports.length > 0 && (
      normalizedRole.includes("product-owner") ||
      normalizedRole.includes("project-manager") ||
      normalizedRole.includes("architect") ||
      normalizedRole.includes("cto") ||
      normalizedRole.includes("lead") ||
      normalizedRole.endsWith("-po") ||
      normalizedRole.endsWith("-pm") ||
      normalizedRole === "po" ||
      normalizedRole === "pm"
    );
    const delegationContract = mayDelegate
      ? `If and only if this task explicitly needs delegation, emit exactly one plain JSON <paperclip-actions>{"actions":[{"type":"create_task","title":"...","description":"...","assigneeAgentId":"exact-agent-id","priority":"medium"}]}</paperclip-actions> block. Do not wrap it in Markdown, XML, or another code block. Each action creates one native Paperclip child task and Paperclip's assignment wakeup coordinator notifies the assignee. HARD RULE: your only eligible delegation targets are these current direct reports: ${eligibleDelegationTargets || "none"}. Choose an assigneeAgentId from that list only. Never target the human CEO, an ancestor, yourself, a sibling, or an unrelated agent. Never skip levels to reach a specialist. Never use a future dependency as a scheduler. Do not put any other action type in this block.`
      : "You are an individual contributor for this task. Do not delegate, create child tasks, or emit paperclip-actions. Complete the assigned work yourself and report the evidence.";
    const workPrompt = [rolePrompt, roleSkills, nativeInstructions ? `Native Paperclip AGENTS.md:\n${nativeInstructions}` : "", prompt, `Paperclip issue ID: ${taskId}`,
      `Company goals (native Paperclip source of truth):\n${JSON.stringify(Array.isArray(companyGoals) ? companyGoals : [])}`,
      `Company agent roster (use these exact IDs only when delegating):\n${JSON.stringify(roster)}`,
      `Current direct reports eligible for native delegation (use only these IDs):\n${JSON.stringify(directReports)}`,
      delegationContract,
      "Return your substantive deliverable in the final response so Paperclip can save it as a task comment. Explain completed work, evidence, and remaining blockers. Finish with a plain <paperclip-result>{\"status\":\"done\"}</paperclip-result> only if this assigned task's deliverables are complete; do not wrap it in Markdown or XML. Use status blocked for missing prerequisites or in_progress for unfinished work. Never claim completion on a question, tool failure, or plan for an implementation task.",
      planning ? "This is a read-only planning/review task. Provide the full plan, specification, or review in your final response. Do not implement code or deploy." : "Do not modify unrelated projects or deploy without the user's approval.",
    ].filter(Boolean).join("\n\n");
    // Refuse an unavailable runtime before checkout or posting a started comment.
    phase = "paperclip";
    const expectedStatuses = ["todo", "in_progress", "backlog"];
    if (issue.status === "blocked" && isAdmittedRecoveryContinuation(issue, ctx)) expectedStatuses.push("blocked");
    await request(`/api/issues/${taskId}/checkout`, { method: "POST", body: { agentId: ctx.agent.id, expectedStatuses } });
    checkedOut = true;
    await request(`/api/issues/${taskId}/comments`, { method: "POST", body: { body: `${ctx.agent.name} started ${issue.identifier}.\n\nRun: ${ctx.runId}\nModel: ${ctx.config?.model ?? "runtime default"}\nProject requirements and dependencies loaded.`, } });
    phase = "ollama_run";
    ctx.onDispatch?.();
    const response = await fetch(`${ollama}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: ctx.config?.model ?? process.env.OLLAMA_MODEL ?? "llama3.2:3b", stream: false, messages: [{ role: "user", content: workPrompt }], options: { temperature: 0.1, num_predict: Number(process.env.OLLAMA_NUM_PREDICT ?? 2048) } }),
      signal: ctx.signal,
    });
    if (!response.ok) throw new Error(`Ollama returned HTTP ${response.status}`);
    ollamaSubmitted = true;
    const ollamaBody = await response.json() as { message?: { content?: string } };
    const body = { status: ollamaBody.message?.content ? "completed" : "failed", summary: ollamaBody.message?.content ?? "Ollama returned no assistant message" };
    phase = "paperclip_result";
    const summary = body.summary;
    await ctx.onLog?.("stdout", `${summary}\n`);
    const outcome = taskResult(summary);
    const delegated = body.status === "completed" ? await applyNativeTaskActions(nativeTaskActions(summary), issue, ctx.agent, request) : [];
    const delegationReport = delegated.length
      ? `\n\nNative Paperclip child task(s): ${delegated.map((child) => `${child.identifier ?? child.id} (${child.title})`).join(", ")}.`
      : "";
    const shouldPostComment = outcome.status !== "in_progress" || delegated.length > 0 || (outcome.report && !outcome.report.includes("No substantive deliverable was returned."));
    if (shouldPostComment) {
      await request(`/api/issues/${taskId}/comments`, { method: "POST", body: { body: `${ctx.agent.name}: ${body.status === "completed" ? outcome.status : "execution failed"}\n\n${outcome.report}${delegationReport}` } });
    }
    if (body.status === "completed" && outcome.status !== "in_progress") {
      const update = outcome.status === "blocked"
        ? { status: "blocked", unblockDescriptor: { owner: { agentId: ctx.agent.id }, action: "Review the blocker report in this issue, supply the missing prerequisite, then move the task to Todo and retry." } }
        : { status: outcome.status };
      await request(`/api/issues/${taskId}`, { method: "PATCH", body: update });
    }
    return executionResult(body.status === "completed", outcome.report.slice(0, 4000), { issueId: taskId, issueIdentifier: issue.identifier, taskStatus: body.status === "completed" ? outcome.status : "in_progress", ollamaStatus: body.status, model: ctx.config?.model ?? null, delegatedIssueIds: delegated.map((child) => child.id) });
  } catch (error: any) {
    const connectionCode = String(error?.cause?.code ?? "");
    const summary = phase === "ollama_run"
      ? `Task execution failed: Ollama ${new URL(ollama).host} request failed (${connectionCode || String(error?.message ?? error)}). Start Ollama and retry this task.`
      : `Task execution failed: ${String(error?.message ?? error).slice(0, 500)}`;
    await ctx.onLog?.("stderr", `${summary}\n`);
    if (issue && taskId && checkedOut) {
      try { await request(`/api/issues/${taskId}/comments`, { method: "POST", body: { body: summary } }); } catch { /* Preserve the original error if reporting also fails. */ }
    }
    return executionResult(false, summary, { issueId: taskId || null, failurePhase: phase, connectionCode: connectionCode || null, ollamaSubmitted });
  }
}

export function createServerAdapter() { return { type, execute, testEnvironment, listSkills, syncSkills, models, agentConfigurationDoc, supportsLocalAgentJwt: true }; }
