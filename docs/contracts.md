# Contract generation

Pydantic models and FastAPI routes are the canonical contract source. Run `python scripts/export_contracts.py` to generate local OpenAPI and JSON Schema files under `packages/contracts/generated/`; generated files are ignored because they are reproducible build outputs.
