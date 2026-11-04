# Runner adapters

`LocalDeterministicRunner` is explicitly labelled fixture mode and is used for offline tests. `CodexCliRunner` wraps the installed Codex CLI through `codex exec --json --ephemeral`, captures JSONL events, applies a timeout and classifies missing-tool, timeout and subprocess failures. The sandbox policy is explicit per runner, defaulting to `workspace-write` for an assigned worktree; read-only is used for inspection smoke tests. Model IDs are passed at runtime from role configuration; they are not hardcoded in prompts.

`OllamaRunner` calls Ollama's native `/api/chat` endpoint directly. The default stack uses `OLLAMA_BASE_URL=http://ollama:11434` and `OLLAMA_MODEL=llama3.2:3b`; it no longer depends on a host gateway or `host.docker.internal`.

Supported runners are `local-deterministic`, `ollama`, `codex-cli` and the legacy `codex-gateway`. New deployments should use `ollama`; unsupported names are rejected and never silently mapped to a fixture.

The Paperclip package under `apps/paperclip-adapter` follows the official external-adapter shape, is built into the Paperclip image, and is registered at runtime as `ai_company_external`. Execution is scoped to a native Paperclip issue; task creation, assignment, dependencies, wakeups, heartbeats, and activity remain in Paperclip. The Compose deployment creates a real local Paperclip server and the company identities. The environment probe verifies Ollama directly before an agent checks out a task.
