# AI SOFTWARE COMPANY — PROJECT CONTEXT & ENGINEERING RULES

> **Context document for Codex / AI coding agents**  
> Last consolidated: **2026-11-03**  
> Purpose: Keep all implementation work aligned with the product vision. **Read this file before changing code.**
>
> **Source of truth:** Current repository, running services, database, and user-accepted requirements. This file describes the intended product and past reported observations, **not proof that every feature is already implemented or deployed**.

---

## 1. Product vision (non-negotiable)

Build an **AI Software Company** managed by **one human Product Owner (PO)** and operated by **eight specialized AI agents** through **Paperclip**.

The intended user journey is deliberately simple:

```text
PO creates a Project
    ↓
PO writes ONE software requirement / prompt
    ↓
PO selects a published Workflow template and clicks Run
    ↓
AI Project Manager analyzes the requirement, plans, creates and delegates concrete tasks
    ↓
Specialist agents execute those tasks ONLY when their Workflow stage is eligible
    ↓
PO watches live project progress, stages, agents, tasks and logs
    ↓
PO reviews / approves deliverables
```

**The PO must not have to manually decompose the project into tasks or create a parent/subtask tree.** AI determines the work required. The **published Workflow constrains execution order**; AI has flexibility over the work within a permitted stage, not over mandatory stage order or approval requirements.

### Eight roles

1. **Project Manager** — requirement analysis, plan, task creation and delegation.
2. **Solution Architect** — architecture and technical specifications.
3. **UI/UX Designer** — interface and user experience.
4. **Backend Engineer** — APIs and backend implementation.
5. **Frontend Engineer** — frontend implementation and integration.
6. **Code Reviewer** — review and technical verification.
7. **QA Tester** — testing and defect reporting.
8. **DevOps Engineer** — build and deployment.

**Human PO is not a ninth AI agent.** Agent names, configurations and assignments must come from real stored data; the role list above is the desired organization, not a mandate to create duplicate agents.

---

## 2. Clear domain model

| Concept | What it means | UI ownership |
|---|---|---|
| **Project** | One software product being delivered | **Projects**; project details are the central workspace |
| **Project Requirement** | PO's original brief, constraints and acceptance expectations | **Project Detail → Overview / Requirements** |
| **Workflow Definition** | Reusable, versioned graph describing mandatory stages, dependencies and approvals | **Workflows → Designer** |
| **Workflow Run** | One actual execution of a published workflow for a specific project | **Project Detail → Workflow / Run History** |
| **Workflow Stage / Node** | A step or role in the process; may own **many** execution tasks | React Flow Designer and read-only Live Monitor |
| **AI Execution Task / Issue** | Specific work planned/assigned to an AI; can be dynamically generated | **Tasks** list and **Project Detail → Tasks** |
| **Agent Run / Heartbeat Run** | One actual runtime invocation, possibly associated with an issue or stage | Agent details, Task logs, Stage inspector |
| **Deliverable** | Verifiable output: files, commits, tests, build, deployment, document | **Project Detail → Deliverables** |

Important invariants:

- **1 Project ≠ 1 Task.** One product can require many tasks.
- **1 Workflow node ≠ 1 Task.** A Backend stage might contain authentication, products, orders, cart and payment tasks.
- **1 Task ≠ 1 Agent run.** A task may have multiple heartbeat runs/retries; an agent run may touch several tasks.
- **Workflow Definition ≠ Workflow Run.** Editing/publishing a template must not itself start agents or create a fixed list of business tasks.
- **Workflow stage status is not the same as Issue status or Agent runtime status.** Maintain separate representations.
- **Project Requirement is input, not an AI execution task.** Legacy requirements stored as Issues may remain in the DB, but should be classified/displayed separately based on reliable provenance metadata, not title matching.
- Do not add a mandatory parent/subtask hierarchy or change `parentId` to implement this model.

---

## 3. Intended flow of work

### 3.1 Starting a project

1. PO creates/selects a **Project**.
2. PO enters the original **Requirement**; it is stored persistently and appears in the Project overview.
3. PO chooses a **Published Workflow Definition**.
4. PO clicks **Run Project Workflow**.
5. Backend validates the workflow version, agent mapping, workspace/runtime, approvals, permissions, and dependencies.
6. A **Workflow Run** is created using an immutable/pinned snapshot of the published graph.
7. Only eligible entry stages are activated; normally **Project Manager** starts planning.
8. Project Manager creates/delegates concrete tasks. The tasks are mapped to the correct Project, Workflow Run and Stage.
9. Specialist agents execute tasks **only after the backend permits their stages**.
10. User sees real-time status in the **Project**, not by searching Run IDs in the Workflows template library.

