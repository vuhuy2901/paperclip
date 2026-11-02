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
  MonitorNode,
  NodeExecutionState,
  NodeExecutionStatus,
  PreflightCheckItem,
  PreflightCheckResult,
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
  WorkflowRunSummary
} from "./types.js";

const INDEX_KEY = "workflow-index";
const NAMESPACE = "workflow-studio";
const PROJECT_BINDING_KEY = "project-workflow-binding";
const RUNS_INDEX_KEY = "workflow-runs-index";
const GATE_AUDIT_KEY = "workflow-gate-audit";

// Per-run idempotency: track the set of issueIds for which a wakeup was
// already sent in the current stepWorkflowRun invocation so we never send
// two heartbeat requests for the same issue in one step cycle.
const activeStepSessions = new Map<string, Set<string>>();

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
  return value && typeof value === "object" ? value as WorkflowDefinition : null;
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

function runSummary(run: WorkflowRunRecord): WorkflowRunSummary {
  const totalTasks = Object.values(run.nodeExecutionStates).filter((s) => s.kind === "task" || s.kind === "approval").length;
  const completedTasks = Object.values(run.nodeExecutionStates).filter((s) => (s.kind === "task" || s.kind === "approval") && s.status === "done").length;
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

export function validateGraph(workflow: WorkflowDefinition): ValidationResult {
  const issues: ValidationIssue[] = [];
  const nodeIds = new Set<string>();
  for (const node of workflow.nodes) {
    if (nodeIds.has(node.id)) issues.push({ level: "error", code: "duplicate_node", message: `Duplicate node ${node.id}`, nodeId: node.id });
    nodeIds.add(node.id);
    if (!node.data.title.trim()) issues.push({ level: "error", code: "missing_title", message: "Node title is required", nodeId: node.id });
    if (node.data.kind === "task" && !node.data.agentId) {
      issues.push({ level: "warning", code: "missing_agent", message: `${node.data.title} has no Paperclip agent assigned`, nodeId: node.id });
    }
    if (node.data.kind === "condition") {
      issues.push({ level: "warning", code: "condition_visual_only", message: `${node.data.title} is visual-only. Paperclip IF/ELSE execution is not enabled.`, nodeId: node.id });
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
  if (!workflow.nodes.some((node) => node.data.kind === "start")) issues.push({ level: "warning", code: "missing_start", message: "Workflow has no Start node" });
  if (!workflow.nodes.some((node) => node.data.kind === "end")) issues.push({ level: "warning", code: "missing_end", message: "Workflow has no End node" });
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
    nodes: submitted.nodes.map((node) => ({ ...node, data: { ...node.data, issueId: null, issueIdentifier: null, status: "draft" } })),
    publishedIssueIds: [],
    publishedDependencies: {}
  };
  await persistWorkflow(ctx, next);
  return next;
}

function taskNodes(workflow: WorkflowDefinition): WorkflowNode[] {
  return workflow.nodes.filter((node) => node.data.kind === "task" || node.data.kind === "approval");
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

async function monitorWorkflow(ctx: PluginContext, workflow: WorkflowDefinition): Promise<MonitorNode[]> {
  return await Promise.all(workflow.nodes.map(async (node): Promise<MonitorNode> => {
    if (!node.data.issueId) return { nodeId: node.id, issue: null, blockedBy: [], runs: [] };
    const issue = await ctx.issues.get(node.data.issueId, workflow.companyId);
    if (!issue) return { nodeId: node.id, issue: null, blockedBy: [], runs: [] };
    const relations = await ctx.issues.relations.get(issue.id, workflow.companyId);
    let runs: MonitorNode["runs"] = [];
    try {
      const summary = await ctx.issues.summaries.getOrchestration({ issueId: issue.id, companyId: workflow.companyId, includeSubtree: false });
      runs = summary.runs.map((run) => ({
        id: run.id, status: run.status, startedAt: run.startedAt, finishedAt: run.finishedAt,
        error: run.error, agentId: run.agentId
      }));
    } catch {
      runs = [];
    }
    return { nodeId: node.id, issue: issue as unknown as MonitorNode["issue"], blockedBy: relations.blockedBy, runs };
  }));
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

  for (const node of taskNodes(working)) {
    let issue: Issue | null = null;
    if (node.data.issueId) {
      issue = await ctx.issues.get(node.data.issueId, companyId);
      if (!issue) throw new Error(`Linked issue for ${node.data.title} no longer exists`);
      if (issue.projectId !== working.projectId) throw new Error(`${issue.identifier ?? issue.id} belongs to another project`);
      if (issue.status === "in_progress") throw new Error(`${issue.identifier ?? issue.id} is running. Dependency edits are blocked until it stops.`);
      issue = await ctx.issues.update(issue.id, {
        title: node.data.title,
        description: node.data.description,
        priority: node.data.priority as Issue["priority"],
        assigneeAgentId: node.data.kind === "task" ? node.data.agentId : null,
        assigneeUserId: node.data.kind === "approval" ? actionContext.actor.userId : null
      }, companyId, actor);
      operations.push({ type: "issue.updated", nodeId: node.id, issueId: issue.id, ok: true });
    } else {
      issue = await ctx.issues.create({
        companyId,
        projectId: working.projectId ?? undefined,
        title: node.data.title,
        description: node.data.description,
        status: "backlog",
        priority: node.data.priority as Issue["priority"],
        assigneeAgentId: node.data.kind === "task" ? node.data.agentId ?? undefined : undefined,
        assigneeUserId: node.data.kind === "approval" ? actionContext.actor.userId : null,
        originKind: "plugin:ai-company-workflow-studio",
        originId: `workflow:${working.id}:node:${node.id}`,
        actor
      });
      node.data.issueId = issue.id;
      node.data.issueIdentifier = issue.identifier;
      operations.push({ type: "issue.created", nodeId: node.id, issueId: issue.id, ok: true });
    }
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
  const activeExisting = runs.find((r) => r.projectId === projectId && (r.status === "running" || r.status === "waiting_approval"));
  if (activeExisting) {
    throw new Error(`Project "${project.name}" already has an active workflow run (${activeExisting.id}). Pause or stop the active run before starting a new one.`);
  }

  if (workflow.status !== "published" || !workflow.publishedIssueIds?.length || workflow.projectId !== projectId) {
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

  const nodeExecutionStates: Record<string, NodeExecutionState> = {};
  for (const node of workflow.nodes) {
    const primaryIssueId = node.data.issueId ?? null;
    const primaryIdentifier = node.data.issueIdentifier ?? null;
    nodeExecutionStates[node.id] = {
      nodeId: node.id,
      kind: node.data.kind,
      title: node.data.title,
      status: node.data.kind === "start" ? "done" : "pending",
      issueId: primaryIssueId,
      issueIdentifier: primaryIdentifier,
      issueIds: primaryIssueId ? [primaryIssueId] : [],
      issueIdentifiers: primaryIdentifier ? [primaryIdentifier] : [],
      completionPolicy: "all_required",
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

  const relatedIssueIds: string[] = [];
  for (const node of workflow.nodes) {
    if (node.data.issueId) {
      relatedIssueIds.push(node.data.issueId);
      try {
        await ctx.issues.createComment(
          node.data.issueId,
          `## 🚀 Workflow Run: ${runId}\n**Product Owner Requirement:**\n${cleanReq}\n\n*Assigned Step:* ${node.data.title}`,
          companyId
        );
      } catch {
        // Comment creation best-effort
      }
    }
  }

  for (const node of workflow.nodes) {
    if (node.data.kind === "start") continue;
    const incoming = incomingMap.get(node.id) ?? [];
    const allPredDone = incoming.every((predId) => nodeExecutionStates[predId]?.status === "done");
    if (allPredDone) {
      if (node.data.kind === "task") {
        nodeExecutionStates[node.id].status = "ready";
      } else if (node.data.kind === "parallel") {
        nodeExecutionStates[node.id].status = "done";
        nodeExecutionStates[node.id].finishedAt = now;
      }
    }
  }

  let activeCount = 0;
  let firstStepTitle = "";
  for (const node of workflow.nodes) {
    if (nodeExecutionStates[node.id]?.status === "ready" && activeCount < runSettings.maxConcurrentAgents) {
      nodeExecutionStates[node.id].status = "running";
      nodeExecutionStates[node.id].startedAt = now;
      activeCount += 1;
      if (!firstStepTitle) firstStepTitle = node.data.title;

      if (node.data.issueId) {
        try {
          await ctx.issues.requestWakeup(
            node.data.issueId,
            companyId,
            {
              reason: `Workflow run ${runId} started - executing initial step ${node.data.title}`,
              actorUserId: actionContext.actor.userId ?? undefined
            }
          );
        } catch (wakeupErr) {
          history.push({
            id: randomUUID(),
            timestamp: new Date().toISOString(),
            level: "warn",
            message: `Could not send wakeup request for ${node.data.title}: ${asMessage(wakeupErr)}`,
            nodeId: node.id
          });
        }
      }

      history.push({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        level: "action",
        message: `Step 1 started: ${node.data.title} assigned to ${node.data.agentName ?? 'AI Agent'}. (Concurrency: ${activeCount}/${runSettings.maxConcurrentAgents})`,
        nodeId: node.id,
        agentId: node.data.agentId ?? undefined,
        issueId: node.data.issueId ?? undefined
      });
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
    executionHistory: history,
    workflowSnapshot: workflow,
    currentStepTitle: firstStepTitle || "Starting workflow",
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

  return { run: runRecord };
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

      if (primaryIssueId && primaryAgentId) {
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

    ctx.data.register("workflow", async (params) => {
      const companyId = requiredString(params.companyId, "companyId");
      const workflowId = requiredString(params.workflowId, "workflowId");
      const workflow = await readWorkflow(ctx, companyId, workflowId);
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
        monitor: binding ? await monitorWorkflow(ctx, binding.workflow) : [],
        activeRun,
        recentRuns
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
      const monitor = await monitorWorkflow(ctx, run.workflowSnapshot);
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
        nodes: template.nodes.map((node) => ({ ...node, data: { ...node.data, issueId: null, issueIdentifier: null, status: "draft" } })),
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
        async (workflow) => persistProjectBinding(ctx, { ...binding, workflow, updatedAt: new Date().toISOString() })
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
        nodes: source.nodes.map((node) => ({ ...node, data: { ...node.data, issueId: null, issueIdentifier: null, status: "draft" } })),
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
      const nodeId = requiredString(params.nodeId, "nodeId");
      const issueId = requiredString(params.issueId, "issueId");
      const agentId = requiredString(params.agentId, "agentId");
      const runId = optionalString(params.runId);

      // Find the active run that owns this issue
      let run: WorkflowRunRecord | null = null;
      if (runId) {
        run = await readRun(ctx, companyId, runId);
      } else {
        const index = await readRunsIndex(ctx, companyId);
        const active = index.find((r) => r.status === "running" || r.status === "waiting_approval" || r.status === "paused");
        if (active) run = await readRun(ctx, companyId, active.id);
      }

      // If there is no active run owning this issue, allow it (independent task)
      if (!run) {
        // Check if any active run owns this issueId
        const index = await readRunsIndex(ctx, companyId);
        for (const summary of index) {
          if (summary.status !== "running" && summary.status !== "waiting_approval" && summary.status !== "paused") continue;
          const candidate = await readRun(ctx, companyId, summary.id);
          if (!candidate) continue;
          const owned = Object.values(candidate.nodeExecutionStates).some((s) => s.issueId === issueId || s.issueIds.includes(issueId));
          if (owned) { run = candidate; break; }
        }
        if (!run) {
          return { allowed: true, code: "NO_ACTIVE_RUN", reason: "Issue is not owned by any active Workflow Run — independent task, gate passes." };
        }
      }

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
          agents.filter((a) => a.status === "paused").map((a) => ctx.agents.resume(a.id, companyId))
        );
        return { action, count: results.filter((r) => r.status === "fulfilled").length };
      }

      if (action === "start-all") {
        // ENFORCEMENT: Collect all issueIds owned by an active Workflow Run that
        // are NOT yet in "ready" or "running" status inside the run. These must
        // NOT be woken by Start All — the DAG orchestrator is the only authority.
        const allRuns = await readRunsIndex(ctx, companyId);
        const blockedByRun = new Set<string>();
        for (const summary of allRuns) {
          if (summary.status !== "running" && summary.status !== "waiting_approval" && summary.status !== "paused") continue;
          const run = await readRun(ctx, companyId, summary.id);
          if (!run) continue;
          for (const state of Object.values(run.nodeExecutionStates)) {
            const ownedIds = state.issueIds.length > 0 ? state.issueIds : (state.issueId ? [state.issueId] : []);
            // If the node is not "ready" or "running", it must not be woken externally
            if (!["ready", "running"].includes(state.status)) {
              for (const iid of ownedIds) blockedByRun.add(iid);
            }
          }
        }

        const issues = await ctx.issues.list({ companyId, limit: 500, offset: 0 });
        const runnable = issues.filter((i) =>
          i.assigneeAgentId &&
          ["todo", "backlog"].includes(i.status) &&
          !blockedByRun.has(i.id)  // ← Gate: skip run-owned but dependency-blocked tasks
        );
        const skippedCount = issues.filter((i) => i.assigneeAgentId && ["todo", "backlog"].includes(i.status) && blockedByRun.has(i.id)).length;

        const results = await Promise.allSettled(
          runnable.map((issue) =>
            ctx.issues.requestWakeup(issue.id, companyId, {
              reason: "Agent Control Center: Start All requested (Execution Gate cleared)",
              actorUserId: actionContext.actor.userId
            })
          )
        );
        return {
          action,
          count: results.filter((r) => r.status === "fulfilled").length,
          skippedDueToWorkflowGate: skippedCount,
          message: skippedCount > 0 ? `${skippedCount} task(s) skipped — they are owned by an active Workflow Run and must be dispatched by the DAG orchestrator in dependency order.` : undefined
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
        const results = await Promise.allSettled(
          failed.map((issue) =>
            ctx.issues.requestWakeup(issue.id, companyId, {
              reason: "Agent Control Center: Retry Failed requested",
              actorUserId: actionContext.actor.userId
            })
          )
        );
        return { action, count: results.filter((r) => r.status === "fulfilled").length };
      }

      if (action === "agent-pause" && agentId) {
        const agent = await ctx.agents.pause(agentId, companyId);
        return { action, agent };
      }

      if (action === "agent-resume" && agentId) {
        const agent = await ctx.agents.resume(agentId, companyId);
        return { action, agent };
      }

      if (action === "agent-wakeup" && agentId) {
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
          return { action, res, allowed: true };
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
              return { action, res, issueId: candidate.id, allowed: true };
            }
          }
          return { action, message: "No runnable issue available for this agent that passes the Workflow Execution Gate", allowed: false };
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

