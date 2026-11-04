from pathlib import Path
from fastapi import FastAPI, Depends, Header, HTTPException, Query
from fastapi.responses import StreamingResponse, FileResponse
import json
import time
import os
import io
import mimetypes
import zipfile
import subprocess
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session
from sqlalchemy import select, or_
from .db import Base, engine, get_db
from .models import Project, ChangeRequest, WorkflowRun, Event, Artifact, Task, Approval, FeedbackRecord, Deployment, RoleConfig, RoleScope, EvidenceRecord, Finding, AgentRun, TaskContract
from .schemas import ProjectCreate, ChangeCreate, RunCreate, Decision, Feedback, RoleUpdate
from .config import settings
from .service import emit, seed_tasks, transition
from .roles import ensure_roles, snapshot

Path("data").mkdir(exist_ok=True)

def initialize_database() -> None:
    """Create the development schema, tolerating Compose DNS/startup races."""
    for attempt in range(1, 16):
        try:
            Base.metadata.create_all(engine)
            return
        except OperationalError:
            if attempt == 15:
                raise
            time.sleep(1)

initialize_database()
app = FastAPI(title="AI Software Company Core API", version="0.1.0")

def auth(x_service_token: str | None = Header(default=None)):
    # Development token gate; production adapter/PO auth will be added in integration phase.
    from .config import settings
    if x_service_token != settings.service_token: raise HTTPException(401, "invalid service token")

@app.get("/health")
def health(): return {"status": "ok"}

@app.get("/ready")
def ready(db: Session = Depends(get_db)):
    db.execute(select(Project).limit(1)); return {"status": "ready", "database": "ok"}

@app.post("/api/projects", dependencies=[Depends(auth)])
def create_project(body: ProjectCreate, db: Session = Depends(get_db)):
    p = Project(**body.model_dump()); db.add(p); db.commit(); db.refresh(p); return p

@app.get("/api/projects/{project_id}", dependencies=[Depends(auth)])
def get_project(project_id: str, db: Session = Depends(get_db)):
    p = db.get(Project, project_id)
    if not p: raise HTTPException(404, "project not found")
    return p

@app.get("/api/projects/{project_id}/changes", dependencies=[Depends(auth)])
def project_changes(project_id: str, db: Session = Depends(get_db)):
    if not db.get(Project, project_id): raise HTTPException(404, "project not found")
    return list(db.scalars(select(ChangeRequest).where(ChangeRequest.project_id == project_id).order_by(ChangeRequest.created_at)))

@app.post("/api/projects/{project_id}/changes", dependencies=[Depends(auth)])
def create_change(project_id: str, body: ChangeCreate, db: Session = Depends(get_db)):
    if not db.get(Project, project_id): raise HTTPException(404, "project not found")
    c = ChangeRequest(project_id=project_id, **body.model_dump()); db.add(c); db.commit(); db.refresh(c); return c

@app.get("/api/changes/{change_id}/runs", dependencies=[Depends(auth)])
def change_runs(change_id: str, db: Session = Depends(get_db)):
    if not db.get(ChangeRequest, change_id): raise HTTPException(404, "change not found")
    return list(db.scalars(select(WorkflowRun).where(WorkflowRun.change_id == change_id).order_by(WorkflowRun.created_at)))

@app.post("/api/changes/{change_id}/runs", dependencies=[Depends(auth)])
def create_run(change_id: str, body: RunCreate, db: Session = Depends(get_db)):
    c = db.get(ChangeRequest, change_id)
    if not c: raise HTTPException(404, "change not found")
    existing = db.scalar(select(WorkflowRun).where(WorkflowRun.change_id == change_id, WorkflowRun.idempotency_key == body.idempotency_key))
    if existing: return existing
    active = db.scalar(select(WorkflowRun).join(ChangeRequest, WorkflowRun.change_id == ChangeRequest.id).where(ChangeRequest.project_id == c.project_id, WorkflowRun.status.in_(["queued", "analyzing", "planning", "implementing", "integrating", "verifying", "deploying", "repairing", "cancelling"])))
    if active: raise HTTPException(409, f"project already has active run {active.id}")
    run = WorkflowRun(change_id=change_id, idempotency_key=body.idempotency_key, config_snapshot={"runner":settings.default_runner,"max_repairs":settings.max_repairs,"roles": snapshot(db)})
    db.add(run); db.flush(); seed_tasks(db, run, c.text); emit(db, run.id, "run.queued", {"change_id": change_id}); db.commit(); db.refresh(run); return run

