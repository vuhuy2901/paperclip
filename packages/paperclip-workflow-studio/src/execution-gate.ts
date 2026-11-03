/**
 * Workflow Execution Gate
 * ========================
 * Server-side enforcement layer. Every path that could start work on a
 * Workflow-Run-owned issue MUST call canExecute() before proceeding.
 *
 * This module is intentionally kept free of I/O side-effects so it can
 * be imported by both the worker and test suites without mocking ctx.
 */

import type {
  NodeExecutionState,
  NodeExecutionStatus,
  WorkflowRunRecord,
  WorkflowRunStatus,
} from "./types.js";

// ─── Result types ─────────────────────────────────────────────────────────────

export type GateDecision =
  | { allowed: true }
  | { allowed: false; code: GateRejectionCode; reason: string };

export type GateRejectionCode =
  | "RUN_NOT_FOUND"
  | "RUN_TERMINAL"
  | "RUN_PAUSED"
  | "RUN_STOPPED"
  | "NODE_NOT_IN_SNAPSHOT"
  | "ISSUE_NOT_MAPPED_TO_NODE"
  | "AGENT_NOT_AUTHORISED"
  | "DEPENDENCY_NOT_MET"
  | "APPROVAL_NOT_GRANTED"
  | "NODE_ALREADY_TERMINAL"
  | "NODE_RUNNING_BY_ANOTHER"
  | "CONCURRENCY_LIMIT"
  | "DUPLICATE_WAKEUP";

/** Structured audit record written on every rejection (and key admissions). */
export type GateAuditEntry = {
  ts: string;
  runId: string;
  nodeId: string | null;
  issueId: string | null;
  agentId: string | null;
  allowed: boolean;
  code: GateRejectionCode | "ADMITTED";
  reason: string;
};

// ─── Core canExecute ──────────────────────────────────────────────────────────

export interface CanExecuteParams {
  run: WorkflowRunRecord | null;
  nodeId: string;
  /** The Paperclip issue the agent is about to checkout / wakeup. */
  issueId: string;
  agentId: string;
}

/**
 * Pure, synchronous gate check.
 * All reads have already been done by the caller; this function only evaluates
 * the state it is given and returns a decision with a machine-readable code.
 */
export function canExecute(params: CanExecuteParams): GateDecision {
  const { run, nodeId, issueId, agentId } = params;

  // 1. Run must exist
  if (!run) {
    return denied("RUN_NOT_FOUND", `No active Workflow Run found that owns issue ${issueId}.`);
  }

  // 2. Run status guard
  if (run.status === "completed" || run.status === "failed" || run.status === "cancelled") {
    return denied("RUN_TERMINAL", `Workflow Run ${run.id} is in terminal state "${run.status}". No new work may start.`);
  }
  if (run.status === "paused") {
    return denied("RUN_PAUSED", `Workflow Run ${run.id} is paused. No new tasks may be dispatched until the run is resumed.`);
  }

  // 3. Node must exist in the snapshot
  const snapshotNode = run.workflowSnapshot.nodes.find((n) => n.id === nodeId);
  if (!snapshotNode) {
    return denied("NODE_NOT_IN_SNAPSHOT", `Node "${nodeId}" does not exist in the Workflow Run snapshot (Run ${run.id}). Execution refused.`);
  }

  // 4. Issue must be mapped to this node
  const nodeState = run.nodeExecutionStates[nodeId];
  if (!nodeState) {
    return denied("NODE_NOT_IN_SNAPSHOT", `Node "${nodeId}" has no execution state in Run ${run.id}.`);
  }
  const mappedIssueIds = nodeState.issueIds?.length
    ? nodeState.issueIds
    : (nodeState.issueId ? [nodeState.issueId] : []);
  if (!mappedIssueIds.includes(issueId)) {
    return denied(
      "ISSUE_NOT_MAPPED_TO_NODE",
      `Issue ${issueId} is not mapped to node "${nodeState.title}" (${nodeId}) in Run ${run.id}. ` +
      `Mapped issues are: ${mappedIssueIds.length ? mappedIssueIds.join(", ") : "none"}.`
    );
  }

  // 5. Human approval nodes are never executable by an AI agent. Approval is
  // admitted only through the dedicated PO decision action.
  if (snapshotNode.data.kind === "approval" || snapshotNode.data.executionPolicy === "human") {
    return denied(
      "APPROVAL_NOT_GRANTED",
      `Node "${nodeState.title}" is a human approval gate. No AI agent may execute or self-approve it; an explicit Product Owner decision is required.`
    );
  }

  // 6. Agent authorisation — only the assigned agent may execute a task node
  if (snapshotNode.data.kind === "task" && snapshotNode.data.agentId && snapshotNode.data.agentId !== agentId) {
    return denied(
      "AGENT_NOT_AUTHORISED",
      `Agent ${agentId} is not authorised to execute node "${nodeState.title}". ` +
      `Assigned agent is ${snapshotNode.data.agentId}.`
    );
  }

  // 7. Node must not already be terminal
  const terminalStatuses: NodeExecutionStatus[] = ["done", "skipped", "failed"];
  if (terminalStatuses.includes(nodeState.status)) {
    return denied(
      "NODE_ALREADY_TERMINAL",
      `Node "${nodeState.title}" is already in terminal status "${nodeState.status}" and cannot be re-executed.`
    );
  }
  if (nodeState.status === "running") {
    // Allow the same wakeup call to be idempotent (same issue, same run)
    // but block a *different* execution path from taking over.
    // In practice, Paperclip prevents duplicate checkouts at its own layer,
    // but we log and allow here — the real guard is Paperclip's checkout lock.
  }

  // 8. Approval gate state check (defence in depth for legacy snapshots)
  if (nodeState.status === "waiting_approval") {
    return denied(
      "APPROVAL_NOT_GRANTED",
      `Node "${nodeState.title}" is an approval gate waiting for Product Owner decision. ` +
      `No agent may proceed until the PO explicitly approves this gate in the Workflow Monitor.`
    );
  }

  // 9. Upstream dependency check (AND-join semantics)
  const incomingEdges = run.workflowSnapshot.edges.filter((e) => e.target === nodeId);
  const blockerNodeIds = incomingEdges.map((e) => e.source);
  const unmetBlockers = blockerNodeIds.filter((predId) => {
    const predState = run.nodeExecutionStates[predId];
    return !predState || predState.status !== "done";
  });
  if (unmetBlockers.length > 0) {
    const titles = unmetBlockers.map((id) => run.nodeExecutionStates[id]?.title ?? id).join(", ");
    return denied(
      "DEPENDENCY_NOT_MET",
      `Node "${nodeState.title}" cannot start because the following predecessor(s) have not completed: [${titles}]. ` +
      `This enforces the React Flow Workflow edge A → B order.`
    );
  }

  // 10. Concurrency guard
  const runningCount = Object.values(run.nodeExecutionStates).filter(
    (s) => s.status === "running"
  ).length;
  if (nodeState.status !== "running" && runningCount >= run.settings.maxConcurrentAgents) {
    return denied(
      "CONCURRENCY_LIMIT",
      `Concurrency limit of ${run.settings.maxConcurrentAgents} agents already reached. ` +
      `Node "${nodeState.title}" is queued and will be dispatched when a slot is available.`
    );
  }

  return { allowed: true };
}

