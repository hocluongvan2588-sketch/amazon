# GIAI ĐOẠN 3 — INTELLIGENCE LAYER: THẨM ĐỊNH HIỆN TRẠNG & LỘ TRÌNH TRIỂN KHAI

> Yêu cầu: Kiểm tra hệ thống đã có các thuật toán (1) PPC Automation, (2) Listing SEO
> chuẩn Cosmos/A10, (3) FBA Forecast & Capacity Bid chưa → đánh giá khối lượng + lộ trình.
> Ngày thẩm định: 2026-09-09.

---

## PHẦN A — KẾT QUẢ KIỂM TRA: đã có gì, thiếu gì?

### Tổng quan nhanh

| Thuật toán theo yêu cầu | Hiện trạng | Mức độ |
|---|---|---|
| 1a. Bid theo công thức Target ACOS (`Bid = Target ACOS × CVR × AOV`) | ❌ Chưa có — chỉ có heuristic tĩnh −35%/+15% tại ngưỡng cứng | Thiếu hoàn toàn phần lõi |
| 1b. Tự động phủ định từ khóa (quét ngưỡng clicks > 10–15 & CVR = 0) | 🟡 Có ~40%: có dữ liệu Search Term + nút negate thủ công, **chưa có thuật toán tự quét**, chưa ghi lên Amazon | Nền có, thuật toán chưa |
| 1c. Placement Optimization (ToS vs Product Pages) | ❌ Chưa có dữ liệu placement, chưa có thuật toán | Thiếu hoàn toàn |
| 2a. Listing Quality Score 100 điểm | 🟡 Có ~30%: có khung điểm (ListingScore), nhưng **số điểm là hardcode**, không có engine chấm từ nội dung thật | Khung có, máy chấm chưa |
| 2b. Backend Search Terms hạn ngạch 249 bytes | 🟡 UI có hiển thị nhưng **đếm bằng `.length` (ký tự) thay vì bytes** → sai chuẩn | Có UI, logic sai |
| 2c. Competitor Keyword Gap / Semantic Intent | 🟡 Có ~30%: có cấu trúc dữ liệu đối thủ + sharedTopKeywords, **chưa có thuật toán phân tích gap** | Nền có, thuật toán chưa |
| 3a. Days of Supply theo trọng số 50/30/20 | 🟡 Có ~50%: engine tính weighted velocity nhưng **7d-60%/30d-40%** (thiếu 14d), days-of-supply hiển thị lấy từ DB/mock tĩnh | Gần đúng, cần nâng cấp |
| 3b. Capacity Bid Suggestion (ft³ + $/ft³ theo target doanh thu) | ❌ Chưa có — nút bid hiện tại là form nhập tay với số cứng "+450 ft³ ($0.15/ft³)" | Thiếu hoàn toàn |
| Deliverable: Background workers / cron | ❌ Không tồn tại (không node-cron, không vercel.json, scan là `setTimeout` giả) | Thiếu hoàn toàn |
| Deliverable: 3 nút Dashboard | 🟡 Có mặt bằng UI tab PPC/Listing/Capacity, chưa có nút theo yêu cầu | Bổ sung được nhanh |

### Chi tiết từng thành phần đã kiểm tra

**1. PPC — `lib/ai-engine.ts` (PPCAgent)**
- Có: heuristic 2 nhánh — `ACOS > 45% && clicks ≥ 15 → đề xuất bid × 0.65`; `ACOS < 20% && CVR > 20% && orders ≥ 5 → bid × 1.15`. Kết quả là AIRecommendation chờ người duyệt (human-in-the-loop) — đúng triết lý vận hành.
- Không có: công thức Bid_optimal = TargetACOS × CVR × AOV; bước nhảy % cấu hình được; cửa sổ đánh giá 7–14 ngày; tự động áp (auto-apply); guard bid floor/ceiling của Amazon.

**2. PPC — Bid Rules Canvas (`PpcGrowthDesk` + `mockAlgorithmicBidRules`)**
- Có: 3 rule mock (DAY_PARTING, INVENTORY_THROTTLE, TARGET_ACOS_TUNER) + nút bật/tắt.
- Thực chất: `toggleBidRule` chỉ đổi chuỗi `ACTIVE/PAUSED` trong state — **không thực thi bất kỳ thuật toán nào**. `executionsCount24h`, `estimatedDailySavingsUsd` là số cứng.