@app.get("/api/runs/{run_id}", dependencies=[Depends(auth)])
def get_run(run_id: str, db: Session = Depends(get_db)):
    run = db.get(WorkflowRun, run_id)
    if not run: raise HTTPException(404, "run not found")
    return {"run": run, "tasks": [{"id":t.id,"role":t.role,"status":t.status,"depends_on":t.depends_on} for t in db.scalars(select(Task).where(Task.run_id == run_id))]}

@app.get("/api/runs/{run_id}/events", dependencies=[Depends(auth)])
def get_events(run_id: str, after: int = Query(0), db: Session = Depends(get_db)):
    return list(db.scalars(select(Event).where(Event.run_id == run_id, Event.sequence > after).order_by(Event.sequence)))

@app.get("/api/runs/{run_id}/events/stream", dependencies=[Depends(auth)])
def stream_events(run_id: str, after: int = Query(0), db: Session = Depends(get_db)):
    events = list(db.scalars(select(Event).where(Event.run_id == run_id, Event.sequence > after).order_by(Event.sequence)))
    def generate():
        for event in events:
            yield f"id: {event.sequence}\ndata: {json.dumps({'sequence': event.sequence, 'type': event.type, 'payload': event.payload}, default=str)}\n\n"
    return StreamingResponse(generate(), media_type="text/event-stream", headers={"cache-control":"no-cache", "x-run-id":run_id})

@app.post("/api/runs/{run_id}/cancel", dependencies=[Depends(auth)])
def cancel_run(run_id: str, db: Session = Depends(get_db)):
    run = db.get(WorkflowRun, run_id)
    if not run: raise HTTPException(404, "run not found")
    if run.status not in {"queued","analyzing","planning","implementing","integrating","verifying","deploying","repairing"}: raise HTTPException(409, "run cannot be cancelled")
    transition(db, run, "cancelling"); transition(db, run, "cancelled"); db.commit(); return run

@app.get("/api/runs/{run_id}/artifacts", dependencies=[Depends(auth)])
def artifacts(run_id: str, db: Session = Depends(get_db)): return list(db.scalars(select(Artifact).where(Artifact.run_id == run_id)))

@app.get("/api/runs/{run_id}/evidence", dependencies=[Depends(auth)])
def evidence(run_id: str, db: Session = Depends(get_db)):
    if not db.get(WorkflowRun, run_id): raise HTTPException(404, "run not found")
    return list(db.scalars(select(EvidenceRecord).where(EvidenceRecord.run_id == run_id)))

@app.get("/api/runs/{run_id}/agent-runs", dependencies=[Depends(auth)])
def agent_runs(run_id: str, db: Session = Depends(get_db)):
    if not db.get(WorkflowRun, run_id): raise HTTPException(404, "run not found")
    return list(db.scalars(select(AgentRun).join(Task, AgentRun.task_id == Task.id).where(Task.run_id == run_id).order_by(AgentRun.started_at)))

@app.get("/api/tasks/{task_id}/contract", dependencies=[Depends(auth)])
def task_contract(task_id: str, db: Session = Depends(get_db)):
    if not db.get(Task, task_id): raise HTTPException(404, "task not found")
    contract = db.get(TaskContract, task_id)
    if not contract: raise HTTPException(404, "task contract not found")
    return contract

@app.get("/api/runs/{run_id}/findings", dependencies=[Depends(auth)])
def findings(run_id: str, db: Session = Depends(get_db)):
    if not db.get(WorkflowRun, run_id): raise HTTPException(404, "run not found")
    return list(db.scalars(select(Finding).where(Finding.run_id == run_id)))

@app.get("/api/artifacts/{artifact_id}", dependencies=[Depends(auth)])
def artifact(artifact_id: str, db: Session = Depends(get_db)):
    item = db.get(Artifact, artifact_id)
    if not item: raise HTTPException(404, "artifact not found")
    return item

