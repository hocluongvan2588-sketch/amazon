// ====================================================================
// VEXIM PPC INTELLIGENCE ENGINE (Sprint 3.1) — THUẦN DETERMINISTIC
// 3 thuật toán lõi theo spec Giai đoạn 3:
//   1) Target-ACOS Dynamic Bid Adjustment
//      Bid_new = Target ACOS × CVR × AOV  (kèm guardrail bước nhảy ±20%)
//   2) Auto Negative Keyword Detection (clicks > ngưỡng & CVR = 0 / ACOS cao)
//   3) Placement Optimization (Top of Search vs Product Pages)
// Toàn bộ hàm thuần (pure) — không gọi network, không đụng DB => unit-test được.
// Engine của VEXIM theo công thức nghiệp vụ định nghĩa — không phải mã nguồn Amazon.
// ====================================================================

// ---------------- 1. DYNAMIC BID ADJUSTMENT ----------------

export interface BidEvaluationInput {
  keywordId: string
  keywordText: string
  matchType: string
  campaignId: string
  campaignName: string
  clientId: string
  currentBid: number
  /** Hiệu suất tích luỹ trong window (7 hoặc 14 ngày) */
  clicks: number
  spend: number
  sales: number
  orders: number
  targetAcosPct: number // ví dụ 25 nghĩa là 25%
  /** Giá trị đơn hàng trung bình (AOV) của client/sản phẩm ($ = USD) */
  aovUsd: number
}

export interface BidProposal {
  keywordId: string
  keywordText: string
  matchType: string
  campaignId: string
  campaignName: string
  clientId: string
  currentBid: number
  recommendedBid: number
  changePct: number
  action: 'INCREASE' | 'DECREASE' | 'HOLD' | 'NO_DATA'
  acosPct: number | null // null khi sales = 0
  cvrPct: number
  clicks: number
  spend: number
  targetAcosPct: number
  reason: string
}

export const BID_GUARDRAILS = {
  MIN_BID_USD: 0.25, // floor thầu SP Amazon
  MAX_BID_USD: 12.0,
  MAX_STEP_PCT: 20, // không đổi quá ±20% mỗi lần chạy
  MIN_CLICKS_FOR_DATA: 10, // dưới ngưỡng này = chưa đủ ý nghĩa thống kê
  CVR_BOOST_THRESHOLD_PCT: 10, // CVR >= 10% mới đủ điều kiện tăng bid
} as const

/** Công thức lõi: Bid tối ưu = Target ACOS × CVR × AOV (đơn vị % nhân về thập phân) */
export function formulaOptimalBid(targetAcosPct: number, cvrPct: number, aovUsd: number): number {
  if (targetAcosPct <= 0 || cvrPct <= 0 || aovUsd <= 0) return 0
  return (targetAcosPct / 100) * (cvrPct / 100) * aovUsd
}

/** Clamp theo guardrail: floor/ceiling + bước nhảy tối đa quanh currentBid */
export function applyBidGuardrails(
  optimalBid: number,
  currentBid: number,
  opts?: { minBid?: number; maxBid?: number; maxStepPct?: number }
): number {
  const min = opts?.minBid ?? BID_GUARDRAILS.MIN_BID_USD
  const max = opts?.maxBid ?? BID_GUARDRAILS.MAX_BID_USD
  const step = (opts?.maxStepPct ?? BID_GUARDRAILS.MAX_STEP_PCT) / 100
  const floorByStep = currentBid * (1 - step)
  const ceilByStep = currentBid * (1 + step)
  const bounded = Math.min(Math.max(optimalBid, floorByStep), ceilByStep)
  return Number(Math.min(Math.max(bounded, min), max).toFixed(2))
}

/**
 * Đánh giá 1 từ khóa trong window 7–14 ngày:
 *  - clicks < MIN_CLICKS_FOR_DATA -> NO_DATA (giữ nguyên, tránh quyết định trên nhiễu)
 *  - ACOS thực tế > target       -> HẠ bid tiến về bid tối ưu (bước nhảy có caps)
 *  - ACOS < target && CVR cao    -> TĂNG bid chiếm khoảng trống hiển thị
 */
