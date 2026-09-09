# TÀI LIỆU ĐÀO TẠO NỘI BỘ VEXIM — MODULE 02
## CẨM NANG ĐÀO TẠO CHUYÊN SÂU QUẢNG CÁO AMAZON PPC & THUẬT TOÁN TĂNG TRƯỞNG

**Mã tài liệu:** VXM-TRN-02  
**Đối tượng:** Chuyên viên PPC, Media Buyer & Growth Marketer Vexim  
**Trưởng bộ môn:** Lương Hoàng Minh (`luonghoangminh88@gmail.com` — PPC & Growth Lead)  
**Phiên bản:** 2.0 (Chuẩn hóa Amazon Ads API v3 & Thuật toán COSMO AI)

---

## 1. MỤC TIÊU & CHỈ SỐ BẮT BUỘC (KPIS)
* **ACOS Chiến dịch (Advertising Cost of Sales):** Cam kết $\le 18\% - 22\%$.
* **TACOS Toàn Gian Hàng (Total ACOS):** Kiểm soát $\le 8\% - 10\%$.
* **ROAS Trung Bình (Return on Ad Spend):** Đạt từ **$4.5\text{x} - 5.5\text{x}$**.
* **Organic Rank Uplift:** Đưa các từ khóa chủ lực vào Top 1 – Top 5 tự nhiên trên trang 1 Amazon US.

---

## 2. MA TRẬN 4 CẤU TRÚC CHIẾN DỊCH CHUẨN QUỐC TẾ (4-TIER CAMPAIGN FUNNEL)

Mọi sản phẩm của nhà xưởng Việt Nam khi đưa lên Amazon đều phải được phân bổ theo mô hình phễu 4 tầng:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                 MA TRẬN PHỄU QUẢNG CÁO 4 TẦNG TẠI VEXIM                    │
├────────────────────────────────┬────────────────────────────────────────────┤
│ LOẠI CHIẾN DỊCH                │ CẤU HÌNH CHI TIẾT & MỤC ĐÍCH               │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 1. [SP] Auto Discovery         │ • Bật cả 4 nhóm: Close, Loose, Sub, Comp.  │
│    (Khám phá từ khóa mới)      │ • Giá thầu thấp: $0.35 – $0.65.            │
│                                │ • Mục đích: Thu thập cụm từ tìm kiếm mới.  │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 2. [SP] Broad / Phrase Research│ • Nhắm từ khóa mở rộng (+vietnamese +cacao)│
│    (Nghiên cứu cụm từ dài)     │ • Giá thầu trung bình: $0.65 – $0.95.      │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 3. [SP] Exact Performance      │ • Chỉ chứa từ khóa vàng chuyển đổi cao.    │
│    (Gặt hái doanh số)          │ • Giá thầu cao: $1.20 – $2.20 + Top-of-    │
│                                │   Search Placement Boost (+50% đến +80%).  │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 4. [PAT] Product Targeting     │ • Tấn công: Hiển thị trên ASIN đối thủ đắt │
│    (Tấn công & Phòng thủ ASIN) │ • Phòng thủ: Hiển thị trên ASIN xưởng mình.│
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 3. 4 QUY TẮC THUẬT TOÁN TỰ ĐỘNG HÓA CẦN THUỘC LÒNG

### 🌾 Quy tắc 1: Thu hoạch Từ khóa Vàng (Search Term Harvesting)
* **Điều kiện:** $(\text{Orders trong 7 ngày} \ge 3) \land (\text{ACOS thực tế} < 20\%)$.
* **Thao tác:**
  1. Thêm cụm từ đó vào chiến dịch **Exact Campaign** với giá thầu $\text{Bid Mới} = \text{CPC thực tế} \times 1.15$ (+15% để bảo kê Top 1).
  2. Thêm cụm từ đó vào danh sách **Negative Exact** của chiến dịch Auto/Broad để tránh tự đấu thầu chéo.

### 🩸 Quy tắc 2: Phủ định Từ khóa Đốt Tiền (Bleeder Negation)
* **Điều kiện:** $(\text{Số Clicks} \ge 15) \land (\text{Số Orders} = 0)$.
* **Thao tác:** Đưa ngay vào danh sách **Negative Exact** của chiến dịch đó.

### ⏰ Quy tắc 3: Tối ưu Theo Giờ Vàng Nước Mỹ (Dynamic Dayparting)
* **00:00 – 06:00 EST (Nửa đêm Mỹ):** Hạ 40% giá thầu để tránh click dạo không mua.
* **10:00 – 14:00 & 19:00 – 22:00 EST (Đỉnh mua sắm):** Tăng 20%–25% giá thầu và tăng Top-of-Search modifier.

### 🛡️ Quy tắc 4: Bắt tay Kho Vận (Inventory-Aware PPC Throttling)
* Khi $\text{Days of Supply} \le 14$ ngày: Tự động giảm 30% ngân sách chiến dịch mở rộng, chỉ giữ chiến dịch Brand Defense để không bị đứt hàng FBA.

---

## 4. HƯỚNG DẪN THAO TÁC TRÊN GIAO DIỆN VEXIM PLATFORM

1. **Kiểm tra chỉ số buổi sáng:** Vào menu **"PPC & Growth Desk"** $\rightarrow$ Tab *Search Term Harvester*.
2. **Duyệt từ khóa AI đề xuất:** 
   * Bấm nút **"Promote to Exact"** cho các từ khóa xanh (ACOS $< 18\%$).
   * Bấm nút **"Negative Exact"** cho các từ khóa đỏ lãng phí ngân sách.
3. **Tạo chiến dịch mới:** Vào menu **"Quảng cáo PPC"** $\rightarrow$ Bấm nút **"Tạo Chiến Dịch PPC Mới"** $\rightarrow$ Điền thông số và bấm lưu.
