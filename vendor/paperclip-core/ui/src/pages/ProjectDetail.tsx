import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Link, useParams, useNavigate, useLocation, Navigate } from "@/lib/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PROJECT_COLORS, PROJECT_ICON_NAMES, isUuidLike, type BudgetPolicySummary } from "@paperclipai/shared";
import { budgetsApi } from "../api/budgets";
import { executionWorkspacesApi } from "../api/execution-workspaces";
import { instanceSettingsApi } from "../api/instanceSettings";
import { projectsApi } from "../api/projects";
import { issuesApi } from "../api/issues";
import { agentsApi } from "../api/agents";
import { heartbeatsApi } from "../api/heartbeats";
import { assetsApi } from "../api/assets";
import { usePanel } from "../context/PanelContext";
import { useCompany } from "../context/CompanyContext";
import { useToastActions } from "../context/ToastContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { queryKeys } from "../lib/queryKeys";
import { ProjectProperties, type ProjectConfigFieldKey, type ProjectFieldSaveState } from "../components/ProjectProperties";
import { InlineEditor } from "../components/InlineEditor";
import { StatusBadge } from "../components/StatusBadge";
import { ProjectTile } from "../components/ProjectTile";
import { BudgetPolicyCard } from "../components/BudgetPolicyCard";
import { IssuesList } from "../components/IssuesList";
import { ProjectOperationsView } from "../components/ProjectOperationsView";
import { ProjectStructureView } from "../components/ProjectStructureView";
import { PageSkeleton } from "../components/PageSkeleton";
import { PageTabBar } from "../components/PageTabBar";
import { ProjectWorkspacesContent } from "../components/ProjectWorkspacesContent";
import { SummarySlotCard } from "../components/SummarySlotCard";
import { MembershipAction } from "../components/MembershipAction";
import { StarToggle } from "../components/StarToggle";
import { buildProjectWorkspaceSummaries } from "../lib/project-workspaces-tab";
import { collectLiveIssueIds } from "../lib/liveIssueIds";
import { projectRouteRef } from "../lib/utils";
import { PROJECT_ICONS } from "../lib/project-icons";
import { usePublishSharedQueryData, useSharedPollingQuery } from "../hooks/useSharedPolling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { classifyIssue } from "../lib/issue-classification";
import { sortWorkflowIssues } from "../lib/workflow-sort";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Activity,
  Bot,
  ExternalLink,
  LayoutGrid,
  ListTodo,
  FileCode2,
  Users,
  Settings,
  DollarSign,
  History,
  Wrench,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { PluginLauncherOutlet } from "@/plugins/launchers";
import { PluginSlotMount, PluginSlotOutlet, usePluginSlots } from "@/plugins/slots";
import {
  isStarred,
  resourceMembershipState,
  useResourceMembershipMutation,
  useResourceMemberships,
} from "../hooks/useResourceMemberships";

/* ── Top-level tab types ── */

type ProjectBaseTab =
  | "overview"
  | "activity"
  | "tasks"
  | "outputs"
  | "team"
  | "settings"
  | "budget"
  | "history"
  | "diagnostics"
  | "plugin-operations"
  | "workspaces"
  // Legacy aliases
  | "live-monitor"
  | "structure"
  | "contributions"
  | "list"
  | "logs"
  | "advanced"
  | "configuration";
type ProjectPluginTab = `plugin:${string}`;
type ProjectTab = ProjectBaseTab | ProjectPluginTab;

function isProjectPluginTab(value: string | null): value is ProjectPluginTab {
  return typeof value === "string" && value.startsWith("plugin:");
}

function resolveProjectTab(pathname: string, projectId: string): ProjectTab | null {
  const segments = pathname.split("/").filter(Boolean);
  const projectsIdx = segments.indexOf("projects");
  if (projectsIdx === -1) return null;
  const tab = segments[projectsIdx + 2];
  if (tab === "overview") return "overview";
  if (tab === "activity" || tab === "live-monitor") return "activity";
  if (tab === "tasks" || tab === "issues" || tab === "list") return "list";
  if (tab === "outputs" || tab === "structure") return "outputs";
  if (tab === "team" || tab === "contributions") return "team";
  if (tab === "settings" || tab === "configuration") return "configuration";
  if (tab === "budget") return "budget";
  if (tab === "history" || tab === "logs") return "history";
  if (tab === "diagnostics" || tab === "advanced") return "advanced";
  if (tab === "plugin-operations") return "plugin-operations";
  if (tab === "workspaces") return "workspaces";
  return null;
}

/* ── Combined icon + color picker popover (PAP-72 / PAP-68 part 4) ── */

const DEFAULT_PROJECT_ICON = "folder";

