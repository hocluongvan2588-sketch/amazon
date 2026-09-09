// ============================================================
// CRO ENGINE — Sprint audit trang "Brand Intel & CRO Desk"
// ------------------------------------------------------------
// TRƯỚC ĐÂY: +$4,620/+$2,840 uplift, loại điểm nghẽn, toàn bộ
// câu chẩn đoán, và "Nhận định chiến lược" đều là CHUỖI/SỐ LƯU
// SẴN trong mock-data. Nút "Tạo Task cho Designer" & "Tăng thầu
// Exact" không có onClick; dòng ta đang THẮNG rank vẫn bảo
// "Tăng thầu để vượt rank".
//
// GIỜ chia rõ 2 lớp minh bạch:
//  (1) INPUT — chỉ số phiên (CTR/CVR/bounce + benchmark): đây là
//      số liệu SP-API Business Report, hệ thống KHÔNG tự sinh
//      được → hiện SIMULATED, khi có credentials sẽ là số thật.
//  (2) ENGINE — mọi thứ còn lại TÍNH TỪ CÔNG THỨC: sessions suy
//      ra từ velocity tồn kho + CVR (đồng nhất với trang Kho),
//      phân loại điểm nghẽn theo rule, uplift = doanh thu tháng ×
//      khoảng trống tới benchmark. Sửa 1 input → cả trang đổi.
// ============================================================

import { CompetitorReverseAsin, ConversionDiagnostic, CroMetricInput } from './types'

export interface CroPriceSignal { sku: string; price: number }
export interface CroVelocitySignal { sku: string; dailyVelocity7d: number }

const NGHIEM_TRONG = 0.1 // ngưỡng 10% coi là có nghẽn đáng kể

/** Xây 1 chẩn đoán hoàn chỉnh từ (chỉ số phiên + giá + velocity).
 *  Trả về null nếu SKU KHÔNG có nghẽn (CTR & CVR đạt chuẩn, bounce thấp) —
 *  sản phẩm khỏe không nên nằm trong danh sách "Cần tối ưu". */
