# AI Software Company

Lát cắt đầu tiên triển khai theo mục 19 của đặc tả: API lõi, hàng đợi bền vững, worker, state machine, idempotency, artifact manifest và CLI.

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

Mặc định dùng SQLite cục bộ để development; production dùng `DATABASE_URL` PostgreSQL. Xem `docs/setup.md`.
