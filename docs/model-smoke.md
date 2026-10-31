# Model smoke evidence

On 2026-11-01, the installed Codex CLI was invoked through `CodexCliRunner` with `sandbox=read-only` and a no-file-change JSON response prompt. The subprocess exited successfully with `completed` and returned 4 JSONL events. This proves the wrapper and account access work for a read-only smoke call; it is not evidence of a completed product change run or of a chosen production model ID.

A subsequent write-path smoke used `TaskExecutor` in `data/worktrees/model-smoke` with an explicit `model_smoke.txt` file scope. Codex created exactly that file and the executor committed it as `9348c332f30f5abb1c96cae6a51f104c7d9a5f28`; the main branch was not changed by that task.
