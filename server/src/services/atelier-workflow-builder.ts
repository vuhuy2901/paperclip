import { and, desc, eq, max, sql } from "drizzle-orm";
import { agents, atelierWorkflowRuns, atelierWorkflowStageExecutions, issues, workflows, type Db } from "@paperclipai/db";
import { conflict, forbidden, notFound, unprocessable } from "../errors.js";
const ATELIER_COMPANY_WORKFLOW_NAME = "Atelier Company Workflow";

export const ATELIER_NODE_TYPES = [
  "START", "AGENT_TASK", "TOOL_EXECUTION", "HUMAN_INPUT", "APPROVAL_GATE",
  "CONDITION", "PARALLEL_BRANCH", "JOIN", "RESEARCH", "VALIDATION",
  "RETRY_RECOVERY", "NOTIFICATION", "EXPORT", "END",
] as const;
export type AtelierNodeType = (typeof ATELIER_NODE_TYPES)[number];

export type AtelierStepSettings = {
  retry?: { maxAttempts: number; backoffSeconds?: number };
  logging?: { enabled: boolean; level?: "info" | "debug" | "error" };
  notifications?: { onStart?: boolean; onComplete?: boolean; onError?: boolean; channel?: string };
};

export type AtelierOptionalCostBomConfig = {
  id: string;
  name: string;
  enabled: boolean;
  runsAfterApproval: boolean;
  requiredRole: string;
  taskType: string;
  capability: string;
  description?: string;
};

export type AtelierWorkflowNode = {
  id: string;
  type: AtelierNodeType;
  name: string;
  description?: string;
  prompt?: string;
  stepNumber?: number;
  totalSteps?: number;
  stepLabel?: string;
  sourceNodes?: string[];
  includesValidator?: boolean;
  position?: { x: number; y: number };
  taskType?: string;
  requiredRole?: string;
  assignedAgentId?: string | null;
  agentSelector?: { strategy: "CAPABILITY_MATCH" | "EXPLICIT"; capability?: string };
  requiredInputs?: string[];
  requiredOutputs?: string[];
  requiredArtifacts?: string[];
  completionCriteria?: string[];
  allowedTools?: string[];
  timeoutSeconds?: number;
  retryPolicy?: { maxAttempts: number; backoffSeconds?: number };
  stepSettings?: AtelierStepSettings;
  approval?: { required: boolean; approverRole?: string; approverAgentIds?: string[] };
  conditionOutcomes?: string[];
};

export type AtelierWorkflowEdge = { id: string; source: string; target: string; outcome?: string };
export type AtelierEditableDefinition = {
  schemaVersion: 2;
  key: string;
  name: string;
  version: number;
  nodes: AtelierWorkflowNode[];
  edges: AtelierWorkflowEdge[];
  optionalSteps?: {
    costBomAfterApproval?: AtelierOptionalCostBomConfig;
  };
  canvas?: { snapToGrid?: boolean; viewport?: { x: number; y: number; zoom: number } };
  gatePolicy?: Record<string, unknown>;
  stateMachine?: string[];
};

export type WorkflowValidationIssue = {
  code: string;
  severity: "error" | "warning";
  message: string;
  nodeId?: string;
  edgeId?: string;
};

export type AtelierAgentCapability = {
  agentId: string;
  name: string;
  status: string;
  lifecycleState: string;
  role: string;
  roleKeys: string[];
  capabilities: string[];
  allowedTaskTypes: string[];
  allowedTools: string[];
  atelierAgentKey: string | null;
  available: boolean;
};

