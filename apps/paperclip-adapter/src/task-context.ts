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

/** The host stamps this context only after settling the stopped run's recovery hold. */
export function isAdmittedRecoveryContinuation(issue: any, ctx: any): boolean {
  const context = ctx.context ?? {};
  const continuation = context.explicitUserContinuation;
  return Boolean(continuation && typeof continuation.previousRunId === "string"
    && continuation.previousRunId.length > 0
    && continuation.previousRunId === context.previousRunId
    && explicitTaskId(ctx) === issue.id
    && !issue.executionBlocker);
}

export function waitingReason(issue: any, ctx: any): string | null {
  if (issue.companyId !== ctx.agent.companyId || issue.assigneeAgentId !== ctx.agent.id) {
    return "Issue is not assigned to this agent in this company.";
  }
  if (!["todo", "in_progress", "backlog"].includes(issue.status)
    && !(issue.status === "blocked" && isAdmittedRecoveryContinuation(issue, ctx))) return `Issue status is ${issue.status}.`;
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
  }
  // A project can contain several unrelated requests. Only include the source
  // explicitly named by this task, otherwise an old brief can override scope.
  const sourceId = String(issue.description ?? "").match(/Nguồn yêu cầu:\s*([A-Z]+-\d+)/i)?.[1];
  if (sourceId && sourceId !== issue.identifier) {
    const source = await request(`/api/issues/${encodeURIComponent(sourceId)}`);
    if (source.projectId === issue.projectId) {
      sections.push(`Source requirement (${source.identifier ?? source.id}):\n${source.title}\n${String(source.description ?? "").slice(0, 16000)}`);
    }
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
  const meaningfulComments = (Array.isArray(comments) ? comments : []).filter((c: any) => {
    const body = String(c?.body ?? "").trim();
    if (body.includes("Project requirements and dependencies loaded.")) return false;
    if (body.includes("No substantive deliverable was returned.")) return false;
    return true;
  });
  if (meaningfulComments.length) sections.push(`Task discussion:\n${meaningfulComments.slice(-5).map((comment: any) => String(comment.body).slice(0, 12000)).join("\n\n")}`);
  sections.push("Work only on the current assigned task, its explicit source requirement, and completed dependencies.");
  return sections.join("\n\n");
}

export function taskResult(message: string): { status: "done" | "blocked" | "in_progress"; report: string } {
  const candidates = [
    ...[...message.matchAll(/<\s*paperclip-result\s*>\s*(\{[\s\S]*?\})\s*<\/\s*paperclip-result\s*>/g)].map((match) => ({ json: match[1], whole: match[0] })),
    ...[...message.matchAll(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/gi)].map((match) => ({ json: match[1], whole: match[0] })),
  ].reverse();
  for (const candidate of candidates) {
    try {
      const payload = JSON.parse(candidate.json);
      if (!["done", "blocked", "in_progress"].includes(payload?.status)) continue;
      const status = payload.status as "done" | "blocked" | "in_progress";
      const report = message.replace(candidate.whole, "")
        .replace(/<\s*paperclip-actions\s*>[\s\S]*?<\/\s*paperclip-actions\s*>/g, "")
        .replace(/```(?:json)?\s*\{\s*"paperclip-actions"[\s\S]*?\}\s*```/gi, "")
        .trim();
      const actionOnlyCompletion = nativeTaskActions(message).length > 0;
      const effectiveStatus = (report || actionOnlyCompletion || status === "done" || status === "blocked") ? status : "in_progress";
      const defaultReport = actionOnlyCompletion
        ? "Native Paperclip child-task delegation completed."
        : status === "done"
          ? "Task completed as requested."
          : status === "blocked"
            ? "Task is blocked by external dependencies."
            : "No substantive deliverable was returned.";
      return {
        status: effectiveStatus,
        report: report || defaultReport,
      };
    } catch { /* Try the next model-provided JSON block. */ }
  }
  // Some small local models emit the native child-task action and omit the
  // result marker. Once the validated native action exists, the manager's
  // delegation turn is complete; treating it as unfinished would make the
  // native recovery coordinator retry the same delegation.
  if (nativeTaskActions(message).length > 0) {
    return { status: "done", report: "Native Paperclip child-task delegation completed." };
  }
  const substantive = message.replace(/```(?:json)?\s*```/gi, "").trim();
  return substantive
    ? { status: "done", report: substantive }
    : { status: "in_progress", report: message };
}

export type NativeTaskAction = {
  type: "create_task";
  title: string;
  description: string;
  assigneeAgentId: string;
  priority?: "low" | "medium" | "high" | "urgent";
};

/**
 * The model may ask the adapter to call Paperclip's native task API.  This is
 * deliberately a small, validated tool contract: it is not a scheduler and it
 * cannot advance a workflow, bypass dependencies, or invoke another runtime.
 */
export function nativeTaskActions(message: string): NativeTaskAction[] {
  const jsonCandidates = [
    ...[...message.matchAll(/<\s*paperclip-actions\s*>\s*(\{[\s\S]*?\})\s*<\/\s*paperclip-actions\s*>/g)].map((match) => match[1]),
    ...[...message.matchAll(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/gi)].map((match) => match[1]),
  ];
  for (const candidateJson of jsonCandidates) {
    try {
      const payload = JSON.parse(candidateJson);
      const actions = payload?.actions ?? payload?.["paperclip-actions"]?.actions;
    if (!Array.isArray(actions)) continue;
    return actions.slice(0, 5).flatMap((candidate: any): NativeTaskAction[] => {
      if (candidate?.type !== "create_task") return [];
      const title = text(candidate.title);
      const description = text(candidate.description);
      const assigneeAgentId = text(candidate.assigneeAgentId);
      if (!title || !description || !assigneeAgentId) return [];
      const priority = ["low", "medium", "high", "urgent"].includes(candidate.priority) ? candidate.priority : "medium";
      return [{ type: "create_task", title: title.slice(0, 240), description: description.slice(0, 16000), assigneeAgentId, priority }];
    });
    } catch { /* Try the next model-provided JSON block. */ }
  }
  return [];
}
