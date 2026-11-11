import { useEffect, useState } from "react";
import { Link, useActiveCompanyPrefix, useNavigate, useParams } from "@/lib/router";
import { ArrowRight, CheckCircle2, CircleAlert, Clock3, GitBranch, RefreshCw } from "lucide-react";

type CompanyWorkflow = {
  definition_version: number;
  status: string;
  definition: { stages: Array<{ key: string; label: string; agentKey: string; dependsOn: string[] }> };
  projects: Array<{ id: string; name: string; status: string; workflow_run_id: string | null; workflow_status: string }>;
};

type ProjectWorkflow = {
  run: { id: string; status: string; workflowVersion: number };
  root_issue: { identifier: string | null; title: string; status: string } | null;
  stages: Array<{
    stageKey: string;
    status: string;
    blockerReason: string | null;
    issue: { identifier: string | null; status: string } | null;
    agent: { name: string } | null;
    dependencies: string[];
  }>;
};

const statusLabel: Record<string, string> = {
  pending: "Chờ điều kiện",
  ready: "Sẵn sàng",
  running: "Đang chạy",
  done: "Hoàn tất",
  needs_input: "Cần hỏi người dùng",
  blocked: "Đang bị chặn",
  needs_review: "Cần review",
  failed: "Lỗi",
  not_provisioned: "Chưa provision",
};

function StatusPill({ status }: { status: string }) {
  const active = status === "done" || status === "ready";
  const attention = status === "needs_input" || status === "blocked" || status === "failed";
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${active ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" : attention ? "border-amber-500/30 bg-amber-500/10 text-amber-700" : "border-border bg-muted/40 text-muted-foreground"}`}>
    {attention ? <CircleAlert className="h-3 w-3" /> : active ? <CheckCircle2 className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
    {statusLabel[status] ?? status}
  </span>;
}

export function AtelierWorkflowControlCenter() {
  const prefix = useActiveCompanyPrefix();
  const navigate = useNavigate();
  const [data, setData] = useState<CompanyWorkflow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const load = async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/atelier/company-workflow");
      if (!response.ok) throw new Error(`Workflow API (${response.status})`);
      setData(await response.json());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được company workflow");
    } finally {
      setRefreshing(false);
    }
  };
  useEffect(() => { void load(); }, []);

  return <div className="h-full overflow-auto bg-background p-5 text-foreground">
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground"><GitBranch className="h-3.5 w-3.5" /> Paperclip authority</div>
          <h1 className="text-2xl font-semibold">Atelier Company Workflow</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Chief chỉ intake, giao việc, theo dõi và review. Specialist chỉ được chạy khi dependency, approval, decision ledger và artifact gate đã đủ.</p>
        </div>
        <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/50" disabled={refreshing}><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Làm mới</button>
      </div>
      {error ? <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</div> : null}
      {!data && !error ? <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">Đang tải workflow canonical…</div> : null}
      {data ? <>
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><div className="text-sm font-semibold">Definition v{data.definition_version}</div><div className="text-xs text-muted-foreground">Một definition đã publish · {data.definition.stages.length} stages</div></div><StatusPill status={data.status} /></div>
          <div className="grid gap-2 md:grid-cols-4">{data.definition.stages.map((stage, index) => <div key={stage.key} className="rounded-lg border border-border/80 bg-muted/20 p-3"><div className="text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</div><div className="mt-1 text-sm font-medium">{stage.label}</div><div className="mt-1 text-[11px] text-muted-foreground">{stage.dependsOn.length ? `Sau ${stage.dependsOn.join(", ")}` : "Chờ Chief intake"}</div></div>)}</div>
        </section>
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between"><div><div className="text-sm font-semibold">Project monitors</div><div className="text-xs text-muted-foreground">Mỗi project có run snapshot độc lập; backfill không tự dispatch agent.</div></div><span className="text-xs text-muted-foreground">{data.projects.length} projects</span></div>
          <div className="divide-y divide-border">{data.projects.map((project) => <button key={project.id} type="button" onClick={() => navigate(`/${prefix}/projects/${project.id}/workflow`)} className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-muted/30"><span className="min-w-0"><span className="block truncate text-sm font-medium">{project.name}</span><span className="block truncate text-xs text-muted-foreground">{project.id}</span></span><span className="flex shrink-0 items-center gap-2"><StatusPill status={project.workflow_status} /><ArrowRight className="h-4 w-4 text-muted-foreground" /></span></button>)}</div>
        </section>
      </> : null}
    </div>
  </div>;
}

export function AtelierProjectWorkflowMonitor() {
  const { projectId = "" } = useParams<{ projectId: string }>();
  const prefix = useActiveCompanyPrefix();
  const [data, setData] = useState<ProjectWorkflow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = async () => {
    try {
      const response = await fetch(`/api/atelier/workflow/project/${encodeURIComponent(projectId)}`);
      if (!response.ok) throw new Error(`Project workflow API (${response.status})`);
      setData(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được project workflow");
    }
  };
  useEffect(() => { if (projectId) void load(); }, [projectId]);
  return <div className="h-full overflow-auto bg-background p-5 text-foreground"><div className="mx-auto max-w-6xl space-y-5">
    <div className="flex items-start justify-between gap-3"><div><Link to={`/${prefix}/control-center`} className="text-xs text-muted-foreground hover:text-foreground">← Company workflow</Link><h1 className="mt-2 text-2xl font-semibold">Project workflow monitor</h1><p className="mt-1 text-sm text-muted-foreground">Run và stage execution được đọc trực tiếp từ Paperclip backend.</p></div>{data ? <StatusPill status={data.run.status} /> : null}</div>
    {error ? <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</div> : null}
    {data ? <><section className="rounded-xl border border-border bg-card p-4"><div className="grid gap-3 text-sm md:grid-cols-3"><div><div className="text-xs text-muted-foreground">Run ID</div><div className="mt-1 break-all font-mono text-xs">{data.run.id}</div></div><div><div className="text-xs text-muted-foreground">Version</div><div className="mt-1">v{data.run.workflowVersion}</div></div><div><div className="text-xs text-muted-foreground">Root</div><div className="mt-1">{data.root_issue?.identifier ?? "—"} · {data.root_issue?.status ?? "—"}</div></div></div></section><section className="overflow-hidden rounded-xl border border-border bg-card"><div className="grid grid-cols-[1.2fr_1fr_1fr_1.4fr] gap-3 border-b border-border bg-muted/30 px-4 py-3 text-xs font-medium text-muted-foreground"><span>Stage</span><span>Owner</span><span>State</span><span>Gate / dependency</span></div>{data.stages.map((stage) => <div key={stage.stageKey} className="grid grid-cols-[1.2fr_1fr_1fr_1.4fr] gap-3 border-b border-border px-4 py-3 last:border-0"><div><div className="text-sm font-medium">{stage.stageKey}</div><div className="text-xs text-muted-foreground">{stage.issue?.identifier ?? "chưa có issue"}</div></div><div className="text-sm">{stage.agent?.name ?? "—"}</div><div><StatusPill status={stage.status} /></div><div className="text-xs text-muted-foreground">{stage.blockerReason ?? (stage.dependencies.length ? `Sau ${stage.dependencies.join(", ")}` : "Sẵn sàng sau Chief intake")}</div></div>)}</section></> : !error ? <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">Đang tải project run…</div> : null}
  </div></div>;
}
