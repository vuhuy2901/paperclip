import pytest
from apps.runners.factory import build_runner
from apps.runners.codex import CodexCliRunner
from apps.runners.gateway import CodexGatewayRunner
from apps.runners.local import LocalDeterministicRunner
from apps.worker.main import _model_artifact

def test_role_runner_factory_uses_configured_runner():
    assert isinstance(build_runner({"runner":"local-deterministic"}), LocalDeterministicRunner)
    assert isinstance(build_runner({"runner":"codex-cli", "timeout_seconds":10, "sandbox":"read-only"}), CodexCliRunner)
    assert isinstance(build_runner({"runner":"codex-gateway", "timeout_seconds":10, "sandbox":"read-only"}), CodexGatewayRunner)

def test_unknown_runner_is_not_silently_downgraded():
    with pytest.raises(ValueError): build_runner({"runner":"made-up"})


def test_real_model_artifact_reader_never_synthesizes_missing_output(tmp_path):
    role_root = tmp_path / ".ai-company" / "handoffs" / "architect"
    role_root.mkdir(parents=True)
    (role_root / "architecture.md").write_text("observed repository evidence", encoding="utf-8")
    assert _model_artifact(tmp_path, "architect", "architecture.md") == b"observed repository evidence"
    assert _model_artifact(tmp_path, "architect", "impact-map.json") is None
