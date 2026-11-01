from apps.runners.codex import CodexCliRunner
from apps.runners.gateway import CodexGatewayRunner


def test_codex_cli_cancel_terminates_active_process():
    class FakeProcess:
        def __init__(self):
            self.terminated = False

        def poll(self):
            return None

        def terminate(self):
            self.terminated = True

    runner = CodexCliRunner()
    process = FakeProcess()
    runner._process = process
    runner.cancel()
    assert process.terminated is True


def test_gateway_cancel_uses_request_id(monkeypatch):
    captured = {}

    class Response:
        def read(self):
            return b'{"status":"cancelling"}'

    def fake_urlopen(request, timeout):
        captured["url"] = request.full_url
        captured["body"] = request.data
        captured["timeout"] = timeout
        return Response()

    monkeypatch.setattr("urllib.request.urlopen", fake_urlopen)
    runner = CodexGatewayRunner(url="http://gateway.test")
    runner._request_id = "request-123"
    runner.cancel()
    assert captured["url"] == "http://gateway.test/cancel"
    assert b"request-123" in captured["body"]
