---
name: design-inventory-bom
description: Tự động trích xuất bảng danh mục bóc tách vật tư - thiết bị hoàn chỉnh (Bill of Materials / Design Inventory) từ mô hình Pascal SceneGraph và CanonicalProject, đồng bộ 2 chiều khi chỉnh sửa thiết kế.
key: paperclipai/bundled/interior-design/design-inventory-bom
defaultInstall: true
recommendedForRoles:
  - finance
  - engineer
  - architect
tags:
  - interior-design
  - inventory
  - bom
  - bill-of-materials
  - scene-sync
---

# Design Inventory & BOM Skill (Quản Lý Bóc Tách & Danh Mục Vật Tư)

## Chủ sở hữu (Owner)
- **Primary Agent**: `Design Inventory & BOM Manager` (`agent_inventory`)
- **Reviewer**: `Cost Estimator` (`agent_cost`) & `Chief Architect` (`agent_chief_architect`)

## Nguyên tắc đồng bộ với Pascal SceneGraph
1. **Trích xuất toàn diện**:
   - Tất cả đồ nội thất (sofa, bàn, ghế, tủ, giường, rèm, thảm, cây xanh, đèn).
   - Tất cả diện tích sàn (m² gỗ, m² gạch, len chân tường).
   - Tất cả diện tích sơn tường (m² sơn lót, m² sơn màu, m² tường điểm nhấn).
   - Tất cả diện tích trần (m² thạch cao, mét dài khe hắt, số lượng đèn âm trần).
2. **Cập nhật tức thời (Live Sync)**:
   - Khi người dùng hoặc Agent thêm/xóa/đổi bất kỳ đối tượng nào trong không gian 3D, danh mục BOM tự động cập nhật số lượng và thành tiền.
   - Trạng thái phê duyệt (`approved`, `pending`, `rejected`) gắn liền với từng dòng hạng mục.
3. **Không làm gián đoạn khi thiếu giá**:
   - Nếu hạng mục chưa có giá, đơn giá hiển thị là `null` hoặc 0 với nhãn *"Chưa có giá"*, bảng danh mục vẫn xuất xưởng hoàn chỉnh.
