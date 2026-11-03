import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Issue, Project } from "@paperclipai/shared";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  FileCode,
  ListChecks,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCw,
  Search,
  Square,
  Terminal,
  WifiOff,
  Workflow as WorkflowIcon,
  X,
  XCircle,
} from "lucide-react";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../api/client";
import { agentsApi } from "../api/agents";
import { issuesApi } from "../api/issues";
import { useToastActions } from "../context/ToastContext";
import { queryKeys } from "../lib/queryKeys";
import {
  computeWorkflowRunProgress,
  mapNodeExecutionStatus,
  MANUAL_TASK_LABEL,
  type NormalizedNodeStatus,
  type ProjectWorkflowSnapshot,
  type ProjectTaskRow,
  isProjectRequirement,
} from "../lib/project-operations";

const WORKFLOW_TAB = "plugin:ai-company-workflow-studio:project-workflow-tab";

interface WorkflowRunRecord {
  id: string;
  status: "running" | "paused" | "completed" | "failed" | "stopped" | "cancelled" | "waiting_approval";
  projectId: string;
  workflowId: string;
  startedAt: string;
  finishedAt: string | null;
  inputRequirement: string;
  nodeExecutionStates: Record<string, {
    nodeId: string;
    title: string;
    status: string;
    kind?: string;
    agentId?: string | null;
    agentName?: string | null;
    agentRole?: string | null;
    issueIdentifier?: string | null;
    startedAt?: string | null;
    finishedAt?: string | null;
    error?: string | null;
    lastGateReason?: string | null;
    retryCount?: number;
  }>;
  executionHistory: Array<{
    id: string;
    level: "info" | "warn" | "action" | "error" | "approval";
    nodeId?: string;
    agentId?: string;
    issueId?: string;
    message: string;
    timestamp: string;
  }>;
  taskMappings?: Array<{ issueId: string; workflowNodeId: string; stageId: string; isCoordinator?: boolean }>;
  workflowSnapshot?: {
    nodes: Array<{
      id: string;
      data: {
        kind: string;
        title: string;
        model?: string | null;
        agentId?: string | null;
        agentName?: string | null;
        agentRole?: string | null;
        description?: string;
        issueIdentifier?: string | null;
      };
      position?: { x: number; y: number };
    }>;
    edges: Array<{ id: string; source: string; target: string }>;
  };
}

interface WorkspaceFileInfo {
  path: string;
  name: string;
  size: number;
  modified_at: number;
  status: "new" | "modified" | "unchanged";
  agent: string;
  is_new: boolean;
  is_modified: boolean;
}

function formattedDuration(startedAt: string | null | undefined, finishedAt?: string | null | undefined, nowTs?: number): string {
  if (!startedAt) return "--:--";
  const start = new Date(startedAt).getTime();
  if (Number.isNaN(start)) return "--:--";
  const end = finishedAt ? new Date(finishedAt).getTime() : (nowTs ?? Date.now());
  const elapsedSec = Math.max(0, Math.floor((end - start) / 1000));
  const m = Math.floor(elapsedSec / 60);
  const s = elapsedSec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formattedDateTime(value: string | Date | null | undefined): string {
  if (!value) return "Chưa có";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Chưa có" : date.toLocaleString("vi-VN");
}

function issueHref(row: { id: string; identifier: string | null }) {
  return `/issues/${row.identifier ?? row.id}`;
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    backlog: "Chờ", todo: "Sẵn sàng", in_progress: "Đang làm", in_review: "Chờ duyệt",
    blocked: "Bị chặn", done: "Hoàn thành", cancelled: "Đã hủy",
  };
  return labels[status] ?? status;
}

