# GIÁO TRÌNH ĐÀO TẠO NỘI BỘ VEXIM GLOBAL — MODULE 01
## CẨM NANG ONBOARDING, TRIẾT LÝ VẬN HÀNH & HỆ ĐIỀU HÀNH DOANH NGHIỆP (VEXIM OS)

**Mã tài liệu:** VXM-TRN-01-EXP  
**Phiên bản:** 2.0 (Chuẩn hóa toàn diện 2026)  
**Tác giả & Phê duyệt:** Lương Văn Học (`hocluongvan88@gmail.com` — Tổng Giám Đốc Vexim Global)  
**Phạm vi áp dụng:** Toàn bộ nhân sự mới, chuyên viên, trưởng bộ phận và đối tác chiến lược của Vexim

---

## PHẦN 1: TỔNG QUAN VỀ VEXIM GLOBAL & ĐỊNH VỊ THỊ TRƯỜNG

### 1.1. Chúng ta là ai?
**Vexim Global** không phải là một đơn vị dịch vụ Marketing đơn thuần, và càng không phải là một "Agency chạy Ads thuê" ngắn hạn. 
Vexim là **Nền Tảng Tăng Tốc Xuất Khẩu Thương Hiệu Xuyên Biên Giới (Cross-Border Amazon Accelerator & Brand Enabler)**. 

Chúng ta đứng ra làm cầu nối toàn diện:
* **Đầu vào:** Hợp tác với các nhà máy, hợp tác xã sản xuất lớn của Việt Nam (sở hữu vùng nguyên liệu, chứng chỉ ISO/HACCP, sản phẩm chất lượng cao như Cacao Bến Tre, Nhang trầm Nghệ An, Thủ công mỹ nghệ tre/gỗ).
* **Vận hành:** Ứng dụng nền tảng công nghệ Vexim Platform để xử lý toàn bộ bài toán chuỗi cung ứng 47 ngày từ Cát Lái sang Long Beach, thiết lập pháp nhân Mỹ (US LLC), bảo hộ nhãn hiệu USPTO, thuật toán quảng cáo tự động và chăm sóc khách hàng bản địa.
* **Đầu ra:** Doanh thu triệu USD, lợi nhuận ròng bền vững và thương hiệu Việt Nam đứng vững trên Top 1–10 BSR Amazon Hoa Kỳ.

### 1.2. Triết lý Vận hành: "AI-Powered with Strict Human-in-the-Loop"
Tại Vexim, chúng ta ứng dụng công nghệ trí tuệ nhân tạo (Multi-Agent System) vào mọi khâu, nhưng tuân thủ **nguyên tắc bất di bất dịch**:
1. **AI là trợ thủ phân tích dữ liệu tốc độ cao (80% tự động hóa):** Quét hàng triệu từ khóa, đo lường tốc độ bán hàng, dự báo ngày đứt tồn kho FBA, phát hiện review tiêu cực.
2. **Con người là chốt chặn an toàn cuối cùng (100% quyền phê duyệt):** Mọi hành động nhạy cảm về tài chính (tăng ngân sách Ads, giảm giá bán) hoặc pháp lý (soạn đơn kháng cáo, phản hồi khiếu nại an toàn) bắt buộc phải do Trưởng bộ phận chuyên trách bấm **"Duyệt Lệnh"**. Tuyệt đối không để AI tự ý gây rủi ro cho gian hàng.

---

## PHẦN 2: BẢN ĐỒ 9 VAI TRÒ NHÂN SỰ & QUYỀN HẠN TRUY CẬP (RBAC)

