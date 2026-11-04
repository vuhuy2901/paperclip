import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Agent, Issue, Project } from "@paperclipai/shared";
import { activityApi } from "@/api/activity";
import { agentsApi } from "@/api/agents";
import { heartbeatsApi } from "@/api/heartbeats";
import { issuesApi } from "@/api/issues";
import { projectsApi } from "@/api/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { AgentIdentity } from "@/components/AgentIdentity";
import { useCompany } from "@/context/CompanyContext";
import { useDialogActions } from "@/context/DialogContext";
import { Link } from "@/lib/router";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock3,
  Filter,
  GitBranch,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";

type CenterView = "list" | "board" | "tree";
type SortKey = "updated" | "title" | "priority" | "status";

const STATUS_ORDER = ["backlog", "todo", "in_progress", "in_review", "blocked", "done"] as const;
const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  in_review: "In Review",
  blocked: "Blocked",
  done: "Done",
  cancelled: "Cancelled",
};
const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };

function issueStatus(issue: Issue) { return String(issue.status ?? "todo"); }
function statusLabel(status: string) { return STATUS_LABELS[status] ?? status.replaceAll("_", " "); }
function projectName(issue: Issue, projects: Project[]) { return projects.find((project) => project.id === issue.projectId)?.name ?? "No project"; }
function agentById(id: string | null | undefined, agents: Agent[]) { return agents.find((agent) => agent.id === id); }
function formatDate(value: string | Date | null | undefined) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}
function statusTone(status: string) {
  if (status === "done") return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
  if (status === "blocked") return "bg-red-500/10 text-red-700 border-red-500/20";
  if (status === "in_progress") return "bg-blue-500/10 text-blue-700 border-blue-500/20";
  if (status === "in_review") return "bg-violet-500/10 text-violet-700 border-violet-500/20";
  return "bg-muted text-muted-foreground border-border";
}
function priorityTone(priority: string) {
  if (priority === "urgent") return "text-red-700";
  if (priority === "high") return "text-orange-700";
  if (priority === "medium") return "text-blue-700";
  return "text-muted-foreground";
}

function Metric({ label, value, tone, icon: Icon }: { label: string; value: number; tone?: string; icon: typeof Activity }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">{label}</span>
        <Icon className={cn("h-4 w-4 text-muted-foreground", tone)} aria-hidden="true" />
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <Badge variant="outline" className={cn("gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium capitalize", statusTone(status))}><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{statusLabel(status)}</Badge>;
}

function Assignee({ agent }: { agent?: Agent }) {
  if (!agent) return <span className="text-sm text-muted-foreground">Unassigned</span>;
  return <span className="flex min-w-0 items-center gap-2"><AgentIdentity agent={agent} size="xs" /><span className="truncate text-sm">{agent.name}</span></span>;
}

