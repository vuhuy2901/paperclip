import { describe, expect, it } from "vitest";
import {
  ATELIER_CANONICAL_STAGES,
  ATELIER_COMPANY_WORKFLOW_NAME,
  ATELIER_COMPANY_WORKFLOW_VERSION,
  atelierCanonicalWorkflowDefinition,
} from "../services/atelier-workflow-orchestration.js";

describe("Atelier company workflow orchestration contract", () => {
  it("publishes the v2 graph without a lighting stage", () => {
    expect(ATELIER_COMPANY_WORKFLOW_NAME).toBe("Atelier Company Workflow");
    expect(ATELIER_COMPANY_WORKFLOW_VERSION).toBe(2);
    expect(ATELIER_CANONICAL_STAGES).toHaveLength(9);
    const seen = new Set<string>();
    for (const stage of ATELIER_CANONICAL_STAGES) {
      expect(seen.has(stage.key)).toBe(false);
      for (const dependency of stage.dependsOn) expect(seen.has(dependency)).toBe(true);
      seen.add(stage.key);
    }
    expect(ATELIER_CANONICAL_STAGES.some((stage) => stage.key === "lighting")).toBe(false);
    expect(ATELIER_CANONICAL_STAGES.find((stage) => stage.key === "render")).toMatchObject({
      agentKey: "agent_render",
      dependsOn: ["furniture", "style"],
    });
    expect(ATELIER_CANONICAL_STAGES.find((stage) => stage.key === "cost")?.dependsOn).toEqual([
      "qa",
      "research",
    ]);
  });

  it("requires decisions and outputs, and routes unknown data to needs_input", () => {
    const definition = atelierCanonicalWorkflowDefinition();
    expect(definition.chiefResponsibilities).toEqual(["intake", "planning", "delegation", "monitoring", "review"]);
    expect(definition.stateMachine).toEqual(expect.arrayContaining(["pending", "ready", "running", "done", "needs_input", "blocked", "needs_review", "failed"]));
    expect(definition.gatePolicy).toMatchObject({
      unknownData: "needs_input",
      noAutoDecision: true,
      artifactRequiredForHandoff: true,
      decisionLedgerRequiredForHandoff: true,
    });
    expect(definition.stages.find((stage) => stage.key === "style")?.gate.approval).toBe(true);
    expect(definition.stages.find((stage) => stage.key === "cost")?.requiredInputs).toContain("budget_range");
  });
});
