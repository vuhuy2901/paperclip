# Real task executor

`TaskExecutor` is the bridge from a role task to a real Codex CLI session in an assigned worktree. The runner must report completion, an in-scope file must actually change, and `WorkspaceManager.commit` stages only the explicit file scope before returning the resulting SHA. A model response without a file change cannot pass as a developer handoff.
