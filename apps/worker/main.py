import time
import json
import os
import socket
import subprocess
import threading
from datetime import datetime, timezone
from pathlib import Path
from sqlalchemy import select
from apps.core_api.db import SessionLocal, Base, engine
from apps.core_api.models import WorkflowRun, Approval, Deployment, Task, Artifact, ChangeRequest, Project, AgentRun, EvidenceRecord, Finding
from apps.core_api.service import transition, emit, claim_run, heartbeat_run, release_run
from apps.orchestration.graph import workflow_graph
from apps.orchestration.dag import order_tasks
from apps.core_api.config import settings
from apps.runners.local import LocalDeterministicRunner
from apps.runners.factory import build_runner
from apps.runners.codex import CodexCliRunner
from apps.runners.executor import TaskExecutor
from apps.workspace.git import WorkspaceManager
from apps.verification.runner import run_profile
from apps.verification.routing import route_failure
from apps.verification.artifacts import ArtifactStore
from apps.preview.manager import PreviewManager, RemotePreviewManager
from apps.roles.catalog import render_artifact


def _model_artifact(worktree: Path, role: str, relative_path: str) -> bytes | None:
    """Read a role artifact written by a real runner; never synthesize one."""
    root = (worktree / ".ai-company" / "handoffs" / role).resolve()
    path = (root / relative_path).resolve()
    try:
        path.relative_to(root)
    except ValueError:
        return None
    return path.read_bytes() if path.is_file() else None

