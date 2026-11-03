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
  AlertTriangle,
  ArrowLeft,
  ArrowUpDown,
  Bot,
  Box,
  Braces,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock,
  Clock3,
  Compass,
  Copy,
  Download,
  Diamond,
  Eye,
  ExternalLink,
  FileCode,
  FileText,
  FolderGit2,
  GitBranch,
  GitFork,
  History,
  Layers3,
  LayoutDashboard,
  LayoutGrid,
  List,
  ListTree,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Pause,
  Play,
  Plus,
  Redo2,
  RefreshCw,
  Rocket,
  RotateCcw,
  Save,
  Search,
  Settings2,
  ShieldAlert,
  Split,
  Square,
  Terminal,
  Trash2,
  Undo2,
  UserCheck,
  Workflow,
  Wrench,
  X,
  ZoomIn,
  ZoomOut
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
  PaperclipProject,
  PaperclipIssue,
  ProjectWorkflowData,
  ValidationIssue,
  ValidationResult,
  WorkflowData,
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowIndexEntry,
  WorkflowNode,
  WorkflowNodeData,
  WorkflowNodeKind,
  WorkflowRunRecord,
  WorkflowRunSummary,
  WorkflowRunStatus,
  WorkflowRunHistoryEntry,
  WorkflowRunArtifact,
  PreflightCheckResult,
  NodeExecutionState,
  WorkflowRunSettings,
  ProjectPortfolioActiveRun,
  ProjectPortfolioData,
  ProjectPortfolioItem
} from "../types.js";
import { studioStyles } from "./styles.js";
import { TerminalViewer } from "./terminal-viewer.js";
import { ProjectTaskListView } from "./task-tree.js";
import { RunHistoryView } from "./run-history-view.js";
export { CompanyIntelligenceDashboard } from "./company-intelligence.js";

type StudioMode = "designer" | "monitor" | "history" | "templates" | "control-center" | "portfolio";
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
  const status = (data.status as string) || "pending";

  const isRunning = ["running", "in_progress"].includes(status);
  const isFailed = ["error", "failed"].includes(status);
  const isApproval = status === "waiting_approval";
  const isCompleted = ["done", "completed"].includes(status);
  const isBlocked = status === "blocked";
  const isReady = status === "ready";
  const isQueued = status === "queued";
  const isCancelled = ["cancelled", "skipped"].includes(status);

  const stateClass = isRunning
    ? "wfs-node-running running"
    : isFailed
    ? "wfs-node-failed error"
    : isApproval
    ? "wfs-node-waiting_approval waiting_approval"
    : isCompleted
    ? "wfs-node-completed completed"
    : isBlocked
    ? "wfs-node-blocked blocked"
    : isReady
    ? "wfs-node-ready"
    : isQueued
    ? "wfs-node-queued"
    : isCancelled
    ? "wfs-node-cancelled"
    : "wfs-node-pending";

  const multiIssueCount = Array.isArray(data.issueIds) ? data.issueIds.length : 0;
  const runtimeDuration = typeof data.runtimeDuration === "string" ? data.runtimeDuration : null;

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
        {isTask && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, marginTop: 3 }}>
            <span className="wfs-node-id">{data.issueIdentifier ?? "Not published"}</span>
            {multiIssueCount > 1 && (
              <span className="wfs-node-multi-badge">📦 {multiIssueCount} tasks</span>
            )}
          </div>
        )}
        <div className="wfs-node-foot">
          <span className={`wfs-status wfs-status-${status}`}>
            <span className="wfs-status-dot" />{statusLabel(status)}
          </span>
          {isRunning && runtimeDuration ? (
            <span className="wfs-node-timer">⏱️ {runtimeDuration}</span>
          ) : (
            <span className="wfs-node-model">{data.model ?? data.priority}</span>
          )}
        </div>
      </div>
      {data.kind !== "end" && <Handle className="wfs-handle source" type="source" position={Position.Right} />}
    </div>
  );
}

const nodeTypes = { workflowNode: WorkflowCardNode };

function workflowToNodes(
  workflow: WorkflowDefinition,
  agents: PaperclipAgent[],
  monitor: MonitorNode[] = [],
  runNodeStates?: Record<string, NodeExecutionState>
): FlowNode[] {
  const byAgent = new Map(agents.map((agent) => [agent.id, agent]));
  const byNode = new Map(monitor.map((item) => [item.nodeId, item]));
  return workflow.nodes.map((node) => {
    const agent = node.data.agentId ? byAgent.get(node.data.agentId) : null;
    const live = byNode.get(node.id);
    const runState = runNodeStates ? runNodeStates[node.id] : null;
    // Paperclip's issue execution can fail after the workflow snapshot was
    // marked running. The recorded issue blocker is the fresher evidence.
    const status = live?.issue?.status === "blocked" && runState?.status === "running"
      ? "blocked"
      : runState?.status ?? live?.issue?.status ?? node.data.status;
    const issueIdentifier = runState?.issueIdentifier ?? live?.issue?.identifier ?? node.data.issueIdentifier;

    let runtimeDuration: string | null = null;
    if (runState?.startedAt) {
      const start = new Date(runState.startedAt).getTime();
      const end = runState.finishedAt ? new Date(runState.finishedAt).getTime() : Date.now();
      const diff = Math.max(0, Math.floor((end - start) / 1000));
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      runtimeDuration = `${m}m ${s}s`;
    }

    return {
      ...node,
      data: {
        ...node.data,
        status,
        issueIdentifier,
        issueIds: runState?.issueIds ?? (node.data.issueIds as string[] | undefined) ?? (node.data.issueId ? [node.data.issueId] : []),
        agentName: runState?.agentName ?? agent?.name ?? node.data.agentName,
        agentRole: runState?.agentRole ?? agent?.title ?? agent?.role ?? node.data.agentRole,
        model: typeof agent?.adapterConfig?.model === "string" ? agent.adapterConfig.model : node.data.model,
        avatarUrl: agent?.avatarUrl ?? agent?.icon ?? null,
        startedAt: runState?.startedAt ?? null,
        finishedAt: runState?.finishedAt ?? null,
        error: runState?.error ?? null,
        blockedByNodeIds: runState?.blockedByNodeIds ?? [],
        lastGateCode: runState?.lastGateCode ?? null,
        lastGateReason: runState?.lastGateReason ?? null,
        runtimeDuration
      }
    };
  });
}

function workflowToEdges(
  edges: WorkflowEdge[],
  nodeStates?: Record<string, NodeExecutionState | undefined>
): FlowEdge[] {
  return edges.map((edge) => {
    const sourceStatus = nodeStates?.[edge.source]?.status;
    const targetStatus = nodeStates?.[edge.target]?.status;

    let edgeClass = "";
    let isAnimated = false;
    let arrowColor: string | undefined = undefined;

    // Active handoff: source completed and target is running, ready, or queued
    if (
      sourceStatus === "done" &&
      (targetStatus === "running" || targetStatus === "ready" || targetStatus === "queued")
    ) {
      edgeClass = "active-handoff";
      isAnimated = true;
      arrowColor = "#3b82f6";
    } else if (sourceStatus === "done" && targetStatus === "done") {
      edgeClass = "completed-edge";
      arrowColor = "#10b981";
    } else if (targetStatus === "blocked") {
      edgeClass = "blocked-edge";
      arrowColor = "#f59e0b";
    } else if (sourceStatus === "failed") {
      edgeClass = "failed-edge";
      arrowColor = "#ef4444";
    }

    return {
      ...edge,
      type: "smoothstep",
      animated: isAnimated,
      className: edgeClass,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: arrowColor
      }
    };
  });
}

function areNodesEquivalent(prev: FlowNode[] | null | undefined, next: FlowNode[]): boolean {
  if (!prev || prev.length !== next.length) return false;
  for (let i = 0; i < prev.length; i++) {
    const a = prev[i];
    const b = next[i];
    if (a.id !== b.id) return false;
    if (a.position.x !== b.position.x || a.position.y !== b.position.y) return false;
    if (a.data.status !== b.data.status) return false;
    if (a.data.issueIdentifier !== b.data.issueIdentifier) return false;
    if (a.data.model !== b.data.model) return false;
    if (a.data.agentId !== b.data.agentId) return false;
    if (a.data.agentName !== b.data.agentName) return false;
    if (a.data.title !== b.data.title) return false;
    if (a.data.lastGateCode !== b.data.lastGateCode) return false;
    if (a.data.runtimeDuration !== b.data.runtimeDuration) return false;
  }
  return true;
}

function areEdgesEquivalent(prev: FlowEdge[] | null | undefined, next: FlowEdge[]): boolean {
  if (!prev || prev.length !== next.length) return false;
  for (let i = 0; i < prev.length; i++) {
    const a = prev[i];
    const b = next[i];
    if (a.id !== b.id || a.source !== b.source || a.target !== b.target) return false;
    if (a.animated !== b.animated || a.className !== b.className) return false;
    const aColor = a.markerEnd && typeof a.markerEnd === "object" && "color" in a.markerEnd ? a.markerEnd.color : undefined;
    const bColor = b.markerEnd && typeof b.markerEnd === "object" && "color" in b.markerEnd ? b.markerEnd.color : undefined;
    if (aColor !== bColor) return false;
  }
  return true;
}

