---
name: interior-layout-planning
description: Bố trí mặt bằng nội thất theo công năng, kiểm tra khoảng cách lối đi tối thiểu (>=600mm), vùng mở cửa và phát hiện va chạm hình học 2D/3D.
key: paperclipai/bundled/interior-design/interior-layout-planning
defaultInstall: true
recommendedForRoles:
  - designer
  - architect
tags:
  - interior-design
  - layout
  - clearance
  - collision-detection
---

# Interior Layout Planning (Quy Hoạch Bố Cục Nội Thất & Lối Đi)

## Chủ sở hữu (Owner)
- **Primary Agent**: `Furniture Planner` (`agent_furniture`)

## Mô tả & Mục tiêu
Tính toán vị trí tọa độ `(x_mm, y_mm, z_mm)` và góc xoay `rotation_deg` cho từng món đồ nội thất trong phòng, đảm bảo lối đi thông thủy tối thiểu `>= 600 mm`, không chắn vùng quét mở cửa (`door swing clearance`) và không chồng lấn bounding-box.

## Trigger (Khi nào kích hoạt)
- Người dùng yêu cầu bố trí nội thất tự động (Phương án A/B) hoặc yêu cầu thay đổi vị trí/kích thước đồ vật (VD: *"đổi sofa ngắn hơn 30cm"*).

## Prerequisites (Điều kiện tiên quyết)
- Phòng đã qua bước `room-dimension-validation` (`scale_verified = true`).

## Tool Allowlist
- `scene.read`
- `scene.validate`
- `scene.propose`
- `catalog.fit_check`

## Input / Output JSON Schema

### Input Schema
```json
{
  "type": "object",
  "required": ["project_id", "room_bounds_mm", "furniture_items"],
  "properties": {
    "project_id": { "type": "string" },
    "room_bounds_mm": { "type": "object" },
    "furniture_items": { "type": "array" },
    "min_walkway_mm": { "type": "number", "default": 600 }
  }
}
```

### Output Schema
```json
{
  "type": "object",
  "required": ["collision_free", "min_clearance_mm", "layout_score", "placements", "warnings"],
  "properties": {
    "collision_free": { "type": "boolean" },
    "min_clearance_mm": { "type": "number" },
    "layout_score": { "type": "number" },
    "placements": { "type": "array" },
    "warnings": { "type": "array", "items": { "type": "string" } }
  }
}
```

## Quy tắc Fail / Ask-User
- Không bao giờ tự ý ghi đè Scene chính khi đề xuất bố cục mới; bắt buộc tạo `SceneProposal` kèm thông số trước/sau để người dùng duyệt.
- Nếu món đồ người dùng chọn lớn hơn lối cửa đi hoặc gây hẹp lối đi `< 600 mm`, cảnh báo rõ số `mm` bị thiếu và gợi ý SKU nhỏ gọn hơn.

## Ví dụ (Example)
- Thay Sofa `2100×880 mm` bằng Sofa Minimalist `1800×820 mm` giúp tăng khoảng thông thủy hành lang thêm `+300 mm`.

## Test Cases
1. **TC-ILP-01**: Kiểm tra 2 vật thể chồng lấn tọa độ → `collision_free = false`, chỉ rõ cặp ID va chạm.
2. **TC-ILP-02**: Thay đổi sofa ngắn hơn 30cm → Tạo proposal chính xác với kích thước `1800 mm`.
