# Known limitations

- The current real-model evidence uses Codex Gateway for Backend and deterministic, explicitly labelled fixture output for the other seven roles. The role contracts and artifacts exist for all eight, but a run with eight independent model executions has not been claimed.
- The Paperclip adapter performs authenticated Core wake-up and returns stable run/artifact/evidence/preview/diff links. Full bidirectional synchronization of every Core task/report into native Paperclip issues still needs a configured Paperclip board or agent API key.
- Cost and token usage are `unknown` unless the selected runner emits a supported usage payload. No price is inferred from wall time.
- Preview promotion is local Compose promotion, not production deployment. Database snapshots and schema rollback automation are not production-safe.
- Each repo-backed run now provisions a baseline preview and a candidate preview in separate worktrees, Compose projects and PostgreSQL volumes. Cleanup/retention is still an operational concern; the current demo keeps the preview projects available for PO inspection.
- The repair demo uses a clearly labelled injected defect in an isolated worktree. It proves executable failure, routing and repair mechanics without claiming that the model caused the defect.
