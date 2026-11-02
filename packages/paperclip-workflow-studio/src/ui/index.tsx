import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  applyEdgeChanges,
  applyNodeChanges,
  useNodesInitialized,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeProps,
  type Viewport
} from "@xyflow/react";
import reactFlowStyles from "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Bot,
  Box,
  Braces,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Copy,
  Download,
  Diamond,
  GitBranch,
  GitFork,
  Layers3,
  LayoutDashboard,
  Maximize2,
  MoreHorizontal,
  Play,
  Plus,
  Redo2,
  RefreshCw,
  Rocket,
  Save,
  Search,
  Settings2,
  Split,
  Square,
  Undo2,
  UserCheck,
  Workflow,
  ZoomIn,
  ZoomOut,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
  X
} from "lucide-react";
import {
  useHostNavigation,
  useHostLocation,
  usePluginAction,
  usePluginData,
  usePluginToast,
  type PluginDetailTabProps,
  type PluginPageProps,
  type PluginSidebarProps
} from "@paperclipai/plugin-sdk/ui";
import type {
  BootstrapData,
  MonitorNode,
  PaperclipAgent,
  ProjectWorkflowData,
  ValidationIssue,
  ValidationResult,
  WorkflowData,
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowIndexEntry,
  WorkflowNode,
  WorkflowNodeData,
  WorkflowNodeKind
} from "../types.js";
import { studioStyles } from "./styles.js";

type StudioMode = "designer" | "monitor" | "templates";
type FlowNode = Node<WorkflowNodeData, "workflowNode">;
type FlowEdge = Edge<Record<string, never>, "smoothstep">;
type DesignerContextMenu =
  | { kind: "node"; x: number; y: number; nodeId: string }
  | { kind: "edge"; x: number; y: number; edgeId: string }
  | { kind: "canvas"; x: number; y: number; flowX: number; flowY: number }
  | null;

const CONTROL_ITEMS: Array<{ kind: WorkflowNodeKind; title: string; description: string; icon: React.ReactNode }> = [
  { kind: "start", title: "Start", description: "Workflow entry", icon: <Play size={15} /> },
  { kind: "approval", title: "Human approval", description: "Paperclip approval task", icon: <UserCheck size={15} /> },
  { kind: "condition", title: "Condition", description: "Visual routing rule", icon: <Diamond size={15} /> },
  { kind: "parallel", title: "Parallel split", description: "Fan out dependencies", icon: <Split size={15} /> },
  { kind: "join", title: "Join", description: "Wait for all branches", icon: <GitFork size={15} /> },
  { kind: "end", title: "End", description: "Workflow terminal", icon: <Square size={15} /> }
];

function asMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function initials(value: string): string {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "AI";
}

function statusLabel(value: string): string {
  return value.replaceAll("_", " ");
}

function workflowStatusLabel(value: string): string {
  if (value === "draft") return "Saved";
  if (value === "published") return "Published";
  return statusLabel(value);
}

function nodeIcon(kind: WorkflowNodeKind): React.ReactNode {
  if (kind === "start") return <Play size={14} />;
  if (kind === "end") return <Square size={14} />;
  if (kind === "approval") return <UserCheck size={14} />;
  if (kind === "condition") return <GitBranch size={14} />;
  if (kind === "parallel") return <Split size={14} />;
  if (kind === "join") return <GitFork size={14} />;
  return <Bot size={14} />;
}

function WorkflowCardNode({ data, selected }: NodeProps<FlowNode>) {
  const avatarUrl = typeof data.avatarUrl === "string" ? data.avatarUrl : null;
  const isTask = data.kind === "task" || data.kind === "approval";
  const stateClass = ["running", "in_progress"].includes(data.status) ? "running" : ["error", "failed"].includes(data.status) ? "error" : "";
  return (
    <div className={`wfs-node ${selected ? "selected" : ""} ${stateClass}`}>
      {data.kind !== "start" && <Handle className="wfs-handle target" type="target" position={Position.Left} />}
      <div className="wfs-node-head">
        <div className="wfs-node-avatar">
          {avatarUrl?.startsWith("http") ? <img src={avatarUrl} alt="" /> : data.agentName ? initials(data.agentName) : nodeIcon(data.kind)}
        </div>
        <div className="wfs-node-agent">
          <strong>{data.agentName ?? (data.kind === "approval" ? "Product Owner" : data.title)}</strong>
          <span>{data.agentRole ?? data.executionPolicy}</span>
        </div>
        <span className="wfs-node-kind">{data.kind}</span>
      </div>
      <div className="wfs-node-body">
        <div className="wfs-node-title">{data.title}</div>
        {isTask && <div className="wfs-node-id">{data.issueIdentifier ?? "Not published"}</div>}
        <div className="wfs-node-foot">
          <span className={`wfs-status wfs-status-${data.status}`}>
            <span className="wfs-status-dot" />{statusLabel(data.status)}
          </span>
          <span className="wfs-node-model">{data.model ?? data.priority}</span>
        </div>
      </div>
      {data.kind !== "end" && <Handle className="wfs-handle source" type="source" position={Position.Right} />}
    </div>
  );
}

const nodeTypes = { workflowNode: WorkflowCardNode };

function workflowToNodes(workflow: WorkflowDefinition, agents: PaperclipAgent[], monitor: MonitorNode[] = []): FlowNode[] {
  const byAgent = new Map(agents.map((agent) => [agent.id, agent]));
  const byNode = new Map(monitor.map((item) => [item.nodeId, item]));
  return workflow.nodes.map((node) => {
    const agent = node.data.agentId ? byAgent.get(node.data.agentId) : null;
    const live = byNode.get(node.id);
    return {
      ...node,
      data: {
        ...node.data,
        status: live?.issue?.status ?? node.data.status,
        issueIdentifier: live?.issue?.identifier ?? node.data.issueIdentifier,
        agentName: agent?.name ?? node.data.agentName,
        agentRole: agent?.title ?? agent?.role ?? node.data.agentRole,
        model: typeof agent?.adapterConfig?.model === "string" ? agent.adapterConfig.model : node.data.model,
        avatarUrl: agent?.avatarUrl ?? agent?.icon ?? null
      }
    };
  });
}

function workflowToEdges(edges: WorkflowEdge[]): FlowEdge[] {
  return edges.map((edge) => ({
    ...edge,
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 }
  }));
}

function flowToWorkflow(workflow: WorkflowDefinition, nodes: FlowNode[], edges: FlowEdge[], viewport?: Viewport): WorkflowDefinition {
  return {
    ...workflow,
    nodes: nodes.map(({ id, type, position, data }) => ({ id, type: type ?? "workflowNode", position, data: { ...data, avatarUrl: undefined } })) as WorkflowNode[],
    edges: edges.map(({ id, source, target, label }) => ({ id, source, target, type: "smoothstep", label: typeof label === "string" ? label : undefined })),
    viewport: viewport ?? workflow.viewport,
    updatedAt: new Date().toISOString()
  };
}

function introducesCycle(nodes: FlowNode[], edges: FlowEdge[], connection: Connection): boolean {
  if (!connection.source || !connection.target || connection.source === connection.target) return true;
  const next = [...edges, { id: "candidate", source: connection.source, target: connection.target } as FlowEdge];
  const adjacency = new Map(nodes.map((node) => [node.id, [] as string[]]));
  for (const edge of next) adjacency.get(edge.source)?.push(edge.target);
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const target of adjacency.get(id) ?? []) if (visit(target)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  return nodes.some((node) => visit(node.id));
}

function layoutGraph(nodes: FlowNode[], edges: FlowEdge[], direction: "LR" | "TB", compact = false): FlowNode[] {
  const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: direction, ranksep: compact ? 54 : 78, nodesep: compact ? 30 : 46, marginx: 24, marginy: 24 });
  for (const node of nodes) graph.setNode(node.id, { width: 196, height: 104 });
  for (const edge of edges) graph.setEdge(edge.source, edge.target);
  dagre.layout(graph);
  return nodes.map((node) => {
    const point = graph.node(node.id);
    return { ...node, position: { x: point.x - 98, y: point.y - 52 } };
  });
}

function LoadingState() {
  return <div className="wfs-loading"><div className="wfs-loading-lines"><div className="wfs-skeleton" /><div className="wfs-skeleton" /><div className="wfs-skeleton" /></div></div>;
}

function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="wfs-error"><div className="wfs-error-card"><strong>Workflow Studio could not load</strong><p>{message}</p>{retry && <button className="wfs-button" onClick={retry}><RefreshCw size={14} /> Retry</button>}</div></div>;
}

