import os
os.environ["DATABASE_URL"] = "sqlite:///./data/test.db"
from fastapi.testclient import TestClient
from apps.core_api.main import app

client = TestClient(app)
H = {"X-Service-Token": "dev-service-token"}

def test_health(): assert client.get("/health").json() == {"status":"ok"}

def test_project_change_run_is_idempotent():
    p = client.post("/api/projects", headers=H, json={"name":"demo"}).json()
    c = client.post(f"/api/projects/{p['id']}/changes", headers=H, json={"text":"Add VIP pricing"}).json()
    a = client.post(f"/api/changes/{c['id']}/runs", headers=H, json={"idempotency_key":"same"}).json()
    b = client.post(f"/api/changes/{c['id']}/runs", headers=H, json={"idempotency_key":"same"}).json()
    assert a["id"] == b["id"]
    assert len(client.get(f"/api/runs/{a['id']}/events", headers=H).json()) == 1

def test_event_sequences_are_monotonic_within_one_transaction():
    from apps.core_api.db import SessionLocal
    from apps.core_api.models import WorkflowRun, Event
    from apps.core_api.service import emit
    with SessionLocal() as db:
        run = db.query(WorkflowRun).first()
        emit(db, run.id, "test.one", {})
        emit(db, run.id, "test.two", {})
        db.commit()
        sequences = [event.sequence for event in db.query(Event).filter(Event.run_id == run.id).order_by(Event.sequence)]
    assert sequences == list(range(1, len(sequences) + 1))

def test_invalid_auth(): assert client.get("/api/roles").status_code == 401

def test_workflow_transition_guard():
    from apps.core_api.state import can_transition
    assert can_transition("queued", "analyzing")
    assert not can_transition("queued", "accepted")

def test_role_update_and_feedback():
    p = client.post("/api/projects", headers=H, json={"name":"feedback-demo"}).json()
    c = client.post(f"/api/projects/{p['id']}/changes", headers=H, json={"text":"Review candidate"}).json()
    r = client.post(f"/api/changes/{c['id']}/runs", headers=H, json={"idempotency_key":"feedback"}).json()
    role = client.put("/api/roles/tester", headers=H, json={"runner":"xera","model":"xera-local","timeout_seconds":120,"tool_policy":[],"file_scope":["tests"]})
    assert role.status_code == 200 and role.json()["runner"] == "xera"
    assert role.json()["file_scope"] == ["tests"]
    feedback = client.post(f"/api/runs/{r['id']}/feedback", headers=H, json={"text":"Needs clearer error state","version":"candidate-1","route":"/acceptance"})
    assert feedback.status_code == 200
    snapshot = client.post(f"/api/changes/{c['id']}/runs", headers=H, json={"idempotency_key":"role-snapshot"}).json()["config_snapshot"]
    assert snapshot["roles"]["tester"]["runner"] == "xera"
    assert snapshot["roles"]["tester"]["file_scope"] == ["tests"]

def test_paperclip_wake_creates_only_one_run():
    p = client.post("/api/projects", headers=H, json={"name":"paperclip-demo"}).json()
    c = client.post(f"/api/projects/{p['id']}/changes", headers=H, json={"text":"Wake me once"}).json()
    payload = {"change_id": c["id"], "idempotency_key": "paperclip-1"}
    first = client.post("/api/integrations/paperclip/wake", headers=H, json=payload).json()
    second = client.post("/api/integrations/paperclip/wake", headers=H, json=payload).json()
    assert first["deduplicated"] is False
    assert second == {"accepted": True, "deduplicated": True, "run_id": first["run_id"]}

def test_role_file_scope_traversal_is_rejected():
    response = client.put("/api/roles/tester", headers=H, json={"runner":"codex-cli","model":"x","file_scope":["../secrets"]})
    assert response.status_code == 422
