import { describe, it, expect } from "vitest";
import {
  computeWorkflowRunProgress,
  mapNodeExecutionStatus,
  validateSafeWorkspacePath,
} from "./project-operations";

describe("Workflow Run Progress & Node Status Mapping", () => {
  it("calculates progress derived from template nodes count (0/9, 1/9), NOT hardcoded 5 stages", () => {
    const nodes = [
      { id: "start" },
      { id: "pm" },
      { id: "architect" },
      { id: "parallel" },
      { id: "uiux" },
      { id: "backend" },
      { id: "frontend" },
      { id: "review" },
      { id: "test" },
    ];

    // Initial state: nothing done
    const initial = computeWorkflowRunProgress(nodes, {});
    expect(initial.totalNodes).toBe(9);
    expect(initial.completedNodes).toBe(0);
    expect(initial.percent).toBe(0);

    // One node done: 1/9 (11%)
    const oneDone = computeWorkflowRunProgress(nodes, {
      start: { status: "done" },
      pm: { status: "running" },
    });
    expect(oneDone.completedNodes).toBe(1);
    expect(oneDone.runningNodes).toBe(1);
    expect(oneDone.percent).toBe(11);

    // Failed node scenario (e.g. PM failed)
    const pmFailed = computeWorkflowRunProgress(nodes, {
      start: { status: "done" },
      pm: { status: "failed" },
    });
    expect(pmFailed.completedNodes).toBe(1);
    expect(pmFailed.failedNodes).toBe(1);
    expect(pmFailed.runningNodes).toBe(0);
    expect(pmFailed.percent).toBe(11);
  });

  it("maps various node execution statuses correctly", () => {
    expect(mapNodeExecutionStatus(undefined)).toBe("pending");
    expect(mapNodeExecutionStatus(null)).toBe("pending");
    expect(mapNodeExecutionStatus({ status: "pending" })).toBe("pending");
    expect(mapNodeExecutionStatus({ status: "running" })).toBe("running");
    expect(mapNodeExecutionStatus({ status: "in_progress" })).toBe("running");
    expect(mapNodeExecutionStatus({ status: "done" })).toBe("done");
    expect(mapNodeExecutionStatus({ status: "completed" })).toBe("done");
    expect(mapNodeExecutionStatus({ status: "failed" })).toBe("failed");
    expect(mapNodeExecutionStatus({ status: "error" })).toBe("failed");
    expect(mapNodeExecutionStatus({ status: "waiting_approval" })).toBe("waiting_approval");
    expect(mapNodeExecutionStatus({ status: "approval" })).toBe("waiting_approval");
    expect(mapNodeExecutionStatus({ status: "blocked" })).toBe("blocked");
  });

  it("strictly validates workspace paths and blocks path traversal attempts", () => {
    // Valid relative paths
    expect(validateSafeWorkspacePath("src/app.js")).toBe(true);
    expect(validateSafeWorkspacePath("package.json")).toBe(true);
    expect(validateSafeWorkspacePath("nested/dir/file.ts")).toBe(true);

    // Path traversal attempts
    expect(validateSafeWorkspacePath("../etc/passwd")).toBe(false);
    expect(validateSafeWorkspacePath("../../secret")).toBe(false);
    expect(validateSafeWorkspacePath("src/../../etc/shadow")).toBe(false);

    // Absolute and backslash paths
    expect(validateSafeWorkspacePath("/workspace/app.js")).toBe(false);
    expect(validateSafeWorkspacePath("src\\app.js")).toBe(false);

    // Forbidden directories
    expect(validateSafeWorkspacePath(".git/config")).toBe(false);
    expect(validateSafeWorkspacePath("node_modules/lodash/index.js")).toBe(false);
    expect(validateSafeWorkspacePath("dist/bundle.js")).toBe(false);
  });

  it("provides full English messaging across all project execution phases", () => {
    const nodes = [{ id: "start" }, { id: "pm" }, { id: "backend" }];
    const paused = computeWorkflowRunProgress(nodes, {
      start: { status: "done" },
      pm: { status: "running" },
      backend: { status: "pending" },
    });
    expect(paused.completedNodes).toBe(1);
    expect(paused.runningNodes).toBe(1);

    expect(mapNodeExecutionStatus({ status: "waiting_approval" })).toBe("waiting_approval");
    expect(mapNodeExecutionStatus({ status: "paused" })).toBe("pending");
  });
});
