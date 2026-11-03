import test from "node:test";
import assert from "node:assert/strict";
import { assertWorkflowExecutionAllowed, explicitTaskId, resolveAssignedTask, taskPrompt, taskResult, waitingReason } from "../dist/task-context.js";
import { createServerAdapter, execute } from "../dist/index.js";

const ctx = { agent: { id: "pm", companyId: "company", name: "Test Agent" }, context: {}, runtime: {}, config: {}, runId: "run", authToken: "test-run-token" };
const assigned = { id: "task", identifier: "AIS-3", companyId: "company", assigneeAgentId: "pm", status: "backlog", title: "Analyze and plan", blockedBy: [] };
const isGatePath = (path) => path === "/api/plugins/ai-company-workflow-studio/actions/can-execute";
const admitted = () => Response.json({ allowed: true, code: "NO_ACTIVE_RUN", reason: "Independent task" });

test("host injects a run-scoped agent credential for task mutations", () => {
  assert.equal(createServerAdapter().supportsLocalAgentJwt, true);
});

test("missing run credential cannot fall back to a local board identity", async () => {
  const result = await execute({ ...ctx, authToken: undefined });
  assert.equal(result.exitCode, 1);
  assert.match(result.summary, /run-scoped agent credential/);
});

test("manual Run now resolves the assigned issue instead of requiring a supplied id", async () => {
  const result = await resolveAssignedTask(ctx, async (path) => path.includes("/companies/") ? [assigned] : assigned);
  assert.equal(result.issue.id, "task");
});

test("explicit scope never falls back to another issue when blocked", async () => {
  const paths = [];
  const result = await resolveAssignedTask({ ...ctx, context: { issueId: "blocked-task" } }, async (path) => {
    paths.push(path);
    return { ...assigned, blockedBy: [{ identifier: "AIS-4", status: "in_progress" }] };
  });
  assert.equal(result.issue, null);
  assert.match(result.reason, /AIS-4/);
  assert.equal(paths.length, 1);
});

test("completed blockers allow work, cancelled or unfinalized blockers do not", () => {
  assert.equal(waitingReason({ ...assigned, blockedBy: [{ status: "done" }] }, ctx), null);
  assert.ok(waitingReason({ ...assigned, blockedBy: [{ status: "cancelled" }] }, ctx));
  assert.ok(waitingReason({ ...assigned, blockerAttention: { pendingFinalizeBlockerIssueIds: ["other"] } }, ctx));
});

test("a blocked task resumes only with host-admitted recovery and satisfied dependencies", () => {
  const continuationCtx = { ...ctx, context: { issueId: "task", previousRunId: "old-run", explicitUserContinuation: { previousRunId: "old-run", failedRunId: "old-run" } } };
  const blocked = { ...assigned, status: "blocked", executionBlocker: null };
  assert.equal(waitingReason(blocked, continuationCtx), null);
  assert.match(waitingReason(blocked, ctx), /status is blocked/);
  assert.match(waitingReason({ ...blocked, executionBlocker: { runId: "old-run" } }, continuationCtx), /status is blocked/);
  assert.match(waitingReason({ ...blocked, blockedBy: [{ identifier: "AIS-4", status: "in_progress" }] }, continuationCtx), /Waiting for AIS-4/);
  assert.match(waitingReason(blocked, { ...continuationCtx, context: { ...continuationCtx.context, previousRunId: "other" } }), /status is blocked/);
});

test("another agent, another run, paused project and terminal status are rejected", () => {
  for (const patch of [{ assigneeAgentId: "other" }, { companyId: "other" }, { checkoutRunId: "other-run" }, { project: { pausedAt: "now" } }, { status: "done" }]) {
    assert.ok(waitingReason({ ...assigned, ...patch }, ctx));
  }
});

test("manual selection skips blocked work and prioritizes ongoing tasks", async () => {
  const a = { ...assigned, id: "a", status: "todo", blockedBy: [{ status: "backlog" }] };
  const b = { ...assigned, id: "b", status: "in_progress" };
  const c = { ...assigned, id: "c" };
  const result = await resolveAssignedTask(ctx, async (path) => path.includes("/companies/") ? [a, c, b] : { a, b, c }[path.split("/").at(-1)]);
  assert.equal(result.issue.id, "b");
});

test("task id supports runtime and wake payload conventions", () => {
  assert.equal(explicitTaskId({ context: { paperclipWake: { issueId: "wake" } } }), "wake");
  assert.equal(explicitTaskId({ context: { taskId: "task" }, runtime: { taskKey: "runtime" } }), "task");
  assert.equal(explicitTaskId({ runtime: { taskKey: "runtime" } }), "runtime");
});

