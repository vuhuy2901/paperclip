---
name: bespoke-millwork-and-joinery
description: Thiết kế đồ mộc may đo liền tường tinh xảo, hệ tủ kịch trần, vách ốp composite lam sóng, giải pháp giấu ray và phụ kiện thông minh Hafele/Blum.
key: paperclipai/bundled/interior-design/bespoke-millwork-and-joinery
defaultInstall: true
recommendedForRoles:
  - designer
  - bim-specialist
  - wood-engineer
tags:
  - interior-design
  - millwork
  - joinery
  - custom-cabinets
  - an-cuong
---

# Bespoke Millwork & Joinery (Thiết Kế Đồ Mộc May Đo Liền Tường)

## Chủ sở hữu (Owner)
- **Primary Agent**: `Geometry & BIM Specialist` (`agent_geometry`)
- **Supporting Agent**: `Furniture Planner` (`agent_furniture`)

## Mô tả & Mục tiêu
Thiết kế chi tiết đồ mộc may đo theo kích thước thực tế của căn hộ, tận dụng tối đa chiều cao trần và triệt tiêu góc chết hình học:
1. **Quy Chuẩn Hệ Tủ Liền Tường Kịch Trần (Floor-to-Ceiling Cabinetry)**:
   - Hệ tủ áo kịch trần (chiều cao 2600mm - 2800mm): Tầng trên lưu trữ chăn màn vali ít dùng, tầng dưới phân chia ngăn treo đồ ngắn/dài, ngăn kéo phụ kiện có khóa vân tay.
   - Hệ tủ giày kết hợp đệm ngồi thay giày, gương soi toàn thân và hộc tủ để chìa khóa có đèn led cảm ứng âm tủ.
   - Vách tivi đa năng: Tủ tivi treo tường 1800x350x300mm bo góc mềm mại, vách ốp nan sóng gỗ kết hợp mảng đá nhân tạo giấu toàn bộ dây điện và ổ cắm.
2. **Chi Tiết Khớp Nối & Phụ Kiện Kim Khí Cao Cấp**:
   - Sử dụng phụ kiện bản lề giảm chấn, ray trượt âm mở toàn phần của Blum / Hafele.
   - Tay nắm vát cạnh 45 độ (J-pull / G-pull) hoặc hệ vát âm giấu tay nắm tạo bề mặt phẳng liền mạch tối giản.
   - Khớp nối nẹp chỉ chữ T, chữ U bằng nhôm anode mạ PVD chống oxy hóa.

## Trigger (Khi nào kích hoạt)
- Cần thiết kế hệ tủ quần áo, tủ giày, hệ tủ bếp trên/dưới hoặc vách ốp tivi may đo riêng cho căn hộ.
- Xuất bản vẽ chi tiết gia công mộc phục vụ xưởng sản xuất nội thất.

## Tool Allowlist
- `millwork.generate_cabinet_spec`
- `millwork.calculate_board_yield`
- `scene.add_parametric_joinery`

## Input / Output JSON Schema

### Input Schema
```json
{
  "type": "object",
  "required": ["project_id", "cabinet_type", "wall_boundary_mm"],
  "properties": {
    "project_id": { "type": "string" },
    "cabinet_type": { "type": "string", "enum": ["wardrobe", "kitchen_cabinet", "shoe_cabinet", "tv_console_wall", "bookshelf"] },
    "wall_boundary_mm": {
      "type": "object",
      "properties": {
        "width_mm": { "type": "number" },
        "height_mm": { "type": "number" },
        "depth_mm": { "type": "number" }
      }
    },
    "door_type": { "type": "string", "enum": ["hinged_fluted_glass", "sliding_wood", "handleless_touch_latch"] },
    "hardware_brand": { "type": "string", "enum": ["blum", "hafele", "dtc"] }
  }
}
```

### Output Schema
```json
{
  "type": "object",
  "required": ["joinery_components", "hardware_bom", "cut_list_summary"],
  "properties": {
    "joinery_components": {
      "type": "array",
      "items": { "type": "object" }
    },
    "hardware_bom": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "item": { "type": "string" },
          "quantity": { "type": "number" },
          "brand": { "type": "string" }
        }
      }
    },
    "cut_list_summary": { "type": "object" }
  }
}
```
