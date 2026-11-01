# Build status

## 2026-11-01

- Giai đoạn 0: đã kiểm tra Git, Python 3.13.7, Node 22.19.0, Docker 29.6.2, Compose 5.3.1; workspace ban đầu chỉ có đặc tả, chưa có Git repository.
- Giai đoạn 1 lát cắt đầu: đã tạo FastAPI core, SQLite dev/PostgreSQL-compatible SQLAlchemy config, project/change/run/task/event/artifact models, guarded workflow transitions, idempotency, service-token auth, worker và tests.
- `docker compose config` pass; Docker Desktop 29.6.2/Compose 5.3.1 đã chạy được và toàn bộ stack đã build/start với PostgreSQL healthy. Do môi trường có Plane chiếm host port 8000, Core API được expose ở `http://localhost:8001`.
- Trusted verification runner đã có profile allowlist, timeout, candidate SHA binding và manifest hash; test harness phát hiện và đã loại vòng đệ quy.
- Paperclip adapter boundary và review UI đã có build artifact; review UI build production thành công, có empty/loading/error-shaped flow và nút approval/request changes nối theo run boundary.
- Storefront demo backend/frontend đã có seed tái lập, tier pricing, promo non-stacking, shipping rules, immutable order snapshot, cancellation guard và regression tests; storefront UI build production thành công.
- LangGraph graph thật đã được thêm vào worker path; workspace path/artifact hash/preview manager boundaries đã có tests.
- CLI smoke run đã thực thi submit → queued run → worker → `awaiting_acceptance`; lệnh tài liệu đã được sửa để hỗ trợ `--name` và `--change` đúng như README.
- Worker hiện tạo role-handoff artifacts, trusted test evidence, candidate SHA và chỉ tạo approval khi PreviewManager trả `ready`; smoke run khi Docker engine thiếu đã bị gate đúng thành `failed`.
- Paperclip wake hiện tạo run thật qua Core API và chống trùng bằng idempotency; event stream SSE có cursor route riêng; Codex CLI runner wrapper đã có structured result/timeout/error classification.
- Alembic migration path, bounded infrastructure retry policy và A/B/C evaluation harness với 5 fixed checks đã được thêm; evaluation lưu raw output, không bịa chi phí/token hay superiority.
- Clean install packaging đã được sửa bằng explicit setuptools discovery; `pip install -e .[dev]` thành công, `pytest` hiện đạt 25/25, hai Vite UI build thành công và Compose config hợp lệ.
- Codex CLI đã được smoke-test thật qua wrapper read-only; TaskExecutor/worktree commit boundary yêu cầu file-scope có thay đổi thật trước khi nhận handoff.
- Write-path model smoke đã tạo đúng một file trong worktree và commit thật `9348c332f30f5abb1c96cae6a51f104c7d9a5f28`; main branch không bị sửa.
- Paperclip package adapter đã theo contract official: root metadata, `createServerAdapter`, `execute`, `testEnvironment`, runtime model/sandbox và defensive JSONL parsing; package `typecheck` đạt.
- Paperclip server thật đã được đưa vào Compose ở `http://localhost:3100`, chạy authenticated/private với embedded Postgres và health check pass. Bootstrap admin/company đã tạo; local external adapter `ai_company_external` đã install và load thành công từ `/opt/ai-company-adapter` với version `0.1.0`.
- Paperclip company đã có đủ tám identity: Project Manager, Solution Architect, UI/UX Designer, Backend Engineer, Frontend Engineer, Code Reviewer, QA Tester và DevOps Engineer; tất cả đều trỏ tới adapter `ai_company_external`.
- Preview control-plane đã được tách thành service `preview-manager` có Docker socket riêng; worker chỉ gọi HTTP `PREVIEW_MANAGER_URL` và không mount socket. Preview compose dùng network/volume/PostgreSQL riêng, port động và healthcheck. Smoke test thật trả `ready` ở port riêng; Core run `e4e4cbe2-e175-4b78-8572-d98d02d9fbeb` đi tới `awaiting_acceptance` với preview `http://localhost:18161` và image digest `sha256:45f668644b2c940fbca9da0fb5b49f2f5552c0aba914b00ceff5cc46193950cb`.
- Role runner factory hiện từ chối runner lạ và chọn local/Codex theo config; sandbox cũng được validate, tránh silent downgrade.
- Tám role hiện có asset riêng dưới `apps/roles/<role>/`: prompt, skills references, tool policy và output schema; test kiểm tra đủ bốn thành phần cho cả tám vai.
- Worker đã dùng catalog output theo từng role, tạo và hash đúng các artifact bắt buộc (`prd.md`, `impact-map.json`, `review.json`, `bugs.json`, deployment/smoke report và các output còn lại); deterministic mode được dán nhãn rõ là fixture, không trình bày như model execution.
- Role configuration đã chuyển vào bảng metadata bền vững, seed đủ tám role và được chụp vào `config_snapshot` của từng run; test restart-equivalent persistence qua database pass.
- OpenAPI và TaskResult JSON Schema hiện được xuất từ FastAPI/Pydantic canonical source bằng `scripts/export_contracts.py`; không có schema frontend/adapter thứ hai.
- Alembic `0001_core_tables` hiện tạo đủ 12 bảng control-plane, unique run idempotency và unique event sequence; fresh SQLite migration smoke test đã pass.
- Worker thực thi task theo dependency DAG; role `codex-cli` được route vào worktree/TaskExecutor khi có `project.repo` và file scope hợp lệ, còn thiếu điều kiện sẽ fail rõ ràng thay vì fallback fixture.
- DAG ordering/cycle guard đã tách thành module được test độc lập; cycle hoặc dependency không thỏa bị reject trước khi task chạy.
- Runtime smoke đã xác nhận Core API `/health` và `/ready`, Storefront API, Review UI, Storefront UI, adapter port và worker đều khởi động; Paperclip wake tạo run thật, idempotency hoạt động, trusted verification pass trong container. Worker mới đã lấy được image digest từ preview-manager và lưu vào Deployment; approval chỉ xuất hiện sau khi preview/verification đạt gate.
- Runtime acceptance run `c11c8927-0d5a-455e-934a-f2d5d2fa0a25` sau khi approve candidate trước đó đã chứng minh baseline/accepted commit `8cbc857487e619c93eda7f34d0c8f0203a9336a7`, candidate commit cùng SHA, 32 artifact và preview image digest `sha256:8cf16c499d77a5d55a756643a6979e51644dd4cc0b32e52b33121bc0db9d7db0`; stale preview container DNS alias đã được loại khỏi network để worker/Core dùng cùng database.
- Worker lease bền vững (`run_leases`) có claim/heartbeat/release; API từ chối active run thứ hai trên cùng project. Dependency `langgraph==0.6.11` và `xxhash==4.0.2` đã được pin để Docker build lặp lại được.
- Chưa đạt: Paperclip adapter → Core wake đã chạy thật và idempotency đã được xác nhận; model thật/Codex runtime trong container vẫn là tùy chọn chưa cấu hình, production model configuration/usage accounting cho mọi role, candidate image promotion/baseline-vs-candidate diff đầy đủ, và integration/merge tự động cho nhiều Codex worktree commits.
