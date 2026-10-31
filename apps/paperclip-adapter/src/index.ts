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

export async function testEnvironment() {
  const checks: Array<{ level: string; message: string }> = [];
  try { const result = await execFileAsync(process.env.CODEX_BIN ?? "codex", ["--version"], { timeout: 10000 }); checks.push({ level: "info", message: `Codex CLI available: ${result.stdout.trim()}` }); }
  catch { checks.push({ level: "error", message: "Codex CLI is not available" }); }
  checks.push({ level: process.env.CORE_API_URL ? "info" : "warn", message: process.env.CORE_API_URL ? "Core API URL configured" : "CORE_API_URL is not configured" });
  return { checks };
}

export async function execute(context: any) {
  const prompt = String(context?.prompt ?? context?.task?.description ?? "");
  if (!prompt) return { status: "failed", error: "missing task prompt", failureCategory: "invalid_input" };
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