function SidebarLibrary({
  bootstrap,
  search,
  setSearch,
  collapsed,
  toggleCollapsed,
  startResize
}: {
  bootstrap: BootstrapData;
  search: string;
  setSearch: (value: string) => void;
  collapsed: boolean;
  toggleCollapsed: () => void;
  startResize: (event: React.PointerEvent) => void;
}) {
  const [role, setRole] = useState("all");
  const roles = [...new Set(bootstrap.agents.map((agent) => agent.role))].sort();
  const agents = bootstrap.agents.filter((agent) => (role === "all" || agent.role === role) && `${agent.name} ${agent.title ?? ""} ${agent.role}`.toLowerCase().includes(search.toLowerCase()));
  const startDrag = (event: React.DragEvent, payload: object) => {
    event.dataTransfer.setData("application/paperclip-workflow-node", JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";
  };
  return (
    <aside className={`wfs-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="wfs-sidebar-head"><strong>{collapsed ? <Bot size={15} /> : "Library"}</strong><button className="wfs-button wfs-icon-button" onClick={toggleCollapsed} title={collapsed ? "Expand library" : "Collapse library"}>{collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}</button></div>
      {collapsed ? <div className="wfs-collapsed-tools">
        {bootstrap.agents.map((agent) => <div key={agent.id} className="wfs-library-icon" title={`${agent.name} · ${agent.title ?? agent.role}`} draggable onDragStart={(event) => startDrag(event, { kind: "task", agentId: agent.id })}><Bot size={14} /></div>)}
        <div className="wfs-collapse-divider" />
        {CONTROL_ITEMS.map((item) => <div key={item.kind} className="wfs-library-icon" title={item.title} draggable onDragStart={(event) => startDrag(event, item)}>{item.icon}</div>)}
      </div> : <>
      <section className="wfs-section">
        <h3 className="wfs-section-title">Agent library</h3>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: 10, color: "var(--muted-foreground)" }} />
          <input className="wfs-search" ref={(element) => { if (element) element.dataset.workflowSearch = "true"; }} style={{ paddingLeft: 30 }} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search agents" />
        </div>
        <select className="wfs-search" style={{ marginBottom: 8 }} value={role} onChange={(event) => setRole(event.target.value)} aria-label="Filter agents by role"><option value="all">All roles</option>{roles.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <div className="wfs-library">
          {agents.map((agent) => (
            <div key={agent.id} className="wfs-library-item" draggable onDragStart={(event) => startDrag(event, { kind: "task", agentId: agent.id })}>
              <span className="wfs-library-icon"><Bot size={15} /></span>
              <span className="wfs-library-copy"><span className="wfs-library-name">{agent.name}</span><span className="wfs-library-meta">{agent.title ?? agent.role} · {agent.status}</span></span>
            </div>
          ))}
          {agents.length === 0 && <div className="wfs-field-note">No agents match this search.</div>}
        </div>
      </section>
      <section className="wfs-section">
        <h3 className="wfs-section-title">Flow controls</h3>
        <div className="wfs-library">
          {CONTROL_ITEMS.map((item) => (
            <div key={item.kind} className="wfs-library-item" draggable onDragStart={(event) => startDrag(event, item)}>
              <span className="wfs-library-icon">{item.icon}</span>
              <span className="wfs-library-copy"><span className="wfs-library-name">{item.title}</span><span className="wfs-library-meta">{item.description}</span></span>
            </div>
          ))}
        </div>
      </section>
      </>}
      {!collapsed && <div className="wfs-resize-handle left" onPointerDown={startResize} title="Resize library" />}
    </aside>
  );
}

function NodeInspector({
  node,
  bootstrap,
  monitor,
  readOnly,
  updateNode,
  close,
  openIssue,
  duplicateNode,
  deleteNode,
  centerNode,
  startResize
}: {
  node: FlowNode | null;
  bootstrap: BootstrapData;
  monitor?: MonitorNode;
  readOnly: boolean;
  updateNode: (id: string, patch: Partial<WorkflowNodeData>) => void;
  close: () => void;
  openIssue: (issueId: string) => void;
  duplicateNode?: (id: string) => void;
  deleteNode?: (id: string) => void;
  centerNode?: (id: string) => void;
  startResize?: (event: React.PointerEvent) => void;
}) {
  if (!node) return <aside className="wfs-inspector"><div className="wfs-inspector-empty"><div><Settings2 size={22} style={{ marginBottom: 8 }} /><br />Select a node to inspect its Paperclip mapping.</div></div></aside>;
  const data = node.data;
  const issues = bootstrap.issues.filter((issue) => !issue.projectId || !data.issueId || issue.projectId === bootstrap.issues.find((item) => item.id === data.issueId)?.projectId);
  return (
    <aside className="wfs-inspector">
      {startResize && <div className="wfs-resize-handle right" onPointerDown={startResize} title="Resize inspector" />}
      <div className="wfs-inspector-head"><strong>{readOnly ? "Live details" : "Node settings"}</strong><button className="wfs-button wfs-icon-button" onClick={close} aria-label="Close inspector"><X size={14} /></button></div>
      <div className="wfs-inspector-content">
        <div className="wfs-meta-grid">
          <div className="wfs-meta"><span>Type</span><strong>{data.kind}</strong></div>
          <div className="wfs-meta"><span>Status</span><strong>{statusLabel(monitor?.issue?.status ?? data.status)}</strong></div>
        </div>
        {!readOnly && <>
          <label className="wfs-field"><span>Title</span><input value={data.title} onChange={(event) => updateNode(node.id, { title: event.target.value })} /></label>
          <label className="wfs-field"><span>Description</span><textarea value={data.description} onChange={(event) => updateNode(node.id, { description: event.target.value })} /></label>
          {(data.kind === "task" || data.kind === "approval") && <>
            <label className="wfs-field"><span>Paperclip issue</span><select value={data.issueId ?? ""} onChange={(event) => {
              const issue = bootstrap.issues.find((item) => item.id === event.target.value);
              updateNode(node.id, { issueId: issue?.id ?? null, issueIdentifier: issue?.identifier ?? null });
            }}><option value="">Create when published</option>{issues.map((issue) => <option key={issue.id} value={issue.id}>{issue.identifier ?? "Issue"}: {issue.title}</option>)}</select></label>
            {data.kind === "task" && <label className="wfs-field"><span>Assigned agent</span><select value={data.agentId ?? ""} onChange={(event) => {
              const agent = bootstrap.agents.find((item) => item.id === event.target.value);
              updateNode(node.id, { agentId: agent?.id ?? null, agentName: agent?.name ?? null, agentRole: agent?.title ?? agent?.role ?? null, model: typeof agent?.adapterConfig?.model === "string" ? agent.adapterConfig.model : null });
            }}><option value="">Unassigned</option>{bootstrap.agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name} · {agent.title ?? agent.role}</option>)}</select></label>}
            <label className="wfs-field"><span>Priority</span><select value={data.priority} onChange={(event) => updateNode(node.id, { priority: event.target.value })}><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label>
          </>}
          {data.kind === "condition" && <div className="wfs-field-note">Conditions are visual routing annotations in this release. Published dependencies remain deterministic and acyclic.</div>}
        </>}
        {data.issueId && <button className="wfs-button" onClick={() => openIssue(data.issueId!)}><Box size={14} /> Open Paperclip issue</button>}
        {!readOnly && <div className="wfs-inspector-actions"><button className="wfs-button" onClick={() => centerNode?.(node.id)}><Maximize2 size={14} /> Center</button><button className="wfs-button" onClick={() => duplicateNode?.(node.id)}><Copy size={14} /> Duplicate</button><button className="wfs-button wfs-button-danger" onClick={() => deleteNode?.(node.id)}><Trash2 size={14} /> Delete</button></div>}
        {readOnly && <>
          <div className="wfs-meta-grid">
            <div className="wfs-meta"><span>Issue</span><strong>{monitor?.issue?.identifier ?? "Not published"}</strong></div>
            <div className="wfs-meta"><span>Priority</span><strong>{monitor?.issue?.priority ?? data.priority}</strong></div>
            <div className="wfs-meta"><span>Runs</span><strong>{monitor?.runs.length ?? 0}</strong></div>
            <div className="wfs-meta"><span>Blocked by</span><strong>{monitor?.blockedBy.length ?? 0}</strong></div>
          </div>
          {monitor?.issue?.startedAt && <div className="wfs-field-note"><Clock3 size={12} /> Started {new Date(monitor.issue.startedAt).toLocaleString()}</div>}
          {monitor?.runs.map((run) => <div key={run.id} className="wfs-meta"><span>Run {run.id.slice(0, 8)}</span><strong>{statusLabel(run.status)}</strong>{run.error && <div className="wfs-field-note">{run.error}</div>}</div>)}
          {(monitor?.blockedBy.length ?? 0) > 0 && <div className="wfs-field"><span>Dependencies</span>{monitor!.blockedBy.map((blocker) => <div key={blocker.id} className="wfs-field-note">{blocker.identifier ?? blocker.id}: {blocker.title}</div>)}</div>}
        </>}
      </div>
    </aside>
  );
}

function ValidationPanel({ result, close, selectNode }: { result: ValidationResult; close: () => void; selectNode: (id: string) => void }) {
  return <div className="wfs-validation"><div className="wfs-validation-head"><strong>{result.valid ? "Workflow is valid" : "Validation needs attention"}</strong><button className="wfs-button wfs-icon-button" onClick={close}><X size={14} /></button></div><div className="wfs-validation-list">
    {result.issues.length === 0 && <div className="wfs-validation-item"><CheckCircle2 size={15} /><span>No validation issues found.</span></div>}
    {result.issues.map((issue, index) => <button key={`${issue.code}-${index}`} className={`wfs-validation-item ${issue.level}`} style={{ border: 0, textAlign: "left", cursor: issue.nodeId ? "pointer" : "default" }} onClick={() => issue.nodeId && selectNode(issue.nodeId)}>{issue.level === "error" ? <AlertCircle size={15} /> : <CircleDot size={15} />}<span>{issue.message}</span></button>)}
  </div></div>;
}

function PublishModal({ workflow, validation, busy, close, publish }: { workflow: WorkflowDefinition; validation: ValidationResult | null; busy: boolean; close: () => void; publish: () => void }) {
  const taskCount = workflow.nodes.filter((node) => node.data.kind === "task" || node.data.kind === "approval").length;
  return <div className="wfs-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) close(); }}><div className="wfs-modal" role="dialog" aria-modal="true" aria-labelledby="publish-title">
    <div className="wfs-modal-head"><h3 id="publish-title">Publish to Paperclip</h3><p>This writes real issues and dependency relations. It does not start any agent run.</p></div>
    <div className="wfs-modal-body">
      <div className="wfs-publish-line"><span>Workflow</span><strong>{workflow.name}</strong></div>
      <div className="wfs-publish-line"><span>Issue nodes</span><strong>{taskCount}</strong></div>
      <div className="wfs-publish-line"><span>Dependencies</span><strong>{workflow.edges.length}</strong></div>
      <div className="wfs-publish-line"><span>Validation</span><strong>{validation?.valid ? "Ready" : "Run validation first"}</strong></div>
      <div className="wfs-publish-line"><span>Agent execution</span><strong>Not started</strong></div>
    </div>
    <div className="wfs-modal-actions"><button className="wfs-button" onClick={close} disabled={busy}>Cancel</button><button className="wfs-button wfs-button-primary" onClick={publish} disabled={busy || !validation?.valid}>{busy ? <RefreshCw size={14} /> : <Rocket size={14} />} Apply workflow</button></div>
  </div></div>;
}

function DesignerCanvas({
  bootstrap,
  initial,
  saveAction,
  validateAction,
  duplicateAction,
  deleteAction,
  publishAction,
  refreshBootstrap,
  selectWorkflow,
  switchMode
}: {
  bootstrap: BootstrapData;
  initial: WorkflowDefinition;
  saveAction: (params?: Record<string, unknown>) => Promise<unknown>;
  validateAction: (params?: Record<string, unknown>) => Promise<unknown>;
  duplicateAction: (params?: Record<string, unknown>) => Promise<unknown>;
  deleteAction: (params?: Record<string, unknown>) => Promise<unknown>;
  publishAction: (params?: Record<string, unknown>) => Promise<unknown>;
  refreshBootstrap: () => void;
  selectWorkflow: (id: string) => void;
  switchMode: (mode: StudioMode) => void;
}) {
  const toast = usePluginToast();
  const navigation = useHostNavigation();
  const flow = useReactFlow<FlowNode, FlowEdge>();
  const nodesInitialized = useNodesInitialized();
  const [workflow, setWorkflow] = useState(initial);
  const [nodes, setNodes] = useState<FlowNode[]>(() => workflowToNodes(initial, bootstrap.agents));
  const [edges, setEdges] = useState<FlowEdge[]>(() => workflowToEdges(initial.edges));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(244);
  const [inspectorWidth, setInspectorWidth] = useState(300);
  const [contextMenu, setContextMenu] = useState<DesignerContextMenu>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [deleteWorkflowId, setDeleteWorkflowId] = useState<string | null>(null);
  const [pendingDeleteNodes, setPendingDeleteNodes] = useState<string[]>([]);
  const [pendingNavigation, setPendingNavigation] = useState<{ run: () => void; label: string } | null>(null);
  const canvasRef = useRef<HTMLElement | null>(null);
  const fittedRef = useRef(false);
  const fitScheduledRef = useRef<number | null>(null);
  const clipboard = useRef<{ nodes: FlowNode[]; edges: FlowEdge[] } | null>(null);
  const history = useRef<Array<{ nodes: FlowNode[]; edges: FlowEdge[] }>>([]);
  const future = useRef<Array<{ nodes: FlowNode[]; edges: FlowEdge[] }>>([]);

  useEffect(() => {
    setWorkflow(initial);
    setNodes(workflowToNodes(initial, bootstrap.agents));
    setEdges(workflowToEdges(initial.edges));
    setSelectedNodeId(null);
    setDirty(false);
    setValidation(null);
    history.current = [];
    future.current = [];
    fittedRef.current = false;
    if (fitScheduledRef.current !== null) {
      window.cancelAnimationFrame(fitScheduledRef.current);
      fitScheduledRef.current = null;
    }
  }, [initial.id, initial.version]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    const guardHostLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const target = event.target as Element | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank") return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      event.preventDefault();
      event.stopPropagation();
      setPendingNavigation({ run: () => navigation.navigate(`${destination.pathname}${destination.search}${destination.hash}`), label: "another page" });
    };
    document.addEventListener("click", guardHostLink, true);
    return () => document.removeEventListener("click", guardHostLink, true);
  }, [dirty, navigation]);

  const snapshot = useCallback(() => {
    history.current.push({ nodes: structuredClone(nodes), edges: structuredClone(edges) });
    if (history.current.length > 60) history.current.shift();
    future.current = [];
  }, [nodes, edges]);

  const markChanged = useCallback(() => { setDirty(true); setValidation(null); }, []);
  const requestNavigation = useCallback((run: () => void, label: string) => {
    if (dirty) setPendingNavigation({ run, label });
    else run();
  }, [dirty]);

  const onNodesChange = useCallback((changes: NodeChange<FlowNode>[]) => {
    if (changes.some((change) => change.type === "remove" || (change.type === "position" && change.dragging === true))) snapshot();
    setNodes((current) => applyNodeChanges(changes, current));
    if (changes.some((change) => change.type === "remove" || change.type === "position")) markChanged();
  }, [markChanged, snapshot]);

  const onEdgesChange = useCallback((changes: EdgeChange<FlowEdge>[]) => {
    if (changes.some((change) => change.type === "remove")) snapshot();
    setEdges((current) => applyEdgeChanges(changes, current));
    if (changes.some((change) => change.type === "remove")) markChanged();
  }, [markChanged, snapshot]);

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    if (edges.some((edge) => edge.source === connection.source && edge.target === connection.target) || introducesCycle(nodes, edges, connection)) {
      toast({ title: "Connection rejected", body: "Dependencies must be unique and cannot form a cycle.", tone: "warn" });
      return;
    }
    snapshot();
    setEdges((current) => [...current, { id: crypto.randomUUID(), source: connection.source!, target: connection.target!, type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 } }]);
    markChanged();
  }, [edges, nodes, toast, snapshot, markChanged]);

  const updateNode = useCallback((id: string, patch: Partial<WorkflowNodeData>) => {
    snapshot();
    setNodes((current) => current.map((node) => node.id === id ? { ...node, data: { ...node.data, ...patch } } : node));
    markChanged();
  }, [snapshot, markChanged]);

  const updateWorkflow = useCallback((patch: Partial<WorkflowDefinition>) => {
    setWorkflow((current) => ({ ...current, ...patch }));
    markChanged();
  }, [markChanged]);

  const addDroppedNode = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData("application/paperclip-workflow-node");
    if (!raw) return;
    const payload = JSON.parse(raw) as { kind: WorkflowNodeKind; agentId?: string; title?: string; description?: string };
    const agent = payload.agentId ? bootstrap.agents.find((item) => item.id === payload.agentId) : null;
    const position = flow.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const kind = payload.kind;
    const title = agent ? `Task for ${agent.name}` : payload.title ?? "New step";
    const data: WorkflowNodeData = {
      kind,
      title,
      description: payload.description ?? "",
      issueId: null,
      issueIdentifier: null,
      agentId: agent?.id ?? null,
      agentName: agent?.name ?? null,
      agentRole: agent?.title ?? agent?.role ?? null,
      status: "draft",
      priority: "medium",
      executionPolicy: kind === "task" ? "paperclip" : kind === "approval" ? "human" : "visual-only",
      model: typeof agent?.adapterConfig?.model === "string" ? agent.adapterConfig.model : null,
      avatarUrl: agent?.avatarUrl ?? agent?.icon ?? null
    };
    snapshot();
    setNodes((current) => [...current, { id: crypto.randomUUID(), type: "workflowNode", position, data }]);
    markChanged();
  }, [bootstrap.agents, flow, snapshot, markChanged]);

  const currentPayload = useCallback(() => flowToWorkflow(workflow, nodes, edges, flow.getViewport()), [workflow, nodes, edges, flow]);

  const save = useCallback(async (): Promise<WorkflowDefinition | null> => {
    setBusy(true);
    try {
      const response = await saveAction({ workflow: currentPayload(), expectedVersion: workflow.version }) as { workflow: WorkflowDefinition; validation: ValidationResult };
      setWorkflow(response.workflow);
      setNodes(workflowToNodes(response.workflow, bootstrap.agents));
      setEdges(workflowToEdges(response.workflow.edges));
      setDirty(false);
      setValidation(response.validation);
      refreshBootstrap();
      toast({ title: "Workflow saved", body: "Your latest workflow changes are stored in Paperclip.", tone: "success" });
      return response.workflow;
    } catch (error) {
      toast({ title: "Save failed", body: asMessage(error), tone: "error", ttlMs: 8000 });
      return null;
    } finally { setBusy(false); }
  }, [saveAction, currentPayload, workflow.version, bootstrap.agents, refreshBootstrap, toast]);

  const validate = useCallback(async (): Promise<ValidationResult | null> => {
    setBusy(true);
    try {
      const response = await validateAction({ workflow: currentPayload() }) as ValidationResult;
      setValidation(response);
      setShowValidation(true);
      toast({ title: response.valid ? "Workflow is valid" : "Validation failed", body: `${response.issues.length} item${response.issues.length === 1 ? "" : "s"} reported.`, tone: response.valid ? "success" : "warn" });
      return response;
    } catch (error) {
      toast({ title: "Validation failed", body: asMessage(error), tone: "error" });
      return null;
    } finally { setBusy(false); }
  }, [validateAction, currentPayload, toast]);

  const duplicateWorkflow = useCallback(async (workflowId: string) => {
    setBusy(true);
    try {
      const response = await duplicateAction({ workflowId }) as { workflow: WorkflowDefinition };
      refreshBootstrap();
      selectWorkflow(response.workflow.id);
      toast({ title: "Workflow duplicated", body: "Issue links were intentionally cleared.", tone: "success" });
    } catch (error) { toast({ title: "Duplicate failed", body: asMessage(error), tone: "error" }); }
    finally { setBusy(false); }
  }, [duplicateAction, refreshBootstrap, selectWorkflow, toast]);

  const deleteWorkflow = useCallback(async () => {
    if (!deleteWorkflowId) return;
    setBusy(true);
    try {
      await deleteAction({ workflowId: deleteWorkflowId });
      setDeleteWorkflowId(null);
      refreshBootstrap();
      navigation.navigate("/workflows");
      toast({ title: "Workflow deleted", body: "The template was removed. Projects, issues, and agents were preserved.", tone: "success" });
    } catch (error) { toast({ title: "Delete stopped", body: asMessage(error), tone: "error", ttlMs: 9000 }); }
    finally { setBusy(false); }
  }, [deleteWorkflowId, deleteAction, refreshBootstrap, navigation, toast]);

  const preparePublish = useCallback(async () => {
    const result = await validate();
    if (result) setShowPublish(true);
  }, [validate]);

  const publish = useCallback(async () => {
    setBusy(true);
    try {
      let base = workflow;
      if (dirty) {
        const saved = await save();
        if (!saved) return;
        base = saved;
      }
      const response = await publishAction({ workflowId: base.id, expectedVersion: base.version }) as { workflow: WorkflowDefinition };
      setWorkflow(response.workflow);
      setNodes(workflowToNodes(response.workflow, bootstrap.agents));
      setEdges(workflowToEdges(response.workflow.edges));
      setDirty(false);
      setShowPublish(false);
      refreshBootstrap();
      toast({ title: "Workflow published", body: `${response.workflow.publishedIssueIds.length} Paperclip issues are mapped. No agent was started.`, tone: "success", ttlMs: 8000 });
      switchMode("monitor");
    } catch (error) { toast({ title: "Publish stopped", body: asMessage(error), tone: "error", ttlMs: 10000 }); }
    finally { setBusy(false); }
  }, [workflow, dirty, save, publishAction, bootstrap.agents, refreshBootstrap, toast, switchMode]);

  const undo = useCallback(() => {
    const previous = history.current.pop();
    if (!previous) return;
    future.current.push({ nodes: structuredClone(nodes), edges: structuredClone(edges) });
    setNodes(previous.nodes); setEdges(previous.edges); markChanged();
  }, [nodes, edges, markChanged]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    history.current.push({ nodes: structuredClone(nodes), edges: structuredClone(edges) });
    setNodes(next.nodes); setEdges(next.edges); markChanged();
  }, [nodes, edges, markChanged]);

  const fitAll = useCallback(() => flow.fitView({ padding: 0.18, minZoom: 0.2, maxZoom: 1, duration: 280 }), [flow]);
  const fitSelection = useCallback(() => {
    const selected = nodes.filter((node) => node.selected);
    if (selected.length) flow.fitView({ nodes: selected, padding: 0.55, maxZoom: 1.12, duration: 260 });
    else fitAll();
  }, [nodes, flow, fitAll]);
  const centerNode = useCallback((id: string) => flow.fitView({ nodes: nodes.filter((node) => node.id === id), padding: 0.65, maxZoom: 1.1, duration: 260 }), [flow, nodes]);

  const autoLayout = useCallback((direction: "LR" | "TB" = workflow.layout.direction, compact = workflow.layout.compact) => {
    snapshot();
    setNodes((current) => layoutGraph(current, edges, direction, compact));
    setWorkflow((current) => ({ ...current, layout: { direction, compact } }));
    markChanged();
    window.setTimeout(fitAll, 40);
  }, [snapshot, edges, workflow.layout.direction, workflow.layout.compact, markChanged, fitAll]);

  const removeElements = useCallback((nodeIds: string[], edgeIds: string[] = []) => {
    if (!nodeIds.length && !edgeIds.length) return;
    snapshot();
    const nodeSet = new Set(nodeIds);
    const edgeSet = new Set(edgeIds);
    setNodes((current) => current.filter((node) => !nodeSet.has(node.id)));
    setEdges((current) => current.filter((edge) => !edgeSet.has(edge.id) && !nodeSet.has(edge.source) && !nodeSet.has(edge.target)));
    setSelectedNodeId((current) => current && nodeSet.has(current) ? null : current);
    setContextMenu(null);
    markChanged();
  }, [snapshot, markChanged]);

  const requestDeleteNodes = useCallback((ids: string[]) => {
    const unique = [...new Set(ids)];
    if (!unique.length) return;
    if (nodes.some((node) => unique.includes(node.id) && node.data.issueId)) setPendingDeleteNodes(unique);
    else removeElements(unique);
  }, [nodes, removeElements]);

  const duplicateNodes = useCallback((ids: string[]) => {
    const source = nodes.filter((node) => ids.includes(node.id));
    if (!source.length) return;
    snapshot();
    const idMap = new Map(source.map((node) => [node.id, crypto.randomUUID()]));
    const copies = source.map((node) => ({ ...structuredClone(node), id: idMap.get(node.id)!, selected: true, position: { x: node.position.x + 32, y: node.position.y + 32 }, data: { ...structuredClone(node.data), issueId: null, issueIdentifier: null, status: "draft" } }));
    const copiedEdges = edges.filter((edge) => idMap.has(edge.source) && idMap.has(edge.target)).map((edge) => ({ ...edge, id: crypto.randomUUID(), source: idMap.get(edge.source)!, target: idMap.get(edge.target)! }));
    setNodes((current) => [...current.map((node) => ({ ...node, selected: false })), ...copies]);
    setEdges((current) => [...current, ...copiedEdges]);
    setSelectedNodeId(copies[0]?.id ?? null);
    markChanged();
  }, [nodes, edges, snapshot, markChanged]);

  const copySelection = useCallback(() => {
    const picked = nodes.filter((node) => node.selected || node.id === selectedNodeId);
    if (!picked.length) return;
    const ids = new Set(picked.map((node) => node.id));
    clipboard.current = { nodes: structuredClone(picked), edges: structuredClone(edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target))) };
  }, [nodes, edges, selectedNodeId]);

  const pasteSelection = useCallback(() => {
    const copied = clipboard.current;
    if (!copied?.nodes.length) return;
    const ids = copied.nodes.map((node) => node.id);
    const idMap = new Map(ids.map((id) => [id, crypto.randomUUID()]));
    snapshot();
    const pasted = copied.nodes.map((node) => ({ ...structuredClone(node), id: idMap.get(node.id)!, selected: true, position: { x: node.position.x + 48, y: node.position.y + 48 }, data: { ...structuredClone(node.data), issueId: null, issueIdentifier: null, status: "draft" } }));
    const pastedEdges = copied.edges.map((edge) => ({ ...edge, id: crypto.randomUUID(), source: idMap.get(edge.source)!, target: idMap.get(edge.target)! }));
    setNodes((current) => [...current.map((node) => ({ ...node, selected: false })), ...pasted]);
    setEdges((current) => [...current, ...pastedEdges]);
    setSelectedNodeId(pasted[0]?.id ?? null);
    markChanged();
  }, [snapshot, markChanged]);

  const addNodeAt = useCallback((kind: WorkflowNodeKind, x: number, y: number) => {
    const item = CONTROL_ITEMS.find((control) => control.kind === kind);
    const data: WorkflowNodeData = { kind, title: item?.title ?? "New step", description: item?.description ?? "", issueId: null, issueIdentifier: null, agentId: null, agentName: null, agentRole: null, status: "draft", priority: "medium", executionPolicy: kind === "approval" ? "human" : "visual-only", model: null, avatarUrl: null };
    snapshot();
    setNodes((current) => [...current, { id: crypto.randomUUID(), type: "workflowNode", position: { x, y }, data }]);
    setContextMenu(null);
    markChanged();
  }, [snapshot, markChanged]);

  const startSidebarResize = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidebarWidth;
    const move = (next: PointerEvent) => setSidebarWidth(Math.max(220, Math.min(320, startWidth + next.clientX - startX)));
    const stop = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", stop);
  }, [sidebarWidth]);

  const startInspectorResize = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = inspectorWidth;
    const move = (next: PointerEvent) => setInspectorWidth(Math.max(260, Math.min(430, startWidth + startX - next.clientX)));
    const stop = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", stop);
  }, [inspectorWidth]);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(currentPayload(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `${workflow.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workflow"}.json`; anchor.click();
    URL.revokeObjectURL(url);
    setMoreOpen(false);
  }, [currentPayload, workflow.name]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editing = Boolean(target?.closest("input, textarea, select, [contenteditable='true']"));
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") { event.preventDefault(); void save(); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); (document.querySelector("[data-workflow-search='true']") as HTMLInputElement | null)?.focus(); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") { event.preventDefault(); event.shiftKey ? redo() : undo(); }
      if (!editing && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") { event.preventDefault(); copySelection(); }
      if (!editing && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v") { event.preventDefault(); pasteSelection(); }
      if (!editing && (event.key === "Delete" || event.key === "Backspace")) {
        event.preventDefault();
        const nodeIds = nodes.filter((node) => node.selected || node.id === selectedNodeId).map((node) => node.id);
        const edgeIds = edges.filter((edge) => edge.selected).map((edge) => edge.id);
        if (nodeIds.length) requestDeleteNodes(nodeIds); else removeElements([], edgeIds);
      }
      if (event.key === "Escape") { setContextMenu(null); setMoreOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, undo, redo, copySelection, pasteSelection, nodes, edges, selectedNodeId, requestDeleteNodes, removeElements]);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;
  const scheduleInitialFit = useCallback(() => {
    const element = canvasRef.current;
    if (!nodesInitialized || fittedRef.current || fitScheduledRef.current !== null || !element) return;
    const bounds = element.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1) return;
    fitScheduledRef.current = window.requestAnimationFrame(() => {
      fitScheduledRef.current = window.requestAnimationFrame(() => {
        fitScheduledRef.current = null;
        if (fittedRef.current) return;
        fitAll();
        fittedRef.current = true;
      });
    });
  }, [fitAll, nodesInitialized]);

  useEffect(() => {
    const element = canvasRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(scheduleInitialFit);
    observer.observe(element);
    scheduleInitialFit();
    return () => observer.disconnect();
  }, [scheduleInitialFit, initial.id]);

  useEffect(() => () => {
    if (fitScheduledRef.current !== null) window.cancelAnimationFrame(fitScheduledRef.current);
  }, []);

  const designerStyle = {
    "--wfs-sidebar-width": sidebarCollapsed ? "54px" : `${sidebarWidth}px`,
    "--wfs-inspector-width": `${inspectorWidth}px`
  } as React.CSSProperties;

  return <div className="wfs-designer" style={designerStyle} onClick={() => { setContextMenu(null); setMoreOpen(false); }}>
    <div className="wfs-toolbar wfs-designer-toolbar" onClick={(event) => event.stopPropagation()}>
      <div className="wfs-toolbar-left">
        <button className="wfs-button wfs-icon-button" onClick={() => requestNavigation(() => navigation.navigate("/workflows"), "the workflow list")} title="Back to workflows"><ArrowLeft size={14} /></button>
        <div className="wfs-brand"><span className="wfs-brand-icon"><Workflow size={16} /></span><div className="wfs-title-wrap"><div className="wfs-title">Workflow Designer</div><div className="wfs-subtitle">{dirty ? "Unsaved changes" : workflowStatusLabel(workflow.status)}</div></div></div>
        <input className="wfs-name-input" value={workflow.name} onChange={(event) => updateWorkflow({ name: event.target.value })} aria-label="Workflow name" />
        <span className="wfs-badge wfs-badge-draft">Shared template</span>
      </div>
      <div className="wfs-tabs" role="tablist"><button className="wfs-tab" aria-selected="true">Designer</button><button className="wfs-tab" aria-selected="false" onClick={() => requestNavigation(() => switchMode("monitor"), "Monitor")}>Monitor</button><button className="wfs-tab" aria-selected="false" onClick={() => requestNavigation(() => switchMode("templates"), "Templates")}>Templates</button></div>
      <div className="wfs-toolbar-actions">
        <button className="wfs-button wfs-icon-button" onClick={undo} disabled={history.current.length === 0} title="Undo"><Undo2 size={14} /></button>
        <button className="wfs-button wfs-icon-button" onClick={redo} disabled={future.current.length === 0} title="Redo"><Redo2 size={14} /></button>
        <button className="wfs-button" onClick={() => autoLayout()} title="Arrange nodes"><LayoutDashboard size={14} /><span>Auto layout</span></button>
        <button className="wfs-button wfs-icon-button" onClick={fitAll} title="Fit all"><Maximize2 size={14} /></button>
        <button className="wfs-button wfs-button-primary" onClick={() => void save()} disabled={busy || !dirty} title="Save workflow"><Save size={14} /><span>Save</span></button>
        <div className="wfs-menu-anchor"><button className="wfs-button wfs-icon-button" onClick={() => setMoreOpen((value) => !value)} title="More actions"><MoreHorizontal size={15} /></button>{moreOpen && <div className="wfs-popover wfs-toolbar-popover">
          <button onClick={() => { void validate(); setMoreOpen(false); }}><Check size={14} /> Validate</button>
          <button onClick={() => { requestNavigation(() => void duplicateWorkflow(workflow.id), "the duplicated workflow"); setMoreOpen(false); }}><Copy size={14} /> Duplicate workflow</button>
          <button onClick={exportJson}><Download size={14} /> Export JSON</button>
          <div className="wfs-menu-separator" />
          <button onClick={() => { autoLayout("LR", false); setMoreOpen(false); }}>Horizontal layout</button>
          <button onClick={() => { autoLayout("TB", false); setMoreOpen(false); }}>Vertical layout</button>
          <button onClick={() => { autoLayout(workflow.layout.direction, true); setMoreOpen(false); }}>Compact layout</button>
          <div className="wfs-menu-separator" />
          <button className="danger" onClick={() => { setDeleteWorkflowId(workflow.id); setMoreOpen(false); }}><Trash2 size={14} /> Delete workflow</button>
        </div>}</div>
      </div>
    </div>
    <div className={`wfs-body ${selectedNode ? "" : "inspector-closed"}`}>
      <SidebarLibrary bootstrap={bootstrap} search={search} setSearch={setSearch} collapsed={sidebarCollapsed} toggleCollapsed={() => setSidebarCollapsed((value) => !value)} startResize={startSidebarResize} />
      <main ref={canvasRef} className="wfs-canvas" onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }} onDrop={addDroppedNode}>
        <ReactFlow<FlowNode, FlowEdge>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onNodeDoubleClick={(_, node) => centerNode(node.id)}
          onNodeContextMenu={(event, node) => { event.preventDefault(); event.stopPropagation(); setSelectedNodeId(node.id); setContextMenu({ kind: "node", x: event.clientX, y: event.clientY, nodeId: node.id }); }}
          onEdgeContextMenu={(event, edge) => { event.preventDefault(); event.stopPropagation(); setContextMenu({ kind: "edge", x: event.clientX, y: event.clientY, edgeId: edge.id }); }}
          onPaneContextMenu={(event) => { event.preventDefault(); const point = flow.screenToFlowPosition({ x: event.clientX, y: event.clientY }); setContextMenu({ kind: "canvas", x: event.clientX, y: event.clientY, flowX: point.x, flowY: point.y }); }}
          onPaneClick={() => { setSelectedNodeId(null); setContextMenu(null); }}
          onMoveEnd={(_, viewport) => setWorkflow((current) => ({ ...current, viewport }))}
          defaultViewport={workflow.viewport}
          snapToGrid
          snapGrid={[16, 16]}
          selectionOnDrag
          multiSelectionKeyCode={["Control", "Meta"]}
          deleteKeyCode={null}
          minZoom={0.18}
          maxZoom={1.8}
        >
          <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable nodeColor={(node) => node.data?.status === "done" ? "#22c55e" : "#2f6fed"} />
          <div className="wfs-zoom-bar"><button onClick={() => flow.zoomIn({ duration: 180 })} title="Zoom in"><ZoomIn size={14} /></button><button onClick={() => flow.zoomOut({ duration: 180 })} title="Zoom out"><ZoomOut size={14} /></button><button onClick={fitSelection} title="Fit selection"><Maximize2 size={14} /></button></div>
        </ReactFlow>
        {showValidation && validation && <ValidationPanel result={validation} close={() => setShowValidation(false)} selectNode={(id) => { setSelectedNodeId(id); centerNode(id); }} />}
      </main>
      {selectedNode && <NodeInspector node={selectedNode} bootstrap={bootstrap} readOnly={false} updateNode={updateNode} close={() => setSelectedNodeId(null)} openIssue={(id) => navigation.navigate(`/issues/${id}`)} duplicateNode={(id) => duplicateNodes([id])} deleteNode={(id) => requestDeleteNodes([id])} centerNode={centerNode} startResize={startInspectorResize} />}
    </div>
    {contextMenu && <div className="wfs-context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={(event) => event.stopPropagation()}>
      {contextMenu.kind === "node" && <><button onClick={() => { centerNode(contextMenu.nodeId); setContextMenu(null); }}><Maximize2 size={14} /> Center node</button><button onClick={() => { duplicateNodes([contextMenu.nodeId]); setContextMenu(null); }}><Copy size={14} /> Duplicate node</button><button className="danger" onClick={() => requestDeleteNodes([contextMenu.nodeId])}><Trash2 size={14} /> Delete node</button></>}
      {contextMenu.kind === "edge" && <button className="danger" onClick={() => removeElements([], [contextMenu.edgeId])}><Trash2 size={14} /> Delete connection</button>}
      {contextMenu.kind === "canvas" && <><button onClick={() => addNodeAt("task", contextMenu.flowX, contextMenu.flowY)}><Bot size={14} /> Add task</button><button onClick={() => addNodeAt("approval", contextMenu.flowX, contextMenu.flowY)}><UserCheck size={14} /> Add approval</button><button onClick={() => addNodeAt("condition", contextMenu.flowX, contextMenu.flowY)}><Diamond size={14} /> Add condition</button><div className="wfs-menu-separator" /><button onClick={fitAll}><Maximize2 size={14} /> Fit all</button></>}
    </div>}
    {pendingDeleteNodes.length > 0 && <div className="wfs-modal-backdrop" role="presentation"><div className="wfs-modal wfs-confirm-modal" role="dialog" aria-modal="true"><div className="wfs-modal-head"><h3>Remove linked node?</h3><p>This removes the node from this workflow. The linked Paperclip issue will not be deleted.</p></div><div className="wfs-modal-actions"><button className="wfs-button" onClick={() => setPendingDeleteNodes([])}>Cancel</button><button className="wfs-button wfs-button-danger" onClick={() => { removeElements(pendingDeleteNodes); setPendingDeleteNodes([]); }}><Trash2 size={14} /> Remove node</button></div></div></div>}
    {deleteWorkflowId && <div className="wfs-modal-backdrop" role="presentation"><div className="wfs-modal wfs-confirm-modal" role="dialog" aria-modal="true"><div className="wfs-modal-head"><h3>Are you sure you want to delete this workflow?</h3><p>This removes only the reusable template. Paperclip projects, issues, dependencies, and agents are preserved. A template used by a project cannot be deleted.</p></div><div className="wfs-modal-actions"><button className="wfs-button" disabled={busy} onClick={() => setDeleteWorkflowId(null)}>Cancel</button><button className="wfs-button wfs-button-danger" disabled={busy} onClick={() => void deleteWorkflow()}><Trash2 size={14} /> Delete workflow</button></div></div></div>}
    {pendingNavigation && <div className="wfs-modal-backdrop" role="presentation"><div className="wfs-modal wfs-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="unsaved-workflow-title"><div className="wfs-modal-head"><h3 id="unsaved-workflow-title">Unsaved workflow changes</h3><p>Save before opening {pendingNavigation.label}, discard these changes, or continue editing.</p></div><div className="wfs-modal-actions wfs-unsaved-actions"><button className="wfs-button" disabled={busy} onClick={() => setPendingNavigation(null)}>Continue editing</button><button className="wfs-button wfs-button-danger" disabled={busy} onClick={() => { const next = pendingNavigation.run; setDirty(false); setPendingNavigation(null); next(); }}>Discard changes</button><button className="wfs-button wfs-button-primary" disabled={busy} onClick={async () => { const next = pendingNavigation.run; const saved = await save(); if (saved) { setPendingNavigation(null); next(); } }}><Save size={14} /> Save and leave</button></div></div></div>}
  </div>;
}

function MonitorCanvas({ bootstrap, data, refresh }: { bootstrap: BootstrapData; data: WorkflowData; refresh: () => void }) {
  const navigation = useHostNavigation();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const nodes = useMemo(() => workflowToNodes(data.workflow, bootstrap.agents, data.monitor), [data.workflow, data.monitor, bootstrap.agents]);
  const edges = useMemo(() => workflowToEdges(data.workflow.edges), [data.workflow.edges]);
  const monitorByNode = useMemo(() => new Map(data.monitor.map((item) => [item.nodeId, item])), [data.monitor]);
  const issues = data.monitor.flatMap((item) => item.issue ? [item.issue] : []);
  const done = issues.filter((issue) => issue.status === "done").length;
  const running = issues.filter((issue) => issue.status === "in_progress").length;
  const blocked = issues.filter((issue) => issue.status === "blocked").length;
  const progress = issues.length ? Math.round(done / issues.length * 100) : 0;
  useEffect(() => {
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") refresh(); }, 8000);
    return () => window.clearInterval(timer);
  }, [refresh]);
  const selected = nodes.find((node) => node.id === selectedNodeId) ?? null;
  return <div className={`wfs-body ${selected ? "" : "inspector-closed"}`} style={{ gridTemplateColumns: selected ? "minmax(0,1fr) 306px" : "minmax(0,1fr) 0" }}>
    <main className="wfs-canvas">
      <div className="wfs-monitor-bar">
        <div className="wfs-monitor-stat"><span>Progress</span><strong>{progress}%</strong></div><div className="wfs-progress"><span style={{ width: `${progress}%` }} /></div>
        <div className="wfs-monitor-stat"><span>Running</span><strong>{running}</strong></div>
        <div className="wfs-monitor-stat"><span>Blocked</span><strong>{blocked}</strong></div>
        <div className="wfs-monitor-stat"><span>Completed</span><strong>{done}/{issues.length}</strong></div>
        <div className="wfs-live"><span className="wfs-live-dot" /> Refreshes every 8 seconds</div>
        <button className="wfs-button wfs-icon-button" onClick={refresh} title="Refresh now"><RefreshCw size={14} /></button>
      </div>
      <ReactFlow<FlowNode, FlowEdge> nodes={nodes} edges={edges} nodeTypes={nodeTypes} nodesDraggable={false} nodesConnectable={false} elementsSelectable onNodeClick={(_, node) => setSelectedNodeId(node.id)} onPaneClick={() => setSelectedNodeId(null)} defaultViewport={data.workflow.viewport} fitView fitViewOptions={{ padding: 0.2 }} minZoom={0.18} maxZoom={1.8}>
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} /><Controls showInteractive={false} /><MiniMap pannable zoomable />
      </ReactFlow>
    </main>
    {selected && <NodeInspector node={selected} bootstrap={bootstrap} monitor={monitorByNode.get(selected.id)} readOnly updateNode={() => undefined} close={() => setSelectedNodeId(null)} openIssue={(id) => navigation.navigate(`/issues/${id}`)} />}
  </div>;
}