function ProjectTilePicker({
  color,
  icon,
  onSelectIcon,
  onSelectColor,
}: {
  color: string | null;
  icon: string | null;
  onSelectIcon: (icon: string) => void;
  onSelectColor: (color: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = useMemo(() => {
    const entries = PROJECT_ICON_NAMES.map((name) => [name, PROJECT_ICONS[name]] as const);
    if (!search) return entries;
    const q = search.toLowerCase();
    return entries.filter(([name]) => name.includes(q));
  }, [search]);

  // Keep the popover open across selections so the user can pick both an icon
  // and a color in one pass; reset the search when it closes.
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="shrink-0 rounded-lg cursor-pointer hover:ring-2 hover:ring-foreground/20 transition-(--tp-box-shadow)"
          aria-label="Change project icon and color"
        >
          <ProjectTile color={color} icon={icon} size="md" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        {/* Icon search + grid */}
        <p className="text-xs font-medium text-muted-foreground mb-2">Icon</p>
        <Input
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2 h-8 text-sm"
          autoFocus
        />
        <div className="grid grid-cols-7 gap-1 max-h-40 overflow-y-auto">
          {filteredIcons.map(([name, Icon]) => (
            <button
              key={name}
              type="button"
              onClick={() => onSelectIcon(name)}
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded hover:bg-accent transition-colors",
                (icon ?? DEFAULT_PROJECT_ICON) === name && "bg-accent ring-1 ring-primary",
              )}
              title={name}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
          {filteredIcons.length === 0 && (
            <p className="col-span-7 text-xs text-muted-foreground text-center py-2">No icons match</p>
          )}
        </div>

        {/* Color swatches */}
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">Color</p>
          <div className="grid grid-cols-5 gap-1.5">
            {/* Neutral / reset-to-gray option */}
            <button
              type="button"
              onClick={() => onSelectColor(null)}
              className={`h-6 w-6 cursor-pointer transition-(--tp-transform-box-shadow) duration-150 hover:scale-110 ${
                color === null
                  ? "ring-2 ring-foreground ring-offset-1 ring-offset-background rounded-md"
                  : ""
              }`}
              aria-label="Reset to neutral gray"
              title="Neutral (default)"
            >
              <ProjectTile color={null} size="sm" />
            </button>
            {PROJECT_COLORS.map((swatch) => (
              <button
                key={swatch}
                type="button"
                onClick={() => onSelectColor(swatch)}
                className={`h-6 w-6 rounded-md cursor-pointer transition-(--tp-transform-box-shadow) duration-150 hover:scale-110 ${
                  swatch === color
                    ? "ring-2 ring-foreground ring-offset-1 ring-offset-background"
                    : "hover:ring-2 hover:ring-foreground/30"
                }`}
                style={{ backgroundColor: swatch }}
                aria-label={`Select color ${swatch}`}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ── List (issues) tab content ── */

function ProjectIssuesList({ projectId, companyId }: { projectId: string; companyId: string }) {
  const queryClient = useQueryClient();

  const { data: agents } = useQuery({
    queryKey: queryKeys.agents.list(companyId),
    queryFn: () => agentsApi.list(companyId),
    enabled: !!companyId,
  });

  const liveRunsQueryKey = queryKeys.liveRuns(companyId);
  const sharedLiveRuns = useSharedPollingQuery({
    companyId,
    resourceKey: "live-runs",
    queryKey: liveRunsQueryKey,
    enabled: !!companyId,
    // Event-sourced via LiveUpdatesProvider (issue 9627); no interval poll needed.
    refetchInterval: false,
    leaderOnly: true,
  });
  const { data: liveRuns, dataUpdatedAt: liveRunsUpdatedAt } = useQuery({
    queryKey: liveRunsQueryKey,
    queryFn: () => heartbeatsApi.liveRunsForCompany(companyId),
    enabled: sharedLiveRuns.enabled,
    refetchInterval: sharedLiveRuns.refetchInterval,
  });
  usePublishSharedQueryData(sharedLiveRuns, liveRuns, liveRunsUpdatedAt);
  const { data: projects } = useQuery({
    queryKey: queryKeys.projects.list(companyId),
    queryFn: () => projectsApi.list(companyId),
    enabled: !!companyId,
  });

  const { data: issues, isLoading, error } = useQuery({
    queryKey: queryKeys.issues.listByProject(companyId, projectId),
    queryFn: () => issuesApi.list(companyId, { projectId }),
    enabled: !!companyId,
  });
  const liveIssueIds = useMemo(() => collectLiveIssueIds(liveRuns, issues), [issues, liveRuns]);

  const updateIssue = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      issuesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.listByProject(companyId, projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.list(companyId) });
    },
  });

  // Classify issues into 3 groups
  const allIssues = issues ?? [];
  const workflowStages = useMemo(() => sortWorkflowIssues(allIssues.filter(i => classifyIssue(i) === "workflow-stage")), [allIssues]);
  const projectRequirements = useMemo(() => allIssues.filter(i => classifyIssue(i) === "project-requirement"), [allIssues]);
  const executionTasks = useMemo(() => allIssues.filter(i => classifyIssue(i) === "ai-execution-task"), [allIssues]);
  const unclassified = useMemo(() => allIssues.filter(i => classifyIssue(i) === "unclassified"), [allIssues]);
  const taskListIssues = useMemo(() => [...executionTasks, ...unclassified], [executionTasks, unclassified]);

  // Stage status helpers
  const stageStatusIcon = (status: string) => {
    if (status === "done") return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
    if (status === "in_progress") return <Activity className="h-3.5 w-3.5 text-yellow-500 animate-pulse" />;
    if (status === "blocked") return <XCircle className="h-3.5 w-3.5 text-red-500" />;
    return <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />;
  };

  const stageStatusColor = (status: string) => {
    if (status === "done") return "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400";
    if (status === "in_progress") return "border-yellow-500/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    if (status === "blocked") return "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400";
    return "border-muted-foreground/20 bg-muted/40 text-muted-foreground";
  };

  const reqStatusColor = (status: string) => {
    if (status === "done") return "border-green-500/40 bg-green-500/10";
    if (status === "blocked") return "border-red-500/40 bg-red-500/10";
    if (status === "in_progress") return "border-yellow-500/40 bg-yellow-500/10";
    return "border-blue-500/40 bg-blue-500/10";
  };

  const reqStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      backlog: "Queued",
      todo: "Todo",
      in_progress: "Processing",
      in_review: "In Review",
      done: "Completed",
      blocked: "Failed",
      cancelled: "Cancelled",
    };
    return labels[status] ?? status;
  };

  return (
    <div className="flex flex-col gap-0 w-full">
      {/* ── Section 1: Project Requirements (Product Owner Input) ── */}
      {projectRequirements.length > 0 && (
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-blue-500" />
              Product Owner Requirements ({projectRequirements.length})
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {projectRequirements.map(req => {
              const assignedAgent = req.assigneeAgentId && agents ? agents.find((a: { id: string; name: string }) => a.id === req.assigneeAgentId) : null;
              return (
                <div
                  key={req.id}
                  className={`flex flex-col gap-2 rounded-lg border p-3.5 ${reqStatusColor(req.status)} transition-colors`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <span className="text-[11px] text-muted-foreground font-mono font-semibold px-1.5 py-0.5 rounded bg-muted/60 shrink-0">
                        {req.identifier}
                      </span>
                      <Link
                        to={`/issues/${req.id}`}
                        className="font-medium text-sm text-foreground hover:underline hover:text-primary transition-colors flex-1"
                      >
                        {req.title}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${stageStatusColor(req.status)}`}>
                        {reqStatusLabel(req.status)}
                      </span>
                      <Link
                        to={`/issues/${req.id}`}
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium px-2 py-1 rounded hover:bg-primary/10 border border-primary/20"
                      >
                        <span>Details & Logs</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap pt-1 border-t border-border/30">
                    {assignedAgent && (
                      <span className="flex items-center gap-1">
                        <Bot className="h-3 w-3 text-primary" />
                        Assignee: <span className="font-medium text-foreground">{assignedAgent.name}</span>
                      </span>
                    )}
                    {req.createdAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created: <span className="font-medium">{new Date(req.createdAt).toLocaleString()}</span>
                      </span>
                    )}
                  </div>

                  {req.status === "blocked" && (
                    <div className="text-[11px] text-red-600 dark:text-red-400 flex flex-col gap-1 bg-red-500/10 px-3 py-2 rounded border border-red-500/20">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <XCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>Execution Failed: {(req as any).executionBlocker?.runError || "Open logs to inspect error details."}</span>
                      </div>
                      <div className="text-muted-foreground text-[10px] pl-5">
                        Inspect logs to determine cause and remediation actions.
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Section 2: Workflow Stages Progress ── */}
      {workflowStages.length > 0 && (
        <div className="px-4 pt-2 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-primary" />
              Workflow Stages Progress ({workflowStages.filter(s => s.status === "done").length}/{workflowStages.length} completed)
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border p-2 bg-muted/10">
            {workflowStages.map((stage, idx) => (
              <div
                key={stage.id}
                className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-md hover:bg-muted/50 transition-colors group"
              >
                <span className="text-[11px] text-muted-foreground/70 font-mono w-5 text-right shrink-0">
                  {idx + 1}.
                </span>
                {stageStatusIcon(stage.status)}
                <Link
                  to={`/issues/${stage.id}`}
                  className={`text-sm flex-1 truncate hover:underline hover:text-primary transition-colors ${
                    stage.status === "done" ? "line-through text-muted-foreground" : "font-medium"
                  }`}
                >
                  {stage.title}
                </Link>
                {stage.assigneeAgentId && agents && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0 bg-muted/60 px-2 py-0.5 rounded">
                    <Bot className="h-3 w-3 text-primary/70" />
                    {agents.find((a: { id: string; name: string }) => a.id === stage.assigneeAgentId)?.name ?? ""}
                  </span>
                )}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${stageStatusColor(stage.status)}`}>
                  {stage.status === "in_progress" ? "Running" : stage.status === "done" ? "Completed" : stage.status === "blocked" ? "Blocked" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Divider ── */}
      <div className="border-t border-border/50 mx-4 my-1" />

      {/* ── Section 3: AI Execution Tasks ── */}
      <div className="flex flex-col w-full">
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5 text-primary" />
            AI Execution Tasks ({taskListIssues.length})
          </span>
        </div>

        <IssuesList
          issues={taskListIssues}
          isLoading={isLoading}
          error={error as Error | null}
          agents={agents}
          projects={projects}
          liveIssueIds={liveIssueIds}
          projectId={projectId}
          viewStateKey="paperclip:project-issues-view"
          onUpdateIssue={(id, data) => updateIssue.mutate({ id, data })}
          defaultSortField="workflow"
        />
      </div>
    </div>
  );
}

function ProjectPluginOperationsList({
  projectId,
  companyId,
  pluginKey,
}: {
  projectId: string;
  companyId: string;
  pluginKey: string;
}) {
  const queryClient = useQueryClient();
  const originKindPrefix = `plugin:${pluginKey}`;

  const { data: agents } = useQuery({
    queryKey: queryKeys.agents.list(companyId),
    queryFn: () => agentsApi.list(companyId),
    enabled: !!companyId,
  });
  const { data: projects } = useQuery({
    queryKey: queryKeys.projects.list(companyId),
    queryFn: () => projectsApi.list(companyId),
    enabled: !!companyId,
  });
  const liveRunsQueryKey = queryKeys.liveRuns(companyId);
  const sharedLiveRuns = useSharedPollingQuery({
    companyId,
    resourceKey: "live-runs",
    queryKey: liveRunsQueryKey,
    enabled: !!companyId,
    // Event-sourced via LiveUpdatesProvider (issue 9627); no interval poll needed.
    refetchInterval: false,
    leaderOnly: true,
  });
  const { data: liveRuns, dataUpdatedAt: liveRunsUpdatedAt } = useQuery({
    queryKey: liveRunsQueryKey,
    queryFn: () => heartbeatsApi.liveRunsForCompany(companyId),
    enabled: sharedLiveRuns.enabled,
    refetchInterval: sharedLiveRuns.refetchInterval,
  });
  usePublishSharedQueryData(sharedLiveRuns, liveRuns, liveRunsUpdatedAt);
  const { data: issues, isLoading, error } = useQuery({
    queryKey: queryKeys.issues.listPluginOperationsByProject(companyId, projectId, originKindPrefix),
    queryFn: () => issuesApi.list(companyId, { projectId, originKindPrefix }),
    enabled: !!companyId && !!projectId,
  });
  const liveIssueIds = useMemo(() => collectLiveIssueIds(liveRuns, issues), [issues, liveRuns]);

  const updateIssue = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      issuesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.listPluginOperationsByProject(companyId, projectId, originKindPrefix) });
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.listByProject(companyId, projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.list(companyId) });
    },
  });

  return (
    <IssuesList
      issues={issues ?? []}
      isLoading={isLoading}
      error={error as Error | null}
      agents={agents}
      projects={projects}
      liveIssueIds={liveIssueIds}
      projectId={projectId}
      viewStateKey={`paperclip:project-plugin-operations-view:${pluginKey}`}
      onUpdateIssue={(id, data) => updateIssue.mutate({ id, data })}
    />
  );
}

/* ── Main project page ── */

export function ProjectDetail() {
  const { companyPrefix, projectId, filter } = useParams<{
    companyPrefix?: string;
    projectId: string;
    filter?: string;
  }>();
  const { companies, selectedCompanyId, setSelectedCompanyId } = useCompany();
  const { closePanel } = usePanel();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { pushToast } = useToastActions();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [fieldSaveStates, setFieldSaveStates] = useState<Partial<Record<ProjectConfigFieldKey, ProjectFieldSaveState>>>({});
  const [dismissedLeftProjectIds, setDismissedLeftProjectIds] = useState<Set<string>>(() => new Set());
  const fieldSaveRequestIds = useRef<Partial<Record<ProjectConfigFieldKey, number>>>({});
  const fieldSaveTimers = useRef<Partial<Record<ProjectConfigFieldKey, ReturnType<typeof setTimeout>>>>({});
  const routeProjectRef = projectId ?? "";
  const routeCompanyId = useMemo(() => {
    if (!companyPrefix) return null;
    const requestedPrefix = companyPrefix.toUpperCase();
    return companies.find((company) => company.issuePrefix.toUpperCase() === requestedPrefix)?.id ?? null;
  }, [companies, companyPrefix]);
  const lookupCompanyId = routeCompanyId ?? selectedCompanyId ?? undefined;
  const canFetchProject = routeProjectRef.length > 0 && (isUuidLike(routeProjectRef) || Boolean(lookupCompanyId));
  const activeRouteTab = routeProjectRef ? resolveProjectTab(location.pathname, routeProjectRef) : null;
  const pluginTabFromSearch = useMemo(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    return isProjectPluginTab(tab) ? tab : null;
  }, [location.search]);
  const activeTab = activeRouteTab ?? pluginTabFromSearch;

  const { data: project, isLoading, error } = useQuery({
    queryKey: [...queryKeys.projects.detail(routeProjectRef), lookupCompanyId ?? null],
    queryFn: () => projectsApi.get(routeProjectRef, lookupCompanyId),
    enabled: canFetchProject,
    // Canonicalizing the same project's URL must not unmount its edit form
    // while the alias query loads. Never carry data into another company or project.
    placeholderData: (previous) => previous &&
      previous.companyId === lookupCompanyId &&
      (previous.id === routeProjectRef || projectRouteRef(previous) === routeProjectRef)
      ? previous
      : undefined,
  });
  const canonicalProjectRef = project ? projectRouteRef(project) : routeProjectRef;
  const projectLookupRef = project?.id ?? routeProjectRef;
  const resolvedCompanyId = project?.companyId ?? selectedCompanyId;
  const membershipsQuery = useResourceMemberships(resolvedCompanyId);
  const membershipMutation = useResourceMembershipMutation(resolvedCompanyId);
  const projectMembershipState = project?.id
    ? resourceMembershipState(membershipsQuery.data, "project", project.id)
    : "joined";
  const experimentalSettingsQuery = useQuery({
    queryKey: queryKeys.instance.experimentalSettings,
    queryFn: () => instanceSettingsApi.getExperimental(),
  });
  const {
    slots: pluginDetailSlots,
    isLoading: pluginDetailSlotsLoading,
  } = usePluginSlots({
    slotTypes: ["detailTab"],
    entityType: "project",
    companyId: resolvedCompanyId,
    enabled: !!resolvedCompanyId,
  });
  const pluginTabItems = useMemo(
    () => pluginDetailSlots.map((slot) => ({
      value: `plugin:${slot.pluginKey}:${slot.id}` as ProjectPluginTab,
      label: slot.displayName,
      slot,
    })),
    [pluginDetailSlots],
  );
  const activePluginTab = pluginTabItems.find((item) => item.value === activeTab) ?? null;
  // The slots query is disabled until the project's company resolves, and a
  // disabled query reports isLoading=false — so "not loading" alone cannot
  // distinguish "contribution unavailable" from "not asked yet" on cold loads.
  const pluginTabDecisionLoaded = Boolean(resolvedCompanyId) && !pluginDetailSlotsLoading;
  const isolatedWorkspacesEnabled = experimentalSettingsQuery.data?.enableIsolatedWorkspaces === true;
  const workspaceTabProjectId = project?.id ?? null;
  const { data: workspaceTabIssues = [], isLoading: isWorkspaceTabIssuesLoading, error: workspaceTabIssuesError } = useQuery({
    queryKey: workspaceTabProjectId && resolvedCompanyId
      ? queryKeys.issues.listByProject(resolvedCompanyId, workspaceTabProjectId)
      : ["issues", "__workspace-tab__", "disabled"],
    queryFn: () => issuesApi.list(resolvedCompanyId!, { projectId: workspaceTabProjectId! }),
    enabled: Boolean(resolvedCompanyId && workspaceTabProjectId && isolatedWorkspacesEnabled),
  });
  const {
    data: workspaceTabExecutionWorkspaces = [],
    isLoading: isWorkspaceTabExecutionWorkspacesLoading,
    error: workspaceTabExecutionWorkspacesError,
  } = useQuery({
    queryKey: workspaceTabProjectId && resolvedCompanyId
      ? queryKeys.executionWorkspaces.list(resolvedCompanyId, { projectId: workspaceTabProjectId })
      : ["execution-workspaces", "__workspace-tab__", "disabled"],
    queryFn: () => executionWorkspacesApi.list(resolvedCompanyId!, { projectId: workspaceTabProjectId! }),
    enabled: Boolean(resolvedCompanyId && workspaceTabProjectId && isolatedWorkspacesEnabled),
  });
  const workspaceSummaries = useMemo(() => {
    if (!project || !isolatedWorkspacesEnabled) return [];
    return buildProjectWorkspaceSummaries({
      project,
      issues: workspaceTabIssues,
      executionWorkspaces: workspaceTabExecutionWorkspaces,
    });
  }, [project, isolatedWorkspacesEnabled, workspaceTabIssues, workspaceTabExecutionWorkspaces]);
  const showWorkspacesTab = isolatedWorkspacesEnabled && workspaceSummaries.length > 0;
  const workspaceTabDecisionLoaded =
    experimentalSettingsQuery.isFetched &&
    (!isolatedWorkspacesEnabled || (!isWorkspaceTabIssuesLoading && !isWorkspaceTabExecutionWorkspacesLoading));
  const workspaceTabError = (workspaceTabIssuesError ?? workspaceTabExecutionWorkspacesError) as Error | null;

  useEffect(() => {
    if (!project?.companyId || project.companyId === selectedCompanyId) return;
    setSelectedCompanyId(project.companyId, { source: "route_sync" });
  }, [project?.companyId, selectedCompanyId, setSelectedCompanyId]);

  const invalidateProject = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(routeProjectRef) });
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectLookupRef) });
    if (resolvedCompanyId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(resolvedCompanyId) });
    }
  };

  const updateProject = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      projectsApi.update(projectLookupRef, data, resolvedCompanyId ?? lookupCompanyId),
    onSuccess: (_project, data) => {
      invalidateProject();
      if (data.visibility !== undefined) queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });

  const archiveProject = useMutation({
    mutationFn: (archived: boolean) =>
      projectsApi.update(
        projectLookupRef,
        { archivedAt: archived ? new Date().toISOString() : null },
        resolvedCompanyId ?? lookupCompanyId,
      ),
    onSuccess: (updatedProject, archived) => {
      invalidateProject();
      const name = updatedProject?.name ?? project?.name ?? "Project";
      if (archived) {
        pushToast({ title: `"${name}" has been archived`, tone: "success" });
        navigate("/dashboard");
      } else {
        pushToast({ title: `"${name}" has been unarchived`, tone: "success" });
      }
    },
    onError: (_, archived) => {
      pushToast({
        title: archived ? "Failed to archive project" : "Failed to unarchive project",
        tone: "error",
      });
    },
  });

  const uploadImage = useMutation({
    mutationFn: async (file: File) => {
      if (!resolvedCompanyId) throw new Error("No organization selected");
      return assetsApi.uploadImage(resolvedCompanyId, file, `projects/${projectLookupRef || "draft"}`);
    },
  });

  const { data: budgetOverview } = useQuery({
    queryKey: queryKeys.budgets.overview(resolvedCompanyId ?? "__none__"),
    queryFn: () => budgetsApi.overview(resolvedCompanyId!),
    enabled: !!resolvedCompanyId,
    refetchInterval: 30_000,
    staleTime: 5_000,
  });

  useEffect(() => {
    setBreadcrumbs([
      { label: "Projects", href: "/projects" },
      { label: project?.name ?? routeProjectRef ?? "Project" },
    ]);
  }, [setBreadcrumbs, project, routeProjectRef]);

  useEffect(() => {
    if (!project) return;
    if (routeProjectRef === canonicalProjectRef && !location.pathname.endsWith("/overview")) return;
    if (isProjectPluginTab(activeTab)) {
      navigate(`/projects/${canonicalProjectRef}?tab=${encodeURIComponent(activeTab)}`, { replace: true });
      return;
    }
    if (activeTab === "settings" || activeTab === "configuration") {
      navigate(`/projects/${canonicalProjectRef}/${location.pathname.endsWith("/configuration") ? "configuration" : "settings"}`, { replace: true });
      return;
    }
    if (activeTab === "overview") {
      navigate(`/projects/${canonicalProjectRef}/overview`, { replace: true });
      return;
    }
    if (activeTab === "activity" || activeTab === "live-monitor") {
      navigate(`/projects/${canonicalProjectRef}/activity`, { replace: true });
      return;
    }
    if (activeTab === "outputs" || activeTab === "structure") {
      navigate(`/projects/${canonicalProjectRef}/outputs`, { replace: true });
      return;
    }
    if (activeTab === "team" || activeTab === "contributions") {
      navigate(`/projects/${canonicalProjectRef}/team`, { replace: true });
      return;
    }
    if (activeTab === "history" || activeTab === "logs") {
      navigate(`/projects/${canonicalProjectRef}/history`, { replace: true });
      return;
    }
    if (activeTab === "diagnostics" || activeTab === "advanced") {
      navigate(`/projects/${canonicalProjectRef}/diagnostics`, { replace: true });
      return;
    }
    if (activeTab === "budget") {
      navigate(`/projects/${canonicalProjectRef}/budget`, { replace: true });
      return;
    }
    if (activeTab === "plugin-operations") {
      navigate(`/projects/${canonicalProjectRef}/plugin-operations`, { replace: true });
      return;
    }
    if (activeTab === "workspaces") {
      navigate(`/projects/${canonicalProjectRef}/workspaces`, { replace: true });
      return;
    }
    if (activeTab === "tasks" || activeTab === "list") {
      if (filter) {
        navigate(`/projects/${canonicalProjectRef}/tasks/${filter}`, { replace: true });
        return;
      }
      navigate(`/projects/${canonicalProjectRef}/tasks`, { replace: true });
      return;
    }
    navigate(`/projects/${canonicalProjectRef}/overview`, { replace: true });
    navigate(`/projects/${canonicalProjectRef}`, { replace: true });
  }, [project, routeProjectRef, canonicalProjectRef, activeTab, filter, navigate, location.pathname]);

  useEffect(() => {
    closePanel();
    return () => closePanel();
  }, [closePanel]);

  useEffect(() => {
    if (!project?.id || projectMembershipState !== "joined") return;
    setDismissedLeftProjectIds((current) => {
      if (!current.has(project.id)) return current;
      const next = new Set(current);
      next.delete(project.id);
      return next;
    });
  }, [project?.id, projectMembershipState]);

  useEffect(() => {
    return () => {
      Object.values(fieldSaveTimers.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  const setFieldState = useCallback((field: ProjectConfigFieldKey, state: ProjectFieldSaveState) => {
    setFieldSaveStates((current) => ({ ...current, [field]: state }));
  }, []);

  const scheduleFieldReset = useCallback((field: ProjectConfigFieldKey, delayMs: number) => {
    const existing = fieldSaveTimers.current[field];
    if (existing) clearTimeout(existing);
    fieldSaveTimers.current[field] = setTimeout(() => {
      setFieldSaveStates((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
      delete fieldSaveTimers.current[field];
    }, delayMs);
  }, []);

  const updateProjectField = useCallback(async (field: ProjectConfigFieldKey, data: Record<string, unknown>) => {
    const requestId = (fieldSaveRequestIds.current[field] ?? 0) + 1;
    fieldSaveRequestIds.current[field] = requestId;
    setFieldState(field, "saving");
    try {
      await projectsApi.update(projectLookupRef, data, resolvedCompanyId ?? lookupCompanyId);
      invalidateProject();
      if (data.visibility !== undefined) queryClient.invalidateQueries({ queryKey: ["issues"] });
      if (fieldSaveRequestIds.current[field] !== requestId) return;
      setFieldState(field, "saved");
      scheduleFieldReset(field, 1800);
    } catch (error) {
      if (fieldSaveRequestIds.current[field] !== requestId) return;
      setFieldState(field, "error");
      scheduleFieldReset(field, 3000);
      throw error;
    }
  }, [invalidateProject, lookupCompanyId, projectLookupRef, queryClient, resolvedCompanyId, scheduleFieldReset, setFieldState]);

  const projectBudgetSummary = useMemo(() => {
    const matched = budgetOverview?.policies.find(
      (policy) => policy.scopeType === "project" && policy.scopeId === (project?.id ?? routeProjectRef),
    );
    if (matched) return matched;
    return {
      policyId: "",
      companyId: resolvedCompanyId ?? "",
      scopeType: "project",
      scopeId: project?.id ?? routeProjectRef,
      scopeName: project?.name ?? "Project",
      metric: "billed_cents",
      windowKind: "lifetime",
      amount: 0,
      unpricedEventCount: 0, pendingRunCount: 0,
      unpricedUsagePolicy: "block",
      observedAmount: 0,
      remainingAmount: 0,
      utilizationPercent: 0,
      warnPercent: 80,
      hardStopEnabled: true,
      notifyEnabled: true,
      isActive: false,
      status: "ok",
      paused: Boolean(project?.pausedAt),
      pauseReason: project?.pauseReason ?? null,
      windowStart: new Date(),
      windowEnd: new Date(),
    } satisfies BudgetPolicySummary;
  }, [budgetOverview?.policies, project, resolvedCompanyId, routeProjectRef]);

  const budgetMutation = useMutation({
    mutationFn: (amount: number) =>
      budgetsApi.upsertPolicy(resolvedCompanyId!, {
        scopeType: "project",
        scopeId: project?.id ?? routeProjectRef,
        amount,
        windowKind: "lifetime",
      }),
    onSuccess: () => {
      if (!resolvedCompanyId) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.overview(resolvedCompanyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(routeProjectRef) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectLookupRef) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(resolvedCompanyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(resolvedCompanyId) });
    },
  });

  if (pluginTabFromSearch && !activePluginTab && !error) {
    if (!pluginTabDecisionLoaded) {
      return <PageSkeleton variant="detail" />;
    }
    return <Navigate to={`/projects/${canonicalProjectRef}/issues`} replace />;
  }

  if (activeTab === "workspaces" && workspaceTabDecisionLoaded && !showWorkspacesTab) {
    return <Navigate to={`/projects/${canonicalProjectRef}/issues`} replace />;
  }

  // Product Owners land on the project overview every time they open a project.
  if (routeProjectRef && activeTab === null) {
    return <Navigate to={`/projects/${canonicalProjectRef}/overview`} replace />;
  }

  if (isLoading) return <PageSkeleton variant="detail" />;
  if (error) return <p className="text-sm text-destructive">{error.message}</p>;
  if (!project) return null;
  const showLeftProjectNotice =
    projectMembershipState === "left" && !dismissedLeftProjectIds.has(project.id);
  const projectMembershipPending =
    membershipMutation.isPending &&
    membershipMutation.variables?.resourceType === "project" &&
    membershipMutation.variables.resourceId === project.id;
  const projectStarred = isStarred(membershipsQuery.data, "project", project.id);
  const projectStarPending = projectMembershipPending && membershipMutation.variables?.starred !== undefined;
  const projectJoinLeavePending = projectMembershipPending && membershipMutation.variables?.starred === undefined;

  const isSecondaryTabActive = [
    "settings",
    "configuration",
    "budget",
    "history",
    "logs",
    "diagnostics",
    "advanced",
  ].includes(activeTab ?? "");

  const moreButtonLabel =
    activeTab === "settings" || activeTab === "configuration"
      ? "More: Settings"
      : activeTab === "budget"
      ? "More: Budget"
      : activeTab === "history" || activeTab === "logs"
      ? "More: History"
      : activeTab === "diagnostics" || activeTab === "advanced"
      ? "More: Diagnostics"
      : "More";

  const handleTabChange = (tab: ProjectTab) => {
    // Cache the active tab per project
    if (project?.id) {
      try { localStorage.setItem(`paperclip:project-tab:${project.id}`, tab); } catch {}
    }
    if (isProjectPluginTab(tab)) {
      navigate(`/projects/${canonicalProjectRef}?tab=${encodeURIComponent(tab)}`);
      return;
    }
    if (tab === "workspaces") {
      navigate(`/projects/${canonicalProjectRef}/workspaces`);
    } else if (tab === "overview") {
      navigate(`/projects/${canonicalProjectRef}/overview`);
    } else if (tab === "activity" || tab === "live-monitor") {
      navigate(`/projects/${canonicalProjectRef}/activity`);
    } else if (tab === "outputs" || tab === "structure") {
      navigate(`/projects/${canonicalProjectRef}/outputs`);
    } else if (tab === "team" || tab === "contributions") {
      navigate(`/projects/${canonicalProjectRef}/team`);
    } else if (tab === "history" || tab === "logs") {
      navigate(`/projects/${canonicalProjectRef}/history`);
    } else if (tab === "diagnostics" || tab === "advanced") {
      navigate(`/projects/${canonicalProjectRef}/diagnostics`);
    } else if (tab === "budget") {
      navigate(`/projects/${canonicalProjectRef}/budget`);
    } else if (tab === "plugin-operations") {
      navigate(`/projects/${canonicalProjectRef}/plugin-operations`);
    } else if (tab === "settings" || tab === "configuration") {
      navigate(`/projects/${canonicalProjectRef}/settings`);
    } else {
      navigate(`/projects/${canonicalProjectRef}/tasks`);
    }
  };

  return (
    <div className="space-y-6">
      {showLeftProjectNotice ? (
        <div className="flex items-center gap-3 border border-yellow-300/35 bg-yellow-300/10 px-3 py-2 text-sm text-yellow-900 dark:text-yellow-100">
          <p className="min-w-0 flex-1">
            You left this project. It no longer appears in your sidebar.
          </p>
          <MembershipAction
            compact
            state="left"
            pending={projectJoinLeavePending}
            pendingState={projectJoinLeavePending ? membershipMutation.variables?.state : null}
            resourceName={project.name}
            onJoin={() => membershipMutation.mutate({
              resourceType: "project",
              resourceId: project.id,
              resourceName: project.name,
              state: "joined",
            })}
            onLeave={() => membershipMutation.mutate({
              resourceType: "project",
              resourceId: project.id,
              resourceName: project.name,
              state: "left",
            })}
          />
          <button
            type="button"
            className="h-6 w-6 shrink-0 text-yellow-900/70 hover:text-yellow-900 dark:text-yellow-100/70 dark:hover:text-yellow-100"
            aria-label="Dismiss project membership notice"
            onClick={() => setDismissedLeftProjectIds((current) => new Set(current).add(project.id))}
          >
            ×
          </button>
        </div>
      ) : null}
      <div className="flex items-start gap-3">
        <div className="h-7 flex items-center">
          <ProjectTilePicker
            color={project.color ?? null}
            icon={project.icon ?? null}
            onSelectIcon={(icon) => updateProject.mutate({ icon })}
            onSelectColor={(color) => updateProject.mutate({ color })}
          />
        </div>
        <div className="min-w-0 space-y-2">
          <InlineEditor
            value={project.name}
            onSave={(name) => updateProject.mutate({ name })}
            as="h2"
            className="text-xl font-bold"
          />
          {project.pauseReason === "budget" ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-(length:--text-micro) font-medium uppercase tracking-(--tracking-caps) text-red-800 dark:text-red-200">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              Paused by budget hard stop
            </div>
          ) : null}
          {project.managedByPlugin ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-(length:--text-micro) font-medium text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color ?? "var(--project-seed)" }} />
              Managed by {project.managedByPlugin.pluginDisplayName}
            </div>
          ) : null}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <StarToggle
            size="button"
            starred={projectStarred}
            pending={projectStarPending}
            resourceName={project.name}
            onToggle={(next) => membershipMutation.mutate({
              resourceType: "project",
              resourceId: project.id,
              resourceName: project.name,
              starred: next,
            })}
          />
        </div>
      </div>

      {Boolean(project.managedByPlugin) && activeTab !== "configuration" && (
        <SummarySlotCard
          companyId={resolvedCompanyId}
          scopeKind="project"
          scopeId={project.id}
          title="Project summary"
          description="Summarizer keeps the latest project status, next step, and operator-needed items here."
        />
      )}

      {(activeTab === "advanced" || activeTab === "diagnostics") && <PluginSlotOutlet
        slotTypes={["toolbarButton", "contextMenuItem"]}
        entityType="project"
        context={{
          companyId: resolvedCompanyId ?? null,
          companyPrefix: companyPrefix ?? null,
          projectId: project.id,
          projectRef: canonicalProjectRef,
          entityId: project.id,
          entityType: "project",
        }}
        className="flex flex-wrap gap-2"
        itemClassName="inline-flex"
        missingBehavior="placeholder"
      />}

      {(activeTab === "advanced" || activeTab === "diagnostics") && <PluginLauncherOutlet
        placementZones={["toolbarButton"]}
        entityType="project"
        context={{
          companyId: resolvedCompanyId ?? null,
          companyPrefix: companyPrefix ?? null,
          projectId: project.id,
          projectRef: canonicalProjectRef,
          entityId: project.id,
          entityType: "project",
        }}
        className="flex flex-wrap gap-2"
        itemClassName="inline-flex"
      />}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-1">
        <Tabs
          value={activeTab === "list" ? "tasks" : activeTab ?? "overview"}
          onValueChange={(value) => handleTabChange(value as ProjectTab)}
          className="w-full sm:w-auto"
        >
          <TabsList variant="line" className="justify-start gap-1">
            <TabsTrigger value="overview" className="gap-1.5 cursor-pointer">
              <LayoutGrid className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-1.5 cursor-pointer">
              <Activity className="h-4 w-4" />
              <span>Activity</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-1.5 cursor-pointer">
              <ListTodo className="h-4 w-4" />
              <span>Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="outputs" className="gap-1.5 cursor-pointer">
              <FileCode2 className="h-4 w-4" />
              <span>Outputs</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-1.5 cursor-pointer">
              <Users className="h-4 w-4" />
              <span>Team</span>
            </TabsTrigger>

            {pluginTabItems.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}

            {project.managedByPlugin && (
              <TabsTrigger value="plugin-operations">Plugin operations</TabsTrigger>
            )}
            {showWorkspacesTab && (
              <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        {/* More Dropdown Menu for Secondary Sections */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={isSecondaryTabActive ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-8 gap-1.5 text-xs font-medium cursor-pointer",
                isSecondaryTabActive && "bg-muted text-foreground font-semibold ring-1 ring-border"
              )}
            >
              <span>{moreButtonLabel}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => handleTabChange("settings")}
              className={cn("gap-2 cursor-pointer", (activeTab === "settings" || activeTab === "configuration") && "bg-muted font-semibold")}
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleTabChange("budget")}
              className={cn("gap-2 cursor-pointer", activeTab === "budget" && "bg-muted font-semibold")}
            >
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>Budget</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleTabChange("history")}
              className={cn("gap-2 cursor-pointer", (activeTab === "history" || activeTab === "logs") && "bg-muted font-semibold")}
            >
              <History className="h-4 w-4 text-muted-foreground" />
              <span>History</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleTabChange("diagnostics")}
              className={cn("gap-2 cursor-pointer", (activeTab === "diagnostics" || activeTab === "advanced") && "bg-muted font-semibold")}
            >
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <span>Diagnostics</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {(activeTab === "overview" ||
        activeTab === "activity" ||
        activeTab === "live-monitor" ||
        activeTab === "tasks" ||
        activeTab === "list" ||
        activeTab === "team" ||
        activeTab === "contributions" ||
        activeTab === "history" ||
        activeTab === "logs") &&
        project?.id &&
        resolvedCompanyId && (
          <ProjectOperationsView
            project={project}
            companyId={resolvedCompanyId}
            projectRef={canonicalProjectRef}
            mode={
              activeTab === "activity" || activeTab === "live-monitor"
                ? "activity"
                : activeTab === "team" || activeTab === "contributions"
                ? "team"
                : activeTab === "history" || activeTab === "logs"
                ? "history"
                : activeTab === "tasks" || activeTab === "list"
                ? "tasks"
                : "overview"
            }
            onNavigateTab={(tab) => handleTabChange(tab as ProjectTab)}
          />
        )}

      {(activeTab === "outputs" || activeTab === "structure") && project?.id && resolvedCompanyId && (
        <ProjectStructureView
          projectId={project.id}
          companyId={resolvedCompanyId}
          projectRef={canonicalProjectRef}
          onNavigateTab={(tab) => handleTabChange(tab as ProjectTab)}
        />
      )}

      {(activeTab === "diagnostics" || activeTab === "advanced" || activeTab === "list" || activeTab === "tasks") && project?.id && resolvedCompanyId && (
        <div className={activeTab === "list" || activeTab === "tasks" ? "hidden" : undefined}>
          <ProjectIssuesList projectId={project.id} companyId={resolvedCompanyId} />
        </div>
      )}

      {activeTab === "plugin-operations" && project?.id && resolvedCompanyId && project.managedByPlugin && (
        <ProjectPluginOperationsList
          projectId={project.id}
          companyId={resolvedCompanyId}
          pluginKey={project.managedByPlugin.pluginKey}
        />
      )}

      {activeTab === "workspaces" ? (
        workspaceTabDecisionLoaded ? (
          workspaceTabError ? (
            <p className="text-sm text-destructive">{workspaceTabError.message}</p>
          ) : (
            <ProjectWorkspacesContent
              companyId={resolvedCompanyId!}
              projectId={project.id}
              projectRef={canonicalProjectRef}
              summaries={workspaceSummaries}
            />
          )
        ) : (
          <p className="text-sm text-muted-foreground">Loading workspaces...</p>
        )
      ) : null}

      {(activeTab === "configuration" || activeTab === "settings") && (
        <div className="max-w-4xl">
          <ProjectProperties
            project={project}
            onUpdate={(data) => updateProject.mutate(data)}
            onFieldUpdate={updateProjectField}
            getFieldSaveState={(field) => fieldSaveStates[field] ?? "idle"}
            onArchive={(archived) => archiveProject.mutate(archived)}
            archivePending={archiveProject.isPending}
          />
        </div>
      )}

      {activeTab === "budget" && resolvedCompanyId ? (
        <div className="max-w-3xl">
          <BudgetPolicyCard
            summary={projectBudgetSummary}
            variant="plain"
            isSaving={budgetMutation.isPending}
            onSave={(amount) => budgetMutation.mutate(amount)}
          />
        </div>
      ) : null}

      {activePluginTab && (
        <PluginSlotMount
          slot={activePluginTab.slot}
          context={{
            companyId: resolvedCompanyId,
            companyPrefix: companyPrefix ?? null,
            projectId: project.id,
            projectRef: canonicalProjectRef,
            entityId: project.id,
            entityType: "project",
          }}
          missingBehavior="placeholder"
        />
      )}
    </div>
  );
}
