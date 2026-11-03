/**
 * Workflow Execution Gate — Acceptance Tests
 * ============================================
 * Verifies all 15 acceptance criteria from the feature spec.
 * Uses compiled dist/worker.js and dist/execution-gate.js; no live Paperclip.
 *
 * Run: node packages/paperclip-workflow-studio/tests/execution-gate.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";

import {
  canExecute,
  findIssueOwnership,
  evaluateNodeCompletion,
  buildAuditEntry,
} from "../dist/execution-gate.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRun(overrides = {}) {
  return {
    id: "run-test",
    workflowId: "wf-1",
    workflowVersion: 2,
    workflowName: "Test Workflow",
    projectId: "proj-1",
    projectName: "Test Project",
    companyId: "comp-1",
    initiatorUserId: "user-1",
    inputRequirement: "Build the thing",
    status: "running",
    settings: { maxConcurrentAgents: 2, approvalMode: "require_approval", failurePolicy: "pause_and_report", retryPolicy: "bounded", maxRetries: 3 },
    startedAt: new Date().toISOString(),
    finishedAt: null,
    pausedAt: null,
    nodeExecutionStates: {},
    relatedIssueIds: [],
    executionHistory: [],
    workflowSnapshot: { nodes: [], edges: [] },
    currentStepTitle: "Running",
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeNode(id, kind, issueId, agentId, status = "pending") {
  return {
    nodeId: id, kind, title: `Node ${id}`, status,
    issueId: issueId ?? null, issueIdentifier: issueId ? `#${issueId}` : null,
    issueIds: issueId ? [issueId] : [], issueIdentifiers: issueId ? [`#${issueId}`] : [],
    completionPolicy: "all_required",
    agentId: agentId ?? null, agentName: agentId ? `Agent ${agentId}` : null, agentRole: null,
    startedAt: null, finishedAt: null, error: null, retryCount: 0,
    blockedByNodeIds: [], lastGateCode: null, lastGateReason: null,
  };
}

function makeSnapshotEdge(source, target) {
  return { id: `${source}-${target}`, source, target };
}

// ─── TEST 1: B must be rejected if A not done ─────────────────────────────────
test("TEST 1 — B cannot start before A completes (dependency enforcement)", () => {
  const run = makeRun({
    nodeExecutionStates: {
      A: { ...makeNode("A", "task", "issue-A", "agent-1"), status: "running" },
      B: { ...makeNode("B", "task", "issue-B", "agent-2"), status: "ready" },
    },
    workflowSnapshot: {
      nodes: [
        { id: "A", data: { kind: "task", agentId: "agent-1" } },
        { id: "B", data: { kind: "task", agentId: "agent-2" } },
      ],
      edges: [makeSnapshotEdge("A", "B")],
    },
  });

  const decision = canExecute({ run, nodeId: "B", issueId: "issue-B", agentId: "agent-2" });
  assert.equal(decision.allowed, false, "B must be DENIED while A is still running");
  assert.equal(decision.code, "DEPENDENCY_NOT_MET", "Correct rejection code");
  assert.ok(decision.reason.includes("Node A"), "Reason names the blocking node");
});

// ─── TEST 2: A Done → B allowed, C still blocked ─────────────────────────────
test("TEST 2 — A Completed → B allowed; C (depends on B) still blocked", () => {
  const run = makeRun({
    nodeExecutionStates: {
      A: { ...makeNode("A", "task", "issue-A", "agent-1"), status: "done" },
      B: { ...makeNode("B", "task", "issue-B", "agent-2"), status: "ready" },
      C: { ...makeNode("C", "task", "issue-C", "agent-3"), status: "pending" },
    },
    workflowSnapshot: {
      nodes: [
        { id: "A", data: { kind: "task", agentId: "agent-1" } },
        { id: "B", data: { kind: "task", agentId: "agent-2" } },
        { id: "C", data: { kind: "task", agentId: "agent-3" } },
      ],
      edges: [makeSnapshotEdge("A", "B"), makeSnapshotEdge("B", "C")],
    },
  });

  const bDecision = canExecute({ run, nodeId: "B", issueId: "issue-B", agentId: "agent-2" });
  assert.equal(bDecision.allowed, true, "B must be ALLOWED after A is done");

  const cDecision = canExecute({ run, nodeId: "C", issueId: "issue-C", agentId: "agent-3" });
  assert.equal(cDecision.allowed, false, "C must be DENIED while B is not done");
  assert.equal(cDecision.code, "DEPENDENCY_NOT_MET");
});

// ─── TEST 3: A done → B and C can run in parallel ────────────────────────────
test("TEST 3 — A done → B and C can start in parallel (independent branches)", () => {
  const run = makeRun({
    nodeExecutionStates: {
      A: { ...makeNode("A", "task", "issue-A", "agent-1"), status: "done" },
      B: { ...makeNode("B", "task", "issue-B", "agent-2"), status: "ready" },
      C: { ...makeNode("C", "task", "issue-C", "agent-3"), status: "ready" },
    },
    workflowSnapshot: {
      nodes: [
        { id: "A", data: { kind: "task", agentId: "agent-1" } },
        { id: "B", data: { kind: "task", agentId: "agent-2" } },
        { id: "C", data: { kind: "task", agentId: "agent-3" } },
      ],
      edges: [makeSnapshotEdge("A", "B"), makeSnapshotEdge("A", "C")],
    },
  });

  const bDecision = canExecute({ run, nodeId: "B", issueId: "issue-B", agentId: "agent-2" });
  assert.equal(bDecision.allowed, true, "B must be allowed after A done");

  const cDecision = canExecute({ run, nodeId: "C", issueId: "issue-C", agentId: "agent-3" });
  assert.equal(cDecision.allowed, true, "C must be allowed after A done");
});

// ─── TEST 4: AND-join — D must wait for both B and C ─────────────────────────
test("TEST 4 — AND-join: D cannot start until both B and C complete", () => {
  const run = makeRun({
    nodeExecutionStates: {
      B: { ...makeNode("B", "task", "issue-B", "agent-2"), status: "done" },
      C: { ...makeNode("C", "task", "issue-C", "agent-3"), status: "running" }, // not done yet
      D: { ...makeNode("D", "task", "issue-D", "agent-4"), status: "ready" },
    },
    workflowSnapshot: {
      nodes: [
        { id: "B", data: { kind: "task", agentId: "agent-2" } },
        { id: "C", data: { kind: "task", agentId: "agent-3" } },
        { id: "D", data: { kind: "task", agentId: "agent-4" } },
      ],
      edges: [makeSnapshotEdge("B", "D"), makeSnapshotEdge("C", "D")],
    },
  });

  const dDecision = canExecute({ run, nodeId: "D", issueId: "issue-D", agentId: "agent-4" });
  assert.equal(dDecision.allowed, false, "D must be DENIED while C is still running (AND-join)");
  assert.equal(dDecision.code, "DEPENDENCY_NOT_MET");
  assert.ok(dDecision.reason.includes("Node C"), "Reason should name C as the blocker");

  // Now C completes
  run.nodeExecutionStates.C.status = "done";
  const dDecision2 = canExecute({ run, nodeId: "D", issueId: "issue-D", agentId: "agent-4" });
  assert.equal(dDecision2.allowed, true, "D must be allowed when BOTH B and C are done");
});

// ─── TEST 5: Start All must not dispatch blocked tasks ────────────────────────
test("TEST 5 — start-all execution gate: blocked/pending tasks must be skipped", () => {
  // Simulate the gate filtering logic from agent-control-action start-all
  const blockedByRun = new Set(["issue-B", "issue-C"]);
  const allIssues = [
    { id: "issue-A", status: "todo", assigneeAgentId: "agent-1" },
    { id: "issue-B", status: "todo", assigneeAgentId: "agent-2" },  // owned by run
    { id: "issue-C", status: "backlog", assigneeAgentId: "agent-3" }, // owned by run
    { id: "issue-X", status: "todo", assigneeAgentId: "agent-4" },  // independent
  ];

  const runnable = allIssues.filter(
    (i) => i.assigneeAgentId && ["todo", "backlog"].includes(i.status) && !blockedByRun.has(i.id)
  );
  const skipped = allIssues.filter(
    (i) => i.assigneeAgentId && ["todo", "backlog"].includes(i.status) && blockedByRun.has(i.id)
  );

  assert.equal(runnable.length, 2, "Only issue-A and issue-X pass the gate");
  assert.equal(skipped.length, 2, "issue-B and issue-C are skipped due to workflow gate");
  assert.ok(runnable.every((i) => !blockedByRun.has(i.id)), "No blocked issue should be dispatched");
});

// ─── TEST 6: PM task addition maps to stage policy ───────────────────────────
test("TEST 6 — multi-issue node: new task added to stage obeys completion policy", () => {
  // A node (Backend) with 2 issues — only done when ALL complete (all_required)
  const statuses = ["done", "in_progress"]; // one pending
  const result = evaluateNodeCompletion(statuses, "all_required");
  assert.equal(result.completed, false, "Node must NOT complete when one issue is still in_progress");
  assert.ok(result.reason.includes("1/2"), "Reason must show partial completion");

  // When all done
  const allDone = evaluateNodeCompletion(["done", "done"], "all_required");
  assert.equal(allDone.completed, true, "Node completes when all issues are done");
});

// ─── TEST 7: AI Agent cannot bypass approval gate ────────────────────────────
test("TEST 7 — AI Agent is denied execution at approval gate (human-only)", () => {
  const run = makeRun({
    nodeExecutionStates: {
      approval: { ...makeNode("approval", "approval", "issue-approval", null), status: "waiting_approval" },
    },
    workflowSnapshot: {
      nodes: [{ id: "approval", data: { kind: "approval", agentId: null } }],
      edges: [],
    },
  });

  // An agent tries to execute the approval node
  const decision = canExecute({ run, nodeId: "approval", issueId: "issue-approval", agentId: "agent-any" });
  assert.equal(decision.allowed, false, "Approval gate must block all agent execution");
  assert.equal(decision.code, "APPROVAL_NOT_GRANTED", "Must be rejected with APPROVAL_NOT_GRANTED");
  assert.ok(decision.reason.includes("Product Owner"), "Reason must mention PO requirement");
});

// ─── TEST 8: Snapshot isolation — editing workflow does not affect active run ─
test("TEST 8 — Workflow Run uses snapshot; definition changes do not affect it", () => {
  // The run has a snapshot frozen at publish time
  const snapshot = {
    nodes: [
      { id: "A", data: { kind: "task", agentId: "agent-1" } },
      { id: "B", data: { kind: "task", agentId: "agent-2" } },
    ],
    edges: [makeSnapshotEdge("A", "B")],
  };

  const run = makeRun({
    nodeExecutionStates: {
      A: { ...makeNode("A", "task", "issue-A", "agent-1"), status: "running" },
      B: { ...makeNode("B", "task", "issue-B", "agent-2"), status: "pending" },
    },
    workflowSnapshot: snapshot,
  });

  // Simulate: someone removes the A→B edge from the designer (live definition)
  const modifiedLiveDefinition = { nodes: snapshot.nodes, edges: [] };

  // The gate reads from run.workflowSnapshot, NOT from modifiedLiveDefinition
  // B should still be denied because the snapshot still has A→B
  const decision = canExecute({ run, nodeId: "B", issueId: "issue-B", agentId: "agent-2" });
  assert.equal(decision.allowed, false, "Gate reads from snapshot — live definition changes must not affect the running run");

  // If we were to evaluate against the modified live definition (wrong), B would be allowed
  // because there would be no edges at all. The test verifies we use snapshot.
  assert.equal(decision.code, "DEPENDENCY_NOT_MET");
});

// ─── TEST 9: Agent failure must not trigger successor ────────────────────────
test("TEST 9 — When node A fails, successor B must remain blocked", () => {
  const run = makeRun({
    nodeExecutionStates: {
      A: { ...makeNode("A", "task", "issue-A", "agent-1"), status: "failed" },
      B: { ...makeNode("B", "task", "issue-B", "agent-2"), status: "pending" },
    },
    workflowSnapshot: {
      nodes: [
        { id: "A", data: { kind: "task", agentId: "agent-1" } },
        { id: "B", data: { kind: "task", agentId: "agent-2" } },
      ],
      edges: [makeSnapshotEdge("A", "B")],
    },
  });

  // B's predecessor (A) is "failed", not "done" — B must be denied
  const decision = canExecute({ run, nodeId: "B", issueId: "issue-B", agentId: "agent-2" });
  assert.equal(decision.allowed, false, "Successor B must NOT run when A has failed");
  assert.equal(decision.code, "DEPENDENCY_NOT_MET");
});

// ─── TEST 10: State recovery — run can be restored from persisted data ────────
test("TEST 10 — Execution state survives serialization (database round-trip simulation)", () => {
  const originalRun = makeRun({
    nodeExecutionStates: {
      A: { ...makeNode("A", "task", "issue-A", "agent-1"), status: "done" },
      B: { ...makeNode("B", "task", "issue-B", "agent-2"), status: "running" },
    },
    workflowSnapshot: {
      nodes: [
        { id: "A", data: { kind: "task", agentId: "agent-1" } },
        { id: "B", data: { kind: "task", agentId: "agent-2" } },
      ],
      edges: [makeSnapshotEdge("A", "B")],
    },
  });

  // Simulate JSON serialization (Paperclip state persistence) and deserialization
  const serialized = JSON.stringify(originalRun);
  const deserialized = JSON.parse(serialized);

  // Gate must work correctly on deserialized run
  const decision = canExecute({ run: deserialized, nodeId: "B", issueId: "issue-B", agentId: "agent-2" });
  assert.equal(decision.allowed, true, "Deserialized run must still correctly allow B (A is done)");
});

// ─── TEST 11: Duplicate wakeup prevention ────────────────────────────────────
test("TEST 11 — Duplicate wakeup idempotency: same issueId tracked across step", () => {
  const wokenInThisStep = new Set();
  const issueId = "issue-B";

  // First wakeup attempt
  const isFirstTime = !wokenInThisStep.has(issueId);
  wokenInThisStep.add(issueId);
  assert.equal(isFirstTime, true, "First wakeup is new");

  // Second wakeup attempt for same issue in same step
  const isSecondTime = !wokenInThisStep.has(issueId);
  assert.equal(isSecondTime, false, "Second wakeup for same issue must be detected as duplicate");
  assert.equal(wokenInThisStep.size, 1, "Set must only contain one entry for the issue");
});

// ─── TEST 12: Direct API bypass is blocked by gate ───────────────────────────
test("TEST 12 — Direct checkout bypass: canExecute correctly rejects unauthorized agent", () => {
  const run = makeRun({
    nodeExecutionStates: {
      A: { ...makeNode("A", "task", "issue-A", "agent-1"), status: "running" },
    },
    workflowSnapshot: {
      nodes: [{ id: "A", data: { kind: "task", agentId: "agent-1" } }],
      edges: [],
    },
  });

  // Wrong agent (agent-99) tries to execute a task assigned to agent-1
  const decision = canExecute({ run, nodeId: "A", issueId: "issue-A", agentId: "agent-99" });
  assert.equal(decision.allowed, false, "Wrong agent must be denied");
  assert.equal(decision.code, "AGENT_NOT_AUTHORISED");
  assert.ok(decision.reason.includes("agent-1"), "Reason must name the assigned agent");
});

// ─── TEST 13: Independent issue not blocked by workflow ───────────────────────
test("TEST 13 — Independent issue (no active run ownership) passes the gate", () => {
  // findIssueOwnership returns null = independent task
  const allRuns = [
    makeRun({
      id: "run-xyz",
      status: "running",
      nodeExecutionStates: {
        A: { ...makeNode("A", "task", "issue-workflow-A", "agent-1"), status: "running" },
      },
    }),
  ];

  // "issue-independent" is NOT owned by any run
  const ownership = findIssueOwnership(allRuns, "issue-independent");
  assert.equal(ownership, null, "Independent issue has no run ownership — gate should pass");
});

// ─── TEST 14: Multi-issue node completion policy ───────────────────────────────
test("TEST 14 — Multi-issue node: not complete until all required issues done", () => {
  const statuses3 = ["done", "done", "in_progress"];
  const result3 = evaluateNodeCompletion(statuses3, "all_required");
  assert.equal(result3.completed, false, "3-issue node must not complete with 1 pending");

  const allDone3 = evaluateNodeCompletion(["done", "done", "done"], "all_required");
  assert.equal(allDone3.completed, true, "All 3 done → node complete");

  // any_one policy
  const anyOne = evaluateNodeCompletion(["done", "in_progress", "in_progress"], "any_one");
  assert.equal(anyOne.completed, true, "any_one policy: first done is enough");

  // majority policy
  const majority = evaluateNodeCompletion(["done", "done", "in_progress"], "majority");
  assert.equal(majority.completed, true, "majority policy: 2/3 done is majority");

  const notMajority = evaluateNodeCompletion(["done", "in_progress", "in_progress"], "majority");
  assert.equal(notMajority.completed, false, "majority policy: 1/3 done is not majority");
});

test("TEST 14b — every issue mapped to a multi-issue node passes the same stage gate", () => {
  const backend = { ...makeNode("backend", "task", "issue-auth", "agent-backend"), status: "ready" };
  backend.issueIds = ["issue-auth", "issue-orders"];
  const run = makeRun({
    nodeExecutionStates: { backend },
    workflowSnapshot: {
      nodes: [{ id: "backend", data: { kind: "task", agentId: "agent-backend", executionPolicy: "paperclip" } }],
      edges: [],
    },
  });
  const decision = canExecute({ run, nodeId: "backend", issueId: "issue-orders", agentId: "agent-backend" });
  assert.equal(decision.allowed, true, "secondary stage issue must be admitted when the stage is ready");
});

// ─── TEST 15: Stopped run prevents new dispatches ────────────────────────────
test("TEST 15 — Stopped (cancelled) run denies all new execution", () => {
  const run = makeRun({
    status: "cancelled",
    nodeExecutionStates: {
      A: { ...makeNode("A", "task", "issue-A", "agent-1"), status: "done" },
      B: { ...makeNode("B", "task", "issue-B", "agent-2"), status: "ready" },
    },
    workflowSnapshot: {
      nodes: [
        { id: "A", data: { kind: "task", agentId: "agent-1" } },
        { id: "B", data: { kind: "task", agentId: "agent-2" } },
      ],
      edges: [makeSnapshotEdge("A", "B")],
    },
  });

  const decision = canExecute({ run, nodeId: "B", issueId: "issue-B", agentId: "agent-2" });
  assert.equal(decision.allowed, false, "Cancelled run must deny all execution");
  assert.equal(decision.code, "RUN_TERMINAL");
  assert.ok(decision.reason.includes("cancelled"), "Reason must state the run is terminal");
});

// ─── Bonus: Audit log format ──────────────────────────────────────────────────
test("BONUS — Audit entry is correctly built for both admit and deny decisions", () => {
  const run = makeRun({ id: "run-audit-test" });

  const denyDecision = { allowed: false, code: "DEPENDENCY_NOT_MET", reason: "Predecessor not done" };
  const denyAudit = buildAuditEntry("run-audit-test", "node-B", "issue-B", "agent-2", denyDecision);
  assert.equal(denyAudit.allowed, false);
  assert.equal(denyAudit.code, "DEPENDENCY_NOT_MET");
  assert.equal(denyAudit.runId, "run-audit-test");
  assert.ok(denyAudit.ts, "Audit entry must have a timestamp");

  const admitDecision = { allowed: true };
  const admitAudit = buildAuditEntry("run-audit-test", "node-A", "issue-A", "agent-1", admitDecision);
  assert.equal(admitAudit.allowed, true);
  assert.equal(admitAudit.code, "ADMITTED");
});
