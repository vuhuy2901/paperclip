import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Issue, Project, Agent } from "@paperclipai/shared";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FileCode2,
  FileText,
  Filter,
  Flame,
  GitCommit,
  Layers,
  LayoutGrid,
  List,
  ListChecks,
  ListTodo,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Table as TableIcon,
  Terminal,
  TrendingUp,
  UserCheck,
  Users,
  WifiOff,
  X,
  XCircle,
  Building2,
  ShieldAlert,
} from "lucide-react";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { agentsApi } from "../api/agents";
import { issuesApi } from "../api/issues";
import { heartbeatsApi } from "../api/heartbeats";
import { useToastActions } from "../context/ToastContext";
import { queryKeys } from "../lib/queryKeys";

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES & HELPERS
   ───────────────────────────────────────────────────────────────────────────── */

export interface WorkspaceFileInfo {
  path: string;
  name: string;
  size: number;
  modified_at: number;
  status: "new" | "modified" | "unchanged";
  agent: string;
  is_new: boolean;
  is_modified: boolean;
}

export interface ActivityFeedItem {
  id: string;
  type: "delegation" | "started" | "completed" | "created" | "blocked" | "review";
  timestamp: string;
  agentId?: string;
  agentName?: string;
  agentRole?: string;
  fromAgentName?: string;
  toAgentName?: string;
  issueId: string;
  issueIdentifier?: string | null;
  issueTitle: string;
  priority?: string | null;
  status?: string;
  message: string;
}

export interface ProjectOperationsViewProps {
  project: Project;
  companyId: string;
  projectRef?: string;
  mode?: "overview" | "activity" | "tasks" | "team" | "history" | "live-monitor" | "contributions" | "logs";
  onNavigateTab?: (tab: string) => void;
}

function formattedDuration(
  startedAt: string | null | undefined,
  finishedAt?: string | null | undefined,
  nowTs?: number,
): string {
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
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formattedRelativeTime(value: string | number | Date | null | undefined): string {
  if (!value) return "Recently";
  const date = typeof value === "number" ? new Date(value * 1000) : new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  return `${diffDays}d ago`;
}

function statusBadgeInfo(status: string) {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case "in_progress":
    case "running":
      return {
        label: "In Progress",
        className: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30",
        dotColor: "bg-blue-500",
      };
    case "done":
    case "completed":
      return {
        label: "Completed",
        className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
        dotColor: "bg-emerald-500",
      };
    case "in_review":
    case "waiting_approval":
      return {
        label: "In Review",
        className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30",
        dotColor: "bg-amber-500",
      };
    case "blocked":
    case "failed":
    case "error":
      return {
        label: "Blocked",
        className: "bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30",
        dotColor: "bg-red-500",
      };
    case "todo":
    case "pending":
    case "waiting":
      return {
        label: "To Do",
        className: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30",
        dotColor: "bg-slate-400",
      };
    case "cancelled":
    case "stopped":
      return {
        label: "Cancelled",
        className: "bg-zinc-500/15 text-zinc-500 border border-zinc-500/30",
        dotColor: "bg-zinc-400",
      };
    default:
      return {
        label: status,
        className: "bg-muted text-muted-foreground border border-border",
        dotColor: "bg-muted-foreground",
      };
  }
}

