from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path


@dataclass
class GatewayResult:
    status: str
    summary: str
    events: list[dict]
    failure_category: str | None = None


class CodexGatewayRunner:
    """Call a host-side, authenticated Codex process from an isolated worker."""

    name = "codex-gateway"

    def __init__(self, timeout_seconds: int = 900, sandbox: str = "workspace-write", url: str | None = None):
        self.timeout_seconds = timeout_seconds
        self.sandbox = sandbox
        self.url = (url or os.getenv("CODEX_GATEWAY_URL", "http://host.docker.internal:8400")).rstrip("/")

    def run(self, prompt: str, cwd: str | Path, model: str | None = None) -> GatewayResult:
        payload = {"prompt": prompt, "cwd": str(Path(cwd).resolve()), "model": model, "sandbox": self.sandbox, "timeout_seconds": self.timeout_seconds}
        request = urllib.request.Request(
            f"{self.url}/run",
            data=json.dumps(payload).encode(),
            headers={"content-type": "application/json", "x-gateway-token": os.getenv("CODEX_GATEWAY_TOKEN", "dev-codex-gateway")},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout_seconds + 15) as response:
                body = json.loads(response.read().decode())
            return GatewayResult(body.get("status", "failed"), body.get("summary", "Codex gateway returned no summary"), body.get("events", []), body.get("failure_category"))
        except urllib.error.HTTPError as exc:
            return GatewayResult("failed", f"Codex gateway HTTP {exc.code}", [], "gateway_http")
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            return GatewayResult("inconclusive", f"Codex gateway unavailable: {exc}", [], "gateway_unavailable")
