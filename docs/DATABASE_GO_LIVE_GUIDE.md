# RUNBOOK VẬN HÀNH PRODUCTION — VEXIM PLATFORM

> Mục tiêu: hệ thống **vận hành được** với Supabase, biết chính xác phần nào
> đang chạy THẬT / phần nào đang FALLBACK, và checklist chốt trước khi mở thật.

---

## 1. Hai file SQL — chạy đúng thứ tự

| File | Bắt buộc? | Tác dụng | Rủi ro fail |
|---|---|---|---|
| `supabase/migrations/20260910_rls_fix.sql` | ✅ BẮT BUỘC | Sửa bug RLS 42P17 bảng `users`; mở quyền đọc/ghi cho app. Không có file này = app không bao giờ thấy dữ liệu DB. | Không thể fail (toàn bộ IF EXISTS + guard) |
| `supabase/migrations/20260910_seed_demo_data.sql` | 🔶 Tuỳ chọn | Dữ liệu nền: 2 NCC, 9 users, 3 products, 3 tồn kho, 4 hãng tàu, 1 vận đơn mẫu, biểu thuế | Không thể fail hard — lỗi section nào chỉ ra NOTICE `[Vexim Seed N] Bo qua: ...` rồi chạy tiếp |

Cách chạy: Supabase Dashboard → SQL Editor → New query → paste → Run.

> Thiết kế mới của seed: **không dùng ON CONFLICT phụ thuộc constraint**,
> thay bằng `WHERE NOT EXISTS`; manifest carton chỉ insert khi shipment + product
> đều tồn tại (JOIN qua products) → **không thể** dính lỗi 23503/42P10 như trước.
> Nếu DB live đã có sẵn products với ID khác → seed tự bỏ qua, không sao cả.

## 2. Thẩm định hệ thống đang chạy gì — 1 lệnh

Sau khi chạy SQL, mở:

```
GET /api/system/health
```

```jsonc
{
  "mode": "DATABASE_LIVE",        // ✅ hoặc DEGRADED / FALLBACK_MOCK
  "supabase": { "reachable": true, "rlsFixed": true },
  "tables": { "users": 9, "inventory": 3, "freight_rate_cards": 4, ... },
  "integrations": { "aiGatewayKey": false, "logisticsWebhookSecret": false }
}
```

- `DATABASE_LIVE` — Supply Chain Hub đọc tồn kho + giá cước từ DB; booking B/L ghi DB.
- `DEGRADED` — DB kết nối OK nhưng chưa seed → app dùng mock nền, không crash.
- `FALLBACK_MOCK` — DB chưa chạy RLS fix / không cấu hình → app dùng mock, không crash.

## 3. Cấu hình môi trường (`.env.local`)

```bash
# Supabase (đã hardcode giá trị demo trong lib/supabase.ts — production nên set riêng)
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# AI Copilot thật (không có = chat trả kịch bản mẫu, không lỗi)
AI_GATEWAY_API_KEY=<key>

# Webhook forwarder (production NÊN đổi khỏi giá trị mặc định)
LOGISTICS_WEBHOOK_SECRET=<chuỗi ngẫu nhiên mạnh>
```

## 4. Trạng thái thật của từng thành phần (sau go-live)

| Thành phần | Trạng thái hiện tại | Việc còn lại để "thật" 100% |
|---|---|---|
| Tồn kho / Sản phẩm / Clients / Users | ✅ Đọc ghi Supabase thật | Tự duy trì qua app |
| Bảng giá cước 4 hãng tàu | ✅ Đọc từ `freight_rate_cards` | Sửa giá trực tiếp trong DB |
| Book tàu B/L | ✅ Ghi thật vào `inbound_shipments` | — |
| Webhook tracking | ✅ Lưu thật vào `forwarder_tracking_events` | Cho forwarder gọi kèm header secret |
| AI Copilot | ✅ Route thật; tự nạp context sống từ DB | Thêm `AI_GATEWAY_API_KEY` |
| **Amazon SP-API** (`lib/amazon-sp-api.ts`) | ⚠️ **Vẫn là simulator** (setTimeout + số cứng) | Cần Amazon Developer App (LWA) + credentials thật + viết OAuth/refresh flow — làm theo giai đoạn riêng |
| Đơn hàng / PPC / Reports trong DB | ⚠️ Schema có, seed chưa phủ, app chưa hydrate các bảng này | Giai đoạn 2: mở rộng hydration như đã làm với inventory |

## 5. Checklist chốt production

1. ✅ Đã chạy `20260910_rls_fix.sql` (`/api/system/health` → `rlsFixed: true`).
2. ✅ `.env.local` đủ 4 nhóm biến trên, **không** commit `.env.local` vào Git.
3. 🔒 **Thay policy demo** `vexim_demo_full_access` bằng tenant-isolation khi mở cho người ngoài:

   ```sql
   -- Ví dụ cho products (làm tương tự các bảng theo tenant):
   DROP POLICY IF EXISTS vexim_demo_full_access ON public.products;
   CREATE POLICY tenant_read_products ON public.products FOR SELECT TO authenticated
     USING (
       (auth.jwt()->>'role') IN ('SUPER_ADMIN','OPS_MANAGER','ACCOUNT_EXECUTIVE','COMPLIANCE_SPECIALIST')
       OR client_id::text = (auth.jwt()->>'client_id')
     );
   ```

4. 🔒 Đổi mật khẩu 9 tài khoản seed (mặc định `Anthai@88` từ migration 20260908).
5. 🔒 Đổi `LOGISTICS_WEBHOOK_SECRET` khỏi giá trị mặc định `vexim_logistics_live_2026`.
6. 📦 Bật PITR/backup trong Supabase trước khi nhập dữ liệu khách thật.
7. 🧪 Định kỳ mở `/api/system/health` để xác nhận `mode: DATABASE_LIVE`.
