# BÁO CÁO THẨM ĐỊNH PRODUCTION READINESS — VEXIM PLATFORM

> Ngày thẩm định: 2026-09-09 • Phiên bản: sau commit đưa DB vào `DATABASE_LIVE`
> Câu hỏi: **"Đưa lên môi trường sản xuất thì các API và vận hành Amazon đã chạy được chưa?"**
> Trả lời ngắn: **Chưa đủ 100%.** Giao diện + Supabase + logistics đã sẵn sàng chạy;
> phần **dữ liệu Amazon SP-API** đã có đường ray thật nhưng cần credentials + phê duyệt
> từ Amazon mới "sống" hoàn toàn. Chi tiết từng thành phần bên dưới.

---

## 1. Bảng Go / No-Go từng thành phần

| # | Thành phần | Trạng thái | Đánh giá | Chặn production? |
|---|---|---|---|---|
| 1 | UI + toàn bộ tab vận hành | 🟢 | Build pass, chạy ổn | Không |
| 2 | Supabase (clients/users/products/inventory/rates) | 🟢 `DATABASE_LIVE` | Đọc/ghi thật, đã xác minh qua `/api/system/health` | Không |
| 3 | Book Tàu B/L → `inbound_shipments` | 🟢 | Ghi DB thật | Không |
| 4 | Webhook forwarder → `forwarder_tracking_events` | 🟢 | Lưu DB thật; **đã vá**: production bắt buộc secret khớp (timing-safe) | Không |
| 5 | AI Copilot `/api/chat` | 🟡 | Route thật; **đã vá** fallback + rate limit 30 câu/phút/IP. Chưa có key → chỉ trả kịch bản mẫu | Cần `AI_GATEWAY_API_KEY` |
| 6 | **Amazon Orders/Inventory sync** | 🟡 | **MỚI:** `POST /api/amazon/sync` gọi SP-API thật (LWA + AWS SigV4, retry 429/401). Thiếu credentials → `simulated:true`, UI cảnh báo vàng, không còn "giả vờ thành công" | **Cần credentials Amazon (mục 2)** |
| 7 | **Amazon Ads (PPC) sync** | 🔴 | Ads API là hệ thống riêng (advertising-api.amazon.com, OAuth profile riêng) — **chưa triển khai**; route trả lỗi rõ `ADS_API_NOT_IMPLEMENTED` | Có — giai đoạn sau |
| 8 | Listings push (PATCH giá/chỉnh sửa) | 🔴 | Chỉ có read-check (GET listing). Patch/feed cần thêm flow submissions + polling | Có — giai đoạn sau |
| 9 | Multi-tenant RLS | 🟡 | Đang policy demo (anon full access) — chỉ an toàn khi app nội bộ | **Có** khi mở cho người ngoài (SQL thay trong runbook) |
| 10 | Secrets | 🟡 | Mật khẩu 9 user seed = `Anthai@88`, webhook secret mặc định — **phải đổi trước go-live** | Có |

**Kết luận:** Đưa lên production **nội bộ** (team Vexim dùng, dữ liệu logistics/tồn kho chạy tay): **ĐẠT ngay sau mục 4 checklist.** Đưa lên production **tự động hóa dữ liệu Amazon**: cần hoàn thành mục 2 bên dưới (điều kiện của Amazon, không phải code).

## 2. Điều kiện để Amazon SP-API chạy thật (đường ray đã xong, còn "giấy phép")

Code đã hỗ trợ đủ: refresh LWA token tự động, ký **AWS Signature V4** (`execute-api`), retry 429 theo `Retry-After`, tự refresh khi 401, timeout 20s. Việc còn lại là thủ tục với Amazon:

