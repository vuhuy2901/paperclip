---
name: pascal-scene-editing
description: Thao tác có kiểm soát trên mô hình 3D Pascal SceneGraph thông qua MCP Gateway (scene.read, scene.propose, scene.validate, scene.preview, scene.apply, scene.restore) kèm kiểm tra xung đột phiên bản.
key: paperclipai/bundled/interior-design/pascal-scene-editing
defaultInstall: true
recommendedForRoles:
  - engineer
  - architect
tags:
  - interior-design
  - pascal-3d
  - mcp
  - scenegraph
  - bim
---

# Pascal Scene Editing (Điều Khiển Pascal 3D SceneGraph Qua MCP)

## Chủ sở hữu (Owner)
- **Primary Agent**: `Geometry & BIM Specialist` (`agent_geometry`) & `Furniture Planner` (`agent_furniture`)

## Mô tả & Mục tiêu
Cung cấp lớp giao tiếp an toàn, tuần tự (tối đa 1 tác vụ ghi Scene cùng lúc trên mỗi dự án) tới `@pascal-app/mcp` và Canonical SceneGraph thông qua 6 adapter chuẩn:
`scene.read`, `scene.propose`, `scene.validate`, `scene.preview`, `scene.apply`, `scene.restore`.

## Trigger (Khi nào kích hoạt)
- Khi Agent cần đọc trạng thái phòng 3D, tạo bản nháp thay đổi, áp dụng đề xuất đã được phê duyệt hoặc khôi phục (`rollback`) về phiên bản trước.

## Prerequisites (Điều kiện tiên quyết)
- Có `project_id` và `expected_revision` để kiểm tra Optimistic Concurrency Control (OCC).

## Tool Allowlist
- `scene.read`
- `scene.propose`
- `scene.validate`
- `scene.preview`
- `scene.apply`
- `scene.restore`

## Input / Output JSON Schema

### Input Schema
```json
{
  "type": "object",
  "required": ["project_id", "operation"],
  "properties": {
    "project_id": { "type": "string" },
    "operation": { "type": "string", "enum": ["read", "propose", "validate", "preview", "apply", "restore"] },
    "expected_revision": { "type": "integer" },
    "patch": { "type": "object" },
    "target_revision": { "type": "integer" }
  }
}
```

### Output Schema
```json
{
  "type": "object",
  "required": ["ok", "revision", "scene_id"],
  "properties": {
    "ok": { "type": "boolean" },
    "revision": { "type": "integer" },
    "scene_id": { "type": "string" },
    "conflict": { "type": "boolean" },
    "diff_summary": { "type": "object" }
  }
}
```

## Quy tắc Fail / Ask-User
- Nếu `expected_revision` khác với `current_revision` của dự án (do Agent khác hoặc người dùng vừa sửa): trả về `conflict: true`, đọc lại scene mới nhất và hợp nhất thay vì ghi đè mù.
- Mọi lệnh `scene.apply` từ Agent bắt buộc phải gắn với `proposal_id` đã ở trạng thái `approved`.

## Ví dụ (Example)
- Gọi `scene.propose` để dịch chuyển bàn trà 200mm, sau khi người dùng nhấn **Duyệt & Áp dụng**, gọi `scene.apply` tạo `Revision #17`.

## Test Cases
1. **TC-PSE-01**: Gọi `scene.apply` với `expected_revision` cũ → Bị chặn bởi kiểm tra xung đột phiên bản (`conflict: true`).
2. **TC-PSE-02**: Gọi `scene.restore` về `Revision #1` → Khôi phục chính xác trạng thái hình học và tạo bản ghi lịch sử mới.
