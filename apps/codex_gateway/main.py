from __future__ import annotations

import json
import os
import subprocess
import threading
import time
import uuid
from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


HOST_ROOT = Path(os.getenv("CODEX_HOST_WORKSPACE_ROOT", Path.cwd())).resolve()
TOKEN = os.getenv("CODEX_GATEWAY_TOKEN", "dev-codex-gateway")
CODEX_BIN = os.getenv("CODEX_BIN", "codex")
ACTIVE: dict[str, tuple[subprocess.Popen, threading.Event]] = {}
ACTIVE_LOCK = threading.Lock()


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
            command = [CODEX_BIN, "exec", "--json", "--ephemeral", "--sandbox", sandbox, "-C", str(cwd)]
            model = payload.get("model")
            if model and str(model) not in {"configured-at-runtime", "runtime-configured"}:
                command.extend(["--model", str(model)])
            command.append(str(payload["prompt"]))
            request_id = str(payload.get("request_id") or uuid.uuid4())
            with host_git_worktree(cwd):
                process = subprocess.Popen(command, cwd=cwd, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                cancel_event = threading.Event()
                with ACTIVE_LOCK:
                    ACTIVE[request_id] = (process, cancel_event)
                timed_out = False
                deadline = time.monotonic() + int(payload.get("timeout_seconds", 900))
                while process.poll() is None:
                    if time.monotonic() >= deadline:
                        timed_out = True
                        process.terminate()
                        break
                    time.sleep(0.1)
                stdout, stderr = process.communicate()
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