@app.get("/api/artifacts/{artifact_id}/content", dependencies=[Depends(auth)])
def artifact_content(artifact_id: str, db: Session = Depends(get_db)):
    item = db.get(Artifact, artifact_id)
    if not item: raise HTTPException(404, "artifact not found")
    root = Path(settings.artifact_root).resolve()
    path = (root / item.relative_path).resolve()
    try:
        path.relative_to(root)
    except ValueError:
        raise HTTPException(500, "artifact path is invalid")
    if not path.is_file(): raise HTTPException(404, "artifact content not found")
    return FileResponse(path, filename=Path(item.relative_path).name, media_type="application/octet-stream")

@app.get("/api/runs/{run_id}/preview", dependencies=[Depends(auth)])
def preview(run_id: str, db: Session = Depends(get_db)):
    run = db.get(WorkflowRun, run_id)
    if not run: raise HTTPException(404, "run not found")
    deployment = db.scalar(select(Deployment).where(Deployment.run_id == run_id, Deployment.commit_sha == run.candidate_sha).order_by(Deployment.id.desc())) if run.candidate_sha else None
    if deployment is None:
        deployments = list(db.scalars(select(Deployment).where(Deployment.run_id == run_id)))
        deployment = deployments[-1] if deployments else None
    change = db.get(ChangeRequest, run.change_id)
    project = db.get(Project, change.project_id) if change else None
    return {
        "baseline": {
            "commit_sha": run.baseline_sha,
            "accepted_commit": project.accepted_commit if project else None,
            "url": (run.config_snapshot or {}).get("previews", {}).get("baseline", {}).get("url"),
            "status": (run.config_snapshot or {}).get("previews", {}).get("baseline", {}).get("status", "not_deployed"),
        } if run.baseline_sha else None,
        "candidate": deployment.url if deployment else None,
        "status": deployment.status if deployment else "not_deployed",
        "deployment": deployment,
    }

@app.get("/api/runs/{run_id}/diff", dependencies=[Depends(auth)])
def candidate_diff(run_id: str, db: Session = Depends(get_db)):
    """Return an explicit baseline/candidate comparison; never infer a diff from a URL."""
    run = db.get(WorkflowRun, run_id)
    if not run: raise HTTPException(404, "run not found")
    change = db.get(ChangeRequest, run.change_id)
    project = db.get(Project, change.project_id) if change else None
    result = {"run_id": run_id, "baseline_sha": run.baseline_sha, "candidate_sha": run.candidate_sha, "available": False, "files": [], "stat": None, "reason": None}
    persisted = (run.config_snapshot or {}).get("candidate_diff")
    if persisted is not None:
        return {**result, **persisted}
    if not run.baseline_sha or not run.candidate_sha:
        result["reason"] = "baseline or candidate SHA is missing"
        return result
    if run.baseline_sha == run.candidate_sha:
        result["reason"] = "baseline and candidate resolve to the same commit"
        result["available"] = True
        result["stat"] = {"files_changed": 0, "insertions": 0, "deletions": 0}
        return result
    if not project or not project.repo:
        result["reason"] = "project repository is not configured"
        return result
    repo = Path(project.repo).resolve()
    if not repo.is_dir():
        result["reason"] = "project repository is unavailable"
        return result
    proc = subprocess.run(["git", "diff", "--name-status", run.baseline_sha, run.candidate_sha], cwd=repo, capture_output=True, text=True, timeout=30)
    if proc.returncode != 0:
        result["reason"] = proc.stderr.strip()[-500:] or "git diff failed"
        return result
    result["available"] = True
    result["files"] = [{"status": line.split("\t", 1)[0], "path": line.split("\t", 1)[1]} for line in proc.stdout.splitlines() if "\t" in line]
    stat = subprocess.run(["git", "diff", "--shortstat", run.baseline_sha, run.candidate_sha], cwd=repo, capture_output=True, text=True, timeout=30)
    result["stat"] = stat.stdout.strip()
    return result

