export type PaperclipRequest = (path: string, options?: { method?: string; body?: unknown }) => Promise<any>;

export async function assertWorkflowExecutionAllowed(
  issue: any,
  ctx: any,
  request: PaperclipRequest
): Promise<{ allowed: true; code: string; reason: string; runId?: string }> {
  const companyId = issue.companyId ?? ctx.agent.companyId;
  const response = await request("/api/plugins/ai-company-workflow-studio/actions/can-execute", {
    method: "POST",
    body: {
      companyId,
      params: {
        companyId,
        issueId: issue.id,
        agentId: ctx.agent.id
      }
    }
  });
  const decision = response?.data ?? response;
  if (!decision || decision.allowed !== true) {
    const code = String(decision?.code ?? "WORKFLOW_GATE_UNAVAILABLE");
    const reason = String(decision?.reason ?? "Workflow Execution Gate returned no valid admission decision.");
    throw new Error(`Workflow Execution Gate denied ${issue.identifier ?? issue.id}: [${code}] ${reason}`);
  }
  return decision;
}

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
  if (String(issue.originId ?? "").includes(":coordinator:")) {
    sections.push(
      "Coordinator responsibility: you are the AI Project Manager for this Workflow Run. Analyze the Product Owner requirement, keep the published React Flow dependency graph authoritative, and use the create-execution-tasks tool to create concrete tasks for the appropriate workflowNodeId stages. Include a stable taskKey for every task, assign only the stage's configured agent, and never use parentId or create tasks for a future stage before its dependencies are represented. Do not mark the coordinator as a business delivery task."
    );
  }
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
  if (comments.length) sections.push(`Task discussion:\n${comments.slice(-5).map((comment: any) => String(comment.body).slice(0, 12000)).join("\n\n")}`);
  sections.push("Work only on the current assigned task, its explicit source requirement, and completed dependencies.");
  return sections.join("\n\n");
}

export function taskResult(message: string): { status: "done" | "blocked" | "in_progress"; report: string } {
  const match = message.match(/<\s*paperclip-result\s*>\s*(\{[\s\S]*?\})\s*<\/\s*paperclip-result\s*>/);
  if (!match) return { status: "in_progress", report: message };
  try {
    const payload = JSON.parse(match[1]);
    const status = ["done", "blocked", "in_progress"].includes(payload.status) ? payload.status : "in_progress";
    const report = message.replace(match[0], "").trim();
    return { status: report ? status : "in_progress", report: report || "No substantive deliverable was returned." };
  } catch { return { status: "in_progress", report: message }; }
}