const DEFAULT_CAPABILITIES: Record<string, Omit<AtelierAgentCapability, "agentId" | "name" | "status" | "lifecycleState" | "role" | "atelierAgentKey" | "available">> = {
  agent_concierge: { roleKeys: ["chief_architect", "project_manager"], capabilities: ["project.intake", "workflow.coordinate", "design.final_review"], allowedTaskTypes: ["CHIEF_INTAKE", "PROJECT_COORDINATION", "FINAL_REVIEW"], allowedTools: [] },
  agent_floorplan: { roleKeys: ["floor_plan_agent"], capabilities: ["floorplan.parse", "floorplan.scale_gate"], allowedTaskTypes: ["FLOOR_PLAN_RECOGNITION", "SCALE_CONFIRMATION"], allowedTools: [] },
  agent_geometry: { roleKeys: ["geometry_agent", "bim_agent"], capabilities: ["bim.scenegraph", "geometry.validate"], allowedTaskTypes: ["BIM_GEOMETRY"], allowedTools: [] },
  agent_furniture: { roleKeys: ["furniture_agent"], capabilities: ["furniture.plan", "furniture.smart_fit"], allowedTaskTypes: ["FURNITURE_PLANNING", "SMART_FIT_PLACEMENT"], allowedTools: [] },
  agent_style: { roleKeys: ["style_agent", "material_agent"], capabilities: ["style.research", "materials.specify"], allowedTaskTypes: ["STYLE_RESEARCH", "MATERIAL_RESEARCH"], allowedTools: [] },
  agent_render: { roleKeys: ["render_agent"], capabilities: ["render.execute"], allowedTaskTypes: ["RENDER"], allowedTools: [] },
  agent_research: { roleKeys: ["research_agent", "asset_research_agent"], capabilities: ["product.research", "asset.discover"], allowedTaskTypes: ["PRODUCT_RESEARCH", "ASSET_DISCOVERY"], allowedTools: [] },
  agent_cost: { roleKeys: ["inventory_agent", "cost_agent"], capabilities: ["inventory.bom", "cost.calculate"], allowedTaskTypes: ["BOM", "COST_CALCULATION"], allowedTools: [] },
  agent_qa: { roleKeys: ["qa_agent"], capabilities: ["spatial.qa", "render.qa", "inventory.qa", "acceptance.validate"], allowedTaskTypes: ["SPATIAL_QA", "RENDER_QA", "INVENTORY_QA", "ACCEPTANCE_VALIDATION"], allowedTools: [] },
};

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

export async function listAtelierAgentCapabilities(db: Db, companyId: string): Promise<AtelierAgentCapability[]> {
  const rows = await db.select().from(agents).where(eq(agents.companyId, companyId));
  return rows.map((agent) => {
    const metadata = (agent.metadata ?? {}) as Record<string, unknown>;
    const permissions = (agent.permissions ?? {}) as Record<string, unknown>;
    const key = typeof metadata.atelierAgentKey === "string" ? metadata.atelierAgentKey : null;
    const defaults = key ? DEFAULT_CAPABILITIES[key] : undefined;
    const explicit = metadata.atelierCapabilities && typeof metadata.atelierCapabilities === "object"
      ? metadata.atelierCapabilities as Record<string, unknown>
      : {};
    return {
      agentId: agent.id,
      name: agent.name,
      status: agent.status,
      lifecycleState: agent.lifecycleState,
      role: agent.role,
      roleKeys: stringArray(explicit.roleKeys).length ? stringArray(explicit.roleKeys) : defaults?.roleKeys ?? [],
      capabilities: stringArray(explicit.capabilities).length ? stringArray(explicit.capabilities) : defaults?.capabilities ?? [],
      allowedTaskTypes: stringArray(explicit.allowedTaskTypes).length ? stringArray(explicit.allowedTaskTypes) : defaults?.allowedTaskTypes ?? [],
      allowedTools: stringArray(explicit.allowedTools).length ? stringArray(explicit.allowedTools) : stringArray(permissions.allowedTools),
      atelierAgentKey: key,
      available: ["idle", "active", "running"].includes(agent.status) && agent.lifecycleState === "ready",
    };
  });
}

function asDefinition(value: unknown): AtelierEditableDefinition | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (input.schemaVersion !== 2 || !Array.isArray(input.nodes) || !Array.isArray(input.edges)) return null;
  return input as unknown as AtelierEditableDefinition;
}

const stageTaskType: Record<string, { taskType: string; role: string; capability: string }> = {
  floorplan: { taskType: "FLOOR_PLAN_RECOGNITION", role: "floor_plan_agent", capability: "floorplan.parse" },
  geometry: { taskType: "BIM_GEOMETRY", role: "geometry_agent", capability: "bim.scenegraph" },
  furniture: { taskType: "FURNITURE_PLANNING", role: "furniture_agent", capability: "furniture.plan" },
  style: { taskType: "STYLE_RESEARCH", role: "style_agent", capability: "style.research" },
  render: { taskType: "RENDER", role: "render_agent", capability: "render.execute" },
  cost: { taskType: "COST_CALCULATION", role: "cost_agent", capability: "cost.calculate" },
  qa: { taskType: "SPATIAL_QA", role: "qa_agent", capability: "spatial.qa" },
  final_review: { taskType: "FINAL_REVIEW", role: "chief_architect", capability: "design.final_review" },
};

