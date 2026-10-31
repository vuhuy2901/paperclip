# ĐỀ BÀI TRIỂN KHAI: AI SOFTWARE COMPANY

Ngày chốt: 01/11/2026. Phiên bản đặc tả: 1.0.

Tài liệu này là đầu vào giao việc cho coding agent. Hãy xây dựng hệ thống chạy được, kiểm thử được và bàn giao được theo toàn bộ đặc tả dưới đây. Không dừng ở kế hoạch, dashboard mẫu hoặc mô phỏng hội thoại giữa các agent.

## 1. Mục tiêu và phạm vi đã chốt

Xây một công ty phần mềm AI gồm **1 Human Product Owner (PO), 8 vai trò AI và một lõi điều phối tự động**. PO đưa yêu cầu, xem sản phẩm chạy thật, phản hồi và nghiệm thu. AI thực hiện phân tích, thiết kế, lập trình, review, kiểm thử và triển khai bản xem trước.

Điểm nhấn của đồ án: **tiếp quản một ứng dụng có sẵn, thực hiện các yêu cầu thay đổi liên tiếp và kiểm chứng các chức năng cũ vẫn hoạt động**. Hệ thống cũng hỗ trợ khởi tạo dự án mới từ template đã kiểm soát.

Kịch bản trung tâm: ứng dụng bán hàng đang chạy → PO yêu cầu thêm giá VIP → hệ thống phân tích tác động, sửa ứng dụng, bắt lỗi cộng dồn khuyến mãi, chạy regression → xuất bản xem trước → PO nghiệm thu. Sau đó tiếp tục thêm phí vận chuyển mà vẫn giữ đúng quy tắc VIP.

Không tuyên bố hiểu mọi repository, tự vận hành production hoặc luôn tạo code đúng. Bản đầu hỗ trợ tốt một stack cố định và một miền ứng dụng cụ thể.

### 1.1 Điều bắt buộc

- Agent thực sự đọc/ghi file, chạy công cụ, tạo commit, build, test và triển khai.
- Bàn giao qua file, commit, thiết kế, API contract và báo cáo có cấu trúc.
- Trạng thái đạt dựa trên kết quả thực thi do hệ thống thu thập; lời agent tự báo không đủ.
- Có đủ tám vai trò riêng, có prompt/skill, quyền và ngữ cảnh riêng.
- Có vòng sửa lỗi giới hạn; vượt giới hạn phải dừng và báo PO.
- Có trạng thái lưu bền vững, khôi phục sau restart, xử lý yêu cầu trùng.
- Paperclip là giao diện quản lý chính; có màn hình riêng để thử và so sánh sản phẩm trước/sau.
- Hệ thống tự viết phải chạy được qua API/CLI khi chưa mở Paperclip.

### 1.2 Không đưa vào bản đầu

- Không tích hợp thêm Temporal, ASET, DeerFlow, RepoPilot hoặc một Agent Orchestrator tổng thể thứ hai.
- Không thêm Callee: dự án này có cả điều phối workflow, trùng phần trách nhiệm LangGraph.
- Không bắt buộc Kubernetes, vector database, thanh toán thật hoặc tự huấn luyện model.
- Không xây mạng xã hội cho agent, phòng họp giả lập hoặc hội thoại dài chỉ để trình diễn.
- Không bắt buộc tám model khác nhau, tám máy chủ hoặc tám tiến trình luôn chạy.
- Không cài tất cả repo tham khảo rồi để chúng cùng tự điều phối toàn dự án.

## 2. Công nghệ chính thức

| Lớp | Công nghệ | Trách nhiệm |
|---|---|---|
| Quản lý công ty | Paperclip self-hosted | PO, project, task, tám vai trò, hoạt động và liên kết kết quả |
| Tích hợp Paperclip | External adapter TypeScript và bridge | Gửi yêu cầu, đồng bộ task/trạng thái, chuyển quyết định PO |
| API lõi | Python + FastAPI | Project, run, artifact, approval, preview, cancellation |
| Điều phối | Python + LangGraph | Phụ thuộc công việc, chạy vai trò, checkpoint, vòng sửa, chờ PO |
| Hợp đồng dữ liệu | Pydantic + JSON Schema | Kiểm tra đầu vào/đầu ra, phiên bản schema |
| Lưu dữ liệu | PostgreSQL | Dữ liệu lõi, job queue, sự kiện, checkpoint LangGraph |
| Bộ chạy mặc định | Codex CLI qua wrapper subprocess | Thực thi các nhiệm vụ có công cụ đọc/ghi/chạy lệnh |
| Công cụ chuyên biệt | Xera và backend review nếu vượt kiểm thử tích hợp | Tester/Reviewer qua adapter có hợp đồng rõ ràng |
| Mã nguồn | Git + Git worktree | Branch theo nhiệm vụ, snapshot, commit, tích hợp |
| Thực thi | Docker | Container nhiệm vụ và container kiểm chứng tách biệt |
| Triển khai demo | Docker Compose | Bản baseline và candidate có URL riêng |
| Kiểm thử | pytest, Playwright, lint/typecheck/build | Backend, UI, nghiệp vụ và regression |
| Màn hình nghiệm thu | React + TypeScript + Vite | So sánh bản trước/sau, xem tác động, phản hồi |
| Máy phát triển | WSL2 Ubuntu + Docker Desktop trên Windows | Môi trường Linux nhất quán cho công cụ |

Chốt phiên bản tương thích khi bắt đầu, ghi vào lockfile và tài liệu. Không hardcode tên model chưa kiểm tra. Chọn model ID thực sự khả dụng với tài khoản triển khai, lưu cấu hình theo vai trò và chụp lại cấu hình cho mỗi run.