function TaskRow({ issue, projects, agents, selected, onSelect, onStatus }: { issue: Issue; projects: Project[]; agents: Agent[]; selected: boolean; onSelect: () => void; onStatus: (status: string) => void }) {
  const parent = issue.parentId ? issue.parentId.slice(0, 8) : null;
  return (
    <div className={cn("grid grid-cols-[92px_minmax(240px,1.7fr)_minmax(140px,1fr)_minmax(150px,1fr)_130px_90px_110px_145px] items-center gap-3 border-b border-border/60 px-4 py-3 text-sm transition-colors hover:bg-muted/40", selected && "bg-blue-500/[0.06]")}>
      <button type="button" className="text-left font-mono text-xs font-semibold text-primary hover:underline" onClick={onSelect}>{issue.identifier ?? issue.id.slice(0, 8)}</button>
      <button type="button" className="min-w-0 text-left" onClick={onSelect}><div className="truncate font-medium text-foreground">{issue.title}</div><div className="mt-0.5 truncate text-xs text-muted-foreground">{issue.description ?? "No description"}</div></button>
      <span className="truncate text-muted-foreground">{projectName(issue, projects)}</span>
      <Assignee agent={agentById(issue.assigneeAgentId, agents)} />
      <select aria-label={`Status for ${issue.title}`} value={issueStatus(issue)} onChange={(event) => onStatus(event.target.value)} className="h-8 rounded-md border border-border bg-background px-2 text-xs" disabled={issueStatus(issue) === "in_progress"}>
        {STATUS_ORDER.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
      </select>
      <span className={cn("text-xs font-medium capitalize", priorityTone(String(issue.priority ?? "none")))}>{issue.priority ?? "none"}</span>
      <span className="font-mono text-xs text-muted-foreground">{parent ?? "None"}</span>
      <span className="text-xs text-muted-foreground">{formatDate(issue.updatedAt)}</span>
    </div>
  );
}

function BoardCard({ issue, projects, agents, onSelect }: { issue: Issue; projects: Project[]; agents: Agent[]; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} className="w-full rounded-lg border border-border/70 bg-card p-3 text-left shadow-sm transition hover:-translate-y-px hover:border-primary/40 hover:shadow-md">
      <div className="flex items-center justify-between gap-2"><span className="font-mono text-[11px] font-semibold text-primary">{issue.identifier ?? issue.id.slice(0, 8)}</span><span className={cn("text-xs font-medium capitalize", priorityTone(String(issue.priority ?? "none")))}>{issue.priority ?? "none"}</span></div>
      <div className="mt-2 line-clamp-2 text-sm font-medium text-foreground">{issue.title}</div>
      <div className="mt-3 flex items-center justify-between gap-2"><Assignee agent={agentById(issue.assigneeAgentId, agents)} /><span className="max-w-[110px] truncate text-[11px] text-muted-foreground">{projectName(issue, projects)}</span></div>
    </button>
  );
}

function DelegationNode({ issue, childrenByParent, projects, agents, selectedId, onSelect, depth = 0 }: { issue: Issue; childrenByParent: Map<string, Issue[]>; projects: Project[]; agents: Agent[]; selectedId?: string; onSelect: (issue: Issue) => void; depth?: number }) {
  const children = childrenByParent.get(issue.id) ?? [];
  const [expanded, setExpanded] = useState(depth < 2);
  const completed = children.filter((child) => issueStatus(child) === "done").length;
  return (
    <div className="relative">
      <div className={cn("flex items-center gap-3 border-b border-border/60 px-3 py-3", selectedId === issue.id && "bg-blue-500/[0.06]")} style={{ paddingLeft: `${12 + depth * 28}px` }}>
        <button type="button" className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" aria-label={expanded ? "Collapse task" : "Expand task"} onClick={() => setExpanded((value) => !value)}>{children.length ? (expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : <span className="h-1.5 w-1.5 rounded-full bg-border" />}</button>
        <button type="button" onClick={() => onSelect(issue)} className="min-w-0 flex-1 text-left"><div className="truncate text-sm font-medium">{issue.title}</div><div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span className="font-mono text-primary">{issue.identifier ?? issue.id.slice(0, 8)}</span><Assignee agent={agentById(issue.assigneeAgentId, agents)} /><span>{projectName(issue, projects)}</span></div></button>
        {children.length > 0 && <span className="text-xs text-muted-foreground">{completed}/{children.length} done</span>}
        <StatusBadge status={issueStatus(issue)} />
      </div>
      {expanded && children.map((child) => <DelegationNode key={child.id} issue={child} childrenByParent={childrenByParent} projects={projects} agents={agents} selectedId={selectedId} onSelect={onSelect} depth={depth + 1} />)}
    </div>
  );
}

