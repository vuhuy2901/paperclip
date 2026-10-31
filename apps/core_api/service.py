from sqlalchemy import select, func
from sqlalchemy.orm import Session
from .models import Event, WorkflowRun, Task
from .state import can_transition

def emit(db: Session, run_id: str, event_type: str, payload: dict):
    seq = db.scalar(select(func.max(Event.sequence)).where(Event.run_id == run_id)) or 0
    event = Event(run_id=run_id, sequence=seq + 1, type=event_type, payload=payload)
    db.add(event); return event

def transition(db: Session, run: WorkflowRun, new_status: str):
    if not can_transition(run.status, new_status):
        raise ValueError(f"invalid transition: {run.status} -> {new_status}")
    old = run.status; run.status = new_status
    emit(db, run.id, "workflow.transition", {"from": old, "to": new_status})

def seed_tasks(db: Session, run: WorkflowRun, change_text: str):
    tasks = [
        ("project-manager", "Create PRD, acceptance criteria and task graph", []),
        ("architect", "Analyze repository impact and API/schema changes", []),
        ("backend-developer", "Implement backend changes and tests", ["architect"]),
        ("frontend-developer", "Implement frontend changes and tests", ["architect"]),
        ("code-reviewer", "Review candidate diff against acceptance criteria", ["backend-developer", "frontend-developer"]),
        ("tester", "Run trusted tests and regression suite", ["code-reviewer"]),
        ("devops", "Build preview and run smoke checks", ["tester"]),
        ("ui-ux-designer", "Specify user flow and interaction states", ["project-manager"]),
    ]
    for role, goal, deps in tasks:
        db.add(Task(run_id=run.id, role=role, goal=f"{goal}: {change_text}", depends_on=deps, required_artifacts=[]))
