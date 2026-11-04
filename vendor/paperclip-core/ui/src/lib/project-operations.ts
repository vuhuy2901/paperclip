import type { Issue } from "@paperclipai/shared";
import type { RunForIssue } from "../api/activity";

export const MANUAL_TASK_LABEL = "AI Company: Manual Task";

export type ProjectPhase =
  | "no-requirement"
  | "submitted"
  | "pm-running"
  | "pm-failed"
  | "tasks-generated"
  | "workflow-running"
  | "workflow-blocked"
  | "waiting-approval"
  | "completed";

export type ProjectWorkflowSnapshot = {
  binding: {
    templateName: string;
    workflow: {
      nodes: Array<{
        id: string;
        data?: {
          kind?: string;
          title?: string;
          agentName?: string | null;
          agentRole?: string | null;
          model?: string | null;
          description?: string;
          issueIdentifier?: string | null;
        };
        position?: { x: number; y: number };
      }>;
      edges?: Array<{ id: string; source: string; target: string }>;
    };
  } | null;
  activeRun?: {
    id: string;
    status: string;
    inputRequirement: string;
    startedAt: string;
    updatedAt: string;
    currentStepTitle?: string;
    projectManagerAgentId?: string | null;
    coordinatorIssueIds?: string[];
    taskMappings?: Array<{ issueId: string; workflowNodeId: string; stageId: string; isCoordinator?: boolean }>;
    artifacts?: Array<{ name: string }>;
  } | null;
  recentRuns?: Array<{ id: string; status: string; startedAt: string; finishedAt?: string | null }>;
  monitor: Array<{
    nodeId: string;
    stageTitle?: string;
    stageStatus?: string;
    agentName?: string | null;
    taskCount?: number;
    runs?: Array<{ id: string; status: string; agentId: string }>;
  }>;
};

export type ProjectTaskRow = { issue: Issue; stageId: string | null; stageName: string | null };

export type ProjectOperationsModel = {
  phase: ProjectPhase;
  headline: string;
  explanation: string;
  requirement: Issue | null;
  requirementText: string | null;
  requirementTime: string | null;
  tasks: ProjectTaskRow[];
  runningCount: number;
  completedCount: number;
  blockedCount: number;
  failedCount: number;
  activeAgents: string[];
  currentStages: string[];
  progress: number;
  lastActivity: string | null;
  failedRunId: string | null;
  failedAgentId: string | null;
  failure: string | null;
  canRetry: boolean;
  journeyStep: number;
};

const isManualTask = (issue: Issue) =>
  issue.labels?.some((label) => label.name === MANUAL_TASK_LABEL) === true;

export function isProjectRequirement(issue: Issue): boolean {
  if (isManualTask(issue)) return false;
  return issue.originKind === "manual" || (!issue.originKind && !issue.createdByAgentId);
}

function isRealTask(issue: Issue, mappedIds: Set<string>): boolean {
  if (mappedIds.has(issue.id) || isManualTask(issue)) return true;
  return Boolean(issue.createdByAgentId || issue.parentId);
}

function latest<T extends { createdAt?: string | Date | null }>(items: T[]): T | null {
  return [...items].sort((a, b) =>
    new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())[0] ?? null;
}

