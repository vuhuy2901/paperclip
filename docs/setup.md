# Setup

Mục 19 / Giai đoạn 1 hiện đã có API và worker chạy được. Tạo `.env` từ `.env.example`, cài `pip install -e .[dev]`, chạy API bằng Uvicorn và worker bằng `python -m apps.worker.main`. Compose dùng PostgreSQL tách cho core/storefront; chạy local không Compose vẫn fallback SQLite.

`POST /api/projects` → `POST /api/projects/{id}/changes` → `POST /api/changes/{id}/runs` với header `X-Service-Token`. Worker chuyển run qua pipeline đến `awaiting_acceptance` và ghi event có sequence.

Compose hiện khởi động cả Core API, Paperclip authenticated server, adapter bridge, worker, preview-manager, review UI và storefront demo. Paperclip giữ instance/adapter/company data trong volume `paperclip-data`; với volume đã bootstrap, tám identity đã được tạo và trỏ tới `ai_company_external`. Khi dùng volume mới, chạy one-time Paperclip onboarding/role bootstrap theo `docs/operations.md` trước khi gọi wake. Preview-manager là boundary duy nhất có Docker socket và tạo network/DB/port riêng cho từng preview. Lần chạy đầu cần chờ health check Paperclip/preview-manager chuyển sang `healthy`. Model/Codex runtime và các hạng mục production còn lại vẫn được gate rõ ràng, không được coi là đã hoàn thành chỉ vì stack khởi động.

Có thể chọn runner mặc định bằng environment trước khi `docker compose up`: `DEFAULT_RUNNER=codex-cli DEFAULT_MODEL=<model> docker compose up -d --build`. Trên Windows, có thể dùng `DEFAULT_RUNNER=codex-gateway DEFAULT_MODEL=configured-at-runtime`; chạy `python -m apps.codex_gateway.main` ở host và để gateway gọi Codex CLI/provider credential của host. Với cả hai mode, project phải có `repo`, role phải có `file_scope`; nếu thiếu điều kiện, task bị fail rõ ràng thay vì rơi về fixture.

Nếu thấy worker và Core có số lượng run khác nhau, kiểm tra không có container cũ nào quảng bá alias `core-postgres` trên network `ai_company_default`; chỉ service `postgres` chính được phép có alias này. Lệnh xác minh: `docker compose exec worker python -c "import socket; print(socket.gethostbyname_ex('core-postgres'))"`.
