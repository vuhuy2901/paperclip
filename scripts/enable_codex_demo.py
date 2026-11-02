"""Start the host Codex gateway and configure all Core roles for real execution.

Uses the existing Codex CLI ChatGPT login. No API key is copied or persisted.
Run after `docker compose up -d --build` on the Windows host.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from pathlib import Path
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
CORE = os.getenv("CORE_PUBLIC_URL", "http://localhost:8001").rstrip("/")
GATEWAY = "http://localhost:8400"
CODEX_MODEL = os.getenv("CODEX_MODEL", "gpt-5.6-luna")
SCOPES = {
    "project-manager": [".ai-company/handoffs/project-manager"],
    "architect": [".ai-company/handoffs/architect"],
    "ui-ux-designer": [".ai-company/handoffs/ui-ux-designer", "apps/review-ui"],
    "backend-developer": [".ai-company/handoffs/backend-developer", "templates/storefront/backend/main.py"],
    "frontend-developer": [".ai-company/handoffs/frontend-developer", "templates/storefront/frontend"],
    "code-reviewer": [".ai-company/handoffs/code-reviewer"],
    "tester": [".ai-company/handoffs/tester", "tests"],
    "devops": [".ai-company/handoffs/devops", "compose.yaml", "infra"],
}


def api(path: str, method: str = "GET", payload: dict | None = None):
    data = json.dumps(payload).encode() if payload is not None else None
    request = Request(
        f"{CORE}{path}", data=data, method=method,
        headers={"content-type": "application/json", "x-service-token": os.getenv("SERVICE_TOKEN", "dev-service-token")},
    )
    with urlopen(request, timeout=10) as response:
        return json.load(response)


def gateway_ready() -> bool:
    try:
        with urlopen(f"{GATEWAY}/health", timeout=2) as response:
            return json.load(response).get("status") == "ok"
    except OSError:
        return False


def main() -> None:
    login = subprocess.run(["codex", "login", "status"], text=True, capture_output=True, timeout=15)
    if login.returncode != 0:
        raise SystemExit("Codex CLI is not signed in. Run `codex login` on this host first.")
    if not gateway_ready():
        env = {**os.environ, "CODEX_HOST_WORKSPACE_ROOT": str(ROOT)}
        flags = 0
        if sys.platform == "win32":
            flags = subprocess.DETACHED_PROCESS | subprocess.CREATE_NO_WINDOW
        subprocess.Popen(
            [sys.executable, "-m", "apps.codex_gateway.main"], cwd=ROOT, env=env,
            stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            creationflags=flags, start_new_session=sys.platform != "win32",
        )
        for _ in range(40):
            if gateway_ready():
                break
            time.sleep(0.25)
    if not gateway_ready():
        raise SystemExit("Codex gateway did not start at localhost:8400.")

    existing = {role["id"]: role for role in api("/api/roles")}
    if set(SCOPES) != set(existing):
        raise SystemExit("Core role list differs from this demo configuration; no roles were changed.")
    for role, scope in SCOPES.items():
        api(f"/api/roles/{role}", "PUT", {
            "runner": "codex-gateway", "model": CODEX_MODEL,
            "timeout_seconds": 900, "sandbox": "workspace-write",
            "tool_policy": ["read", "write", "git"], "file_scope": scope,
        })
    verified = api("/api/roles")
    if any(role["runner"] != "codex-gateway" or not role["file_scope"] for role in verified):
        raise SystemExit("Core role verification failed.")
    print(f"Codex gateway ready; {len(verified)} Core roles configured for real Codex execution.")


if __name__ == "__main__":
    main()
