import React from "react";
import type { AgentContributionRecord } from "../types/OfficeTypes";
import { useOfficeStore } from "../store/useOfficeStore";
import { Award, Bot, CheckCircle2, Clock, GitPullRequest, Search, Terminal, XCircle, Camera, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgentContributionsPanelProps {
  contributions: AgentContributionRecord[];
  onFocusAgent: (agentId: string) => void;
}

export function AgentContributionsPanel({ contributions, onFocusAgent }: AgentContributionsPanelProps) {
  const storedEvents = useOfficeStore((state) => state.events);

  return (
    <div className="flex flex-col h-full overflow-hidden p-4 gap-3 bg-card/60 backdrop-blur">
      <div className="pb-2 border-b border-border/60">
        <h2 className="text-sm font-bold text-foreground">Agent Contributions & Logs</h2>
        <p className="text-[11px] text-muted-foreground">Verified task outputs, deliverables, and event history</p>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
        {contributions.map((record) => {
          const durationHours = (record.totalDurationSeconds / 3600).toFixed(1);
          // Find recent events authored by this agent
          const agentEvents = storedEvents.filter((e) => e.agentId === record.agentId);

          return (
            <div
              key={record.agentId}
              className="p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col gap-2.5 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground leading-tight">{record.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{record.role}</p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFocusAgent(record.agentId)}
                  className="h-6 text-[10px] px-2 gap-1 text-muted-foreground hover:text-foreground"
                  title="Focus in 3D"
                >
                  <Camera className="h-3 w-3" />
                  <span>Focus</span>
                </Button>
              </div>

              {/* Metric stats grid */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                <div className="p-1.5 rounded-lg bg-muted/50 border border-border/30">
                  <span className="text-[9px] uppercase font-semibold text-muted-foreground block">Completed</span>
                  <span className="font-bold text-emerald-500">
                    {Math.max(record.tasksCompleted, agentEvents.filter((e) => e.type === "task_completed").length)}
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-muted/50 border border-border/30">
                  <span className="text-[9px] uppercase font-semibold text-muted-foreground block">Active</span>
                  <span className="font-bold text-sky-500">{record.activeTasks}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-muted/50 border border-border/30">
                  <span className="text-[9px] uppercase font-semibold text-muted-foreground block">Logged Events</span>
                  <span className="font-bold text-foreground">{agentEvents.length}</span>
                </div>
              </div>

              {/* Recent Event Log Items for this agent */}
              {agentEvents.length > 0 && (
                <div className="flex flex-col gap-1 pt-1.5 border-t border-border/30">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Recent Logs ({agentEvents.length})
                  </span>
                  {agentEvents.slice(0, 2).map((evt) => (
                    <div
                      key={evt.id}
                      className="p-1.5 rounded bg-muted/40 border border-border/20 text-[11px] flex flex-col gap-0.5"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-primary capitalize">{evt.type.replace("_", " ")}</span>
                        <span className="text-muted-foreground">{new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-foreground/90 line-clamp-1">{evt.summary}</p>
                      {evt.artifacts && evt.artifacts.length > 0 && (
                        <div className="flex items-center gap-1 text-[9px] text-sky-400 font-mono">
                          <FileCode className="h-2.5 w-2.5" />
                          <span>{evt.artifacts[0].split("/").pop()}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
