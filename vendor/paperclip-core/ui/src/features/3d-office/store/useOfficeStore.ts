import { create } from "zustand";
import confetti from "canvas-confetti";
import type {
  OfficeSystemEvent,
  OfficeToastItem,
  AgentChatBubble,
  OfficeSystemEventType,
} from "../types/OfficeTypes";

const OFFICE_LOGS_STORAGE_KEY = "paperclip_3d_office_event_logs_v1";

function loadStoredEvents(): OfficeSystemEvent[] {
  try {
    const raw = localStorage.getItem(OFFICE_LOGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistEvents(events: OfficeSystemEvent[]) {
  try {
    localStorage.setItem(OFFICE_LOGS_STORAGE_KEY, JSON.stringify(events.slice(0, 100)));
  } catch {
    // Ignore localStorage write quota errors
  }
}

export interface OfficeStoreState {
  events: OfficeSystemEvent[];
  toasts: OfficeToastItem[];
  chatBubbles: Record<string, { message: string; expiresAt: number; type: OfficeSystemEventType }>;
  selectedAgentId: string | null;
  activePresetKey: string;
  followActiveAgent: boolean;
  isSimulationRunning: boolean;
  stats: {
    totalAgents: number;
    workingCount: number;
    completedCount: number;
    blockedCount: number;
  };

  // Actions
  emitSystemEvent: (event: OfficeSystemEvent) => void;
  removeToast: (id: string) => void;
  clearExpiredChatBubbles: () => void;
  setSelectedAgentId: (agentId: string | null) => void;
  setActivePresetKey: (presetKey: string) => void;
  setFollowActiveAgent: (follow: boolean) => void;
  setSimulationRunning: (running: boolean) => void;
  updateStats: (partial: Partial<OfficeStoreState["stats"]>) => void;
  clearAllEvents: () => void;
}

export const useOfficeStore = create<OfficeStoreState>((set, get) => {
  const initialEvents = loadStoredEvents();

  return {
    events: initialEvents,
    toasts: [],
    chatBubbles: {},
    selectedAgentId: null,
    activePresetKey: "overview",
    followActiveAgent: false,
    isSimulationRunning: false,
    stats: {
      totalAgents: 0,
      workingCount: 0,
      completedCount: initialEvents.filter((e) => e.type === "task_completed").length,
      blockedCount: 0,
    },

    emitSystemEvent: (event: OfficeSystemEvent) => {
      // 1. Confetti effect on task_completed
      if (event.type === "task_completed") {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.85, x: 0.8 },
            colors: ["#10b981", "#38bdf8", "#fbbf24", "#a855f7"],
            disableForReducedMotion: true,
          });
        } catch {
          // Ignore if DOM or canvas is unavailable in headless test
        }
      }

      // 2. Format Toast
      const newToast: OfficeToastItem = {
        id: event.id || `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: event.type,
        title:
          event.type === "task_completed"
            ? "Task Completed"
            : event.type === "task_started"
              ? "Task Started"
              : event.type === "task_blocked"
                ? "Task Blocked"
                : event.type === "handoff"
                  ? "Task Handoff"
                  : "Agent Note",
        message: event.summary,
        agentName: event.agentName,
        role: event.role,
        timestamp: new Date(event.timestamp),
        artifacts: event.artifacts,
      };

      // 3. Short bubble message for avatar (max 40 chars)
      let bubbleText = event.summary;
      if (event.type === "task_completed") {
        bubbleText = `Done: ${event.taskTitle ?? event.summary.slice(0, 24)} ✅`;
      } else if (event.type === "task_started") {
        bubbleText = `Started: ${event.taskTitle ?? "Working..."} 🚀`;
      } else if (event.type === "task_blocked") {
        bubbleText = `Blocked: Need help! ⚠️`;
      } else if (event.type === "handoff") {
        bubbleText = `Handing off to ${event.toAgentName ?? "teammate"} 🤝`;
      }

      const bubbleExpiresAt = Date.now() + 4200; // ~4 seconds

      set((state) => {
        const updatedEvents = [event, ...state.events.filter((e) => e.id !== event.id)].slice(0, 80);
        persistEvents(updatedEvents);

        const updatedToasts = [newToast, ...state.toasts.slice(0, 4)];

        const updatedChatBubbles = {
          ...state.chatBubbles,
          [event.agentId]: {
            message: bubbleText,
            expiresAt: bubbleExpiresAt,
            type: event.type,
          },
        };

        // Recalculate dynamic counters
        let workingDelta = 0;
        let completedDelta = 0;
        let blockedDelta = 0;

        if (event.type === "task_started") {
          workingDelta = 1;
        } else if (event.type === "task_completed") {
          workingDelta = -1;
          completedDelta = 1;
        } else if (event.type === "task_blocked") {
          workingDelta = -1;
          blockedDelta = 1;
        }

        const newWorking = Math.max(0, state.stats.workingCount + workingDelta);
        const newCompleted = state.stats.completedCount + completedDelta;
        const newBlocked = Math.max(0, state.stats.blockedCount + blockedDelta);

        return {
          events: updatedEvents,
          toasts: updatedToasts,
          chatBubbles: updatedChatBubbles,
          stats: {
            ...state.stats,
            workingCount: newWorking,
            completedCount: newCompleted,
            blockedCount: newBlocked,
          },
          // If follow active agent is enabled, focus on active agent
          selectedAgentId: state.followActiveAgent ? event.agentId : state.selectedAgentId,
        };
      });

      // Auto-expire chat bubble after 4.2s
      setTimeout(() => {
        get().clearExpiredChatBubbles();
      }, 4300);

      // Auto-expire toast after 5s
      setTimeout(() => {
        get().removeToast(newToast.id);
      }, 5500);
    },

    removeToast: (id: string) => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    },

    clearExpiredChatBubbles: () => {
      const now = Date.now();
      set((state) => {
        let changed = false;
        const next: typeof state.chatBubbles = {};
        for (const [agentId, bubble] of Object.entries(state.chatBubbles)) {
          if (bubble.expiresAt > now) {
            next[agentId] = bubble;
          } else {
            changed = true;
          }
        }
        return changed ? { chatBubbles: next } : state;
      });
    },

    setSelectedAgentId: (agentId: string | null) => {
      set({ selectedAgentId: agentId });
    },

    setActivePresetKey: (presetKey: string) => {
      set({ activePresetKey: presetKey });
    },

    setFollowActiveAgent: (follow: boolean) => {
      set({ followActiveAgent: follow });
    },

    setSimulationRunning: (running: boolean) => {
      set({ isSimulationRunning: running });
    },

    updateStats: (partial: Partial<OfficeStoreState["stats"]>) => {
      set((state) => ({
        stats: { ...state.stats, ...partial },
      }));
    },

    clearAllEvents: () => {
      localStorage.removeItem(OFFICE_LOGS_STORAGE_KEY);
      set({
        events: [],
        toasts: [],
        chatBubbles: {},
        stats: { totalAgents: 0, workingCount: 0, completedCount: 0, blockedCount: 0 },
      });
    },
  };
});
