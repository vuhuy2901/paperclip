---
name: house-plan-designer
description: Chuyển đổi ảnh mặt bằng kiến trúc (PNG/JPG/PDF/CAD) thành mô hình 2D cấu trúc FloorSpec JSON, tự động phân phòng và bố trí nội thất toàn nhà, sau đó chuyển thành mô hình 3D hoàn chỉnh trong Pascal SceneGraph.
key: paperclipai/bundled/interior-design/house-plan-designer
defaultInstall: true
recommendedForRoles:
  - engineer
  - architect
  - designer
tags:
  - interior-design
  - house-plan
  - bim
  - multi-room
  - auto-layout
  - pascal-3d
---

# House Plan Designer Skill (Tái Tạo Mặt Bằng 2D → Bố Trí Toàn Nhà → 3D Pascal)

## Chủ sở hữu (Owner)
- **Primary Agent**: `Floor Plan Specialist` (`agent_floorplan`) & `Geometry & BIM Specialist` (`agent_geometry`)
- **Coordinating Agent**: `Chief Architect` (`agent_chief_architect`)

## Mục tiêu quy trình (Pipeline Workflow)
Quy trình thực hiện theo 5 bước tuần tự chuẩn mực:
1. **Ảnh mặt bằng gốc**: Nhận file PNG, JPG, PDF hoặc CAD từ người dùng.
2. **Phân tích kích thước & Thước đo mm**: Nhận diện tường bao, tường ngăn, cửa đi, cửa sổ. Kiểm tra tỷ lệ; nếu chưa rõ, Agent kích hoạt câu hỏi (`ask_user`) yêu cầu xác nhận 1 cạnh chuẩn (mm).
3. **Mặt bằng 2D có cấu trúc (FloorSpec JSON)**: Trích xuất các phân vùng phòng (Phòng khách, Bếp & Bàn ăn, Phòng ngủ Master, Phòng vệ sinh, Ban công/Loggia) với tọa độ polygon mm và diện tích m².
4. **Tự động bố trí nội thất toàn nhà (Auto Furniture Layout)**: Dựa vào công năng từng phòng, tự động bố cục sofa, bàn trà, kệ TV, tủ bếp chữ L, bàn ăn, giường ngủ 1.8m, tủ áo kịch trần, rèm 2 lớp và cây xanh.
5. **Mô hình nhà 3D hoàn chỉnh trong Pascal**: Dựng hình khối tường dày 110-220mm, đục lỗ cửa, sàn gạch/gỗ riêng cho từng phòng, trần thạch cao giật cấp kèm hệ thống đèn âm trần downlight.

## Input / Output Schema
### Output FloorSpec JSON:
- `plan_id`: Mã bản vẽ
- `overall_width_mm`, `overall_depth_mm`: Kích thước tổng thể
- `total_usable_area_sqm`: Tổng diện tích sử dụng
- `rooms`: Danh sách các phòng kèm công năng, polygon, vật liệu sàn/tường/trần và thiết bị chiếu sáng
- `walls`, `doors`, `windows`: Hệ thống cấu kiện kỹ thuật
- `furniture_layout`: Danh mục đồ nội thất với SKU, kích thước và đơn giá thực tế

## Tiêu chí hoàn thành (Definition of Done)
- Sai số kích thước < 20mm sau khi hiệu chuẩn tỷ lệ.
- Lối đi thông thủy giữa các đồ nội thất đạt tối thiểu >= 750mm.
- Đồng bộ thành công vào Pascal SceneGraph (`POST /api/atelier/scene`).