function TaskDetailPanel({ issue, projects, agents, companyId, onClose }: { issue: Issue; projects: Project[]; agents: Agent[]; companyId: string; onClose: () => void }) {
  const activity = useQuery({ queryKey: ["task-center", "activity", issue.id], queryFn: () => activityApi.forIssue(issue.id), enabled: Boolean(issue.id) });
  const runs = useQuery({ queryKey: ["task-center", "runs", issue.id], queryFn: () => activityApi.runsForIssue(issue.id), enabled: Boolean(issue.id) });
  return (
    <aside className="flex min-h-0 w-full flex-col border-l border-border bg-card lg:w-[380px]" aria-label="Task details">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4"><div><div className="font-mono text-xs font-semibold text-primary">{issue.identifier ?? issue.id.slice(0, 8)}</div><h2 className="mt-1 text-base font-semibold leading-6">{issue.title}</h2></div><button type="button" onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label="Close task details"><X className="h-4 w-4" /></button></div>
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div className="flex flex-wrap gap-2"><StatusBadge status={issueStatus(issue)} /><Badge variant="outline" className="capitalize">{issue.priority ?? "none"}</Badge></div>
        <p className="text-sm leading-6 text-muted-foreground">{issue.description || "No description has been added to this task."}</p>
        <dl className="grid grid-cols-[96px_1fr] gap-x-3 gap-y-3 text-sm"><dt className="text-muted-foreground">Project</dt><dd className="truncate">{projectName(issue, projects)}</dd><dt className="text-muted-foreground">Assignee</dt><dd><Assignee agent={agentById(issue.assigneeAgentId, agents)} /></dd><dt className="text-muted-foreground">Parent</dt><dd>{issue.parentId ? <Link className="font-mono text-primary hover:underline" to={`/issues/${issue.parentId}`}>{issue.parentId.slice(0, 8)}</Link> : "None"}</dd><dt className="text-muted-foreground">Updated</dt><dd>{formatDate(issue.updatedAt)}</dd></dl>
        <div className="space-y-2"><div className="flex items-center justify-between"><h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Native records</h3><Link className="text-xs font-medium text-primary hover:underline" to={`/issues/${issue.id}`}>Open full details</Link></div><div className="grid gap-2"><Link className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted" to={`/issues/${issue.id}`}>Comments, dependencies, artifacts and child tasks</Link><Link className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted" to={`/activity?entityType=issue&entityId=${issue.id}`}>Activity history</Link></div></div>
        <div className="space-y-2"><h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Activity</h3>{activity.isLoading ? <div className="h-12 animate-pulse rounded-lg bg-muted" /> : activity.data?.length ? <div className="space-y-2">{activity.data.slice(0, 6).map((event) => <div key={event.id} className="rounded-lg bg-muted/50 px-3 py-2 text-xs"><div className="font-medium">{event.action ?? "Task updated"}</div><div className="mt-1 text-muted-foreground">{formatDate(event.createdAt)}</div></div>)}</div> : <p className="text-sm text-muted-foreground">No native activity recorded yet.</p>}</div>
        <div className="space-y-2"><h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Heartbeat runs</h3>{runs.data?.length ? runs.data.slice(0, 4).map((run) => <Link key={run.runId} to={`/activity/runs?runId=${run.runId}`} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted"><span className="font-mono">{run.runId.slice(0, 8)}</span><span className="capitalize text-muted-foreground">{run.status}</span></Link>) : <p className="text-sm text-muted-foreground">No related heartbeat runs.</p>}</div>
      </div>
    </aside>
  );
}

export function TaskCommandCenter() {
  const { selectedCompanyId } = useCompany();
  const { openNewIssue } = useDialogActions();
  const queryClient = useQueryClient();
  const [view, setView] = useState<CenterView>("list");
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<SortKey>("updated");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const issuesQuery = useQuery({ queryKey: ["task-command-center", "issues", selectedCompanyId], queryFn: () => issuesApi.listAll(selectedCompanyId!, { includeRoutineExecutions: true, includeBlockedBy: true, includeLiveDescendantSummary: true }), enabled: Boolean(selectedCompanyId), staleTime: 15_000 });
  const agentsQuery = useQuery({ queryKey: queryKeys.agents.list(selectedCompanyId!), queryFn: () => agentsApi.list(selectedCompanyId!), enabled: Boolean(selectedCompanyId) });
  const projectsQuery = useQuery({ queryKey: queryKeys.projects.list(selectedCompanyId!, { includeArchived: true }), queryFn: () => projectsApi.list(selectedCompanyId!, { includeArchived: true }), enabled: Boolean(selectedCompanyId) });
  const heartbeatQuery = useQuery({ queryKey: ["task-command-center", "heartbeats", selectedCompanyId], queryFn: () => heartbeatsApi.list(selectedCompanyId!, undefined, 100, { summary: true }), enabled: Boolean(selectedCompanyId), staleTime: 15_000 });
  const updateIssue = useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => issuesApi.update(id, { status }), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["task-command-center", "issues", selectedCompanyId] }); } });

  const agents = agentsQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const issues = issuesQuery.data ?? [];
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const result = issues.filter((issue) => {
      if (projectFilter && issue.projectId !== projectFilter) return false;
      if (agentFilter && issue.assigneeAgentId !== agentFilter) return false;
      if (statusFilter && issueStatus(issue) !== statusFilter) return false;
      if (needle && !`${issue.identifier ?? ""} ${issue.title} ${issue.description ?? ""}`.toLowerCase().includes(needle)) return false;
      return true;
    });
    return result.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "priority") return (PRIORITY_ORDER[a.priority ?? "none"] ?? 4) - (PRIORITY_ORDER[b.priority ?? "none"] ?? 4);
      if (sort === "status") return STATUS_ORDER.indexOf(issueStatus(a) as typeof STATUS_ORDER[number]) - STATUS_ORDER.indexOf(issueStatus(b) as typeof STATUS_ORDER[number]);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [agentFilter, issues, projectFilter, search, sort, statusFilter]);
  const metrics = useMemo(() => ({ total: issues.length, progress: issues.filter((issue) => issueStatus(issue) === "in_progress").length, review: issues.filter((issue) => issueStatus(issue) === "in_review").length, blocked: issues.filter((issue) => issueStatus(issue) === "blocked").length, done: issues.filter((issue) => issueStatus(issue) === "done").length }), [issues]);
  const actionRequired = useMemo(() => issues.filter((issue) => ["blocked", "in_review"].includes(issueStatus(issue)) || Boolean((issue as Issue & { activeRun?: unknown }).activeRun)), [issues]);
  const selectedIssue = issues.find((issue) => issue.id === selectedId) ?? null;
  const childrenByParent = useMemo(() => { const map = new Map<string, Issue[]>(); issues.forEach((issue) => { if (issue.parentId) map.set(issue.parentId, [...(map.get(issue.parentId) ?? []), issue]); }); return map; }, [issues]);
  const roots = useMemo(() => issues.filter((issue) => !issue.parentId || !issues.some((candidate) => candidate.id === issue.parentId)), [issues]);
  const visibleIssues = filtered.slice(0, page * pageSize);
  const hasFilters = Boolean(search || projectFilter || agentFilter || statusFilter);

  if (!selectedCompanyId) return <EmptyState icon={CircleDot} message="Select a company to view tasks." />;
  if (issuesQuery.isLoading) return <div className="space-y-5 p-6"><div className="h-8 w-64 animate-pulse rounded bg-muted" /><div className="grid gap-3 sm:grid-cols-5">{[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-muted" />)}</div><div className="h-96 animate-pulse rounded-xl bg-muted" /></div>;
  if (issuesQuery.error) return <div className="m-6 rounded-xl border border-destructive/30 bg-destructive/5 p-6"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" /><div><h2 className="font-semibold">Unable to load native tasks</h2><p className="mt-1 text-sm text-muted-foreground">{issuesQuery.error instanceof Error ? issuesQuery.error.message : "The Paperclip issues API returned an error."}</p><Button className="mt-4" variant="outline" size="sm" onClick={() => void issuesQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Retry</Button></div></div></div>;

  return (
    <div className="flex min-h-full flex-col bg-background">
      <div className="border-b border-border bg-card px-5 py-5 lg:px-8"><div className="mx-auto max-w-[1600px]"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary"><BarChart3 className="h-4 w-4" />Company operations</div><h1 className="mt-2 text-2xl font-semibold tracking-tight">Tasks</h1><p className="mt-1 text-sm text-muted-foreground">Company-wide work management from native Paperclip issues.</p></div><Button onClick={() => openNewIssue({ projectId: projectFilter || undefined, assigneeAgentId: agentFilter || undefined, priority: "medium" })}><Plus className="mr-2 h-4 w-4" />New Task</Button></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><Metric label="Total Tasks" value={metrics.total} icon={BarChart3} /><Metric label="In Progress" value={metrics.progress} tone="text-blue-600" icon={Activity} /><Metric label="In Review" value={metrics.review} tone="text-violet-600" icon={Clock3} /><Metric label="Blocked" value={metrics.blocked} tone="text-red-600" icon={ShieldAlert} /><Metric label="Completed" value={metrics.done} tone="text-emerald-600" icon={Check} /></div></div></div>
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-5 py-5 lg:px-8"><div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"><main className="min-w-0 space-y-4"><div className="rounded-xl border border-border bg-card p-3 shadow-sm"><div className="flex flex-wrap items-center gap-2"><div className="relative min-w-[220px] flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search tasks, IDs or descriptions" className="pl-9" aria-label="Search tasks" /></div><select value={projectFilter} onChange={(event) => { setProjectFilter(event.target.value); setPage(1); }} className="h-9 rounded-md border border-border bg-background px-3 text-sm" aria-label="Filter by project"><option value="">All projects</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select><select value={agentFilter} onChange={(event) => { setAgentFilter(event.target.value); setPage(1); }} className="h-9 max-w-[180px] rounded-md border border-border bg-background px-3 text-sm" aria-label="Filter by agent"><option value="">All agents</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="h-9 rounded-md border border-border bg-background px-3 text-sm" aria-label="Filter by status"><option value="">All statuses</option>{STATUS_ORDER.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select><select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="h-9 rounded-md border border-border bg-background px-3 text-sm" aria-label="Sort tasks"><option value="updated">Recently updated</option><option value="title">Title</option><option value="priority">Priority</option><option value="status">Status</option></select></div><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1" role="tablist" aria-label="Task view"><button type="button" role="tab" aria-selected={view === "list"} onClick={() => setView("list")} className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium", view === "list" && "bg-background text-foreground shadow-sm")}><List className="h-3.5 w-3.5" />List</button><button type="button" role="tab" aria-selected={view === "board"} onClick={() => setView("board")} className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium", view === "board" && "bg-background text-foreground shadow-sm")}><LayoutGrid className="h-3.5 w-3.5" />Board</button><button type="button" role="tab" aria-selected={view === "tree"} onClick={() => setView("tree")} className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium", view === "tree" && "bg-background text-foreground shadow-sm")}><GitBranch className="h-3.5 w-3.5" />Delegation tree</button></div><div className="flex items-center gap-2 text-xs text-muted-foreground"><Filter className="h-3.5 w-3.5" />{filtered.length} matching tasks{hasFilters && <button type="button" className="font-medium text-primary hover:underline" onClick={() => { setSearch(""); setProjectFilter(""); setAgentFilter(""); setStatusFilter(""); setPage(1); }}>Clear filters</button>}</div></div></div>
          {view === "list" && <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"><div className="min-w-[1100px]"><div className="grid grid-cols-[92px_minmax(240px,1.7fr)_minmax(140px,1fr)_minmax(150px,1fr)_130px_90px_110px_145px] gap-3 border-b border-border bg-muted/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"><span>Task ID</span><span>Task title</span><span>Project</span><span>Assignee</span><span>Status</span><span>Priority</span><span>Parent</span><span>Last updated</span></div>{visibleIssues.map((issue) => <TaskRow key={issue.id} issue={issue} projects={projects} agents={agents} selected={selectedId === issue.id} onSelect={() => setSelectedId(issue.id)} onStatus={(status) => { if (status !== "in_progress") updateIssue.mutate({ id: issue.id, status }); }} />)}</div>{visibleIssues.length === 0 && <div className="p-12"><EmptyState icon={Search} message={hasFilters ? "No tasks match the current filters." : "No tasks yet. Create a task and assign it to an AI agent to get started."} /></div>}{visibleIssues.length < filtered.length && <div className="flex justify-center border-t border-border p-3"><Button variant="outline" size="sm" onClick={() => setPage((value) => value + 1)}>Load more tasks</Button></div>}</div>}
          {view === "board" && <div className="grid gap-3 overflow-x-auto pb-2 md:grid-cols-3 xl:grid-cols-6">{STATUS_ORDER.map((status) => <section key={status} className="min-w-[220px] rounded-xl border border-border bg-muted/30 p-2.5"><div className="flex items-center justify-between px-1.5 py-1.5"><div className="flex items-center gap-2"><span className={cn("h-2 w-2 rounded-full", status === "done" ? "bg-emerald-500" : status === "blocked" ? "bg-red-500" : status === "in_progress" ? "bg-blue-500" : "bg-muted-foreground/50")} /><h2 className="text-xs font-semibold">{statusLabel(status)}</h2></div><span className="text-xs text-muted-foreground">{filtered.filter((issue) => issueStatus(issue) === status).length}</span></div><div className="space-y-2">{filtered.filter((issue) => issueStatus(issue) === status).map((issue) => <BoardCard key={issue.id} issue={issue} projects={projects} agents={agents} onSelect={() => setSelectedId(issue.id)} />)}</div></section>)}</div>}
          {view === "tree" && <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">{roots.length ? roots.map((issue) => <DelegationNode key={issue.id} issue={issue} childrenByParent={childrenByParent} projects={projects} agents={agents} selectedId={selectedId ?? undefined} onSelect={(next) => setSelectedId(next.id)} />) : <div className="p-12"><EmptyState icon={GitBranch} message="No parent-child task relationships yet." /></div>}</div>}
          <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Native Paperclip issues are the source of truth. Status updates use the native API.</span>{issuesQuery.isFetching && <span className="flex items-center gap-1.5"><RefreshCw className="h-3 w-3 animate-spin" />Refreshing</span>}</div>
        </main>
        <aside className="space-y-4"><section className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-semibold"><AlertTriangle className="h-4 w-4 text-orange-600" />Action required</h2><Badge variant="secondary">{actionRequired.length}</Badge></div><p className="mt-1 text-xs leading-5 text-muted-foreground">Blocked, review and actively running work that may need attention.</p><div className="mt-3 space-y-2">{actionRequired.slice(0, 6).map((issue) => <button key={issue.id} type="button" onClick={() => setSelectedId(issue.id)} className="w-full rounded-lg border border-border px-3 py-2 text-left hover:bg-muted"><div className="flex items-center justify-between gap-2"><span className="font-mono text-[11px] text-primary">{issue.identifier ?? issue.id.slice(0, 8)}</span><StatusBadge status={issueStatus(issue)} /></div><div className="mt-1 truncate text-xs font-medium">{issue.title}</div></button>)}{!actionRequired.length && <p className="py-3 text-sm text-muted-foreground">Nothing requires attention.</p>}</div></section><section className="rounded-xl border border-border bg-card p-4 shadow-sm"><h2 className="flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-primary" />Agent workload</h2><div className="mt-3 space-y-3">{agents.slice(0, 8).map((agent) => { const assigned = issues.filter((issue) => issue.assigneeAgentId === agent.id); const active = assigned.filter((issue) => issueStatus(issue) === "in_progress").length; const blocked = assigned.filter((issue) => issueStatus(issue) === "blocked").length; return <Link key={agent.id} to={`/agents/${agent.id}`} className="block rounded-lg px-2 py-1.5 hover:bg-muted"><div className="flex items-center justify-between gap-2"><Assignee agent={agent} /><span className="text-xs text-muted-foreground">{assigned.length}</span></div><div className="mt-1 flex gap-3 pl-6 text-[11px] text-muted-foreground"><span>{active} active</span><span className={blocked ? "text-red-600" : ""}>{blocked} blocked</span></div></Link>})}</div></section><section className="rounded-xl border border-border bg-card p-4 shadow-sm"><h2 className="flex items-center gap-2 text-sm font-semibold"><Activity className="h-4 w-4 text-primary" />Native execution</h2><div className="mt-3 grid grid-cols-2 gap-2 text-center"><div className="rounded-lg bg-muted/50 p-2"><div className="text-lg font-semibold">{heartbeatQuery.data?.filter((run) => ["running", "queued"].includes(run.status)).length ?? 0}</div><div className="text-[11px] text-muted-foreground">Active runs</div></div><div className="rounded-lg bg-muted/50 p-2"><div className="text-lg font-semibold">{heartbeatQuery.data?.filter((run) => ["failed", "error"].includes(run.status)).length ?? 0}</div><div className="text-[11px] text-muted-foreground">Failed runs</div></div></div><Link className="mt-3 block text-xs font-medium text-primary hover:underline" to="/activity/runs">Open execution logs</Link></section></aside>
      </div>{selectedIssue && <div className="fixed inset-y-0 right-0 z-30 flex w-full max-w-[420px] bg-card shadow-2xl"><TaskDetailPanel issue={selectedIssue} projects={projects} agents={agents} companyId={selectedCompanyId} onClose={() => setSelectedId(null)} /></div>}
    </div>
    </div>
  );
}