const ElapsedTimer = React.memo(function ElapsedTimer({ startedAt, finishedAt }: { startedAt?: string | null; finishedAt?: string | null }) {
  const [elapsed, setElapsed] = useState("00:00");
  useEffect(() => {
    if (!startedAt) {
      setElapsed("00:00");
      return;
    }
    const calc = () => {
      const start = new Date(startedAt).getTime();
      const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
      const diff = Math.max(0, Math.floor((end - start) / 1000));
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setElapsed(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    calc();
    if (!finishedAt) {
      const timer = window.setInterval(calc, 1000);
      return () => window.clearInterval(timer);
    }
  }, [startedAt, finishedAt]);

  return <strong style={{ fontFamily: "monospace" }}>{elapsed}</strong>;
});

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
  switchMode,
  onOpenRunModal
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
  onOpenRunModal?: (workflowId?: string) => void;
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

  const fitAll = useCallback(() => flow.fitView({ padding: 0.16, minZoom: 0.45, maxZoom: 1.05, duration: 280 }), [flow]);
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
    const copies = source.map((node) => ({ ...structuredClone(node), id: idMap.get(node.id)!, selected: true, position: { x: node.position.x + 32, y: node.position.y + 32 }, data: { ...structuredClone(node.data), issueId: null, issueIdentifier: null, issueIds: [], status: "draft" } }));
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
    const pasted = copied.nodes.map((node) => ({ ...structuredClone(node), id: idMap.get(node.id)!, selected: true, position: { x: node.position.x + 48, y: node.position.y + 48 }, data: { ...structuredClone(node.data), issueId: null, issueIdentifier: null, issueIds: [], status: "draft" } }));
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
        <button
          className="wfs-button wfs-back-btn"
          onClick={() => requestNavigation(() => navigation.navigate("/workflows"), "Workflows")}
          title="Back to workflows"
        >
          <ArrowLeft size={14} />
          <span>Workflows</span>
        </button>
        <div className="wfs-divider" />
        <div className="wfs-brand-icon" style={{ width: 30, height: 30, flex: "none" }}>
          <Workflow size={15} />
        </div>
        <input
          className="wfs-name-input"
          value={workflow.name}
          onChange={(event) => updateWorkflow({ name: event.target.value })}
          aria-label="Workflow name"
          placeholder="Workflow name"
        />
        <span className="wfs-badge-version">v{workflow.version}</span>
        <span className={`wfs-badge ${workflow.status === "published" ? "wfs-badge-published" : "wfs-badge-draft"}`}>
          {workflow.status === "published" ? "Published" : "Draft"}
        </span>
        {dirty && <span className="wfs-badge-dirty">Unsaved</span>}
      </div>

      <div className="wfs-toolbar-spacer" />

      <div className="wfs-toolbar-actions">
        <button className="wfs-button wfs-icon-button" onClick={undo} disabled={history.current.length === 0} title="Undo">
          <Undo2 size={14} />
        </button>
        <button className="wfs-button wfs-icon-button" onClick={redo} disabled={future.current.length === 0} title="Redo">
          <Redo2 size={14} />
        </button>
        <button className="wfs-button" onClick={() => autoLayout()} title="Arrange nodes automatically">
          <LayoutDashboard size={14} />
          <span>Auto layout</span>
        </button>
        <button className="wfs-button wfs-icon-button" onClick={fitAll} title="Fit View">
          <Maximize2 size={14} />
        </button>
        <button className="wfs-button" onClick={() => void validate()} disabled={busy} title="Validate workflow graph">
          <Check size={14} />
          <span>Validate</span>
        </button>
        <button className="wfs-button" onClick={() => void save()} disabled={busy || !dirty} title="Save workflow changes">
          <Save size={14} />
          <span>Save</span>
        </button>
        <button
          className="wfs-button wfs-button-primary"
          onClick={() => void preparePublish()}
          disabled={busy}
          title="Publish workflow"
        >
          <Rocket size={14} />
          <span>Publish</span>
        </button>
        <div className="wfs-menu-anchor">
          <button className="wfs-button wfs-icon-button" onClick={() => setMoreOpen((value) => !value)} title="More actions">
            <MoreHorizontal size={15} />
          </button>
          {moreOpen && (
            <div className="wfs-popover wfs-toolbar-popover">
              <button onClick={() => { requestNavigation(() => void duplicateWorkflow(workflow.id), "the duplicated workflow"); setMoreOpen(false); }}>
                <Copy size={14} /> Duplicate workflow
              </button>
              <button onClick={() => { exportJson(); setMoreOpen(false); }}>
                <Download size={14} /> Export JSON
              </button>
              <div className="wfs-menu-separator" />
              <button onClick={() => { autoLayout("LR", false); setMoreOpen(false); }}>Horizontal layout</button>
              <button onClick={() => { autoLayout("TB", false); setMoreOpen(false); }}>Vertical layout</button>
              <button onClick={() => { autoLayout(workflow.layout.direction, true); setMoreOpen(false); }}>Compact layout</button>
              <div className="wfs-menu-separator" />
              <button className="danger" onClick={() => { setDeleteWorkflowId(workflow.id); setMoreOpen(false); }}>
                <Trash2 size={14} /> Delete workflow
              </button>
            </div>
          )}
        </div>
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

function LiveNodeInspector({
  node,
  bootstrap,
  monitor,
  run,
  close,
  openIssue,
  startResize
}: {
  node: FlowNode | null;
  bootstrap: BootstrapData;
  monitor?: MonitorNode;
  run?: WorkflowRunRecord | null;
  close: () => void;
  openIssue: (issueId: string) => void;
  startResize?: (event: React.PointerEvent) => void;
}) {
  const [tab, setTab] = useState<"overview" | "logs" | "timeline" | "artifacts" | "issues">("overview");

  if (!node) {
    return (
      <aside className="wfs-inspector">
        <div className="wfs-inspector-empty">
          <div>
            <Compass size={24} style={{ marginBottom: 8, color: "var(--muted-foreground)" }} /><br />
            Select a workflow node to inspect real-time agent activity, terminal logs, and outputs.
          </div>
        </div>
      </aside>
    );
  }

  const data = node.data;
  const status = (data.status as string) || "pending";
  const issueIds = Array.isArray(data.issueIds) && data.issueIds.length > 0
    ? data.issueIds
    : data.issueId ? [data.issueId] : [];
  
  const mappedIssues = (monitor?.issues?.length
    ? monitor.issues
    : bootstrap.issues.filter((i) => issueIds.includes(i.id))) as PaperclipIssue[];

  // Filter logs for this node or its mapped issues
  const allLogs = run?.executionHistory ?? [];
  const nodeLogs = allLogs.filter((l) =>
    l.nodeId === node.id || (l.issueId && issueIds.includes(l.issueId))
  );
  // If no node-specific logs yet, allow viewing all run logs
  const displayLogs = nodeLogs.length > 0 ? nodeLogs : allLogs;

  const nodeArtifacts = (run?.artifacts ?? []).filter(
    (a) => a.nodeId === node.id || (a.issueId && issueIds.includes(a.issueId))
  );

  return (
    <aside className="wfs-inspector" style={{ width: 380, display: "flex", flexDirection: "column" }}>
      {startResize && <div className="wfs-resize-handle right" onPointerDown={startResize} title="Resize inspector" />}
      
      <div className="wfs-inspector-head">
        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
          <strong style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {data.title}
          </strong>
          <span className={`wfs-badge wfs-badge-${status === "running" ? "published" : status === "failed" ? "draft" : ""}`} style={{ fontSize: 9 }}>
            {statusLabel(status)}
          </span>
        </div>
        <button className="wfs-button wfs-icon-button" onClick={close} aria-label="Close inspector">
          <X size={14} />
        </button>
      </div>

      {/* 5-Tab Bar */}
      <div className="wfs-tabs" style={{ margin: "8px 10px 0", flexWrap: "wrap", height: "auto", padding: 2 }}>
        <button className="wfs-tab" aria-selected={tab === "overview"} onClick={() => setTab("overview")}>
          <LayoutDashboard size={11} style={{ marginRight: 4 }} /> Overview
        </button>
        <button className="wfs-tab" aria-selected={tab === "logs"} onClick={() => setTab("logs")}>
          <Terminal size={11} style={{ marginRight: 4 }} /> Live Logs ({nodeLogs.length})
        </button>
        <button className="wfs-tab" aria-selected={tab === "timeline"} onClick={() => setTab("timeline")}>
          <Clock3 size={11} style={{ marginRight: 4 }} /> Timeline
        </button>
        <button className="wfs-tab" aria-selected={tab === "artifacts"} onClick={() => setTab("artifacts")}>
          <Box size={11} style={{ marginRight: 4 }} /> Artifacts ({nodeArtifacts.length})
        </button>
        {mappedIssues.length > 0 && (
          <button className="wfs-tab" aria-selected={tab === "issues"} onClick={() => setTab("issues")}>
            <Layers3 size={11} style={{ marginRight: 4 }} /> Tasks ({mappedIssues.length})
          </button>
        )}
      </div>

      <div className="wfs-inspector-content" style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        {tab === "overview" && (
          <div style={{ display: "grid", gap: 12 }}>
            {/* Agent Profile Card */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 8, background: "var(--wfs-panel)", border: "1px solid var(--border)" }}>
              <div className="wfs-agent-avatar" style={{ width: 34, height: 34, fontSize: 11 }}>
                {data.agentName ? initials(data.agentName) : "AI"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: 12, display: "block" }}>{data.agentName ?? (data.kind === "approval" ? "Human Product Owner" : "Automated System")}</strong>
                <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{data.agentRole ?? "Worker"} • {data.model ?? "Standard Runtime"}</span>
              </div>
            </div>

            <div className="wfs-meta-grid">
              <div className="wfs-meta"><span>Step Type</span><strong>{data.kind}</strong></div>
              <div className="wfs-meta"><span>Status</span><strong>{statusLabel(status)}</strong></div>
              <div className="wfs-meta"><span>Duration</span><strong>{data.runtimeDuration ?? "Pending"}</strong></div>
              <div className="wfs-meta"><span>Priority</span><strong>{data.priority || "Normal"}</strong></div>
            </div>

            {/* Mapped Paperclip Issue */}
            {data.issueId && (
              <div style={{ padding: 10, borderRadius: 8, background: "var(--wfs-panel)", border: "1px solid var(--border)", display: "grid", gap: 6 }}>
                <span style={{ fontSize: 10, textTransform: "uppercase", color: "var(--muted-foreground)", fontWeight: 700 }}>
                  Primary Paperclip Issue
                </span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontFamily: "monospace" }}>{data.issueIdentifier ?? data.issueId}</span>
                  <button className="wfs-button" style={{ height: 24, fontSize: 10 }} onClick={() => openIssue(data.issueId!)}>
                    <ExternalLink size={11} /> Open Issue
                  </button>
                </div>
              </div>
            )}

            {/* Execution Gate Details */}
            {data.lastGateCode && (
              <div style={{ padding: 10, borderRadius: 8, background: data.lastGateCode.includes("DENY") || data.lastGateCode.includes("BLOCKED") ? "color-mix(in srgb, #f59e0b 12%, var(--background))" : "color-mix(in srgb, #10b981 10%, var(--background))", border: "1px solid var(--border)", fontSize: 11 }}>
                <strong>Execution Gate: [{data.lastGateCode}]</strong>
                <p style={{ margin: "3px 0 0", fontSize: 10, color: "var(--muted-foreground)" }}>{data.lastGateReason}</p>
              </div>
            )}

            {/* Predecessors / Blocked by */}
            {monitor?.blockedBy && monitor.blockedBy.length > 0 && (
              <div style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase" }}>
                  Waiting On Predecessors ({monitor.blockedBy.length})
                </span>
                {monitor.blockedBy.map((blocker) => (
                  <div key={blocker.id} style={{ padding: "6px 8px", background: "var(--wfs-panel)", borderRadius: 6, border: "1px solid var(--border)", fontSize: 10.5 }}>
                    <strong>{blocker.identifier ?? blocker.id}</strong>: {blocker.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "logs" && (
          <div style={{ height: "calc(100% - 10px)", minHeight: 420 }}>
            <TerminalViewer
              logs={displayLogs}
              isRunning={status === "running"}
              title={nodeLogs.length > 0 ? `Step Logs: ${data.title}` : "Run Logs (Node Filter Empty)"}
              agentName={data.agentName}
            />
          </div>
        )}

        {tab === "timeline" && (
          <div className="wfs-timeline">
            {nodeLogs.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--muted-foreground)", fontSize: 11 }}>
                No timeline events recorded for this step yet.
              </div>
            ) : (
              nodeLogs.map((entry) => (
                <div key={entry.id} className="wfs-timeline-item">
                  <div className={`wfs-timeline-dot ${entry.level === "error" ? "error" : entry.level === "approval" ? "approval" : entry.level === "action" ? "done" : ""}`}>
                    {entry.level === "error" ? "!" : entry.level === "approval" ? "PO" : "✓"}
                  </div>
                  <div className="wfs-timeline-card">
                    <div className="wfs-timeline-head">
                      <span className={`wfs-badge wfs-badge-${entry.level}`} style={{ fontSize: 9 }}>
                        {entry.level.toUpperCase()}
                      </span>
                      <time className="wfs-timeline-time">{new Date(entry.timestamp).toLocaleTimeString()}</time>
                    </div>
                    <div style={{ marginTop: 3, fontSize: 11, lineHeight: 1.4 }}>{entry.message}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "artifacts" && (
          <div className="wfs-artifacts-list">
            {nodeArtifacts.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--muted-foreground)", fontSize: 11 }}>
                No code or file artifacts linked to this step yet.
              </div>
            ) : (
              nodeArtifacts.map((art) => (
                <div key={art.id} className="wfs-artifact-card">
                  <div className="wfs-artifact-icon">
                    <FileCode size={16} />
                  </div>
                  <div className="wfs-artifact-info">
                    <strong>{art.name}</strong>
                    <small>{art.description || art.type}</small>
                  </div>
                  {art.url && (
                    <a className="wfs-button" style={{ height: 24, fontSize: 10 }} href={art.url} target="_blank" rel="noreferrer">
                      <ExternalLink size={11} /> Open
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === "issues" && (
          <div style={{ display: "grid", gap: 6 }}>
            {mappedIssues.map((subtask) => (
              <div key={subtask.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "var(--wfs-panel)", borderRadius: 7, border: "1px solid var(--border)" }}>
                <div>
                  <strong style={{ fontSize: 11.5, display: "block" }}>{subtask.identifier ? `[${subtask.identifier}] ` : ""}{subtask.title}</strong>
                  <span style={{ fontSize: 9.5, color: "var(--muted-foreground)" }}>Status: {subtask.status}</span>
                </div>
                <button className="wfs-button" style={{ height: 24, fontSize: 10 }} onClick={() => openIssue(subtask.id)}>
                  <ExternalLink size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function MonitorCanvas({
  bootstrap,
  data,
  refresh,
  companyId,
  runId,
  onSelectRun
}: {
  bootstrap: BootstrapData;
  data: WorkflowData;
  refresh: () => void;
  companyId?: string;
  runId?: string | null;
  onSelectRun?: (runId: string) => void;
}) {
  const navigation = useHostNavigation();
  const toast = usePluginToast();
  const flow = useReactFlow();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [logsOpen, setLogsOpen] = useState(false);
  const [busyAction, setBusyAction] = useState(false);
  const [autoFollow, setAutoFollow] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  // Replay mode state
  const [replayMode, setReplayMode] = useState(false);
  const [replayStep, setReplayStep] = useState(0);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState<1 | 2 | 5>(1);

  const runParams = useMemo(() => (runId && companyId ? { companyId, runId } : undefined), [companyId, runId]);
  const runData = usePluginData<{ run: WorkflowRunRecord; monitor: MonitorNode[] }>("workflow-run", runParams);

  const stepAction = usePluginAction("step-workflow-run");
  const pauseAction = usePluginAction("pause-workflow-run");
  const resumeAction = usePluginAction("resume-workflow-run");
  const stopAction = usePluginAction("stop-workflow-run");
  const retryAction = usePluginAction("retry-failed-step");
  const approvalAction = usePluginAction("decide-run-approval");

  const run = runData.data?.run ?? null;
  const currentWorkflow = run ? run.workflowSnapshot : data.workflow;
  const currentMonitor = runData.data?.monitor ?? data.monitor;

  // Replay calculation: if replayMode is active, compute historical node execution states up to replayStep
  const effectiveNodeStates = useMemo(() => {
    if (!run) return undefined;
    if (!replayMode) return run.nodeExecutionStates;

    const historical: Record<string, NodeExecutionState> = {};
    for (const [nid, st] of Object.entries(run.nodeExecutionStates)) {
      historical[nid] = { ...st, status: "pending" };
    }
    const upTo = Math.min(replayStep, run.executionHistory.length - 1);
    for (let i = 0; i <= upTo; i++) {
      const entry = run.executionHistory[i];
      if (entry.nodeId && historical[entry.nodeId]) {
        if (entry.level === "info" && entry.message.includes("is now READY")) {
          historical[entry.nodeId].status = "ready";
        } else if (entry.level === "action" && entry.message.includes("Dispatching step")) {
          historical[entry.nodeId].status = "running";
        } else if (entry.level === "approval") {
          historical[entry.nodeId].status = "waiting_approval";
        } else if (entry.level === "info" && entry.message.includes("Step completed")) {
          historical[entry.nodeId].status = "done";
        } else if (entry.level === "error") {
          historical[entry.nodeId].status = "failed";
        }
      }
    }
    return historical;
  }, [run, replayMode, replayStep]);

  // Stable nodes & edges caching to prevent React Flow from re-mounting and flickering canvas
  const prevNodesRef = useRef<FlowNode[]>([]);
  const prevEdgesRef = useRef<FlowEdge[]>([]);

  const rawNodes = useMemo(
    () => workflowToNodes(currentWorkflow, bootstrap.agents, currentMonitor, effectiveNodeStates),
    [currentWorkflow, bootstrap.agents, currentMonitor, effectiveNodeStates]
  );
  const nodes = useMemo(() => {
    if (areNodesEquivalent(prevNodesRef.current, rawNodes)) {
      return prevNodesRef.current;
    }
    prevNodesRef.current = rawNodes;
    return rawNodes;
  }, [rawNodes]);

  const rawEdges = useMemo(
    () => workflowToEdges(currentWorkflow.edges, effectiveNodeStates),
    [currentWorkflow.edges, effectiveNodeStates]
  );
  const edges = useMemo(() => {
    if (areEdgesEquivalent(prevEdgesRef.current, rawEdges)) {
      return prevEdgesRef.current;
    }
    prevEdgesRef.current = rawEdges;
    return rawEdges;
  }, [rawEdges]);
  const monitorByNode = useMemo(() => new Map(currentMonitor.map((item) => [item.nodeId, item])), [currentMonitor]);

  // Autonomous background runner: step workflow while running
  useEffect(() => {
    if (!run || !runId || !companyId) return;
    if (run.status !== "running" && run.status !== "pending") return;

    const nodeStatesList = Object.values(run.nodeExecutionStates ?? {});
    const runningAgents = nodeStatesList.filter((s) => s.status === "running").length;
    const failedSteps = nodeStatesList.filter((s) => s.status === "failed" || s.status === "cancelled").length;
    // If run has failed steps and no active agents, back off polling to 15s instead of aggressive 3s
    const pollInterval = (failedSteps > 0 && runningAgents === 0) ? 15000 : 3000;

    const interval = window.setInterval(async () => {
      if (document.visibilityState === "visible") {
        try {
          await stepAction({ companyId, runId });
          runData.refresh();
        } catch {
          // ignore transient poll error
        }
      }
    }, pollInterval);
    return () => window.clearInterval(interval);
  }, [run?.status, run?.nodeExecutionStates, runId, companyId, stepAction, runData.refresh]);

  // Regular monitor refresh if not in run mode
  useEffect(() => {
    if (runId) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 8000);
    return () => window.clearInterval(timer);
  }, [runId, refresh]);

  // Only move the viewport when the followed step changes to a NEW node.
  const lastFollowedIdRef = useRef<string | null>(null);
  const followedNode = nodes.find((node) => ["running", "in_progress"].includes(node.data.status)) ??
    nodes.find((node) => ["blocked", "failed"].includes(node.data.status));
  const followedNodeId = followedNode?.id;
  const followedNodeX = followedNode?.position.x;
  const followedNodeY = followedNode?.position.y;
  useEffect(() => {
    if (!autoFollow || !followedNodeId || followedNodeX === undefined || followedNodeY === undefined) return;
    if (lastFollowedIdRef.current === followedNodeId) return;
    lastFollowedIdRef.current = followedNodeId;
    flow.setCenter(followedNodeX + 100, followedNodeY + 60, {
      duration: 450,
      zoom: Math.max(0.75, flow.getZoom())
    });
  }, [followedNodeId, followedNodeX, followedNodeY, autoFollow, flow]);

  // Replay timer
  useEffect(() => {
    if (!replayPlaying || !run) return;
    const interval = window.setInterval(() => {
      setReplayStep((curr) => {
        if (curr >= run.executionHistory.length - 1) {
          setReplayPlaying(false);
          return curr;
        }
        return curr + 1;
      });
    }, 1000 / replaySpeed);
    return () => window.clearInterval(interval);
  }, [replayPlaying, replaySpeed, run]);

  // Metrics
  const nodeStates = run ? Object.values(run.nodeExecutionStates) : [];
  const visibleStepNodes = nodes.filter((node) => node.data.kind === "task" || node.data.kind === "approval");
  const running = visibleStepNodes.filter((node) => node.data.status === "running" || node.data.status === "in_progress").length;
  const done = visibleStepNodes.filter((node) => node.data.status === "done").length;
  const blocked = visibleStepNodes.filter((node) => node.data.status === "blocked").length;
  const failed = visibleStepNodes.filter((node) => node.data.status === "failed" || node.data.status === "cancelled").length;
  const total = visibleStepNodes.length;
  const progress = total ? Math.round((done / total) * 100) : 0;
  const recordedRunBlocked = run?.status === "running" && blocked > 0 && running === 0;

  // Check waiting approval gate
  const approvalGateNode = run ? nodeStates.find((s) => s.status === "waiting_approval") : null;

  const handlePause = async () => {
    if (!runId || !companyId) return;
    setBusyAction(true);
    try {
      await pauseAction({ companyId, runId });
      runData.refresh();
      toast({ title: "Workflow Paused", body: "Next steps are held. Current executions will complete.", tone: "warn" });
    } catch (e) {
      toast({ title: "Pause failed", body: asMessage(e), tone: "error" });
    } finally {
      setBusyAction(false);
    }
  };

  const handleResume = async () => {
    if (!runId || !companyId) return;
    setBusyAction(true);
    try {
      await resumeAction({ companyId, runId });
      runData.refresh();
      toast({ title: "Workflow Resumed", body: "Execution resumed by Product Owner.", tone: "success" });
    } catch (e) {
      toast({ title: "Resume failed", body: asMessage(e), tone: "error" });
    } finally {
      setBusyAction(false);
    }
  };

  const handleStop = async () => {
    if (!runId || !companyId) return;
    setBusyAction(true);
    try {
      await stopAction({ companyId, runId });
      runData.refresh();
      toast({ title: "Workflow Stopped", body: "Active run cancelled. Other projects and history preserved.", tone: "warn" });
    } catch (e) {
      toast({ title: "Stop failed", body: asMessage(e), tone: "error" });
    } finally {
      setBusyAction(false);
    }
  };

  const handleRetry = async () => {
    if (!runId || !companyId) return;
    const failedNode = nodeStates.find((s) => s.status === "failed");
    if (!failedNode) return;
    setBusyAction(true);
    try {
      await retryAction({ companyId, runId, nodeId: failedNode.nodeId });
      runData.refresh();
      toast({ title: "Retry Initiated", body: `Step "${failedNode.title}" restarted.`, tone: "success" });
    } catch (e) {
      toast({ title: "Retry failed", body: asMessage(e), tone: "error" });
    } finally {
      setBusyAction(false);
    }
  };

  const handleDecision = async (decision: "approve" | "reject") => {
    if (!runId || !companyId || !approvalGateNode) return;
    setBusyAction(true);
    try {
      await approvalAction({ companyId, runId, nodeId: approvalGateNode.nodeId, decision });
      runData.refresh();
      toast({
        title: decision === "approve" ? "Approved by Product Owner" : "Changes Requested",
        body: decision === "approve" ? "Next tasks unlocked and dispatched." : "Workflow paused for adjustments.",
        tone: decision === "approve" ? "success" : "warn"
      });
    } catch (e) {
      toast({ title: "Approval decision failed", body: asMessage(e), tone: "error" });
    } finally {
      setBusyAction(false);
    }
  };

  const copyRunId = () => {
    if (!run?.id) return;
    navigator.clipboard.writeText(run.id);
    toast({ title: "Run ID copied", body: run.id, tone: "success" });
  };

  const selected = nodes.find((node) => node.id === selectedNodeId) ?? null;

  return (
    <div
      className={`wfs-body ${selected ? "" : "inspector-closed"} ${fullscreen ? "wfs-fullscreen" : ""}`}
      style={{ height: "100%", gridTemplateColumns: selected ? "minmax(0,1fr) 380px" : "minmax(0,1fr) 0" }}
    >
      <main className="wfs-canvas">
        {/* Top Live Monitor Header Bar */}
        <div className="wfs-monitor-bar" style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          {/* Run Version Selector */}
          {bootstrap.runs && bootstrap.runs.length > 1 && (
            <div className="wfs-monitor-stat">
              <span>Run Version</span>
              <select
                value={run?.id ?? runId ?? ""}
                onChange={(e) => onSelectRun && onSelectRun(e.target.value)}
                style={{
                  height: 26,
                  fontSize: 11,
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                  color: "var(--foreground)",
                  padding: "0 6px"
                }}
                aria-label="Select Workflow Run"
              >
                {bootstrap.runs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id.slice(0, 14)}... ({statusLabel(r.status)} - {r.progress}%)
                  </option>
                ))}
              </select>
            </div>
          )}

          {run && (
            <div className="wfs-monitor-stat" style={{ cursor: "pointer" }} onClick={copyRunId} title="Click to copy Run ID">
              <span>Run ID</span>
              <strong style={{ fontFamily: "monospace", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                {run.id.slice(0, 8)}... <Copy size={11} color="var(--muted-foreground)" />
              </strong>
            </div>
          )}

          <div className="wfs-monitor-stat">
            <span>Status</span>
            <strong style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, textTransform: "capitalize" }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background:
                    recordedRunBlocked ? "#d97706" : run?.status === "running" ? "#22c55e" : run?.status === "failed" ? "#ef4444" : "#3b82f6"
                }}
              />
              {recordedRunBlocked ? "Blocked · run recorded running" : run ? statusLabel(run.status) : "Live Preview"}
            </strong>
          </div>

          <div className="wfs-monitor-stat">
            <span>Progress</span>
            <strong>{progress}% ({done}/{total})</strong>
          </div>

          <div className="wfs-progress" style={{ width: 120 }}>
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className="wfs-monitor-stat">
            <span>Active Agents</span>
            <strong style={{ color: running > 0 ? "#2563eb" : "inherit" }}>{running}</strong>
          </div>

          {blocked > 0 && (
            <div className="wfs-monitor-stat" style={{ color: "#d97706" }}>
              <span>Blocked</span>
              <strong>{blocked}</strong>
            </div>
          )}

          {failed > 0 && (
            <div className="wfs-monitor-stat" style={{ color: "#dc2626" }}>
              <span>Failed</span>
              <strong>{failed}</strong>
            </div>
          )}

          {run && (
            <div className="wfs-monitor-stat">
              <span>Elapsed</span>
              <ElapsedTimer startedAt={run?.startedAt} finishedAt={run?.finishedAt} />
            </div>
          )}

          {/* PO Action Controls */}
          <div className="wfs-run-controls" style={{ marginLeft: "auto", display: "flex", gap: 5, flexWrap: "wrap" }}>
            {run && run.status === "running" && (
              <button className="wfs-button" disabled={busyAction} onClick={handlePause} title="Pause Workflow Execution">
                <Pause size={13} /> Pause
              </button>
            )}
            {run && run.status === "paused" && (
              <button className="wfs-button wfs-button-primary" disabled={busyAction} onClick={handleResume} title="Resume Workflow Execution">
                <Play size={13} /> Resume
              </button>
            )}
            {run && !["completed", "cancelled"].includes(run.status) && (
              <button className="wfs-button wfs-button-danger" disabled={busyAction} onClick={handleStop} title="Stop and Cancel Workflow">
                <Square size={13} /> Stop
              </button>
            )}
            {failed > 0 && (
              <button className="wfs-button" disabled={busyAction} onClick={handleRetry} title="Retry Failed Step">
                <RotateCcw size={13} /> Retry
              </button>
            )}

            {currentWorkflow?.id && (
              <button
                className="wfs-button"
                onClick={() => navigation.navigate(`/workflows?workflow=${encodeURIComponent(currentWorkflow.id)}&view=designer`)}
                title="Edit original workflow template in Designer"
              >
                <Settings2 size={13} /> Edit Template
              </button>
            )}

            {/* Replay Mode Toggle */}
            {run && (
              <button
                className={`wfs-button ${replayMode ? "wfs-button-primary" : ""}`}
                onClick={() => {
                  setReplayMode((v) => !v);
                  if (!replayMode) setReplayStep(run.executionHistory.length - 1);
                }}
                title="Toggle Historical Replay Mode"
              >
                <History size={13} /> {replayMode ? "Exit Replay" : "Replay"}
              </button>
            )}

            {/* Auto Follow Toggle */}
            <button
              className={`wfs-button ${autoFollow ? "wfs-button-primary" : ""}`}
              onClick={() => setAutoFollow((v) => !v)}
              title={autoFollow ? "Auto Follow Running Node: ACTIVE" : "Auto Follow Running Node: OFF"}
            >
              <Eye size={13} /> {autoFollow ? "Follow ON" : "Follow"}
            </button>

            {/* Fit View */}
            <button
              className="wfs-button wfs-icon-button"
              onClick={() => flow.fitView({ padding: 0.2, duration: 400 })}
              title="Fit View"
            >
              <Maximize2 size={13} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              className="wfs-button wfs-icon-button"
              onClick={() => setFullscreen((v) => !v)}
              title={fullscreen ? "Exit Fullscreen" : "Fullscreen Monitor"}
            >
              {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>

            {/* Global Console Toggle */}
            {run && (
              <button
                className={`wfs-button ${logsOpen ? "wfs-button-primary" : ""}`}
                onClick={() => setLogsOpen((v) => !v)}
                title="Global Event Stream & Terminal"
              >
                <Terminal size={13} /> Logs ({run.executionHistory.length})
              </button>
            )}

            <button
              className="wfs-button wfs-icon-button"
              onClick={() => { if (runId && runParams) runData.refresh(); else refresh(); }}
              title="Refresh status"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* PO Approval Gate Banner */}
        {approvalGateNode && (
          <div
            className="wfs-approval-banner"
            style={{
              position: "absolute",
              top: 74,
              left: 16,
              right: 16,
              zIndex: 10,
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <UserCheck size={20} color="#8b5cf6" />
              <div>
                <strong style={{ fontSize: 13 }}>Product Owner Approval Required</strong>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted-foreground)" }}>
                  Step <strong>“{approvalGateNode.title}”</strong> requires your sign-off before downstream agents proceed.
                </p>
              </div>
            </div>
            <div className="wfs-approval-actions">
              <button
                className="wfs-button"
                style={{ borderColor: "#dc2626", color: "#dc2626" }}
                disabled={busyAction}
                onClick={() => handleDecision("reject")}
              >
                <X size={13} /> Request Changes
              </button>
              <button
                className="wfs-button wfs-button-primary"
                style={{ background: "#10b981", borderColor: "#059669" }}
                disabled={busyAction}
                onClick={() => handleDecision("approve")}
              >
                <Check size={13} /> Approve & Continue
              </button>
            </div>
          </div>
        )}

        <ReactFlow<FlowNode, FlowEdge>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onPaneClick={() => setSelectedNodeId(null)}
          defaultViewport={currentWorkflow.viewport}
          fitView={!nodes.some((node) => ["running", "in_progress", "blocked", "failed"].includes(node.data.status))}
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.18}
          maxZoom={1.8}
        >
          <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
          <Controls showInteractive={false} />
          <MiniMap
            pannable
            zoomable
            nodeColor={(node) => {
              const st = node.data?.status;
              if (st === "done" || st === "completed") return "#10b981";
              if (st === "running" || st === "in_progress") return "#2563eb";
              if (st === "blocked") return "#f59e0b";
              if (st === "waiting_approval") return "#8b5cf6";
              if (st === "failed") return "#ef4444";
              return "#94a3b8";
            }}
          />
        </ReactFlow>

        {/* Historical Replay Scrubber Bar */}
        {replayMode && run && (
          <div className="wfs-replay-bar">
            <button
              className="wfs-button wfs-icon-button"
              onClick={() => setReplayPlaying((v) => !v)}
              title={replayPlaying ? "Pause Replay" : "Play Replay"}
            >
              {replayPlaying ? <Pause size={13} /> : <Play size={13} />}
            </button>

            <button
              className="wfs-button wfs-icon-button"
              disabled={replayStep <= 0}
              onClick={() => setReplayStep((s) => Math.max(0, s - 1))}
              title="Step Backward"
            >
              <Undo2 size={13} />
            </button>

            <button
              className="wfs-button wfs-icon-button"
              disabled={replayStep >= run.executionHistory.length - 1}
              onClick={() => setReplayStep((s) => Math.min(run.executionHistory.length - 1, s + 1))}
              title="Step Forward"
            >
              <Redo2 size={13} />
            </button>

            <input
              type="range"
              className="wfs-replay-scrubber"
              min={0}
              max={Math.max(0, run.executionHistory.length - 1)}
              value={replayStep}
              onChange={(e) => setReplayStep(Number(e.target.value))}
            />

            <span className="wfs-replay-time">
              Step {replayStep + 1} of {run.executionHistory.length}
            </span>

            <select
              style={{ height: 26, fontSize: 10, borderRadius: 5 }}
              value={replaySpeed}
              onChange={(e) => setReplaySpeed(Number(e.target.value) as any)}
              title="Replay Speed"
            >
              <option value={1}>1x Speed</option>
              <option value={2}>2x Speed</option>
              <option value={5}>5x Speed</option>
            </select>
          </div>
        )}

        {/* Slide-in Global Terminal / Execution Console Drawer */}
        {logsOpen && run && (
          <aside className="wfs-logs-drawer" style={{ width: 560 }}>
            <div className="wfs-logs-head">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Terminal size={15} color="#58a6ff" />
                <div>
                  <strong>Global Execution Console</strong>
                  <span style={{ fontSize: 10, color: "var(--muted-foreground)", display: "block" }}>
                    Run ID: {run.id} • {run.projectName}
                  </span>
                </div>
              </div>
              <button className="wfs-button wfs-icon-button" onClick={() => setLogsOpen(false)}>
                <X size={14} />
              </button>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <TerminalViewer
                logs={run.executionHistory}
                isRunning={run.status === "running"}
                title="Global Event Stream"
              />
            </div>
          </aside>
        )}
      </main>

      {/* Right Node Inspector with 5 Tabs */}
      {selected && (
        <LiveNodeInspector
          node={selected}
          bootstrap={bootstrap}
          monitor={monitorByNode.get(selected.id)}
          run={run}
          close={() => setSelectedNodeId(null)}
          openIssue={(id) => navigation.navigate(`/issues/${id}`)}
        />
      )}
    </div>
  );
}

function TemplatesPage({ exists, open }: { exists: boolean; open: () => Promise<void> }) {
  return <div className="wfs-template-page"><div className="wfs-page-heading"><h2>Workflow templates</h2><p>Reusable process definitions. Projects choose one of these templates from their own Workflow tab.</p></div><div className="wfs-template-card"><div className="wfs-template-top"><div><h3>AI Software Development Lifecycle</h3><p>Plan, design, build, review, test, deploy, and approve with the eight configured agents.</p></div><button className="wfs-button wfs-button-primary" onClick={() => void open()}>{exists ? <Settings2 size={14} /> : <Plus size={14} />} {exists ? "Open template" : "Create template"}</button></div><div className="wfs-template-flow"><span className="wfs-template-step">Plan</span><ChevronRight className="wfs-template-arrow" size={13} /><span className="wfs-template-step">Architecture</span><ChevronRight className="wfs-template-arrow" size={13} /><span className="wfs-template-step">Build</span><ChevronRight className="wfs-template-arrow" size={13} /><span className="wfs-template-step">Review</span><ChevronRight className="wfs-template-arrow" size={13} /><span className="wfs-template-step">Test</span><ChevronRight className="wfs-template-arrow" size={13} /><span className="wfs-template-step">Deploy</span></div></div></div>;
}

const AI_COMPANY_ROLES: Array<{
  roleKey: string;
  title: string;
  matchPattern: RegExp;
  description: string;
}> = [
  { roleKey: "pm", title: "Project Manager", matchPattern: /project manager|lead|pm/i, description: "Breaks down requirements, plans sprints, coordinates delivery" },
  { roleKey: "architect", title: "Solution Architect", matchPattern: /architect|solution/i, description: "Designs technical architecture, APIs, schema, and system integration" },
  { roleKey: "designer", title: "UI/UX Designer", matchPattern: /design|ui|ux/i, description: "Creates wireframes, design system tokens, and user flow specifications" },
  { roleKey: "backend", title: "Backend Engineer", matchPattern: /backend|api|server/i, description: "Implements business logic, database migrations, and REST/GraphQL APIs" },
  { roleKey: "frontend", title: "Frontend Engineer", matchPattern: /frontend|ui dev|web/i, description: "Builds responsive web interfaces, state management, and user interaction" },
  { roleKey: "reviewer", title: "Code Reviewer", matchPattern: /review|quality|audit/i, description: "Performs static analysis, security checks, and code quality audits" },
  { roleKey: "tester", title: "QA Tester", matchPattern: /qa|tester|test/i, description: "Writes unit/integration tests, verifies edge cases, and checks regression" },
  { roleKey: "devops", title: "DevOps Engineer", matchPattern: /devops|infra|sre|ops/i, description: "Automates CI/CD, builds deployment artifacts, and monitors infrastructure" }
];

export function RunWorkflowModal({
  isOpen,
  onClose,
  companyId,
  projects,
  workflows,
  initialProjectId,
  initialWorkflowId,
  onRunStarted
}: {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  projects: PaperclipProject[];
  workflows: WorkflowIndexEntry[];
  initialProjectId?: string | null;
  initialWorkflowId?: string | null;
  onRunStarted: (run: WorkflowRunRecord) => void;
}) {
  const [projectId, setProjectId] = useState<string>(initialProjectId ?? projects[0]?.id ?? "");
  const publishedWorkflows = workflows.filter((workflow) => workflow.status === "published");
  const [workflowId, setWorkflowId] = useState<string>(
    publishedWorkflows.find((workflow) => workflow.id === initialWorkflowId)?.id ?? publishedWorkflows[0]?.id ?? ""
  );
  const [requirement, setRequirement] = useState("");
  const [maxConcurrentAgents, setMaxConcurrentAgents] = useState(2);
  const [approvalMode, setApprovalMode] = useState<"require_approval" | "auto">("require_approval");
  const [failurePolicy, setFailurePolicy] = useState<"pause_and_report" | "fail_fast" | "continue_unrelated">("pause_and_report");
  const [retryPolicy, setRetryPolicy] = useState<"bounded" | "none" | "manual">("bounded");

  const [preflight, setPreflight] = useState<PreflightCheckResult | null>(null);
  const [preflightLoading, setPreflightLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const preflightAction = usePluginAction("preflight-check");
  const startWorkflowAction = usePluginAction("start-project-workflow");
  const toast = usePluginToast();

  useEffect(() => {
    if (initialProjectId) setProjectId(initialProjectId);
  }, [initialProjectId]);

  useEffect(() => {
    const initialPublished = publishedWorkflows.find((workflow) => workflow.id === initialWorkflowId);
    setWorkflowId((current) => initialPublished?.id ??
      (publishedWorkflows.some((workflow) => workflow.id === current) ? current : publishedWorkflows[0]?.id ?? ""));
  }, [initialWorkflowId, workflows]);

  useEffect(() => {
    if (!isOpen || !projectId || !workflowId) return;
    let cancelled = false;
    setPreflightLoading(true);
    setErrorMsg(null);
    preflightAction({ companyId, projectId, workflowId })
      .then((res) => {
        if (!cancelled) {
          setPreflight(res as PreflightCheckResult);
          setPreflightLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setErrorMsg(asMessage(err));
          setPreflight(null);
          setPreflightLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, companyId, projectId, workflowId, preflightAction]);

  const canStart = !starting && !preflightLoading && preflight?.ok && projectId &&
    publishedWorkflows.some((workflow) => workflow.id === workflowId) && requirement.trim();

  const handleStart = async () => {
    if (!canStart) return;
    setStarting(true);
    try {
      const response = (await startWorkflowAction({
        companyId,
        projectId,
        workflowId,
        inputRequirement: requirement.trim(),
        settings: {
          maxConcurrentAgents,
          approvalMode,
          failurePolicy,
          retryPolicy
        }
      })) as { run: WorkflowRunRecord };
      toast({
        title: "Workflow Run Started",
        body: `Run ID ${response.run.id} initiated. Ready task(s) dispatched to agents.`,
        tone: "success",
        ttlMs: 7000
      });
      onRunStarted(response.run);
      onClose();
    } catch (err) {
      toast({ title: "Failed to start workflow", body: asMessage(err), tone: "error", ttlMs: 10000 });
      setErrorMsg(asMessage(err));
    } finally {
      setStarting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wfs-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="wfs-modal wfs-run-dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="wfs-modal-head">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Rocket size={18} color="#10b981" /> Giao yêu cầu cho AI
              </h3>
              <p>Mô tả mục tiêu sản phẩm để Project Manager lập kế hoạch trong Workflow đã chọn.</p>
            </div>
            <button className="wfs-button wfs-icon-button" onClick={onClose}><X size={15} /></button>
          </div>
        </div>

        <div className="wfs-modal-body">
          <div className="wfs-dialog-grid">
            <label className="wfs-field">
              <span>Project</span>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>

            <label className="wfs-field">
              <span>Workflow (Published Version)</span>
              <select value={workflowId} onChange={(e) => setWorkflowId(e.target.value)}>
                {publishedWorkflows.length === 0 && <option value="">Chưa có Workflow đã Publish</option>}
                {publishedWorkflows.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (v{w.version})
                  </option>
                ))}
              </select>
            </label>
          </div>

          {publishedWorkflows.length === 0 && <p role="alert" style={{ color: "var(--destructive)", fontSize: 12 }}>
            Chưa có Workflow đã Publish. Hãy Publish một template trong mục Workflows trước khi giao yêu cầu.
          </p>}

          <label className="wfs-field">
            <span>Yêu cầu sản phẩm</span>
            <textarea
              rows={3}
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="Nhập yêu cầu ban đầu cho dự án..."
            />
            <small style={{ fontSize: 10.5, color: "var(--muted-foreground)" }}>
              Yêu cầu này sẽ được đưa vào Issue mở đầu và giao cho Project Manager lập kế hoạch.
            </small>
          </label>

          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Execution Settings
            </span>
            <div className="wfs-dialog-grid">
              <label className="wfs-field">
                <span>Max Concurrent Agents</span>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={maxConcurrentAgents}
                  onChange={(e) => setMaxConcurrentAgents(Math.max(1, Math.min(8, parseInt(e.target.value) || 2)))}
                />
              </label>

              <label className="wfs-field">
                <span>Approval Mode</span>
                <select value={approvalMode} onChange={(e) => setApprovalMode(e.target.value as any)}>
                  <option value="require_approval">Require PO Approval (Recommended)</option>
                  <option value="auto">Auto Approve</option>
                </select>
              </label>

              <label className="wfs-field">
                <span>Failure Policy</span>
                <select value={failurePolicy} onChange={(e) => setFailurePolicy(e.target.value as any)}>
                  <option value="pause_and_report">Pause and Report</option>
                  <option value="continue_unrelated">Continue Other Branches</option>
                  <option value="fail_fast">Fail Fast</option>
                </select>
              </label>

              <label className="wfs-field">
                <span>Retry Policy</span>
                <select value={retryPolicy} onChange={(e) => setRetryPolicy(e.target.value as any)}>
                  <option value="bounded">Bounded Retry (Max 2)</option>
                  <option value="none">No Retry</option>
                  <option value="manual">Manual Intervention</option>
                </select>
              </label>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase" }}>
                Preflight Checks
              </span>
              {preflightLoading && <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}><RefreshCw size={11} className="wfs-spin" /> Validating...</span>}
            </div>

            <div className="wfs-preflight-card">
              {preflight ? (
                preflight.checks.map((item) => (
                  <div key={item.key} className={`wfs-preflight-item ${item.status}`}>
                    <span className="wfs-preflight-icon">
                      {item.status === "pass" ? <CheckCircle2 size={14} /> : item.status === "warn" ? <AlertCircle size={14} /> : <X size={14} />}
                    </span>
                    <div className="wfs-preflight-text">
                      <strong>{item.name}</strong>
                      <small>{item.message}</small>
                    </div>
                  </div>
                ))
              ) : preflightLoading ? (
                <div style={{ padding: 12, textAlign: "center", fontSize: 11, color: "var(--muted-foreground)" }}>Running preflight validation...</div>
              ) : (
                <div style={{ padding: 12, textAlign: "center", fontSize: 11, color: "#dc2626" }}>
                  {errorMsg ?? "Select a valid project and published workflow to run preflight checks."}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="wfs-modal-actions">
          <button className="wfs-button" onClick={onClose} disabled={starting}>Cancel</button>
          <button
            className="wfs-button wfs-button-run"
            disabled={!canStart}
            onClick={handleStart}
          >
            {starting ? <RefreshCw size={14} className="wfs-spin" /> : <Play size={14} />}
            {starting ? "Starting Workflow..." : "Start Workflow"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AgentControlCenterView({
  companyId,
  bootstrap,
  onOpenRunModal,
  onOpenRunMonitor,
  openWorkflow,
  openTemplates,
  openHistory,
  openList,
  refreshBootstrap
}: {
  companyId: string;
  bootstrap: BootstrapData;
  onOpenRunModal: () => void;
  onOpenRunMonitor: (workflowId: string, runId: string) => void;
  openWorkflow: (id: string) => void;
  openTemplates: () => void;
  openHistory: () => void;
  openList: () => void;
  refreshBootstrap: () => void;
}) {
  const toast = usePluginToast();
  const navigation = useHostNavigation();
  const [busy, setBusy] = useState(false);
  const controlAction = usePluginAction("agent-control-action");

  const runRuns = bootstrap.runs ?? [];

  const handleGlobalAction = async (action: "start-all" | "stop-all" | "pause-all" | "resume-all" | "retry-failed") => {
    setBusy(true);
    try {
      const res = (await controlAction({ companyId, action })) as {
        count?: number;
        message?: string;
        noActiveWorkflow?: boolean;
        resumedAgentsCount?: number;
      };
      refreshBootstrap();
      if (action === "start-all" && res?.noActiveWorkflow) {
        toast({
          title: "All 8 AI Agents Ready",
          body: res.message || "All agents are active. Opening Project Workflow runner...",
          tone: "info"
        });
        onOpenRunModal();
      } else {
        toast({
          title: `Action: ${statusLabel(action)} executed`,
          body: res?.message || `Processed for ${res?.count ?? 0} items across company.`,
          tone: (res?.count ?? 0) > 0 ? "success" : "info"
        });
      }
    } catch (e) {
      toast({ title: "Control action failed", body: asMessage(e), tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  const handleAgentControl = async (action: "agent-pause" | "agent-resume" | "agent-wakeup", agentId: string, issueId?: string) => {
    setBusy(true);
    try {
      const res = (await controlAction({ companyId, action, agentId, issueId })) as {
        allowed?: boolean;
        message?: string;
        reason?: string;
      };
      refreshBootstrap();
      if (res?.allowed === false) {
        toast({
          title: `Agent Wakeup Notice`,
          body: res.message || res.reason || "Agent has no active task in current workflow step.",
          tone: "warn"
        });
      } else {
        toast({
          title: `Agent ${statusLabel(action)}`,
          body: res?.message || `Command executed successfully.`,
          tone: "success"
        });
      }
    } catch (e) {
      toast({ title: "Agent command failed", body: asMessage(e), tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="wfs-control-center">
      <header className="wfs-list-header">
        <div>
          <div className="wfs-tabs" role="tablist" style={{ marginBottom: 12 }}>
            <button className="wfs-tab" aria-selected="false" onClick={openList}>Workflow Templates</button>
            <button className="wfs-tab" aria-selected="true">Agent Control Center</button>
            <button className="wfs-tab" aria-selected="false" onClick={() => navigation.navigate("/projects-portfolio")}>Projects Portfolio</button>
            <button className="wfs-tab" aria-selected="false" onClick={openTemplates}>Templates</button>
          </div>
          <div className="wfs-list-eyebrow">AI Software Company Orchestration</div>
          <h1>Agent Control Center</h1>
          <p>
            Autonomous multi-agent execution powered by Paperclip. Run structured project workflows or manage individual AI agents.
          </p>
        </div>
      </header>

      {/* Control Toolbar */}
      <div className="wfs-control-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            className="wfs-button wfs-button-run"
            onClick={onOpenRunModal}
            title="Launch an autonomous project workflow through the 8 AI agents"
          >
            <Play size={15} /> Run Project Workflow
          </button>
        </div>

        <div className="wfs-control-actions">
          <button className="wfs-button" disabled={busy} onClick={() => handleGlobalAction("start-all")} title="Start all runnable tasks">
            <Play size={13} /> Start All
          </button>
          <button className="wfs-button" disabled={busy} onClick={() => handleGlobalAction("stop-all")} title="Stop running agents">
            <Square size={13} /> Stop All
          </button>
          <button className="wfs-button" disabled={busy} onClick={() => handleGlobalAction("pause-all")} title="Pause running agents">
            <Pause size={13} /> Pause All
          </button>
          <button className="wfs-button" disabled={busy} onClick={() => handleGlobalAction("resume-all")} title="Resume paused agents">
            <Play size={13} /> Resume All
          </button>
          <button className="wfs-button" disabled={busy} onClick={() => handleGlobalAction("retry-failed")} title="Retry failed tasks">
            <RotateCcw size={13} /> Retry Failed
          </button>
          <button className="wfs-button wfs-icon-button" onClick={refreshBootstrap} title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* The 8 AI Agents Grid */}
      <section style={{ display: "grid", gap: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 14 }}>AI Software Company Team (8 Agents)</h3>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--muted-foreground)" }}>
            Autonomous agents mapped to the workflow lifecycle. Agents are woken up strictly according to the published DAG dependencies.
          </p>
        </div>

        <div className="wfs-agents-grid">
          {AI_COMPANY_ROLES.map((roleDef) => {
            const agent = bootstrap.agents.find(
              (a) =>
                roleDef.matchPattern.test(a.name) ||
                roleDef.matchPattern.test(a.role) ||
                (a.title && roleDef.matchPattern.test(a.title))
            );
            const activeIssue = agent
              ? bootstrap.issues.find(
                  (i) => i.assigneeAgentId === agent.id && ["in_progress", "todo"].includes(i.status)
                )
              : null;
            const modelName =
              typeof agent?.adapterConfig?.model === "string"
                ? agent.adapterConfig.model
                : agent?.adapterType === "gemini"
                ? "Gemini 1.5 Pro"
                : agent?.adapterType === "codex"
                ? "Codex"
                : "Codex / Gemini Runtime";

            return (
              <div key={roleDef.roleKey} className="wfs-agent-card">
                <div className="wfs-agent-head">
                  <div className="wfs-agent-avatar">
                    {initials(roleDef.title)}
                  </div>
                  <div className="wfs-agent-info">
                    <strong>{agent?.name ?? roleDef.title}</strong>
                    <span>{roleDef.title} • {modelName}</span>
                  </div>
                  <span
                    className={`wfs-badge ${
                      agent?.status === "running"
                        ? "wfs-badge-published"
                        : agent?.status === "paused"
                        ? "wfs-badge-draft"
                        : ""
                    }`}
                  >
                    {agent ? statusLabel(agent.status) : "Unbound"}
                  </span>
                </div>

                <div className="wfs-agent-task">
                  <span>Current Task</span>
                  {activeIssue ? (
                    <a
                      href={`#/issues/${activeIssue.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigation.navigate(`/issues/${activeIssue.id}`);
                      }}
                      title={activeIssue.title}
                    >
                      {activeIssue.identifier ? `[${activeIssue.identifier}] ` : ""}
                      {activeIssue.title}
                    </a>
                  ) : (
                    <span style={{ color: "var(--muted-foreground)", fontSize: 10, textTransform: "none" }}>
                      Idle — Waiting for workflow step
                    </span>
                  )}
                </div>

                <div className="wfs-agent-actions">
                  {agent && (
                    <>
                      <button
                        className="wfs-button"
                        disabled={busy}
                        onClick={() => handleAgentControl("agent-wakeup", agent.id, activeIssue?.id)}
                        title="Wakeup agent"
                      >
                        <Play size={12} /> Wakeup
                      </button>
                      {agent.status === "paused" || agent.status === "error" ? (
                        <button
                          className="wfs-button"
                          disabled={busy}
                          onClick={() => handleAgentControl("agent-resume", agent.id)}
                          title="Resume agent"
                        >
                          <Play size={12} /> Resume
                        </button>
                      ) : (
                        <button
                          className="wfs-button"
                          disabled={busy}
                          onClick={() => handleAgentControl("agent-pause", agent.id)}
                          title="Pause agent"
                        >
                          <Pause size={12} /> Pause
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (isNaN(diffSec) || diffSec < 0) return "Just now";
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
}

function WorkflowListPage({
  workflows,
  busy,
  createWorkflow,
  openWorkflow,
  duplicateWorkflow,
  renameWorkflow,
  deleteWorkflow
}: {
  workflows: WorkflowIndexEntry[];
  busy: boolean;
  createWorkflow: (name?: string) => Promise<void> | void;
  openWorkflow: (id: string) => void;
  duplicateWorkflow: (id: string) => void;
  renameWorkflow: (workflow: WorkflowIndexEntry, name: string) => void;
  deleteWorkflow: (workflow: WorkflowIndexEntry) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "published">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("New Workflow");
  const [renameTarget, setRenameTarget] = useState<WorkflowIndexEntry | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<WorkflowIndexEntry | null>(null);

  useEffect(() => {
    if (!actionMenuId) return;
    const closeMenu = () => setActionMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [actionMenuId]);

  const publishedCount = workflows.filter((w) => w.status === "published").length;
  const draftCount = workflows.filter((w) => w.status !== "published").length;

  const visible = workflows
    .filter((workflow) => {
      if (status === "published" && workflow.status !== "published") return false;
      if (status === "draft" && workflow.status === "published") return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const combined = `${workflow.name} ${workflow.description || ""}`.toLowerCase();
        if (!combined.includes(q)) return false;
      }
      return true;
    })
    .sort((left, right) => (right.updatedAt || "").localeCompare(left.updatedAt || ""));

  const beginRename = (workflow: WorkflowIndexEntry) => {
    setRenameTarget(workflow);
    setRenameValue(workflow.name);
  };

  return (
    <div className="wfs-list-page">
      <header className="wfs-list-header">
        <div>
          <div className="wfs-list-eyebrow">Workflows</div>
          <h1>Workflows</h1>
          <p>Design and manage automated workflows.</p>
        </div>
        <div className="wfs-list-header-actions">
          <button
            className="wfs-button wfs-button-primary"
            disabled={busy}
            onClick={() => {
              setNewWorkflowName("New Workflow");
              setCreateModalOpen(true);
            }}
          >
            <Plus size={14} /> Create Workflow
          </button>
        </div>
      </header>

      <div className="wfs-list-controls">
        <div className="wfs-pill-group" role="tablist" aria-label="Filter workflows by status">
          <button
            className="wfs-pill-btn"
            aria-selected={status === "all"}
            onClick={() => setStatus("all")}
          >
            All Workflows <span className="wfs-pill-count">{workflows.length}</span>
          </button>
          <button
            className="wfs-pill-btn"
            aria-selected={status === "published"}
            onClick={() => setStatus("published")}
          >
            Published <span className="wfs-pill-count">{publishedCount}</span>
          </button>
          <button
            className="wfs-pill-btn"
            aria-selected={status === "draft"}
            onClick={() => setStatus("draft")}
          >
            Drafts <span className="wfs-pill-count">{draftCount}</span>
          </button>
        </div>

        <div className="wfs-controls-right">
          <div className="wfs-search-box">
            <Search size={14} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search workflows..."
              aria-label="Search workflows"
            />
            {query && (
              <button
                className="wfs-search-clear"
                onClick={() => setQuery("")}
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="wfs-view-toggle" role="group" aria-label="View layout toggle">
            <button
              className="wfs-view-btn"
              aria-selected={viewMode === "grid"}
              onClick={() => setViewMode("grid")}
              title="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              className="wfs-view-btn"
              aria-selected={viewMode === "list"}
              onClick={() => setViewMode("list")}
              title="Compact list view"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="wfs-empty-state">
          <div className="wfs-empty-state-icon">
            <Workflow size={24} />
          </div>
          <h3>{workflows.length > 0 ? "No workflows match your search" : "No workflows yet"}</h3>
          <p>
            {workflows.length > 0
              ? "Try adjusting your search query or status filter to find what you're looking for."
              : "Create your first workflow to orchestrate AI agents and delivery steps."}
          </p>
          {workflows.length > 0 ? (
            <button
              className="wfs-button"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
            >
              Clear filters
            </button>
          ) : (
            <button
              className="wfs-button wfs-button-primary"
              onClick={() => {
                setNewWorkflowName("New Workflow");
                setCreateModalOpen(true);
              }}
            >
              <Plus size={14} /> Create Workflow
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="wfs-cards-grid">
          {visible.map((workflow) => (
            <div key={workflow.id} className="wfs-card">
              <div className="wfs-card-head">
                <div className="wfs-card-top-row">
                  <div className="wfs-card-icon">
                    <Workflow size={18} />
                  </div>
                  <div className="wfs-card-badges">
                    <span className={`wfs-badge ${workflow.status === "published" ? "wfs-badge-published" : "wfs-badge-draft"}`}>
                      {workflow.status === "published" ? "Published" : "Draft"}
                    </span>
                    <span className="wfs-badge-version">v{workflow.version}</span>
                  </div>
                  <div className="wfs-card-menu-anchor" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="wfs-icon-btn"
                      onClick={() => setActionMenuId(actionMenuId === workflow.id ? null : workflow.id)}
                      title={`Actions for ${workflow.name}`}
                      aria-label={`Actions for ${workflow.name}`}
                    >
                      <MoreHorizontal size={15} />
                    </button>
                    {actionMenuId === workflow.id && (
                      <div className="wfs-popover wfs-card-popover">
                        <button onClick={() => { setActionMenuId(null); beginRename(workflow); }}>
                          <Braces size={13} /> Rename
                        </button>
                        <button onClick={() => { setActionMenuId(null); duplicateWorkflow(workflow.id); }}>
                          <Copy size={13} /> Duplicate
                        </button>
                        <div className="wfs-menu-separator" />
                        <button className="danger" onClick={() => { setActionMenuId(null); setDeleteTarget(workflow); }}>
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <h3
                  className="wfs-card-title"
                  onClick={() => openWorkflow(workflow.id)}
                  title={`Open ${workflow.name} in designer`}
                >
                  {workflow.name}
                </h3>
                <p className="wfs-card-desc">
                  {workflow.description || "No description provided."}
                </p>
              </div>

              <div className="wfs-card-foot">
                <div className="wfs-card-updated" title={new Date(workflow.updatedAt).toLocaleString()}>
                  <Clock3 size={12} />
                  <span>Updated {formatRelativeTime(workflow.updatedAt)}</span>
                </div>
                <button
                  className="wfs-button wfs-open-btn"
                  onClick={() => openWorkflow(workflow.id)}
                >
                  <span>Open Designer</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="wfs-compact-table" role="table" aria-label="Workflows">
          <div className="wfs-compact-head" role="row">
            <span>Workflow</span>
            <span>Status</span>
            <span>Version</span>
            <span>Last Updated</span>
            <span style={{ textAlign: "right" }}>Actions</span>
          </div>
          {visible.map((workflow) => (
            <div key={workflow.id} className="wfs-compact-row" role="row">
              <button
                className="wfs-compact-main"
                onClick={() => openWorkflow(workflow.id)}
                title={`Open ${workflow.name} in designer`}
              >
                <span className="wfs-compact-mark">
                  <Workflow size={15} />
                </span>
                <div className="wfs-compact-text">
                  <strong>{workflow.name}</strong>
                  <small>{workflow.description || "No description provided."}</small>
                </div>
              </button>
              <div>
                <span className={`wfs-badge ${workflow.status === "published" ? "wfs-badge-published" : "wfs-badge-draft"}`}>
                  {workflow.status === "published" ? "Published" : "Draft"}
                </span>
              </div>
              <div>
                <span className="wfs-badge-version">v{workflow.version}</span>
              </div>
              <div>
                <time dateTime={workflow.updatedAt} className="wfs-compact-time">
                  {new Date(workflow.updatedAt).toLocaleString()}
                </time>
              </div>
              <div className="wfs-compact-actions">
                <button className="wfs-button" onClick={() => openWorkflow(workflow.id)}>
                  Open Designer
                </button>
                <div className="wfs-card-menu-anchor" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="wfs-icon-btn"
                    onClick={() => setActionMenuId(actionMenuId === workflow.id ? null : workflow.id)}
                    title={`Actions for ${workflow.name}`}
                    aria-label={`Actions for ${workflow.name}`}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                  {actionMenuId === workflow.id && (
                    <div className="wfs-popover wfs-card-popover">
                      <button onClick={() => { setActionMenuId(null); beginRename(workflow); }}>
                        <Braces size={13} /> Rename
                      </button>
                      <button onClick={() => { setActionMenuId(null); duplicateWorkflow(workflow.id); }}>
                        <Copy size={13} /> Duplicate
                      </button>
                      <div className="wfs-menu-separator" />
                      <button className="danger" onClick={() => { setActionMenuId(null); setDeleteTarget(workflow); }}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {createModalOpen && (
        <div className="wfs-modal-backdrop" role="presentation">
          <div className="wfs-modal wfs-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="create-workflow-title">
            <div className="wfs-modal-head">
              <h3 id="create-workflow-title">Create Workflow</h3>
              <p>Set up a new workflow template to design and automate delivery pipelines.</p>
            </div>
            <div className="wfs-modal-body">
              <label className="wfs-field">
                <span>Workflow Name</span>
                <input
                  autoFocus
                  maxLength={120}
                  value={newWorkflowName}
                  onChange={(event) => setNewWorkflowName(event.target.value)}
                  placeholder="e.g., Code Review & QA Pipeline"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && newWorkflowName.trim()) {
                      const name = newWorkflowName.trim();
                      setCreateModalOpen(false);
                      void createWorkflow(name);
                    }
                  }}
                />
              </label>
            </div>
            <div className="wfs-modal-actions">
              <button className="wfs-button" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </button>
              <button
                className="wfs-button wfs-button-primary"
                disabled={busy || !newWorkflowName.trim()}
                onClick={() => {
                  const name = newWorkflowName.trim();
                  setCreateModalOpen(false);
                  void createWorkflow(name);
                }}
              >
                <Plus size={14} /> Create & Open Designer
              </button>
            </div>
          </div>
        </div>
      )}

      {renameTarget && (
        <div className="wfs-modal-backdrop" role="presentation">
          <div className="wfs-modal wfs-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="rename-workflow-title">
            <div className="wfs-modal-head">
              <h3 id="rename-workflow-title">Rename workflow</h3>
              <p>Nodes, edges, project bindings, and Paperclip dependencies stay unchanged.</p>
            </div>
            <div className="wfs-modal-body">
              <label className="wfs-field">
                <span>Name</span>
                <input
                  autoFocus
                  maxLength={120}
                  value={renameValue}
                  onChange={(event) => setRenameValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && renameValue.trim()) {
                      renameWorkflow(renameTarget, renameValue.trim());
                      setRenameTarget(null);
                    }
                  }}
                />
              </label>
            </div>
            <div className="wfs-modal-actions">
              <button className="wfs-button" onClick={() => setRenameTarget(null)}>
                Cancel
              </button>
              <button
                className="wfs-button wfs-button-primary"
                disabled={busy || !renameValue.trim()}
                onClick={() => {
                  renameWorkflow(renameTarget, renameValue.trim());
                  setRenameTarget(null);
                }}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="wfs-modal-backdrop" role="presentation">
          <div className="wfs-modal wfs-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-workflow-title">
            <div className="wfs-modal-head">
              <h3 id="delete-workflow-title">Are you sure you want to delete this workflow?</h3>
              <p>Only “{deleteTarget.name}” will be removed. Paperclip issues, agents, projects, and task dependencies will not be deleted.</p>
            </div>
            <div className="wfs-modal-actions">
              <button className="wfs-button" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                className="wfs-button wfs-button-danger"
                disabled={busy}
                onClick={() => {
                  deleteWorkflow(deleteTarget);
                  setDeleteTarget(null);
                }}
              >
                <Trash2 size={14} /> Delete workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [runModalWorkflowId, setRunModalWorkflowId] = useState<string | null>(null);
  const [runModalProjectId, setRunModalProjectId] = useState<string | null>(projectId);
  const routeParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const rawWorkflowId = routeParams.get("workflow");
  const routeView = routeParams.get("view");
  const runId = routeParams.get("run");
  const workflowId = rawWorkflowId || (runId && bootstrapData.data?.runs ? bootstrapData.data.runs.find((r) => r.id === runId)?.workflowId ?? null : null);
  const mode: StudioMode =
    routeView === "monitor"
      ? "monitor"
      : routeView === "history"
      ? "history"
      : routeView === "templates"
      ? "templates"
      : routeView === "control-center"
      ? "control-center"
      : "designer";
  const workflowPath = useCallback(
    (id: string, view: "designer" | "monitor" = "designer") => `/workflows?workflow=${encodeURIComponent(id)}&view=${view}`,
    []
  );
  const openWorkflow = useCallback(
    (id: string, view: "designer" | "monitor" = "designer") => navigation.navigate(workflowPath(id, view)),
    [navigation, workflowPath]
  );
  const openList = useCallback(() => navigation.navigate("/workflows"), [navigation]);
  const openTemplates = useCallback(() => navigation.navigate("/workflows?view=templates"), [navigation]);
  const openControlCenter = useCallback(() => navigation.navigate("/workflows?view=control-center"), [navigation]);
  const openHistory = useCallback(() => navigation.navigate("/workflows?view=history"), [navigation]);
  const openRunMonitor = useCallback(
    (wfId: string, rId: string) =>
      navigation.navigate(`/workflows?workflow=${encodeURIComponent(wfId)}&view=monitor&run=${encodeURIComponent(rId)}`),
    [navigation]
  );

  const create = useCallback(async () => {
    try {
      const response = await createTemplate({ companyId }) as { workflow: WorkflowDefinition };
      bootstrapData.refresh();
      openWorkflow(response.workflow.id);
      toast({ title: "Template created", body: "The workflow is saved. No issue or agent run was created.", tone: "success" });
    } catch (error) { toast({ title: "Template failed", body: asMessage(error), tone: "error" }); }
  }, [createTemplate, companyId, bootstrapData.refresh, openWorkflow, toast]);

  const createBlank = useCallback(async (name?: string) => {
    setBusy(true);
    try {
      const response = await createWorkflowAction({ companyId, name: name?.trim() || "Untitled workflow" }) as { workflow: WorkflowDefinition };
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

  if (mode === "history") {
    return (
      <div className="wfs-root wfs-list-root">
        <style>{reactFlowStyles + studioStyles}</style>
        <div className="wfs-control-center">
          <header className="wfs-list-header">
            <div>
              <button className="wfs-button" onClick={openList} style={{ marginBottom: 12 }}>
                <ArrowLeft size={14} /> Back to Workflows
              </button>
              <div className="wfs-list-eyebrow">Execution Observability</div>
              <h1>Workflow Run History</h1>
              <p>Past workflow runs, multi-agent execution timelines, outputs, and archived terminal logs.</p>
            </div>
            <div className="wfs-list-header-actions">
              <button
                className="wfs-button wfs-button-run"
                onClick={() => {
                  setRunModalWorkflowId(null);
                  setRunModalOpen(true);
                }}
              >
                <Play size={14} /> Run Project Workflow
              </button>
            </div>
          </header>
          <RunHistoryView
            runs={bootstrap.runs ?? []}
            onInspectRun={(wfId, rId, replay) =>
              navigation.navigate(`/workflows?workflow=${encodeURIComponent(wfId)}&view=monitor&run=${encodeURIComponent(rId)}${replay ? "&replay=1" : ""}`)
            }
            onClearHistory={async () => { bootstrapData.refresh(); }}
          />
        </div>
        <RunWorkflowModal
          isOpen={runModalOpen}
          onClose={() => setRunModalOpen(false)}
          companyId={companyId}
          projects={bootstrap.projects}
          workflows={bootstrap.workflows}
          initialProjectId={runModalProjectId}
          initialWorkflowId={runModalWorkflowId}
          onRunStarted={(run) => {
            bootstrapData.refresh();
            openRunMonitor(run.workflowId, run.id);
          }}
        />
      </div>
    );
  }

  if (mode === "control-center") {
    return (
      <div className="wfs-root wfs-list-root">
        <style>{reactFlowStyles + studioStyles}</style>
        <AgentControlCenterView
          companyId={companyId}
          bootstrap={bootstrap}
          onOpenRunModal={() => {
            setRunModalWorkflowId(null);
            setRunModalOpen(true);
          }}
          onOpenRunMonitor={openRunMonitor}
          openWorkflow={openWorkflow}
          openTemplates={openTemplates}
          openHistory={openHistory}
          openList={openList}
          refreshBootstrap={bootstrapData.refresh}
        />
        <RunWorkflowModal
          isOpen={runModalOpen}
          onClose={() => setRunModalOpen(false)}
          companyId={companyId}
          projects={bootstrap.projects}
          workflows={bootstrap.workflows}
          initialProjectId={runModalProjectId}
          initialWorkflowId={runModalWorkflowId}
          onRunStarted={(run) => {
            bootstrapData.refresh();
            openRunMonitor(run.workflowId, run.id);
          }}
        />
      </div>
    );
  }

  if (!workflowId) {
    return (
      <div className="wfs-root wfs-list-root">
        <style>{reactFlowStyles + studioStyles}</style>
        <WorkflowListPage
          workflows={bootstrap.workflows}
          busy={busy}
          createWorkflow={(name) => void createBlank(name)}
          openWorkflow={openWorkflow}
          duplicateWorkflow={(id) => void duplicateFromList(id)}
          renameWorkflow={(item, name) => void renameFromList(item, name)}
          deleteWorkflow={(item) => void deleteFromList(item)}
        />
      </div>
    );
  }

  return (
    <div className="wfs-root">
      <style>{reactFlowStyles + studioStyles}</style>
      <WorkflowLoader
        key={`${workflowId}-${mode}-${runId ?? ""}`}
        companyId={companyId}
        workflowId={workflowId}
        runId={runId}
        bootstrap={bootstrap}
        mode={mode}
        openList={openList}
        openTemplates={openList}
        openControlCenter={openList}
        openHistory={openHistory}
        openMode={(view) => openWorkflow(workflowId, view)}
        openWorkflow={openWorkflow}
        onOpenRunModal={(wfId) => {
          setRunModalWorkflowId(wfId ?? workflowId);
          setRunModalOpen(true);
        }}
        saveAction={saveAction}
        validateAction={validateAction}
        duplicateAction={duplicateAction}
        deleteAction={deleteAction}
        publishAction={publishAction}
        refreshBootstrap={bootstrapData.refresh}
      />
      <RunWorkflowModal
        isOpen={runModalOpen}
        onClose={() => setRunModalOpen(false)}
        companyId={companyId}
        projects={bootstrap.projects}
        workflows={bootstrap.workflows}
        initialProjectId={runModalProjectId}
        initialWorkflowId={runModalWorkflowId}
        onRunStarted={(run) => {
          bootstrapData.refresh();
          openRunMonitor(run.workflowId, run.id);
        }}
      />
    </div>
  );
}

function WorkflowLoader({
  companyId,
  workflowId,
  runId,
  bootstrap,
  mode,
  openList,
  openTemplates,
  openControlCenter,
  openHistory,
  openMode,
  openWorkflow,
  onOpenRunModal,
  saveAction,
  validateAction,
  duplicateAction,
  deleteAction,
  publishAction,
  refreshBootstrap
}: {
  companyId: string;
  workflowId: string;
  runId?: string | null;
  bootstrap: BootstrapData;
  mode: StudioMode;
  openList: () => void;
  openTemplates: () => void;
  openControlCenter: () => void;
  openHistory: () => void;
  openMode: (mode: "designer" | "monitor") => void;
  openWorkflow: (id: string, mode?: "designer" | "monitor") => void;
  onOpenRunModal: (workflowId?: string) => void;
  saveAction: (params?: Record<string, unknown>) => Promise<unknown>;
  validateAction: (params?: Record<string, unknown>) => Promise<unknown>;
  duplicateAction: (params?: Record<string, unknown>) => Promise<unknown>;
  deleteAction: (params?: Record<string, unknown>) => Promise<unknown>;
  publishAction: (params?: Record<string, unknown>) => Promise<unknown>;
  refreshBootstrap: () => void;
}) {
  const navigation = useHostNavigation();
  const params = useMemo(() => ({ companyId, workflowId, ...(runId ? { runId } : {}) }), [companyId, workflowId, runId]);
  const workflowData = usePluginData<WorkflowData>("workflow", params);
  const matchingRun = bootstrap.runs?.find((r) => r.id === runId) ?? null;
  if (workflowData.loading && !workflowData.data) return <LoadingState />;
  if (workflowData.error) return <ErrorState message={workflowData.error.message} retry={workflowData.refresh} />;
  if (!workflowData.data) return <ErrorState message="Workflow data is unavailable." retry={workflowData.refresh} />;
  if (mode === "monitor") {
    return (
      <>
        <div className="wfs-toolbar wfs-detail-toolbar">
          <button className="wfs-button wfs-icon-button" onClick={openList} title="Back to workflows">
            <ArrowLeft size={14} />
          </button>
          <div className="wfs-brand">
            <span className="wfs-brand-icon">
              <Workflow size={16} />
            </span>
            <div className="wfs-title-wrap">
              <div className="wfs-title">{workflowData.data.workflow.name}</div>
              <div className="wfs-subtitle">{runId ? `Run Monitor: ${runId}` : "Live Paperclip status"}</div>
            </div>
          </div>
          <div className="wfs-tabs" role="tablist">
            <button className="wfs-tab" aria-selected="false" onClick={() => openMode("designer")}>
              Designer
            </button>
            <button className="wfs-tab" aria-selected="true">
              Monitor
            </button>
          </div>
        </div>
        {matchingRun?.projectId && (
          <div className="wfs-compat-banner" style={{ margin: "10px 12px 4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Activity size={18} color="#10b981" />
              <div>
                <strong>Workflow Live Execution has moved to Project Detail</strong>
                <p style={{ margin: "2px 0 0", color: "var(--muted-foreground)", fontSize: 11 }}>
                  Run <code>{matchingRun.id}</code> is bound to project <strong>{matchingRun.projectName}</strong>. Monitor and manage it directly within the project.
                </p>
              </div>
            </div>
            <button
              className="wfs-button wfs-button-primary"
              onClick={() => navigation.navigate(`/projects/${matchingRun.projectId}?tab=workflow&run=${matchingRun.id}`)}
            >
              <ExternalLink size={13} /> Open in Project Detail
            </button>
          </div>
        )}
        <MonitorCanvas
          bootstrap={bootstrap}
          data={workflowData.data}
          refresh={workflowData.refresh}
          companyId={companyId}
          runId={runId}
        />
      </>
    );
  }
  return (
    <DesignerCanvas
      bootstrap={bootstrap}
      initial={workflowData.data.workflow}
      saveAction={saveAction}
      validateAction={validateAction}
      duplicateAction={duplicateAction}
      deleteAction={deleteAction}
      publishAction={publishAction}
      refreshBootstrap={() => {
        refreshBootstrap();
        workflowData.refresh();
      }}
      selectWorkflow={openWorkflow}
      switchMode={(next) =>
        next === "templates"
          ? openTemplates()
          : next === "control-center"
          ? openControlCenter()
          : next === "history"
          ? openHistory()
          : next === "portfolio"
          ? navigation.navigate("/projects-portfolio")
          : openMode(next)
      }
      onOpenRunModal={onOpenRunModal}
    />
  );
}

export function ProjectPortfolioView({
  companyId,
  onOpenTemplates,
  onOpenControlCenter
}: {
  companyId: string;
  onOpenTemplates?: () => void;
  onOpenControlCenter?: () => void;
}) {
  const navigation = useHostNavigation();
  const toast = usePluginToast();
  const portfolioQuery = usePluginData<ProjectPortfolioData>("portfolio-dashboard", { companyId });
  const [search, setSearch] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState("all");
  const [runStatusFilter, setRunStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"activity" | "name" | "progress">("activity");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  const [runModalOpen, setRunModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Controlled polling when active run is running or waiting
  useEffect(() => {
    const hasRunning = portfolioQuery.data?.items.some(
      (item) => item.activeRun && (item.activeRun.status === "running" || item.activeRun.status === "waiting_approval")
    );
    if (!hasRunning) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        portfolioQuery.refresh();
      }
    }, 5000);
    return () => window.clearInterval(interval);
  }, [portfolioQuery.data, portfolioQuery.refresh]);

  if (portfolioQuery.loading && !portfolioQuery.data) return <LoadingState />;
  if (portfolioQuery.error) return <ErrorState message={portfolioQuery.error.message} retry={portfolioQuery.refresh} />;
  if (!portfolioQuery.data) return <ErrorState message="Portfolio data is unavailable." retry={portfolioQuery.refresh} />;

  const { items, workflows, agents } = portfolioQuery.data;

  // Filter
  const filtered = items.filter((item) => {
    if (projectStatusFilter !== "all" && item.projectStatus !== projectStatusFilter) return false;
    if (runStatusFilter !== "all") {
      if (runStatusFilter === "no_run" && item.activeRun !== null) return false;
      if (runStatusFilter !== "no_run" && (!item.activeRun || item.activeRun.status !== runStatusFilter)) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.projectName.toLowerCase().includes(q);
      const matchDesc = item.projectDescription?.toLowerCase().includes(q) ?? false;
      const matchWf = item.workflowBinding?.templateName.toLowerCase().includes(q) ?? false;
      const matchRun = item.activeRun?.id.toLowerCase().includes(q) ?? false;
      if (!matchName && !matchDesc && !matchWf && !matchRun) return false;
    }
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortBy === "name") {
      cmp = a.projectName.localeCompare(b.projectName);
    } else if (sortBy === "progress") {
      const progA = a.activeRun?.progress ?? a.latestRunSummary?.progress ?? 0;
      const progB = b.activeRun?.progress ?? b.latestRunSummary?.progress ?? 0;
      cmp = progA - progB;
    } else {
      const timeA = new Date(a.lastUpdatedAt).getTime();
      const timeB = new Date(b.lastUpdatedAt).getTime();
      cmp = timeA - timeB;
    }
    return sortOrder === "asc" ? cmp : -cmp;
  });

  const handleOpenProject = (projectId: string, runId?: string) => {
    const query = runId ? `?tab=workflow&run=${encodeURIComponent(runId)}` : `?tab=workflow`;
    navigation.navigate(`/projects/${projectId}${query}`);
  };

  const handleStartWorkflow = (item: ProjectPortfolioItem) => {
    setSelectedProjectId(item.projectId);
    setRunModalOpen(true);
  };

  return (
    <div className="wfs-portfolio-page">
      <header className="wfs-portfolio-header">
        <div>
          <div className="wfs-tabs" role="tablist" style={{ marginBottom: 12 }}>
            <button className="wfs-tab" aria-selected="true">Projects Portfolio</button>
            <button className="wfs-tab" aria-selected="false" onClick={() => navigation.navigate("/workflows")}>Workflow Templates</button>
            <button className="wfs-tab" aria-selected="false" onClick={() => navigation.navigate("/workflows?view=control-center")}>Agent Control Center</button>
          </div>
          <div className="wfs-list-eyebrow">Product & Execution Observability</div>
          <h1>Projects Portfolio</h1>
          <p>
            Real-time observability of AI agent workflows, stage progression, and delivery health across all software development projects.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="wfs-button" onClick={() => portfolioQuery.refresh()} title="Refresh Portfolio">
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            className="wfs-button wfs-button-primary"
            onClick={() => navigation.navigate("/workflows")}
          >
            <Workflow size={14} /> Workflow Templates
          </button>
        </div>
      </header>

      {/* Controls Bar: Search, Filters, Sort, View Toggle */}
      <div className="wfs-portfolio-controls">
        <div className="wfs-portfolio-filters">
          <div className="wfs-portfolio-search">
            <Search size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search project, workflow, or run ID..."
              aria-label="Search projects"
            />
          </div>

          <select
            value={projectStatusFilter}
            onChange={(e) => setProjectStatusFilter(e.target.value)}
            aria-label="Filter by project status"
          >
            <option value="all">All Project Statuses</option>
            <option value="active">Active</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="planned">Planned</option>
          </select>

          <select
            value={runStatusFilter}
            onChange={(e) => setRunStatusFilter(e.target.value)}
            aria-label="Filter by workflow run status"
          >
            <option value="all">All Run Statuses</option>
            <option value="running">Running</option>
            <option value="waiting_approval">Waiting Approval</option>
            <option value="paused">Paused</option>
            <option value="failed">Failed / Attention</option>
            <option value="completed">Completed</option>
            <option value="no_run">No Active Run</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "activity" | "name" | "progress")}
            aria-label="Sort projects"
          >
            <option value="activity">Sort by Last Activity</option>
            <option value="name">Sort by Project Name</option>
            <option value="progress">Sort by Progress</option>
          </select>

          <button
            className="wfs-button wfs-icon-button"
            onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
            title={sortOrder === "asc" ? "Ascending order" : "Descending order"}
          >
            <ArrowUpDown size={13} />
          </button>
        </div>

        <div className="wfs-portfolio-view-toggle">
          <button
            type="button"
            aria-selected={viewMode === "card"}
            onClick={() => setViewMode("card")}
            title="Card View"
          >
            <LayoutGrid size={13} /> Cards
          </button>
          <button
            type="button"
            aria-selected={viewMode === "list"}
            onClick={() => setViewMode("list")}
            title="List View"
          >
            <List size={13} /> List
          </button>
        </div>
      </div>

      {/* Grid or List View */}
      {sorted.length === 0 ? (
        <div className="wfs-list-empty" style={{ margin: "20px 0" }}>
          <FolderGit2 size={24} />
          <div>
            <strong>No matching projects found</strong>
            <p>Try clearing your search query or status filter.</p>
          </div>
        </div>
      ) : viewMode === "card" ? (
        <div className="wfs-portfolio-grid">
          {sorted.map((item) => {
            const run = item.activeRun;
            return (
              <div key={item.projectId} className="wfs-portfolio-card">
                <div>
                  <div className="wfs-portfolio-card-head">
                    <div>
                      <div
                        className="wfs-portfolio-card-title"
                        onClick={() => handleOpenProject(item.projectId, run?.id)}
                        title={`Open ${item.projectName}`}
                      >
                        <FolderGit2 size={16} color="var(--wfs-accent)" />
                        <span>{item.projectName}</span>
                      </div>
                      <div className="wfs-portfolio-card-wf">
                        {item.workflowBinding ? (
                          <span>{item.workflowBinding.templateName} (v{item.workflowBinding.templateVersion})</span>
                        ) : (
                          <span style={{ color: "var(--muted-foreground)" }}>No active workflow</span>
                        )}
                      </div>
                    </div>
                    <div>
                      {run ? (
                        <span
                          className={`wfs-badge ${run.status === "completed" ? "wfs-badge-published" : "wfs-badge-draft"}`}
                          style={{
                            textTransform: "capitalize",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            borderLeft: run.status === "running" ? "3px solid #10b981" : undefined
                          }}
                        >
                          {run.status === "running" && <span className="wfs-stage-pulse" />}
                          {statusLabel(run.status)}
                        </span>
                      ) : (
                        <span className="wfs-badge" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                          No active run
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="wfs-portfolio-card-body">
                    {run ? (
                      <>
                        <div className="wfs-portfolio-progress-wrap">
                          <div className="wfs-portfolio-progress-bar">
                            <span style={{ width: `${run.progress}%` }} />
                          </div>
                          <div className="wfs-portfolio-progress-meta">
                            <span>{run.progress}% ({run.completedSteps}/{run.totalSteps} steps completed)</span>
                            <span>Started {new Date(run.startedAt).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        {run.currentStages.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
                            <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Stage:</span>
                            {run.currentStages.map((stage) => (
                              <span key={stage} className="wfs-stage-pill">
                                <span className="wfs-stage-pulse" />
                                {stage}
                              </span>
                            ))}
                          </div>
                        )}

                        {run.activeAgents.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                            <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Agents:</span>
                            {run.activeAgents.map((ag) => (
                              <span key={ag.id} className="wfs-agent-tag">
                                <Bot size={11} /> {ag.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {run.waitingOrBlockedReason && (
                          <div className={`wfs-reason-box ${run.status === "failed" ? "failed" : ""}`}>
                            <AlertTriangle size={12} style={{ flexShrink: 0 }} />
                            <span>{run.waitingOrBlockedReason}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ padding: "8px 0", fontSize: 11, color: "var(--muted-foreground)" }}>
                        {item.latestRunSummary ? (
                          <div>
                            Latest run: <strong>{statusLabel(item.latestRunSummary.status)}</strong> ({item.latestRunSummary.progress}% - {item.latestRunSummary.completedTasks}/{item.latestRunSummary.totalTasks} steps)
                          </div>
                        ) : (
                          <div>No active execution. Attach template to start autonomous workflow.</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="wfs-portfolio-card-foot">
                  <span title={new Date(item.lastUpdatedAt).toLocaleString()}>
                    <Clock size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                    {item.activeRun?.lastActivitySummary
                      ? (item.activeRun.lastActivitySummary.length > 36
                          ? item.activeRun.lastActivitySummary.slice(0, 36) + "..."
                          : item.activeRun.lastActivitySummary)
                      : new Date(item.lastUpdatedAt).toLocaleTimeString()}
                  </span>

                  <div style={{ display: "flex", gap: 6 }}>
                    {run ? (
                      <button
                        className="wfs-button wfs-button-primary"
                        style={{ height: 26, fontSize: 10.5 }}
                        onClick={() => handleOpenProject(item.projectId, run.id)}
                      >
                        <Activity size={12} /> Open Monitor
                      </button>
                    ) : (
                      <button
                        className="wfs-button wfs-button-run"
                        style={{ height: 26, fontSize: 10.5 }}
                        onClick={() => handleStartWorkflow(item)}
                      >
                        <Play size={12} /> Run Workflow
                      </button>
                    )}
                    <button
                      className="wfs-button"
                      style={{ height: 26, fontSize: 10.5 }}
                      onClick={() => handleOpenProject(item.projectId)}
                    >
                      <ExternalLink size={12} /> Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="wfs-workflow-table" role="table">
          <div
            className="wfs-workflow-table-head"
            role="row"
            style={{ gridTemplateColumns: "minmax(220px, 1.2fr) 180px 140px 180px 1fr 140px 180px" }}
          >
            <span>Project</span>
            <span>Workflow</span>
            <span>Run Status</span>
            <span>Progress</span>
            <span>Current Stage & Agents</span>
            <span>Last Activity</span>
            <span>Actions</span>
          </div>
          {sorted.map((item) => {
            const run = item.activeRun;
            return (
              <div
                key={item.projectId}
                className="wfs-workflow-table-row"
                role="row"
                style={{ gridTemplateColumns: "minmax(220px, 1.2fr) 180px 140px 180px 1fr 140px 180px" }}
              >
                <button
                  className="wfs-workflow-main"
                  onClick={() => handleOpenProject(item.projectId, run?.id)}
                >
                  <span className="wfs-workflow-mark"><FolderGit2 size={15} /></span>
                  <span>
                    <strong>{item.projectName}</strong>
                    <small>{item.projectStatus}</small>
                  </span>
                </button>

                <div style={{ fontSize: 11 }}>
                  {item.workflowBinding ? (
                    <span>{item.workflowBinding.templateName}</span>
                  ) : (
                    <span style={{ color: "var(--muted-foreground)" }}>None</span>
                  )}
                </div>

                <div>
                  {run ? (
                    <span className={`wfs-badge ${run.status === "completed" ? "wfs-badge-published" : "wfs-badge-draft"}`}>
                      {statusLabel(run.status)}
                    </span>
                  ) : (
                    <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>No active run</span>
                  )}
                </div>

                <div>
                  {run ? (
                    <div style={{ display: "grid", gap: 3 }}>
                      <div className="wfs-portfolio-progress-bar" style={{ width: 100 }}>
                        <span style={{ width: `${run.progress}%` }} />
                      </div>
                      <span style={{ fontSize: 10 }}>{run.progress}% ({run.completedSteps}/{run.totalSteps})</span>
                    </div>
                  ) : item.latestRunSummary ? (
                    <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                      Last: {item.latestRunSummary.progress}%
                    </span>
                  ) : (
                    <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>-</span>
                  )}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                  {run?.currentStages.map((st) => (
                    <span key={st} className="wfs-stage-pill">{st}</span>
                  ))}
                  {run?.activeAgents.map((ag) => (
                    <span key={ag.id} className="wfs-agent-tag"><Bot size={10} />{ag.name}</span>
                  ))}
                  {!run && <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Idle</span>}
                </div>

                <time style={{ fontSize: 10 }}>{new Date(item.lastUpdatedAt).toLocaleTimeString()}</time>

                <div className="wfs-workflow-actions">
                  {run ? (
                    <button
                      className="wfs-button wfs-button-primary"
                      onClick={() => handleOpenProject(item.projectId, run.id)}
                    >
                      <Activity size={12} /> Monitor
                    </button>
                  ) : (
                    <button
                      className="wfs-button wfs-button-run"
                      onClick={() => handleStartWorkflow(item)}
                    >
                      <Play size={12} /> Run
                    </button>
                  )}
                  <button
                    className="wfs-button"
                    onClick={() => handleOpenProject(item.projectId)}
                  >
                    Open
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <RunWorkflowModal
        isOpen={runModalOpen}
        onClose={() => setRunModalOpen(false)}
        companyId={companyId}
        projects={items.map((i) => ({ id: i.projectId, name: i.projectName }))}
        workflows={workflows}
        initialProjectId={selectedProjectId}
        onRunStarted={(run) => {
          portfolioQuery.refresh();
          setRunModalOpen(false);
          handleOpenProject(run.projectId, run.id);
        }}
      />
    </div>
  );
}

export function ProjectPortfolioPage({ context }: PluginPageProps) {
  const companyId = context.companyId;
  const navigation = useHostNavigation();
  if (!companyId) return <ErrorState message="Open this page inside a Paperclip company." />;
  return (
    <div className="wfs-list-root">
      <style>{reactFlowStyles + studioStyles}</style>
      <ProjectPortfolioView
        companyId={companyId}
        onOpenTemplates={() => navigation.navigate("/workflows")}
        onOpenControlCenter={() => navigation.navigate("/workflows?view=control-center")}
      />
    </div>
  );
}

export function ProjectPortfolioSidebar() {
  return null;
}

function isLegacyWorkflowPlaceholderIssue(issue: PaperclipIssue): boolean {
  const origin = String((issue as any).originId ?? "");
  return (issue as any).originKind === "plugin:ai-company-workflow-studio"
    && origin.startsWith("workflow-run:")
    && !origin.includes(":task:")
    && !origin.includes(":coordinator:");
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
  const location = useHostLocation();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("");
  const [busy, setBusy] = useState(false);
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const searchParams = useMemo(() => new URLSearchParams(location?.search ?? ""), [location?.search]);
  const urlRun = searchParams.get("run");
  const urlSubtab = searchParams.get("subtab");
  const submitRequirement = searchParams.get("submitRequirement") === "1";

  const [subtab, setSubtab] = useState<"overview" | "tasks" | "monitor" | "history" | "deliverables">("overview");

  useEffect(() => {
    if (!submitRequirement) return;
    setRunModalOpen(true);
    // Opening the form is safe on navigation. Remove the intent so a hard
    // refresh never reopens it or starts anything implicitly.
    const url = new URL(window.location.href);
    url.searchParams.delete("submitRequirement");
    window.history.replaceState(window.history.state, "", url);
  }, [submitRequirement]);

  useEffect(() => {
    if (urlRun) {
      setSelectedRunId(urlRun);
      setSubtab("monitor");
    } else if (urlSubtab === "workflow" || urlSubtab === "monitor") {
      setSubtab("monitor");
    } else if (urlSubtab === "tasks") {
      setSubtab("tasks");
    } else if (urlSubtab === "history") {
      setSubtab("history");
    } else if (urlSubtab === "deliverables") {
      setSubtab("deliverables");
    }
  }, [urlRun, urlSubtab]);

  useEffect(() => {
    const first = projectData.data?.binding?.templateId ?? projectData.data?.workflows[0]?.id ?? "";
    if (!selectedWorkflowId && first) setSelectedWorkflowId(first);
  }, [projectData.data, selectedWorkflowId]);

  // Controlled polling when active run is running or waiting
  useEffect(() => {
    if (!projectData.data?.activeRun) return;
    const run = projectData.data.activeRun;
    if (run.status !== "running" && run.status !== "waiting_approval") return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        projectData.refresh();
      }
    }, 4000);
    return () => window.clearInterval(interval);
  }, [projectData.data?.activeRun?.status, projectData.refresh]);

  if (!companyId) return <ErrorState message="Open this tab inside a Paperclip company." />;
  if (projectData.loading && !projectData.data) return <div className="wfs-project-shell"><style>{studioStyles}</style><LoadingState /></div>;
  if (projectData.error) return <div className="wfs-project-shell"><style>{studioStyles}</style><ErrorState message={projectData.error.message} retry={projectData.refresh} /></div>;
  if (!projectData.data) return <div className="wfs-project-shell"><style>{studioStyles}</style><ErrorState message="Project workflow data is unavailable." /></div>;

  const { project, workflows, binding, monitor, activeRun, agents = [], issues = [], recentRuns = [] } = projectData.data;
  const issueNodes = binding?.workflow.nodes.filter((node) => node.data.kind === "task" || node.data.kind === "approval") ?? [];
  const assignedAgents = [...new Map(issueNodes.filter((node) => node.data.agentId).map((node) => [node.data.agentId!, node.data.agentName ?? "Agent"])).values()];
  const activeTaskMappings = (activeRun?.taskMappings ?? []).filter((mapping) => !mapping.isCoordinator);
  const businessTaskCount = activeRun
    ? activeTaskMappings.length
    : issues.filter((issue) => !isLegacyWorkflowPlaceholderIssue(issue) && !String((issue as any).originId ?? "").includes(":coordinator:")).length;
  const completed = activeRun
    ? activeTaskMappings.filter((mapping) => issues.find((issue) => issue.id === mapping.issueId)?.status === "done").length
    : monitor.filter((item) => item.stageStatus === "done" || item.issue?.status === "done").length;
  const published = binding?.workflow.status === "published";

  // Deliverables gathered from active run or recent runs
  const allArtifacts = [
    ...(activeRun?.artifacts ?? []),
    ...recentRuns.flatMap((r) => (r as any).artifacts ?? [])
  ];
  const deliverables = [...new Map(allArtifacts.map((a: WorkflowRunArtifact) => [a.name, a])).values()];

  const monitorBootstrap = useMemo(() => ({
    projects: project ? [project] : [],
    agents,
    issues,
    workflows,
    runs: recentRuns
  }), [project, agents, issues, workflows, recentRuns]);

  const monitorData = useMemo(() => {
    if (!binding) return null;
    return {
      workflow: binding.workflow,
      monitor
    };
  }, [binding, monitor]);

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
      toast({ title: "Workflow published", body: "The executable React Flow graph is ready. AI tasks will be created when the Product Owner starts a run.", tone: "success", ttlMs: 8000 });
    } catch (error) { toast({ title: "Workflow publish stopped", body: asMessage(error), tone: "error", ttlMs: 10000 }); }
    finally { setBusy(false); }
  };

  return (
    <div className="wfs-project-shell">
      <style>{reactFlowStyles + studioStyles}</style>
      <header className="wfs-project-head">
        <div>
          <h2>{project?.name ?? "Project"} Workflow & Live Monitor</h2>
          <p>Orchestrate the 8 AI agents, track real-time execution, and inspect delivery artifacts.</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className="wfs-button wfs-button-run"
            onClick={() => setRunModalOpen(true)}
            title="Giao yêu cầu mới cho AI Project Manager"
          >
            <Play size={14} /> Giao yêu cầu cho AI
          </button>
          <button className="wfs-button" onClick={() => navigation.navigate("/projects-portfolio")}>
            <Briefcase size={14} /> Projects Portfolio
          </button>
          <button className="wfs-button" onClick={() => navigation.navigate("/workflows?view=templates")}>
            <Settings2 size={14} /> Edit templates
          </button>
        </div>
      </header>

      {/* 5-Tab Bar */}
      <div className="wfs-tabs" role="tablist" style={{ marginBottom: 14 }}>
        <button className="wfs-tab" aria-selected={subtab === "overview"} onClick={() => setSubtab("overview")}>
          <LayoutDashboard size={13} style={{ marginRight: 5 }} /> Overview
        </button>
        <button className="wfs-tab" aria-selected={subtab === "tasks"} onClick={() => setSubtab("tasks")}>
          <ListTree size={13} style={{ marginRight: 5 }} /> Tasks ({businessTaskCount})
        </button>
        <button className="wfs-tab" aria-selected={subtab === "monitor"} onClick={() => setSubtab("monitor")}>
          <Activity size={13} style={{ marginRight: 5, color: activeRun ? "#10b981" : "inherit" }} />
          Live Workflow Monitor {activeRun && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block", marginLeft: 4 }} />}
        </button>
        <button className="wfs-tab" aria-selected={subtab === "history"} onClick={() => setSubtab("history")}>
          <History size={13} style={{ marginRight: 5 }} /> Run History ({recentRuns.length})
        </button>
        <button className="wfs-tab" aria-selected={subtab === "deliverables"} onClick={() => setSubtab("deliverables")}>
          <Package size={13} style={{ marginRight: 5 }} /> Deliverables ({deliverables.length})
        </button>
      </div>

      {/* Subtab 1: Overview */}
      {subtab === "overview" && (
        <div style={{ display: "grid", gap: 14 }}>
          {activeRun && (
            <section className="wfs-project-current" style={{ borderLeft: "4px solid #10b981", background: "color-mix(in srgb, #10b981 5%, var(--card, var(--background)))" }}>
              <div className="wfs-project-current-head">
                <div>
                  <span className="wfs-badge wfs-badge-published" style={{ textTransform: "uppercase" }}>
                    Active Run: {activeRun.status}
                  </span>
                  <h3 style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <Activity size={16} color="#10b981" /> {activeRun.id}
                  </h3>
                  <p>Initial Requirement: “{activeRun.inputRequirement}”</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="wfs-button wfs-button-primary"
                    onClick={() => {
                      setSelectedRunId(activeRun.id);
                      setSubtab("monitor");
                    }}
                  >
                    <Activity size={14} /> Open Live Monitor
                  </button>
                </div>
              </div>
            </section>
          )}

          {workflows.length === 0 ? (
            <div className="wfs-project-empty">
              <Workflow size={22} />
              <div>
                <strong>No workflow templates</strong>
                <p>Create a template once, then reuse it across any project.</p>
              </div>
              <button className="wfs-button wfs-button-primary" onClick={() => navigation.navigate("/workflows?view=templates")}>
                <Plus size={14} /> Create template
              </button>
            </div>
          ) : (
            <>
              <section className="wfs-project-picker">
                <label className="wfs-field">
                  <span>Workflow template</span>
                  <select value={selectedWorkflowId} disabled={published} onChange={(event) => setSelectedWorkflowId(event.target.value)}>
                    {workflows.map((workflow) => (
                      <option key={workflow.id} value={workflow.id}>{workflow.name}</option>
                    ))}
                  </select>
                </label>
                <button className="wfs-button wfs-button-primary" disabled={busy || published || !selectedWorkflowId} onClick={() => void attach()}>
                  {binding ? <RefreshCw size={14} /> : <Plus size={14} />}{binding ? "Change workflow" : "Use workflow"}
                </button>
              </section>

              {binding ? (
                <section className="wfs-project-current">
                  <div className="wfs-project-current-head">
                    <div>
                      <span className={`wfs-badge ${published ? "wfs-badge-published" : "wfs-badge-draft"}`}>
                        {published ? "Published" : "Saved"}
                      </span>
                      <h3>{binding.templateName}</h3>
                      <p>Reusable project workflow</p>
                    </div>
                    {!published && (
                      <button className="wfs-button wfs-button-primary" disabled={busy} onClick={() => void publish()}>
                        <Rocket size={14} /> Publish workflow
                      </button>
                    )}
                  </div>
                  <div className="wfs-project-stats">
                    <div><span>Steps</span><strong>{binding.workflow.nodes.length}</strong></div>
                    <div><span>Agents</span><strong>{assignedAgents.length}</strong></div>
                    <div><span>Tasks</span><strong>{businessTaskCount}</strong></div>
                    <div><span>Completed</span><strong>{completed}/{businessTaskCount}</strong></div>
                  </div>
                  <div className="wfs-project-agents">
                    {assignedAgents.map((agent) => (
                      <span key={agent}><Bot size={12} />{agent}</span>
                    ))}
                  </div>
                  <div className="wfs-project-flow">
                    {["Plan", "Architecture", "Build", "Review", "Test", "Deploy", "Approve"].map((step, index, steps) => (
                      <React.Fragment key={step}>
                        <span>{step}</span>
                        {index < steps.length - 1 && <ChevronRight size={12} />}
                      </React.Fragment>
                    ))}
                  </div>
                  {published && (
                    <div className="wfs-project-note">
                      <CheckCircle2 size={15} />
                      <span>Dependencies are active. Click "Run Project Workflow" to launch autonomous multi-agent execution.</span>
                    </div>
                  )}
                </section>
              ) : (
                <div className="wfs-project-empty">
                  <Workflow size={22} />
                  <div>
                    <strong>No workflow selected</strong>
                    <p>Select a template above. Paperclip will create a separate project copy, so the shared template remains reusable.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Subtab 2: flat AI execution task list; no parent/child model is imposed. */}
      {subtab === "tasks" && (
        <ProjectTaskListView
          issues={issues}
          agents={agents}
          projects={project ? [project] : []}
          monitor={monitor}
          activeRun={activeRun}
          workflow={binding?.workflow}
          onOpenIssue={(id) => navigation.navigate(`/issues/${id}`)}
          onRunProject={() => setRunModalOpen(true)}
        />
      )}

      {/* Subtab 3: Live Monitor */}
      {subtab === "monitor" && (
        <div style={{ height: "calc(100vh - 220px)", minHeight: 620, border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", position: "relative" }}>
          {binding && monitorData ? (
            <ReactFlowProvider>
              <MonitorCanvas
                bootstrap={monitorBootstrap}
                data={monitorData}
                refresh={projectData.refresh}
                companyId={companyId}
                runId={selectedRunId ?? activeRun?.id ?? recentRuns[0]?.id ?? null}
                onSelectRun={(rId) => setSelectedRunId(rId)}
              />
            </ReactFlowProvider>
          ) : (
            <div className="wfs-project-empty" style={{ height: "100%" }}>
              <Activity size={24} />
              <div>
                <strong>No workflow attached</strong>
                <p>Attach a workflow template on the Overview tab or start a Run to monitor live execution.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subtab 4: Run History */}
      {subtab === "history" && (
        <RunHistoryView
          runs={recentRuns}
          onInspectRun={(wfId: string, rId: string) => {
            setSelectedRunId(rId);
            setSubtab("monitor");
          }}
          onClearHistory={async () => { projectData.refresh(); }}
        />
      )}

      {/* Subtab 5: Deliverables */}
      {subtab === "deliverables" && (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 14 }}>Project Deliverables & Artifacts</h3>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{deliverables.length} item(s)</span>
          </div>
          {deliverables.length === 0 ? (
            <div className="wfs-project-empty">
              <Package size={24} />
              <div>
                <strong>No deliverables recorded yet</strong>
                <p>Deliverables, git commits, code files, and documentation generated by AI agents will appear here automatically.</p>
              </div>
            </div>
          ) : (
            <div className="wfs-artifacts-list">
              {deliverables.map((item) => (
                <div key={item.id} className="wfs-artifact-card">
                  <div className="wfs-artifact-icon">
                    {item.type === "commit" ? <GitBranch size={16} /> : item.type === "document" ? <FileText size={16} /> : <FileCode size={16} />}
                  </div>
                  <div className="wfs-artifact-info">
                    <strong>{item.name}</strong>
                    <small>{item.description || item.type}</small>
                    <time style={{ fontSize: 9.5, color: "var(--muted-foreground)" }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </time>
                  </div>
                  {item.url && (
                    <a className="wfs-button" style={{ height: 26, fontSize: 10.5 }} href={item.url} target="_blank" rel="noreferrer">
                      <ExternalLink size={12} /> Open Artifact
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <RunWorkflowModal
        isOpen={runModalOpen}
        onClose={() => setRunModalOpen(false)}
        companyId={companyId}
        projects={project ? [project] : []}
        workflows={workflows}
        initialProjectId={projectId}
        initialWorkflowId={binding?.templateId ?? workflows[0]?.id}
        onRunStarted={(run) => {
          projectData.refresh();
          setSelectedRunId(run.id);
          setSubtab("monitor");
        }}
      />
    </div>
  );
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