Dùng PostgreSQL của lõi với database/user riêng so với Paperclip. Có thể cùng một PostgreSQL server trong môi trường dev, nhưng không đọc/ghi trực tiếp bảng nội bộ Paperclip.

Codex CLI là mặc định, không phải ràng buộc buộc mọi công cụ chuyên biệt phải chạy bên trong Codex. LangGraph có thể gọi CLI/API chuyên dụng nếu đáp ứng hợp đồng và tạo bằng chứng thật.

## 3. Kiến trúc và quyền quyết định

```mermaid
flowchart TB
    PO[Human PO] --> PC[Paperclip]
    PO --> UI[Màn hình nghiệm thu trước / sau]
    PC --> BR[External adapter + bridge]
    BR --> API[FastAPI]
    UI --> API
    API --> DB[(PostgreSQL: jobs, events, checkpoints)]
    DB --> WK[Worker + LangGraph]
    WK --> RR[Role runners]
    RR --> CX[Docker task containers + Git worktrees]
    CX --> INT[Integration commit]
    INT --> VERIFY[Trusted verification runner]
    VERIFY --> ART[Artifact store]
    VERIFY --> PRE[Preview manager: Docker Compose]
    WK --> BR
    ART --> UI
    PRE --> UI
```

### 3.1 Nguyên tắc sở hữu

- **LangGraph sở hữu trạng thái quy trình kỹ thuật** và quyền chuyển bước.
- **Paperclip sở hữu giao diện quản trị**; trạng thái kỹ thuật trên Paperclip là bản đồng bộ từ lõi.
- **Trusted verification runner sở hữu bằng chứng thực thi**. Agent đề nghị chạy kiểm tra nhưng không có quyền tự ghi kết quả đạt vào kho bằng chứng.
- **Integration manager sở hữu việc hợp nhất branch**, không để nhiều agent tự merge vào main.
- **Preview manager sở hữu Docker control plane và triển khai**. Agent không được mount Docker socket của host.
- **PO sở hữu quyết định phạm vi, tiêu chí nghiệp vụ, nhận bản bàn giao và yêu cầu sửa**.

### 3.2 Job queue và worker

Dùng job queue trên PostgreSQL và worker riêng; không chạy pipeline dài trong request FastAPI hoặc BackgroundTasks làm cơ chế chính. Có lease, heartbeat, timeout và khóa theo project. Mỗi project chỉ có một change run đang sửa mã nguồn ở một thời điểm. Cho phép BE/FE chạy đồng thời bên trong run đó trên worktree riêng khi không xung đột phạm vi.

Các operation tạo branch, commit, preview, approval và event đồng bộ phải có idempotency key. Khôi phục checkpoint không có nghĩa các side effect tự nhiên chỉ chạy một lần; phải tự chống lặp.

## 4. Tích hợp Paperclip: phần phải xây thật

Paperclip là lựa chọn giao diện đã chốt. Không được giả định cài Paperclip là tự có chọn model, nghiệm thu PRD và đồng bộ evidence cho lõi tùy chỉnh.

### 4.1 Cách nối

1. Tạo một company và tám agent identity tương ứng tám vai trò.
2. Xây một external adapter dùng chung, nhận `role_id` và cấu hình bộ chạy/model.
3. Adapter chuyển yêu cầu đánh thức hoặc thao tác của PO đến FastAPI. Lõi trả run ID/job ID nhanh; không giữ HTTP request đến khi coding xong.
4. Worker thực thi; bridge đồng bộ trạng thái, task con, báo cáo và link artifact về Paperclip qua API hỗ trợ.
5. Tám identity dùng để gán vai trò, task và cấu hình. LangGraph quyết định lúc nào vai trò đủ điều kiện thực thi.
6. Vô hiệu hóa lịch tự chạy không cần thiết. Wake-up trùng hoặc không đúng trạng thái phải thành no-op có audit, không tạo pipeline mới.

### 4.2 Cấu hình model

- Cấu hình mỗi vai gồm runner, model ID, giới hạn thời gian, giới hạn sử dụng, skill và tool policy.
- Metadata adapter cung cấp lựa chọn model phù hợp với runner.
- Cầu nối xác thực và đồng bộ cấu hình xuống lõi; không hardcode model trong prompt.
- Nếu UI Paperclip phiên bản chốt chưa hỗ trợ trường cần thiết, thêm một panel cấu hình nhỏ, không dựng lại toàn dashboard.
- Không hiển thị chi phí giả. Nếu runner không cung cấp đủ usage hoặc bảng giá, hiển thị `unknown` và vẫn áp dụng timeout/concurrency/run limit.

### 4.3 Quyết định PO

- Hỗ trợ duyệt PRD/acceptance criteria và duyệt candidate bàn giao.
- Quyết định phải gắn với `approval_id`, `run_id`, phiên bản artifact, và commit khi có.
- Chỉ resume đúng checkpoint đang chờ quyết định đó.
- Nếu API approval của Paperclip không biểu diễn được nghiệp vụ này, dùng panel nghiệm thu gọi API lõi có xác thực; gắn link vào Paperclip và đồng bộ audit.
- Không giả định biến môi trường approval tự resume LangGraph.
- Thay đổi trạng thái ticket thành done bằng tay không được tự động vượt cổng kỹ thuật.

### 4.4 Kiểm tra tích hợp đầu tiên

Trước khi làm giao diện đẹp, phải chứng minh: một task Paperclip → một job lõi → một artifact thật → trạng thái và link quay lại đúng task; gửi lặp không tạo job thứ hai; quyết định PO resume đúng run.

