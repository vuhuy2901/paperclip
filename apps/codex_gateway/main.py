from __future__ import annotations

import json
import os
import shutil
import subprocess
import threading
import time
import uuid
from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib import error as urlerror
from urllib import request as urlrequest


HOST_ROOT = Path(os.getenv("CODEX_HOST_WORKSPACE_ROOT", Path.cwd())).resolve()
TOKEN = os.getenv("CODEX_GATEWAY_TOKEN", "dev-codex-gateway")
CODEX_BIN = os.getenv("CODEX_BIN") or shutil.which("codex") or "codex"
ACTIVE: dict[str, tuple[subprocess.Popen, threading.Event]] = {}
ACTIVE_LOCK = threading.Lock()


def run_ollama(payload: dict) -> dict:
    """Use Ollama's native HTTP API; it is not a Codex-compatible endpoint."""
    base_url = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
    model = str(payload.get("model") or os.getenv("OLLAMA_MODEL", "qwen2.5-coder:3b"))
    if model in {"configured-at-runtime", "runtime-configured"}:
        model = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:3b")
    request_id = str(payload.get("request_id") or uuid.uuid4())
    body = json.dumps({
        "model": model,
        "stream": False,
        "messages": [{"role": "user", "content": str(payload["prompt"])}],
        # Native task delegation is intentionally short-form. A bounded local
        # response prevents a small Ollama model from monopolising the gateway
        # while Paperclip waits for a completion contract.
        "options": {"temperature": 0.1, "num_predict": int(os.getenv("OLLAMA_NUM_PREDICT", "512"))},
    }).encode("utf-8")
    request = urlrequest.Request(
        f"{base_url}/api/chat",
        data=body,
        headers={"content-type": "application/json"},
        method="POST",
    )
    timeout = max(1, int(payload.get("timeout_seconds", 900)))
    try:
        with urlrequest.urlopen(request, timeout=timeout) as response:
            raw = json.loads(response.read().decode("utf-8"))
    except (urlerror.URLError, TimeoutError, OSError) as exc:
        return {
            "status": "failed",
            "summary": f"Ollama request failed: {exc}",
            "events": [],
            "failure_category": "ollama_connection",
            "request_id": request_id,
        }
    message = str((raw.get("message") or {}).get("content") or "").strip()
    if not message:
        return {
            "status": "failed",
            "summary": "Ollama returned no assistant message",
            "events": [],
            "failure_category": "ollama_empty_response",
            "request_id": request_id,
        }
    return {
        "status": "completed",
        "summary": "Ollama completed through host gateway",
        "events": [{"type": "item.completed", "item": {"type": "agent_message", "text": message}}],
        "request_id": request_id,
        "model": model,
    }


def map_path(raw: str) -> Path:
    candidate = Path(raw)
    # The worker uses /workspace while the host sees the same bind mount under HOST_ROOT.
    if candidate.is_absolute() and candidate.parts and candidate.parts[0] == "\\":
        candidate = Path(*candidate.parts[1:])
    normalized = candidate.as_posix()
    if normalized == "/workspace" or normalized.startswith("/workspace/"):
        candidate = HOST_ROOT.joinpath(*Path(normalized).parts[2:])
    elif not candidate.is_absolute():
        candidate = HOST_ROOT / candidate
    candidate = candidate.resolve()
    try:
        candidate.relative_to(HOST_ROOT)
    except ValueError as exc:
        raise ValueError("cwd must stay inside CODEX_HOST_WORKSPACE_ROOT") from exc
    if not candidate.is_dir():
        raise ValueError("cwd does not exist")
    return candidate