**3. Negative keyword — `harvestedSearchTerms` + `negateSearchTerm`**
- Có: cấu trúc Search Term Report đầy đủ (impressions/clicks/orders/spend/acos/cvr/suggestedAction) + hành động negate thủ công (đổi status → NEGATED).
- Không có: thuật toán quét ngưỡng tự động; hàng đợi phê duyệt hàng loạt; ghi Negative Exact/Phrase lên Amazon Ads API (cần `POST /sp/negativeKeywords`).

**4. Placement — toàn hệ thống**
- Chỉ có tham số `topOfSearchMultiplier: 1.35` trong 1 rule mock và 1 recommendation mẫu nhắc đến ToS share 32%→68%. **Không có bảng dữ liệu hiệu suất theo placement (ToS / Rest of Search / Product Pages), không có thuật toán so sánh ROI từng vị trí.**

**5. Listing SEO — `ListingOptimizerAgent` + ListingScore**
- `ListingScore` có 5 trục (overall/title/bullet/keyword/content) nhưng toàn bộ giá trị **hardcode trong `mock-data.ts`**. `generateOptimizationProposal` chỉ bọc draft có sẵn thành recommendation — không tính gì từ nội dung.
- Backend Search Terms: UI hiển thị `backendSearchTerms.length / 249 bytes` — **bug: `.length` đếm ký tự Unicode, không phải bytes UTF-8**; chưa có thuật toán khử trùng lặp, loại stopwords, tối ưu hạn ngạch.
- Competitor: `CompetitorReverseAsin.sharedTopKeywords` (competitorOrganicRank vs ourOrganicRank + searchVolume) — nền dữ liệu tốt cho Gap Analysis nhưng **chưa có thuật toán** tính gap/đề xuất.

**6. FBA Forecast — `InventoryAgent` + `AnalyticsEngine`**
- `InventoryAgent`: `daysOfSupply = available / velocity7d`, cảnh báo khi < 45% lead-time, tự tính số units reorder (biển/air) — dùng được nhưng thô.
- `AnalyticsEngine.calculateSeasonalityAdjustedVelocity`: weighted **60/40 (7d/30d)** + seasonality multiplier (Q4 ×1.65, Prime ×1.35, post-holiday ×0.85) — khác spec 50/30/20 (thiếu velocity 14d; data model chưa có cột `daily_velocity_14d`).
- Days-of-supply hiển thị trong app lấy **trực tiếp từ DB/mock** (`days_of_supply` cột tĩnh) chứ không tính live từ engine.

**7. Capacity Bid — `submitCapacityBid` + tab Capacity**
- Chỉ ghi form vào state + notification. Không có thuật toán: dự báo ft³ cần (units × thể tích thùng × safety factor), mức bid $/ft³ tối ưu theo biên lợi nhuận/target doanh thu để giữ `performanceCreditEligible` = true. Cờ này hiện là mock.

**8. Workers / Cron**
- **Không tồn tại**: `package.json` chỉ có dev/build/start; không node-cron, không vercel.json, không Supabase Edge Functions. `runAiFullScan` hiện là `setTimeout(1400ms)` rồi toast "Đã phân tích 12 SKUs…" — **là kết quả giả, cần thay bằng engine chạy thật trong giai đoạn này**.

**9. Supabase — bảng còn thiếu cho Intelligence Layer**
- Đã có: `advertising_campaigns`, `advertising_keywords`, `amazon_listings`, `inventory`, `orders`.
- Thiếu: `ppc_search_term_reports`, `ppc_placement_metrics`, `ppc_bid_change_log`, `listing_scores_history`, `keyword_suggestions`, `algorithm_runs` (audit trail mọi lần thuật toán chạy + kết quả + người duyệt).

### Lưu ý về "chuẩn Amazon 2024–2026 / A10 / Cosmos"
Amazon không công bố mã nguồn/hash nội bộ của thuật toán tìm kiếm ("A10/Cosmos" là tên gọi cộng đồng seller). Điều hệ thống có thể làm **chính xác và trung thực** là: (a) implement đúng các công thức bạn định nghĩa (Target-ACOS bid, weighted velocity…), (b) dùng đúng các API chính thức có số liệu tương ứng (Ads API v3 Search Term & Placement reports, SP-API), (c) heuristic semantic/intent theo best practice công khai. Báo cáo luôn gắn nhãn rõ đây là engine của Vexim, không phải "thuật toán của Amazon".

---

## PHẦN B — LỘ TRÌNH TRIỂN KHAI CHI TIẾT (4 SPRINT)

