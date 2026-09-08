# VEXIM AMAZON OPERATIONS PLATFORM V2.0
## Product Requirements Document (PRD) & Deep-Tech Architectural Specification

**Tài liệu:** Đặc tả Kỹ thuật & Yêu cầu Sản phẩm Nâng cao V2.0  
**Phiên bản:** 2.0.0-DEEPTECH  
**Ngày phát hành:** 08/09/2026  
**Chủ quản:** Vexim Global Operations & Engineering Team  
**Mục tiêu:** Chuyển đổi Vexim Platform từ "Hệ thống Quản trị Vận hành" thành **"Cỗ máy Tăng trưởng Chiến lược (Strategic Growth Engine)"** cho Doanh nghiệp Việt Nam xuất khẩu Amazon Mỹ.

---

## 1. ĐÁNH GIÁ & PHẢN BIỆN CHIẾN LƯỢC V2.0

### 1.1. Tại sao kiến trúc Workspace V2.0 là bắt buộc?
Khi quản lý 20–50 xưởng sản xuất Việt Nam (Suppliers) cùng lúc trên Amazon US, việc dùng chung một bảng điều khiển tổng hợp gây ra:
1. **Rối loạn thao tác (Cognitive Overload):** Nhân sự PPC bị phân tán bởi cảnh báo vận chuyển cảng biển; nhân viên CS bị quá tải bởi các biểu đồ đấu thầu từ khóa.
2. **Chi phí nhân sự phình to (Lack of Operating Leverage):** Nếu không có các công cụ thuật toán (Day-parting, Search Term Harvester), một chuyên viên PPC chỉ quản lý tối đa 3-4 tài khoản. Với V2.0, một chuyên viên có thể phụ trách 15-20 tài khoản với hiệu suất vượt trội.
3. **Triệt tiêu sai sót tốn kém:** Các tính năng như *Geo-FBA Placement Calculator* và *Automated POA Generator* giúp tiết kiệm hàng chục nghìn USD tiền phạt và phí Inbound của Amazon mỗi tháng.

---

### 1.2. Ba cơ chế "Bắt tay liên phòng ban" (Cross-Department Handshake)

```text
┌─────────────────────────┐                        ┌─────────────────────────┐
│     SUPPLY CHAIN HUB    │ ──── Low Stock Alert ──► │    PPC & GROWTH DESK    │
│  (FBA Days of Supply)   │                          │ (Auto-Bid Dampener Rule)│
└─────────────────────────┘                          └─────────────────────────┘
             │                                                    │
             │ Container Delay Warning                            │ Reverse ASIN Gap
             ▼                                                    ▼
┌─────────────────────────┐                        ┌─────────────────────────┐
│   EXECUTIVE & FINANCE   │ ◄── Profit Attribution ──│  BRAND INTEL & CRO DESK │
│   (P&L Cash Flow USD)   │                          │  (A+ Listing Revamp)    │
└─────────────────────────┘                        └─────────────────────────┘
```

1. **Inventory $\leftrightarrow$ PPC Throttle Handshake:**
   * Khi FBA *Days of Supply < 14 ngày*, hệ thống tự động kích hoạt Rule `INVENTORY_THROTTLE` để giảm 30%–50% giá thầu các chiến dịch khám phá (Auto/Broad), bảo vệ thứ hạng Organic Rank và tránh tình trạng hết hàng đột ngột (Stock-out).
2. **Logistics $\leftrightarrow$ Finance Inbound Handshake:**
   * Máy tính *Geo-FBA Placement* tự động so sánh chi phí vận chuyển nội địa Mỹ và mức phí phạt *Amazon Inbound Placement Fee* ($0.21–$0.34/sp) để quyết định chia lô hàng (60% West Coast ONT8 / 40% East Coast TEB9).
3. **Compliance $\leftrightarrow$ Supply Chain Document Handshake:**
   * Khi nhận được cảnh báo chất lượng từ Amazon (*Food Safety / Inauthentic Complaint*), AI POA Builder tự động trích xuất chứng chỉ COA, Invoice nhà máy Bến Tre/Hải Phòng và Vận đơn Bill of Lading từ kho lưu trữ để đóng gói thành **Evidence Package** đạt chuẩn pháp lý Mỹ.

---

## 2. ĐẶC TẢ CHI TIẾT 4 NHÓM KỸ THUẬT CHUYÊN SÂU (DEEP-TECH MODULES)

---

### MODULE 1: PPC & GROWTH ENGINEERING DESK

#### A. Mục tiêu
Tự động hóa 80% công việc tối ưu quảng cáo PPC, biến chi tiêu quảng cáo thành doanh thu có lời thực chất (TACOS < 15%).

