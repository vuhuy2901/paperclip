import React from "react";
import type { AgentOfficeState } from "../types/OfficeTypes";
import { ROOM_DEFINITIONS } from "../config/RoomDefinitions";
import { Bot, MapPin, Activity, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Office2DFallbackProps {
  officeAgents: AgentOfficeState[];
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
}

export function Office2DFallback({ officeAgents, selectedAgentId, onSelectAgent }: Office2DFallbackProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 gap-6 bg-slate-950 text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100">2D Architectural Office Map</h2>
          <p className="text-xs text-slate-400">WebGL hardware fallback — displaying live office departments</p>
        </div>
        <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-400 bg-amber-500/10">
          2D View Active
        </Badge>
      </div>

      {/* Grid of Office Rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ROOM_DEFINITIONS.map((room) => {
          const roomAgents = officeAgents.filter((a) => a.assignedDesk.roomId === room.id);

          return (
            <div
              key={room.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col gap-3 shadow-lg"
              style={{ borderTopColor: room.accentColor, borderTopWidth: 3 }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <MapPin className="h-4 w-4" style={{ color: room.accentColor }} />
                  {room.name}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {roomAgents.length} desks
                </span>
              </div>

              {/* Workstations in room */}
              <div className="flex flex-col gap-2">
                {roomAgents.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">Unoccupied room</p>
                ) : (
                  roomAgents.map((officeAgent) => {
                    const isSelected = selectedAgentId === officeAgent.agentId;
                    const statusColor =
                      officeAgent.visualStatus === "running"
                        ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                        : officeAgent.visualStatus === "error"
                          ? "text-red-400 bg-red-500/10 border-red-500/20"
                          : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";

                    return (
                      <button
                        key={officeAgent.agentId}
                        type="button"
                        onClick={() => onSelectAgent(officeAgent.agentId)}
                        className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary"
                            : "border-slate-800 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="h-7 w-7 rounded-md bg-slate-700 flex items-center justify-center shrink-0">
                            <Bot className="h-4 w-4 text-slate-300" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-semibold text-slate-200 truncate">{officeAgent.agent.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{officeAgent.agent.role}</p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border shrink-0 ${statusColor}`}>
                          {officeAgent.visualStatus}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