### Sprint 3.1 — PPC Automation Engine ⭐ ✅ HOÀN THÀNH (2026-09-09)

> Đã triển khai + test pass toàn bộ:

| Hạng mục | File | Trạng thái |
|---|---|---|
| Thuật toán Bid = Target ACOS × CVR × AOV (guardrail ±20%, floor $0.25, NO_DATA < 10 clicks) | `lib/ppc-intelligence.ts` | ✅ Test: ACOS 88% → hạ −20%; ACOS 17.6% + CVR 26% → tăng +20% (cap) |
| Auto Negative (min clicks 10–15 theo window, CVR=0 hoặc ACOS>150%, token rác → Phrase) | `lib/ppc-intelligence.ts` | ✅ Test: 4 terms → 2 kiến nghị, tiết kiệm ước tính $129.05 |
| Placement (ToS vs Product Pages, ROI edge 1.2×, boost cap 50%, ACOS > 1.5× target → về 0) | `lib/ppc-intelligence.ts` | ✅ Test: 3 campaigns → BOOST_UP ×2, BOOST_DOWN ×1 đúng logic |
| 4 bảng DB + policy demo (defensive, không fail hard) | `supabase/migrations/20260911_ppc_intelligence.sql` | ✅ (cần chạy trong Supabase trước khi LIVE ghi DB) |
| LIVE report pipeline (create→poll→download gzip) + push bid/negative lên Amazon | `lib/ads-api-server.ts` | ✅ code xong — kích hoạt khi có Ads credentials |
| POST /api/ppc/optimize (dual-mode, simulated không ghi DB) | `app/api/ppc/optimize/route.ts` | ✅ |
| POST /api/ppc/approve (human-in-the-loop bulk, LIVE đẩy Amazon) | `app/api/ppc/approve/route.ts` | ✅ |
| Worker /api/cron/ppc-optimizer (CRON_SECRET, timing-safe, prod thiếu secret → từ chối) | `app/api/cron/ppc-optimizer/route.ts` | ✅ Test full-cycle 3 modules |
| UI: nút "Bật tự động tối ưu Bid" + "Báo cáo kiến nghị phủ định" (chọn nhiều → duyệt loạt) + Placement cards | `components/views/PpcIntelligencePanel.tsx` | ✅ Gắn ở đầu tab PPC Growth Desk |

### Sprint 3.1 — KẾ HOẠCH GỐC (~3–4 ngày dev)

| Việc | Chi tiết kỹ thuật |
|---|---|
| `lib/ppc-intelligence.ts` (thuần deterministic, unit-test được) | ① `computeOptimalBid({targetAcos, cvr, aov, currentBid})` theo công thức `Bid = TargetACOS × CVR × AOV`, kèm: bước nhảy max ±20%/lần, bid floor/ceiling cấu hình, window 7–14 ngày, điều kiện tăng bid (ACOS < target && CVR cao) / hạ bid (ACOS > target). ② `detectNegativeSearchTerms(reportRows, {minClicks: 12, zeroCvrOnly: true, maxAcos: 100})` → đề xuất NEGATIVE_EXACT/PHRASE kèm mức tiết kiệm ước tính. ③ `optimizePlacements(perPlacementRows)` → so sánh ROI ToS vs Product Pages, đề xuất boost % (cap +50%, chỉ tăng khi ROI vị trí > trung bình). |
| Migration DB | Bảng `ppc_search_term_reports`, `ppc_placement_metrics`, `ppc_bid_change_log`, `algorithm_runs` + policy demo-mode (idempotent, tự vô hại nếu lỗi như seed phase trước). |
| API | `POST /api/ppc/optimize {module: BID_ADJUSTMENT | NEGATIVE_KEYWORDS | PLACEMENT}` — LIVE: kéo report Ads API v3 → chạy engine → ghi DB + (tuỳ chọn auto-apply) đẩy bid/negative lên Amazon; SIMULATED: chạy trên dữ liệu mock, **không ghi DB, gắn cờ** (chuẩn phase 2). |
| Worker | `GET/POST /api/cron/ppc-optimizer` bảo vệ bằng `CRON_SECRET` — chạy toàn bộ chu kỳ, ghi `algorithm_runs`. |
| UI | Nút **"Bật tự động tối ưu Bid"** (toggle per campaign; mặc định OFF = chỉ đề xuất chờ duyệt — an toàn), bảng **"Báo cáo kiến nghị phủ định từ khóa"** (tick nhiều dòng → phê duyệt hàng loạt), tab Placement mới. |

