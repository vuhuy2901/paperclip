---
name: quantity-takeoff
description: Bóc tách khối lượng chính xác (diện tích sàn m2, diện tích tường trừ lỗ mở cửa m2, chu vi phào chân tường md) trực tiếp từ hình học 3D đơn vị mm.
key: paperclipai/bundled/interior-design/quantity-takeoff
defaultInstall: true
recommendedForRoles:
  - engineer
  - finance
  - architect
tags:
  - interior-design
  - quantity-takeoff
  - boq
  - bim
---

# Quantity Takeoff (Bóc Tách Khối Lượng Hình Học Xác Định)

## Chủ sở hữu (Owner)
- **Primary Agent**: `Cost Estimator` (`agent_cost`) & `Geometry & BIM Specialist` (`agent_geometry`)

## Mô tả & Mục tiêu
Tính toán tự động và xác định (deterministic) diện tích sàn (`floor_area_m2`), diện tích tường thô, diện tích trừ cửa đi/cửa sổ (`openings_area_m2`), diện tích ốp gạch tường và diện tích sơn thực tế cho từng mặt tường từ tọa độ `mm`.

## Trigger (Khi nào kích hoạt)
- Mỗi khi hình học phòng, cửa hoặc vùng ốp gạch tường thay đổi, hoặc trước khi chạy `vietnam-cost-estimation`.

## Prerequisites (Điều kiện tiên quyết)
- Dự án đã xác nhận tỷ lệ chuẩn (`scale_confidence == "HIGH_VERIFIED_SCALE"`).

## Tool Allowlist
- `scene.read`
- `cost.quantity_takeoff`

## Input / Output JSON Schema

### Input Schema
```json
{
  "type": "object",
  "required": ["project_id", "revision"],
  "properties": {
    "project_id": { "type": "string" },
    "revision": { "type": "integer" }
  }
}
```

### Output Schema
```json
{
  "type": "object",
  "required": ["floor_area_m2", "gross_wall_area_m2", "openings_area_m2", "net_paint_area_m2", "wall_tile_area_m2"],
  "properties": {
    "floor_area_m2": { "type": "number" },
    "gross_wall_area_m2": { "type": "number" },
    "openings_area_m2": { "type": "number" },
    "net_paint_area_m2": { "type": "number" },
    "wall_tile_area_m2": { "type": "number" },
    "perimeter_m": { "type": "number" }
  }
}
```

## Quy tắc Fail / Ask-User
- Không bao giờ dùng LLM ước lượng diện tích bằng lời; bắt buộc chạy công thức hình học từ chiều dài và chiều cao tường (`mm / 1000`).

## Ví dụ (Example)
- Phòng `4000×5000 mm`, cao `2800 mm`, cửa đi `0.9×2.1 m` (`1.89 m²`), cửa sổ `1.4×1.2 m` (`1.68 m²`) → Diện tích sàn `20.0 m²`, tổng tường trừ cửa `46.83 m²`.

## Test Cases
1. **TC-QTO-01**: Kiểm tra bóc tách phòng `4×5m` → Trừ chính xác diện tích cửa đi và cửa sổ khỏi diện tích sơn tường.
