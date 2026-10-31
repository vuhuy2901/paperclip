# Runner adapters

`LocalDeterministicRunner` is explicitly labelled fixture mode and is used for offline tests. `CodexCliRunner` wraps the installed Codex CLI through `codex exec --json --ephemeral`, captures JSONL events, applies a timeout and classifies missing-tool, timeout and subprocess failures. Model IDs are passed at runtime from role configuration; they are not hardcoded in prompts.
