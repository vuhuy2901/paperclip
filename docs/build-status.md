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
- Chưa đạt: Paperclip server/contract end-to-end, model thật, Docker Compose image runtime (Docker daemon chưa có), approval UI action wiring đầy đủ và các role runners thật.
