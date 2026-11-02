import test from "node:test";
import assert from "node:assert/strict";
import { explicitTaskId, resolveAssignedTask, taskPrompt, taskResult, waitingReason } from "../dist/task-context.js";
import { createServerAdapter, execute } from "../dist/index.js";

const ctx = { agent: { id: "pm", companyId: "company", name: "Test Agent" }, context: {}, runtime: {}, config: {}, runId: "run", authToken: "test-run-token" };
const assigned = { id: "task", identifier: "AIS-3", companyId: "company", assigneeAgentId: "pm", status: "backlog", title: "Analyze and plan", blockedBy: [] };

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

test("project brief and completed predecessor handoff reach the model", async () => {
  const prompt = await taskPrompt({ ...assigned, projectId: "project", project: { name: "English learning" }, blockedBy: [{ id: "parent", identifier: "AIS-4", title: "Architecture" }] }, async (path) => {
    if (path.includes("/companies/")) return [{ id: "brief", identifier: "AIS-2", title: "MVP", description: "Beginner, Intermediate, Advanced", assigneeAgentId: null }];
    if (path.includes("parent")) return [{ body: "Approved architecture handoff" }];
    return [];
  });
  assert.match(prompt, /AIS-2/);
  assert.match(prompt, /Beginner, Intermediate, Advanced/);
  assert.match(prompt, /Approved architecture handoff/);
});

test("provider success alone does not mark the task done", () => {
  assert.equal(taskResult("I will start tomorrow").status, "in_progress");
  assert.equal(taskResult('Missing requirements\n<paperclip-result>{"status":"blocked"}</paperclip-result>').status, "blocked");
  assert.equal(taskResult('<paperclip-result>{"status":"done"}</paperclip-result>').status, "in_progress");
  assert.deepEqual(taskResult('Completed plan\n<paperclip-result>{"status":"done"}</paperclip-result>'), { status: "done", report: "Completed plan" });
  assert.equal(taskResult('<paperclip-result>{invalid}</paperclip-result>').status, "in_progress");
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
    if (path.endsWith("/heartbeat/invoke")) return Response.json({ id: "scoped-run", status: "queued" });
    return Response.json(path.includes("/companies/") ? [assigned] : assigned);
  };
  try {
    const result = await execute(ctx);
    assert.equal(result.exitCode, 0);
    assert.equal(result.resultJson.scopedRunId, "scoped-run");
    const mutation = calls.filter((call) => call.options.method === "POST");
    assert.equal(mutation.length, 1);
    assert.equal(mutation[0].path, "/api/agents/pm/heartbeat/invoke");
    assert.equal(JSON.parse(mutation[0].options.body).payload.issueId, "task");
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
    if (path === "/run") return Response.json({ status: "completed", events: [{ type: "item.completed", item: { type: "agent_message", text: 'Completed acceptance criteria\n<paperclip-result>{"status":"done"}</paperclip-result>' } }] });
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
    assert.equal(calls.filter((call) => call.path.endsWith("/comments") && call.options.method === "POST").length, 2);
    const update = calls.find((call) => call.options.method === "PATCH");
    assert.equal(update.path, "/api/issues/task");
    assert.equal(update.body.status, "done");
  } finally { globalThis.fetch = original; }
});

test("a rejected task wake is never presented as successfully scheduled", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const path = new URL(url).pathname;
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
    if (path === "/run") return Response.json({ status: "failed", summary: "Model unavailable" });
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
    if (options.method === "PATCH") update = JSON.parse(options.body);
    if (path === "/run") return Response.json({ status: "completed", events: [{ type: "item.completed", item: { type: "agent_message", text: 'Missing project codebase\n<paperclip-result>{"status":"blocked"}</paperclip-result>' } }] });
    if (path.endsWith("/comments")) return Response.json(options.method === "POST" ? { id: "comment" } : []);
    return Response.json(assigned);
  };
  try {
    const result = await execute({ ...ctx, context: { issueId: "task" } });
    assert.equal(result.exitCode, 0);
    assert.equal(result.resultJson.taskStatus, "blocked");
    assert.equal(update.status, "blocked");
    assert.equal(update.unblockDescriptor.owner, "board");
    assert.ok(update.unblockDescriptor.action.trim());
  } finally { globalThis.fetch = original; }
});
