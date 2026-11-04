import React, { useState } from "react";
import { Link } from "@/lib/router";
import type { OfficeActivityEvent, OfficeSystemEvent } from "../types/OfficeTypes";
import { useOfficeStore } from "../store/useOfficeStore";
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Flame,
  Radio,
  CheckCircle2,
  PlayCircle,
  AlertOctagon,
  ArrowRightLeft,
  MessageSquare,
  Camera,
  FileCode,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LiveActivityFeedProps {
  events?: OfficeActivityEvent[];
  onFocusAgent: (agentId: string) => void;
}

function formatRelativeTime(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = Date.now();
  const diffSec = Math.floor((now - date.getTime()) / 1000);

  if (diffSec < 5) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  return `${diffHours}h ago`;
}

export function LiveActivityFeed({ events: propEvents, onFocusAgent }: LiveActivityFeedProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const storeEvents = useOfficeStore((state) => state.events);
  const clearAllEvents = useOfficeStore((state) => state.clearAllEvents);

  // Merge store system events with any legacy adapter events
  const displayEvents = storeEvents.length > 0 ? storeEvents : (propEvents ?? []);

  return (
    <div className="flex flex-col border-t border-border/60 bg-card/95 backdrop-blur z-10 transition-all duration-200 shrink-0">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Live Office Activity Feed ({displayEvents.length})
          </span>
          <Badge variant="outline" className="text-[10px] uppercase font-semibold text-emerald-600 bg-emerald-500/10 border-emerald-500/30">
            Real-Time
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {displayEvents.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllEvents}
              className="h-6 text-[10px] px-2 text-muted-foreground hover:text-rose-500 gap-1"
              title="Clear event history"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-6 w-6 p-0 text-muted-foreground"
          >
            {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Feed list */}
      {!isCollapsed && (
        <div className="h-44 overflow-y-auto p-3 flex flex-col gap-2">
          {displayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-xs text-muted-foreground text-center gap-1">
              <span>No live office events logged yet.</span>
              <span className="text-[11px] text-muted-foreground/80">
                Click "Simulation Demo" on the header or wait for real agent tasks to begin.
              </span>
            </div>
          ) : (
            displayEvents.map((evt: any) => {
              const type = evt.type;
              const isStoreEvent = "summary" in evt;

              let icon = <MessageSquare className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
              let badgeStyle = "bg-amber-500/10 text-amber-500 border-amber-500/20";
              let label = "UPDATE";

              if (type === "task_completed") {
                icon = <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
                badgeStyle = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                label = "COMPLETED";
              } else if (type === "task_started" || type === "agent_started") {
                icon = <PlayCircle className="h-3.5 w-3.5 text-sky-500 shrink-0" />;
                badgeStyle = "bg-sky-500/10 text-sky-500 border-sky-500/20";
                label = "STARTED";
              } else if (type === "task_blocked" || type === "execution_failed") {
                icon = <AlertOctagon className="h-3.5 w-3.5 text-rose-500 shrink-0 animate-bounce" />;
                badgeStyle = "bg-rose-500/10 text-rose-500 border-rose-500/20";
                label = "BLOCKED";
              } else if (type === "handoff" || type === "task_assigned") {
                icon = <ArrowRightLeft className="h-3.5 w-3.5 text-purple-500 shrink-0" />;
                badgeStyle = "bg-purple-500/10 text-purple-500 border-purple-500/20";
                label = "HANDOFF";
              }

              const agentId = isStoreEvent ? evt.agentId : evt.actorAgentId;
              const agentName = isStoreEvent ? evt.agentName : evt.actorAgentName;
              const role = isStoreEvent ? evt.role : "";
              const message = isStoreEvent ? evt.summary : evt.message;
              const taskId = evt.taskId;
              const taskTitle = evt.taskTitle;
              const artifacts = evt.artifacts as string[] | undefined;

              return (
                <div
                  key={evt.id}
                  onClick={() => agentId && onFocusAgent(agentId)}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border/50 bg-muted/20 text-xs hover:bg-muted/50 cursor-pointer transition-all duration-150"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0 w-16">
                      {formatRelativeTime(evt.timestamp)}
                    </span>

                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border shrink-0 flex items-center gap-1 ${badgeStyle}`}>
                      {icon}
                      <span>{label}</span>
                    </span>

                    <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                      <span className="font-bold text-foreground shrink-0">{agentName}</span>
                      {role && <span className="text-[10px] text-muted-foreground hidden sm:inline">({role})</span>}
                      <span className="text-muted-foreground/60 shrink-0">•</span>
                      <span className="text-foreground truncate">{message}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {artifacts && artifacts.length > 0 && (
                      <div className="hidden md:flex items-center gap-1">
                        {artifacts.slice(0, 2).map((art, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted/80 text-primary border border-border/60 font-mono truncate max-w-[140px]"
                            title={art}
                          >
                            <FileCode className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate">{art.split("/").pop()}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {agentId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFocusAgent(agentId);
                        }}
                        className="h-6 text-[10px] px-2 gap-1 text-muted-foreground hover:text-foreground hover:bg-primary/10"
                        title="Focus camera on agent"
                      >
                        <Camera className="h-3 w-3 text-primary" />
                        <span className="hidden sm:inline">Focus</span>
                      </Button>
                    )}

                    {taskId && (
                      <Link
                        to={`/issues/${taskId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline px-2 py-0.5 rounded hover:bg-primary/10"
                      >
                        <span>{taskTitle ? taskTitle.slice(0, 16) : "Task"}</span>
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
