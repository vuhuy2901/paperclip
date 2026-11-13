---
name: atelier-ai-window-opening-recognition
description: Nhận diện cửa sổ, cửa đi, ô thoáng và ô mở tường từ bản vẽ mặt bằng CAD/PDF/ảnh, kể cả khi không có nhãn và kích thước trực tiếp; ước lượng kích thước có truy xuất nguồn và xác minh trước khi dựng 3D.
version: 1.0.0
language: vi
---

# ATELIER AI — SKILL NHẬN DIỆN CỬA SỔ VÀ Ô MỞ KHÔNG CÓ NHÃN

## 1. Mục tiêu

Khi người dùng nhập DWG, DXF, PDF, PNG, JPG hoặc ảnh quét bản vẽ kiến trúc, hệ thống phải:

1. Tìm tất cả **ô mở có khả năng là cửa sổ** mà không đòi ký hiệu `W`, `W1`, `CS`, chữ “cửa sổ” hay bảng thống kê cửa.
2. Phân biệt **cửa sổ**, **cửa đi**, **cửa kính đi lại**, **ô thoáng**, **khoảng hở chưa rõ loại** và **không phải ô mở**.
3. Xác định vị trí cửa theo **wall_id**, đoạn tường, phòng tiếp giáp, hướng, tọa độ 2D và độ rộng ô mở.
4. Suy ra kích thước từ chuỗi kích thước tổng thể/kích thước mốc hoặc tỷ lệ CAD nếu có; tuyệt đối phân biệt **đo trực tiếp**, **suy ra** và **mặc định giả định**.
5. Dựng ô mở đúng vào hình học tường trong 3D; không gắn mô hình cửa sổ giả lên bề mặt tường kín.
6. Trình bày các ô chưa chắc chắn để người dùng xác nhận/sửa, không tự đoán thành kết luận chắc chắn.

> Skill là quy tắc vận hành cho agent, **không thay thế** pipeline xử lý CAD, máy đo hình học, thị giác máy tính hoặc logic tạo mesh. Nếu công cụ kỹ thuật chưa có, phải báo thiếu khả năng thay vì tuyên bố đã nhận diện chính xác.

## 2. Thứ tự xử lý dữ liệu

**Ưu tiên DXF/DWG có vector > PDF vector > PDF raster/ảnh rõ nét > ảnh mờ/chụp xiên.**

- CAD vector: đọc đường LINE, LWPOLYLINE, ARC, BLOCK/INSERT, layer, kích thước DIMENSION, text, biến đổi tọa độ; tìm block cửa đi/cửa sổ, nhưng **không phụ thuộc tên block/layer**.
- PDF vector: trích path và text, giữ tỷ lệ và tọa độ trang.
- Raster: nắn thẳng/deskew nếu cần; tăng độ phân giải render PDF; tìm đường tường, cạnh song song và các nét ký hiệu. OCR kích thước chỉ để **hỗ trợ**, bắt buộc kiểm tra bằng hình học và ngữ cảnh.
- Khi thông tin giữa các nguồn mâu thuẫn, dùng dữ liệu gốc giàu cấu trúc hơn; ghi rõ xung đột.

## 3. Nhận diện đối tượng theo ngữ cảnh, không theo chữ

### 3.1. Tường và phòng

- Phát hiện cạnh tường đôi, tường dày, trục/tim tường và các vị trí ngắt tường.
- Xây dựng `wall graph`: các đoạn tường, giao điểm, phòng trong/ngoài và hệ tọa độ.
- Không nhầm cạnh đồ nội thất, thảm, giường, tủ, kích thước hoặc đường gióng với tường.
- Mỗi ứng viên ô mở phải có bằng chứng liên hệ với **một đoạn tường hợp lệ**; nếu chưa có liên hệ, đưa vào danh sách cần kiểm tra.

### 3.2. Cửa đi

Dấu hiệu gồm cung mở cánh, bản lề, nét biểu diễn cánh, cánh trượt, khoảng hở đi lại, hoặc khối ký hiệu phù hợp. **Không yêu cầu luôn có cung mở**, vì cửa trượt/cửa kính có thể không thể hiện cung.

