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

def test_invalid_auth(): assert client.get("/api/roles").status_code == 401

def test_workflow_transition_guard():
    from apps.core_api.state import can_transition
    assert can_transition("queued", "analyzing")
    assert not can_transition("queued", "accepted")

def test_role_update_and_feedback():
    p = client.post("/api/projects", headers=H, json={"name":"feedback-demo"}).json()
    c = client.post(f"/api/projects/{p['id']}/changes", headers=H, json={"text":"Review candidate"}).json()
    r = client.post(f"/api/changes/{c['id']}/runs", headers=H, json={"idempotency_key":"feedback"}).json()
    role = client.put("/api/roles/tester", headers=H, json={"runner":"xera","model":"xera-local","timeout_seconds":120,"tool_policy":[]})
    assert role.status_code == 200 and role.json()["runner"] == "xera"
    feedback = client.post(f"/api/runs/{r['id']}/feedback", headers=H, json={"text":"Needs clearer error state","version":"candidate-1","route":"/acceptance"})
    assert feedback.status_code == 200
    snapshot = client.post(f"/api/changes/{c['id']}/runs", headers=H, json={"idempotency_key":"role-snapshot"}).json()["config_snapshot"]
    assert snapshot["roles"]["tester"]["runner"] == "xera"

def test_paperclip_wake_creates_only_one_run():
    p = client.post("/api/projects", headers=H, json={"name":"paperclip-demo"}).json()
    c = client.post(f"/api/projects/{p['id']}/changes", headers=H, json={"text":"Wake me once"}).json()
    payload = {"change_id": c["id"], "idempotency_key": "paperclip-1"}
    first = client.post("/api/integrations/paperclip/wake", headers=H, json=payload).json()
    second = client.post("/api/integrations/paperclip/wake", headers=H, json=payload).json()
    assert first["deduplicated"] is False
    assert second == {"accepted": True, "deduplicated": True, "run_id": first["run_id"]}