@contextmanager
def host_git_worktree(cwd: Path):
    """Make a worktree created by the Linux worker understandable to Windows git/Codex."""
    marker = cwd / ".git"
    original = marker.read_text(encoding="utf-8") if marker.is_file() else None
    if original and original.startswith("gitdir:"):
        raw_gitdir = original.split(":", 1)[1].strip().replace("\\", "/")
        if raw_gitdir.startswith("/workspace/"):
            relative = Path(raw_gitdir.removeprefix("/workspace/")).as_posix()
            marker.write_text(f"gitdir: {(HOST_ROOT / relative).resolve()}\n", encoding="utf-8")
    try:
        yield
    finally:
        if original is not None:
            marker.write_text(original, encoding="utf-8")


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt: str, *args):
        return

    def send_json(self, status: int, body: dict):
        encoded = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def do_GET(self):
        if self.path == "/health":
            self.send_json(200, {"status": "ok", "gateway": "codex"})
        else:
            self.send_json(404, {"error": "not found"})

    def do_POST(self):
        if self.path not in {"/run", "/cancel"}:
            self.send_json(404, {"error": "not found"})
            return
        if self.headers.get("x-gateway-token") != TOKEN:
            self.send_json(401, {"error": "invalid gateway token"})
            return
        try:
            payload = json.loads(self.rfile.read(int(self.headers.get("content-length", "0"))))
            if self.path == "/cancel":
                request_id = str(payload["request_id"])
                with ACTIVE_LOCK:
                    active = ACTIVE.get(request_id)
                if not active:
                    self.send_json(200, {"status": "not_found", "request_id": request_id})
                    return
                process, cancel_event = active
                cancel_event.set()
                if process.poll() is None:
                    process.terminate()
                self.send_json(202, {"status": "cancelling", "request_id": request_id})
                return
            cwd = map_path(str(payload["cwd"]))
            sandbox = str(payload.get("sandbox", "read-only"))
            if sandbox not in {"read-only", "workspace-write"}:
                raise ValueError("unsupported sandbox")
            command = [CODEX_BIN, "exec", "--json", "--ephemeral", "--ignore-user-config"]
            provider = str(payload.get("provider") or os.getenv("CODEX_GATEWAY_PROVIDER", "ollama")).lower()
            if provider == "ollama":
                self.send_json(200, run_ollama(payload))
                return
            elif provider != "openai":
                raise ValueError(f"unsupported provider: {provider}")
            if sandbox == "workspace-write":
                # Current Codex CLI forbids combining --approve-for-me with
                # --sandbox; the approval flag itself selects workspace-write.
                command.append("--approve-for-me")
            else:
                command.extend(["--sandbox", sandbox])
            command.extend(["-C", str(cwd)])
            reasoning_effort = payload.get("reasoning_effort") or os.getenv("CODEX_REASONING_EFFORT", "low")
            if reasoning_effort:
                command.extend(["-c", f"model_reasoning_effort={reasoning_effort}"])
            model = payload.get("model") or (os.getenv("OLLAMA_MODEL", "llama3.2:3b") if provider == "ollama" else None)
            if model and str(model) not in {"configured-at-runtime", "runtime-configured"}:
                command.extend(["--model", str(model)])
            # On Windows, codex.cmd loses lines after the first when a
            # multiline prompt is passed as a command-line argument. Codex
            # reads the complete prompt from stdin when the argument is `-`.
            command.append("-")
            request_id = str(payload.get("request_id") or uuid.uuid4())
            with host_git_worktree(cwd):
                process = subprocess.Popen(
                    command,
                    cwd=cwd,
                    text=True,
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    encoding="utf-8",
                )
                cancel_event = threading.Event()
                with ACTIVE_LOCK:
                    ACTIVE[request_id] = (process, cancel_event)
                timed_out = False
                try:
                    # Drain both pipes while Codex runs. Waiting on poll() first
                    # deadlocks when a task emits more than the OS pipe buffer.
                    stdout, stderr = process.communicate(input=str(payload["prompt"]), timeout=int(payload.get("timeout_seconds", 900)))
                except subprocess.TimeoutExpired:
                    timed_out = True
                    process.terminate()
                    try:
                        stdout, stderr = process.communicate(timeout=5)
                    except subprocess.TimeoutExpired:
                        process.kill()
                        stdout, stderr = process.communicate()
                finally:
                    with ACTIVE_LOCK:
                        ACTIVE.pop(request_id, None)
            if cancel_event.is_set():
                self.send_json(200, {"status": "cancelled", "summary": "Codex CLI cancelled through host gateway", "events": [], "failure_category": "cancelled", "request_id": request_id})
                return
            if timed_out:
                self.send_json(200, {"status": "inconclusive", "summary": "Codex CLI timed out", "events": [], "failure_category": "timeout", "request_id": request_id})
                return
            completed = type("Completed", (), {"stdout": stdout, "stderr": stderr, "returncode": process.returncode})()
            events = []
            for line in completed.stdout.splitlines():
                try:
                    events.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
            if completed.returncode:
                self.send_json(200, {"status": "failed", "summary": completed.stderr[-2000:] or "Codex CLI failed", "events": events, "failure_category": "subprocess", "request_id": request_id})
            else:
                self.send_json(200, {"status": "completed", "summary": "Codex CLI completed through host gateway", "events": events, "request_id": request_id})
        except FileNotFoundError:
            self.send_json(200, {"status": "failed", "summary": "Codex CLI not found on gateway host", "events": [], "failure_category": "missing_tool", "request_id": request_id})
        except (KeyError, ValueError, json.JSONDecodeError) as exc:
            self.send_json(400, {"error": str(exc)})


def main():
    host = os.getenv("CODEX_GATEWAY_BIND", "0.0.0.0")
    port = int(os.getenv("CODEX_GATEWAY_PORT", "8400"))
    ThreadingHTTPServer((host, port), Handler).serve_forever()


if __name__ == "__main__":
    main()
