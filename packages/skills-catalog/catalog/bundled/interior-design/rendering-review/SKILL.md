---
name: rendering-review
description: Thiết lập góc máy camera, tạo ảnh phối cảnh tham khảo từ Scene 3D và kiểm tra độ nhất quán giữa hình học 3D với ảnh render.
key: paperclipai/bundled/interior-design/rendering-review
defaultInstall: true
recommendedForRoles:
  - designer
  - architect
tags:
  - interior-design
  - rendering
  - camera
  - visualization
---

# Rendering Review (Phối Cảnh Tham Khảo & Kiểm Tra Nhất Quán)

## Chủ sở hữu (Owner)
- **Primary Agent**: `Rendering Specialist` (`agent_render`)

## Mô tả & Mục tiêu
Chọn góc nhìn camera chuẩn kiến trúc (`cutaway`, `perspective`, `eye_155`, `top`), kết xuất ảnh phối cảnh tham khảo trên cloud (khi có API key) hoặc ảnh chụp Viewport Studio và đối chiếu tính nhất quán với mô hình hình học 3D.

## Trigger (Khi nào kích hoạt)
- Người dùng yêu cầu xem ảnh phối cảnh hoặc so sánh trước/sau khi đổi phong cách, vật liệu.

## Prerequisites (Điều kiện tiên quyết)
- Scene 3D đã có hình học phòng và vật liệu bề mặt.

## Tool Allowlist
- `scene.read`
- `render.capture_preview`
- `render.compare_scene_consistency`

## Input / Output JSON Schema

### Input Schema
```json
{
  "type": "object",
  "required": ["project_id", "camera_preset"],
  "properties": {
    "project_id": { "type": "string" },
    "camera_preset": { "type": "string", "enum": ["cutaway", "perspective", "top", "eye_155"] },
    "style_prompt": { "type": "string" }
  }
}
```

### Output Schema
```json
{
  "type": "object",
  "required": ["preview_ready", "scene_revision", "consistency_note"],
  "properties": {
    "preview_ready": { "type": "boolean" },
    "scene_revision": { "type": "integer" },
    "image_url": { "type": "string" },
    "consistency_note": { "type": "string" }
  }
}
```

## Quy tắc Fail / Ask-User
- **Tuyệt đối không dùng ảnh render AI để đo kích thước hay tính khối lượng dự toán.** Mọi kích thước và khối lượng bắt buộc lấy từ hình học `mm` của SceneGraph.

## Ví dụ (Example)
- Kết xuất góc nhìn người đứng `1,55m` (`eye_155`) cho phòng khách Japandi `4×5m` ở `Revision #16`.

## Test Cases
1. **TC-RR-01**: Yêu cầu tạo preview ở góc `cutaway` → Trả về thông tin gắn đúng `scene_revision` hiện hành và ghi chú rõ ảnh chỉ dùng tham khảo thẩm mỹ.
