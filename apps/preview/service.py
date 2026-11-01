import hashlib
import json
import os
import subprocess
import tempfile
import time
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Preview Manager", version="0.1.0")
WORKSPACE = Path(os.getenv("PREVIEW_WORKSPACE", "/workspace")).resolve()
COMPOSE_FILE = WORKSPACE / "infra" / "preview" / "compose.yaml"


class PreviewRequest(BaseModel):
    project: str = Field(pattern=r"^[a-z0-9][a-z0-9_-]{2,50}$")
    service: str = Field(default="storefront-api", pattern=r"^[a-z0-9][a-z0-9_-]{1,50}$")
    port: int = Field(default=8200, ge=1024, le=65535)
    workspace: str | None = Field(default=None, pattern=r"^[a-zA-Z0-9_./-]+$")


@app.get("/health")
def health():
    return {"status": "ok", "compose_file": str(COMPOSE_FILE), "socket_boundary": "/var/run/docker.sock"}


def _preview_port(project: str, requested: int) -> int:
    # Keep the requested port for a single preview, otherwise isolate concurrent runs.
    if requested != 8200:
        return requested
    value = int(hashlib.sha256(project.encode()).hexdigest()[:6], 16)
    return 18000 + value % 1000


@app.post("/previews")
def create_preview(body: PreviewRequest):
    selected_workspace = WORKSPACE
    if body.workspace:
        selected_workspace = (WORKSPACE / body.workspace).resolve()
        try:
            selected_workspace.relative_to(WORKSPACE)
        except ValueError:
            raise HTTPException(422, "workspace must stay inside PREVIEW_WORKSPACE")
    selected_compose = selected_workspace / "infra" / "preview" / "compose.yaml"
    if not selected_compose.is_file():
        raise HTTPException(500, "preview compose file is unavailable")
    host_port = _preview_port(body.project, body.port)
    override = {
        "services": {
            body.service: {
                "ports": [f"{host_port}:8200"],
                "build": {"context": str(selected_workspace), "dockerfile": "templates/storefront/backend/Dockerfile"},
                "environment": {"STOREFRONT_DATABASE_URL": "postgresql+psycopg://storefront:storefront@postgres:5432/storefront"},
            },
            "postgres": {
                "volumes": [],
                "environment": {"POSTGRES_USER": "storefront", "POSTGRES_PASSWORD": "storefront", "POSTGRES_DB": "storefront"},
            },
        }
    }
    with tempfile.NamedTemporaryFile("w", suffix=".yaml", dir="/tmp", delete=False) as handle:
        json.dump(override, handle)
        override_path = Path(handle.name)
    command = ["docker", "compose", "-f", str(selected_compose), "-f", str(override_path), "-p", body.project, "up", "-d", body.service]
    try:
        environment = os.environ.copy()
        environment["COMPOSE_NETWORK_NAME"] = f"{body.project}_default"
        result = subprocess.run(command, cwd=selected_workspace, env=environment, text=True, capture_output=True, timeout=180)
    except FileNotFoundError as exc:
        return {"status": "inconclusive", "compose_project": body.project, "url": None, "stdout": "", "stderr": str(exc)}
    finally:
        override_path.unlink(missing_ok=True)
    if result.returncode != 0:
        return {"status": "failed", "compose_project": body.project, "url": None, "stdout": result.stdout[-10000:], "stderr": result.stderr[-10000:]}
    # Confirm the service is running before advertising a preview URL.
    environment = os.environ.copy()
    environment["COMPOSE_NETWORK_NAME"] = f"{body.project}_default"
    ps = subprocess.run(["docker", "compose", "-f", str(selected_compose), "-p", body.project, "ps", "-q", body.service], cwd=selected_workspace, env=environment, text=True, capture_output=True, timeout=30)
    if ps.returncode != 0 or not ps.stdout.strip():
        return {"status": "failed", "compose_project": body.project, "url": None, "stdout": result.stdout[-10000:], "stderr": ps.stderr[-10000:]}
    container_id = ps.stdout.strip().splitlines()[0]
    image = subprocess.run(["docker", "compose", "-f", str(selected_compose), "-p", body.project, "images", "-q", body.service], cwd=selected_workspace, env=environment, text=True, capture_output=True, timeout=30)
    image_id = image.stdout.strip().splitlines()[0] if image.stdout.strip() else None
    digest = None
    if image_id:
        image_inspect = subprocess.run(["docker", "image", "inspect", "--format", "{{.Id}}", image_id], text=True, capture_output=True, timeout=30)
        digest = image_inspect.stdout.strip() or image_id
    environment = os.environ.copy()
    environment["COMPOSE_NETWORK_NAME"] = f"{body.project}_default"
    last_error = "container health is not ready"
    for _ in range(30):
        inspect = subprocess.run(["docker", "inspect", "--format", "{{.State.Health.Status}}", container_id], env=environment, text=True, capture_output=True, timeout=10)
        state = inspect.stdout.strip()
        if state == "healthy":
            return {"status": "ready", "compose_project": body.project, "url": f"http://localhost:{host_port}", "image_digest": digest, "stdout": result.stdout[-10000:], "stderr": result.stderr[-10000:]}
        if state:
            last_error = f"container health state: {state}"
        time.sleep(1)
    return {"status": "failed", "compose_project": body.project, "url": None, "stdout": result.stdout[-10000:], "stderr": f"preview health check failed: {last_error}"}
