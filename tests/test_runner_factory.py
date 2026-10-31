import pytest
from apps.runners.factory import build_runner
from apps.runners.codex import CodexCliRunner
from apps.runners.local import LocalDeterministicRunner

def test_role_runner_factory_uses_configured_runner():
    assert isinstance(build_runner({"runner":"local-deterministic"}), LocalDeterministicRunner)
    assert isinstance(build_runner({"runner":"codex-cli", "timeout_seconds":10, "sandbox":"read-only"}), CodexCliRunner)

def test_unknown_runner_is_not_silently_downgraded():
    with pytest.raises(ValueError): build_runner({"runner":"made-up"})
