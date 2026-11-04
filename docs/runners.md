# Runner adapters

`LocalDeterministicRunner` is explicitly labelled fixture mode and is used for offline tests. `CodexCliRunner` wraps the installed Codex CLI through `codex exec --json --ephemeral`, captures JSONL events, applies a timeout and classifies missing-tool, timeout and subprocess failures. The sandbox policy is explicit per runner, defaulting to `workspace-write` for an assigned worktree; read-only is used for inspection smoke tests. Model IDs are passed at runtime from role configuration; they are not hardcoded in prompts.

`CodexGatewayRunner` is the development bridge for a worker container that cannot directly access the host's logged-in Codex CLI. It calls the token-protected host gateway at `CODEX_GATEWAY_URL`; the gateway maps only the shared workspace root, validates sandbox/timeout, runs the real `codex exec`, and returns structured JSONL events. It is opt-in via `DEFAULT_RUNNER=codex-gateway`; no silent fallback to deterministic fixture occurs.

Only `local-deterministic`, `codex-cli` and `codex-gateway` are installed in this build. Core rejects `xera`, `reviewer` and `devops` runner names until a real wrapper is installed; it never stores an unsupported runner and silently executes a fixture instead.

The Paperclip package under `apps/paperclip-adapter` follows the official external-adapter shape, is built into the Paperclip image, and is registered at runtime as `ai_company_external`. Execution is scoped to a native Paperclip issue; task creation, assignment, dependencies, wakeups, heartbeats, and activity remain in Paperclip. The Compose deployment creates a real local Paperclip server and the company identities. The environment probe verifies the configured model gateway before an agent checks out a task.
