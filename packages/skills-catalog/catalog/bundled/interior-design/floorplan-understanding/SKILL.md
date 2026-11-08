---
name: floorplan-understanding
description: Phân tích bản vẽ mặt bằng 2D (PNG, JPG, PDF, DXF) để nhận diện tường, cửa đi, cửa sổ, đơn vị đo (mm), tỷ lệ bản vẽ và đánh giá mức độ tin cậy trước khi dựng hình 3D.
key: paperclipai/bundled/interior-design/floorplan-understanding
defaultInstall: true
recommendedForRoles:
  - engineer
  - architect
  - designer
tags:
  - interior-design
  - floorplan
  - cad
  - dxf
  - scale-detection
---

# Floor Plan Understanding (Đọc & Phân Tích Mặt Bằng 2D)

## Chủ sở hữu (Owner)
- **Primary Agent**: `Floor Plan Specialist` (`agent_floorplan`)
- **Reviewer**: `Chief Architect` (`agent_concierge`)

## Mô tả & Mục tiêu
Nhận diện cấu trúc hình học từ file mặt bằng 2D (DXF R2000+, PDF vector/raster, PNG/JPG) để trích xuất danh sách tường (`walls`), cửa đi (`doors`), cửa sổ (`windows`), kích thước bao (`width_mm`, `depth_mm`) và đánh giá độ tin cậy của tỷ lệ (`scale_confidence`).

## Trigger (Khi nào kích hoạt)
- Người dùng tải lên file mặt bằng mới (`.dxf`, `.pdf`, `.png`, `.jpg`) trong Conversation hoặc trang **Nhập mặt bằng 2D**.
- Task thuộc giai đoạn `n2_floorplan` được giao cho `Floor Plan Specialist`.

## Prerequisites (Điều kiện tiên quyết)
- Có đường dẫn file hợp lệ hoặc dữ liệu upload trong `data/uploads/`.
- Dự án đã khởi tạo ID (`project_id`).

## Tool Allowlist
- `floorplan.parse_dxf`
- `floorplan.parse_raster_pdf`
- `scene.read`
- `ask_user`

## Input / Output JSON Schema

### Input Schema
```json
{
  "type": "object",
  "required": ["project_id", "file_path", "file_type"],
  "properties": {
    "project_id": { "type": "string" },
    "file_path": { "type": "string" },
    "file_type": { "type": "string", "enum": ["dxf", "pdf", "png", "jpg"] },
    "reference_dimension_mm": { "type": "number", "minimum": 500 }
  }
}
```

### Output Schema
```json
{
  "type": "object",
  "required": ["width_mm", "depth_mm", "scale_confidence", "walls", "openings", "requires_scale_confirmation"],
  "properties": {
    "width_mm": { "type": "number" },
    "depth_mm": { "type": "number" },
    "ceiling_height_mm": { "type": "number" },
    "scale_confidence": { "type": "string", "enum": ["HIGH_VERIFIED_SCALE", "MEDIUM_INFERRED", "LOW_UNVERIFIED"] },
    "requires_scale_confirmation": { "type": "boolean" },
    "walls": { "type": "array" },
    "openings": { "type": "array" }
  }
}
```

## Quy tắc Fail / Ask-User (Fail-Closed Rules)
- Nếu ảnh PNG/JPG hoặc PDF không có đường kích thước rõ ràng (`scale_confidence != "HIGH_VERIFIED_SCALE"`): **BẮT BUỘC dừng dựng hình 3D**, đặt `requires_scale_confirmation = true` và gọi `ask_user` yêu cầu người dùng xác nhận ít nhất 1 kích thước thực tế (VD: chiều rộng phòng hoặc bề rộng cửa chính tính bằng `mm`).
- Tuyệt đối không tự bịa kích thước chính xác từ ảnh thiếu thước tỷ lệ.

## Ví dụ (Example)
- **Input**: File `can_ho_studio_4x5m.dxf` có layer `A-WALL`, `A-DOOR`, `A-WIN`, đơn vị `$INSUNITS = 4` (mm).
- **Output**: Trích xuất 4 đoạn tường bao `4000×5000 mm`, 1 cửa đi `900 mm`, 1 cửa sổ `1400 mm`, `scale_confidence: "HIGH_VERIFIED_SCALE"`.

## Test Cases
1. **TC-FP-01 (DXF chuẩn mm)**: Đọc DXF có `$INSUNITS=4` → Trả về đúng `4000×5000 mm` và `requires_scale_confirmation = false`.
2. **TC-FP-02 (Ảnh PNG thiếu thước đo)**: Upload ảnh PNG không kèm kích thước → Trả về `scale_confidence = "LOW_UNVERIFIED"` và phát sinh câu hỏi xác nhận tỷ lệ cho người dùng.
