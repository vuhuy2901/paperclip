"""Orchestrator for the Codex PM Arena Tournament."""

from __future__ import annotations
import concurrent.futures
import json
import logging
import os
import subprocess
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from apps.workspace.git import WorkspaceManager
from apps.runners.executor import ExecutionHandoff

from .strategies import get_strategies_for_count, PMStrategy
from .router import resolve_pm_count
from .prompts import (
    build_shared_context_summary,
    build_draft_prompt,
    build_arbiter_prompt,
    build_finalizer_prompt,
)
from .validator import DeterministicQualityGate, QualityGateResult

logger = logging.getLogger("pm_arena")


@dataclass
class ArenaTelemetry:
    mode: str
    pm_count: int
    router_reason: str
    model_calls: int = 0
    duration_seconds: float = 0.0
    status: str = "pending"
    winner_id: str | None = None
    grafted_count: int = 0
    quality_gate_passed: bool = False
    repair_attempts: int = 0


class PMArenaRunner:
    """Coordinates N competing PM candidates, single-pass Arbiter, and Deterministic Quality Gate."""

    def __init__(
        self,
        runner: Any,
        workspace: WorkspaceManager,
        max_repairs: int = 2,
        default_mode: str = "auto",
    ):
        self.runner = runner
        self.workspace = workspace
        self.max_repairs = max_repairs
        self.default_mode = default_mode

    def _extract_json(self, text: str) -> dict | None:
        """Extract JSON object from model response, tolerating markdown wrappers."""
        text = text.strip()
        if text.startswith("```"):
            lines = text.splitlines()
            if len(lines) >= 2 and lines[-1].startswith("```"):
                text = "\n".join(lines[1:-1]).strip()
                if text.lower().startswith("json"):
                    text = text[4:].strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1 and end > start:
                try:
                    return json.loads(text[start : end + 1])
                except json.JSONDecodeError:
                    return None
            return None

    def execute(
        self,
        task_id: str,
        prompt: str,
        worktree: str | Path,
        file_scope: list[str],
        commit_message: str,
        model: str | None = None,
    ) -> ExecutionHandoff:
        start_time = time.time()
        worktree_path = Path(worktree).resolve()
        handoff_dir = worktree_path / ".ai-company" / "handoffs" / "project-manager"
        handoff_dir.mkdir(parents=True, exist_ok=True)

        # 1. Routing: resolve PM count
        pm_count, router_reason = resolve_pm_count(prompt, default_mode=self.default_mode)
        strategies = get_strategies_for_count(pm_count)

        telemetry = ArenaTelemetry(
            mode="manual" if "manual" in router_reason else "auto",
            pm_count=pm_count,
            router_reason=router_reason,
        )

        shared_context = build_shared_context_summary(prompt)
        winner_strategy = strategies[0]
        winner_draft: dict = {}
        grafted_items: list[dict] = []
        arbiter_evaluations: list[dict] = []
        arbiter_summary = ""

        # 2. Candidate Phase
        if pm_count == 1:
            # 1 PM bypass: No tournament needed, go directly to single draft
            telemetry.model_calls += 1
            draft_prompt = build_draft_prompt(prompt, winner_strategy, shared_context)
            draft_res = self.runner.run(draft_prompt, worktree_path, model=model)
            parsed_draft = self._extract_json(draft_res.summary) or {
                "candidate_id": winner_strategy.id,
                "approach_summary": f"Single PM plan following {winner_strategy.name}",
                "files_to_modify": [],
                "tasks": [],
                "acceptance_criteria": [],
            }
            winner_draft = parsed_draft
            telemetry.winner_id = winner_strategy.id
            arbiter_summary = "Single PM mode selected via router; tournament bypassed."
        else:
            # 2..4 PM Parallel Tournament
            drafts: list[dict] = []

            def run_candidate(strat: PMStrategy) -> dict:
                d_prompt = build_draft_prompt(prompt, strat, shared_context)
                res = self.runner.run(d_prompt, worktree_path, model=model)
                parsed = self._extract_json(res.summary)
                if not parsed or not isinstance(parsed, dict):
                    parsed = {
                        "candidate_id": strat.id,
                        "approach_summary": f"Draft proposal following {strat.name}",
                        "files_to_modify": [],
                        "tasks": [],
                        "acceptance_criteria": [],
                    }
                return parsed

            with concurrent.futures.ThreadPoolExecutor(max_workers=min(pm_count, 4)) as executor:
                futures = [executor.submit(run_candidate, strat) for strat in strategies]
                for f in concurrent.futures.as_completed(futures):
                    telemetry.model_calls += 1
                    try:
                        drafts.append(f.result())
                    except Exception as exc:
                        logger.warning("Error running PM candidate: %s", exc)

            if not drafts:
                return ExecutionHandoff(
                    status="failed",
                    agent_run_id=task_id,
                    result_commit=None,
                    files_changed=[],
                    runner_summary="PM Arena: All candidate drafts failed to execute.",
                    failure_category="candidate_generation_failed",
                )

            # 3. Single-pass Arbiter Phase
            telemetry.model_calls += 1
            arbiter_prompt = build_arbiter_prompt(prompt, drafts, shared_context)
            arbiter_res = self.runner.run(arbiter_prompt, worktree_path, model=model)
            arbiter_verdict = self._extract_json(arbiter_res.summary) or {}

            arbiter_status = arbiter_verdict.get("status", "WINNER_SELECTED")
            arbiter_evaluations = arbiter_verdict.get("evaluations", [])
            arbiter_summary = arbiter_verdict.get("summary", "Arbiter completed evaluation.")
            raw_winner_id = arbiter_verdict.get("winner_id")
            grafted_items = arbiter_verdict.get("grafted_items", [])
            telemetry.grafted_count = len(grafted_items)

            # Check Hard Gate failure: NO_VALID_WINNER
            if arbiter_status == "NO_VALID_WINNER" or not raw_winner_id:
                telemetry.status = "NO_VALID_WINNER"
                telemetry.duration_seconds = time.time() - start_time

                report = {
                    "status": "NO_VALID_WINNER",
                    "telemetry": telemetry.__dict__,
                    "arbiter_summary": arbiter_summary,
                    "evaluations": arbiter_evaluations,
                }
                (handoff_dir / "pm-arena-report.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

                return ExecutionHandoff(
                    status="failed",
                    agent_run_id=task_id,
                    result_commit=None,
                    files_changed=[],
                    runner_summary=f"PM Arena Arbiter rejected all proposals (NO_VALID_WINNER): {arbiter_summary}",
                    failure_category="no_valid_winner",
                )

            telemetry.winner_id = raw_winner_id
            for d in drafts:
                if d.get("candidate_id") == raw_winner_id:
                    winner_draft = d
                    break
            if not winner_draft and drafts:
                winner_draft = drafts[0]
                telemetry.winner_id = winner_draft.get("candidate_id")

        # 4. Finalizer Phase: Winner generates authoritative deliverables
        telemetry.model_calls += 1
        finalizer_prompt = build_finalizer_prompt(prompt, winner_draft, grafted_items, shared_context)
        self.runner.run(finalizer_prompt, worktree_path, model=model)

        # Ensure fallback deliverables exist if runner didn't write them directly
        self._ensure_baseline_deliverables(handoff_dir, prompt, winner_draft, grafted_items)

        # 5. Deterministic Quality Gate & Bounded Repair Loop
        repair_attempts = 0
        qg_result = DeterministicQualityGate.validate(worktree_path, change_text=prompt)

        while not qg_result.passed and repair_attempts < self.max_repairs:
            repair_attempts += 1
            telemetry.repair_attempts = repair_attempts
            telemetry.model_calls += 1
            logger.info("Quality Gate failed (%d/%d): %s", repair_attempts, self.max_repairs, qg_result.errors)

            repair_prompt = build_finalizer_prompt(
                prompt,
                winner_draft,
                grafted_items,
                shared_context,
                repair_errors=qg_result.errors,
            )
            self.runner.run(repair_prompt, worktree_path, model=model)
            qg_result = DeterministicQualityGate.validate(worktree_path, change_text=prompt)

        telemetry.quality_gate_passed = qg_result.passed
        telemetry.duration_seconds = time.time() - start_time
        telemetry.status = "completed" if qg_result.passed else "quality_gate_failed"

        # 6. Save comprehensive tournament report
        report_data = {
            "schema_version": "1",
            "task_id": task_id,
            "telemetry": telemetry.__dict__,
            "winner": {
                "id": telemetry.winner_id,
                "strategy": next((s.name for s in strategies if s.id == telemetry.winner_id), "Unknown"),
            },
            "arbiter_summary": arbiter_summary,
            "evaluations": arbiter_evaluations,
            "grafted_items": grafted_items,
            "quality_gate": {
                "passed": qg_result.passed,
                "errors": qg_result.errors,
                "warnings": qg_result.warnings,
            },
        }
        (handoff_dir / "pm-arena-report.json").write_text(json.dumps(report_data, indent=2, ensure_ascii=False), encoding="utf-8")

        if not qg_result.passed:
            return ExecutionHandoff(
                status="failed",
                agent_run_id=task_id,
                result_commit=None,
                files_changed=[],
                runner_summary=f"Deterministic Quality Gate failed after {repair_attempts} repairs: {'; '.join(qg_result.errors)}",
                failure_category="quality_gate_failed",
            )

        # 7. Commit changes to Git worktree
        status_out = ""
        try:
            status_res = subprocess.run(
                ["git", "status", "--porcelain", "--", *file_scope],
                cwd=worktree_path,
                text=True,
                capture_output=True,
            )
            if status_res.returncode == 0:
                status_out = status_res.stdout
        except Exception:
            pass

        changed = [line[3:].strip() for line in status_out.splitlines() if len(line) > 3]
        if not changed:
            # Fallback for environments where git porcelain doesn't register uncommitted tracked files
            for req in (".ai-company/handoffs/project-manager/prd.md", ".ai-company/handoffs/project-manager/acceptance.json", ".ai-company/handoffs/project-manager/task-graph.json"):
                if (worktree_path / req).is_file():
                    changed.append(req)

        if not changed:
            return ExecutionHandoff(
                status="failed",
                agent_run_id=task_id,
                result_commit=None,
                files_changed=[],
                runner_summary="PM Arena completed but no files were modified in scope",
                failure_category="no_change",
            )

        commit = self.workspace.commit(worktree_path, commit_message, file_scope)
        summary = (
            f"PM Arena completed [{telemetry.pm_count} PMs, winner: {telemetry.winner_id}, "
            f"{telemetry.model_calls} model calls, {telemetry.grafted_count} grafted items, QG: PASS]"
        )
        return ExecutionHandoff("completed", task_id, commit, changed, summary)

    def _ensure_baseline_deliverables(
        self,
        handoff_dir: Path,
        change_text: str,
        winner_draft: dict,
        grafted_items: list[dict],
    ) -> None:
        """Guarantee valid baseline deliverables exist if model only printed to stdout."""
        prd_file = handoff_dir / "prd.md"
        if not prd_file.is_file() or prd_file.stat().st_size == 0:
            approach = winner_draft.get("approach_summary", "Implement PO requirement with high quality.")
            prd_content = (
                f"# Product Requirements Document (PRD)\n\n"
                f"## 1. Overview & Strategy\n"
                f"{approach}\n\n"
                f"## 2. PO Requirement Brief\n"
                f"{change_text}\n\n"
                f"## 3. Scope & Protected Files\n"
                f"- Modify: {', '.join(winner_draft.get('files_to_modify', [])) or 'Target storefront application'}\n"
                f"- Protect: Existing regression test suites, payment gateways, and stable endpoints.\n\n"
                f"## 4. Implementation Guidelines\n"
                f"All changes must be thoroughly test-covered and adhere to system contracts."
            )
            prd_file.write_text(prd_content, encoding="utf-8")

        acc_file = handoff_dir / "acceptance.json"
        if not acc_file.is_file() or acc_file.stat().st_size == 0:
            criteria = winner_draft.get("acceptance_criteria", [])
            for item in grafted_items:
                content = item.get("content")
                if content and isinstance(content, dict):
                    criteria.append(content)
            if not criteria:
                criteria = [{"id": "AC-1", "description": f"Verify change: {change_text[:60]}", "type": "functional"}]
            acc_data = {"schema_version": "1", "change_id": "change-request", "criteria": criteria}
            acc_file.write_text(json.dumps(acc_data, indent=2, ensure_ascii=False), encoding="utf-8")

        task_file = handoff_dir / "task-graph.json"
        if not task_file.is_file() or task_file.stat().st_size == 0:
            tasks = winner_draft.get("tasks", [])
            if not tasks:
                tasks = [
                    {"id": "task-architect", "role": "architect", "goal": "Analyze architecture and impact", "depends_on": []},
                    {"id": "task-backend", "role": "backend-developer", "goal": "Implement backend changes", "depends_on": ["task-architect"]},
                    {"id": "task-frontend", "role": "frontend-developer", "goal": "Implement frontend changes", "depends_on": ["task-architect"]},
                    {"id": "task-tester", "role": "tester", "goal": "Run regression and trusted tests", "depends_on": ["task-backend", "task-frontend"]},
                    {"id": "task-devops", "role": "devops", "goal": "Build preview container", "depends_on": ["task-tester"]},
                ]
            tg_data = {"schema_version": "1", "tasks": tasks}
            task_file.write_text(json.dumps(tg_data, indent=2, ensure_ascii=False), encoding="utf-8")
