from dataclasses import dataclass
from typing import Any

@dataclass
class RunnerResult:
    status: str
    summary: str
    structured: dict[str, Any]
    failure_category: str | None = None

class LocalDeterministicRunner:
    """Development runner; it proves the contract without pretending to be a model run."""
    name = "local-deterministic"

    def run(self, role: str, task: str) -> RunnerResult:
        return RunnerResult("completed", f"Prepared deterministic handoff for {role}", {"role": role, "task": task, "mode": "fixture"})
