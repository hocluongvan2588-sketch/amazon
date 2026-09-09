// ============================================================
// READINESS ENGINE — Sprint audit trang "Quản lý Sản phẩm & Launch"
// ------------------------------------------------------------
// TRƯỚC ĐÂY: readinessScore là HẰNG SỐ lưu sẵn trong mock-data
// (94/100, 89/100...) và supabase-service gán cứng canLaunch:true
// cho mọi sản phẩm DB. Trang chỉ "hiển thị" chứ không "chấm".
//
// GIỜ: chấm điểm 7 tiêu chí TỪ DỮ LIỆU THẬT của Product
// (title, ảnh, chi phí, chứng từ, cảnh báo pháp lý...). Mọi con
// số trên trang ProductManagement đều đi qua engine này — không
// còn con số nào được lưu sẵn.
// Lưu ý minh bạch: ảnh trong mock vẫn là ảnh placeholder Unsplash
// (thay bằng ảnh thật thì mediaAssets tự tăng khi dữ liệu đổi).
// ============================================================

import { Product, ProductReadinessScore } from './types'

export type ReadinessInput = Pick<
  Product,
  | 'title' | 'brand' | 'category' | 'subCategory'
  | 'mainImage' | 'galleryImages'
  | 'price' | 'cogs' | 'fbaFeeEstimated' | 'referralFeeEstimated' | 'estimatedMargin'
  | 'weightLbs' | 'dimensionsInches' | 'upc' | 'fnsku'
  | 'documents' | 'complianceIssues'
>

/** Biên lợi nhuận ròng THẬT = (giá − COGS − FBA fee − referral fee) / giá.
 *  Trước đây con số này lưu cứng trong dữ liệu (40.8). */
export function computeMarginPct(p: ReadinessInput): number {
  if (!p.price || p.price <= 0) return Math.round((p.estimatedMargin || 0) * 10) / 10
  const net = p.price - p.cogs - p.fbaFeeEstimated - p.referralFeeEstimated
  return Math.round((net / p.price) * 1000) / 10
}

const TITLE_IDEAL_MIN = 80 // Amazon grocery: title tối ưu 80–200 ký tự
const TITLE_IDEAL_MAX = 200
const REQUIRED_DOC_TYPES_FOOD = ['FDA_REGISTRATION', 'COA'] as const

function scoreProductInfo(p: ReadinessInput): number {
  let s = 0
  const t = (p.title || '').trim()
  if (t.length >= TITLE_IDEAL_MIN) s += 30
  else if (t.length >= 40) s += 20
  else if (t.length > 0) s += 10
  if (p.brand) s += 15
  if (p.category) s += 10
  const d = p.dimensionsInches
  if (d && d.length > 0 && d.width > 0 && d.height > 0) s += 15
  if (p.weightLbs > 0) s += 10
  if (p.upc) s += 10
  if (p.fnsku) s += 10
  return s // max 100
}

function scoreListingQuality(p: ReadinessInput): number {
  const t = (p.title || '').trim()
  if (!t) return 0
  let s: number
  if (t.length >= TITLE_IDEAL_MIN && t.length <= TITLE_IDEAL_MAX) s = 100
  else if (t.length > TITLE_IDEAL_MAX) s = 70 // vượt 200 ký tự: Amazon chặn CRUD
  else if (t.length >= 60) s = 85
  else if (t.length >= 40) s = 65
  else s = 40
  const letters = t.replace(/[^A-Za-z]/g, '')
  if (letters.length > 10 && letters === letters.toUpperCase()) s -= 15 // ALL CAPS vi phạm style
  if (p.brand && t.toLowerCase().includes(p.brand.toLowerCase())) s += 10
  return Math.max(0, Math.min(100, s))
}

function scoreMediaAssets(p: ReadinessInput): number {
  const n = (p.mainImage ? 1 : 0) + (p.galleryImages?.length || 0)
  // Amazon khuyến nghị ≥7 ảnh (1 main + 6 gallery; video là cộng hưởng)
  return Math.min(100, Math.round((n / 7) * 100))
}

const STOPWORDS = new Set(['for', 'with', 'and', 'the', 'of', 'in', 'a', 'an', 'pack', 'oz', 'new'])

