# Trusted verification

`apps/verification/runner.py` owns executable evidence. A role may request a named profile such as `python-tests`, but cannot submit an arbitrary shell string. The runner records the actual Git SHA, command, exit code, stdout/stderr, duration and report hash.

`pass` is reserved for a real process that exits successfully and, for a test profile, emits a passing-test summary. The worker's required `product-regression` profile runs both Core idempotency/API tests and the storefront VIP, shipping and cancellation regression suite. Candidate SHA mismatch, timeout and missing evidence are `inconclusive`, not pass.
