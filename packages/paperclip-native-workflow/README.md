# Native Workflow Designer

The Workflows landing page lists saved templates. Opening a template navigates to
`/:companyPrefix/workflow-designer?workflow=:templateId`, with an agent library,
React Flow canvas and step inspector. Browser Back and the All workflows button
return to the list. Search, status filters and grid/list layouts come from the
original Workflow Studio presentation in commits `953d6d5` and `8666133`.

The original list component and stylesheet are recovered by
`node recover-designer-ui.mjs`. Their presentation is adapted to native template
actions in `src/ui/designer.tsx`. The old execution engine is not imported.

Task and approval steps become native Paperclip issues. Start, end, parallel and
join nodes describe graph structure; the provisioning compiler resolves their
paths into `blockedByIssueIds`. It orders provisioning by graph dependencies,
independently of node positions. Native Paperclip handles execution.

The canonical software delivery workflow uses this dependency graph:

`PO requirements → PM plan → Solution Architecture + Product/UI Design`

The Solution Architect owns technical architecture and the complete UI/product
design specification. Backend and Frontend wait for that combined handoff and
then run in parallel before joining for Code Review, QA,
Deployment and PO Acceptance. The graph compiler enforces these joins with
native blocker relationships when the template is applied to a project.

Every created issue also carries an execution contract: the assignee must wait
until Paperclip marks the issue actionable, must preserve blockers and ownership,
and must attach acceptance/output evidence before completing the step. Role
prompts repeat this contract for PO, PM, Architect, Backend, Frontend,
Code Review, QA and DevOps. Paperclip remains the enforcement point for checkout,
dependency resolution and wakeups.

Drafts may contain unfinished or unavailable agent assignments. Publishing
requires all task and approval steps to use current agents. Archiving hides a
template from the active list while retaining its state and recovery snapshots.

## Recovery

`restore-legacy-templates.mjs` reads the existing Paperclip SQL backups inside
the container. It reports missing historical workflows by default. Pass
`--apply` to append those workflows as drafts, preserving their IDs and graph.
It never overwrites an existing template. It saves full legacy snapshots in the
plugin's scoped state and in the persistent instance `data/recovery` directory.
It does not change existing tasks, assignees or runs. Repeating recovery creates
no additional templates.

## Verification

```sh
npm ci
npm run typecheck
npm test
npm run build
```

Graph tests verify parallel joins, approval tasks, dependency order and invalid
graphs. UI checks should cover list → designer → step details → list, direct
detail links, status/search filters, draft saves and agent drag and drop.
