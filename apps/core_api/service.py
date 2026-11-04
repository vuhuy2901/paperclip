from datetime import datetime, timedelta, timezone
from sqlalchemy import select, func, delete
from sqlalchemy.orm import Session
from .models import Event, WorkflowRun, Task, RunLease, TaskContract
from .state import can_transition
from apps.roles.catalog import required_artifacts

def emit(db: Session, run_id: str, event_type: str, payload: dict):
    seq = db.scalar(select(func.max(Event.sequence)).where(Event.run_id == run_id)) or 0
    # Multiple events are emitted before commit during one worker pass. Include
    # pending ORM objects so sequence IDs remain strictly increasing in-memory.
    seq += sum(1 for pending in db.new if isinstance(pending, Event) and pending.run_id == run_id)
    event = Event(run_id=run_id, sequence=seq + 1, type=event_type, payload=payload)
    db.add(event); return event

def transition(db: Session, run: WorkflowRun, new_status: str):
    if not can_transition(run.status, new_status):
        raise ValueError(f"invalid transition: {run.status} -> {new_status}")
    old = run.status; run.status = new_status
    emit(db, run.id, "workflow.transition", {"from": old, "to": new_status})

def claim_run(db: Session, run_id: str, owner: str, ttl_seconds: int = 900) -> bool:
    now = datetime.now(timezone.utc)
    lease = db.get(RunLease, run_id)
    expires_at = lease.expires_at.replace(tzinfo=timezone.utc) if lease and lease.expires_at and lease.expires_at.tzinfo is None else (lease.expires_at if lease else None)
    if lease and expires_at and expires_at > now and lease.owner != owner:
        return False
    if lease is None:
        lease = RunLease(run_id=run_id, owner=owner, heartbeat_at=now, expires_at=now + timedelta(seconds=ttl_seconds))
        db.add(lease)
    else:
        lease.owner = owner; lease.heartbeat_at = now; lease.expires_at = now + timedelta(seconds=ttl_seconds)
    db.commit()
    return True

def heartbeat_run(db: Session, run_id: str, owner: str, ttl_seconds: int = 900) -> bool:
    lease = db.get(RunLease, run_id)
    if not lease or lease.owner != owner:
        return False
    now = datetime.now(timezone.utc)
    lease.heartbeat_at = now; lease.expires_at = now + timedelta(seconds=ttl_seconds)
    db.commit()
    return True

def release_run(db: Session, run_id: str, owner: str) -> None:
    lease = db.get(RunLease, run_id)
    if lease and lease.owner == owner:
        db.execute(delete(RunLease).where(RunLease.run_id == run_id)); db.commit()

def seed_tasks(db: Session, run: WorkflowRun, change_text: str):
    tasks = [
        ("project-manager", "Create PRD, acceptance criteria and task graph", []),
        ("architect", "Analyze repository impact and API/schema changes", []),
        ("backend-developer", "Implement backend changes and tests", ["architect"]),
        ("frontend-developer", "Implement frontend changes and tests", ["architect"]),
        ("code-reviewer", "Review candidate diff against acceptance criteria", ["backend-developer", "frontend-developer"]),
        ("tester", "Run trusted tests and regression suite", ["code-reviewer"]),
        ("devops", "Build preview and run smoke checks", ["tester"]),
    ]
    for role, goal, deps in tasks:
        task = Task(run_id=run.id, role=role, goal=f"{goal}: {change_text}", depends_on=deps, required_artifacts=required_artifacts(role))
        db.add(task); db.flush()
        db.add(TaskContract(task_id=task.id, context_from=deps, file_scope=[], acceptance_criteria_ids=[]))
