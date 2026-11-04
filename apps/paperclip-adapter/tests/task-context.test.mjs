import test from "node:test";
import assert from "node:assert/strict";
import { explicitTaskId, nativeTaskActions, resolveAssignedTask, taskPrompt, taskResult, waitingReason } from "../dist/task-context.js";
import { createServerAdapter, execute } from "../dist/index.js";

const ctx = { agent: { id: "pm", companyId: "company", name: "Test Agent", role: "pm" }, context: {}, runtime: {}, config: {}, runId: "run", authToken: "test-run-token" };
const assigned = { id: "task", identifier: "AIS-3", companyId: "company", assigneeAgentId: "pm", status: "backlog", title: "Analyze and plan", blockedBy: [] };

test("host injects a run-scoped agent credential for native task mutations", () => {
  assert.equal(createServerAdapter().supportsLocalAgentJwt, true);
});

test("manual Run resolves assigned native work", async () => {
  const result = await resolveAssignedTask(ctx, async (path) => path.includes("/companies/") ? [assigned] : assigned);
  assert.equal(result.issue.id, "task");
});

test("Paperclip dependency state controls task admission", () => {
  assert.equal(waitingReason({ ...assigned, blockedBy: [{ status: "done" }] }, ctx), null);
  assert.match(waitingReason({ ...assigned, blockedBy: [{ identifier: "AIS-4", status: "in_progress" }] }, ctx), /AIS-4/);
});

test("task id supports runtime and wake payload conventions", () => {
  assert.equal(explicitTaskId({ context: { paperclipWake: { issueId: "wake" } } }), "wake");
  assert.equal(explicitTaskId({ context: { taskId: "task" }, runtime: { taskKey: "runtime" } }), "task");
});

test("task prompts include completed native predecessors", async () => {
  const prompt = await taskPrompt({ ...assigned, blockedBy: [{ id: "parent", identifier: "AIS-4", title: "Architecture" }] }, async (path) =>
    path.includes("parent") ? [{ body: "Approved architecture handoff" }] : [],
  );
  assert.match(prompt, /Approved architecture handoff/);
});

test("native task actions accept only validated child-task requests", () => {
  const actions = nativeTaskActions('<paperclip-actions>{"actions":[{"type":"create_task","title":"Implement API","description":"Add one endpoint","assigneeAgentId":"backend","priority":"high"},{"type":"delete_everything"}]}</paperclip-actions>');
  assert.deepEqual(actions, [{ type: "create_task", title: "Implement API", description: "Add one endpoint", assigneeAgentId: "backend", priority: "high" }]);
  const fenced = nativeTaskActions('```json\n{"paperclip-actions":{"actions":[{"type":"create_task","title":"Implement API","description":"Add one endpoint","assigneeAgentId":"backend"}]}}\n```');
  assert.equal(fenced[0]?.assigneeAgentId, "backend");
});

test("a provider response needs a Paperclip result to complete a task", () => {
  assert.equal(taskResult("").status, "in_progress");
  assert.equal(taskResult("BACKEND_CHAIN_OK\nEvidence recorded").status, "done");
  assert.deepEqual(taskResult('Completed plan\n<paperclip-result>{"status":"done"}</paperclip-result>'), { status: "done", report: "Completed plan" });
  assert.deepEqual(taskResult('Completed plan\n```json\n{"status":"done"}\n```'), { status: "done", report: "Completed plan" });
  assert.equal(taskResult('```json\n{"paperclip-actions":{"actions":[{"type":"create_task","title":"Child","description":"Do it","assigneeAgentId":"agent"}]}}\n```').status, "done");
});

test("company run hands off through the native wakeup coordinator", async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    calls.push({ path, options });
    if (path.endsWith("/wakeup")) return Response.json({ id: "scoped-run", status: "queued" });
    return Response.json(path.includes("/companies/") ? [assigned] : assigned);
  };
  try {
    const result = await execute(ctx);
    assert.equal(result.exitCode, 0);
    assert.equal(result.resultJson.scopedRunId, "scoped-run");
    const wakeup = calls.find((call) => call.path === "/api/agents/pm/wakeup");
    assert.equal(JSON.parse(wakeup.options.body).payload.issueId, "task");
    assert.ok(!calls.some((call) => call.path.includes("plugins/") || call.path.endsWith("/checkout") || call.path === "/run"));
  } finally { globalThis.fetch = original; }
});

test("a real task delegates only through native issue APIs and records its result", async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    const body = options.body ? JSON.parse(options.body) : null;
    calls.push({ path, options, body });
    if (path === "/run") return Response.json({ status: "completed", events: [{ type: "item.completed", item: { type: "agent_message", text: 'Delegated backend work\n<paperclip-actions>{"actions":[{"type":"create_task","title":"Implement API","description":"Add one endpoint","assigneeAgentId":"backend","priority":"medium"}]}</paperclip-actions>\n<paperclip-result>{"status":"in_progress"}</paperclip-result>' } }] });
    if (path === "/health") return Response.json({ status: "ok" });
    if (path.includes("/companies/company/agents")) return Response.json([{ id: "pm", name: "Test Agent", role: "pm" }, { id: "backend", name: "Backend Engineer", reportsTo: "pm" }]);
    if (path.includes("/companies/company/issues") && options.method !== "POST") return Response.json([]);
    if (path.endsWith("/comments")) return Response.json(options.method === "POST" ? { id: "comment" } : []);
    if (path === "/api/companies/company/issues" && options.method === "POST") return Response.json({ id: "child", identifier: "AIS-4", title: body.title });
    return Response.json(assigned);
  };
  try {
    const result = await execute({ ...ctx, context: { issueId: "task" } });
    assert.equal(result.exitCode, 0);
    assert.ok(calls.some((call) => call.path.endsWith("/checkout")));
    const child = calls.find((call) => call.path === "/api/companies/company/issues" && call.options.method === "POST");
    assert.equal(child.body.parentId, "task");
    assert.equal(child.body.assigneeAgentId, "backend");
    assert.ok(!calls.some((call) => call.path.includes("plugins/")));
  } finally { globalThis.fetch = original; }
});
