# HƯỚNG DẪN KÍCH HOẠT DATABASE THẬT (GO-LIVE) — VEXIM PLATFORM

> Tài liệu này đi kèm migration `supabase/migrations/20260910_rls_fix_and_seed.sql`.
> Thực hiện đúng 2 bước dưới đây, toàn bộ Supply Chain Hub (tồn kho, giá cước 4 hãng tàu,
> booking B/L) sẽ chuyển từ dữ liệu demo sang dữ liệu thật trong Supabase.

---

## BƯỚC 1 — Chạy migration SQL trong Supabase (bắt buộc, ~1 phút)

1. Mở **Supabase Dashboard** → project `yegsmfnxpqgjjohqsscx`.
2. Vào **SQL Editor** → **New query**.
3. Mở file `supabase/migrations/20260910_rls_fix_and_seed.sql`, **copy toàn bộ** → paste → **Run**.
4. Kiểm tra nhanh (chạy trong cùng SQL Editor):

```sql
SELECT count(*) FROM public.users;        -- kỳ vọng: 9
SELECT count(*) FROM public.products;     -- kỳ vọng: 3
SELECT count(*) FROM public.inventory;    -- kỳ vọng: 3
SELECT carrier_partner_name FROM public.freight_rate_cards;   -- kỳ vọng: 4 hãng tàu
SELECT shipment_code, bill_of_lading_number FROM public.inbound_shipments;  -- VXM-SHP-2026-001 / KRY-VNM-LAX-8801
```

Migration này **idempotent** (chạy lại nhiều lần không gây trùng lặp) và đã sửa:

- **Bug RLS 42P17** "infinite recursion detected in policy" trên bảng `users`
  (policy cũ tự query chính bảng `users` trong mệnh đề `EXISTS`).
- **Chính sách chặn đọc** của anonymous key (app Vexim đăng nhập ở tầng ứng dụng,
  không dùng Supabase Auth, nên policy `auth.jwt()` cũ chặn toàn bộ dữ liệu).
- ⚠️ **Lưu ý bảo mật:** policy mới `vexim_demo_full_access` cho phép anon đọc/ghi —
  phù hợp chế độ DEMO NỘI BỘ. Trước khi lên production, thay bằng policy
  multi-tenant theo `auth.jwt()` như trong `supabase/schema.sql` mục 12.

## BƯỚC 2 — Sau khi chạy SQL xong, kiểm chứng trên app

1. Mở Supply Chain Hub → **Inventory**:
   - SKU, tồn kho, days-of-supply giờ lấy từ bảng `inventory` (không còn từ `mock-data.ts`).
   - Bảng giá cước (tab Landed Cost & Book tàu) lấy từ bảng `freight_rate_cards`.
2. Bấm **Xác nhận Book Tàu** trên một SKU:
   - Hệ thống sinh mã vận đơn `VXM-SHP-YYYY-XXXX` và **ghi vào bảng `inbound_shipments`**
     (kiểm tra lại bằng SQL: `SELECT * FROM inbound_shipments ORDER BY created_at DESC;`).
3. Webhook forwarder: `POST /api/webhooks/logistics` giờ **lưu event thật** vào bảng
   `forwarder_tracking_events` (response có `"persisted": true`).

## BƯỚC 3 — Kích hoạt AI Copilot thật (tuỳ chọn)

Copilot (`/api/chat`) hiện chạy kịch bản fallback khi thiếu key. Để gọi AI thật:

1. Tạo API key tại **Vercel AI Gateway** (hoặc dùng `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`).
2. Tạo file `.env.local` tại thư mục gốc repo:

```bash
AI_GATEWAY_API_KEY=vck_your_key_here
# (tuỳ chọn) LOGISTICS_WEBHOOK_SECRET=secret_do_forwarder_dung
```

3. Restart dev server. Từ giờ Copilot trả lời bằng model thật, và **tự đọc bối cảnh sống**
   (tồn kho, hãng tàu, giá cước) từ Supabase để đưa vào prompt.

## Kiến trúc dữ liệu sau khi go-live

```
UI ──đọc/ghi──> Supabase (25 bảng, RLS demo-mode)
 │                ├─ inventory              ← nguồn sự thật tồn kho FBA
 │                ├─ freight_rate_cards     ← bảng giá 4 hãng tàu (sửa giá tại DB)
 │                ├─ inbound_shipments      ← booking B/L được ghi từ app
 │                └─ forwarder_tracking_events ← webhook từ Kerry/Flexport/Maersk/Unifa
 └─ localStorage chỉ còn vai trò cache hiển thị tạm thời
```

Khi **không** chạy migration: app tự fallback về mock-data (không lỗi trắng màn).
