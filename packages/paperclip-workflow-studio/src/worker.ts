import { randomUUID } from "node:crypto";
import {
  definePlugin,
  runWorker,
  type PluginContext,
  type PluginPerformActionContext
} from "@paperclipai/plugin-sdk";
import type { Agent, Issue, Project } from "@paperclipai/shared";
import {
  canExecute,
  findIssueOwnership,
  evaluateNodeCompletion,
  buildAuditEntry,
  type GateAuditEntry
} from "./execution-gate.js";
import type {
  BootstrapData,
  CompanyIntelligenceData,
  IntelligenceAgentRow,
  IntelligenceDailyPoint,
  IntelligenceProjectRow,
  IntelligenceRange,
  IntelligenceRunRow,
  MonitorNode,
  NodeExecutionState,
  NodeExecutionStatus,
  PaperclipIssue,
  PaperclipAgent,
  PreflightCheckItem,
  PreflightCheckResult,
  ProjectPortfolioActiveRun,
  ProjectPortfolioData,
  ProjectPortfolioItem,
  ProjectWorkflowBinding,
  ProjectWorkflowData,
  ValidationIssue,
  ValidationResult,
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowIndexEntry,
  WorkflowNode,
  WorkflowNodeData,
  WorkflowRunHistoryEntry,
  WorkflowRunRecord,
  WorkflowRunSettings,
  WorkflowRunStatus,
  WorkflowRunSummary,
  WorkflowTaskMapping
} from "./types.js";

const INDEX_KEY = "workflow-index";
const NAMESPACE = "workflow-studio";
const PROJECT_BINDING_KEY = "project-workflow-binding";
const RUNS_INDEX_KEY = "workflow-runs-index";
const GATE_AUDIT_KEY = "workflow-gate-audit";

