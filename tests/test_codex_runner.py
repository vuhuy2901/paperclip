from apps.runners.codex import CodexCliRunner

def test_codex_runner_has_structured_contract():
    runner = CodexCliRunner(timeout_seconds=3)
    assert runner.name == "codex-cli"
    assert runner.timeout_seconds == 3
