import { describe, it, expect } from "vitest";
import { classifyIssue, isWorkflowStage, isProjectRequirement, isAiExecutionTask } from "./issue-classification";
import type { Issue } from "@paperclipai/shared";

describe("issue-classification", () => {
  it("keeps historical plugin-created issues out of the native stage model", () => {
    const stageIssue = {
      id: "stage-1",
      identifier: "AIS-22",
      title: "Analyze and plan",
      originId: "workflow-run:d58f1fdd-4ea6-45b7-b81d-b3676bd8801a:node:pm",
      originKind: "legacy-plugin",
    } as unknown as Issue;

    expect(classifyIssue(stageIssue)).toBe("unclassified");
    expect(isWorkflowStage(stageIssue)).toBe(false);
    expect(isProjectRequirement(stageIssue)).toBe(false);
  });

  it("classifies project requirements correctly", () => {
    const reqIssue = {
      id: "req-1",
      identifier: "AIS-32",
      title: "Xây dựng ứng dụng web học từ vựng",
      originId: null,
      originKind: "manual",
    } as unknown as Issue;

    expect(classifyIssue(reqIssue)).toBe("project-requirement");
    expect(isProjectRequirement(reqIssue)).toBe(true);
    expect(isWorkflowStage(reqIssue)).toBe(false);
  });

  it("does not treat historical plugin tasks as native agent work", () => {
    const taskIssue = {
      id: "task-1",
      identifier: "AIS-33",
      title: "Generate database schema",
      originId: "workflow-run:d58f1fdd-4ea6-45b7-b81d-b3676bd8801a:node:backend:task:schema-1",
      originKind: "legacy-plugin",
    } as unknown as Issue;

    expect(classifyIssue(taskIssue)).toBe("unclassified");
    expect(isAiExecutionTask(taskIssue)).toBe(false);
  });

  it("classifies agent-created issues as execution tasks", () => {
    const agentIssue = {
      id: "task-2",
      identifier: "AIS-34",
      title: "Fix bug in auth route",
      createdByAgentId: "agent-backend-123",
    } as unknown as Issue;

    expect(classifyIssue(agentIssue)).toBe("ai-execution-task");
  });

  it("keeps explicitly marked manual tasks in the AI work queue", () => {
    const manualTask = {
      id: "manual-task",
      originKind: "manual",
      labels: [{ id: "manual-task-label", name: "AI Company: Manual Task" }],
    } as unknown as Issue;
    expect(classifyIssue(manualTask)).toBe("ai-execution-task");
  });
});
