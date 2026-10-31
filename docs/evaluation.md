# Evaluation

Run `python evals/run_eval.py`. The output is ignored runtime data under `data/evals/latest.json`. The harness covers five fixed requirements and preserves raw stdout/stderr, exit code and timestamp. A/B/C labels are intentionally not treated as evidence of superiority until real agent runs with comparable budgets are recorded.
