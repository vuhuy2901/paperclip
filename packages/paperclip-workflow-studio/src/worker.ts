import { randomUUID } from "node:crypto";
import {
  definePlugin,
  runWorker,
  type PluginContext,
  type PluginPerformActionContext
} from "@paperclipai/plugin-sdk";
import type { Agent, Issue, Project } from "@paperclipai/shared";
import type {
  BootstrapData,
  MonitorNode,
  ProjectWorkflowBinding,
  ProjectWorkflowData,
  ValidationIssue,
  ValidationResult,
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowIndexEntry,
  WorkflowNode,
  WorkflowNodeData
} from "./types.js";

const INDEX_KEY = "workflow-index";
const NAMESPACE = "workflow-studio";
const PROJECT_BINDING_KEY = "project-workflow-binding";

function requiredString(value: unknown, name: string): string {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${name} is required`);
  return value.trim();
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
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

function validateGraph(workflow: WorkflowDefinition): ValidationResult {
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

function createLifecycleTemplate(companyId: string, agents: Agent[]): WorkflowDefinition {
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

const plugin = definePlugin({
  async setup(ctx) {
    ctx.data.register("bootstrap", async (params): Promise<BootstrapData> => {
      const companyId = requiredString(params.companyId, "companyId");
      const projectId = optionalString(params.projectId);
      const [projects, agents, issues, workflows] = await Promise.all([
        ctx.projects.list({ companyId, limit: 200, offset: 0 }),
        ctx.agents.list({ companyId, limit: 200, offset: 0 }),
        ctx.issues.list({ companyId, projectId: projectId ?? undefined, limit: 500, offset: 0 }),
        readIndex(ctx, companyId)
      ]);
      return {
        projects: projects as unknown as Project[],
        agents: agents as unknown as Agent[],
        issues: issues as unknown as Issue[],
        workflows
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
      const [project, workflows, agents, binding] = await Promise.all([
        ctx.projects.get(projectId, companyId),
        readIndex(ctx, companyId),
        ctx.agents.list({ companyId, limit: 200, offset: 0 }),
        readProjectBinding(ctx, projectId)
      ]);
      if (!project) throw new Error("Project not found");
      return {
        project: project as unknown as ProjectWorkflowData["project"],
        workflows,
        agents: agents as unknown as ProjectWorkflowData["agents"],
        binding,
        monitor: binding ? await monitorWorkflow(ctx, binding.workflow) : []
      };
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
  },

  async onHealth() {
    return { status: "ok", message: "AI Workflow Studio worker is ready" };
  }
});

export default plugin;
runWorker(plugin, import.meta.url);
