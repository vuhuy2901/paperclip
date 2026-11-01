# Reliability rules

Infrastructure retries are handled by `run_with_retry` and are bounded to two retries by default with exponential backoff. Only classified transient categories are retryable. Business/code repair count remains a separate three-round workflow budget. Invalid structured output and policy errors fail immediately.

Trusted verification failures are classified into a `Finding` with file/line when available, a suggested owner, and an executable-evidence reproduction. A repair stores the failing candidate SHA as its base, records `repair.routed`, and reruns only the suggested owner task when the route is unambiguous. `scripts/demo_repair.py` provides a repeatable, explicitly labelled fail-route-pass demonstration in an isolated worktree.

The worker claims a persistent `run_leases` row with owner, heartbeat and expiry before executing a run, and releases it on completion or failure. Core rejects a second queued/active run for the same project, preventing concurrent writers. Compose uses the explicit `core-postgres` alias; preview databases are isolated and must not share that alias/network.
