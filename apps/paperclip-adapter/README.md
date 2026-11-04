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
Ollama is called directly through `OLLAMA_BASE_URL`; there is no host gateway or
Codex CLI dependency. Planning, architecture, design and review roles remain
read-only by their task instructions.

This runs one assigned task per invocation. It does not enable timer heartbeats,
start all agents, or turn the workflow graph into an automatic scheduler.

The package exports Paperclip-compatible metadata and `createServerAdapter()` with `execute()` and `testEnvironment()` from `src/index.ts`. It runs an assigned Paperclip issue through Ollama's native API, while Paperclip remains authoritative for checkout, task hierarchy, dependencies, assignment wakeups, logs, and heartbeat history. A model may request a narrowly validated native child-task creation action; the adapter executes that call with the run-scoped Paperclip credential and does not contain a scheduler or workflow state machine. Company/project/role mapping is configured outside source code.
