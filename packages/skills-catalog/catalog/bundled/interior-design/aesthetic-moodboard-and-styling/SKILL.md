---
name: aesthetic-moodboard-and-styling
description: Định hình concept thẩm mỹ, xây dựng bảng màu kiến trúc chuẩn tỷ lệ vàng 60-30-10, moodboard phong cách sống và nghệ thuật bài trí decor.
key: paperclipai/bundled/interior-design/aesthetic-moodboard-and-styling
defaultInstall: true
recommendedForRoles:
  - designer
  - architect
tags:
  - interior-design
  - aesthetics
  - moodboard
  - styling
  - color-harmony
---

# Aesthetic Styling & Moodboard (Phối Màu 60-30-10 & Moodboard Phong Cách Sống)

## Chủ sở hữu (Owner)
- **Primary Agent**: `Style & Material Consultant` (`agent_style`)
- **Supporting Agent**: `Chief Architect` (`agent_concierge`)

## Mô tả & Mục tiêu
Chuyên sâu về tư vấn thẩm mỹ, định hình phong cách sống (Lifestyle Concept) và nghệ thuật phối màu kiến trúc:
1. **Quy tắc tỷ lệ vàng 60-30-10**:
   - 60% Màu chủ đạo (Dominant): Màu sơn tường nền, trần nhà hoặc sàn diện tích lớn (thường là tông trung tính sáng, be, trắng ấm, xám nhạt).
   - 30% Màu thứ cấp (Secondary): Màu đồ nội thất chính (sofa, tủ lớn, thảm sàn, rèm cửa) tạo chiều sâu và đối trọng không gian.
   - 10% Màu điểm nhấn (Accent): Màu gối tựa, tranh nghệ thuật, lọ hoa, đèn trang trí, chi tiết kim loại tạo sự nổi bật và cá tính.
2. **Moodboard Định Hướng Phong Cách**:
   - Tổng hợp mẫu cảm hứng thẩm mỹ theo phong cách yêu cầu: Japandi, Wabi-Sabi, Modern Luxury, Indochine, Scandinavian, Bauhaus.
   - Gợi ý phong cách nghệ thuật trang trí: tranh trừu tượng khổ lớn, tượng điêu khắc tối giản, bình gốm thủ công thô mộc.

## Trigger (Khi nào kích hoạt)
- Khách hàng yêu cầu tư vấn phong cách, chọn bảng màu, hoặc đưa ra nhận xét thẩm mỹ định tính ("muốn phòng trông ấm cúng hơn", "thích sang trọng nhưng không rườm rà").
- Khởi tạo giai đoạn Concept Design Brief trước khi dựng 3D chi tiết.

## Tool Allowlist
- `style.palette_suggest`
- `style.moodboard_generate`
- `scene.apply_color_scheme`
- `catalog.search_decor_items`

## Input / Output JSON Schema

### Input Schema
```json
{
  "type": "object",
  "required": ["project_id", "style_preference"],
  "properties": {
    "project_id": { "type": "string" },
    "style_preference": { "type": "string" },
    "mood_tone": { "type": "string", "enum": ["warm_natural", "cool_minimal", "earthy_wabisabi", "dark_luxury", "airy_scandi"] },
    "budget_segment": { "type": "string", "enum": ["standard", "premium", "luxury"] }
  }
}
```

### Output Schema
```json
{
  "type": "object",
  "required": ["color_formula_60_30_10", "moodboard_elements", "decor_recommendations"],
  "properties": {
    "color_formula_60_30_10": {
      "type": "object",
      "properties": {
        "dominant_60": { "type": "string" },
        "secondary_30": { "type": "string" },
        "accent_10": { "type": "string" }
      }
    },
    "moodboard_elements": {
      "type": "array",
      "items": { "type": "string" }
    },
    "decor_recommendations": {
      "type": "array",
      "items": { "type": "object" }
    }
  }
}
```