### 3.2 Dynamic AI-generated tasks

- AI PM is responsible for creating the initial work plan and execution tasks.
- Specialists may propose/create additional tasks **within their authorized stage**, if allowed by policy.
- Tasks require: project identity, issue ID, title, assignee, workflow-run/stage mapping when applicable, status, dependencies, and traceable runs/logs.
- Never manufacture a fixed issue named `Implement APIs` merely because a stage node exists. Stage execution bookkeeping can be recorded separately or clearly typed, as needed.
- Guard against duplicate task creation when the workflow is published, retried, resumed or the UI is refreshed.
- Legacy tasks may have been created from workflow nodes. Audit their provenance; **do not delete or silently remap them**.

### 3.3 Workflow authority and backend enforcement

The **published graph is the authoritative plan for its Workflow Run**. Frontend React Flow edges are not enough. Enforcement must happen at the appropriate server-side scheduling/checkout/wakeup/mutation entry points.

For an edge `A → B`, **B must not begin while A's completion conditions remain unsatisfied**, even after clicking Start All Agents. For parallel branches, permit simultaneous work when all required dependencies are satisfied, respecting concurrency limits. For a join, require all mandatory upstream stages. Approval gates require **real human approval**.

Required controls:

- Validate graph, node mappings, approval gates, cycles and unsupported conditions before Run.
- Pin workflow version/snapshot per execution; changes in Designer must not silently change active runs.
- Map `Workflow Run → Stage → Issue(s) → Agent Run(s) → Events/Logs` using IDs, not names.
- Keep Paperclip `blockedByIssueIds` semantics where applicable, but verify stage eligibility in backend; do not rely solely on an agent's prompt.
- On failure, block dependent stages; support bounded retry and explicit intervention.
- For QA/review rework, create valid follow-up iterations/tasks; **do not create circular Issue dependencies**.
- Prevent unauthorized PM/Agent edits that bypass mandatory stages or approvals.
- Avoid duplicate execution with idempotency/claiming and the existing scheduler.
- Keep **Start All Agents** (wake eligible agents) separate from **Run Project Workflow** (start/resume an ordered project workflow).

### 3.4 End state

- Stage completion is based on actual required work and acceptance conditions, not an animated edge or a returned HTTP 200.
- Project completion requires the designated completion/approval policy.
- Deliverables are traceable to source files/commits, test results, deployment links, or other actual artifacts.

---

## 4. Navigation and UX contract

### 4.1 Projects — the main PO control center

**Projects list**: show Project name, active/latest workflow, run status, completed/total required stages, current stages, active agents, blocked/error reason, last activity, and quick link to Project. If multiple projects run simultaneously, show each independently.

**Project Detail** has:

- **Overview** — requirement, workflow progress, running/waiting stages, active agents, recent significant activity, actions needed.
- **Tasks** — tasks belonging to **this Project** with filters and direct links to execution details.
- **Workflow** — the **default live, read-only React Flow monitor**, with full graph, node state/glow, active handoffs, live logs and run history.
- **Deliverables** — verified output and approval.

The **Project Detail → Workflow** view is where the PO watches the entire process. Do **not** force the user to visit Workflows to find an execution Run ID.

### 4.2 Workflows — reusable process templates ONLY

- Template list, Create, Designer, Validate, Publish, Duplicate, Delete.
- Designer uses the **existing `@xyflow/react` integration**; **do not clone or rebuild React Flow**.
- Keep workflow-run lists/history under their Projects, not as the primary section in the Workflows library.
- Designer supports fit view, compact layout, delete node/edge, save draft, publish and validation.
- Monitor is read-only and represents a pinned run snapshot.

### 4.3 Tasks — the AI work ledger, not a requirement inbox

The PO should not need to click New Task in the normal workflow.

**Global Tasks page** is a **flat, professional work table**, default **grouped by Project**, with:

