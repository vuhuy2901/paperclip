import React, { useMemo, useState, useEffect } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock,
  Clock3,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  Filter,
  GitBranch,
  Layers,
  ListChecks,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  Terminal,
  User,
  Workflow,
  X,
  Zap
} from "lucide-react";
import type {
  MonitorNode,
  MonitorRun,
  PaperclipAgent,
  PaperclipIssue,
  PaperclipProject,
  WorkflowDefinition,
  WorkflowRunHistoryEntry,
  WorkflowRunRecord
} from "../types.js";
import { TerminalViewer } from "./terminal-viewer.js";

export type ExecutionStatus = "running" | "idle" | "queued" | "completed" | "failed";

export function isRequirementIssue(issue: PaperclipIssue): boolean {
  const isManualOrigin = (issue as any).originKind === "manual" || !(issue as any).originKind;
  const noAgentAssigned = !issue.assigneeAgentId && !(issue as any).createdByAgentId;
  const noRunAssigned = !issue.activeRun && !(issue as any).executionRunId && !(issue as any).checkoutRunId;
  return isManualOrigin && noAgentAssigned && noRunAssigned;
}

function isCoordinatorIssue(issue: PaperclipIssue): boolean {
  return String((issue as any).originId ?? "").includes(":coordinator:");
}

function isLegacyWorkflowPlaceholderIssue(issue: PaperclipIssue): boolean {
  const origin = String((issue as any).originId ?? "");
  return (issue as any).originKind === "plugin:ai-company-workflow-studio"
    && origin.startsWith("workflow-run:")
    && !origin.includes(":task:")
    && !origin.includes(":coordinator:");
}

type WorkflowIssueStage = {
  nodeId: string;
  title: string;
  status: string;
  agentId: string | null;
  dependencyNodeIds: string[];
  isCoordinator?: boolean;
};

export function resolveExecutionStatus(
  issue: PaperclipIssue,
  monitorNode?: MonitorNode | null
): ExecutionStatus {
  if (issue.activeRun?.status === "running" || (issue as any).checkoutRunId) {
    return "running";
  }
  if (issue.status === "done") {
    return "completed";
  }
  if (issue.status === "failed" || issue.activeRun?.status === "failed") {
    return "failed";
  }
  if (monitorNode?.blockedBy && monitorNode.blockedBy.length > 0 && issue.status !== "in_progress") {
    return "queued";
  }
  return "idle";
}

export function extractAcceptanceCriteria(description: string | null): string[] {
  if (!description) return [];
  const lines = description.split("\n");
  const criteria: string[] = [];
  let inCriteriaSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/acceptance criteria|tiêu chí|yêu cầu quy trình|mục tiêu/i.test(trimmed)) {
      inCriteriaSection = true;
      continue;
    }
    if (inCriteriaSection && /^#+\s/.test(trimmed)) {
      inCriteriaSection = false;
      continue;
    }
    if (inCriteriaSection || /^[*-]\s|^\[[ xX]\]\s|^\d+\.\s/.test(trimmed)) {
      if (/^[*-]\s|^\[[ xX]\]\s|^\d+\.\s/.test(trimmed)) {
        criteria.push(trimmed.replace(/^[*-]\s*|^\[[ xX]\]\s*|^\d+\.\s*/, ""));
      }
    }
  }
  return criteria.slice(0, 8);
}

// Visual Workflow Sequence representation
const WORKFLOW_STAGES = [
  { id: "planning", label: "Project Manager", role: "AI Project Manager" },
  { id: "architecture", label: "Architect", role: "AI System Architect" },
  { id: "development", label: "Backend & Frontend", role: "AI Engineers" },
  { id: "review", label: "Code Review", role: "AI Code Reviewer" },
  { id: "qa", label: "QA Tester", role: "AI QA Tester" },
  { id: "devops", label: "DevOps Deploy", role: "AI DevOps Engineer" }
];

export function resolveWorkflowStageName(issue: PaperclipIssue, agent?: PaperclipAgent | null): string {
  const role = (agent?.name || "").toLowerCase();
  const title = (issue.title || "").toLowerCase();
  if (role.includes("pm") || role.includes("manager") || title.includes("plan") || title.includes("phân tích")) return "Project Manager";
  if (role.includes("architect") || title.includes("kiến trúc") || title.includes("design") || title.includes("schema")) return "Architect";
  if (role.includes("backend") || title.includes("backend") || title.includes("api")) return "Backend";
  if (role.includes("frontend") || title.includes("frontend") || title.includes("ui") || title.includes("ux")) return "Frontend";
  if (role.includes("review") || title.includes("review")) return "Code Review";
  if (role.includes("tester") || role.includes("qa") || title.includes("test")) return "QA Tester";
  if (role.includes("devops") || title.includes("deploy") || title.includes("docker")) return "DevOps";
  return "Execution Stage";
}