export function ProjectOperationsView({
  project,
  companyId,
  projectRef,
  mode,
}: {
  project: Project;
  companyId: string;
  projectRef: string;
  mode: "overview" | "tasks";
}) {
  const queryClient = useQueryClient();
  const { pushToast } = useToastActions();

  // Polling clock for elapsed seconds
  const [nowTs, setNowTs] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNowTs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // UI state for overview
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [followRunning, setFollowRunning] = useState(true);
  const [copiedRunId, setCopiedRunId] = useState(false);
  const [logFilter, setLogFilter] = useState<"all" | "error" | "action">("all");
  const [logAgentFilter, setLogAgentFilter] = useState<string>("");
  const [autoScrollLogs, setAutoScrollLogs] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const runningNodeRef = useRef<HTMLDivElement>(null);

  // UI state for tasks
  const [manualOpen, setManualOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualAgentId, setManualAgentId] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [taskAgentFilter, setTaskAgentFilter] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("");
  const [taskSort, setTaskSort] = useState<"newest" | "oldest" | "title">("newest");
  const [taskGrouped, setTaskGrouped] = useState(true);

  const workflowHref = `/projects/${projectRef}?tab=${encodeURIComponent(WORKFLOW_TAB)}`;
  const monitorHref = `${workflowHref}&subtab=monitor`;
  const submitHref = `${workflowHref}&submitRequirement=1`;

  // 1. Fetch project workflow binding & recent runs (2s polling)
  const workflowQuery = useQuery({
    queryKey: ["project-operations-workflow", companyId, project.id],
    queryFn: async () => {
      const result = await api.post<{ data: ProjectWorkflowSnapshot }>(
        "/plugins/ai-company-workflow-studio/data/project-workflow",
        { companyId, params: { companyId, projectId: project.id } },
      );
      return result.data;
    },
    refetchInterval: 2000,
    retry: 2,
  });

  const activeRunId = workflowQuery.data?.activeRun?.id ?? workflowQuery.data?.recentRuns?.[0]?.id ?? null;

  // 2. Fetch full active workflow run record (2s polling)
  const runQuery = useQuery({
    queryKey: ["workflow-run-detail", companyId, activeRunId],
    queryFn: async () => {
      if (!activeRunId) return null;
      const res = await api.post<{ data: { run: WorkflowRunRecord } }>(
        "/plugins/ai-company-workflow-studio/data/workflow-run",
        { companyId, params: { companyId, runId: activeRunId } },
      );
      return res.data.run;
    },
    enabled: Boolean(activeRunId),
    refetchInterval: 2000,
    retry: 2,
  });

  // 3. Fetch workspace tree files for node-to-file attribution
  const workspaceFilesQuery = useQuery({
    queryKey: ["project-workspace-tree", project.id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${project.id}/workspace/tree`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.files ?? []) as WorkspaceFileInfo[];
    },
    refetchInterval: 5000,
  });

  // 4. Fetch company agents
  const { data: agents = [] } = useQuery({
    queryKey: queryKeys.agents.list(companyId),
    queryFn: () => agentsApi.list(companyId),
  });

  // 5. Fetch project issues
  const { data: issues = [] } = useQuery({
    queryKey: queryKeys.issues.listByProject(companyId, project.id),
    queryFn: () => issuesApi.listAll(companyId, { projectId: project.id }),
    refetchInterval: 5000,
  });

  const binding = workflowQuery.data?.binding ?? null;
  const run = runQuery.data ?? null;
  const isDisconnected = workflowQuery.isError || (Boolean(activeRunId) && runQuery.isError);

  // Workflow template definition (nodes + edges)
  const workflowDefinition = run?.workflowSnapshot ?? binding?.workflow ?? { nodes: [], edges: [] };
  const rawNodes = workflowDefinition.nodes ?? [];
  const rawEdges = workflowDefinition.edges ?? [];
  const nodeStates = run?.nodeExecutionStates ?? {};

  // Compute progress strictly from template nodes
  const progressStats = useMemo(() => {
    return computeWorkflowRunProgress(rawNodes, nodeStates);
  }, [rawNodes, nodeStates]);

  // Find active running nodes for auto-follow and agent count
  const runningNodeIds = useMemo(() => {
    return Object.entries(nodeStates)
      .filter(([, state]) => mapNodeExecutionStatus(state) === "running")
      .map(([id]) => id);
  }, [nodeStates]);

  // Auto-follow: scroll to the first running node when it changes
  useEffect(() => {
    if (followRunning && runningNodeRef.current) {
      runningNodeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [runningNodeIds, followRunning]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (autoScrollLogs && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [run?.executionHistory, autoScrollLogs]);

  // Action dispatcher
  const executeRunAction = async (actionName: string, extraParams: Record<string, unknown> = {}) => {
    if (!activeRunId) return;
    setActionBusy(true);
    try {
      await api.post(`/plugins/ai-company-workflow-studio/actions/${actionName}`, {
        companyId,
        params: { companyId, runId: activeRunId, ...extraParams },
      });
      void workflowQuery.refetch();
      void runQuery.refetch();
      pushToast({ title: "Thành công", tone: "success" });
    } catch (err: any) {
      pushToast({ title: "Thao tác thất bại", body: err.message, tone: "error" });
    } finally {
      setActionBusy(false);
    }
  };

  // Node inspection details
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const templateNode = rawNodes.find((n) => n.id === selectedNodeId);
    const executionState = nodeStates[selectedNodeId] ?? null;
    return {
      id: selectedNodeId,
      template: templateNode,
      execution: executionState,
      status: mapNodeExecutionStatus(executionState),
    };
  }, [selectedNodeId, rawNodes, nodeStates]);

  // Files modified/created by selected node's agent
  const selectedNodeFiles = useMemo(() => {
    if (!selectedNode) return [];
    const agentName = selectedNode.execution?.agentName ?? selectedNode.template?.data.agentName ?? "";
    if (!agentName) return [];
    return (workspaceFilesQuery.data ?? []).filter((f) => f.agent.toLowerCase() === agentName.toLowerCase());
  }, [selectedNode, workspaceFilesQuery.data]);

  // Node-specific logs
  const selectedNodeLogs = useMemo(() => {
    if (!selectedNodeId || !run?.executionHistory) return [];
    return run.executionHistory.filter((entry) => entry.nodeId === selectedNodeId);
  }, [selectedNodeId, run?.executionHistory]);

  // Items needing user attention (Failed nodes, Waiting approval, Blocked)
  const attentionItems = useMemo(() => {
    const items: Array<{
      nodeId: string;
      title: string;
      type: "failed" | "approval" | "blocked";
      reason: string;
      agentName?: string | null;
      canRetry?: boolean;
    }> = [];

    for (const [nodeId, st] of Object.entries(nodeStates)) {
      const status = mapNodeExecutionStatus(st);
      if (status === "failed") {
        items.push({
          nodeId,
          title: st.title || nodeId,
          type: "failed",
          reason: st.error || st.lastGateReason || "Bước này gặp lỗi thực thi.",
          agentName: st.agentName,
          canRetry: true,
        });
      } else if (status === "waiting_approval") {
        items.push({
          nodeId,
          title: st.title || nodeId,
          type: "approval",
          reason: "Cần bạn phê duyệt để tiếp tục bước tiếp theo.",
          agentName: st.agentName,
        });
      } else if (status === "blocked") {
        items.push({
          nodeId,
          title: st.title || nodeId,
          type: "blocked",
          reason: st.lastGateReason || "Bước này đang bị chặn bởi điều kiện trước.",
          agentName: st.agentName,
        });
      }
    }
    return items;
  }, [nodeStates]);

  // Agent strip data
  const agentStripList = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      role: string;
      status: "running" | "waiting" | "done" | "error";
      currentTask: string;
      duration: string;
      tokenCost: string;
    }> = [];

    const nodeAgentsMap = new Map<string, { role: string; nodeId: string; status: NormalizedNodeStatus; title: string; startedAt?: string | null; finishedAt?: string | null }>();

    for (const node of rawNodes) {
      const name = node.data.agentName;
      if (!name) continue;
      const st = nodeStates[node.id];
      const normalizedStatus = mapNodeExecutionStatus(st);
      nodeAgentsMap.set(name, {
        role: node.data.agentRole || "AI Specialist",
        nodeId: node.id,
        status: normalizedStatus,
        title: node.data.title,
        startedAt: st?.startedAt,
        finishedAt: st?.finishedAt,
      });
    }

    for (const [name, info] of nodeAgentsMap.entries()) {
      let agentDisplayStatus: "running" | "waiting" | "done" | "error" = "waiting";
      if (info.status === "running") agentDisplayStatus = "running";
      else if (info.status === "failed" || info.status === "blocked") agentDisplayStatus = "error";
      else if (info.status === "done") agentDisplayStatus = "done";

      list.push({
        id: name,
        name,
        role: info.role,
        status: agentDisplayStatus,
        currentTask: info.title,
        duration: formattedDuration(info.startedAt, info.finishedAt, nowTs),
        tokenCost: "$0.02 - $0.05",
      });
    }

    return list;
  }, [rawNodes, nodeStates, nowTs]);

  // Filtered live logs
  const filteredLogs = useMemo(() => {
    if (!run?.executionHistory) return [];
    return run.executionHistory.filter((entry) => {
      if (logFilter === "error" && entry.level !== "error") return false;
      if (logFilter === "action" && entry.level !== "action") return false;
      if (logAgentFilter && entry.agentId !== logAgentFilter) return false;
      return true;
    });
  }, [run?.executionHistory, logFilter, logAgentFilter]);

  // Tasks view handling
  const createManualTask = useMutation({
    mutationFn: async () => {
      if (!manualTitle.trim() || !manualAgentId) throw new Error("Nhập tên Task và chọn Agent.");
      const labels = await issuesApi.listLabels(companyId);
      const label = labels.find((item) => item.name === MANUAL_TASK_LABEL) ??
        await issuesApi.createLabel(companyId, { name: MANUAL_TASK_LABEL, color: "#3B82F6" });
      return issuesApi.create(companyId, {
        projectId: project.id,
        title: manualTitle.trim(),
        description: manualDescription.trim() || null,
        assigneeAgentId: manualAgentId,
        status: "todo",
        labelIds: [label.id],
        idempotencyKey: crypto.randomUUID(),
      });
    },
    onSuccess: (issue) => {
      setManualOpen(false);
      setManualTitle("");
      setManualDescription("");
      setManualAgentId("");
      void queryClient.invalidateQueries({ queryKey: queryKeys.issues.listByProject(companyId, project.id) });
      pushToast({ title: "Đã thêm Task thủ công", tone: "success", action: { label: "Mở Task", href: issueHref(issue) } });
    },
  });

  const visibleTasks = useMemo(() => {
    return issues.filter((issue) => {
      const text = `${issue.title} ${issue.identifier ?? ""}`.toLowerCase();
      return text.includes(taskSearch.toLowerCase()) &&
        (!taskAgentFilter || issue.assigneeAgentId === taskAgentFilter) &&
        (!taskStatusFilter || issue.status === taskStatusFilter);
    }).sort((a, b) => taskSort === "title" ? a.title.localeCompare(b.title)
      : (new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()) * (taskSort === "oldest" ? -1 : 1));
  }, [issues, taskSearch, taskAgentFilter, taskStatusFilter, taskSort]);

  const copyRunId = () => {
    if (!activeRunId) return;
    navigator.clipboard.writeText(activeRunId);
    setCopiedRunId(true);
    setTimeout(() => setCopiedRunId(false), 2000);
  };

  /* ───────────────────────────────────────────────────────────────────────── */
  /* MODE: TASKS                                                               */
  /* ───────────────────────────────────────────────────────────────────────── */
  if (mode === "tasks") {
    return (
      <div className="space-y-5" data-testid="project-tasks">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Công việc AI thực hiện</h3>
            <p className="text-sm text-muted-foreground">Task do AI tạo và Task thủ công được phân công theo Workflow.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setManualOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />Thêm Task thủ công
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-48 flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="Tìm Task…" value={taskSearch} onChange={(e) => setTaskSearch(e.target.value)} />
          </div>
          <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={taskAgentFilter} onChange={(e) => setTaskAgentFilter(e.target.value)}>
            <option value="">Tất cả Agent</option>
            {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={taskStatusFilter} onChange={(e) => setTaskStatusFilter(e.target.value)}>
            <option value="">Mọi trạng thái</option>
            {["todo", "in_progress", "blocked", "in_review", "done"].map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
          <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={taskSort} onChange={(e) => setTaskSort(e.target.value as typeof taskSort)}>
            <option value="newest">Cập nhật gần nhất</option>
            <option value="oldest">Cập nhật cũ nhất</option>
            <option value="title">Theo tên</option>
          </select>
        </div>

        {visibleTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
            <ListChecks className="mx-auto h-7 w-7 text-muted-foreground" />
            <h3 className="mt-3 font-semibold">Chưa có công việc nào</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">Các Task do AI sinh ra sẽ hiển thị ở đây khi Workflow được kích hoạt.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="hidden grid-cols-[minmax(14rem,2fr)_minmax(8rem,1fr)_7rem_7rem_8rem] gap-2 border-b border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-muted-foreground md:grid">
              <span>Task</span><span>Agent phụ trách</span><span>Trạng thái</span><span>Mã Task</span><span>Cập nhật</span>
            </div>
            {visibleTasks.map((issue) => (
              <div key={issue.id} className="grid gap-2 border-b border-border/60 px-3 py-3 text-sm last:border-b-0 md:grid-cols-[minmax(14rem,2fr)_minmax(8rem,1fr)_7rem_7rem_8rem] md:items-center hover:bg-muted/30">
                <Link to={issueHref(issue)} className="min-w-0 font-medium text-foreground hover:text-primary hover:underline truncate">
                  {issue.title}
                </Link>
                <span className="truncate text-muted-foreground">
                  {agents.find((a) => a.id === issue.assigneeAgentId)?.name ?? "Chưa phân công"}
                </span>
                <span>{statusLabel(issue.status)}</span>
                <span className="text-xs font-mono text-muted-foreground">{issue.identifier ?? issue.id.slice(0, 8)}</span>
                <span className="text-xs text-muted-foreground">{formattedDateTime(issue.updatedAt)}</span>
              </div>
            ))}
          </div>
        )}

        <Dialog open={manualOpen} onOpenChange={setManualOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Thêm Task thủ công</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">Task được thêm vào dự án và không làm thay đổi cấu trúc Workflow.</p>
            <div className="space-y-3">
              <Input placeholder="Tên Task" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} />
              <Textarea placeholder="Mô tả công việc" value={manualDescription} onChange={(e) => setManualDescription(e.target.value)} />
              <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={manualAgentId} onChange={(e) => setManualAgentId(e.target.value)}>
                <option value="">Chọn Agent phụ trách</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setManualOpen(false)}>Hủy</Button>
              <Button disabled={!manualTitle.trim() || !manualAgentId || createManualTask.isPending} onClick={() => createManualTask.mutate()}>
                {createManualTask.isPending ? "Đang thêm…" : "Thêm Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  /* ───────────────────────────────────────────────────────────────────────── */
  /* MODE: OVERVIEW (TRUNG TÂM GIÁM SÁT THỜI GIAN THỰC)                       */
  /* ───────────────────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6" data-testid="project-overview">
      {/* ── Disconnected Reconnect Banner ── */}
      {isDisconnected && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-400">
          <WifiOff className="h-4 w-4 shrink-0 motion-safe:animate-pulse" />
          <span className="font-medium">Mất kết nối với máy chủ, đang tự động thử lại...</span>
        </div>
      )}

      {/* ── Empty state: No active run and no workflow ── */}
      {!binding && !run && (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <WorkflowIcon className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <h3 className="mt-3 text-base font-semibold">Chưa có lượt chạy Workflow nào đang hoạt động</h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
            Bắt đầu giao yêu cầu cho AI hoặc gán một Workflow template cho dự án để theo dõi quy trình tự động.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Button size="sm" asChild>
              <Link to={submitHref}><Plus className="mr-1.5 h-4 w-4" />Giao yêu cầu cho AI</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link to={workflowHref}>Quản lý Workflow</Link>
            </Button>
          </div>
        </div>
      )}

      {/* ── Section A: Run Status Bar ── */}
      {run && (
        <section className="rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5" aria-label="Thanh trạng thái run">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Run ID & Status */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-mono">
                <span className="text-muted-foreground">RUN:</span>
                <span className="font-semibold text-foreground">{run.id}</span>
                <button
                  type="button"
                  onClick={copyRunId}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                  title="Sao chép Run ID"
                  aria-label="Sao chép Run ID"
                >
                  {copiedRunId ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>

              {/* Status Pill */}
              <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium">
                {run.status === "running" ? (
                  <span className="inline-flex items-center gap-1.5 text-blue-500 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                    <span className="h-2 w-2 rounded-full bg-blue-500 motion-safe:animate-pulse" />
                    Đang chạy
                  </span>
                ) : run.status === "paused" ? (
                  <span className="inline-flex items-center gap-1.5 text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Tạm dừng
                  </span>
                ) : run.status === "completed" ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" />
                    Hoàn thành
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full">
                    <XCircle className="h-3 w-3" />
                    {run.status === "waiting_approval" ? "Chờ duyệt" : "Lỗi"}
                  </span>
                )}
              </div>
            </div>

            {/* Metrics: Progress, Active Agents, Real Elapsed Timer */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
              {/* Progress derived from template nodes count */}
              <div className="flex items-center gap-2">
                <span>Tiến độ:</span>
                <span className="font-semibold text-foreground tabular-nums">
                  {progressStats.completedNodes}/{progressStats.totalNodes} node ({progressStats.percent}%)
                </span>
                <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${progressStats.percent}%` }}
                  />
                </div>
              </div>

              {/* Running Agents Count */}
              <div>
                <span>Agent đang chạy:</span>{" "}
                <span className="font-semibold text-foreground tabular-nums">{runningNodeIds.length}</span>
              </div>

              {/* Real-time Seconds Elapsed Timer */}
              <div className="flex items-center gap-1.5 font-mono">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-semibold text-foreground tabular-nums">
                  {formattedDuration(run.startedAt, run.finishedAt, nowTs)}
                </span>
              </div>
            </div>

            {/* Run Actions Toolbar */}
            <div className="flex items-center gap-2">
              {run.status === "running" && (
                <Button size="sm" variant="outline" disabled={actionBusy} onClick={() => executeRunAction("pause-workflow-run")}>
                  <Pause className="mr-1 h-3.5 w-3.5" />Tạm dừng
                </Button>
              )}
              {run.status === "paused" && (
                <Button size="sm" variant="default" disabled={actionBusy} onClick={() => executeRunAction("resume-workflow-run")}>
                  <Play className="mr-1 h-3.5 w-3.5" />Tiếp tục
                </Button>
              )}
              {(run.status === "running" || run.status === "paused") && (
                <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" disabled={actionBusy} onClick={() => executeRunAction("stop-workflow-run")}>
                  <Square className="mr-1 h-3.5 w-3.5" />Dừng
                </Button>
              )}
              <Button size="sm" variant="outline" asChild>
                <Link to={monitorHref}>
                  <ExternalLink className="mr-1 h-3.5 w-3.5" />Mở Live Monitor
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── Section E: Cần bạn xử lý (Needs Attention) ── */}
      {/* ONLY rendered when there are approvals, errors, or blocked nodes. Hidden otherwise. */}
      {attentionItems.length > 0 && (
        <section className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 sm:p-5 shadow-xs" aria-label="Cần bạn xử lý">
          <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Cần bạn xử lý ({attentionItems.length})</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {attentionItems.map((item) => (
              <div
                key={item.nodeId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-background/80 p-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{item.title}</span>
                    <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-destructive">
                      {item.type === "failed" ? "Lỗi thực thi" : item.type === "approval" ? "Chờ duyệt" : "Bị chặn"}
                    </span>
                    {item.agentName && <span className="text-muted-foreground font-mono">({item.agentName})</span>}
                  </div>
                  <p className="text-muted-foreground">{item.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  {item.type === "failed" && item.canRetry && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs h-7"
                      disabled={actionBusy}
                      onClick={() => executeRunAction("retry-failed-step", { nodeId: item.nodeId })}
                    >
                      <RotateCw className="mr-1 h-3 w-3" />Thử lại bước này
                    </Button>
                  )}
                  {item.type === "approval" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7"
                        disabled={actionBusy}
                        onClick={() => executeRunAction("decide-run-approval", { nodeId: item.nodeId, decision: "approve" })}
                      >
                        <Check className="mr-1 h-3 w-3" />Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        disabled={actionBusy}
                        onClick={() => executeRunAction("decide-run-approval", { nodeId: item.nodeId, decision: "reject" })}
                      >
                        Từ chối
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-7 text-primary hover:underline"
                    onClick={() => setSelectedNodeId(item.nodeId)}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Section B: Đồ thị Workflow thu nhỏ (Mini Workflow Graph) ── */}
      {rawNodes.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs" aria-label="Đồ thị Workflow">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <WorkflowIcon className="h-4 w-4 text-primary" />
                Đồ thị quy trình ({binding?.templateName ?? "Workflow"})
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cập nhật thời gian thực theo từng node của workflow template. Bấm vào node để xem ngăn chi tiết.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={followRunning}
                  onChange={(e) => setFollowRunning(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                Theo dõi (Follow)
              </label>
            </div>
          </div>

          {/* Graph Nodes Canvas */}
          <div className="relative overflow-x-auto pb-4 pt-2">
            <div className="flex items-center gap-3 min-w-max px-2">
              {rawNodes.map((node, index) => {
                const st = nodeStates[node.id];
                const status = mapNodeExecutionStatus(st);
                const isRunning = status === "running";
                const isFailed = status === "failed";
                const isDone = status === "done";
                const isApproval = status === "waiting_approval";
                const isSelected = selectedNodeId === node.id;
                const nodeTitle = node.data?.title || node.id;
                const agentName = node.data?.agentName || st?.agentName;

                // Find latest log for this node
                const nodeLatestLog = run?.executionHistory
                  ?.filter((entry) => entry.nodeId === node.id)
                  ?.slice(-1)[0]?.message;

                return (
                  <React.Fragment key={node.id}>
                    {/* Node Box */}
                    <div
                      ref={isRunning ? runningNodeRef : undefined}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`relative flex flex-col justify-between w-52 min-h-[92px] rounded-lg border p-3 cursor-pointer transition-all duration-200 select-none ${
                        isRunning
                          ? "border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.4)] motion-safe:animate-pulse ring-2 ring-blue-500/40"
                          : isFailed
                          ? "border-red-500 bg-red-500/10 shadow-[0_0_12px_rgba(239,68,68,0.3)] ring-1 ring-red-500/40"
                          : isDone
                          ? "border-emerald-500/60 bg-emerald-500/5 text-foreground hover:border-emerald-500"
                          : isApproval
                          ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/40"
                          : "border-border/70 bg-card/60 text-muted-foreground/80 hover:border-border hover:text-foreground"
                      } ${isSelected ? "ring-2 ring-primary" : ""}`}
                    >
                      {/* Node Top Header */}
                      <div className="flex items-center justify-between gap-1 text-[11px] mb-1">
                        <span className="font-semibold uppercase tracking-wider text-[10px] text-muted-foreground truncate">
                          {node.data?.kind || "task"}
                        </span>
                        {/* Status Icon / Duration */}
                        <div className="flex items-center gap-1 font-mono text-[10px]">
                          {isDone && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                          {isRunning && <span className="h-2 w-2 rounded-full bg-blue-500 motion-safe:animate-pulse" />}
                          {isFailed && <XCircle className="h-3 w-3 text-red-500" />}
                          {isApproval && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                          <span className="text-muted-foreground tabular-nums">
                            {formattedDuration(st?.startedAt, st?.finishedAt, nowTs)}
                          </span>
                        </div>
                      </div>

                      {/* Node Title */}
                      <div className="font-medium text-xs text-foreground truncate" title={nodeTitle}>
                        {nodeTitle}
                      </div>

                      {/* Agent & Identifier */}
                      <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="truncate max-w-[120px]">{agentName || "System"}</span>
                        {st?.issueIdentifier && (
                          <span className="font-mono bg-muted/60 px-1 rounded">{st.issueIdentifier}</span>
                        )}
                      </div>

                      {/* Running Agent Latest Log Line */}
                      {isRunning && nodeLatestLog && (
                        <div className="mt-1.5 border-t border-blue-500/20 pt-1 text-[10px] text-blue-600 dark:text-blue-400 truncate" title={nodeLatestLog}>
                          {nodeLatestLog}
                        </div>
                      )}

                      {/* Failed Reason */}
                      {isFailed && st?.error && (
                        <div className="mt-1.5 border-t border-red-500/20 pt-1 text-[10px] text-red-600 dark:text-red-400 truncate" title={st.error}>
                          {st.error}
                        </div>
                      )}

                      {/* Approval Action on Node */}
                      {isApproval && (
                        <div className="mt-2 pt-1 border-t border-amber-500/20 flex gap-1">
                          <Button
                            size="sm"
                            className="h-5 px-2 text-[10px] bg-amber-600 hover:bg-amber-700 text-white w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              void executeRunAction("decide-run-approval", { nodeId: node.id, decision: "approve" });
                            }}
                          >
                            Duyệt ngay
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Edge Connector */}
                    {index < rawNodes.length - 1 && (
                      <div className="flex items-center justify-center shrink-0 w-6">
                        <div
                          className={`h-0.5 w-6 ${
                            isRunning
                              ? "border-t-2 border-dashed border-blue-500 motion-safe:animate-pulse"
                              : isDone
                              ? "bg-emerald-500/70"
                              : "bg-border"
                          }`}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Section C: Dải "Agent" (Agent Strip) ── */}
      {agentStripList.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs" aria-label="Dải Agent">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              Đội ngũ AI Agents tham gia ({agentStripList.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground">
                  <th className="py-2 px-3 font-semibold">Trạng thái</th>
                  <th className="py-2 px-3 font-semibold">Agent</th>
                  <th className="py-2 px-3 font-semibold">Vai trò</th>
                  <th className="py-2 px-3 font-semibold">Nhiệm vụ hiện tại</th>
                  <th className="py-2 px-3 font-semibold">Thời gian</th>
                  <th className="py-2 px-3 font-semibold">Chi phí Token</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {agentStripList.map((agent) => (
                  <tr key={agent.id} className="hover:bg-muted/20">
                    <td className="py-2.5 px-3">
                      {agent.status === "running" ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 motion-safe:animate-pulse" />
                          Đang chạy
                        </span>
                      ) : agent.status === "done" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
                          <Check className="h-3 w-3" />
                          Xong
                        </span>
                      ) : agent.status === "error" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-medium">
                          <X className="h-3 w-3" />
                          Lỗi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          Chờ
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-foreground">{agent.name}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{agent.role}</td>
                    <td className="py-2.5 px-3 font-medium">{agent.currentTask}</td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-muted-foreground">{agent.duration}</td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground">{agent.tokenCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Section D: Log Trực Tiếp (Live Logs Stream) ── */}
      {run && (
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs" aria-label="Log trực tiếp">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Log thực thi trực tiếp</h3>
              <span className="text-xs text-muted-foreground">({filteredLogs.length} dòng)</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Pills */}
              <div className="flex rounded-md border border-border bg-muted/40 p-0.5 text-xs">
                {(["all", "error", "action"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setLogFilter(filter)}
                    className={`px-2.5 py-1 rounded capitalize ${
                      logFilter === filter ? "bg-background font-semibold text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {filter === "all" ? "Tất cả" : filter === "error" ? "Lỗi" : "Tool call"}
                  </button>
                ))}
              </div>

              {/* Agent Filter */}
              <select
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                value={logAgentFilter}
                onChange={(e) => setLogAgentFilter(e.target.value)}
              >
                <option value="">Tất cả Agent</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>

              {/* Auto Scroll Toggle */}
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => setAutoScrollLogs((current) => !current)}
              >
                {autoScrollLogs ? "Tạm dừng cuộn" : "Tiếp tục cuộn"}
              </Button>
            </div>
          </div>

          {/* Logs Terminal Box */}
          <div
            ref={logContainerRef}
            className="h-64 overflow-y-auto rounded-lg border border-border/80 bg-zinc-950 p-3 font-mono text-xs text-zinc-100 select-text"
          >
            {filteredLogs.length === 0 ? (
              <p className="text-zinc-500 py-4 text-center">Chưa có bản ghi log nào phù hợp bộ lọc.</p>
            ) : (
              filteredLogs.map((entry) => (
                <div key={entry.id} className="py-1 flex items-start gap-2 border-b border-zinc-900/60 last:border-b-0">
                  <span className="text-[10px] text-zinc-500 shrink-0 select-none">
                    {new Date(entry.timestamp).toLocaleTimeString("vi-VN")}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase shrink-0 ${
                      entry.level === "error"
                        ? "bg-red-500/20 text-red-400"
                        : entry.level === "warn"
                        ? "bg-amber-500/20 text-amber-400"
                        : entry.level === "action"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {entry.level}
                  </span>
                  {entry.nodeId && (
                    <span className="text-zinc-400 text-[10px] shrink-0 font-semibold">[{entry.nodeId}]</span>
                  )}
                  <span className="break-all leading-relaxed text-zinc-200">{entry.message}</span>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* ── Node Detail Drawer (Inspector Modal / Sidebar) ── */}
      {selectedNode && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background border-l border-border shadow-2xl p-6 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {selectedNode.template?.data.kind || "Task"}
              </span>
              <h3 className="text-base font-bold text-foreground">
                {selectedNode.template?.data.title || selectedNode.id}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedNodeId(null)}
              className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
              aria-label="Đóng ngăn chi tiết"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="py-4 space-y-4 flex-1 text-xs">
            {/* Status & Timing */}
            <div className="rounded-lg border border-border p-3 space-y-2 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trạng thái:</span>
                <span className="font-semibold uppercase">{selectedNode.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Thời gian chạy:</span>
                <span className="font-mono tabular-nums">
                  {formattedDuration(selectedNode.execution?.startedAt, selectedNode.execution?.finishedAt, nowTs)}
                </span>
              </div>
              {selectedNode.execution?.issueIdentifier && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mã Task:</span>
                  <span className="font-mono font-semibold">{selectedNode.execution.issueIdentifier}</span>
                </div>
              )}
            </div>

            {/* Agent & Model */}
            <div className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Agent phụ trách:</span>
                <span className="font-medium text-foreground">
                  {selectedNode.execution?.agentName || selectedNode.template?.data.agentName || "Chưa phân công"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Vai trò:</span>
                <span>{selectedNode.execution?.agentRole || selectedNode.template?.data.agentRole || "AI Specialist"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Model AI:</span>
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{selectedNode.template?.data.model || "gpt-5.6-luna"}</span>
              </div>
            </div>

            {/* Error / Last Gate Code */}
            {selectedNode.execution?.error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive space-y-1">
                <span className="font-semibold block">Lỗi thực thi:</span>
                <p>{selectedNode.execution.error}</p>
              </div>
            )}

            {/* Files generated / modified by this node */}
            <div className="space-y-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <FileCode className="h-4 w-4 text-primary" />
                File do Agent này tạo / sửa ({selectedNodeFiles.length})
              </span>
              {selectedNodeFiles.length === 0 ? (
                <p className="text-muted-foreground italic">Chưa có file nào được ghi bởi agent này.</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedNodeFiles.map((file) => (
                    <div key={file.path} className="flex items-center justify-between p-2 rounded bg-muted/40 font-mono text-[11px]">
                      <span className="truncate">{file.path}</span>
                      <span className="text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Node-specific logs */}
            <div className="space-y-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-primary" />
                Log riêng của bước này ({selectedNodeLogs.length})
              </span>
              <div className="max-h-48 overflow-y-auto rounded bg-zinc-950 p-2 font-mono text-[10px] text-zinc-300 space-y-1">
                {selectedNodeLogs.length === 0 ? (
                  <p className="text-zinc-600">Không có bản ghi log riêng.</p>
                ) : (
                  selectedNodeLogs.map((log) => (
                    <div key={log.id} className="leading-tight">
                      <span className="text-zinc-500">[{log.level}]</span> {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