- Task ID + title.
- Project name.
- Assigned Agent (or Unassigned).
- Paperclip Issue status.
- Separate Agent Execution state: Queued / Running / Idle / Failed / Completed where supported.
- Priority.
- Workflow Stage / Run mapping if actually recorded.
- Ready/Blocked + real blocker reason.
- Last activity and actions.
- Search and filters: Project, Agent, Status, Execution, Workflow Stage; Project Grouping/Flat List toggle.
- KPI summary from real data: Total, Running, Blocked, Completed, Failed.
- **Do not default to Today/Yesterday grouping**.
- **No required Tree View, Parent Task, Subtask or `parentId` mutation**.
- Do not hide general/manual issues based only on an approximate classifier; distinguish requirements using provenance and offer an explicit view when appropriate.

**Task Detail Drawer**: Overview, AI Execution, Live Logs and Workflow. Show relevant agent runs, timestamps, tool events *if observable*, errors, linked workflow stage, actual blockers, and a jump to the correct Project Workflow Monitor. Do not show fake progress or inferred private model reasoning.

### 4.4 Agent Control Center

Show one row/card per **distinct Agent**, not one per heartbeat run. Include lifecycle, execution state, model/harness, current task, last run and error diagnostics.

Controls:

- Individual Start/Wakeup, Stop/Cancel run, Pause, Resume, Retry eligible errors.
- Start All, Stop All, Pause All, Resume All, Retry Failed, optionally selected agents.
- Bulk actions require confirmations, concurrency and quota safety; default low concurrency (for example 2) unless backend policy says otherwise.
- **Wakeup is not a perpetually running Docker container**, and success of a wakeup request does not mean task completion.
- Do not equate Pause with Cancel, or Stop with deletion/rollback.

### 4.5 Dashboard — AI Company Intelligence & Operations Center

Dashboard must be oriented around the company, projects and runtime, **not repeated PM run cards or tiny charts**.

**Company Overview**:
- Total/active/completed/blocked projects, active workflow runs, running agents, tasks, errors, approvals.
- Active Projects with progress/current stages/agents and direct navigation.
- Action Required (failed agents, stalled projects, blocked stages, approvals).
- Unique Agent overview, not duplicated by run.

**Agent Intelligence**:
- Total runtime, active wall-clock time (union of overlapping runs), run count, success/failure, average/p95 duration, retries, completed/accepted tasks, task throughput.
- Tokens/model/provider/cost **only where reliable usage is recorded**; distinguish subscription-backed Codex usage from API-billed cost.
- Sortable leaderboard, execution timeline, heatmap, error breakdown, drill-down into run logs.
- Do **not** equate most runtime with best performance. Comparisons across different roles need context; AI quality needs acceptance, review or test evidence.

**Project Intelligence**:
- Portfolio statistics, run/stage progress, active agents, total elapsed vs aggregate runtime, stage duration and waiting time, blocked stages, bottlenecks, run history.
- Per-project Gantt/timeline based on actual timestamps, including parallel branches and click-through to logs.
- Do not call a project 'running' merely because one Issue has status In Progress without an actual run.

Use existing React/TypeScript UI, reuse current component/design system, and selectively borrow visual patterns from mature OSS dashboards. **Do not install full Trigger.dev, Langfuse or n8n as another orchestrator merely for visuals.**

Potential design references to review as needed (check licenses/versions):
- https://github.com/shadcn-ui/ui
- https://github.com/satnaing/shadcn-admin
- https://github.com/tremorlabs/tremor
- https://github.com/triggerdotdev/trigger.dev
- https://github.com/langfuse/langfuse
- https://github.com/langwatch/langwatch
- https://github.com/recharts/recharts
- https://github.com/apache/echarts

---

## 5. Live monitoring and observability contract

The **existing React Flow Designer graph** must also power a **read-only Live Monitor** in the Project.

- Display **whole workflow**, with fit-all, minimap, fullscreen, auto-follow toggle, compact layout.
- **Running node**: subtle glow/pulse and live indicator only for verified active execution.
- **Done**: completed when completion policy is satisfied.
- **Blocked**: show unmet upstream conditions.
- **Failed/Waiting Approval/Queued**: explicit distinct states.
- **Active edge animations**: visual hint backed by actual eligible/handoff state, not proof of success.
- Clicking a node shows its **stage**, assigned agent(s), **all related tasks**, agent runs, timestamps, latest events, logs, error information and real artifacts.
- **Task Live Logs** and **Stage Live Monitor** are different views on the same underlying execution data.
- Stream from existing event infrastructure if available; otherwise use sensible polling, deduplication, reconnection and cursor/snapshot refresh. Avoid frequent full-graph rerenders.
- Never fabricate tool calls, completion percentages, files, logs, costs, or model chain-of-thought.
- Redact access tokens, API keys and credentials from logs.
- A node with several required tasks must not be marked Done after only one finishes.

