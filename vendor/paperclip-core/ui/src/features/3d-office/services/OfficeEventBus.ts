import type { OfficeSystemEvent } from "../types/OfficeTypes";
import { useOfficeStore } from "../store/useOfficeStore";
import { officeAnimationQueue } from "../animation/AnimationQueue";

class OfficeEventBus {
  private listeners = new Set<(event: OfficeSystemEvent) => void>();

  constructor() {
    if (typeof window !== "undefined") {
      // Expose globally for CLI, testing, curl, or devtools console
      (window as any).__PAPERCLIP_OFFICE_EMIT_EVENT__ = (event: Partial<OfficeSystemEvent>) => {
        return this.emitNormalized(event);
      };

      // Listen for custom browser events
      window.addEventListener("paperclip:office_event", (e: Event) => {
        const customEvent = e as CustomEvent<Partial<OfficeSystemEvent>>;
        if (customEvent.detail) {
          this.emitNormalized(customEvent.detail);
        }
      });
    }
  }

  /**
   * Emits a standardized office system event into the reactive store and animation engine
   */
  emit(event: OfficeSystemEvent) {
    // 1. Dispatch to Zustand reactive store (updates feed, toasts, counters, chat bubbles)
    useOfficeStore.getState().emitSystemEvent(event);

    // 2. If it's a handoff event with target agent, trigger walking animation
    if (event.type === "handoff" && event.toAgentId) {
      officeAnimationQueue.enqueueHandoff(
        event.agentId,
        event.agentName,
        event.toAgentId,
        event.toAgentName ?? "Team Member",
        event.taskId ?? "task-handoff",
        event.taskTitle ?? event.summary,
      );
    }

    // 3. Notify external subscribers
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("OfficeEventBus listener error:", err);
      }
    }
  }

  /**
   * Helper that fills defaults for partial event payloads
   */
  emitNormalized(partial: Partial<OfficeSystemEvent>): OfficeSystemEvent {
    const fullEvent: OfficeSystemEvent = {
      id: partial.id ?? `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: partial.timestamp ?? new Date().toISOString(),
      type: partial.type ?? "task_completed",
      agentId: partial.agentId ?? "agent_backend",
      agentName: partial.agentName ?? "Elena Rostova",
      role: partial.role ?? "Backend Engineer",
      taskId: partial.taskId,
      taskTitle: partial.taskTitle ?? "API Implementation",
      summary: partial.summary ?? "Task updated successfully",
      artifacts: partial.artifacts ?? [],
      toAgentId: partial.toAgentId,
      toAgentName: partial.toAgentName,
    };

    this.emit(fullEvent);
    return fullEvent;
  }

  subscribe(listener: (event: OfficeSystemEvent) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const officeEventBus = new OfficeEventBus();
