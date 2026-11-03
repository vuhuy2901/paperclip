import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExecutionBlocker } from "@paperclipai/shared";
import { agentsApi } from "../api/agents";
import { activityApi } from "../api/activity";
import { api } from "../api/client";
import { queryKeys } from "../lib/queryKeys";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { Link } from "../lib/router";

export function ExecutionBlockerNotice({ companyId, issueId, blocker, onRetried, className }: {
  className?: string;
  companyId: string;
  issueId: string;
  blocker: ExecutionBlocker;
  onRetried: () => void;
}) {
  const queryClient = useQueryClient();
  const { data: runs, error: runsError } = useQuery({
    queryKey: queryKeys.issues.runs(issueId),
    queryFn: () => activityApi.runsForIssue(issueId),
    refetchInterval: 5000,
  });
  const failedRun = runs?.find(run => run.runId === blocker.runId &&
    ["failed", "timed_out"].includes(run.status));
  const modelRejected = failedRun?.errorCode === "native_provider_model_rejected";
  const gatewayFailure = failedRun?.adapterType === "ai_company_external" &&
    /fetch failed|Codex gateway .*unavailable|Codex gateway .*request failed/i.test(blocker.runError ?? "");
  const runtimeHealth = useQuery({
    queryKey: ["ai-company-runtime-health", companyId],
    queryFn: async () => {
      const result = await api.post<{ data: { reachable: boolean; reason: string | null; checkedAt: string } }>(
        "/plugins/ai-company-workflow-studio/data/ai-runtime-health",
        { companyId, params: { companyId } },
      );
      return result.data;
    },
    enabled: gatewayFailure,
    retry: false,
    refetchInterval: gatewayFailure ? 5000 : false,
  });
  const connectionRestored = gatewayFailure && runtimeHealth.data?.reachable === true;
  const retryInFlight = runs?.some(run => run.runId !== blocker.runId &&
    (run.retryOfRunId === blocker.runId || Boolean(failedRun?.finishedAt && run.createdAt > failedRun.finishedAt)) &&
    ["queued", "running"].includes(run.status));
  const requiresInspection = blocker.cause === "native_continuation_requires_reconciliation" ||
    blocker.cause === "native_session_cleanup_quarantined";
  const retry = useMutation({
    mutationFn: () => agentsApi.retryFailedRun(blocker.agentId!, blocker.runId!, companyId),
    onSuccess: () => {
      onRetried();
      for (const queryKey of [queryKeys.issues.detail(issueId), queryKeys.issues.runs(issueId),
        queryKeys.issues.liveRuns(issueId), queryKeys.issues.activeRun(issueId)]) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
  });
  return (
    <div role="status" aria-label="Task recovery" className={cn("task-context-notice flex flex-wrap items-center justify-between gap-2", className)}>
      <div className="min-w-0 flex-1 break-words">
        {retryInFlight ? <p>A new execution is in progress. The previous failure remains in Run History.</p> : connectionRestored ? (
          <>
            <p>AI connection restored. The previous run stopped before it could finish.</p>
            <p>Retry this task to continue. Restarting Paperclip preserves the previous run's history.</p>
          </>
        ) : <p>{modelRejected ? "Model unavailable." : "Recovery needed."}{blocker.runError ? ` ${blocker.runError}` : ""}</p>}
        {gatewayFailure && !connectionRestored && !retryInFlight && (
          <p>{runtimeHealth.isError ? "Could not check the AI connection. Inspect the run before retrying." : runtimeHealth.isPending ? "Checking the AI gateway connection…" : `AI gateway is unavailable (${runtimeHealth.data?.reason ?? "connection failed"}). Start the host gateway before retrying.`}</p>
        )}
        {modelRejected && <p>Choose a supported model or clear the task's model override, then retry.</p>}
        {blocker.workspaceRepairRequired ? (
          <>
            {/* The stored next action is an operator runbook step; lead with what happened. This hold also covers
                unsafe archives and local runs, so do not claim retries or a retained sandbox here. */}
            <p>
              Paperclip could not restore the agent's workspace files after its last run. A board operator must
              recover the files before the agent can continue.
            </p>
            <details>
              <summary className="cursor-pointer">Technical details</summary>
              <p>{blocker.nextAction}</p>
            </details>
          </>
        ) : !connectionRestored && !retryInFlight ? <p>{blocker.nextAction}</p> : <details>
          <summary className="cursor-pointer">Previous failure details</summary>
          <p>{blocker.runError}</p><p>{blocker.nextAction}</p>
        </details>}
        {Boolean(blocker.savedMessageCount) && (
          <p>{blocker.savedMessageCount} saved {blocker.savedMessageCount === 1 ? "message is" : "messages are"} waiting for recovery.</p>
        )}
      </div>
      {blocker.agentId && blocker.runId && (
        <Button variant="outline" size="sm" asChild>
          <Link to={`/agents/${blocker.agentId}/runs/${blocker.runId}`}>Inspect run</Link>
        </Button>
      )}
      {!blocker.workspaceRepairRequired && (!requiresInspection || blocker.canRetry) && blocker.agentId && blocker.runId &&
        ((blocker.cause === "legacy_execution_requires_reconciliation" && failedRun) || blocker.canContinue || blocker.canRetry) && (
        <Button variant="outline" size="sm" disabled={retry.isPending || retryInFlight} onClick={() => retry.mutate()}>
          {retry.isPending || retryInFlight ? "Starting…" : blocker.canContinue ? "Continue" : connectionRestored ? "Retry task" : "Retry"}
        </Button>
      )}
      {retry.isError && (
        <p role="alert" className="w-full text-destructive">{retry.error.message}</p>
      )}
      {runsError && <p role="alert" className="w-full text-destructive">{runsError.message}</p>}
    </div>
  );
}