export function evaluateKeywordBid(input: BidEvaluationInput): BidProposal {
  const { clicks, spend, sales, orders, currentBid, targetAcosPct, aovUsd } = input
  const cvrPct = clicks > 0 ? (orders / clicks) * 100 : 0
  const acosPct = sales > 0 ? (spend / sales) * 100 : null

  const base = {
    keywordId: input.keywordId,
    keywordText: input.keywordText,
    matchType: input.matchType,
    campaignId: input.campaignId,
    campaignName: input.campaignName,
    clientId: input.clientId,
    currentBid,
    acosPct: acosPct === null ? null : Number(acosPct.toFixed(2)),
    cvrPct: Number(cvrPct.toFixed(2)),
    clicks,
    spend: Number(spend.toFixed(2)),
    targetAcosPct,
  }

  // Chưa đủ dữ liệu thống kê
  if (clicks < BID_GUARDRAILS.MIN_CLICKS_FOR_DATA) {
    return {
      ...base,
      recommendedBid: currentBid,
      changePct: 0,
      action: 'NO_DATA',
      reason: `Chỉ ${clicks} clicks trong window (< ${BID_GUARDRAILS.MIN_CLICKS_FOR_DATA}) — chưa đủ dữ liệu, giữ nguyên bid.`,
    }
  }

  const optimal = formulaOptimalBid(targetAcosPct, cvrPct, aovUsd)

  // Đốt tiền: có click liên tục nhưng 0 đơn -> hạ mạnh về floor theo bước nhảy
  if (orders === 0 || sales === 0) {
    const recommended = applyBidGuardrails(currentBid * 0.5, currentBid) // −50% clamp về −20%
    return {
      ...base,
      recommendedBid: recommended,
      changePct: Number((((recommended - currentBid) / currentBid) * 100).toFixed(1)),
      action: 'DECREASE',
      reason: `${clicks} clicks, 0 đơn (đốt tiền $${spend.toFixed(2)}) — hạ bid theo guardrail, đồng thời là ứng viên Negative.`,
    }
  }

  const overTarget = acosPct !== null && acosPct > targetAcosPct
  const underTarget = acosPct !== null && acosPct <= targetAcosPct

  if (overTarget) {
    const recommended = applyBidGuardrails(optimal, currentBid)
    return {
      ...base,
      recommendedBid: recommended,
      changePct: Number((((recommended - currentBid) / currentBid) * 100).toFixed(1)),
      action: 'DECREASE',
      reason: `ACOS ${acosPct!.toFixed(1)}% > target ${targetAcosPct}%. Bid tối ưu theo công thức = $${optimal.toFixed(2)} (Target ACOS × CVR ${cvrPct.toFixed(1)}% × AOV $${aovUsd.toFixed(2)}).`,
    }
  }

  if (underTarget && cvrPct >= BID_GUARDRAILS.CVR_BOOST_THRESHOLD_PCT && optimal > currentBid) {
    const recommended = applyBidGuardrails(optimal, currentBid)
    return {
      ...base,
      recommendedBid: recommended,
      changePct: Number((((recommended - currentBid) / currentBid) * 100).toFixed(1)),
      action: 'INCREASE',
      reason: `ACOS ${acosPct!.toFixed(1)}% <= target && CVR ${cvrPct.toFixed(1)}% cao — tăng bid chiếm khoảng trống hiển thị (Top of Search).`,
    }
  }

  return {
    ...base,
    recommendedBid: currentBid,
    changePct: 0,
    action: 'HOLD',
    reason: `Hiệu suất trong biên mục tiêu (ACOS ${acosPct!.toFixed(1)}% / CVR ${cvrPct.toFixed(1)}%) — giữ nguyên bid.`,
  }
}

// ---------------- 2. AUTO NEGATIVE KEYWORD ----------------

export interface SearchTermRow {
  id?: string
  searchTerm: string
  matchTypeSource: string
  campaignId?: string
  campaignName: string
  adGroupName?: string
  clientId?: string
  impressions: number
  clicks: number
  spend: number
  sales: number
  orders: number
}

export interface NegativeProposal {
  searchTerm: string
  campaignId?: string
  campaignName: string
  matchTypeSource: string
  clicks: number
  spend: number
  orders: number
  acosPct: number | null
  negativeType: 'NEGATIVE_EXACT' | 'NEGATIVE_PHRASE'
  estimatedSavingsUsd: number
  reason: string
  confidence: number
}

