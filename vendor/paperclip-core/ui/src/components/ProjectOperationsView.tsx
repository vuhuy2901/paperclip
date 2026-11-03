import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Project } from "@paperclipai/shared";
import { AlertCircle, ArrowRight, Bot, ListChecks, Plus, Search, Workflow } from "lucide-react";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../api/client";
import { agentsApi } from "../api/agents";
import { activityApi } from "../api/activity";
import { issuesApi } from "../api/issues";
import { useToastActions } from "../context/ToastContext";
import { queryKeys } from "../lib/queryKeys";
import {
  buildProjectOperationsModel,
  isProjectRequirement,
  MANUAL_TASK_LABEL,
  type ProjectWorkflowSnapshot,
  type ProjectTaskRow,
} from "../lib/project-operations";

const WORKFLOW_TAB = "plugin:ai-company-workflow-studio:project-workflow-tab";
const JOURNEY = ["Giao yêu cầu", "AI lập kế hoạch", "Phát triển", "Kiểm thử", "Bàn giao"];

function formattedTime(value: string | Date | null | undefined): string {
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

function TaskLine({ row, agentName, highlighted }: { row: ProjectTaskRow; agentName: string; highlighted: boolean }) {
  const { issue, stageName } = row;
  const runId = issue.activeRun?.id ?? issue.executionRunId;
  const logsHref = runId && issue.assigneeAgentId
    ? `/agents/${issue.assigneeAgentId}/runs/${runId}` : issueHref(issue);
  return (
    <div className={`grid gap-2 border-b border-border/60 px-3 py-3 text-sm last:border-b-0 md:grid-cols-[minmax(13rem,2fr)_minmax(8rem,1fr)_7rem_7rem_minmax(8rem,1fr)_8rem] md:items-center ${highlighted ? "bg-primary/10 ring-1 ring-primary/40" : "hover:bg-muted/30"}`}>
      <Link to={issueHref(issue)} className="min-w-0 font-medium text-foreground hover:text-primary hover:underline">
        <span className="block truncate">{issue.title}</span>
        <span className="text-xs font-normal text-muted-foreground">{issue.identifier}</span>
      </Link>
      <span className="truncate text-muted-foreground">{agentName}</span>
      <span>{statusLabel(issue.status)}</span>
      <span className={issue.activeRun?.status === "running" ? "font-medium text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
        {issue.activeRun?.status === "running" ? "Đang chạy" : issue.status === "blocked" ? "Cần xử lý" : issue.status === "done" ? "Hoàn thành" : "Chưa chạy"}
      </span>
      <span className="truncate text-muted-foreground">{stageName ?? "Chưa liên kết"}</span>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{formattedTime(issue.updatedAt)}</span>
        <Link to={logsHref} className="shrink-0 font-medium text-primary hover:underline">Logs</Link>
      </div>
    </div>
  );
}

export function ProjectOperationsView({ project, companyId, projectRef, mode }: {
  project: Project;
  companyId: string;
  projectRef: string;
  mode: "overview" | "tasks";
}) {
  const queryClient = useQueryClient();
  const { pushToast } = useToastActions();
  const [manualOpen, setManualOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualAgentId, setManualAgentId] = useState("");
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "title">("newest");
  const [grouped, setGrouped] = useState(true);
  const workflowHref = `/projects/${projectRef}?tab=${encodeURIComponent(WORKFLOW_TAB)}`;
  const monitorHref = `${workflowHref}&subtab=monitor`;
  const submitHref = `${workflowHref}&submitRequirement=1`;
  const { data: issues = [], isLoading: issuesLoading, error: issuesError } = useQuery({
    queryKey: queryKeys.issues.listByProject(companyId, project.id),
    queryFn: () => issuesApi.listAll(companyId, { projectId: project.id }),
    refetchInterval: 5000,
  });
  const { data: agents = [] } = useQuery({
    queryKey: queryKeys.agents.list(companyId),
    queryFn: () => agentsApi.list(companyId),
  });
  const workflowQuery = useQuery({
    queryKey: ["project-operations-workflow", companyId, project.id],
    queryFn: async () => {
      const result = await api.post<{ data: ProjectWorkflowSnapshot }>(
        "/plugins/ai-company-workflow-studio/data/project-workflow",
        { companyId, params: { companyId, projectId: project.id } },
      );
      return result.data;
    },
    refetchInterval: 5000,
    retry: false,
  });
  const requirement = useMemo(() => [...issues].filter(isProjectRequirement)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null, [issues]);
  const requirementDetail = useQuery({
    queryKey: requirement ? queryKeys.issues.detail(requirement.id) : ["project-requirement", "none"],
    queryFn: () => issuesApi.get(requirement!.id),
    enabled: Boolean(requirement),
    refetchInterval: 5000,
  });
  const requirementRuns = useQuery({
    queryKey: requirement ? queryKeys.issues.runs(requirement.id) : ["project-requirement-runs", "none"],
    queryFn: () => activityApi.runsForIssue(requirement!.id),
    enabled: Boolean(requirement),
    refetchInterval: 5000,
  });
  const model = useMemo(() => buildProjectOperationsModel({
    issues,
    workflow: workflowQuery.data ?? null,
    requirementDetail: requirementDetail.data,
    requirementRuns: requirementRuns.data,
  }), [issues, workflowQuery.data, requirementDetail.data, requirementRuns.data]);
  const errorIsConnection = /fetch failed|gateway .*unavailable|gateway .*request failed/i.test(model.failure ?? "");
  const runtimeHealth = useQuery({
    queryKey: ["project-ai-runtime-health", companyId],
    queryFn: async () => (await api.post<{ data: { reachable: boolean; reason: string | null } }>(
      "/plugins/ai-company-workflow-studio/data/ai-runtime-health",
      { companyId, params: { companyId } },
    )).data,
    enabled: errorIsConnection,
    refetchInterval: errorIsConnection ? 10_000 : false,
    retry: false,
  });
  const retry = useMutation({
    mutationFn: () => agentsApi.retryFailedRun(model.failedAgentId!, model.failedRunId!, companyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.issues.listByProject(companyId, project.id) });
      if (model.requirement) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(model.requirement.id) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.issues.runs(model.requirement.id) });
      }
      pushToast({ title: "Đã yêu cầu chạy lại", body: "Theo dõi lần chạy mới trong Logs.", tone: "success" });
    },
  });
  const createManual = useMutation({
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
      setHighlightedTaskId(issue.id);
      window.setTimeout(() => setHighlightedTaskId((current) => current === issue.id ? null : current), 10_000);
      void queryClient.invalidateQueries({ queryKey: queryKeys.issues.listByProject(companyId, project.id) });
      pushToast({ title: "Đã thêm Task thủ công", tone: "success", action: { label: "Mở Task", href: issueHref(issue) } });
    },
  });
  const agentName = (id: string | null) => agents.find((agent) => agent.id === id)?.name ?? "Chưa phân công";
  const latestRun = [...(requirementRuns.data ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null;
  const visibleTasks = model.tasks.filter((row) => {
    const text = `${row.issue.title} ${row.issue.identifier ?? ""}`.toLowerCase();
    return text.includes(search.toLowerCase()) &&
      (!agentFilter || row.issue.assigneeAgentId === agentFilter) &&
      (!statusFilter || row.issue.status === statusFilter);
  }).sort((a, b) => sort === "title" ? a.issue.title.localeCompare(b.issue.title)
    : (new Date(b.issue.updatedAt).getTime() - new Date(a.issue.updatedAt).getTime()) * (sort === "oldest" ? -1 : 1));
  const taskGroups = grouped
    ? [...new Set(visibleTasks.map((row) => row.stageName ?? "Chưa liên kết Workflow"))]
      .map((name) => ({ name, rows: visibleTasks.filter((row) => (row.stageName ?? "Chưa liên kết Workflow") === name) }))
    : [{ name: "Tất cả Task", rows: visibleTasks }];
  if (issuesLoading) return <p className="py-10 text-sm text-muted-foreground">Đang tải dữ liệu dự án…</p>;
  if (issuesError) return <p role="alert" className="text-sm text-destructive">Không tải được công việc: {issuesError.message}</p>;

  return <div className="space-y-5" data-testid={`project-${mode}`}>
    {mode === "overview" ? <>
      <section className="rounded-xl border border-border bg-card p-5 shadow-xs sm:p-6" aria-label="Tiến độ dự án">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tổng quan dự án</p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">{model.headline}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{model.explanation}</p>
          </div>
          <Button asChild><Link to={submitHref}><Plus className="mr-1 h-4 w-4" />Giao yêu cầu cho AI</Link></Button>
        </div>
        <div className="mt-5 grid gap-4 border-t border-border/70 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-5">
          <div><span className="block text-xs text-muted-foreground">Trạng thái</span><strong>{model.phase === "pm-failed" ? "Cần xử lý" : model.phase === "completed" ? "Hoàn thành" : model.phase === "waiting-approval" ? "Chờ phê duyệt" : project.status}</strong></div>
          <div><span className="block text-xs text-muted-foreground">Workflow</span><strong>{workflowQuery.data?.binding?.templateName ?? "Chưa chọn"}</strong></div>
          <div><span className="block text-xs text-muted-foreground">Giai đoạn hiện tại</span><strong>{model.currentStages.join(", ") || "Chưa bắt đầu"}</strong></div>
          <div><span className="block text-xs text-muted-foreground">Agent đang chạy</span><strong>{model.activeAgents.join(", ") || "Không có"}</strong></div>
          <div><span className="block text-xs text-muted-foreground">Hoạt động gần nhất</span><strong>{formattedTime(model.lastActivity)}</strong></div>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted" aria-label={`Tiến độ ${model.progress}%`}><div className="h-full rounded-full bg-primary" style={{ width: `${model.progress}%` }} /></div>
          <strong className="text-sm tabular-nums">{model.progress}%</strong>
        </div>
        <ol className="mt-5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5" aria-label="Hành trình dự án">
          {JOURNEY.map((step, index) => <li key={step} className={`border-t-2 pt-2 ${index < model.journeyStep ? "border-primary text-foreground" : index === model.journeyStep ? "border-primary text-primary font-semibold" : "border-border text-muted-foreground"}`}>
            {step}{model.phase === "pm-failed" && index === 1 ? " · Cần xử lý" : ""}
          </li>)}
        </ol>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(17rem,1fr)]">
        <section className="rounded-xl border border-border bg-card p-5" aria-label="Yêu cầu gần nhất">
          <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">Yêu cầu gần nhất</h3><span className="text-xs text-muted-foreground">{formattedTime(model.requirementTime)}</span></div>
          {model.requirementText ? <>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-foreground">{model.requirementText}</p>
            <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
              <span>Điều phối: <b className="text-foreground">{agentName(model.requirement?.assigneeAgentId ?? workflowQuery.data?.activeRun?.projectManagerAgentId ?? null)}</b></span>
              <span>Xử lý: <b className="text-foreground">{model.phase === "pm-failed" ? "Lỗi thực thi" : statusLabel(model.requirement?.status ?? "todo")}</b></span>
              <span>Lần chạy gần nhất: <b className="text-foreground">{latestRun ? formattedTime(latestRun.finishedAt ?? latestRun.startedAt) : "Chưa có"}</b></span>
              <span>{latestRun ? `Kết quả: ${latestRun.status}` : "Đang chờ Agent nhận yêu cầu"}</span>
            </div>
            {model.failure && <p role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{model.failure}</p>}
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              {model.requirement && <Link className="font-medium text-primary hover:underline" to={issueHref(model.requirement)}>Xem yêu cầu <ArrowRight className="inline h-3 w-3" /></Link>}
              {model.failedAgentId && model.failedRunId && <Link className="font-medium text-primary hover:underline" to={`/agents/${model.failedAgentId}/runs/${model.failedRunId}`}>Xem Run Logs</Link>}
            </div>
          </> : <div className="mt-4 rounded-lg bg-muted/40 p-5 text-sm text-muted-foreground">Bạn chưa gửi yêu cầu cho dự án. <Link className="font-medium text-primary hover:underline" to={submitHref}>Giao yêu cầu đầu tiên</Link></div>}
        </section>

        <section className={`rounded-xl border p-5 ${model.phase === "pm-failed" || model.phase === "workflow-blocked" ? "border-destructive/40 bg-destructive/5" : "border-border bg-card"}`} aria-label="Cần bạn xử lý">
          <h3 className="flex items-center gap-2 font-semibold"><AlertCircle className="h-4 w-4" />Cần bạn xử lý</h3>
          {model.phase === "pm-failed" ? <div className="mt-3 space-y-3 text-sm">
            <p>Project Manager chưa tạo được kế hoạch và Task. Lần chạy gần nhất đã thất bại.</p>
            {errorIsConnection && <p className="text-muted-foreground">Kết nối AI: {runtimeHealth.data?.reachable ? "đã khôi phục" : runtimeHealth.data ? `chưa sẵn sàng (${runtimeHealth.data.reason ?? "không kết nối"})` : "đang kiểm tra"}</p>}
            <div className="flex flex-wrap gap-2">
              {model.failedAgentId && model.failedRunId && <Button size="sm" variant="outline" asChild><Link to={`/agents/${model.failedAgentId}/runs/${model.failedRunId}`}>Xem lỗi và Logs</Link></Button>}
              {model.failedAgentId && errorIsConnection && !runtimeHealth.data?.reachable && <Button size="sm" variant="outline" asChild><Link to={`/agents/${model.failedAgentId}`}>Sửa kết nối AI</Link></Button>}
              {model.canRetry && <Button size="sm" disabled={retry.isPending || (errorIsConnection && runtimeHealth.data?.reachable === false)} onClick={() => retry.mutate()}>{retry.isPending ? "Đang yêu cầu…" : "Thử lại"}</Button>}
            </div>
            {retry.isError && <p role="alert" className="text-destructive">{retry.error.message}</p>}
          </div> : model.phase === "waiting-approval" ? <div className="mt-3 space-y-3 text-sm"><p>Workflow đang chờ phê duyệt giai đoạn hiện tại.</p><Button size="sm" asChild><Link to={monitorHref}>Xem giai đoạn cần duyệt</Link></Button></div>
            : model.phase === "completed" ? <div className="mt-3 space-y-3 text-sm"><p>Kiểm tra kết quả và nghiệm thu sản phẩm bàn giao.</p><Button size="sm" asChild><Link to={`${workflowHref}&subtab=deliverables`}>Xem sản phẩm bàn giao</Link></Button></div>
              : model.phase === "workflow-blocked" ? <div className="mt-3 space-y-3 text-sm"><p>Workflow cần được xử lý trước khi tiếp tục.</p><Button size="sm" asChild><Link to={monitorHref}>Xem Live Monitor</Link></Button></div>
                : <p className="mt-3 text-sm text-muted-foreground">{model.phase === "no-requirement" ? "Giao yêu cầu để AI bắt đầu." : "Hiện chưa có phê duyệt hoặc lỗi cần bạn xử lý."}</p>}
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5" aria-label="Công việc của AI">
          <div className="flex items-center justify-between"><h3 className="flex items-center gap-2 font-semibold"><Bot className="h-4 w-4" />Công việc của AI</h3><Link to={`/projects/${projectRef}/issues`} className="text-sm font-medium text-primary hover:underline">Xem Tasks</Link></div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
            {[["Task đã tạo", model.tasks.length], ["Đang chạy", model.runningCount], ["Hoàn thành", model.completedCount], ["Bị chặn", model.blockedCount], ["Lần chạy lỗi", model.failedCount + (model.phase === "pm-failed" ? 1 : 0)]].map(([label, count]) => <div key={label} className="min-w-0"><strong className="block text-lg tabular-nums">{count}</strong><span className="text-xs text-muted-foreground">{label}</span></div>)}
          </div>
          {model.tasks.length === 0 && <p className="mt-4 rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">{model.phase === "pm-failed" ? "Project Manager chưa thể tạo Task vì lần thực thi gần nhất thất bại. Mở Run Logs để xem lỗi." : model.phase === "no-requirement" ? "Chưa có yêu cầu, nên AI chưa tạo Task." : "AI Project Manager chưa hoàn thành phân tích yêu cầu. Task sẽ xuất hiện khi kế hoạch được tạo."}</p>}
        </section>
        <section className="rounded-xl border border-border bg-card p-5" aria-label="Workflow hiện tại">
          <div className="flex items-center justify-between"><h3 className="flex items-center gap-2 font-semibold"><Workflow className="h-4 w-4" />Workflow hiện tại</h3><Link to={monitorHref} className="text-sm font-medium text-primary hover:underline">Mở Live Monitor</Link></div>
          <p className="mt-3 text-sm font-medium">{workflowQuery.data?.binding?.templateName ?? "Chưa gắn Workflow"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{model.currentStages.length ? `Giai đoạn: ${model.currentStages.join(", ")}` : "Chưa có giai đoạn đang chạy"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{model.activeAgents.length ? `Agent đang chạy: ${model.activeAgents.join(", ")}` : "Không có Agent nào đang chạy"}</p>
          <p className="mt-3 text-xs text-muted-foreground">Bản ghi Workflow: {workflowQuery.data?.activeRun?.status ?? "Chưa bắt đầu"}{model.phase === "pm-failed" ? " · PM đã thất bại" : ""} · Tiến độ Task: {model.progress}%</p>
          {workflowQuery.error && <p role="alert" className="mt-3 text-xs text-destructive">Không tải được trạng thái Workflow. <button className="underline" onClick={() => void workflowQuery.refetch()}>Thử lại</button></p>}
        </section>
      </div>
    </> : <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="text-lg font-semibold">Công việc AI thực hiện</h3><p className="text-sm text-muted-foreground">Task do AI tạo và Task thủ công được phân công. Giai đoạn Workflow được theo dõi riêng.</p></div>
        <Button variant="outline" size="sm" onClick={() => setManualOpen(true)}><Plus className="mr-1 h-4 w-4" />Thêm Task thủ công</Button>
      </div>
      {model.tasks.length === 0 ? <section className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <ListChecks className="mx-auto h-7 w-7 text-muted-foreground" />
        <h3 className="mt-3 font-semibold">Chưa có công việc AI thực hiện</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{model.phase === "pm-failed" ? "Project Manager không thể tạo kế hoạch và Task vì lần thực thi thất bại." : model.phase === "no-requirement" ? "Hãy giao yêu cầu đầu tiên để AI bắt đầu lập kế hoạch." : "Project Manager đang xử lý yêu cầu. Task sẽ xuất hiện sau khi AI tạo kế hoạch."}</p>
        <div className="mt-4 flex justify-center gap-3 text-sm">
          {model.requirement && <Link to={issueHref(model.requirement)} className="font-medium text-primary hover:underline">Xem yêu cầu</Link>}
          {model.failedAgentId && model.failedRunId && <Link to={`/agents/${model.failedAgentId}/runs/${model.failedRunId}`} className="font-medium text-primary hover:underline">Xem Run Logs</Link>}
          {!model.requirement && <Link to={submitHref} className="font-medium text-primary hover:underline">Giao yêu cầu cho AI</Link>}
        </div>
      </section> : <>
        <div className="flex flex-wrap items-center gap-2" aria-label="Bộ lọc Task">
          <div className="relative min-w-48 flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input aria-label="Tìm Task" className="pl-8" placeholder="Tìm Task…" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
          <select aria-label="Lọc Agent" className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={agentFilter} onChange={(event) => setAgentFilter(event.target.value)}><option value="">Tất cả Agent</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select>
          <select aria-label="Lọc trạng thái" className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Mọi trạng thái</option>{["todo", "in_progress", "blocked", "in_review", "done"].map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select>
          <select aria-label="Sắp xếp Task" className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="newest">Cập nhật gần nhất</option><option value="oldest">Cập nhật cũ nhất</option><option value="title">Theo tên</option></select>
          <Button size="sm" variant="outline" onClick={() => setGrouped((current) => !current)}>{grouped ? "Nhóm theo giai đoạn" : "Danh sách phẳng"}</Button>
        </div>
        {visibleTasks.length === 0 ? <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Không có Task phù hợp bộ lọc.</p> :
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="hidden grid-cols-[minmax(13rem,2fr)_minmax(8rem,1fr)_7rem_7rem_minmax(8rem,1fr)_8rem] gap-2 border-b border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-muted-foreground md:grid">
              <span>Task</span><span>Agent phụ trách</span><span>Trạng thái</span><span>Thực thi</span><span>Giai đoạn Workflow</span><span>Cập nhật / Logs</span>
            </div>
            {taskGroups.map((group) => <div key={group.name}>
              {grouped && <div className="border-b border-border/60 bg-muted/20 px-3 py-2 text-xs font-semibold">{group.name} · {group.rows.length}</div>}
              {group.rows.map((row) => <TaskLine key={row.issue.id} row={row} agentName={agentName(row.issue.assigneeAgentId)} highlighted={highlightedTaskId === row.issue.id} />)}
            </div>)}
          </div>}
      </>}
    </>}

    <Dialog open={manualOpen} onOpenChange={setManualOpen}>
      <DialogContent><DialogHeader><DialogTitle>Thêm Task thủ công</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">Task được thêm vào dự án và không thay đổi Workflow.</p>
        <div className="space-y-3">
          <Input aria-label="Tên Task" placeholder="Tên Task" value={manualTitle} onChange={(event) => setManualTitle(event.target.value)} />
          <Textarea aria-label="Mô tả Task" placeholder="Mô tả công việc" value={manualDescription} onChange={(event) => setManualDescription(event.target.value)} />
          <select aria-label="Agent phụ trách Task" className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={manualAgentId} onChange={(event) => setManualAgentId(event.target.value)}><option value="">Chọn Agent phụ trách</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select>
          {createManual.isError && <p role="alert" className="text-sm text-destructive">{createManual.error.message}</p>}
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setManualOpen(false)}>Hủy</Button><Button disabled={!manualTitle.trim() || !manualAgentId || createManual.isPending} onClick={() => createManual.mutate()}>{createManual.isPending ? "Đang thêm…" : "Thêm Task"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}
