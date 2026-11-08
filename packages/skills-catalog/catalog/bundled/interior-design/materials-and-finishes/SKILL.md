---
name: materials-and-finishes
description: Tư vấn và phối bảng màu sơn tường (Dulux/Jotun), tường điểm nhấn (Accent Wall), gạch ốp lát và sàn gỗ (An Cường, Eurotile, Đồng Tâm) theo Mục 7B.
key: paperclipai/bundled/interior-design/materials-and-finishes
defaultInstall: true
recommendedForRoles:
  - designer
  - architect
tags:
  - interior-design
  - materials
  - paint
  - flooring
  - section-7b
---

# Materials & Finishes (Phối Vật Liệu Bề Mặt — Sơn Tường & Gạch Sàn 7B)

## Chủ sở hữu (Owner)
- **Primary Agent**: `Style & Material Consultant` (`agent_style`)

## Mô tả & Mục tiêu
Chọn và áp dụng vật liệu hoàn thiện bề mặt có mã SKU thật tại Việt Nam (sơn nội thất Dulux/Jotun, gỗ công nghiệp An Cường, gạch porcelain Eurotile/Đồng Tâm), hỗ trợ sơn tường nền, tường điểm nhấn (`Accent Wall`) và vùng ốp gạch tường theo chiều cao định sẵn.

## Trigger (Khi nào kích hoạt)
- Người dùng yêu cầu đổi màu sơn tường, đổi sàn gỗ/gạch hoặc chọn bảng màu theo phong cách (`Japandi`, `Modern`, `Indochine`, `Scandinavian`).

## Prerequisites (Điều kiện tiên quyết)
- Danh mục `materials_vn.json` khả dụng và có thông số độ phủ (`coverage_m2_per_liter`), quy cách thùng/hộp và hao hụt (`wastage_pct`).

## Tool Allowlist
- `materials.list`
- `scene.apply_surface_materials`
- `cost.recalculate`

## Input / Output JSON Schema

### Input Schema
```json
{
  "type": "object",
  "required": ["project_id"],
  "properties": {
    "project_id": { "type": "string" },
    "base_wall_paint_id": { "type": "string" },
    "accent_wall_paint_id": { "type": "string" },
    "floor_material_id": { "type": "string" }
  }
}
```

### Output Schema
```json
{
  "type": "object",
  "required": ["applied", "updated_materials", "invalidated_nodes"],
  "properties": {
    "applied": { "type": "boolean" },
    "updated_materials": { "type": "object" },
    "invalidated_nodes": { "type": "array", "items": { "type": "string" } }
  }
}
```

## Quy tắc Fail / Ask-User
- Chỉ sử dụng mã vật liệu có thực trong cơ sở dữ liệu `materials_vn.json`; không tự bịa mã màu hoặc đơn giá.
- Khi đổi vật liệu bề mặt, chỉ đánh dấu tính lại nhánh vật liệu và dự toán (`n6_style`, `n10_cost`), **không dựng lại hình học tường 3D (`n5_geometry`)**.

## Ví dụ (Example)
- Đổi sơn tường sang `Dulux Ambiance 5in1 — Trắng Ngà Japandi` và sàn sang `Sàn Gỗ Công Nghiệp An Cường 12mm — Sồi Tự Nhiên`.

## Test Cases
1. **TC-MAF-01**: Đổi màu sơn tường và sàn → Scene 3D cập nhật màu/vân tức thì và bảng dự toán BOQ tự động tính lại số thùng sơn/hộp sàn.
