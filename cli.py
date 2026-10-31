import json
import typer
from fastapi.testclient import TestClient
from apps.core_api.main import app

cli = typer.Typer(help="AI Software Company control-plane CLI")
client = TestClient(app)
HEADERS = {"X-Service-Token": "dev-service-token"}

@cli.command()
def submit(name: str = typer.Option(..., "--name"), change: str = typer.Option(..., "--change"), repo: str = typer.Option("", "--repo")):
    p = client.post("/api/projects", headers=HEADERS, json={"name": name, "repo": repo or None}).json()
    c = client.post(f"/api/projects/{p['id']}/changes", headers=HEADERS, json={"text": change}).json()
    r = client.post(f"/api/changes/{c['id']}/runs", headers=HEADERS, json={"idempotency_key": f"cli-{c['id']}"}).json()
    typer.echo(json.dumps({"project_id": p["id"], "change_id": c["id"], "run_id": r["id"]}, indent=2))

@cli.command()
def status(run_id: str):
    typer.echo(json.dumps(client.get(f"/api/runs/{run_id}", headers=HEADERS).json(), indent=2, default=str))

if __name__ == "__main__": cli()
