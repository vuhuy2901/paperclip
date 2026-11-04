import type { Issue } from "@paperclipai/shared";

/** `workflow-stage` remains only for UI compatibility with historical issues. */
export type IssueKind = "workflow-stage" | "project-requirement" | "ai-execution-task" | "unclassified";

/**
 * Classifies an issue from native Paperclip provenance.
 * - project-requirement: Manually created by a human user
 * - ai-execution-task: Created by an AI agent for a specific task
 * - unclassified: Everything else
 */
export function classifyIssue(issue: Issue): IssueKind {
  const originKind = issue.originKind ?? "";

  if (issue.labels?.some((label) => label.name === "AI Company: Manual Task")) {
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
  void issue;
  return false;
}

export function isProjectRequirement(issue: Issue): boolean {
  return classifyIssue(issue) === "project-requirement";
}

export function isAiExecutionTask(issue: Issue): boolean {
  return classifyIssue(issue) === "ai-execution-task";
}
