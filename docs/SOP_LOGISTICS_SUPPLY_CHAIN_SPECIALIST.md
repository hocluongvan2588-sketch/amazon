# QUY TRÌNH VẬN HÀNH TIÊU CHUẨN (SOP)
## CHUYÊN VIÊN KHO VẬN & CHUỖI CUNG ỨNG FBA (SUPPLY CHAIN SPECIALIST)
**Mã tài liệu:** VXM-SOP-LOG-01  
**Phiên bản:** 2.0 (Cập nhật chính sách FBA Inbound Placement 2026)  
**Phòng ban áp dụng:** Team Kho Vận & Chuỗi Cung Ứng Quốc Tế Vexim  
**Người chịu trách nhiệm:** Chuyên viên Logistics (Ví dụ: Ánh Nguyễn — `anhnguyen94@gmail.com`)  
**Người phê duyệt:** Giám đốc Điều hành (Lương Văn Học — `hocluongvan88@gmail.com`)

---

## 1. MỤC TIÊU & CHỈ SỐ ĐÁNH GIÁ HIỆU SUẤT (KPIS)

### 1.1. Mục tiêu cốt lõi
1. **Triệt tiêu nguy cơ đứt hàng (Zero Stock-out):** Đảm bảo các SKU chủ lực luôn duy trì từ **30 đến 60 ngày bán hàng (Days of Supply)** trên kệ Buy Box Amazon FBA.
2. **Tối ưu chi phí Logistics:** Giảm thiểu tối đa các loại phí mới của Amazon: *Inbound Placement Fee ($0.21–$0.34/sp)*, *Aged Inventory Surcharge*, và *Storage Surcharge mùa Q4*.
3. **Minh bạch chuỗi cung ứng:** Theo dõi sát sao 5 chặng vận chuyển từ nhà xưởng tại Việt Nam sang kho 3PL California và phân bổ về các trung tâm hoàn tất đơn hàng FBA (Amazon Fulfillment Centers).

### 1.2. Bộ chỉ số KPIs định lượng của Chuyên viên Kho
| Chỉ số KPI | Mục tiêu cam kết | Ý nghĩa / Tác động kinh doanh |
| :--- | :---: | :--- |
| **Tỷ lệ có hàng trên FBA (In-Stock Rate)** | $\ge 98.5\%$ | Tránh tụt hạng Organic BSR khi mất Buy Box. |
| **Điểm sức khỏe tồn kho (Amazon IPI Score)** | $\ge 600$ điểm | Được Amazon mở rộng hạn ngạch dung tích kho FBA không giới hạn. |
| **Tỷ lệ tiết kiệm phí Inbound Placement** | $100\%$ (\$0 phí) | Tận dụng thuật toán chia kho *Multi-Location Split* của Vexim. |
| **Thời gian châm hàng JIT từ kho 3PL sang FBA** | $\le 48$ giờ | Đảm bảo hàng vào kho FBA trước khi lượng tồn khả dụng chạm ngưỡng 14 ngày. |
| **Tỷ lệ đòi bồi thường hàng thất lạc (Reimbursement)** | $100\%$ thành công | Thu hồi 100% tiền đền bù khi Amazon làm mất hoặc vỡ hàng trong kho. |

---

