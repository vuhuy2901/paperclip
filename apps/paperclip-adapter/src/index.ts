import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
export const type = "ai_company_external";
export const label = "AI Software Company";
export const models = [{ id: "runtime-configured", label: "Configured at runtime" }];
export const agentConfigurationDoc = `# AI Software Company adapter

Uses the Core API for workflow state and the Codex CLI for assigned worktree tasks.
Model, timeout, sandbox and Core API URL are runtime configuration; secrets stay in environment variables.
`;

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

export async function testEnvironment() {
  const checks: Array<{ level: string; message: string }> = [];
  const core = coreConfiguration();
  try {
    const response = await fetch(`${core.url}/health`, { headers: { "x-service-token": core.token } });
    checks.push({ level: response.ok ? "info" : "error", message: response.ok ? "Core API reachable" : `Core API returned HTTP ${response.status}` });
  } catch (error: any) {
    checks.push({ level: "error", message: `Core API is unreachable: ${String(error?.message ?? error).slice(0, 300)}` });
  }
  try { const result = await execFileAsync(process.env.CODEX_BIN ?? "codex", ["--version"], { timeout: 10000 }); checks.push({ level: "info", message: `Optional Codex CLI available: ${result.stdout.trim()}` }); }
  catch { checks.push({ level: "warn", message: "Optional Codex CLI is not available; Core runner will execute the task" }); }
  return { checks };
}

export async function execute(context: any) {
  const prompt = String(context?.prompt ?? context?.task?.description ?? "");
  if (!prompt) return { status: "failed", error: "missing task prompt", failureCategory: "invalid_input" };
  const changeId = extractChangeId(context, prompt);
  if (changeId) {
    const core = coreConfiguration();
    const idempotencyKey = String(context?.idempotencyKey ?? context?.task?.id ?? `paperclip-${changeId}`);
    try {
      const response = await fetch(`${core.url}/api/integrations/paperclip/wake`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-service-token": core.token },
        body: JSON.stringify({ change_id: changeId, idempotency_key: idempotencyKey }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) return { status: "failed", failureCategory: "core_api", error: JSON.stringify(body).slice(0, 2000) };
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
      const sync = paperclipSyncConfig(context);
      void syncTerminalRun(context, runId, links).then(result => console.log(JSON.stringify({ type: "paperclip.core.sync", runId, ...result })));
      return { status: "completed", events: [{ type: "core.run.accepted", payload: body }, { type: "core.run.links", payload: links }, { type: "paperclip.core.sync.scheduled", payload: { issueId: sync.issueId ?? null, configured: Boolean(sync.apiKey && sync.issueId) } }], runId, links, sessionParams: { lastRun: new Date().toISOString() } };
    } catch (error: any) {
      return { status: "failed", failureCategory: "core_api", error: String(error?.message ?? error).slice(0, 2000) };
    }
  }
  const args = ["exec", "--json", "--ephemeral", "--sandbox", String(context?.sandbox ?? "workspace-write")];
  if (context?.model) args.push("--model", String(context.model));
  args.push(prompt);
  try {
    const result = await execFileAsync(process.env.CODEX_BIN ?? "codex", args, { cwd: context?.cwd ?? process.cwd(), timeout: Number(context?.timeoutMs ?? 900000), maxBuffer: 10 * 1024 * 1024 });
    const events = result.stdout.split(/\r?\n/).filter(Boolean).map(line => { try { return JSON.parse(line); } catch { return { type: "unparsed", text: line.slice(0, 2000) }; } });
    return { status: "completed", events, sessionParams: { lastRun: new Date().toISOString() }, usage: context?.usage ?? null };
  } catch (error: any) {
    return { status: error?.killed ? "inconclusive" : "failed", failureCategory: error?.killed ? "timeout" : "subprocess", error: String(error?.message ?? error).slice(0, 2000) };
  }
}

export function createServerAdapter() { return { type, execute, testEnvironment, models, agentConfigurationDoc }; }
