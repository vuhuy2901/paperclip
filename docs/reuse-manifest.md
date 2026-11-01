# Reuse and provenance manifest

Ngày kiểm tra: 2026-11-01.

Bản triển khai này không copy mã nguồn từ các repository shortlist vào source tree. Các repository dưới đây chỉ được đọc để tham khảo contract, prompt pattern hoặc quy trình; phần runtime hiện tại là implementation riêng của dự án.

| Nguồn | Commit/version kiểm tra | License quan sát | Cách sử dụng | Trạng thái |
|---|---|---|---|---|
| [cohen-liel/hivemind](https://github.com/cohen-liel/hivemind) | repository `main`, kiểm tra `pm_agent.py`, `architect_agent.py`, `dag_executor_langgraph.py` | Apache-2.0 | Tham khảo task graph, dependency và artifact contract; không copy code/runtime | Không import |
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | repository `main`, LICENSE | MIT | Tham khảo cơ chế design-system và user-flow; review UI là implementation riêng | Không import |
| [obra/superpowers](https://github.com/obra/superpowers) | repository `main`, LICENSE/plugin metadata | MIT | Tham khảo TDD, systematic debugging và verification-before-completion | Không import |
| [S1rt3ge/code-review-agent](https://github.com/S1rt3ge/code-review-agent) | URL trong đặc tả; không cài vào runtime | Chưa đủ bằng chứng license của đúng repository tại thời điểm build | Chỉ là shortlist; không copy, không link như dependency | Không dùng |
| [xera-ai/xera](https://github.com/xera-ai/xera) | repository/docs được đọc theo đặc tả | Chưa đủ bằng chứng license của đúng repository tại thời điểm build | Chỉ tham khảo tester/Playwright contract; tester hiện dùng trusted pytest runner riêng | Không dùng |
| [fatmaabdulfattah/autonomous-devops-agent](https://github.com/fatmaabdulfattah/autonomous-devops-agent) | URL trong đặc tả; không cài vào runtime | Chưa đủ bằng chứng license của đúng repository tại thời điểm build | Chỉ tham khảo Docker/log diagnosis; preview manager là implementation riêng | Không dùng |

## Phụ thuộc runtime

Phụ thuộc runtime của dự án được pin trong `pyproject.toml`, `package-lock.json` và image tags trong `compose.yaml`. Paperclip được chạy từ image upstream và external adapter local; không sửa mã nguồn Paperclip. Codex CLI là công cụ bên ngoài, được gọi qua wrapper/gateway và không được đóng gói token hoặc model ID cố định vào repository.

Khi bổ sung mã từ một nguồn bên ngoài, phải cập nhật bảng này bằng URL, commit, license, file đã dùng và notice tương ứng trước khi merge.