#### B. Thành phần Chức năng (Components)
1. **Algorithmic Bidding Canvas:**
   * *Day-parting Engine:* Tự động tăng bid +25% trong khung giờ vàng 18:00 – 23:00 EST (giờ khách hàng Mỹ mua sắm sau giờ làm) và hạ -40% lúc 01:00 – 06:00 sáng.
   * *Target ACOS Balancer:* Tự động điều chỉnh bid keyword mỗi 6 giờ để duy trì ACOS mục tiêu (Target 22%).
2. **Search Term Harvester:**
   * Tự động quét báo cáo *Search Term Report* từ Amazon Advertising API v3.
   * **1-Click Promote Exact:** Đưa các từ khóa khách gõ thực tế có $\ge 3$ orders và ACOS $< 20\%$ sang Chiến dịch Exact, đồng thời tự động thêm từ khóa đó vào danh sách **Negative Exact** ở chiến dịch Auto để tránh trả tiền 2 lần.
   * **1-Click Negate:** Phủ định ngay lập tức các từ khóa click $\ge 15$ lần không ra đơn (ACOS $0\%$).
3. **Cannibalization Radar Map:**
   * Quét và phát hiện các SKU của cùng một gian hàng đang tự đấu thầu cạnh tranh cùng 1 từ khóa (ví dụ: Cacao 70% và Cacao 85% cùng thầu *"dark chocolate"* làm đẩy giá click CPC lên \$1.60 thay vì \$0.95).

---

### MODULE 2: SUPPLY CHAIN MODELING & GEO-FBA HUB

#### A. Mục tiêu
Xóa bỏ rủi ro đứt hàng (Stock-out) và triệt tiêu các loại phí phát sinh mới của Amazon US (Inbound Placement Fee & Aged Inventory Surcharge).

#### B. Thành phần Chức năng (Components)
1. **Dynamic Lead Time Matrix (Machine Learning Prediction):**
   * Tính toán thời gian chuỗi cung ứng thực tế 5 chặng:
     $$\text{Total Lead Time} = T_{\text{Factory}} + T_{\text{Ocean}} + T_{\text{US Customs}} + T_{\text{Drayage}} + T_{\text{FBA Check-in}}$$
   * Tích hợp chỉ số tắc nghẽn cảng biển (Port Congestion) và mùa cao điểm Q4 (Black Friday surge) để đưa ra dự báo chính xác thay vì con số cố định.
2. **Geo-FBA Placement Calculator:**
   * Phân tích dữ liệu phân bổ người mua Prime bờ Đông vs bờ Tây.
   * Đề xuất tỷ lệ chia lô hàng (Split Inbound) để được Amazon **miễn giảm 100% phí Inbound Placement Service Fee**, tiết kiệm \$840 – \$2,500 cho mỗi container xuất khẩu.
3. **3PL Buffer & JIT Restock Simulator:**
   * Quản lý kho ngoại quan đệm tại California.
   * Kích hoạt lệnh chuyển hàng JIT (Just-In-Time) từ kho 3PL vào kho FBA ONT8/LAX9 khi lượng hàng FBA chạm ngưỡng 14 ngày tồn.

---

### MODULE 3: BRAND INTELLIGENCE & CRO DESK

#### A. Mục tiêu
Chiếm lĩnh thị phần từ các đối thủ lớn tại Mỹ và tối đa hóa tỷ lệ chuyển đổi (Conversion Rate) trên trang sản phẩm.

#### B. Thành phần Chức năng (Components)
1. **Reverse ASIN Competitor Radar:**
   * Nhập mã ASIN của đối thủ hàng đầu (ví dụ: Lindt, Alter Eco).
   * Bóc tách toàn bộ bảng từ khóa Organic Rank và Sponsored Rank của đối thủ, so sánh với thứ hạng của thương hiệu Việt để tìm ra các "khoảng trống thị trường" (Keyword White Spaces).
2. **Traffic & Conversion Diagnostics (Funnel Heatmap):**
   * Đo lường chỉ số Lượt nhấp (CTR) và Tỷ lệ mua hàng (CVR) so với chuẩn benchmark ngành.
   * Phát hiện chính xác điểm nghẽn:
     * *CTR thấp $\rightarrow$ Lỗi do Ảnh đại diện Hero Image hoặc Tiêu đề.*
     * *CVR thấp, Bounce Rate cao $\rightarrow$ Lỗi do thiếu công thức pha chế, thiếu chứng nhận FDA hoặc bảng so sánh A+ Content.*

---

### MODULE 4: LEGAL COMPLIANCE & POA BUILDER

#### A. Mục tiêu
Bảo vệ tài khoản gian hàng an toàn 100%, phản hồi và gỡ bỏ 100% các vi phạm chính sách Amazon trong vòng 72 giờ.