Hệ thống phân quyền Role-Based Access Control (RBAC) trên cơ sở dữ liệu Supabase đảm bảo tính bảo mật và chuyên môn hóa:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                 BẢN ĐỒ PHÂN QUYỀN VÀ TRÁCH NHIỆM 9 TÀI KHOẢN TẠI VEXIM                      │
├──────────────────────────┬─────────────────────────────┬────────────────────────────────────┤
│ EMAIL ĐĂNG NHẬP          │ HỌ TÊN & VAI TRÒ CHUYÊN MÔN │ PHẠM VI TRÁCH NHIỆM & QUYỀN HẠN    │
├──────────────────────────┼─────────────────────────────┼────────────────────────────────────┤
│ 👑 hocluongvan88@gmail.com│ Lương Văn Học               │ Phê duyệt chiến lược vĩ mô, ngân   │
│                          │ (Master Super Admin / CEO)  │ sách > $50k, ký HĐ xưởng mới, P&L. │
├──────────────────────────┼─────────────────────────────┼────────────────────────────────────┤
│ ⚙️ hocluongvan25@gmail.com│ Nguyễn Tuấn Anh             │ Điều phối tổng thể các dự án xưởng,│
│                          │ (Operations Director)       │ xử lý task ách tắc, điều phối SLA. │
├──────────────────────────┼─────────────────────────────┼────────────────────────────────────┤
│ 🎯 luonghoangminh88@gmail│ Lương Hoàng Minh            │ Quản trị toàn bộ chiến dịch Ads,   │
│                          │ (PPC & Growth Lead)         │ thuật toán thu hoạch từ khóa, ACOS.│
├──────────────────────────┼─────────────────────────────┼────────────────────────────────────┤
│ 🚢 anhnguyen94@gmail.com │ Ánh Nguyễn                  │ Quản trị tồn kho FBA, chuỗi cung   │
│                          │ (Logistics & FBA Hub Lead)  │ ứng 47 ngày, kho 3PL, in tem nhãn. │
├──────────────────────────┼─────────────────────────────┼────────────────────────────────────┤
│ 🎨 hocluongvan26@gmail.com│ Trần Thu Hà                 │ Tối ưu Listing CRO, A+ Content,    │
│                          │ (Brand Experience & CS Lead)│ bóc tách Voice of Customer, CS 24h.│
├──────────────────────────┼─────────────────────────────┼────────────────────────────────────┤
│ ⚖️ hocluongvan2588@gmail │ Lê Hoàng Nam                │ Thẩm định FDA, hồ sơ FSVP/PCQI,    │
│                          │ (Compliance & Legal Counsel)│ soạn đơn kháng cáo POA, USPTO.     │
├──────────────────────────┼─────────────────────────────┼────────────────────────────────────┤
│ 💼 hocluongvan2788@gmail │ Phạm Minh Trang             │ Cầu nối với chủ xưởng, gửi báo cáo │
│                          │ (Senior Account Executive)  │ P&L tháng, xử lý thắc mắc xưởng.   │
├──────────────────────────┼─────────────────────────────┼────────────────────────────────────┤
│ 🏭 hocluongvan22@gmail.com│ Nguyễn Văn Hùng             │ Theo dõi P&L, doanh số, tồn kho của│
│                          │ (CEO Vinacacao USA Direct)  │ riêng thương hiệu Vinacacao.       │
├──────────────────────────┼─────────────────────────────┼────────────────────────────────────┤
│ 🌿 hocluongvvan33@gmail  │ Trần Thị Thu Thảo           │ Theo dõi P&L, doanh số, tồn kho của│
│                          │ (Founder Thảo Mộc An An)    │ riêng thương hiệu Thảo Mộc An An.  │
└──────────────────────────┴─────────────────────────────┴────────────────────────────────────┘
```

---

## PHẦN 3: LỘ TRÌNH 7 NGÀY ĐÀO TẠO HÒA NHẬP (7-DAY ONBOARDING SPRINT)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                 LỘ TRÌNH 7 NGÀY ĐÀO TẠO DÀNH CHO NHÂN SỰ MỚI                │
├───────────────┬─────────────────────────────────────────────────────────────┤
│ NGÀY 1        │ 🔑 KHỞI TẠO TÀI KHOẢN & KHẢO SÁT HỆ THỐNG:                  │
│               │ • Đăng nhập với mật khẩu mặc định: Anthai@88.               │
│               │ • Vào "Tài Khoản Cá Nhân" đổi mật khẩu bảo mật riêng.       │
│               │ • Khảo sát thanh Sidebar, chuông thông báo Real-time.       │
├───────────────┼─────────────────────────────────────────────────────────────┤
│ NGÀY 2        │ 📖 NGHIÊN CỨU GIÁO TRÌNH CHUYÊN MÔN:                        │
│               │ • PPC đọc Module 02; Kho vận đọc Module 03;                 │
│               │ • Brand/CS đọc Module 04; Pháp lý đọc Module 05.            │
├───────────────┼─────────────────────────────────────────────────────────────┤
│ NGÀY 3        │ 🧪 THỰC HÀNH TRÊN MÔI TRƯỜNG SANDBOX:                       │
│               │ • Thực hành lọc dữ liệu theo từng nhà cung cấp.             │
│               │ • Đọc hiểu các thẻ cảnh báo rủi ro (Critical, High, Opp).   │
├───────────────┼─────────────────────────────────────────────────────────────┤
│ NGÀY 4        │ 🤝 BẮT TAY LIÊN BỘ PHẬN (CROSS-FUNCTIONAL WORKFLOW):        │
│               │ • Học cách phối hợp giữa PPC & Kho vận khi hàng sắp hết.    │
│               │ • Học cách phối hợp giữa CS & Pháp lý khi khách khiếu nại.  │
├───────────────┼─────────────────────────────────────────────────────────────┤
│ NGÀY 5        │ 🚨 XỬ LÝ SỰ CỐ AN TOÀN & KHẨN CẤP:                          │
│               │ • Thực hành tình huống phát hiện khiếu nại dị ứng FDA/CPSC. │
│               │ • Kiểm tra quy trình ngắt AI tự động và chuyển quyền duyệt. │
├───────────────┼─────────────────────────────────────────────────────────────┤
│ NGÀY 6        │ 🖨️ THAO TÁC CÔNG CỤ THỰC TẾ:                                │
│               │ • Thực hành tạo 1 chiến dịch PPC mới.                       │
│               │ • Thực hành xuất file PDF bộ tem nhãn FNSKU & Box ID.       │
├───────────────┼─────────────────────────────────────────────────────────────┤
│ NGÀY 7        │ 🎓 ĐÁNH GIÁ SÁT HẠCH & CẤP QUYỀN LIVE:                      │
│               │ • Vượt qua bài kiểm tra 10 câu hỏi tình huống thực tế.      │
│               │ • Chính thức tiếp nhận tài khoản gian hàng thật.             │
└───────────────┴─────────────────────────────────────────────────────────────┘
```

