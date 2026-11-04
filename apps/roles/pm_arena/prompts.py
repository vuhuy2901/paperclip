"""Prompt templates for PM Arena: candidate drafting, single-pass judge+critic, and finalizer."""

from __future__ import annotations
import json
from .strategies import PMStrategy


def build_shared_context_summary(change_text: str, repo_info: str | None = None) -> str:
    """Produce the common shared context snapshot provided equally to all candidates."""
    repo_summary = repo_info or "Storefront / FastAPI + React repository with existing checkout, products, and order models."
    return (
        "=== SYSTEM CONTRACTS & CONSTRAINTS ===\n"
        "1. Architecture: Backend in FastAPI, Frontend in React, Database in PostgreSQL/SQLite.\n"
        "2. Pipeline Roles: Solution Architect -> Backend Engineer + Frontend Engineer -> Code Reviewer -> QA Tester -> DevOps.\n"
        "3. Required PM Handshake Deliverables: prd.md, acceptance.json, task-graph.json.\n"
        "4. Non-Negotiable: Never break existing regression test suites; preserve backward compatibility.\n"
        f"5. Base Repository Context: {repo_summary}\n"
        f"6. Product Owner Change Request:\n\"\"\"\n{change_text}\n\"\"\"\n"
        "======================================"
    )


def build_draft_prompt(change_text: str, strategy: PMStrategy, shared_context: str) -> str:
    """Prompt for a single PM candidate to generate a concise structured draft plan."""
    return f"""You are competing in the AI Software Company PM Arena as candidate: {strategy.name} ({strategy.id}).

YOUR ASSIGNED STRATEGY & PERSONA:
- Persona: {strategy.persona}
- Core Focus: {strategy.core_focus}
- Decision Bias: {strategy.decision_bias}
- Risk Appetite: {strategy.risk_appetite}

{shared_context}

INSTRUCTIONS:
Produce a concise, high-impact draft planning proposal aligned strictly with your strategy.
Do NOT write full essay text. Output your proposal strictly as a valid JSON object with this schema:
{{
  "candidate_id": "{strategy.id}",
  "approach_summary": "1-2 sentence core concept explaining your strategy",
  "files_to_modify": ["list of relative file paths to touch"],
  "tasks": [
    {{"role": "architect", "goal": "concrete architectural goal", "depends_on": []}},
    {{"role": "backend-developer", "goal": "concrete backend goal", "depends_on": ["architect"]}},
    {{"role": "frontend-developer", "goal": "concrete frontend goal", "depends_on": ["architect"]}},
    {{"role": "tester", "goal": "testing & regression verification goal", "depends_on": ["backend-developer", "frontend-developer"]}}
  ],
  "acceptance_criteria": [
    {{"id": "AC-1", "description": "precise, testable criteria description", "type": "functional|regression|security"}}
  ],
  "identified_risks": ["list of concrete failure modes or edge-cases you considered"],
  "why_this_beats_alternatives": "Brief justification for your strategy"
}}

Respond with the JSON object only. No markdown formatting outside the JSON block.
"""


