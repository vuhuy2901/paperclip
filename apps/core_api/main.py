from pathlib import Path
from fastapi import FastAPI, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from .db import Base, engine, get_db
from .models import Project, ChangeRequest, WorkflowRun, Event, Artifact, Task
from .schemas import ProjectCreate, ChangeCreate, RunCreate, Decision, Feedback
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
    run = WorkflowRun(change_id=change_id, idempotency_key=body.idempotency_key, config_snapshot={"runner":"local-deterministic","max_repairs":3})
    db.add(run); db.flush(); seed_tasks(db, run, c.text); emit(db, run.id, "run.queued", {"change_id": change_id}); db.commit(); db.refresh(run); return run

@app.get("/api/runs/{run_id}", dependencies=[Depends(auth)])
def get_run(run_id: str, db: Session = Depends(get_db)):
    run = db.get(WorkflowRun, run_id)
    if not run: raise HTTPException(404, "run not found")
    return {"run": run, "tasks": [{"id":t.id,"role":t.role,"status":t.status,"depends_on":t.depends_on} for t in db.scalars(select(Task).where(Task.run_id == run_id))]}

@app.get("/api/runs/{run_id}/events", dependencies=[Depends(auth)])
def get_events(run_id: str, after: int = Query(0), db: Session = Depends(get_db)):
    return list(db.scalars(select(Event).where(Event.run_id == run_id, Event.sequence > after).order_by(Event.sequence)))

@app.post("/api/runs/{run_id}/cancel", dependencies=[Depends(auth)])
def cancel_run(run_id: str, db: Session = Depends(get_db)):
    run = db.get(WorkflowRun, run_id)
    if not run: raise HTTPException(404, "run not found")
    if run.status not in {"queued","analyzing","planning","implementing","integrating","verifying","deploying","repairing"}: raise HTTPException(409, "run cannot be cancelled")
    transition(db, run, "cancelling"); transition(db, run, "cancelled"); db.commit(); return run

@app.get("/api/runs/{run_id}/artifacts", dependencies=[Depends(auth)])
def artifacts(run_id: str, db: Session = Depends(get_db)): return list(db.scalars(select(Artifact).where(Artifact.run_id == run_id)))

@app.get("/api/roles", dependencies=[Depends(auth)])
def roles(): return [{"id": r, "runner": "local-deterministic", "model": "configured-at-runtime"} for r in ["project-manager","architect","ui-ux-designer","backend-developer","frontend-developer","code-reviewer","tester","devops"]]

@app.post("/api/integrations/paperclip/wake", dependencies=[Depends(auth)])
def paperclip_wake(payload: dict, db: Session = Depends(get_db)): return {"accepted": True, "deduplicated": bool(payload.get("idempotency_key")), "payload": payload}
