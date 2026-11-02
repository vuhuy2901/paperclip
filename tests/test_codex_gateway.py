import json
import subprocess
import sys
import threading
import time
import urllib.request

import pytest

from apps.codex_gateway import main as gateway


@pytest.fixture
def gateway_server(monkeypatch, tmp_path):
    monkeypatch.setattr(gateway, "map_path", lambda raw: tmp_path)
    monkeypatch.setattr(gateway, "TOKEN", "test-token")
    server = gateway.ThreadingHTTPServer(("127.0.0.1", 0), gateway.Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    def request(path, payload):
        req = urllib.request.Request(
            f"http://127.0.0.1:{server.server_port}{path}",
            data=json.dumps(payload).encode(),
            headers={"content-type": "application/json", "x-gateway-token": "test-token"},
        )
        with urllib.request.urlopen(req, timeout=8) as response:
            return json.load(response)

    yield request
    server.shutdown()
    server.server_close()
    thread.join(timeout=3)


def fake_codex(monkeypatch, program):
    original = subprocess.Popen

    def popen(command, **kwargs):
        return original([sys.executable, "-c", program], **kwargs)

    monkeypatch.setattr(gateway.subprocess, "Popen", popen)


def test_gateway_drains_output_larger_than_pipe_buffer(gateway_server, monkeypatch):
    fake_codex(monkeypatch, "import json,sys; sys.stderr.write('x'*200000); print(json.dumps({'type':'item.completed','item':{'type':'agent_message','text':'x'*200000}}))")
    result = gateway_server("/run", {"cwd": "/workspace", "prompt": "test", "timeout_seconds": 4})
    assert result["status"] == "completed"
    assert len(result["events"][0]["item"]["text"]) == 200000
    assert result["request_id"] not in gateway.ACTIVE


def test_gateway_timeout_cleans_up_process(gateway_server, monkeypatch):
    fake_codex(monkeypatch, "import time; time.sleep(30)")
    result = gateway_server("/run", {"cwd": "/workspace", "prompt": "test", "timeout_seconds": 1})
    assert result["status"] == "inconclusive"
    assert result["failure_category"] == "timeout"
    assert result["request_id"] not in gateway.ACTIVE


def test_gateway_cancellation_works_while_draining_pipes(gateway_server, monkeypatch):
    fake_codex(monkeypatch, "import time; time.sleep(30)")
    result = {}
    worker = threading.Thread(target=lambda: result.update(gateway_server("/run", {"cwd": "/workspace", "prompt": "test", "request_id": "cancel-test", "timeout_seconds": 6})))
    worker.start()
    deadline = time.monotonic() + 3
    while "cancel-test" not in gateway.ACTIVE and time.monotonic() < deadline:
        time.sleep(0.01)
    assert "cancel-test" in gateway.ACTIVE
    cancel = gateway_server("/cancel", {"request_id": "cancel-test"})
    assert cancel["status"] == "cancelling"
    worker.join(timeout=5)
    assert not worker.is_alive()
    assert result["status"] == "cancelled"
    assert "cancel-test" not in gateway.ACTIVE