1. **Tài khoản Seller Central Professional** (US) — bắt buộc để đăng ký developer.
2. **Đăng ký Amazon SP-API Developer** trong Seller Central → App & Services → Develop apps → yêu cầu vai trò **Orders**, **FBA Inventory**, **Product Listing**, **Seller Insights** (Amazon duyệt 1–7 ngày).
3. Tạo app → lấy **LWA Client ID/Secret** → seller **authorize** app → nhận **Refresh Token** (`Atzr|...`).
4. **AWS IAM User** (không cần role ARN cho bản này) với quyền gọi SP-API → `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`.
5. Điền đủ 5+ biến env (xem `.env.example` mục 2) → `GET /api/amazon/sync` phải trả `"mode": "LIVE"`.
6. Lưu ý đặc thù:
   - **PII (địa chỉ/điện thoại khách)** trong Orders cần phê duyệt thêm *Protected Account Information* + dùng RDT token — giai đoạn 2.
   - **Rate limit:** Orders/Inventory ~1 call/2 phút (burst 20) → hợp mô hình sync 1 giờ/lần, KHÔNG hợp real-time từng giây.
   - Redirect URL khi authorize app phải là domain production có HTTPS.

## 3. Những lỗi đã phát hiện & vá trong đợt thẩm định này

| Lỗi | Vị trí | Mức độ | Đã vá |
|---|---|---|---|
| Webhook: production không gửi header secret vẫn được nhận | `app/api/webhooks/logistics` | 🔴 Cao | ✅ Bắt buộc khớp secret (timing-safe compare) khi `NODE_ENV=production` + có cấu hình |
| Sync Center "thành công 0 lỗi" dù là `setTimeout` giả | `state-context.triggerSyncJob` | 🔴 Cao (nhầm lẫn nghiệp vụ) | ✅ Gọi `/api/amazon/sync` thật; simulated → toast cảnh báo vàng; số liệu `itemsProcessed` lấy từ Amazon |
| SP-API simulator không phân biệt thật/giả | `lib/amazon-sp-api.ts` | 🟠 | ✅ Thêm cờ `simulated` vào `SyncResult`, hiển thị ở mọi kết quả |
| `streamText` lỗi im lặng khi thiếu AI key (chat trắng lỗi) | `app/api/chat` | 🟠 | ✅ (đợt trước) fallback theo key-check |
| Chat không có giới hạn tần suất | `app/api/chat` | 🟡 | ✅ Rate limit 30 câu/phút/IP (in-memory; multi-instance → dùng Redis) |

## 4. Kiến trúc sau thẩm định

```
Browser UI
  ├─ /api/system/health ────> Supabase (25 bảng, DATABASE_LIVE) ✅
  ├─ /api/webhooks/logistics → Supabase forwarder_tracking_events ✅ (+secret bắt buộc ở prod) ✅
  ├─ /api/amazon/sync ──────> [đủ env]  Amazon SP-API THẬT (LWA + SigV4, retry 429) 🟡 cần credentials
  │                          [thiếu env] simulated:true + UI cảnh báo ✅ minh bạch
  └─ /api/chat ─────────────> [có key] AI thật + context sống từ Supabase 🟡 cần key
                             [không key] kịch bản fallback ✅
Sync Center: ORDERS/INVENTORY → Amazon thật khi LIVE; PERFORMANCE_ADS → báo chưa triển khai (không giả)
```

## 5. Checklist go-live cuối (thứ tự thực hiện)

1. ☐ Đổi mật khẩu 9 user seed (hiện `Anthai@88`) — Supabase Auth.
2. ☐ Đặt `LOGISTICS_WEBHOOK_SECRET` giá trị mạnh, gửi cho forwarder kèm endpoint.
3. ☐ Thêm `AI_GATEWAY_API_KEY` (Copilot thật).
4. ☐ Deploy (Vercel/hosting Node) + set env — kiểm tra `GET /api/system/health` = `DATABASE_LIVE`, `GET /api/amazon/sync` = mode `LIVE`.
5. ☐ **Khi mở cho người ngoài:** thay policy `vexim_demo_full_access` bằng tenant-isolation (SQL mẫu trong `DATABASE_GO_LIVE_GUIDE.md`).
6. ☐ Đăng ký SP-API developer + authorize app → điền credentials → chạy job ORDERS/INVENTORY lần đầu, đối chiếu số đơn với Seller Central.
7. ☐ (Giai đoạn 2) Amazon Ads API, Listings PATCH, PII/RDT, hydrate orders/PPC vào Supabase như đã làm với inventory.