Tài liệu tham khảo: https://docs.paperclip.ing/adapters/overview và https://docs.paperclip.ing/reference/adapters/creating-an-adapter/.

## 5. Tám vai trò và đầu ra bắt buộc

Mỗi vai có thư mục role riêng chứa prompt, skill references, tool policy và output schema. Một model có thể đảm nhiệm nhiều vai nhưng dùng phiên làm việc/context riêng. Không chuyển toàn bộ transcript của mọi vai cho mọi vai khác.

| Vai trò | Đầu vào | Công việc | Artifact bắt buộc |
|---|---|---|---|
| Project Manager | Yêu cầu PO, architecture brief, lịch sử project | Làm rõ yêu cầu, chia task, dependency, file scope và AC | `prd.md`, `acceptance.json`, `task-graph.json` |
| Architect | Repo snapshot, yêu cầu, test baseline | Phân tích tác động, phương án, DB/API, giới hạn | `architecture.md`, `impact-map.json`, `openapi.yaml`, kế hoạch migration |
| UI/UX Designer | PRD, luồng nghiệp vụ, design hiện có | User flow, bố cục, trạng thái loading/empty/error, responsive | `design-system/MASTER.md`, tài liệu từng màn hình, wireframe HTML |
| Backend Developer | Task, API/schema, AC | Viết API, nghiệp vụ, migration, unit/integration test | Branch, commit, diff, handoff và danh sách test |
| Frontend Developer | Task, design system, API contract | Giao diện, tương tác, trạng thái lỗi, accessibility cơ bản | Branch, commit, diff, ảnh preview và handoff |
| Code Reviewer | Candidate commit, diff, spec, AC | Review logic, bảo mật, hiệu năng và chất lượng | `review.json`, findings có file/line và mức độ |
| Tester | Candidate, AC đã duyệt, baseline tests | Kiểm thử API/UI, regression, tái hiện bug | Test code, JUnit/JSON, Playwright trace/report, `bugs.json` |
| DevOps | Candidate đã đạt, deployment spec | Chuẩn bị cấu hình deploy, yêu cầu build/deploy, phân tích lỗi | Docker config, image digest, deployment report, URL và smoke report |

Architect phải phân biệt **đã quan sát trong code** và **suy luận cần xác minh**. Impact map có đường dẫn, symbol/API liên quan và lý do; không dùng sơ đồ tự tưởng tượng làm bằng chứng.

PM không cần đọc/sửa mọi file để làm việc; nó lập kế hoạch từ brief đã kiểm chứng. Reviewer không được sửa code sản phẩm. Tester chỉ được sửa test trong phạm vi cho phép. DevOps chỉ được sửa file triển khai đã cấp quyền; thực thi deploy qua preview manager.

## 6. Repo tái sử dụng đã chọn

Đây là shortlist dựa trên tài liệu và một phần mã nguồn đã đọc, **không phải kết quả benchmark**. Agent triển khai phải kiểm tra license, commit, dependency, test và cách gọi không tương tác trước khi tái sử dụng. Ghi provenance, commit SHA và phần sửa vào `docs/reuse-manifest.md`; giữ license/notice cần thiết. Không import code không có quyền tái sử dụng rõ ràng.

### 6.1 PM và Architect: Hivemind

- Repo: https://github.com/cohen-liel/hivemind
- File đã xác minh: `pm_agent.py`, `architect_agent.py`, `dag_executor_langgraph.py`.
- Lấy thiết kế TaskGraph, dependency, `context_from`, file scope, required artifacts và ArchitectureBrief.
- Không cài nguyên dashboard/runtime Hivemind cạnh Paperclip.
- Module gốc có phụ thuộc nội bộ; không giả định copy hai file là chạy. Tách contract/prompt/logic cần thiết và thay bộ gọi model bằng runner interface.
- Hivemind mô tả khóa tuần tự cho writer trong cùng project. Chạy BE/FE song song bằng worktree và tích hợp là trách nhiệm hệ thống này.

### 6.2 UI/UX: UI UX Pro Max

- Repo: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Dùng dữ liệu, công cụ tìm kiếm và cơ chế lưu design system chung + override từng trang.
- Bổ sung user flow, wireframe, screenshot review và kiểm tra trạng thái tương tác.
- Skill không bảo đảm giao diện đẹp; phải render và kiểm tra sản phẩm thực tế.

### 6.3 Developer: Superpowers

- Repo: https://github.com/obra/superpowers
- Chọn `test-driven-development`, `systematic-debugging`, `verification-before-completion`; tham khảo cách nhận review và lập kế hoạch.
- Tùy biến để phù hợp task đã được LangGraph giao. Không tự khởi tạo một workflow toàn dự án khác hoặc tự merge ngoài integration manager.
- Bổ sung hướng dẫn theo stack FastAPI, SQLAlchemy/migration, PostgreSQL, React/TypeScript.

### 6.4 Reviewer: Code Review Agent

- Repo: https://github.com/S1rt3ge/code-review-agent
- Thử backend review Security/Performance/Style/Logic và Review Passport.
- Bọc thành runner có đầu vào commit/diff/spec, đầu ra findings chuẩn. Có thể dùng service riêng nếu tách module quá tốn công.
- Demo offline có kết quả xác định trước; không dùng demo đó để chứng minh chất lượng review model thật.
- LLM review là nhận định có thể sai; ghép với lint/typecheck/test và các kiểm tra bảo mật có thể chạy lặp.

### 6.5 Tester: Xera

