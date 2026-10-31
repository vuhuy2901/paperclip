# Evaluation harness

`requests.json` contains five fixed requirements. `run_eval.py` executes the same independent checks and records raw output for A/B/C condition labels. It does not invent model cost, tokens, intervention counts or comparative claims. Those fields must be populated only when the corresponding real runs are available.
