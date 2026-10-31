import time
from sqlalchemy import select
from apps.core_api.db import SessionLocal, Base, engine
from apps.core_api.models import WorkflowRun, Approval, Deployment
from apps.core_api.service import transition, emit
from apps.orchestration.graph import workflow_graph

def process_once():
    db = SessionLocal()
    try:
        run = db.scalar(select(WorkflowRun).where(WorkflowRun.status.in_(["queued", "repairing"])).order_by(WorkflowRun.created_at))
        if not run: return False
        graph_result = workflow_graph.invoke({"run_id": run.id, "repair_count": run.repair_count, "evidence_status": "pass"})
        emit(db, run.id, "orchestration.graph_completed", {"stage": graph_result.get("stage"), "mode": "deterministic"})
        statuses = ["analyzing", "planning", "implementing", "integrating", "verifying", "deploying", "awaiting_acceptance"]
        if run.status == "repairing":
            transition(db, run, "implementing")
            statuses = ["integrating", "verifying", "deploying", "awaiting_acceptance"]
        for status in statuses:
            if run.status == status: continue
            transition(db, run, status)
        db.add(Deployment(run_id=run.id, commit_sha=run.candidate_sha, status="ready", url=f"http://localhost:9100/previews/{run.id}", health_evidence={"status":"not_run"}, smoke_evidence={"status":"not_run"}))
        db.add(Approval(run_id=run.id, kind="candidate", artifact_version=run.candidate_sha or run.id, candidate_sha=run.candidate_sha, status="pending"))
        emit(db, run.id, "run.awaiting_acceptance", {"evidence": "deterministic-stage-1"})
        db.commit(); return True
    finally: db.close()

def main():
    Base.metadata.create_all(engine)
    while True:
        if not process_once(): time.sleep(1)

if __name__ == "__main__": main()
