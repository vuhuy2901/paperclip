import time
import json
from pathlib import Path
from sqlalchemy import select
from apps.core_api.db import SessionLocal, Base, engine
from apps.core_api.models import WorkflowRun, Approval, Deployment, Task, Artifact, ChangeRequest, Project
from apps.core_api.service import transition, emit
from apps.orchestration.graph import workflow_graph
from apps.orchestration.dag import order_tasks
from apps.core_api.config import settings
from apps.runners.local import LocalDeterministicRunner
from apps.runners.factory import build_runner
from apps.runners.codex import CodexCliRunner
from apps.runners.executor import TaskExecutor
from apps.workspace.git import WorkspaceManager
from apps.verification.runner import run_profile
from apps.verification.artifacts import ArtifactStore
from apps.preview.manager import PreviewManager

def process_once():
    db = SessionLocal()
    try:
        run = db.scalar(select(WorkflowRun).where(WorkflowRun.status.in_(["queued", "repairing"])).order_by(WorkflowRun.created_at))
        if not run: return False
        graph_result = workflow_graph.invoke({"run_id": run.id, "repair_count": run.repair_count, "evidence_status": "pass"})
        emit(db, run.id, "orchestration.graph_completed", {"stage": graph_result.get("stage"), "mode": "deterministic"})
        store = ArtifactStore(settings.artifact_root)
        try: tasks = order_tasks(list(db.scalars(select(Task).where(Task.run_id == run.id))))
        except ValueError as exc:
            emit(db, run.id, "task.graph_invalid", {"reason": str(exc)})
            for status in ["analyzing", "planning", "implementing"]:
                if run.status != status: transition(db, run, status)
            transition(db, run, "failed"); db.commit(); return True
        for task in tasks:
            task.status = "running"
            emit(db, run.id, "task.started", {"task_id": task.id, "role": task.role})
            role_cfg = (run.config_snapshot or {}).get("roles", {}).get(task.role, {"runner":"local-deterministic"})
            if role_cfg.get("runner") == "codex-cli":
                change = db.get(ChangeRequest, run.change_id); project = db.get(Project, change.project_id) if change else None
                scope = role_cfg.get("file_scope", [])
                if not project or not project.repo or not scope:
                    task.status = "failed"; emit(db, run.id, "task.failed", {"task_id": task.id, "reason": "codex-cli requires project.repo and non-empty role file_scope"})
                    for status in ["analyzing", "planning", "implementing"]:
                        if run.status != status: transition(db, run, status)
                    transition(db, run, "failed"); db.commit(); return True
                manager = WorkspaceManager(settings.workspace_root)
                worktree = manager.create_worktree(project.repo, project.id, run.id, task.id, run.baseline_sha or "HEAD")
                handoff = TaskExecutor(CodexCliRunner(timeout_seconds=int(role_cfg.get("timeout_seconds", 900)), sandbox=role_cfg.get("sandbox", "workspace-write")), manager).execute(task.id, task.goal, worktree, scope, f"task: {task.role} {task.id}", model=role_cfg.get("model"))
                payload_obj = {"schema_version":"1", "task_id":task.id, "status":handoff.status, "summary":handoff.runner_summary, "result_commit":handoff.result_commit, "files_changed":handoff.files_changed, "mode":"codex-cli", "failure_category":handoff.failure_category}
                if handoff.status != "completed":
                    task.status = "failed"; emit(db, run.id, "task.failed", payload_obj)
                    for status in ["analyzing", "planning", "implementing"]:
                        if run.status != status: transition(db, run, status)
                    transition(db, run, "failed"); db.commit(); return True
            else:
                result = LocalDeterministicRunner().run(task.role, task.goal)
                payload_obj = {"schema_version": "1", "task_id": task.id, "status": result.status, "summary": result.summary, "mode": "fixture", "structured": result.structured}
            payload = json.dumps(payload_obj, indent=2).encode()
            item = store.put_bytes(run.id, f"role-handoffs/{task.role}.json", payload, task.role)
            db.add(Artifact(run_id=run.id, type="role-handoff-fixture", relative_path=item["relative_path"], sha256=item["sha256"], size=item["size"], producer=task.role))
            task.status = "completed"
            emit(db, run.id, "task.completed", {"task_id": task.id, "role": task.role, "artifact": item["relative_path"], "mode": "fixture"})
        evidence = run_profile("python-tests", Path.cwd())
        run.baseline_sha = run.baseline_sha or evidence.candidate_sha
        run.candidate_sha = evidence.candidate_sha
        evidence_path = store.put_bytes(run.id, "evidence/python-tests.json", json.dumps(evidence.__dict__, indent=2).encode(), "trusted-verification")
        db.add(Artifact(run_id=run.id, type="trusted-evidence", relative_path=evidence_path["relative_path"], sha256=evidence_path["sha256"], size=evidence_path["size"], producer="trusted-verification", commit_sha=evidence.candidate_sha))
        emit(db, run.id, "verification.completed", {"check_id": evidence.check_id, "status": evidence.status, "candidate_sha": evidence.candidate_sha, "report": evidence_path["relative_path"]})
        if evidence.status != "pass":
            for status in ["analyzing", "planning", "implementing", "integrating", "verifying"]:
                if run.status != status: transition(db, run, status)
            if run.repair_count >= 3: transition(db, run, "blocked")
            else: run.repair_count += 1; transition(db, run, "repairing")
            db.commit(); return True
        statuses = ["analyzing", "planning", "implementing", "integrating", "verifying", "deploying"]
        if run.status == "repairing":
            transition(db, run, "implementing")
            statuses = ["integrating", "verifying", "deploying"]
        for status in statuses:
            if run.status == status: continue
            transition(db, run, status)
        preview = PreviewManager("compose.yaml").up(f"preview-{run.id[:8]}", "storefront-api", 8200)
        db.add(Deployment(run_id=run.id, commit_sha=run.candidate_sha, status=preview.status, url=preview.url, health_evidence={"status": preview.status, "stderr": preview.stderr[-1000:]}, smoke_evidence={"status":"not_run"}))
        if preview.status == "ready":
            transition(db, run, "awaiting_acceptance")
            db.add(Approval(run_id=run.id, kind="candidate", artifact_version=run.candidate_sha or run.id, candidate_sha=run.candidate_sha, status="pending"))
            emit(db, run.id, "run.awaiting_acceptance", {"evidence": "deterministic-stage-1"})
        else:
            transition(db, run, "failed")
            emit(db, run.id, "run.deploy_failed", {"status": preview.status, "reason": preview.stderr[-1000:]})
        db.commit(); return True
    finally: db.close()

def main():
    Base.metadata.create_all(engine)
    while True:
        if not process_once(): time.sleep(1)

if __name__ == "__main__": main()
