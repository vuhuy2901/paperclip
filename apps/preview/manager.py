from dataclasses import dataclass
from pathlib import Path
import subprocess

@dataclass
class PreviewResult:
    status: str
    compose_project: str
    url: str | None
    stdout: str
    stderr: str

class PreviewManager:
    """Docker control-plane boundary. No task runner receives the Docker socket."""
    def __init__(self, compose_file: str | Path): self.compose_file = str(Path(compose_file).resolve())

    def up(self, project: str, service: str, port: int) -> PreviewResult:
        command = ["docker", "compose", "-f", self.compose_file, "-p", project, "up", "-d", service]
        try:
            result = subprocess.run(command, text=True, capture_output=True, timeout=180)
        except FileNotFoundError as exc:
            return PreviewResult("inconclusive", project, None, "", str(exc))
        status = "ready" if result.returncode == 0 else "failed"
        return PreviewResult(status, project, f"http://localhost:{port}" if status == "ready" else None, result.stdout[-10000:], result.stderr[-10000:])
