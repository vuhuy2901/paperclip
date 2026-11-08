---
name: design-review-approval
description: Quản lý quy trình trình duyệt đề xuất thiết kế (SceneProposal), so sánh trước/sau (3D diff & chênh lệch chi phí), phê duyệt/từ chối/hoàn tác có nhật ký kiểm toán.
key: paperclipai/bundled/interior-design/design-review-approval
defaultInstall: true
recommendedForRoles:
  - ceo
  - architect
  - product
tags:
  - interior-design
  - approval
  - governance
  - scene-diff
---

# Design Review & Approval (Quản Trị Phê Duyệt Đề Xuất & Kiểm Toán Thay Đổi)

## Chủ sở hữu (Owner)
- **Primary Agent**: `Chief Architect` (`agent_concierge`)

## Mô tả & Mục tiêu
Mọi thay đổi bố cục, kích thước hoặc sản phẩm nội thất do AI đề xuất đều phải đóng gói thành một **Thẻ Đề Xuất (`SceneProposal`)** và liên kết với hệ thống **Approvals / Conversations** của Paperclip:
- Hiển thị rõ: `Tiêu đề`, `Agent đề xuất`, `Lý do`, `Trước / Sau`, `Chênh lệch chi phí (VNĐ)`, `Tổng dự toán mới`.
- Hỗ trợ 3 hành động: **Duyệt & Áp dụng (Approve)**, **Từ chối (Reject)** và **Hoàn tác (Undo/Restore)** về `Revision` trước.
- Chống duyệt trùng lặp (`idempotency guard`): Đề xuất đã `approved` hoặc `rejected` không thể bấm duyệt lại.

## Trigger (Khi nào kích hoạt)
- Khi Agent tạo phương án thay đổi thiết kế hoặc khi người dùng bấm Duyệt / Từ chối / Hoàn tác trên giao diện.

## Prerequisites (Điều kiện tiên quyết)
- Có `proposal_id` hợp lệ gắn với `project_id` và `base_revision`.

## Tool Allowlist
- `proposal.create`
- `proposal.approve`
- `proposal.reject`
- `scene.restore`

## Input / Output JSON Schema

### Input Schema
```json
{
  "type": "object",
  "required": ["project_id", "proposal_id", "action"],
  "properties": {
    "project_id": { "type": "string" },
    "proposal_id": { "type": "string" },
    "action": { "type": "string", "enum": ["approve", "reject", "undo"] }
  }
}
```

### Output Schema
```json
{
  "type": "object",
  "required": ["ok", "proposal_status", "new_revision", "grand_total_vnd"],
  "properties": {
    "ok": { "type": "boolean" },
    "proposal_status": { "type": "string", "enum": ["pending", "approved", "rejected"] },
    "new_revision": { "type": "integer" },
    "grand_total_vnd": { "type": "integer" }
  }
}
```

## Quy tắc Fail / Ask-User
- Nếu người dùng **Từ chối (`reject`)**: giữ nguyên `SceneRevision` và `grand_total_vnd` hiện tại, ghi nhận lịch sử từ chối.
- Nếu người dùng thử duyệt lại một proposal đã `approved`: trả về lỗi `409 Conflict` / khóa nút duyệt trên UI.

## Ví dụ (Example)
- Duyệt đề xuất đổi Sofa `2.1m` sang `1.8m` → Tăng `Revision` lên `#17`, cập nhật dự toán còn `61.041.654 ₫`.

## Test Cases
1. **TC-DRA-01**: Từ chối đề xuất → Scene và tổng dự toán không đổi.
2. **TC-DRA-02**: Đồng ý đề xuất → Scene và dự toán cập nhật ngay, nút duyệt chuyển sang trạng thái `Đã áp dụng` (không thể duyệt trùng).