---

## 6. Technical stack and repository context

> **Historical information reported in this conversation; re-check before any action.** Paths and deployment state may have changed.

- Paperclip runtime version reported: **`2026.1023.0`** at pinned upstream commit **`1b4c803816e82b0265c8422e1a804327a7ed8c54`**.
- The existing stable Docker image was initially an npm-installed Paperclip Core package. It **does not automatically include edits made under `vendor/paperclip-core`**.
- Core customization branch/source reported under **`vendor/paperclip-core`** (e.g., `ui/src/components/IssuesList.tsx`, `IssueRow.tsx`, `AiTaskDetailDrawer.tsx`).
- Existing Workflow Studio plugin reported under **`packages/paperclip-workflow-studio`**, distributed as plugin UI code.
- Related infrastructure historically included Paperclip, Paperclip adapter, FastAPI Core and PostgreSQL via Docker Compose.
- A previous deployment report stated frontend Vite assets were **manually copied into the running Paperclip container**. Such changes may be lost after recreation; this is **not a durable image deployment**. A later screenshot still showed the old Tasks interface despite an HTTP 200 and bundle string checks. Treat UI deployment as **not verified** until browser DOM and visible behavior are checked.
- A full Paperclip Core Docker fork image build was interrupted by Docker BuildKit/storage/low disk. A source workspace was also reported missing after moving to drive J:. Later messages reported some source restored; **verify actual paths, Git state and build context**.
- The user has relocated or intends to relocate source/build storage to drive **J:**; Docker Desktop's **disk image location** may still be on C:. Verify before a heavy rebuild.
- Historical snapshot from agent audit: **1 company, 21 issues (`AIS-1`–`AIS-21`), one known project**, `AIS-2`–`AIS-20` associated with it and **`AIS-21` unassigned (`projectId: null`)**; no existing `parentId`. These are **not permanent truths**; query the current database. Never silently assign or delete `AIS-21`.
- Historical UI problem: `Today/Yesterday` Tasks display with issue title/ID only, absence of project grouping, Agent, runtime status and logs.
- Historical workflow problems: some nodes labelled `visual-only`, workflow running with `0/9` stages complete, and project requirements appearing among Issues. Verify real mapping and execution semantics.
- Historical reports of tests (e.g., 42 passed, other suites passed), health checks or a Vite bundle build **are not sufficient evidence of end-to-end deployment**.

### Files and runtime diagnostics

Before implementation, establish from the **current checkout**:

```text
- pwd / actual workspace root / Git status and commits
- compose.yaml or docker-compose.yml actually in use
- build context and Dockerfile
- currently running image IDs and container health
- Paperclip server UI static asset path and asset hash
- real mounted volumes and verified backups
- plugin registrations and routes
- current Projects, Issues, Agents, Workflow Definitions/Runs
- frontend router/component actually mounted at /issues and Project routes
```

A `grep` hit in an asset bundle, HTTP 200 from plugin JS or successful `vite build` **does not establish that a specific UI appears in the browser**.

---

## 7. Safe engineering and deployment rules

1. **Audit first, implement second.** Inspect real APIs/schema/components, not assumed names.
2. **Preserve user data:** do not reset PostgreSQL, delete issues, mutate `parentId`, reassign project IDs, drop Docker volumes or overwrite backups.
3. **Preserve working services** and enable rollback. Verify backups before any risky replacement/migration.
4. **No surprise usage charges:** do not start eight real agents or trigger subscriptions/API calls in tests without approval. Use mocked adapters for tests only.
5. **No duplicate React Flow**, Paperclip service, scheduler or orchestration engine.
6. **Separate UI changes from runtime changes.** The legacy npm image may need a new image or a properly managed asset deployment to show Core UI changes.
7. **Do not call a feature complete because code compiles.** Verify runtime image, HTTP asset hash, DOM/UI and relevant end-to-end behavior.
8. Do not assert realtime/tool-level logging if a harness does not provide observable events.
9. Changes to active run logic must be backwards compatible with already stored run/task data.
10. Prefer incremental, scoped builds/tests and cached layers; avoid repeated large Rust native-runner builds for UI-only changes when an alternative is supported.
11. Never run unsafe cleanup commands (e.g. `docker compose down -v`, volume pruning) in an attempt to fix disk pressure.
12. Source location/path and Docker storage location are different. Verify after drive moves.
13. Make all mutating operations permission-aware and idempotent as applicable.
14. Report limitations explicitly instead of creating a decorative or fake success state.

