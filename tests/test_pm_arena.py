"""Unit and integration tests for the Codex PM Arena Skill."""

import json
from pathlib import Path
from types import SimpleNamespace
import pytest

from apps.roles.pm_arena.strategies import (
    STRATEGIES,
    get_strategies_for_count,
    PMStrategy,
)
from apps.roles.pm_arena.router import (
    detect_manual_count,
    calculate_heuristic_score,
    resolve_pm_count,
)
from apps.roles.pm_arena.validator import (
    DeterministicQualityGate,
    QualityGateResult,
)
from apps.roles.pm_arena.runner import PMArenaRunner, ArenaTelemetry
from apps.runners.executor import ExecutionHandoff


# ============================================================================
# 1. Router & Heuristic Tests
# ============================================================================

def test_detect_manual_count_from_prompts():
    assert detect_manual_count("Hãy chạy 2 pm để đấu loại") == 2
    assert detect_manual_count("Tôi muốn dùng 3 pms cho tính năng này") == 3
    assert detect_manual_count("Yêu cầu: add VIP pricing. 4 pm") == 4
    assert detect_manual_count("run 1 pm please") == 1
    assert detect_manual_count("chạy 5 pm") is None  # > 4 is out of bounds
    assert detect_manual_count("Thêm tính năng đăng nhập đơn giản") is None


def test_heuristic_complexity_scoring_and_routing():
    # Trivial / Cosmetic change -> 1 PM
    trivial_prompt = "Chỉnh sửa màu nút button và sửa typo trong readme"
    count, reason = resolve_pm_count(trivial_prompt, default_mode="auto")
    assert count == 1
    assert "trivial" in reason or "score=" in reason

    # Moderate change -> 2 PMs
    moderate_prompt = "Thêm API endpoint filter sản phẩm theo category và status"
    count, reason = resolve_pm_count(moderate_prompt, default_mode="auto")
    assert count in (2, 3)

    # High complexity change -> 3 or 4 PMs
    high_risk_prompt = (
        "Thêm tính năng VIP pricing, tính toán chiết khấu đơn hàng checkout, "
        "kết hợp phí shipping và migration database schema đơn hàng"
    )
    count, reason = resolve_pm_count(high_risk_prompt, default_mode="auto")
    assert count in (3, 4)
    assert "score=" in reason

    # Manual override takes precedence over heuristics
    override_prompt = "Thêm tính năng VIP pricing checkout cực kỳ phức tạp. Hãy dùng 2 pm"
    count, reason = resolve_pm_count(override_prompt, default_mode="auto")
    assert count == 2
    assert "manual" in reason


# ============================================================================
# 2. Strategy Definition Tests
# ============================================================================

def test_strategies_generation_and_distinct_personas():
    assert len(STRATEGIES) == 4
    for count in range(1, 5):
        strats = get_strategies_for_count(count)
        assert len(strats) == count
        assert len({s.id for s in strats}) == count

    assert get_strategies_for_count(10) == get_strategies_for_count(4)
    assert get_strategies_for_count(0) == get_strategies_for_count(1)


# ============================================================================
# 3. Deterministic Quality Gate Tests
# ============================================================================

def test_quality_gate_passes_on_valid_deliverables(tmp_path):
    handoff = tmp_path / ".ai-company" / "handoffs" / "project-manager"
    handoff.mkdir(parents=True)

    (handoff / "prd.md").write_text(
        "# PRD: VIP Pricing\n\n## Overview\nThis is a comprehensive PRD with sufficient detail for the development team.",
        encoding="utf-8",
    )
    (handoff / "acceptance.json").write_text(
        json.dumps({
            "criteria": [
                {"id": "AC-1", "description": "VIP users get 10% discount on cart items", "type": "functional"}
            ]
        }),
        encoding="utf-8",
    )
    (handoff / "task-graph.json").write_text(
        json.dumps({
            "tasks": [
                {"id": "task-architect", "role": "architect", "goal": "Architecture design", "depends_on": []},
                {"id": "task-backend", "role": "backend-developer", "goal": "Implement pricing logic", "depends_on": ["task-architect"]},
                {"id": "task-tester", "role": "tester", "goal": "Run regression suite", "depends_on": ["task-backend"]}
            ]
        }),
        encoding="utf-8",
    )

    result = DeterministicQualityGate.validate(tmp_path, change_text="VIP Pricing")
    assert result.passed is True
    assert len(result.errors) == 0