test("explicit source requirement and completed predecessor handoff reach the model", async () => {
  const prompt = await taskPrompt({ ...assigned, description: "Nguồn yêu cầu: AIS-2", projectId: "project", project: { name: "English learning" }, blockedBy: [{ id: "parent", identifier: "AIS-4", title: "Architecture" }] }, async (path) => {
    if (path === "/api/issues/AIS-2") return { id: "brief", identifier: "AIS-2", title: "MVP", description: "Beginner, Intermediate, Advanced", projectId: "project" };
    if (path.includes("parent")) return [{ body: "Approved architecture handoff" }];
    return [];
  });
  assert.match(prompt, /AIS-2/);
  assert.match(prompt, /Beginner, Intermediate, Advanced/);
  assert.match(prompt, /Approved architecture handoff/);
});

test("unrelated project briefs are not injected into task context", async () => {
  const paths = [];
  const prompt = await taskPrompt({ ...assigned, projectId: "project", project: { name: "English learning" } }, async (path) => {
    paths.push(path);
    return [];
  });
  assert.ok(!paths.some((path) => path.includes("/companies/")));
  assert.doesNotMatch(prompt, /Project requirement/);
});

test("provider success alone does not mark the task done", () => {
  assert.equal(taskResult("I will start tomorrow").status, "in_progress");
  assert.equal(taskResult('Missing requirements\n<paperclip-result>{"status":"blocked"}</paperclip-result>').status, "blocked");
  assert.equal(taskResult('<paperclip-result>{"status":"done"}</paperclip-result>').status, "in_progress");
  assert.deepEqual(taskResult('Completed plan\n<paperclip-result>{"status":"done"}</paperclip-result>'), { status: "done", report: "Completed plan" });
  assert.deepEqual(taskResult('Missing access\n< paperclip-result>{"status":"blocked"}</paperclip-result>'), { status: "blocked", report: "Missing access" });
  assert.equal(taskResult('<paperclip-result>{invalid}</paperclip-result>').status, "in_progress");
});

test("workflow execution gate is called with issue and agent identity and fails closed", async () => {
  let requestBody;
  await assertWorkflowExecutionAllowed(assigned, ctx, async (_path, options) => {
    requestBody = options.body;
    return { data: { allowed: true, code: "ADMITTED", reason: "ok", runId: "workflow-run" } };
  });
  assert.deepEqual(requestBody, {
    companyId: "company",
    params: { companyId: "company", issueId: "task", agentId: "pm" }
  });
  await assert.rejects(
    assertWorkflowExecutionAllowed(assigned, ctx, async () => ({ allowed: false, code: "DEPENDENCY_NOT_MET", reason: "Architect is not done" })),
    /DEPENDENCY_NOT_MET/
  );
});

test("no assigned work ends as waiting without dispatching AI", async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url) => { calls.push(String(url)); return Response.json([]); };
  try {
    const result = await execute(ctx);
    assert.equal(result.exitCode, 0);
    assert.equal(result.resultJson.outcome, "waiting");
    assert.equal(calls.length, 1);
    assert.ok(!calls[0].endsWith("/run"));
  } finally { globalThis.fetch = original; }
});

test("company Run now hands off to an issue-scoped run without cross-issue writes", async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    calls.push({ path, options });
    if (isGatePath(path)) return admitted();
    if (path.endsWith("/heartbeat/invoke")) return Response.json({ id: "scoped-run", status: "queued" });
    return Response.json(path.includes("/companies/") ? [assigned] : assigned);
  };
  try {
    const result = await execute(ctx);
    assert.equal(result.exitCode, 0);
    assert.equal(result.resultJson.scopedRunId, "scoped-run");
    const heartbeat = calls.find((call) => call.path === "/api/agents/pm/heartbeat/invoke");
    assert.equal(JSON.parse(heartbeat.options.body).payload.issueId, "task");
    assert.ok(calls.some((call) => isGatePath(call.path)), "gate must run before heartbeat scheduling");
    assert.ok(!calls.some((call) => call.path.endsWith("/checkout") || call.path === "/run"));
  } finally { globalThis.fetch = original; }
});

test("real task lifecycle checks out, posts output and updates only its own issue", async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    const body = options.body ? JSON.parse(options.body) : null;
    calls.push({ path, options, body });
    if (isGatePath(path)) return admitted();
    if (path === "/run") return Response.json({ status: "completed", events: [{ type: "item.completed", item: { type: "agent_message", text: 'Completed acceptance criteria\n<paperclip-result>{"status":"done"}</paperclip-result>' } }] });
    if (path === "/health") return Response.json({ status: "ok" });
    if (path.includes("/companies/")) return Response.json([assigned]);
    if (path.endsWith("/comments")) return Response.json(options.method === "POST" ? { id: "comment" } : []);
    return Response.json(assigned);
  };
  try {
    const result = await execute({ ...ctx, context: { issueId: "task" } });
    assert.equal(result.exitCode, 0);
    assert.equal(result.resultJson.issueIdentifier, "AIS-3");
    const checkout = calls.find((call) => call.path.endsWith("/checkout"));
    assert.equal(checkout.body.agentId, "pm");
    assert.equal(checkout.options.headers["x-paperclip-run-id"], "run");
    assert.equal(checkout.options.headers.authorization, "Bearer test-run-token");
    assert.ok(calls.findIndex((call) => isGatePath(call.path)) < calls.findIndex((call) => call.path.endsWith("/checkout")), "gate must run before checkout");
    assert.ok(calls.findIndex((call) => call.path === "/health") < calls.findIndex((call) => call.path.endsWith("/checkout")), "gateway health must pass before checkout");
    assert.equal(calls.filter((call) => call.path.endsWith("/comments") && call.options.method === "POST").length, 2);
    const update = calls.find((call) => call.options.method === "PATCH");
    assert.equal(update.path, "/api/issues/task");
    assert.equal(update.body.status, "done");
  } finally { globalThis.fetch = original; }
});

