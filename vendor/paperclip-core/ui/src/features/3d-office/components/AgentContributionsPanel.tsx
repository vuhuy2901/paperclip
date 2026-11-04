import React from "react";
import type { AgentContributionRecord } from "../types/OfficeTypes";
import { Award, Bot, CheckCircle2, Clock, GitPullRequest, Search, Terminal, XCircle, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgentContributionsPanelProps {
  contributions: AgentContributionRecord[];
  onFocusAgent: (agentId: string) => void;
}

export function AgentContributionsPanel({ contributions, onFocusAgent }: AgentContributionsPanelProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden p-4 gap-3 bg-card/60 backdrop-blur">
      <div className="pb-2 border-b border-border/60">
        <h2 className="text-sm font-bold text-foreground">Agent Contributions</h2>
        <p className="text-[11px] text-muted-foreground">Verified task outputs and execution performance</p>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
        {contributions.map((record) => {
          const durationHours = (record.totalDurationSeconds / 3600).toFixed(1);

          return (
            <div
              key={record.agentId}
              className="p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col gap-2.5 text-xs"
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
                <div className="p-1.5 rounded bg-muted/50 border border-border/30">
                  <span className="text-[9px] uppercase font-semibold text-muted-foreground block">Completed</span>
                  <span className="font-bold text-emerald-500">{record.tasksCompleted}</span>
                </div>
                <div className="p-1.5 rounded bg-muted/50 border border-border/30">
                  <span className="text-[9px] uppercase font-semibold text-muted-foreground block">Active</span>
                  <span className="font-bold text-blue-500">{record.activeTasks}</span>
                </div>
                <div className="p-1.5 rounded bg-muted/50 border border-border/30">
                  <span className="text-[9px] uppercase font-semibold text-muted-foreground block">Runtime</span>
                  <span className="font-bold text-foreground">{durationHours}h</span>
                </div>
              </div>

              {/* Secondary deliverables */}
              {(record.reviewsCompleted > 0 || record.testsExecuted > 0 || record.filesAuthored > 0) && (
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1 border-t border-border/30 flex-wrap">
                  {record.filesAuthored > 0 && <span>Files: {record.filesAuthored}</span>}
                  {record.reviewsCompleted > 0 && <span>Reviews: {record.reviewsCompleted}</span>}
                  {record.testsExecuted > 0 && <span>Tests: {record.testsExecuted}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