/** Token "ăn tiền" kinh điển -> đề xuất Negative Phrase để bắt cả biến thể */
const WASTE_TOKENS = [
  'cheap', 'free', 'bulk', 'wholesale', 'used', 'diy', 'replica',
  'fake', 'imitation', 'dollar store', 'clearance', 'b stock',
]

export const NEGATIVE_DEFAULTS = {
  MIN_CLICKS: 12, // theo spec: > 10–15 clicks
  MAX_ACOS_PCT: 150, // "ACOS quá cao" = gấp 6 lần target phổ biến 25%
} as const

export function detectNegativeSearchTerms(
  rows: SearchTermRow[],
  opts?: { minClicks?: number; maxAcosPct?: number; targetAcosPct?: number }
): NegativeProposal[] {
  const minClicks = opts?.minClicks ?? NEGATIVE_DEFAULTS.MIN_CLICKS
  const maxAcos = opts?.maxAcosPct ?? NEGATIVE_DEFAULTS.MAX_ACOS_PCT
  const target = opts?.targetAcosPct ?? 25
  const proposals: NegativeProposal[] = []

  for (const r of rows) {
    if (r.clicks < minClicks) continue

    const acos = r.sales > 0 ? (r.spend / r.sales) * 100 : null
    const zeroConversion = r.orders === 0
    const acosTooHigh = acos !== null && acos > maxAcos
    if (!zeroConversion && !acosTooHigh) continue

    const lower = r.searchTerm.toLowerCase()
    const hasWasteToken = WASTE_TOKENS.some((t) => lower.includes(t))
    const negativeType: NegativeProposal['negativeType'] = hasWasteToken
      ? 'NEGATIVE_PHRASE'
      : 'NEGATIVE_EXACT'

    // Tiết kiệm ước tính: 0 đơn = toàn bộ spend là lãng phí; ACOS cao = phần vượt target
    const estimatedSavings =
      zeroConversion ? r.spend : Math.max(0, r.spend - (r.sales * target) / 100)

    proposals.push({
      searchTerm: r.searchTerm,
      campaignId: r.campaignId,
      campaignName: r.campaignName,
      matchTypeSource: r.matchTypeSource,
      clicks: r.clicks,
      spend: Number(r.spend.toFixed(2)),
      orders: r.orders,
      acosPct: acos === null ? null : Number(acos.toFixed(1)),
      negativeType,
      estimatedSavingsUsd: Number(estimatedSavings.toFixed(2)),
      reason: zeroConversion
        ? `${r.clicks} clicks / 0 đơn trong window — cắt lỗ ngay bằng ${negativeType === 'NEGATIVE_PHRASE' ? 'Negative Phrase (phát hiện token lãng phí)' : 'Negative Exact'}.`
        : `ACOS ${acos!.toFixed(0)}% vượt ngưỡng ${maxAcos}% với ${r.clicks} clicks — phủ định để dừng ăn tiền.`,
      confidence: zeroConversion && r.clicks >= 15 ? 96 : 88,
    })
  }

  return proposals.sort((a, b) => b.estimatedSavingsUsd - a.estimatedSavingsUsd)
}

// ---------------- 3. PLACEMENT OPTIMIZATION ----------------

export interface PlacementRow {
  campaignId?: string
  campaignName: string
  clientId?: string
  placement: 'TOP_OF_SEARCH' | 'PRODUCT_PAGES' | 'REST_OF_SEARCH'
  impressions: number
  clicks: number
  spend: number
  sales: number
  orders: number
  currentBoostPct?: number
  targetAcosPct?: number
}

export interface PlacementProposal {
  campaignName: string
  placement: PlacementRow['placement']
  currentBoostPct: number
  suggestedBoostPct: number
  acosPct: number | null
  cvrPct: number
  revenuePerClick: number
  action: 'BOOST_UP' | 'BOOST_DOWN' | 'HOLD'
  reason: string
}

export const PLACEMENT_GUARDRAILS = {
  MAX_BOOST_PCT: 50, // Amazon cho tối đa +900% nhưng guardrail nội bộ 50%
  BOOST_STEP_PCT: 15,
  ROI_EDGE_RATIO: 1.2, // ToS phải vượt trội >= 20% so với Product Pages
} as const

