# KẾT QUẢ KIỂM TRA CÁC TRANG NHÓM BRAND, LISTING & CS (2026-09-09)

> Phạm vi: các trang anh gửi — Brand Intel & CRO Desk, Tối Ưu Listing & SEO,
> Sản Phẩm & Tiếp Nhận, Chăm Sóc Khách Hàng (Inbox), Nhiệm Vụ Content & CS,
> Giáo Trình Brand & CS (Module 04), Thông Tin Cá Nhân & MK, nhãn "Amazon US
> (SP-API Live)", badge "2 CVR Gap" / "Khẩn".
> Build pass sau mọi sửa đổi; kết quả test theo từng mục.

---

## 1. Kết luận nhanh

| Trang / Thành phần | Chạy được? | Nội dung | Phát hiện & đã xử lý |
|---|---|---|---|
| Nhãn **"Amazon US (SP-API Live)"** (TopHeader) | ✅ | — | ❌→✅ **ĐÃ SỬA**: hardcode "US Live" trong khi SP-API đang SIMULATED → giờ badge ĐỘNG theo `/api/amazon/sync`: đang hiện "Mô Phỏng (Chưa Kết Nối)" màu vàng, tự chuyển "US Live" xanh khi có credentials |
| **Brand Intel & CRO Desk** | ✅ | Mock (reverse-ASIN demo) | ❌→✅ **ĐÃ SỬA**: con số "+$7,460/tháng" hardcode → giờ tính động từ `estimatedRevenueUpliftMonthly` của diagnostics |
| Badge **"2 CVR Gap"** (Sidebar) | ✅ | — | ❌→✅ **ĐÃ SỬA**: hardcode chuỗi "2" → giờ đếm động `conversionDiagnostics.length` (hiện đúng 2, tự cập nhật khi dữ liệu đổi) |
| **Tối Ưu Listing & SEO** | ✅ | Mock + ENGINE THẬT | ✅ Tốt: đã có engine Sprint 3.2 (chấm 100 điểm thật, UTF-8 249 bytes, keyword gap) tích hợp ngay đầu trang |
| **Sản Phẩm & Tiếp Nhận** | ✅ | DB khi LIVE / mock khi trống | ⚠️ Gap đã ghi nhận: ở chế độ DB, `documents`/`complianceIssues` map về `[]` (bảng `product_documents` có schema nhưng chưa hydrate) → tab hồ sơ hiện (0). Không crash (`readinessScore` có default an toàn) |
| **Chăm Sóc Khách Hàng (Inbox)** | ✅ | Mock (chưa nối DB `customer_inquiries`) | ✅ Phân loại SAFETY_CRITICAL/COMPLIANT/REFUND hoạt động, AI draft + gửi reply lưu localStorage |
| Badge **"Khẩn"** | ✅ | Động | ✅ Đã động từ trước (`criticalSafetyMessages > 0`) |
| Badge **"Nhiệm Vụ Content & CS (2)"** | ✅ | Động | ✅ Đã động từ trước (`openTasksCount`) |
| **Giáo Trình Brand & CS — Module 04** | ✅ | **Đầy đủ** | ✅ Module 04 tồn tại với nội dung dày: Title Formula, 5 Bullets chuẩn, Safety Gate CS. ❌→✅ **ĐÃ SỬA UX**: trước đây cả 3 nút "Giáo Trình" (PPC/Kho/Brand) đều mở Module 01 → giờ tự mở đúng module theo không gian làm việc (Brand&CS→04, PPC→02, Kho→03) |
| **Thông Tin Cá Nhân & MK** | ✅ | DB (users) | 🔴→✅ **ĐÃ SỬA BẢO MẬT** (chi tiết mục 2) |

## 2. Phát hiện bảo mật nghiêm trọng — ĐÃ XỬ LÝ TOÀN BỘ

Rà soát nhóm trang này phát hiện mật khẩu thật bị lộ tại **5 vị trí** trong JS bundle client:

| Vị trí | Vấn đề | Đã sửa |
|---|---|---|
| `mock-data.ts` ×9 | `'Anthai@88'` plaintext cho 9 tài khoản | ✅ Mask `'••••••••'` |
| `state-context.login()` | Chấp nhận **2 mật khẩu cứng** (`Anthai@88` + backdoor `admin123`) | ✅ Chỉ còn `DEMO_PASSWORD` từ `lib/auth-constants.ts` (1 nguồn duy nhất, override được bằng `NEXT_PUBLIC_DEMO_PASSWORD`) |
| `state-context.login()` | Toast lỗi **in luôn mật khẩu**: "Mật khẩu chuẩn: Anthai@88" | ✅ Chỉ còn "Email hoặc mật khẩu không chính xác." |
| `LoginScreen` | **Tự điền sẵn mật khẩu thật** vào form khi mở trang | ✅ Form rỗng + nút "Điền mật khẩu demo" (lấy từ constants) |
| `UserProfileAccount` + `MasterAdminControlCenter` | So sánh/prefill literal `'Anthai@88'` | ✅ Dùng `DEMO_PASSWORD` / bỏ prefill |

**Lưu ý trung thực:** đăng nhập hiện tại vẫn là demo phía client (bundle luôn nhìn thấy được `NEXT_PUBLIC_*`). Bảo mật production thật = Supabase Auth + RLS như runbook go-live đã hướng dẫn — bước này chỉ loại việc mật khẩu nằm rải rác công khai trong code.

## 3. Nội dung còn thiếu (đã lập kế hoạch Giai đoạn 4 — chưa chặn vận hành)

1. **Reverse ASIN / Market Radar** (Brand Intel): dữ liệu vẫn demo — cần Amazon Brand Analytics (AQ Search Terms) hoặc API bên thứ 3 (Helium10/JungleScout) để có số thật.
2. **Hồ sơ & chứng chỉ sản phẩm** ở chế độ DB: hydrate bảng `product_documents` + `product_compliance` như đã làm với inventory/orders.
3. **Inbox khách hàng**: nối bảng `customer_inquiries` (schema sẵn) + đồng bộ Customer Service API của Amazon.
4. **Đổi mật khẩu thật**: qua Supabase Auth (`auth.updateUser`), thay flow client-side hiện tại.

## 4. Danh sách file sửa trong đợt này

- `components/TopHeader.tsx` — badge SP-API động (LIVE/SIMULATED/CHECKING)
- `components/Sidebar.tsx` — badge CVR Gap động
- `components/views/BrandIntelligenceView.tsx` — uplift CRO tính động
- `components/views/TrainingKnowledgeHub.tsx` — mở module theo workspace
- `components/views/LoginScreen.tsx` — bỏ prefill mật khẩu + nút điền demo
- `components/views/UserProfileAccount.tsx` — bỏ literal mật khẩu + ghi chú demo
- `components/views/MasterAdminControlCenter.tsx` — bỏ prefill mật khẩu
- `lib/auth-constants.ts` (mới) — nguồn mật khẩu demo duy nhất
- `lib/mock-data.ts` — mask 9 mật khẩu
- `lib/state-context.tsx` — login 1 nguồn, bỏ backdoor, bỏ leak toast
- `.env.example` — bổ sung `NEXT_PUBLIC_DEMO_PASSWORD` (mục 6)
