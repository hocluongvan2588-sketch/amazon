# TÀI LIỆU ĐÀO TẠO NỘI BỘ VEXIM — MODULE 01
## CẨM NANG ONBOARDING & HỆ THỐNG VẬN HÀNH VEXIM GLOBAL (VEXIM OS)

**Mã tài liệu:** VXM-TRN-01  
**Đối tượng:** Toàn bộ Nhân viên mới, Chuyên viên & Trưởng bộ phận Vexim  
**Chủ quản ban hành:** Ban Giám Đốc Vexim Global (`hocluongvan88@gmail.com`)  
**Phiên bản:** 2.0 (Chuẩn hóa 2026)

---

## 1. SỨ MỆNH & TRIẾT LÝ VẬN HÀNH CỦA VEXIM

### 1.1. Sứ mệnh cốt lõi
Vexim không phải là một "Agency chạy quảng cáo thuê" hay đơn vị dịch vụ thông thường. Vexim là **"Nền tảng Tăng tốc Thương hiệu Xuất khẩu Toàn diện (Amazon Accelerator & Full-Service Enabler)"**, đồng hành cùng các nhà sản xuất hàng đầu Việt Nam (Vinacacao, Thảo Mộc An An, Lotus Craft...) để xây dựng tài sản thương hiệu triệu đô bền vững trên thị trường Mỹ.

### 1.2. Triết lý Vận hành: "AI-Powered with Strict Human-in-the-Loop"
* **80% Tác vụ dữ liệu được Tự Động Hóa:** Thuật toán AI liên tục quét tồn kho FBA, bóc tách từ khóa tìm kiếm (Search Term Harvesting), theo dõi thời gian tàu biển và phát hiện rủi ro pháp lý.
* **100% Quyết định Tài chính & Pháp lý do Con Người Phê Duyệt:** AI chỉ tạo ra Đề xuất (Proposals). Các Trưởng bộ phận chuyên môn và Tổng Giám Đốc là người trực tiếp bấm **"Duyệt Lệnh"** trước khi hệ thống bắn API sang Amazon.

---

## 2. BẢN ĐỒ 9 TÀI KHOẢN NHÂN SỰ & PHÂN QUYỀN TRUY CẬP (RBAC)

Hệ thống phân chia quyền hạn truy cập nghiêm ngặt để đảm bảo an toàn dữ liệu và tối ưu không gian làm việc:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                 BẢN ĐỒ 9 TÀI KHOẢN & PHÂN HỆ LÀM VIỆC TẠI VEXIM             │
├──────────────────────────┬─────────────────────────────┬────────────────────┤
│ EMAIL ĐĂNG NHẬP          │ HỌ TÊN & CHỨC DANH          │ PHÂN HỆ LÀM VIỆC   │
├──────────────────────────┼─────────────────────────────┼────────────────────┤
│ hocluongvan88@gmail.com  │ Lương Văn Học (Super Admin) │ Bàn Tổng Giám Đốc  │
│ hocluongvan25@gmail.com  │ Nguyễn Tuấn Anh (Ops Lead)  │ Quản Trị Vận Hành  │
│ luonghoangminh88@gmail.co│ Lương Hoàng Minh (PPC Lead) │ PPC & Growth Desk  │
│ anhnguyen94@gmail.com    │ Ánh Nguyễn (Logistics Lead) │ Supply Chain & FBA │
│ hocluongvan26@gmail.com  │ Trần Thu Hà (Brand & CX)    │ Brand Intel & CS   │
│ hocluongvan2588@gmail.com│ Lê Hoàng Nam (Legal Lead)   │ Compliance & POA   │
│ hocluongvan2788@gmail.com│ Phạm Minh Trang (Senior AE) │ Client Success     │
│ hocluongvan22@gmail.com  │ Nguyễn Văn Hùng (Vinacacao) │ Cổng Chủ Xưởng VN  │
│ hocluongvvan33@gmail.com │ Trần Thị Thu Thảo (An An)   │ Cổng Chủ Xưởng VN  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. LỊCH TRÌNH 7 NGÀY ĐẦU TIÊN CỦA NHÂN SỰ MỚI (7-DAY ONBOARDING ROADMAP)

* **Ngày 1 (Nhận tài khoản & Khảo sát hệ thống):**
  * Đăng nhập vào nền tảng Vexim với email được cấp và mật khẩu mặc định: `Anthai@88`.
  * Vào menu **"Tài Khoản Cá Nhân"** để đổi mật khẩu bảo mật của riêng bạn.
  * Làm quen với thanh điều hướng Sidebar và chuông thông báo Real-time trên TopHeader.
* **Ngày 2 (Học nghiệp vụ bộ phận):**
  * Đọc kỹ Module đào tạo chuyên môn của bộ phận mình (PPC, Kho vận, Brand, hoặc Pháp lý).
* **Ngày 3 (Thao tác trên Sandbox Data):**
  * Thực hành duyệt các đề xuất AI mẫu, lọc dữ liệu theo từng nhà cung cấp (Vinacacao, An An, Lotus Craft).
* **Ngày 4 (Nghiệp vụ Phối hợp Liên phòng ban):**
  * Học cơ chế bắt tay giữa PPC & Kho vận (Inventory-PPC Handshake): Khi nào hạ Bid để bảo vệ kho?
* **Ngày 5 (Quy chuẩn An toàn & Escalate sự cố):**
  * Nắm vững quy trình khóa AI tự động khi gặp từ khóa khiếu nại dị ứng/pháp lý CPSC/FDA.
* **Ngày 6 (Thực hành In Tem Nhãn & Tạo Chiến Dịch):**
  * Thao tác xuất file PDF tem nhãn FNSKU và Box ID chuẩn 300 DPI.
* **Ngày 7 (Đánh giá sát hạch đầu vào):**
  * Hoàn thành bài kiểm tra 10 câu hỏi nghiệp vụ cùng Trưởng bộ phận.

---

## 4. 5 ĐIỀU RĂN KỶ LUẬT VẬN HÀNH TẠI VEXIM (CARDINAL RULES)

1. **Tuyệt đối không để xảy ra tình trạng Đứt hàng FBA (Zero Stock-out):** Mọi SKU chủ lực phải luôn duy trì $\ge 14$ ngày Days of Supply.
2. **Tuyệt đối không để AI tự ý trả lời tin nhắn y tế/chấn thương:** Phải chuyển ngay cho Chuyên viên Pháp lý và Quản lý Vận hành trong 2 giờ.
3. **Tuyệt đối không tăng giá thầu hoặc ngân sách vượt hạn mức an toàn:** Trần ngân sách ngày và trần CPC \$3.50 phải luôn được tôn trọng.
4. **Tuyệt đối không nộp hồ sơ Amazon nếu chưa có kiểm tra GS1 & COA:** Không đẩy sản phẩm vi phạm bản quyền hoặc thiếu xét nghiệm vi sinh.
5. **Bảo mật dữ liệu nhà xưởng 100%:** Nghiêm cấm chia sẻ doanh số, P&L của nhà xưởng này cho nhà xưởng khác.
