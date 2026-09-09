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
| **Brand Intel & CRO Desk** | ✅ | Mock market + ENGINE CRO thật | ❌→✅ **ĐÃ SỬA LẦN 2 (đợt sau phản hồi của anh)**: +$4,620/+$2,840 uplift, loại điểm nghẽn, toàn bộ câu chẩn đoán, "Nhận định chiến lược" đều LƯU SẴN → giờ engine `lib/cro-engine.ts` tính từ chỉ số phiên (SP-API SIMULATED) + giá + velocity tồn kho. Nút "Tạo Task cho Designer" và "Tăng thầu Exact" là NÚT CHẾT → giờ tạo task thật (giao Trần Thu Hà, priority HIGH) / đề xuất theo rule rank+volume và nhảy sang PPC. Dòng ta đang THẮNG rank #3 vs #12 vẫn bảo "Tăng thầu vượt rank" → giờ rule đúng: "Thắng rank — Phòng thủ Exact". Badge sidebar giờ đếm CVR gap thật = **1** (PWD500; 70DK nghẽn CTR chứ không phải CVR) |
| Badge **"2 CVR Gap"** (Sidebar) | ✅ | — | ❌→✅ **ĐÃ SỬA**: hardcode chuỗi "2" → giờ đếm động `conversionDiagnostics.length` (hiện đúng 2, tự cập nhật khi dữ liệu đổi) |
| **Tối Ưu Listing & SEO** | ✅ | Mock + ENGINE THẬT | ❌→✅ **ĐÃ SỬA LẦN 2**: nút "AI Phân tích lại" là setTimeout giả → giờ chạy engine thật; áp draft hardcode 96/'A+' → giờ chấm lại từ nội dung mới (kèm fix mất backend terms khi áp draft); code chết `pushListingUpdate` bịa "Feed ID ACCEPTED" đã xóa. **Chưa có**: editor tự do, upload ảnh (ảnh là URL mock), đẩy lên Seller Central (cần SP-API PATCH — GĐ4), bảng listings trong DB (đang chỉ sống localStorage) |
| **Sản Phẩm & Tiếp Nhận** | ✅ | DB khi LIVE / mock khi trống | ❌→✅ **ĐÃ SỬA LẦN 2 (đợt sau phản hồi của anh)**: Readiness 94/89 là hardcode → giờ **engine chấm thật** (`lib/readiness-engine.ts`); nút "Tải lên chứng từ mới" là nút chết → giờ **upload thật** (metadata + localStorage, nhãn UNDER_REVIEW); margin 40.8% lưu cứng → giờ **tính từ giá/COGS/fees**; supabase-service gán cứng `canLaunch:true` → giờ engine chấm. Kết quả chấm lại: 70DK 88/100 (được launch), **PWD500 69/100 BỊ CHẶN** (thiếu COA+FDA), ROAST500 57/100 4 blockers |
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