- Repo: https://github.com/xera-ai/xera
- Docs: https://xera-ai.github.io/xera/
- App mẫu: https://github.com/xera-ai/xera-sample-app
- Tests mẫu: https://github.com/xera-ai/xera-sample-app-tests
- Ưu tiên thử ticket/spec → Gherkin → Playwright/HTTP → execution → report; khảo sát impact/coverage để phục vụ regression.
- Cần bridge từ task/AC của lõi; không ép người dùng phải vận hành thêm Jira chỉ để dùng Xera.
- Có thể dùng module thấp hơn hoặc chuyển AC thành input cục bộ nếu luồng issue tracker không phù hợp.
- Không tự sửa assertion nghiệp vụ để test pass. Đổi kỳ vọng phải có yêu cầu/AC mới đã duyệt; sửa locator được lưu diff riêng và kiểm tra không làm yếu test.

### 6.6 DevOps: Autonomous DevOps Agent

- Repo chính xác: https://github.com/fatmaabdulfattah/autonomous-devops-agent
- Lấy ý tưởng/module scaffold Docker/CI, đọc log và chẩn đoán/sửa lỗi.
- Quy trình gốc hỏi người dùng từng bước và có hành vi commit/push main; phải đổi sang task branch, API quyết định và giới hạn vòng sửa.
- Không đưa pipeline tương tác nguyên bản vào subprocess rồi để nó treo chờ stdin.
- Bản đầu chỉ bắt buộc Docker Compose local preview. Cloud deploy là mở rộng riêng, không là điều kiện để demo thành công.

### 6.7 Quy tắc quyết định giữ hoặc thay

Mỗi tích hợp phải có một bài thử nhỏ và log kết quả. Nếu repo không thể gọi ổn định, thiếu license phù hợp hoặc buộc thay toàn kiến trúc, ghi lý do và dùng runner mặc định + skill tương đương. Không giả vờ đã tích hợp repo khi chỉ chép mô tả vào README. Kết quả nghiệm thu theo năng lực thực tế, không theo số repo cài được.

## 7. Luồng nghiệp vụ đầy đủ

### 7.1 Nhập dự án

1. PO tạo project bằng template hoặc repo URL đã được cấp quyền.
2. Hệ thống tạo mirror/checkout do mình quản lý; không sửa thư mục gốc tùy tiện.
3. Đọc cấu trúc, dependency, migration và lệnh build/test; ghi inventory.
4. Chạy baseline build/test và lưu kết quả trước khi thay đổi.
5. Nếu baseline đã lỗi, ghi rõ lỗi có sẵn. Không tính nó thành lỗi do thay đổi mới và không bỏ qua âm thầm; sửa baseline bằng task riêng hoặc yêu cầu PO chốt ngoại lệ có phạm vi.

### 7.2 Xử lý change request

```text
Yêu cầu PO
  → PM làm rõ ý định
  → Architect đọc repo + impact map
  → PM hoàn thiện PRD, AC và TaskGraph
  → PO duyệt phạm vi/AC
  → Architect chốt API/schema; UI/UX chốt màn hình
  → Backend và Frontend thực hiện theo dependency
  → Integration manager tạo candidate commit
  → Reviewer + Tester trên cùng candidate
  → Trusted evidence gate
       lỗi → giao lại đúng vai → candidate mới → kiểm chứng lại
       đạt → DevOps build/deploy preview → smoke test
  → PO thử baseline/candidate và nghiệm thu
       nhận → đặt candidate thành phiên bản được chấp nhận
       yêu cầu sửa → tạo revision có liên kết, giữ lịch sử
```

FE chỉ bắt đầu phần phụ thuộc API khi contract đã chốt; có thể dùng mock theo contract để phát triển giao diện. Test tích hợp cuối phải dùng backend thật. BE/FE chỉ chạy song song nếu phạm vi file và phụ thuộc cho phép.

### 7.3 Yêu cầu đến giữa lúc đang chạy

- Lưu thành pending change, hiển thị rõ không thuộc phạm vi đang chạy.
- PO có thể chọn xếp hàng hoặc hủy run hiện tại để lập lại kế hoạch.
- Không âm thầm sửa AC giữa lượt test; không để hai run cùng sửa một project.
- Không cần hỗ trợ chèn/sửa DAG đang thực thi trong bản đầu.

## 8. Hợp đồng dữ liệu và trạng thái

Các tên dưới đây là hợp đồng của hệ thống tự xây, không phải API có sẵn của Paperclip/LangGraph. Hiện thực bằng Pydantic, sinh JSON Schema và kiểm tra tại biên.

### 8.1 Thực thể chính

| Thực thể | Trường tối thiểu |
|---|---|
| Project | id, name, repo, stack_profile, accepted_commit, Paperclip mapping |
| ChangeRequest | id, project_id, text, acceptance_version, parent_change_id |
| WorkflowRun | id, change_id, status, baseline_sha, candidate_sha, repair_count, config_snapshot |
| Task | id, run_id, role, goal, depends_on, context_from, file_scope, required_artifacts, AC IDs |
| AgentRun | id, task_id, attempt, runner, model, timestamps, status, usage, failure_category |
| Artifact | id, run_id, type, relative_path/object_key, sha256, size, producer, commit_sha |
| Evidence | id, run_id, candidate_sha, check_id, command, image_digest, exit_code, status, report refs |
| Finding | id, source, severity, file/line, AC refs, reproduction, suggested_owner, disposition |
| Approval | id, run_id, kind, artifact_version, candidate_sha, status, actor, reason |
| Deployment | id, run_id, commit_sha, image_digest, URL, health/smoke evidence, status |
| Event | id, run_id, sequence, type, timestamp, payload, correlation_id |

