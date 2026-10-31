from pathlib import Path
import subprocess
from .paths import safe_child

class WorkspaceManager:
    def __init__(self, root: str | Path): self.root = Path(root).resolve()

    def create_worktree(self, repo: str | Path, project_id: str, run_id: str, task_id: str, base_ref: str = "HEAD") -> Path:
        target = safe_child(self.root, f"{project_id}/{run_id}/{task_id}")
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists(): raise FileExistsError(f"worktree already exists: {target}")
        result = subprocess.run(["git", "worktree", "add", "--detach", str(target), base_ref], cwd=repo, text=True, capture_output=True, timeout=60)
        if result.returncode != 0: raise RuntimeError(result.stderr.strip() or "git worktree add failed")
        return target

    def validate_artifact_path(self, relative: str) -> Path: return safe_child(self.root, relative)