def test_quality_gate_fails_on_missing_file(tmp_path):
    handoff = tmp_path / ".ai-company" / "handoffs" / "project-manager"
    handoff.mkdir(parents=True)
    (handoff / "prd.md").write_text("Detailed PRD content with long length...", encoding="utf-8")
    (handoff / "acceptance.json").write_text(json.dumps({"criteria": [{"id": "AC-1", "description": "test"}]}), encoding="utf-8")
    # task-graph.json is deliberately missing

    result = DeterministicQualityGate.validate(tmp_path)
    assert result.passed is False
    assert any("Missing required artifact: task-graph.json" in e for e in result.errors)


def test_quality_gate_detects_dag_cycle(tmp_path):
    handoff = tmp_path / ".ai-company" / "handoffs" / "project-manager"
    handoff.mkdir(parents=True)
    (handoff / "prd.md").write_text("Detailed PRD content with long length...", encoding="utf-8")
    (handoff / "acceptance.json").write_text(json.dumps({"criteria": [{"id": "AC-1", "description": "test"}]}), encoding="utf-8")
    (handoff / "task-graph.json").write_text(
        json.dumps({
            "tasks": [
                {"id": "task-a", "role": "backend", "depends_on": ["task-b"]},
                {"id": "task-b", "role": "frontend", "depends_on": ["task-a"]}
            ]
        }),
        encoding="utf-8",
    )

    result = DeterministicQualityGate.validate(tmp_path)
    assert result.passed is False
    assert any("Circular dependency cycle detected" in e for e in result.errors)


def test_quality_gate_detects_duplicate_task_id(tmp_path):
    handoff = tmp_path / ".ai-company" / "handoffs" / "project-manager"
    handoff.mkdir(parents=True)
    (handoff / "prd.md").write_text("Detailed PRD content with long length...", encoding="utf-8")
    (handoff / "acceptance.json").write_text(json.dumps({"criteria": [{"id": "AC-1", "description": "test"}]}), encoding="utf-8")
    (handoff / "task-graph.json").write_text(
        json.dumps({
            "tasks": [
                {"id": "task-same", "role": "backend", "depends_on": []},
                {"id": "task-same", "role": "frontend", "depends_on": []}
            ]
        }),
        encoding="utf-8",
    )

    result = DeterministicQualityGate.validate(tmp_path)
    assert result.passed is False
    assert any("Duplicate task ID detected" in e for e in result.errors)


# ============================================================================
# 4. PMArenaRunner Full Lifecycle Tests (with Mock Runner & Workspace)
# ============================================================================

class MockModelRunner:
    def __init__(self, arbiter_verdict: dict | None = None):
        self.call_count = 0
        self.arbiter_verdict = arbiter_verdict or {
            "status": "WINNER_SELECTED",
            "winner_id": "minimalist",
            "summary": "Minimalist plan has the highest regression safety.",
            "evaluations": [
                {
                    "candidate_id": "minimalist",
                    "hard_gate_passed": True,
                    "disqualification_reason": None,
                    "scores": {"safety": 9.5, "completeness": 9.0, "feasibility": 9.0, "cost_efficiency": 9.0, "total_weighted": 9.15},
                    "critique": "Solid plan with zero unnecessary changes."
                }
            ],
            "grafted_items": [
                {
                    "source_candidate": "edge_case",
                    "item_type": "acceptance_criterion",
                    "content": {"id": "AC-GRAFT-1", "description": "Reject negative VIP discount values", "type": "regression"},
                    "compatibility_rationale": "Directly strengthens validation without altering schema."
                }
            ]
        }

    def run(self, prompt: str, cwd: Path, model: str | None = None):
        self.call_count += 1
        if "You are competing in the AI Software Company PM Arena" in prompt:
            # Candidate Draft call
            draft = {
                "candidate_id": "minimalist" if "minimalist" in prompt else "edge_case",
                "approach_summary": "Clean minimal approach for VIP pricing",
                "files_to_modify": ["templates/storefront/backend/main.py"],
                "tasks": [
                    {"id": "task-arch", "role": "architect", "depends_on": []},
                    {"id": "task-be", "role": "backend-developer", "depends_on": ["task-arch"]},
                    {"id": "task-test", "role": "tester", "depends_on": ["task-be"]}
                ],
                "acceptance_criteria": [
                    {"id": "AC-1", "description": "VIP pricing applies accurately", "type": "functional"}
                ]
            }
            return SimpleNamespace(status="completed", summary=json.dumps(draft))

        if "You are the Lead Arbiter" in prompt:
            # Arbiter call
            return SimpleNamespace(status="completed", summary=json.dumps(self.arbiter_verdict))

        if "You are the winning Project Manager" in prompt:
            # Finalizer call
            handoff = cwd / ".ai-company" / "handoffs" / "project-manager"
            handoff.mkdir(parents=True, exist_ok=True)
            (handoff / "prd.md").write_text(
                "# Authoritative Product Requirements Document\n\n"
                "## 1. Executive Summary\n"
                "This document specifies the exact functional and architectural requirements for VIP pricing.\n"
                "## 2. Scope & Technical Constraints\n"
                "Developers must preserve all existing test cases and implement defensive validation.",
                encoding="utf-8",
            )
            (handoff / "acceptance.json").write_text(json.dumps({
                "criteria": [
                    {"id": "AC-1", "description": "VIP pricing works properly", "type": "functional"},
                    {"id": "AC-GRAFT-1", "description": "Reject negative VIP discount values", "type": "regression"}
                ]
            }), encoding="utf-8")
            (handoff / "task-graph.json").write_text(json.dumps({
                "tasks": [
                    {"id": "task-arch", "role": "architect", "depends_on": []},
                    {"id": "task-be", "role": "backend-developer", "depends_on": ["task-arch"]},
                    {"id": "task-test", "role": "tester", "depends_on": ["task-be"]}
                ]
            }), encoding="utf-8")
            return SimpleNamespace(status="completed", summary="Deliverables written.")

        return SimpleNamespace(status="completed", summary="{}")