---

## PHẦN 4: 5 ĐIỀU RĂN KỶ LUẬT VẬN HÀNH SỐNG CÒN (CARDINAL RULES)

Mọi nhân sự tại Vexim phải thuộc nằm lòng 5 điều răn sau:

1. **ĐIỀU RĂN 1 — TRIỆT TIÊU ĐỨT HÀNG (ZERO STOCK-OUT):**  
   Mất hàng trên kệ FBA đồng nghĩa với việc mất Buy Box và tụt toàn bộ thứ hạng BSR được gầy dựng trong nhiều tháng. Mọi SKU chủ lực phải luôn duy trì số ngày đủ bán $\text{Days of Supply} \ge 14\text{ ngày}$.
2. **ĐIỀU RĂN 2 — KHÔNG ĐỂ AI TỰ TRẢ LỜI SỰ CỐ Y TẾ:**  
   Khi khách hàng nhắn tin chứa các từ khóa *Dị ứng, Ngộ độc, Dị vật, Bỏng, Rách da*, hệ thống tự động khóa AI; nhân viên phải lập tức chuyển hồ sơ cho Trưởng bộ phận Pháp lý và Giám đốc Vận hành xử lý trong 2 giờ.
3. **ĐIỀU RĂN 3 — BẢO VỆ DÒNG TIỀN QUẢNG CÁO:**  
   Không bao giờ điều chỉnh giá thầu vượt trần an toàn (\$3.50/click) và không vượt quá 105% ngân sách ngày đã được cấp duyệt.
4. **ĐIỀU RĂN 4 — CHUẨN HÓA MÃ VẠCH GS1 & XÉT NGHIỆM COA TRƯỚC KHI XUẤT:**  
   Không một sản phẩm nào được phép xuất khẩu nếu chưa có mã vạch chính chủ GS1 Việt Nam (đầu số 893) và phiếu kiểm nghiệm vi sinh/kim loại nặng COA từ phòng lab đạt chuẩn ISO 17025.
5. **ĐIỀU RĂN 5 — BẢO MẬT DỮ LIỆU NHÀ XƯỞNG TUYỆT ĐỐI:**  
   Dữ liệu doanh số, biên lợi nhuận, chiến lược sản phẩm của từng nhà xưởng là tài sản tuyệt mật. Nghiêm cấm tiết lộ ra ngoài hoặc trao đổi chéo giữa các thương hiệu.
