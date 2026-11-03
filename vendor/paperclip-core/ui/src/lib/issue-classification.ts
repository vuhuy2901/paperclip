import type { Issue } from "@paperclipai/shared";

export type IssueKind = "workflow-stage" | "project-requirement" | "ai-execution-task" | "unclassified";

/**
 * Classifies an issue into one of 4 categories based on its originId and originKind.
 * - workflow-stage: Created by the workflow plugin for a workflow node (no :task: in path)
 * - project-requirement: Manually created by a human user
 * - ai-execution-task: Created by an AI agent for a specific task
 * - unclassified: Everything else
 */
export function classifyIssue(issue: Issue): IssueKind {
  const originId = issue.originId ?? "";
  const originKind = issue.originKind ?? "";

  if (issue.labels?.some((label) => label.name === "AI Company: Manual Task")) {
    return "ai-execution-task";
  }

  // Workflow Stage: plugin created for a workflow node (originId ends at node level, no :task:)
  if (
    originKind === "plugin:ai-company-workflow-studio" &&
    /workflow-run:[^:]+:node:[^:]+$/.test(originId)
  ) {
    return "workflow-stage";
  }

  // AI Execution Task: plugin created for a task within a node
  if (
    originKind === "plugin:ai-company-workflow-studio" &&
    originId.includes(":task:")
  ) {
    return "ai-execution-task";
  }

  // Project Requirement: manually created by a human
  if (
    originKind === "manual" ||
    (!originKind && !(issue as any).createdByAgentId)
  ) {
    return "project-requirement";
  }

  // Agent-created without a workflow link = AI execution task
  if ((issue as any).createdByAgentId) {
    return "ai-execution-task";
  }

  return "unclassified";
}

export function isWorkflowStage(issue: Issue): boolean {
  return classifyIssue(issue) === "workflow-stage";
}

export function isProjectRequirement(issue: Issue): boolean {
  return classifyIssue(issue) === "project-requirement";
}

export function isAiExecutionTask(issue: Issue): boolean {
  return classifyIssue(issue) === "ai-execution-task";
}
