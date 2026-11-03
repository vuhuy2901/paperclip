# Paperclip adapter boundary

## Running an assigned Paperclip task

`Run now` on an agent opens its assigned queue and selects one available task,
preferring `in_progress`, then `todo`, then `backlog`. An issue-scoped wake stays
on that issue. Paused projects, tasks owned by another run, and unfinished
dependencies are excluded. If nothing is ready, the run reports `Waiting` and
does not invoke the model. A disabled timer heartbeat does not prevent a manual
run.

The adapter checks out the selected issue using the current authenticated run,
loads the task's explicitly named source requirement, parent requirement, discussion and completed
dependency handoffs, then sends the task to the configured model. Start and result
comments are written to that issue. The model must explicitly report a completed
deliverable before the adapter marks it `done`; failed execution never does so.
The Windows host gateway uses a workspace-write sandbox because the read-only
Codex sandbox blocks even repository reads on this host. Planning, architecture,
design and review roles remain read-only by their task instructions.
Implementation uses the configured `gatewayCwd`, the project's local code folder,
or the gateway's shared `/workspace` root.

This runs one assigned task per invocation. It does not enable timer heartbeats,
start all agents, or turn the workflow graph into an automatic scheduler.

The package exports Paperclip-compatible metadata and `createServerAdapter()` with `execute()` and `testEnvironment()` from `src/index.ts`. The local bridge server accepts Paperclip wake-ups at `POST /adapter/wake`, forwards them to the Core API with a service token, and suppresses duplicate idempotency keys. A successful wake response includes authenticated Core links for the run, event stream, artifacts, evidence, preview and baseline/candidate diff so the Paperclip task can retain the handoff boundary. When `PAPERCLIP_API_KEY` and an issue id are available in the execution context, the adapter polls the Core run and posts a terminal status/comment with those links back to the native Paperclip issue. Without those credentials it emits an explicit `paperclip.core.sync.scheduled` event with `configured: false`; it does not pretend that native back-sync occurred. Company/project/role mapping is configured outside source code.
