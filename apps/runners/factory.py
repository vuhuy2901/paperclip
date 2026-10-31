from .codex import CodexCliRunner
from .local import LocalDeterministicRunner

SUPPORTED = {"local-deterministic", "codex-cli"}

def build_runner(config: dict):
    runner_name = config.get("runner", "local-deterministic")
    if runner_name not in SUPPORTED: raise ValueError(f"unsupported runner: {runner_name}")
    if runner_name == "codex-cli": return CodexCliRunner(timeout_seconds=int(config.get("timeout_seconds", 900)), sandbox=str(config.get("sandbox", "workspace-write")))
    return LocalDeterministicRunner()