@app.post("/api/runs/{run_id}/promote", dependencies=[Depends(auth)])
def promote_candidate(run_id: str, db: Session = Depends(get_db)):
    run = db.get(WorkflowRun, run_id)
    if not run: raise HTTPException(404, "run not found")
    if run.status != "accepted": raise HTTPException(409, "candidate must be approved before promotion")
    deployment = db.scalar(select(Deployment).where(Deployment.run_id == run_id, Deployment.commit_sha == run.candidate_sha).order_by(Deployment.id.desc()))
    if not deployment or deployment.status != "ready": raise HTTPException(409, "ready candidate deployment not found")
    deployment.smoke_evidence = {**(deployment.smoke_evidence or {}), "promotion": {"status": "promoted", "candidate_sha": run.candidate_sha, "image_digest": deployment.image_digest}}
    emit(db, run.id, "candidate.promoted", {"candidate_sha": run.candidate_sha, "image_digest": deployment.image_digest})
    db.commit(); db.refresh(deployment)
    return {"run_id": run_id, "status": "promoted", "deployment": deployment}

@app.get("/api/runs/{run_id}/approvals", dependencies=[Depends(auth)])
def approvals(run_id: str, db: Session = Depends(get_db)):
    return list(db.scalars(select(Approval).where(Approval.run_id == run_id).order_by(Approval.created_at)))

@app.post("/api/runs/{run_id}/feedback", dependencies=[Depends(auth)])
def feedback(run_id: str, body: Feedback, db: Session = Depends(get_db)):
    if not db.get(WorkflowRun, run_id): raise HTTPException(404, "run not found")
    record = FeedbackRecord(run_id=run_id, **body.model_dump()); db.add(record); emit(db, run_id, "po.feedback", body.model_dump()); db.commit(); db.refresh(record); return record

@app.post("/api/approvals/{approval_id}/decision", dependencies=[Depends(auth)])
def approval_decision(approval_id: str, body: Decision, db: Session = Depends(get_db)):
    approval = db.get(Approval, approval_id)
    if not approval: raise HTTPException(404, "approval not found")
    if approval.artifact_version != body.artifact_version: raise HTTPException(409, "approval artifact version is stale")
    if body.decision not in {"approve", "reject", "request_changes"}: raise HTTPException(422, "invalid decision")
    approval.status = {"approve":"approved", "reject":"rejected", "request_changes":"changes_requested"}[body.decision]
    approval.actor = "po"; approval.reason = body.reason
    emit(db, approval.run_id, "po.decision", {"approval_id": approval.id, "decision": body.decision, "artifact_version": body.artifact_version})
    run = db.get(WorkflowRun, approval.run_id)
    revision_id = None
    if body.decision == "approve" and run.status == "awaiting_acceptance":
        transition(db, run, "accepted")
        change = db.get(ChangeRequest, run.change_id)
        project = db.get(Project, change.project_id) if change else None
        if project:
            project.accepted_commit = approval.candidate_sha or run.candidate_sha
            emit(db, run.id, "project.accepted_version_updated", {"project_id": project.id, "commit_sha": project.accepted_commit})
    if body.decision == "request_changes" and run.status == "awaiting_acceptance":
        if run.repair_count >= 3: transition(db, run, "rejected")
        else:
            run.repair_count += 1
            change = db.get(ChangeRequest, run.change_id)
            if change:
                revision = ChangeRequest(project_id=change.project_id, text=f"Revision for {change.id}: {change.text}\nPO feedback: {body.reason or 'changes requested'}", acceptance_version=change.acceptance_version + 1, parent_change_id=change.id)
                db.add(revision); db.flush(); revision_id = revision.id
                emit(db, run.id, "po.revision_created", {"change_id": revision.id, "parent_change_id": change.id, "reason": body.reason})
            transition(db, run, "repairing")
    db.commit();
    result = {"approval": approval, "revision_change_id": revision_id}
    return result

@app.get("/api/roles", dependencies=[Depends(auth)])
def roles(db: Session = Depends(get_db)):
    return list(snapshot(db).values())

