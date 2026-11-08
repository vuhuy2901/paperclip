---
name: blender-mcp-rendering
description: Kết nối Blender qua MCP Gateway để dựng hình các khối nội thất cong/tùy biến phức tạp, tạo vật liệu PBR chất lượng cao, thiết lập camera và xuất file GLB nạp ngược vào không gian 3D Pascal.
key: paperclipai/bundled/interior-design/blender-mcp-rendering
defaultInstall: true
recommendedForRoles:
  - designer
  - engineer
  - architect
tags:
  - interior-design
  - blender
  - mcp
  - 3d-render
  - glb-export
  - photorealistic
---

# Blender MCP & High-End Rendering Skill

## Chủ sở hữu (Owner)
- **Primary Agent**: `Rendering Specialist` (`agent_render`)
- **Collaborator**: `Geometry & BIM Specialist` (`agent_geometry`)

## Nguyên tắc vận hành trên máy Local-Lite (RAM 8GB)
1. **Thực thi On-Demand (Theo yêu cầu)**:
   - Blender **không chạy thường trực**. Khi cần tạo mô hình phức tạp hoặc render ảnh chất lượng cao, hệ thống gọi lệnh headless (`blender --background --python ...`).
   - Sau khi hoàn thành và xuất file `.glb` hoặc render `.png`, tiến trình Blender được đóng ngay để giải phóng RAM và VRAM.
2. **Bảo mật và Kiểm soát thực thi**:
   - Chỉ cho phép các script nằm trong thư mục được cấp quyền của workspace.
   - Giới hạn mẫu render (32-64 samples + OptiX Denoiser) để thời gian render không vượt quá 15-30 giây trên card đồ họa phổ thông.
3. **Bổ trợ, không thay thế Pascal**:
   - Pascal SceneGraph vẫn là trung tâm hiển thị và chỉnh sửa trực tiếp. Blender chỉ đóng vai trò tạo asset tùy chỉnh và render phối cảnh studio.