function TemplatesPage({ exists, open }: { exists: boolean; open: () => Promise<void> }) {
  return <div className="wfs-template-page"><div className="wfs-page-heading"><h2>Workflow templates</h2><p>Reusable process definitions. Projects choose one of these templates from their own Workflow tab.</p></div><div className="wfs-template-card"><div className="wfs-template-top"><div><h3>AI Software Development Lifecycle</h3><p>Plan, design, build, review, test, deploy, and approve with the eight configured agents.</p></div><button className="wfs-button wfs-button-primary" onClick={() => void open()}>{exists ? <Settings2 size={14} /> : <Plus size={14} />} {exists ? "Open template" : "Create template"}</button></div><div className="wfs-template-flow"><span className="wfs-template-step">Plan</span><ChevronRight className="wfs-template-arrow" size={13} /><span className="wfs-template-step">Architecture</span><ChevronRight className="wfs-template-arrow" size={13} /><span className="wfs-template-step">Build</span><ChevronRight className="wfs-template-arrow" size={13} /><span className="wfs-template-step">Review</span><ChevronRight className="wfs-template-arrow" size={13} /><span className="wfs-template-step">Test</span><ChevronRight className="wfs-template-arrow" size={13} /><span className="wfs-template-step">Deploy</span></div></div></div>;
}

