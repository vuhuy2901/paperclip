import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock3,
  DollarSign,
  ExternalLink,
  Gauge,
  Layers3,
  RefreshCw,
  ShieldAlert,
  Timer,
  Users,
  XCircle,
} from "lucide-react";
import {
  useHostNavigation,
  usePluginData,
  type PluginWidgetProps,
} from "@paperclipai/plugin-sdk/ui";
import type {
  CompanyIntelligenceData,
  IntelligenceAgentRow,
  IntelligenceProjectRow,
  IntelligenceRange,
} from "../types.js";

const STATUS_COLORS: Record<string, string> = {
  running: "#2563eb",
  queued: "#64748b",
  waiting_approval: "#8b5cf6",
  paused: "#f59e0b",
  completed: "#16a34a",
  succeeded: "#16a34a",
  failed: "#dc2626",
  timed_out: "#dc2626",
  blocked: "#d97706",
  in_progress: "#2563eb",
};

function formatNumber(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat().format(value);
}

function formatDuration(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "No timing data";
  const seconds = Math.round(value / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function formatCost(cents: number | null | undefined): string {
  if (cents == null) return "Unknown";
  return `$${(cents / 100).toFixed(2)}`;
}

function statusColor(status: string | null | undefined): string {
  return STATUS_COLORS[status ?? ""] ?? "#64748b";
}

function initial(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || "A";
}

function Metric({ icon: Icon, label, value, detail, tone }: {
  icon: typeof Activity;
  label: string;
  value: string | number;
  detail: string;
  tone?: string;
}) {
  return (
    <div className="aic-metric">
      <div className="aic-metric-icon" style={{ color: tone ?? "var(--aic-accent)" }}><Icon size={15} /></div>
      <div className="aic-metric-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
    </div>
  );
}

function Section({ title, eyebrow, action, children }: { title: string; eyebrow?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="aic-section">
      <div className="aic-section-head">
        <div><span className="aic-eyebrow">{eyebrow ?? "Intelligence"}</span><h3>{title}</h3></div>
        {action}
      </div>
      {children}
    </section>
  );
}

function AgentRow({ agent, onOpen }: { agent: IntelligenceAgentRow; onOpen: (agentId: string) => void }) {
  return (
    <button className="aic-agent-row" onClick={() => onOpen(agent.agentId)}>
      <span className="aic-avatar">{initial(agent.name)}</span>
      <span className="aic-agent-name"><strong>{agent.name}</strong><small>{agent.role}</small></span>
      <span className="aic-agent-model">{agent.currentRunId ? <i className="aic-live-dot" /> : null}{agent.status}</span>
      <span>{formatNumber(agent.totalRuns)}</span>
      <span>{agent.successRate == null ? "—" : `${agent.successRate}%`}</span>
      <span>{formatDuration(agent.totalRuntimeMs)}</span>
      <span>{formatNumber(agent.completedTasks)}</span>
      <ArrowUpRight size={14} className="aic-row-arrow" />
    </button>
  );
}

function ProjectCard({ project, onOpen }: { project: IntelligenceProjectRow; onOpen: (projectId: string) => void }) {
  const runStatus = project.runStatus;
  const isActive = ["pending", "running", "waiting_approval", "paused"].includes(runStatus ?? "");
  return (
    <button className="aic-project-card" onClick={() => onOpen(project.projectId)}>
      <div className="aic-project-top"><span className="aic-project-icon"><Layers3 size={15} /></span><span className="aic-project-state" style={{ color: statusColor(runStatus ?? project.status) }}>{runStatus ?? project.status}</span></div>
      <strong>{project.name}</strong>
      <small>{project.workflowName ?? "No Workflow Run recorded"}</small>
      <div className="aic-progress"><span style={{ width: `${Math.max(0, Math.min(100, project.progress ?? 0))}%`, background: statusColor(runStatus ?? project.status) }} /></div>
      <div className="aic-project-meta"><span>{project.progress == null ? "No run progress" : `${project.progress}% complete`}</span><span>{project.completedTasks}/{project.completedTasks + project.pendingTasks} tasks</span></div>
      {isActive && project.currentStages.length > 0 ? <div className="aic-stage">Current: <strong>{project.currentStages.join(" · ")}</strong></div> : null}
      {project.blockedReason ? <div className="aic-warning"><AlertTriangle size={12} />{project.blockedReason}</div> : null}
      <span className="aic-project-link">Open Project <ExternalLink size={12} /></span>
    </button>
  );
}

export function CompanyIntelligenceDashboard({ context }: PluginWidgetProps) {
  const navigation = useHostNavigation();
  const [range, setRange] = useState<IntelligenceRange>("7d");
  const query = usePluginData<CompanyIntelligenceData>("company-intelligence", {
    companyId: context.companyId,
    range,
  });

  useEffect(() => {
    if (!context.companyId) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") query.refresh();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [context.companyId, query.refresh]);

  const data = query.data;
  const sortedAgents = useMemo(() => [...(data?.agents ?? [])].sort((a, b) => (b.totalRuntimeMs ?? -1) - (a.totalRuntimeMs ?? -1)), [data?.agents]);
  const maxRuntime = Math.max(1, ...sortedAgents.map((agent) => agent.totalRuntimeMs ?? 0));
  const maxDailyRuns = Math.max(1, ...(data?.daily ?? []).map((point) => point.runs));
  const actions = useMemo(() => {
    if (!data) return [];
    const items: Array<{ icon: typeof AlertTriangle; label: string; detail: string; tone: string }> = [];
    const failed = data.kpis.failedRuns;
    if (failed > 0) items.push({ icon: XCircle, label: `${failed} failed run${failed === 1 ? "" : "s"}`, detail: "Review errors in Run History", tone: "#dc2626" });
    const blocked = data.projects.filter((project) => project.blockedTasks > 0 || project.blockedReason).length;
    if (blocked > 0) items.push({ icon: ShieldAlert, label: `${blocked} blocked project${blocked === 1 ? "" : "s"}`, detail: "Open Project Workflow Monitor", tone: "#d97706" });
    if (data.kpis.pendingApprovals > 0) items.push({ icon: Clock3, label: `${data.kpis.pendingApprovals} pending approval${data.kpis.pendingApprovals === 1 ? "" : "s"}`, detail: "Human action is required", tone: "#8b5cf6" });
    return items;
  }, [data]);

  if (!context.companyId) return null;
  if (query.loading && !data) return <div className="aic-shell"><div className="aic-loading">Loading company intelligence…</div></div>;
  if (query.error) return <div className="aic-shell"><div className="aic-error"><AlertTriangle size={16} /> Analytics unavailable: {query.error.message}</div></div>;
  if (!data) return null;

  const kpi = data.kpis;
  const successRate = kpi.eligibleTerminalRuns > 0 ? `${Math.round((kpi.successfulRuns / kpi.eligibleTerminalRuns) * 1000) / 10}%` : "Not enough data";
  const costDetail = kpi.costCoverage === "subscription" ? "Subscription-backed events" : kpi.costCoverage === "reported" ? "Reported cost events" : kpi.costCoverage === "unknown" ? "Cost unavailable" : "No cost events";

  return (
    <div className="aic-shell">
      <style>{`
        .aic-shell{--aic-accent:#2563eb;--aic-panel:color-mix(in srgb,var(--card,var(--background)) 96%,var(--muted) 4%);display:grid;gap:18px;width:100%!important;max-width:100%!important;min-width:0;padding:2px 0 6px;color:var(--foreground)}
        /* Paperclip mounts dashboardWidget contributions inside a responsive grid. Ensure the widget and its host container span 100% full width */
        :has(> .aic-shell){grid-column:1 / -1!important;width:100%!important;border:none!important;background:transparent!important;padding:0!important;box-shadow:none!important}
        .grid:has(.aic-shell){grid-template-columns:minmax(0,1fr)!important;width:100%!important}
        .grid:has(.aic-shell)>*{grid-column:1 / -1!important;min-width:0;width:100%!important}
        .aic-shell *{box-sizing:border-box}.aic-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:18px;border:1px solid var(--border);border-radius:14px;background:linear-gradient(135deg,color-mix(in srgb,var(--aic-accent) 10%,var(--background)),var(--background) 58%)}
        .aic-eyebrow{display:block;color:var(--aic-accent);font-size:10px;font-weight:750;letter-spacing:.08em;text-transform:uppercase}.aic-hero h2{margin:4px 0 0;font-size:20px;letter-spacing:-.03em}.aic-hero p{margin:6px 0 0;max-width:68ch;color:var(--muted-foreground);font-size:11px;line-height:1.5}.aic-controls{display:flex;align-items:center;gap:7px;flex:none}.aic-select,.aic-refresh{height:30px;border:1px solid var(--border);border-radius:7px;background:var(--background);color:inherit;font-size:11px}.aic-select{padding:0 8px}.aic-refresh{display:grid;place-items:center;width:30px;cursor:pointer}.aic-stale{margin-top:7px;color:var(--muted-foreground);font-size:10px}.aic-dot{display:inline-block;width:6px;height:6px;margin-right:5px;border-radius:999px;background:#16a34a}.aic-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}.aic-metric{display:flex;gap:9px;min-width:0;padding:11px;border:1px solid var(--border);border-radius:10px;background:var(--aic-panel)}.aic-metric-icon{display:grid;place-items:center;width:28px;height:28px;flex:none;border-radius:8px;background:color-mix(in srgb,currentColor 12%,transparent)}.aic-metric-copy{min-width:0}.aic-metric-copy span,.aic-metric-copy small{display:block;color:var(--muted-foreground);font-size:9px}.aic-metric-copy strong{display:block;margin:3px 0;font-size:18px;line-height:1.1}.aic-section{display:grid;gap:10px}.aic-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px}.aic-section-head h3{margin:2px 0 0;font-size:14px;letter-spacing:-.01em}.aic-section-head button{border:0;background:none;color:var(--aic-accent);font-size:10px;cursor:pointer}.aic-project-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:9px}.aic-project-card{display:grid;gap:7px;min-width:0;padding:12px;border:1px solid var(--border);border-radius:11px;background:var(--aic-panel);text-align:left;color:inherit;cursor:pointer}.aic-project-card:hover,.aic-agent-row:hover{border-color:color-mix(in srgb,var(--aic-accent) 45%,var(--border));background:color-mix(in srgb,var(--aic-accent) 4%,var(--aic-panel))}.aic-project-top{display:flex;align-items:center;justify-content:space-between}.aic-project-icon{display:grid;place-items:center;width:27px;height:27px;border-radius:7px;background:color-mix(in srgb,var(--aic-accent) 12%,transparent);color:var(--aic-accent)}.aic-project-state{font-size:9px;font-weight:700;text-transform:uppercase}.aic-project-card>strong{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.aic-project-card>small{min-height:25px;color:var(--muted-foreground);font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.aic-progress{height:5px;overflow:hidden;border-radius:999px;background:var(--muted)}.aic-progress span{display:block;height:100%;border-radius:999px}.aic-project-meta{display:flex;justify-content:space-between;gap:8px;color:var(--muted-foreground);font-size:9px}.aic-stage{font-size:9px;color:var(--muted-foreground)}.aic-stage strong{color:var(--foreground);font-weight:600}.aic-warning{display:flex;align-items:flex-start;gap:5px;color:#b45309;font-size:9px;line-height:1.35}.aic-project-link{display:flex;align-items:center;gap:5px;margin-top:2px;color:var(--aic-accent);font-size:10px;font-weight:650}.aic-two-col{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(280px,.7fr);gap:12px}.aic-card{min-width:0;padding:13px;border:1px solid var(--border);border-radius:11px;background:var(--aic-panel)}.aic-table{display:grid;gap:0;overflow:auto}.aic-table-head,.aic-agent-row{display:grid;grid-template-columns:minmax(150px,1.6fr) 78px 55px 68px 72px 74px 56px 18px;align-items:center;gap:8px;min-width:690px}.aic-table-head{padding:0 8px 7px;color:var(--muted-foreground);font-size:9px;text-transform:uppercase;letter-spacing:.04em}.aic-agent-row{width:100%;padding:8px;border:1px solid transparent;border-bottom-color:var(--border);background:transparent;color:inherit;text-align:left;font-size:10px;cursor:pointer}.aic-agent-row:last-child{border-bottom-color:transparent}.aic-avatar{display:grid;place-items:center;width:26px;height:26px;border-radius:7px;background:color-mix(in srgb,var(--aic-accent) 14%,transparent);color:var(--aic-accent);font-size:10px;font-weight:750}.aic-agent-name{display:grid;gap:2px;min-width:0}.aic-agent-name strong,.aic-agent-name small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.aic-agent-name small{color:var(--muted-foreground);font-size:9px}.aic-agent-model{display:flex;align-items:center;gap:4px;color:var(--muted-foreground);font-size:9px;text-transform:capitalize}.aic-live-dot{width:6px;height:6px;border-radius:999px;background:#16a34a;box-shadow:0 0 0 3px color-mix(in srgb,#16a34a 16%,transparent)}.aic-row-arrow{color:var(--muted-foreground)}.aic-leaderboard{display:grid;gap:9px}.aic-leader{display:grid;grid-template-columns:26px minmax(80px,1fr) auto;align-items:center;gap:8px}.aic-leader-name{min-width:0;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.aic-leader-track{height:7px;overflow:hidden;border-radius:999px;background:var(--muted)}.aic-leader-track span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#2563eb,#60a5fa)}.aic-leader-value{color:var(--muted-foreground);font-size:9px}.aic-action-list{display:grid;gap:6px}.aic-action{display:flex;align-items:center;gap:8px;padding:8px;border-radius:8px;background:color-mix(in srgb,var(--muted) 34%,transparent);font-size:10px}.aic-action svg{flex:none}.aic-action-copy{min-width:0}.aic-action-copy strong,.aic-action-copy small{display:block}.aic-action-copy small{margin-top:2px;color:var(--muted-foreground);font-size:9px}.aic-empty{padding:18px;border:1px dashed var(--border);border-radius:9px;color:var(--muted-foreground);font-size:10px}.aic-heatmap{display:grid;grid-template-columns:repeat(7,minmax(18px,1fr));gap:4px}.aic-heat-cell{height:25px;border-radius:4px;background:var(--muted);cursor:default}.aic-heat-cell[title]{cursor:help}.aic-runs{display:grid;gap:0;overflow:auto}.aic-run{display:grid;grid-template-columns:130px minmax(120px,1fr) 88px 76px 68px;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);font-size:10px}.aic-run:last-child{border-bottom:0}.aic-run small{display:block;color:var(--muted-foreground);font-size:9px}.aic-run-id{font:9px ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--muted-foreground)}.aic-run-status{display:flex;align-items:center;gap:5px;text-transform:capitalize}.aic-run-status i{width:6px;height:6px;border-radius:999px;background:currentColor}.aic-quality-note{display:flex;align-items:flex-start;gap:7px;padding:9px;border-radius:8px;background:color-mix(in srgb,#64748b 9%,transparent);color:var(--muted-foreground);font-size:9px;line-height:1.45}.aic-loading,.aic-error{padding:16px;border:1px solid var(--border);border-radius:11px;color:var(--muted-foreground);font-size:11px}.aic-error{display:flex;align-items:center;gap:7px;color:#b91c1c}.aic-card-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.aic-card-title strong{font-size:11px}.aic-card-title span{color:var(--muted-foreground);font-size:9px}.aic-updated{color:var(--muted-foreground);font-size:9px}
        @media(max-width:1100px){.aic-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.aic-two-col{grid-template-columns:1fr}.aic-hero{flex-direction:column}.aic-controls{width:100%}}
        @media(max-width:640px){.aic-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.aic-hero{padding:13px}.aic-hero h2{font-size:17px}.aic-run{grid-template-columns:1fr 1fr}.aic-run>*:nth-child(n+4){display:none}}
      `}</style>
      <div className="aic-hero">
        <div><span className="aic-eyebrow">AI Company Intelligence</span><h2>Executive Operations Center</h2><p>Recorded execution, project progress, agent reliability, and action-required signals from Paperclip’s live data.</p><div className="aic-stale"><span className="aic-dot" />Updated {new Date(data.generatedAt).toLocaleTimeString()}</div></div>
        <div className="aic-controls"><select className="aic-select" value={range} onChange={(event) => setRange(event.target.value as IntelligenceRange)} aria-label="Analytics time range"><option value="24h">Last 24 hours</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option></select><button className="aic-refresh" onClick={() => query.refresh()} title="Refresh analytics"><RefreshCw size={14} /></button></div>
      </div>
      <div className="aic-grid">
        <Metric icon={Layers3} label="Total Projects" value={kpi.totalProjects} detail={`${kpi.activeProjects} active`} />
        <Metric icon={Bot} label="Running Agents" value={`${kpi.runningAgents}/${kpi.totalAgents}`} detail="Current execution state" tone="#16a34a" />
        <Metric icon={Activity} label="Workflow Runs" value={kpi.activeWorkflowRuns} detail="Active now" tone="#2563eb" />
        <Metric icon={Gauge} label="Tasks In Progress" value={kpi.tasksInProgress} detail="Issue status evidence" tone="#8b5cf6" />
        <Metric icon={CheckCircle2} label="Run Success" value={successRate} detail={`${kpi.successfulRuns}/${kpi.eligibleTerminalRuns} terminal`} tone="#16a34a" />
        <Metric icon={DollarSign} label="Recorded Cost" value={formatCost(kpi.reportedCostCents)} detail={costDetail} tone="#d97706" />
      </div>
      <Section title="Active Projects" eyebrow="Project Intelligence" action={<button onClick={() => navigation.navigate("/projects-portfolio")}>Open portfolio <ArrowUpRight size={12} /></button>}>
        {data.projects.length === 0 ? <div className="aic-empty">No projects are available for this company.</div> : <div className="aic-project-grid">{data.projects.slice(0, 6).map((project) => <ProjectCard key={project.projectId} project={project} onOpen={(id) => navigation.navigate(`/projects/${id}?tab=workflow`)} />)}</div>}
      </Section>
      <div className="aic-two-col">
        <Section title="Agent Runtime Leaderboard" eyebrow="Agent Intelligence" action={<button onClick={() => navigation.navigate("/agents")}>All agents <ArrowUpRight size={12} /></button>}>
          <div className="aic-card"><div className="aic-leaderboard">{sortedAgents.slice(0, 8).map((agent) => <div className="aic-leader" key={agent.agentId}><span className="aic-avatar">{initial(agent.name)}</span><span className="aic-leader-name">{agent.name}</span><span className="aic-leader-value">{formatDuration(agent.totalRuntimeMs)}</span><span className="aic-leader-track" style={{ gridColumn: "2 / 4" }}><span style={{ width: `${Math.round(((agent.totalRuntimeMs ?? 0) / maxRuntime) * 100)}%` }} /></span></div>)}</div></div>
        </Section>
        <Section title="Action Required" eyebrow="Prioritized Signals"><div className="aic-card"><div className="aic-action-list">{actions.length === 0 ? <div className="aic-empty"><CheckCircle2 size={14} /> No failed, blocked, or pending approval signals in this window.</div> : actions.map((item) => <button className="aic-action" key={item.label} onClick={() => navigation.navigate(item.label.includes("approval") ? "/approvals" : item.label.includes("failed") ? "/runs" : "/projects-portfolio")}><item.icon size={14} color={item.tone} /><span className="aic-action-copy"><strong>{item.label}</strong><small>{item.detail}</small></span><ArrowUpRight size={12} /></button>)}</div></div></Section>
      </div>
      <Section title="Agent Performance" eyebrow="Recorded Heartbeat Runs"><div className="aic-card"><div className="aic-table"><div className="aic-table-head"><span>Agent</span><span>State</span><span>Runs</span><span>Success</span><span>Total Runtime</span><span>Tasks Done</span><span>P95</span><span /></div>{sortedAgents.length === 0 ? <div className="aic-empty">No heartbeat runs have been recorded in this range.</div> : sortedAgents.map((agent) => <AgentRow key={agent.agentId} agent={agent} onOpen={(id) => navigation.navigate(`/agents/${id}/dashboard`)} />)}</div></div></Section>
      <div className="aic-two-col">
        <Section title="Activity Heatmap" eyebrow="Execution Analytics"><div className="aic-card"><div className="aic-card-title"><strong>Runs per day</strong><span>{data.range}</span></div>{data.daily.length === 0 ? <div className="aic-empty">No run activity in this window.</div> : <div className="aic-heatmap">{data.daily.map((point) => <span className="aic-heat-cell" key={point.date} title={`${point.date}: ${point.runs} runs · ${formatDuration(point.runtimeMs)} runtime · ${point.failures} failures`} style={{ background: point.runs === 0 ? "var(--muted)" : `color-mix(in srgb, #2563eb ${Math.min(92, 18 + Math.round((point.runs / maxDailyRuns) * 74))}%, var(--muted))` }} />)}</div>}<div className="aic-updated" style={{ marginTop: 10 }}>Hover a day for runs, runtime, and failures. Values are recorded, not estimated.</div></div></Section>
        <Section title="Token & Cost Evidence" eyebrow="Resource Analytics"><div className="aic-card"><div className="aic-card-title"><strong>Selected window</strong><span>{costDetail}</span></div><div className="aic-leaderboard"><div className="aic-leader"><span className="aic-avatar"><Timer size={13} /></span><span className="aic-leader-name">Total runtime</span><span className="aic-leader-value">{formatDuration(kpi.totalRuntimeMs)}</span></div><div className="aic-leader"><span className="aic-avatar"><Gauge size={13} /></span><span className="aic-leader-name">Input + output tokens</span><span className="aic-leader-value">{formatNumber(kpi.totalTokens)}</span></div><div className="aic-leader"><span className="aic-avatar"><DollarSign size={13} /></span><span className="aic-leader-name">Reported cost</span><span className="aic-leader-value">{formatCost(kpi.reportedCostCents)}</span></div></div></div></Section>
      </div>
      <Section title="Recent Execution" eyebrow="Run Analytics" action={<button onClick={() => navigation.navigate("/dashboard/live")}>Open live runs <ArrowUpRight size={12} /></button>}>
        <div className="aic-card"><div className="aic-runs">{data.recentRuns.length === 0 ? <div className="aic-empty">No heartbeat runs have been recorded in this window.</div> : data.recentRuns.slice(0, 10).map((run) => <div className="aic-run" key={run.id}><span className="aic-run-id">{run.id.slice(0, 12)}…<small>{run.issueIdentifier ?? run.projectName ?? "Company run"}</small></span><span>{run.agentName}<small>{run.projectName ?? "Unattributed project"}</small></span><span className="aic-run-status" style={{ color: statusColor(run.status) }}><i />{run.status}</span><span>{formatDuration(run.durationMs)}</span><span>{run.errorCode ?? (run.error ? "Error" : "—")}</span></div>)}</div></div>
      </Section>
      <div className="aic-quality-note"><Users size={14} /><span>{data.dataQuality.note} Quality scoring, idle time, accepted deliverables, and cost attribution per task remain unavailable unless Paperclip records evidence for them.</span></div>
    </div>
  );
}