### 3.3. Cửa sổ

Tìm sự kết hợp giữa:

- Khe mở nằm **trong bề dày tường**, hai đầu là tường đặc/khung biên;
- 1–3 đường mảnh song song hoặc ký hiệu khung kính nằm trong khe;
- Hình học phù hợp cửa sổ mở quay, lùa, cố định, lá sách, cửa sổ góc;
- Không có bằng chứng mạnh cho cửa đi, lối lưu thông hay giếng kỹ thuật;
- Ngữ cảnh phòng, tường ngoài, vị trí mặt đứng và ký hiệu tương tự trong cùng bản vẽ.

**Không loại bỏ cửa sổ chỉ vì thiếu nhãn, thiếu kích thước hay không có bảng thống kê cửa.**

### 3.4. Ô thoáng, cửa kính lớn và trường hợp nhập nhằng

- Cửa kính sát sàn/cửa đi ban công có thể giống cửa sổ lùa khi chỉ có mặt bằng; cần nhãn hoặc mặt đứng/mặt cắt để chốt loại.
- Ô mở WC có thể là cửa sổ nhỏ, ô thoáng hoặc lỗ thông gió; gắn nhãn `window_candidate` / `vent_candidate` nếu chưa đủ bằng chứng.
- Khoảng trắng giữa hai đoạn tường không tự động là cửa sổ.
- Nếu ký hiệu không rõ, `opening_unknown`, không bịa kiểu cửa.

## 4. Hiệu chuẩn tỷ lệ và đo kích thước

### 4.1. Nguồn kích thước

1. CAD: dùng đơn vị và tọa độ thật, kiểm tra `INSUNITS`, DIMSTYLE, tỷ lệ block và viewport.
2. PDF vector: ưu tiên DIMENSION/đường gióng có số đo, xác minh hệ số trang.
3. Ảnh raster: lấy ít nhất một mốc ngang/dọc có ghi kích thước và điểm đầu/cuối tương ứng, với công thức:

   `mm_per_px_x = known_width_mm / measured_span_px_x`

   `mm_per_px_y = known_height_mm / measured_span_px_y`

4. Dùng nhiều cặp kích thước để phát hiện ảnh bị kéo méo/chiếu phối cảnh. Nếu hai trục lệch đáng kể, đánh dấu `scale_unreliable` và yêu cầu nắn ảnh/hiệu chuẩn thêm.
5. Không suy ra tỷ lệ từ kích thước khung ảnh hoặc số lượng pixel đơn thuần khi không có kích thước mốc.

### 4.2. Quy tắc đo

- Chiều rộng cửa trên mặt bằng = khoảng cách hai mép kết thúc tường của **ô mở** dọc theo tim/biên tường, có hiệu chỉnh độ dày nét và sai số ảnh.
- Nếu kích thước đo gần trị số tiêu chuẩn (ví dụ khoảng 1.18 m), có thể **đề xuất** 1.20 m, nhưng lưu cả `estimated_width_mm` và `suggested_nominal_width_mm`, không thay thế bằng số tròn mà không giải thích.
- Không suy từ kích thước *phòng* sang chiều cao cửa hoặc cao độ bậu.
- `+4.200` trong phòng có thể là **cao độ sàn** theo hồ sơ, không phải chiều cao hoặc kích thước cửa.
- Nếu không có bất kỳ mốc kích thước/tỷ lệ đáng tin cậy: trả về độ rộng pixel/vector tương đối, `width_mm: null`, `requires_scale_input: true`.
- Không tự tạo số đo chính xác đến từng mm từ ảnh JPEG; ghi `approximate` và nêu dung sai phụ thuộc chất lượng ảnh.

### 4.3. Chiều cao và cao độ bậu cửa

- Chỉ đưa vào `measured_height_mm` / `measured_sill_height_mm` nếu có dữ liệu mặt đứng, mặt cắt, chú thích hoặc bảng thống kê đáng tin.
- Nếu thiếu, giữ `null`; có thể dùng `provisional_height_mm` và `provisional_sill_height_mm` từ cấu hình dự án **chỉ để preview 3D**. Mọi giá trị này phải mang `source: "project_default"`, hiển thị là *Giả định — cần xác nhận* và dễ chỉnh sửa.
- Không cấp nhãn *đã xác nhận* cho kích thước mặc định.

