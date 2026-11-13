import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import {
  addEdge, applyEdgeChanges, applyNodeChanges, Background, Controls, Handle, MarkerType,
  MiniMap, Position, ReactFlow, type Connection, type Edge, type EdgeChange, type Node,
  type NodeChange, type NodeProps, type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  AlertTriangle, ArchiveRestore, Bot, Braces, Check, ChevronDown, ChevronsLeft,
  ChevronsRight, CirclePlay, Download, GitBranch, LayoutTemplate, ListFilter,
  PanelLeftClose, PanelRightClose, Plus, Redo2, Save, Search, Send, ShieldCheck,
  Trash2, Undo2, Upload, X,
} from "lucide-react";
import { useActiveCompanyPrefix, useNavigate } from "@/lib/router";
import { OrthogonalEdge } from "./workflow-graph/OrthogonalEdge";
import { layoutWorkflowGraph } from "./workflow-graph/layout";
import { taskLifecycleGraph } from "./workflow-graph/lifecycle";
import {
  WORKFLOW_NODE_KINDS, type RoutedEdgeData, type WorkflowDefinition,
  type WorkflowEdge, type WorkflowNode, type WorkflowNodeKind,
} from "./workflow-graph/types";

type Version = { id: string; version: number; status: string; updatedAt: string; definition: WorkflowDefinition };
type Agent = { agentId: string; name: string; role: string; status: string; available: boolean; roleKeys: string[]; capabilities: string[]; allowedTaskTypes: string[] };
type ValidationIssue = { code: string; severity: "error" | "warning"; message: string; nodeId?: string; edgeId?: string };
type Project = { id: string; name: string; workflow_status: string; workflow_run_id: string | null };
type Snapshot = { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
type GraphNodeData = { item: WorkflowNode; errors: number; owner: string; state: string };
type FlowNode = Node<GraphNodeData>;

const nodeMeta: Record<WorkflowNodeKind, { label: string; group: string; accent: string; icon: string }> = {
  START: { label: "Start", group: "Flow", accent: "border-emerald-500/50", icon: "bg-emerald-500" },
  END: { label: "End", group: "Flow", accent: "border-slate-500/50", icon: "bg-slate-500" },
  AGENT_TASK: { label: "Agent task", group: "Work", accent: "border-sky-500/50", icon: "bg-sky-500" },
  TOOL_EXECUTION: { label: "Tool execution", group: "Work", accent: "border-indigo-500/50", icon: "bg-indigo-500" },
  RESEARCH: { label: "Research", group: "Work", accent: "border-cyan-500/50", icon: "bg-cyan-500" },
  HUMAN_INPUT: { label: "Human input", group: "Human", accent: "border-amber-500/50", icon: "bg-amber-500" },
  APPROVAL_GATE: { label: "Approval gate", group: "Human", accent: "border-amber-500/50", icon: "bg-amber-500" },
  CONDITION: { label: "Condition", group: "Logic", accent: "border-violet-500/50", icon: "bg-violet-500" },
  PARALLEL_BRANCH: { label: "Parallel branch", group: "Logic", accent: "border-violet-500/50", icon: "bg-violet-500" },
  JOIN: { label: "Join", group: "Logic", accent: "border-violet-500/50", icon: "bg-violet-500" },
  VALIDATION: { label: "Validation", group: "Quality", accent: "border-rose-500/50", icon: "bg-rose-500" },
  RETRY_RECOVERY: { label: "Retry / recovery", group: "Quality", accent: "border-rose-500/50", icon: "bg-rose-500" },
  NOTIFICATION: { label: "Notification", group: "Output", accent: "border-teal-500/50", icon: "bg-teal-500" },
  EXPORT: { label: "Export", group: "Output", accent: "border-teal-500/50", icon: "bg-teal-500" },
};

const clone = <T,>(value: T): T => structuredClone(value);
const lines = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);
const fieldClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-55";
const buttonClass = "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 text-xs font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40";

function WorkflowCard({ data, selected }: NodeProps<FlowNode>) {
  const { item, errors, owner, state } = data;
  const appearance = nodeMeta[item.type];
  return <div className={`h-[104px] w-[244px] rounded-lg border bg-card shadow-sm transition-shadow ${appearance.accent} ${selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md" : ""}`}>
    {item.type !== "START" ? <Handle id="in" type="target" position={Position.Left} className="!size-3 !border-2 !border-background !bg-primary" /> : null}
    <div className="flex h-8 items-center justify-between border-b border-border/60 px-3">
      <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"><span className={`size-2 rounded-sm ${appearance.icon}`} />{appearance.label}</span>
      {errors ? <span className="rounded bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">{errors}</span> : <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Check className="size-3 text-emerald-600" />{state}</span>}
    </div>
    <div className="px-3 py-2.5"><div className="truncate text-sm font-semibold leading-5">{item.name}</div><div className="mt-1 flex items-center justify-between gap-3 text-[10px] text-muted-foreground"><span className="truncate">{owner}</span><span className="max-w-28 truncate font-mono">{item.taskType ?? item.id}</span></div></div>
    {item.type !== "END" ? <Handle id="out" type="source" position={Position.Right} className="!size-3 !border-2 !border-background !bg-primary" /> : null}
  </div>;
}

