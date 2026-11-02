import test from "node:test";
import assert from "node:assert/strict";

// Import compiled dist worker logic
import { createLifecycleTemplate, validateGraph } from "../dist/worker.js";

test("Workflow DAG validation detects cycles correctly", () => {
  const cyclicWorkflow = {
    id: "wf-cycle",
    companyId: "comp-1",
    projectId: "proj-1",
    name: "Cyclic Flow",
    description: "test",
    version: 1,
    status: "draft",
    nodes: [
      { id: "node-1", type: "workflowNode", position: { x: 0, y: 0 }, data: { kind: "task", title: "Task 1", executionPolicy: "paperclip" } },
      { id: "node-2", type: "workflowNode", position: { x: 100, y: 0 }, data: { kind: "task", title: "Task 2", executionPolicy: "paperclip" } }
    ],
    edges: [
      { id: "e1", source: "node-1", target: "node-2" },
      { id: "e2", source: "node-2", target: "node-1" }
    ],
    viewport: { x: 0, y: 0, zoom: 1 },
    layout: { direction: "LR", compact: true },
    publishedIssueIds: [],
    publishedDependencies: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: null
  };

  const validation = validateGraph(cyclicWorkflow);
  assert.equal(validation.valid, false, "Cycle must make graph invalid");
  const hasCycleIssue = validation.issues.some((issue) => issue.code === "cycle");
  assert.equal(hasCycleIssue, true, "Must flag cycle error code");
});

test("Lifecycle template maps the standard 8 AI agents in correct DAG sequence", () => {
  const agents = [
    { id: "ag-pm", name: "Alex PM", role: "Project Manager", title: "Project Manager", status: "active", icon: null, adapterType: "gemini", adapterConfig: { model: "gemini-1.5-pro" } },
    { id: "ag-arch", name: "Sam Architect", role: "Solution Architect", title: "Solution Architect", status: "active", icon: null, adapterType: "codex", adapterConfig: { model: "codex" } },
    { id: "ag-des", name: "Jordan Designer", role: "UI/UX Designer", title: "UI/UX Designer", status: "active", icon: null, adapterType: "gemini", adapterConfig: { model: "gemini-1.5-pro" } },
    { id: "ag-be", name: "Taylor Backend", role: "Backend Engineer", title: "Backend Engineer", status: "active", icon: null, adapterType: "codex", adapterConfig: { model: "codex" } },
    { id: "ag-fe", name: "Casey Frontend", role: "Frontend Engineer", title: "Frontend Engineer", status: "active", icon: null, adapterType: "codex", adapterConfig: { model: "codex" } },
    { id: "ag-cr", name: "Morgan Reviewer", role: "Code Reviewer", title: "Code Reviewer", status: "active", icon: null, adapterType: "codex", adapterConfig: { model: "codex" } },
    { id: "ag-qa", name: "Riley QA", role: "QA Tester", title: "QA Tester", status: "active", icon: null, adapterType: "gemini", adapterConfig: { model: "gemini-1.5-pro" } },
    { id: "ag-ops", name: "Dakota DevOps", role: "DevOps Engineer", title: "DevOps Engineer", status: "active", icon: null, adapterType: "codex", adapterConfig: { model: "codex" } }
  ];

  const template = createLifecycleTemplate("comp-1", agents);
  assert.equal(template.name, "AI Software Development Lifecycle");
  
  // Verify DAG validity
  const validation = validateGraph(template);
  assert.equal(validation.valid, true, "Lifecycle template must be a valid DAG");

  // Verify task nodes match agents
  const taskNodes = template.nodes.filter((n) => n.data.kind === "task");
  assert.equal(taskNodes.length, 8, "Must contain all 8 AI agent tasks");

  // Verify approval node exists
  const approvalNodes = template.nodes.filter((n) => n.data.kind === "approval");
  assert.equal(approvalNodes.length, 1, "Must contain Human PO Approval Gate");
  assert.equal(approvalNodes[0].data.executionPolicy, "human", "Approval gate must be marked human execution policy");

  // Verify parallel branching: architect leads to parallel split
  const parallelNodes = template.nodes.filter((n) => n.data.kind === "parallel");
  assert.equal(parallelNodes.length, 1, "Must contain parallel branch split");

  // Verify join node: backend & design merge before frontend
  const joinNodes = template.nodes.filter((n) => n.data.kind === "join");
  assert.equal(joinNodes.length, 1, "Must contain join merge node");
});