## 2. LỊCH TRÌNH LÀM VIỆC MẪU TRONG NGÀY (DAILY OPERATIONAL SCHEDULE)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│             LỊCH TRÌNH LÀM VIỆC HÀNG NGÀY — LOGISTICS SPECIALIST            │
├───────────────┬─────────────────────────────────────────────────────────────┤
│ 08:30 – 09:15 │ 🌅 CHECK-IN BUỔI SÁNG:                                      │
│               │ • Đăng nhập Vexim Platform -> Tab "Supply Chain Hub".       │
│               │ • Quét cảnh báo tồn kho: SKU nào Days of Supply < 21 ngày?  │
│               │ • Kiểm tra Amazon Seller Central -> "Manage FBA Inventory". │
├───────────────┼─────────────────────────────────────────────────────────────┤
│ 09:15 – 10:30 │ 🚢 THEO DÕI TÀU BIỂN & HẢI QUAN MỸ:                         │
│               │ • Cập nhật vị trí container trên biển (Tracking Bill).       │
│               │ • Kiểm tra tình trạng thông quan FDA Prior Notice & CBP.    │
│               │ • Báo cáo độ trễ nghẽn cảng (Port Congestion Matrix).       │
├───────────────┼─────────────────────────────────────────────────────────────┤
│ 10:30 – 12:00 │ 📦 LẬP KẾ HOẠCH INBOUND & PO XƯỞNG VN:                      │
│               │ • Dùng "Geo-FBA Placement Calculator" tính điểm chia kho.   │
│               │ • Gửi lệnh sản xuất PO bổ sung cho các xưởng VN (Vinacacao, │
│               │   An An...) theo đúng tiến độ Lead-Time.                    │
├───────────────┼─────────────────────────────────────────────────────────────┤
│ 13:30 – 15:00 │ 🏬 ĐIỀU PHỐI KHO ĐỆM 3PL CALIFORNIA:                        │
│               │ • Tạo lệnh xuất pallet JIT từ kho 3PL về kho ONT8 / TEB9.   │
│               │ • Xác nhận lịch hẹn giao hàng (Carrier Appointment / BOL).  │
├───────────────┼─────────────────────────────────────────────────────────────┤
│ 15:00 – 16:30 │ ⚖️ ĐỐI SOÁT & KHIẾU NẠI ĐỀN BÙ FBA:                         │
│               │ • Kiểm tra các lô hàng FBA Receiving quá 14 ngày.           │
│               │ • Mở Case đền bù (Reimbursement Claim) cho hàng thất lạc.   │
├───────────────┼─────────────────────────────────────────────────────────────┤
│ 16:30 – 17:30 │ 📊 BÁO CÁO CUỐI NGÀY & BẮT TAY VỚI TEAM PPC:                │
│               │ • Cập nhật danh sách SKU sắp hết hàng cho nhân sự PPC để    │
│               │   hạ giá thầu Ads bảo vệ kho (Inventory-PPC Handshake).     │
└───────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 3. CÁC QUY TRÌNH CHI TIẾT (STEP-BY-STEP SOPS)

---

### 📦 SOP 01: GIÁM SÁT TỒN KHO & CẢNH BÁO ĐỨT HÀNG (DAILY FBA INVENTORY CHECK)

#### Mục đích:
Phát hiện sớm ít nhất **35 ngày** trước khi sản phẩm bị đứt hàng để kịp thời điều phối hàng từ xưởng VN hoặc kho 3PL.

#### Các bước thực hiện:
1. **Bước 1:** Đăng nhập Vexim Platform $\rightarrow$ Vào menu **"Tồn kho FBA & 3PL"** (hoặc tab *Supply Chain Hub*).
2. **Bước 2:** Lọc danh sách theo cột **Days of Supply (Số ngày đủ bán)**:
   $$\text{Days of Supply} = \frac{\text{FBA Available Units}}{\text{Daily Velocity 7d}}$$
3. **Bước 3:** Phân loại và kích hoạt hành động theo 4 cấp độ cảnh báo:
   * 🔴 **Cấp độ 1: NGUY CẤP (Days of Supply $\le 14$ ngày):**
     * **Hành động:** Kích hoạt ngay lệnh xuất kho đệm 3PL California qua hình thức vận chuyển LTL (Less-Than-Truckload) chuyển gấp vào Amazon FBA trong 48 giờ.
     * **Bắt tay PPC:** Thông báo cho chuyên viên PPC (`luonghoangminh88@gmail.com`) kích hoạt luật `INVENTORY_THROTTLE` để giảm 30% ngân sách quảng cáo từ khóa Generic.
   * 🟡 **Cấp độ 2: CẦN CHÂM HÀNG (15 $\le$ Days of Supply $\le 30$ ngày):**
     * **Hành động:** Lập phiếu tạo lô hàng FBA Inbound mới trên Vexim Platform.
   * 🟢 **Cấp độ 3: LÝ TƯỞNG (31 $\le$ Days of Supply $\le 60$ ngày):**
     * **Hành động:** Trạng thái an toàn, tiếp tục theo dõi biến động tốc độ bán hàng.
   * 🔵 **Cấp độ 4: THỪA TỒN KHO (Days of Supply $> 90$ ngày):**
     * **Hành động:** Cảnh báo nguy cơ dính phí phạt lưu kho quá hạn (*Aged Inventory Surcharge*). Yêu cầu team Marketing chạy Flash Sale/Coupon 15% để giải phóng hàng.