export function buildConversionDiagnostic(
  m: CroMetricInput,
  price: number | undefined,
  velocity7d: number | undefined
): ConversionDiagnostic | null {
  const ctrGap = (m.categoryBenchmarkCtr - m.ctr) / m.categoryBenchmarkCtr // >0: CTR thiếu so chuẩn
  const cvrGap = (m.categoryBenchmarkCvr - m.unitSessionPercentage) / m.categoryBenchmarkCvr
  const gap = Math.max(ctrGap, cvrGap)
  if (gap < NGHIEM_TRONG && m.bounceRate < 55) return null

  const bottleneckType: ConversionDiagnostic['bottleneckType'] =
    ctrGap >= cvrGap
      ? 'IMAGE_GALLERY'
      : m.bounceRate >= 50
        ? 'PRICE_DISCONNECT'
        : 'BULLET_POINTS'

  // Sessions suy ra từ velocity tồn kho & CVR (không lưu sẵn — đồng nhất số với trang Kho)
  const orders7d = (velocity7d ?? 0) * 7
  const sessions7d =
    m.unitSessionPercentage > 0 ? Math.round((orders7d * 100) / m.unitSessionPercentage) : 0

  // Uplift = doanh thu tháng hiện tại × khoảng trống tới benchmark (chặn tối đa +100%)
  const monthlyRevenue = (velocity7d ?? 0) * 30 * (price ?? 0)
  const headroom =
    bottleneckType === 'IMAGE_GALLERY'
      ? Math.min(1, m.categoryBenchmarkCtr / m.ctr - 1)
      : Math.min(1, m.categoryBenchmarkCvr / m.unitSessionPercentage - 1)
  const estimatedRevenueUpliftMonthly = Math.max(0, Math.round(monthlyRevenue * headroom))

  const extraSessionsMo = Math.round(sessions7d * 4.3 * headroom)
  const ctrGapPct = Math.round(ctrGap * 100)
  const cvrGapPct = Math.round(cvrGap * 100)
  const cvrTrangThai =
    m.unitSessionPercentage >= m.categoryBenchmarkCvr
      ? `đang TRÊN chuẩn ${m.categoryBenchmarkCvr}% — khách bấm vào là mua, vấn đề nằm ở khâu thu hút nhấp`
      : `thấp hơn chuẩn ${m.categoryBenchmarkCvr}%`

  let diagnosisTitleVi: string
  let diagnosisDetailVi: string
  let suggestedActionVi: string

  if (bottleneckType === 'IMAGE_GALLERY') {
    diagnosisTitleVi = `CTR thấp hơn chuẩn ngành ${ctrGapPct}% — nghẽn ở Ảnh chính (Hero Image)`
    diagnosisDetailVi =
      `CTR hiện tại ${m.ctr}% so với chuẩn ngành ${m.categoryBenchmarkCtr}%: cùng vị trí hiển thị, ` +
      `listing thu hút nhấp ít hơn ${ctrGapPct}%. Trong khi đó CVR ${m.unitSessionPercentage}% ${cvrTrangThai}. ` +
      `Nếu CTR đạt chuẩn, ước tính thêm ~+${extraSessionsMo.toLocaleString()} phiên truy cập/tháng.`
    suggestedActionVi =
      `Thay Hero Image: góc chụp 45° hiện sản phẩm + bao bì, nền tương phản, huy hiệu xuất xứ; ` +
      `A/B test qua Manage Your Experiments — mục tiêu CTR ≥ ${m.categoryBenchmarkCtr}% trong 14 ngày.`
  } else if (bottleneckType === 'PRICE_DISCONNECT') {
    diagnosisTitleVi = `CVR thấp hơn chuẩn ${cvrGapPct}% với bounce ${m.bounceRate}% — khách vào rồi thoát (định giá/nội dung chưa thuyết phục)`
    diagnosisDetailVi =
      `Traffic tốt (CTR ${m.ctr}% ≥ chuẩn ${m.categoryBenchmarkCtr}%) nhưng ${m.bounceRate}% phiên thoát trang, ` +
      `CVR chỉ ${m.unitSessionPercentage}% so với chuẩn ${m.categoryBenchmarkCvr}%. Dấu hiệu kinh điển của ` +
      `PRICE DISCONNECT: khách không thấy giá trị tương xứng — thiếu bảng so sánh dinh dưỡng/công thức sử dụng ` +
      `hoặc giá/đơn vị cao hơn đối thủ cùng kệ hàng.`
    suggestedActionVi =
      `Thêm module A+ Brand Story: bảng dinh dưỡng, 3 công thức sử dụng phổ biến, so sánh giá/đơn vị với đối thủ; ` +
      `rà soát lại định giá — mục tiêu CVR ≥ ${m.categoryBenchmarkCvr}% và bounce ≤ 45%.`
  } else {
    diagnosisTitleVi = `CVR thấp hơn chuẩn ${cvrGapPct}% — nội dung bullets chưa trả lời thắc mắc mua hàng`
    diagnosisDetailVi =
      `CTR ${m.ctr}% đạt chuẩn ${m.categoryBenchmarkCtr}% nhưng CVR ${m.unitSessionPercentage}% < chuẩn ` +
      `${m.categoryBenchmarkCvr}%, bounce ${m.bounceRate}%. Khách đọc xong vẫn chưa thấy lý do tin tưởng để mua — ` +
      `nghi vấn nằm ở 5 bullets và phần mô tả.`
    suggestedActionVi =
      `Viết lại 5 bullets theo công thức Benefit → Proof → Use-case, chèn từ khóa harvest có volume cao nhất ` +
      `vào bullet 1–2 — mục tiêu CVR ≥ ${m.categoryBenchmarkCvr}%.`
  }

  return {
    sku: m.sku,
    asin: m.asin,
    title: m.title,
    sessions7d,
    unitSessionPercentage: m.unitSessionPercentage,
    categoryBenchmarkCvr: m.categoryBenchmarkCvr,
    ctr: m.ctr,
    categoryBenchmarkCtr: m.categoryBenchmarkCtr,
    bounceRate: m.bounceRate,
    bottleneckType,
    diagnosisTitleVi,
    diagnosisDetailVi,
    suggestedActionVi,
    estimatedRevenueUpliftMonthly,
  }
}