export function upgradeLegacyAtelierDefinition(value: unknown, version: number, name = ATELIER_COMPANY_WORKFLOW_NAME): AtelierEditableDefinition {
  const current = asDefinition(value);
  if (current) return { ...current, version, name };
  const legacy = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const stages = Array.isArray(legacy.stages) ? legacy.stages as Array<Record<string, unknown>> : [];
  const agentTaskNodes: AtelierWorkflowNode[] = stages.map((stage, index) => {
    const id = String(stage.key ?? `stage_${index + 1}`);
    const mapping = stageTaskType[id] ?? { taskType: id.toUpperCase(), role: String(stage.agentKey ?? "specialist"), capability: id };
    const gate = stage.gate && typeof stage.gate === "object" ? stage.gate as Record<string, unknown> : {};
    return {
      id,
      type: "AGENT_TASK",
      name: String(stage.label ?? id),
      description: typeof stage.description === "string" ? stage.description : "",
      position: { x: 320 + (index % 2) * 280, y: 140 + index * 150 },
      taskType: mapping.taskType,
      requiredRole: mapping.role,
      agentSelector: { strategy: "CAPABILITY_MATCH", capability: mapping.capability },
      requiredInputs: stringArray(stage.requiredInputs),
      requiredOutputs: [`${id}_output`],
      requiredArtifacts: gate.outputReferences === true ? [`${id}_artifact`] : [],
      completionCriteria: [`${id}_output is persisted and validated`],
      retryPolicy: { maxAttempts: 2, backoffSeconds: 30 },
      approval: { required: gate.approval === true, approverRole: gate.approval === true ? "authorized_approver" : undefined },
    };
  });
  const start: AtelierWorkflowNode = { id: "start", type: "START", name: "Chief Architect Intake", position: { x: 40, y: 140 }, requiredInputs: ["project_brief"] };
  const end: AtelierWorkflowNode = { id: "end", type: "END", name: "Export and Delivery", position: { x: 880, y: 140 + Math.max(1, stages.length) * 150 }, requiredOutputs: ["delivery_package"] };
  const legacyEdges = Array.isArray(legacy.edges) ? legacy.edges as Array<Record<string, unknown>> : [];
  const edges: AtelierWorkflowEdge[] = legacyEdges.map((edge, index) => ({ id: `edge_${index + 1}`, source: String(edge.from), target: String(edge.to) }));
  const dependencyTargets = new Set(edges.map((edge) => edge.target));
  for (const node of agentTaskNodes.filter((candidate) => !dependencyTargets.has(candidate.id))) edges.push({ id: `edge_start_${node.id}`, source: start.id, target: node.id });
  const sources = new Set(edges.map((edge) => edge.source));
  for (const node of agentTaskNodes.filter((candidate) => !sources.has(candidate.id))) edges.push({ id: `edge_${node.id}_end`, source: node.id, target: end.id });
  return { schemaVersion: 2, key: `atelier-company-workflow:v${version}`, name, version, nodes: [start, ...agentTaskNodes, end], edges, canvas: { snapToGrid: true }, gatePolicy: legacy.gatePolicy as Record<string, unknown> ?? {}, stateMachine: stringArray(legacy.stateMachine) };
}