function priorityBadgeInfo(priority: string | null | undefined) {
  const p = (priority ?? "normal").toLowerCase();
  switch (p) {
    case "urgent":
      return "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20";
    case "high":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20";
    case "low":
      return "bg-zinc-500/15 text-zinc-500 border border-zinc-500/20";
    case "normal":
    default:
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────────────────────────────────── */

export function ProjectOperationsView({
  project,
  companyId,
  projectRef,
  mode = "overview",
  onNavigateTab,
}: ProjectOperationsViewProps) {
  const queryClient = useQueryClient();
  const { pushToast } = useToastActions();

  // Normalize mode for backward compatibility
  const currentTab = useMemo(() => {
    if (mode === "live-monitor") return "activity";
    if (mode === "contributions") return "team";
    if (mode === "logs") return "history";
    return mode;
  }, [mode]);

  // Polling clock for elapsed counters
  const [nowTs, setNowTs] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNowTs(Date.now()), 2000);
    return () => window.clearInterval(timer);
  }, []);

  /* ── Queries ── */

  // 1. Fetch company agents
  const { data: agents = [] } = useQuery({
    queryKey: queryKeys.agents.list(companyId),
    queryFn: () => agentsApi.list(companyId),
  });

  // 2. Fetch project issues / tasks
  const { data: issues = [] } = useQuery({
    queryKey: queryKeys.issues.listByProject(companyId, project.id),
    queryFn: () => issuesApi.listAll(companyId, { projectId: project.id }),
    refetchInterval: 3000,
  });

  // 3. Fetch project workspace tree files (outputs / deliverables)
  const workspaceFilesQuery = useQuery({
    queryKey: ["project-workspace-tree", project.id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${project.id}/workspace/tree`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.files ?? []) as WorkspaceFileInfo[];
    },
    refetchInterval: 4000,
  });

  // 4. Fetch live heartbeat runs to identify active agents
  const liveRunsQuery = useQuery({
    queryKey: queryKeys.liveRuns(companyId),
    queryFn: () => heartbeatsApi.liveRunsForCompany(companyId),
    refetchInterval: 3000,
  });

  /* ── Maps & Lookup Dictionaries ── */

  const agentById = useMemo(() => new Map(agents.map((a) => [a.id, a])), [agents]);
  const issueById = useMemo(() => new Map(issues.map((i) => [i.id, i])), [issues]);

  /* ── Computed Metrics & Project Status ── */

  const completedTasks = useMemo(() => issues.filter((i) => i.status === "done"), [issues]);
  const inProgressTasks = useMemo(() => issues.filter((i) => i.status === "in_progress"), [issues]);
  const inReviewTasks = useMemo(() => issues.filter((i) => i.status === "in_review"), [issues]);
  const blockedTasks = useMemo(() => issues.filter((i) => i.status === "blocked"), [issues]);
  const todoTasks = useMemo(() => issues.filter((i) => i.status === "todo"), [issues]);
  const openTasks = useMemo(
    () => issues.filter((i) => i.status !== "done" && i.status !== "cancelled"),
    [issues],
  );

  const activeAgentIds = useMemo(() => {
    const ids = new Set<string>();
    for (const task of openTasks) {
      if (task.assigneeAgentId) ids.add(task.assigneeAgentId);
    }
    // Also add agents from active live heartbeat runs matching project issues
    const projectIssueIds = new Set(issues.map((i) => i.id));
    for (const run of liveRunsQuery.data ?? []) {
      if (run.issueId && projectIssueIds.has(run.issueId) && run.agentId) {
        ids.add(run.agentId);
      }
    }
    return ids;
  }, [openTasks, liveRunsQuery.data, issues]);

  const activeAgents = useMemo(() => {
    return Array.from(activeAgentIds)
      .map((id) => agentById.get(id))
      .filter((a): a is Agent => Boolean(a));
  }, [activeAgentIds, agentById]);

  // Overall project status
  const projectStatus = useMemo(() => {
    if (blockedTasks.length > 0) {
      return {
        label: "Blocked / Action Required",
        tone: "blocked",
        badge: statusBadgeInfo("blocked"),
        description: `${blockedTasks.length} task${blockedTasks.length > 1 ? "s are" : " is"} blocked.`,
      };
    }
    if (inProgressTasks.length > 0) {
      return {
        label: "In Progress",
        tone: "in_progress",
        badge: statusBadgeInfo("in_progress"),
        description: `${inProgressTasks.length} active task${inProgressTasks.length > 1 ? "s" : ""} running across ${activeAgentIds.size} agents.`,
      };
    }
    if (issues.length > 0 && openTasks.length === 0) {
      return {
        label: "Completed",
        tone: "completed",
        badge: statusBadgeInfo("done"),
        description: "All planned deliverables and tasks are finished.",
      };
    }
    if (issues.length > 0) {
      return {
        label: "Active",
        tone: "active",
        badge: statusBadgeInfo("in_progress"),
        description: `${openTasks.length} pending task${openTasks.length > 1 ? "s" : ""} queued.`,
      };
    }
    return {
      label: "Ready for Work",
      tone: "ready",
      badge: statusBadgeInfo("todo"),
      description: "No tasks have started yet. Assign tasks to launch autonomous execution.",
    };
  }, [blockedTasks, inProgressTasks, issues, openTasks, activeAgentIds]);

  const completionPercentage = useMemo(() => {
    if (issues.length === 0) return 0;
    return Math.round((completedTasks.length / issues.length) * 100);
  }, [completedTasks.length, issues.length]);

  const totalWorkspaceFiles = workspaceFilesQuery.data?.length ?? 0;
  const newOrModifiedFiles = (workspaceFilesQuery.data ?? []).filter((f) => f.is_new || f.is_modified).length;

  // Last Activity info
  const lastActivity = useMemo(() => {
    if (issues.length === 0 && (workspaceFilesQuery.data ?? []).length === 0) {
      return { time: "No activity yet", note: "Awaiting task assignment" };
    }
    // Find newest task update
    const sortedIssues = [...issues].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    const newestIssue = sortedIssues[0];
    if (newestIssue) {
      const agent = newestIssue.assigneeAgentId ? agentById.get(newestIssue.assigneeAgentId) : null;
      const agentName = agent ? agent.name : "Agent";
      return {
        time: formattedRelativeTime(newestIssue.updatedAt),
        note: `${agentName} updated "${newestIssue.title}" (${statusBadgeInfo(newestIssue.status).label})`,
      };
    }
    return { time: "Recently", note: "Project files synchronized" };
  }, [issues, workspaceFilesQuery.data, agentById]);

  /* ── Activity Stream Synthesis (Tasks, Delegations, Events) ── */

  const activityFeed = useMemo<ActivityFeedItem[]>(() => {
    const items: ActivityFeedItem[] = [];

    // Synthesize events from issues
    for (const issue of issues) {
      const agent = issue.assigneeAgentId ? agentById.get(issue.assigneeAgentId) : null;
      const parentIssue = issue.parentId ? issueById.get(issue.parentId) : null;
      const parentAgent = parentIssue?.assigneeAgentId ? agentById.get(parentIssue.assigneeAgentId) : null;

      // Delegation event: parent issue assignee -> child issue assignee
      if (issue.parentId && parentAgent && agent && parentAgent.id !== agent.id) {
        items.push({
          id: `delegation-${issue.id}`,
          type: "delegation",
          timestamp: issue.createdAt,
          agentId: agent.id,
          agentName: agent.name,
          agentRole: agent.role ?? undefined,
          fromAgentName: parentAgent.name,
          toAgentName: agent.name,
          issueId: issue.id,
          issueIdentifier: issue.identifier,
          issueTitle: issue.title,
          priority: issue.priority,
          status: issue.status,
          message: `${parentAgent.name} delegated "${issue.title}" to ${agent.name}`,
        });
      }

      // Lifecycle status events
      if (issue.status === "in_progress") {
        items.push({
          id: `in_progress-${issue.id}`,
          type: "started",
          timestamp: issue.updatedAt,
          agentId: agent?.id,
          agentName: agent?.name,
          agentRole: agent?.role ?? undefined,
          issueId: issue.id,
          issueIdentifier: issue.identifier,
          issueTitle: issue.title,
          priority: issue.priority,
          status: issue.status,
          message: `${agent?.name ?? "Specialist"} started working on "${issue.title}"`,
        });
      } else if (issue.status === "done") {
        items.push({
          id: `done-${issue.id}`,
          type: "completed",
          timestamp: issue.updatedAt,
          agentId: agent?.id,
          agentName: agent?.name,
          agentRole: agent?.role ?? undefined,
          issueId: issue.id,
          issueIdentifier: issue.identifier,
          issueTitle: issue.title,
          priority: issue.priority,
          status: issue.status,
          message: `${agent?.name ?? "Specialist"} completed "${issue.title}"`,
        });
      } else if (issue.status === "blocked") {
        items.push({
          id: `blocked-${issue.id}`,
          type: "blocked",
          timestamp: issue.updatedAt,
          agentId: agent?.id,
          agentName: agent?.name,
          agentRole: agent?.role ?? undefined,
          issueId: issue.id,
          issueIdentifier: issue.identifier,
          issueTitle: issue.title,
          priority: issue.priority,
          status: issue.status,
          message: `Task "${issue.title}" is blocked`,
        });
      } else if (issue.status === "in_review") {
        items.push({
          id: `review-${issue.id}`,
          type: "review",
          timestamp: issue.updatedAt,
          agentId: agent?.id,
          agentName: agent?.name,
          agentRole: agent?.role ?? undefined,
          issueId: issue.id,
          issueIdentifier: issue.identifier,
          issueTitle: issue.title,
          priority: issue.priority,
          status: issue.status,
          message: `${agent?.name ?? "Specialist"} submitted "${issue.title}" for review`,
        });
      } else {
        items.push({
          id: `created-${issue.id}`,
          type: "created",
          timestamp: issue.createdAt,
          agentId: agent?.id,
          agentName: agent?.name,
          agentRole: agent?.role ?? undefined,
          issueId: issue.id,
          issueIdentifier: issue.identifier,
          issueTitle: issue.title,
          priority: issue.priority,
          status: issue.status,
          message: `Task "${issue.title}" assigned to ${agent?.name ?? "Specialist"}`,
        });
      }
    }

    // Sort newest first
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [issues, agentById, issueById]);

  /* ── Team Members Ledger Synthesis ── */

  const teamMembers = useMemo(() => {
    const workspaceFiles = workspaceFilesQuery.data ?? [];
    return agents.map((agent) => {
      const agentTasks = issues.filter((i) => i.assigneeAgentId === agent.id);
      const activeTask =
        agentTasks.find((i) => i.status === "in_progress") ??
        agentTasks.find((i) => i.status === "todo") ??
        null;
      const completedCount = agentTasks.filter((i) => i.status === "done").length;
      const blockedCount = agentTasks.filter((i) => i.status === "blocked").length;

      // Status
      const hasLiveHeartbeat = (liveRunsQuery.data ?? []).some((r) => r.agentId === agent.id);
      let status: "active" | "waiting" | "blocked" | "idle" = "idle";
      if (hasLiveHeartbeat || agentTasks.some((i) => i.status === "in_progress")) {
        status = "active";
      } else if (blockedCount > 0) {
        status = "blocked";
      } else if (agentTasks.some((i) => i.status === "todo" || i.status === "in_review")) {
        status = "waiting";
      }

      // Outputs attribution
      const authorFiles = workspaceFiles.filter((f) => {
        const fileAgent = f.agent.toLowerCase();
        return (
          fileAgent === agent.name.toLowerCase() ||
          (agent.role && fileAgent === agent.role.toLowerCase())
        );
      });
      const filesCreated = authorFiles.filter((f) => f.is_new).length;
      const filesModified = authorFiles.filter((f) => f.is_modified).length;

      return {
        id: agent.id,
        name: agent.name,
        role: agent.role ?? "AI Specialist",
        status,
        totalTasks: agentTasks.length,
        completedTasks: completedCount,
        activeTask,
        filesCreated,
        filesModified,
        totalOutputs: authorFiles.length,
      };
    });
  }, [agents, issues, liveRunsQuery.data, workspaceFilesQuery.data]);

  /* ── Task Creation Dialog State ── */

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [dialogAgentId, setDialogAgentId] = useState("");
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");
  const [dialogPriority, setDialogPriority] = useState<"urgent" | "high" | "normal" | "low">("normal");

  const openAssignTaskDialog = (preferredRole?: "ceo" | "pm") => {
    let targetAgent: Agent | undefined;
    let suggestedTitle = "";
    let suggestedDescription = "";

    if (preferredRole === "ceo") {
      targetAgent = agents.find(
        (a) => /ceo/i.test(a.name) || /ceo/i.test(a.role ?? ""),
      );
      suggestedTitle = "Initial Project Vision & Leadership Plan";
      suggestedDescription =
        "Analyze the project brief, define technical roadmap, and delegate architectural analysis to Solution Architect and Project Manager.";
    } else if (preferredRole === "pm") {
      targetAgent = agents.find(
        (a) => /project manager|pm/i.test(a.name) || /project manager|pm/i.test(a.role ?? ""),
      );
      suggestedTitle = "Decompose Requirements & Task Breakdown";
      suggestedDescription =
        "Review requirements, plan implementation tasks, and delegate actionable issues to specialist agents.";
    }

    if (!targetAgent && agents.length > 0) {
      targetAgent = agents[0];
    }

    setDialogAgentId(targetAgent?.id ?? "");
    setDialogTitle(suggestedTitle);
    setDialogDescription(suggestedDescription);
    setDialogPriority("high");
    setTaskDialogOpen(true);
  };

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      if (!dialogTitle.trim() || !dialogAgentId) {
        throw new Error("Please specify task title and select an assignee agent.");
      }
      return issuesApi.create(companyId, {
        projectId: project.id,
        title: dialogTitle.trim(),
        description: dialogDescription.trim() || null,
        assigneeAgentId: dialogAgentId,
        priority: dialogPriority,
        status: "todo",
        idempotencyKey: crypto.randomUUID(),
      });
    },
    onSuccess: (issue) => {
      setTaskDialogOpen(false);
      setDialogTitle("");
      setDialogDescription("");
      setDialogAgentId("");
      void queryClient.invalidateQueries({ queryKey: queryKeys.issues.listByProject(companyId, project.id) });
      pushToast({
        title: "Task assigned successfully",
        tone: "success",
        action: { label: "Open Task", href: issueHref(issue) },
      });
    },
    onError: (err: any) => {
      pushToast({
        title: "Failed to create task",
        description: err?.message || "An unexpected error occurred.",
        tone: "error",
      });
    },
  });

  const issueHref = (issue: { id: string; identifier?: string | null }) => {
    return `/issues/${issue.id}`;
  };

  /* ── Tasks Tab Filter State ── */

  const [taskSearch, setTaskSearch] = useState("");
  const [taskAgentFilter, setTaskAgentFilter] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("");
  const [taskSort, setTaskSort] = useState<"newest" | "oldest" | "title" | "priority">("newest");

  const visibleTasks = useMemo(() => {
    return issues
      .filter((issue) => {
        const text = `${issue.title} ${issue.identifier ?? ""} ${issue.description ?? ""}`.toLowerCase();
        if (taskSearch && !text.includes(taskSearch.toLowerCase())) return false;
        if (taskAgentFilter && issue.assigneeAgentId !== taskAgentFilter) return false;
        if (taskStatusFilter && issue.status !== taskStatusFilter) return false;
        if (taskPriorityFilter && (issue.priority ?? "normal") !== taskPriorityFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (taskSort === "title") return a.title.localeCompare(b.title);
        if (taskSort === "priority") return (b.priority ?? "").localeCompare(a.priority ?? "");
        if (taskSort === "oldest") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [issues, taskSearch, taskAgentFilter, taskStatusFilter, taskPriorityFilter, taskSort]);

  /* ── Activity Tab Filter State ── */

  const [activityFilter, setActivityFilter] = useState<"all" | "delegation" | "started" | "completed" | "blocked">("all");
  const [activityAgentFilter, setActivityAgentFilter] = useState("");
  const [activitySearch, setActivitySearch] = useState("");

  const filteredActivity = useMemo(() => {
    return activityFeed.filter((item) => {
      if (activityFilter !== "all" && item.type !== activityFilter) return false;
      if (activityAgentFilter && item.agentId !== activityAgentFilter) return false;
      if (activitySearch) {
        const q = activitySearch.toLowerCase();
        if (
          !item.message.toLowerCase().includes(q) &&
          !item.issueTitle.toLowerCase().includes(q) &&
          !(item.issueIdentifier ?? "").toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [activityFeed, activityFilter, activityAgentFilter, activitySearch]);

  /* ── Team Drilldown State ── */

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const selectedAgent = useMemo(() => {
    if (!selectedAgentId) return null;
    return teamMembers.find((a) => a.id === selectedAgentId) ?? null;
  }, [selectedAgentId, teamMembers]);

  /* ── Export Executive Report ── */

  const exportExecutiveReport = () => {
    const report = `# AI Project Status Report — ${project.name}
Generated: ${new Date().toISOString()}

## Executive Summary
- Project Status: ${projectStatus.label}
- Progress: ${completionPercentage}% (${completedTasks.length}/${issues.length} tasks completed)
- Active AI Specialists: ${activeAgents.length}
- Deliverables Created: ${totalWorkspaceFiles} workspace files (${newOrModifiedFiles} new/modified)
- Last Activity: ${lastActivity.time} — ${lastActivity.note}

## Tasks Breakdown
${issues
  .map(
    (i) =>
      `- [${i.status.toUpperCase()}] ${i.identifier ?? i.id.slice(0, 8)}: ${i.title} (Assignee: ${
        agentById.get(i.assigneeAgentId ?? "")?.name ?? "Unassigned"
      }, Priority: ${i.priority ?? "normal"})`,
  )
  .join("\n")}

## AI Team Roster
${teamMembers
  .map(
    (a) =>
      `- ${a.name} (${a.role}): ${a.completedTasks}/${a.totalTasks} tasks completed · Status: ${a.status.toUpperCase()}`,
  )
  .join("\n")}
`;

    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-status-report.md`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast({ title: "Project status report downloaded", tone: "success" });
  };

  /* ─────────────────────────────────────────────────────────────────────────────
     SHARED COMPONENT: TOP SUMMARY AREA (Requirement 3)
     ───────────────────────────────────────────────────────────────────────────── */

  const renderTopSummaryArea = () => {
    return (
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs" aria-label="Project Status Summary">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Project Identity & Health */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-foreground truncate">{project.name}</h1>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${projectStatus.badge.className}`}>
                  <span className={`h-2 w-2 rounded-full ${projectStatus.badge.dotColor} ${projectStatus.tone === "in_progress" ? "motion-safe:animate-pulse" : ""}`} />
                  {projectStatus.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{projectStatus.description}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => openAssignTaskDialog()}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Assign Task
            </Button>
            <Button size="sm" variant="outline" onClick={exportExecutiveReport} title="Export executive markdown report">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export Report
            </Button>
            <Button size="sm" variant="outline" asChild title="Open 3D Virtual AI Company Office">
              <Link to="/office">
                <Building2 className="mr-1.5 h-3.5 w-3.5 text-primary" /> 3D Office
              </Link>
            </Button>
          </div>
        </div>

        {/* 5 KPI Metric Strip */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4 border-t border-border/60">
          {/* Project Status */}
          <div className="rounded-lg bg-muted/40 p-3">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Project Status</span>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm font-bold text-foreground truncate">{projectStatus.label}</span>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <span className="mt-1 text-[11px] text-muted-foreground truncate block">
              {completionPercentage}% completed
            </span>
          </div>

          {/* Active Agents */}
          <div className="rounded-lg bg-muted/40 p-3">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Active Agents</span>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xl font-bold text-foreground tabular-nums">{activeAgents.length}</span>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <span className="mt-1 text-[11px] text-muted-foreground truncate block">
              Of {agents.length} specialist agents
            </span>
          </div>

          {/* Open Tasks */}
          <div className="rounded-lg bg-muted/40 p-3">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Open Tasks</span>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xl font-bold text-foreground tabular-nums">{openTasks.length}</span>
              <ListTodo className="h-4 w-4 text-amber-500" />
            </div>
            <span className="mt-1 text-[11px] text-muted-foreground truncate block">
              {completedTasks.length} of {issues.length} done
            </span>
          </div>

          {/* Outputs */}
          <div className="rounded-lg bg-muted/40 p-3">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Outputs</span>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xl font-bold text-foreground tabular-nums">{totalWorkspaceFiles}</span>
              <FileCode className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="mt-1 text-[11px] text-muted-foreground truncate block">
              {newOrModifiedFiles} new / modified files
            </span>
          </div>

          {/* Last Activity */}
          <div className="rounded-lg bg-muted/40 p-3 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Last Activity</span>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground truncate">{lastActivity.time}</span>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="mt-1 text-[11px] text-muted-foreground truncate block" title={lastActivity.note}>
              {lastActivity.note}
            </span>
          </div>
        </div>
      </section>
    );
  };

  /* ─────────────────────────────────────────────────────────────────────────────
     EMPTY STATE (Requirement 2)
     ───────────────────────────────────────────────────────────────────────────── */

  const renderEmptyState = () => {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
          <Bot className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-foreground">No active work yet</h3>
        <p className="mx-auto mt-1.5 max-w-md text-xs text-muted-foreground leading-relaxed">
          This project is ready, but no native Paperclip task has started. Assign tasks to initiate planning,
          specification, and implementation by autonomous AI specialists.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button size="sm" onClick={() => openAssignTaskDialog("ceo")} className="gap-1.5">
            <Sparkles className="h-4 w-4" /> Assign Task to CEO
          </Button>
          <Button size="sm" variant="secondary" onClick={() => openAssignTaskDialog("pm")} className="gap-1.5">
            <UserCheck className="h-4 w-4" /> Assign Task to Project Manager
          </Button>
          <Button size="sm" variant="outline" onClick={() => onNavigateTab?.("tasks")} className="gap-1.5">
            <ListChecks className="h-4 w-4" /> Open Task Board
          </Button>
        </div>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────────────────────
     ACTION CENTER & ATTENTION ITEMS (Requirement 4)
     ───────────────────────────────────────────────────────────────────────────── */

  const renderActionCenter = () => {
    if (blockedTasks.length === 0 && inReviewTasks.length === 0) return null;

    return (
      <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 shadow-xs" aria-label="Action Center">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Action Center ({blockedTasks.length + inReviewTasks.length} items needing attention)</span>
        </div>

        <div className="mt-3 space-y-2.5">
          {/* Blocked Tasks */}
          {blockedTasks.map((task) => {
            const agent = task.assigneeAgentId ? agentById.get(task.assigneeAgentId) : null;
            return (
              <div
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/20 bg-background/90 p-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{task.title}</span>
                    <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-red-600 dark:text-red-400">
                      Blocked
                    </span>
                    {task.identifier && <span className="font-mono text-muted-foreground text-[10px]">({task.identifier})</span>}
                  </div>
                  <p className="text-muted-foreground">
                    Assigned to {agent?.name ?? "Specialist"}. Check logs or unblock dependencies to resume work.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" asChild className="h-7 text-xs border-red-500/30 text-red-600 hover:bg-red-500/10">
                    <Link to={issueHref(task)}>Inspect Task</Link>
                  </Button>
                </div>
              </div>
            );
          })}

          {/* In Review Tasks */}
          {inReviewTasks.map((task) => {
            const agent = task.assigneeAgentId ? agentById.get(task.assigneeAgentId) : null;
            return (
              <div
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/20 bg-background/90 p-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{task.title}</span>
                    <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400">
                      Waiting Review
                    </span>
                    {task.identifier && <span className="font-mono text-muted-foreground text-[10px]">({task.identifier})</span>}
                  </div>
                  <p className="text-muted-foreground">
                    Submitted by {agent?.name ?? "Specialist"} for deliverable verification.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" asChild className="h-7 text-xs">
                    <Link to={issueHref(task)}>Review Deliverable</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  /* ─────────────────────────────────────────────────────────────────────────────
     TAB 1: OVERVIEW PAGE
     ───────────────────────────────────────────────────────────────────────────── */

  if (currentTab === "overview") {
    return (
      <div className="space-y-6" data-testid="project-overview">
        {renderTopSummaryArea()}

        {issues.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {renderActionCenter()}

            {/* Current Activity + Recent Outputs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Current Activity (7 cols) */}
              <section className="lg:col-span-7 rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                      <Activity className="h-4 w-4 text-primary" />
                      Current Activity Feed
                    </h3>
                    {onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab("activity")}
                        className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                      >
                        View Full Activity <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {activityFeed.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-8 text-center">
                      No agent activity recorded yet.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {activityFeed.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-2.5 text-xs hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                            {item.type === "delegation" ? (
                              <Users className="h-3.5 w-3.5 text-blue-500" />
                            ) : item.type === "completed" ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            ) : item.type === "blocked" ? (
                              <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                            ) : (
                              <Bot className="h-3.5 w-3.5 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-foreground truncate">
                                {item.agentName ?? "Specialist Agent"}
                              </span>
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {formattedRelativeTime(item.timestamp)}
                              </span>
                            </div>
                            <p className="mt-0.5 text-muted-foreground text-[11px] leading-relaxed">
                              {item.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>Live heartbeat polling active</span>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab("activity")}
                      className="text-primary hover:underline font-medium"
                    >
                      {activityFeed.length} total events
                    </button>
                  )}
                </div>
              </section>

              {/* Recent Outputs (5 cols) */}
              <section className="lg:col-span-5 rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                      <FileCode className="h-4 w-4 text-primary" />
                      Recent Outputs & Deliverables
                    </h3>
                    {onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab("outputs")}
                        className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                      >
                        Explore Outputs <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {(workspaceFilesQuery.data ?? []).length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      <FileCode2 className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="font-medium text-foreground">No outputs generated yet</p>
                      <p className="mt-1 text-[11px]">Artifacts and files will appear here as agents execute tasks.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/40 font-mono text-xs">
                      {(workspaceFilesQuery.data ?? []).slice(0, 5).map((file) => (
                        <div key={file.path} className="py-2.5 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground truncate" title={file.path}>
                              {file.path}
                            </p>
                            <span className="font-sans text-[10px] text-muted-foreground">
                              By {file.agent} · {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <div>
                            {file.is_new ? (
                              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-sans font-semibold text-emerald-600 dark:text-emerald-400">
                                NEW
                              </span>
                            ) : file.is_modified ? (
                              <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-sans font-semibold text-amber-600 dark:text-amber-400">
                                MODIFIED
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>{totalWorkspaceFiles} workspace deliverables</span>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab("outputs")}
                      className="text-primary hover:underline font-medium"
                    >
                      Open Outputs
                    </button>
                  )}
                </div>
              </section>
            </div>

            {/* Team Snapshot (Requirement 4) */}
            <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    Team Snapshot
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Specialist AI agents assigned to deliver this software project.
                  </p>
                </div>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab("team")}
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    View Team Ledger <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {teamMembers.map((member) => {
                  const badge = statusBadgeInfo(member.status);
                  return (
                    <div
                      key={member.id}
                      onClick={() => setSelectedAgentId(member.id)}
                      className="flex flex-col justify-between rounded-lg border border-border/80 bg-background/60 p-3 hover:border-border hover:bg-muted/20 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                            <Bot className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-foreground truncate">{member.name}</p>
                            <span className="text-[10px] text-muted-foreground truncate block">{member.role}</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[9px] font-semibold shrink-0 ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="mt-3 border-t border-border/50 pt-2 text-[10px]">
                        <span className="text-muted-foreground block truncate">
                          {member.activeTask ? `Working on: ${member.activeTask.title}` : "No active task"}
                        </span>
                        <div className="mt-1 flex items-center justify-between text-muted-foreground">
                          <span>{member.completedTasks} completed</span>
                          <span>{member.totalOutputs} outputs</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* Task Creation Dialog */}
        {renderTaskDialog()}
        {renderAgentDrilldownDrawer()}
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────────
     TAB 2: ACTIVITY FEED PAGE (Requirement 6)
     ───────────────────────────────────────────────────────────────────────────── */

  if (currentTab === "activity") {
    return (
      <div className="space-y-6" data-testid="project-activity">
        {renderTopSummaryArea()}

        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Live Agent Activity & Delegations
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time stream of agent task assignments, inter-agent delegations, and execution milestones.
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2.5 pb-4 border-b border-border/60">
            {/* Search */}
            <div className="relative min-w-44 flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="h-8 pl-8 text-xs"
                placeholder="Search activity events..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div className="flex rounded-md border border-border bg-muted/40 p-0.5 text-xs">
              {(
                [
                  { key: "all", label: "All" },
                  { key: "delegation", label: "Delegations" },
                  { key: "started", label: "Started" },
                  { key: "completed", label: "Completed" },
                  { key: "blocked", label: "Blocked" },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setActivityFilter(f.key)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    activityFilter === f.key
                      ? "bg-background font-semibold text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Agent Filter */}
            <select
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs"
              value={activityAgentFilter}
              onChange={(e) => setActivityAgentFilter(e.target.value)}
            >
              <option value="">All Agents</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Activity Timeline List */}
          <div className="mt-4">
            {filteredActivity.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <Activity className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="font-semibold text-foreground">No events found</p>
                <p className="mt-1">Events will appear as agents begin delegating and executing tasks.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-card p-3.5 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                        {item.type === "delegation" ? (
                          <Users className="h-4 w-4 text-blue-500" />
                        ) : item.type === "completed" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : item.type === "blocked" ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <Bot className="h-4 w-4 text-primary" />
                        )}
                      </div>

                      <div className="min-w-0">
                        {item.type === "delegation" ? (
                          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-foreground">
                            <span>{item.fromAgentName}</span>
                            <ArrowRight className="h-3 w-3 text-primary" />
                            <span>{item.toAgentName}</span>
                            <span className="rounded bg-blue-500/15 px-1.5 py-0.2 text-[10px] text-blue-700 dark:text-blue-300">
                              Delegation
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-foreground">
                              {item.agentName ?? "Specialist Agent"}
                            </span>
                            {item.agentRole && (
                              <span className="text-[10px] text-muted-foreground">({item.agentRole})</span>
                            )}
                          </div>
                        )}

                        <p className="mt-1 text-xs text-foreground font-medium">
                          {item.message}
                        </p>

                        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                          {item.issueIdentifier && (
                            <span className="bg-muted px-1.5 py-0.2 rounded">{item.issueIdentifier}</span>
                          )}
                          <Link to={`/issues/${item.issueId}`} className="hover:text-primary hover:underline">
                            View Task Details →
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-muted-foreground">
                        {formattedDateTime(item.timestamp)}
                      </span>
                      <span className="block text-[10px] text-muted-foreground/70">
                        {formattedRelativeTime(item.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {renderTaskDialog()}
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────────
     TAB 3: TASKS PAGE (Requirement 7)
     ───────────────────────────────────────────────────────────────────────────── */

  if (currentTab === "tasks") {
    return (
      <div className="space-y-6" data-testid="project-tasks">
        {renderTopSummaryArea()}

        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-primary" />
                Project Tasks & Native Assignments
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Native Paperclip execution tasks, assignments, dependencies, and real-time status.
              </p>
            </div>

            <Button size="sm" onClick={() => openAssignTaskDialog()}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Task
            </Button>
          </div>

          {/* Filters Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 pb-4 border-b border-border/60">
            {/* Search */}
            <div className="relative min-w-48 flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="h-8 pl-8 text-xs"
                placeholder="Search tasks by title or identifier..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
              />
            </div>

            {/* Assignee Filter */}
            <select
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs"
              value={taskAgentFilter}
              onChange={(e) => setTaskAgentFilter(e.target.value)}
            >
              <option value="">All Assignees</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs"
              value={taskStatusFilter}
              onChange={(e) => setTaskStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {["todo", "in_progress", "in_review", "blocked", "done", "cancelled"].map((s) => (
                <option key={s} value={s}>
                  {statusBadgeInfo(s).label}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs"
              value={taskPriorityFilter}
              onChange={(e) => setTaskPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>

            {/* Sort */}
            <select
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs"
              value={taskSort}
              onChange={(e) => setTaskSort(e.target.value as typeof taskSort)}
            >
              <option value="newest">Recently Updated</option>
              <option value="oldest">Oldest Updated</option>
              <option value="title">By Title</option>
              <option value="priority">By Priority</option>
            </select>
          </div>

          {/* Tasks Table (Requirement 7: Task, Assignee, Status, Priority, Parent Task, Depends On, Updated At) */}
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            {visibleTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <ListChecks className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="font-semibold text-foreground">No tasks match criteria</p>
                <p className="mt-1">Try clearing filters or assign a new task to an agent.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground text-[11px]">
                      <th className="py-2.5 px-3 font-semibold">Task</th>
                      <th className="py-2.5 px-3 font-semibold">Assignee</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold">Priority</th>
                      <th className="py-2.5 px-3 font-semibold">Parent Task</th>
                      <th className="py-2.5 px-3 font-semibold">Depends On</th>
                      <th className="py-2.5 px-3 font-semibold">Updated At</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {visibleTasks.map((task) => {
                      const badge = statusBadgeInfo(task.status);
                      const assignedAgent = task.assigneeAgentId ? agentById.get(task.assigneeAgentId) : null;
                      const parentTask = task.parentId ? issueById.get(task.parentId) : null;
                      const blockersCount = (task as any).blockedBy?.length ?? 0;

                      return (
                        <tr key={task.id} className="hover:bg-muted/20 transition-colors">
                          {/* Task */}
                          <td className="py-3 px-3 max-w-xs">
                            <div className="min-w-0">
                              <span className="font-mono text-[10px] text-muted-foreground block">
                                {task.identifier ?? task.id.slice(0, 8)}
                              </span>
                              <Link
                                to={issueHref(task)}
                                className="font-medium text-foreground hover:text-primary hover:underline truncate block"
                                title={task.title}
                              >
                                {task.title}
                              </Link>
                            </div>
                          </td>

                          {/* Assignee */}
                          <td className="py-3 px-3">
                            {assignedAgent ? (
                              <div className="flex items-center gap-1.5">
                                <Bot className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="font-medium text-foreground truncate max-w-[120px]">
                                  {assignedAgent.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Unassigned</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[10px] font-semibold ${badge.className}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${badge.dotColor}`} />
                              {badge.label}
                            </span>
                          </td>

                          {/* Priority */}
                          <td className="py-3 px-3">
                            <span className={`rounded px-1.5 py-0.2 text-[10px] font-semibold uppercase ${priorityBadgeInfo(task.priority)}`}>
                              {task.priority ?? "normal"}
                            </span>
                          </td>

                          {/* Parent Task */}
                          <td className="py-3 px-3 max-w-[140px] truncate text-muted-foreground">
                            {parentTask ? (
                              <Link
                                to={issueHref(parentTask)}
                                className="hover:text-primary hover:underline text-[11px]"
                                title={parentTask.title}
                              >
                                {parentTask.identifier ?? parentTask.title}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground/60">—</span>
                            )}
                          </td>

                          {/* Depends On */}
                          <td className="py-3 px-3 text-muted-foreground">
                            {blockersCount > 0 ? (
                              <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                {blockersCount} blocker{blockersCount > 1 ? "s" : ""}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/60">None</span>
                            )}
                          </td>

                          {/* Updated At */}
                          <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                            {formattedDateTime(task.updatedAt)}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right">
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-primary" asChild>
                              <Link to={issueHref(task)}>Open</Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {renderTaskDialog()}
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────────
     TAB 4: TEAM PAGE (Requirement 9)
     ───────────────────────────────────────────────────────────────────────────── */

  if (currentTab === "team") {
    const totalTeamTasks = teamMembers.reduce((sum, m) => sum + m.totalTasks, 0);
    const totalTeamDone = teamMembers.reduce((sum, m) => sum + m.completedTasks, 0);
    const totalTeamFiles = teamMembers.reduce((sum, m) => sum + m.totalOutputs, 0);

    return (
      <div className="space-y-6" data-testid="project-team">
        {renderTopSummaryArea()}

        {/* Team Roster Summary */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Team Size</span>
            <p className="mt-1 text-xl font-bold text-foreground">{teamMembers.length}</p>
            <span className="text-[11px] text-muted-foreground">Specialist AI Agents</span>
          </div>

          <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Tasks Assigned</span>
            <p className="mt-1 text-xl font-bold text-foreground">{totalTeamTasks}</p>
            <span className="text-[11px] text-muted-foreground">Across project lifecycle</span>
          </div>

          <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Completed Tasks</span>
            <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">{totalTeamDone}</p>
            <span className="text-[11px] text-muted-foreground">Verified & merged</span>
          </div>

          <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Deliverables</span>
            <p className="mt-1 text-xl font-bold text-blue-600 dark:text-blue-400">{totalTeamFiles}</p>
            <span className="text-[11px] text-muted-foreground">Workspace code files</span>
          </div>
        </section>

        {/* Team Table */}
        <section className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-border/80 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                AI Agent Team Ledger
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Overview of all specialist agents, current assignments, completed tasks, and code contributions.
              </p>
            </div>
            <Button size="sm" onClick={() => openAssignTaskDialog()}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Delegate Task
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground text-[11px]">
                  <th className="py-2.5 px-3 font-semibold">Agent Name</th>
                  <th className="py-2.5 px-3 font-semibold">Role</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Current Task</th>
                  <th className="py-2.5 px-3 font-semibold">Tasks Completed</th>
                  <th className="py-2.5 px-3 font-semibold">Files Created</th>
                  <th className="py-2.5 px-3 font-semibold">Files Modified</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {teamMembers.map((member) => {
                  const badge = statusBadgeInfo(member.status);
                  return (
                    <tr key={member.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 font-semibold text-foreground flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                        {member.name}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{member.role}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[10px] font-semibold ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-xs truncate text-muted-foreground">
                        {member.activeTask ? (
                          <Link to={issueHref(member.activeTask)} className="hover:text-primary hover:underline">
                            {member.activeTask.title}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground/60">Idle</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold">
                        {member.completedTasks} / {member.totalTasks}
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-600 dark:text-emerald-400">
                        +{member.filesCreated}
                      </td>
                      <td className="py-3 px-3 font-mono text-amber-600 dark:text-amber-400">
                        ~{member.filesModified}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs text-primary"
                          onClick={() => setSelectedAgentId(member.id)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {renderTaskDialog()}
        {renderAgentDrilldownDrawer()}
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────────
     TAB 5: HISTORY PAGE (More -> History)
     ───────────────────────────────────────────────────────────────────────────── */

  if (currentTab === "history") {
    return (
      <div className="space-y-6" data-testid="project-history">
        {renderTopSummaryArea()}

        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                Audit History & Task Logs
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete audit ledger of task transitions, delegations, and agent executions.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={exportExecutiveReport}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export Log File
            </Button>
          </div>

          <div className="h-96 overflow-y-auto rounded-lg border border-border/80 bg-zinc-950 p-3.5 font-mono text-xs text-zinc-100 select-text">
            {activityFeed.length === 0 ? (
              <p className="text-zinc-500 py-10 text-center">No audit entries found.</p>
            ) : (
              activityFeed.map((entry) => (
                <div key={entry.id} className="py-1.5 flex items-start gap-2 border-b border-zinc-900/60 last:border-b-0">
                  <span className="text-[10px] text-zinc-500 shrink-0 select-none">
                    {new Date(entry.timestamp).toLocaleTimeString("en-US")}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase shrink-0 ${
                      entry.type === "blocked"
                        ? "bg-red-500/20 text-red-400"
                        : entry.type === "completed"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : entry.type === "delegation"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {entry.type}
                  </span>
                  {entry.agentName && <span className="text-zinc-400 text-[10px] font-semibold">[{entry.agentName}]</span>}
                  <span className="break-all leading-relaxed text-zinc-200">{entry.message}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {renderTaskDialog()}
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────────
     RENDER: TASK CREATION DIALOG
     ───────────────────────────────────────────────────────────────────────────── */

  function renderTaskDialog() {
    return (
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Native Task</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Create a native Paperclip task and assign it to an AI agent. The agent will execute this task autonomously.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Task Title</label>
              <Input
                placeholder="e.g., Define architecture specifications"
                value={dialogTitle}
                onChange={(e) => setDialogTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Assignee Agent</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                value={dialogAgentId}
                onChange={(e) => setDialogAgentId(e.target.value)}
              >
                <option value="">Select an Agent...</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.role ?? "Agent"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Priority</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                value={dialogPriority}
                onChange={(e) => setDialogPriority(e.target.value as any)}
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Description & Instructions</label>
              <Textarea
                placeholder="Detailed prompt, instructions, and acceptance criteria..."
                value={dialogDescription}
                onChange={(e) => setDialogDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!dialogTitle.trim() || !dialogAgentId || createTaskMutation.isPending}
              onClick={() => createTaskMutation.mutate()}
            >
              {createTaskMutation.isPending ? "Assigning..." : "Assign Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────────
     RENDER: AGENT DRILLDOWN DRAWER
     ───────────────────────────────────────────────────────────────────────────── */

  function renderAgentDrilldownDrawer() {
    if (!selectedAgent) return null;
    const badge = statusBadgeInfo(selectedAgent.status);
    const agentTasks = issues.filter((i) => i.assigneeAgentId === selectedAgent.id);

    return (
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background border-l border-border shadow-2xl p-6 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{selectedAgent.name}</h3>
              <span className="text-xs text-muted-foreground">{selectedAgent.role}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedAgentId(null)}
            className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
            aria-label="Close Agent Details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Current Status</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}>
              {badge.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="rounded-lg bg-muted/40 p-3">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Completed</span>
              <p className="mt-1 text-base font-bold">{selectedAgent.completedTasks} tasks</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Deliverables</span>
              <p className="mt-1 text-base font-bold">{selectedAgent.totalOutputs} files</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Assigned Tasks ({agentTasks.length})
            </h4>
            {agentTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-3">No tasks assigned to this agent yet.</p>
            ) : (
              <div className="space-y-2">
                {agentTasks.map((task) => (
                  <div key={task.id} className="rounded-lg border border-border p-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <Link to={issueHref(task)} className="font-medium hover:text-primary hover:underline truncate">
                        {task.title}
                      </Link>
                      <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-semibold ${statusBadgeInfo(task.status).className}`}>
                        {statusBadgeInfo(task.status).label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              className="w-full gap-1.5"
              size="sm"
              onClick={() => {
                setSelectedAgentId(null);
                setDialogAgentId(selectedAgent.id);
                setTaskDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Assign New Task to {selectedAgent.name}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
