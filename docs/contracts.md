# Contract generation

Pydantic models and FastAPI routes are the canonical contract source. Run `python scripts/export_contracts.py` to generate local OpenAPI and JSON Schema files under `packages/contracts/generated/`; generated files are ignored because they are reproducible build outputs.

The persisted execution contract is split into `TaskContract`, `AgentRun`, `Artifact`, `EvidenceRecord` and `Finding` rows. A task completion is not a verification result: the trusted runner writes `EvidenceRecord` only after executing the configured profile, and the read APIs are `GET /api/runs/{run_id}/agent-runs`, `GET /api/runs/{run_id}/artifacts`, `GET /api/runs/{run_id}/evidence` and `GET /api/runs/{run_id}/findings`.