def process_once():
    db = SessionLocal()
    owner = f"{socket.gethostname()}:{os.getpid()}"
    claimed_run_id = None
    try:
        run = db.scalar(select(WorkflowRun).where(WorkflowRun.status.in_(["queued", "repairing"])).order_by(WorkflowRun.created_at))
        if not run: return False
        if not claim_run(db, run.id, owner): return False
        claimed_run_id = run.id
        if run.status == "queued":
            transition(db, run, "analyzing")
            db.commit()
        graph_result = workflow_graph.invoke({"run_id": run.id, "repair_count": run.repair_count, "evidence_status": "pass"})
        emit(db, run.id, "orchestration.graph_completed", {"stage": graph_result.get("stage"), "mode": "deterministic"})
        store = ArtifactStore(settings.artifact_root)
        change = db.get(ChangeRequest, run.change_id)
        project = db.get(Project, change.project_id) if change else None
        candidate_root = None
        baseline_root = None
        workspace_manager = WorkspaceManager(settings.workspace_root)
        if project and project.repo:
            repair_base = (run.config_snapshot or {}).get("repair_base_sha") if run.status == "repairing" else None
            base_ref = repair_base or project.accepted_commit or workspace_manager.head(project.repo)
            if run.baseline_sha is None:
                run.baseline_sha = base_ref
            baseline_root = workspace_manager.create_worktree(project.repo, project.id, run.id, "baseline", base_ref)
            candidate_root = workspace_manager.create_candidate(project.repo, project.id, run.id, base_ref)
        if run.baseline_sha is None and project and project.accepted_commit:
            run.baseline_sha = project.accepted_commit
        db.flush()
        try: tasks = order_tasks(list(db.scalars(select(Task).where(Task.run_id == run.id))))
        except ValueError as exc:
            emit(db, run.id, "task.graph_invalid", {"reason": str(exc)})
            for status in ["analyzing", "planning", "implementing"]:
                if run.status != status: transition(db, run, status)
            transition(db, run, "failed"); db.commit(); return True
        repair_owner = (run.config_snapshot or {}).get("repair_owner") if run.status == "repairing" else None
        for task in tasks:
            if repair_owner and task.role != repair_owner:
                continue
            db.refresh(run)
            if run.status == "cancelled":
                emit(db, run.id, "run.cancelled", {"reason": "worker observed cancellation"}); db.commit(); return True
            heartbeat_run(db, run.id, owner)
            task.status = "running"
            emit(db, run.id, "task.started", {"task_id": task.id, "role": task.role})
            role_cfg = (run.config_snapshot or {}).get("roles", {}).get(task.role, {"runner":"ollama", "model": "llama3.2:3b"})
            agent_run = AgentRun(task_id=task.id, attempt=1, runner=role_cfg.get("runner", "ollama"), model=role_cfg.get("model", "llama3.2:3b"), status="running", usage={"status": "unknown"})
            db.add(agent_run); db.flush(); db.commit()
            if role_cfg.get("runner") in {"ollama", "codex-cli", "codex-gateway"}:
                scope = role_cfg.get("file_scope", [])
                if not project or not project.repo or not scope:
                    task.status = "failed"; emit(db, run.id, "task.failed", {"task_id": task.id, "reason": "codex-cli requires project.repo and non-empty role file_scope"})
                    for status in ["analyzing", "planning", "implementing"]:
                        if run.status != status: transition(db, run, status)
                    transition(db, run, "failed"); db.commit(); return True
                manager = workspace_manager
                worktree_task_id = f"{task.id}-r{run.repair_count}"
                # Each writer/reviewer sees the current integrated candidate, not
                # the original baseline. This preserves the DAG handoff contract
                # while keeping every task in its own worktree.
                task_base_sha = manager.head(candidate_root) if candidate_root else (run.baseline_sha or "HEAD")
                worktree = manager.create_worktree(project.repo, project.id, run.id, worktree_task_id, task_base_sha)
                configured_runner = build_runner(role_cfg)
                stop_monitor = threading.Event()
                def monitor_cancellation():
                    while not stop_monitor.wait(0.25):
                        with SessionLocal() as poll_db:
                            current = poll_db.get(WorkflowRun, run.id)
                            if current and current.status in {"cancelled", "cancelling"}:
                                cancel = getattr(configured_runner, "cancel", None)
                                if cancel: cancel()
                                return
                monitor = threading.Thread(target=monitor_cancellation, daemon=True)
                monitor.start()
                repair_reason = (run.config_snapshot or {}).get("repair_reason")
                task_prompt = task.goal if not repair_reason else f"{task.goal}\n\nRepair the trusted verification failure below; preserve all existing behavior and run the relevant regression tests:\n{repair_reason}"
                artifact_paths = [f".ai-company/handoffs/{task.role}/{path}" for path in task.required_artifacts]
                task_prompt = (
                    f"{task_prompt}\n\nRole handoff contract: before finishing, write every required deliverable to the exact paths below. "
                    "Use repository evidence and do not invent facts. These files are part of the trusted handoff; do not only describe them in chat.\n"
                    + "\n".join(f"- {path}" for path in artifact_paths)
                )
                task_prompt += (
                    "\n\nExecution limits: keep this task tightly scoped to the assigned role and file scope. "
                    "Do not run broad repository-wide searches or long test suites. Inspect only the files needed "
                    "to support the handoff, write the required artifacts as soon as you have sufficient evidence, "
                    "then finish with a concise summary. Do not run git commit; the controller commits the scoped "
                    "handoff after your process returns. Never wait for human input."
                )
                if task.role == "project-manager":
                    task_prompt += (
                        " For this PM handoff, do not inspect the repository and do not run shell commands: the "
                        "change request text is the complete brief. Create exactly the three required handoff files "
                        "and return immediately after writing them."
                    )
                try:
                    handoff = TaskExecutor(configured_runner, manager).execute(task.id, task_prompt, worktree, scope, f"task: {task.role} {task.id}", model=role_cfg.get("model"))
                finally:
                    stop_monitor.set(); monitor.join(timeout=2)
                payload_obj = {"schema_version":"1", "task_id":task.id, "status":handoff.status, "summary":handoff.runner_summary, "result_commit":handoff.result_commit, "files_changed":handoff.files_changed, "mode":role_cfg.get("runner"), "failure_category":handoff.failure_category}
                if handoff.status != "completed":
                    db.refresh(run)
                    if run.status in {"cancelled", "cancelling"} or handoff.failure_category == "cancelled":
                        task.status = "cancelled"
                        agent_run.status = "cancelled"
                        agent_run.failure_category = handoff.failure_category or "cancelled"
                        agent_run.finished_at = datetime.now(timezone.utc)
                        emit(db, run.id, "run.cancelled", {"reason": "worker cancelled active runner", "task_id": task.id})
                        db.commit(); return True
                    agent_run.status = handoff.status; agent_run.failure_category = handoff.failure_category; agent_run.finished_at = datetime.now(timezone.utc)
                    task.status = "failed"; emit(db, run.id, "task.failed", payload_obj)
                    for status in ["analyzing", "planning", "implementing"]:
                        if run.status != status: transition(db, run, status)
                    transition(db, run, "failed"); db.commit(); return True
                try:
                    if candidate_root and handoff.result_commit:
                        candidate_sha = manager.cherry_pick(candidate_root, handoff.result_commit)
                        payload_obj["candidate_commit"] = candidate_sha
                except RuntimeError as exc:
                    agent_run.status = "failed"; agent_run.failure_category = "merge_conflict"; agent_run.finished_at = datetime.now(timezone.utc)
                    task.status = "queued"; payload_obj.update({"status": "failed", "failure_category": "merge_conflict", "summary": str(exc)})
                    route = {
                        "owner": "backend-developer",
                        "reason": "Integration cherry-pick conflicted; the existing backend task is re-queued against the candidate base.",
                        "task_id": task.id,
                    }
                    run.config_snapshot = {
                        **(run.config_snapshot or {}),
                        "repair_owner": route["owner"],
                        "repair_base_sha": workspace_manager.head(candidate_root) if candidate_root else run.baseline_sha,
                        "repair_reason": route,
                    }
                    db.add(Finding(run_id=run.id, source="integration", severity="blocking", suggested_owner=route["owner"], reproduction=str(exc), disposition=None))
                    emit(db, run.id, "task.failed", payload_obj)
                    emit(db, run.id, "merge_conflict.routed", route)
                    if run.status != "repairing":
                        transition(db, run, "repairing")
                    if run.repair_count >= 3:
                        transition(db, run, "blocked")
                    else:
                        run.repair_count += 1
                    db.commit(); return True
            else:
                result = LocalDeterministicRunner().run(task.role, task.goal)
                payload_obj = {"schema_version": "1", "task_id": task.id, "status": result.status, "summary": result.summary, "mode": "fixture", "structured": result.structured}
            agent_run.status = payload_obj.get("status", "completed"); agent_run.finished_at = datetime.now(timezone.utc)
            payload = json.dumps(payload_obj, indent=2).encode()
            manifest = store.put_bytes(run.id, f"role-handoffs/{task.role}.json", payload, task.role)
            db.add(Artifact(run_id=run.id, type="role-handoff-manifest", relative_path=manifest["relative_path"], sha256=manifest["sha256"], size=manifest["size"], producer=task.role))
            produced = []
            for relative_path in task.required_artifacts:
                if role_cfg.get("runner") in {"ollama", "codex-cli", "codex-gateway"}:
                    if not candidate_root:
                        task.status = "failed"
                        emit(db, run.id, "task.failed", {"task_id": task.id, "reason": "real runner artifact requires a candidate worktree", "artifact": relative_path})
                        transition(db, run, "failed")
                        db.commit()
                        return True
                    content = _model_artifact(worktree, task.role, relative_path)
                    if content is None:
                        task.status = "failed"
                        emit(db, run.id, "task.failed", {"task_id": task.id, "reason": "real runner completed without required handoff artifact", "artifact": relative_path, "mode": role_cfg.get("runner")})
                        transition(db, run, "failed")
                        db.commit()
                        return True
                else:
                    content = render_artifact(task.role, task.goal, relative_path)
                item = store.put_bytes(run.id, f"role-handoffs/{task.role}/{relative_path}", content, task.role)
                db.add(Artifact(run_id=run.id, type=f"{task.role}-artifact", relative_path=item["relative_path"], sha256=item["sha256"], size=item["size"], producer=task.role))
                produced.append(relative_path)
            expected = set(task.required_artifacts)
            if set(produced) != expected:
                task.status = "failed"
                emit(db, run.id, "task.failed", {"task_id": task.id, "reason": "required role artifact contract was not satisfied"})
                transition(db, run, "failed")
                db.commit()
                return True
            task.status = "completed"
            emit(db, run.id, "task.completed", {"task_id": task.id, "role": task.role, "artifacts": produced, "mode": payload_obj.get("mode", "fixture")})
            # Commit each task boundary so API cancellation/restart observes the
            # task and event before the next long-running role begins.
            db.commit()
        verification_root = candidate_root or Path(os.getenv("VERIFICATION_ROOT", str(Path.cwd())))
        expected_candidate_sha = workspace_manager.head(candidate_root) if candidate_root else None
        evidence = run_profile("product-regression", verification_root, expected_sha=expected_candidate_sha)
        heartbeat_run(db, run.id, owner)
        run.candidate_sha = evidence.candidate_sha
        candidate_sha = evidence.candidate_sha
        if candidate_root and run.baseline_sha and candidate_sha:
            diff_proc = subprocess.run(["git", "diff", "--name-status", run.baseline_sha, candidate_sha], cwd=candidate_root, text=True, capture_output=True, timeout=30)
            diff_files = [{"status": line.split("\t", 1)[0], "path": line.split("\t", 1)[1]} for line in diff_proc.stdout.splitlines() if "\t" in line]
            diff_stat = subprocess.run(["git", "diff", "--shortstat", run.baseline_sha, candidate_sha], cwd=candidate_root, text=True, capture_output=True, timeout=30)
            run.config_snapshot = {**(run.config_snapshot or {}), "candidate_diff": {"available": diff_proc.returncode == 0, "files": diff_files, "stat": diff_stat.stdout.strip() or None, "reason": None if diff_proc.returncode == 0 else diff_proc.stderr[-500:]}}
            emit(db, run.id, "candidate.diff_recorded", {"baseline_sha": run.baseline_sha, "candidate_sha": candidate_sha, "files_changed": len(diff_files)})
        for artifact in db.scalars(select(Artifact).where(Artifact.run_id == run.id)):
            artifact.commit_sha = evidence.candidate_sha
        evidence_path = store.put_bytes(run.id, f"evidence/{evidence.check_id}.json", json.dumps(evidence.__dict__, indent=2).encode(), "trusted-verification")
        db.add(Artifact(run_id=run.id, type="trusted-evidence", relative_path=evidence_path["relative_path"], sha256=evidence_path["sha256"], size=evidence_path["size"], producer="trusted-verification", commit_sha=evidence.candidate_sha))
        db.add(EvidenceRecord(run_id=run.id, candidate_sha=evidence.candidate_sha, check_id=evidence.check_id, command=evidence.command, exit_code=evidence.exit_code, status=evidence.status, report_ref=evidence_path["relative_path"], payload=evidence.__dict__))
        emit(db, run.id, "verification.completed", {"check_id": evidence.check_id, "status": evidence.status, "candidate_sha": evidence.candidate_sha, "report": evidence_path["relative_path"]})
        if evidence.status != "pass":
            route = route_failure(evidence.stdout, evidence.stderr)
            run.config_snapshot = {**(run.config_snapshot or {}), "repair_owner": route["owner"], "repair_base_sha": evidence.candidate_sha, "repair_reason": route}
            db.add(Finding(run_id=run.id, source="trusted-verification", severity="blocking", file=route.get("file"), line=route.get("line"), suggested_owner=route["owner"], reproduction=evidence.reason or evidence.stderr[-2000:], disposition=None))
            emit(db, run.id, "repair.routed", route)
            if run.repair_count >= 3:
                if run.status != "repairing":
                    for status in ["analyzing", "planning", "implementing", "integrating", "verifying"]:
                        if run.status != status: transition(db, run, status)
                    transition(db, run, "repairing")
                transition(db, run, "blocked")
            elif run.status == "repairing":
                run.repair_count += 1
            else:
                for status in ["analyzing", "planning", "implementing", "integrating", "verifying"]:
                    if run.status != status: transition(db, run, status)
                run.repair_count += 1; transition(db, run, "repairing")
            db.commit(); return True
        statuses = ["analyzing", "planning", "implementing", "integrating", "verifying", "deploying"]
        if run.status == "repairing":
            transition(db, run, "implementing")
            statuses = ["integrating", "verifying", "deploying"]
        for status in statuses:
            if run.status == status: continue
            transition(db, run, status)
        db.flush()
        db.refresh(run)
        if run.status == "cancelled":
            emit(db, run.id, "run.cancelled", {"reason": "worker observed cancellation before deployment"}); db.commit(); return True
        heartbeat_run(db, run.id, owner)
        preview_url = os.getenv("PREVIEW_MANAGER_URL")
        preview_manager = RemotePreviewManager(preview_url) if preview_url else PreviewManager("compose.yaml")
        baseline_preview = None
        if baseline_root:
            try:
                baseline_workspace = str(baseline_root.relative_to(Path("/workspace"))).replace("\\", "/")
            except ValueError:
                baseline_workspace = None
            baseline_preview = preview_manager.up(f"baseline-{run.id[:8]}", "storefront-api", 8200, workspace=baseline_workspace)
        preview_workspace = None
        if candidate_root:
            try:
                preview_workspace = str(candidate_root.relative_to(Path("/workspace"))).replace("\\", "/")
            except ValueError:
                preview_workspace = None
        preview = preview_manager.up(f"preview-{run.id[:8]}", "storefront-api", 8200, workspace=preview_workspace)
        run.config_snapshot = {
            **(run.config_snapshot or {}),
            "previews": {
                "baseline": {
                    "url": baseline_preview.url if baseline_preview else None,
                    "status": baseline_preview.status if baseline_preview else "not_available",
                    "commit_sha": run.baseline_sha,
                    "image_digest": baseline_preview.image_digest if baseline_preview else None,
                },
                "candidate": {
                    "url": preview.url,
                    "status": preview.status,
                    "commit_sha": candidate_sha,
                    "image_digest": preview.image_digest,
                },
            },
        }
        db.add(Deployment(run_id=run.id, commit_sha=candidate_sha, image_digest=preview.image_digest, status=preview.status, url=preview.url, health_evidence={"status": preview.status, "stderr": preview.stderr[-1000:]}, smoke_evidence={"status":"not_run", "reason":"preview-manager health gate is complete; browser/business smoke is PO-facing"}))
        evidence_record = db.scalar(select(EvidenceRecord).where(EvidenceRecord.run_id == run.id, EvidenceRecord.check_id == evidence.check_id).order_by(EvidenceRecord.id.desc()))
        if evidence_record:
            evidence_record.image_digest = preview.image_digest
        if preview.status == "ready":
            transition(db, run, "awaiting_acceptance")
            db.add(Approval(run_id=run.id, kind="candidate", artifact_version=candidate_sha or run.id, candidate_sha=candidate_sha, status="pending"))
            emit(db, run.id, "run.awaiting_acceptance", {"evidence": "deterministic-stage-1"})
        else:
            transition(db, run, "failed")
            emit(db, run.id, "run.deploy_failed", {"status": preview.status, "reason": preview.stderr[-1000:]})
        db.commit(); return True
    except Exception as exc:
        if claimed_run_id:
            try:
                db.rollback()
                failed_run = db.get(WorkflowRun, claimed_run_id)
                if failed_run and failed_run.status not in {"failed", "blocked", "cancelled", "accepted", "rejected"}:
                    for status in ["analyzing", "planning", "implementing", "integrating", "verifying", "deploying", "repairing"]:
                        if failed_run.status != status:
                            try: transition(db, failed_run, status)
                            except ValueError: pass
                    if failed_run.status not in {"failed", "blocked", "cancelled", "accepted", "rejected"}:
                        transition(db, failed_run, "failed")
                    emit(db, failed_run.id, "run.failed", {"category": "worker_exception", "error": str(exc)[-2000:]})
                    db.commit()
            except Exception:
                db.rollback()
        return True
    finally:
        if claimed_run_id:
            release_run(db, claimed_run_id, owner)
        db.close()

def main():
    Base.metadata.create_all(engine)
    while True:
        if not process_once(): time.sleep(1)

if __name__ == "__main__": main()
