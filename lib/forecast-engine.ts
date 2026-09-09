// ====================================================================
// VEXIM FORECAST & CAPACITY ENGINE (Sprint 3.3) — THUẦN DETERMINISTIC
// 1) Weighted Velocity theo spec 50/30/20 (7 ngày / 14 ngày / 30 ngày)
// 2) Days of Supply thời gian thực + ngày đứt hàng dự kiến
// 3) Capacity Bid Suggestion: ft³ cần mua thêm cho đỉnh Q4 + mức bid $/ft³
//    tối ưu để giữ 100% Performance Credits mà không ăn vào biên lợi nhuận
// Thuần hàm, không network/DB — unit-test được. Engine Vexim theo nghiệp vụ,
// minh bạch công thức trong từng output (không phải "thuật toán Amazon").
// ====================================================================

export const FORECAST_WEIGHTS = {
  V7: 0.5, // 50% trọng số 7 ngày gần nhất
  V14: 0.3, // 30% trọng số 14 ngày
  V30: 0.2, // 20% trọng số 30 ngày
} as const

/** Hệ số mùa vụ (tham chiếu Q4/Prime/post-holiday) */
export function seasonalityMultiplier(month: number): { value: number; label: string; isPeak: boolean } {
  if (month >= 10) return { value: 1.65, label: 'Q4 Holiday Surge (Oct–Dec)', isPeak: true }
  if (month === 12) return { value: 1.65, label: 'Q4 Holiday Surge', isPeak: true }
  if (month === 11 || month === 10) return { value: 1.65, label: 'Q4 Holiday Surge', isPeak: true }
  if (month === 7) return { value: 1.35, label: 'Prime Day Season (Jul)', isPeak: true }
  if (month <= 2) return { value: 0.85, label: 'Post-Holiday Dip (Jan–Feb)', isPeak: false }
  return { value: 1.0, label: 'Normal Season', isPeak: false }
}

export interface VelocityInput {
  velocity7d: number
  /** Tuỳ chọn — thiếu sẽ suy ngược trung bình 7d/30d (backfill mode) */
  velocity14d?: number
  velocity30d: number
}

/** Tốc độ bán trọng số 50/30/20 — units/ngày. Trả kèm cờ fallback nếu thiếu 14d */
export function weightedVelocity(input: VelocityInput): {
  value: number
  velocity14dUsed: number
  usedFallback14d: boolean
} {
  const { velocity7d, velocity30d } = input
  const has14 = typeof input.velocity14d === 'number' && input.velocity14d > 0
  const v14 = has14 ? input.velocity14d! : (velocity7d + velocity30d) / 2
  const value = velocity7d * FORECAST_WEIGHTS.V7 + v14 * FORECAST_WEIGHTS.V14 + velocity30d * FORECAST_WEIGHTS.V30
  return {
    value: Number(value.toFixed(2)),
    velocity14dUsed: Number(v14.toFixed(2)),
    usedFallback14d: !has14,
  }
}

export interface DoSInput extends VelocityInput {
  fbaAvailable: number
  fbaInbound: number
  /** Tháng hiện tại (1–12) — dùng hệ số mùa vụ cho dự báo đỉnh */
  month?: number
}

export interface DaysOfSupplyResult {
  weightedVelocity: number
  velocity14dUsed: number
  usedFallback14d: boolean
  seasonality: { value: number; label: string; isPeak: boolean }
  /** Tốc độ chi phối hiện tại (weighted, chưa nhân mùa) */
  baseVelocity: number
  /** Tốc độ dự báo khi vào đỉnh Q4 */
  projectedPeakVelocity: number
  /** Số ngày còn đủ hàng THEO TỐC ĐỘ TRỌNG SỐ HIỆN TẠI */
  daysOfSupply: number
  /** Nếu tính cả hàng đang trên đường về (inbound) */
  daysOfSupplyWithInbound: number
  estimatedStockoutDate: string | null
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'HEALTHY'
  formula: string
}

/** Days of Supply = (Available [+ Inbound]) / Weighted Velocity — thời gian thực */
export function forecastDaysOfSupply(input: DoSInput): DaysOfSupplyResult {
  const wv = weightedVelocity(input)
  const month = input.month ?? new Date().getMonth() + 1
  const seasonality = seasonalityMultiplier(month)
  const baseVelocity = Math.max(wv.value, 0.1)
  const projectedPeakVelocity = Number((baseVelocity * seasonality.value).toFixed(2))

  const dos = input.fbaAvailable / baseVelocity
  const dosWithInbound = (input.fbaAvailable + input.fbaInbound) / baseVelocity

  const stockoutDate =
    dos > 0 && isFinite(dos)
      ? new Date(Date.now() + dos * 86400_000).toISOString().slice(0, 10)
      : null

  let riskLevel: DaysOfSupplyResult['riskLevel'] = 'HEALTHY'
  if (dos < 14) riskLevel = 'CRITICAL'
  else if (dos < 21) riskLevel = 'HIGH'
  else if (dos < 30) riskLevel = 'MEDIUM'

  return {
    weightedVelocity: wv.value,
    velocity14dUsed: wv.velocity14dUsed,
    usedFallback14d: wv.usedFallback14d,
    seasonality,
    baseVelocity,
    projectedPeakVelocity,
    daysOfSupply: Number(dos.toFixed(1)),
    daysOfSupplyWithInbound: Number(dosWithInbound.toFixed(1)),
    estimatedStockoutDate: stockoutDate,
    riskLevel,
    formula: `(${input.fbaAvailable} + 0) ÷ (${input.velocity7d}×0.5 + ${wv.velocity14dUsed}×0.3 + ${input.velocity30d}×0.2) = ${dos.toFixed(1)} ngày`,
  }
}

