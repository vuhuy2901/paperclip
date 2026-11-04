from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path


@dataclass
class OllamaResult:
    status: str
    summary: str
    events: list[dict]
    failure_category: str | None = None


class OllamaRunner:
    """Run a task through Ollama's native chat API without a host gateway."""

    name = "ollama"

    def __init__(self, timeout_seconds: int = 900, url: str | None = None, model: str | None = None):
        self.timeout_seconds = timeout_seconds
        self.url = (url or os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")).rstrip("/")
        self.model = model or os.getenv("OLLAMA_MODEL", "llama3.2:3b")

    def run(self, prompt: str, cwd: str | Path, model: str | None = None) -> OllamaResult:
        selected_model = model or self.model
        if selected_model in {"configured-at-runtime", "runtime-configured"}:
            selected_model = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
        payload = {
            "model": selected_model,
            "stream": False,
            "messages": [{"role": "user", "content": prompt}],
            "options": {"temperature": 0.1, "num_predict": int(os.getenv("OLLAMA_NUM_PREDICT", "512"))},
        }
        request = urllib.request.Request(
            f"{self.url}/api/chat",
            data=json.dumps(payload).encode("utf-8"),
            headers={"content-type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout_seconds) as response:
                body = json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError, OSError, json.JSONDecodeError) as exc:
            return OllamaResult("failed", f"Ollama unavailable at {self.url}: {exc}", [], "ollama_connection")
        message = str((body.get("message") or {}).get("content") or "").strip()
        if not message:
            return OllamaResult("failed", "Ollama returned no assistant message", [], "ollama_empty_response")
        return OllamaResult("completed", message, [{"type": "item.completed", "item": {"type": "agent_message", "text": message}}])

    def cancel(self) -> None:
        return