### 8.2 TaskResult

```json
{
  "schema_version": "1",
  "task_id": "task-example",
  "agent_run_id": "agent-run-example",
  "status": "completed",
  "summary": "Implemented the assigned change",
  "base_commit": "<sha>",
  "result_commit": "<sha>",
  "artifact_ids": [],
  "files_changed": [],
  "requested_checks": [],
  "blocking_questions": [],
  "handoff_notes": ""
}
```

`completed` ở TaskResult chỉ là agent kết thúc công việc; không tự biến thành `verified` hoặc `accepted`. Artifact tham chiếu phải tồn tại, trong workspace cho phép, hash hợp lệ và gắn đúng run.

### 8.3 Trạng thái workflow

`queued → analyzing → awaiting_scope_approval → planning → implementing → integrating → verifying → deploying → awaiting_acceptance → accepted`.

Nhánh khác: `repairing`, `blocked`, `failed`, `cancelling`, `cancelled`, `rejected`. Ghi transition table và guard trong code. Chặn transition không hợp lệ ở API/worker, không chỉ ở UI.

Trạng thái kiểm tra: `pass`, `fail`, `inconclusive`, `not_run`. Timeout, thiếu report, thiếu công cụ hoặc không thu được kết quả phải là `inconclusive`/lỗi, không là `pass`.

## 9. Cổng kiểm chứng và vòng sửa

### 9.1 Trusted evidence

- Agent đề xuất lệnh kiểm tra; runner chỉ chạy command profile đã cấu hình hoặc đã được kiểm tra, không coi chuỗi shell tùy ý là lệnh đáng tin.
- Checkout đúng candidate SHA vào container kiểm chứng sạch.
- Thu command, thời gian, exit code, stdout/stderr, report, test count, image digest và commit SHA từ tiến trình thực tế.
- Report thô đặt ở volume agent không ghi được; manifest do service lõi tạo.
- Test không chạy, không có test hoặc test bị skip ngoài chính sách không được báo đạt.
- Các AC bắt buộc phải có test hoặc phương pháp nghiệm thu thủ công được chỉ rõ; chưa nghiệm thu thủ công thì chưa accepted.
- Test suite chuẩn đã được chấp nhận phải được bảo vệ khỏi xóa/giảm assertion. Thay đổi test chuẩn tạo diff riêng để xem xét.
- Bằng chứng bảo đảm nguồn gốc trong phạm vi hệ thống, không chứng minh phần mềm không còn mọi lỗi.

### 9.2 Điều kiện candidate đạt kỹ thuật

1. Artifact/schema bắt buộc hợp lệ.
2. Không còn conflict hoặc thay đổi ngoài phạm vi chưa giải thích.
3. Lint/typecheck/build và test profile bắt buộc đạt.
4. Regression baseline đạt hoặc ngoại lệ có sẵn được ghi rõ và không tăng lỗi.
5. Không còn finding blocking chưa giải quyết; false positive phải có disposition và lý do, không tự xóa.
6. Báo cáo đều cùng candidate SHA; mọi commit sửa sau đó làm hết hiệu lực các gate liên quan.
7. Deploy đúng image của candidate; health check và smoke nghiệp vụ đạt.

HTTP 200 chỉ chứng minh endpoint phản hồi, không đủ chứng minh đăng nhập, giỏ hàng hoặc tính tiền đúng.

### 9.3 Giới hạn vòng sửa và retry

- Cho phép lần thực hiện đầu và tối đa **3 vòng sửa nghiệp vụ/code cho một change run**.
- Mỗi vòng sửa phải tạo candidate và chạy lại gate; vòng thứ ba vẫn cần được kiểm chứng.
- Sau 3 vòng vẫn lỗi: `blocked`, kèm lỗi còn lại, những lần sửa đã thử và lựa chọn cho PO.
- Retry lỗi hạ tầng/rate limit tách khỏi repair count; tối đa 2 retry cho một operation, có backoff và timeout.
- Retry không được push/deploy lặp do thiếu idempotency.
- JSON đầu ra không hợp lệ: cho một lần yêu cầu chuẩn hóa; vẫn sai thì task thất bại rõ ràng.
- Trả lỗi về đúng vai theo file ownership và loại finding; không mặc định gọi lại toàn bộ tám agent.

## 10. Workspace, quyền và tài nguyên

- Một project có repository do hệ thống quản lý; một task writer có branch/worktree riêng.
- Root code dùng chung khi tích hợp; task container chỉ mount phần workspace cần thiết.
- Worktree là cách tách sửa mã, không phải ranh giới bảo mật. Docker/container policy đảm nhiệm cô lập thực thi.
- Giới hạn CPU/RAM, thời gian, tiến trình và lượng log; container không privileged.
- Không mount thư mục home, toàn bộ ổ đĩa, Docker socket hoặc secret của control plane vào task container.
- Runner broker inject credential tối thiểu; không lưu token trong artifact, prompt snapshot hoặc log. Redact log và kiểm tra trước xuất báo cáo.
- Việc đọc README/issue trong repo là dữ liệu của task; không được dùng chúng để vượt quyền hoặc thay chính sách hệ thống.
- Git remote push không bắt buộc cho demo; khi bật, chỉ push nhánh được cấp, không tự force-push main.
- Reviewer read-only; Tester chỉ sửa test mới/phạm vi cho phép; integration/deployment do service riêng.
- Hủy run phải dừng subprocess/container, giải phóng lease và giữ evidence đã thu; không chỉ đổi nhãn trên dashboard.

