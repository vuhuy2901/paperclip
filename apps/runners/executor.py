from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
from .codex import CodexCliRunner
from apps.workspace.git import WorkspaceManager

@dataclass
class ExecutionHandoff:
    status: str
    agent_run_id: str
    result_commit: str | None
    files_changed: list[str]
    runner_summary: str
    failure_category: str | None = None

class TaskExecutor:
    def __init__(self, runner: CodexCliRunner, workspace: WorkspaceManager): self.runner, self.workspace = runner, workspace

    def execute(self, task_id: str, prompt: str, worktree: str | Path, file_scope: list[str], commit_message: str) -> ExecutionHandoff:
        result = self.runner.run(prompt, worktree)
        if result.status != "completed": return ExecutionHandoff(result.status, task_id, None, [], result.summary, result.failure_category)
        status = __import__("subprocess").run(["git", "status", "--porcelain", "--", *file_scope], cwd=worktree, text=True, capture_output=True).stdout
        changed = [line[3:] for line in status.splitlines() if len(line) > 3]
        if not changed: return ExecutionHandoff("failed", task_id, None, [], "runner completed without an in-scope file change", "no_change")
        commit = self.workspace.commit(worktree, commit_message, file_scope)
        return ExecutionHandoff("completed", task_id, commit, changed, result.summary)