@app.put("/api/roles/{role_id}", dependencies=[Depends(auth)])
def update_role(role_id: str, body: RoleUpdate, db: Session = Depends(get_db)):
    configs = snapshot(db)
    if role_id not in configs: raise HTTPException(404, "role not found")
    if body.runner not in {"local-deterministic", "ollama", "codex-cli", "codex-gateway"}: raise HTTPException(422, "runner is not installed; no silent fallback is allowed")
    if body.sandbox not in {"read-only", "workspace-write"}: raise HTTPException(422, "unsupported sandbox")
    for path in body.file_scope:
        if path.startswith("/") or ".." in path.replace("\\", "/").split("/"): raise HTTPException(422, "file_scope must stay relative")
    config = db.get(RoleConfig, role_id); config.runner = body.runner; config.model = body.model; config.timeout_seconds = body.timeout_seconds; config.sandbox = body.sandbox; config.tool_policy = body.tool_policy
    scope = db.get(RoleScope, role_id); scope.file_scope = body.file_scope; db.commit(); db.refresh(config)
    return snapshot(db)[role_id]

@app.post("/api/integrations/paperclip/wake", dependencies=[Depends(auth)])
def paperclip_wake(payload: dict, db: Session = Depends(get_db)):
    change_id, key = payload.get("change_id"), payload.get("idempotency_key")
    if not change_id or not key: raise HTTPException(422, "change_id and idempotency_key are required")
    change = db.get(ChangeRequest, change_id)
    if not change: raise HTTPException(404, "change not found")
    existing = db.scalar(select(WorkflowRun).where(WorkflowRun.change_id == change_id, WorkflowRun.idempotency_key == key))
    if existing: return {"accepted": True, "deduplicated": True, "run_id": existing.id}
    active = db.scalar(select(WorkflowRun).join(ChangeRequest, WorkflowRun.change_id == ChangeRequest.id).where(ChangeRequest.project_id == change.project_id, WorkflowRun.status.in_(["queued", "analyzing", "planning", "implementing", "integrating", "verifying", "deploying", "repairing", "cancelling"])))
    if active: raise HTTPException(409, f"project already has active run {active.id}")
    run = WorkflowRun(change_id=change_id, idempotency_key=key, config_snapshot={"runner":settings.default_runner,"max_repairs":settings.max_repairs,"roles":snapshot(db)})
    db.add(run); db.flush(); seed_tasks(db, run, change.text); emit(db, run.id, "paperclip.wake.accepted", {"change_id": change_id, "key": key}); db.commit()
    return {"accepted": True, "deduplicated": False, "run_id": run.id}

WORKSPACE_IGNORE_DIRS = {".git", "node_modules", "dist", "build", "__pycache__", ".pytest_cache", ".gemini", ".idea", ".vscode"}
WORKSPACE_IGNORE_FILES = {".DS_Store", "package-lock.json", ".gitkeep"}
MAX_FILE_SIZE = 1024 * 1024  # 1 MB

def get_project_workspace_root(project_id: str) -> Path:
    candidates = [
        Path("/workspace/apps/english-vocabulary"),
        Path(f"/workspace/data/worktrees/{project_id}"),
        Path("apps/english-vocabulary").resolve(),
        Path(".").resolve(),
        Path("/workspace")
    ]
    for c in candidates:
        if c.is_dir() and ((c / "src").is_dir() or (c / "package.json").is_file()):
            return c.resolve()
    for c in candidates:
        if c.is_dir():
            return c.resolve()
    return Path("/workspace").resolve()

def validate_workspace_path(root: Path, relative_path: str) -> Path:
    if not relative_path or ".." in relative_path or relative_path.startswith("/") or "\\" in relative_path:
        raise HTTPException(status_code=403, detail="Path traversal forbidden")
    target = (root / relative_path).resolve()
    try:
        target.relative_to(root.resolve())
    except ValueError:
        raise HTTPException(status_code=403, detail="Path traversal forbidden")
    for part in target.parts:
        if part in WORKSPACE_IGNORE_DIRS:
            raise HTTPException(status_code=403, detail="Access to ignored directory forbidden")
    return target