## 11. Sản phẩm demo và dữ liệu

Stack sản phẩm được tạo/sửa: React + TypeScript + Vite; FastAPI; PostgreSQL; SQLAlchemy + Alembic; Docker Compose. Đây là stack của ứng dụng bán hàng, tách khỏi control plane.

### 11.1 Baseline được chuẩn bị trước

- Tài khoản khách thường/VIP mẫu và đăng nhập.
- Danh sách sản phẩm, chi tiết, giỏ hàng, checkout giả lập.
- Đơn hàng lưu snapshot giá tại thời điểm tạo.
- Khuyến mãi có quy tắc rõ ràng, dữ liệu seed tái lập.
- Unit/API/E2E baseline chạy được.
- Không dùng thông tin thanh toán hay dữ liệu khách hàng thật.

### 11.2 Chuỗi thay đổi bắt buộc demo

1. **Giá VIP:** giá riêng, không cộng dồn sai với mã khuyến mãi; giữ nguyên giá đơn hàng cũ.
2. **Phí vận chuyển:** tính theo vùng/ngưỡng đã chốt; không làm hỏng VIP/khuyến mãi.
3. **Hủy đơn:** chỉ cho phép trạng thái nhất định; không làm thay đổi số tiền của đơn không bị hủy.

Mỗi yêu cầu phải có tiêu chí nghiệm thu cụ thể, dữ liệu kiểm thử và một trường hợp biên. Nếu yêu cầu mơ hồ, PM hỏi câu có ảnh hưởng nghiệp vụ; không tự đoán rồi báo hoàn thành.

### 11.3 Preview và rollback

- Baseline/candidate có service name, port, DB và seed riêng; tuyệt đối không dùng chung DB để so sánh.
- Hiển thị rõ commit/image/phiên bản dữ liệu của từng bản.
- PO có thể thử bằng hai tab hoặc hai panel. Nếu iframe bị chặn, dùng link mở riêng, không phá header bảo mật chỉ để nhúng.
- Accept candidate cập nhật con trỏ accepted version và lưu lịch sử.
- Demo rollback bằng chuyển về image + DB snapshot tương ứng trong môi trường cô lập.
- Không tuyên bố rollback migration production tự động. Với thay đổi schema, có migration plan, backup và ghi rõ giới hạn phục hồi.

## 12. Giao diện người dùng

### 12.1 Paperclip

Hiển thị project/change, task theo tám vai, trạng thái đang chạy/chờ/sửa/lỗi, summary, chi phí thực đo nếu có và link mở report/preview. Mỗi run truy ngược được từ task. Không cần dựng dashboard công ty thứ hai.

### 12.2 Màn hình nghiệm thu riêng

Một trang cho mỗi run, có:

- Yêu cầu và AC đang áp dụng.
- Bản đồ tác động: màn hình/API/bảng dữ liệu/file, lý do và mức độ chắc chắn.
- Baseline/candidate mở được, tài khoản demo và dữ liệu mẫu.
- Tóm tắt đã đổi gì bằng ngôn ngữ dễ hiểu.
- Test nghiệp vụ đạt/lỗi, ảnh lỗi và report chi tiết khi mở rộng.
- Finding chưa xử lý, trạng thái build/deploy.
- Approve / Request changes; feedback gắn với màn hình, route, AC và candidate cụ thể.
- Timeline sự kiện thật; không animation giả agent gõ hoặc phần trăm tiến độ tự bịa.

Nếu không có mẫu số công việc ổn định, dùng số task hoàn thành/tổng hiện tại thay vì phần trăm ước đoán.

## 13. API lõi cần triển khai

Đây là API do dự án tự xây. Auth mọi endpoint mutation; dùng service token cho adapter và phiên PO cho UI. Không expose preview/admin công khai mặc định.

| Method và path | Chức năng |
|---|---|
| `POST /api/projects` | Tạo project từ template/repo |
| `GET /api/projects/{id}` | Project và accepted version |
| `POST /api/projects/{id}/changes` | Tạo change request |
| `POST /api/changes/{id}/runs` | Enqueue run, hỗ trợ idempotency key |
| `GET /api/runs/{id}` | Trạng thái, task, gate, giới hạn |
| `GET /api/runs/{id}/events` | SSE có cursor để nối lại |
| `POST /api/runs/{id}/cancel` | Yêu cầu hủy thật |
| `GET /api/runs/{id}/artifacts` | Manifest artifact |
| `GET /api/artifacts/{id}` | Tải/xem file có kiểm tra quyền |
| `POST /api/approvals/{id}/decision` | Approve/reject/request changes, kiểm tra version |
| `GET /api/runs/{id}/preview` | URL baseline/candidate và trạng thái |
| `POST /api/runs/{id}/feedback` | Feedback gắn phiên bản |
| `GET /api/roles` | Tám cấu hình vai trò |
| `PUT /api/roles/{id}` | Đổi cấu hình, kiểm tra runner/model |
| `POST /api/integrations/paperclip/wake` | Nhận wake-up có xác thực/chống lặp |
| `GET /health` và `GET /ready` | Health và dependency readiness |

Không cho client tải artifact bằng đường dẫn tùy ý. Pagination cho history/report lớn. Event có sequence tăng và giữ thứ tự theo run. Quyết định với version cũ trả conflict có thông báo rõ.

## 14. Lưu trữ và cấu trúc repository đề xuất

