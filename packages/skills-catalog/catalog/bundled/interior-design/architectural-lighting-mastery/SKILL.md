---
name: architectural-lighting-mastery
description: Thiết kế chiếu sáng kiến trúc chuyên sâu 3 lớp (Ambient, Task, Accent), kịch bản chiếu sáng thông minh, đèn ray nam châm, hắt khe trần cove led, CRI > 95.
key: paperclipai/bundled/interior-design/architectural-lighting-mastery
defaultInstall: true
recommendedForRoles:
  - designer
  - lighting-specialist
tags:
  - interior-design
  - lighting
  - architectural-lighting
  - ambient-light
  - cri-95
---

# Architectural Lighting Mastery (Chiếu Sáng Kiến Trúc 3 Lớp & Kịch Bản Ánh Sáng)

## Chủ sở hữu (Owner)
- **Primary Agent**: `Lighting & Visualization Specialist` (`agent_ceiling_lighting`)

## Mô tả & Mục tiêu
Kiến tạo không gian ánh sáng đạt chuẩn mỹ học kiến trúc hiện đại, loại bỏ ánh sáng đơn điệu, xây dựng kịch bản chiều sâu thị giác:
1. **Mô Hình Chiếu Sáng 3 Lớp (Three Layers of Light)**:
   - **Lớp 1: Ambient Lighting (Chiếu sáng môi trường/nền)**: Ánh sáng gián tiếp nhẹ dịu, hắt khe trần thạch cao (Cove Lighting), tán xạ đều, không gây chói mắt (UGR < 19).
   - **Lớp 2: Task Lighting (Chiếu sáng công năng)**: Ánh sáng tập trung cho khu vực làm việc, đọc sách, đảo bếp, bàn ăn (đèn thả bàn ăn, đèn led thanh nhôm định hình dưới đáy tủ bếp).
   - **Lớp 3: Accent Lighting (Chiếu sáng điểm nhấn nghệ thuật)**: Đèn rọi góc chiếu hẹp (Beam angle 15°-24°) tôn vinh tranh treo tường, mảng tường đá điểm nhấn, tượng decor hoặc hốc tủ trưng bày.
2. **Quy Chuẩn Kỹ Thuật Chiếu Sáng Nghệ Thuật**:
   - Chỉ số hoàn màu cao: CRI (Ra) > 95, tái hiện màu sắc vật liệu trung thực và sống động.
   - Nhiệt độ màu CCT phân vùng:
     + 2700K - 3000K (Vàng ấm): Dành cho phòng ngủ, khu vực thư giãn, bàn ăn ấm cúng.
     + 3500K - 4000K (Trung tính tự nhiên): Dành cho phòng khách ban ngày, phòng làm việc, khu bếp chế biến.
   - Hệ đèn ray nam châm siêu mỏng (Magnetic Track Light): Linh hoạt bố trí đèn rọi, đèn tán quang và đèn thả trên cùng một thanh ray.

## Trigger (Khi nào kích hoạt)
- Thiết kế hệ trần thạch cao, bố trí đèn chiếu sáng phòng khách, bếp hoặc phòng ngủ.
- Yêu cầu kịch bản chiếu sáng ban đêm (Night mode / Relax mode / Dining mode).

## Tool Allowlist
- `lighting.calculate_lux_levels`
- `lighting.design_layer_layout`
- `scene.add_photometric_lights`

## Input / Output JSON Schema

### Input Schema
```json
{
  "type": "object",
  "required": ["project_id", "room_zone"],
  "properties": {
    "project_id": { "type": "string" },
    "room_zone": { "type": "string" },
    "target_lux": { "type": "number", "default": 250 },
    "color_temperature_kelvin": { "type": "number", "enum": [2700, 3000, 3500, 4000] },
    "lighting_scenes": {
      "type": "array",
      "items": { "type": "string", "enum": ["welcome", "dinner", "cinema", "night_relax"] }
    }
  }
}
```

### Output Schema
```json
{
  "type": "object",
  "required": ["fixture_schedule", "layers", "scene_presets"],
  "properties": {
    "fixture_schedule": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "fixture_type": { "type": "string" },
          "beam_angle_deg": { "type": "number" },
          "cri": { "type": "number" },
          "wattage": { "type": "number" },
          "position_mm": { "type": "array", "items": { "type": "number" } }
        }
      }
    },
    "layers": {
      "type": "object",
      "properties": {
        "ambient_lumens": { "type": "number" },
        "task_lumens": { "type": "number" },
        "accent_lumens": { "type": "number" }
      }
    },
    "scene_presets": { "type": "array", "items": { "type": "object" } }
  }
}
```