export function buildSimplifiedWorkflowV6Definition(
  version = 6,
  name = ATELIER_COMPANY_WORKFLOW_NAME,
): AtelierEditableDefinition {
  return {
    schemaVersion: 2,
    key: `atelier-company-workflow:v${version}`,
    name,
    version,
    nodes: [
      {
        id: "intake",
        type: "START",
        name: "1. Nhận bản vẽ",
        stepNumber: 1,
        totalSteps: 5,
        stepLabel: "Bước 1/5",
        sourceNodes: ["start (Chief Architect Intake)"],
        requiredRole: "chief_architect",
        description: "Tiếp nhận yêu cầu dự án, bản vẽ 2D hoặc thông số phòng từ Chief Architect Intake.",
        position: { x: 40, y: 180 },
        requiredInputs: ["project_brief", "floor_plan_or_dimensions"],
        requiredOutputs: ["validated_intake"],
        completionCriteria: ["Đã có bản vẽ hoặc kích thước phòng hợp lệ"],
        stepSettings: {
          retry: { maxAttempts: 1, backoffSeconds: 0 },
          logging: { enabled: true, level: "info" },
          notifications: { onStart: false, onComplete: true, onError: true, channel: "execution_tab" },
        },
      },
      {
        id: "build_scene",
        type: "AGENT_TASK",
        name: "2. Dựng scene",
        stepNumber: 2,
        totalSteps: 5,
        stepLabel: "Bước 2/5",
        sourceNodes: ["floorplan (Floor Plan)", "geometry (Geometry / BIM)"],
        includesValidator: true,
        taskType: "BIM_GEOMETRY",
        requiredRole: "geometry_agent",
        agentSelector: { strategy: "CAPABILITY_MATCH", capability: "bim.scenegraph" },
        description: "Đọc mặt bằng, dựng khung phòng/tường/cửa/sàn 3D và chạy validator kiểm tra hình học.",
        position: { x: 360, y: 180 },
        requiredInputs: ["validated_intake"],
        requiredOutputs: ["scene_graph", "scene_validation_report"],
        requiredArtifacts: ["geometry_artifact"],
        completionCriteria: ["SceneGraph dựng xong và bộ validator PASS"],
        retryPolicy: { maxAttempts: 2, backoffSeconds: 15 },
        approval: { required: false },
        stepSettings: {
          retry: { maxAttempts: 2, backoffSeconds: 15 },
          logging: { enabled: true, level: "info" },
          notifications: { onStart: false, onComplete: true, onError: true, channel: "execution_tab" },
        },
      },
      {
        id: "style_and_furniture",
        type: "AGENT_TASK",
        name: "3. Chọn đồ & vật liệu",
        stepNumber: 3,
        totalSteps: 5,
        stepLabel: "Bước 3/5",
        sourceNodes: ["style (Style / Materials)", "furniture (Furniture)"],
        taskType: "STYLE_RESEARCH",
        requiredRole: "style_agent",
        agentSelector: { strategy: "CAPABILITY_MATCH", capability: "style.research" },
        description: "Bố trí nội thất không chồng lấn và gán vật liệu PBR đã chọn cho sàn, tường, đồ nội thất.",
        position: { x: 680, y: 180 },
        requiredInputs: ["scene_graph", "scene_validation_report"],
        requiredOutputs: ["furniture_layout", "material_assignments", "material_hash"],
        requiredArtifacts: ["style_furniture_artifact"],
        completionCriteria: ["Đã chọn đủ nội thất và vật liệu PBR (có material_hash)"],
        retryPolicy: { maxAttempts: 2, backoffSeconds: 15 },
        approval: { required: false },
        stepSettings: {
          retry: { maxAttempts: 2, backoffSeconds: 15 },
          logging: { enabled: true, level: "info" },
          notifications: { onStart: false, onComplete: true, onError: true, channel: "execution_tab" },
        },
      },
      {
        id: "render",
        type: "AGENT_TASK",
        name: "4. Render",
        stepNumber: 4,
        totalSteps: 5,
        stepLabel: "Bước 4/5",
        sourceNodes: ["render (Rendering Specialist)"],
        taskType: "RENDER",
        requiredRole: "render_agent",
        agentSelector: { strategy: "CAPABILITY_MATCH", capability: "render.execute" },
        description: "Chỉ chạy SAU khi Bước 3 hoàn tất; kết xuất ảnh Blender Cycles dùng đúng vật liệu đã chọn.",
        position: { x: 1000, y: 180 },
        requiredInputs: ["scene_graph", "material_assignments", "material_hash"],
        requiredOutputs: ["rendered_image_url", "material_hash_verified"],
        requiredArtifacts: ["render_artifact"],
        completionCriteria: [
          "Bước 3 (Chọn đồ & vật liệu) đã Hoàn thành trước khi bắt đầu",
          "Ảnh Cycles sử dụng đúng material_hash đã chọn",
        ],
        retryPolicy: { maxAttempts: 2, backoffSeconds: 30 },
        approval: { required: false },
        stepSettings: {
          retry: { maxAttempts: 2, backoffSeconds: 30 },
          logging: { enabled: true, level: "info" },
          notifications: { onStart: true, onComplete: true, onError: true, channel: "execution_tab" },
        },
      },
      {
        id: "qa_and_deliver",
        type: "END",
        name: "5. Kiểm tra & giao",
        stepNumber: 5,
        totalSteps: 5,
        stepLabel: "Bước 5/5",
        sourceNodes: ["qa (QA)", "final_review (Final Review)", "end (Export and Delivery)"],
        taskType: "FINAL_REVIEW",
        requiredRole: "qa_agent",
        description: "Kiểm tra QA ảnh render & scene, dừng ở cổng NGƯỜI DUYỆT trước khi xuất giao (agent không tự đóng).",
        position: { x: 1320, y: 180 },
        requiredInputs: ["rendered_image_url", "scene_validation_report"],
        requiredOutputs: ["qa_report", "human_approval_decision", "delivery_package"],
        requiredArtifacts: ["delivery_package"],
        completionCriteria: [
          "QA kiểm tra ảnh và scene PASS",
          "Có xác nhận từ cổng NGƯỜI DUYỆT trước khi xuất",
        ],
        approval: { required: true, approverRole: "authorized_approver" },
        stepSettings: {
          retry: { maxAttempts: 1, backoffSeconds: 0 },
          logging: { enabled: true, level: "info" },
          notifications: { onStart: false, onComplete: true, onError: true, channel: "execution_tab" },
        },
      },
    ],
    edges: [
      { id: "edge_1_2", source: "intake", target: "build_scene", outcome: "Đạt đầu vào" },
      { id: "edge_2_3", source: "build_scene", target: "style_and_furniture", outcome: "Validator đạt" },
      { id: "edge_3_4", source: "style_and_furniture", target: "render", outcome: "Đã chốt đồ & vật liệu" },
      { id: "edge_4_5", source: "render", target: "qa_and_deliver", outcome: "Render hoàn tất" },
    ],
    optionalSteps: {
      costBomAfterApproval: {
        id: "cost",
        name: "Cost/BOM (Tùy chọn sau duyệt)",
        enabled: false,
        runsAfterApproval: true,
        requiredRole: "cost_agent",
        taskType: "COST_CALCULATION",
        capability: "cost.calculate",
        description: "Bước tùy chọn: chỉ chạy SAU khi cổng NGƯỜI DUYỆT xác nhận Bước 5.",
      },
    },
    canvas: { snapToGrid: true },
    gatePolicy: {
      unknownData: "needs_input",
      noAutoDecision: true,
      agentCannotSelfCloseBeforeApproval: true,
      renderStrictlyAfterStep3: true,
    },
    stateMachine: ["Chờ", "Đang chạy", "Chờ duyệt", "Hoàn thành", "Lỗi", "Đã hủy"],
  };
}

