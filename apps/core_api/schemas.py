from typing import Any
from pydantic import BaseModel, Field

class ProjectCreate(BaseModel):
    name: str
    repo: str | None = None
    stack_profile: str = "fastapi-react-postgres"

class ChangeCreate(BaseModel):
    text: str = Field(min_length=1)
    acceptance_version: int = 1
    parent_change_id: str | None = None

class RunCreate(BaseModel):
    idempotency_key: str = Field(min_length=1)

class Decision(BaseModel):
    decision: str
    artifact_version: str
    reason: str | None = None

class Feedback(BaseModel):
    text: str
    version: str
    route: str | None = None
    acceptance_id: str | None = None

class TaskResult(BaseModel):
    schema_version: str = "1"
    task_id: str
    agent_run_id: str
    status: str
    summary: str
    base_commit: str | None = None
    result_commit: str | None = None
    artifact_ids: list[str] = []
    files_changed: list[str] = []
    requested_checks: list[str] = []
    blocking_questions: list[str] = []
    handoff_notes: str = ""
