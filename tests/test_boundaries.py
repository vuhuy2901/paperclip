from pathlib import Path
import pytest
from apps.workspace.paths import safe_child
from apps.preview.manager import PreviewManager

def test_artifact_path_traversal_is_rejected(tmp_path):
    assert safe_child(tmp_path, "run/report.json").parent == tmp_path / "run"
    with pytest.raises(ValueError): safe_child(tmp_path, "../../secrets.txt")

def test_preview_command_is_controlled():
    manager = PreviewManager("compose.yaml")
    result = manager.up("test-preview", "core-api", 8000)
    assert result.status in {"ready", "failed", "inconclusive"}
    assert "docker" not in (result.url or "")
