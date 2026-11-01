from __future__ import annotations
import json
import subprocess
import threading
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
        self._process: subprocess.Popen | None = None
        self._cancel_requested = False

    def run(self, prompt: str, cwd: str | Path, model: str | None = None) -> CodexResult:
        command = [self.executable, "exec", "--json", "--ephemeral"]
        if self.sandbox == "workspace-write":
            command.append("--approve-for-me")
        else:
            command.extend(["--sandbox", self.sandbox])
        command.extend(["-C", str(Path(cwd).resolve())])
        if model: command.extend(["--model", model])
        command.append(prompt)
        try:
            self._cancel_requested = False
            self._process = subprocess.Popen(command, cwd=cwd, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            try:
                stdout, stderr = self._process.communicate(timeout=self.timeout_seconds)
                completed = type("Completed", (), {"stdout": stdout, "stderr": stderr, "returncode": self._process.returncode})()
            except subprocess.TimeoutExpired:
                self._process.terminate()
                self._process.communicate()
                return CodexResult("inconclusive", "Codex CLI timed out", [], "timeout")
            finally:
                self._process = None
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

    def cancel(self) -> None:
        self._cancel_requested = True
        if self._process and self._process.poll() is None:
            self._process.terminate()
