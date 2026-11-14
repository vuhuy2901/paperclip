import { describe, expect, it, vi } from "vitest";
import { workflows, type Db } from "@paperclipai/db";
import { buildSimplifiedWorkflowV6Definition } from "../services/atelier-workflow-builder.js";
import {
  ATELIER_CANONICAL_STAGES,
  ATELIER_COMPANY_WORKFLOW_NAME,
  ATELIER_COMPANY_WORKFLOW_VERSION,
  ATELIER_SIMPLE_TASK_STATES,
  assertRenderAllowedAfterStep3,
  atelierCanonicalWorkflowDefinition,
  executeLinearWorkflowOnScene,
  type LinearSceneRunner,
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

  it("keeps Task Lifecycle strictly to the 6 simplified Vietnamese states", () => {
    expect(ATELIER_SIMPLE_TASK_STATES).toEqual([
      "Chờ",
      "Đang chạy",
      "Chờ duyệt",
      "Hoàn thành",
      "Lỗi",
      "Đã hủy",
    ]);
  });

  it("blocks Render unless Step 3 (Chọn đồ & vật liệu) has completed with selected materials", () => {
    const v6 = buildSimplifiedWorkflowV6Definition(6);
    expect(() => assertRenderAllowedAfterStep3(v6, undefined)).toThrow(/RENDER_ORDER_VIOLATION/);
    expect(() => assertRenderAllowedAfterStep3(v6, { status: "Đang chạy", completedAt: null, output: {} })).toThrow(/RENDER_ORDER_VIOLATION/);
    expect(() => assertRenderAllowedAfterStep3(v6, {
      status: "Hoàn thành",
      completedAt: new Date().toISOString(),
      output: {},
    })).toThrow(/RENDER_ORDER_VIOLATION/);
    expect(() => assertRenderAllowedAfterStep3(v6, {
      status: "Hoàn thành",
      completedAt: new Date().toISOString(),
      output: { selectedMaterials: { floorMaterialId: "floor_wood_oak_straight", wallMaterialId: "paint_dulux_japandi_ivory" } },
    })).not.toThrow();
  });

  it("executes Draft v6 strictly in order, never calls Render on Step 2 failure, and stops at NGƯỜI DUYỆT", async () => {
    const v6 = buildSimplifiedWorkflowV6Definition(6);
    const workflowRow = {
      id: "wf-v6-draft",
      companyId: "c1",
      name: ATELIER_COMPANY_WORKFLOW_NAME,
      version: 6,
      status: "draft",
      definition: v6,
    };
    const fakeDb = {
      select: () => ({
        from: (table: unknown) => ({
          where: () => {
            const rows = table === workflows ? [workflowRow] : [];
            const p = Promise.resolve(rows) as any;
            p.then = (onf: any, onr: any) => Promise.resolve(rows).then(onf, onr);
            return p;
          },
        }),
      }),
    } as unknown as Db;

    const callOrder: string[] = [];
    const runner: LinearSceneRunner = {
      fetchProject: async () => {
        callOrder.push("step1_fetch");
        return {
          project_id: "proj_demo_4x5m",
          name: "Studio 4x5m",
          revision: 10,
          width_mm: 4000,
          depth_mm: 5000,
          ceiling_height_mm: 2800,
          rooms: [{ id: "r1", floor_material_id: "floor_wood_oak_straight", wall_base_material_id: "paint_dulux_japandi_ivory" }],
          walls: [{ id: "w1" }],
          furniture_instances: [{ id: "sofa_1" }],
          active_style_preset: "japandi",
        };
      },
      verifySceneGeometry: async () => {
        callOrder.push("step2_verify");
        return { ok: true, status: "PASS", duration_ms: 120, manifest: { material_hash: "mat123" } };
      },
      confirmMaterialsAndFurniture: async () => {
        callOrder.push("step3_materials");
        return { ok: true };
      },
      renderScene: async () => {
        callOrder.push("step4_render");
        return {
          status: "COMPLETED",
          render_url: "/api/v1/renders/test.png",
          out_path: "data/renders/test.png",
          file_name: "test.png",
          file_size_bytes: 50000,
          material_hash: "mat123",
          camera_id: "eye_level",
          scene_verification: { all_checks_passed: true },
        };
      },
      fetchUnifiedBoq: vi.fn(async () => ({ items: [] })),
    };

    const trace = await executeLinearWorkflowOnScene(fakeDb, {
      companyId: "c1",
      mode: "test_run",
      definitionId: "wf-v6-draft",
      sceneId: "proj_demo_4x5m",
      optionalCostBomEnabled: true,
      runner,
    });

    expect(callOrder).toEqual(["step1_fetch", "step2_verify", "step3_materials", "step4_render"]);
    expect(trace.renderOrderVerified).toBe(true);
    expect(trace.step3CompletedBeforeRender).toBe(true);
    expect(trace.status).toBe("Chờ duyệt");
    expect(trace.currentStepLabel).toBe("Bước 5/5");
    expect(trace.awaitingHumanApproval).toBe(true);
    // Optional Cost/BOM MUST NOT run before NGƯỜI DUYỆT approves!
    expect(runner.fetchUnifiedBoq).not.toHaveBeenCalled();

    // Failing Step 2 must prevent Step 3 and Step 4 (Render) from ever executing
    const failingRunner: LinearSceneRunner = {
      ...runner,
      verifySceneGeometry: async () => ({ ok: false, status: "FAIL" }),
      renderScene: vi.fn(runner.renderScene),
    };
    const failedTrace = await executeLinearWorkflowOnScene(fakeDb, {
      companyId: "c1",
      mode: "test_run",
      definitionId: "wf-v6-draft",
      sceneId: "proj_demo_4x5m",
      runner: failingRunner,
    });
    expect(failedTrace.status).toBe("Lỗi");
    expect(failedTrace.currentStepNumber).toBe(2);
    expect(failedTrace.failedStep?.stepNumber).toBe(2);
    expect(failingRunner.renderScene).not.toHaveBeenCalled();
  });
});
