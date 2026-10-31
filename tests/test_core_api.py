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
