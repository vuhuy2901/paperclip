from hashlib import sha256
from apps.verification.artifacts import ArtifactStore

def test_artifact_store_hashes_and_scopes(tmp_path):
    item = ArtifactStore(tmp_path).put_bytes("run-1", "reports/test.json", b"{}", "tester")
    assert item["sha256"] == sha256(b"{}").hexdigest()
