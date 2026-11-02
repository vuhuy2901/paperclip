export type WorkflowStatus = "draft" | "published";
export type WorkflowNodeKind = "start" | "task" | "approval" | "parallel" | "join" | "condition" | "end";

export type WorkflowNodeData = {
  kind: WorkflowNodeKind;
  title: string;
  description: string;
  issueId: string | null;
  issueIdentifier: string | null;
  agentId: string | null;
  agentName: string | null;
  agentRole: string | null;
  status: string;
  priority: string;
  executionPolicy: "paperclip" | "human" | "visual-only";
  requiredRole?: string | null;
  model?: string | null;
  [key: string]: unknown;
};

export type WorkflowNode = {
  id: string;
  type: "workflowNode";
  position: { x: number; y: number };
  data: WorkflowNodeData;
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  type?: "smoothstep";
  label?: string;
};

export type WorkflowViewport = { x: number; y: number; zoom: number };

export type WorkflowDefinition = {
  id: string;
  companyId: string;
  projectId: string | null;
  name: string;
  description: string;
  version: number;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  viewport: WorkflowViewport;
  layout: { direction: "LR" | "TB"; compact: boolean };
  publishedIssueIds: string[];
  publishedDependencies: Record<string, string[]>;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type WorkflowIndexEntry = Pick<
  WorkflowDefinition,
  "id" | "companyId" | "projectId" | "name" | "description" | "version" | "status" | "updatedAt" | "publishedAt"
>;

export type PaperclipProject = { id: string; name: string; status?: string };
export type PaperclipAgent = {
  id: string;
  name: string;
  role: string;
  title: string | null;
  status: string;
  icon: string | null;
  avatarUrl?: string;
  adapterType: string;
  adapterConfig: Record<string, unknown>;
};

export type PaperclipIssue = {
  id: string;
  identifier: string | null;
  projectId: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigneeAgentId: string | null;
  assigneeUserId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
  activeRun?: {
    id: string;
    status: string;
    agentId: string;
    startedAt: string | null;
    finishedAt: string | null;
  } | null;
};

export type ValidationIssue = {
  level: "error" | "warning";
  code: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
};

export type ValidationResult = { valid: boolean; issues: ValidationIssue[] };

export type MonitorRun = {
  id: string;
  status: string;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
  agentId: string;
};

export type MonitorNode = {
  nodeId: string;
  issue: PaperclipIssue | null;
  blockedBy: Array<{ id: string; identifier?: string | null; title?: string }>;
  runs: MonitorRun[];
};

export type BootstrapData = {
  projects: PaperclipProject[];
  agents: PaperclipAgent[];
  issues: PaperclipIssue[];
  workflows: WorkflowIndexEntry[];
  runs?: WorkflowRunSummary[];
};

export type WorkflowData = {
  workflow: WorkflowDefinition;
  monitor: MonitorNode[];
};

export type ProjectWorkflowBinding = {
  projectId: string;
  templateId: string;
  templateName: string;
  templateVersion: number;
  workflow: WorkflowDefinition;
  attachedAt: string;
  updatedAt: string;
};

export type ProjectWorkflowData = {
  project: PaperclipProject | null;
  workflows: WorkflowIndexEntry[];
  agents: PaperclipAgent[];
  binding: ProjectWorkflowBinding | null;
  monitor: MonitorNode[];
  activeRun?: WorkflowRunRecord | null;
  recentRuns?: WorkflowRunSummary[];
};

export type WorkflowRunStatus =
  | "pending"
  | "running"
  | "waiting_approval"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export type NodeExecutionStatus =
  | "pending"
  | "ready"
  | "running"
  | "waiting_approval"
  | "done"
  | "failed"
  | "blocked"
  | "skipped";

export type WorkflowRunSettings = {
  maxConcurrentAgents: number;
  approvalMode: "require_approval" | "auto";
  failurePolicy: "pause_and_report" | "fail_fast" | "continue_unrelated";
  retryPolicy: "bounded" | "none" | "manual";
  maxRetries?: number;
};

export type NodeCompletionPolicy = "all_required" | "any_one" | "majority";

export type NodeExecutionState = {
  nodeId: string;
  kind: WorkflowNodeKind;
  title: string;
  status: NodeExecutionStatus;
  /** Primary mapped issue (first / only). */
  issueId: string | null;
  issueIdentifier: string | null;
  /** All issues mapped to this node (multi-issue support — §14). */
  issueIds: string[];
  issueIdentifiers: string[];
  /** Completion policy for multi-issue nodes. */
  completionPolicy: NodeCompletionPolicy;
  agentId: string | null;
  agentName: string | null;
  agentRole: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
  retryCount: number;
  blockedByNodeIds: string[];
  /** Last execution gate decision (for audit / tracing). */
  lastGateCode?: string | null;
  lastGateReason?: string | null;
};

export type WorkflowRunHistoryEntry = {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "action" | "approval";
  message: string;
  nodeId?: string;
  agentId?: string;
  issueId?: string;
};

export type WorkflowRunRecord = {
  id: string;
  workflowId: string;
  workflowVersion: number;
  workflowName: string;
  projectId: string;
  projectName: string;
  companyId: string;
  initiatorUserId: string | null;
  inputRequirement: string;
  status: WorkflowRunStatus;
  settings: WorkflowRunSettings;
  startedAt: string;
  finishedAt: string | null;
  pausedAt: string | null;
  nodeExecutionStates: Record<string, NodeExecutionState>;
  relatedIssueIds: string[];
  executionHistory: WorkflowRunHistoryEntry[];
  workflowSnapshot: WorkflowDefinition;
  currentStepTitle?: string;
  totalTokens?: number;
  updatedAt: string;
};

export type WorkflowRunSummary = {
  id: string;
  workflowId: string;
  workflowName: string;
  workflowVersion: number;
  projectId: string;
  projectName: string;
  status: WorkflowRunStatus;
  progress: number;
  completedTasks: number;
  totalTasks: number;
  inputRequirement: string;
  startedAt: string;
  finishedAt: string | null;
  currentStepTitle?: string;
};

export type PreflightCheckItem = {
  key: string;
  name: string;
  status: "pass" | "warn" | "fail";
  message: string;
};

export type PreflightCheckResult = {
  ok: boolean;
  checks: PreflightCheckItem[];
};
