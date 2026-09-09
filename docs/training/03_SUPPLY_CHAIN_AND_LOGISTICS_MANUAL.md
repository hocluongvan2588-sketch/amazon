# GIÁO TRÌNH ĐÀO TẠO NỘI BỘ VEXIM GLOBAL — MODULE 03
## CẨM NANG ĐÀO TẠO CHUYÊN SÂU KHO VẬN FBA & CHUỖI CUNG ỨNG QUỐC TẾ

**Mã tài liệu:** VXM-TRN-03-EXP  
**Đối tượng:** Chuyên viên Logistics, Quản lý Kho Vận & Chuỗi Cung Ứng Vexim  
**Trưởng bộ môn:** Ánh Nguyễn (`anhnguyen94@gmail.com` — Logistics & FBA Hub Lead)  
**Phiên bản:** 2.0 (Cập nhật chính sách FBA Inbound Placement 2026)

---

## PHẦN 1: BẢN ĐỒ 5 CHẶNG LEAD TIME TUYẾN XUẤT KHẨU VIỆT – MỸ (47 NGÀY)

Chuyên viên kho phải nắm vững thời gian thực tế của từng chặng để tính ngày đặt hàng sản xuất tại xưởng Việt Nam:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                 5 CHẶNG LEAD TIME TUYẾN VIỆT NAM ➔ AMAZON US                │
├───────────────────┬──────────────┬──────────────────────────────────────────┤
│ CHẶNG VẬN TẢI     │ THỜI GIAN    │ NHIỆM VỤ CỦA CHUYÊN VIÊN KHO             │
├───────────────────┼──────────────┼──────────────────────────────────────────┤
│ 1. Xưởng sản xuất │ 12 – 14 ngày │ Theo dõi tiến độ PO, in tem nhãn FNSKU.  │
├───────────────────┼──────────────┼──────────────────────────────────────────┤
│ 2. Vận tải biển   │ 20 – 24 ngày │ Theo dõi định vị tàu biển Trans-Pacific. │
├───────────────────┼──────────────┼──────────────────────────────────────────┤
│ 3. Hải quan Mỹ    │ 3 – 5 ngày   │ Nộp FDA Prior Notice & ISF 10+2 trước 5d.│
├───────────────────┼──────────────┼──────────────────────────────────────────┤
│ 4. Kéo xe Drayage │ 2 – 3 ngày   │ Điều xe container từ cảng LA về kho 3PL. │
├───────────────────┼──────────────┼──────────────────────────────────────────┤
│ 5. FBA Check-in   │ 4 – 7 ngày   │ Theo dõi Amazon FC quét nhận lên Buy Box.│
├───────────────────┼──────────────┼──────────────────────────────────────────┤
│ 🎯 TỔNG LEAD TIME │ 47 NGÀY      │ (+9 ngày dự phòng mùa cao điểm Q4)       │
└───────────────────┴──────────────┴──────────────────────────────────────────┘
```

### Công thức tính Điểm Đặt Hàng Lại (Reorder Point - ROP):
$$\text{Reorder Point (ROP)} = (\text{Total Lead Time (47 ngày)} \times \text{Daily Sales Velocity}) + \text{Safety Stock (14 ngày bán)}$$

*Ví dụ:* SKU Socola 70% Vinacacao bán **15 hộp / ngày**:
$$\text{ROP} = (47 \times 15) + (14 \times 15) = 705 + 210 = 915\text{ hộp}$$
$\rightarrow$ Khi tồn kho tổng (FBA Available + Kho 3PL) chạm mốc **915 hộp**, chuyên viên kho **bắt buộc phải xuất lệnh PO sản xuất 1,500 – 3,000 hộp mới** cho xưởng Bến Tre.

---

## PHẦN 2: THUẬT TOÁN TỐI ƯU PHÂN BỔ KHO GEO-FBA 2026 ($0 PLACEMENT FEE)

* **Chính sách Amazon 2026:** Nếu nhà xưởng gửi toàn bộ container vào 1 kho duy nhất ở Bờ Tây $\rightarrow$ Amazon thu phí phạt $0.21 – $0.34 / sản phẩm.
* **Quy tắc phân bổ chia kho chuẩn của Vexim (Multi-Location Split):**
  * **60% Lô hàng (1,800 units):** Đi kho Bờ Tây `ONT8` (Moreno Valley, California).
  * **40% Lô hàng (1,200 units):** Đi kho Bờ Đông `TEB9` (Somerset, New Jersey).
  * 👉 **Kết quả:** Amazon MIỄN PHÍ 100% phí Placement Fee ($0.00) $\rightarrow$ Tiết kiệm ròng **\$840 – \$2,500 / container** cho nhà xưởng.

---

## PHẦN 3: CHIẾN LƯỢC KHO ĐỆM 3PL NGOẠI QUAN TẠI CALIFORNIA & CHÂM HÀNG JIT

* **Vì sao không chuyển thẳng 100% hàng vào kho Amazon?**
  * Phí lưu kho của Amazon trong mùa cao điểm Q4 (tháng 10 đến tháng 12) đắt gấp 3.5 lần (\$2.40/cu ft so với kho ngoại quan 3PL chỉ \$0.65/cu ft).
* **Mô hình vận hành Just-In-Time (JIT):**
  1. Container cập cảng Los Angeles $\rightarrow$ Kéo thẳng về kho đệm 3PL của Vexim tại Chino / Ontario, California.
  2. Mỗi thứ Hai hàng tuần, chuyên viên kho kiểm tra Days of Supply:
     * Nếu SKU nào còn dưới 20 ngày bán $\rightarrow$ Tạo lệnh xuất kho 3PL chuyển **2–4 Pallet (800–1,200 units)** vào kho FBA gần nhất qua dịch vụ Amazon Partnered Carrier (UPS LTL).
  3. Tiết kiệm **65% chi phí lưu kho tổng thể**.

---

## PHẦN 4: HƯỚNG DẪN XUẤT NHÃN FNSKU & BOX ID PDF TRÊN HỆ THỐNG

1. **Bước 1:** Vào tab **"Quản lý sản phẩm"** hoặc **"Supply Chain Hub"** $\rightarrow$ Bấm nút **"Xuất Nhãn FNSKU & Box ID (PDF)"**.
2. **Bước 2:** Chọn định dạng máy in:
   * Máy in nhiệt cuộn 50x30mm (cho tem sản phẩm dán đè lên mã UPC gốc).
   * Giấy A4 (30-up chuẩn Avery 5160).
   * Máy in nhiệt 4x6 inch (cho tem thùng carton lớn FBA Box ID).
3. **Bước 3:** Bấm nút **"Xuất File PDF & Ra Lệnh In"** $\rightarrow$ Gửi file PDF chất lượng cao $\ge 300\text{ DPI}$ cho quản đốc nhà xưởng dán lên hàng hóa.