// ─── Issue-to-run resolver ────────────────────────────────────────────────────

/**
 * Given a flat list of WorkflowRunRecords and an issueId, return the
 * (runId, nodeId) that claims ownership of that issue — if any.
 *
 * Only active runs (running, waiting_approval, paused) are considered owners.
 * Completed / cancelled runs do NOT block future independent work on the issue.
 */
export function findIssueOwnership(
  runs: WorkflowRunRecord[],
  issueId: string
): { run: WorkflowRunRecord; nodeId: string } | null {
  const activeStatuses: WorkflowRunStatus[] = ["running", "waiting_approval", "paused"];
  for (const run of runs) {
    if (!activeStatuses.includes(run.status)) continue;
    for (const [nodeId, state] of Object.entries(run.nodeExecutionStates)) {
      if (state.issueId === issueId || state.issueIds?.includes(issueId)) {
        return { run, nodeId };
      }
    }
  }
  return null;
}

// ─── Multi-issue node completion policy ───────────────────────────────────────

export type CompletionPolicy = "all_required" | "any_one" | "majority";

/**
 * Evaluate whether a node with multiple mapped issues should be considered
 * "done" given the current issue statuses.
 *
 * A node maps to multiple issues when the PM registers sub-tasks
 * (e.g. "Authentication API" + "Order API" both mapped to the Backend node).
 */
export function evaluateNodeCompletion(
  issueStatuses: string[],
  policy: CompletionPolicy = "all_required"
): { completed: boolean; reason: string } {
  const done = issueStatuses.filter((s) => s === "done");
  const failed = issueStatuses.filter((s) => s === "cancelled" || s === "blocked");
  const total = issueStatuses.length;

  if (total === 0) return { completed: false, reason: "No issues mapped to this node." };

  switch (policy) {
    case "all_required":
      if (done.length === total) return { completed: true, reason: `All ${total} issues completed.` };
      if (failed.length > 0 && done.length + failed.length === total)
        return { completed: false, reason: `${failed.length}/${total} issues failed. Node cannot complete.` };
      return { completed: false, reason: `${done.length}/${total} issues done; waiting for the rest.` };

    case "any_one":
      if (done.length > 0) return { completed: true, reason: `${done.length}/${total} issues completed (any-one policy).` };
      return { completed: false, reason: `0/${total} issues done yet.` };

    case "majority":
      if (done.length > total / 2) return { completed: true, reason: `${done.length}/${total} issues completed (majority policy).` };
      return { completed: false, reason: `${done.length}/${total} issues done; majority not reached.` };
  }
}

// ─── Audit log builder ────────────────────────────────────────────────────────

export function buildAuditEntry(
  runId: string,
  nodeId: string | null,
  issueId: string | null,
  agentId: string | null,
  decision: GateDecision
): GateAuditEntry {
  return {
    ts: new Date().toISOString(),
    runId,
    nodeId,
    issueId,
    agentId,
    allowed: decision.allowed,
    code: decision.allowed ? "ADMITTED" : (decision as { allowed: false; code: GateRejectionCode }).code,
    reason: decision.allowed ? "Execution gate: ADMITTED" : (decision as { allowed: false; reason: string }).reason,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function denied(code: GateRejectionCode, reason: string): GateDecision {
  return { allowed: false, code, reason };
}
