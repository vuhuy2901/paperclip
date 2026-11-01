# Operations

The API is stateless apart from the database and artifact volume. `worker` claims queued runs and records ordered events. Cancellation uses guarded transitions, a run-status monitor, and runner/gateway process termination; the run keeps its collected evidence and releases its lease. Back up the PostgreSQL metadata, `data/artifacts`, and managed repository/worktree volume together.

Compose runs Core/Worker on PostgreSQL and the local deterministic runner by default. `codex-gateway` is the supported Windows development path for a host-authenticated Codex CLI; it is token-protected and maps only the workspace root. Paperclip remains authenticated/private, while the review UI uses the Core service token in this development deployment. A production deployment still needs a real secret manager, board/PO session, task-container hardening, resource limits, backup restore drills, and a configured model budget.
