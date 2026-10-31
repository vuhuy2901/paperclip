from __future__ import annotations
import time
from dataclasses import dataclass
from typing import Callable, TypeVar

T = TypeVar("T")

@dataclass(frozen=True)
class RetryPolicy:
    max_retries: int = 2
    base_delay_seconds: float = 0.25
    retryable_categories: tuple[str, ...] = ("rate_limit", "timeout", "transient_network")

def run_with_retry(operation: Callable[[], T], classify: Callable[[Exception], str], policy: RetryPolicy = RetryPolicy(), sleep: Callable[[float], None] = time.sleep) -> T:
    attempt = 0
    while True:
        try: return operation()
        except Exception as exc:
            category = classify(exc)
            if category not in policy.retryable_categories or attempt >= policy.max_retries: raise
            sleep(policy.base_delay_seconds * (2 ** attempt)); attempt += 1