function WorkflowListPage({
  workflows,
  busy,
  createWorkflow,
  openWorkflow,
  duplicateWorkflow,
  renameWorkflow,
  deleteWorkflow,
  openTemplates
}: {
  workflows: WorkflowIndexEntry[];
  busy: boolean;
  createWorkflow: () => void;
  openWorkflow: (id: string) => void;
  duplicateWorkflow: (id: string) => void;
  renameWorkflow: (workflow: WorkflowIndexEntry, name: string) => void;
  deleteWorkflow: (workflow: WorkflowIndexEntry) => void;
  openTemplates: () => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "published">("all");
  const [renameTarget, setRenameTarget] = useState<WorkflowIndexEntry | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<WorkflowIndexEntry | null>(null);
  const visible = workflows
    .filter((workflow) => (status === "all" || workflow.status === status) && `${workflow.name} ${workflow.description}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  const beginRename = (workflow: WorkflowIndexEntry) => { setRenameTarget(workflow); setRenameValue(workflow.name); };
  return <div className="wfs-list-page">
    <header className="wfs-list-header">
      <div><div className="wfs-list-eyebrow">Workflow Studio</div><h1>Workflows</h1><p>Reusable delivery graphs for Paperclip projects. Opening a workflow never starts an agent.</p></div>
      <div className="wfs-list-header-actions"><button className="wfs-button" onClick={openTemplates}><Layers3 size={14} /> Templates</button><button className="wfs-button wfs-button-primary" disabled={busy} onClick={createWorkflow}><Plus size={14} /> Create workflow</button></div>
    </header>
    <div className="wfs-list-filters">
      <label className="wfs-list-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search workflows" aria-label="Search workflows" /></label>
      <select value={status} onChange={(event) => setStatus(event.target.value as "all" | "draft" | "published")} aria-label="Filter workflows by status"><option value="all">All statuses</option><option value="draft">Saved</option><option value="published">Published</option></select>
      <span>{visible.length} of {workflows.length}</span>
    </div>
    {visible.length > 0 ? <div className="wfs-workflow-table" role="table" aria-label="Workflows">
      <div className="wfs-workflow-table-head" role="row"><span>Name</span><span>Status</span><span>Updated</span><span>Actions</span></div>
      {visible.map((workflow) => <div className="wfs-workflow-table-row" role="row" key={workflow.id}>
        <button className="wfs-workflow-main" onClick={() => openWorkflow(workflow.id)}><span className="wfs-workflow-mark"><Workflow size={15} /></span><span><strong>{workflow.name}</strong><small>{workflow.description || "No description"}</small></span></button>
        <span><span className={`wfs-badge ${workflow.status === "published" ? "wfs-badge-published" : "wfs-badge-draft"}`}>{workflowStatusLabel(workflow.status)}</span></span>
        <time dateTime={workflow.updatedAt}>{new Date(workflow.updatedAt).toLocaleString()}</time>
        <div className="wfs-workflow-actions"><button className="wfs-button" onClick={() => openWorkflow(workflow.id)}>Open</button><button className="wfs-button wfs-icon-button" onClick={() => duplicateWorkflow(workflow.id)} title={`Duplicate ${workflow.name}`}><Copy size={14} /></button><button className="wfs-button wfs-icon-button" onClick={() => beginRename(workflow)} title={`Rename ${workflow.name}`}><Braces size={14} /></button><button className="wfs-button wfs-icon-button wfs-button-danger" onClick={() => setDeleteTarget(workflow)} title={`Delete ${workflow.name}`}><Trash2 size={14} /></button></div>
      </div>)}
    </div> : <div className="wfs-list-empty"><Workflow size={24} /><div><strong>{workflows.length ? "No workflows match" : "No workflows yet"}</strong><p>{workflows.length ? "Change the search or status filter." : "Create a reusable workflow for your projects."}</p></div>{workflows.length === 0 && <button className="wfs-button wfs-button-primary" onClick={createWorkflow}><Plus size={14} /> Create workflow</button>}</div>}
    {renameTarget && <div className="wfs-modal-backdrop" role="presentation"><div className="wfs-modal wfs-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="rename-workflow-title"><div className="wfs-modal-head"><h3 id="rename-workflow-title">Rename workflow</h3><p>Nodes, edges, project bindings, and Paperclip dependencies stay unchanged.</p></div><div className="wfs-modal-body"><label className="wfs-field"><span>Name</span><input autoFocus maxLength={120} value={renameValue} onChange={(event) => setRenameValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && renameValue.trim()) { renameWorkflow(renameTarget, renameValue.trim()); setRenameTarget(null); } }} /></label></div><div className="wfs-modal-actions"><button className="wfs-button" onClick={() => setRenameTarget(null)}>Cancel</button><button className="wfs-button wfs-button-primary" disabled={busy || !renameValue.trim()} onClick={() => { renameWorkflow(renameTarget, renameValue.trim()); setRenameTarget(null); }}>Rename</button></div></div></div>}
    {deleteTarget && <div className="wfs-modal-backdrop" role="presentation"><div className="wfs-modal wfs-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-workflow-title"><div className="wfs-modal-head"><h3 id="delete-workflow-title">Are you sure you want to delete this workflow?</h3><p>Only “{deleteTarget.name}” will be removed. Paperclip issues, agents, projects, and task dependencies will not be deleted.</p></div><div className="wfs-modal-actions"><button className="wfs-button" onClick={() => setDeleteTarget(null)}>Cancel</button><button className="wfs-button wfs-button-danger" disabled={busy} onClick={() => { deleteWorkflow(deleteTarget); setDeleteTarget(null); }}><Trash2 size={14} /> Delete workflow</button></div></div></div>}
  </div>;
}

function WorkflowWorkspace({ companyId, projectId }: { companyId: string; projectId: string | null }) {
  const navigation = useHostNavigation();
  const location = useHostLocation();
  const bootstrapParams = useMemo(() => ({ companyId, ...(projectId ? { projectId } : {}) }), [companyId, projectId]);
  const bootstrapData = usePluginData<BootstrapData>("bootstrap", bootstrapParams);
  const createTemplate = usePluginAction("create-template");
  const createWorkflowAction = usePluginAction("create-workflow");
  const saveAction = usePluginAction("save-workflow");
  const validateAction = usePluginAction("validate-workflow");
  const duplicateAction = usePluginAction("duplicate-workflow");
  const renameAction = usePluginAction("rename-workflow");
  const deleteAction = usePluginAction("delete-workflow");
  const publishAction = usePluginAction("publish-workflow");
  const toast = usePluginToast();
  const [busy, setBusy] = useState(false);
  const routeParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const workflowId = routeParams.get("workflow");
  const routeView = routeParams.get("view");
  const mode: StudioMode = routeView === "monitor" ? "monitor" : routeView === "templates" ? "templates" : "designer";
  const workflowPath = useCallback((id: string, view: "designer" | "monitor" = "designer") => `/workflows?workflow=${encodeURIComponent(id)}&view=${view}`, []);
  const openWorkflow = useCallback((id: string, view: "designer" | "monitor" = "designer") => navigation.navigate(workflowPath(id, view)), [navigation, workflowPath]);
  const openList = useCallback(() => navigation.navigate("/workflows"), [navigation]);
  const openTemplates = useCallback(() => navigation.navigate("/workflows?view=templates"), [navigation]);

  const create = useCallback(async () => {
    try {
      const response = await createTemplate({ companyId }) as { workflow: WorkflowDefinition };
      bootstrapData.refresh();
      openWorkflow(response.workflow.id);
      toast({ title: "Template created", body: "The workflow is saved. No issue or agent run was created.", tone: "success" });
    } catch (error) { toast({ title: "Template failed", body: asMessage(error), tone: "error" }); }
  }, [createTemplate, companyId, bootstrapData.refresh, openWorkflow, toast]);

  const createBlank = useCallback(async () => {
    setBusy(true);
    try {
      const response = await createWorkflowAction({ companyId, name: "Untitled workflow" }) as { workflow: WorkflowDefinition };
      bootstrapData.refresh();
      openWorkflow(response.workflow.id);
      toast({ title: "Workflow created", body: "A reusable workflow is saved. No issue or agent run was created.", tone: "success" });
    } catch (error) { toast({ title: "Workflow creation failed", body: asMessage(error), tone: "error" }); }
    finally { setBusy(false); }
  }, [createWorkflowAction, companyId, bootstrapData.refresh, openWorkflow, toast]);

  if (bootstrapData.loading) return <LoadingState />;
  if (bootstrapData.error) return <ErrorState message={bootstrapData.error.message} retry={bootstrapData.refresh} />;
  if (!bootstrapData.data) return <ErrorState message="Paperclip returned no workflow data." retry={bootstrapData.refresh} />;

  const bootstrap = bootstrapData.data;
  const lifecycleTemplate = bootstrap.workflows.find((item) => item.name === "AI Software Development Lifecycle") ?? null;
  const openLifecycleTemplate = async () => {
    if (!lifecycleTemplate) return create();
    openWorkflow(lifecycleTemplate.id);
  };

  const duplicateFromList = async (id: string) => {
    setBusy(true);
    try {
      const response = await duplicateAction({ workflowId: id }) as { workflow: WorkflowDefinition };
      bootstrapData.refresh();
      openWorkflow(response.workflow.id);
      toast({ title: "Workflow duplicated", body: "The copy is saved and has no Paperclip issue links.", tone: "success" });
    } catch (error) { toast({ title: "Duplicate failed", body: asMessage(error), tone: "error" }); }
    finally { setBusy(false); }
  };
  const renameFromList = async (item: WorkflowIndexEntry, name: string) => {
    setBusy(true);
    try {
      await renameAction({ workflowId: item.id, name, expectedVersion: item.version });
      bootstrapData.refresh();
      toast({ title: "Workflow renamed", body: "The graph and project bindings were preserved.", tone: "success" });
    } catch (error) { toast({ title: "Rename failed", body: asMessage(error), tone: "error" }); }
    finally { setBusy(false); }
  };
  const deleteFromList = async (item: WorkflowIndexEntry) => {
    setBusy(true);
    try {
      await deleteAction({ workflowId: item.id });
      bootstrapData.refresh();
      toast({ title: "Workflow deleted", body: "Issues, agents, projects, and dependencies were preserved.", tone: "success" });
    } catch (error) { toast({ title: "Delete stopped", body: asMessage(error), tone: "error", ttlMs: 9000 }); }
    finally { setBusy(false); }
  };

  if (!workflowId && mode !== "templates") return <div className="wfs-root wfs-list-root"><style>{reactFlowStyles + studioStyles}</style><WorkflowListPage workflows={bootstrap.workflows} busy={busy} createWorkflow={() => void createBlank()} openWorkflow={openWorkflow} duplicateWorkflow={(id) => void duplicateFromList(id)} renameWorkflow={(item, name) => void renameFromList(item, name)} deleteWorkflow={(item) => void deleteFromList(item)} openTemplates={openTemplates} /></div>;
  return <div className="wfs-root"><style>{reactFlowStyles + studioStyles}</style>
    {mode === "templates" ? <><div className="wfs-toolbar"><button className="wfs-button wfs-icon-button" onClick={openList} title="Back to workflows"><ArrowLeft size={14} /></button><div className="wfs-brand"><span className="wfs-brand-icon"><Layers3 size={16} /></span><div className="wfs-title-wrap"><div className="wfs-title">Workflow templates</div><div className="wfs-subtitle">Reusable starting points</div></div></div><div className="wfs-toolbar-spacer" /><button className="wfs-button" disabled={busy} onClick={() => void createBlank()}><Plus size={14} /> Create blank workflow</button></div><TemplatesPage exists={Boolean(lifecycleTemplate)} open={openLifecycleTemplate} /></> : workflowId ? <WorkflowLoader key={`${workflowId}-${mode}`} companyId={companyId} workflowId={workflowId} bootstrap={bootstrap} mode={mode} openList={openList} openTemplates={openTemplates} openMode={(view) => openWorkflow(workflowId, view)} openWorkflow={openWorkflow} saveAction={saveAction} validateAction={validateAction} duplicateAction={duplicateAction} deleteAction={deleteAction} publishAction={publishAction} refreshBootstrap={bootstrapData.refresh} /> : null}
  </div>;
}

function WorkflowLoader({
  companyId,
  workflowId,
  bootstrap,
  mode,
  openList,
  openTemplates,
  openMode,
  openWorkflow,
  saveAction,
  validateAction,
  duplicateAction,
  deleteAction,
  publishAction,
  refreshBootstrap,
}: {
  companyId: string;
  workflowId: string;
  bootstrap: BootstrapData;
  mode: StudioMode;
  openList: () => void;
  openTemplates: () => void;
  openMode: (mode: "designer" | "monitor") => void;
  openWorkflow: (id: string, mode?: "designer" | "monitor") => void;
  saveAction: (params?: Record<string, unknown>) => Promise<unknown>;
  validateAction: (params?: Record<string, unknown>) => Promise<unknown>;
  duplicateAction: (params?: Record<string, unknown>) => Promise<unknown>;
  deleteAction: (params?: Record<string, unknown>) => Promise<unknown>;
  publishAction: (params?: Record<string, unknown>) => Promise<unknown>;
  refreshBootstrap: () => void;
}) {
  const params = useMemo(() => ({ companyId, workflowId }), [companyId, workflowId]);
  const workflowData = usePluginData<WorkflowData>("workflow", params);
  if (workflowData.loading) return <LoadingState />;
  if (workflowData.error) return <ErrorState message={workflowData.error.message} retry={workflowData.refresh} />;
  if (!workflowData.data) return <ErrorState message="Workflow data is unavailable." retry={workflowData.refresh} />;
  if (mode === "monitor") return <><div className="wfs-toolbar wfs-detail-toolbar"><button className="wfs-button wfs-icon-button" onClick={openList} title="Back to workflows"><ArrowLeft size={14} /></button><div className="wfs-brand"><span className="wfs-brand-icon"><Workflow size={16} /></span><div className="wfs-title-wrap"><div className="wfs-title">{workflowData.data.workflow.name}</div><div className="wfs-subtitle">Live Paperclip status</div></div></div><div className="wfs-tabs" role="tablist"><button className="wfs-tab" aria-selected="false" onClick={() => openMode("designer")}>Designer</button><button className="wfs-tab" aria-selected="true">Monitor</button><button className="wfs-tab" aria-selected="false" onClick={openTemplates}>Templates</button></div></div><MonitorCanvas bootstrap={bootstrap} data={workflowData.data} refresh={workflowData.refresh} /></>;
  return <DesignerCanvas bootstrap={bootstrap} initial={workflowData.data.workflow} saveAction={saveAction} validateAction={validateAction} duplicateAction={duplicateAction} deleteAction={deleteAction} publishAction={publishAction} refreshBootstrap={() => { refreshBootstrap(); workflowData.refresh(); }} selectWorkflow={openWorkflow} switchMode={(next) => next === "templates" ? openTemplates() : openMode(next)} />;
}

export function ProjectWorkflowTab({ context }: PluginDetailTabProps) {
  const companyId = context.companyId;
  const projectId = context.entityId;
  const params = useMemo(() => ({ companyId: companyId ?? "", projectId }), [companyId, projectId]);
  const projectData = usePluginData<ProjectWorkflowData>("project-workflow", params);
  const attachAction = usePluginAction("attach-project-workflow");
  const publishAction = usePluginAction("publish-project-workflow");
  const toast = usePluginToast();
  const navigation = useHostNavigation();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const first = projectData.data?.binding?.templateId ?? projectData.data?.workflows[0]?.id ?? "";
    if (!selectedWorkflowId && first) setSelectedWorkflowId(first);
  }, [projectData.data, selectedWorkflowId]);

  if (!companyId) return <ErrorState message="Open this tab inside a Paperclip company." />;
  if (projectData.loading) return <div className="wfs-project-shell"><style>{studioStyles}</style><LoadingState /></div>;
  if (projectData.error) return <div className="wfs-project-shell"><style>{studioStyles}</style><ErrorState message={projectData.error.message} retry={projectData.refresh} /></div>;
  if (!projectData.data) return <div className="wfs-project-shell"><style>{studioStyles}</style><ErrorState message="Project workflow data is unavailable." /></div>;

  const { project, workflows, binding, monitor } = projectData.data;
  const issueNodes = binding?.workflow.nodes.filter((node) => node.data.kind === "task" || node.data.kind === "approval") ?? [];
  const assignedAgents = [...new Map(issueNodes.filter((node) => node.data.agentId).map((node) => [node.data.agentId!, node.data.agentName ?? "Agent"])).values()];
  const completed = monitor.filter((item) => item.issue?.status === "done").length;
  const published = binding?.workflow.status === "published";

  const attach = async () => {
    if (!selectedWorkflowId) return;
    setBusy(true);
    try {
      await attachAction({ companyId, projectId, workflowId: selectedWorkflowId });
      projectData.refresh();
      toast({ title: "Workflow attached", body: "This project now has its own workflow instance. No tasks were created yet.", tone: "success" });
    } catch (error) { toast({ title: "Could not attach workflow", body: asMessage(error), tone: "error", ttlMs: 8000 }); }
    finally { setBusy(false); }
  };

  const publish = async () => {
    if (!binding) return;
    setBusy(true);
    try {
      const response = await publishAction({ companyId, projectId, expectedVersion: binding.workflow.version }) as { workflow: WorkflowDefinition };
      projectData.refresh();
      toast({ title: "Project tasks created", body: `${response.workflow.publishedIssueIds.length} tasks are connected by real Paperclip dependencies. No agent was started.`, tone: "success", ttlMs: 8000 });
    } catch (error) { toast({ title: "Workflow publish stopped", body: asMessage(error), tone: "error", ttlMs: 10000 }); }
    finally { setBusy(false); }
  };

  return <div className="wfs-project-shell"><style>{studioStyles}</style>
    <header className="wfs-project-head"><div><h2>Project workflow</h2><p>Choose a reusable process for {project?.name ?? "this project"}.</p></div><button className="wfs-button" onClick={() => navigation.navigate("/workflows?view=templates")}><Settings2 size={14} /> Edit templates</button></header>
    {workflows.length === 0 ? <div className="wfs-project-empty"><Workflow size={22} /><div><strong>No workflow templates</strong><p>Create a template once, then reuse it across any project.</p></div><button className="wfs-button wfs-button-primary" onClick={() => navigation.navigate("/workflows?view=templates")}><Plus size={14} /> Create template</button></div> : <>
      <section className="wfs-project-picker">
        <label className="wfs-field"><span>Workflow template</span><select value={selectedWorkflowId} disabled={published} onChange={(event) => setSelectedWorkflowId(event.target.value)}>{workflows.map((workflow) => <option key={workflow.id} value={workflow.id}>{workflow.name}</option>)}</select></label>
        <button className="wfs-button wfs-button-primary" disabled={busy || published || !selectedWorkflowId} onClick={() => void attach()}>{binding ? <RefreshCw size={14} /> : <Plus size={14} />}{binding ? "Change workflow" : "Use workflow"}</button>
      </section>
      {binding ? <section className="wfs-project-current">
        <div className="wfs-project-current-head"><div><span className={`wfs-badge ${published ? "wfs-badge-published" : "wfs-badge-draft"}`}>{published ? "Published" : "Saved"}</span><h3>{binding.templateName}</h3><p>Reusable project workflow</p></div>{!published && <button className="wfs-button wfs-button-primary" disabled={busy} onClick={() => void publish()}><Rocket size={14} /> Create {issueNodes.length} project tasks</button>}</div>
        <div className="wfs-project-stats"><div><span>Steps</span><strong>{binding.workflow.nodes.length}</strong></div><div><span>Agents</span><strong>{assignedAgents.length}</strong></div><div><span>Tasks</span><strong>{binding.workflow.publishedIssueIds.length || issueNodes.length}</strong></div><div><span>Completed</span><strong>{completed}/{binding.workflow.publishedIssueIds.length || issueNodes.length}</strong></div></div>
        <div className="wfs-project-agents">{assignedAgents.map((agent) => <span key={agent}><Bot size={12} />{agent}</span>)}</div>
        <div className="wfs-project-flow">{["Plan", "Architecture", "Build", "Review", "Test", "Deploy", "Approve"].map((step, index, steps) => <React.Fragment key={step}><span>{step}</span>{index < steps.length - 1 && <ChevronRight size={12} />}</React.Fragment>)}</div>
        {published && <div className="wfs-project-note"><CheckCircle2 size={15} /><span>Dependencies are active. Start the first Project Manager task when you are ready.</span></div>}
      </section> : <div className="wfs-project-empty"><Workflow size={22} /><div><strong>No workflow selected</strong><p>Select a template above. Paperclip will create a separate project copy, so the shared template remains reusable.</p></div></div>}
    </>}
  </div>;
}

export function WorkflowStudioPage({ context }: PluginPageProps) {
  if (!context.companyId) return <><style>{studioStyles}</style><div className="wfs-root"><ErrorState message="Open Workflow Studio inside a Paperclip company." /></div></>;
  return <ReactFlowProvider><WorkflowWorkspace companyId={context.companyId} projectId={context.projectId} /></ReactFlowProvider>;
}

export function WorkflowStudioSidebar({ context }: PluginSidebarProps) {
  const navigation = useHostNavigation();
  const href = navigation.resolveHref("/workflows");
  return <a {...navigation.linkProps("/workflows")} href={href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", margin: "2px 8px", borderRadius: 8, color: "inherit", textDecoration: "none", fontSize: 14, fontWeight: 560 }} aria-label={`Open workflows for ${context.companyPrefix ?? "company"}`}><Workflow size={17} /> Workflows</a>;
}

export default WorkflowStudioPage;
