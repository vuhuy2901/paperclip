from pathlib import Path
from apps.verification.runner import run_profile

ROOT = Path(__file__).resolve().parents[1]

def test_verification_passes_against_current_candidate():
    evidence = run_profile("python-tests", ROOT)
    assert evidence.status == "pass"
    assert evidence.exit_code == 0
    assert evidence.candidate_sha

def test_wrong_candidate_is_inconclusive():
    evidence = run_profile("python-import", ROOT, expected_sha="not-the-current-commit")
    assert evidence.status == "inconclusive"
    assert evidence.reason == "candidate SHA mismatch"

def test_product_regression_profile_is_real():
    evidence = run_profile("product-regression", ROOT)
    assert evidence.status == "pass"
    assert evidence.exit_code == 0
