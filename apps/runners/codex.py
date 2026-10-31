from __future__ import annotations
import json
import subprocess
from dataclasses import dataclass
from pathlib import Path

@dataclass
class CodexResult:
    status: str
    summary: str
    events: list[dict]
    failure_category: str | None = None

class CodexCliRunner:
    name = "codex-cli"

    def __init__(self, executable: str = "codex", timeout_seconds: int = 900, sandbox: str = "workspace-write"):
        self.executable, self.timeout_seconds, self.sandbox = executable, timeout_seconds, sandbox

    def run(self, prompt: str, cwd: str | Path, model: str | None = None) -> CodexResult:
        command = [self.executable, "exec", "--json", "--ephemeral", "--sandbox", self.sandbox, "-C", str(Path(cwd).resolve())]
        if model: command.extend(["--model", model])
        command.append(prompt)
        try:
            completed = subprocess.run(command, cwd=cwd, text=True, capture_output=True, timeout=self.timeout_seconds)
        except FileNotFoundError:
            return CodexResult("failed", "Codex CLI not found", [], "missing_tool")
        except subprocess.TimeoutExpired as exc:
            return CodexResult("inconclusive", "Codex CLI timed out", [], "timeout")
        events = []
        for line in completed.stdout.splitlines():
            try: events.append(json.loads(line))
            except json.JSONDecodeError: continue
        if completed.returncode != 0:
            return CodexResult("failed", completed.stderr[-2000:] or "Codex CLI failed", events, "subprocess")
        return CodexResult("completed", "Codex CLI completed", events)
