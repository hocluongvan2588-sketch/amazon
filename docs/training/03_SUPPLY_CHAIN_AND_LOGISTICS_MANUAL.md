# TÀI LIỆU ĐÀO TẠO NỘI BỘ VEXIM — MODULE 03
## CẨM NANG ĐÀO TẠO CHUYÊN SÂU KHO VẬN FBA & CHUỖI CUNG ỨNG QUỐC TẾ

**Mã tài liệu:** VXM-TRN-03  
**Đối tượng:** Chuyên viên Logistics, Quản lý Kho Vận & Chuỗi Cung Ứng Vexim  
**Trưởng bộ môn:** Ánh Nguyễn (`anhnguyen94@gmail.com` — Logistics & FBA Hub Lead)  
**Phiên bản:** 2.0 (Cập nhật chính sách FBA Inbound Placement 2026)

---

## 1. MỤC TIÊU & CHỈ SỐ BẮT BUỘC (KPIS)
* **Tỷ lệ có hàng trên kệ FBA (In-Stock Rate):** $\ge 98.5\%$.
* **Điểm Sức khỏe Tồn kho (Amazon IPI Score):** $\ge 600$ điểm.
* **Tiết kiệm Phí Inbound Placement:** Đạt mức **$0.00 / sản phẩm** (Tiết kiệm \$840 – \$2,500 / container).
* **Thời gian Châm hàng JIT từ kho 3PL sang FBA:** $\le 48$ giờ.

---

## 2. MA TRẬN 5 CHẶNG LEAD TIME TUYẾN XUẤT KHẨU VIỆT – MỸ (47 NGÀY)

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

---

## 3. THUẬT TOÁN TỐI ƯU PHÂN BỔ KHO GEO-FBA 2026 ($0 FEE)

* **Quy định Amazon 2026:** Nếu gửi toàn bộ container vào 1 kho duy nhất ở Bờ Tây $\rightarrow$ Amazon thu phí phạt $0.21 – $0.34 / sản phẩm.
* **Quy tắc phân bổ chuẩn của Vexim:**
  * **60% Lô hàng:** Đi kho Bờ Tây `ONT8` (Moreno Valley, California).
  * **40% Lô hàng:** Đi kho Bờ Đông `TEB9` (Somerset, New Jersey).
  * 👉 **Kết quả:** Amazon miễn 100% phí Inbound Placement Fee (\$0.00).

---

## 4. HƯỚNG DẪN IN TEM NHÃN & DÁN THÙNG CHUẨN XƯỞNG

1. **In Tem Nhãn FNSKU Sản Phẩm:**
   * Vào menu **"Quản lý sản phẩm"** hoặc **"Supply Chain Hub"** $\rightarrow$ Bấm nút **"Xuất Nhãn FNSKU & Box ID (PDF)"**.
   * Chọn máy in nhiệt khổ 50x30mm hoặc A4 (30-up) $\rightarrow$ Xuất file PDF gửi xưởng in với độ phân giải $\ge 300\text{ DPI}$.
   * **Quy cách dán:** Dán đè phẳng hoàn toàn lên mã vạch UPC gốc của từng hộp.
2. **In Tem Thùng Carton Lớn (FBA Box ID):**
   * Chọn khổ 4x6 inch $\rightarrow$ In 2 tem dán ở 2 mặt bên của mỗi thùng carton.
   * Trọng lượng mỗi thùng không vượt quá **50 lbs (22.6 kg)**.
