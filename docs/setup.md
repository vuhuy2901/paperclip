# Setup

Mục 19 / Giai đoạn 1 hiện đã có API và worker chạy được. Tạo `.env` từ `.env.example`, cài `pip install -e .[dev]`, chạy API bằng Uvicorn và worker bằng `python -m apps.worker.main`. Compose dùng PostgreSQL tách cho core/storefront; chạy local không Compose vẫn fallback SQLite.

`POST /api/projects` → `POST /api/projects/{id}/changes` → `POST /api/changes/{id}/runs` với header `X-Service-Token`. Worker chuyển run qua pipeline đến `awaiting_acceptance` và ghi event có sequence.

Compose hiện khởi động cả Core API, Paperclip authenticated server, adapter bridge, worker, review UI và storefront demo. Paperclip tự bootstrap dữ liệu trong volume `paperclip-data`, cài external adapter local và tạo company/identity qua API; lần chạy đầu cần chờ health check Paperclip chuyển sang `healthy`. Model/Codex runtime, preview deployment thật và các hạng mục production còn lại vẫn được gate rõ ràng, không được coi là đã hoàn thành chỉ vì stack khởi động.
