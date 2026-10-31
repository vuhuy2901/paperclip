from apps.orchestration.retry import RetryPolicy, run_with_retry

def test_retry_is_separate_from_repair_count():
    calls = []
    def operation():
        calls.append(1)
        if len(calls) < 3: raise TimeoutError("temporary")
        return "ok"
    assert run_with_retry(operation, lambda _: "timeout", RetryPolicy(max_retries=2), lambda _: None) == "ok"
    assert len(calls) == 3

def test_non_retryable_error_is_immediate():
    calls = []
    def operation(): calls.append(1); raise ValueError("bad contract")
    try: run_with_retry(operation, lambda _: "invalid_json", sleep=lambda _: None)
    except ValueError: pass
    assert len(calls) == 1