---

### 🚢 SOP 02: LẬP KẾ HOẠCH & ĐẶT HÀNG SẢN XUẤT XƯỞNG VIỆT NAM (PO PLANNING)

#### Mục đích:
Tính toán chính xác số lượng và ngày xưởng cần hoàn thành xuất xưởng dựa trên **Ma trận Dynamic Lead-Time**.

#### Công thức tính lượng hàng cần đặt (Recommended PO Qty):
$$\text{Reorder Point (ROP)} = (\text{Total Lead Time} \times \text{Daily Velocity}) + \text{Safety Stock}$$
*Trong đó:*
* $\text{Total Lead Time}$ = Sản xuất xưởng (14d) + Tàu biển (22d) + Hải quan (4d) + Xe kéo Drayage (2d) + Amazon FC Check-in (5d) = **47 ngày**.
* $\text{Safety Stock}$ = 14 ngày bán hàng dự phòng.

#### Các bước thực hiện:
1. **Bước 1:** Trên giao diện Vexim *Supply Chain Hub*, kiểm tra dự báo thời tiết và tắc cảng Cát Lái / Los Angeles mùa Q4.
2. **Bước 2:** Nhấn nút **"Tạo Đề Xuất Đặt Hàng (PO Proposal)"**:
   * Hệ thống tự động điền: Mã SKU, Số lượng đề xuất (Ví dụ: 3,000 units), Ngày xưởng phải đóng xong hàng (Ex-factory Date).
3. **Bước 3:** Gửi phiếu PO cho Giám đốc Điều hành (`hocluongvan88@gmail.com`) duyệt ký số.
4. **Bước 4:** Gửi lệnh PO chính thức kèm file nhãn thùng (Outer Carton Label) và nhãn mã vạch sản phẩm (FNSKU Barcode) cho Giám đốc nhà xưởng VN (Ví dụ: anh Hùng Vinacacao).

---

### 🗺️ SOP 03: TỐI ƯU PHÂN BỔ KHO GEO-FBA & TRIỆT TIÊU PHÍ INBOUND PLACEMENT 2026

#### Mục đích:
Áp dụng thuật toán chia kho **Multi-Location Split** của Amazon để được **miễn 100% phí Inbound Placement Service Fee**, tiết kiệm \$840 – \$2,500 cho mỗi container.

#### Các bước thực hiện:
1. **Bước 1:** Đăng nhập Seller Central $\rightarrow$ *Inventory* $\rightarrow$ *Shipments* $\rightarrow$ *Send to Amazon* (hoặc thao tác trực tiếp qua Vexim SP-API).
2. **Bước 2:** Nhập danh sách SKU và số lượng thùng (Boxes).
3. **Bước 3:** Tại bước **Inbound Placement Options**, hệ thống Vexim sẽ hiển thị bảng so sánh tài chính:
   * *Phương án A (Minimal Splits - Gửi 1 kho duy nhất):* Phí Amazon thu: **\$0.28 / unit** $\rightarrow$ Tổng phí mất: **\$840**.
   * *Phương án B (Partial / Amazon-Optimized Split - Chia 2 kho):* Phí Amazon thu: **\$0.00 / unit** $\rightarrow$ **Tiết kiệm \$840**.
4. **Bước 4:** Chọn **Phương án B** với phân bổ chuẩn:
   * **60% Lô hàng (1,800 units):** Đi kho Bờ Tây `ONT8` (Moreno Valley, California).
   * **40% Lô hàng (1,200 units):** Đi kho Bờ Đông `TEB9` (Somerset, New Jersey).
5. **Bước 5:** Tải bộ tem nhãn FBA Box ID Labels và cấp cho Forwarder dán lên từng pallet trước khi bàn giao cho hãng vận chuyển nội địa Mỹ (UPS / Freight Carrier).

---

### 📑 SOP 04: THỦ TỤC HẢI QUAN MỸ & KHAI BÁO FDA PRIOR NOTICE

#### Mục đích:
Đảm bảo container thông quan tại cảng Los Angeles / New York trong vòng **72 giờ**, không bị giữ kiểm hóa (Customs Exam Hold).

