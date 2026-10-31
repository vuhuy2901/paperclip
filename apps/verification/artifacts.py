from hashlib import sha256
from pathlib import Path
from .runner import Evidence
from apps.workspace.paths import safe_child

class ArtifactStore:
    def __init__(self, root: str | Path): self.root = Path(root).resolve()

    def put_bytes(self, run_id: str, relative_path: str, content: bytes, producer: str) -> dict:
        target = safe_child(self.root, f"{run_id}/{relative_path}")
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
        digest = sha256(content).hexdigest()
        return {"relative_path": str(target.relative_to(self.root)), "sha256": digest, "size": len(content), "producer": producer}

    def evidence_manifest(self, evidence: Evidence, run_id: str) -> dict:
        return {"run_id": run_id, "candidate_sha": evidence.candidate_sha, "check_id": evidence.check_id, "status": evidence.status, "exit_code": evidence.exit_code, "report_sha256": evidence.report_sha256}
