from dataclasses import dataclass
from pathlib import Path
import subprocess
import json
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

@dataclass
class PreviewResult:
    status: str
    compose_project: str
    url: str | None
    stdout: str
    stderr: str
    image_digest: str | None = None

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


class RemotePreviewManager:
    """Client for the isolated preview-manager Docker control plane."""
    def __init__(self, base_url: str, timeout: int = 210):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def up(self, project: str, service: str, port: int) -> PreviewResult:
        payload = json.dumps({"project": project, "service": service, "port": port}).encode()
        request = Request(f"{self.base_url}/previews", data=payload, headers={"content-type": "application/json"}, method="POST")
        try:
            with urlopen(request, timeout=self.timeout) as response:
                body = json.loads(response.read().decode())
            return PreviewResult(body["status"], body["compose_project"], body.get("url"), body.get("stdout", ""), body.get("stderr", ""), body.get("image_digest"))
        except (HTTPError, URLError, TimeoutError, KeyError, json.JSONDecodeError) as exc:
            return PreviewResult("inconclusive", project, None, "", str(exc))
