---
name: cad-dxf-ifc-export
description: Xuất hồ sơ kỹ thuật CAD (DXF R2007 chuẩn AutoCAD với layer A-WALL/A-DOOR/A-FURN/A-DIM, mô hình 3D GLB, BIM IFC4 và COLLADA .dae) theo đúng đơn vị mm.
key: paperclipai/bundled/interior-design/cad-dxf-ifc-export
defaultInstall: true
recommendedForRoles:
  - engineer
  - architect
tags:
  - interior-design
  - cad
  - dxf
  - glb
  - ifc
---

# CAD / DXF / GLB / IFC Export (Xuất Hồ Sơ Kỹ Thuật & Kiểm Định Đơn Vị mm)

## Chủ sở hữu (Owner)
- **Primary Agent**: `Geometry & BIM Specialist` (`agent_geometry`)

## Mô tả & Mục tiêu
Xuất mô hình thiết kế từ Canonical SceneGraph ra các định dạng kỹ thuật thực sự mở được trong phần mềm chuyên ngành:
- **AutoCAD `.dxf` (R2007)**: Có header `$INSUNITS = 4` (Millimeters), phân tách rõ các layer `A-WALL`, `A-DOOR`, `A-WIN`, `A-FURN`, `A-TEXT`, `A-DIM`.
- **3D `.glb` (glTF 2.0 binary)**: Chứa đầy đủ mesh sàn, tường, cửa và đồ nội thất.
- **BIM `.ifc` (IFC4)** và **SketchUp `.dae` (COLLADA)**.

## Trigger (Khi nào kích hoạt)
- Người dùng nhấn nút xuất file `DXF`, `GLB`, `IFC`, `DAE` hoặc yêu cầu xuất bản vẽ kỹ thuật trong hội thoại.

## Prerequisites (Điều kiện tiên quyết)
- Dự án có hình học hợp lệ và tỷ lệ chuẩn `mm`.

## Tool Allowlist
- `cad.export_dxf`
- `cad.export_glb`
- `cad.export_ifc`
- `cad.export_dae`

## Input / Output JSON Schema

### Input Schema
```json
{
  "type": "object",
  "required": ["project_id", "format"],
  "properties": {
    "project_id": { "type": "string" },
    "format": { "type": "string", "enum": ["dxf", "glb", "ifc", "dae"] }
  }
}
```

### Output Schema
```json
{
  "type": "object",
  "required": ["ok", "file_path", "unit", "revision"],
  "properties": {
    "ok": { "type": "boolean" },
    "file_path": { "type": "string" },
    "unit": { "type": "string", "enum": ["mm", "m"] },
    "revision": { "type": "integer" },
    "verified_dimensions_mm": { "type": "object" }
  }
}
```

## Quy tắc Fail / Ask-User
- Không bao giờ đổi đuôi file giả mạo `.dwg` hoặc `.skp` khi chưa có binary converter tương ứng; chỉ xuất đúng định dạng `.dxf`, `.glb`, `.ifc`, `.dae` thật và kiểm tra đọc ngược lại (`round-trip QA`) khớp kích thước `mm`.

## Ví dụ (Example)
- Xuất `proj_demo_4x5m_rev16.dxf` và đọc kiểm tra lại được đúng kích thước bao `4000×5000 mm`.

## Test Cases
1. **TC-CAD-01**: Xuất file DXF và import ngược lại bằng `parse_dxf_floorplan` → Sai số kích thước `0 mm` (`4000×5000 mm`).