// ---------------- CAPACITY BID SUGGESTION ----------------

export interface CapacitySuggestionInput {
  /** Tốc độ bán weighted hiện tại (units/ngày) */
  baseVelocity: number
  /** Hệ số mùa vụ đỉnh Q4 (vd 1.65) */
  peakMultiplier: number
  /** Số ngày phủ hàng mục tiêu cho đỉnh (mặc định 45 ngày) */
  targetCoverageDays?: number
  /** Hệ số an toàn (mặc định 1.15) */
  safetyFactor?: number
  /** Thể tích 1 unit (ft³) — từ kích thước sản phẩm */
  cubicFeetPerUnit: number
  /** Hạn ngạch hiện tại (ft³/tháng) */
  monthlyLimitCubicFeet: number
  /** Đã dùng trong tháng (ft³) */
  currentUsageCubicFeet: number
  /** Kinh tế đơn giá để tính mức bid tối đa hợp lý */
  priceUsd: number
  unitCostUsd: number
  fbaFeeUsd: number
  referralFeeUsd: number
  storageType?: 'STANDARD_SIZE' | 'OVERSIZE' | 'APPAREL'
}

export interface CapacityBidSuggestion {
  storageType: 'STANDARD_SIZE' | 'OVERSIZE' | 'APPAREL'
  /** Tốc độ bán đỉnh Q4 dự báo */
  projectedPeakVelocity: number
  /** Units cần có để phủ target coverage days ở đỉnh */
  targetCoverageUnits: number
  /** ft³ cần cho lượng units đó (đã gồm safety factor) */
  requiredCubicFeet: number
  /** ft³ còn trống của hạn ngạch tháng */
  freeCubicFeet: number
  /** ft³ THỰC SỰ CẦN mua thêm (max(0, required − free)) */
  extraCubicFeetToBuy: number
  /** Mức bid đề xuất ($/ft³) */
  suggestedBidPerCubicFeet: number
  /** Mức bid trần an toàn (50% biên lợi nhuận trên mỗi ft³) */
  maxSafeBidPerCubicFeet: number
  /** Biên lợi nhuận trên mỗi ft³ bán được */
  marginPerCubicFeet: number
  /** Phí giữ chỗ ước tính nếu bid được chấp nhận toàn bộ */
  estimatedReservationFeeUsd: number
  /** Cảnh báo nghiệp vụ */
  warnings: string[]
  formula: string
}

export const CAPACITY_GUARDRAILS = {
  DEFAULT_COVERAGE_DAYS: 45,
  DEFAULT_SAFETY_FACTOR: 1.15,
  /** Bid sàn — Amazon thường duyệt từ ~$0.10/ft³ ở mùa cao điểm */
  MIN_BID_USD: 0.1,
  /** Mức bid THAM CHIẾU thị trường Q4 (typical accepted range $0.10–0.40) */
  MARKET_REF_BID_USD: 0.2,
  /** Trần giá tuyệt đối theo chính sách nội bộ Vexim */
  MAX_BID_USD: 1.0,
  /** Chỉ dùng tối đa 50% biên lợi nhuận trên ft³ để trả phí giữ chỗ */
  MARGIN_SHARE_FOR_BID: 0.5,
} as const

/**
 * Tính ft³ thực sự cần mua thêm + mức bid tối ưu:
 *  - Required ft³ = Velocity × PeakMultiplier × CoverageDays × ft³/unit × Safety
 *  - Extra ft³ = max(0, Required − Hạn ngạch còn trống)
 *  - Bid đề xuất = mức tham chiếu thị trường Q4 ($0.20), chặn bởi
 *    trần an toàn 50% biên lợi nhuận/ft³ và trần chính sách; sàn $0.10.
 *    (Margin dồi dào cũng không trả cao hơn mặt bằng thị trường — tiết kiệm phí giữ chỗ.)
 */
