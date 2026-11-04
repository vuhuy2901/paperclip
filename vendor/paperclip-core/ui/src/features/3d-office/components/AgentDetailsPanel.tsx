import React, { useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router";
import type { AgentOfficeState } from "../types/OfficeTypes";
import { heartbeatsApi } from "@/api/heartbeats";
import {
  Bot,
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  GitPullRequest,
  Terminal,
  XCircle,
  AlertCircle,
  Camera,
  Layers,
  RotateCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AgentDetailsPanelProps {
  officeAgent: AgentOfficeState | null;
  onFocusCamera: (agentId: string) => void;
  onClose: () => void;
}

export function AgentDetailsPanel({ officeAgent, onFocusCamera, onClose }: AgentDetailsPanelProps) {
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  if (!officeAgent) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-full">
        <Bot className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-foreground">No Agent Selected</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
          Click on any 3D employee avatar or workstation in the office to view real-time tasks and execution status.
        </p>
      </div>
    );
  }

  const { agent, assignedDesk, visualStatus, activeTask, activeLiveRun, lastActiveTimestamp } = officeAgent;

  // Query latest run for this agent (either active or last completed)
  const { data: recentRuns = [], refetch: refetchRuns } = useQuery({
    queryKey: ["agent-latest-run", agent.id],
    queryFn: () => (agent.companyId ? heartbeatsApi.list(agent.companyId, agent.id, 1) : Promise.resolve([])),
    enabled: !!agent.id,
    refetchInterval: visualStatus === "running" ? 3000 : 12000,
  });

  const latestRun = recentRuns[0] ?? null;
  const effectiveRunId = activeLiveRun?.runId ?? latestRun?.id ?? null;
  const isCurrentlyExecuting = visualStatus === "running" || latestRun?.status === "running";

  // Query the real streaming heartbeat logs for the run
  const {
    data: runLogData,
    isLoading: isLogLoading,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ["heartbeat-run-log", effectiveRunId],
    queryFn: () => (effectiveRunId ? heartbeatsApi.log(effectiveRunId) : Promise.resolve(null)),
    enabled: !!effectiveRunId,
    refetchInterval: isCurrentlyExecuting ? 2000 : false,
  });

  // Parse ndjson lines into clean terminal output
  const parsedLogLines = useMemo(() => {
    if (!runLogData?.content) return [];
    const rawLines = runLogData.content.split("\n").filter((l) => l.trim().length > 0);
    return rawLines.map((line) => {
      try {
        const obj = JSON.parse(line);
        return {
          ts: obj.ts ? new Date(obj.ts).toLocaleTimeString() : "",
          stream: (obj.stream as string) ?? "stdout",
          text: (obj.chunk as string) ?? line,
        };
      } catch {
        return {
          ts: "",
          stream: "stdout",
          text: line,
        };
      }
    });
  }, [runLogData]);

  // Auto scroll to bottom when new logs arrive while running
  useEffect(() => {
    if (isCurrentlyExecuting) {
      terminalBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [parsedLogLines, isCurrentlyExecuting]);

  const statusColor =
    visualStatus === "running"
      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      : visualStatus === "error" || visualStatus === "blocked"
        ? "bg-red-500/10 text-red-500 border-red-500/20"
        : visualStatus === "paused"
          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
          : "bg-muted text-muted-foreground border-border/50";

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-4 bg-card/60 backdrop-blur">
      {/* Agent Identity */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0">
            {agent.icon ? <span>{agent.icon}</span> : <Bot className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">{agent.name}</h2>
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${statusColor}`}>
                {visualStatus}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">{agent.role ?? "AI Employee"}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0 text-muted-foreground">
          ×
        </Button>
      </div>

      {/* Desk & Department assignment */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40">
          <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider block mb-1">
            Department
          </span>
          <span className="font-medium text-foreground capitalize">{assignedDesk.roomId}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40">
          <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider block mb-1">
            Workstation
          </span>
          <span className="font-medium text-foreground">{assignedDesk.label}</span>
        </div>
      </div>

      {/* Current Task Execution */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-primary" />
            Current Assigned Task
          </span>
          {activeTask && (
            <Badge variant="outline" className="text-[10px]">
              {activeTask.priority.toUpperCase()}
            </Badge>
          )}
        </div>

        {activeTask ? (
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <Link
                to={`/issues/${activeTask.id}`}
                className="text-xs font-semibold text-foreground hover:underline hover:text-primary transition-colors flex-1"
              >
                {activeTask.identifier ? `${activeTask.identifier}: ` : ""}
                {activeTask.title}
              </Link>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/80 font-medium text-muted-foreground shrink-0 capitalize">
                {activeTask.status.replace("_", " ")}
              </span>
            </div>

            {activeTask.description && (
              <p className="text-[11px] text-muted-foreground line-clamp-2">{activeTask.description}</p>
            )}

            <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1 border-t border-border/40">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Updated: {new Date(activeTask.updatedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-lg border border-dashed border-border/60 bg-muted/10 text-center text-xs text-muted-foreground">
            No active task in progress. Standing by for assignment.
          </div>
        )}
      </div>

      {/* Live AI Execution Heartbeat & Terminal Log Stream */}
      <div className="flex flex-col gap-2 flex-1 min-h-[190px]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Terminal className={`h-3.5 w-3.5 ${isCurrentlyExecuting ? "text-emerald-500 animate-pulse" : "text-primary"}`} />
            Live Execution Heartbeat
          </span>
          <div className="flex items-center gap-1.5">
            {isCurrentlyExecuting ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                Active Run
              </span>
            ) : latestRun ? (
              <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                Run #{latestRun.id.slice(0, 6)} ({latestRun.status})
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => {
                refetchRuns();
                refetchLogs();
              }}
              title="Refresh log"
              className="text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
            >
              <RotateCw className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Real Monospace Terminal Output */}
        <div className="flex-1 rounded-lg border border-border/70 bg-zinc-950 p-3 flex flex-col font-mono text-[11px] leading-relaxed text-zinc-300 overflow-y-auto max-h-[260px] shadow-inner select-text">
          {parsedLogLines.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {parsedLogLines.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 break-all">
                  {item.ts && (
                    <span className="text-[10px] text-zinc-500 shrink-0 select-none">
                      [{item.ts}]
                    </span>
                  )}
                  <span
                    className={
                      item.stream === "stderr"
                        ? "text-red-400 font-semibold"
                        : item.text.includes("```json") || item.text.includes("\"actions\"")
                          ? "text-cyan-300 font-semibold whitespace-pre-wrap"
                          : item.text.includes("Selected") || item.text.includes("Loading")
                            ? "text-emerald-400 font-medium"
                            : "text-zinc-200 whitespace-pre-wrap"
                    }
                  >
                    {item.text}
                  </span>
                </div>
              ))}
              {isCurrentlyExecuting && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] mt-1 pt-1 border-t border-zinc-800">
                  <span className="animate-pulse">▶ AI reasoning & executing...</span>
                  <span className="animate-ping inline-block h-2 w-1 bg-emerald-400 ml-1" />
                </div>
              )}
              <div ref={terminalBottomRef} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 py-6">
              <Terminal className="h-6 w-6 opacity-30 mb-2" />
              {isLogLoading ? (
                <span>Loading execution stream...</span>
              ) : isCurrentlyExecuting ? (
                <span className="text-emerald-400 animate-pulse">Heartbeat initialized. Awaiting LLM output...</span>
              ) : (
                <>
                  <p className="font-semibold text-zinc-400">Standing by</p>
                  <p className="text-[10px] mt-1 text-zinc-500 max-w-[220px]">
                    When this agent starts a task, real-time thoughts, tool calls, and logs stream here.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-border/50 mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFocusCamera(agent.id)}
          className="flex-1 text-xs gap-1.5 h-8"
        >
          <Camera className="h-3.5 w-3.5" />
          Focus in 3D
        </Button>
        <Button variant="default" size="sm" asChild className="flex-1 text-xs gap-1.5 h-8">
          <Link to={`/agents/${agent.id}`}>
            <ExternalLink className="h-3.5 w-3.5" />
            Agent Profile
          </Link>
        </Button>
      </div>
    </div>
  );
}
