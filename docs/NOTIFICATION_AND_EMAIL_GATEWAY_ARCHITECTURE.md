# KIẾN TRÚC HỆ THỐNG THÔNG BÁO REAL-TIME & EMAIL GATEWAY
## CƠ CHẾ CẢNH BÁO ĐA KÊNH CHO HỆ THỐNG QUẢN TRỊ AMAZON VEXIM PLATFORM

**Mã tài liệu:** VXM-NOTIF-EMAIL-2026  
**Chủ quản hệ thống:** Vexim Global Amazon Operations Platform  
**Phiên bản:** 2.0 (Tích hợp WebSocket In-App + AWS SES / Resend Email Dispatcher)

---

## 1. TỔNG QUAN KIẾN TRÚC THÔNG BÁO ĐA KÊNH (OMNI-CHANNEL ALERTING)

Hệ thống thông báo của Vexim được xây dựng theo mô hình **3 Tầng Báo Động (3-Tier Escalation Architecture)**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                 KIẾN TRÚC HỆ THỐNG THÔNG BÁO VEXIM PLATFORM                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🔔 TẦNG 1: IN-APP REALTIME NOTIFICATION (Chuông thông báo & Toast Dropdown) │
│    • Hiển thị trực tiếp trên thanh TopHeader (biểu tượng Chuông + Badge Đỏ) │
│    • Phân loại theo 5 loại sự kiện: Cực khẩn cấp, Tồn kho, Pháp lý, PPC, Tàu│
│    • 1-Click chuyển hướng thẳng đến đúng phân hệ cần xử lý.                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📧 TẦNG 2: EMAIL DISPATCHER GATEWAY (AWS SES / Resend API)                  │
│    • Gửi Email cảnh báo tự động tới đúng nhân sự phụ trách khi xảy ra sự cố.│
│    • Gửi Báo cáo tài chính P&L định kỳ hàng tháng cho Giám đốc Nhà xưởng VN.│
│    • Gửi Daily Executive Morning Digest (08:30 sáng) cho Tổng Giám Đốc.     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📱 TẦNG 3: TELEGRAM / SMS CRITICAL ESCALATION (Cảnh báo Sự cố Cực Khẩn)    │
│    • Chỉ kích hoạt khi: Phát hiện khiếu nại CPSC/FDA hoặc Tài khoản bị dính │
│      cờ đỏ Amazon Account Health Rating (AHR < 200).                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. CHI TIẾT 4 KỊCH BẢN GỬI EMAIL TỰ ĐỘNG CHUẨN DOANH NGHIỆP

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                 4 KỊCH BẢN GỬI EMAIL TỰ ĐỘNG CỦA HỆ THỐNG                   │
├──────────────────────────┬─────────────────────────────┬────────────────────┤
│ LOẠI EMAIL TỰ ĐỘNG       │ NGƯỜI NHẬN                  │ ĐIỀU KIỆN KÍCH HOẠT│
├──────────────────────────┼─────────────────────────────┼────────────────────┤
│ 1. 🚨 Critical Safety &  │ • Giám đốc Vận hành (Tuấn   │ Khách gửi tin nhắn │
│    FDA Escalation Email  │   Anh) & Legal Lead (Nam)   │ có từ khóa chấn    │
│                          │ • CC: Super Admin (Học)     │ thương, dị ứng, CPSC│
├──────────────────────────┼─────────────────────────────┼────────────────────┤
│ 2. 🔴 FBA Low Stock &    │ • Logistics Lead (Ánh)      │ Days of Supply của │
│    Reorder Trigger Email │ • Giám đốc Xưởng Việt Nam   │ SKU chủ lực < 14d  │
├──────────────────────────┼─────────────────────────────┼────────────────────┤
│ 3. 💵 Monthly P&L        │ • Chủ xưởng Việt Nam        │ Ngày 01 hàng tháng │
│    Financial Statement   │   (Hùng Vinacacao, Thảo An) │ (Báo cáo doanh số, │
│                          │ • CC: Super Admin           │ phí sàn, lãi ròng) │
├──────────────────────────┼─────────────────────────────┼────────────────────┤
│ 4. 🌅 Daily Morning      │ • Super Admin / CEO         │ Đúng 08:30 sáng mỗi│
│    Executive Briefing    │   (`hocluongvan88@gmail.com`)│ ngày (Tóm tắt 3 chỉ│
│                          │                             │ số quan trọng nhất)│
└──────────────────────────┴─────────────────────────────┴────────────────────┘
```

---

## 3. MẪU EMAIL THỰC TẾ GỬI TỚI NHÀ XƯỞNG & LÃNH ĐẠO

### Mẫu 1: Email Báo Cáo Tài Chính Hàng Tháng Cho Chủ Xưởng (Vinacacao)
* **Tiêu đề:** `[Vexim Financial] Báo cáo Doanh thu & Lợi nhuận Ròng Tháng 08/2026 — Vinacacao USA Direct`
* **Nội dung:**
  * Tổng doanh thu Amazon US: **\$68,420 USD** (+18.4%)
  * Chi phí FBA & Phí sàn Amazon: \$22,578 USD (33%)
  * Chi phí Quảng cáo PPC (ACOS 23.9%): \$9,850 USD
  * **LỢI NHUẬN RÒNG CHUYỂN VỀ TÀI KHOẢN XƯỞNG:** **\$28,140 USD (Tương đương ~712 Triệu VNĐ)**.

### Mẫu 2: Email Cảnh Báo An Toàn Khẩn Cấp (Lotus Craft)
* **Tiêu đề:** `[CRITICAL SAFETY] Khóa AI Tự Động & Kích Hoạt Quy Trình Xử Lý Khiếu Nại Dị Vật #LC26-04`
* **Nội dung:**
  * Khách hàng Mỹ gửi tin nhắn lúc 08:18 thông báo dằm ống hút tre làm xước môi trẻ nhỏ.
  * AI đã lập tức ngắt cổng trả lời tự động để tránh phát ngôn sai luật.
  * Yêu cầu Giám đốc Vận hành liên hệ chăm sóc khách hàng trực tiếp trong vòng 2 giờ.

---

## 4. TÍCH HỢP TRÊN MÔI TRƯỜNG PRODUCTION THỰC TẾ

1. **Email Service Provider:** Sử dụng **AWS Simple Email Service (SES)** hoặc **Resend API** với tên miền gửi xác thực DKIM/SPF: `notifications@vexim.global`.
2. **In-App Real-time Push:** Sử dụng **Supabase Realtime (PostgreSQL Listen/Notify over WebSocket)** đẩy thông báo tới chuông `TopHeader` trong vòng $\le 200\text{ms}$ khi Amazon SP-API phát sinh sự kiện mới.