#### B. Thành phần Chức năng (Components)
1. **Automated Plan of Action (POA) Generator:**
   * Soạn thảo đơn giải trình 3 phần chuẩn pháp lý gửi *Amazon Seller Performance*:
     * **Phần 1 - Root Cause:** Nguyên nhân gốc rễ (phân tích chi tiết lỗi cảm biến máy in date hoặc quy trình đóng gói tại xưởng VN).
     * **Phần 2 - Immediate Corrective Actions:** Hành động khắc phục ngay lập tức (hoàn tiền, cách ly lô hàng FBA qua Removal Order).
     * **Phần 3 - Long-term Preventive Measures:** Biện pháp phòng ngừa triệt để (nâng cấp máy khắc laser, kiểm tra camera quang học 100%).
   * Tự động đính kèm chứng chỉ COA, Hóa đơn VAT có dấu đỏ, và Vận đơn Bill of Lading đã ký số.
2. **USPTO & Trademark Watch Radar:**
   * Tự động quét hệ thống dữ liệu Sở hữu trí tuệ Hoa Kỳ (USPTO).
   * Cảnh báo sớm các đơn đăng ký nhãn hiệu có dấu hiệu xâm phạm thương hiệu Việt Nam để kịp thời nộp đơn phản đối (*Notice of Opposition*) trước thời hạn 30 ngày.

---

### MODULE 5: CỔNG ĐIỀU HÀNH DÀNH RIÊNG CHO CHỦ XƯỞNG (SUPPLIER EXECUTIVE PORTAL)

#### A. Mục tiêu
Cung cấp bức tranh tài chính minh bạch, rõ ràng cho các chủ doanh nghiệp Việt Nam không rành kỹ thuật.

#### B. Đặc điểm Thiết kế:
* **Chuyển đổi Song tệ Tức thì:** Xem toàn bộ số liệu bằng **VNĐ (tỷ giá 25,450)** hoặc **USD**.
* **Biểu đồ Dòng tiền Waterfall:** Bóc tách từ Doanh thu gộp $\rightarrow$ Phí sàn Amazon $\rightarrow$ Phí FBA $\rightarrow$ Chi phí Ads $\rightarrow$ Giá vốn COGS $\rightarrow$ **Lợi nhuận ròng thực nhận**.
* **Chế độ Bảo vệ Tài khoản (Guarded Safe Mode):** Ẩn toàn bộ nút bấm kỹ thuật phức tạp để ngăn chặn tình trạng bấm nhầm làm ảnh hưởng tài khoản.

---

## 3. BẢNG PHÂN QUYỀN VẬN HÀNH CHI TIẾT (RBAC MATRIX V2.0)

| Chức năng v2.0 | PPC Specialist | Logistics Specialist | Brand & CS | Compliance | Ops Lead / Admin | Supplier (Client) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Bật/Tắt Day-parting Rules** | ✅ Toàn quyền | ❌ Chặn | ❌ Chặn | ❌ Chặn | ✅ Toàn quyền | 🔒 Chỉ xem |
| **Duyệt Search Term Exact** | ✅ Toàn quyền | ❌ Chặn | ❌ Chặn | ❌ Chặn | ✅ Toàn quyền | 🔒 Chỉ xem |
| **Cấu hình Tuyến Lead Time** | ❌ Chặn | ✅ Toàn quyền | ❌ Chặn | ❌ Chặn | ✅ Toàn quyền | 🔒 Chỉ xem |
| **Chia lô Geo-FBA Placement**| ❌ Chặn | ✅ Toàn quyền | ❌ Chặn | ❌ Chặn | ✅ Duyệt lệnh > \$10k | 🔒 Chỉ xem |
| **Soạn & Nộp Đơn POA Amazon**| ❌ Chặn | ❌ Chặn | ❌ Chặn | ✅ Soạn thảo | ✅ Ký duyệt nộp | 🔒 Nhận thông báo |
| **Kháng nghị USPTO Trademark**| ❌ Chặn | ❌ Chặn | ❌ Chặn | ✅ Soạn thảo | ✅ Chuyển Luật sư | 🔒 Nhận báo cáo |
| **Xem Waterfall Lợi Nhuận Net**| ❌ Chặn | ❌ Chặn | ❌ Chặn | ❌ Chặn | ✅ Toàn quyền | ✅ Xem của xưởng mình |

---

## 4. KẾT LUẬN & LỘ TRÌNH TRIỂN KHAI (IMPLEMENTATION ROADMAP)

Kiến trúc V2.0 được tích hợp liền mạch vào hệ thống Next.js hiện tại của Vexim:
* Giao diện đã được trang bị **Workspace Selector thông minh** trên Header.
* Sidebar đã được nâng cấp phân nhóm rõ ràng theo 5 Workspace chuyên sâu.
* Toàn bộ mã nguồn đáp ứng tiêu chuẩn TypeScript nghiêm ngặt, sẵn sàng kết nối trực tiếp với **Amazon SP-API** và cơ sở dữ liệu **Supabase**.
