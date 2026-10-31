# Setup

Mục 19 / Giai đoạn 1 hiện đã có API và worker chạy được. Tạo `.env` từ `.env.example`, cài `pip install -e .[dev]`, chạy API bằng Uvicorn và worker bằng `python -m apps.worker.main`. Compose dùng PostgreSQL tách cho core/storefront; chạy local không Compose vẫn fallback SQLite.

`POST /api/projects` → `POST /api/projects/{id}/changes` → `POST /api/changes/{id}/runs` với header `X-Service-Token`. Worker chuyển run qua pipeline đến `awaiting_acceptance` và ghi event có sequence.

Đây là lát cắt deterministic để kiểm tra control plane. Model thật, Paperclip, Docker preview và app storefront được triển khai ở các giai đoạn tiếp theo; không được coi lát cắt này là hoàn thành toàn bộ hệ thống.
