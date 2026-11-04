import React, { useState } from "react";
import { Link } from "@/lib/router";
import type { OfficeActivityEvent } from "../types/OfficeTypes";
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Flame,
  Radio,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Camera,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LiveActivityFeedProps {
  events: OfficeActivityEvent[];
  onFocusAgent: (agentId: string) => void;
}

export function LiveActivityFeed({ events, onFocusAgent }: LiveActivityFeedProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-col border-t border-border/60 bg-card/95 backdrop-blur z-10 transition-all duration-200 shrink-0">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Live Office Activity Feed ({events.length})
          </span>
          <Badge variant="outline" className="text-[10px] uppercase font-semibold text-muted-foreground">
            Real-Time
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-6 w-6 p-0 text-muted-foreground"
        >
          {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Feed list */}
      {!isCollapsed && (
        <div className="h-40 overflow-y-auto p-3 flex flex-col gap-2">
          {events.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground text-center">
              Awaiting native Paperclip execution events and agent task handoffs...
            </div>
          ) : (
            events.map((evt) => {
              const statusBadgeColor =
                evt.status === "running"
                  ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  : evt.status === "completed"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : evt.status === "failed"
                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : "bg-muted text-muted-foreground border-border/40";

              return (
                <div
                  key={evt.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-lg border border-border/40 bg-muted/20 text-xs hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>

                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ${statusBadgeColor}`}>
                      {evt.type.replace("_", " ")}
                    </span>

                    <span className="font-medium text-foreground truncate">{evt.message}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {evt.actorAgentId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFocusAgent(evt.actorAgentId)}
                        className="h-6 text-[10px] px-2 gap-1 text-muted-foreground hover:text-foreground"
                        title="Focus in 3D"
                      >
                        <Camera className="h-3 w-3" />
                        <span>Focus</span>
                      </Button>
                    )}

                    {evt.taskId && (
                      <Link
                        to={`/issues/${evt.taskId}`}
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline px-2 py-0.5 rounded hover:bg-primary/10"
                      >
                        <span>{evt.taskIdentifier ?? "Task"}</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
