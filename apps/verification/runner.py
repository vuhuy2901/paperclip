from __future__ import annotations
import hashlib
import json
import subprocess
import time
from dataclasses import dataclass, asdict
from pathlib import Path

PROFILES = {
    # Keep the trusted product suite explicit. This prevents the verification harness
    # from recursively invoking itself when the repository test suite runs.
    "python-tests": ["python", "-m", "pytest", "-q", "tests/test_core_api.py"],
    "python-import": ["python", "-c", "import apps.core_api.main"],
}

@dataclass
class Evidence:
    check_id: str
    command: list[str]
    candidate_sha: str
    exit_code: int | None
    status: str
    stdout: str
    stderr: str
    duration_ms: int
    report_sha256: str | None = None
    reason: str | None = None

def candidate_sha(cwd: str | Path) -> str:
    result = subprocess.run(["git", "rev-parse", "HEAD"], cwd=cwd, text=True, capture_output=True, timeout=10)
    if result.returncode != 0: raise RuntimeError("candidate is not a git checkout")
    return result.stdout.strip()

def run_profile(profile: str, cwd: str | Path, expected_sha: str | None = None, timeout: int = 120) -> Evidence:
    if profile not in PROFILES: raise ValueError(f"unknown verification profile: {profile}")
    actual_sha = candidate_sha(cwd)
    if expected_sha and expected_sha != actual_sha:
        return Evidence(profile, PROFILES[profile], actual_sha, None, "inconclusive", "", "", 0, reason="candidate SHA mismatch")
    command = PROFILES[profile]
    started = time.monotonic()
    try:
        result = subprocess.run(command, cwd=cwd, text=True, capture_output=True, timeout=timeout)
        status = "pass" if result.returncode == 0 else "fail"
        reason = None
        if status == "pass" and profile == "python-tests" and "passed" not in result.stdout:
            status, reason = "inconclusive", "test runner produced no passing-test summary"
        output = (result.stdout + "\n" + result.stderr).encode()
        return Evidence(profile, command, actual_sha, result.returncode, status, result.stdout[-20000:], result.stderr[-20000:], int((time.monotonic()-started)*1000), hashlib.sha256(output).hexdigest(), reason)
    except subprocess.TimeoutExpired as exc:
        return Evidence(profile, command, actual_sha, None, "inconclusive", str(exc.stdout or ""), str(exc.stderr or ""), int((time.monotonic()-started)*1000), reason="timeout")

def write_manifest(evidence: Evidence, path: str | Path) -> Path:
    target = Path(path).resolve()
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(asdict(evidence), indent=2), encoding="utf-8")
    return target
