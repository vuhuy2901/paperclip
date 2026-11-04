import React from "react";
import { useOfficeStore } from "../store/useOfficeStore";
import {
  CheckCircle2,
  PlayCircle,
  AlertOctagon,
  ArrowRightLeft,
  MessageSquare,
  Sparkles,
  X,
  FileCode,
  ExternalLink,
} from "lucide-react";
import type { OfficeSystemEventType, OfficeToastItem } from "../types/OfficeTypes";

export function OfficeToastCenter() {
  const toasts = useOfficeStore((state) => state.toasts);
  const removeToast = useOfficeStore((state) => state.removeToast);
  const setSelectedAgentId = useOfficeStore((state) => state.setSelectedAgentId);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onDismiss={() => removeToast(toast.id)}
          onFocusAgent={(agentId) => setSelectedAgentId(agentId)}
        />
      ))}
    </div>
  );
}

function ToastCard({
  toast,
  onDismiss,
  onFocusAgent,
}: {
  toast: OfficeToastItem;
  onDismiss: () => void;
  onFocusAgent: (agentId: string) => void;
}) {
  const getBadgeStyle = (type: OfficeSystemEventType) => {
    switch (type) {
      case "task_completed":
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
          borderColor: "border-emerald-500/40",
          bgColor: "bg-emerald-950/90",
          textColor: "text-emerald-300",
          label: "Completed",
        };
      case "task_started":
        return {
          icon: <PlayCircle className="h-4 w-4 text-sky-400 shrink-0" />,
          borderColor: "border-sky-500/40",
          bgColor: "bg-sky-950/90",
          textColor: "text-sky-300",
          label: "Started",
        };
      case "task_blocked":
        return {
          icon: <AlertOctagon className="h-4 w-4 text-rose-400 shrink-0 animate-bounce" />,
          borderColor: "border-rose-500/50",
          bgColor: "bg-rose-950/90",
          textColor: "text-rose-300",
          label: "Blocked",
        };
      case "handoff":
        return {
          icon: <ArrowRightLeft className="h-4 w-4 text-purple-400 shrink-0" />,
          borderColor: "border-purple-500/40",
          bgColor: "bg-purple-950/90",
          textColor: "text-purple-300",
          label: "Handoff",
        };
      case "comment":
      default:
        return {
          icon: <MessageSquare className="h-4 w-4 text-amber-400 shrink-0" />,
          borderColor: "border-amber-500/40",
          bgColor: "bg-amber-950/90",
          textColor: "text-amber-300",
          label: "Update",
        };
    }
  };

  const style = getBadgeStyle(toast.type);

  return (
    <div
      className={`pointer-events-auto flex flex-col p-3 rounded-xl border ${style.borderColor} ${style.bgColor} shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-right-8`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          {style.icon}
          <span className={`text-[11px] font-bold uppercase tracking-wider ${style.textColor}`}>
            {toast.title}
          </span>
          {toast.type === "task_completed" && (
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-100 p-0.5 rounded transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="text-xs text-slate-200 leading-snug mb-2 font-medium">
        {toast.message}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-700/50">
        <span className="font-semibold text-slate-300">
          {toast.agentName} <span className="text-[10px] text-slate-400">({toast.role})</span>
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          {new Date(toast.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>

      {toast.artifacts && toast.artifacts.length > 0 && (
        <div className="mt-2 pt-1 flex flex-wrap gap-1">
          {toast.artifacts.slice(0, 2).map((art, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-sky-300 border border-slate-700 font-mono truncate max-w-[200px]"
            >
              <FileCode className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{art.split("/").pop()}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
