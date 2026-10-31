# Trusted verification

`apps/verification/runner.py` owns executable evidence. A role may request a named profile such as `python-tests`, but cannot submit an arbitrary shell string. The runner records the actual Git SHA, command, exit code, stdout/stderr, duration and report hash.

`pass` is reserved for a real process that exits successfully and, for the test profile, emits a passing-test summary. Candidate SHA mismatch, timeout and missing evidence are `inconclusive`, not pass.
