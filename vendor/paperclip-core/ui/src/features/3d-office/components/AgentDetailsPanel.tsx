import React from "react";
import { Link } from "@/lib/router";
import type { AgentOfficeState } from "../types/OfficeTypes";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AgentDetailsPanelProps {
  officeAgent: AgentOfficeState | null;
  onFocusCamera: (agentId: string) => void;
  onClose: () => void;
}

export function AgentDetailsPanel({ officeAgent, onFocusCamera, onClose }: AgentDetailsPanelProps) {
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

  const statusColor =
    visualStatus === "running"
      ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
      : visualStatus === "error"
        ? "bg-red-500/10 text-red-500 border-red-500/20"
        : visualStatus === "paused"
          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
          : visualStatus === "waiting"
            ? "bg-muted text-muted-foreground border-border/50"
            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";

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

      {/* Live Runtime & Heartbeat Output */}
      {activeLiveRun && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
            Live Execution Heartbeat
          </span>
          <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 flex flex-col gap-1.5 text-xs">
            {activeLiveRun.currentToolName && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase text-blue-400">Tool:</span>
                <code className="text-[11px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono">
                  {activeLiveRun.currentToolName}
                </code>
              </div>
            )}
            {activeLiveRun.currentStatusMessage && (
              <p className="text-[11px] text-foreground font-medium">{activeLiveRun.currentStatusMessage}</p>
            )}
            {activeLiveRun.lastAssistantSnippet && (
              <p className="text-[11px] text-muted-foreground font-mono bg-background/50 p-2 rounded border border-border/30 line-clamp-3">
                {activeLiveRun.lastAssistantSnippet}
              </p>
            )}
          </div>
        </div>
      )}

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