```text
ai-software-company/
  README.md
  .env.example
  compose.yaml
  apps/
    core-api/                  # FastAPI
    worker/                    # LangGraph + job worker
    review-ui/                 # React: nghiệm thu, tác động, preview
    paperclip-adapter/         # External adapter TypeScript
  packages/
    contracts/                 # Pydantic và schema export
    orchestration/             # graph, transitions, budgets, repair routing
    runners/                   # Codex, Xera, reviewer, devops wrappers
    verification/              # trusted checks, manifests, evidence policy
    workspace/                 # repository, worktree, integration
    preview/                   # Docker Compose deploy và cleanup
    paperclip-bridge/          # mapping, events, approvals, reconciliation
  roles/
    project-manager/
    architect/
    ui-ux-designer/
    backend-developer/
    frontend-developer/
    code-reviewer/
    tester/
    devops/
  templates/storefront/        # Baseline ứng dụng demo
  evals/                      # Yêu cầu, bug fixtures, scoring
  tests/
    unit/
    integration/
    e2e/
  infra/
    images/
    migrations/
    scripts/
  docs/
    architecture.md
    setup.md
    operations.md
    demo-script.md
    reuse-manifest.md
    limitations.md
    evaluation.md
```

Có thể điều chỉnh cấu trúc để code dễ bảo trì nhưng phải giữ ranh giới trách nhiệm. Không để nhiều bản schema mâu thuẫn; schema frontend sinh từ hợp đồng chuẩn.

Artifact lưu ngoài source tree trong volume theo `project_id/run_id/`; metadata/hash trong PostgreSQL. Dùng filesystem volume cho bản đầu, không cần object storage. Backup cần bao gồm DB metadata + checkpoint + repo/artifact volume, không chỉ database.

## 15. Kiểm thử và tiêu chí nghiệm thu kỹ thuật

### 15.1 Test hệ thống điều phối

- DAG cycle bị từ chối; task chưa đủ dependency không được chạy.
- Agent trả completed nhưng không có evidence không vượt gate.
- Evidence đúng report nhưng sai commit không được dùng.
- Test command exit 0 nhưng không chạy test không đạt.
- Mã nguồn thay đổi sau review/test làm mất hiệu lực gate tương ứng.
- Repair count đúng ba vòng, không vòng lặp vô hạn.
- Restart worker tại bước chờ PO resume đúng run, không deploy/commit trùng.
- Hai wake-up cùng idempotency key chỉ tạo một job.
- Hủy run dừng tiến trình thực tế; lease được giải phóng.
- Approval cũ không nhận candidate mới.
- Artifact path traversal và ghi evidence từ task container bị chặn.
- Merge conflict được chuyển thành task giải quyết, không âm thầm bỏ thay đổi.

### 15.2 Test tích hợp

- Paperclip → core → runner → artifact → Paperclip.
- Runner chạy thật tạo file/commit; thu lỗi subprocess và timeout.
- Xera hoặc tester tương đương chạy test thật trên app demo.
- Reviewer chạy model thật trên diff kiểm thử, phân biệt với fixture/demo mode.
- Preview deploy đúng image; baseline/candidate có DB tách biệt.
- Request changes tạo revision truy vết được.

### 15.3 Các lỗi cố tình cài để demo

1. Agent báo test pass nhưng runner chưa chạy: bị chặn.
2. Giảm giá VIP cộng dồn sai: test bắt, giao Backend sửa.
3. Frontend gửi sai field API: integration test bắt.
4. Sửa tính giá làm đổi giá đơn hàng cũ: regression bắt.
5. Reviewer báo nhầm: finding được đánh giá/disposition minh bạch, không sửa code vô cớ.

Fixture dùng cho kiểm thử lỗi phải ghi nhãn. Không trình bày kết quả giả lập là kết quả agent thực thi thật.

## 16. Đánh giá chất lượng và điểm nổi bật

Thực hiện cùng một tập yêu cầu trên cùng baseline, cố định model/config khi so sánh:

- **A:** một coding agent làm nhiệm vụ với cùng bộ kiểm tra cuối.
- **B:** tám vai trò và pipeline cơ bản.
- **C:** pipeline đầy đủ có impact map và regression tích lũy.

Cho mỗi điều kiện, dùng ngân sách/thời gian tương đương và lưu số lần chạy thực tế. Tối thiểu 5 yêu cầu hoặc chuỗi thay đổi được ghi rõ; nếu có điều kiện, lặp lại để thấy biến thiên. Không suy luận mạnh từ một lần chạy may mắn.

Đo: tỷ lệ AC đạt bởi bộ đánh giá độc lập, số regression, số finding đúng/sai trên bug fixture, số lần PO can thiệp, thời gian, token/chi phí quan sát được, số vòng sửa. Dùng bộ test đánh giá cố định mà Developer không được tự làm yếu.

Không viết sẵn số liệu đẹp. Nếu C không tốt hơn A/B, báo đúng và phân tích nguyên nhân. Giá trị đồ án nằm ở hệ thống hoạt động, dữ liệu đo và cách cải tiến, không ở số lượng agent.

## 17. Lộ trình build bắt buộc theo lát cắt chạy được

### Giai đoạn 0 — kiểm tra nền và pin dependency

Đọc repository hiện tại và hướng dẫn áp dụng; kiểm tra Docker, Git, Python, Node, PostgreSQL, quyền model. Chốt version/commit. Kiểm tra license và chạy bài thử tối thiểu của repo tái sử dụng. Tạo architecture decision và reuse manifest.

Thiếu credential chỉ chặn smoke test model thật, không chặn việc xây API, schema, worker, UI và test deterministic. Tuy nhiên không được báo toàn hệ thống hoàn thành nếu đường chạy model thật chưa được xác minh.

