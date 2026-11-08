---
name: interior-design-consultation
description: Hội thoại tư vấn thẩm mỹ kiến trúc – lắng nghe, đặt câu hỏi làm rõ khi yêu cầu mơ hồ, ghi nhớ DesignBrief và đề xuất phương án A/B có cấu trúc.
key: paperclipai/bundled/interior-design/interior-design-consultation
defaultInstall: true
recommendedForRoles:
  - ceo
  - product
  - designer
  - architect
tags:
  - interior-design
  - consultation
  - design-brief
  - chief-architect
---

# Interior Design Consultation (Tư Vấn Thiết Kế & Quản Trị Design Brief)

## Chủ sở hữu (Owner)
- **Primary Agent**: `Chief Architect` (`agent_concierge`)

## Mô tả & Mục tiêu
Điều phối hội thoại trung tâm với chủ nhà theo đúng quy trình 8 bước:
**Lắng nghe → Hiểu → Hỏi khi thiếu → Đề xuất → Cho xem trước → Nhận nhận xét → Sửa bản nháp → Xin duyệt → Áp dụng**.
Cập nhật liên tục hồ sơ dự án (`DesignBrief`, `ConfirmedFacts`, `Assumptions`, `Preferences`, `OpenQuestions`, `Decisions`, `Budget`, `SceneRevision`) để không bao giờ hỏi lại thông tin đã xác nhận.

## Trigger (Khi nào kích hoạt)
- Mọi tin nhắn hội thoại của người dùng gửi cho `Chief Architect` hoặc khi phản hồi mơ hồ (VD: *"Tôi thấy phòng này chưa đẹp"*, *"Nhìn hơi tối"*).

## Prerequisites (Điều kiện tiên quyết)
- Có kết nối tới hồ sơ `Project` và lịch sử `Conversation` hiện tại.

## Tool Allowlist
- `ask_user`
- `brief.update`
- `scene.read`
- `scene.propose`
- `task.handoff`

## Input / Output JSON Schema

### Input Schema
```json
{
  "type": "object",
  "required": ["project_id", "user_message", "current_brief"],
  "properties": {
    "project_id": { "type": "string" },
    "user_message": { "type": "string" },
    "current_brief": { "type": "object" }
  }
}
```

### Output Schema
```json
{
  "type": "object",
  "required": ["intent", "response_text", "brief_patch"],
  "properties": {
    "intent": { "type": "string", "enum": ["clarify_question", "propose_change", "handoff_specialist", "answer_info"] },
    "response_text": { "type": "string" },
    "structured_question": { "type": "object" },
    "brief_patch": { "type": "object" }
  }
}
```

## Quy tắc Fail / Ask-User
- Nếu người dùng nói câu cảm tính như *"chưa đẹp"*, *"hơi bí"*, **TUYỆT ĐỐI KHÔNG** tự ý xóa/sửa toàn bộ scene 3D. Phải hỏi làm rõ theo 4 chiều: **Màu sắc / Bố cục lối đi / Phong cách / Vật liệu & Ánh sáng** kèm các lựa chọn tương tác nhanh.
- Không hỏi lại các thông tin đã nằm trong `ConfirmedFacts`.

## Ví dụ (Example)
- **User**: *"Phòng khách nhìn chưa đẹp lắm."*
- **Chief Architect**: *"Để tôi điều chỉnh đúng ý bạn nhất, điểm nào đang làm bạn chưa ưng ý: (1) Bố cục sofa hơi chật lối đi, (2) Tông màu sơn tường/sàn gỗ chưa ấm, hay (3) Muốn đổi sang phong cách Japandi / Modern Luxury?"*

## Test Cases
1. **TC-IDC-01**: User nói *"Phòng chưa đẹp"* → Agent trả về `structured_question` làm rõ nhu cầu, `SceneRevision` giữ nguyên không bị sửa bừa.
2. **TC-IDC-02**: User trả lời câu hỏi đang chờ → Agent tiếp tục đúng checkpoint công việc trước đó.
