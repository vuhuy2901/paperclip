# Operations

The API is stateless apart from the database and artifact volume. `worker` claims queued runs and records ordered events. Cancellation uses guarded transitions and must be followed by process cleanup in the future runner layer. Back up the database and `data/artifacts` together.

The current first slice intentionally uses a local deterministic worker and SQLite development storage. Production operation requires PostgreSQL, authenticated Paperclip adapter/PO sessions, isolated task containers and trusted evidence runner.
