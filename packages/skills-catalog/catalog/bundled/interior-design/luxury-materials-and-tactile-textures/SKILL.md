---
name: luxury-materials-and-tactile-textures
description: Tuyển chọn bề mặt xúc giác và vật liệu cao cấp (đá marble, gỗ óc chó tự nhiên, kính gân fluted, kim loại PVD, vải bouclé/linen) kết hợp map PBR chân thực.
key: paperclipai/bundled/interior-design/luxury-materials-and-tactile-textures
defaultInstall: true
recommendedForRoles:
  - designer
  - material-specialist
tags:
  - interior-design
  - materials
  - luxury
  - pbr-textures
  - tactile
---

# Luxury Materials & Tactile Textures (Vật Liệu Cao Cấp & Bề Mặt Xúc Giác)

## Chủ sở hữu (Owner)
- **Primary Agent**: `Style & Material Consultant` (`agent_style`)

## Mô tả & Mục tiêu
Chuyên sâu về lựa chọn, kết hợp tương phản chất liệu và thiết lập thuộc tính vật lý quang học (Physically Based Rendering - PBR) cho không gian sống cao cấp:
1. **Tuyển Chọn Vật Liệu Thượng Hạng**:
   - **Đá tự nhiên & Thạch anh nhân tạo**: Đá Marble Calacatta vân mây vàng, Nero Marquina vân tia chớp, đá thạch anh Vicostone chống ố chịu nhiệt cao.
   - **Gỗ tự nhiên & Veneer thượng hạng**: Gỗ óc chó Bắc Mỹ (American Walnut) với vân xoáy nu gỗ, gỗ sồi trắng Nga (White Oak) mộc mạc.
   - **Kim loại mạ PVD**: Đồng thau chải xước (Brushed Brass), titan đen mờ (Matte Black), champagne gold chống bám vân tay.
   - **Kính nghệ thuật**: Kính sọc Moru (Fluted Glass), kính gân sóng, kính xám khói, kính trà ấm cúng.
   - **Vải bọc & Da thủ công**: Vải dệt lông xù Bouclé ấm áp, vải đũi dệt thô Linen tự nhiên, da bò Ý Semi-Aniline mềm mại.
2. **Bộ Tham Số PBR Chuẩn Xác Cho Render**:
   - Cung cấp map và thông số: Albedo/BaseColor, Roughness (độ nhám), Metallic (độ kim loại), Normal (chi tiết bề mặt nổi khối) và IOR (chiết suất khúc xạ).

## Trigger (Khi nào kích hoạt)
- Dự án yêu cầu chất lượng hoàn thiện phân khúc cao cấp (Premium / High-End / Luxury).
- Cần thay đổi chất liệu mặt bàn, vách ốp tường tivi, cánh kính tủ áo hoặc chất liệu bọc sofa.

## Tool Allowlist
- `materials.get_luxury_catalog`
- `scene.apply_pbr_material`
- `materials.calculate_material_harmony`

## Input / Output JSON Schema

### Input Schema
```json
{
  "type": "object",
  "required": ["project_id", "surface_target"],
  "properties": {
    "project_id": { "type": "string" },
    "surface_target": { "type": "string", "enum": ["kitchen_countertop", "tv_wall_panel", "wardrobe_doors", "sofa_upholstery", "floor_tiles"] },
    "material_category": { "type": "string", "enum": ["stone", "hardwood", "metal_accent", "fluted_glass", "textile"] },
    "finish_type": { "type": "string", "enum": ["matte", "honed", "brushed", "high_gloss", "textured"] }
  }
}
```

### Output Schema
```json
{
  "type": "object",
  "required": ["material_spec", "pbr_parameters", "maintenance_guide"],
  "properties": {
    "material_spec": {
      "type": "object",
      "properties": {
        "sku": { "type": "string" },
        "name": { "type": "string" },
        "origin": { "type": "string" },
        "thickness_mm": { "type": "number" }
      }
    },
    "pbr_parameters": {
      "type": "object",
      "properties": {
        "roughness": { "type": "number" },
        "metallic": { "type": "number" },
        "ior": { "type": "number" }
      }
    },
    "maintenance_guide": { "type": "string" }
  }
}
```