export function buildProjectOperationsModel(input: {
  issues: Issue[];
  workflow: ProjectWorkflowSnapshot | null;
  requirementDetail?: Issue | null;
  requirementRuns?: RunForIssue[];
}): ProjectOperationsModel {
  const { issues, workflow } = input;
  const run = workflow?.activeRun;
  const requirement = latest(issues.filter(isProjectRequirement));
  const requirementText = requirement?.title ?? run?.inputRequirement ?? null;
  const requirementTime = requirement?.createdAt
    ? String(requirement.createdAt)
    : run?.startedAt ?? null;
  const mapped = new Map(
    (run?.taskMappings ?? []).filter((item) => !item.isCoordinator).map((item) => [item.issueId, item]),
  );
  const mappedIds = new Set(mapped.keys());
  const taskRows = issues.filter((issue) => isRealTask(issue, mappedIds))
    .map((issue) => {
      const mapping = mapped.get(issue.id);
      const stageId = mapping?.stageId ?? mapping?.workflowNodeId ?? null;
      const stageName = stageId
        ? workflow?.monitor.find((stage) => stage.nodeId === stageId)?.stageTitle ?? null
        : null;
      return { issue, stageId, stageName };
    })
    .sort((a, b) => new Date(b.issue.updatedAt).getTime() - new Date(a.issue.updatedAt).getTime());
  const activeStages = (workflow?.monitor ?? []).filter((stage) => stage.stageStatus === "running");
  const blockedStages = (workflow?.monitor ?? []).filter((stage) => stage.stageStatus === "blocked");
  const actualRunningStages = activeStages.filter((stage) =>
    stage.runs?.some((item) => item.status === "running") ||
    taskRows.some((item) => item.stageId === stage.nodeId && item.issue.activeRun?.status === "running"));
  const currentStages = (blockedStages.length > 0 ? blockedStages : activeStages)
    .map((stage) => stage.stageTitle ?? stage.nodeId);
  const activeAgents = [...new Set(actualRunningStages.flatMap((stage) =>
    stage.agentName ? [stage.agentName] : []))];
  const runs = [...(input.requirementRuns ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const blocker = input.requirementDetail?.executionBlocker ?? null;
  const failedRun = blocker ? runs.find((item) => item.runId === blocker.runId) : null;
  const newerRun = failedRun ? runs.find((item) =>
    new Date(item.createdAt).getTime() > new Date(failedRun.createdAt).getTime()) : null;
  const failureIsCurrent = Boolean(blocker && !newerRun);
  const runningCount = taskRows.filter((item) => item.issue.activeRun?.status === "running").length;
  const completedCount = taskRows.filter((item) => item.issue.status === "done").length;
  const blockedCount = taskRows.filter((item) => item.issue.status === "blocked").length;
  const failedCount = taskRows.filter((item) => item.issue.executionBlocker ||
    item.issue.activeRun?.status === "failed").length;
  let phase: ProjectPhase;
  if (failureIsCurrent) phase = "pm-failed";
  else if (run?.status === "completed") phase = "completed";
  else if (run?.status === "waiting_approval") phase = "waiting-approval";
  else if (run?.status === "failed" || blockedStages.length > 0) phase = "workflow-blocked";
  else if (!requirementText) phase = "no-requirement";
  else if (taskRows.length === 0 && (actualRunningStages.length > 0 || requirement?.activeRun?.status === "running" ||
    newerRun?.status === "running")) phase = "pm-running";
  else if (taskRows.length > 0 && run?.status === "running") phase = "workflow-running";
  else if (taskRows.length > 0) phase = "tasks-generated";
  else phase = "submitted";
  const messages: Record<ProjectPhase, [string, string]> = {
    "no-requirement": ["No requirement submitted yet.", "Submit the initial software requirement to start planning with the AI Project Manager."],
    submitted: ["Requirement received. Awaiting Project Manager.", "Tasks will appear after the Project Manager analyzes the requirement and delegates work."],
    "pm-running": ["Project Manager is analyzing the requirement.", "Track real-time activity and open logs to observe planning progress."],
    "pm-failed": ["Project Manager could not execute the requirement.", "Review failure diagnostics from the latest run, resolve connection or config issues, and retry."],
    "tasks-generated": ["AI generated the execution plan and tasks.", "Specialist agents are assigned according to the project workflow."],
    "workflow-running": ["Agents are actively executing tasks.", "Track active stages and inspect logs for each delegated task."],
    "workflow-blocked": ["Workflow execution is blocked.", "Open the Live Monitor to identify the stage or gate that requires intervention."],
    "waiting-approval": ["Project is waiting for review or approval.", "Review stage deliverables before deciding to proceed."],
    completed: ["Workflow execution completed.", "Inspect deliverables, artifacts, and test verification results."],
  };
  const lastActivity = [run?.updatedAt, ...issues.map((issue) => String(issue.updatedAt))]
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;
  const hasDevelopment = taskRows.some((item) => item.stageId && item.stageId !== "pm");
  const hasTesting = (workflow?.monitor ?? []).some((stage) =>
    /test|qa/i.test(stage.stageTitle ?? "") && ["running", "done"].includes(stage.stageStatus ?? ""));
  const journeyStep = phase === "completed" ? 4 : hasTesting ? 3 : hasDevelopment ? 2
    : requirementText ? 1 : 0;
  return {
    phase,
    headline: messages[phase][0],
    explanation: messages[phase][1],
    requirement,
    requirementText,
    requirementTime,
    tasks: taskRows,
    runningCount,
    completedCount,
    blockedCount,
    failedCount,
    activeAgents,
    currentStages: failureIsCurrent ? currentStages.map((stage) => `${stage} · execution failed`) : currentStages,
    progress: run?.status === "completed" ? 100 : taskRows.length > 0
      ? Math.round(completedCount / taskRows.length * 100) : 0,
    lastActivity,
    failedRunId: failureIsCurrent ? blocker?.runId ?? null : null,
    failedAgentId: failureIsCurrent ? blocker?.agentId ?? null : null,
    failure: failureIsCurrent ? blocker?.runError ?? "Latest run failed." : null,
    canRetry: failureIsCurrent && blocker?.canRetry === true,
    journeyStep,
  };
}

export type NormalizedNodeStatus = "pending" | "running" | "done" | "failed" | "waiting_approval" | "blocked";

export function mapNodeExecutionStatus(state?: { status?: string } | null): NormalizedNodeStatus {
  if (!state || !state.status) return "pending";
  const s = state.status.toLowerCase();
  if (s === "running" || s === "in_progress") return "running";
  if (s === "done" || s === "completed" || s === "success") return "done";
  if (s === "failed" || s === "error") return "failed";
  if (s === "waiting_approval" || s === "approval" || s === "waiting") return "waiting_approval";
  if (s === "blocked") return "blocked";
  return "pending";
}

export function computeWorkflowRunProgress(
  nodes: Array<{ id: string }>,
  nodeExecutionStates?: Record<string, { status?: string }> | null
): { totalNodes: number; completedNodes: number; failedNodes: number; runningNodes: number; percent: number } {
  const totalNodes = nodes.length;
  if (totalNodes === 0) {
    return { totalNodes: 0, completedNodes: 0, failedNodes: 0, runningNodes: 0, percent: 0 };
  }
  const states = nodeExecutionStates ?? {};
  let completedNodes = 0;
  let failedNodes = 0;
  let runningNodes = 0;

  for (const node of nodes) {
    const status = mapNodeExecutionStatus(states[node.id]);
    if (status === "done") completedNodes++;
    else if (status === "failed") failedNodes++;
    else if (status === "running") runningNodes++;
  }

  const percent = Math.round((completedNodes / totalNodes) * 100);
  return { totalNodes, completedNodes, failedNodes, runningNodes, percent };
}

export function validateSafeWorkspacePath(relPath: string): boolean {
  if (!relPath || typeof relPath !== "string") return false;
  if (relPath.includes("..") || relPath.includes("\\") || relPath.startsWith("/")) return false;
  const parts = relPath.split("/").filter(Boolean);
  const forbiddenDirs = [".git", "node_modules", "dist", ".next", ".turbo"];
  for (const part of parts) {
    if (forbiddenDirs.includes(part.toLowerCase())) return false;
  }
  return true;
}