test("a workflow gate rejection prevents direct checkout and model execution", async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    calls.push({ path, options });
    if (isGatePath(path)) return Response.json({ allowed: false, code: "DEPENDENCY_NOT_MET", reason: "Architecture is not done" });
    return Response.json(assigned);
  };
  try {
    const result = await execute({ ...ctx, context: { issueId: "task" } });
    assert.equal(result.exitCode, 1);
    assert.match(result.summary, /DEPENDENCY_NOT_MET/);
    assert.ok(!calls.some((call) => call.path.endsWith("/checkout")));
    assert.ok(!calls.some((call) => call.path === "/run"));
  } finally { globalThis.fetch = original; }
});

test("a rejected task wake is never presented as successfully scheduled", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const path = new URL(url).pathname;
    if (isGatePath(path)) return admitted();
    if (path.endsWith("/heartbeat/invoke")) return Response.json({ status: "skipped" });
    return Response.json(path.includes("/companies/") ? [assigned] : assigned);
  };
  try {
    const result = await execute(ctx);
    assert.equal(result.exitCode, 1);
    assert.match(result.summary, /did not admit/);
  } finally { globalThis.fetch = original; }
});

test("gateway failure is reported without marking a task done", async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    calls.push({ path, options });
    if (isGatePath(path)) return admitted();
    if (path === "/run") return Response.json({ status: "failed", summary: "Model unavailable" });
    if (path === "/health") return Response.json({ status: "ok" });
    if (path.includes("/companies/")) return Response.json([assigned]);
    if (path.endsWith("/comments")) return Response.json(options.method === "POST" ? { id: "comment" } : []);
    return Response.json(assigned);
  };
  try {
    const result = await execute({ ...ctx, context: { issueId: "task" } });
    assert.equal(result.exitCode, 1);
    assert.ok(!calls.some((call) => call.options.method === "PATCH"));
  } finally { globalThis.fetch = original; }
});

test("a model-reported blocker includes Paperclip's required unblock descriptor", async () => {
  const original = globalThis.fetch;
  let update;
  globalThis.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    if (isGatePath(path)) return admitted();
    if (options.method === "PATCH") update = JSON.parse(options.body);
    if (path === "/health") return Response.json({ status: "ok" });
    if (path === "/run") return Response.json({ status: "completed", events: [{ type: "item.completed", item: { type: "agent_message", text: 'Missing project codebase\n<paperclip-result>{"status":"blocked"}</paperclip-result>' } }] });
    if (path.endsWith("/comments")) return Response.json(options.method === "POST" ? { id: "comment" } : []);
    return Response.json(assigned);
  };
  try {
    const result = await execute({ ...ctx, context: { issueId: "task" } });
    assert.equal(result.exitCode, 0);
    assert.equal(result.resultJson.taskStatus, "blocked");
    assert.equal(update.status, "blocked");
    assert.deepEqual(update.unblockDescriptor.owner, { agentId: ctx.agent.id });
    assert.ok(update.unblockDescriptor.action.trim());
  } finally { globalThis.fetch = original; }
});

test("unreachable gateway fails before checkout, comments or a model request", async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    calls.push({ path, method: options.method });
    if (isGatePath(path)) return admitted();
    if (path === "/health") throw new TypeError("fetch failed", { cause: { code: "ECONNREFUSED" } });
    if (path.endsWith("/comments")) return Response.json([]);
    return Response.json(assigned);
  };
  try {
    const result = await execute({ ...ctx, context: { issueId: "task" } });
    assert.equal(result.exitCode, 1);
    assert.match(result.summary, /gateway .*unavailable before task execution.*ECONNREFUSED/);
    assert.equal(result.resultJson.failurePhase, "gateway_health");
    assert.equal(result.resultJson.gatewaySubmitted, false);
    assert.ok(!calls.some(call => call.path === "/run" || call.path.endsWith("/checkout") || call.method === "PATCH" || (call.path.endsWith("/comments") && call.method === "POST")));
  } finally { globalThis.fetch = original; }
});
