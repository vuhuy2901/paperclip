export type PaperclipRequest = (path: string, options?: { method?: string; body?: unknown }) => Promise<any>;

function text(value: unknown): string {
  return typeof value === "string" && value !== "null" && value !== "undefined" ? value.trim() : "";
}

export function explicitTaskId(ctx: any): string {
  const context = ctx.context ?? {};
  const wake = context.paperclipWake ?? {};
  return text(context.taskId) || text(context.issueId) || text(context.task?.issueId)
    || text(context.task?.id) || text(wake.taskId) || text(wake.issueId) || text(ctx.runtime?.taskKey);
}

export function waitingReason(issue: any, ctx: any): string | null {
  if (issue.companyId !== ctx.agent.companyId || issue.assigneeAgentId !== ctx.agent.id) {
    return "Issue is not assigned to this agent in this company.";
  }
  if (!["todo", "in_progress", "backlog"].includes(issue.status)) return `Issue status is ${issue.status}.`;
  if (issue.project?.pausedAt) return "Project is paused.";
  const ownerRun = issue.executionRunId ?? issue.checkoutRunId;
  if (ownerRun && ownerRun !== ctx.runId) return "Issue is already owned by another run.";
  if (issue.blockerAttention?.unresolvedBlockerCount > 0 || issue.blockerAttention?.pendingFinalizeBlockerIssueIds?.length) {
    return "Issue is waiting for dependencies to finish.";
  }
  const blockers = Array.isArray(issue.blockedBy) ? issue.blockedBy : [];
  if (blockers.some((blocker: any) => blocker.status !== "done")) {
    return `Waiting for ${blockers.filter((blocker: any) => blocker.status !== "done").map((blocker: any) => blocker.identifier ?? blocker.id).join(", ")}.`;
  }
  return null;
}

export async function resolveAssignedTask(ctx: any, request: PaperclipRequest) {
  const id = explicitTaskId(ctx);
  if (id) {
    const issue = await request(`/api/issues/${encodeURIComponent(id)}`);
    const reason = waitingReason(issue, ctx);
    return { issue: reason ? null : issue, reason, explicit: true };
  }
  const query = new URLSearchParams({ assigneeAgentId: ctx.agent.id, status: "in_progress,todo,backlog", limit: "100", offset: "0" });
  const candidates = await request(`/api/companies/${ctx.agent.companyId}/issues?${query}`);
  if (!Array.isArray(candidates)) throw new Error("Paperclip returned an invalid assigned-task list.");
  const rank: Record<string, number> = { in_progress: 0, todo: 1, backlog: 2 };
  const ordered = candidates.filter((issue: any) => issue.assigneeAgentId === ctx.agent.id)
    .sort((a: any, b: any) => (rank[a.status] ?? 3) - (rank[b.status] ?? 3) || String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? "")));
  const reasons: string[] = [];
  for (const candidate of ordered) {
    const issue = await request(`/api/issues/${encodeURIComponent(candidate.id)}`);
    const reason = waitingReason(issue, ctx);
    if (!reason) return { issue, reason: null, explicit: false };
    reasons.push(`${issue.identifier ?? issue.id}: ${reason}`);
  }
  return { issue: null, reason: reasons.join("\n") || "No runnable task assigned. Assign a task to this agent first.", explicit: false };
}

export async function taskPrompt(issue: any, request: PaperclipRequest): Promise<string> {
  const sections = [`Current task: ${issue.identifier ?? issue.id}\n${issue.title ?? ""}\n\n${issue.description ?? ""}`];
  if (issue.projectId) {
    sections.push(`Project: ${issue.project?.name ?? issue.projectId}\n${issue.project?.description ?? ""}`);
    const query = new URLSearchParams({ projectId: issue.projectId, limit: "100", offset: "0" });
    const projectIssues = await request(`/api/companies/${issue.companyId}/issues?${query}`);
    const briefs = projectIssues.filter((item: any) => item.id !== issue.id && !item.assigneeAgentId && item.description && !item.parentId).slice(0, 8);
    for (const brief of briefs) sections.push(`Project requirement (${brief.identifier ?? brief.id}):\n${brief.title}\n${String(brief.description).slice(0, 16000)}`);
  }
  if (issue.parentId) {
    const parent = await request(`/api/issues/${encodeURIComponent(issue.parentId)}`);
    sections.push(`Parent requirement (${parent.identifier ?? parent.id}):\n${parent.title}\n${parent.description ?? ""}`);
  }
  for (const blocker of (issue.blockedBy ?? []).slice(0, 8)) {
    const comments = await request(`/api/issues/${encodeURIComponent(blocker.id)}/comments`);
    sections.push(`Completed predecessor ${blocker.identifier ?? blocker.id}: ${blocker.title}\n${comments.slice(-3).map((comment: any) => String(comment.body).slice(0, 12000)).join("\n\n")}`);
  }
  const comments = await request(`/api/issues/${encodeURIComponent(issue.id)}/comments`);
  if (comments.length) sections.push(`Task discussion:\n${comments.slice(-5).map((comment: any) => String(comment.body).slice(0, 12000)).join("\n\n")}`);
  sections.push("Work only on the current assigned task and respect the project requirements. Other project requirements provide context, not permission to skip this task's scope or dependencies.");
  return sections.join("\n\n");
}

export function taskResult(message: string): { status: "done" | "blocked" | "in_progress"; report: string } {
  const match = message.match(/<paperclip-result>\s*(\{[\s\S]*?\})\s*<\/paperclip-result>/);
  if (!match) return { status: "in_progress", report: message };
  try {
    const payload = JSON.parse(match[1]);
    const status = ["done", "blocked", "in_progress"].includes(payload.status) ? payload.status : "in_progress";
    const report = message.replace(match[0], "").trim();
    return { status: report ? status : "in_progress", report: report || "No substantive deliverable was returned." };
  } catch { return { status: "in_progress", report: message }; }
}
