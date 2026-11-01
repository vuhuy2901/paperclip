from pathlib import Path
import subprocess
from .paths import safe_child

class WorkspaceManager:
    def __init__(self, root: str | Path): self.root = Path(root).resolve()

    def create_worktree(self, repo: str | Path, project_id: str, run_id: str, task_id: str, base_ref: str = "HEAD") -> Path:
        target = safe_child(self.root, f"{project_id}/{run_id}/{task_id}")
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists():
            if (target / ".git").exists(): return target
            raise FileExistsError(f"worktree already exists and is not a git worktree: {target}")
        result = subprocess.run(["git", "worktree", "add", "--detach", str(target), base_ref], cwd=repo, text=True, capture_output=True, timeout=60)
        if result.returncode != 0: raise RuntimeError(result.stderr.strip() or "git worktree add failed")
        return target

    def create_candidate(self, repo: str | Path, project_id: str, run_id: str, base_ref: str = "HEAD") -> Path:
        return self.create_worktree(repo, project_id, run_id, "candidate", base_ref)

    def cherry_pick(self, worktree: str | Path, commit_sha: str) -> str:
        ancestor = subprocess.run(["git", "merge-base", "--is-ancestor", commit_sha, "HEAD"], cwd=worktree, capture_output=True)
        if ancestor.returncode == 0:
            return subprocess.run(["git", "rev-parse", "HEAD"], cwd=worktree, text=True, capture_output=True, check=True).stdout.strip()
        result = subprocess.run(["git", "-c", "user.name=AI Software Company", "-c", "user.email=ai-company@localhost", "cherry-pick", commit_sha], cwd=worktree, text=True, capture_output=True, timeout=60)
        if result.returncode != 0:
            subprocess.run(["git", "cherry-pick", "--abort"], cwd=worktree, capture_output=True, timeout=30)
            raise RuntimeError(result.stderr.strip() or "candidate cherry-pick failed")
        return subprocess.run(["git", "rev-parse", "HEAD"], cwd=worktree, text=True, capture_output=True, check=True).stdout.strip()

    def head(self, repo: str | Path) -> str:
        result = subprocess.run(["git", "rev-parse", "HEAD"], cwd=repo, text=True, capture_output=True, timeout=10)
        if result.returncode != 0: raise RuntimeError(result.stderr.strip() or "git rev-parse failed")
        return result.stdout.strip()

    def validate_artifact_path(self, relative: str) -> Path: return safe_child(self.root, relative)

    def commit(self, worktree: str | Path, message: str, allowed_paths: list[str]) -> str:
        if not allowed_paths: raise ValueError("a commit requires an explicit file scope")
        for relative in allowed_paths: safe_child(worktree, relative)
        add = subprocess.run(["git", "add", "--", *allowed_paths], cwd=worktree, text=True, capture_output=True, timeout=30)
        if add.returncode != 0: raise RuntimeError(add.stderr.strip() or "git add failed")
        commit = subprocess.run(["git", "-c", "user.name=AI Software Company", "-c", "user.email=ai-company@localhost", "commit", "-m", message], cwd=worktree, text=True, capture_output=True, timeout=60)
        if commit.returncode != 0: raise RuntimeError(commit.stderr.strip() or "git commit failed")
        sha = subprocess.run(["git", "rev-parse", "HEAD"], cwd=worktree, text=True, capture_output=True, timeout=10)
        return sha.stdout.strip()
