import { describe, expect, it } from "vitest";
import type { Issue } from "@paperclipai/shared";
import type { RunForIssue } from "../api/activity";
import { buildProjectOperationsModel, MANUAL_TASK_LABEL, type ProjectWorkflowSnapshot } from "./project-operations";

const requirement = {
  id: "requirement", identifier: "AIS-32", title: "Build an English learning app",
  originKind: "manual", createdAt: "2026-11-03T09:00:00Z", updatedAt: "2026-11-03T09:00:00Z",
  status: "blocked", assigneeAgentId: "pm",
} as unknown as Issue;
const stage = {
  id: "legacy-stage", identifier: "AIS-22", title: "Analyze and plan",
  originKind: "plugin:ai-company-workflow-studio", originId: "workflow-run:old:node:pm",
  createdAt: "2026-11-02T09:00:00Z", updatedAt: "2026-11-02T09:00:00Z",
} as unknown as Issue;
const task = {
  id: "task", identifier: "AIS-33", title: "Implement vocabulary page",
  createdByAgentId: "pm", status: "todo", createdAt: "2026-11-03T09:10:00Z",
  updatedAt: "2026-11-03T09:10:00Z",
} as unknown as Issue;
const workflow = (status = "running", stageStatus = "pending"): ProjectWorkflowSnapshot => ({
  binding: { templateName: "App delivery", workflow: { nodes: [] } },
  activeRun: {
    id: "workflow-run", status, inputRequirement: requirement.title,
    startedAt: "2026-11-03T09:00:00Z", updatedAt: "2026-11-03T09:10:00Z",
    taskMappings: [{ issueId: "task", workflowNodeId: "build", stageId: "build" }],
  },
  monitor: [{ nodeId: "build", stageTitle: "Build", stageStatus, runs: [] }],
});
const failedRun = {
  runId: "failed-run", status: "failed", agentId: "pm",
  createdAt: "2026-11-03T09:11:00Z",
} as RunForIssue;

describe("project operations from recorded evidence", () => {
  it("keeps a project without requirements empty", () => {
    const result = buildProjectOperationsModel({ issues: [stage], workflow: null });
    expect(result.phase).toBe("no-requirement");
    expect(result.tasks).toHaveLength(0);
  });

  it("keeps submitted requirements separate from legacy workflow stages", () => {
    const result = buildProjectOperationsModel({ issues: [requirement, stage], workflow: workflow() });
    expect(result.phase).toBe("submitted");
    expect(result.requirement?.id).toBe("requirement");
    expect(result.tasks).toHaveLength(0);
  });

  it("shows PM processing only when a recorded run is active", () => {
    const active = { ...requirement, activeRun: { id: "pm-run", status: "running" } } as Issue;
    expect(buildProjectOperationsModel({ issues: [active], workflow: workflow() }).phase).toBe("pm-running");
  });

  it("prioritizes a current PM failure over stale workflow status", () => {
    const detail = { ...requirement, executionBlocker: {
      runId: "failed-run", agentId: "pm", runError: "fetch failed", canRetry: true,
    } } as Issue;
    const result = buildProjectOperationsModel({
      issues: [requirement, stage], workflow: workflow(), requirementDetail: detail,
      requirementRuns: [failedRun],
    });
    expect(result.phase).toBe("pm-failed");
    expect(result.failure).toContain("fetch failed");
    expect(result.canRetry).toBe(true);
    expect(result.tasks).toHaveLength(0);
  });

  it("stops showing the old blocker after a newer retry", () => {
    const detail = { ...requirement, executionBlocker: {
      runId: "failed-run", agentId: "pm", runError: "fetch failed", canRetry: true,
    } } as Issue;
    const retry = { ...failedRun, runId: "retry", status: "running", createdAt: "2026-11-03T09:12:00Z" };
    const result = buildProjectOperationsModel({
      issues: [requirement], workflow: workflow(), requirementDetail: detail,
      requirementRuns: [retry, failedRun],
    });
    expect(result.phase).toBe("pm-running");
    expect(result.canRetry).toBe(false);
  });

  it("recognizes generated tasks and their actual workflow mapping", () => {
    const result = buildProjectOperationsModel({ issues: [requirement, stage, task], workflow: workflow("paused") });
    expect(result.phase).toBe("tasks-generated");
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0]?.stageName).toBe("Build");
  });

  it("shows workflow running when generated tasks exist", () => {
    expect(buildProjectOperationsModel({ issues: [requirement, task], workflow: workflow() }).phase).toBe("workflow-running");
  });

  it("shows workflow blocks and approval separately", () => {
    expect(buildProjectOperationsModel({ issues: [requirement, task], workflow: workflow("failed", "blocked") }).phase).toBe("workflow-blocked");
    expect(buildProjectOperationsModel({ issues: [requirement, task], workflow: workflow("waiting_approval") }).phase).toBe("waiting-approval");
  });

  it("shows completion from a completed run", () => {
    expect(buildProjectOperationsModel({ issues: [requirement, task], workflow: workflow("completed", "done") }).phase).toBe("completed");
  });

  it("includes explicitly labeled manual tasks without treating them as requirements", () => {
    const manual = { ...task, id: "manual", createdByAgentId: null,
      originKind: "manual", labels: [{ id: "label", name: MANUAL_TASK_LABEL }] } as Issue;
    const result = buildProjectOperationsModel({ issues: [requirement, manual], workflow: null });
    expect(result.tasks.map((row) => row.issue.id)).toEqual(["manual"]);
    expect(result.requirement?.id).toBe("requirement");
  });
});
