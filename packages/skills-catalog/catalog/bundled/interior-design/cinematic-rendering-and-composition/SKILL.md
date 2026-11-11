---
name: cinematic-rendering-and-composition
description: Thiết lập phối cảnh góc nhìn điện ảnh và kết xuất quang học chân thực Blender Cycles (bố cục 1/3, tiêu cự 35-50mm, DoF f/4-f/5.6, HDRI Studio Loft).
key: paperclipai/bundled/interior-design/cinematic-rendering-and-composition
defaultInstall: true
recommendedForRoles:
  - designer
  - 3d-artist
  - render-engineer
tags:
  - interior-design
  - rendering
  - blender-cycles
  - cinematography
  - composition
---

# Cinematic Rendering & Composition (Bố Cục Điện Ảnh & Render Chân Thực Blender Cycles)

## Chủ sở hữu (Owner)
- **Primary Agent**: `Lighting & Visualization Specialist` (`agent_ceiling_lighting`)

## Mô tả & Mục tiêu
Biến bản vẽ không gian 3D thô thành tác phẩm phối cảnh sống động đạt chuẩn tạp chí kiến trúc (ArchDaily / Elle Decoration) thông qua bộ quy chuẩn nhiếp ảnh kiến trúc:
1. **Nguyên Tắc Bố Cục Nhiếp Ảnh Kiến Trúc (Architectural Photography Framing)**:
   - **Quy tắc 1/3 & Đường dẫn thị giác (Leading Lines)**: Căn chỉnh sofa hoặc bàn ăn vào giao điểm vàng, tận dụng đường viền sàn gỗ hoặc vách tường dẫn mắt người xem vào điểm nhấn chính.
   - **Góc chụp ngang tầm mắt người thực tế (Eye-Level Camera)**: Đặt cao độ camera Z = 1200mm - 1450mm (chiều cao mắt người ngồi hoặc đứng), khóa góc nghiêng Pitch/Roll = 0° (Two-Point Perspective) để giữ cho các đường thẳng tường đứng song song tuyệt đối không bị méo.
   - **Tiêu cự chuẩn ống kính**: 35mm (không gian vừa) đến 50mm (tiêu cự mắt người tự nhiên), hạn chế góc siêu rộng < 24mm gây méo mó tỷ lệ đồ nội thất.
2. **Thiết Lập Kết Xuất Quang Học Blender Cycles LTS 4.2.3**:
   - Công nghệ Path Tracing chân thực: 128 - 256 samples kết hợp bộ lọc nhiễu OpenImageDenoise (OIDN).
   - Bản đồ môi trường CC0 HDRI Studio Loft: Tái tạo ánh sáng bầu trời tự nhiên, phản xạ mềm mại trên bề mặt sàn gỗ và kính.
   - Độ sâu trường ảnh tinh tế (Depth of Field): Khẩu độ f/4.0 - f/5.6 tạo độ xóa phông nhẹ ở hậu cảnh, tăng chiều sâu điện ảnh.
   - Quản lý màu Filmic / AgX Color Management: Giữ chi tiết vùng sáng gắt ngoài cửa sổ và vùng tối mà không bị cháy sáng hay bết màu.

## Trigger (Khi nào kích hoạt)
- Tạo ảnh render xem trước (Preview Render 640x360) trong cuộc trò chuyện hoặc render chất lượng cao (Final HD 1920x1080) cho khách hàng duyệt phương án.

## Tool Allowlist
- `render.setup_cinematic_camera`
- `render.dispatch_cycles_job`
- `render.apply_agx_color_grading`

## Input / Output JSON Schema

### Input Schema
```json
{
  "type": "object",
  "required": ["project_id", "camera_preset"],
  "properties": {
    "project_id": { "type": "string" },
    "camera_preset": { "type": "string", "enum": ["eye_level_living", "corner_overview", "closeup_coffee_table", "kitchen_island_perspective"] },
    "focal_length_mm": { "type": "number", "default": 35 },
    "resolution": { "type": "string", "enum": ["preview_640x360", "hd_1280x720", "fullhd_1920x1080"] },
    "enable_depth_of_field": { "type": "boolean", "default": true }
  }
}
```

### Output Schema
```json
{
  "type": "object",
  "required": ["render_job_id", "image_url", "render_stats"],
  "properties": {
    "render_job_id": { "type": "string" },
    "image_url": { "type": "string" },
    "render_stats": {
      "type": "object",
      "properties": {
        "samples": { "type": "number" },
        "render_time_seconds": { "type": "number" },
        "engine": { "type": "string" }
      }
    }
  }
}
```
