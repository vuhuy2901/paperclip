---
name: furniture-product-matching
description: Tìm kiếm và đối khớp đồ nội thất từ Catalog nhà cung cấp Việt Nam theo kích thước lọt lòng cửa/phòng, phân khúc ngân sách (Thấp/Trung/Cao) và nguồn xác minh.
key: paperclipai/bundled/interior-design/furniture-product-matching
defaultInstall: true
recommendedForRoles:
  - product
  - designer
  - researcher
tags:
  - interior-design
  - shopping
  - catalog
  - furniture
---

# Furniture Product Matching (Đối Khớp Sản Phẩm Nội Thất & Kiểm Tra Lọt Cửa)

## Chủ sở hữu (Owner)
- **Primary Agent**: `Shopping Researcher` (`agent_shopping`)

## Mô tả & Mục tiêu
Tra cứu danh mục nội thất thực tế tại Việt Nam (`products_vn.json`), kiểm tra điều kiện lọt cửa đi (`doorway fit-check`) và vừa vặn diện tích phòng trước khi đề xuất thay thế theo 3 mức ngân sách (Tiết kiệm / Tiêu chuẩn / Cao cấp).

## Trigger (Khi nào kích hoạt)
- Người dùng tìm đồ nội thất thay thế, yêu cầu giảm chi phí hoặc chọn sản phẩm từ trang **Danh mục mua sắm**.

## Prerequisites (Điều kiện tiên quyết)
- Có thông số kích thước cửa đi và kích thước phòng hiện tại.

## Tool Allowlist
- `catalog.search_products`
- `catalog.fit_check`
- `scene.propose`

## Input / Output JSON Schema

### Input Schema
```json
{
  "type": "object",
  "required": ["project_id", "category"],
  "properties": {
    "project_id": { "type": "string" },
    "category": { "type": "string" },
    "max_width_mm": { "type": "number" },
    "max_price_vnd": { "type": "integer" },
    "style_tag": { "type": "string" }
  }
}
```

### Output Schema
```json
{
  "type": "object",
  "required": ["matches", "fit_check_passed"],
  "properties": {
    "matches": { "type": "array" },
    "fit_check_passed": { "type": "boolean" },
    "doorway_clearance_note": { "type": "string" }
  }
}
```

## Quy tắc Fail / Ask-User
- Tuyệt đối không tạo URL giả hoặc giá tiền giả; mọi sản phẩm phải có `sku`, `supplier`, `price_vnd`, `dimensions_mm` từ cơ sở dữ liệu nguồn.

## Ví dụ (Example)
- Khớp mẫu `prod_sofa_minimal_180` (`1800×820×760 mm`, `8.900.000 ₫`) qua cửa đi `900×2100 mm` (`fit_check_passed: true`).

## Test Cases
1. **TC-FPM-01**: Kiểm tra sản phẩm có chiều sâu và chiều cao vượt quá kích thước lọt lòng cửa → Cảnh báo không qua lọt cửa nguyên khối.
