import { definePlugin, runWorker } from "@paperclipai/plugin-sdk";
import { randomUUID } from "node:crypto";
import { compileTaskPlan, isExecutableStep } from './workflow-graph';

const NAMESPACE = "native-workflow-designer";
const INDEX_KEY = "templates";
const ORIGIN_KIND = "plugin:ai-company-native-workflow";

type TemplateNode = {
  id: string;
  type: "workflowNode";
  position: { x: number; y: number };
  data: {
    kind: "task" | "start" | "end" | "parallel" | "join" | "approval";
    title: string;
    description: string;
    agentId: string | null;
    agentName: string | null;
    agentRole: string | null;
    acceptanceCriteria: string;
    expectedOutputs: string;
    priority: string;
  };
};
type TemplateEdge = { id: string; source: string; target: string };
type WorkflowTemplate = {
  id: string;
  companyId: string;
  name: string;
  description: string;
  version: number;
  status: "draft" | "published";
  nodes: TemplateNode[];
  edges: TemplateEdge[];
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
};

const requiredString = (value: unknown, name: string) => {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${name} is required`);
  return value.trim();
};

async function getTemplates(ctx: any, companyId: string): Promise<WorkflowTemplate[]> {
  const value = await ctx.state.get({ scopeKind: "company", scopeId: companyId, namespace: NAMESPACE, stateKey: INDEX_KEY });
  return Array.isArray(value) ? value : [];
}

async function setTemplates(ctx: any, companyId: string, templates: WorkflowTemplate[]) {
  await ctx.state.set({ scopeKind: "company", scopeId: companyId, namespace: NAMESPACE, stateKey: INDEX_KEY }, templates);
}

function buildDefaultSdlcTemplate(companyId: string, agents: any[]): WorkflowTemplate {
  const byName = new Map(agents.map((a: any) => [a.name, a]));
  const byRole = new Map(agents.map((a: any) => [a.role || a.title, a]));
  const findAgent = (name: string, roleAlt?: string) => byName.get(name) || (roleAlt ? byRole.get(roleAlt) : null) || null;

  const po = findAgent('PO', 'Product Owner');
  const pm = findAgent('Project Manager', 'PM');
  const arch = findAgent('Solution Architect', 'Architect');
  const backend = findAgent('Backend Engineer', 'Backend Developer');
  const frontend = findAgent('Frontend Engineer', 'Frontend Developer');
  const reviewer = findAgent('Code Reviewer', 'Security');
  const qa = findAgent('QA Tester', 'Tester');
  const devops = findAgent('DevOps Engineer', 'DevOps');

  const makeTask = (id: string, x: number, y: number, agent: any, title: string, desc: string, ac: string, outputs: string, priority = 'high', kind: 'task' | 'approval' = 'task'): TemplateNode => ({
    id,
    type: 'workflowNode',
    position: { x, y },
    data: {
      kind,
      title,
      description: desc,
      agentId: agent?.id ?? null,
      agentName: agent?.name ?? null,
      agentRole: agent?.title ?? agent?.role ?? null,
      acceptanceCriteria: ac,
      expectedOutputs: outputs,
      priority,
    },
  });

  const makeControl = (id: string, x: number, y: number, kind: 'start' | 'end' | 'parallel' | 'join', title: string, desc: string): TemplateNode => ({
    id,
    type: 'workflowNode',
    position: { x, y },
    data: {
      kind,
      title,
      description: desc,
      agentId: null,
      agentName: null,
      agentRole: null,
      acceptanceCriteria: '',
      expectedOutputs: '',
      priority: 'medium',
    },
  });

  const nodes: TemplateNode[] = [
    makeTask('po-requirements', 0, 240, po, 'PO confirms requirements', 'Clarify the CEO request, define product scope, priorities and measurable acceptance criteria.', 'Scope, priorities and acceptance criteria are explicit and approved for planning.', 'Product requirements and acceptance criteria.', 'high'),
    makeTask('pm-plan', 280, 240, pm, 'PM creates delivery plan', 'Break the accepted requirement into architecture and design, implementation, review, test and release work.', 'Plan names owners, dependencies, risks and delivery checkpoints.', 'Delivery plan and task breakdown.', 'high'),
    makeTask('architecture', 560, 240, arch, 'Architecture and product design', 'Define system boundaries, data flow, API contracts, security constraints, user flows, responsive screens, interaction states, visual system and implementation-ready handoffs.', 'Backend and frontend contracts are implementable; UI states and acceptance criteria are complete; key risks are resolved.', 'Architecture decision record, API contract, data design, user flows, wireframes, states and visual specification.', 'high'),
    makeTask('backend', 1100, 100, backend, 'Backend implementation', 'Implement services, APIs, persistence and migrations against the approved architecture.', 'Backend meets the API contract, handles errors and includes implementation evidence.', 'Backend code, migrations and API verification evidence.', 'high'),
    makeTask('frontend', 1100, 380, frontend, 'Frontend implementation', 'Implement the Solution Architect design specification against the architecture and API contracts.', 'UI matches the approved specification, covers required states and integrates with the real API.', 'Frontend code and UI integration evidence.', 'high'),
    makeControl('implementation-join', 1400, 240, 'join', 'Implementation complete', 'Wait for both Backend and Frontend implementation before review.'),
    makeTask('code-review', 1650, 240, reviewer, 'Code review', 'Review the combined implementation for correctness, security, maintainability and regression risk.', 'Blocking findings are resolved and approval evidence is recorded.', 'Review findings and approval evidence.', 'high'),
    makeTask('qa', 1910, 240, qa, 'QA verification', 'Run functional, integration and regression verification against the PO acceptance criteria.', 'Acceptance criteria pass and defects are resolved or explicitly accepted.', 'Test report, defect evidence and acceptance result.', 'high'),
    makeTask('deploy', 2170, 240, devops, 'Deployment', 'Prepare and execute deployment with health checks and rollback evidence.', 'Deployment is healthy and rollback instructions are verified.', 'Deployment record, health checks and rollback evidence.', 'high'),
    makeTask('po-acceptance', 2430, 240, po, 'PO acceptance', 'Validate the delivered result against the original product requirements and acceptance criteria.', 'PO records acceptance or returns concrete gaps for a new workflow revision.', 'Product acceptance decision.', 'high', 'approval'),
    makeControl('complete', 2700, 240, 'end', 'Workflow complete', 'The accepted delivery is complete.'),
  ];

  const pairs = [
    ['po-requirements', 'pm-plan'],
    ['pm-plan', 'architecture'],
    ['architecture', 'backend'],
    ['architecture', 'frontend'],
    ['backend', 'implementation-join'],
    ['frontend', 'implementation-join'],
    ['implementation-join', 'code-review'],
    ['code-review', 'qa'],
    ['qa', 'deploy'],
    ['deploy', 'po-acceptance'],
    ['po-acceptance', 'complete'],
  ];
  const edges: TemplateEdge[] = pairs.map(([source, target]) => ({ id: `${source}->${target}`, source, target, type: 'smoothstep' }));
  const now = new Date().toISOString();

  return {
    id: 'default-sdlc-workflow',
    companyId,
    name: 'AI Software Development Lifecycle',
    description: 'PO-led native delivery workflow where Solution Architect owns architecture and all product/UI design, followed by parallel Backend and Frontend implementation, joined review, QA, deployment and PO acceptance.',
    version: 1,
    status: 'published',
    nodes,
    edges,
    createdAt: now,
    updatedAt: now,
  };
}

async function getOrSeedTemplates(ctx: any, companyId: string, agents: any[]): Promise<WorkflowTemplate[]> {
  let list = await getTemplates(ctx, companyId);
  const active = list.filter(t => !t.archivedAt);
  if (active.length === 0) {
    const defaultTemplate = buildDefaultSdlcTemplate(companyId, agents);
    list = [defaultTemplate, ...list];
    await setTemplates(ctx, companyId, list);
  }
  return list;
}

function validateTemplate(template: WorkflowTemplate, agents: any[], publishing = true) {
  const errors: string[] = [];
  if (!template.name.trim()) errors.push("Template name is required.");
  if (publishing && !template.nodes.some(isExecutableStep)) errors.push("Add at least one task step.");
  const nodeIds = new Set(template.nodes.map((node) => node.id));
  const agentIds = new Set(agents.filter((agent) => agent.status !== "terminated").map((agent) => agent.id));
  for (const node of template.nodes) {
    if (!node.data.title.trim()) errors.push(`Step ${node.id} needs a title.`);
    if (!['task', 'start', 'end', 'parallel', 'join', 'approval'].includes(node.data.kind)) errors.push(`Step "${node.data.title}" has an unsupported type.`);
    if (publishing && isExecutableStep(node) && (!node.data.agentId || !agentIds.has(node.data.agentId))) errors.push(`Step "${node.data.title}" must use a current native agent.`);
  }
  for (const edge of template.edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) errors.push(`Edge ${edge.id} points to a missing step.`);
    if (edge.source === edge.target) errors.push(`Edge ${edge.id} is a self dependency.`);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    const cycle = template.edges.filter((edge) => edge.source === id).some((edge) => visit(edge.target));
    visiting.delete(id); visited.add(id); return cycle;
  };
  if (template.nodes.some((node) => visit(node.id))) errors.push("Workflow dependencies contain a cycle.");
  return { valid: errors.length === 0, errors };
}

function actorFrom(actionContext: any) {
  return {
    actorUserId: actionContext?.actor?.userId ?? null,
    actorAgentId: actionContext?.actor?.agentId ?? null,
    actorRunId: actionContext?.actor?.runId ?? null,
  };
}

const plugin = definePlugin({
  async setup(ctx) {
    ctx.data.register("workflow-designer-bootstrap", async ({ companyId }: any) => {
      const company = requiredString(companyId, "companyId");
      const [agents, projects] = await Promise.all([
        ctx.agents.list({ companyId: company, limit: 200, offset: 0 }),
        ctx.projects.list({ companyId: company, limit: 200, offset: 0 }),
      ]);
      const templates = await getOrSeedTemplates(ctx, company, agents);
      return { agents, projects, templates: templates.filter(template => !template.archivedAt) };
    });

    ctx.data.register("workflow-designer-live", async ({ companyId, projectId }: any) => {
      const company = requiredString(companyId, "companyId");
      const issues = await ctx.issues.list({ companyId: company, projectId: projectId || undefined, includePluginOperations: true, limit: 500, offset: 0 });
      const relations: Record<string, unknown> = {};
      for (const issue of issues) relations[issue.id] = await ctx.issues.relations.get(issue.id, company);
      return { issues, relations };
    });

    ctx.actions.register("save-template", async (params: any, actionContext: any) => {
      const companyId = requiredString(actionContext?.companyId ?? params.companyId, "companyId");
      const submitted = params.template as WorkflowTemplate;
      if (!submitted || submitted.companyId !== companyId) throw new Error("Template company scope is invalid.");
      const agents = await ctx.agents.list({ companyId, limit: 200, offset: 0 });
      const validation = validateTemplate(submitted, agents, submitted.status === 'published');
      if (!validation.valid) throw new Error(validation.errors.join(" "));
      const current = await getTemplates(ctx, companyId);
      const now = new Date().toISOString();
      const existing = current.find((template) => template.id === submitted.id);
      const saved = { ...submitted, version: (existing?.version ?? 0) + 1, status: submitted.status ?? "draft", updatedAt: now, createdAt: existing?.createdAt ?? now };
      await setTemplates(ctx, companyId, [saved, ...current.filter((template) => template.id !== saved.id)]);
      await ctx.activity.log({ companyId, message: `Saved native workflow template ${saved.name}`, entityType: "workflow-template", entityId: saved.id, metadata: { version: saved.version } });
      return { template: saved, validation };
    });

    ctx.actions.register("create-template", async (params: any, actionContext: any) => {
      const companyId = requiredString(actionContext?.companyId ?? params.companyId, "companyId");
      const now = new Date().toISOString();
      const template: WorkflowTemplate = { id: randomUUID(), companyId, name: String(params.name ?? "Untitled workflow"), description: "Native Paperclip task template.", version: 1, status: "draft", nodes: [], edges: [], createdAt: now, updatedAt: now };
      await setTemplates(ctx, companyId, [template, ...(await getTemplates(ctx, companyId))]);
      return { template };
    });

    ctx.actions.register('rename-template', async (params: any, actionContext: any) => {
      const companyId = requiredString(actionContext?.companyId ?? params.companyId, 'companyId');
      const templates = await getTemplates(ctx, companyId);
      const template = templates.find(item => item.id === params.templateId && !item.archivedAt);
      if (!template) throw new Error('Workflow not found.');
      const renamed = { ...template, name: requiredString(params.name, 'name'), updatedAt: new Date().toISOString() };
      await setTemplates(ctx, companyId, templates.map(item => item.id === renamed.id ? renamed : item));
      return { template: renamed };
    });

    ctx.actions.register('duplicate-template', async (params: any, actionContext: any) => {
      const companyId = requiredString(actionContext?.companyId ?? params.companyId, 'companyId');
      const templates = await getTemplates(ctx, companyId);
      const source = templates.find(item => item.id === params.templateId && !item.archivedAt);
      if (!source) throw new Error('Workflow not found.');
      const now = new Date().toISOString();
      const template = { ...source, id: randomUUID(), name: `${source.name} copy`, status: 'draft' as const, version: 1, createdAt: now, updatedAt: now };
      await setTemplates(ctx, companyId, [template, ...templates]);
      return { template };
    });

    ctx.actions.register('archive-template', async (params: any, actionContext: any) => {
      const companyId = requiredString(actionContext?.companyId ?? params.companyId, 'companyId');
      const templates = await getTemplates(ctx, companyId);
      const template = templates.find(item => item.id === params.templateId);
      if (!template) throw new Error('Workflow not found.');
      await setTemplates(ctx, companyId, templates.map(item => item.id === template.id ? { ...item, archivedAt: new Date().toISOString() } : item));
      return { archived: true };
    });

    ctx.actions.register("apply-template", async (params: any, actionContext: any) => {
      const companyId = requiredString(actionContext?.companyId ?? params.companyId, "companyId");
      const projectId = requiredString(params.projectId, "projectId");
      const templateId = requiredString(params.templateId, "templateId");
      const requirement = requiredString(params.requirement, "requirement");
      const templates = await getTemplates(ctx, companyId);
      const template = templates.find((item) => item.id === templateId);
      if (!template || template.archivedAt || template.status !== "published") throw new Error("Choose a published workflow template.");
      const agents = await ctx.agents.list({ companyId, limit: 200, offset: 0 });
      const validation = validateTemplate(template, agents);
      if (!validation.valid) throw new Error(validation.errors.join(" "));
      const originId = `template:${template.id}:project:${projectId}`;
      const existing = await ctx.issues.list({ companyId, projectId, originKind: ORIGIN_KIND as any, originId, includePluginOperations: true, limit: 500, offset: 0 });
      const existingRoot = existing.find((issue: any) => issue.originId === originId && issue.parentId == null);
      const plan = compileTaskPlan(template.nodes, template.edges);
      const root = existingRoot ?? await ctx.issues.create({ companyId, projectId, title: `Workflow: ${template.name}`, description: `Native workflow template ${template.name} v${template.version}.\n\nRequirement:\n${requirement}`, status: "done", originKind: ORIGIN_KIND as any, originId, actor: actorFrom(actionContext) });
      const byNode = new Map<string, any>();
      let createdCount = 0;
      for (const { node, blockedByStepIds } of plan) {
        const nodeOriginId = `${originId}:node:${node.id}`;
        const existingIssue = existing.find((issue: any) => issue.originId === nodeOriginId);
        if (existingIssue) { byNode.set(node.id, existingIssue); continue; }
        const predecessors = blockedByStepIds.map(id => byNode.get(id)?.id);
        if (predecessors.some(id => !id)) throw new Error(`Missing predecessor for step ${node.id}. Retry template application.`);
        const data = node.data;
        const workflowContract = [
          'Workflow execution contract:',
          `- Step type: ${data.kind}. Responsible agent: ${data.agentName ?? data.agentRole ?? data.agentId}.`,
          '- Paperclip blocker relationships are authoritative. Do not start or claim this task until Paperclip marks it actionable and every blocker is done.',
          '- Complete only this assigned step. Do not bypass, remove, or replace workflow dependencies and do not reassign the work outside the native reporting chain.',
          '- Before marking done, attach concrete evidence for every acceptance criterion and expected output. If an input is missing, keep the task blocked and report the exact blocker upward.',
        ].join('\n');
        const issue = await ctx.issues.create({
          companyId, projectId, parentId: root.id, title: data.title,
          description: `${data.description}\n\n${workflowContract}\n\nAcceptance criteria:\n${data.acceptanceCriteria || "Not specified"}\n\nExpected outputs:\n${data.expectedOutputs || "Not specified"}\n\nNative workflow template: ${template.id} v${template.version}. Native Paperclip owns checkout, blocker resolution and wakeups.`,
          status: "todo", priority: (data.priority || "medium") as any, assigneeAgentId: data.agentId ?? undefined,
          originKind: ORIGIN_KIND as any, originId: nodeOriginId, blockedByIssueIds: predecessors,
          actor: actorFrom(actionContext),
        });
        byNode.set(node.id, issue);
        createdCount++;
      }
      const created = [root, ...plan.map(({ node }) => byNode.get(node.id))];
      await ctx.activity.log({ companyId, message: `Applied native workflow template ${template.name} to project ${projectId}`, entityType: "project", entityId: projectId, metadata: { templateId, issueIds: created.map((issue) => issue.id) } });
      return { idempotent: !!existingRoot && createdCount === 0, rootIssueId: root.id, issues: created, dependencies: template.edges };
    });
  },
  async onHealth() { return { status: "ok", message: "Template-only native workflow plugin; Paperclip owns execution." }; },
});

export default plugin;
runWorker(plugin, import.meta.url);
