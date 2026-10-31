from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy import String, Text, Integer, DateTime, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db import Base

def now(): return datetime.now(timezone.utc)
def uid(): return str(uuid4())

class Project(Base):
    __tablename__ = "projects"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    name: Mapped[str] = mapped_column(String(200))
    repo: Mapped[str | None] = mapped_column(String(500), nullable=True)
    stack_profile: Mapped[str] = mapped_column(String(100), default="fastapi-react-postgres")
    accepted_commit: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class ChangeRequest(Base):
    __tablename__ = "change_requests"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"))
    text: Mapped[str] = mapped_column(Text)
    acceptance_version: Mapped[int] = mapped_column(Integer, default=1)
    parent_change_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class WorkflowRun(Base):
    __tablename__ = "workflow_runs"
    __table_args__ = (UniqueConstraint("change_id", "idempotency_key", name="uq_run_idempotency"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    change_id: Mapped[str] = mapped_column(ForeignKey("change_requests.id"))
    status: Mapped[str] = mapped_column(String(40), default="queued")
    baseline_sha: Mapped[str | None] = mapped_column(String(100), nullable=True)
    candidate_sha: Mapped[str | None] = mapped_column(String(100), nullable=True)
    repair_count: Mapped[int] = mapped_column(Integer, default=0)
    config_snapshot: Mapped[dict] = mapped_column(JSON, default=dict)
    idempotency_key: Mapped[str] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, onupdate=now)

class Task(Base):
    __tablename__ = "tasks"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    run_id: Mapped[str] = mapped_column(ForeignKey("workflow_runs.id"))
    role: Mapped[str] = mapped_column(String(80))
    goal: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(40), default="queued")
    depends_on: Mapped[list] = mapped_column(JSON, default=list)
    required_artifacts: Mapped[list] = mapped_column(JSON, default=list)

class Event(Base):
    __tablename__ = "events"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    run_id: Mapped[str] = mapped_column(ForeignKey("workflow_runs.id"))
    sequence: Mapped[int] = mapped_column(Integer)
    type: Mapped[str] = mapped_column(String(100))
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    correlation_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class Artifact(Base):
    __tablename__ = "artifacts"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    run_id: Mapped[str] = mapped_column(ForeignKey("workflow_runs.id"))
    type: Mapped[str] = mapped_column(String(80))
    relative_path: Mapped[str] = mapped_column(String(500))
    sha256: Mapped[str] = mapped_column(String(64))
    size: Mapped[int] = mapped_column(Integer)
    producer: Mapped[str] = mapped_column(String(100))
    commit_sha: Mapped[str | None] = mapped_column(String(100), nullable=True)

class Approval(Base):
    __tablename__ = "approvals"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    run_id: Mapped[str] = mapped_column(ForeignKey("workflow_runs.id"))
    kind: Mapped[str] = mapped_column(String(40), default="candidate")
    artifact_version: Mapped[str] = mapped_column(String(100))
    candidate_sha: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="pending")
    actor: Mapped[str | None] = mapped_column(String(200), nullable=True)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class FeedbackRecord(Base):
    __tablename__ = "feedback"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    run_id: Mapped[str] = mapped_column(ForeignKey("workflow_runs.id"))
    text: Mapped[str] = mapped_column(Text)
    version: Mapped[str] = mapped_column(String(100))
    route: Mapped[str | None] = mapped_column(String(300), nullable=True)
    acceptance_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class Deployment(Base):
    __tablename__ = "deployments"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    run_id: Mapped[str] = mapped_column(ForeignKey("workflow_runs.id"))
    commit_sha: Mapped[str | None] = mapped_column(String(100), nullable=True)
    image_digest: Mapped[str | None] = mapped_column(String(200), nullable=True)
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="pending")
    health_evidence: Mapped[dict] = mapped_column(JSON, default=dict)
    smoke_evidence: Mapped[dict] = mapped_column(JSON, default=dict)

class RoleConfig(Base):
    __tablename__ = "role_configs"
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    runner: Mapped[str] = mapped_column(String(80), default="local-deterministic")
    model: Mapped[str] = mapped_column(String(200), default="configured-at-runtime")
    timeout_seconds: Mapped[int] = mapped_column(Integer, default=900)
    sandbox: Mapped[str] = mapped_column(String(40), default="workspace-write")
    tool_policy: Mapped[list] = mapped_column(JSON, default=list)

class RoleScope(Base):
    __tablename__ = "role_scopes"
    role_id: Mapped[str] = mapped_column(String(80), primary_key=True)
    file_scope: Mapped[list] = mapped_column(JSON, default=list)
