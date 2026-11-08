---
name: room-dimension-validation
description: Kiểm tra tính hợp lệ hình học của phòng (tường khép kín, độ cao trần, vị trí cửa, đơn vị mm) và đặt câu hỏi xác nhận ngắn gọn khi thiếu dữ liệu trọng yếu.
key: paperclipai/bundled/interior-design/room-dimension-validation
defaultInstall: true
recommendedForRoles:
  - architect
  - engineer
tags:
  - interior-design
  - validation
  - geometry
  - scale-gate
---

# Room Dimension Validation (Xác Thực Kích Thước & Hình Học Phòng)

## Chủ sở hữu (Owner)
- **Primary Agent**: `Geometry & BIM Specialist` (`agent_geometry`)
- **Coordinator**: `Chief Architect` (`agent_concierge`)

## Mô tả & Mục tiêu
Đảm bảo mọi thông số hình học của căn phòng đều thống nhất theo đơn vị chuẩn `mm`, đa giác tường khép kín, cửa đi/cửa sổ nằm trọn trên đoạn tường chủ và mở khóa cổng `Scale Gate` trước khi tạo Scene 3D hoặc tính dự toán.

## Trigger (Khi nào kích hoạt)
- Ngay sau khi `floorplan-understanding` trả kết quả hoặc khi người dùng nhập kích thước phòng trong hội thoại.
- Khi người dùng trả lời câu hỏi xác nhận tỷ lệ (`confirm-scale`).

## Prerequisites (Điều kiện tiên quyết)
- Có dữ liệu sơ bộ về tường/phòng hoặc câu trả lời xác nhận kích thước từ người dùng.

## Tool Allowlist
- `scene.validate`
- `scene.read`
- `ask_user`

## Input / Output JSON Schema

### Input Schema
```json
{
  "type": "object",
  "required": ["project_id", "width_mm", "depth_mm"],
  "properties": {
    "project_id": { "type": "string" },
    "width_mm": { "type": "number", "minimum": 1200 },
    "depth_mm": { "type": "number", "minimum": 1200 },
    "ceiling_height_mm": { "type": "number", "minimum": 2100, "maximum": 6000 },
    "user_confirmed": { "type": "boolean" }
  }
}
```

### Output Schema
```json
{
  "type": "object",
  "required": ["valid", "scale_verified", "floor_area_m2", "issues"],
  "properties": {
    "valid": { "type": "boolean" },
    "scale_verified": { "type": "boolean" },
    "floor_area_m2": { "type": "number" },
    "net_wall_area_m2": { "type": "number" },
    "issues": { "type": "array", "items": { "type": "string" } }
  }
}
```

## Quy tắc Fail / Ask-User
- Nếu thiếu chiều cao trần (`ceiling_height_mm`), hỏi ngắn gọn với lựa chọn gợi ý (`2700 mm`, `2800 mm`, `3000 mm`) hoặc ghi nhận vào `Assumptions` nếu người dùng chọn mặc định chung cư.
- Nếu kích thước cửa lớn hơn chiều dài tường chứa cửa: báo lỗi hình học và yêu cầu kiểm tra lại.

## Ví dụ (Example)
- **Input**: Phòng `4000×5000 mm`, cao `2800 mm`, cửa đi `900×2100 mm`, cửa sổ `1400×1200 mm`.
- **Output**: `valid: true`, `floor_area_m2: 20.0`, `net_wall_area_m2: 46.83`.

## Test Cases
1. **TC-RDV-01**: Xác nhận kích thước phòng `4000×5000 mm` → Mở khóa `scale_verified = true`, lưu vào `ConfirmedFacts`.
2. **TC-RDV-02**: Nhập kích thước âm hoặc `< 1000 mm` → Từ chối (`valid = false`) và trả về thông báo lỗi rõ ràng.