## 5. Quy trình bắt buộc cho agent

1. `INGEST`: kiểm tra định dạng, độ phân giải, dữ liệu vector/ảnh, khả năng truy cập.
2. `EXTRACT`: lấy nét tường, cửa, text và các chuỗi kích thước.
3. `CALIBRATE`: xác lập hệ tọa độ và tỷ lệ; nêu mốc và mức tin cậy.
4. `BUILD_WALL_GRAPH`: định danh tường/phòng và các giao cắt.
5. `GENERATE_CANDIDATES`: duyệt **mọi đoạn ngắt tường**, không chỉ những vị trí có nhãn; tìm ký hiệu kính và cửa.
6. `CLASSIFY`: đối chiếu dấu hiệu cửa sổ/cửa đi/ô thoáng; dùng nhãn ứng viên khi còn nhập nhằng.
7. `MEASURE`: đo chiều rộng; truy xuất phép tính và mức sai số; không tự điền chiều cao chưa biết.
8. `VALIDATE`: kiểm tra có bỏ sót cửa không; tránh double-count; đảm bảo mọi ô mở nằm trong tường và không đè lên cửa đi.
9. `REVIEW`: hiện overlay 2D đánh số từng ứng viên, loại, kích thước, nguồn, trạng thái *Đã xác nhận / Ước lượng / Cần kiểm tra*. Cho phép đổi loại, kéo mép, nhập kích thước và gắn lại tường.
10. `GENERATE_3D`: chỉ sau khi hình học đủ điều kiện; khoét ô tường theo vị trí và kích thước, lắp cửa sổ/khung/kính; không cắt tường sai hoặc tạo cửa sổ bay khỏi tường. Chỉ dùng cao độ dự phòng khi được phép và có đánh dấu.
11. `REPORT`: nêu số cửa sổ xác định, số ứng viên chưa chắc chắn, căn cứ tỷ lệ, các kích thước thiếu và việc cần người dùng xác nhận.

## 6. Hợp đồng kết quả tối thiểu

Trả dữ liệu có cấu trúc theo mẫu (đây là schema khái niệm, không phải kết quả cố định):

```json
{
  "drawing_id": "<id>",
  "scale": {
    "method": "cad_units | dimension_calibration | unknown",
    "anchors": [],
    "mm_per_px_x": null,
    "mm_per_px_y": null,
    "status": "verified | approximate | unreliable | unavailable"
  },
  "openings": [
    {
      "id": "OPENING-001",
      "type": "window | door | vent | opening_unknown",
      "classification_status": "confirmed | probable | needs_review",
      "wall_id": "WALL-001",
      "room_id": "ROOM-001",
      "orientation": "horizontal | vertical | angled",
      "bbox_2d": [0, 0, 0, 0],
      "estimated_width_mm": null,
      "suggested_nominal_width_mm": null,
      "width_source": "cad | dimension | calibrated_image | unknown",
      "measured_height_mm": null,
      "measured_sill_height_mm": null,
      "provisional_height_mm": null,
      "provisional_sill_height_mm": null,
      "height_source": "drawing | project_default | unknown",
      "evidence": [],
      "uncertainties": [],
      "needs_user_confirmation": true
    }
  ],
  "warnings": []
}
```

`confirmed` chỉ được dùng khi đã được xác nhận qua dữ liệu rõ ràng hoặc thao tác của người dùng. `probable` không được âm thầm chuyển sang `confirmed` khi tạo mô hình 3D.

## 7. Bài kiểm thử tham chiếu: ảnh REGA người dùng cung cấp

**Dấu hiệu đọc từ ảnh:** phòng ngủ ghi `P.NGỦ 2`, kích thước mặt bằng **5.600 mm theo phương ngang và 4.000 mm theo phương dọc**; phía dưới là `TẮM + WC`.