/** Danh sách chẩn đoán cho cả catalog (bỏ SKU khỏe, sắp theo uplift giảm dần). */
export function computeConversionDiagnostics(
  metrics: CroMetricInput[],
  prices: CroPriceSignal[],
  velocities: CroVelocitySignal[]
): ConversionDiagnostic[] {
  return metrics
    .map((m) =>
      buildConversionDiagnostic(
        m,
        prices.find((p) => p.sku === m.sku)?.price,
        velocities.find((v) => v.sku === m.sku)?.dailyVelocity7d
      )
    )
    .filter((d): d is ConversionDiagnostic => d !== null)
    .sort((a, b) => b.estimatedRevenueUpliftMonthly - a.estimatedRevenueUpliftMonthly)
}

/** Hành động đề xuất theo từng từ khóa — theo RULE, không còn 1 câu lặp cho mọi dòng. */
export function keywordBattleAction(kw: {
  keyword: string
  competitorOrganicRank: number
  ourOrganicRank: number
  searchVolume: number
}): { label: string; weWin: boolean; urgency: 'ATTACK' | 'DEFEND' | 'MONITOR' } {
  if (kw.ourOrganicRank < kw.competitorOrganicRank) {
    return {
      label: `Thắng rank #${kw.ourOrganicRank} vs #${kw.competitorOrganicRank} — Phòng thủ Exact`,
      weWin: true,
      urgency: 'DEFEND',
    }
  }
  if (kw.searchVolume >= 10000) {
    return { label: 'Tăng thầu Exact để vượt rank', weWin: false, urgency: 'ATTACK' }
  }
  return { label: 'Volume thấp — thêm Exact ngân sách nhỏ', weWin: false, urgency: 'MONITOR' }
}

/** "Nhận định Chiến lược" sinh TỪ SỐ LIỆU (ASP, pack size, tỉ số rank) — không còn chuỗi lưu sẵn. */
export function buildCompetitorInsight(
  comp: CompetitorReverseAsin,
  ourProduct?: { title: string; price: number }
): string {
  const asp = comp.estimatedMonthlyUnits > 0
    ? comp.estimatedMonthlyRevenueUsd / comp.estimatedMonthlyUnits
    : comp.price
  const wins = comp.sharedTopKeywords.filter((k) => k.ourOrganicRank < k.competitorOrganicRank).length
  const total = comp.sharedTopKeywords.length
  const parts: string[] = []

  parts.push(
    `${comp.competitorBrand} chạy ~${comp.estimatedMonthlyUnits.toLocaleString()} đơn/tháng ` +
    `(ASP ~$${asp.toFixed(2)}), BSR #${comp.bsrRank}, ${comp.reviewRating}★/${comp.reviewCount.toLocaleString()} đánh giá.`
  )

  const packRe = /pack of (\d+)/i
  const compPack = comp.productTitle.match(packRe)
  const ourPack = ourProduct?.title.match(packRe)
  if (compPack && ourPack && ourProduct) {
    const compPerUnit = comp.price / Number(compPack[1])
    const ourPerUnit = ourProduct.price / Number(ourPack[1])
    const diffPct = Math.round(((ourPerUnit - compPerUnit) / compPerUnit) * 100)
    parts.push(
      `Giá/đơn vị: đối thủ $${compPerUnit.toFixed(2)} so với ta $${ourPerUnit.toFixed(2)} ` +
      `(ta ${diffPct >= 0 ? 'cao' : 'thấp'} hơn ${Math.abs(diffPct)}% — ${diffPct > 50 ? 'phải thắng bằng khác biệt hóa, không đánh giá' : 'mức cạnh tranh được'}).`
    )
  }

  parts.push(
    `Tỉ số rank từ khóa trọng điểm: ta ${wins}/${total}. ` +
    (wins >= total / 2
      ? 'Thế đang tốt — ưu tiên phòng thủ vị thế Exact hiện có và mở rộng long-tail.'
      : 'Đang thua thế rank — tập trung ngân sách Exact vào các từ khóa volume ≥10k đang thua, đồng thời đẩy rating/review.')
  )
  return parts.join(' ')
}
