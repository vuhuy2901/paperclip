import { describe, expect, it } from "vitest";
import {
  ATELIER_WORKFLOW_STAGES,
  assertAtelierHandoffAllowed,
  atelierHandoffTargets,
  validateAtelierWorkflowGraph,
} from "../services/atelier-agent-workflow.js";

describe("Atelier agent workflow", () => {
  it("is a unique acyclic graph with dependencies declared before consumers", () => {
    expect(validateAtelierWorkflowGraph()).toBe(true);
    const seen = new Set<string>();
    for (const stage of ATELIER_WORKFLOW_STAGES) {
      expect(seen.has(stage.key)).toBe(false);
      for (const dependency of stage.dependsOn) expect(seen.has(dependency)).toBe(true);
      seen.add(stage.key);
    }
  });

  it("covers the chief and all eight specialist agents", () => {
    expect(new Set(ATELIER_WORKFLOW_STAGES.map((stage) => stage.agentKey))).toEqual(new Set([
      "agent_concierge",
      "agent_floorplan",
      "agent_geometry",
      "agent_furniture",
      "agent_style",
      "agent_ceiling_lighting",
      "agent_qa",
      "agent_research",
      "agent_cost",
    ]));
  });

  it("publishes only downstream handoff targets", () => {
    expect(atelierHandoffTargets("agent_concierge")).toEqual(["agent_floorplan"]);
    expect(atelierHandoffTargets("agent_geometry")).toEqual(expect.arrayContaining([
      "agent_furniture",
      "agent_style",
      "agent_qa",
    ]));
    expect(atelierHandoffTargets("agent_cost")).toEqual(["agent_concierge"]);
  });

  it("rejects peer handoffs outside the canonical graph", () => {
    expect(() => assertAtelierHandoffAllowed("agent_floorplan", "agent_geometry")).not.toThrow();
    expect(() => assertAtelierHandoffAllowed("agent_floorplan", "agent_cost")).toThrow(
      /outside the Atelier workflow/,
    );
  });
});