export async function validateAtelierWorkflowDefinition(db: Db, companyId: string, value: unknown): Promise<{ valid: boolean; issues: WorkflowValidationIssue[]; definition: AtelierEditableDefinition | null }> {
  const definition = asDefinition(value);
  const issues: WorkflowValidationIssue[] = [];
  if (!definition) return { valid: false, definition: null, issues: [{ code: "invalid_schema", severity: "error", message: "Definition must use schemaVersion 2 with nodes and edges arrays." }] };
  const capabilities = await listAtelierAgentCapabilities(db, companyId);
  const byAgent = new Map(capabilities.map((item) => [item.agentId, item]));
  const ids = new Set<string>();
  for (const node of definition.nodes) {
    if (!node.id || ids.has(node.id)) issues.push({ code: "duplicate_node_id", severity: "error", message: `Node id '${node.id}' is missing or duplicated.`, nodeId: node.id });
    ids.add(node.id);
    if (!ATELIER_NODE_TYPES.includes(node.type)) issues.push({ code: "invalid_node_type", severity: "error", message: `Node '${node.id}' uses unsupported type.`, nodeId: node.id });
    if (node.type === "AGENT_TASK" || node.type === "RESEARCH" || node.type === "VALIDATION") {
      if (!node.taskType) issues.push({ code: "missing_task_type", severity: "error", message: "Agent node requires taskType.", nodeId: node.id });
      if (!node.requiredRole) issues.push({ code: "missing_required_role", severity: "error", message: "Agent node requires requiredRole.", nodeId: node.id });
      if (!node.requiredOutputs?.length) issues.push({ code: "missing_output_contract", severity: "error", message: "Agent node requires at least one output.", nodeId: node.id });
      if (!node.completionCriteria?.length) issues.push({ code: "missing_completion_criteria", severity: "error", message: "Agent node requires completion criteria.", nodeId: node.id });
      if (node.retryPolicy && (!Number.isInteger(node.retryPolicy.maxAttempts) || node.retryPolicy.maxAttempts < 1 || node.retryPolicy.maxAttempts > 10)) issues.push({ code: "invalid_retry_policy", severity: "error", message: "Retry maxAttempts must be between 1 and 10.", nodeId: node.id });
      if (node.stepSettings?.retry && (!Number.isInteger(node.stepSettings.retry.maxAttempts) || node.stepSettings.retry.maxAttempts < 1 || node.stepSettings.retry.maxAttempts > 10)) {
        issues.push({ code: "invalid_step_retry", severity: "error", message: "Số lần thử lại (stepSettings.retry.maxAttempts) phải từ 1 đến 10.", nodeId: node.id });
      }
      if (node.assignedAgentId) {
        const agent = byAgent.get(node.assignedAgentId);
        if (!agent) issues.push({ code: "agent_not_found", severity: "error", message: "Assigned agent does not exist.", nodeId: node.id });
        else {
          if (!agent.available) issues.push({ code: "agent_unavailable", severity: "error", message: `Agent '${agent.name}' is not available.`, nodeId: node.id });
          if (node.requiredRole && !agent.roleKeys.includes(node.requiredRole)) issues.push({ code: "role_mismatch", severity: "error", message: `Agent '${agent.name}' does not have role '${node.requiredRole}'.`, nodeId: node.id });
          if (node.taskType && !agent.allowedTaskTypes.includes(node.taskType)) issues.push({ code: "task_type_not_allowed", severity: "error", message: `Agent '${agent.name}' cannot perform '${node.taskType}'.`, nodeId: node.id });
          const requiredCapability = node.agentSelector?.capability;
          if (requiredCapability && !agent.capabilities.includes(requiredCapability)) issues.push({ code: "capability_missing", severity: "error", message: `Agent '${agent.name}' lacks '${requiredCapability}'.`, nodeId: node.id });
        }
      } else if (!node.agentSelector?.capability) issues.push({ code: "missing_agent_selector", severity: "error", message: "Agent node requires an assigned agent or capability selector.", nodeId: node.id });
    }
    if (node.type === "APPROVAL_GATE" && (!node.approval?.required || (!node.approval.approverRole && !node.approval.approverAgentIds?.length))) issues.push({ code: "missing_approver", severity: "error", message: "Approval gate requires an approver role or agent.", nodeId: node.id });
    if (node.type === "CONDITION" && (!node.conditionOutcomes || node.conditionOutcomes.length < 2)) issues.push({ code: "incomplete_condition", severity: "error", message: "Condition requires at least two outcomes.", nodeId: node.id });
  }
  const starts = definition.nodes.filter((node) => node.type === "START");
  const ends = definition.nodes.filter((node) => node.type === "END");
  if (starts.length !== 1) issues.push({ code: "start_count", severity: "error", message: "Workflow requires exactly one Start node." });
  if (ends.length !== 1) issues.push({ code: "end_count", severity: "error", message: "Workflow requires exactly one End node." });
  const outgoing = new Map<string, AtelierWorkflowEdge[]>();
  const incoming = new Map<string, AtelierWorkflowEdge[]>();
  for (const edge of definition.edges) {
    if (!ids.has(edge.source) || !ids.has(edge.target)) issues.push({ code: "dangling_edge", severity: "error", message: `Edge '${edge.id}' references a missing node.`, edgeId: edge.id });
    outgoing.set(edge.source, [...(outgoing.get(edge.source) ?? []), edge]);
    incoming.set(edge.target, [...(incoming.get(edge.target) ?? []), edge]);
  }
  for (const node of definition.nodes) {
    if (node.type === "JOIN" && (incoming.get(node.id)?.length ?? 0) < 2) issues.push({ code: "invalid_join", severity: "error", message: "Join requires at least two incoming edges.", nodeId: node.id });
    if (node.type === "CONDITION") {
      const outcomes = new Set((outgoing.get(node.id) ?? []).map((edge) => edge.outcome).filter(Boolean));
      for (const outcome of node.conditionOutcomes ?? []) if (!outcomes.has(outcome)) issues.push({ code: "missing_condition_branch", severity: "error", message: `Condition outcome '${outcome}' has no edge.`, nodeId: node.id });
    }
  }
  if (starts.length === 1) {
    const visited = new Set<string>(); const visiting = new Set<string>();
    const visit = (id: string) => { if (visiting.has(id)) { issues.push({ code: "cycle", severity: "error", message: `Cycle detected at '${id}'.`, nodeId: id }); return; } if (visited.has(id)) return; visiting.add(id); for (const edge of outgoing.get(id) ?? []) visit(edge.target); visiting.delete(id); visited.add(id); };
    visit(starts[0].id);
    for (const node of definition.nodes) if (!visited.has(node.id)) issues.push({ code: "unreachable_node", severity: "error", message: `Node '${node.name}' is unreachable from Start.`, nodeId: node.id });

    // Strict execution-order guarantee: Render cannot run before Step 3 (Chọn đồ & vật liệu) completes.
    const renderNodes = definition.nodes.filter((node) => node.id === "render" || node.taskType === "RENDER");
    const step3Nodes = definition.nodes.filter((node) => ["style_and_furniture", "style", "furniture"].includes(node.id));
    if (renderNodes.length > 0 && step3Nodes.length > 0) {
      const blockedIds = new Set(step3Nodes.map((item) => item.id));
      const withoutStep3 = new Set<string>();
      const queue = [starts[0].id];
      while (queue.length > 0) {
        const cur = queue.shift()!;
        if (withoutStep3.has(cur) || blockedIds.has(cur)) continue;
        withoutStep3.add(cur);
        for (const edge of outgoing.get(cur) ?? []) {
          if (!blockedIds.has(edge.target) && !withoutStep3.has(edge.target)) queue.push(edge.target);
        }
      }
      for (const renderNode of renderNodes) {
        if (withoutStep3.has(renderNode.id)) {
          issues.push({
            code: "render_before_step3",
            severity: "error",
            message: "Render (Bước 4) không được phép chạy trước khi Bước 3 (Chọn đồ & vật liệu) hoàn tất.",
            nodeId: renderNode.id,
          });
        }
      }
    }
  }
  if (definition.optionalSteps?.costBomAfterApproval && definition.optionalSteps.costBomAfterApproval.runsAfterApproval !== true) {
    issues.push({
      code: "optional_cost_before_approval",
      severity: "error",
      message: "Cost/BOM tùy chọn chỉ được phép chạy sau cổng NGƯỜI DUYỆT.",
    });
  }
  return { valid: !issues.some((issue) => issue.severity === "error"), issues, definition };
}