def build_arbiter_prompt(change_text: str, candidate_drafts: list[dict], shared_context: str) -> str:
    """Single-pass Arbiter prompt combining Judge, Critic, Hard Gates, and Controlled Grafting."""
    drafts_json = json.dumps(candidate_drafts, indent=2, ensure_ascii=False)
    candidate_ids = [d.get("candidate_id", f"candidate_{i}") for i, d in enumerate(candidate_drafts)]

    return f"""You are the Lead Arbiter (Judge + Critic) for the AI Software Company PM Arena.

{shared_context}

You have received {len(candidate_drafts)} competing planning proposals from independent PM candidates:
{drafts_json}

YOUR EVALUATION MANDATE (STRICT SINGLE-PASS ARBITER):

1. HARD GATES (Check FIRST before scoring; failure is IMMEDIATE DISQUALIFICATION):
   - Hard Gate 1 (Schema Safety): Does the plan introduce breaking API/DB schema changes without backward compatibility or safe migration?
   - Hard Gate 2 (Regression & Data Safety): Is there an unmitigated risk of data corruption, double-counting, or breaking existing tests?
   - Hard Gate 3 (Mandatory PO Brief): Does the plan directly satisfy all core constraints stated in the PO Change Request?
   If a candidate fails ANY Hard Gate, mark is_disqualified=true with exact disqualification_reason. Disqualified candidates cannot win.

2. SCORING RUBRIC (For candidates that pass Hard Gates, score 0-10 on each):
   - Safety & Regression Control (30% weight): Defensive handling, no collateral damage.
   - Completeness & Coverage (30% weight): Satisfies all explicit and implicit requirements.
   - Feasibility & Simplicity (25% weight): Clean, doable by developers, not over-engineered.
   - Cost & Implementation Effort (15% weight): Minimizes token/dev toil, tight file scope.
   Final Score = (Safety*0.30) + (Completeness*0.30) + (Feasibility*0.25) + (Cost*0.15).

3. CRITIC ANALYSIS:
   - Identify specific blindspots, missing edge cases, or potential design flaws for EACH candidate.

4. SELECTION DECISION:
   - If ALL candidates are disqualified or score below 5.0 in Safety/Completeness:
     Set "status": "NO_VALID_WINNER", "winner_id": null.
   - Otherwise:
     Select the candidate with the highest composite score as "winner_id".

5. CONTROLLED GRAFTING:
   - Inspect the losing candidates. Are there 1-2 exceptional test cases or acceptance criteria that the winner missed?
   - STRICT COMPATIBILITY CHECK: Only graft if the item is 100% compatible with the winner's architecture. Do NOT graft incompatible schemas or conflicting requirements.
   - If no item qualifies, return an empty grafted_items list.

OUTPUT FORMAT:
Respond with ONLY a valid JSON object matching this schema:
{{
  "status": "WINNER_SELECTED" or "NO_VALID_WINNER",
  "winner_id": "candidate_id" or null,
  "summary": "1-2 sentence verdict",
  "evaluations": [
    {{
      "candidate_id": "string",
      "hard_gate_passed": true/false,
      "disqualification_reason": null or "reason",
      "scores": {{
        "safety": 0-10,
        "completeness": 0-10,
        "feasibility": 0-10,
        "cost_efficiency": 0-10,
        "total_weighted": 0.0-10.0
      }},
      "critique": "critical flaw or blindspot analysis"
    }}
  ],
  "grafted_items": [
    {{
      "source_candidate": "string",
      "item_type": "acceptance_criterion",
      "content": {{"id": "AC-GRAFT-1", "description": "text", "type": "functional|regression"}},
      "compatibility_rationale": "why this safely enhances the winner without conflict"
    }}
  ]
}}
"""


def build_finalizer_prompt(
    change_text: str,
    winner_draft: dict,
    grafted_items: list[dict],
    shared_context: str,
    repair_errors: list[str] | None = None,
) -> str:
    """Prompt for the winning PM to write final prd.md, acceptance.json, and task-graph.json."""
    draft_json = json.dumps(winner_draft, indent=2, ensure_ascii=False)
    grafts_json = json.dumps(grafted_items, indent=2, ensure_ascii=False)

    repair_section = ""
    if repair_errors:
        err_list = "\n".join(f"- {e}" for e in repair_errors)
        repair_section = f"\n\nPREVIOUS QUALITY GATE VALIDATION FAILED WITH ERRORS:\n{err_list}\nYou MUST fix these exact issues in your output files below."

    return f"""You are the winning Project Manager in the AI Software Company PM Arena.
Your proposal won the tournament and you are now responsible for producing the authoritative deliverables.

{shared_context}

WINNING PLAN CONCEPT:
{draft_json}

GRAFTED ENHANCEMENTS FROM OTHER CANDIDATES (Integrate these cleanly):
{grafts_json}
{repair_section}

YOUR MANDATORY TASK:
Write the complete deliverables into `.ai-company/handoffs/project-manager/`:

1. `prd.md`:
   Comprehensive Product Requirements Document covering:
   - Overview & Business Goals
   - User Stories & Acceptance Expectations
   - Scope: Files to modify, files strictly protected from modification
   - Edge Cases & Error Handling Specifications

2. `acceptance.json`:
   A valid JSON file structured as:
   {{
     "schema_version": "1",
     "change_id": "change-request",
     "criteria": [
       {{"id": "AC-1", "description": "criterion text", "type": "functional", "role": "backend-developer"}},
       ...
     ]
   }}

3. `task-graph.json`:
   A valid JSON DAG file structured as:
   {{
     "schema_version": "1",
     "tasks": [
       {{"id": "task-architect", "role": "architect", "goal": "...", "depends_on": []}},
       {{"id": "task-backend", "role": "backend-developer", "goal": "...", "depends_on": ["task-architect"]}},
       {{"id": "task-frontend", "role": "frontend-developer", "goal": "...", "depends_on": ["task-architect"]}},
       {{"id": "task-tester", "role": "tester", "goal": "...", "depends_on": ["task-backend", "task-frontend"]}},
       {{"id": "task-devops", "role": "devops", "goal": "...", "depends_on": ["task-tester"]}}
     ]
   }}

RULES:
- Ensure task IDs are unique and `depends_on` contains no circular cycles.
- Every acceptance criterion must map to an assigned role or task.
- Write files directly to their designated paths in `.ai-company/handoffs/project-manager/`.
"""