function titleTokens(p: ReadinessInput): string[] {
  return Array.from(
    new Set(
      (p.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    )
  )
}

function scoreKeywordCoverage(p: ReadinessInput, searchTermPool: string[]): number {
  const tokens = titleTokens(p)
  if (tokens.length === 0) return 0
  if (searchTermPool.length === 0) {
    // Chưa có dữ liệu harvest thật → chấm theo độ giàu từ khóa cấu trúc title
    return Math.min(100, tokens.length * 12)
  }
  const pool = searchTermPool.join(' ').toLowerCase()
  const hits = tokens.filter((w) => pool.includes(w)).length
  return Math.round((hits / tokens.length) * 100)
}

function scorePricing(p: ReadinessInput): number {
  const m = computeMarginPct(p)
  if (m <= 0) return 0
  // mục tiêu ≥35% là đầy đủ điểm; dưới đó tính tuyến tính
  return Math.min(100, Math.round((m / 35) * 100))
}

function scoreCompliance(p: ReadinessInput): number {
  let s = 100
  for (const issue of p.complianceIssues || []) {
    if (issue.isResolved) continue
    if (issue.severity === 'CRITICAL_BLOCK') s -= 45
    else if (issue.severity === 'WARNING') s -= 15
    else s -= 5
  }
  return Math.max(0, s)
}

function scoreDocumentation(p: ReadinessInput): { score: number; missingRequired: string[]; expired: string[] } {
  const docs = p.documents || []
  const isFood = /grocery|food|gourmet|beverage|supplement/i.test(p.category || '')
  const required = isFood ? [...REQUIRED_DOC_TYPES_FOOD] : []
  let s = 100
  const missingRequired: string[] = []
  const expired: string[] = []
  for (const type of required) {
    const has = docs.some(
      (d) => d.type === type && (d.status === 'VERIFIED' || d.status === 'UNDER_REVIEW')
    )
    if (!has) {
      s -= 40
      missingRequired.push(type)
    }
  }
  if (!docs.some((d) => d.type === 'LABEL_SPEC')) s -= 10 // khuyến nghị, không chặn
  for (const d of docs) {
    if (d.status === 'EXPIRED') {
      s -= 15
      expired.push(d.title)
    } else if (d.status === 'REJECTED') s -= 20
  }
  return { score: Math.max(0, Math.min(100, s)), missingRequired, expired }
}

/** Chấm điểm Readiness hoàn toàn từ dữ liệu hiện có của sản phẩm.
 *  @param searchTermPool chuỗi search term đã harvest (tuỳ chọn) để đo độ phủ thật */
export function computeReadiness(p: ReadinessInput, searchTermPool: string[] = []): ProductReadinessScore {
  const productInfo = scoreProductInfo(p)
  const listingQuality = scoreListingQuality(p)
  const mediaAssets = scoreMediaAssets(p)
  const keywordCoverage = scoreKeywordCoverage(p, searchTermPool)
  const pricingCompetitiveness = scorePricing(p)
  const complianceScore = scoreCompliance(p)
  const docResult = scoreDocumentation(p)
  const documentationScore = docResult.score
  const marginPct = computeMarginPct(p)

  const overall = Math.round(
    productInfo * 0.15 +
    listingQuality * 0.2 +
    mediaAssets * 0.1 +
    keywordCoverage * 0.1 +
    pricingCompetitiveness * 0.15 +
    complianceScore * 0.15 +
    documentationScore * 0.15
  )

  // Blocker = điều kiện TUYỆT ĐỐI không được launch
  const criticalOpen = (p.complianceIssues || []).filter(
    (i) => i.severity === 'CRITICAL_BLOCK' && !i.isResolved
  )
  const blockers: string[] = []
  for (const i of criticalOpen) blockers.push(`Pháp lý: ${i.title}`)
  for (const type of docResult.missingRequired) blockers.push(`Thiếu chứng từ bắt buộc: ${type}`)
  if (docResult.expired.length > 0) blockers.push(`Chứng từ hết hạn: ${docResult.expired.join(', ')}`)
  if (marginPct < 0) blockers.push('Biên lợi nhuận âm — mô hình giá chưa khả thi')

  const canLaunch = blockers.length === 0 && overall >= 70

  // Khuyến nghị sinh TỪ khoảng trống thật (không phải câu lưu sẵn)
  const recs: string[] = []
  const tLen = (p.title || '').trim().length
  if (tLen < TITLE_IDEAL_MIN)
    recs.push(`Title đang ${tLen} ký tự — Amazon grocery tối ưu ${TITLE_IDEAL_MIN}–${TITLE_IDEAL_MAX} ký tự, hãy bổ sung từ khóa chính + thuộc tính.`)
  if (tLen > TITLE_IDEAL_MAX)
    recs.push(`Title vượt ${TITLE_IDEAL_MAX} ký tự — Amazon sẽ chặn khi tạo/cập nhật, cần rút gọn.`)
  const imgCount = (p.mainImage ? 1 : 0) + (p.galleryImages?.length || 0)
  if (imgCount < 7)
    recs.push(`Mới có ${imgCount}/7 ảnh — bổ sung ảnh gallery trắng nền 1600px + video/A+ Content để tối đa chuyển đổi.`)
  if (marginPct < 30 && marginPct >= 0)
    recs.push(`Biên lợi nhuận ròng ${marginPct}% dưới mục tiêu 30% — xem lại COGS hoặc giá bán.`)
  if (criticalOpen.length > 0)
    recs.push(`Xử lý ${criticalOpen.length} cảnh báo pháp lý CRITICAL: ${criticalOpen.map((i) => i.title).join('; ')}.`)
  for (const type of docResult.missingRequired)
    recs.push(`Tải lên chứng từ bắt buộc còn thiếu: ${type === 'FDA_REGISTRATION' ? 'FDA Food Facility Registration' : 'Certificate of Analysis (COA)'}.`)
  for (const ex of docResult.expired)
    recs.push(`Gia hạn chứng từ hết hạn: ${ex}.`)
  if (!p.upc) recs.push('Chưa có mã UPC/GTIN — cần trước khi tạo ASIN mới.')
  if (searchTermPool.length === 0)
    recs.push('Chạy Keyword Harvest (tab PPC) để đo độ phủ từ khóa thật của listing.')
  if (recs.length === 0)
    recs.push('Sản phẩm đủ điều kiện launch — giữ đồng bộ giá/tồn kho và theo dõi Voice of Customer sau khi lên sóng.')

  return {
    overall,
    productInfo,
    listingQuality,
    mediaAssets,
    keywordCoverage,
    pricingCompetitiveness,
    complianceScore,
    documentationScore,
    blockersCount: blockers.length,
    canLaunch,
    recommendations: recs,
  }
}
