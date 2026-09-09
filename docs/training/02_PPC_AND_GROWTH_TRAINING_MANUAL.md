# GIÁO TRÌNH ĐÀO TẠO NỘI BỘ VEXIM GLOBAL — MODULE 02
## CẨM NANG ĐÀO TẠO CHUYÊN SÂU QUẢNG CÁO AMAZON PPC & THUẬT TOÁN TĂNG TRƯỞNG

**Mã tài liệu:** VXM-TRN-02-EXP  
**Đối tượng:** Chuyên viên PPC, Media Buyer & Growth Marketer Vexim  
**Trưởng bộ môn:** Lương Hoàng Minh (`luonghoangminh88@gmail.com` — PPC & Growth Lead)  
**Phiên bản:** 2.0 (Chuẩn hóa Amazon Ads API v3 & Thuật toán COSMO AI)

---

## PHẦN 1: BẢN CHẤT CỦA PHIÊN ĐẤU GIÁ AMAZON ADS (SECOND-PRICE AUCTION)

Trong hệ sinh thái Amazon Sponsored Ads, người trả giá thầu (Bid) cao nhất **chưa chắc đã thắng vị trí Top 1**. 
Vị trí hiển thị và chi phí mỗi lượt nhấp chuột (CPC) thực tế được xác định theo phương trình:

$$\text{Ad Rank} = \text{Bid} \times \text{Ad Relevance Score} \times \text{Historical CVR (Tỷ lệ chuyển đổi)}$$

$$\text{Actual CPC Paid} = \frac{\text{Ad Rank của đối thủ liền kề}}{\text{Relevance Score của mình}} + \$0.01$$

* 👉 **Bài học cốt lõi:** Khi ta chọn đúng từ khóa có tỷ lệ mua hàng cao (High CVR) và tối ưu độ liên quan giữa tiêu đề sản phẩm với từ khóa, **Amazon sẽ tự động giảm giá CPC thực tế phải trả xuống thấp hơn 20% – 30% so với đối thủ cạnh tranh!**

---

## PHẦN 2: BỘ CHỈ SỐ BẮT BUỘC & CÔNG THỨC TOÁN HỌC (PPC METRICS MATRIX)

| Chỉ số | Tên tiếng Anh | Công thức tính toán | Ngưỡng mục tiêu tại Vexim |
| :--- | :--- | :--- | :---: |
| **ACOS** | Advertising Cost of Sales | $\frac{\text{Ad Spend}}{\text{Ad Sales}} \times 100\%$ | $\le 18\% - 22\%$ |
| **TACOS**| Total ACOS | $\frac{\text{Total Ad Spend}}{\text{Total Brand Revenue}} \times 100\%$ | $\le 8\% - 10\%$ |
| **ROAS** | Return on Ad Spend | $\frac{\text{Ad Sales}}{\text{Ad Spend}} = \frac{1}{\text{ACOS}}$ | $\ge 4.5\text{x} - 5.5\text{x}$ |
| **CVR**  | Conversion Rate | $\frac{\text{Total Orders}}{\text{Total Clicks}} \times 100\%$ | $\ge 12\% - 15\%$ |
| **CTR**  | Click-Through Rate | $\frac{\text{Total Clicks}}{\text{Total Impressions}} \times 100\%$ | $\ge 0.6\% - 1.2\%$ |
| **NTB**  | New-to-Brand Customers | $\frac{\text{Orders từ khách mới}}{\text{Tổng Orders}} \times 100\%$ | $\ge 65\%$ |

---

## PHẦN 3: MA TRẬN 4 CẤU TRÚC CHIẾN DỊCH CHUẨN QUỐC TẾ (4-TIER CAMPAIGN FUNNEL)

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

## PHẦN 4: 4 THUẬT TOÁN TỰ ĐỘNG HÓA BẮT BUỘC PHẢI THUỘC LÒNG

### 🌾 Thuật toán 1: Thu hoạch Từ khóa Vàng (Search Term Harvesting)
* **Điều kiện kích hoạt:** $(\text{Orders 7 ngày} \ge 3) \land (\text{ACOS thực tế} < 20\%)$.
* **Quy trình thao tác:**
  1. Thêm cụm từ tìm kiếm đó vào chiến dịch **Exact Performance** với mức giá thầu:
     $$\text{Initial Bid} = \text{CPC thực tế} \times 1.15 \quad (\text{Tăng 15\% để bảo kê Top 1})$$
  2. Đồng thời thêm cụm từ đó vào danh sách **Negative Exact (Phủ định chính xác)** của chiến dịch Auto và Broad để tránh tự đấu thầu chéo làm đội chi phí nội bộ (*Internal Cannibalization*).

### 🩸 Thuật toán 2: Chặn Đứng Từ khóa Đốt Tiền (Bleeder Negation)
* **Điều kiện kích hoạt:** $(\text{Số Clicks} \ge 15) \land (\text{Số Orders} = 0)$.
* **Hành động:** Lập tức đưa từ khóa đó vào danh sách **Negative Exact**, giúp tiết kiệm từ \$15 – \$35 tiền lãng phí cho mỗi từ khóa rác mỗi tháng.

### ⏰ Thuật toán 3: Tối ưu Theo Khung Giờ Vàng Nước Mỹ (Dynamic Dayparting)
* **00:00 – 06:00 EST (Đêm muộn tại Mỹ):** Hạ 40% giá thầu để tránh click dạo tỷ lệ mua thấp.
* **10:00 – 14:00 EST (Nghỉ trưa Mỹ):** Tăng 20% giá thầu.
* **19:00 – 22:00 EST (Khung giờ mua sắm gia đình tối):** Tăng 25% giá thầu và kích hoạt Top-of-Search modifier.

### 🛡️ Thuật toán 4: Bắt tay Kho Vận & Quảng cáo (Inventory-Aware PPC Throttling)
* Khi $\text{Days of Supply} \le 14$ ngày: Tự động giảm 30% ngân sách chiến dịch mở rộng, tắt Top-of-Search boost, chỉ giữ chiến dịch Brand Defense để không bị đứt hàng FBA làm tụt BSR.

---

## PHẦN 5: QUY TRÌNH TẠO CHIẾN DỊCH MỚI TRÊN VEXIM PLATFORM

1. Mở menu **"Quảng cáo PPC"** $\rightarrow$ Bấm nút tím **"Tạo Chiến Dịch PPC Mới"**.
2. Đặt tên chuẩn cú pháp: `[Loại Ads] - [Tên Thương Hiệu] - [SKU] - [Định Dạng Targeting]`.
   * *Ví dụ chuẩn:* `[SP] - Vinacacao - COCOA-70DK - Exact Top10`.
3. Nhập ngân sách ngày (\$25 – \$50/ngày) và Target ACOS ($20\%$).
4. Chọn chiến lược đấu thầu: **Dynamic Bids - Down Only**.
5. Bấm **"Khởi Tạo Chiến Dịch Ngay"** để hệ thống đồng bộ qua Amazon Ads API.
