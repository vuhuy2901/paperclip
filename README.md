# AI Software Company

Hệ thống triển khai theo mục 19 của đặc tả gồm API lõi, hàng đợi bền vững, worker, state machine, idempotency, tám role, artifact/evidence contracts, Paperclip adapter, preview manager và màn hình nghiệm thu.

## Chạy nhanh

Chạy toàn bộ stack bằng Docker:

```powershell
docker compose up -d --build
docker compose ps
```

## AI providers

All roles use Ollama by default with `llama3.2:3b`. Copy `.env.example` to `.env` only if you want to override the local model or database settings; no OpenRouter or Codex gateway credential is required.

Compose starts Ollama, creates the persistent `ollama-data` volume, and pulls `OLLAMA_MODEL` automatically.

The default execution runner is `ollama` using `llama3.2:3b`. It calls the Ollama container directly and does not require a Codex gateway. `local-deterministic`, `codex-cli` and the legacy `codex-gateway` remain available only for compatibility.

Nếu dùng Codex CLI đã đăng nhập trên Windows, bật gateway và cấu hình đủ tám role bằng một lệnh:

```powershell
python scripts/enable_codex_demo.py
```

Gateway chạy Codex non-interactive với stdin đóng, `--approve-for-me`, `--ignore-user-config` và mức suy luận mặc định `low`; có thể đổi bằng biến môi trường `CODEX_REASONING_EFFORT`. Lệnh dùng phiên đăng nhập ChatGPT của Codex CLI trên host và không cần sao chép API key vào Compose.

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

Mặc định Compose chạy `ollama` với `llama3.2:3b`; Ollama được khởi động cùng stack và không cần Codex gateway. Có thể đổi model bằng `OLLAMA_MODEL`/`DEFAULT_MODEL`. Deterministic artifacts chỉ dùng khi chọn runner fixture một cách rõ ràng.

Compose exposes Core API at `http://localhost:8001` (container port `8000`), Paperclip at `http://localhost:3100`, review UI at `http://localhost:8080`, storefront API at `http://localhost:8200`, storefront UI at `http://localhost:8201`, adapter at `http://localhost:8090`, and the isolated preview manager at `http://localhost:8300`. Paperclip is configured for local-only `local_trusted` demo access, so refresh `http://localhost:3100` without accepting an organization invite; it is intentionally bound to localhost and must not be exposed to a network.

Mặc định dùng SQLite cục bộ để development; production dùng `DATABASE_URL` PostgreSQL. Xem `docs/setup.md`.
