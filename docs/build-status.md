# Build status

## 2026-11-01

- Giai đoạn 0: đã kiểm tra Git, Python 3.13.7, Node 22.19.0, Docker 29.6.2, Compose 5.3.1; workspace ban đầu chỉ có đặc tả, chưa có Git repository.
- Giai đoạn 1 lát cắt đầu: đã tạo FastAPI core, SQLite dev/PostgreSQL-compatible SQLAlchemy config, project/change/run/task/event/artifact models, guarded workflow transitions, idempotency, service-token auth, worker và tests.
- Đã kiểm tra `docker compose config`; Docker image build chưa chạy được vì Docker Desktop engine chưa hoạt động/có mặt trên máy (`dockerDesktopLinuxEngine` pipe không tồn tại).
- Trusted verification runner đã có profile allowlist, timeout, candidate SHA binding và manifest hash; test harness phát hiện và đã loại vòng đệ quy.
- Paperclip adapter boundary và review UI đã có build artifact; review UI build production thành công, có empty/loading/error-shaped flow và nút approval/request changes nối theo run boundary.
- Storefront demo backend/frontend đã có seed tái lập, tier pricing, promo non-stacking, shipping rules, immutable order snapshot, cancellation guard và regression tests; storefront UI build production thành công.
- LangGraph graph thật đã được thêm vào worker path; workspace path/artifact hash/preview manager boundaries đã có tests.
- CLI smoke run đã thực thi submit → queued run → worker → `awaiting_acceptance`; lệnh tài liệu đã được sửa để hỗ trợ `--name` và `--change` đúng như README.
- Worker hiện tạo role-handoff artifacts, trusted test evidence, candidate SHA và chỉ tạo approval khi PreviewManager trả `ready`; smoke run khi Docker engine thiếu đã bị gate đúng thành `failed`.
- Paperclip wake hiện tạo run thật qua Core API và chống trùng bằng idempotency; event stream SSE có cursor route riêng; Codex CLI runner wrapper đã có structured result/timeout/error classification.
- Alembic migration path, bounded infrastructure retry policy và A/B/C evaluation harness với 5 fixed checks đã được thêm; evaluation lưu raw output, không bịa chi phí/token hay superiority.
- Clean install packaging đã được sửa bằng explicit setuptools discovery; `pip install -e .[dev]` thành công, `pytest` hiện đạt 20/20, hai Vite UI build thành công và Compose config hợp lệ.
- Codex CLI đã được smoke-test thật qua wrapper read-only; TaskExecutor/worktree commit boundary yêu cầu file-scope có thay đổi thật trước khi nhận handoff.
- Write-path model smoke đã tạo đúng một file trong worktree và commit thật `9348c332f30f5abb1c96cae6a51f104c7d9a5f28`; main branch không bị sửa.
- Paperclip package adapter đã theo contract official: root metadata, `createServerAdapter`, `execute`, `testEnvironment`, runtime model/sandbox và defensive JSONL parsing; package `typecheck` đạt.
- Role runner factory hiện từ chối runner lạ và chọn local/Codex theo config; sandbox cũng được validate, tránh silent downgrade.
- Chưa đạt: Paperclip server/contract end-to-end, Docker Compose image runtime (Docker daemon chưa có), full role-specific runner routing, and production model configuration/usage accounting for every role.
