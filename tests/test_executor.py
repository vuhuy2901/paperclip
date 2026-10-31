from pathlib import Path
import subprocess
from apps.workspace.git import WorkspaceManager

def test_workspace_commit_requires_explicit_scope(tmp_path):
    subprocess.run(["git", "init"], cwd=tmp_path, check=True, capture_output=True)
    (tmp_path / "README.md").write_text("base", encoding="utf-8")
    subprocess.run(["git", "add", "README.md"], cwd=tmp_path, check=True, capture_output=True)
    subprocess.run(["git", "-c", "user.email=test@example.test", "-c", "user.name=Test", "commit", "-m", "base"], cwd=tmp_path, check=True, capture_output=True)
    (tmp_path / "change.txt").write_text("change", encoding="utf-8")
    manager = WorkspaceManager(tmp_path)
    try: manager.commit(tmp_path, "change", [])
    except ValueError as exc: assert "explicit file scope" in str(exc)
    else: raise AssertionError("missing scope was accepted")