@app.get("/api/projects/{project_id}/workspace/tree", dependencies=[Depends(auth)])
def get_workspace_tree(project_id: str, agent_filter: str | None = None):
    root = get_project_workspace_root(project_id)
    if not root.is_dir():
        return {"project_id": project_id, "root_name": root.name, "files": []}

    git_statuses = {}
    try:
        git_res = subprocess.run(["git", "status", "--porcelain"], cwd=root, capture_output=True, text=True, timeout=5)
        if git_res.returncode == 0:
            for line in git_res.stdout.splitlines():
                if len(line) >= 4:
                    code = line[:2].strip()
                    path_str = line[3:].strip()
                    git_statuses[path_str] = "new" if "?" in code or "A" in code else "modified"
    except Exception:
        pass

    files = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in WORKSPACE_IGNORE_DIRS and not d.startswith(".")]
        rel_dir = os.path.relpath(dirpath, root)
        if rel_dir == ".":
            rel_dir = ""

        for f in filenames:
            if f in WORKSPACE_IGNORE_FILES or f.startswith("."):
                continue
            full_path = Path(dirpath) / f
            rel_path = (Path(rel_dir) / f).as_posix() if rel_dir else f

            try:
                stat = full_path.stat()
                size = stat.st_size
                mtime = stat.st_mtime
            except OSError:
                continue

            agent_author = "Backend Engineer"
            lower = rel_path.lower()
            if "front" in lower or "ui" in lower or lower.endswith((".css", ".html")):
                agent_author = "Frontend Engineer"
            elif lower.endswith((".py", ".sql", ".js", ".ts")) and ("api" in lower or "server" in lower or "app" in lower):
                agent_author = "Backend Engineer"
            elif "docker" in lower or lower.endswith((".yaml", ".yml")):
                agent_author = "DevOps Engineer"
            elif "test" in lower or "spec" in lower:
                agent_author = "QA Tester"
            elif lower.endswith((".md", ".txt", ".json")):
                agent_author = "Solution Architect"

            status = git_statuses.get(rel_path, "unchanged")
            if agent_filter and agent_author.lower() != agent_filter.lower():
                continue

            files.append({
                "path": rel_path,
                "name": f,
                "size": size,
                "modified_at": mtime,
                "status": status,
                "agent": agent_author,
                "is_new": status == "new",
                "is_modified": status == "modified",
            })

    files.sort(key=lambda x: x["path"])
    return {"project_id": project_id, "root_name": root.name, "files": files}

@app.get("/api/projects/{project_id}/workspace/file", dependencies=[Depends(auth)])
def get_workspace_file(project_id: str, path: str):
    root = get_project_workspace_root(project_id)
    target = validate_workspace_path(root, path)
    if not target.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    if target.stat().st_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 1MB limit")

    try:
        content = target.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Binary files cannot be displayed")

    diff = None
    try:
        diff_res = subprocess.run(["git", "diff", "HEAD", "--", path], cwd=root, capture_output=True, text=True, timeout=5)
        if diff_res.returncode == 0 and diff_res.stdout.strip():
            diff = diff_res.stdout
    except Exception:
        pass

    mime, _ = mimetypes.guess_type(target.name)
    ext = target.suffix.lstrip(".").lower()
    return {
        "path": path,
        "name": target.name,
        "size": target.stat().st_size,
        "content": content,
        "diff": diff,
        "language": ext or "text",
        "mime": mime or "text/plain",
    }

@app.get("/api/projects/{project_id}/workspace/download-zip")
def download_workspace_zip(project_id: str, x_service_token: str | None = Header(default=None)):
    root = get_project_workspace_root(project_id)
    if not root.is_dir():
        raise HTTPException(status_code=404, detail="Workspace directory not found")

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = [d for d in dirnames if d not in WORKSPACE_IGNORE_DIRS and not d.startswith(".")]
            for f in filenames:
                if f in WORKSPACE_IGNORE_FILES or f.startswith("."):
                    continue
                file_full = Path(dirpath) / f
                if file_full.stat().st_size > MAX_FILE_SIZE * 5:
                    continue
                rel_path = file_full.relative_to(root)
                zf.write(file_full, arcname=str(rel_path))

    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{root.name}-source.zip"'}
    )
