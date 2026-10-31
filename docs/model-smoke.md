# Model smoke evidence

On 2026-11-01, the installed Codex CLI was invoked through `CodexCliRunner` with `sandbox=read-only` and a no-file-change JSON response prompt. The subprocess exited successfully with `completed` and returned 4 JSONL events. This proves the wrapper and account access work for a read-only smoke call; it is not evidence of a completed product change run or of a chosen production model ID.