#### Danh mục hồ sơ bắt buộc chuẩn bị trước khi tàu cập cảng 5 ngày:
1. **Commercial Invoice & Packing List:** Ghi rõ xuất xứ Việt Nam (Made in Vietnam), mã HS Code chính xác.
2. **Bill of Lading (Vận đơn đường biển gốc / Sea Waybill).**
3. **FDA Prior Notice Confirmation Number:** Khai báo điện tử trên cổng FDA cho các mặt hàng thực phẩm (Socola, Cacao, Hạt điều).
4. **Certificate of Analysis (COA):** Phiếu kiểm nghiệm vi sinh và kim loại nặng đạt chuẩn FDA Mỹ.

#### Các bước thực hiện:
1. **Bước 1:** Theo dõi hành trình tàu trên phần mềm vệ tinh. Khi tàu cách bờ biển California 5 ngày, liên hệ đơn vị Hải quan Broker tại Mỹ.
2. **Bước 2:** Truyền mã số **FDA Prior Notice** và nộp hồ sơ điện tử ISF (Importer Security Filing - 10+2).
3. **Bước 3:** Giám sát trạng thái thông quan CBP (U.S. Customs and Border Protection):
   * Nếu có cờ vàng `FDA HOLD`: Lập tức cung cấp bản scan COA có đóng dấu nhà máy cho cơ quan hải quan để giải phóng container trong 24 giờ.

---

### 🏬 SOP 05: ĐIỀU PHỐI KHO ĐỆM 3PL CALIFORNIA & CHÂM HÀNG JIT (JUST-IN-TIME)

#### Mục đích:
Sử dụng kho đệm ngoại quan tại Chino/Ontario (California) với chi phí lưu kho rẻ hơn **65%** so với kho Amazon Q4, sau đó châm từng đợt nhỏ vào kho FBA.

#### Các bước thực hiện:
1. **Bước 1:** Khi tàu cập cảng Long Beach, điều xe kéo (Drayage Truck) kéo container về kho đối tác 3PL của Vexim tại California.
2. **Bước 2:** Kho 3PL kiểm đếm số thùng, phân loại theo Pallet chuẩn Amazon (Kích thước Pallet: $40 \times 48$ inches, chiều cao $\le 72$ inches, quấn màng co trong suốt).
3. **Bước 3 (Lệnh châm hàng định kỳ):** Mỗi thứ Hai hàng tuần, chuyên viên kho kiểm tra Days of Supply của kho FBA:
   * Nếu SKU nào còn dưới 20 ngày bán $\rightarrow$ Tạo lệnh xuất kho 3PL chuyển **2–4 Pallet (khoảng 800–1,200 units)** vào kho FBA gần nhất qua dịch vụ Amazon Partnered Carrier (UPS LTL).
4. **Bước 4:** Theo dõi số vận đơn PRO Number / Bill of Lading cho đến khi Amazon báo trạng thái `RECEIVING`.

---

### ⚖️ SOP 06: ĐỐI SOÁT & KHIẾU NẠI ĐỀN BÙ HÀNG THẤT LẠC (FBA REIMBURSEMENT)

#### Mục đích:
Thu hồi 100% giá trị tiền mặt khi Amazon kiểm đếm thiếu hoặc làm thất lạc/hư hỏng hàng trong quá trình lưu kho.

#### Các bước thực hiện:
1. **Bước 1:** Vào *Seller Central* $\rightarrow$ *Shipments* $\rightarrow$ Lọc các lô hàng có trạng thái `CLOSED`.
2. **Bước 2:** Mở tab **"Contents"** để so sánh:
   * `Units Expected` (Số lượng gửi đi): 3,000 units.
   * `Units Located` (Số lượng Amazon đếm được): 2,940 units.
   * $\rightarrow$ **Thiếu 60 units (Lệch \$1,499.40 giá trị hàng).**
3. **Bước 3:** Đợi qua thời hạn đối soát tự động của Amazon (sau 14 ngày kể từ ngày đóng lô hàng).
4. **Bước 4:** Nhấn nút **"Submit Claim"** (Mở Case bồi thường) và tải lên các bằng chứng:
   * Bản sao Hóa đơn xuất xưởng (Proof of Ownership).
   * Vận đơn Bill of Lading có chữ ký xác nhận nhận đủ hàng của tài xế Amazon (*Stamped BOL*).
5. **Bước 5:** Theo dõi phản hồi trong vòng 5 ngày làm việc để nhận tiền đền bù trực tiếp vào tài khoản thanh toán của gian hàng.