### Sprint 3.2 — Listing Quality Score + Keyword Gap (~2–3 ngày dev)

| Việc | Chi tiết |
|---|---|
| `lib/listing-quality.ts` | Chấm 100 điểm từ nội dung thật: Title (độ dài ≤200 ký tự, in hoa chữ đầu, mật độ từ khóa chính, không claim cấm: "best/#1/FDA approved/cure"...), Bullets (5 mục, độ dài, bắt đầu chữ hoa), Description, Backend Search Terms (**đếm bằng `Buffer.byteLength` đúng UTF-8**, khử trùng lặp với title/bullets, tối ưu hạn ngạch 249 bytes), A+/ảnh. Output: điểm từng trục + danh sách issues sửa được ngay. |
| `lib/keyword-gap.ts` | Đầu vào sharedTopKeywords của CompetitorReverseAsins: score mỗi từ khóa = searchVolume × (đối thủ rank tốt & mình rank kém) × hệ số intent (có "buy/for/best"…). Xuất danh sách Contextual/High-Intent keywords đề xuất chèn title/bullets/backend. |
| API + UI | `POST /api/listing/score`; nút **"Chấm điểm SEO Listing"** trong Listing Management: hiện score radar + issues + suggestions; sửa bug bytes; lưu lịch sử vào `listing_scores_history`. |

### Sprint 3.3 — FBA Forecast + Capacity Bid Suggestion (~2 ngày dev)

| Việc | Chi tiết |
|---|---|
| Migration | Thêm cột `daily_velocity_14d` vào `inventory` (backfill = trung bình 7d/30d nếu chưa có dữ liệu). |
| `lib/forecast-engine.ts` | ① `weightedVelocity(v7, v14, v30)` = **50% / 30% / 20%** (thay thế 60/40 cũ, giữ seasonality multiplier). ② `daysOfSupply = (available + inbound) / weightedVelocity` + ngày đứt hàng dự kiến. ③ `capacitySuggestion`: ft³ cần = dự báo units Q4 × thể tích thùng (CBM→ft³ ×35.31) × safety 1.15; mức bid $/ft³ tối ưu = biên lợi nhuận trên mỗi ft³ bán được × hệ số chắc chắn nhận 100% Performance Credits (bid thấp hơn ngưỡng market rate tham chiếu); cảnh báo khi bid vượt biên lợi nhuận. |
| API + UI | `POST /api/inventory/forecast`; app đổi sang tính **live** days-of-supply từ engine thay vì cột tĩnh; nút **"Gợi ý mức đấu giá dung lượng"** trong tab Capacity → điền sẵn ft³ + $/ft³ khuyến nghị vào form bid hiện có. |

### Sprint 3.4 — Workers + Hoàn thiện Dashboard (~1–2 ngày dev)

| Việc | Chi tiết |
|---|---|
| Cron hạ tầng | `vercel.json` crons (ppc-optimizer mỗi giờ, forecast mỗi ngày) + GitHub Actions fallback cho hosting khác; tất cả qua `CRON_SECRET`. |
| Sửa `runAiFullScan` giả | Thay bằng gọi engine thật trên dữ liệu DB (sẽ báo đúng số SKU/campaign đã phân tích — hết era "toast giả"). |
| Trang Intelligence | Tổng hợp: log `algorithm_runs`, hiệu quả sau tối ưu (tiết kiệm $/tuần), số từ khóa phủ định đã cắt lỗ. |

**Tổng ước lượng: 8–11 ngày dev.** Thứ tự đề xuất: 3.1 → 3.3 (nhanh, dùng được ngay với dữ liệu DB hiện có, không cần credentials Amazon) → 3.2 → 3.4. Sprint 3.1 phần "áp xuống Amazon thật" chỉ sống khi có Ads API credentials (giai đoạn 2 đã dựng hạ tầng dual-mode — tái dùng nguyên quyết).

### Nguyên tắc an toàn vận hành xuyên suốt
1. Mọi thuật toán mặc định **ĐỀ XUẤT → người duyệt** (human-in-the-loop); auto-apply là opt-in từng campaign.
2. Mỗi lần chạy ghi `algorithm_runs` (input hash, output, ai duyệt) — truy vết được.
3. Giới hạn biến động: bid không đổi quá ±20% mỗi lần, tối đa 1 lần/ngày/từ khóa.
4. Dual-mode nghiêm ngặt: simulated không bao giờ ghi DB/đẩy Amazon (chuẩn đã áp từ phase 2).