function requiredString(value: unknown, name: string): string {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${name} is required`);
  return value.trim();
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function maskSecrets(text: string): string {
  if (typeof text !== "string") return "";
  return text
    .replace(/sk-[a-zA-Z0-9_\-]{20,}/g, "sk-***")
    .replace(/(?:api[_-]?key|token|password|secret)\s*[:=]\s*["']?([a-zA-Z0-9_\-\.]{8,})["']?/gi, (match, val) =>
      match.replace(val, "***")
    );
}

function workflowKey(workflowId: string): string {
  return `workflow:${workflowId}`;
}

async function readIndex(ctx: PluginContext, companyId: string): Promise<WorkflowIndexEntry[]> {
  const value = await ctx.state.get({ scopeKind: "company", scopeId: companyId, namespace: NAMESPACE, stateKey: INDEX_KEY });
  return Array.isArray(value) ? value as WorkflowIndexEntry[] : [];
}

async function writeIndex(ctx: PluginContext, companyId: string, index: WorkflowIndexEntry[]): Promise<void> {
  await ctx.state.set(
    { scopeKind: "company", scopeId: companyId, namespace: NAMESPACE, stateKey: INDEX_KEY },
    index
  );
}

async function readWorkflow(ctx: PluginContext, companyId: string, workflowId: string): Promise<WorkflowDefinition | null> {
  const value = await ctx.state.get({
    scopeKind: "company",
    scopeId: companyId,
    namespace: NAMESPACE,
    stateKey: workflowKey(workflowId)
  });
  if (value && typeof value === "object") return value as WorkflowDefinition;

  // Fallback 1: check project workflow bindings in this company
  try {
    const projects = await ctx.projects.list({ companyId, limit: 200, offset: 0 });
    if (Array.isArray(projects)) {
      for (const project of projects) {
        const binding = await readProjectBinding(ctx, project.id);
        if (binding?.workflow && binding.workflow.id === workflowId) {
          await ctx.state.set(
            { scopeKind: "company", scopeId: companyId, namespace: NAMESPACE, stateKey: workflowKey(workflowId) },
            binding.workflow
          );
          return binding.workflow;
        }
      }
    }
  } catch {
    // ignore
  }

  // Fallback 2: check workflow run snapshots in this company
  try {
    const runs = await readRunsIndex(ctx, companyId);
    const candidate = runs.find((r) => r.workflowId === workflowId);
    if (candidate) {
      const runRecord = await readRun(ctx, companyId, candidate.id);
      if (runRecord?.workflowSnapshot && runRecord.workflowSnapshot.id === workflowId) {
        await ctx.state.set(
          { scopeKind: "company", scopeId: companyId, namespace: NAMESPACE, stateKey: workflowKey(workflowId) },
          runRecord.workflowSnapshot
        );
        return runRecord.workflowSnapshot;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

function indexEntry(workflow: WorkflowDefinition): WorkflowIndexEntry {
  const { id, companyId, projectId, name, description, version, status, updatedAt, publishedAt } = workflow;
  return { id, companyId, projectId, name, description, version, status, updatedAt, publishedAt };
}

async function persistWorkflow(ctx: PluginContext, workflow: WorkflowDefinition): Promise<void> {
  await ctx.state.set(
    { scopeKind: "company", scopeId: workflow.companyId, namespace: NAMESPACE, stateKey: workflowKey(workflow.id) },
    workflow
  );
  const current = await readIndex(ctx, workflow.companyId);
  const next = [indexEntry(workflow), ...current.filter((item) => item.id !== workflow.id)]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  await writeIndex(ctx, workflow.companyId, next);
}

async function readProjectBinding(ctx: PluginContext, projectId: string): Promise<ProjectWorkflowBinding | null> {
  const value = await ctx.state.get({ scopeKind: "project", scopeId: projectId, namespace: NAMESPACE, stateKey: PROJECT_BINDING_KEY });
  return value && typeof value === "object" ? value as ProjectWorkflowBinding : null;
}

async function persistProjectBinding(ctx: PluginContext, binding: ProjectWorkflowBinding): Promise<void> {
  await ctx.state.set(
    { scopeKind: "project", scopeId: binding.projectId, namespace: NAMESPACE, stateKey: PROJECT_BINDING_KEY },
    binding
  );
}

function runKey(runId: string): string {
  return `workflow-run:${runId}`;
}

async function readRunsIndex(ctx: PluginContext, companyId: string): Promise<WorkflowRunSummary[]> {
  const value = await ctx.state.get({ scopeKind: "company", scopeId: companyId, namespace: NAMESPACE, stateKey: RUNS_INDEX_KEY });
  return Array.isArray(value) ? (value as WorkflowRunSummary[]) : [];
}

async function writeRunsIndex(ctx: PluginContext, companyId: string, index: WorkflowRunSummary[]): Promise<void> {
  await ctx.state.set(
    { scopeKind: "company", scopeId: companyId, namespace: NAMESPACE, stateKey: RUNS_INDEX_KEY },
    index
  );
}

async function readRun(ctx: PluginContext, companyId: string, runId: string): Promise<WorkflowRunRecord | null> {
  const value = await ctx.state.get({
    scopeKind: "company",
    scopeId: companyId,
    namespace: NAMESPACE,
    stateKey: runKey(runId)
  });
  return value && typeof value === "object" ? (value as WorkflowRunRecord) : null;
}

async function resolveActiveIssueOwnership(
  ctx: PluginContext,
  companyId: string,
  issueId: string,
  requestedRunId?: string | null
): Promise<{ run: WorkflowRunRecord; nodeId: string } | null> {
  const activeStatuses: WorkflowRunStatus[] = ["pending", "running", "waiting_approval", "paused"];
  const candidates: Array<{ run: WorkflowRunRecord; nodeId: string }> = [];
  const summaries = await readRunsIndex(ctx, companyId);

  for (const summary of summaries) {
    if (!activeStatuses.includes(summary.status)) continue;
    if (requestedRunId && summary.id !== requestedRunId) continue;
    const run = await readRun(ctx, companyId, summary.id);
    if (!run) continue;
    for (const [nodeId, state] of Object.entries(run.nodeExecutionStates)) {
      const mapped = state.issueIds?.length ? state.issueIds : (state.issueId ? [state.issueId] : []);
      if (mapped.includes(issueId)) candidates.push({ run, nodeId });
    }
  }

  if (candidates.length > 1) {
    throw new Error(`Workflow ownership conflict: issue ${issueId} is mapped to multiple active run nodes.`);
  }
  return candidates[0] ?? null;
}

function runSummary(run: WorkflowRunRecord): WorkflowRunSummary {
  const mappings = (run.taskMappings ?? []).filter((mapping) => !mapping.isCoordinator);
  const totalTasks = mappings.length > 0
    ? mappings.length
    : Object.values(run.nodeExecutionStates).filter((s) => (s.kind === "task" || s.kind === "approval") && !s.isCoordinator && s.issueIds.length > 0).length;
  const completedTasks = mappings.length > 0
    ? mappings.filter((mapping) => run.nodeExecutionStates[mapping.workflowNodeId]?.status === "done").length
    : Object.values(run.nodeExecutionStates).filter((s) => (s.kind === "task" || s.kind === "approval") && !s.isCoordinator && s.status === "done").length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : (run.status === "completed" ? 100 : 0);
  return {
    id: run.id,
    workflowId: run.workflowId,
    workflowName: run.workflowName,
    workflowVersion: run.workflowVersion,
    projectId: run.projectId,
    projectName: run.projectName,
    status: run.status,
    progress,
    completedTasks,
    totalTasks,
    inputRequirement: run.inputRequirement,
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    currentStepTitle: run.currentStepTitle
  };
}

async function persistRun(ctx: PluginContext, run: WorkflowRunRecord): Promise<void> {
  await ctx.state.set(
    { scopeKind: "company", scopeId: run.companyId, namespace: NAMESPACE, stateKey: runKey(run.id) },
    run
  );
  const current = await readRunsIndex(ctx, run.companyId);
  const next = [runSummary(run), ...current.filter((item) => item.id !== run.id)]
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt))
    .slice(0, 100);
  await writeRunsIndex(ctx, run.companyId, next);
}

type IntelligenceRunDbRow = {
  id: string;
  agent_id: string;
  agent_name: string;
  project_id: string | null;
  project_name: string | null;
  issue_id: string | null;
  issue_identifier: string | null;
  status: string;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  error_code: string | null;
  error: string | null;
};

type IntelligenceCostDbRow = {
  agent_id: string | null;
  input_tokens: string | number | null;
  output_tokens: string | number | null;
  cached_input_tokens: string | number | null;
  cost_cents: string | number | null;
  event_count: string | number;
  subscription_events: string | number;
  unknown_events: string | number;
};

function numericValue(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function selectedRange(value: unknown): IntelligenceRange {
  return value === "24h" || value === "7d" || value === "30d" ? value : "7d";
}

function durationMs(startedAt: string | null, finishedAt: string | null, now: number): number | null {
  if (!startedAt) return null;
  const start = Date.parse(startedAt);
  const end = finishedAt ? Date.parse(finishedAt) : now;
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;
  return end - start;
}

function percentile(values: number[], percentileRank: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * percentileRank) - 1));
  return sorted[index] ?? null;
}

async function readCompanyIntelligence(
  ctx: PluginContext,
  companyId: string,
  requestedRange: unknown,
): Promise<CompanyIntelligenceData> {
  const range = selectedRange(requestedRange);
  const now = Date.now();
  const windowMs = range === "24h" ? 24 * 60 * 60 * 1000 : range === "30d" ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  const since = new Date(now - windowMs).toISOString();

  // This is metadata-only, bounded to the selected window. Logs and stdout are
  // deliberately excluded; the dashboard links to the existing run/log views.
  const runRows = await ctx.db.query<IntelligenceRunDbRow>(
    `SELECT r.id::text AS id,
            r.agent_id::text AS agent_id,
            a.name AS agent_name,
            i.project_id::text AS project_id,
            p.name AS project_name,
            r.issue_id::text AS issue_id,
            i.identifier AS issue_identifier,
            r.status,
            r.started_at::text AS started_at,
            r.finished_at::text AS finished_at,
            r.created_at::text AS created_at,
            r.error_code,
            r.error
       FROM public.heartbeat_runs r
       JOIN public.agents a ON a.id = r.agent_id AND a.company_id = r.company_id
       LEFT JOIN public.issues i ON i.id = r.issue_id AND i.company_id = r.company_id
       LEFT JOIN public.projects p ON p.id = i.project_id AND p.company_id = r.company_id
      WHERE r.company_id = $1 AND r.created_at >= $2
      ORDER BY r.created_at DESC
      LIMIT 5000`,
    [companyId, since],
  );
  const costRows = await ctx.db.query<IntelligenceCostDbRow>(
    `SELECT agent_id::text AS agent_id,
            COALESCE(SUM(input_tokens), 0)::text AS input_tokens,
            COALESCE(SUM(output_tokens), 0)::text AS output_tokens,
            COALESCE(SUM(cached_input_tokens), 0)::text AS cached_input_tokens,
            SUM(cost_cents)::text AS cost_cents,
            COUNT(*)::text AS event_count,
            COUNT(*) FILTER (WHERE billing_type = 'subscription_included')::text AS subscription_events,
            COUNT(*) FILTER (WHERE billing_type = 'unknown')::text AS unknown_events
       FROM public.cost_events
      WHERE company_id = $1 AND occurred_at >= $2
      GROUP BY agent_id`,
    [companyId, since],
  );

  const [agents, projects, issues, approvals, workflowRuns] = await Promise.all([
    ctx.agents.list({ companyId, limit: 200, offset: 0 }),
    ctx.projects.list({ companyId, limit: 200, offset: 0 }),
    ctx.issues.list({ companyId, limit: 5000, offset: 0 }),
    ctx.approvals.list({ companyId, status: "pending" }),
    readRunsIndex(ctx, companyId),
  ]);

  const costsByAgent = new Map<string, IntelligenceCostDbRow>();
  for (const row of costRows) if (row.agent_id) costsByAgent.set(row.agent_id, row);
  const runsByAgent = new Map<string, IntelligenceRunDbRow[]>();
  const dailyMap = new Map<string, IntelligenceDailyPoint>();
  const terminalStatuses = new Set(["succeeded", "failed", "timed_out", "cancelled", "interrupted"]);
  const successStatuses = new Set(["succeeded", "completed"]);
  let totalRuntimeMs = 0;
  let validRuntimeCount = 0;
  let totalTokens = 0;
  let tokenCount = 0;
  let failedRuns = 0;
  let successfulRuns = 0;
  let eligibleTerminalRuns = 0;

  for (const row of runRows) {
    const list = runsByAgent.get(row.agent_id) ?? [];
    list.push(row);
    runsByAgent.set(row.agent_id, list);
    if (terminalStatuses.has(row.status)) eligibleTerminalRuns += 1;
    if (successStatuses.has(row.status)) successfulRuns += 1;
    if (["failed", "timed_out", "interrupted"].includes(row.status)) failedRuns += 1;
    const runtime = durationMs(row.started_at, row.finished_at, now);
    if (runtime !== null) {
      totalRuntimeMs += runtime;
      validRuntimeCount += 1;
    }
    const day = (row.started_at ?? row.created_at).slice(0, 10);
    const point = dailyMap.get(day) ?? { date: day, runs: 0, runtimeMs: 0, failures: 0 };
    point.runs += 1;
    if (runtime !== null) point.runtimeMs += runtime;
    if (["failed", "timed_out", "interrupted"].includes(row.status)) point.failures += 1;
    dailyMap.set(day, point);
  }

  const issuesByAgent = new Map<string, number>();
  for (const issue of issues) {
    if (issue.assigneeAgentId && issue.status === "done" && issue.completedAt && new Date(issue.completedAt).getTime() >= Date.parse(since)) {
      issuesByAgent.set(issue.assigneeAgentId, (issuesByAgent.get(issue.assigneeAgentId) ?? 0) + 1);
    }
  }

  const agentRows: IntelligenceAgentRow[] = agents.map((agent) => {
    const agentRuns = runsByAgent.get(agent.id) ?? [];
    const durations = agentRuns
      .map((run) => durationMs(run.started_at, run.finished_at, now))
      .filter((value): value is number => value !== null);
    const terminal = agentRuns.filter((run) => terminalStatuses.has(run.status));
    const successes = agentRuns.filter((run) => successStatuses.has(run.status)).length;
    const costs = costsByAgent.get(agent.id);
    const inputTokens = costs ? numericValue(costs.input_tokens) : null;
    const outputTokens = costs ? numericValue(costs.output_tokens) : null;
    const cachedInputTokens = costs ? numericValue(costs.cached_input_tokens) : null;
    if (costs && (inputTokens || outputTokens)) {
      totalTokens += (inputTokens ?? 0) + (outputTokens ?? 0);
      tokenCount += 1;
    }
    const activeRun = agentRuns.find((run) => ["queued", "running"].includes(run.status));
    const lastActiveAt = agentRuns[0]?.finished_at ?? agentRuns[0]?.started_at ?? agentRuns[0]?.created_at ?? null;
    return {
      agentId: agent.id,
      name: agent.name,
      role: agent.role,
      status: agent.status,
      totalRuns: agentRuns.length,
      successfulRuns: successes,
      failedRuns: agentRuns.filter((run) => ["failed", "timed_out", "interrupted"].includes(run.status)).length,
      successRate: terminal.length > 0 ? Math.round((successes / terminal.length) * 1000) / 10 : null,
      totalRuntimeMs: durations.length > 0 ? durations.reduce((sum, value) => sum + value, 0) : null,
      averageRunDurationMs: durations.length > 0 ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length) : null,
      p95RunDurationMs: percentile(durations, 0.95),
      completedTasks: issuesByAgent.get(agent.id) ?? 0,
      inputTokens,
      outputTokens,
      cachedInputTokens,
      reportedCostCents: costs?.cost_cents == null ? null : numericValue(costs.cost_cents),
      lastActiveAt,
      currentRunId: activeRun?.id ?? null,
    };
  }).sort((a, b) => (b.totalRuntimeMs ?? -1) - (a.totalRuntimeMs ?? -1));

  const workflowRunByProject = new Map<string, WorkflowRunSummary[]>();
  for (const run of workflowRuns) {
    const list = workflowRunByProject.get(run.projectId) ?? [];
    list.push(run);
    workflowRunByProject.set(run.projectId, list);
  }
  const activeWorkflowStatuses = new Set<WorkflowRunStatus>(["pending", "running", "waiting_approval", "paused"]);
  const projectRows: IntelligenceProjectRow[] = [];
  for (const project of projects) {
    const projectIssues = issues.filter((issue) => issue.projectId === project.id);
    const projectRuns = workflowRunByProject.get(project.id) ?? [];
    const activeSummary = projectRuns.find((run) => activeWorkflowStatuses.has(run.status));
    const latestSummary = projectRuns[0] ?? null;
    let currentStages: string[] = [];
    let blockedReason: string | null = null;
    if (activeSummary) {
      const activeRun = await readRun(ctx, companyId, activeSummary.id);
      if (activeRun) {
        const states = Object.values(activeRun.nodeExecutionStates);
        currentStages = states.filter((state) => ["running", "waiting_approval"].includes(state.status)).map((state) => state.title);
        const blocked = states.find((state) => state.status === "blocked");
        blockedReason = blocked?.lastGateReason ?? null;
      }
    }
    const activeAgents = [...new Set(projectIssues.filter((issue) => issue.status === "in_progress" && issue.assigneeAgentId).map((issue) => issue.assigneeAgentId!))]
      .map((id) => agents.find((agent) => agent.id === id)?.name ?? id);
    projectRows.push({
      projectId: project.id,
      name: project.name,
      status: project.status,
      workflowName: activeSummary?.workflowName ?? latestSummary?.workflowName ?? null,
      runStatus: activeSummary?.status ?? latestSummary?.status ?? null,
      progress: activeSummary?.progress ?? latestSummary?.progress ?? null,
      currentStages,
      activeAgents,
      completedTasks: projectIssues.filter((issue) => issue.status === "done").length,
      pendingTasks: projectIssues.filter((issue) => !["done", "cancelled"].includes(issue.status)).length,
      blockedTasks: projectIssues.filter((issue) => issue.status === "blocked").length,
      lastActivityAt: latestSummary?.finishedAt ?? latestSummary?.startedAt ?? null,
      blockedReason,
    });
  }

  const costEventCount = costRows.reduce((sum, row) => sum + numericValue(row.event_count), 0);
  const subscriptionEventCount = costRows.reduce((sum, row) => sum + numericValue(row.subscription_events), 0);
  const unknownEventCount = costRows.reduce((sum, row) => sum + numericValue(row.unknown_events), 0);
  const reportedCostCents = costRows.reduce((sum, row) => sum + (row.cost_cents == null ? 0 : numericValue(row.cost_cents)), 0);
  const costCoverage = costEventCount === 0
    ? "none"
    : subscriptionEventCount === costEventCount
      ? "subscription"
      : unknownEventCount > 0 && reportedCostCents === 0
        ? "unknown"
        : "reported";
  const activeWorkflowRuns = workflowRuns.filter((run) => activeWorkflowStatuses.has(run.status));
  const completedProjects = projectRows.filter((project) => project.runStatus === "completed" || ["completed", "done"].includes(project.status)).length;
  const activeProjects = projectRows.filter((project) => project.runStatus && activeWorkflowStatuses.has(project.runStatus)).length;
  const runningAgents = agentRows.filter((agent) => agent.currentRunId || ["running", "busy"].includes(agent.status)).length;
  const recentRuns: IntelligenceRunRow[] = runRows.slice(0, 30).map((row) => ({
    id: row.id,
    agentId: row.agent_id,
    agentName: row.agent_name,
    projectId: row.project_id,
    projectName: row.project_name,
    issueId: row.issue_id,
    issueIdentifier: row.issue_identifier,
    status: row.status,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    durationMs: durationMs(row.started_at, row.finished_at, now),
    errorCode: row.error_code,
    error: row.error,
  }));

  return {
    companyId,
    range,
    generatedAt: new Date(now).toISOString(),
    kpis: {
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      runningAgents,
      totalAgents: agents.length,
      activeWorkflowRuns: activeWorkflowRuns.length,
      tasksInProgress: issues.filter((issue) => issue.status === "in_progress").length,
      failedRuns,
      pendingApprovals: approvals.length,
      totalRuns: runRows.length,
      successfulRuns,
      eligibleTerminalRuns,
      totalRuntimeMs: validRuntimeCount > 0 ? totalRuntimeMs : null,
      totalTokens: tokenCount > 0 ? totalTokens : null,
      reportedCostCents: costEventCount > 0 ? reportedCostCents : null,
      costCoverage,
    },
    agents: agentRows,
    projects: projectRows,
    recentRuns,
    daily: [...dailyMap.values()].sort((a, b) => a.date.localeCompare(b.date)),
    dataQuality: {
      runRowsSampled: runRows.length,
      costsAvailable: costEventCount > 0,
      qualityMetricsAvailable: false,
      note: "Reliability and runtime use recorded heartbeat timestamps. Acceptance quality, reopened work, and idle time are not inferred without source evidence.",
    },
  };
}

export function validateGraph(workflow: WorkflowDefinition): ValidationResult {
  const issues: ValidationIssue[] = [];
  const nodeIds = new Set<string>();
  if (workflow.nodes.length === 0) {
    issues.push({ level: "error", code: "empty_graph", message: "Workflow must contain at least one node." });
  }
  for (const node of workflow.nodes) {
    if (nodeIds.has(node.id)) issues.push({ level: "error", code: "duplicate_node", message: `Duplicate node ${node.id}`, nodeId: node.id });
    nodeIds.add(node.id);
    if (!node.data.title.trim()) issues.push({ level: "error", code: "missing_title", message: "Node title is required", nodeId: node.id });
    if (node.data.kind === "task" && !node.data.agentId) {
      issues.push({ level: "error", code: "missing_agent", message: `${node.data.title} has no Paperclip agent assigned`, nodeId: node.id });
    }
    if (node.data.kind === "task" && node.data.executionPolicy !== "paperclip") {
      issues.push({ level: "error", code: "invalid_task_policy", message: `${node.data.title} must use Paperclip execution policy.`, nodeId: node.id });
    }
    if (node.data.kind === "approval" && node.data.executionPolicy !== "human") {
      issues.push({ level: "error", code: "invalid_approval_policy", message: `${node.data.title} must use human approval policy.`, nodeId: node.id });
    }
    if (node.data.kind === "condition") {
      issues.push({ level: "error", code: "condition_not_executable", message: `${node.data.title} uses conditional branching, which has no trusted backend evaluator yet. Publishing is refused.`, nodeId: node.id });
    }
  }

  const pairs = new Set<string>();
  const adjacency = new Map<string, string[]>();
  const indegree = new Map<string, number>();
  for (const id of nodeIds) {
    adjacency.set(id, []);
    indegree.set(id, 0);
  }
  for (const edge of workflow.edges) {
    const pair = `${edge.source}->${edge.target}`;
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      issues.push({ level: "error", code: "missing_reference", message: "Edge references a missing node", edgeId: edge.id });
      continue;
    }
    if (edge.source === edge.target) issues.push({ level: "error", code: "self_dependency", message: "A node cannot depend on itself", edgeId: edge.id });
    if (pairs.has(pair)) issues.push({ level: "error", code: "duplicate_dependency", message: "Duplicate dependency", edgeId: edge.id });
    pairs.add(pair);
    adjacency.get(edge.source)?.push(edge.target);
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  }

  const queue = [...indegree.entries()].filter(([, degree]) => degree === 0).map(([id]) => id);
  let visited = 0;
  while (queue.length > 0) {
    const id = queue.shift()!;
    visited += 1;
    for (const target of adjacency.get(id) ?? []) {
      const next = (indegree.get(target) ?? 0) - 1;
      indegree.set(target, next);
      if (next === 0) queue.push(target);
    }
  }
  if (visited !== nodeIds.size) issues.push({ level: "error", code: "cycle", message: "Workflow contains a circular dependency" });
  const starts = workflow.nodes.filter((node) => node.data.kind === "start");
  const ends = workflow.nodes.filter((node) => node.data.kind === "end");
  if (starts.length !== 1) issues.push({ level: "error", code: "invalid_start_count", message: `Workflow must contain exactly one Start node (found ${starts.length}).` });
  if (ends.length !== 1) issues.push({ level: "error", code: "invalid_end_count", message: `Workflow must contain exactly one End node (found ${ends.length}).` });
  if (starts.length === 1 && workflow.edges.some((edge) => edge.target === starts[0].id)) {
    issues.push({ level: "error", code: "start_has_predecessor", message: "Start node cannot have incoming dependencies.", nodeId: starts[0].id });
  }
  if (ends.length === 1 && workflow.edges.some((edge) => edge.source === ends[0].id)) {
    issues.push({ level: "error", code: "end_has_successor", message: "End node cannot have outgoing dependencies.", nodeId: ends[0].id });
  }
  return { valid: !issues.some((issue) => issue.level === "error"), issues };
}

function normalize(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const ROLE_TERMS: Record<string, string[]> = {
  "project-manager": ["project manager", "manager"],
  architect: ["architect", "architecture"],
  "ui-ux-designer": ["ui ux", "designer", "design"],
  "backend-developer": ["backend", "back end"],
  "frontend-developer": ["frontend", "front end"],
  "code-reviewer": ["reviewer", "code review"],
  tester: ["tester", "qa", "quality"],
  devops: ["devops", "deployment", "platform"]
};

function matchAgent(agents: Agent[], requiredRole: string): Agent | null {
  const terms = ROLE_TERMS[requiredRole] ?? [requiredRole];
  return agents.find((agent) => {
    const haystack = normalize(`${agent.role} ${agent.title ?? ""} ${agent.name}`);
    return terms.some((term) => haystack.includes(normalize(term)));
  }) ?? null;
}

function nodeData(kind: WorkflowNodeData["kind"], title: string, description: string, agent: Agent | null, requiredRole: string | null = null): WorkflowNodeData {
  const model = typeof agent?.adapterConfig?.model === "string" ? agent.adapterConfig.model : null;
  return {
    kind,
    title,
    description,
    issueId: null,
    issueIdentifier: null,
    agentId: agent?.id ?? null,
    agentName: agent?.name ?? null,
    agentRole: agent?.title ?? agent?.role ?? null,
    status: "draft",
    priority: "medium",
    executionPolicy: kind === "approval" ? "human" : kind === "task" ? "paperclip" : "visual-only",
    requiredRole,
    model
  };
}

function templateNode(id: string, x: number, y: number, data: WorkflowNodeData): WorkflowNode {
  return { id, type: "workflowNode", position: { x, y }, data };
}

export function createLifecycleTemplate(companyId: string, agents: Agent[]): WorkflowDefinition {
  const agent = (role: string) => matchAgent(agents, role);
  const now = new Date().toISOString();
  const nodes: WorkflowNode[] = [
    templateNode("start", 0, 180, nodeData("start", "Submit requirement", "Product Owner provides the accepted requirement.", null)),
    templateNode("pm", 260, 180, nodeData("task", "Analyze and plan", "Turn the requirement into scope, acceptance criteria, and an execution plan.", agent("project-manager"), "project-manager")),
    templateNode("architect", 540, 180, nodeData("task", "Design architecture", "Define system boundaries, data contracts, and implementation constraints.", agent("architect"), "architect")),
    templateNode("parallel", 820, 180, nodeData("parallel", "Parallel implementation", "Backend and interface design can proceed independently.", null)),
    templateNode("uiux", 1080, 40, nodeData("task", "Design interface", "Specify user flows, layout, states, and interaction behavior.", agent("ui-ux-designer"), "ui-ux-designer")),
    templateNode("backend", 1080, 320, nodeData("task", "Implement APIs", "Implement backend behavior, persistence, and trusted tests.", agent("backend-developer"), "backend-developer")),
    templateNode("frontend", 1360, 40, nodeData("task", "Implement frontend", "Build the interface against the approved UX and API contracts.", agent("frontend-developer"), "frontend-developer")),
    templateNode("join", 1640, 180, nodeData("join", "Development complete", "Wait for frontend and backend implementation.", null)),
    templateNode("review", 1900, 180, nodeData("task", "Review code", "Review the candidate changes against acceptance criteria.", agent("code-reviewer"), "code-reviewer")),
    templateNode("test", 2180, 180, nodeData("task", "Test application", "Run regression tests and verify the accepted behavior.", agent("tester"), "tester")),
    templateNode("deploy", 2460, 180, nodeData("task", "Deploy", "Build and deploy only after verification succeeds.", agent("devops"), "devops")),
    templateNode("approval", 2740, 180, nodeData("approval", "Final approval", "Product Owner reviews and explicitly completes the approval task.", null)),
    templateNode("end", 3020, 180, nodeData("end", "Workflow complete", "All required Paperclip issues have reached their terminal conditions.", null))
  ];
  const pairs = [
    ["start", "pm"], ["pm", "architect"], ["architect", "parallel"], ["parallel", "uiux"], ["parallel", "backend"],
    ["uiux", "frontend"], ["backend", "frontend"], ["backend", "join"], ["frontend", "join"], ["join", "review"],
    ["review", "test"], ["test", "deploy"], ["deploy", "approval"], ["approval", "end"]
  ];
  const edges: WorkflowEdge[] = pairs.map(([source, target]) => ({ id: `${source}-${target}`, source, target, type: "smoothstep" }));
  return {
    id: randomUUID(), companyId, projectId: null, name: "AI Software Development Lifecycle",
    description: "Paperclip-native delivery workflow for the eight AI agent software team.",
    version: 1, status: "draft", nodes, edges, viewport: { x: 0, y: 0, zoom: 0.72 },
    layout: { direction: "LR", compact: false }, publishedIssueIds: [], publishedDependencies: {},
    createdAt: now, updatedAt: now, publishedAt: null
  };
}

function asWorkflow(value: unknown): WorkflowDefinition {
  if (!value || typeof value !== "object") throw new Error("workflow payload is required");
  return value as WorkflowDefinition;
}

async function saveDraft(ctx: PluginContext, companyId: string, submitted: WorkflowDefinition, expectedVersion: number): Promise<WorkflowDefinition> {
  if (submitted.companyId !== companyId) throw new Error("Workflow company does not match the active company");
  const current = await readWorkflow(ctx, companyId, submitted.id);
  if (current && current.version !== expectedVersion) {
    throw new Error(`Version conflict. Server is at version ${current.version}; reload before saving.`);
  }
  const now = new Date().toISOString();
  const next: WorkflowDefinition = {
    ...submitted,
    projectId: null,
    status: "draft",
    version: current ? current.version + 1 : 1,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
    publishedAt: null,
    nodes: submitted.nodes.map((node) => ({ ...node, data: { ...node.data, issueId: null, issueIdentifier: null, issueIds: [], status: "draft" } })),
    publishedIssueIds: [],
    publishedDependencies: {}
  };
  await persistWorkflow(ctx, next);
  return next;
}

function taskNodes(workflow: WorkflowDefinition): WorkflowNode[] {
  return workflow.nodes.filter((node) => node.data.kind === "task" || node.data.kind === "approval");
}

function stateIssueIds(state: NodeExecutionState | undefined): string[] {
  if (!state) return [];
  return [...new Set(state.issueIds.length > 0 ? state.issueIds : (state.issueId ? [state.issueId] : []))];
}

function isRunGeneratedIssue(issue: unknown): boolean {
  const value = issue as { originKind?: string | null; originId?: string | null } | null;
  return value?.originKind === "plugin:ai-company-workflow-studio"
    && typeof value.originId === "string"
    && value.originId.startsWith("workflow-run:");
}

function entryTaskNode(workflow: WorkflowDefinition): WorkflowNode | null {
  const incoming = new Map<string, string[]>();
  for (const node of workflow.nodes) incoming.set(node.id, []);
  for (const edge of workflow.edges) incoming.get(edge.target)?.push(edge.source);
  const byId = new Map(workflow.nodes.map((node) => [node.id, node]));
  const candidates = taskNodes(workflow).filter((node) => {
    const parents = incoming.get(node.id) ?? [];
    return parents.length === 0 || parents.every((id) => {
      const kind = byId.get(id)?.data.kind;
      return kind === "start" || kind === "parallel" || kind === "join" || kind === "condition";
    });
  });
  return candidates.find((node) => node.data.requiredRole === "project-manager") ?? candidates[0] ?? null;
}

function desiredDependencies(workflow: WorkflowDefinition): Record<string, string[]> {
  const byId = new Map(workflow.nodes.map((node) => [node.id, node]));
  const incoming = new Map<string, string[]>();
  for (const node of workflow.nodes) incoming.set(node.id, []);
  for (const edge of workflow.edges) incoming.get(edge.target)?.push(edge.source);
  const result: Record<string, string[]> = {};

  function upstreamIssueIds(nodeId: string, seen = new Set<string>()): string[] {
    if (seen.has(nodeId)) return [];
    seen.add(nodeId);
    const node = byId.get(nodeId);
    if (!node) return [];
    if (node.data.issueId) return [node.data.issueId];
    return (incoming.get(nodeId) ?? []).flatMap((parentId) => upstreamIssueIds(parentId, seen));
  }

  for (const node of taskNodes(workflow)) {
    if (!node.data.issueId) continue;
    result[node.data.issueId] = [...new Set((incoming.get(node.id) ?? []).flatMap((parentId) => upstreamIssueIds(parentId)))];
  }
  return result;
}

async function monitorWorkflow(ctx: PluginContext, workflow: WorkflowDefinition, run?: WorkflowRunRecord | null): Promise<MonitorNode[]> {
  return await Promise.all(workflow.nodes.map(async (node): Promise<MonitorNode> => {
    const state = run?.nodeExecutionStates[node.id];
    const issueIds = stateIssueIds(state).length > 0
      ? stateIssueIds(state)
      : [...new Set([...(node.data.issueId ? [node.data.issueId] : []), ...(node.data.issueIds ?? [])])];
    const issues = (await Promise.all(issueIds.map((id) => ctx.issues.get(id, workflow.companyId))))
      .filter(Boolean) as unknown as PaperclipIssue[];
    const runs: MonitorNode["runs"] = [];
    const blockedBy: MonitorNode["blockedBy"] = [];
    for (const issue of issues) {
      try {
        const relations = await ctx.issues.relations.get(issue.id, workflow.companyId);
        for (const blocker of relations.blockedBy) {
          if (!blockedBy.some((item) => item.id === blocker.id)) blockedBy.push(blocker);
        }
      } catch { /* transient monitor read */ }
      try {
        const summary = await ctx.issues.summaries.getOrchestration({ issueId: issue.id, companyId: workflow.companyId, includeSubtree: false });
        runs.push(...summary.runs.map((item) => ({
          id: item.id, status: item.status, startedAt: item.startedAt, finishedAt: item.finishedAt,
          error: item.error, agentId: item.agentId
        })));
      } catch { /* transient monitor read */ }
    }
    const completedTaskCount = issues.filter((issue) => issue.status === "done").length;
    const startedAt = state?.startedAt ? Date.parse(state.startedAt) : NaN;
    const finishedAt = state?.finishedAt ? Date.parse(state.finishedAt) : NaN;
    return {
      nodeId: node.id,
      issue: issues.find((item) => !state?.isCoordinator && item.id !== state?.issueId) ?? issues[0] ?? null,
      issues,
      blockedBy,
      runs,
      stageTitle: state?.title ?? node.data.title,
      stageStatus: state?.status,
      agentId: state?.agentId ?? node.data.agentId,
      agentName: state?.agentName ?? node.data.agentName,
      taskCount: issues.length,
      completedTaskCount,
      dependencyNodeIds: state?.blockedByNodeIds ?? [],
      elapsedMs: Number.isFinite(startedAt) ? Math.max(0, (Number.isFinite(finishedAt) ? finishedAt : Date.now()) - startedAt) : null
    };
  }));
}

type StageTaskInput = {
  taskKey: string;
  title: string;
  description?: string;
  priority?: string;
  assigneeAgentId?: string | null;
};

async function createStageExecutionTasks(
  ctx: PluginContext,
  companyId: string,
  runId: string,
  nodeId: string,
  rawTasks: unknown,
  actor: { actorUserId?: string | null; actorAgentId?: string | null; actorRunId?: string | null }
) {
  const run = await readRun(ctx, companyId, runId);
  if (!run || !["running", "waiting_approval", "paused"].includes(run.status)) {
    throw new Error("Execution tasks can only be created for an active Workflow Run.");
  }
  const state = run.nodeExecutionStates[nodeId];
  const stage = run.workflowSnapshot.nodes.find((node) => node.id === nodeId);
  if (!state || !stage || stage.data.kind !== "task") throw new Error("Target workflow stage must be an AI task node.");
  if (state.isCoordinator) throw new Error("The coordinator stage is not a business execution stage.");
  if (actor.actorAgentId && actor.actorAgentId !== run.projectManagerAgentId) {
    throw new Error("Only the AI Project Manager assigned to this Workflow Run may create execution tasks.");
  }
  if (!Array.isArray(rawTasks) || rawTasks.length === 0) throw new Error("tasks must contain at least one execution task.");
  if (rawTasks.length > 50) throw new Error("A single stage may receive at most 50 execution tasks.");

  const tasks: StageTaskInput[] = rawTasks.map((item, index) => {
    if (!item || typeof item !== "object") throw new Error(`tasks[${index}] must be an object.`);
    const value = item as Record<string, unknown>;
    const taskKey = requiredString(value.taskKey, `tasks[${index}].taskKey`);
    const title = requiredString(value.title, `tasks[${index}].title`);
    if (taskKey.length > 120 || title.length > 240) throw new Error(`tasks[${index}] exceeds the allowed length.`);
    const assigneeAgentId = optionalString(value.assigneeAgentId);
    if (assigneeAgentId && assigneeAgentId !== state.agentId) {
      throw new Error(`Task ${taskKey} must use the agent assigned to stage "${state.title}".`);
    }
    return {
      taskKey,
      title,
      description: typeof value.description === "string" ? value.description : undefined,
      priority: typeof value.priority === "string" ? value.priority : undefined,
      assigneeAgentId
    };
  });
  if (new Set(tasks.map((task) => task.taskKey)).size !== tasks.length) {
    throw new Error("taskKey must be unique within a stage request.");
  }

  const mappings = run.taskMappings ?? (run.taskMappings = []);
  const existingKeys = new Set(mappings.filter((item) => item.workflowRunId === runId && item.workflowNodeId === nodeId).map((item) => item.taskKey));
  const predecessorIssueIds = state.blockedByNodeIds.flatMap((predecessorId) => stateIssueIds(run.nodeExecutionStates[predecessorId]));
  const predecessorDone = state.blockedByNodeIds.every((predecessorId) => run.nodeExecutionStates[predecessorId]?.status === "done");
  const created: Array<{ taskKey: string; issue: PaperclipIssue; mapping: WorkflowTaskMapping; idempotent: boolean }> = [];
  for (const task of tasks) {
    const existing = mappings.find((item) => item.workflowRunId === runId && item.workflowNodeId === nodeId && item.taskKey === task.taskKey);
    if (existing) {
      const issue = await ctx.issues.get(existing.issueId, companyId);
      if (issue) created.push({ taskKey: task.taskKey, issue: issue as unknown as PaperclipIssue, mapping: existing, idempotent: true });
      continue;
    }
    if (existingKeys.has(task.taskKey)) continue;
    const issue = await ctx.issues.create({
      companyId,
      projectId: run.projectId,
      title: task.title,
      description: task.description ?? `Execution task for workflow stage "${state.title}".\n\nRun: ${runId}`,
      status: predecessorDone ? "todo" : "backlog",
      priority: (task.priority ?? stage.data.priority) as Issue["priority"],
      assigneeAgentId: task.assigneeAgentId ?? state.agentId ?? undefined,
      originKind: "plugin:ai-company-workflow-studio",
      originId: `workflow-run:${runId}:node:${nodeId}:task:${task.taskKey}`,
      originRunId: runId,
      blockedByIssueIds: predecessorIssueIds,
      actor
    });
    const mapping: WorkflowTaskMapping = {
      companyId,
      projectId: run.projectId,
      workflowRunId: runId,
      workflowNodeId: nodeId,
      stageId: nodeId,
      issueId: issue.id,
      assigneeAgentId: issue.assigneeAgentId ?? state.agentId,
      taskKey: task.taskKey,
      createdAt: new Date().toISOString()
    };
    mappings.push(mapping);
    if (!state.issueIds.includes(issue.id)) state.issueIds.push(issue.id);
    if (issue.identifier && !state.issueIdentifiers.includes(issue.identifier)) state.issueIdentifiers.push(issue.identifier);
    if (!state.issueId) {
      state.issueId = issue.id;
      state.issueIdentifier = issue.identifier ?? null;
    }
    if (!run.relatedIssueIds.includes(issue.id)) run.relatedIssueIds.push(issue.id);
    created.push({ taskKey: task.taskKey, issue: issue as unknown as PaperclipIssue, mapping, idempotent: false });
  }
  if (state.status === "blocked" && predecessorDone && state.issueIds.length > 0) {
    state.status = "ready";
    state.lastGateCode = "TASKS_MAPPED";
    state.lastGateReason = "Execution tasks mapped; stage will dispatch only after all predecessor stages are done.";
  }
  const now = new Date().toISOString();
  run.updatedAt = now;
  run.executionHistory.push({
    id: randomUUID(), timestamp: now, level: "tool",
    message: `Mapped ${created.length} execution task(s) to stage "${state.title}". Existing task keys were reused idempotently.`,
    nodeId,
    agentId: actor.actorAgentId ?? undefined,
    payload: { taskKeys: created.map((item) => item.taskKey), predecessorDone }
  });
  await persistRun(ctx, run);
  return { workflowRunId: runId, workflowNodeId: nodeId, stage: state.title, tasks: created };
}

async function publishWorkflowInstance(
  ctx: PluginContext,
  companyId: string,
  current: WorkflowDefinition,
  expectedVersion: number,
  actionContext: PluginPerformActionContext,
  persist: (workflow: WorkflowDefinition) => Promise<void>
): Promise<{ workflow: WorkflowDefinition; operations: Array<Record<string, unknown>>; monitor: MonitorNode[] }> {
  if (current.version !== expectedVersion) throw new Error(`Version conflict. Server is at version ${current.version}.`);
  const validation = validateGraph(current);
  if (!validation.valid) throw new Error(validation.issues.filter((item) => item.level === "error").map((item) => item.message).join("; "));
  if (!current.projectId) throw new Error("Select a Paperclip project before publishing");

  const working: WorkflowDefinition = structuredClone(current);
  const operations: Array<Record<string, unknown>> = [];
  const actor = {
    actorUserId: actionContext.actor.userId,
    actorAgentId: actionContext.actor.agentId,
    actorRunId: actionContext.actor.runId
  };

  // Publishing stores the executable graph only. It must never materialize a
  // fixed set of project tasks. The AI Project Manager creates execution
  // tasks when a Product Owner starts a run, using the requirement as input.
  for (const node of taskNodes(working)) {
    if (!node.data.issueId) continue;
    const issue = await ctx.issues.get(node.data.issueId, companyId);
    if (!issue) throw new Error(`Linked issue for ${node.data.title} no longer exists`);
    if (issue.projectId !== working.projectId) throw new Error(`${issue.identifier ?? issue.id} belongs to another project`);
    if (issue.status === "in_progress") throw new Error(`${issue.identifier ?? issue.id} is running. Dependency edits are blocked until it stops.`);
    node.data.status = issue.status;
    node.data.issueIdentifier = issue.identifier;
  }

  const desired = desiredDependencies(working);
  const originals = new Map<string, string[]>();
  try {
    for (const [issueId, desiredBlockers] of Object.entries(desired)) {
      const issue = await ctx.issues.get(issueId, companyId);
      if (!issue) throw new Error(`Issue ${issueId} disappeared during publish`);
      if (issue.status === "in_progress") throw new Error(`${issue.identifier ?? issue.id} started running during publish`);
      const latest = await ctx.issues.relations.get(issueId, companyId);
      const currentIds = latest.blockedBy.map((item) => item.id);
      originals.set(issueId, currentIds);
      const previouslyOwned = new Set(current.publishedDependencies[issueId] ?? []);
      const external = currentIds.filter((id) => !previouslyOwned.has(id));
      const nextIds = [...new Set([...external, ...desiredBlockers])];
      await ctx.issues.relations.setBlockedBy(issueId, nextIds, companyId, actor);
      const verified = await ctx.issues.relations.get(issueId, companyId);
      const verifiedIds = verified.blockedBy.map((item) => item.id).sort();
      if (JSON.stringify(verifiedIds) !== JSON.stringify([...nextIds].sort())) throw new Error(`Dependency verification failed for ${issue.identifier ?? issue.id}`);
      operations.push({ type: "dependencies.updated", issueId, blockers: nextIds, ok: true });
    }
  } catch (error) {
    for (const [issueId, blockerIds] of originals) {
      try {
        await ctx.issues.relations.setBlockedBy(issueId, blockerIds, companyId, actor);
        operations.push({ type: "dependencies.rolled_back", issueId, ok: true });
      } catch (rollbackError) {
        operations.push({ type: "dependencies.rollback_failed", issueId, ok: false, error: String(rollbackError) });
      }
    }
    throw new Error(`Publish stopped and attempted rollback: ${error instanceof Error ? error.message : String(error)}`);
  }

  const now = new Date().toISOString();
  working.status = "published";
  working.version = current.version + 1;
  working.updatedAt = now;
  working.publishedAt = now;
  working.publishedIssueIds = taskNodes(working).flatMap((node) => node.data.issueId ? [node.data.issueId] : []);
  working.publishedDependencies = desired;
  await persist(working);
  await ctx.activity.log({
    companyId,
    message: `Published workflow ${working.name}`,
    entityType: "workflow",
    entityId: working.id,
    metadata: { action: "workflow.published", version: working.version, issueCount: working.publishedIssueIds.length, dependencyCount: Object.values(desired).flat().length }
  });
  return { workflow: working, operations, monitor: await monitorWorkflow(ctx, working) };
}

async function publishWorkflow(
  ctx: PluginContext,
  companyId: string,
  workflowId: string,
  expectedVersion: number,
  actionContext: PluginPerformActionContext
) {
  const current = await readWorkflow(ctx, companyId, workflowId);
  if (!current) throw new Error("Workflow not found");
  return publishWorkflowInstance(ctx, companyId, current, expectedVersion, actionContext, (workflow) => persistWorkflow(ctx, workflow));
}

function asMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function checkPreflight(
  ctx: PluginContext,
  companyId: string,
  projectId: string,
  workflow: WorkflowDefinition
): Promise<PreflightCheckResult> {
  const checks: PreflightCheckItem[] = [];
  const project = await ctx.projects.get(projectId, companyId);
  const agents = await ctx.agents.list({ companyId, limit: 200, offset: 0 });
  const agentMap = new Map(agents.map((a) => [a.id, a]));

  if (!project) {
    checks.push({ key: "project_workspace", name: "Project Workspace", status: "fail", message: "Project not found or inaccessible." });
  } else {
    checks.push({ key: "project_workspace", name: "Project Workspace", status: "pass", message: `Project "${project.name}" is ready.` });
  }

  const taskAndApprovalNodes = workflow.nodes.filter((n) => n.data.kind === "task" || n.data.kind === "approval");
  const missingAgents = taskAndApprovalNodes.filter((n) => n.data.kind === "task" && !n.data.agentId);
  if (missingAgents.length > 0) {
    checks.push({
      key: "agent_assignments",
      name: "Agent Assignments",
      status: "fail",
      message: `${missingAgents.length} task node(s) have no AI agent assigned: ${missingAgents.map((n) => n.data.title).join(", ")}.`
    });
  } else {
    checks.push({
      key: "agent_assignments",
      name: "Agent Assignments",
      status: "pass",
      message: `All ${taskAndApprovalNodes.length} workflow steps have valid assignees.`
    });
  }

  const assignedAgentIds = [...new Set(taskAndApprovalNodes.map((n) => n.data.agentId).filter(Boolean))] as string[];
  const unconfiguredAgents = assignedAgentIds.filter((id) => {
    const ag = agentMap.get(id);
    return !ag || ag.status === "terminated";
  });
  if (unconfiguredAgents.length > 0) {
    checks.push({
      key: "model_harness",
      name: "Model / Harness",
      status: "fail",
      message: `${unconfiguredAgents.length} assigned agent(s) are inactive or terminated.`
    });
  } else {
    checks.push({
      key: "model_harness",
      name: "Model / Harness",
      status: "pass",
      message: `All ${assignedAgentIds.length} assigned AI agents are active and configured with runtime models.`
    });
  }

  const validation = validateGraph(workflow);
  const cycleIssue = validation.issues.find((i) => i.code === "cycle");
  if (cycleIssue) {
    checks.push({ key: "cycle_check", name: "Graph Cycle Check", status: "fail", message: cycleIssue.message });
  } else {
    checks.push({ key: "cycle_check", name: "Graph Cycle Check", status: "pass", message: "Workflow DAG is strictly acyclic." });
  }

  const depErrors = validation.issues.filter((i) => i.level === "error" && i.code !== "cycle");
  if (depErrors.length > 0) {
    checks.push({ key: "dependencies", name: "Dependency Verification", status: "fail", message: depErrors.map((i) => i.message).join("; ") });
  } else {
    checks.push({ key: "dependencies", name: "Dependency Verification", status: "pass", message: `${workflow.edges.length} execution dependency edges verified.` });
  }

  const visualOnlyTasks = workflow.nodes.filter((n) => n.data.kind === "task" && n.data.executionPolicy === "visual-only");
  if (visualOnlyTasks.length > 0) {
    checks.push({
      key: "unlinked_tasks",
      name: "Executable Task Mapping",
      status: "warn",
      message: `${visualOnlyTasks.length} task(s) marked visual-only will be mapped to Paperclip execution.`
    });
  } else {
    checks.push({
      key: "unlinked_tasks",
      name: "Executable Task Mapping",
      status: "pass",
      message: "All task nodes have valid execution semantics."
    });
  }

  const approvalNodes = workflow.nodes.filter((n) => n.data.kind === "approval");
  if (approvalNodes.length > 0) {
    checks.push({
      key: "approval_gates",
      name: "Approval Gates",
      status: "pass",
      message: `${approvalNodes.length} human approval gate(s) configured (${approvalNodes.map((n) => n.data.title).join(", ")}).`
    });
  } else {
    checks.push({
      key: "approval_gates",
      name: "Approval Gates",
      status: "warn",
      message: "No human approval gates in this workflow. Execution will proceed directly to completion."
    });
  }

  const ok = !checks.some((c) => c.status === "fail");
  return { ok, checks };
}

async function startProjectWorkflow(
  ctx: PluginContext,
  companyId: string,
  projectId: string,
  workflowId: string,
  inputRequirement: string,
  settings: WorkflowRunSettings,
  actionContext: PluginPerformActionContext
): Promise<{ run: WorkflowRunRecord }> {
  if (!inputRequirement || !inputRequirement.trim()) {
    throw new Error("Initial requirement from Product Owner is required to start workflow.");
  }
  const cleanReq = inputRequirement.trim();

  const project = await ctx.projects.get(projectId, companyId);
  if (!project) throw new Error("Project not found");

  let workflow = await readWorkflow(ctx, companyId, workflowId);
  if (!workflow) {
    const binding = await readProjectBinding(ctx, projectId);
    if (binding && binding.workflow.id === workflowId) {
      workflow = binding.workflow;
    }
  }
  if (!workflow) throw new Error("Workflow not found");

  const preflight = await checkPreflight(ctx, companyId, projectId, workflow);
  if (!preflight.ok) {
    const failures = preflight.checks.filter((c) => c.status === "fail").map((c) => c.message).join("; ");
    throw new Error(`Preflight check failed: ${failures}`);
  }

  const runs = await readRunsIndex(ctx, companyId);
  const activeExisting = runs.find((r) =>
    r.projectId === projectId && ["pending", "running", "waiting_approval", "paused"].includes(r.status)
  );
  if (activeExisting) {
    throw new Error(`Project "${project.name}" already has an active workflow run (${activeExisting.id}). Pause or stop the active run before starting a new one.`);
  }

  if (workflow.status !== "published" || workflow.projectId !== projectId) {
    const instance: WorkflowDefinition = {
      ...structuredClone(workflow),
      projectId,
      id: randomUUID()
    };
    const pubResult = await publishWorkflowInstance(
      ctx,
      companyId,
      instance,
      instance.version,
      actionContext,
      async (w) => {
        await persistProjectBinding(ctx, {
          projectId,
          templateId: workflow!.id,
          templateName: workflow!.name,
          templateVersion: workflow!.version,
          workflow: w,
          attachedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    );
    workflow = pubResult.workflow;
  }

  // A workflow definition is not a task backlog. Starting a run creates only
  // an optional coordinator issue for the entry Project Manager stage; the PM
  // creates real execution tasks through create-execution-tasks after reading
  // the Product Owner requirement.
  const executionActor = {
    actorUserId: actionContext.actor.userId,
    actorAgentId: actionContext.actor.agentId,
    actorRunId: actionContext.actor.runId
  };
  const runId = `run_${Date.now().toString(36)}_${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  const maxConcurrent = Math.max(1, Math.min(8, Number(settings?.maxConcurrentAgents) || 2));
  const runSettings: WorkflowRunSettings = {
    maxConcurrentAgents: maxConcurrent,
    approvalMode: settings?.approvalMode ?? "require_approval",
    failurePolicy: settings?.failurePolicy ?? "pause_and_report",
    retryPolicy: settings?.retryPolicy ?? "bounded",
    maxRetries: Number(settings?.maxRetries) || 3
  };

  const incomingMap = new Map<string, string[]>();
  for (const n of workflow.nodes) incomingMap.set(n.id, []);
  for (const e of workflow.edges) incomingMap.get(e.target)?.push(e.source);

  // Existing workflow snapshots may contain issues created by the previous
  // fixed-node implementation. Keep those Issues untouched, but do not reuse
  // them as business tasks in a new run.
  const legacyIssueIdsByNode = new Map<string, string[]>();
  for (const node of workflow.nodes) {
    const candidateIds = [...new Set([...(node.data.issueId ? [node.data.issueId] : []), ...(node.data.issueIds ?? [])])];
    const validIds: string[] = [];
    for (const issueId of candidateIds) {
      const issue = await ctx.issues.get(issueId, companyId);
      if (issue && !isRunGeneratedIssue(issue)) validIds.push(issueId);
    }
    legacyIssueIdsByNode.set(node.id, validIds);
  }

  const coordinatorNode = entryTaskNode(workflow);
  const coordinatorIssueIds: string[] = [];
  const taskMappings: WorkflowTaskMapping[] = [];
  if (coordinatorNode?.data.agentId) {
    const coordinator = await ctx.issues.create({
      companyId,
      projectId,
      title: `Plan execution tasks: ${cleanReq.slice(0, 96)}`,
      description: [
        "You are the AI Project Manager coordinator for this Workflow Run.",
        `Workflow Run: ${runId}`,
        `Workflow Stage: ${coordinatorNode.id} (${coordinatorNode.data.title})`,
        "Analyze the Product Owner requirement and call the create-execution-tasks tool with the concrete work items for this stage.",
        "Do not create parent/child issues and do not create tasks for future stages."
      ].join("\n"),
      status: "todo",
      priority: coordinatorNode.data.priority as Issue["priority"],
      assigneeAgentId: coordinatorNode.data.agentId,
      originKind: "plugin:ai-company-workflow-studio",
      originId: `workflow-run:${runId}:coordinator:${coordinatorNode.id}`,
      originRunId: runId,
      actor: executionActor
    });
    coordinatorIssueIds.push(coordinator.id);
    taskMappings.push({
      companyId,
      projectId,
      workflowRunId: runId,
      workflowNodeId: coordinatorNode.id,
      stageId: coordinatorNode.id,
      issueId: coordinator.id,
      assigneeAgentId: coordinatorNode.data.agentId,
      taskKey: "__coordinator__",
      isCoordinator: true,
      createdAt: now
    });
  }

  const nodeExecutionStates: Record<string, NodeExecutionState> = {};
  for (const node of workflow.nodes) {
    const legacyIssueIds = legacyIssueIdsByNode.get(node.id) ?? [];
    const coordinatorIds = coordinatorNode?.id === node.id ? coordinatorIssueIds : [];
    const mappedIssueIds = [...new Set([...legacyIssueIds, ...coordinatorIds])];
    const primaryIssueId = mappedIssueIds[0] ?? null;
    const primaryIdentifier = mappedIssueIds.length > 0 ? (node.data.issueIdentifier ?? null) : null;
    nodeExecutionStates[node.id] = {
      nodeId: node.id,
      kind: node.data.kind,
      title: node.data.title,
      status: node.data.kind === "start" ? "done" : "pending",
      issueId: primaryIssueId,
      issueIdentifier: primaryIdentifier,
      issueIds: mappedIssueIds,
      issueIdentifiers: primaryIdentifier ? [primaryIdentifier] : [],
      completionPolicy: "all_required",
      isCoordinator: coordinatorIds.length > 0,
      agentId: node.data.agentId ?? null,
      agentName: node.data.agentName ?? null,
      agentRole: node.data.agentRole ?? null,
      startedAt: node.data.kind === "start" ? now : null,
      finishedAt: node.data.kind === "start" ? now : null,
      error: null,
      retryCount: 0,
      blockedByNodeIds: incomingMap.get(node.id) ?? [],
      lastGateCode: null,
      lastGateReason: null
    };
  }


  const history: WorkflowRunHistoryEntry[] = [
    {
      id: randomUUID(),
      timestamp: now,
      level: "action",
      message: `Workflow Run initialized by Product Owner for project "${project.name}". Requirement: "${cleanReq.slice(0, 80)}${cleanReq.length > 80 ? '...' : ''}"`
    },
    {
      id: randomUUID(),
      timestamp: now,
      level: "info",
      message: `Settings: Max Concurrent Agents: ${runSettings.maxConcurrentAgents}, Failure Policy: ${runSettings.failurePolicy}, Retry Policy: ${runSettings.retryPolicy}.`
    }
  ];

  const relatedIssueIds: string[] = [...new Set([
    ...[...legacyIssueIdsByNode.values()].flat(),
    ...coordinatorIssueIds
  ])];

  for (const node of workflow.nodes) {
    if (node.data.kind === "start") continue;
    const incoming = incomingMap.get(node.id) ?? [];
    const allPredDone = incoming.every((predId) => nodeExecutionStates[predId]?.status === "done");
    if (allPredDone) {
      if (node.data.kind === "task") {
        nodeExecutionStates[node.id].status = nodeExecutionStates[node.id].issueIds.length > 0 ? "ready" : "blocked";
        if (nodeExecutionStates[node.id].status === "blocked") {
          nodeExecutionStates[node.id].lastGateCode = "NO_STAGE_TASKS";
          nodeExecutionStates[node.id].lastGateReason = "Waiting for the AI Project Manager to create execution tasks for this stage.";
        }
      } else if (node.data.kind === "parallel") {
        nodeExecutionStates[node.id].status = "done";
        nodeExecutionStates[node.id].finishedAt = now;
      }
    }
  }

  const runRecord: WorkflowRunRecord = {
    id: runId,
    workflowId: workflow.id,
    workflowVersion: workflow.version,
    workflowName: workflow.name,
    projectId,
    projectName: project.name,
    companyId,
    initiatorUserId: actionContext.actor.userId ?? null,
    inputRequirement: cleanReq,
    status: "running",
    settings: runSettings,
    startedAt: now,
    finishedAt: null,
    pausedAt: null,
    nodeExecutionStates,
    relatedIssueIds,
    taskMappings,
    coordinatorIssueIds,
    projectManagerAgentId: coordinatorNode?.data.agentId ?? null,
    executionHistory: history,
    workflowSnapshot: structuredClone(workflow),
    currentStepTitle: "Starting workflow",
    updatedAt: now
  };

  await persistRun(ctx, runRecord);
  await ctx.activity.log({
    companyId,
    message: `Started project workflow "${workflow.name}" for "${project.name}" (Run ${runId})`,
    entityType: "workflow",
    entityId: workflow.id,
    metadata: { runId, projectId, requirement: cleanReq.slice(0, 100) }
  });

  // All dispatches, including the very first one, must pass through the same
  // server-side gate. Persist the immutable snapshot before requesting any
  // wakeup so an issue-scoped adapter can resolve ownership without a race.
  return stepWorkflowRun(ctx, companyId, runId, actionContext);
}

async function stepWorkflowRun(
  ctx: PluginContext,
  companyId: string,
  runId: string,
  actionContext?: PluginPerformActionContext
): Promise<{ run: WorkflowRunRecord }> {
  const run = await readRun(ctx, companyId, runId);
  if (!run) throw new Error(`Workflow run ${runId} not found`);

  if (run.status !== "running" && run.status !== "waiting_approval") {
    return { run };
  }

  const now = new Date().toISOString();
  let modified = false;

  // Idempotency: prevent duplicate wakeups within a single step call.
  const wokenInThisStep = new Set<string>();

  const incomingMap = new Map<string, string[]>();
  for (const n of run.workflowSnapshot.nodes) incomingMap.set(n.id, []);
  for (const e of run.workflowSnapshot.edges) incomingMap.get(e.target)?.push(e.source);

  // ── Phase 1: evaluate running nodes against real Paperclip issue statuses ──
  for (const node of run.workflowSnapshot.nodes) {
    const state = run.nodeExecutionStates[node.id];
    if (!state || state.status !== "running") continue;

    // Gather all issues for this node (multi-issue §14)
    const allIssueIds = state.issueIds.length > 0 ? state.issueIds : (state.issueId ? [state.issueId] : []);
    if (allIssueIds.length === 0) continue;

    try {
      const issueStatuses: string[] = [];
      for (const iid of allIssueIds) {
        const issue = await ctx.issues.get(iid, companyId);
        issueStatuses.push(issue?.status ?? "unknown");

        // Sync issue comments as agent execution history & artifacts
        try {
          const comments = await ctx.issues.listComments(iid, companyId);
          for (const c of comments) {
            const commentLogId = `comment-${c.id}`;
            if (!run.executionHistory.some((e) => e.id === commentLogId)) {
              const body = maskSecrets(c.body ?? "");
              const isTool = /tool|invoc|exec|cli/i.test(body);
              const isErr = /error|failed|exception/i.test(body);
              const commentTimestamp = c.createdAt instanceof Date ? c.createdAt.toISOString() : (c.createdAt ? String(c.createdAt) : now);
              run.executionHistory.push({
                id: commentLogId,
                timestamp: commentTimestamp,
                level: isErr ? "error" : isTool ? "tool" : "info",
                message: `[${issue?.identifier ?? iid}] ${body}`,
                nodeId: node.id,
                agentId: state.agentId ?? undefined,
                issueId: iid,
                stream: isErr ? "stderr" : "stdout"
              });
              modified = true;

              const commitMatch = body.match(/(?:commit|sha)[:\s]+([0-9a-f]{7,40})/i);
              if (commitMatch) {
                if (!run.artifacts) run.artifacts = [];
                if (!run.artifacts.some((a) => a.name.includes(commitMatch[1].slice(0, 7)))) {
                  run.artifacts.push({
                    id: randomUUID(),
                    type: "commit",
                    name: `Commit ${commitMatch[1].slice(0, 7)}`,
                    description: `Git commit from step "${state.title}"`,
                    nodeId: node.id,
                    issueId: iid,
                    createdAt: commentTimestamp
                  });
                }
              }
            }
          }
        } catch {
          // ignore transient comment read error
        }
      }

      const completion = evaluateNodeCompletion(issueStatuses, state.completionPolicy);

      if (completion.completed) {
        state.status = "done";
        state.finishedAt = now;
        modified = true;
        run.executionHistory.push({
          id: randomUUID(), timestamp: now, level: "info",
          message: `Step completed: "${state.title}" (${state.agentName ?? "Agent"}). ${completion.reason}`,
          nodeId: node.id, agentId: state.agentId ?? undefined, issueId: state.issueId ?? undefined
        });
      } else {
        // Check for failure across all issues
        const failedCount = issueStatuses.filter((s) => s === "cancelled" || s === "blocked").length;
        const doneCount = issueStatuses.filter((s) => s === "done").length;
        const allTerminal = doneCount + failedCount === issueStatuses.length;

        if (failedCount > 0 && allTerminal) {
          if (state.retryCount < (run.settings.maxRetries ?? 3) && run.settings.retryPolicy === "bounded") {
            state.retryCount += 1;
            state.status = "ready";
            modified = true;
            run.executionHistory.push({
              id: randomUUID(), timestamp: now, level: "warn",
              message: `Step "${state.title}" reported failure. Bounded retry ${state.retryCount}/${run.settings.maxRetries ?? 3}.`,
              nodeId: node.id, issueId: state.issueId ?? undefined
            });
          } else {
            state.status = "failed";
            state.error = `${failedCount} issue(s) ended in failure status. ${completion.reason}`;
            state.lastGateCode = "NODE_FAILED";
            state.lastGateReason = state.error;
            modified = true;
            if (run.settings.failurePolicy === "pause_and_report") {
              run.status = "paused";
              run.pausedAt = now;
            }
            run.executionHistory.push({
              id: randomUUID(), timestamp: now, level: "error",
              message: `Step "${state.title}" failed. ${run.settings.failurePolicy === "pause_and_report" ? "Workflow paused for PO review." : ""} ${completion.reason}`,
              nodeId: node.id, issueId: state.issueId ?? undefined
            });
          }
        }
      }
    } catch {
      // ignore transient poll error — will retry on next step
    }
  }

  // ── Phase 2: advance DAG — unlock successors with AND-join semantics ───────
  if (run.status === "running" || run.status === "waiting_approval") {
    let progressed = true;
    while (progressed) {
      progressed = false;
      for (const node of run.workflowSnapshot.nodes) {
        const state = run.nodeExecutionStates[node.id];
        if (!state) continue;
        if (state.status === "done" || state.status === "running" || state.status === "waiting_approval") continue;

        const incoming = incomingMap.get(node.id) ?? [];
        // AND-join: ALL predecessors must be "done" (not just any)
        const allPredDone = incoming.length > 0 && incoming.every(
          (predId) => run.nodeExecutionStates[predId]?.status === "done"
        );

        if (!allPredDone) continue;

        if (node.data.kind === "task") {
          if (state.status === "pending" || state.status === "blocked") {
            if (stateIssueIds(state).length === 0) {
              state.status = "blocked";
              state.lastGateCode = "NO_STAGE_TASKS";
              state.lastGateReason = "Waiting for the AI Project Manager to create execution tasks for this stage.";
              modified = true;
              continue;
            }
            state.status = "ready";
            modified = true;
            progressed = true;
            run.executionHistory.push({
              id: randomUUID(), timestamp: now, level: "info",
              message: `Node "${state.title}" is now READY — all predecessors completed (AND-join enforced).`,
              nodeId: node.id
            });
          }
        } else if (node.data.kind === "approval") {
          if (state.status === "pending" || state.status === "blocked") {
            state.status = "waiting_approval";
            run.status = "waiting_approval";
            modified = true;
            progressed = true;
            run.currentStepTitle = `Waiting Approval: ${state.title}`;
            run.executionHistory.push({
              id: randomUUID(), timestamp: now, level: "approval",
              message: `Workflow halted at approval gate: "${state.title}". Product Owner decision required before any successor may proceed.`,
              nodeId: node.id
            });
          }
        } else if (node.data.kind === "parallel" || node.data.kind === "join") {
          state.status = "done";
          state.finishedAt = now;
          modified = true;
          progressed = true;
          run.executionHistory.push({
            id: randomUUID(), timestamp: now, level: "info",
            message: `${node.data.kind === "parallel" ? "Parallel split" : "Join"} node "${state.title}" passed — successor nodes may now be evaluated.`,
            nodeId: node.id
          });
        } else if (node.data.kind === "end") {
          state.status = "done";
          state.finishedAt = now;
          modified = true;
          progressed = true;

          const allRequiredDone = Object.values(run.nodeExecutionStates).every(
            (s) => s.kind === "start" || s.kind === "end" || s.kind === "parallel" || s.kind === "join" || s.status === "done"
          );
          if (allRequiredDone) {
            run.status = "completed";
            run.finishedAt = now;
            run.currentStepTitle = "Workflow completed";
            run.executionHistory.push({
              id: randomUUID(), timestamp: now, level: "action",
              message: `All workflow tasks and quality gates completed successfully! Project deliverable ready.`
            });
          }
        }
      }
    }
  }

  // ── Phase 3: dispatch ready tasks (concurrency-bounded, idempotent) ────────
  if (run.status === "running") {
    const currentRunning = Object.values(run.nodeExecutionStates).filter((s) => s.status === "running").length;
    let availableSlots = Math.max(0, run.settings.maxConcurrentAgents - currentRunning);

    for (const node of run.workflowSnapshot.nodes) {
      const state = run.nodeExecutionStates[node.id];
      if (!state || state.status !== "ready" || availableSlots <= 0) continue;

      // Gate check before dispatching
      const primaryIssueId = state.issueId;
      const primaryAgentId = state.agentId ?? "";

      if (!primaryIssueId || stateIssueIds(state).length === 0) {
        state.status = "blocked";
        state.lastGateCode = "NO_STAGE_TASKS";
        state.lastGateReason = "No execution tasks are mapped to this stage yet.";
        modified = true;
        continue;
      }

      if (primaryAgentId) {
        const gate = canExecute({ run, nodeId: node.id, issueId: primaryIssueId, agentId: primaryAgentId });
        if (!gate.allowed) {
          // Record rejection but do not throw — the node stays ready and will be retried next step
          state.lastGateCode = gate.code;
          state.lastGateReason = gate.reason;
          run.executionHistory.push({
            id: randomUUID(), timestamp: now, level: "warn",
            message: `Execution gate DENIED for "${state.title}": [${gate.code}] ${gate.reason}`,
            nodeId: node.id, agentId: primaryAgentId, issueId: primaryIssueId
          });
          modified = true;
          continue;
        }
      }

      state.status = "running";
      state.startedAt = now;
      state.lastGateCode = "ADMITTED";
      state.lastGateReason = "All gate checks passed.";
      availableSlots -= 1;
      modified = true;
      run.currentStepTitle = state.title;

      // Send wakeup for all issues in this node — idempotent within this step call
      const wakeupTargets = state.issueIds.length > 0 ? state.issueIds : (state.issueId ? [state.issueId] : []);
      for (const iid of wakeupTargets) {
        if (wokenInThisStep.has(iid)) {
          run.executionHistory.push({
            id: randomUUID(), timestamp: now, level: "info",
            message: `Skipping duplicate wakeup for issue ${iid} in node "${state.title}" (idempotent guard).`,
            nodeId: node.id
          });
          continue;
        }
        wokenInThisStep.add(iid);
        try {
          await ctx.issues.requestWakeup(iid, companyId, {
            reason: `Workflow run ${runId} - executing step "${state.title}" (enforcement gate passed)`,
            idempotencyKey: `${runId}:${node.id}:attempt-${state.retryCount}:${iid}`,
            contextSource: "workflow-execution-gate",
            actorUserId: actionContext?.actor.userId ?? undefined
          });
        } catch (wakeupErr) {
          run.executionHistory.push({
            id: randomUUID(), timestamp: now, level: "warn",
            message: `Wakeup trigger warning for ${state.title} / issue ${iid}: ${asMessage(wakeupErr)}`,
            nodeId: node.id
          });
        }
      }

      run.executionHistory.push({
        id: randomUUID(), timestamp: now, level: "action",
        message: `Dispatching step: "${state.title}" to ${state.agentName ?? "Agent"} [gate: ADMITTED]. (Running: ${run.settings.maxConcurrentAgents - availableSlots}/${run.settings.maxConcurrentAgents})`,
        nodeId: node.id, agentId: state.agentId ?? undefined, issueId: state.issueId ?? undefined
      });
    }
  }

  if (modified) {
    run.updatedAt = now;
    await persistRun(ctx, run);
  }

  return { run };
}


const plugin = definePlugin({
  async setup(ctx) {
    // Read-only connectivity check. Never call /run from a health probe.
    ctx.data.register("ai-runtime-health", async (params) => {
      requiredString(params.companyId, "companyId");
      const gateway = (process.env.CODEX_GATEWAY_URL ?? "http://host.docker.internal:8400").replace(/\/$/, "");
      const checkedAt = new Date().toISOString();
      try {
        const response = await fetch(`${gateway}/health`, { signal: AbortSignal.timeout(5000) });
        const body = await response.json();
        return {
          reachable: response.ok && body.status === "ok",
          checkedAt,
          reason: response.ok && body.status === "ok" ? null : `Gateway health returned HTTP ${response.status}`
        };
      } catch (error) {
        const cause = (error as { cause?: { code?: string } }).cause;
        return { reachable: false, checkedAt, reason: cause?.code ?? asMessage(error) };
      }
    });
    ctx.data.register("bootstrap", async (params): Promise<BootstrapData> => {
      const companyId = requiredString(params.companyId, "companyId");
      const projectId = optionalString(params.projectId);
      const [projects, agents, issues, workflows, runs] = await Promise.all([
        ctx.projects.list({ companyId, limit: 200, offset: 0 }),
        ctx.agents.list({ companyId, limit: 200, offset: 0 }),
        ctx.issues.list({ companyId, projectId: projectId ?? undefined, limit: 500, offset: 0 }),
        readIndex(ctx, companyId),
        readRunsIndex(ctx, companyId)
      ]);
      return {
        projects: projects as unknown as Project[],
        agents: agents as unknown as Agent[],
        issues: issues as unknown as Issue[],
        workflows,
        runs
      } as unknown as BootstrapData;
    });

    ctx.data.register("company-intelligence", async (params): Promise<CompanyIntelligenceData> => {
      const companyId = requiredString(params.companyId, "companyId");
      return readCompanyIntelligence(ctx, companyId, params.range);
    });

    ctx.data.register("workflow", async (params) => {
      const companyId = requiredString(params.companyId, "companyId");
      const workflowId = requiredString(params.workflowId, "workflowId");
      const runId = optionalString(params.runId);
      let workflow = await readWorkflow(ctx, companyId, workflowId);
      if (!workflow && runId) {
        const runRecord = await readRun(ctx, companyId, runId);
        if (runRecord?.workflowSnapshot) {
          workflow = runRecord.workflowSnapshot;
          await ctx.state.set(
            { scopeKind: "company", scopeId: companyId, namespace: NAMESPACE, stateKey: workflowKey(workflowId) },
            workflow
          );
        }
      }
      if (!workflow) throw new Error("Workflow not found");
      return { workflow, monitor: await monitorWorkflow(ctx, workflow) };
    });

    ctx.data.register("project-workflow", async (params): Promise<ProjectWorkflowData> => {
      const companyId = requiredString(params.companyId, "companyId");
      const projectId = requiredString(params.projectId, "projectId");
      const [project, workflows, agents, issues, binding, allRuns] = await Promise.all([
        ctx.projects.get(projectId, companyId),
        readIndex(ctx, companyId),
        ctx.agents.list({ companyId, limit: 200, offset: 0 }),
        ctx.issues.list({ companyId, projectId, limit: 500, offset: 0 }),
        readProjectBinding(ctx, projectId),
        readRunsIndex(ctx, companyId)
      ]);
      if (!project) throw new Error("Project not found");
      const recentRuns = allRuns.filter((r) => r.projectId === projectId);
      const activeSummary = recentRuns.find((r) => r.status === "running" || r.status === "waiting_approval");
      const activeRun = activeSummary ? await readRun(ctx, companyId, activeSummary.id) : null;
      return {
        project: project as unknown as ProjectWorkflowData["project"],
        workflows,
        agents: agents as unknown as ProjectWorkflowData["agents"],
        issues: issues as unknown as ProjectWorkflowData["issues"],
        binding,
        monitor: binding ? await monitorWorkflow(ctx, binding.workflow, activeRun) : [],
        activeRun,
        recentRuns
      };
    });

    ctx.data.register("portfolio-dashboard", async (params): Promise<ProjectPortfolioData> => {
      const companyId = requiredString(params.companyId, "companyId");
      const [projectsList, workflows, agents, allRuns] = await Promise.all([
        ctx.projects.list({ companyId, limit: 200, offset: 0 }),
        readIndex(ctx, companyId),
        ctx.agents.list({ companyId, limit: 200, offset: 0 }),
        readRunsIndex(ctx, companyId)
      ]);

      const items: ProjectPortfolioItem[] = await Promise.all(
        projectsList.map(async (project) => {
          const binding = await readProjectBinding(ctx, project.id);
          const projectRuns = allRuns.filter((r) => r.projectId === project.id);
          const activeSummary = projectRuns.find(
            (r) => r.status === "running" || r.status === "waiting_approval" || r.status === "paused"
          );
          const latestRunSummary = projectRuns[0] ?? null;

          let activeRun: ProjectPortfolioActiveRun | null = null;
          if (activeSummary) {
            const run = await readRun(ctx, companyId, activeSummary.id);
            if (run) {
              const states = Object.values(run.nodeExecutionStates ?? {});
              const executableStates = states.filter(
                (s) => s.kind === "task" || s.kind === "approval"
              );
              const completedCount = executableStates.filter((s) => s.status === "done").length;
              const totalCount = executableStates.length || 1;
              const progress = Math.min(100, Math.round((completedCount / totalCount) * 100));

              const activeStates = executableStates.filter(
                (s) => s.status === "running" || s.status === "waiting_approval"
              );
              const currentStages = activeStates.length > 0
                ? activeStates.map((s) => s.title)
                : run.currentStepTitle ? [run.currentStepTitle] : [];

              const activeAgentsMap = new Map<string, { id: string; name: string; role?: string }>();
              for (const s of activeStates) {
                if (s.agentId && s.agentName) {
                  activeAgentsMap.set(s.agentId, {
                    id: s.agentId,
                    name: s.agentName,
                    role: s.agentRole ?? undefined
                  });
                }
              }
              const activeAgents = [...activeAgentsMap.values()];

              let waitingOrBlockedReason: string | null = null;
              if (run.status === "waiting_approval") {
                const approvalState = activeStates.find((s) => s.status === "waiting_approval");
                waitingOrBlockedReason = approvalState
                  ? `Waiting for approval on "${approvalState.title}"`
                  : "Waiting for human approval";
              } else if (run.status === "paused") {
                waitingOrBlockedReason = "Workflow paused by operator";
              } else {
                const blockedState = states.find((s) => s.status === "blocked");
                if (blockedState) {
                  waitingOrBlockedReason = blockedState.lastGateReason || `Step "${blockedState.title}" blocked`;
                } else {
                  const failedState = states.find((s) => s.status === "failed");
                  if (failedState) {
                    waitingOrBlockedReason = `Step "${failedState.title}" failed: ${failedState.error || "unknown error"}`;
                  }
                }
              }

              const history = run.executionHistory ?? [];
              const latestLog = history.length > 0 ? history[history.length - 1] : null;

              activeRun = {
                id: run.id,
                status: run.status,
                progress,
                completedSteps: completedCount,
                totalSteps: totalCount,
                startedAt: run.startedAt,
                currentStages,
                activeAgents,
                waitingOrBlockedReason,
                lastActivityAt: latestLog?.timestamp ?? run.updatedAt ?? run.startedAt,
                lastActivitySummary: latestLog?.message ?? (currentStages.length > 0 ? `Executing ${currentStages.join(", ")}` : undefined)
              };
            }
          }

          const workflowBinding = binding
            ? {
                templateId: binding.templateId,
                templateName: binding.templateName,
                templateVersion: binding.templateVersion,
                status: binding.workflow.status,
                totalTasks: binding.workflow.nodes.filter(
                  (n) => n.data.kind === "task" || n.data.kind === "approval"
                ).length
              }
            : null;

          return {
            projectId: project.id,
            projectName: project.name,
            projectDescription: (project as any).description ?? null,
            projectStatus: (project as any).status ?? "active",
            workflowBinding,
            activeRun,
            latestRunSummary,
            taskCount: workflowBinding?.totalTasks ?? (project as any).taskCount ?? 0,
            completedTaskCount: activeRun?.completedSteps ?? latestRunSummary?.completedTasks ?? 0,
            lastUpdatedAt: activeRun?.lastActivityAt ?? latestRunSummary?.finishedAt ?? (project as any).updatedAt ?? new Date().toISOString()
          };
        })
      );

      return {
        companyId,
        items,
        workflows,
        agents: agents as unknown as PaperclipAgent[]
      };
    });

    ctx.data.register("runs-list", async (params): Promise<WorkflowRunSummary[]> => {
      const companyId = requiredString(params.companyId, "companyId");
      const projectId = optionalString(params.projectId);
      const all = await readRunsIndex(ctx, companyId);
      return projectId ? all.filter((r) => r.projectId === projectId) : all;
    });

    ctx.data.register("workflow-run", async (params) => {
      const companyId = requiredString(params.companyId, "companyId");
      const runId = requiredString(params.runId, "runId");
      const run = await readRun(ctx, companyId, runId);
      if (!run) throw new Error("Workflow run not found");
      const monitor = await monitorWorkflow(ctx, run.workflowSnapshot, run);
      return { run, monitor };
    });

    ctx.data.register("workflow-run-logs", async (params) => {
      const companyId = requiredString(params.companyId, "companyId");
      const runId = requiredString(params.runId, "runId");
      const nodeId = optionalString(params.nodeId);
      const run = await readRun(ctx, companyId, runId);
      if (!run) throw new Error("Workflow run not found");
      let logs = run.executionHistory;
      if (nodeId) logs = logs.filter((l) => l.nodeId === nodeId);
      return {
        runId,
        status: run.status,
        logs,
        artifacts: run.artifacts ?? [],
        nodeExecutionStates: run.nodeExecutionStates,
        updatedAt: run.updatedAt
      };
    });

    ctx.data.register("preflight-check", async (params): Promise<PreflightCheckResult> => {
      const companyId = requiredString(params.companyId, "companyId");
      const projectId = requiredString(params.projectId, "projectId");
      const workflowId = requiredString(params.workflowId, "workflowId");
      let workflow = await readWorkflow(ctx, companyId, workflowId);
      if (!workflow) {
        const binding = await readProjectBinding(ctx, projectId);
        if (binding && binding.workflow.id === workflowId) {
          workflow = binding.workflow;
        }
      }
      if (!workflow) throw new Error("Workflow not found");
      return checkPreflight(ctx, companyId, projectId, workflow);
    });

    ctx.actions.register("create-template", async (params, actionContext) => {
      const companyId = requiredString(actionContext.companyId ?? params.companyId, "companyId");
      const agents = await ctx.agents.list({ companyId, limit: 200, offset: 0 });
      const workflow = createLifecycleTemplate(companyId, agents);
      await persistWorkflow(ctx, workflow);
      return { workflow, validation: validateGraph(workflow) };
    });

    ctx.actions.register("create-workflow", async (params, actionContext) => {
      const companyId = requiredString(actionContext.companyId ?? params.companyId, "companyId");
      const name = optionalString(params.name) ?? "Untitled workflow";
      const now = new Date().toISOString();
      const workflow: WorkflowDefinition = {
        id: randomUUID(), companyId, projectId: null, name, description: "Reusable Paperclip workflow template.",
        version: 1, status: "draft",
        nodes: [
          templateNode("start", 40, 120, nodeData("start", "Start", "Workflow entry point.", null)),
          templateNode("end", 320, 120, nodeData("end", "End", "Workflow terminal point.", null))
        ],
        edges: [{ id: "start-end", source: "start", target: "end", type: "smoothstep" }],
        viewport: { x: 0, y: 0, zoom: 0.9 }, layout: { direction: "LR", compact: true },
        publishedIssueIds: [], publishedDependencies: {}, createdAt: now, updatedAt: now, publishedAt: null
      };
      await persistWorkflow(ctx, workflow);
      return { workflow, validation: validateGraph(workflow) };
    });

    ctx.actions.register("attach-project-workflow", async (params, actionContext) => {
      const companyId = requiredString(actionContext.companyId ?? params.companyId, "companyId");
      const projectId = requiredString(params.projectId, "projectId");
      const workflowId = requiredString(params.workflowId, "workflowId");
      const [project, template, existing] = await Promise.all([
        ctx.projects.get(projectId, companyId),
        readWorkflow(ctx, companyId, workflowId),
        readProjectBinding(ctx, projectId)
      ]);
      if (!project) throw new Error("Project not found");
      if (!template) throw new Error("Workflow template not found");
      if (existing?.workflow.publishedIssueIds.length) {
        throw new Error("This project already has a published workflow. Existing project issues must be preserved.");
      }
      const now = new Date().toISOString();
      const workflow: WorkflowDefinition = {
        ...structuredClone(template),
        id: randomUUID(),
        projectId,
        version: 1,
        status: "draft",
        nodes: template.nodes.map((node) => ({ ...node, data: { ...node.data, issueId: null, issueIdentifier: null, issueIds: [], status: "draft" } })),
        publishedIssueIds: [],
        publishedDependencies: {},
        createdAt: now,
        updatedAt: now,
        publishedAt: null
      };
      const binding: ProjectWorkflowBinding = {
        projectId,
        templateId: template.id,
        templateName: template.name,
        templateVersion: template.version,
        workflow,
        attachedAt: now,
        updatedAt: now
      };
      await persistProjectBinding(ctx, binding);
      await ctx.state.set(
        { scopeKind: "company", scopeId: companyId, namespace: NAMESPACE, stateKey: workflowKey(workflow.id) },
        workflow
      );
      return { binding, validation: validateGraph(workflow) };
    });

    ctx.actions.register("publish-project-workflow", async (params, actionContext) => {
      const companyId = requiredString(actionContext.companyId ?? params.companyId, "companyId");
      const projectId = requiredString(params.projectId, "projectId");
      const binding = await readProjectBinding(ctx, projectId);
      if (!binding) throw new Error("Choose a workflow for this project first");
      const result = await publishWorkflowInstance(
        ctx,
        companyId,
        binding.workflow,
        Number(params.expectedVersion),
        actionContext,
        async (workflow) => {
          await persistProjectBinding(ctx, { ...binding, workflow, updatedAt: new Date().toISOString() });
          await ctx.state.set(
            { scopeKind: "company", scopeId: companyId, namespace: NAMESPACE, stateKey: workflowKey(workflow.id) },
            workflow
          );
        }
      );
      return result;
    });

    ctx.actions.register("save-workflow", async (params, actionContext) => {
      const companyId = requiredString(actionContext.companyId ?? params.companyId, "companyId");
      const submitted = asWorkflow(params.workflow);
      const expectedVersion = Number(params.expectedVersion);
      if (!Number.isInteger(expectedVersion) || expectedVersion < 0) throw new Error("expectedVersion must be a non-negative integer");
      const workflow = await saveDraft(ctx, companyId, submitted, expectedVersion);
      return { workflow, validation: validateGraph(workflow) };
    });

    ctx.actions.register("validate-workflow", async (params) => validateGraph(asWorkflow(params.workflow)));

    ctx.actions.register("duplicate-workflow", async (params, actionContext) => {
      const companyId = requiredString(actionContext.companyId ?? params.companyId, "companyId");
      const workflowId = requiredString(params.workflowId, "workflowId");
      const source = await readWorkflow(ctx, companyId, workflowId);
      if (!source) throw new Error("Workflow not found");
      const now = new Date().toISOString();
      const copy: WorkflowDefinition = {
        ...structuredClone(source),
        id: randomUUID(),
        name: `${source.name} copy`,
        projectId: null,
        version: 1,
        status: "draft",
        nodes: source.nodes.map((node) => ({ ...node, data: { ...node.data, issueId: null, issueIdentifier: null, issueIds: [], status: "draft" } })),
        publishedIssueIds: [],
        publishedDependencies: {},
        createdAt: now,
        updatedAt: now,
        publishedAt: null
      };
      await persistWorkflow(ctx, copy);
      return { workflow: copy };
    });

    ctx.actions.register("rename-workflow", async (params, actionContext) => {
      const companyId = requiredString(actionContext.companyId ?? params.companyId, "companyId");
      const workflowId = requiredString(params.workflowId, "workflowId");
      const name = requiredString(params.name, "name").trim();
      if (name.length > 120) throw new Error("Workflow name must be 120 characters or fewer");
      const current = await readWorkflow(ctx, companyId, workflowId);
      if (!current) throw new Error("Workflow not found");
      const expectedVersion = Number(params.expectedVersion);
      if (Number.isInteger(expectedVersion) && expectedVersion !== current.version) {
        throw new Error(`Version conflict. Server is at version ${current.version}.`);
      }
      const workflow: WorkflowDefinition = {
        ...current,
        name,
        version: current.version + 1,
        updatedAt: new Date().toISOString()
      };
      await persistWorkflow(ctx, workflow);
      await ctx.activity.log({ companyId, message: `Renamed workflow template to ${name}`, entityType: "workflow", entityId: workflow.id, metadata: { action: "workflow.renamed", version: workflow.version } });
      return { workflow };
    });

    ctx.actions.register("delete-workflow", async (params, actionContext) => {
      const companyId = requiredString(actionContext.companyId ?? params.companyId, "companyId");
      const workflowId = requiredString(params.workflowId, "workflowId");
      const workflow = await readWorkflow(ctx, companyId, workflowId);
      if (!workflow) throw new Error("Workflow not found");
      const projects = await ctx.projects.list({ companyId, limit: 500, offset: 0 });
      const bindings = await Promise.all(projects.map(async (project) => ({ project, binding: await readProjectBinding(ctx, project.id) })));
      const usedBy = bindings.filter((item) => item.binding?.templateId === workflowId).map((item) => item.project.name);
      if (usedBy.length > 0) throw new Error(`Workflow is used by ${usedBy.join(", ")}. Change those projects before deleting the template.`);
      await ctx.state.delete({ scopeKind: "company", scopeId: companyId, namespace: NAMESPACE, stateKey: workflowKey(workflowId) });
      await writeIndex(ctx, companyId, (await readIndex(ctx, companyId)).filter((item) => item.id !== workflowId));
      await ctx.activity.log({ companyId, message: `Deleted workflow template ${workflow.name}`, entityType: "workflow", entityId: workflow.id, metadata: { action: "workflow.deleted" } });
      return { deletedWorkflowId: workflowId, name: workflow.name };
    });

    ctx.actions.register("publish-workflow", async (params, actionContext) => {
      const companyId = requiredString(actionContext.companyId ?? params.companyId, "companyId");
      return publishWorkflow(ctx, companyId, requiredString(params.workflowId, "workflowId"), Number(params.expectedVersion), actionContext);
    });

    ctx.actions.register("preflight-check", async (params) => {
      const companyId = requiredString(params.companyId, "companyId");
      const projectId = requiredString(params.projectId, "projectId");
      const workflowId = requiredString(params.workflowId, "workflowId");
      let workflow = await readWorkflow(ctx, companyId, workflowId);
      if (!workflow) {
        const binding = await readProjectBinding(ctx, projectId);
        if (binding && binding.workflow.id === workflowId) {
          workflow = binding.workflow;
        }
      }
      if (!workflow) throw new Error("Workflow not found");
      return checkPreflight(ctx, companyId, projectId, workflow);
    });

    ctx.actions.register("start-project-workflow", async (params, actionContext) => {
      const companyId = requiredString(actionContext.companyId ?? params.companyId, "companyId");
      const projectId = requiredString(params.projectId, "projectId");
      const workflowId = requiredString(params.workflowId, "workflowId");
      const inputRequirement = requiredString(params.inputRequirement, "inputRequirement");
      const settings = (params.settings && typeof params.settings === "object" ? params.settings : {}) as WorkflowRunSettings;
      return startProjectWorkflow(ctx, companyId, projectId, workflowId, inputRequirement, settings, actionContext);
    });

    ctx.actions.register("create-stage-tasks", async (params, actionContext) => {
      const companyId = requiredString(actionContext.companyId ?? params.companyId, "companyId");
      const runId = requiredString(params.runId, "runId");
      const nodeId = requiredString(params.workflowNodeId ?? params.nodeId, "workflowNodeId");
      return createStageExecutionTasks(ctx, companyId, runId, nodeId, params.tasks, {
        actorUserId: actionContext.actor.userId,
        actorAgentId: actionContext.actor.agentId,
        actorRunId: actionContext.actor.runId
      });
    });

    ctx.tools.register(
      "create-execution-tasks",
      {
        displayName: "Create Workflow Execution Tasks",
        description: "Create concrete AI execution tasks for an existing workflow stage. Tasks are mapped to the Workflow Run and remain blocked until predecessor stages complete.",
        parametersSchema: {
          type: "object",
          properties: {
            workflowRunId: { type: "string" },
            workflowNodeId: { type: "string" },
            tasks: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                properties: {
                  taskKey: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  assigneeAgentId: { type: ["string", "null"] }
                },
                required: ["taskKey", "title"]
              }
            }
          },
          required: ["workflowRunId", "workflowNodeId", "tasks"]
        }
      },
      async (params, toolContext) => {
        const input = (params && typeof params === "object" ? params : {}) as Record<string, unknown>;
        const result = await createStageExecutionTasks(
          ctx,
          toolContext.companyId,
          requiredString(input.workflowRunId, "workflowRunId"),
          requiredString(input.workflowNodeId, "workflowNodeId"),
          input.tasks,
          { actorAgentId: toolContext.agentId, actorRunId: toolContext.runId }
        );
        return { content: `Mapped ${result.tasks.length} execution task(s) to ${result.stage}.`, data: result };
      }
    );

    ctx.actions.register("step-workflow-run", async (params, actionContext) => {
      const companyId = requiredString(actionContext.companyId ?? params.companyId, "companyId");
      const runId = requiredString(params.runId, "runId");
      return stepWorkflowRun(ctx, companyId, runId, actionContext);
    });

    ctx.actions.register("pause-workflow-run", async (params, actionContext) => {
      const companyId = requiredString(actionContext.companyId ?? params.companyId, "companyId");
      const runId = requiredString(params.runId, "runId");
      const run = await readRun(ctx, companyId, runId);
      if (!run) throw new Error("Workflow run not found");
      const now = new Date().toISOString();
      run.status = "paused";
      run.pausedAt = now;
      run.updatedAt = now;
      run.executionHistory.push({
        id: randomUUID(),
        timestamp: now,
        level: "action",
        message: "Workflow run paused by Product Owner. Running agents will complete current step; next steps are held."
      });
      await persistRun(ctx, run);
      return { run };
    });

    ctx.actions.register("resume-workflow-run", async (params, actionContext) => {
      const companyId = requiredString(actionContext.companyId ?? params.companyId, "companyId");
      const runId = requiredString(params.runId, "runId");
      const run = await readRun(ctx, companyId, runId);
      if (!run) throw new Error("Workflow run not found");
      const now = new Date().toISOString();
      run.status = "running";
      run.pausedAt = null;
      run.updatedAt = now;
      run.executionHistory.push({
        id: randomUUID(),
        timestamp: now,
        level: "action",
        message: "Workflow run resumed by Product Owner."
      });
      await persistRun(ctx, run);
      return stepWorkflowRun(ctx, companyId, runId, actionContext);
    });

    ctx.actions.register("stop-workflow-run", async (params, actionContext) => {
      const companyId = requiredString(actionContext.companyId ?? params.companyId, "companyId");
      const runId = requiredString(params.runId, "runId");
      const run = await readRun(ctx, companyId, runId);
      if (!run) throw new Error("Workflow run not found");
      const now = new Date().toISOString();
      run.status = "cancelled";
      run.finishedAt = now;
      run.updatedAt = now;
      for (const state of Object.values(run.nodeExecutionStates)) {
        if (state.status === "running" || state.status === "ready" || state.status === "pending") {
          state.status = "skipped";
        }
      }
      run.executionHistory.push({
        id: randomUUID(),
        timestamp: now,
        level: "action",
        message: "Workflow run stopped by Product Owner. Related tasks stopped; other project executions preserved."
      });
      await persistRun(ctx, run);
      return { run };
    });

    ctx.actions.register("clear-run-history", async (params, actionContext) => {
      const companyId = requiredString(actionContext.companyId ?? params.companyId, "companyId");
      const projectId = optionalString(params.projectId);
      const allRuns = await readRunsIndex(ctx, companyId);
      const toKeep = allRuns.filter(
        (r) =>
          r.status === "running" ||
          r.status === "waiting_approval" ||
          r.status === "paused" ||
          (projectId && r.projectId !== projectId)
      );
      const toDelete = allRuns.filter((r) => !toKeep.some((k) => k.id === r.id));
      for (const del of toDelete) {
        await ctx.state.delete({ scopeKind: "company", scopeId: companyId, namespace: NAMESPACE, stateKey: runKey(del.id) });
      }
      await writeRunsIndex(ctx, companyId, toKeep);
      return { deletedCount: toDelete.length };
    });

    ctx.actions.register("retry-failed-step", async (params, actionContext) => {
      const companyId = requiredString(actionContext.companyId ?? params.companyId, "companyId");
      const runId = requiredString(params.runId, "runId");
      const nodeId = requiredString(params.nodeId, "nodeId");
      const run = await readRun(ctx, companyId, runId);
      if (!run) throw new Error("Workflow run not found");
      const state = run.nodeExecutionStates[nodeId];
      if (!state) throw new Error(`Node ${nodeId} not found in run`);
      state.status = "ready";
      state.error = null;
      if (run.status === "paused") {
        run.status = "running";
        run.pausedAt = null;
      }
      const now = new Date().toISOString();
      run.updatedAt = now;
      run.executionHistory.push({
        id: randomUUID(),
        timestamp: now,
        level: "action",
        message: `Retry initiated for step "${state.title}" (${state.agentName ?? "Agent"}).`
      });
      await persistRun(ctx, run);
      return stepWorkflowRun(ctx, companyId, runId, actionContext);
    });

    ctx.actions.register("register-node-issue", async (params, actionContext) => {
      const companyId = requiredString(actionContext.companyId ?? params.companyId, "companyId");
      const runId = requiredString(params.runId, "runId");
      const nodeId = requiredString(params.nodeId, "nodeId");
      const issueId = requiredString(params.issueId, "issueId");
      const run = await readRun(ctx, companyId, runId);
      if (!run || !["running", "waiting_approval", "paused"].includes(run.status)) {
        throw new Error("Additional work can only be registered against an active Workflow Run.");
      }
      const state = run.nodeExecutionStates[nodeId];
      const snapshotNode = run.workflowSnapshot.nodes.find((node) => node.id === nodeId);
      if (!state || !snapshotNode || snapshotNode.data.kind !== "task") {
        throw new Error("Additional issues may only be registered inside an existing task stage.");
      }
      if (["done", "failed", "cancelled", "skipped"].includes(state.status)) {
        throw new Error(`Stage "${state.title}" is already terminal and cannot accept new work without an approved run revision.`);
      }
      const existingOwner = await resolveActiveIssueOwnership(ctx, companyId, issueId);
      if (existingOwner && (existingOwner.run.id !== runId || existingOwner.nodeId !== nodeId)) {
        throw new Error(`Issue ${issueId} is already owned by another active Workflow Run node.`);
      }
      const issue = await ctx.issues.get(issueId, companyId);
      if (!issue || issue.projectId !== run.projectId) {
        throw new Error("Issue must exist in the same project as the Workflow Run.");
      }
      if (state.agentId && issue.assigneeAgentId !== state.agentId) {
        throw new Error(`Issue must be assigned to the stage agent ${state.agentId}; cross-stage reassignment is not permitted.`);
      }

      const predecessorIssueIds = state.blockedByNodeIds.flatMap((predecessorId) => {
        const predecessor = run.nodeExecutionStates[predecessorId];
        return predecessor?.issueIds?.length ? predecessor.issueIds : (predecessor?.issueId ? [predecessor.issueId] : []);
      });
      const relations = await ctx.issues.relations.get(issueId, companyId);
      const requiredBlockers = [...new Set([...relations.blockedBy.map((item) => item.id), ...predecessorIssueIds])];
      await ctx.issues.relations.setBlockedBy(issueId, requiredBlockers, companyId, {
        actorUserId: actionContext.actor.userId,
        actorAgentId: actionContext.actor.agentId,
        actorRunId: actionContext.actor.runId
      });

      if (!state.issueIds.includes(issueId)) state.issueIds.push(issueId);
      if (issue.identifier && !state.issueIdentifiers.includes(issue.identifier)) state.issueIdentifiers.push(issue.identifier);
      if (!state.issueId) {
        state.issueId = issueId;
        state.issueIdentifier = issue.identifier ?? null;
      }
      if (!run.relatedIssueIds.includes(issueId)) run.relatedIssueIds.push(issueId);
      const now = new Date().toISOString();
      run.executionHistory.push({
        id: randomUUID(),
        timestamp: now,
        level: "action",
        message: `Registered ${issue.identifier ?? issueId} inside stage "${state.title}". Completion policy remains ${state.completionPolicy}; stage successors stay blocked until the policy is satisfied.`,
        nodeId,
        agentId: state.agentId ?? undefined,
        issueId
      });
      run.updatedAt = now;
      await persistRun(ctx, run);
      return { run, node: state, issueId, blockedByIssueIds: requiredBlockers };
    });

    ctx.actions.register("decide-run-approval", async (params, actionContext) => {
      const companyId = requiredString(actionContext.companyId ?? params.companyId, "companyId");
      const runId = requiredString(params.runId, "runId");
      const nodeId = requiredString(params.nodeId, "nodeId");
      const decision = requiredString(params.decision, "decision");
      const notes = optionalString(params.notes) ?? (decision === "approve" ? "Approved by Product Owner" : "Revision requested by Product Owner");

      const run = await readRun(ctx, companyId, runId);
      if (!run) throw new Error("Workflow run not found");
      const state = run.nodeExecutionStates[nodeId];
      if (!state) throw new Error(`Node ${nodeId} not found in run`);

      const now = new Date().toISOString();
      if (decision === "approve") {
        state.status = "done";
        state.finishedAt = now;
        if (run.status === "waiting_approval") {
          run.status = "running";
        }
        run.executionHistory.push({
          id: randomUUID(),
          timestamp: now,
          level: "approval",
          message: `Product Owner approved gate "${state.title}". Note: ${notes}`
        });
        await persistRun(ctx, run);
        return stepWorkflowRun(ctx, companyId, runId, actionContext);
      } else {
        run.status = "paused";
        run.pausedAt = now;
        run.executionHistory.push({
          id: randomUUID(),
          timestamp: now,
          level: "approval",
          message: `Product Owner requested changes at gate "${state.title}". Workflow paused. Note: ${notes}`
        });
        await persistRun(ctx, run);
        return { run };
      }
    });

    // ── can-execute: adapter calls this before checkout to confirm gate ───────
    ctx.actions.register("can-execute", async (params) => {
      const companyId = requiredString(params.companyId, "companyId");
      const issueId = requiredString(params.issueId, "issueId");
      const agentId = requiredString(params.agentId, "agentId");
      const runId = optionalString(params.runId);
      const requestedNodeId = optionalString(params.nodeId);
      const ownership = await resolveActiveIssueOwnership(ctx, companyId, issueId, runId);
      if (!ownership) {
        return { allowed: true, code: "NO_ACTIVE_RUN", reason: "Issue is not owned by any active Workflow Run — independent task, gate passes." };
      }
      const { run } = ownership;
      const nodeId = requestedNodeId ?? ownership.nodeId;

      const gate = canExecute({ run, nodeId, issueId, agentId });
      const audit = buildAuditEntry(run.id, nodeId, issueId, agentId, gate);

      // Persist audit entry to state
      const auditList: GateAuditEntry[] = [];
      const existing = await ctx.state.get({ scopeKind: "company", scopeId: companyId, namespace: NAMESPACE, stateKey: GATE_AUDIT_KEY });
      if (Array.isArray(existing)) auditList.push(...(existing as GateAuditEntry[]).slice(-499));
      auditList.push(audit);
      await ctx.state.set({ scopeKind: "company", scopeId: companyId, namespace: NAMESPACE, stateKey: GATE_AUDIT_KEY }, auditList);

      if (!gate.allowed) {
        // Also record in the run history
        run.executionHistory.push({
          id: randomUUID(), timestamp: audit.ts, level: "warn",
          message: `GATE REJECTION via can-execute: [${gate.code}] ${gate.reason}`,
          nodeId: nodeId, agentId: agentId, issueId: issueId
        });
        run.updatedAt = audit.ts;
        await persistRun(ctx, run);
      }

      return { allowed: gate.allowed, code: audit.code, reason: audit.reason, runId: run.id };
    });

    ctx.actions.register("agent-control-action", async (params, actionContext) => {
      const companyId = requiredString(actionContext.companyId ?? params.companyId, "companyId");
      const action = requiredString(params.action, "action");
      const agentId = optionalString(params.agentId);
      const issueId = optionalString(params.issueId);

      const agents = await ctx.agents.list({ companyId, limit: 200, offset: 0 });

      if (action === "pause-all") {
        const results = await Promise.allSettled(
          agents.filter((a) => a.status === "active" || a.status === "idle" || a.status === "running").map((a) => ctx.agents.pause(a.id, companyId))
        );
        return { action, count: results.filter((r) => r.status === "fulfilled").length };
      }

      if (action === "resume-all") {
        const results = await Promise.allSettled(
          agents.filter((a) => a.status === "paused" || a.status === "error").map(async (a) => {
            if (a.status === "error") {
              try { await ctx.agents.pause(a.id, companyId); } catch {}
            }
            return ctx.agents.resume(a.id, companyId);
          })
        );
        return { action, count: results.filter((r) => r.status === "fulfilled").length };
      }

      if (action === "start-all") {
        // 1. Resume any paused or errored agents so all 8 agents are active and ready
        let resumedAgentsCount = 0;
        const pausedOrErrorAgents = agents.filter((a) => a.status === "paused" || a.status === "error");
        if (pausedOrErrorAgents.length > 0) {
          const resumeResults = await Promise.allSettled(
            pausedOrErrorAgents.map(async (a) => {
              if (a.status === "error") {
                try { await ctx.agents.pause(a.id, companyId); } catch {}
              }
              return ctx.agents.resume(a.id, companyId);
            })
          );
          resumedAgentsCount = resumeResults.filter((r) => r.status === "fulfilled").length;
        }

        // 2. Advance any active workflow runs
        const allRuns = await readRunsIndex(ctx, companyId);
        const activeRuns = allRuns.filter((r) => r.status === "running" || r.status === "paused" || r.status === "waiting_approval");
        let steppedRunsCount = 0;
        for (const runSummary of activeRuns) {
          try {
            await stepWorkflowRun(ctx, companyId, runSummary.id, actionContext);
            steppedRunsCount += 1;
          } catch {
            // ignore step error
          }
        }

        // 3. Dispatch any runnable tasks
        const issues = await ctx.issues.list({ companyId, limit: 500, offset: 0 });
        const runnable: Issue[] = [];
        let skippedCount = 0;
        for (const issue of issues) {
          if (!issue.assigneeAgentId || !["todo", "backlog", "in_progress"].includes(issue.status)) continue;
          const ownership = await resolveActiveIssueOwnership(ctx, companyId, issue.id);
          if (ownership) {
            const gate = canExecute({
              run: ownership.run,
              nodeId: ownership.nodeId,
              issueId: issue.id,
              agentId: issue.assigneeAgentId
            });
            if (gate.allowed) {
              runnable.push(issue);
            } else {
              skippedCount += 1;
            }
            continue;
          }
          runnable.push(issue);
        }

        const results = await Promise.allSettled(
          runnable.map((issue) =>
            ctx.issues.requestWakeup(issue.id, companyId, {
              reason: "Agent Control Center: Start All requested (Execution Gate cleared)",
              idempotencyKey: `start-all:${issue.id}:${Date.now()}`,
              contextSource: "agent-control-start-all",
              actorUserId: actionContext.actor.userId
            })
          )
        );
        const wokeCount = results.filter((r) => r.status === "fulfilled").length;
        const totalActive = wokeCount + steppedRunsCount;

        let message = "";
        let noActiveWorkflow = false;

        if (totalActive > 0) {
          message = `Started: ${wokeCount} task(s) dispatched, ${steppedRunsCount} workflow run(s) advanced.${resumedAgentsCount > 0 ? ` Resumed ${resumedAgentsCount} agents.` : ""}`;
        } else if (resumedAgentsCount > 0) {
          message = `Resumed ${resumedAgentsCount} AI agents. No workflow is currently running. Opening Workflow runner...`;
          noActiveWorkflow = true;
        } else {
          message = `All 8 AI agents are active and ready. No workflow is currently running. Opening Workflow runner...`;
          noActiveWorkflow = true;
        }

        return {
          action,
          count: totalActive,
          resumedAgentsCount,
          wokeCount,
          steppedRunsCount,
          skippedDueToWorkflowGate: skippedCount,
          noActiveWorkflow,
          message
        };
      }

      if (action === "stop-all") {
        const results = await Promise.allSettled(
          agents.filter((a) => a.status === "running").map((a) => ctx.agents.pause(a.id, companyId))
        );
        return { action, count: results.filter((r) => r.status === "fulfilled").length };
      }

      if (action === "retry-failed") {
        const issues = await ctx.issues.list({ companyId, limit: 500, offset: 0 });
        const failed = issues.filter((i) => i.assigneeAgentId && (i.status === "cancelled" || i.status === "blocked"));
        const independentFailed: Issue[] = [];
        let skippedDueToWorkflowGate = 0;
        for (const issue of failed) {
          if (await resolveActiveIssueOwnership(ctx, companyId, issue.id)) skippedDueToWorkflowGate += 1;
          else independentFailed.push(issue);
        }
        const results = await Promise.allSettled(
          independentFailed.map((issue) =>
            ctx.issues.requestWakeup(issue.id, companyId, {
              reason: "Agent Control Center: Retry Failed requested",
              idempotencyKey: `retry-failed:${issue.id}:${issue.updatedAt instanceof Date ? issue.updatedAt.toISOString() : String(issue.updatedAt ?? "unknown")}`,
              contextSource: "agent-control-retry-failed",
              actorUserId: actionContext.actor.userId
            })
          )
        );
        return { action, count: results.filter((r) => r.status === "fulfilled").length, skippedDueToWorkflowGate };
      }

      if (action === "agent-pause" && agentId) {
        const agent = await ctx.agents.pause(agentId, companyId);
        return { action, agent };
      }

      if (action === "agent-resume" && agentId) {
        const target = agents.find((a) => a.id === agentId);
        if (target?.status === "error") {
          try { await ctx.agents.pause(agentId, companyId); } catch {}
        }
        const agent = await ctx.agents.resume(agentId, companyId);
        return { action, agent };
      }

      if (action === "agent-wakeup" && agentId) {
        // Resume agent if it is currently paused or in error
        const target = agents.find((a) => a.id === agentId);
        if (target && (target.status === "paused" || target.status === "error")) {
          if (target.status === "error") {
            try { await ctx.agents.pause(agentId, companyId); } catch {}
          }
          try { await ctx.agents.resume(agentId, companyId); } catch {}
        }

        // ENFORCEMENT: If the target issue belongs to an active run, gate must allow it
        const targetIssueId = issueId ?? (() => {
          // Will be resolved below per-issue
          return null;
        })();

        if (targetIssueId) {
          // Find if this issue is owned by an active run
          const allRuns = await readRunsIndex(ctx, companyId);
          let ownerRun: WorkflowRunRecord | null = null;
          let ownerNodeId: string | null = null;
          for (const summary of allRuns) {
            if (summary.status !== "running" && summary.status !== "waiting_approval" && summary.status !== "paused") continue;
            const run = await readRun(ctx, companyId, summary.id);
            if (!run) continue;
            for (const [nid, state] of Object.entries(run.nodeExecutionStates)) {
              const owned = state.issueId === targetIssueId || state.issueIds.includes(targetIssueId);
              if (owned) { ownerRun = run; ownerNodeId = nid; break; }
            }
            if (ownerRun) break;
          }

          if (ownerRun && ownerNodeId) {
            const gate = canExecute({ run: ownerRun, nodeId: ownerNodeId, issueId: targetIssueId, agentId });
            if (!gate.allowed) {
              // Log the rejection
              ownerRun.executionHistory.push({
                id: randomUUID(), timestamp: new Date().toISOString(), level: "warn",
                message: `GATE REJECTION via agent-wakeup: [${gate.code}] ${gate.reason}`,
                nodeId: ownerNodeId, agentId, issueId: targetIssueId
              });
              ownerRun.updatedAt = new Date().toISOString();
              await persistRun(ctx, ownerRun);
              return {
                action,
                allowed: false,
                code: gate.code,
                reason: gate.reason,
                message: `Wakeup BLOCKED by Workflow Execution Gate: ${gate.reason}`
              };
            }
          }

          const res = await ctx.issues.requestWakeup(targetIssueId, companyId, {
            reason: `Agent Control Center: Wakeup requested for ${agentId} (gate cleared)`,
            actorUserId: actionContext.actor.userId
          });
          return { action, res, allowed: true, message: "Agent task wake requested successfully" };
        } else {
          // No explicit issueId: find a runnable issue that is NOT blocked by workflow gate
          const issues = await ctx.issues.list({ companyId, assigneeAgentId: agentId, limit: 50, offset: 0 });
          const allRuns = await readRunsIndex(ctx, companyId);

          for (const candidate of issues.filter((i) => ["todo", "backlog", "in_progress"].includes(i.status))) {
            let blocked = false;
            for (const summary of allRuns) {
              if (summary.status !== "running" && summary.status !== "waiting_approval" && summary.status !== "paused") continue;
              const run = await readRun(ctx, companyId, summary.id);
              if (!run) continue;
              for (const [nid, state] of Object.entries(run.nodeExecutionStates)) {
                const owned = state.issueId === candidate.id || state.issueIds.includes(candidate.id);
                if (owned) {
                  const gate = canExecute({ run, nodeId: nid, issueId: candidate.id, agentId });
                  if (!gate.allowed) { blocked = true; break; }
                }
              }
              if (blocked) break;
            }
            if (!blocked) {
              const res = await ctx.issues.requestWakeup(candidate.id, companyId, {
                reason: `Agent Control Center: Wakeup requested for ${agentId} (gate cleared)`,
                actorUserId: actionContext.actor.userId
              });
              return { action, res, issueId: candidate.id, allowed: true, message: `Task ${candidate.identifier ?? candidate.id} dispatched to agent.` };
            }
          }
          return {
            action,
            allowed: false,
            message: "Agent is active and ready. No task is currently assigned to this agent — start a Project Workflow to generate and dispatch work in DAG order."
          };
        }
      }

      throw new Error(`Unknown agent control action: ${action}`);
    });
  },

  async onHealth() {
    return { status: "ok", message: "AI Workflow Studio worker is ready" };
  }
});

export default plugin;
runWorker(plugin, import.meta.url);

