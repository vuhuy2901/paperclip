import { describe, expect, it } from "vitest";
import type { Db } from "@paperclipai/db";
import {
  assertAtelierNodeAssignment,
  buildSimplifiedWorkflowV6Definition,
  upgradeLegacyAtelierDefinition,
  validateAtelierWorkflowDefinition,
  type AtelierEditableDefinition,
} from "../services/atelier-workflow-builder.js";
import { atelierCanonicalWorkflowDefinition } from "../services/atelier-workflow-orchestration.js";

function fakeDb(rows: unknown[] = []) {
  return {
    select: () => ({ from: () => ({ where: async () => rows }) }),
  } as unknown as Db;
}

describe("Atelier workflow builder", () => {
  it("upgrades published v1 into an editable graph without mutating the legacy value", () => {
    const legacy = atelierCanonicalWorkflowDefinition();
    const before = JSON.stringify(legacy);
    const draft = upgradeLegacyAtelierDefinition(legacy, 2);
    expect(draft.schemaVersion).toBe(2);
    expect(draft.version).toBe(2);
    expect(draft.nodes.filter((node) => node.type === "START")).toHaveLength(1);
    expect(draft.nodes.filter((node) => node.type === "END")).toHaveLength(1);
    expect(draft.nodes.find((node) => node.id === "floorplan")?.taskType).toBe("FLOOR_PLAN_RECOGNITION");
    expect(JSON.stringify(legacy)).toBe(before);
  });

  it("rejects a cycle and unreachable graph before publish", async () => {
    const definition: AtelierEditableDefinition = {
      schemaVersion: 2, key: "test:v2", name: "test", version: 2,
      nodes: [
        { id: "start", type: "START", name: "Start" },
        { id: "work", type: "AGENT_TASK", name: "Work", taskType: "BIM_GEOMETRY", requiredRole: "geometry_agent", agentSelector: { strategy: "CAPABILITY_MATCH", capability: "bim.scenegraph" }, requiredOutputs: ["scenegraph"], completionCriteria: ["valid scenegraph"], retryPolicy: { maxAttempts: 2 } },
        { id: "end", type: "END", name: "End" },
      ],
      edges: [
        { id: "a", source: "start", target: "work" },
        { id: "b", source: "work", target: "start" },
      ],
    };
    const result = await validateAtelierWorkflowDefinition(fakeDb(), "company", definition);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("cycle");
    expect(result.issues.map((issue) => issue.code)).toContain("unreachable_node");
  });

  it("rejects a floor-plan task assigned to the render agent", async () => {
    const renderAgent = {
      id: "render-agent", name: "Render Agent", status: "idle", lifecycleState: "ready",
      role: "engineer", metadata: { atelierAgentKey: "agent_render" }, permissions: {},
    };
    await expect(assertAtelierNodeAssignment(fakeDb([renderAgent]), {
      companyId: "company",
      agentId: renderAgent.id,
      node: { id: "floorplan", type: "AGENT_TASK", name: "Floor Plan", taskType: "FLOOR_PLAN_RECOGNITION", requiredRole: "floor_plan_agent", agentSelector: { strategy: "CAPABILITY_MATCH", capability: "floorplan.parse" } },
    })).rejects.toMatchObject({ status: 403 });
  });

  it("accepts a matching floor-plan agent", async () => {
    const floorAgent = {
      id: "floor-agent", name: "Floor Plan Agent", status: "idle", lifecycleState: "ready",
      role: "engineer", metadata: { atelierAgentKey: "agent_floorplan" }, permissions: {},
    };
    const result = await assertAtelierNodeAssignment(fakeDb([floorAgent]), {
      companyId: "company",
      agentId: floorAgent.id,
      node: { id: "floorplan", type: "AGENT_TASK", name: "Floor Plan", taskType: "FLOOR_PLAN_RECOGNITION", requiredRole: "floor_plan_agent", agentSelector: { strategy: "CAPABILITY_MATCH", capability: "floorplan.parse" } },
    });
    expect(result.agentId).toBe(floorAgent.id);
  });

  it("builds valid 5-step linear Draft v6 without parallel branches, discovery, or main-path cost", async () => {
    const v6 = buildSimplifiedWorkflowV6Definition(6);
    expect(v6.nodes.map((n) => n.id)).toEqual([
      "intake",
      "build_scene",
      "style_and_furniture",
      "render",
      "qa_and_deliver",
    ]);
    expect(v6.nodes.map((n) => n.stepLabel)).toEqual([
      "Bước 1/5",
      "Bước 2/5",
      "Bước 3/5",
      "Bước 4/5",
      "Bước 5/5",
    ]);
    expect(v6.edges.map((e) => `${e.source}->${e.target}`)).toEqual([
      "intake->build_scene",
      "build_scene->style_and_furniture",
      "style_and_furniture->render",
      "render->qa_and_deliver",
    ]);
    expect(v6.nodes.some((n) => n.id === "asset_discovery" || n.id === "cost")).toBe(false);
    expect(v6.optionalSteps?.costBomAfterApproval).toMatchObject({
      enabled: false,
      runsAfterApproval: true,
    });
    expect(v6.nodes.every((n) => Boolean(n.stepSettings?.retry && n.stepSettings?.logging && n.stepSettings?.notifications))).toBe(true);
    const result = await validateAtelierWorkflowDefinition(fakeDb(), "company", v6);
    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("rejects any workflow path that allows Render to run before Step 3 completes", async () => {
    const broken = buildSimplifiedWorkflowV6Definition(6);
    broken.edges.push({ id: "bypass_to_render", source: "build_scene", target: "render" });
    const result = await validateAtelierWorkflowDefinition(fakeDb(), "company", broken);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("render_before_step3");
  });
});
