# Reliability rules

Infrastructure retries are handled by `run_with_retry` and are bounded to two retries by default with exponential backoff. Only classified transient categories are retryable. Business/code repair count remains a separate three-round workflow budget. Invalid structured output and policy errors fail immediately.