export function capacityBidSuggestion(input: CapacitySuggestionInput): CapacityBidSuggestion {
  const coverageDays = input.targetCoverageDays ?? CAPACITY_GUARDRAILS.DEFAULT_COVERAGE_DAYS
  const safety = input.safetyFactor ?? CAPACITY_GUARDRAILS.DEFAULT_SAFETY_FACTOR
  const storageType = input.storageType ?? 'STANDARD_SIZE'
  const warnings: string[] = []

  const projectedPeakVelocity = Number((input.baseVelocity * input.peakMultiplier).toFixed(2))
  const targetCoverageUnits = Math.ceil(projectedPeakVelocity * coverageDays)
  const ft3PerUnit = input.cubicFeetPerUnit > 0 ? input.cubicFeetPerUnit : 0.05
  const requiredCubicFeet = Math.ceil(targetCoverageUnits * ft3PerUnit * safety)
  const freeCubicFeet = Math.max(0, Math.floor(input.monthlyLimitCubicFeet - input.currentUsageCubicFeet))
  const extraCubicFeetToBuy = Math.max(0, requiredCubicFeet - freeCubicFeet)

  const marginPerUnit = input.priceUsd - input.unitCostUsd - input.fbaFeeUsd - input.referralFeeUsd
  const marginPerCubicFeet = ft3PerUnit > 0 ? Number((marginPerUnit / ft3PerUnit).toFixed(2)) : 0

  if (marginPerUnit <= 0) {
    warnings.push('Biên lợi nhuận trên unit âm hoặc bằng 0 — rà soát lại giá/chi phí trước khi mua thêm dung lượng.')
  }
  if (extraCubicFeetToBuy === 0) {
    warnings.push('Hạn ngạch còn trống đủ cho dự báo đỉnh Q4 — KHÔNG cần mua thêm ft³ ở chu kỳ này.')
  }

  const maxSafeBid = Number((marginPerCubicFeet * CAPACITY_GUARDRAILS.MARGIN_SHARE_FOR_BID).toFixed(2))
  // Bid đề xuất = tham chiếu thị trường, bị chặn bởi trần an toàn (50% biên) và trần chính sách
  let suggestedBid = Math.min(
    CAPACITY_GUARDRAILS.MARKET_REF_BID_USD,
    maxSafeBid,
    CAPACITY_GUARDRAILS.MAX_BID_USD
  )
  suggestedBid = Number(Math.max(suggestedBid, CAPACITY_GUARDRAILS.MIN_BID_USD).toFixed(2))
  if (maxSafeBid < CAPACITY_GUARDRAILS.MIN_BID_USD && extraCubicFeetToBuy > 0) {
    warnings.push(
      `Biên lợi nhuận/ft³ mỏng ($${
        marginPerCubicFeet
      }) — bid sàn $${CAPACITY_GUARDRAILS.MIN_BID_USD}/ft³ đã chiếm hơn 50% biên. Cân nhắc tăng giá bán hoặc giảm coverage days.`
    )
  }

  if (maxSafeBid < CAPACITY_GUARDRAILS.MARKET_REF_BID_USD && extraCubicFeetToBuy > 0) {
    warnings.push(
      `Trần an toàn ($${maxSafeBid}/ft³ = 50% biên) thấp hơn tham chiếu thị trường $${CAPACITY_GUARDRAILS.MARKET_REF_BID_USD} — đang bid sát biên, cân nhắc tăng giá bán.`
    )
  }

  const estimatedReservationFeeUsd = Number((extraCubicFeetToBuy * suggestedBid).toFixed(2))
  if (estimatedReservationFeeUsd > marginPerCubicFeet * targetCoverageUnits * 0.3 && extraCubicFeetToBuy > 0) {
    warnings.push('Phí giữ chỗ ước tính lớn so với tổng biên lợi nhuận kỳ đỉnh — xem xét giảm coverage days.')
  }

  return {
    storageType,
    projectedPeakVelocity,
    targetCoverageUnits,
    requiredCubicFeet,
    freeCubicFeet,
    extraCubicFeetToBuy,
    suggestedBidPerCubicFeet: suggestedBid,
    maxSafeBidPerCubicFeet: maxSafeBid,
    marginPerCubicFeet,
    estimatedReservationFeeUsd,
    warnings,
    formula: `Velocity ${input.baseVelocity} × Peak ${input.peakMultiplier}× × ${coverageDays} ngày × ${ft3PerUnit} ft³/unit × Safety ${safety} = ${requiredCubicFeet} ft³ cần → trừ hạn ngạch trống ${freeCubicFeet} ft³ → mua thêm ${extraCubicFeetToBuy} ft³ @ $${suggestedBid}/ft³ (tham chiếu thị trường $${CAPACITY_GUARDRAILS.MARKET_REF_BID_USD}, trần an toàn $${maxSafeBid} = 50% biên $${marginPerCubicFeet}/ft³).`,
  }
}

/** Quy đổi kích thước inches (dài×rộng×cao) -> ft³ per unit */
export function inchesToCubicFeet(lengthIn: number, widthIn: number, heightIn: number): number {
  if (lengthIn <= 0 || widthIn <= 0 || heightIn <= 0) return 0.05
  return Number(((lengthIn * widthIn * heightIn) / 1728).toFixed(4))
}
