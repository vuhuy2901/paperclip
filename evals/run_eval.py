from __future__ import annotations
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def run_condition(name: str, checks: list[dict]) -> dict:
    results = []
    for check in checks:
        process = subprocess.run([sys.executable, "-m", "pytest", "-q", check["check"]], cwd=ROOT, text=True, capture_output=True, timeout=120)
        results.append({"id": check["id"], "exit_code": process.returncode, "status": "pass" if process.returncode == 0 else "fail", "stdout": process.stdout[-2000:], "stderr": process.stderr[-2000:]})
    return {"condition": name, "results": results, "passed": sum(r["status"] == "pass" for r in results), "total": len(results)}

def main():
    checks = json.loads((ROOT / "evals/requests.json").read_text(encoding="utf-8"))
    report = {"generated_at": datetime.now(timezone.utc).isoformat(), "conditions": [run_condition(name, checks) for name in ["A-single-agent-baseline", "B-eight-role-pipeline", "C-impact-regression-pipeline"]], "note": "Conditions share the fixed independent checks; agent/model time and usage are not fabricated."}
    out = ROOT / "data/evals/latest.json"; out.parent.mkdir(parents=True, exist_ok=True); out.write_text(json.dumps(report, indent=2), encoding="utf-8"); print(out)

if __name__ == "__main__": main()