export async function listAtelierWorkflowVersions(db: Db, companyId: string) {
  return db.select().from(workflows).where(and(eq(workflows.companyId, companyId), eq(workflows.name, ATELIER_COMPANY_WORKFLOW_NAME))).orderBy(desc(workflows.version));
}

export async function createAtelierWorkflowDraft(db: Db, companyId: string, sourceId: string, actorUserId?: string | null) {
  return db.transaction(async (rawTx) => {
    const tx = rawTx as unknown as Db;
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`atelier-workflow-version:${companyId}`}, 0))`);
    const source = await tx.select().from(workflows).where(and(eq(workflows.id, sourceId), eq(workflows.companyId, companyId))).then((rows) => rows[0] ?? null);
    if (!source) throw notFound("Workflow source version not found");
    const currentMax = await tx.select({ value: max(workflows.version) }).from(workflows).where(and(eq(workflows.companyId, companyId), eq(workflows.name, source.name))).then((rows) => rows[0]?.value ?? 0);
    const version = currentMax + 1;
    const definition = upgradeLegacyAtelierDefinition(source.definition, version, source.name);
    return tx.insert(workflows).values({ companyId, name: source.name, prompt: source.prompt, scope: source.scope, version, status: "draft", definition: definition as unknown as Record<string, unknown>, createdByUserId: actorUserId ?? null }).returning().then((rows) => rows[0]!);
  });
}

export async function updateAtelierWorkflowDraft(db: Db, companyId: string, id: string, value: unknown, expectedUpdatedAt?: string) {
  const row = await db.select().from(workflows).where(and(eq(workflows.id, id), eq(workflows.companyId, companyId))).then((rows) => rows[0] ?? null);
  if (!row) throw notFound("Workflow version not found");
  if (row.status !== "draft") throw conflict("Published or archived workflow versions are immutable", { code: "workflow_version_immutable" });
  if (expectedUpdatedAt && row.updatedAt.toISOString() !== expectedUpdatedAt) throw conflict("Workflow draft changed since it was opened", { code: "workflow_version_conflict", currentUpdatedAt: row.updatedAt.toISOString() });
  const definition = upgradeLegacyAtelierDefinition(value, row.version, row.name);
  return db.update(workflows).set({ definition: definition as unknown as Record<string, unknown>, updatedAt: new Date() }).where(and(eq(workflows.id, id), eq(workflows.companyId, companyId), eq(workflows.status, "draft"))).returning().then((rows) => rows[0]!);
}

export async function publishAtelierWorkflowDraft(db: Db, companyId: string, id: string) {
  const row = await db.select().from(workflows).where(and(eq(workflows.id, id), eq(workflows.companyId, companyId))).then((rows) => rows[0] ?? null);
  if (!row) throw notFound("Workflow version not found");
  if (row.status !== "draft") throw conflict("Only draft workflows can be published", { code: "workflow_not_draft" });
  const validation = await validateAtelierWorkflowDefinition(db, companyId, row.definition);
  if (!validation.valid) throw unprocessable("Workflow validation failed", { code: "workflow_validation_failed", issues: validation.issues });
  return db.update(workflows).set({ status: "published", updatedAt: new Date() }).where(and(eq(workflows.id, id), eq(workflows.companyId, companyId), eq(workflows.status, "draft"))).returning().then((rows) => rows[0]!);
}

export async function assertAtelierNodeAssignment(db: Db, input: { companyId: string; node: AtelierWorkflowNode; agentId: string }) {
  const registry = await listAtelierAgentCapabilities(db, input.companyId);
  const agent = registry.find((item) => item.agentId === input.agentId);
  const failures: string[] = [];
  if (!agent) failures.push("agent_not_found");
  else {
    if (!agent.available) failures.push("agent_unavailable");
    if (input.node.requiredRole && !agent.roleKeys.includes(input.node.requiredRole)) failures.push("role_mismatch");
    if (input.node.taskType && !agent.allowedTaskTypes.includes(input.node.taskType)) failures.push("task_type_not_allowed");
    if (input.node.agentSelector?.capability && !agent.capabilities.includes(input.node.agentSelector.capability)) failures.push("capability_missing");
  }
  if (failures.length) {
    const alternatives = registry.filter((candidate) => candidate.available && (!input.node.requiredRole || candidate.roleKeys.includes(input.node.requiredRole)) && (!input.node.taskType || candidate.allowedTaskTypes.includes(input.node.taskType))).map((candidate) => ({ agentId: candidate.agentId, name: candidate.name }));
    throw forbidden("Agent assignment rejected by Atelier routing policy", { code: "atelier_assignment_rejected", failures, requestedAgentId: input.agentId, nodeId: input.node.id, taskType: input.node.taskType, alternatives });
  }
  return agent!;
}

type WorkflowIssuePolicy = {
  workflowRunId: string;
  workflowVersion: number;
  nodeId: string;
  node: AtelierWorkflowNode;
};

export function readAtelierWorkflowIssuePolicy(value: unknown): WorkflowIssuePolicy | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const outer = value as Record<string, unknown>;
  const raw = outer.atelierWorkflow;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const policy = raw as Record<string, unknown>;
  if (typeof policy.workflowRunId !== "string" || typeof policy.workflowVersion !== "number" || typeof policy.nodeId !== "string" || !policy.node || typeof policy.node !== "object") return null;
  return policy as unknown as WorkflowIssuePolicy;
}

export async function assertAtelierIssueAssignmentPolicy(db: Db, input: { companyId: string; executionPolicy: unknown; agentId: string }) {
  const policy = readAtelierWorkflowIssuePolicy(input.executionPolicy);
  if (!policy) return null;
  await assertAtelierNodeAssignment(db, { companyId: input.companyId, node: policy.node, agentId: input.agentId });
  const run = await db.select().from(atelierWorkflowRuns).where(and(eq(atelierWorkflowRuns.id, policy.workflowRunId), eq(atelierWorkflowRuns.companyId, input.companyId))).then((rows) => rows[0] ?? null);
  if (!run || run.workflowVersion !== policy.workflowVersion) throw conflict("Workflow task version does not match its run", { code: "atelier_workflow_version_mismatch", workflowRunId: policy.workflowRunId, expectedVersion: policy.workflowVersion, actualVersion: run?.workflowVersion ?? null });
  return policy;
}

export async function assertAtelierIssueExecutionAdmission(db: Db, issueId: string, agentId: string) {
  const issue = await db.select({ companyId: issues.companyId, executionPolicy: issues.executionPolicy }).from(issues).where(eq(issues.id, issueId)).then((rows) => rows[0] ?? null);
  if (!issue) throw notFound("Issue not found");
  const policy = await assertAtelierIssueAssignmentPolicy(db, { companyId: issue.companyId, executionPolicy: issue.executionPolicy, agentId });
  if (!policy) return null;
  const stage = await db.select().from(atelierWorkflowStageExecutions).where(and(eq(atelierWorkflowStageExecutions.workflowRunId, policy.workflowRunId), eq(atelierWorkflowStageExecutions.stageKey, policy.nodeId), eq(atelierWorkflowStageExecutions.issueId, issueId))).then((rows) => rows[0] ?? null);
  if (!stage) throw conflict("Workflow task is not mapped to a node execution", { code: "atelier_node_mapping_missing", nodeId: policy.nodeId });
  if (stage.agentId !== agentId) throw forbidden("Agent does not own this workflow node", { code: "atelier_node_owner_mismatch", nodeId: policy.nodeId, expectedAgentId: stage.agentId, requestedAgentId: agentId });
  if (["pending", "needs_input", "blocked", "failed"].includes(stage.status)) throw conflict("Workflow node is not ready for execution", { code: "atelier_node_not_ready", nodeId: policy.nodeId, status: stage.status, blockerReason: stage.blockerReason });
  if (policy.node.approval?.required && stage.approvalState !== "approved") throw conflict("Workflow node is waiting for approval", { code: "atelier_approval_required", nodeId: policy.nodeId, approvalState: stage.approvalState });
  return { policy, stage };
}

export async function assertAtelierIssueCompletionEvidence(db: Db, issueId: string) {
  const issue = await db.select({ companyId: issues.companyId, executionPolicy: issues.executionPolicy }).from(issues).where(eq(issues.id, issueId)).then((rows) => rows[0] ?? null);
  if (!issue) throw notFound("Issue not found");
  const policy = readAtelierWorkflowIssuePolicy(issue.executionPolicy);
  if (!policy) return null;
  const stage = await db.select().from(atelierWorkflowStageExecutions).where(and(eq(atelierWorkflowStageExecutions.workflowRunId, policy.workflowRunId), eq(atelierWorkflowStageExecutions.stageKey, policy.nodeId), eq(atelierWorkflowStageExecutions.issueId, issueId))).then((rows) => rows[0] ?? null);
  if (!stage || stage.status !== "done" || stage.outputReferences.length === 0) throw conflict("Workflow task cannot complete without validated output evidence", { code: "atelier_completion_evidence_missing", nodeId: policy.nodeId, stageStatus: stage?.status ?? null, outputReferenceCount: stage?.outputReferences.length ?? 0 });
  return { policy, stage };
}
