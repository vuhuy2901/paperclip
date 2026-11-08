---
name: vietnam-cost-estimation
description: Tính dự toán chi phí nội thất & hoàn thiện (BOQ) bằng thuật toán xác định theo đơn giá nguồn Việt Nam (VNĐ), tính hao hụt, quy đổi thùng sơn/hộp gạch nguyên, nhân công, vận chuyển và VAT 8%.
key: paperclipai/bundled/interior-design/vietnam-cost-estimation
defaultInstall: true
recommendedForRoles:
  - finance
  - product
  - architect
tags:
  - interior-design
  - cost-estimation
  - boq
  - vietnam-pricing
---

# Vietnam Cost Estimation (Dự Toán BOQ Xác Định Theo Đơn Giá Nguồn Việt Nam)

## Chủ sở hữu (Owner)
- **Primary Agent**: `Cost Estimator` (`agent_cost`)

## Mô tả & Mục tiêu
Tính toán bảng dự toán khối lượng và chi phí (BOQ) bằng code xác định (`apps/api/app/services/cost_engine.py`), tuyệt đối không để LLM tự đoán giá:
- Làm tròn lên (`ceil`) số thùng sơn (`5L` / `18L`) và số hộp gạch/sàn gỗ (`m²/hộp`) kèm tỷ lệ hao hụt (`wastage_pct`).
- Cộng chi phí sơn lót kháng kiềm, keo dán gạch/chà ron, phào chân tường, nhân công hoàn thiện, vận chuyển nội thành, dự phòng phí và thuế GTGT (VAT 8%).
- Ghi rõ nguồn giá và ngày cập nhật (`source`, `updated_at`).

## Trigger (Khi nào kích hoạt)
- Khi người dùng mở bảng **Dự toán**, đổi vật liệu Sơn/Gạch (Mục 7B), thêm/thay thế đồ nội thất hoặc xem trước chênh lệch giá trên thẻ Proposal.

## Prerequisites (Điều kiện tiên quyết)
- Có kết quả từ `quantity-takeoff` và dữ liệu giá trong `materials_vn.json`, `products_vn.json`.

## Tool Allowlist
- `cost.calculate_estimate`
- `cost.export_boq_csv`
- `cost.export_boq_xlsx`

## Input / Output JSON Schema

### Input Schema
```json
{
  "type": "object",
  "required": ["project_id"],
  "properties": {
    "project_id": { "type": "string" },
    "include_vat": { "type": "boolean", "default": true }
  }
}
```

### Output Schema
```json
{
  "type": "object",
  "required": ["grand_total_vnd", "surface_materials_subtotal_vnd", "furniture_subtotal_vnd", "labor_subtotal_vnd", "lines"],
  "properties": {
    "grand_total_vnd": { "type": "integer" },
    "surface_materials_subtotal_vnd": { "type": "integer" },
    "furniture_subtotal_vnd": { "type": "integer" },
    "labor_subtotal_vnd": { "type": "integer" },
    "vat_vnd": { "type": "integer" },
    "budget_variance_vnd": { "type": "integer" },
    "lines": { "type": "array" }
  }
}
```

## Quy tắc Fail / Ask-User
- Nếu dự án chưa xác nhận tỷ lệ chuẩn (`scale_confidence != "HIGH_VERIFIED_SCALE"`): khóa xuất báo giá chính thức và yêu cầu xác nhận kích thước trước.
- Không bao giờ tự phát minh đơn giá ngoài catalog đã kiểm chứng.

## Ví dụ (Example)
- Đổi Sofa `14.500.000 ₫` sang Sofa Minimalist `8.900.000 ₫` → Giảm đúng `-6.048.000 ₫` (đã gồm VAT 8%), tổng dự toán mới `61.041.654 ₫`.

## Test Cases
1. **TC-VCE-01**: Tính lại BOQ sau khi đổi vật liệu → Số thùng sơn và hộp gạch được làm tròn nguyên thùng (`ceil`) chính xác 100%.
