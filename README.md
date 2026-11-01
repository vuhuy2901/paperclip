# AI Software Company

Hệ thống triển khai theo mục 19 của đặc tả gồm API lõi, hàng đợi bền vững, worker, state machine, idempotency, tám role, artifact/evidence contracts, Paperclip adapter, preview manager và màn hình nghiệm thu.

## Chạy nhanh

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e .[dev]
uvicorn apps.core_api.main:app --reload
```

Trong terminal khác:

```powershell
python -m apps.worker.main
pytest
```

Storefront demo: `uvicorn templates.storefront.backend.main:app --port 8200` and `npm run dev --prefix templates/storefront/frontend`.

Contract export: `python scripts/export_contracts.py`. PostgreSQL migration: `alembic upgrade head`. Evaluation: `python evals/run_eval.py`.

Runtime pin chính: Python 3.13, LangGraph `0.6.11`, xxhash `4.0.2`; xem `pyproject.toml` để biết các dải tương thích còn lại.

Mặc định Compose chạy `local-deterministic` để có thể khởi động offline. Để bật runner model thật, đặt `DEFAULT_RUNNER=codex-cli` và `DEFAULT_MODEL=<model>` trong environment; project phải có repo/file scope và worker phải có Codex CLI/provider credential. Deterministic artifacts luôn được gắn nhãn fixture và không được dùng làm bằng chứng model thật.

Compose exposes Core API at `http://localhost:8001` (container port `8000`), Paperclip at `http://localhost:3100`, review UI at `http://localhost:8080`, storefront API at `http://localhost:8200`, storefront UI at `http://localhost:8201`, adapter at `http://localhost:8090`, and the isolated preview manager at `http://localhost:8300`.

Mặc định dùng SQLite cục bộ để development; production dùng `DATABASE_URL` PostgreSQL. Xem `docs/setup.md`.