Các đối tượng cần được phát hiện:

| Vị trí | Đánh giá từ ảnh | Độ rộng gợi ý | Trạng thái |
|---|---|---:|---|
| Giữa tường phía trên của phòng ngủ | Cửa sổ 1, ký hiệu khung/kính giữa hai đoạn tường xám | ~1.200 mm | Probable, estimated |
| Giữa tường bên phải của phòng ngủ | Cửa sổ 2, ký hiệu khung/kính giữa hai đoạn tường xám | ~1.200 mm | Probable, estimated |
| Tường bên phải phòng TẮM + WC | Khe mở nhỏ có ký hiệu tương tự cửa sổ/ô thoáng | ~600 mm | Needs review: window or vent |

**Lưu ý:** Ảnh này phải được hiểu là **2 cửa sổ phòng ngủ khá rõ + 1 ô mở WC nghi là cửa sổ/ô thoáng**, chứ không tự tuyên bố chắc chắn toàn bản vẽ chỉ có 2 cửa sổ. Các trị số đều là xấp xỉ từ ảnh nén; chưa phải kích thước thi công.

**Bài test PASS khi:**
- Phát hiện đủ hai cửa sổ phòng ngủ ngay cả khi không có chữ `CỬA SỔ`.
- Không nhầm hai cửa mở có cung ở phía dưới thành cửa sổ.
- Có cảnh báo/ứng viên về ô nhỏ trên tường WC.
- Không hiểu `+4.200` là chiều cao cửa sổ.
- Không tự đặt chiều cao, cao độ bậu thành trị số “đo được”.
- Tỷ lệ phải dựa vào các đường kích thước 5.600 và 4.000; nếu không đo được điểm neo, không khẳng định độ rộng 1.200/600 là chính xác.

## 8. Checklist chấp nhận tính năng

- [ ] Nhận diện không cần nhãn chữ và không cần block tên chuẩn.
- [ ] Hỗ trợ nhiều ký hiệu cửa sổ khác nhau giữa các bộ bản vẽ.
- [ ] Không bỏ sót cửa sổ trong tường ngang, đứng và nghiêng.
- [ ] Phân biệt cửa có cung mở với cửa sổ; xử lý riêng cửa trượt, cửa kính.
- [ ] Suy ra kích thước theo tỷ lệ xác thực hoặc thông báo chưa thể đo.
- [ ] Có danh sách ứng viên và overlay 2D để người dùng xác nhận.
- [ ] Kết quả sửa tay lưu lại và đồng bộ 2D/3D.
- [ ] Cắt tường đúng theo ô mở, không tạo vật thể xuyên/đè lên tường.
- [ ] Không coi kích thước preview là thông số kỹ thuật đã xác nhận.
- [ ] Có test regression cho ảnh rõ, ảnh mờ, PDF vector và DXF.

## 9. Phân công triển khai nếu ATELIER AI chạy trong hệ thống đa-agent

- **Solution Architect:** xác định pipeline dữ liệu đầu vào, wall graph, schema opening, dịch vụ nhận diện và giao diện API.
- **UI/UX Designer:** thiết kế overlay ứng viên, danh sách xác nhận, nhãn nguồn đo và chỉnh sửa trực tiếp 2D/3D.
- **Implementation agent (frontend/backend/3D):** hiện thực thuật toán phân tích hình học, hiệu chuẩn tỷ lệ và khoét tường/lắp cửa; không giao code cho QA hoặc Reviewer.
- **Code Reviewer:** kiểm tra logic, ranh giới sai số, bảo toàn dữ liệu và tính đúng đắn của mesh 3D.
- **QA Tester:** chạy test trên ảnh REGA và bộ nhiều bản vẽ khác nhau; báo số phát hiện đúng, bỏ sót, nhầm loại và độ lệch kích thước.

**Luật chặn:** Không được tuyên bố `IMPLEMENTED`, `PASS` hay “đã tích hợp vào Paperclip” chỉ bằng cách thêm skill/prompt. Phải có bằng chứng source thay đổi, test chạy thành công, bản build thực tế và kết quả người dùng kiểm tra trên UI.
