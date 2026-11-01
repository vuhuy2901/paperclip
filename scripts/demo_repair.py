"""Run a real failing regression in an isolated worktree, route it, and repair it.

The injected defect is explicitly a demo fixture. It never touches the main
checkout; both the failure and the repair are produced by real pytest runs.
"""

from __future__ import annotations

import json
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from apps.verification.routing import route_failure
from apps.verification.runner import run_profile


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "templates/storefront/backend/main.py"
ORIGINAL_SNIPPET = 'order.status = "cancelled"; db.commit(); db.refresh(order); return order'
BROKEN_SNIPPET = 'order.total = 0; order.status = "cancelled"; db.commit(); db.refresh(order); return order'


def git(*args: str, cwd: Path) -> str:
    result = subprocess.run(["git", *args], cwd=cwd, text=True, capture_output=True, check=True)
    return result.stdout.strip()


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="ai-company-repair-") as temp:
        worktree = Path(temp) / "candidate"
        git("worktree", "add", "--detach", str(worktree), "HEAD", cwd=ROOT)
        try:
            target = worktree / TARGET.relative_to(ROOT)
            original = target.read_text(encoding="utf-8")
            if ORIGINAL_SNIPPET not in original:
                raise RuntimeError("repair demo target changed; refusing to inject an unverified defect")
            target.write_text(original.replace(ORIGINAL_SNIPPET, BROKEN_SNIPPET, 1), encoding="utf-8")
            git("add", "--", str(TARGET.relative_to(ROOT)), cwd=worktree)
            subprocess.run(["git", "-c", "user.name=AI Software Company", "-c", "user.email=ai-company@localhost", "commit", "-m", "demo: inject cancellation regression"], cwd=worktree, check=True, capture_output=True)
            failed = run_profile("product-regression", worktree)
            route = route_failure(failed.stdout, failed.stderr)
            target.write_text(original, encoding="utf-8")
            git("add", "--", str(TARGET.relative_to(ROOT)), cwd=worktree)
            subprocess.run(["git", "-c", "user.name=AI Software Company", "-c", "user.email=ai-company@localhost", "commit", "-m", "repair: restore immutable cancellation total"], cwd=worktree, check=True, capture_output=True)
            repaired = run_profile("product-regression", worktree)
            report = {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "fixture": True,
                "description": "Injected order-total mutation in an isolated worktree; trusted regression caught it; backend route repaired it.",
                "failed": failed.__dict__,
                "route": route,
                "repaired": repaired.__dict__,
            }
            output = ROOT / "data/evals/repair-demo.json"
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(json.dumps(report, indent=2), encoding="utf-8")
            print(output)
            if failed.status != "fail" or route["owner"] != "backend-developer" or repaired.status != "pass":
                raise SystemExit("repair demo did not produce the expected fail-route-pass sequence")
        finally:
            subprocess.run(["git", "worktree", "remove", "--force", str(worktree)], cwd=ROOT, check=False, capture_output=True)


if __name__ == "__main__":
    main()