---

## 4. MA TRẬN XỬ LÝ SỰ CỐ KHẨN CẤP (EMERGENCY EXCEPTION MATRIX)

| Tình huống sự cố | Mức độ rủi ro | Hành động xử lý khẩn cấp của Chuyên viên Kho | Người cần báo cáo |
| :--- | :---: | :--- | :---: |
| **Tàu biển bị hoãn do bão / Kẹt cảng > 10 ngày** | 🔴 CAO | • Tạo lô hàng Air Express 200 units bay thẳng từ Tân Sơn Nhất sang kho FBA trong 5 ngày để cứu nguy Buy Box.<br>• Yêu cầu team PPC hạ bid từ khóa phụ. | Ops Director (`hocluongvan25@gmail.com`) |
| **Amazon từ chối tiếp nhận hàng tại cổng FC (Refusal at Dock)** | 🔴 CAO | • Kiểm tra lại lịch hẹn Carrier Appointment.<br>• Yêu cầu tài xế xe kéo drayage quay về kho 3PL kiểm tra lại tem Pallet và dán lại nhãn đúng quy chuẩn Amazon. | Super Admin (`hocluongvan88@gmail.com`) |
| **Hàng bị FDA giữ kiểm tra ngẫu nhiên (FDA Hold)** | 🟡 TRUNG BÌNH | • Gửi hồ sơ COA, chứng chỉ ISO 22000 / HACCP của nhà máy cho Hải quan Broker.<br>• Phối hợp với Chuyên viên Pháp lý (`hocluongvan2588@gmail.com`) xử lý. | Legal Lead |
| **Tồn kho quá hạn 90 ngày (Nguy cơ Aged Surcharge)** | 🟡 TRUNG BÌNH | • Báo cáo cho Account Executive để xin ý kiến chủ xưởng chạy chương trình Khuyến mãi 20% hoặc tạo lệnh Removal Order đưa về kho 3PL lưu giá rẻ. | Account Executive (`hocluongvan2788@gmail.com`) |

---

## 5. CHECKLIST KIỂM TRA TRƯỚC KHI XUẤT HÀNG (PRE-SHIPMENT CHECKLIST)

Trước khi cho container lăn bánh rời khỏi cổng nhà xưởng tại Việt Nam, Chuyên viên Kho phải xác nhận đủ **7 tiêu chí vàng**:

- [ ] **1. Nhãn Barcode FNSKU:** Được in rõ nét (độ phân giải $\ge 300\text{ DPI}$), dán phẳng trên bề mặt phẳng của từng hộp sản phẩm, che hoàn toàn mã vạch UPC gốc.
- [ ] **2. Nhãn Thùng Carton FBA Box Label:** Mỗi thùng carton dán đủ 2 nhãn (FBA Shipment Label + Box ID Label) ở 2 góc khác nhau.
- [ ] **3. Quy cách Thùng Carton:** Trọng lượng mỗi thùng không vượt quá **50 lbs (22.6 kg)**; kích thước cạnh dài nhất không quá **25 inches (63.5 cm)**.
- [ ] **4. Giấy tờ An toàn:** Có sẵn bản in COA và Hóa đơn VAT đóng mộc đỏ của nhà sản xuất.
- [ ] **5. Khai báo Prior Notice:** Đã nhận được mã xác nhận hợp lệ từ FDA Hoa Kỳ.
- [ ] **6. Kế hoạch Phân Bổ Kho:** Đã chốt phương án Inbound Split trên Vexim Platform để đạt mức phí **\$0.00**.
- [ ] **7. Thông báo cho Kho 3PL:** Đã gửi thông báo trước (Pre-Alert Email) kèm Packing List cho quản lý kho 3PL tại California để sẵn sàng tiếp nhận dỡ hàng.

---

### ✍️ KÝ DUYỆT BAN HÀNH QUY TRÌNH

* **Người soạn thảo:** Ánh Nguyễn *(Chuyên viên Kho Vận & Chuỗi Cung Ứng FBA)*  
* **Người kiểm duyệt:** Nguyễn Tuấn Anh *(Giám đốc Quản Trị Vận Hành)*  
* **Người phê duyệt tối cao:** Lương Văn Học *(Tổng Giám Đốc Điều Hành Vexim Global)*
