---
name: biophilic-indoor-landscape
description: Tích hợp kiến trúc xanh nội thất, cây xanh phong thủy thanh lọc không khí trong nhà, vi khí hậu và tối ưu hóa đối lưu ánh sáng tự nhiên.
key: paperclipai/bundled/interior-design/biophilic-indoor-landscape
defaultInstall: true
recommendedForRoles:
  - designer
  - landscape-consultant
tags:
  - interior-design
  - biophilic
  - indoor-plants
  - air-purification
  - nature
---

# Biophilic Indoor Landscape (Kiến Trúc Xanh Nội Thất & Cảnh Quan Trong Nhà)

## Chủ sở hữu (Owner)
- **Primary Agent**: `Style & Material Consultant` (`agent_style`)
- **Supporting Agent**: `Furniture Planner` (`agent_furniture`)

## Mô tả & Mục tiêu
Đưa các yếu tố tự nhiên sống động vào không gian sống nhằm giảm căng thẳng, cải thiện chất lượng không khí trong nhà và nâng tầm thẩm mỹ sinh thái:
1. **Tuyển Chọn Cây Cảnh Nội Thất Chuẩn NASA Air-Cleaning**:
   - Cây bàng Singapore (Ficus Lyrata): Cây dáng cao thanh mảnh, lá to xanh bóng, tạo điểm nhấn góc phòng khách hoặc cạnh ban công.
   - Cây trầu bà Nam Mỹ (Monstera Deliciosa): Lá xẻ độc đáo, mang vẻ đẹp nhiệt đới hiện đại, sống tốt trong môi trường bán râm.
   - Cây lưỡi hổ (Sansevieria Trifasciata): Thải oxy vào ban đêm, lọc khí độc formaldehyde, cực kỳ lý tưởng cho phòng ngủ.
   - Cây cau tiểu trâm / cọ cảnh (Areca Palm): Giữ độ ẩm tự nhiên cho phòng điều hòa, lọc bụi mịn.
2. **Giải Pháp Kiến Trúc Cảnh Quan Nội Thất**:
   - Bồn cây âm sàn hoặc vách ngăn hở kết hợp cây xanh chia tách nhẹ phòng khách và bàn ăn.
   - Chậu gốm thủ công men mộc, chân đế gỗ sồi mộc mạc hài hòa phong cách Japandi / Wabi-Sabi.
   - Tối ưu hóa vi khí hậu: Bố trí cây đón ánh sáng gián tiếp gần cửa sổ ban công, không cản trở luồng gió tự nhiên.

## Trigger (Khi nào kích hoạt)
- Khách hàng yêu cầu đưa mảng xanh vào căn hộ, tạo cảm giác thư thái gần gũi thiên nhiên.
- Hoàn thiện gói trang trí decor phòng khách, ban công hoặc logia.

## Tool Allowlist
- `plants.recommend_species`
- `plants.check_light_compatibility`
- `scene.add_plant_asset`

## Input / Output JSON Schema

### Input Schema
```json
{
  "type": "object",
  "required": ["project_id", "zone"],
  "properties": {
    "project_id": { "type": "string" },
    "zone": { "type": "string" },
    "natural_light_level": { "type": "string", "enum": ["direct_sunlight", "bright_indirect", "low_light"] },
    "care_level": { "type": "string", "enum": ["low_maintenance", "medium", "enthusiast"] }
  }
}
```

### Output Schema
```json
{
  "type": "object",
  "required": ["plant_placements", "air_quality_benefits"],
  "properties": {
    "plant_placements": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "species_name": { "type": "string" },
          "pot_style": { "type": "string" },
          "height_mm": { "type": "number" },
          "location_coords": { "type": "array", "items": { "type": "number" } }
        }
      }
    },
    "air_quality_benefits": { "type": "array", "items": { "type": "string" } }
  }
}
```
