from pathlib import Path
from fastapi import FastAPI, Depends, Header, HTTPException, Query
from fastapi.responses import StreamingResponse
import json
import time
from sqlalchemy.orm import Session
from sqlalchemy import select
from .db import Base, engine, get_db
from .models import Project, ChangeRequest, WorkflowRun, Event, Artifact, Task, Approval, FeedbackRecord, Deployment
from .schemas import ProjectCreate, ChangeCreate, RunCreate, Decision, Feedback, RoleUpdate
from .service import emit, seed_tasks, transition

Path("data").mkdir(exist_ok=True)
Base.metadata.create_all(engine)
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

@app.post("/api/projects/{project_id}/changes", dependencies=[Depends(auth)])
def create_change(project_id: str, body: ChangeCreate, db: Session = Depends(get_db)):
    if not db.get(Project, project_id): raise HTTPException(404, "project not found")
    c = ChangeRequest(project_id=project_id, **body.model_dump()); db.add(c); db.commit(); db.refresh(c); return c

@app.post("/api/changes/{change_id}/runs", dependencies=[Depends(auth)])
def create_run(change_id: str, body: RunCreate, db: Session = Depends(get_db)):
    c = db.get(ChangeRequest, change_id)
    if not c: raise HTTPException(404, "change not found")
    existing = db.scalar(select(WorkflowRun).where(WorkflowRun.change_id == change_id, WorkflowRun.idempotency_key == body.idempotency_key))
    if existing: return existing
    run = WorkflowRun(change_id=change_id, idempotency_key=body.idempotency_key, config_snapshot={"runner":"local-deterministic","max_repairs":3,"roles": ROLE_CONFIG})
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

@app.get("/api/artifacts/{artifact_id}", dependencies=[Depends(auth)])
def artifact(artifact_id: str, db: Session = Depends(get_db)):
    item = db.get(Artifact, artifact_id)
    if not item: raise HTTPException(404, "artifact not found")
    return item

@app.get("/api/runs/{run_id}/preview", dependencies=[Depends(auth)])
def preview(run_id: str, db: Session = Depends(get_db)):
    deployment = db.scalar(select(Deployment).where(Deployment.run_id == run_id).order_by(Deployment.id.desc()))
    return {"baseline": None, "candidate": deployment.url if deployment else None, "status": deployment.status if deployment else "not_deployed", "deployment": deployment}

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
    if body.decision == "approve" and run.status == "awaiting_acceptance": transition(db, run, "accepted")
    if body.decision == "request_changes" and run.status == "awaiting_acceptance":
        if run.repair_count >= 3: transition(db, run, "rejected")
        else: run.repair_count += 1; transition(db, run, "repairing")
    db.commit(); return approval

ROLE_CONFIG = {r: {"id": r, "runner": "local-deterministic", "model": "configured-at-runtime", "timeout_seconds": 900, "sandbox": "workspace-write", "tool_policy": []} for r in ["project-manager","architect","ui-ux-designer","backend-developer","frontend-developer","code-reviewer","tester","devops"]}

@app.get("/api/roles", dependencies=[Depends(auth)])
def roles(): return list(ROLE_CONFIG.values())

@app.put("/api/roles/{role_id}", dependencies=[Depends(auth)])
def update_role(role_id: str, body: RoleUpdate):
    if role_id not in ROLE_CONFIG: raise HTTPException(404, "role not found")
    if body.runner not in {"local-deterministic", "codex-cli", "xera", "reviewer", "devops"}: raise HTTPException(422, "unsupported runner")
    if body.sandbox not in {"read-only", "workspace-write"}: raise HTTPException(422, "unsupported sandbox")
    ROLE_CONFIG[role_id] = {"id": role_id, **body.model_dump()}; return ROLE_CONFIG[role_id]

@app.post("/api/integrations/paperclip/wake", dependencies=[Depends(auth)])
def paperclip_wake(payload: dict, db: Session = Depends(get_db)):
    change_id, key = payload.get("change_id"), payload.get("idempotency_key")
    if not change_id or not key: raise HTTPException(422, "change_id and idempotency_key are required")
    change = db.get(ChangeRequest, change_id)
    if not change: raise HTTPException(404, "change not found")
    existing = db.scalar(select(WorkflowRun).where(WorkflowRun.change_id == change_id, WorkflowRun.idempotency_key == key))
    if existing: return {"accepted": True, "deduplicated": True, "run_id": existing.id}
    run = WorkflowRun(change_id=change_id, idempotency_key=key, config_snapshot={"runner":"local-deterministic","max_repairs":3,"roles":ROLE_CONFIG})
    db.add(run); db.flush(); seed_tasks(db, run, change.text); emit(db, run.id, "paperclip.wake.accepted", {"change_id": change_id, "key": key}); db.commit()
    return {"accepted": True, "deduplicated": False, "run_id": run.id}
