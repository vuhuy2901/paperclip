import { describe, it, expect, beforeEach } from "vitest";
import type { Agent, Issue } from "@paperclipai/shared";
import { OfficeWaypointGraph } from "./animation/WaypointGraph";
import { assignAgentsToDesks } from "./config/DeskAssignments";
import { EventNormalizer } from "./data/EventNormalizer";
import { OfficeAnimationQueue } from "./animation/AnimationQueue";

describe("3D Virtual Office System", () => {
  describe("OfficeWaypointGraph", () => {
    it("builds the hallway and room waypoint graph properly", () => {
      const graph = new OfficeWaypointGraph();
      expect(graph.nodes.size).toBeGreaterThan(15);
      expect(graph.nodes.has("hallway_0")).toBe(true);
      expect(graph.nodes.has("door_management")).toBe(true);
      expect(graph.nodes.has("door_engineering")).toBe(true);
    });

    it("computes a valid walkable path between Management and Engineering rooms", () => {
      const graph = new OfficeWaypointGraph();
      // From Management desk to Engineering desk
      const path = graph.findPath(-15.5, -8.5, -11.0, 7.8);
      expect(path.length).toBeGreaterThan(2);
      // Path starts at or near origin
      expect(path[0]![0]).toBeCloseTo(-15.5, 0.5);
      expect(path[0]![2]).toBeCloseTo(-8.5, 0.5);
      // Path ends at target
      const last = path[path.length - 1]!;
      expect(last[0]).toBeCloseTo(-11.0, 0.5);
      expect(last[2]).toBeCloseTo(7.8, 0.5);
    });
  });

  describe("DeskAssignments", () => {
    it("maps agents by their role hint to the appropriate department desk", () => {
      const mockAgents: Agent[] = [
        {
          id: "agent-pm",
          companyId: "c1",
          name: "Alice PM",
          urlKey: "alice-pm",
          role: "project_manager" as any,
          title: null,
          icon: null,
          status: "idle",
          reportsTo: null,
          capabilities: null,
          adapterType: "claude_local" as any,
          adapterConfig: {},
          runtimeConfig: {} as any,
          budgetMonthlyCents: 0,
          spentMonthlyCents: 0,
          pauseReason: null,
          pausedAt: null,
          permissions: {} as any,
          lastHeartbeatAt: null,
          metadata: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "agent-backend",
          companyId: "c1",
          name: "Bob Backend",
          urlKey: "bob-backend",
          role: "backend_engineer" as any,
          title: null,
          icon: null,
          status: "running",
          reportsTo: "agent-pm",
          capabilities: null,
          adapterType: "claude_local" as any,
          adapterConfig: {},
          runtimeConfig: {} as any,
          budgetMonthlyCents: 0,
          spentMonthlyCents: 0,
          pauseReason: null,
          pausedAt: null,
          permissions: {} as any,
          lastHeartbeatAt: null,
          metadata: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "agent-po",
          companyId: "c1",
          name: "Charlie PO",
          urlKey: "charlie-po",
          role: "product_owner" as any,
          title: null,
          icon: null,
          status: "idle",
          reportsTo: null,
          capabilities: null,
          adapterType: "claude_local" as any,
          adapterConfig: {},
          runtimeConfig: {} as any,
          budgetMonthlyCents: 0,
          spentMonthlyCents: 0,
          pauseReason: null,
          pausedAt: null,
          permissions: {} as any,
          lastHeartbeatAt: null,
          metadata: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const deskMap = assignAgentsToDesks(mockAgents);

      expect(deskMap.get("agent-pm")?.roomId).toBe("management");
      expect(deskMap.get("agent-backend")?.roomId).toBe("engineering");
      expect(deskMap.get("agent-po")?.roomId).toBe("product");
    });
  });

  describe("EventNormalizer & AnimationQueue", () => {
    let queue: OfficeAnimationQueue;
    let normalizer: EventNormalizer;

    beforeEach(() => {
      queue = new OfficeAnimationQueue();
      normalizer = new EventNormalizer();
    });

    it("enqueues and transitions handoff events through all phases", () => {
      const event = queue.enqueueHandoff(
        "agent-po",
        "Charlie PO",
        "agent-pm",
        "Alice PM",
        "task-1",
        "Build 3D Office Architecture",
      );

      expect(event.phase).toBe("enroute");
      expect(queue.getActiveHandoffs().length).toBe(1);

      queue.updatePhase(event.id, "handing_over");
      expect(queue.getActiveHandoffs()[0]?.phase).toBe("handing_over");

      queue.updatePhase(event.id, "completed");
      expect(queue.getActiveHandoffs().length).toBe(0);
    });

    it("correctly resolves agent visual status from native runtime signals", () => {
      const mockAgent: Agent = {
        id: "a1",
        companyId: "c1",
        name: "Test",
        urlKey: "test",
        role: "backend_engineer" as any,
        title: null,
        icon: null,
        status: "idle",
        reportsTo: null,
        capabilities: null,
        adapterType: "claude_local" as any,
        adapterConfig: {},
        runtimeConfig: {} as any,
        budgetMonthlyCents: 0,
        spentMonthlyCents: 0,
        pauseReason: null,
        pausedAt: null,
        permissions: {} as any,
        lastHeartbeatAt: null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const idleState = normalizer.resolveAgentState(mockAgent, undefined, undefined);
      expect(idleState.status).toBe("idle");
      expect(idleState.action).toBe("sitting");

      const runningState = normalizer.resolveAgentState(
        mockAgent,
        { id: "run-1", agentId: "a1", status: "running" } as any,
        undefined,
      );
      expect(runningState.status).toBe("running");
      expect(runningState.action).toBe("typing");
    });
  });
});