---

## 8. Acceptance scenarios (must be demonstrated with actual data)

### Scenario A — From requirement to work

1. PO creates a Project with a requirement.
2. PO selects a Published Workflow and clicks Run.
3. PM stage begins when permitted.
4. PM analyzes requirement and generates task plan; concrete tasks are stored as real Paperclip Issues with correct mappings.
5. Tasks appear in **Project → Tasks** and Global Tasks, not an automatically created fake hierarchy.
6. Requirement remains visible under Project Overview and is not confused with execution tasks.

### Scenario B — Workflow execution order

Given `PM → Architect → (UI/UX ∥ Backend) → Review → QA → DevOps`:

- Architect cannot execute stage work before PM's required completion.
- UI/UX and Backend may execute after Architect, concurrently within policy.
- Review cannot execute until all mandatory predecessors finish.
- DevOps cannot proceed before required QA/approval.
- Clicking Start All does not bypass workflow eligibility.
- Backend rejects direct unauthorized attempts to bypass these gates, not merely hides controls in the UI.

### Scenario C — Live observability

- Project detail immediately shows run status, current stage(s), active agents and meaningful progress.
- Live React Flow graph shows a running node and real linked Issue(s).
- Click stage → task(s) → agent run → live/historical logs.
- Paused/disconnected monitoring indicates stale data instead of claiming live updates.
- Finished/history view uses the same pinned run snapshot and stored events.

### Scenario D — Task UI verified, not just built

- Open actual `/issues` in the served app.
- KPI, Project grouping, Agent/status/execution/dependency columns appear.
- `Today/Yesterday` is not the default.
- Open a Task Drawer; logs work or a truthful empty state appears.
- Check browser console, routes, asset hashes, API requests and screenshots.
- Verify these survive a controlled container restart/recreate when deployed via durable image/mount.

### Scenario E — Analytics grounded in evidence

- Agent rankings use actual completed runs, durations, tasks and recorded usage.
- Compare elapsed vs aggregate runtime correctly with concurrent agents.
- Project progress is derived from required workflow stages and real completion evidence.
- Unknown/unsupported costs and AI quality are shown as **N/A / insufficient evidence**, not as fabricated 0 or an ungrounded score.

---

## 9. Implementation priority and handoff notes

**Priority 0 — Restore/verify current workspace and runtime.** Confirm source, Docker files, databases, backups, image and plugin. The running production-like system may still serve old Tasks assets.

**Priority 1 — Ensure correct business model.** Project requirement separated from executable tasks; AI PM dynamic planning; stage-to-issues mapping; workflow execution gates; no fake fixed task creation.

**Priority 2 — Make existing UI real and visible.** Tasks table with actual data, Project overview and embedded read-only Live Workflow Monitor; fix route/mount/bundle discrepancies.

**Priority 3 — Improve observability.** Stage inspector, per-issue/agent runs/logs, realtime, approvals/failure handling and run history.

**Priority 4 — Company intelligence dashboard.** Agent runtime/throughput/reliability, project portfolio/stage timelines, drill-down and quality attribution with documented formulas.

**Priority 5 — UX polish.** Responsive layouts, accessibility, fit-view, status animations, rich filtering and efficient charting.

### Expected engineering report after each task

- What was **actually observed** in repository and runtime.
- What code changed and why.
- Database/API migrations or contracts affected.
- What was **tested** (with commands/results).
- What was **visibly verified in the running app**.
- Whether the deployed image/asset is durable.
- What remains incomplete or uncertain.
- Rollback instructions when deployment was performed.

---

## 10. Quick instruction for any coding agent

> **Before acting:** Read this file, inspect the current repository and reconcile differences. Follow user-confirmed scope rather than older proposals for Task hierarchy. The objective is **PO requirement → Published Workflow → AI PM creates real tasks → agents execute in graph order → live project monitoring → deliverables and PO approval**. Do not build UI-only mock behavior, do not claim unverified deployments, and do not put source/data at risk.