class MockWorkspaceManager:
    def commit(self, worktree, message, file_scope):
        return "mock_commit_sha_123456"


def test_arena_runner_successful_tournament(tmp_path):
    mock_runner = MockModelRunner()
    mock_workspace = MockWorkspaceManager()

    arena = PMArenaRunner(mock_runner, mock_workspace)
    handoff = arena.execute(
        task_id="test-pm-task",
        prompt="Thêm VIP pricing cho khách hàng thân thiết. Chạy 2 pm",
        worktree=tmp_path,
        file_scope=[".ai-company/handoffs/project-manager"],
        commit_message="task: project-manager test-pm-task",
    )

    assert handoff.status == "completed"
    assert handoff.result_commit == "mock_commit_sha_123456"
    assert "PM Arena completed" in handoff.runner_summary
    assert "winner: minimalist" in handoff.runner_summary

    # Verify report was generated
    report_file = tmp_path / ".ai-company" / "handoffs" / "project-manager" / "pm-arena-report.json"
    assert report_file.is_file()
    report = json.loads(report_file.read_text(encoding="utf-8"))
    assert report["telemetry"]["pm_count"] == 2
    assert report["winner"]["id"] == "minimalist"
    assert len(report["grafted_items"]) == 1
    assert report["quality_gate"]["passed"] is True


def test_arena_runner_handles_no_valid_winner_safe_abort(tmp_path):
    disqualified_verdict = {
        "status": "NO_VALID_WINNER",
        "winner_id": None,
        "summary": "All candidates failed Hard Gate 1 (Breaking database schema without migration).",
        "evaluations": [
            {
                "candidate_id": "minimalist",
                "hard_gate_passed": False,
                "disqualification_reason": "Proposed dropping existing orders table without migration."
            }
        ],
        "grafted_items": []
    }
    mock_runner = MockModelRunner(arbiter_verdict=disqualified_verdict)
    mock_workspace = MockWorkspaceManager()

    arena = PMArenaRunner(mock_runner, mock_workspace)
    handoff = arena.execute(
        task_id="test-disqualified-task",
        prompt="Drop toàn bộ database orders và viết lại. Dùng 2 pm",
        worktree=tmp_path,
        file_scope=[".ai-company/handoffs/project-manager"],
        commit_message="task: project-manager test",
    )

    # Must safely abort and report to PO without committing unsafe artifacts
    assert handoff.status == "failed"
    assert handoff.failure_category == "no_valid_winner"
    assert "NO_VALID_WINNER" in handoff.runner_summary

    report_file = tmp_path / ".ai-company" / "handoffs" / "project-manager" / "pm-arena-report.json"
    assert report_file.is_file()
    report = json.loads(report_file.read_text(encoding="utf-8"))
    assert report["status"] == "NO_VALID_WINNER"
