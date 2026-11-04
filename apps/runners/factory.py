from .codex import CodexCliRunner
from .local import LocalDeterministicRunner
from .gateway import CodexGatewayRunner
from .ollama import OllamaRunner

SUPPORTED = {"local-deterministic", "ollama", "codex-cli", "codex-gateway"}

def build_runner(config: dict):
    runner_name = config.get("runner", "local-deterministic")
    if runner_name not in SUPPORTED: raise ValueError(f"unsupported runner: {runner_name}")
    if runner_name == "codex-cli": return CodexCliRunner(timeout_seconds=int(config.get("timeout_seconds", 900)), sandbox=str(config.get("sandbox", "workspace-write")))
    if runner_name == "codex-gateway": return CodexGatewayRunner(timeout_seconds=int(config.get("timeout_seconds", 900)), sandbox=str(config.get("sandbox", "workspace-write")), url=config.get("gateway_url"))
    if runner_name == "ollama": return OllamaRunner(timeout_seconds=int(config.get("timeout_seconds", 900)), url=config.get("ollama_base_url"), model=config.get("model"))
    return LocalDeterministicRunner()
