import React, { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  History,
  Play,
  RotateCcw,
  Search,
  Trash2,
  XCircle
} from "lucide-react";
import type { WorkflowRunSummary } from "../types.js";

export function RunHistoryView({
  runs,
  onInspectRun,
  onClearHistory,
  busy = false
}: {
  runs: WorkflowRunSummary[];
  onInspectRun: (workflowId: string, runId: string, replay?: boolean) => void;
  onClearHistory?: () => Promise<void>;
  busy?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredRuns = runs
    .filter((run) => {
      if (statusFilter !== "all" && run.status !== statusFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          run.id.toLowerCase().includes(q) ||
          run.workflowName.toLowerCase().includes(q) ||
          run.projectName.toLowerCase().includes(q) ||
          run.inputRequirement.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  return (
    <div className="wfs-list-page" style={{ maxWidth: 1100 }}>
      <header className="wfs-list-header">
        <div>
          <div className="wfs-list-eyebrow">Execution Logs & Observability</div>
          <h1>Workflow Run History</h1>
          <p>
            Review all previous workflow executions, inspect final graph states, and replay
            execution event timelines step-by-step.
          </p>
        </div>

        <div className="wfs-list-header-actions">
          {onClearHistory && runs.length > 0 && (
            <button
              className="wfs-button wfs-button-danger"
              disabled={busy}
              onClick={onClearHistory}
              title="Clean up completed or cancelled runs"
            >
              <Trash2 size={13} /> Clear Past Runs
            </button>
          )}
        </div>
      </header>

      <div className="wfs-list-filters">
        <label className="wfs-list-search">
          <Search size={14} />
          <input
            placeholder="Search by Run ID, project, or requirement..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
          <option value="waiting_approval">Waiting Approval</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <span>{filteredRuns.length} of {runs.length} runs</span>
      </div>

      {filteredRuns.length === 0 ? (
        <div className="wfs-list-empty">
          <History size={24} />
          <div>
            <strong>No workflow runs match this filter</strong>
            <p>Runs appear here automatically when a project workflow is launched.</p>
          </div>
        </div>
      ) : (
        <div className="wfs-runs-table">
          <div
            className="wfs-workflow-table-head"
            style={{ gridTemplateColumns: "190px 140px 110px 100px 90px 110px 1fr" }}
          >
            <span>Run ID</span>
            <span>Project</span>
            <span>Status</span>
            <span>Progress</span>
            <span>Tasks</span>
            <span>Started</span>
            <span style={{ textAlign: "right" }}>Actions</span>
          </div>

          {filteredRuns.map((run) => {
            const statusClass =
              run.status === "completed"
                ? "wfs-badge-published"
                : run.status === "running"
                ? "wfs-badge-published"
                : run.status === "failed"
                ? "wfs-badge-draft"
                : "";

            return (
              <div
                key={run.id}
                className="wfs-workflow-table-row"
                style={{ gridTemplateColumns: "190px 140px 110px 100px 90px 110px 1fr" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                  <Activity size={14} color="var(--wfs-accent)" style={{ flex: "none" }} />
                  <strong
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                    title={run.id}
                  >
                    {run.id}
                  </strong>
                </div>

                <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 11 }}>
                  {run.projectName}
                </div>

                <div>
                  <span className={`wfs-badge ${statusClass}`} style={{ textTransform: "capitalize", fontSize: 9.5 }}>
                    {run.status.replaceAll("_", " ")}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 44, height: 4, background: "var(--muted)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${run.progress}%`, height: "100%", background: "#10b981" }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700 }}>{run.progress}%</span>
                </div>

                <div style={{ fontSize: 10.5, color: "var(--muted-foreground)" }}>
                  {run.completedTasks}/{run.totalTasks}
                </div>

                <time style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                  {new Date(run.startedAt).toLocaleTimeString()}
                </time>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                  <button
                    className="wfs-button"
                    style={{ height: 26, fontSize: 10 }}
                    onClick={() => onInspectRun(run.workflowId, run.id, false)}
                    title="View graph and logs"
                  >
                    Inspect Run
                  </button>
                  <button
                    className="wfs-button wfs-button-primary"
                    style={{ height: 26, fontSize: 10 }}
                    onClick={() => onInspectRun(run.workflowId, run.id, true)}
                    title="Replay historical execution step-by-step"
                  >
                    <Play size={10} /> Replay
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
