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
    token: process.env.SERVICE_TOKEN ?? "dev-service-token",
  };
}

function extractChangeId(context: any, prompt: string) {
  const explicit = context?.changeId ?? context?.metadata?.change_id ?? context?.task?.changeId ?? context?.task?.metadata?.change_id;
  if (explicit) return String(explicit);
  const match = prompt.match(/(?:change[_ -]?id|core change id)\s*[:=]\s*([0-9a-f-]{36})/i);
  return match?.[1] ?? null;
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
      const links = {
        run: `${core.url}/api/runs/${runId}`,
        events: `${core.url}/api/runs/${runId}/events`,
        artifacts: `${core.url}/api/runs/${runId}/artifacts`,
        evidence: `${core.url}/api/runs/${runId}/evidence`,
        preview: `${core.url}/api/runs/${runId}/preview`,
        diff: `${core.url}/api/runs/${runId}/diff`,
      };
      return { status: "completed", events: [{ type: "core.run.accepted", payload: body }, { type: "core.run.links", payload: links }], runId, links, sessionParams: { lastRun: new Date().toISOString() } };
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
