import test from "node:test";
import assert from "node:assert/strict";
import { createTestHarness } from "@paperclipai/plugin-sdk/testing";
import plugin from "../dist/worker.js";
import manifest from "../dist/manifest.js";

const companyId = "company-gate-test";
const stateKey = (key) => ({ scopeKind: "company", scopeId: companyId, namespace: "workflow-studio", stateKey: key });

function node(nodeId, issueId, agentId, status, blockedByNodeIds = []) {
  return {
    nodeId,
    kind: "task",
    title: nodeId,
    status,
    issueId,
    issueIdentifier: issueId,
    issueIds: issueId ? [issueId] : [],
    issueIdentifiers: issueId ? [issueId] : [],
    completionPolicy: "all_required",
    agentId,
    agentName: agentId,
    agentRole: "test",
    startedAt: null,
    finishedAt: null,
    error: null,
    retryCount: 0,
    blockedByNodeIds,
  };
}

function run(id, issuePrefix) {
  const now = new Date().toISOString();
  return {
    id,
    workflowId: `workflow-${id}`,
    workflowVersion: 3,
    workflowName: id,
    projectId: "project",
    projectName: "Project",
    companyId,
    initiatorUserId: "po",
    inputRequirement: "test",
    status: "running",
    settings: { maxConcurrentAgents: 2, approvalMode: "require_approval", failurePolicy: "pause_and_report", retryPolicy: "bounded", maxRetries: 2 },
    startedAt: now,
    finishedAt: null,
    pausedAt: null,
    nodeExecutionStates: {
      A: node("A", `${issuePrefix}-A`, "agent-a", "running"),
      B: node("B", `${issuePrefix}-B`, "agent-b", "pending", ["A"]),
    },
    relatedIssueIds: [`${issuePrefix}-A`, `${issuePrefix}-B`],
    executionHistory: [],
    workflowSnapshot: {
      id: `workflow-${id}`,
      companyId,
      projectId: "project",
      name: id,
      description: "",
      version: 3,
      status: "published",
      nodes: [
        { id: "A", type: "workflowNode", position: { x: 0, y: 0 }, data: { kind: "task", title: "A", agentId: "agent-a", executionPolicy: "paperclip" } },
        { id: "B", type: "workflowNode", position: { x: 1, y: 0 }, data: { kind: "task", title: "B", agentId: "agent-b", executionPolicy: "paperclip" } },
      ],
      edges: [{ id: "A-B", source: "A", target: "B" }],
      viewport: { x: 0, y: 0, zoom: 1 },
      layout: { direction: "LR", compact: false },
      publishedIssueIds: [`${issuePrefix}-A`, `${issuePrefix}-B`],
      publishedDependencies: { [`${issuePrefix}-B`]: [`${issuePrefix}-A`] },
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    },
    currentStepTitle: "A",
    updatedAt: now,
  };
}

test("plugin can-execute resolves the issue owner, not the first unrelated active run", async () => {
  const harness = createTestHarness({ manifest });
  await plugin.definition.setup(harness.ctx);
  const unrelated = run("run-unrelated", "other");
  const owner = run("run-owner", "owned");
  await harness.ctx.state.set(stateKey("workflow-runs-index"), [
    { id: unrelated.id, status: unrelated.status },
    { id: owner.id, status: owner.status },
  ]);
  await harness.ctx.state.set(stateKey(`workflow-run:${unrelated.id}`), unrelated);
  await harness.ctx.state.set(stateKey(`workflow-run:${owner.id}`), owner);

  const decision = await harness.performAction(
    "can-execute",
    { issueId: "owned-B", agentId: "agent-b" },
    { companyId }
  );
  assert.equal(decision.allowed, false);
  assert.equal(decision.code, "DEPENDENCY_NOT_MET");
  assert.equal(decision.runId, "run-owner");

  const persistedOwner = harness.getState(stateKey("workflow-run:run-owner"));
  assert.ok(persistedOwner.executionHistory.some((entry) => entry.message.includes("GATE REJECTION")));
  const audit = harness.getState(stateKey("workflow-gate-audit"));
  assert.equal(audit.at(-1).issueId, "owned-B");
});

test("plugin can-execute leaves independent issues outside workflow enforcement", async () => {
  const harness = createTestHarness({ manifest });
  await plugin.definition.setup(harness.ctx);
  const decision = await harness.performAction(
    "can-execute",
    { issueId: "independent", agentId: "agent-free" },
    { companyId }
  );
  assert.equal(decision.allowed, true);
  assert.equal(decision.code, "NO_ACTIVE_RUN");
});