export function ProjectTaskListView({
  issues = [],
  agents = [],
  projects = [],
  monitor = [],
  activeRun = null,
  workflow = null,
  onOpenIssue,
  onRunProject
}: {
  issues: PaperclipIssue[];
  agents: PaperclipAgent[];
  projects?: PaperclipProject[];
  monitor?: MonitorNode[];
  activeRun?: WorkflowRunRecord | null;
  workflow?: WorkflowDefinition | null;
  onOpenIssue: (id: string) => void;
  onRunProject?: () => void;
}) {
  // Navigation & Lookups
  const agentMap = useMemo(() => new Map(agents.map((a) => [a.id, a])), [agents]);
  const monitorMap = useMemo(() => {
    const result = new Map<string, MonitorNode>();
    for (const item of monitor) {
      for (const issue of item.issues ?? []) result.set(issue.id, item);
      if (item.issue) result.set(item.issue.id, item);
    }
    return result;
  }, [monitor]);
  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);
  const stageByIssueId = useMemo(() => {
    const result = new Map<string, WorkflowIssueStage>();
    if (!activeRun) return result;
    for (const [nodeId, state] of Object.entries(activeRun.nodeExecutionStates ?? {})) {
      for (const issueId of state.issueIds ?? (state.issueId ? [state.issueId] : [])) {
        result.set(issueId, {
          nodeId,
          title: state.title,
          status: state.status,
          agentId: state.agentId,
          dependencyNodeIds: state.blockedByNodeIds ?? [],
          isCoordinator: state.isCoordinator
        });
      }
    }
    return result;
  }, [activeRun]);

  // Drawer state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<"overview" | "execution" | "logs" | "workflow">("overview");

  // Filter state
  const [search, setSearch] = useState("");
  const [viewScope, setViewScope] = useState<"execution" | "requirements" | "all">("execution");
  const [projectFilter, setProjectFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [executionFilter, setExecutionFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"updated" | "priority" | "status" | "id">("updated");
  const [groupByProject, setGroupByProject] = useState(!activeRun || !workflow);
  const [groupByStage, setGroupByStage] = useState(Boolean(activeRun && workflow));

  useEffect(() => {
    if (activeRun && workflow) {
      setGroupByStage(true);
      setGroupByProject(false);
    }
  }, [activeRun?.id, workflow?.id]);

  // Separate requirements vs execution tasks
  const { executionTasks, requirementIssues } = useMemo(() => {
    const exec: PaperclipIssue[] = [];
    const req: PaperclipIssue[] = [];
    for (const issue of issues) {
      if (isCoordinatorIssue(issue) || isLegacyWorkflowPlaceholderIssue(issue)) {
        continue;
      }
      if (isRequirementIssue(issue)) {
        req.push(issue);
      } else {
        exec.push(issue);
      }
    }
    return { executionTasks: exec, requirementIssues: req };
  }, [issues]);

  // Task Operations Header Summary metrics
  const summaryMetrics = useMemo(() => {
    let running = 0;
    let blocked = 0;
    let completed = 0;
    let failed = 0;

    for (const issue of executionTasks) {
      const mon = monitorMap.get(issue.id);
      const exec = resolveExecutionStatus(issue, mon);
      if (exec === "running") running++;
      else if (exec === "failed") failed++;
      else if (exec === "completed" || issue.status === "done") completed++;
      else if (issue.status === "blocked" || (mon?.blockedBy && mon.blockedBy.length > 0)) blocked++;
    }

    return {
      total: executionTasks.length,
      running,
      blocked,
      completed,
      failed,
      requirementsCount: requirementIssues.length
    };
  }, [executionTasks, requirementIssues, monitorMap]);

  // Active dataset according to scope
  const scopedIssues = useMemo(() => {
    if (viewScope === "execution") return executionTasks;
    if (viewScope === "requirements") return requirementIssues;
    return issues;
  }, [viewScope, executionTasks, requirementIssues, issues]);

  // Filter & Sort
  const filteredIssues = useMemo(() => {
    return scopedIssues.filter((issue) => {
      // Search text
      if (search.trim()) {
        const q = search.toLowerCase();
        const idMatch = (issue.identifier || "").toLowerCase().includes(q);
        const titleMatch = (issue.title || "").toLowerCase().includes(q);
        const descMatch = (issue.description || "").toLowerCase().includes(q);
        if (!idMatch && !titleMatch && !descMatch) return false;
      }
      // Project filter
      if (projectFilter !== "all") {
        if (projectFilter === "__unassigned") {
          if (issue.projectId) return false;
        } else if (issue.projectId !== projectFilter) {
          return false;
        }
      }
      // Agent filter
      if (agentFilter !== "all") {
        if (agentFilter === "__unassigned") {
          if (issue.assigneeAgentId) return false;
        } else if (issue.assigneeAgentId !== agentFilter) {
          return false;
        }
      }
      // Status filter
      if (statusFilter !== "all" && issue.status !== statusFilter) {
        return false;
      }
      // Execution Status filter
      const mon = monitorMap.get(issue.id);
      const execStatus = resolveExecutionStatus(issue, mon);
      if (executionFilter !== "all" && execStatus !== executionFilter) {
        return false;
      }
      // Stage filter
      const agent = issue.assigneeAgentId ? agentMap.get(issue.assigneeAgentId) : null;
      const mappedStage = stageByIssueId.get(issue.id);
      const stageName = mappedStage?.title ?? (activeRun ? "Unlinked Tasks" : resolveWorkflowStageName(issue, agent));
      if (stageFilter !== "all" && stageName.toLowerCase() !== stageFilter.toLowerCase()) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "priority") {
        const pOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      if (sortBy === "status") {
        return (a.status || "").localeCompare(b.status || "");
      }
      if (sortBy === "id") {
        return (a.identifier || "").localeCompare(b.identifier || "");
      }
      // Default: updated
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [scopedIssues, search, projectFilter, agentFilter, statusFilter, executionFilter, stageFilter, sortBy, monitorMap, agentMap, stageByIssueId, activeRun]);

  // Grouped by project
  const projectGroups = useMemo(() => {
    if (groupByStage && activeRun) {
      const groups = new Map<string, { key: string; name: string; items: PaperclipIssue[] }>();
      const order = new Map((workflow?.nodes ?? []).map((node, index) => [node.id, index]));
      for (const issue of filteredIssues) {
        const stage = stageByIssueId.get(issue.id);
        const key = stage?.nodeId ?? "__unlinked";
        const name = stage?.title ?? "Unlinked Tasks";
        if (!groups.has(key)) groups.set(key, { key, name, items: [] });
        groups.get(key)!.items.push(issue);
      }
      return Array.from(groups.values()).sort((a, b) => {
        if (a.key === "__unlinked") return 1;
        if (b.key === "__unlinked") return -1;
        return (order.get(a.key) ?? 9999) - (order.get(b.key) ?? 9999);
      });
    }
    if (!groupByProject) {
      return [{ key: "all", name: "All Tasks", items: filteredIssues }];
    }
    const groups = new Map<string, { key: string; name: string; items: PaperclipIssue[] }>();
    for (const issue of filteredIssues) {
      const pId = issue.projectId || "__unassigned";
      if (!groups.has(pId)) {
        const name = pId === "__unassigned"
          ? "Unassigned (No Project)"
          : (projectMap.get(pId)?.name || `Project (${pId.slice(0, 8)})`);
        groups.set(pId, { key: pId, name, items: [] });
      }
      groups.get(pId)!.items.push(issue);
    }
    // Sort groups: named projects first, Unassigned last
    return Array.from(groups.values()).sort((a, b) => {
      if (a.key === "__unassigned") return 1;
      if (b.key === "__unassigned") return -1;
      return a.name.localeCompare(b.name);
    });
  }, [filteredIssues, groupByProject, groupByStage, projectMap, stageByIssueId, activeRun, workflow]);

  // Selected issue for detail drawer
  const selectedIssue = useMemo(() => {
    if (!selectedTaskId) return null;
    return issues.find((i) => i.id === selectedTaskId) || null;
  }, [selectedTaskId, issues]);

  const selectedAgent = useMemo(() => {
    if (!selectedIssue?.assigneeAgentId) return null;
    return agentMap.get(selectedIssue.assigneeAgentId) || null;
  }, [selectedIssue, agentMap]);

  const selectedMonitor = useMemo(() => {
    if (!selectedIssue) return null;
    return monitorMap.get(selectedIssue.id) || null;
  }, [selectedIssue, monitorMap]);

  const selectedStageName = selectedIssue
    ? (stageByIssueId.get(selectedIssue.id)?.title ?? "Unlinked Tasks")
    : "Unlinked Tasks";

  // Generate logs for selected task from run history or realistic events
  const selectedLogs: WorkflowRunHistoryEntry[] = useMemo(() => {
    if (!selectedIssue) return [];
    const directRuns = selectedMonitor?.runs || [];
    const timestamp = selectedIssue.updatedAt || new Date().toISOString();
    const agentName = selectedAgent?.name || "AI Agent";
    const stage = selectedStageName;

    if (directRuns.length > 0) {
      return directRuns.map((r, i) => ({
        id: `run-log-${r.id}-${i}`,
        timestamp: r.startedAt || timestamp,
        level: (r.error ? "error" : r.status === "completed" ? "info" : "action") as any,
        message: r.error
          ? `Execution error in ${stage}: ${r.error}`
          : `Run ${r.id.slice(0, 8)} [${r.status}]. Agent ${agentName} executed stage deliverables.`
      }));
    }
    const nodeId = stageByIssueId.get(selectedIssue.id)?.nodeId;
    return (activeRun?.executionHistory ?? []).filter((entry) =>
      entry.issueId === selectedIssue.id || (nodeId && entry.nodeId === nodeId)
    );
  }, [selectedIssue, selectedMonitor, selectedAgent, selectedStageName, activeRun, stageByIssueId]);

  // Handle drawer escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedTaskId) {
        setSelectedTaskId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTaskId]);

  return (
    <div className="wfs-task-manager" style={{ display: "grid", gap: 16 }}>
      {/* 1. TASK DASHBOARD HEADER */}
      <section
        className="wfs-task-stats-banner"
        style={{
          display: "flex",
          alignItems: "stretch",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          padding: "16px 20px",
          background: "var(--card, var(--wfs-panel))",
          border: "1px solid var(--border)",
          borderRadius: 10
        }}
      >
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--wfs-accent)" }}>
              AI Orchestration
            </span>
            <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>• Autonomous Delivery</span>
          </div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Tasks & Execution Board
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--muted-foreground)", maxWidth: 540 }}>
            Real-time observability of AI-generated tasks. Product Owner specifies requirements; AI Project Manager and 8 specialized agents plan and deliver autonomously.
          </p>
        </div>

        {/* Real Stats Cards */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "Total Tasks", value: summaryMetrics.total, color: "var(--foreground)" },
            { label: "Running", value: summaryMetrics.running, color: "#10b981", pulse: summaryMetrics.running > 0 },
            { label: "Blocked", value: summaryMetrics.blocked, color: "#d97706" },
            { label: "Completed", value: summaryMetrics.completed, color: "#3b82f6" },
            { label: "Failed", value: summaryMetrics.failed, color: "#ef4444" }
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                minWidth: 84,
                padding: "8px 12px",
                borderRadius: 8,
                background: "color-mix(in srgb, var(--background) 70%, transparent)",
                border: "1px solid var(--border)",
                display: "grid",
                gap: 2
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {stat.pulse && <span className="wfs-stage-pulse" style={{ width: 6, height: 6, background: "#10b981" }} />}
                <span style={{ fontSize: 9.5, fontWeight: 600, textTransform: "uppercase", color: "var(--muted-foreground)" }}>
                  {stat.label}
                </span>
              </div>
              <strong style={{ fontSize: 18, fontWeight: 700, color: stat.color, fontVariantNumeric: "tabular-nums" }}>
                {stat.value}
              </strong>
            </div>
          ))}
        </div>
      </section>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div
        className="wfs-task-toolbar"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "10px 14px",
          background: "var(--wfs-panel)",
          border: "1px solid var(--border)",
          borderRadius: 8
        }}
      >
        {/* Scope Pill Toggle (Execution Tasks vs Requirements) */}
        <div style={{ display: "inline-flex", border: "1px solid var(--border)", borderRadius: 7, overflow: "hidden", background: "var(--background)" }}>
          <button
            type="button"
            onClick={() => setViewScope("execution")}
            style={{
              padding: "5px 11px",
              border: "none",
              background: viewScope === "execution" ? "var(--wfs-accent)" : "transparent",
              color: viewScope === "execution" ? "#fff" : "var(--muted-foreground)",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5
            }}
          >
            <ListChecks size={13} /> Execution Tasks ({summaryMetrics.total})
          </button>
          <button
            type="button"
            onClick={() => setViewScope("requirements")}
            style={{
              padding: "5px 11px",
              border: "none",
              background: viewScope === "requirements" ? "var(--wfs-accent)" : "transparent",
              color: viewScope === "requirements" ? "#fff" : "var(--muted-foreground)",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5
            }}
            title="Initial requirements entered by Product Owner"
          >
            <FileText size={13} /> Requirements ({summaryMetrics.requirementsCount})
          </button>
          <button
            type="button"
            onClick={() => setViewScope("all")}
            style={{
              padding: "5px 11px",
              border: "none",
              background: viewScope === "all" ? "var(--wfs-accent)" : "transparent",
              color: viewScope === "all" ? "#fff" : "var(--muted-foreground)",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            All ({issues.length})
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: "relative", minWidth: 220, flex: "1 1 200px", maxWidth: 320 }}>
          <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by ID or keyword..."
            style={{
              width: "100%",
              height: 30,
              padding: "0 10px 0 28px",
              fontSize: 11,
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--background)",
              color: "var(--foreground)",
              outline: "none"
            }}
          />
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            style={{ height: 30, fontSize: 11, borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", padding: "0 6px" }}
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
            <option value="__unassigned">Unassigned (No Project)</option>
          </select>

          {/* Agent Filter */}
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            style={{ height: 30, fontSize: 11, borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", padding: "0 6px" }}
          >
            <option value="all">All Agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
            <option value="__unassigned">Unassigned</option>
          </select>

          {/* Workflow Stage Filter — uses the published run mapping, never agent/title heuristics. */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            style={{ height: 30, fontSize: 11, borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", padding: "0 6px" }}
          >
            <option value="all">All Workflow Stages</option>
            {activeRun && workflow?.nodes.filter((node) => node.data.kind === "task").map((node) => (
              <option key={node.id} value={node.data.title}>{node.data.title}</option>
            ))}
            {activeRun && <option value="Unlinked Tasks">Unlinked Tasks</option>}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ height: 30, fontSize: 11, borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", padding: "0 6px" }}
          >
            <option value="all">All Statuses</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Execution Filter */}
          <select
            value={executionFilter}
            onChange={(e) => setExecutionFilter(e.target.value)}
            style={{ height: 30, fontSize: 11, borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", padding: "0 6px" }}
          >
            <option value="all">All Execution</option>
            <option value="running">Running</option>
            <option value="queued">Queued / Waiting</option>
            <option value="idle">Idle</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          {/* Group Toggle */}
          {activeRun && workflow && (
            <button
              type="button"
              onClick={() => { setGroupByStage(true); setGroupByProject(false); }}
              className="wfs-button"
              style={{ height: 30, fontSize: 11, padding: "0 9px", background: groupByStage ? "var(--wfs-accent)" : undefined, color: groupByStage ? "#fff" : undefined }}
              title="Group execution tasks by the published Workflow stage"
            >
              <GitBranch size={12} /> Grouped by Stage
            </button>
          )}
          <button
            type="button"
            onClick={() => { setGroupByProject(true); setGroupByStage(false); }}
            className="wfs-button"
            style={{ height: 30, fontSize: 11, padding: "0 9px" }}
            title="Group execution tasks by project"
          >
            <Layers size={12} />
            Grouped by Project
          </button>
          <button
            type="button"
            onClick={() => { setGroupByProject(false); setGroupByStage(false); }}
            className="wfs-button"
            style={{ height: 30, fontSize: 11, padding: "0 9px" }}
            title="Show a flat task list"
          >
            <ListChecks size={12} /> Flat List
          </button>
        </div>
      </div>

      {/* 3. TASK TABLE / LIST */}
      {filteredIssues.length === 0 ? (
        <div
          style={{
            padding: "48px 20px",
            textAlign: "center",
            border: "1px dashed var(--border)",
            borderRadius: 10,
            background: "var(--card, var(--background))"
          }}
        >
          <Workflow size={32} color="var(--wfs-accent)" style={{ margin: "0 auto 12px" }} />
          <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600 }}>
            {viewScope === "requirements" ? "No requirements matching filters" : "No AI execution tasks found"}
          </h4>
          <p style={{ margin: "0 auto 16px", fontSize: 11, color: "var(--muted-foreground)", maxWidth: 440 }}>
            {viewScope === "requirements"
              ? "Project requirements can be authored in Project Detail → Requirements."
              : "Run a Project Workflow to let the AI Project Manager automatically analyze requirements, plan the architecture, and generate tasks for specialized agents."}
          </p>
          {onRunProject && viewScope !== "requirements" && (
            <button className="wfs-button wfs-button-primary" onClick={onRunProject} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Play size={13} /> Run Project Workflow
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {projectGroups.map((group) => {
            const project = group.key !== "all" && group.key !== "__unassigned" ? projectMap.get(group.key) : null;
            const stage = activeRun?.nodeExecutionStates?.[group.key];
            const grouped = groupByProject || groupByStage;
            return (
              <div
                key={group.key}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  background: "var(--card, var(--background))",
                  overflow: "hidden"
                }}
              >
                {/* Project Group Header */}
                {grouped && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "var(--wfs-panel)",
                      borderBottom: "1px solid var(--border)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Workflow size={14} color="var(--wfs-accent)" />
                      <strong style={{ fontSize: 12.5, fontWeight: 700 }}>
                        {group.name}
                      </strong>
                      <span className="wfs-badge" style={{ fontSize: 9.5 }}>
                        {group.items.length} tasks
                      </span>
                    </div>
                    {stage && (
                      <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                        Stage: <strong style={{ color: "var(--foreground)" }}>{stage.status.replaceAll("_", " ")}</strong> · {stage.issueIds.length} mapped
                      </span>
                    )}
                    {project && groupByProject && (
                      <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                        Status: <strong style={{ textTransform: "capitalize", color: "var(--foreground)" }}>{project.status}</strong>
                      </span>
                    )}
                  </div>
                )}

                {/* Desktop Table Headers */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(220px, 2fr) minmax(130px, 1fr) 100px 105px 75px 120px 90px 90px 75px",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 14px",
                    background: "color-mix(in srgb, var(--wfs-panel) 50%, var(--background))",
                    borderBottom: "1px solid var(--border)",
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "var(--muted-foreground)"
                  }}
                >
                  <div>Task</div>
                  <div>Agent</div>
                  <div>Status</div>
                  <div>Execution</div>
                  <div>Priority</div>
                  <div>Workflow Stage</div>
                  <div>Dependency</div>
                  <div>Updated</div>
                  <div style={{ textAlign: "right" }}>Actions</div>
                </div>

                {/* Table Rows */}
                <div style={{ display: "grid" }}>
                  {group.items.map((issue) => {
                    const agent = issue.assigneeAgentId ? agentMap.get(issue.assigneeAgentId) : null;
                    const monitorItem = monitorMap.get(issue.id);
                    const execStatus = resolveExecutionStatus(issue, monitorItem);
                    const mappedStage = stageByIssueId.get(issue.id);
                    const stageName = mappedStage?.title ?? (activeRun ? "Unlinked Tasks" : resolveWorkflowStageName(issue, agent));
                    const blockerCount = monitorItem?.blockedBy?.length ?? 0;
                    const isSelected = selectedTaskId === issue.id;
                    const isReq = isRequirementIssue(issue);

                    return (
                      <div
                        key={issue.id}
                        onClick={() => setSelectedTaskId(issue.id)}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "minmax(220px, 2fr) minmax(130px, 1fr) 100px 105px 75px 120px 90px 90px 75px",
                          alignItems: "center",
                          gap: 10,
                          padding: "9px 14px",
                          borderBottom: "1px solid var(--border)",
                          background: isSelected
                            ? "color-mix(in srgb, var(--wfs-accent) 8%, var(--background))"
                            : "transparent",
                          cursor: "pointer",
                          transition: "background 0.15s ease"
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "var(--wfs-panel)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {/* Task Col (Identifier + Title) */}
                        <div style={{ minWidth: 0, display: "flex", alignItems: "flex-start", gap: 7 }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontFamily: "ui-monospace, monospace",
                              fontWeight: 700,
                              padding: "2px 5px",
                              borderRadius: 4,
                              background: isReq ? "color-mix(in srgb, #8b5cf6 15%, transparent)" : "color-mix(in srgb, var(--wfs-accent) 15%, transparent)",
                              color: isReq ? "#8b5cf6" : "var(--wfs-accent)",
                              whiteSpace: "nowrap"
                            }}
                          >
                            {issue.identifier || `ISSUE-${issue.id.slice(0, 4)}`}
                          </span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                color: "var(--foreground)"
                              }}
                              title={issue.title}
                            >
                              {issue.title}
                            </div>
                            {isReq && (
                              <span style={{ fontSize: 9, color: "#8b5cf6", fontWeight: 600 }}>
                                PO Project Requirement
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Agent Col */}
                        <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
                          {agent ? (
                            <>
                              <div
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: "50%",
                                  background: "var(--muted)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0
                                }}
                              >
                                <Bot size={11} color="var(--wfs-accent)" />
                              </div>
                              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={agent.name}>
                                {agent.name}
                              </span>
                            </>
                          ) : (
                            <span style={{ fontSize: 10, color: "var(--muted-foreground)", fontStyle: "italic" }}>
                              Unassigned
                            </span>
                          )}
                        </div>

                        {/* Status Col */}
                        <div>
                          <span
                            className={`wfs-badge ${
                              issue.status === "done"
                                ? "wfs-badge-published"
                                : issue.status === "in_progress"
                                  ? "wfs-badge-published"
                                  : issue.status === "blocked"
                                    ? "wfs-badge-draft"
                                    : ""
                            }`}
                            style={{
                              fontSize: 9.5,
                              textTransform: "capitalize",
                              background: issue.status === "blocked" ? "color-mix(in srgb, #f59e0b 15%, transparent)" : undefined,
                              color: issue.status === "blocked" ? "#d97706" : undefined
                            }}
                          >
                            {issue.status.replaceAll("_", " ")}
                          </span>
                        </div>

                        {/* Execution Status Col */}
                        <div>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "2px 7px",
                              borderRadius: 5,
                              fontSize: 9.5,
                              fontWeight: 600,
                              background:
                                execStatus === "running"
                                  ? "color-mix(in srgb, #10b981 18%, transparent)"
                                  : execStatus === "failed"
                                    ? "color-mix(in srgb, #ef4444 18%, transparent)"
                                    : execStatus === "queued"
                                      ? "color-mix(in srgb, #8b5cf6 15%, transparent)"
                                      : "var(--muted)",
                              color:
                                execStatus === "running"
                                  ? "#10b981"
                                  : execStatus === "failed"
                                    ? "#ef4444"
                                    : execStatus === "queued"
                                      ? "#8b5cf6"
                                      : "var(--muted-foreground)"
                            }}
                          >
                            {execStatus === "running" && <span className="wfs-stage-pulse" style={{ width: 5, height: 5, background: "#10b981" }} />}
                            {execStatus === "failed" && <AlertTriangle size={10} />}
                            {execStatus.toUpperCase()}
                          </span>
                        </div>

                        {/* Priority Col */}
                        <div>
                          <span
                            style={{
                              fontSize: 9.5,
                              textTransform: "capitalize",
                              color:
                                issue.priority === "urgent"
                                  ? "#ef4444"
                                  : issue.priority === "high"
                                    ? "#f97316"
                                    : "var(--muted-foreground)"
                            }}
                          >
                            {issue.priority}
                          </span>
                        </div>

                        {/* Workflow Stage Col */}
                        <div style={{ minWidth: 0 }}>
                          <span
                            className="wfs-stage-pill"
                            style={{ fontSize: 9.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "inline-block", maxWidth: "100%" }}
                            title={stageName}
                          >
                            {stageName}
                          </span>
                        </div>

                        {/* Dependency Status Col */}
                        <div>
                          {blockerCount > 0 ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 3,
                                fontSize: 9.5,
                                color: "#d97706",
                                background: "color-mix(in srgb, #f59e0b 12%, transparent)",
                                padding: "2px 6px",
                                borderRadius: 4
                              }}
                              title={`Blocked by ${blockerCount} upstream tasks`}
                            >
                              <GitBranch size={10} /> Blocked ({blockerCount})
                            </span>
                          ) : (
                            <span style={{ fontSize: 9.5, color: "#10b981", display: "inline-flex", alignItems: "center", gap: 3 }}>
                              <Check size={10} /> Ready
                            </span>
                          )}
                        </div>

                        {/* Updated Date Col */}
                        <div style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                          {new Date(issue.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>

                        {/* Action Buttons Col */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="wfs-button wfs-icon-button"
                            style={{ width: 24, height: 24 }}
                            onClick={() => setSelectedTaskId(issue.id)}
                            title="Open Task Details"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            type="button"
                            className="wfs-button wfs-icon-button"
                            style={{ width: 24, height: 24 }}
                            onClick={() => onOpenIssue(issue.id)}
                            title="Open in Paperclip Issue Editor"
                          >
                            <ExternalLink size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. TASK DETAIL DRAWER (SLIDE-OVER FROM RIGHT) */}
      {selectedIssue && (
        <div
          className="wfs-drawer-backdrop"
          onClick={() => setSelectedTaskId(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(2px)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "flex-end"
          }}
        >
          <aside
            className="wfs-task-drawer"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 620,
              height: "100vh",
              background: "var(--card, var(--background))",
              borderLeft: "1px solid var(--border)",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
              animation: "wfs-slide-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
                background: "var(--wfs-panel)"
              }}
            >
              <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span
                    style={{
                      fontFamily: "ui-monospace, monospace",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: "color-mix(in srgb, var(--wfs-accent) 15%, transparent)",
                      color: "var(--wfs-accent)"
                    }}
                  >
                    {selectedIssue.identifier || selectedIssue.id.slice(0, 8)}
                  </span>
                  <span
                    className={`wfs-badge ${
                      selectedIssue.status === "done" ? "wfs-badge-published" : "wfs-badge-draft"
                    }`}
                    style={{ fontSize: 9.5 }}
                  >
                    {selectedIssue.status.replaceAll("_", " ")}
                  </span>
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 600,
                      color:
                        resolveExecutionStatus(selectedIssue, selectedMonitor) === "running"
                          ? "#10b981"
                          : resolveExecutionStatus(selectedIssue, selectedMonitor) === "failed"
                            ? "#ef4444"
                            : "var(--muted-foreground)"
                    }}
                  >
                    {resolveExecutionStatus(selectedIssue, selectedMonitor).toUpperCase()}
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>
                  {selectedIssue.title}
                </h3>
              </div>
              <button
                type="button"
                className="wfs-button wfs-icon-button"
                onClick={() => setSelectedTaskId(null)}
                style={{ width: 28, height: 28 }}
                title="Close Drawer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Drawer Tabs Navigation */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid var(--border)",
                background: "var(--wfs-panel)",
                padding: "0 20px"
              }}
            >
              {[
                { key: "overview", label: "Overview", icon: FileText },
                { key: "execution", label: "AI Execution", icon: Bot },
                { key: "logs", label: "Live Logs", icon: Terminal },
                { key: "workflow", label: "Workflow", icon: GitBranch }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = drawerTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setDrawerTab(tab.key as any)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "10px 14px",
                      border: "none",
                      borderBottom: active ? "2px solid var(--wfs-accent)" : "2px solid transparent",
                      background: "transparent",
                      color: active ? "var(--foreground)" : "var(--muted-foreground)",
                      fontSize: 11.5,
                      fontWeight: active ? 700 : 500,
                      cursor: "pointer"
                    }}
                  >
                    <Icon size={13} color={active ? "var(--wfs-accent)" : "currentColor"} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Drawer Tab Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              {/* TAB 1: OVERVIEW */}
              {drawerTab === "overview" && (
                <div style={{ display: "grid", gap: 16 }}>
                  {/* Meta Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 10,
                      padding: 12,
                      background: "var(--wfs-panel)",
                      borderRadius: 8,
                      border: "1px solid var(--border)"
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 9.5, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Project</span>
                      <div style={{ fontSize: 11.5, fontWeight: 600, marginTop: 2 }}>
                        {selectedIssue.projectId
                          ? (projectMap.get(selectedIssue.projectId)?.name || "Assigned Project")
                          : "Unassigned"}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 9.5, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Assigned Agent</span>
                      <div style={{ fontSize: 11.5, fontWeight: 600, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                        <Bot size={13} color="var(--wfs-accent)" />
                        {selectedAgent?.name || "Unassigned"}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 9.5, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Priority</span>
                      <div style={{ fontSize: 11.5, fontWeight: 600, textTransform: "capitalize", marginTop: 2 }}>
                        {selectedIssue.priority}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 9.5, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Workflow Stage</span>
                      <div style={{ fontSize: 11.5, fontWeight: 600, marginTop: 2 }}>
                        {selectedStageName}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 9.5, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Created At</span>
                      <div style={{ fontSize: 10.5, color: "var(--muted-foreground)", marginTop: 2 }}>
                        {new Date((selectedIssue as any).createdAt || selectedIssue.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 9.5, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Last Activity</span>
                      <div style={{ fontSize: 10.5, color: "var(--muted-foreground)", marginTop: 2 }}>
                        {new Date(selectedIssue.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700 }}>Description</h4>
                    <div
                      style={{
                        padding: 12,
                        background: "var(--wfs-panel)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 11.5,
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                        color: "var(--foreground)"
                      }}
                    >
                      {selectedIssue.description || "No detailed description provided."}
                    </div>
                  </div>

                  {/* Acceptance Criteria */}
                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircle2 size={13} color="#10b981" /> Acceptance Criteria
                    </h4>
                    {extractAcceptanceCriteria(selectedIssue.description).length > 0 ? (
                      <div style={{ display: "grid", gap: 6 }}>
                        {extractAcceptanceCriteria(selectedIssue.description).map((crit, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 8,
                              padding: "8px 10px",
                              borderRadius: 6,
                              background: "color-mix(in srgb, #10b981 8%, var(--card))",
                              border: "1px solid color-mix(in srgb, #10b981 25%, transparent)",
                              fontSize: 11
                            }}
                          >
                            <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8.5, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                              {idx + 1}
                            </span>
                            <span>{crit}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: 12, fontSize: 11, color: "var(--muted-foreground)", border: "1px dashed var(--border)", borderRadius: 6, textAlign: "center" }}>
                        Acceptance criteria defined directly in project specifications.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: AI EXECUTION */}
              {drawerTab === "execution" && (
                <div style={{ display: "grid", gap: 16 }}>
                  {/* Agent Profile Card */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 14,
                      background: "var(--wfs-panel)",
                      border: "1px solid var(--border)",
                      borderRadius: 8
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: "color-mix(in srgb, var(--wfs-accent) 15%, transparent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Bot size={22} color="var(--wfs-accent)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>
                        {selectedAgent?.name || "Unassigned AI Agent"}
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--muted-foreground)", marginTop: 2 }}>
                        Role: {selectedAgent?.role || selectedStageName}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 2 }}>
                        Model: <code style={{ fontSize: 9.5 }}>{(selectedAgent as any)?.model || "qwen2.5:0.5b / Sonnet-3.5"}</code>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "3px 8px",
                        borderRadius: 5,
                        fontWeight: 600,
                        background:
                          resolveExecutionStatus(selectedIssue, selectedMonitor) === "running"
                            ? "#10b98122"
                            : "var(--muted)",
                        color:
                          resolveExecutionStatus(selectedIssue, selectedMonitor) === "running"
                            ? "#10b981"
                            : "var(--muted-foreground)"
                      }}
                    >
                      {resolveExecutionStatus(selectedIssue, selectedMonitor).toUpperCase()}
                    </span>
                  </div>

                  {/* Input Instructions / Prompt */}
                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                      <FileCode size={13} color="var(--wfs-accent)" /> Instructions from AI PM
                    </h4>
                    <div
                      style={{
                        padding: 12,
                        background: "var(--wfs-panel)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 11,
                        lineHeight: 1.5,
                        fontFamily: "ui-monospace, monospace"
                      }}
                    >
                      {selectedIssue.description || `Autonomous execution instructions for ${selectedIssue.title}. Complete deliverables and update task status.`}
                    </div>
                  </div>

                  {/* Execution Progress */}
                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700 }}>Execution Progress</h4>
                    <div
                      style={{
                        padding: 12,
                        background: "var(--wfs-panel)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        display: "grid",
                        gap: 8
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5 }}>
                        <span>Current Phase</span>
                        <strong>{selectedStageName}</strong>
                      </div>
                      <div className="wfs-portfolio-progress-bar">
                        <span style={{ width: selectedIssue.status === "done" ? "100%" : selectedIssue.status === "in_progress" ? "60%" : "15%" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: "var(--muted-foreground)" }}>
                        <span>Status: {selectedIssue.status.replaceAll("_", " ")}</span>
                        <span>{selectedIssue.status === "done" ? "100% Completed" : selectedIssue.status === "in_progress" ? "60% In Progress" : "Queued"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
                    <button
                      type="button"
                      className="wfs-button wfs-button-primary"
                      onClick={() => onOpenIssue(selectedIssue.id)}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                    >
                      <RotateCcw size={13} /> Retry / Trigger Execution
                    </button>
                    <button
                      type="button"
                      className="wfs-button"
                      onClick={() => onOpenIssue(selectedIssue.id)}
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <User size={13} /> Reassign Agent
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: LIVE LOGS */}
              {drawerTab === "logs" && (
                <div style={{ height: "calc(100vh - 220px)", minHeight: 480 }}>
                  <TerminalViewer
                    logs={selectedLogs}
                    isRunning={resolveExecutionStatus(selectedIssue, selectedMonitor) === "running"}
                    title={`Agent Terminal: ${selectedIssue.identifier || selectedIssue.title}`}
                    agentName={selectedAgent?.name || "Agent"}
                  />
                </div>
              )}

              {/* TAB 4: WORKFLOW */}
              {drawerTab === "workflow" && (
                <div style={{ display: "grid", gap: 16 }}>
                  {/* Workflow Run Association */}
                  <div
                    style={{
                      padding: 12,
                      background: "var(--wfs-panel)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      display: "grid",
                      gap: 6
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10, textTransform: "uppercase", color: "var(--muted-foreground)" }}>Active Workflow Run</span>
                      <span className="wfs-badge wfs-badge-published" style={{ fontSize: 9.5 }}>
                        {activeRun?.status || "Active Workflow"}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: "var(--foreground)" }}>
                      Run ID: {activeRun?.id || "run-auto-flow-01"}
                    </div>
                  </div>

                  {/* Visual Breadcrumb Mini-Graph */}
                  <div>
                    <h4 style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700 }}>Workflow Stage Pipeline</h4>
                    <div
                      style={{
                        padding: 12,
                        background: "var(--wfs-panel)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        display: "grid",
                        gap: 8
                      }}
                    >
                      {WORKFLOW_STAGES.map((st, i) => {
                        const currentStage = resolveWorkflowStageName(selectedIssue, selectedAgent);
                        const isCurrent = currentStage.toLowerCase().includes(st.id) || st.label.toLowerCase().includes(currentStage.toLowerCase());
                        return (
                          <div
                            key={st.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "6px 10px",
                              borderRadius: 6,
                              background: isCurrent ? "color-mix(in srgb, var(--wfs-accent) 15%, transparent)" : "transparent",
                              border: isCurrent ? "1px solid var(--wfs-accent)" : "1px solid transparent"
                            }}
                          >
                            <span
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                background: isCurrent ? "var(--wfs-accent)" : "var(--muted)",
                                color: isCurrent ? "#fff" : "var(--muted-foreground)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 9,
                                fontWeight: 700
                              }}
                            >
                              {i + 1}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 11.5, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? "var(--wfs-accent)" : "var(--foreground)" }}>
                                {st.label}
                              </div>
                              <div style={{ fontSize: 9.5, color: "var(--muted-foreground)" }}>
                                {st.role}
                              </div>
                            </div>
                            {isCurrent && (
                              <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "var(--wfs-accent)", color: "#fff", fontWeight: 700 }}>
                                CURRENT
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dependencies List */}
                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700 }}>
                      Dependencies (Preceding Blockers)
                    </h4>
                    {selectedMonitor?.blockedBy && selectedMonitor.blockedBy.length > 0 ? (
                      <div style={{ display: "grid", gap: 6 }}>
                        {selectedMonitor.blockedBy.map((b) => (
                          <div
                            key={b.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 10px",
                              borderRadius: 6,
                              background: "color-mix(in srgb, #f59e0b 10%, var(--card))",
                              border: "1px solid color-mix(in srgb, #f59e0b 30%, transparent)",
                              fontSize: 11
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <GitBranch size={12} color="#d97706" />
                              <strong style={{ fontFamily: "ui-monospace, monospace" }}>{b.identifier || b.id.slice(0, 8)}</strong>
                              <span>{b.title || "Upstream Task"}</span>
                            </div>
                            <span style={{ fontSize: 9.5, color: "#d97706", fontWeight: 600 }}>Blocking</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: 12, fontSize: 11, color: "var(--muted-foreground)", border: "1px dashed var(--border)", borderRadius: 6, textAlign: "center" }}>
                        No preceding blocking tasks. This task is ready for execution.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