export function optimizePlacements(rows: PlacementRow[]): PlacementProposal[] {
  const byKey = new Map<string, PlacementRow[]>()
  for (const r of rows) {
    const key = r.campaignName
    byKey.set(key, [...(byKey.get(key) || []), r])
  }

  const proposals: PlacementProposal[] = []
  for (const [, group] of byKey) {
    const target = group[0]?.targetAcosPct ?? 25
    const metrics = (p: PlacementRow) => ({
      acos: p.sales > 0 ? (p.spend / p.sales) * 100 : null,
      cvr: p.clicks > 0 ? (p.orders / p.clicks) * 100 : 0,
      rpc: p.clicks > 0 ? p.sales / p.clicks : 0,
    })
    const tos = group.find((g) => g.placement === 'TOP_OF_SEARCH')
    const pp = group.find((g) => g.placement === 'PRODUCT_PAGES')
    if (!tos || !pp) continue

    const mTos = metrics(tos)
    const mPp = metrics(pp)
    const currentBoost = tos.currentBoostPct ?? 0

    // ToS vượt trội: RPC cao hơn >= 20% VÀ ACOS <= target -> boost thêm
    const tosSuperior =
      mTos.rpc > mPp.rpc * PLACEMENT_GUARDRAILS.ROI_EDGE_RATIO &&
      mTos.acos !== null &&
      mTos.acos <= target

    // ToS ăn tiền: ACOS vượt 1.5x target -> hạ boost về 0
    const tosBleeding = mTos.acos !== null && mTos.acos > target * 1.5

    if (tosSuperior) {
      const suggested = Math.min(
        currentBoost + PLACEMENT_GUARDRAILS.BOOST_STEP_PCT,
        PLACEMENT_GUARDRAILS.MAX_BOOST_PCT
      )
      proposals.push({
        campaignName: tos.campaignName,
        placement: 'TOP_OF_SEARCH',
        currentBoostPct: currentBoost,
        suggestedBoostPct: suggested,
        acosPct: mTos.acos === null ? null : Number(mTos.acos.toFixed(1)),
        cvrPct: Number(mTos.cvr.toFixed(1)),
        revenuePerClick: Number(mTos.rpc.toFixed(2)),
        action: suggested === currentBoost ? 'HOLD' : 'BOOST_UP',
        reason: `ROI tại ToS vượt trội: RPC $${mTos.rpc.toFixed(2)} vs Product Pages $${mPp.rpc.toFixed(2)} (+${(((mTos.rpc - mPp.rpc) / Math.max(mPp.rpc, 0.01)) * 100).toFixed(0)}%), ACOS ${mTos.acos!.toFixed(1)}% trong target -> cộng thêm ${suggested - currentBoost}% boost.`,
      })
    } else if (tosBleeding) {
      proposals.push({
        campaignName: tos.campaignName,
        placement: 'TOP_OF_SEARCH',
        currentBoostPct: currentBoost,
        suggestedBoostPct: 0,
        acosPct: Number(mTos.acos!.toFixed(1)),
        cvrPct: Number(mTos.cvr.toFixed(1)),
        revenuePerClick: Number(mTos.rpc.toFixed(2)),
        action: currentBoost === 0 ? 'HOLD' : 'BOOST_DOWN',
        reason: `ACOS ToS ${mTos.acos!.toFixed(1)}% > ${target * 1.5}% (1.5× target) — hạ boost về 0% để dừng trả phí vị trí đắt.`,
      })
    } else {
      proposals.push({
        campaignName: tos.campaignName,
        placement: 'TOP_OF_SEARCH',
        currentBoostPct: currentBoost,
        suggestedBoostPct: currentBoost,
        acosPct: mTos.acos === null ? null : Number(mTos.acos.toFixed(1)),
        cvrPct: Number(mTos.cvr.toFixed(1)),
        revenuePerClick: Number(mTos.rpc.toFixed(2)),
        action: 'HOLD',
        reason: `ToS hiệu suất ổn định (RPC $${mTos.rpc.toFixed(2)} vs PP $${mPp.rpc.toFixed(2)}) — giữ boost ${currentBoost}%.`,
      })
    }
  }
  return proposals
}
