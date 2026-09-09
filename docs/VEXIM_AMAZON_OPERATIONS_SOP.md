# VEXIM GLOBAL — AMAZON US OPERATIONS PLATFORM
## QUY TRÌNH VẬN HÀNH TIÊU CHUẨN (STANDARD OPERATING PROCEDURE — SOP)
**Mã tài liệu:** VEXIM-SOP-OPS-01  
**Phiên bản:** V1.0  
**Ngày ban hành:** 08/09/2026  
**Áp dụng cho:** Đội ngũ Vận hành Vexim (Ops Manager, AE, Compliance, PPC Lead, Content) & Nhà cung cấp Việt Nam

---

# MỤC LỤC
1. [MỤC ĐÍCH & PHẠM VI](#1-mục-đích--phạm-vi)
2. [MA TRẬN PHÂN CÔNG TRÁCH NHIỆM (RACI MATRIX)](#2-ma-trận-phân-công-trách-nhiệm-raci-matrix)
3. [LỊCH TRÌNH VẬN HÀNH HÀNG NGÀY (DAILY OPERATIONS ROUTINE)](#3-lịch-trình-vận-hành-hàng-ngày-daily-operations-routine)
4. [SOP 01: TIẾP NHẬN SẢN PHẨM & CỔNG PHÁP LÝ (INTAKE & COMPLIANCE GATE)](#4-sop-01-tiếp-nhận-sản-phẩm--cổng-pháp-lý-intake--compliance-gate)
5. [SOP 02: QUẢN TRỊ TỒN KHO & CHUỖI CUNG ỨNG FBA (INVENTORY & STOCKOUT JIT)](#5-sop-02-quản-trị-tồn-kho--chuỗi-cung-ứng-fba-inventory--stockout-jit)
6. [SOP 03: ĐIỀU HÀNH & TỐI ƯU HÓA QUẢNG CÁO PPC (AMAZON ADS OPTIMIZATION)](#6-sop-03-điều-hành--tối-ưu-hóa-quảng-cáo-ppc-amazon-ads-optimization)
7. [SOP 04: TỐI ƯU HÓA LISTING & A+ CONTENT (CVR CONVERSION ACCELERATION)](#7-sop-04-tối-ưu-hóa-listing--a-content-cvr-conversion-acceleration)
8. [SOP 05: XỬ LÝ KHÁCH HÀNG & QUY TẮC KHÓA AN TOÀN (CUSTOMER SAFETY GATE)](#8-sop-05-xử-lý-khách-hàng--quy-tắc-khóa-an-toàn-customer-safety-gate)
9. [SOP 06: BÁO CÁO ĐIỀU HÀNH & HỌP KHÁCH HÀNG (SUPPLIER REPORTING)](#9-sop-06-báo-cáo-điều-hành--họp-khách-hàng-supplier-reporting)
10. [QUY TẮC AN NINH DỮ LIỆU & KIỂM TOÁN (AUDIT TRAIL GOVERNANCE)](#10-quy-tắc-an-ninh-dữ-liệu--kiểm-toán-audit-trail-governance)

---

# 1. MỤC ĐÍCH & PHẠM VI
* **Mục đích:** Chuẩn hóa toàn bộ thao tác của đội ngũ nhân sự Vexim trên nền tảng **Vexim Amazon Operations Platform**, đảm bảo:
  * Không bao giờ để xảy ra đứt hàng (Stockout) làm mất thứ hạng Best Seller Rank (BSR).
  * Kiểm soát chặt chẽ ngân sách quảng cáo PPC, duy trì ACOS < 25% và TACOS < 14%.
  * Chặn 100% rủi ro pháp lý (FDA, FALCPA Allergen, Prop 65) trước khi hàng xuất khỏi cảng Việt Nam.
  * Tận dụng tối đa sức mạnh AI Multi-Agent để tự động hóa 80% công việc tính toán, trong khi con người giữ 100% quyền kiểm soát phê duyệt (Human-in-the-loop).
* **Phạm vi áp dụng:** Toàn bộ các gói dịch vụ của Vexim (*Amazon Audit, Amazon Launch, Amazon Operations, Amazon Growth*) triển khai cho các Nhà cung cấp Việt Nam bán hàng trên Marketplace Amazon.com (US).

---

# 2. MA TRẬN PHÂN CÔNG TRÁCH NHIỆM (RACI MATRIX)

| Vị trí / Vai trò | Ký hiệu | Trách nhiệm chính trên Vexim Platform |
| :--- | :---: | :--- |
| **Super Admin (Giám đốc Khối)** | **A** (Accountable) | Quản lý cấu hình hệ thống, cấp quyền tài khoản, giám sát KPI tăng trưởng toàn công ty và doanh thu phí dịch vụ. |
| **Amazon Operations Manager (Trưởng nhóm Vận hành)** | **R** (Responsible) | Phê duyệt các hành động AI đề xuất (Approve/Reject/Modify), điều phối kế hoạch nhập hàng FBA, xử lý sự cố Account Health. |
| **Account Executive - AE (Chuyên viên Khách hàng)** | **R / C** | Cầu nối giữa Vexim và Nhà cung cấp; xuất báo cáo định kỳ, tổ chức họp tư vấn chiến lược tăng trưởng hàng tháng. |
| **Compliance Specialist (Chuyên viên Pháp lý & FDA)** | **R** (Responsible) | Kiểm định hồ sơ chứng từ (FDA, COA, Organic, Nhãn mác), duyệt điểm Amazon Readiness Score, quyết định mở/khóa Launch. |
| **PPC Specialist (Chuyên viên Quảng cáo)** | **R** | Quản lý Campaign Manager, điều chỉnh Bid theo khuyến nghị AI, tối ưu Search Terms và cấu trúc chiến dịch. |
| **Client / Supplier (Nhà cung cấp Việt Nam)** | **I** (Informed) | Theo dõi Dashboard, xem báo cáo tóm tắt Executive Summary, xác nhận kế hoạch sản xuất tại xưởng. |

*(R: Người thực hiện, A: Người chịu trách nhiệm cao nhất, C: Người tham vấn, I: Người nhận thông tin)*

---

# 3. LỊCH TRÌNH VẬN HÀNH HÀNG NGÀY (DAILY OPERATIONS ROUTINE)

```text
┌────────────────────────────────────────────────────────────────────────┐
│               KHUNG GIỜ LÀM VIỆC CHUẨN CỦA ĐỘI NGŨ VEXIM               │
├───────────────────┬────────────────────────────────────────────────────┤
│ 08:30 – 09:15     │ • Đăng nhập Vexim Platform → Mở "AI Operations"    │
│ (Xử lý Khẩn cấp)  │ • Xử lý hàng đợi 🔴 CRITICAL & 🟠 HIGH PRIORITY     │
│                   │ • Kiểm tra hòm thư CS có cảnh báo SAFETY CRITICAL? │
├───────────────────┼────────────────────────────────────────────────────┤
│ 09:15 – 10:30     │ • Mở "Tồn kho FBA" → Kiểm tra Days of Supply < 21d │
│ (Quản trị Tồn kho)│ • Tạo Task PO đặt hàng xưởng VN cho SKU chạm mức   │
├───────────────────┼────────────────────────────────────────────────────┤
│ 10:30 – 12:00     │ • Mở "Quảng cáo PPC" → Xử lý từ khóa ACOS > 40%    │
│ (Tối ưu Ads & CVR)│ • Review bản nháp Listing Draft do AI đề xuất       │
├───────────────────┼────────────────────────────────────────────────────┤
│ 13:30 – 15:30     │ • Xử lý Sản phẩm mới (Intake & FDA Compliance)     │
│ (Launch & Pháp lý)│ • Phân tích chẩn đoán "AI Sales Analyst"           │
├───────────────────┼────────────────────────────────────────────────────┤
│ 15:30 – 17:30     │ • Kiểm tra Sức khỏe Tài khoản (AHR, ODR, Cases)    │
│ (Báo cáo & Tổng kết) • Cập nhật Task Kanban → Báo cáo tiến độ          │
└───────────────────┴────────────────────────────────────────────────────┘
```

---

# 4. SOP 01: TIẾP NHẬN SẢN PHẨM & CỔNG PHÁP LÝ (INTAKE & COMPLIANCE GATE)

### Bước 1: Tiếp nhận thông tin từ Nhà cung cấp
* Nhân viên AE hướng dẫn Supplier cung cấp thông tin sản phẩm hoặc nhập trực tiếp qua nút **`Tiếp nhận Sản phẩm Mới (Intake)`** trên hệ thống.
* Yêu cầu bắt buộc: Tên sản phẩm, Thương hiệu, SKU dự kiến, Ngành hàng Amazon US, Giá bán dự kiến ($), Giá vốn xuất xưởng COGS ($), Kích thước (Inches) và Cân nặng (Lbs).

### Bước 2: Kiểm định Hồ sơ Pháp lý (Compliance Check)
* Chuyên viên Compliance tải lên các chứng từ bắt buộc:
  1. **FDA Food Facility Registration:** Bắt buộc đối với Thực phẩm & Đồ uống (có mã số hiệu lực 2026).
  2. **Certificate of Analysis (COA):** Phiếu kiểm nghiệm chỉ tiêu vi sinh, kim loại nặng (Lead, Cadmium, Arsenic) trong hạn 12 tháng.
  3. **Nhãn mác (Label Spec):** Kiểm tra cảnh báo dị ứng **Major Food Allergens (FALCPA)** ví dụ: *"Contains: Cashews (Tree Nuts)"* hoặc *"Manufactured in a facility that processes soy"*.
  4. **Giấy kiểm dịch thực vật (Phytosanitary Certificate):** Đối với nông sản, gỗ, mây tre đan xuất khẩu.

### Bước 3: Đánh giá Điểm Amazon Readiness Score (0 – 100)
* AI Compliance Gatekeeper tự động chấm điểm 8 tiêu chí:
  * **Nếu Readiness Score >= 80/100 & 0 Blockers:** Chuyển trạng thái sang `READY_FOR_LAUNCH`.
  * **Nếu phát hiện Blocker (Ví dụ thiếu nhãn dị ứng):** Hệ thống lập tức kích hoạt `BLOCK LAUNCH` $\rightarrow$ Chuyên viên Compliance gửi mẫu nhãn chuẩn cho xưởng in nhãn phụ dán đè.

---

# 5. SOP 02: QUẢN TRỊ TỒN KHO & CHUỖI CUNG ỨNG FBA (INVENTORY & STOCKOUT JIT)

### Bước 1: Kiểm tra Days of Supply (DOS) mỗi sáng
* Vào menu **`Tồn kho FBA`**.
* Hệ thống tự động tính toán:
  $$\text{Days of Supply} = \frac{\text{Tồn kho FBA Khả dụng}}{\text{Tốc độ bán trung bình ngày (Weighted Velocity)}}$$

### Bước 2: Kịch bản Phản ứng theo 4 Cấp độ Rủi ro
```text
┌────────────────────────────────────────────────────────────────────────┐
│ CẤP ĐỘ 1: CRITICAL (Days of Supply < 14 ngày)                          │
│ • Hành động: Lập tức liên hệ xưởng VN kích hoạt đơn sản xuất khẩn.     │
│ • Chiến lược Vận chuyển:                                               │
│   - Tàu biển (Sea Freight): Vận chuyển 80% lô hàng (tiết kiệm chi phí).│
│   - Hàng không (Air Express): Vận chuyển 20% (vùng đệm 14 ngày) để     │
│     hàng sang tới kho Amazon trước ngày dự kiến đứt hàng, bảo vệ BSR. │
├────────────────────────────────────────────────────────────────────────┤
│ CẤP ĐỘ 2: HIGH (Days of Supply từ 14 đến 21 ngày)                      │
│ • Hành động: Tạo Task PO sản xuất tại xưởng, book lịch tàu biển.       │
├────────────────────────────────────────────────────────────────────────┤
│ CẤP ĐỘ 3: MEDIUM (Days of Supply từ 21 đến 30 ngày)                    │
│ • Hành động: Theo dõi tiến độ chuẩn bị nguyên liệu của nhà máy.        │
├────────────────────────────────────────────────────────────────────────┤
│ CẤP ĐỘ 4: HEALTHY (Days of Supply > 30 ngày)                           │
│ • Trạng thái: An toàn. Không cần can thiệp.                            │
└────────────────────────────────────────────────────────────────────────┘
```

---

# 6. SOP 03: ĐIỀU HÀNH & TỐI ƯU HÓA QUẢNG CÁO PPC (AMAZON ADS OPTIMIZATION)

### Bước 1: Kiểm tra Hiệu quả Tổng thể (ACOS & TACOS)
* Mở menu **`Quảng cáo PPC`**.
* Tiêu chuẩn mục tiêu của Vexim:
  * **ACOS Chiến dịch (Ad Spend / Ad Sales):** $\le 25\%$ (Giai đoạn duy trì) hoặc $\le 40\%$ (Giai đoạn Launch sản phẩm mới).
  * **TACOS Toàn Brand (Total Ad Spend / Total Revenue):** $\le 12\% - 14\%$.

### Bước 2: Xử lý Khuyến nghị từ AI PPC Agent
1. **Xử lý Từ khóa Lãng phí Ngân sách (Bleeders):**
   * *Điều kiện:* Chi tiêu $> \$20$, số click $\ge 10$, ACOS $> 45\%$.
   * *Thao tác:* Nhấn nút **Approve** để giảm giá thầu (Bid) 35% và thêm từ khóa rác vào danh sách `Negative Phrase`.
2. **Scale Từ khóa Chuyển đổi Cao (Top Converters):**
   * *Điều kiện:* ACOS $< 20\%$, Tỷ lệ chuyển đổi CVR $\ge 20\%$, Đơn hàng $\ge 5$.
   * *Thao tác:* Nhấn **Approve** để tăng Bid thêm 15% và điều chỉnh vị trí hiển thị ưu tiên **Top of Search (First Page)**.

---

# 7. SOP 04: TỐI ƯU HÓA LISTING & A+ CONTENT (CVR CONVERSION ACCELERATION)

### Bước 1: Chẩn đoán bằng AI Sales Analyst
* Mở menu **`AI Sales Analyst`** và trả lời 3 câu hỏi:
  1. *Điều gì đã thay đổi?* (Doanh thu, Sessions, CVR tăng/giảm bao nhiêu %).
  2. *Tại sao thay đổi?* (Do mất Buy Box, đối thủ chạy Flash Deal, hay thiếu từ khóa quà tặng).
  3. *Hành động đề xuất tiếp theo?*

### Bước 2: Cập nhật Listing Copy & A+ Content
* Mở menu **`Tối ưu Listing`**.
* So sánh bản Live hiện tại với bản **AI Optimization Draft V2**:
  * Kiểm tra Tiêu đề: Đảm bảo có từ khóa High-Intent (Ví dụ: *"Gourmet Organic Vegan Gift Pack"*).
  * Kiểm tra 5 Bullet Points: Nêu rõ xuất xứ Việt Nam (Ben Tre, Ha Tinh), chứng nhận USDA Organic, Non-GMO và 3 thành phần sạch.
  * Kiểm tra Backend Search Terms: Tận dụng tối đa $245 - 249$ bytes.
* Nhấn **`Áp dụng bản AI Draft này`** $\rightarrow$ Hệ thống tự động gửi bản vá PATCH qua Amazon SP-API.

---

# 8. SOP 05: XỬ LÝ KHÁCH HÀNG & QUY TẮC KHÓA AN TOÀN (CUSTOMER SAFETY GATE)

### Bước 1: Kiểm tra Hộp thư Chăm sóc Khách hàng
* Mở menu **`Chăm sóc Khách hàng`**.

### Bước 2: Phân loại & Xử lý Nghiêm ngặt
```text
┌────────────────────────────────────────────────────────────────────────┐
│ TRƯỜNG HỢP 1: THẮC MẮC THÔNG THƯỜNG / HỎI VẬN CHUYỂN                  │
│ • Kiểm tra bản nháp tiếng Anh chuẩn Amazon TOS do AI soạn sẵn.        │
│ • Chỉnh sửa nếu cần → Nhấn "Phê duyệt & Gửi qua Amazon Messaging".    │
├────────────────────────────────────────────────────────────────────────┤
│ TRƯỜNG HỢP 2: CẢNH BÁO NGUY HIỂM — SAFETY CRITICAL                     │
│ (Khách khiếu nại dị ứng, chảy máu, xước môi, dằm tre, hóa chất, FDA)   │
│ ❌ NGHIÊM CẤM: Tuyệt đối không dùng bot tự động trả lời cùn.           │
│ 🔴 QUY TRÌNH XỬ LÝ KHẨN CẤP TRONG 2 GIỜ:                              │
│   1. Hệ thống đã tự động khóa van an toàn (Auto-reply blocked).        │
│   2. Operations Manager trực tiếp kiểm tra mã lô hàng sản xuất (Lot #).│
│   3. Soạn thư chính thức gửi khách, hoàn tiền 100% (Full Refund)       │
│      kèm lời xin lỗi chân thành và đề nghị hỗ trợ y tế nếu cần.        │
│   4. Báo cáo Compliance Lead để tạm giữ/kiểm tra lô hàng tại kho FBA.  │
└────────────────────────────────────────────────────────────────────────┘
```

---

# 9. SOP 06: BÁO CÁO ĐIỀU HÀNH & HỌP KHÁCH HÀNG (SUPPLIER REPORTING)

### Lịch báo cáo:
* **Thứ 2 hàng tuần (trước 10:00 sáng):** AE kiểm tra bảng số liệu tuần qua, gửi thông báo cập nhật nhanh cho Supplier.
* **Ngày 01 hàng tháng (trước 15:00):** 
  1. Mở menu **`Báo cáo Hiệu suất`**.
  2. Đọc bản **AI Executive Summary tiếng Việt** (Tóm tắt doanh thu, tỷ lệ tăng trưởng, CVR và hành động tháng tới).
  3. Nhấn nút **`In Báo cáo (PDF Export)`** hoặc **`Xuất CSV`**.
  4. Gửi file báo cáo chuyên nghiệp cho Ban Giám Đốc Nhà cung cấp và đặt lịch họp Online 30 phút tư vấn chiến lược.

---

# 10. QUY TẮC AN NINH DỮ LIỆU & KIỂM TOÁN (AUDIT TRAIL GOVERNANCE)

1. **Tuyệt đối không lưu trữ Password/OTP Amazon của Khách hàng:** 100% kết nối thực hiện qua cơ chế ủy quyền chính thức OAuth SP-API.
2. **Quy tắc Kiểm soát Phê duyệt (Approval Whitelist):**
   * *Hành động an toàn (AI được tạo sẵn):* Tạo bản nháp Listing, phân loại tin nhắn, tính toán Days of Supply, tạo báo cáo.
   * *Hành động nhạy cảm (BẮT BUỘC có con người bấm Approve):* Đổi giá bán, tăng/giảm ngân sách PPC, hoàn tiền cho khách, tạo lệnh sản xuất PO xưởng.
3. **Nhật ký Kiểm toán Bất biến (Immutable Audit Trail):**
   * Mọi thao tác đều được hệ thống tự động ghi lại tại menu **`Nhật ký Kiểm toán`** (*Ai thao tác, Thời gian UTC, Trước khi đổi, Sau khi đổi, Lý do, Địa chỉ IP*). Không ai có quyền xóa hoặc sửa lịch sử kiểm toán này.

---
**PHÊ DUYỆT BỞI:**  
**Giám đốc Vận hành Vexim Global**  
*(Đã ký và ban hành)*