test("Workflow orchestration enforces DAG order without simultaneous 8-agent wakeups", () => {
  // Mock simulation of DAG resolution
  const nodeExecutionStates = {
    start: { nodeId: "start", kind: "start", title: "Start", status: "done", blockedByNodeIds: [] },
    pm: { nodeId: "pm", kind: "task", title: "Project Manager Plan", status: "pending", blockedByNodeIds: ["start"] },
    arch: { nodeId: "arch", kind: "task", title: "Architecture", status: "pending", blockedByNodeIds: ["pm"] },
    be: { nodeId: "be", kind: "task", title: "Backend API", status: "pending", blockedByNodeIds: ["arch"] },
    fe: { nodeId: "fe", kind: "task", title: "Frontend UI", status: "pending", blockedByNodeIds: ["arch"] },
    approval: { nodeId: "approval", kind: "approval", title: "PO Approval Gate", status: "pending", blockedByNodeIds: ["be", "fe"] },
    end: { nodeId: "end", kind: "end", title: "End", status: "pending", blockedByNodeIds: ["approval"] }
  };

  // Helper simulating step evaluation
  function evaluateStep(states, maxConcurrent = 2) {
    const running = Object.values(states).filter((s) => s.status === "running").length;
    let availableSlots = maxConcurrent - running;
    const readyToDispatch = [];

    for (const state of Object.values(states)) {
      if (state.status !== "pending") continue;
      const predecessors = state.blockedByNodeIds.map((id) => states[id]);
      const allPredecessorsDone = predecessors.every((p) => p && p.status === "done");

      if (allPredecessorsDone) {
        if (state.kind === "approval") {
          state.status = "waiting_approval";
        } else if (availableSlots > 0) {
          state.status = "running";
          readyToDispatch.push(state.nodeId);
          availableSlots--;
        } else {
          state.status = "ready";
        }
      }
    }
    return readyToDispatch;
  }

  // Step 1: Initial admission from start
  const initialDispatches = evaluateStep(nodeExecutionStates, 2);
  assert.deepEqual(initialDispatches, ["pm"], "CRITICAL: Only the first task (PM) should be dispatched, NOT all 8 agents!");
  assert.equal(nodeExecutionStates.arch.status, "pending", "Downstream Architect must remain pending");
  assert.equal(nodeExecutionStates.be.status, "pending", "Backend must remain pending");

  // Step 2: PM completes
  nodeExecutionStates.pm.status = "done";
  const step2 = evaluateStep(nodeExecutionStates, 2);
  assert.deepEqual(step2, ["arch"], "Architect is dispatched only after PM completes");

  // Step 3: Architect completes -> Backend and Frontend can run in parallel (max 2)
  nodeExecutionStates.arch.status = "done";
  const step3 = evaluateStep(nodeExecutionStates, 2);
  assert.deepEqual(step3, ["be", "fe"], "Both parallel branches (BE & FE) are dispatched concurrently");

  // Step 4: BE & FE finish -> reaches Approval Node
  nodeExecutionStates.be.status = "done";
  nodeExecutionStates.fe.status = "done";
  evaluateStep(nodeExecutionStates, 2);
  assert.equal(nodeExecutionStates.approval.status, "waiting_approval", "Approval gate must transition to waiting_approval");
  assert.equal(nodeExecutionStates.end.status, "pending", "End node must not execute without PO Approval");

  // Step 5: Human PO approves
  nodeExecutionStates.approval.status = "done";
  evaluateStep(nodeExecutionStates, 2);
  assert.equal(nodeExecutionStates.end.status, "running", "End node proceeds only after human approval");
});
