import time
from sqlalchemy import select
from apps.core_api.db import SessionLocal, Base, engine
from apps.core_api.models import WorkflowRun
from apps.core_api.service import transition, emit

def process_once():
    db = SessionLocal()
    try:
        run = db.scalar(select(WorkflowRun).where(WorkflowRun.status == "queued").order_by(WorkflowRun.created_at))
        if not run: return False
        for status in ["analyzing", "planning", "implementing", "integrating", "verifying", "deploying", "awaiting_acceptance"]:
            transition(db, run, status)
        emit(db, run.id, "run.awaiting_acceptance", {"evidence": "deterministic-stage-1"})
        db.commit(); return True
    finally: db.close()

def main():
    Base.metadata.create_all(engine)
    while True:
        if not process_once(): time.sleep(1)

if __name__ == "__main__": main()