### Giai đoạn 1 — xương sống thực thi

API → queue → worker → Developer runner → worktree/container → commit → test runner → report. Chứng minh test fail thật và một vòng sửa thật. Có CLI gọi trực tiếp và checkpoint bền vững.

### Giai đoạn 2 — nối Paperclip sớm

Tạo mapping company/project/tám role; adapter gửi task, nhận trạng thái, link artifact và resume approval. Kiểm thử chống wake-up trùng. Không trì hoãn tích hợp này đến sát cuối.

### Giai đoạn 3 — đủ tám vai

Thêm PM/Architect/Designer, contract bàn giao, BE/FE theo dependency, integration manager, Reviewer/Tester, repair routing và DevOps preview. Hoàn thành một change run đầu-cuối.

### Giai đoạn 4 — năng lực tạo khác biệt

Impact map từ repo, regression tích lũy, baseline/candidate preview, feedback gắn màn hình/AC, chuỗi ba thay đổi nghiệp vụ.

### Giai đoạn 5 — độ tin cậy và bàn giao

Restart/resume, cancellation, timeout, permission, backup/cleanup, eval A/B/C, tài liệu vận hành và script demo. Render/kiểm tra giao diện thực tế desktop và viewport nhỏ.

Mỗi giai đoạn có commit, hướng dẫn chạy, kết quả test và hạn chế. Không dành phần lớn thời gian xây dashboard trước khi agent làm việc thật.

## 18. Định nghĩa hoàn thành

Chỉ báo hoàn thành toàn hệ thống khi có đủ:

- [ ] Chạy được theo README trên môi trường mục tiêu, có cấu hình mẫu không chứa secret.
- [ ] Paperclip tích hợp thật, hiển thị tám vai và truy cập được task/report/preview.
- [ ] Tám vai có prompt/skill/quyền/schema riêng và xuất artifact thật.
- [ ] Một change request chạy đầu-cuối bằng model thật.
- [ ] Có tình huống lỗi thật được phát hiện, giao đúng vai và sửa thành công.
- [ ] Không có evidence/sai commit thì gate chặn.
- [ ] Giới hạn sửa, retry, restart/resume và cancellation được test.
- [ ] Baseline/candidate hoạt động độc lập, PO nhận hoặc yêu cầu sửa được.
- [ ] Chuỗi VIP → phí vận chuyển → hủy đơn có regression bảo toàn chức năng cũ.
- [ ] Có báo cáo eval thực tế và giới hạn được ghi rõ.
- [ ] Có license/provenance cho mọi phần tái sử dụng.
- [ ] Không còn placeholder hoặc fixture bị trình bày như tích hợp thật.

## 19. Hướng dẫn trực tiếp cho coding agent nhận tài liệu

Hãy coi tài liệu này là đặc tả xây dựng, không phải yêu cầu viết lại một bản kế hoạch.

1. Kiểm tra workspace hiện tại và đọc hướng dẫn repository áp dụng trước khi sửa.
2. Lập checklist triển khai bám Definition of Done, sau đó bắt đầu xây lát cắt chạy được đầu tiên.
3. Tự giải quyết lựa chọn triển khai thông thường trong phạm vi stack này. Chỉ hỏi khi thiếu credential, thiếu quyền truy cập hoặc có quyết định nghiệp vụ chưa thể suy ra; tiếp tục phần độc lập trong lúc chờ.
4. Không tự thay Paperclip/LangGraph hoặc loại bỏ vai trò bắt buộc để dễ hoàn thành.
5. Có thể thay một repo tái sử dụng bằng implementation tương đương nếu bài thử chứng minh không phù hợp; ghi bằng chứng và lý do.
6. Tất cả model/tool integration phải có wrapper, timeout, structured result, error classification và test.
7. Mock chỉ dùng cho unit test và phát triển cục bộ, có nhãn; luồng nghiệm thu cuối phải chạy thật.
8. Lưu tiến độ, quyết định và việc chưa xong trong `docs/build-status.md` để tiếp tục qua nhiều phiên làm việc.
9. Không hỏi lại “có muốn làm tiếp không” sau mỗi giai đoạn. Tiếp tục đến khi đạt mục tiêu hoặc gặp blocker thật cần thông tin bên ngoài.
10. Khi bàn giao, đưa lệnh khởi động, URL sử dụng, demo script, test đã chạy, kết quả thực tế và việc chưa đạt. Không gọi hệ thống là hoàn thiện khi chỉ có scaffold hoặc UI.

## 20. Nguồn tham khảo đã sử dụng

- Paperclip adapters: https://docs.paperclip.ing/adapters/overview
- Paperclip external adapter: https://docs.paperclip.ing/reference/adapters/creating-an-adapter/
- LangGraph interrupt/checkpoint: https://docs.langchain.com/oss/python/langgraph/interrupts
- Codex non-interactive: https://learn.chatgpt.com/docs/non-interactive-mode
- Hivemind: https://github.com/cohen-liel/hivemind
- UI UX Pro Max: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Superpowers: https://github.com/obra/superpowers
- Review Agent: https://github.com/S1rt3ge/code-review-agent
- Xera: https://github.com/xera-ai/xera
- Autonomous DevOps Agent: https://github.com/fatmaabdulfattah/autonomous-devops-agent

Các đường dẫn tham khảo xác định nguồn thiết kế; không thay thế việc kiểm tra API/version/license ở thời điểm triển khai. Các endpoint, contract và chính sách trong tài liệu là phần dự án phải tự xây, trừ khi đã ghi rõ là chức năng upstream.
