# GIAI ĐOẠN 4 — LISTING EDITOR + STORAGE + PUSH SELLER CENTRAL (2026-09-09)

Anh đã duyệt 4 hạng mục. Trạng thái: **CODE HOÀN TẤT, đã test build + API.**
Còn lại phía anh: chạy 1 migration + (tuỳ chọn) cấp credentials để chuyển LIVE.

## Những gì đã xây

| Hạng mục | File | Trạng thái |
|---|---|---|
| **Listing Editor thật** | `components/views/ListingManagement.tsx` — tab mới "✎ Editor & Đẩy lên Amazon" | ✅ Sửa title (đếm 200 ký tự), 5 bullets (thêm/xóa, giới hạn 5), description, backend keywords (đếm **249 bytes UTF-8**), giá. Lưu & chấm điểm bằng engine nội bộ |
| **Upload ảnh → Supabase Storage** | `SupabaseDatabaseService.uploadListingImage()` → bucket `product-images` (public) | ✅ Upload thật, lưu path + URL vào bảng `listing_images`; chọn MAIN, gỡ ảnh. Không lưu binary trong Postgres |
| **Đồng bộ bảng listings về DB** | `supabase/migrations/20260914_listing_editor_storage.sql` + `getListings()/upsertListing()` + hydrate trong state-context | ✅ Nội dung listing sống trong `amazon_listings` (không còn phụ thuộc localStorage); điểm trong DB chấm lại bằng engine từ nội dung row |
| **Đẩy PATCH lên Seller Central** | `lib/sp-api-listings.ts` (LWA token + AWS SigV4 ký bằng node:crypto) + `app/api/amazon/listing/push` | ✅ LIVE khi đủ env; **SIMULATED trung thực** khi thiếu. Validate chặn >249 bytes trước khi gửi (422) |

Payload PATCH chuẩn JSON-PATCH 6 path: `/attributes/title`, `bullet_point`,
`product_description`, `generic_keyword`, `images` (media_location = URL Storage),
`purchasable_offer` (giá, marketplace ATVPDKIKX0DER = US).

## Bảng kiểm thử đã chạy

- POST push không credentials → `mode: SIMULATED`, preview 4–6 patch paths hợp lệ ✅
- Backend keywords 360 bytes → bị chặn 422 với thông báo rút gọn ✅
- Thiếu sku/bullets → 400 liệt kê trường thiếu ✅
- `npm run build` ✓, tsc --noEmit sạch ✓

## Việc anh cần làm để bật từng tính năng

1. **Chạy migration** `20260914_listing_editor_storage.sql` trong Supabase SQL Editor
   (tạo bảng `amazon_listings`, `listing_images` + 2 buckets `product-images`,
   `compliance-docs`). Sau đó Editor tự lưu DB; hydration tự nạp listings từ DB.
2. **Upload ảnh** hoạt động ngay sau migration (bucket public, anon key hiện có).
3. **Chuyển PUSH sang LIVE** — khai báo env (đã có sẵn khung trong `.env.example`):
   `AMAZON_SP_API_CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN`,
   `AWS_ACCESS_KEY_ID`, `AWS_SECRET_KEY`, (tuỳ chọn `AWS_SESSION_TOKEN`),
   `AWS_REGION=us-east-1`, `AMAZON_MARKETPLACE_ID=ATVPDKIKX0DER`.
   IAM user cần quyền `execute-api` cho SP-API (App registration trên Seller Central
   → lấy refresh token role Listing Listing Write).

## Ranh giới minh bạch (đã ghi trên UI)

- **A+ Content**: editor lưu nội dung A+ vào DB, nhưng KHÔNG đẩy qua PATCH này —
  Amazon yêu cầu A+ Content Publishing API 2020-11-01 riêng (sprint tiếp theo).
- **Ảnh**: Amazon copy ảnh từ URL public — bucket `product-images` phải public đọc được.
- Khi thiếu credentials, nút Đẩy luôn báo MÔ PHỎNG (không bịa Feed ID như code cũ).

---

# SPRINT 4.1 — A+ CONTENT PUBLISHING + INBOX/DOCUMENTS HYDRATION (2026-09-09)

Anh đã duyệt và chạy migration 20260914. Sprint này bổ sung:

| Hạng mục | File | Trạng thái |
|---|---|---|
| **A+ Content Publishing API** | `lib/sp-api-aplus.ts` (create → gán ASIN → nộp duyệt; publish riêng), `app/api/amazon/aplus/push`, tab A+ trong Listing trở thành **editor thật** (≤5 module headline/body/ảnh + preview, Lưu DB, Nộp duyệt Amazon) | ✅ SIMULATED khi thiếu credentials, LIVE khi đủ |
| **Hydrate Inbox CS** | Migration `20260915_customer_inquiries_documents.sql` (bảng `customer_inquiries`) + `getCustomerMessages/upsertCustomerMessage` + hydrate state | ✅ Inbox sống trong DB; reply ghi DB |
| **Communication (Buyer Messaging)** | `app/api/amazon/messages/send` — RDT (`/tokens/2021-06-30/restrictedResources`) → `POST /messaging/v1/orders/{orderId}/messages/createRestrictedMessage` | ✅ LIVE khi đủ env; `sendCustomerReply` giờ phản ánh đúng kết quả (không còn toast nói dối "đã gửi qua Amazon") |
| **Product Documents** | Bảng `product_documents` + upload file lên bucket private `compliance-docs` + hydrate gắn vào tab Hồ sơ & Chứng chỉ | ✅ |

**Lưu ý minh bạch (đã ghi trên UI/toast):**
- Amazon KHÔNG mở endpoint đọc hộp thư buyer — inbox nguồn từ DB (email forwarding/nhập tay); API chỉ GỬI được loại tin cho phép, cần RDT, và chỉ trong 30 ngày messaging window.
- A+ theo đúng luồng Amazon: tạo → nộp duyệt → Amazon review 24-48h → publish sau APPROVED.
- **Anh cần chạy thêm migration `20260915`** để bảng inbox + documents hoạt động.
