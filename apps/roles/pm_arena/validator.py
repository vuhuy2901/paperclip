"""Deterministic Quality Gate for PM deliverables (Pure Python / 0 Token overhead).

Validates prd.md, acceptance.json, and task-graph.json before handover to downstream roles.
"""

from __future__ import annotations
import json
import re
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class QualityGateResult:
    passed: bool
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


class DeterministicQualityGate:
    """Rigorous programmatic validator checking deliverables against schema and DAG invariants."""

    REQUIRED_FILES = ("prd.md", "acceptance.json", "task-graph.json")

    @classmethod
    def validate(cls, base_dir: Path | str, change_text: str | None = None) -> QualityGateResult:
        root = Path(base_dir)
        handoff_dir = root / ".ai-company" / "handoffs" / "project-manager"
        if not handoff_dir.is_dir():
            handoff_dir = root  # Fallback if checked directly in target dir

        errors: list[str] = []
        warnings: list[str] = []

        # 1. File existence checks
        for fname in cls.REQUIRED_FILES:
            fpath = handoff_dir / fname
            if not fpath.is_file():
                errors.append(f"Missing required artifact: {fname}")
            elif fpath.stat().st_size == 0:
                errors.append(f"Artifact is empty: {fname}")

        if errors:
            return QualityGateResult(passed=False, errors=errors, warnings=warnings)

        # 2. PRD validation
        prd_path = handoff_dir / "prd.md"
        prd_text = prd_path.read_text(encoding="utf-8", errors="replace")
        if len(prd_text.strip()) < 100:
            errors.append("prd.md is too short (< 100 characters) to be an actionable specification.")

        if change_text:
            # Check if key tokens from change_text are referenced
            change_words = [w.lower() for w in re.findall(r"\b\w{4,}\b", change_text)]
            covered = sum(1 for w in change_words if w in prd_text.lower())
            if change_words and (covered / len(change_words)) < 0.2:
                warnings.append("PRD text may have low conceptual overlap with the PO change request.")

        # 3. Acceptance JSON validation
        acc_path = handoff_dir / "acceptance.json"
        try:
            acc_data = json.loads(acc_path.read_text(encoding="utf-8", errors="replace"))
            criteria = acc_data.get("criteria", [])
            if not isinstance(criteria, list) or len(criteria) == 0:
                errors.append("acceptance.json must contain a non-empty 'criteria' list.")
            else:
                for i, crit in enumerate(criteria):
                    if not isinstance(crit, dict):
                        errors.append(f"acceptance.json criterion #{i} is not a valid object.")
                        continue
                    if not crit.get("id"):
                        errors.append(f"acceptance.json criterion #{i} is missing an 'id'.")
                    if not crit.get("description") or len(str(crit["description"]).strip()) < 5:
                        errors.append(f"acceptance.json criterion #{i} has an empty or trivial description.")
        except json.JSONDecodeError as exc:
            errors.append(f"acceptance.json is invalid JSON: {exc}")

        # 4. Task Graph DAG validation
        task_path = handoff_dir / "task-graph.json"
        try:
            tg_data = json.loads(task_path.read_text(encoding="utf-8", errors="replace"))
            tasks = tg_data.get("tasks", [])
            if not isinstance(tasks, list) or len(tasks) == 0:
                errors.append("task-graph.json must contain a non-empty 'tasks' list.")
            else:
                task_ids: set[str] = set()
                role_set: set[str] = set()
                adj: dict[str, list[str]] = {}

                for i, t in enumerate(tasks):
                    if not isinstance(t, dict):
                        errors.append(f"task-graph.json task #{i} is not an object.")
                        continue
                    tid = t.get("id") or t.get("task_id")
                    role = t.get("role")
                    if not tid:
                        errors.append(f"task #{i} is missing a unique 'id'.")
                        continue
                    if tid in task_ids:
                        errors.append(f"Duplicate task ID detected in task-graph: '{tid}'.")
                    task_ids.add(tid)
                    if role:
                        role_set.add(role)
                    adj[tid] = t.get("depends_on", [])

                # Check dependency references
                for tid, deps in adj.items():
                    for dep in deps:
                        if dep not in task_ids and dep not in role_set:
                            errors.append(f"Task '{tid}' depends on non-existent task or role '{dep}'.")

                # Check for DAG cycles using topological sort / DFS cycle detection
                visited: dict[str, int] = {}  # 0: unvisited, 1: visiting (in stack), 2: visited

                def has_cycle(node: str) -> bool:
                    visited[node] = 1
                    for neighbor in adj.get(node, []):
                        # only check valid task nodes
                        if neighbor in adj:
                            if visited.get(neighbor) == 1:
                                return True
                            if visited.get(neighbor) == 0 and has_cycle(neighbor):
                                return True
                    visited[node] = 2
                    return False

                for tid in task_ids:
                    visited[tid] = 0

                for tid in task_ids:
                    if visited[tid] == 0:
                        if has_cycle(tid):
                            errors.append(f"Circular dependency cycle detected in task-graph involving '{tid}'.")
                            break

                # Check that essential roles are represented
                if not any("architect" in r or "backend" in r or "dev" in r for r in role_set):
                    warnings.append("Task graph lacks an engineering/development task.")

        except json.JSONDecodeError as exc:
            errors.append(f"task-graph.json is invalid JSON: {exc}")

        passed = len(errors) == 0
        return QualityGateResult(passed=passed, errors=errors, warnings=warnings)

