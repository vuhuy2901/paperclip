from sqlalchemy import select
from sqlalchemy.orm import Session
from .models import RoleConfig, RoleScope
from .config import settings

ROLE_IDS = ["project-manager", "architect", "backend-developer", "frontend-developer", "code-reviewer", "tester", "devops"]

def ensure_roles(db: Session):
    existing = {row.id for row in db.scalars(select(RoleConfig))}
    for role_id in ROLE_IDS:
        if role_id not in existing:
            db.add(RoleConfig(id=role_id, runner=settings.default_runner, model=settings.default_model))
        elif settings.force_ollama:
            role = db.get(RoleConfig, role_id)
            if role and (role.runner != "ollama" or role.model in {None, "configured-at-runtime"}):
                role.runner = "ollama"
                role.model = settings.ollama_model
        if not db.get(RoleScope, role_id): db.add(RoleScope(role_id=role_id, file_scope=[]))
    db.commit()

def snapshot(db: Session) -> dict:
    ensure_roles(db)
    scopes = {row.role_id: row.file_scope for row in db.scalars(select(RoleScope))}
    return {row.id: {"id":row.id, "runner":row.runner, "model":row.model, "timeout_seconds":row.timeout_seconds, "sandbox":row.sandbox, "tool_policy":row.tool_policy, "file_scope": scopes.get(row.id, [])} for row in db.scalars(select(RoleConfig))}
