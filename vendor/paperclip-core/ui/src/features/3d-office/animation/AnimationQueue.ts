import type { HandoffVisualEvent } from "../types/OfficeTypes";

export type AnimationQueueListener = (event: HandoffVisualEvent | null, activeHandoffs: HandoffVisualEvent[]) => void;

export class OfficeAnimationQueue {
  private queue: HandoffVisualEvent[] = [];
  private activeHandoffs: Map<string, HandoffVisualEvent> = new Map();
  private listeners: Set<AnimationQueueListener> = new Set();

  subscribe(listener: AnimationQueueListener): () => void {
    this.listeners.add(listener);
    listener(null, Array.from(this.activeHandoffs.values()));
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(latestEvent: HandoffVisualEvent | null) {
    const active = Array.from(this.activeHandoffs.values());
    for (const listener of this.listeners) {
      listener(latestEvent, active);
    }
  }

  enqueueHandoff(
    sourceAgentId: string,
    sourceAgentName: string,
    targetAgentId: string,
    targetAgentName: string,
    taskId: string,
    taskTitle: string,
  ): HandoffVisualEvent {
    // Avoid re-enqueueing duplicate identical handoffs
    const existing = this.queue.find(
      (h) => h.sourceAgentId === sourceAgentId && h.targetAgentId === targetAgentId && h.taskId === taskId,
    );
    if (existing) return existing;

    const event: HandoffVisualEvent = {
      id: `handoff_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      sourceAgentId,
      sourceAgentName,
      targetAgentId,
      targetAgentName,
      taskId,
      taskTitle,
      timestamp: new Date(),
      phase: "enroute",
    };

    // If source agent is not already busy in an active handoff, activate immediately
    const isSourceBusy = Array.from(this.activeHandoffs.values()).some(
      (h) => h.sourceAgentId === sourceAgentId,
    );

    if (!isSourceBusy) {
      this.activeHandoffs.set(event.id, event);
      this.notify(event);
    } else {
      this.queue.push(event);
    }

    return event;
  }

  updatePhase(handoffId: string, phase: HandoffVisualEvent["phase"]) {
    const active = this.activeHandoffs.get(handoffId);
    if (!active) return;

    active.phase = phase;

    if (phase === "completed") {
      this.activeHandoffs.delete(handoffId);
      // Check if any queued handoff can now start
      if (this.queue.length > 0) {
        const nextIdx = this.queue.findIndex(
          (item) => !Array.from(this.activeHandoffs.values()).some((h) => h.sourceAgentId === item.sourceAgentId),
        );
        if (nextIdx !== -1) {
          const [nextEvent] = this.queue.splice(nextIdx, 1);
          if (nextEvent) {
            this.activeHandoffs.set(nextEvent.id, nextEvent);
            this.notify(nextEvent);
            return;
          }
        }
      }
    }

    this.notify(active);
  }

  getActiveHandoffs(): HandoffVisualEvent[] {
    return Array.from(this.activeHandoffs.values());
  }

  clear() {
    this.queue = [];
    this.activeHandoffs.clear();
    this.notify(null);
  }
}

export const officeAnimationQueue = new OfficeAnimationQueue();
