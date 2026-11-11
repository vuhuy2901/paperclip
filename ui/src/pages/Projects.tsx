import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import type { Project } from "@paperclipai/shared";
import { projectsApi } from "../api/projects";
import { atelierApi } from "../api/atelier";
import { describeError } from "../api/errors";
import { useCompany } from "../context/CompanyContext";
import { useDialogActions } from "../context/DialogContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { queryKeys } from "../lib/queryKeys";
import { EntityRow } from "../components/EntityRow";
import { ProjectTile } from "../components/ProjectTile";
import { StatusBadge } from "../components/StatusBadge";
import { MembershipAction } from "../components/MembershipAction";
import { StarToggle } from "../components/StarToggle";
import { ArtifactEmptyGraphic } from "@/components/artifacts/v1/ArtifactEmptyGraphic";
import { EmptyState } from "../components/EmptyState";
import { PageSkeleton } from "../components/PageSkeleton";
import { QueryErrorState, useQueryView } from "../components/QueryView";
import { formatDate, formatNumber, formatProjectBudget, projectUrl } from "../lib/utils";
import {
  isStarred,
  resourceMembershipState,
  useResourceMembershipMutation,
  useResourceMemberships,
} from "../hooks/useResourceMemberships";
import { ProjectsToolbar, type ProjectSortField, type ProjectSortDir } from "@/components/ProjectsToolbar";
import { Hexagon, Lock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function compareProjectNames(left: Project, right: Project) {
  const nameDiff = left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
  return nameDiff !== 0 ? nameDiff : left.id.localeCompare(right.id);
}

function projectTime(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

function compareOptionalTime(
  left: Date | string | null | undefined,
  right: Date | string | null | undefined,
  sortDir: ProjectSortDir,
) {
  const leftTime = projectTime(left);
  const rightTime = projectTime(right);
  if (leftTime === null && rightTime === null) return 0;
  if (leftTime === null) return 1;
  if (rightTime === null) return -1;
  return sortDir === "asc" ? leftTime - rightTime : rightTime - leftTime;
}

function sortProjects(projects: Project[], sortField: ProjectSortField, sortDir: ProjectSortDir) {
  return [...projects].sort((left, right) => {
    let comparison = 0;
    if (sortField === "name") {
      comparison = compareProjectNames(left, right);
      return sortDir === "asc" ? comparison : -comparison;
    }

    if (sortField === "updated") comparison = compareOptionalTime(left.updatedAt, right.updatedAt, sortDir);
    else if (sortField === "created") comparison = compareOptionalTime(left.createdAt, right.createdAt, sortDir);
    else comparison = compareOptionalTime(left.targetDate, right.targetDate, sortDir);

    if (comparison === 0) comparison = compareProjectNames(left, right);
    return comparison;
  });
}

export function Projects() {
  const { selectedCompanyId } = useCompany();
  const { openNewProject } = useDialogActions();
  const { setBreadcrumbs } = useBreadcrumbs();
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<ProjectSortField>("name");
  const [sortDir, setSortDir] = useState<ProjectSortDir>("asc");
  const [statusFilter, setStatusFilter] = useState("active");
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [brief, setBrief] = useState("");
  const [intakeKey, setIntakeKey] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    setBreadcrumbs([{ label: "Projects" }]);
  }, [setBreadcrumbs]);

  const projectsQuery = useQuery({
    queryKey: queryKeys.projects.list(selectedCompanyId!),
    queryFn: () => projectsApi.list(selectedCompanyId!, { includeArchived: true }),
    enabled: !!selectedCompanyId,
  });
  const { data: allProjects, isLoading } = projectsQuery;
  const projectsView = useQueryView(projectsQuery);
  const membershipsQuery = useResourceMemberships(selectedCompanyId);
  const membershipMutation = useResourceMembershipMutation(selectedCompanyId);
  const projects = useMemo(
    () => allProjects ?? [],
    [allProjects],
  );
  const sortedProjects = useMemo(
    () => {
      const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
      const matching = projects.filter(project => {
        const text = `${project.name} ${project.description ?? ""}`.toLocaleLowerCase();
        const matchesText = words.every(word => text.includes(word));
        const matchesStatus = statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? !project.archivedAt
            : statusFilter === "archived"
              ? Boolean(project.archivedAt)
              : !project.archivedAt && project.status === statusFilter;
        return matchesText && matchesStatus;
      });
      return sortProjects(matching, sortField, sortDir);
    },
    [projects, query, sortDir, sortField, statusFilter],
  );
  const startWithAi = useMutation({
    mutationFn: () => atelierApi.startProject(selectedCompanyId!, brief.trim(), intakeKey),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(selectedCompanyId!) });
      setAiDialogOpen(false);
      setBrief("");
      setIntakeKey("");
      navigate(projectUrl(result.project));
    },
  });

  const openAiIntake = () => {
    setIntakeKey((current) => current || crypto.randomUUID());
    setAiDialogOpen(true);
  };
  const groupedProjects = useMemo(() => {
    const groups = {
      mine: [] as typeof sortedProjects,
      other: [] as typeof sortedProjects,
    };

    for (const project of sortedProjects) {
      const state = resourceMembershipState(membershipsQuery.data, "project", project.id);
      if (state === "left") groups.other.push(project);
      else groups.mine.push(project);
    }

    return groups;
  }, [membershipsQuery.data, sortedProjects]);

  if (!selectedCompanyId) {
    return <EmptyState icon={Hexagon} message="Select an organization to view projects." />;
  }

  // Keep a loaded list on screen through a failed refetch; only a real
  // failure, or an outage before the first load, replaces the page.
  if (isLoading || projectsView.kind === "reconnecting") {
    return <PageSkeleton variant="list" />;
  }
  if (projectsView.kind === "error") {
    return (
      <QueryErrorState
        size="page"
        error={projectsView.error}
        action="load projects"
        onRetry={projectsView.retry}
        retrying={projectsView.isFetching}
      />
    );
  }

  return (
    <div className="space-y-4">
      <ProjectsToolbar query={query} onQueryChange={setQuery} sortField={sortField} sortDir={sortDir}
        onSortChange={(field, direction) => { setSortField(field); setSortDir(direction); }} onNewProject={openNewProject}
        onStartWithAi={openAiIntake} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
        viewMode={viewMode} onViewModeChange={setViewMode} />

      {!isLoading && projects.length === 0 && (
        <EmptyState
          icon={Hexagon}
          graphic={<ArtifactEmptyGraphic stack />}
          message="No projects yet."
          action="Create project"
          hideActionIcon
          onAction={openNewProject}
        />
      )}

      {projects.length > 0 && sortedProjects.length === 0 && <p className="text-sm text-muted-foreground">No projects match your search.</p>}

      {sortedProjects.length > 0 && (
        <div className="space-y-6">
          {([
            ["My Projects", groupedProjects.mine],
            ["Other Projects", groupedProjects.other],
          ] as const).map(([label, sectionProjects]) => {
            if (sectionProjects.length === 0) return null;

            return (
              <section key={label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium">{label}</h2>
                  <span className="text-xs text-muted-foreground">
                    {sectionProjects.length} project{sectionProjects.length === 1 ? "" : "s"}
                  </span>
                </div>
                {viewMode === "list" ? <Card className="block py-0 overflow-hidden divide-y divide-border">
                  {sectionProjects.map((project) => {
                    const state = resourceMembershipState(membershipsQuery.data, "project", project.id);
                    const pending = membershipMutation.isPending &&
                      membershipMutation.variables?.resourceType === "project" &&
                      membershipMutation.variables.resourceId === project.id;
                    const starPending = pending && membershipMutation.variables?.starred !== undefined;
                    const joinLeavePending = pending && membershipMutation.variables?.starred === undefined;
                    const starred = isStarred(membershipsQuery.data, "project", project.id);
                    return (
                      <EntityRow
                        key={project.id}
                        leading={<ProjectTile color={project.color ?? null} icon={project.icon ?? null} size="sm" />}
                        title={project.name}
                        subtitle={project.description ?? undefined}
                        reserveSubtitleSpace
                        to={projectUrl(project)}
                        className={state === "left" ? "group text-foreground/55" : "group"}
                        trailing={
                          <div className="flex items-center gap-3">
                            {project.visibility === "private" ? <Lock className="size-4 shrink-0 text-muted-foreground" aria-label="Private project" /> : null}
                            <span
                              className="hidden text-xs text-muted-foreground tabular-nums sm:inline"
                              title={`${formatNumber(project.taskCount ?? 0)} task${(project.taskCount ?? 0) === 1 ? "" : "s"}`}
                            >
                              {formatNumber(project.taskCount ?? 0)} task{(project.taskCount ?? 0) === 1 ? "" : "s"}
                            </span>
                            {project.budget && (
                              <span className="hidden text-xs text-muted-foreground tabular-nums sm:inline">
                                {formatProjectBudget(project.budget)}
                              </span>
                            )}
                            {project.targetDate && (
                              <span className="hidden text-xs text-muted-foreground md:inline">
                                {formatDate(project.targetDate)}
                              </span>
                            )}
                            <StatusBadge status={project.status} />
                            <MembershipAction
                              state={state}
                              pending={joinLeavePending}
                              pendingState={joinLeavePending ? membershipMutation.variables?.state : null}
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
                            <StarToggle
                              size="row"
                              starred={starred}
                              pending={starPending}
                              resourceName={project.name}
                              onToggle={(next) => membershipMutation.mutate({
                                resourceType: "project",
                                resourceId: project.id,
                                resourceName: project.name,
                                starred: next,
                              })}
                            />
                          </div>
                        }
                      />
                    );
                  })}
                </Card> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {sectionProjects.map((project) => (
                    <Card key={project.id} className="group overflow-hidden p-0 transition-colors hover:border-foreground/20">
                      <Link to={projectUrl(project)} className="flex min-h-40 flex-col gap-4 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <ProjectTile color={project.color ?? null} icon={project.icon ?? null} size="sm" />
                          <StatusBadge status={project.status} />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <h3 className="truncate font-medium">{project.name}</h3>
                          <p className="line-clamp-2 text-sm text-muted-foreground">{project.description || "Chưa có brief dự án."}</p>
                        </div>
                        <div className="mt-auto flex items-center justify-between gap-3 text-xs text-muted-foreground">
                          <span>{formatNumber(project.taskCount ?? 0)} tasks</span>
                          <span>{project.updatedAt ? `Updated ${formatDate(project.updatedAt)}` : "No activity yet"}</span>
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>}
              </section>
            );
          })}
        </div>
      )}
      <Dialog open={aiDialogOpen} onOpenChange={(open) => { if (!startWithAi.isPending) setAiDialogOpen(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="size-5" />Bắt đầu dự án với Chief Architect</DialogTitle>
            <DialogDescription>Mô tả không gian, nhu cầu, phong cách và ngân sách. Project chỉ được tạo sau khi brief có đủ ý nghĩa.</DialogDescription>
          </DialogHeader>
          <Textarea value={brief} onChange={(event) => setBrief(event.target.value)} disabled={startWithAi.isPending}
            rows={7} placeholder="Ví dụ: Thiết kế căn hộ 80 m², 2 phòng ngủ, phong cách Japandi, ngân sách 450 triệu đồng…" />
          {startWithAi.isError ? <p role="alert" className="text-sm text-destructive">{describeError(startWithAi.error).body}</p> : null}
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={startWithAi.isPending} onClick={() => setAiDialogOpen(false)}>Hủy</Button>
            <Button type="button" disabled={!brief.trim() || startWithAi.isPending} onClick={() => startWithAi.mutate()}>
              {startWithAi.isPending ? "Đang khởi tạo…" : "Tạo dự án & bắt đầu hội thoại"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
