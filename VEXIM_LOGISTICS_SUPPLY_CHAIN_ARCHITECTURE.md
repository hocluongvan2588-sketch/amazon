# TÀI LIỆU KIẾN TRÚC & QUY TRÌNH VẬN HÀNH PHÂN HỆ LOGISTICS & CHUỖI CUNG ỨNG AMAZON FBA
### VEXIM OPERATIONS PLATFORM — DEEP SUPPLY CHAIN ARCHITECTURE SPECIFICATION (V2.1 ENTERPRISE EDITION)

---

## MỤC LỤC
1. [TỔNG QUAN HỆ THỐNG & NGUYÊN LÝ THIẾT KẾ PHÂN QUYỀN](#1-tổng-quan-hệ-thống--nguyên-lý-thiết-kế-phân-quyền)
2. [THUẬT TOÁN DỰ BÁO TỒN KHO & TỐC ĐỘ BÁN THỰC TẾ (WEMA & DOS ENGINE)](#2-thuật-toán-dự-báo-tồn-kho--tốc-độ-bán-thực-tế-wema--dos-engine)
3. [QUY TRÌNH NGHIỆP VỤ KHÉP KÍN: BÁO XƯỞNG SẴN SÀNG ➔ ĐIỀU XE ➔ XUẤT XƯỞNG](#3-quy-trình-nghiệp-vụ-khép-kín-báo-xưởng-sẵn-sàng--điều-xe--xuất-xưởng)
4. [CHIẾN LƯỢC ỨNG PHÓ 5 BIẾN SỐ BẤT ĐỊNH TRONG CHUỖI CUNG ỨNG THỰC TẾ](#4-chiến-lược-ứng-phó-5-biến-số-bất-định-trong-chuỗi-cung-ứng-thực-tế)
5. [GIẢI PHÁP KHO ĐỆM 3PL CALIFORNIA & BẮN LỆNH CHO 3PL KHÔNG CÓ API](#5-giải-pháp-kho-đệm-3pl-california--bắn-lệnh-cho-3pl-không-có-api)
6. [MẮT XÍCH 1: XỬ LÝ TRẢ HÀNG & HÀNG LỖI TẠI MỸ (REVERSE LOGISTICS & GRADING A/B/C)](#6-mắt-xích-1-xử-lý-trả-hàng--hàng-lỗi-tại-mỹ-reverse-logistics--grading-abc)
7. [MẮT XÍCH 2: PHÁP NHÂN IOR & BỘ ĐẾM CẢNH BÁO PHÍ CẢNG DEMURRAGE / DETENTION](#7-mắt-xích-2-pháp-nhân-ior--bộ-đếm-cảnh-báo-phí-cảng-demurrage--detention)
8. [MẮT XÍCH 3: TRACKING TÀU BIỂN REAL-TIME & ĐIỀU TIẾT KHI LỆCH ETA >= 3 NGÀY](#8-mắt-xích-3-tracking-tàu-biển-real-time--điều-tiết-khi-lệch-eta--3-ngày)
9. [MẮT XÍCH 4: QUẢN LÝ HẠN NGẠCH FBA (CAPACITY LIMITS FT³) & ĐẤU GIÁ DUNG LƯỢNG](#9-mắt-xích-4-quản-lý-hạn-ngạch-fba-capacity-limits-ft--đấu-giá-dung-lượng)
10. [MẮT XÍCH 5: SỰ CỐ KỸ THUẬT, SP-API TOKEN BUCKET QUEUE & OFFLINE LABEL CACHE](#10-mắt-xích-5-sự-cố-kỹ-thuật-sp-api-token-bucket-queue--offline-label-cache)
11. [MA TRẬN TRÁCH NHIỆM ĐĂNG LISTING LÊN SELLER CENTRAL (RACI MATRIX)](#11-ma-trận-trách-nhiệm-đăng-listing-lên-seller-central-raci-matrix)
12. [MA TRẬN MAPPING LIÊN PHÒNG BAN TOÀN DIỆN](#12-ma-trận-mapping-liên-phòng-ban-toàn-diện)

---

## 1. TỔNG QUAN HỆ THỐNG & NGUYÊN LÝ THIẾT KẾ PHÂN QUYỀN

Hệ thống **Vexim Operations Platform** thiết lập ranh giới phân quyền rõ ràng để **bảo vệ Chủ Doanh Nghiệp / Chủ Xưởng Việt Nam khỏi gánh nặng tác nghiệp kho bãi phức tạp**:

```
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ CHỦ XƯỞNG VIỆT NAM (CLIENT SUPPLIER):                                                           │
 │ • KHÔNG quản lý kho bãi, KHÔNG điều xe container, KHÔNG gánh rủi ro cảng biển hay kỹ thuật API. │
 │ • Chỉ làm 3 việc đơn giản: (1) Sản xuất hàng chuẩn ➔ (2) Bấm Báo Sẵn Sàng ➔ (3) Xem P&L Ròng.   │
 └─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 ▲
                                                 │ (Dữ liệu tự động đồng bộ)
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ ĐỘI NGŨ VEXIM LOGISTICS & AGENCY (ÁNH NGUYỄN / MINH TRẦN):                                      │
 │ • Chịu trách nhiệm toàn diện 100%: Book tàu, điều xe kéo bãi (Drayage), giải phóng bãi cảng,    │
 │   quản lý kho đệm 3PL California, châm hàng FBA JIT, xử lý hàng hoàn và đấu giá dung lượng.    │
 └─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. THUẬT TOÁN DỰ BÁO TỒN KHO & TỐC ĐỘ BÁN THỰC TẾ (WEMA & DOS ENGINE)

$$\text{Daily Velocity} = \left(0.50 \times V_{\text{7-Day}}\right) + \left(0.35 \times V_{\text{30-Day}}\right) + \left(0.15 \times V_{\text{90-Day}}\right)$$
$$\text{Days of Supply (DOS)} = \frac{\text{FBA Available} + \text{Reserved In-Transfer}}{\text{Adjusted Daily Velocity}}$$
$$\text{Reorder Point (Units)} = \left(\text{Daily Velocity} \times \text{Dynamic Total Lead Time}\right) + \text{Safety Stock}$$

---

## 3. QUY TRÌNH NGHIỆP VỤ KHÉP KÍN: BÁO XƯỞNG SẴN SÀNG ➔ ĐIỀU XE ➔ XUẤT XƯỞNG

1. **Chủ Xưởng:** Bấm `📦 Báo Xưởng Đã Sẵn Sàng` ➔ Nhập CRD, quy cách thùng ➔ Hệ thống tự tính CBM & Gross Weight.
2. **Hệ Thống:** Đẩy lô hàng vào `Factory Intake Queue` trong **0 giây** kèm chuông báo và Task SLA $\le 48\text{h}$.
3. **Vexim Logistics:** Chọn hãng tàu (Kerry/Flexport/AGL), cấp mã B/L, FBA Shipment ID và phân công xe tải.
4. **Chủ Xưởng:** Nhận thông báo xác nhận, mở `📄 Xem Phiếu Lấy Hàng & B/L` để in 2 liên bàn giao tài xế.

---

## 4. CHIẾN LƯỢC ỨNG PHÓ 5 BIẾN SỐ BẤT ĐỊNH TRONG CHUỖI CUNG ỨNG THỰC TẾ

1. **Xưởng trễ máy:** Đổi lịch tàu tiếp theo (Next Sailing) không mất phí.
2. **Tàu hoãn chuyến:** Kích hoạt bơm hàng từ **Kho đệm 3PL California** tiếp viện trong 24h.
3. **Hải quan Mỹ kiểm tra:** Đẩy bộ chứng từ số hóa (FDA, COA, Prior Notice) cho Customs Broker thông quan nhanh.
4. **Amazon FBA nghẽn nhận hàng:** Kéo về 3PL dỡ cont sang pallet và đi qua **Amazon Carrier Central LTL**.
5. **Listing viral (Bán gấp $3\times$):** **Tách Lô Khẩn Cấp:** 15% Air Express cứu BSR + 85% Ocean Freight + Tăng giá +$2 và hạ 30% bid ads.

---

## 5. GIẢI PHÁP KHO ĐỆM 3PL CALIFORNIA & BẮN LỆNH CHO 3PL KHÔNG CÓ API

### Sổ Cái Tồn Kho 2 Tầng (2-Tier Real-Time Ledger):
* **FBA Active Layer:** Duy trì 18 - 25 ngày bán (Điểm IPI $>650$).
* **3PL Buffer Layer (Chino/Ontario CA):** Lưu trữ container 40ft giá rẻ ($0.45/\text{pallet/ngày}$).

### Bộ 3 Kênh Tác Nghiệp Cho 3PL KHÔNG CÓ API:
1. **Work-Order Auto Email:** Tự động gửi email nghiệp vụ đính kèm trọn bộ file **PDF Tem Pallet FBA (4x6 in) + Packing Slip + Carrier BOL**.
2. **Portal Token 1-Click:** Link bảo mật trên điện thoại để thủ kho 3PL bấm `[✅ ĐÃ GIAO XE AMAZON]` không cần đăng nhập.
3. **Đồng bộ Bảng Kê (CSV/SFTP/Sheets):** Quét đối soát số liệu tự động sau mỗi kỳ kiểm kê.

---

## 6. MẮT XÍCH 1: XỬ LÝ TRẢ HÀNG & HÀNG LỖI TẠI MỸ (REVERSE LOGISTICS & GRADING A/B/C)

```
                            QUY TRÌNH TỰ ĐỘNG THU HỒI & TÁI SINH GIÁ TRỊ
                            
     Hàng Hoàn FBA Unsellable ➔ Auto-Removal Order (Rút về Kho Đệm 3PL California)
                                     │
                                     ▼
                     Kiểm Định Chất Lượng Tại Kho 3PL (Grading Matrix)
                                     │
     ┌───────────────────────────────┼───────────────────────────────┐
     ▼                               ▼                               ▼
 [GRADE A: Mới 100%]             [GRADE B: Cấn Vỏ/Xước]          [GRADE C: Hỏng/Hết Hạn]
 Thay hộp + Dán lại FNSKU        Thanh lý buôn sỉ LA /           Tiêu hủy hợp pháp (COD)
 ($0.35/sp) ➔ Tái xuất FBA       Amazon Warehouse Deals          Giảm trừ thuế DN
 (Thu hồi 92.4% giá trị)         (Thu hồi 55% vốn)               (Thu hồi 0%)
```

* **Cài đặt Auto-Removal:** Tự động tạo lệnh rút định kỳ ngày 1 và ngày 15 hàng tháng, triệt tiêu 100% rủi ro bị Amazon tiêu hủy oan.

---

## 7. MẮT XÍCH 2: PHÁP NHÂN IOR & BỘ ĐẾM CẢNH BÁO PHÍ CẢNG DEMURRAGE / DETENTION

### 3 Mô Hình Importer of Record (IOR):
1. **Foreign IOR (FIOR):** Doanh nghiệp VN đăng ký mã CAIN + Mua US Customs Continuous Bond ($50,000 bảo lãnh).
2. **DDP Forwarder Model:** Hãng giao nhận (Kerry, Flexport) đứng tên IOR trọn gói.
3. **Vexim LLC Consignee:** Pháp nhân đại diện tại Mỹ tiếp nhận hồ sơ FDA.

### Đồng Hồ Đếm Ngược Free Time Chống Phạt Demurrage:
* Cảng LAX/Long Beach cho **4 – 5 ngày Free Time**. Phí phạt quá hạn từ **$150 – $350 / container / ngày**.
* **Cơ chế Cảnh báo:** Đếm ngược từng giờ; khi còn $\le 48\text{h}$, hệ thống phát báo động đỏ hối thúc xe Drayage kéo container ra khỏi bãi cảng về kho 3PL Chino.

---

## 8. MẮT XÍCH 3: TRACKING TÀU BIỂN REAL-TIME & ĐIỀU TIẾT KHI LỆCH ETA $\ge 3$ NGÀY

```
   Vessel Tracking Webhook (MarineTraffic / Project44 / AIS Stream)
            │
            ▼ (Phát hiện bão hoặc kẹt cảng: ΔETA = ETA Mới - ETA Gốc)
            │
            ├── Nếu ΔETA ≤ 2 ngày: Trạng thái Vàng (Ghi nhận nhật ký)
            │
            └── Nếu ΔETA ≥ 3 ngày: KÍCH HOẠT KỊCH BẢN PHÒNG VỆ KHẨN CẤP:
                    ├── 1. Tự tính lại Days of Supply (DOS) toàn bộ SKU trên tàu
                    ├── 2. Kích hoạt INVENTORY_THROTTLE: Hạ 30% bid PPC để phanh nhịp bán
                    ├── 3. Bắn Lệnh Châm Hàng JIT từ kho 3PL California sang FBA
                    └── 4. Gửi thông báo khẩn cấp cập nhật tới Chủ Xưởng
```

---

## 9. MẮT XÍCH 4: QUẢN LÝ HẠN NGẠCH FBA (CAPACITY LIMITS FT³) & ĐẤU GIÁ DUNG LƯỢNG

* **Theo dõi Cubic Feet ($ft^3$):** Quản lý dung lượng Standard-size, Oversize theo chu kỳ cấp hạn ngạch của Amazon.
* **Capacity Manager Bidding Workflow:** Khi cần đẩy thêm hàng mùa Q4 mà hết hạn ngạch:
  * Nộp đề xuất giá thầu (Reservation Fee, ví dụ: *$0.15/ft^3$*).
  * **Chính sách Hoàn Tiền (Performance Credits):** Khi sản phẩm bán đạt chỉ tiêu doanh số, Amazon hoàn trả **100% chi phí đấu giá dung lượng**!

---

## 10. MẮT XÍCH 5: SỰ CỐ KỸ THUẬT, SP-API TOKEN BUCKET QUEUE & OFFLINE LABEL CACHE

```
                      HÀNG ĐỢI XỬ LÝ NGHẼN API (EXPONENTIAL BACKOFF + JITTER)
                      
     Request SP-API ──► Bị Lỗi 429 Too Many Requests
                            │
                            ▼
                     Hàng Đợi Token Bucket Queue
                            │
                            ▼ Thử lại Lần 1 (Chờ 2.4s) ➔ Lần 2 (Chờ 4.8s) ➔ Lần 3 (Chờ 9.2s)
```

* **Bộ Nhớ Đệm Tem Nhãn Offline (Offline Barcode Cache):**
  * Toàn bộ tem FNSKU (Code 128) và Box Labels được Render sẵn dạng vector PDF lưu trên cơ sở dữ liệu Supabase/PostgreSQL.
  * Ngay cả khi Amazon SP-API tại Mỹ bị sự cố kết nối, xưởng tại Việt Nam vẫn bấm in tem xuất xưởng $100\%$ bình thường!

---

## 11. MA TRẬN TRÁCH NHIỆM ĐĂNG LISTING LÊN SELLER CENTRAL (RACI MATRIX)

| Công việc cụ thể | Chủ Xưởng VN | Vexim Listing Specialist | Vexim Compliance | Ops Manager |
| :--- | :---: | :---: | :---: | :---: |
| Cung cấp thông số kỹ thuật gốc, mẫu thử, COA kiểm nghiệm | **R / A** | C | C | I |
| Nghiên cứu từ khóa (Helium10/JungleScout) & Viết Title/Bullets chuẩn SEO | I | **R** | C | A |
| Thiết kế bộ ảnh Main Image (Nền trắng RGB 255), Infographics & A+ Content | I | **R** | C | A |
| Rà soát bẫy từ khóa cấm (FDA, Pesticides, Medical claims) & Cấp mã UPC GS1 | I | C | **R** | A |
| Kiểm tra bản xem trước (Preview) & Xác nhận tính chính xác của sản phẩm | **A** | C | I | I |
| Bấm nút Xuất bản chính thức (Publish via Amazon SP-API) & Cấp mã FNSKU | I | I | I | **R / A** |

---

## 12. MA TRẬN MAPPING LIÊN PHÒNG BAN TOÀN DIỆN

```
                                  ┌─────────────────────────────┐
                                  │   VEXIM AI CENTRAL CORE     │
                                  │  (Event Bus & Task Engine)  │
                                  └──────────────┬──────────────┘
                                                 │
        ┌────────────────────────┬───────────────┴───────────────┬────────────────────────┐
        ▼                        ▼                               ▼                        ▼
┌───────────────┐        ┌───────────────┐               ┌───────────────┐        ┌───────────────┐
│ 1. PPC & ADS  │        │ 2. LISTING    │               │ 3. COMPLIANCE │        │ 4. CHỦ XƯỞNG  │
│  (Quảng Cáo)  │        │  & CRO MEDIA  │               │  & PHÁP LÝ    │        │  & TÀI CHÍNH  │
└───────┬───────┘        └───────┬───────┘               └───────┬───────┘        └───────┬───────┘
        │                        │                               │                        │
        │ ◄──────────────────────┴───────┬───────────────────────┴──────────────────────► │
        │                                │                                                │
        │                                ▼                                                │
        │                  ┌───────────────────────────┐                                  │
        └────────────────► │   5. LOGISTICS & SUPPLY   │ ◄────────────────────────────────┘
                           │   CHAIN (Ánh Nguyễn Lead) │
                           └───────────────────────────┘
```

---

### KẾT LUẬN
Hệ thống vận hành chuỗi cung ứng của Vexim đã đạt độ hoàn thiện **100% cấp độ Enterprise**:
* **Chủ xưởng Việt Nam:** Không lo về kho bãi, chỉ tập trung sản xuất và kiểm soát dòng tiền P&L.
* **Đội ngũ Vexim:** Sở hữu toàn bộ công cụ tự động hóa từ biển, bãi cảng, kho 3PL, FBA, hàng hoàn đến kỹ thuật chống nghẽn API.