const nodeTypes = { workflow: WorkflowCard };
const edgeTypes = { orthogonal: OrthogonalEdge };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || body.message || `API ${response.status}`);
  return body as T;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground"><span>{label}</span>{hint ? <span className="font-normal opacity-75">{hint}</span> : null}</span>{children}</label>;
}

function ToolButton({ title, disabled, active, onClick, children }: { title: string; disabled?: boolean; active?: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" title={title} disabled={disabled} onClick={onClick} className={`${buttonClass} ${active ? "border-primary bg-primary/10 text-primary" : ""}`}>{children}</button>;
}

export function AtelierWorkflowBuilder() {
  const prefix = useActiveCompanyPrefix();
  const navigate = useNavigate();
  const [versions, setVersions] = useState<Version[]>([]);
  const [activeId, setActiveId] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [routes, setRoutes] = useState<Record<string, { x: number; y: number }[]>>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [workspaceMode, setWorkspaceMode] = useState<"design" | "execution">("design");
  const [diagramMode, setDiagramMode] = useState<"pipeline" | "lifecycle">(() => new URLSearchParams(window.location.search).get("diagram") === "lifecycle" ? "lifecycle" : "pipeline");
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [past, setPast] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);
  const [lifecycle, setLifecycle] = useState<{ nodes: WorkflowNode[]; edges: WorkflowEdge[]; routes: Record<string, { x: number; y: number }[]> } | null>(null);
  const flowRef = useRef<ReactFlowInstance<FlowNode, Edge> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const active = versions.find((item) => item.id === activeId) ?? null;
  const editable = active?.status === "draft" && diagramMode === "pipeline" && workspaceMode === "design";
  const selectedNode = nodes.find((item) => item.id === selectedNodeId) ?? null;
  const selectedEdge = edges.find((item) => item.id === selectedEdgeId) ?? null;

  const calculateLayout = useCallback(async (inputNodes: WorkflowNode[], inputEdges: WorkflowEdge[]) => {
    const result = await layoutWorkflowGraph(inputNodes, inputEdges);
    return { nodes: result.nodes, routes: result.routes };
  }, []);

  const load = useCallback(async (preferredId?: string) => {
    setBusy("load"); setError("");
    try {
      const [versionPayload, agentPayload, companyPayload] = await Promise.all([
        request<{ versions: Version[] }>("/api/atelier/workflow/definitions"),
        request<{ agents: Agent[] }>("/api/atelier/agent-capabilities"),
        request<{ projects: Project[] }>("/api/atelier/company-workflow"),
      ]);
      setVersions(versionPayload.versions); setAgents(agentPayload.agents); setProjects(companyPayload.projects);
      const next = versionPayload.versions.find((item) => item.id === preferredId) ?? versionPayload.versions[0];
      if (next) {
        const layout = await calculateLayout(clone(next.definition.nodes), clone(next.definition.edges));
        setActiveId(next.id); setNodes(layout.nodes); setEdges(clone(next.definition.edges)); setRoutes(layout.routes);
        setSelectedNodeId(next.definition.nodes[0]?.id ?? null); setSelectedEdgeId(null);
      }
      const lifecycleSource = taskLifecycleGraph();
      setLifecycle(lifecycleSource);
      setDirty(false); setPast([]); setFuture([]); setIssues([]);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không tải được workflow"); }
    finally { setBusy(""); }
  }, [calculateLayout]);

  useEffect(() => { void load(); }, [load]);

  const selectVersion = async (id: string) => {
    const next = versions.find((item) => item.id === id); if (!next) return;
    const layout = await calculateLayout(clone(next.definition.nodes), clone(next.definition.edges));
    setActiveId(id); setNodes(layout.nodes); setEdges(clone(next.definition.edges)); setRoutes(layout.routes);
    setSelectedNodeId(next.definition.nodes[0]?.id ?? null); setSelectedEdgeId(null); setIssues([]); setDirty(false); setPast([]); setFuture([]);
  };

  const checkpoint = useCallback(() => {
    setPast((items) => [...items.slice(-29), { nodes: clone(nodes), edges: clone(edges) }]);
    setFuture([]); setDirty(true);
  }, [nodes, edges]);

  const patchNode = (patch: Partial<WorkflowNode>) => {
    if (!selectedNode || !editable) return;
    checkpoint(); setNodes((items) => items.map((item) => item.id === selectedNode.id ? { ...item, ...patch } : item));
  };
  const patchEdge = (patch: Partial<WorkflowEdge>) => {
    if (!selectedEdge || !editable) return;
    checkpoint(); setEdges((items) => items.map((item) => item.id === selectedEdge.id ? { ...item, ...patch } : item)); setRoutes({});
  };
  const undo = () => { const state = past.at(-1); if (!state) return; setFuture((items) => [{ nodes: clone(nodes), edges: clone(edges) }, ...items]); setPast((items) => items.slice(0, -1)); setNodes(state.nodes); setEdges(state.edges); setRoutes({}); setDirty(true); };
  const redo = () => { const state = future[0]; if (!state) return; setPast((items) => [...items, { nodes: clone(nodes), edges: clone(edges) }]); setFuture((items) => items.slice(1)); setNodes(state.nodes); setEdges(state.edges); setRoutes({}); setDirty(true); };

  const runAutoLayout = async () => {
    if (diagramMode === "lifecycle") { flowRef.current?.fitView({ padding: 0.16, duration: 250 }); return; }
    setBusy("layout");
    try { const result = await calculateLayout(nodes, edges); if (editable) checkpoint(); setNodes(result.nodes); setRoutes(result.routes); if (editable) setDirty(true); requestAnimationFrame(() => flowRef.current?.fitView({ padding: 0.16, duration: 250 })); setMessage("Đã căn graph theo dependency, topology không thay đổi."); }
    finally { setBusy(""); }
  };

  const pipelineNodes = nodes;
  const pipelineEdges = edges;
  const visibleNodes = diagramMode === "pipeline" ? pipelineNodes : lifecycle?.nodes ?? [];
  const visibleEdges = diagramMode === "pipeline" ? pipelineEdges : lifecycle?.edges ?? [];
  const visibleRoutes = diagramMode === "pipeline" ? routes : lifecycle?.routes ?? {};

  const agentById = useMemo(() => new Map(agents.map((agent) => [agent.agentId, agent])), [agents]);
  const rfNodes = useMemo<FlowNode[]>(() => visibleNodes.map((item) => ({
    id: item.id, type: "workflow", position: item.position ?? { x: 0, y: 0 }, width: 244, height: 104,
    data: {
      item,
      errors: diagramMode === "pipeline" ? issues.filter((issue) => issue.nodeId === item.id && issue.severity === "error").length : 0,
      owner: item.assignedAgentId ? agentById.get(item.assignedAgentId)?.name ?? "Unknown agent" : item.requiredRole ?? "System",
      state: diagramMode === "lifecycle" ? "status" : active?.status ?? "configured",
    },
  })), [visibleNodes, diagramMode, issues, agentById, active?.status]);
  const rfEdges = useMemo<Edge<RoutedEdgeData>[]>(() => visibleEdges.map((item) => ({
    id: item.id, source: item.source, target: item.target, type: "orthogonal", sourceHandle: "out", targetHandle: "in",
    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
    data: { points: visibleRoutes[item.id], outcome: item.outcome },
    style: { stroke: "var(--muted-foreground)" },
  })), [visibleEdges, visibleRoutes]);

  const nodeChanges = (changes: NodeChange<FlowNode>[]) => {
    if (!editable) return;
    const persistedChanges = changes.filter((item) => item.type === "remove" || item.type === "position");
    if (!persistedChanges.length) return;
    const next = applyNodeChanges(persistedChanges, rfNodes);
    if (persistedChanges.some((item) => item.type === "remove" || (item.type === "position" && item.dragging === false))) checkpoint();
    setNodes((items) => next.map((node) => ({ ...items.find((item) => item.id === node.id)!, position: node.position })));
    setRoutes({}); setDirty(true);
  };
  const edgeChanges = (changes: EdgeChange[]) => {
    if (!editable) return;
    if (changes.some((item) => item.type === "remove")) checkpoint();
    const remaining = applyEdgeChanges(changes, rfEdges);
    setEdges(remaining.map((item) => ({ id: item.id, source: item.source, target: item.target, outcome: edges.find((edge) => edge.id === item.id)?.outcome })));
    setSelectedEdgeId(null); setRoutes({}); setDirty(true);
  };
  const connect = (connection: Connection) => {
    if (!editable || !connection.source || !connection.target) return;
    checkpoint();
    const next = addEdge({ ...connection, id: `edge_${crypto.randomUUID()}` }, rfEdges);
    setEdges(next.map((item) => ({ id: item.id, source: item.source, target: item.target })));
    setRoutes({}); setDirty(true);
  };

  const addNode = (type: WorkflowNodeKind, position?: { x: number; y: number }) => {
    if (!editable) return;
    checkpoint();
    const id = `${type.toLowerCase()}_${crypto.randomUUID().slice(0, 8)}`;
    const task = ["AGENT_TASK", "RESEARCH", "VALIDATION"].includes(type);
    const item: WorkflowNode = {
      id, type, name: nodeMeta[type].label, position: position ?? { x: 160 + nodes.length * 20, y: 100 + nodes.length * 20 },
      ...(task ? { taskType: type, requiredRole: "specialist", agentSelector: { strategy: "CAPABILITY_MATCH", capability: "configure.capability" }, requiredOutputs: ["output"], completionCriteria: ["Output persisted and validated"], retryPolicy: { maxAttempts: 2, backoffSeconds: 30 } } : {}),
      ...(type === "APPROVAL_GATE" ? { approval: { required: true, approverRole: "authorized_approver" } } : {}),
      ...(type === "CONDITION" ? { conditionOutcomes: ["yes", "no"] } : {}),
    };
    setNodes((items) => [...items, item]); setSelectedNodeId(id); setSelectedEdgeId(null); setRoutes({}); setDirty(true);
  };
  const removeNode = () => {
    if (!selectedNode || !editable || ["START", "END"].includes(selectedNode.type)) return;
    checkpoint(); setNodes((items) => items.filter((item) => item.id !== selectedNode.id)); setEdges((items) => items.filter((item) => item.source !== selectedNode.id && item.target !== selectedNode.id)); setSelectedNodeId(null); setRoutes({});
  };
  const removeEdge = () => { if (!selectedEdge || !editable) return; checkpoint(); setEdges((items) => items.filter((item) => item.id !== selectedEdge.id)); setSelectedEdgeId(null); setRoutes({}); };

  const definition = (): WorkflowDefinition => ({ ...active!.definition, schemaVersion: 2, version: active!.version, nodes, edges });
  const save = async () => {
    if (!active || !editable) return;
    setBusy("save"); setError("");
    try {
      const payload = await request<{ workflow: Version; validation: { issues: ValidationIssue[] } }>(`/api/atelier/workflow/definitions/${active.id}`, { method: "PATCH", body: JSON.stringify({ definition: definition(), expected_updated_at: active.updatedAt }) });
      setVersions((items) => items.map((item) => item.id === active.id ? payload.workflow : item)); setIssues(payload.validation.issues); setDirty(false); setMessage(`Đã lưu draft v${active.version}.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Lưu thất bại"); }
    finally { setBusy(""); }
  };
  const validate = async (test = false) => {
    if (!active) return;
    setBusy(test ? "test" : "validate"); setError("");
    try {
      const payload = await request<any>(`/api/atelier/workflow/definitions/${active.id}/${test ? "test" : "validate"}`, { method: "POST", body: JSON.stringify({ definition: definition() }) });
      const result = test ? payload.validation : payload; setIssues(result.issues);
      setMessage(result.valid ? (test ? "Dry run hợp lệ. Không agent nào được dispatch." : "Workflow hợp lệ, không có lỗi.") : `Phát hiện ${result.issues.length} vấn đề.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Validation thất bại"); }
    finally { setBusy(""); }
  };
  const newDraft = async (restore = false) => {
    if (!active) return;
    setBusy("draft"); setError("");
    try { const payload = await request<{ workflow: Version }>(`/api/atelier/workflow/definitions/${active.id}/${restore ? "restore" : "draft"}`, { method: "POST", body: "{}" }); await load(payload.workflow.id); setMessage(`${restore ? "Đã khôi phục" : "Đã tạo"} draft v${payload.workflow.version}.`); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không tạo được draft"); }
    finally { setBusy(""); }
  };
  const publish = async () => {
    if (!active || !editable) return;
    setBusy("publish"); setError("");
    try { if (dirty) await save(); const payload = await request<{ workflow: Version }>(`/api/atelier/workflow/definitions/${active.id}/publish`, { method: "POST", body: "{}" }); await load(payload.workflow.id); setMessage(`Đã publish v${payload.workflow.version}. Run cũ vẫn giữ version cũ.`); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Publish thất bại"); }
    finally { setBusy(""); }
  };
  const exportJson = () => { const blob = new Blob([JSON.stringify(definition(), null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `atelier-workflow-v${active?.version}.json`; anchor.click(); URL.revokeObjectURL(url); };
  const importJson = async (file?: File) => { if (!file || !editable) return; try { const value = JSON.parse(await file.text()) as WorkflowDefinition; if (!Array.isArray(value.nodes) || !Array.isArray(value.edges)) throw new Error("JSON thiếu nodes hoặc edges"); checkpoint(); setNodes(value.nodes); setEdges(value.edges); setRoutes({}); setDirty(true); setMessage("Đã import vào draft. Hãy Auto Layout, Validate và Save."); } catch (cause) { setError(cause instanceof Error ? cause.message : "Import thất bại"); } };
  const drop = (event: DragEvent) => { event.preventDefault(); const type = event.dataTransfer.getData("application/atelier-node") as WorkflowNodeKind; if (WORKFLOW_NODE_KINDS.includes(type) && flowRef.current) addNode(type, flowRef.current.screenToFlowPosition({ x: event.clientX, y: event.clientY })); };

  const groups = [...new Set(WORKFLOW_NODE_KINDS.map((kind) => nodeMeta[kind].group))];
  const filteredKinds = WORKFLOW_NODE_KINDS.filter((kind) => nodeMeta[kind].label.toLowerCase().includes(search.toLowerCase()) || kind.toLowerCase().includes(search.toLowerCase()));
  const eligibleAgents = selectedNode ? agents.filter((agent) => agent.available && (!selectedNode.requiredRole || agent.roleKeys.includes(selectedNode.requiredRole)) && (!selectedNode.taskType || agent.allowedTaskTypes.includes(selectedNode.taskType))) : [];
  const readonlyReason = diagramMode === "lifecycle" ? "Task Lifecycle là sơ đồ read-only từ trạng thái Paperclip." : active?.status !== "draft" ? `v${active?.version} đã publish và bất biến. Tạo Draft mới để chỉnh sửa.` : null;

  if (!active) return <div className="flex h-full items-center justify-center bg-background text-sm text-muted-foreground">{error || "Đang nạp workflow authority..."}</div>;

  return <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
    <header className="shrink-0 border-b border-border bg-card">
      <div className="flex min-h-14 flex-wrap items-center gap-2 px-4 py-2">
        <div className="mr-auto min-w-52"><div className="flex items-center gap-2 text-sm font-semibold"><GitBranch className="size-4 text-primary" />{active.definition.name}</div><div className="mt-0.5 text-[11px] text-muted-foreground">Visual workflow control plane</div></div>
        <div className="flex rounded-md border border-border bg-muted/40 p-0.5"><button className={`rounded px-3 py-1.5 text-xs ${workspaceMode === "design" ? "bg-background font-medium shadow-sm" : "text-muted-foreground"}`} onClick={() => setWorkspaceMode("design")}>Design</button><button className={`rounded px-3 py-1.5 text-xs ${workspaceMode === "execution" ? "bg-background font-medium shadow-sm" : "text-muted-foreground"}`} onClick={() => setWorkspaceMode("execution")}>Execution</button></div>
        <div className="relative"><select className={`${fieldClass} h-9 min-w-36 appearance-none py-1.5 pr-8`} value={activeId} onChange={(event) => void selectVersion(event.target.value)}>{versions.map((item) => <option key={item.id} value={item.id}>v{item.version} · {item.status}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 size-4 text-muted-foreground" /></div>
        {!editable && diagramMode === "pipeline" ? <ToolButton title="Create an editable version" onClick={() => void newDraft()}><Plus className="size-4" />Create Draft</ToolButton> : null}
        <ToolButton title="Undo" onClick={undo} disabled={!editable || !past.length}><Undo2 className="size-4" /></ToolButton>
        <ToolButton title="Redo" onClick={redo} disabled={!editable || !future.length}><Redo2 className="size-4" /></ToolButton>
        <ToolButton title="Calculate a layered orthogonal layout" onClick={() => void runAutoLayout()} disabled={!!busy}><LayoutTemplate className="size-4" />Auto Layout</ToolButton>
        <ToolButton title="Validate definition" onClick={() => void validate()} disabled={diagramMode !== "pipeline"}><ShieldCheck className="size-4" />Validate</ToolButton>
        <ToolButton title="Validation-only test run" onClick={() => void validate(true)} disabled={diagramMode !== "pipeline"}><CirclePlay className="size-4" />Test Run</ToolButton>
        {editable ? <><ToolButton title="Persist draft" onClick={() => void save()} disabled={!dirty || !!busy}><Save className="size-4" />Save</ToolButton><button className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground disabled:opacity-40" onClick={() => void publish()} disabled={!!busy}><Send className="size-4" />Publish</button></> : null}
      </div>
      <div className="flex h-10 items-center gap-2 border-t border-border/70 px-4">
        <button className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs ${diagramMode === "pipeline" ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted"}`} onClick={() => { setDiagramMode("pipeline"); setSelectedEdgeId(null); }}>Pipeline Workflow</button>
        <button className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs ${diagramMode === "lifecycle" ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted"}`} onClick={() => { setDiagramMode("lifecycle"); setSelectedNodeId(null); setSelectedEdgeId(null); requestAnimationFrame(() => flowRef.current?.fitView({ padding: 0.16 })); }}>Task Lifecycle</button>
        <span className="mx-1 h-4 w-px bg-border" />
        <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" title={leftOpen ? "Close node library" : "Open node library"} onClick={() => setLeftOpen((value) => !value)}>{leftOpen ? <PanelLeftClose className="size-4" /> : <ChevronsRight className="size-4" />}</button>
        <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" title={rightOpen ? "Close inspector" : "Open inspector"} onClick={() => setRightOpen((value) => !value)}>{rightOpen ? <PanelRightClose className="size-4" /> : <ChevronsLeft className="size-4" />}</button>
        <span className="ml-auto text-[11px] text-muted-foreground">{visibleNodes.length} nodes · {visibleEdges.length} transitions</span>
      </div>
    </header>

    {(message || error || readonlyReason) ? <div className={`flex min-h-9 shrink-0 items-center gap-2 border-b px-4 py-2 text-xs ${error ? "border-destructive/30 bg-destructive/10 text-destructive" : readonlyReason ? "bg-muted/60 text-muted-foreground" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>{error ? <AlertTriangle className="size-4" /> : readonlyReason ? <ShieldCheck className="size-4" /> : <Check className="size-4" />}<span className="flex-1">{error || readonlyReason || message}</span>{(error || message) ? <button onClick={() => { setError(""); setMessage(""); }}><X className="size-4" /></button> : null}</div> : null}

    {workspaceMode === "execution" ? <div className="min-h-0 flex-1 overflow-auto p-6"><div className="mx-auto max-w-6xl"><div className="border-b border-border pb-5"><h2 className="text-xl font-semibold">Execution monitor</h2><p className="mt-1 text-sm text-muted-foreground">Mỗi project run giữ nguyên workflow version, run ID và native task mapping.</p></div><div className="mt-5 grid gap-3">{projects.map((project) => <button key={project.id} className="grid grid-cols-[1fr_auto] items-center gap-5 rounded-lg border border-border bg-card px-5 py-4 text-left hover:border-primary/40 hover:bg-muted/30" onClick={() => navigate(`/${prefix}/projects/${project.id}/workflow`)}><span className="min-w-0"><span className="block truncate text-sm font-semibold">{project.name}</span><span className="mt-1 block font-mono text-[11px] text-muted-foreground">Node run: {project.workflow_run_id || "not provisioned"}</span></span><span className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground">{project.workflow_status}</span></button>)}</div></div></div> :
      <main className={`grid min-h-0 flex-1 ${leftOpen && rightOpen ? "grid-cols-[232px_minmax(420px,1fr)_340px]" : leftOpen ? "grid-cols-[232px_minmax(420px,1fr)]" : rightOpen ? "grid-cols-[minmax(420px,1fr)_340px]" : "grid-cols-1"}`}>
        {leftOpen ? <aside className="overflow-auto border-r border-border bg-card p-3"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold">Node library</span><span className="text-[10px] text-muted-foreground">drag or click</span></div><div className="relative mb-4"><Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" /><input className={`${fieldClass} pl-8`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search nodes" /></div>{diagramMode === "pipeline" ? groups.map((group) => { const groupKinds = filteredKinds.filter((kind) => nodeMeta[kind].group === group); return groupKinds.length ? <section key={group} className="mb-4"><h3 className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{group}</h3>{groupKinds.map((kind) => <button key={kind} draggable={editable} onDragStart={(event) => event.dataTransfer.setData("application/atelier-node", kind)} onClick={() => addNode(kind)} disabled={!editable} title={!editable ? readonlyReason ?? undefined : `Add ${nodeMeta[kind].label}`} className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-xs hover:bg-muted disabled:cursor-not-allowed disabled:opacity-45"><span className={`size-2.5 rounded-sm ${nodeMeta[kind].icon}`} />{nodeMeta[kind].label}</button>)}</section> : null; }) : <div className="rounded-md border border-border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground"><ListFilter className="mb-2 size-4" />Trạng thái lấy từ <code>ISSUE_STATUSES</code>. Paperclip chỉ kiểm tra target status hợp lệ, không giới hạn cặp chuyển đổi.</div>}<div className="mt-5 grid grid-cols-2 gap-2 border-t border-border pt-4"><button onClick={exportJson} className={buttonClass}><Download className="size-3.5" />Export</button><button disabled={!editable} onClick={() => fileRef.current?.click()} className={buttonClass}><Upload className="size-3.5" />Import</button></div><input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(event) => void importJson(event.target.files?.[0])} />{diagramMode === "pipeline" ? <button onClick={() => void newDraft(true)} className={`${buttonClass} mt-2 w-full`}><ArchiveRestore className="size-3.5" />Restore as new version</button> : null}</aside> : null}

        <section className="relative min-h-0 bg-muted/20" onDrop={drop} onDragOver={(event) => event.preventDefault()}>
          <ReactFlow<FlowNode, Edge<RoutedEdgeData>> nodes={rfNodes} edges={rfEdges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} onInit={(instance) => { flowRef.current = instance; }} onNodesChange={nodeChanges} onEdgesChange={edgeChanges} onConnect={connect} onNodeClick={(_, node) => { setSelectedNodeId(node.id); setSelectedEdgeId(null); setRightOpen(true); }} onEdgeClick={(_, edge) => { if (diagramMode === "pipeline") { setSelectedEdgeId(edge.id); setSelectedNodeId(null); setRightOpen(true); } }} onPaneClick={() => { setSelectedNodeId(null); setSelectedEdgeId(null); }} nodesDraggable={editable} nodesConnectable={editable} edgesReconnectable={editable} elementsSelectable fitView fitViewOptions={{ padding: 0.12, maxZoom: 0.78 }} snapToGrid snapGrid={[16, 16]} deleteKeyCode={editable ? ["Backspace", "Delete"] : null} minZoom={0.2} maxZoom={1.8}>
            <Background gap={24} size={1} color="var(--border)" />
            <Controls position="bottom-left" showInteractive={false} />
            <MiniMap position="bottom-right" pannable zoomable className="!h-24 !w-36 !rounded-md !border !border-border !bg-card/95" nodeColor={(node) => node.id === selectedNodeId ? "var(--primary)" : "var(--muted-foreground)"} maskColor="color-mix(in srgb, var(--background) 72%, transparent)" />
          </ReactFlow>
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-md border border-border bg-card/95 px-3 py-2 text-[11px] shadow-sm backdrop-blur"><span className="font-semibold">{diagramMode === "pipeline" ? `v${active.version}` : "Task lifecycle"}</span><span className="text-muted-foreground">{diagramMode === "pipeline" ? active.status : "read-only presentation"}</span>{dirty && diagramMode === "pipeline" ? <span className="text-amber-600">Unsaved</span> : null}</div>
          {issues.length && diagramMode === "pipeline" ? <div className="absolute bottom-4 left-1/2 max-h-40 w-[min(660px,76%)] -translate-x-1/2 overflow-auto rounded-lg border border-destructive/30 bg-card/95 p-3 shadow-lg backdrop-blur"><div className="mb-2 flex items-center gap-2 text-xs font-semibold"><AlertTriangle className="size-4 text-destructive" />Validation · {issues.length}</div>{issues.map((issue, index) => <button key={`${issue.code}-${index}`} className="block w-full truncate rounded px-1 py-1 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => issue.nodeId && setSelectedNodeId(issue.nodeId)}>{issue.nodeId ? `${issue.nodeId}: ` : ""}{issue.message}</button>)}</div> : null}
        </section>

        {rightOpen ? <aside className="overflow-auto border-l border-border bg-card p-4">{diagramMode === "lifecycle" ? <div><div className="flex items-center gap-2 text-sm font-semibold"><Braces className="size-4 text-primary" />Task Lifecycle</div><p className="mt-3 text-xs leading-5 text-muted-foreground">Sơ đồ dùng 7 status thật của Paperclip: backlog, todo, in_progress, in_review, blocked, done và cancelled. Các nhãn là presentation của những status update phổ biến; backend hiện chấp nhận mọi target thuộc danh sách này.</p></div> : selectedEdge ? <div className="space-y-4"><div className="flex items-start justify-between"><div><div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Transition inspector</div><h2 className="mt-1 text-sm font-semibold">{selectedEdge.source} → {selectedEdge.target}</h2><div className="mt-1 font-mono text-[10px] text-muted-foreground">{selectedEdge.id}</div></div><button onClick={removeEdge} disabled={!editable} className="rounded-md border border-border p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"><Trash2 className="size-4" /></button></div><Field label="Edge label / outcome" hint="condition"><input disabled={!editable} className={fieldClass} value={selectedEdge.outcome ?? ""} onChange={(event) => patchEdge({ outcome: event.target.value || undefined })} placeholder="Passed, Failed, Approved..." /></Field><Field label="Source"><select disabled={!editable} className={fieldClass} value={selectedEdge.source} onChange={(event) => patchEdge({ source: event.target.value })}>{nodes.map((node) => <option key={node.id} value={node.id}>{node.name}</option>)}</select></Field><Field label="Target"><select disabled={!editable} className={fieldClass} value={selectedEdge.target} onChange={(event) => patchEdge({ target: event.target.value })}>{nodes.map((node) => <option key={node.id} value={node.id}>{node.name}</option>)}</select></Field><p className="rounded-md border border-border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">Dependency thay đổi khi Source hoặc Target đổi. Bấm Auto Layout để tính lại tuyến vuông góc, rồi Validate trước khi Save.</p></div> : selectedNode ? <div className="space-y-4"><div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Node properties · {selectedNode.type}</div><h2 className="mt-1 text-sm font-semibold">{selectedNode.name}</h2><div className="mt-1 font-mono text-[10px] text-muted-foreground">{selectedNode.id}</div></div><button onClick={removeNode} disabled={!editable || ["START", "END"].includes(selectedNode.type)} className="rounded-md border border-border p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"><Trash2 className="size-4" /></button></div><Field label="Name"><input disabled={!editable} className={fieldClass} value={selectedNode.name} onChange={(event) => patchNode({ name: event.target.value })} /></Field><Field label="Description" hint="UTF-8"><textarea disabled={!editable} rows={4} className={`${fieldClass} resize-y leading-5`} value={selectedNode.description ?? ""} onChange={(event) => patchNode({ description: event.target.value })} /></Field><Field label="Prompt instructions"><textarea disabled={!editable} rows={5} className={`${fieldClass} resize-y font-mono text-xs leading-5`} value={selectedNode.prompt ?? ""} onChange={(event) => patchNode({ prompt: event.target.value })} placeholder="Instructions riêng cho node" /></Field>{["AGENT_TASK", "RESEARCH", "VALIDATION"].includes(selectedNode.type) ? <><div className="border-t border-border pt-4 text-xs font-semibold">Agent contract</div><Field label="Task type"><input disabled={!editable} className={fieldClass} value={selectedNode.taskType ?? ""} onChange={(event) => patchNode({ taskType: event.target.value })} /></Field><Field label="Required role"><input disabled={!editable} className={fieldClass} value={selectedNode.requiredRole ?? ""} onChange={(event) => patchNode({ requiredRole: event.target.value })} /></Field><Field label="Capability"><input disabled={!editable} className={fieldClass} value={selectedNode.agentSelector?.capability ?? ""} onChange={(event) => patchNode({ agentSelector: { strategy: "CAPABILITY_MATCH", capability: event.target.value } })} /></Field><Field label="Assigned agent" hint={`${eligibleAgents.length} eligible`}><select disabled={!editable} className={fieldClass} value={selectedNode.assignedAgentId ?? ""} onChange={(event) => patchNode({ assignedAgentId: event.target.value || null })}><option value="">Auto capability match</option>{agents.map((agent) => <option key={agent.agentId} value={agent.agentId} disabled={!eligibleAgents.some((item) => item.agentId === agent.agentId)}>{agent.name}{agent.available ? "" : " · unavailable"}</option>)}</select></Field></> : null}<div className="border-t border-border pt-4 text-xs font-semibold">Data and execution policy</div><Field label="Required inputs" hint="one per line"><textarea disabled={!editable} rows={3} className={fieldClass} value={(selectedNode.requiredInputs ?? []).join("\n")} onChange={(event) => patchNode({ requiredInputs: lines(event.target.value) })} /></Field><Field label="Required outputs" hint="one per line"><textarea disabled={!editable} rows={3} className={fieldClass} value={(selectedNode.requiredOutputs ?? []).join("\n")} onChange={(event) => patchNode({ requiredOutputs: lines(event.target.value) })} /></Field><Field label="Required artifacts" hint="one per line"><textarea disabled={!editable} rows={3} className={fieldClass} value={(selectedNode.requiredArtifacts ?? []).join("\n")} onChange={(event) => patchNode({ requiredArtifacts: lines(event.target.value) })} /></Field><Field label="Completion criteria"><textarea disabled={!editable} rows={4} className={fieldClass} value={(selectedNode.completionCriteria ?? []).join("\n")} onChange={(event) => patchNode({ completionCriteria: lines(event.target.value) })} /></Field>{["AGENT_TASK", "RESEARCH", "VALIDATION"].includes(selectedNode.type) ? <div className="grid grid-cols-2 gap-3"><Field label="Max attempts"><input disabled={!editable} type="number" min={1} max={10} className={fieldClass} value={selectedNode.retryPolicy?.maxAttempts ?? 1} onChange={(event) => patchNode({ retryPolicy: { ...selectedNode.retryPolicy, maxAttempts: Number(event.target.value) } })} /></Field><Field label="Backoff sec"><input disabled={!editable} type="number" min={0} className={fieldClass} value={selectedNode.retryPolicy?.backoffSeconds ?? 0} onChange={(event) => patchNode({ retryPolicy: { maxAttempts: selectedNode.retryPolicy?.maxAttempts ?? 1, backoffSeconds: Number(event.target.value) } })} /></Field></div> : null}{selectedNode.type === "APPROVAL_GATE" ? <Field label="Approver role"><input disabled={!editable} className={fieldClass} value={selectedNode.approval?.approverRole ?? ""} onChange={(event) => patchNode({ approval: { required: true, approverRole: event.target.value } })} /></Field> : null}{selectedNode.type === "CONDITION" ? <Field label="Condition outcomes"><textarea disabled={!editable} rows={3} className={fieldClass} value={(selectedNode.conditionOutcomes ?? []).join("\n")} onChange={(event) => patchNode({ conditionOutcomes: lines(event.target.value) })} /></Field> : null}</div> : <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground"><Bot className="mb-3 size-8 opacity-40" /><p className="text-sm font-medium">Select a node or edge</p><p className="mt-1 max-w-48 text-xs leading-5">Inspect properties, routing, dependencies and completion policy.</p></div>}</aside> : null}
      </main>}
  </div>;
}
