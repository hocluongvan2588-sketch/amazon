// ====================================================================
// VEXIM LISTING QUALITY SCORE ENGINE (Sprint 3.2) — THUẦN DETERMINISTIC
// Chấm điểm 100 theo 5 trục: Title (30) / Bullets (25) / Description (15)
// / Images (10) / Backend Search Terms (20).
// FIX BUG ĐẾM BYTES: Backend Search Terms đếm bằng UTF-8 bytes (chuẩn hạn
// ngạch 249 bytes của Amazon) — ký tự Unicode/tiếng Việt có dấu chiếm 2–3
// bytes, KHÔNG PHẢI 1 như khi dùng .length.
// Thuần hàm, không network/DB — unit-test được. Heuristic theo chuẩn công
// khai của Amazon (style guide + restricted claims), minh bạch từng lỗi.
// ====================================================================

// ---------------- BYTE HELPERS (fix bug .length) ----------------

const textEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null

/** Độ dài UTF-8 thực tế (bytes) — chuẩn hạn ngạch Amazon */
export function utf8ByteLength(str: string): number {
  if (!str) return 0
  if (textEncoder) return textEncoder.encode(str).length
  // Fallback server cũ: tính tay theo mã hóa UTF-8
  let bytes = 0
  for (let i = 0; i < str.length; i++) {
    const cp = str.codePointAt(i)!
    if (cp > 0xffff) i++ // surrogate pair
    bytes += cp <= 0x7f ? 1 : cp <= 0x7ff ? 2 : cp <= 0xffff ? 3 : 4
  }
  return bytes
}

/** Cắt chuỗi an toàn theo giới hạn bytes (không cắt giữa ký tự multi-byte) */
export function truncateToByteLimit(str: string, limit: number): string {
  if (utf8ByteLength(str) <= limit) return str
  let out = str
  while (out.length > 0 && utf8ByteLength(out) > limit) {
    // lùi 1 code point (xử lý surrogate pair)
    out = out.slice(0, -1)
    // nếu vừa cắt giữa cặp surrogate -> lùi thêm
    if (/[\uD800-\uDBFF]$/.test(out)) out = out.slice(0, -1)
  }
  return out
}

// ---------------- QUY TẮC NỘI DUNG ----------------

/** Claim/từ cấm hoặc rủi ro chính sách Amazon (restricted claims) */
export const BANNED_CLAIMS = [
  'fda approved', 'fda-certified', '#1', 'number one', 'best seller', 'top rated',
  'cure', 'cures', 'heal', 'heals', 'treats', 'prevents disease', 'guaranteed',
  'guarantee results', '100% safe', 'no side effects', 'antiviral', 'antibacterial protection',
  'free shipping', 'on sale', 'discount', 'cheapest',
] as const

/** Stopwords lãng phí bytes backend (Amazon đã index tự nhiên, không cần nhét) */
const BACKEND_STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'for', 'in', 'is', 'it', 'of', 'on', 'or', 'that', 'the',
  'to', 'with', 'by', 'at', 'from', 'as', 'be', 'this', 'these',
])

const WORD_SPLIT = /[^a-zA-Z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\u00C0-\u024F]+/

function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(WORD_SPLIT)
    .filter((w) => w.length > 1)
}

function findBannedClaims(text: string): string[] {
  const lower = text.toLowerCase()
  return BANNED_CLAIMS.filter((c) => lower.includes(c))
}

function hasShoutingWords(text: string): boolean {
  // từ ALL-CAPS dài >= 4 (không tính viết tắt thông dụng)
  const okAbbrev = new Set(['usda', 'fda', 'non', 'gmo', 'bpa', 'vegan', 'ou', 'kosher'])
  return text
    .split(/\s+/)
    .some((w) => {
      const clean = w.replace(/[^A-Za-z]/g, '')
      return clean.length >= 4 && !okAbbrev.has(clean.toLowerCase()) && clean === clean.toUpperCase() && /[A-Z]{4,}/.test(clean)
    })
}

export interface ListingInput {
  listingId: string
  sku: string
  asin: string
  title: string
  bulletPoints: string[]
  description: string
  backendSearchTerms: string
  mainImage?: string
  galleryImages?: string[]
  hasAplus?: boolean
}

export interface ScoreIssue {
  axis: 'TITLE' | 'BULLETS' | 'DESCRIPTION' | 'IMAGES' | 'BACKEND'
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  message: string
  fix?: string
}

export interface BackendByteAnalysis {
  bytesUsed: number
  byteLimit: number
  utilizationPct: number
  overLimit: boolean
  /** bytes lãng phí: trùng lặp nội bộ + trùng title/bullets + stopwords + dấu câu */
  wastedBytes: number
  wasteBreakdown: { internalDuplicates: number; alreadyInTitleBullets: number; stopwords: number; punctuation: number }
  optimizedSuggestion: string
  suggestionBytes: number
}

export interface ListingQualityResult {
  listingId: string
  sku: string
  asin: string
  overall: number
  grade: 'A+' | 'A' | 'B' | 'C' | 'D'
  complianceRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  axes: {
    title: { score: number; max: number }
    bullets: { score: number; max: number }
    description: { score: number; max: number }
    images: { score: number; max: number }
    backend: { score: number; max: number }
  }
  backendByteAnalysis: BackendByteAnalysis
  strengths: string[]
  issues: ScoreIssue[]
}

// ---------------- BACKEND SEARCH TERMS ANALYSIS ----------------

export function analyzeBackendSearchTerms(
  backend: string,
  titleBulletsText: string
): BackendByteAnalysis {
  const bytesUsed = utf8ByteLength(backend)
  const BYTE_LIMIT = 249
  const rawTokens = backend.split(/[\s,;|]+/).filter(Boolean)
  const tokens = backend.split(WORD_SPLIT).filter(Boolean)

  const titleBulletSet = new Set(words(titleBulletsText))
  const seenInternal = new Set<string>()
  let punctuationCount = 0

  const kept: string[] = []
  const internalDupes: string[] = []
  const inTitle: string[] = []
  const stopwordHits: string[] = []

  for (const raw of rawTokens) {
    if (/[,;|]/.test(raw)) punctuationCount += 1
  }
  for (const t of tokens) {
    const lower = t.toLowerCase()
    if (BACKEND_STOPWORDS.has(lower)) {
      stopwordHits.push(t)
      continue
    }
    if (seenInternal.has(lower)) {
      internalDupes.push(t)
      continue
    }
    if (titleBulletSet.has(lower)) {
      inTitle.push(t)
      continue
    }
    seenInternal.add(lower)
    kept.push(lower)
  }

  const wasteOf = (arr: string[]) => utf8ByteLength(arr.join(' '))
  const wasteBreakdown = {
    internalDuplicates: wasteOf(internalDupes),
    alreadyInTitleBullets: wasteOf(inTitle),
    stopwords: wasteOf(stopwordHits),
    punctuation: punctuationCount, // 1 byte/dấu
  }
  const wastedBytes =
    wasteBreakdown.internalDuplicates +
    wasteBreakdown.alreadyInTitleBullets +
    wasteBreakdown.stopwords +
    wasteBreakdown.punctuation

  // Đề xuất tối ưu: từ duy nhất chưa có trong title/bullets, join bằng space, cắt đúng 249 bytes
  const optimizedSuggestion = truncateToByteLimit(kept.join(' '), BYTE_LIMIT)

  return {
    bytesUsed,
    byteLimit: BYTE_LIMIT,
    utilizationPct: Number(((bytesUsed / BYTE_LIMIT) * 100).toFixed(1)),
    overLimit: bytesUsed > BYTE_LIMIT,
    wastedBytes,
    wasteBreakdown,
    optimizedSuggestion,
    suggestionBytes: utf8ByteLength(optimizedSuggestion),
  }
}

// ---------------- MAIN SCORER ----------------

export function scoreListing(input: ListingInput): ListingQualityResult {
  const issues: ScoreIssue[] = []
  const strengths: string[] = []
  const titleBulletsText = [input.title, ...input.bulletPoints].join(' ')

  // ---------- TITLE (30) ----------
  let titleScore = 30
  const titleLen = input.title.length
  const titleBytes = utf8ByteLength(input.title)
  if (titleLen < 80) {
    const cut = Math.min(10, Math.round(((80 - titleLen) / 80) * 10))
    titleScore -= cut
    issues.push({
      axis: 'TITLE', severity: 'MEDIUM',
      message: `Tiêu đề chỉ ${titleLen} ký tự — chưa khai thác 80–200 ký tự cho từ khóa.`,
      fix: 'Bổ sung: chất liệu/đặc điểm chính + đối tượng sử dụng + use case.',
    })
  } else if (titleLen > 200) {
    titleScore -= 10
    issues.push({
      axis: 'TITLE', severity: 'HIGH',
      message: `Tiêu đề ${titleLen} ký tự vượt ngưỡng 200 — Amazon sẽ cắt ngắt trên mobile.`,
      fix: 'Rút gọn về ≤200 ký tự, giữ từ khóa chính ở đầu.',
    })
  } else {
    strengths.push(`Độ dài tiêu đề chuẩn (${titleLen} ký tự trong vùng tối ưu 80–200).`)
  }
  if (input.title.endsWith('...') || input.title.length > 0 && input.title[0] !== input.title[0].toUpperCase()) {
    titleScore -= 3
    issues.push({ axis: 'TITLE', severity: 'LOW', message: 'Tiêu đề không viết hoa chữ cái đầu.' })
  }
  if (hasShoutingWords(input.title)) {
    titleScore -= 4
    issues.push({ axis: 'TITLE', severity: 'MEDIUM', message: 'Có từ viết IN HOA toàn bộ (không nên trừ viết tắt chuẩn như USDA/FDA).' })
  }
  const titleBanned = findBannedClaims(input.title)
  if (titleBanned.length > 0) {
    titleScore -= 8 * titleBanned.length
    issues.push({
      axis: 'TITLE', severity: 'HIGH',
      message: `Claim cấm trong tiêu đề: ${titleBanned.join(', ')} — rủi ro bị Amazon gỡ/suppress listing.`,
      fix: 'Xóa claim tuyệt đối; thay bằng mô tả tính năng có kiểm chứng (chứng nhận, tiêu chuẩn).',
    })
  }
  titleScore = Math.max(0, Math.min(30, titleScore))

  // ---------- BULLETS (25) ----------
  let bulletScore = 25
  if (input.bulletPoints.length !== 5) {
    const cut = Math.min(8, Math.abs(5 - input.bulletPoints.length) * 3)
    bulletScore -= cut
    issues.push({
      axis: 'BULLETS', severity: input.bulletPoints.length < 5 ? 'MEDIUM' : 'LOW',
      message: `Số bullet = ${input.bulletPoints.length} (chuẩn Amazon: 5).`,
    })
  }
  const shortBullets = input.bulletPoints.filter((b) => b.length < 100).length
  const longBullets = input.bulletPoints.filter((b) => b.length > 250).length
  if (shortBullets > 0) {
    bulletScore -= Math.min(6, shortBullets * 2)
    issues.push({ axis: 'BULLETS', severity: 'MEDIUM', message: `${shortBullets} bullet dưới 100 ký tự — chưa đủ chiều sâu từ khóa/lợi ích.` })
  }
  if (longBullets > 0) {
    bulletScore -= Math.min(4, longBullets * 2)
    issues.push({ axis: 'BULLETS', severity: 'LOW', message: `${longBullets} bullet quá 250 ký tự — nên cô đọng để đọc lướt được.` })
  }
  const bulletsText = input.bulletPoints.join(' ')
  const bulletsBanned = findBannedClaims(bulletsText)
  if (bulletsBanned.length > 0) {
    bulletScore -= 6 * bulletsBanned.length
    issues.push({
      axis: 'BULLETS', severity: 'HIGH',
      message: `Claim cấm trong bullets: ${bulletsBanned.join(', ')}.`,
      fix: 'Thay bằng ngôn ngữ tính năng + chứng nhận cụ thể.',
    })
  }
  if (bulletScore >= 22) strengths.push('Hệ bullet đạt chuẩn độ dài và ngôn ngữ an toàn chính sách.')
  bulletScore = Math.max(0, Math.min(25, bulletScore))

  // ---------- DESCRIPTION (15) ----------
  let descScore = 15
  const descLen = input.description.length
  if (descLen < 200) {
    descScore -= 6
    issues.push({ axis: 'DESCRIPTION', severity: 'MEDIUM', message: `Mô tả chỉ ${descLen} ký tự — nên ≥200 kể câu chuyện thương hiệu + từ khóa ngữ cảnh.` })
  }
  if (descLen > 2000) {
    descScore -= 4
    issues.push({ axis: 'DESCRIPTION', severity: 'MEDIUM', message: 'Mô tả vượt 2000 ký tự —Amazon cắt bớt, nên chuyển bớt nội dung sang A+.' })
  }
  const descBanned = findBannedClaims(input.description)
  if (descBanned.length > 0) {
    descScore -= 5 * descBanned.length
    issues.push({ axis: 'DESCRIPTION', severity: 'HIGH', message: `Claim cấm trong mô tả: ${descBanned.join(', ')}.` })
  }
  if (/[\w.+-]+@[\w-]+\.[\w.]+|https?:\/\/|wa\.me|zalo\.me|tel:\+?\d/.test(input.description)) {
    descScore -= 7
    issues.push({
      axis: 'DESCRIPTION', severity: 'HIGH',
      message: 'Phát hiện email/đường dẫn/lien hệ ngoài — vi phạm chính sách Amazon (cố hướng dẫn rời sàn).',
      fix: 'Xóa toàn bộ thông tin liên hệ/đường dẫn ngoài.',
    })
  }
  if (descScore >= 13) strengths.push('Mô tả đạt chuẩn độ dài, sạch chính sách.')
  descScore = Math.max(0, Math.min(15, descScore))

  // ---------- IMAGES (10) ----------
  let imageScore = 10
  const gallery = input.galleryImages?.length ?? 0
  if (!input.mainImage) {
    imageScore -= 5
    issues.push({ axis: 'IMAGES', severity: 'HIGH', message: 'Thiếu ảnh chính.' })
  }
  if (gallery < 6) {
    const cut = gallery >= 3 ? 3 : 6
    imageScore -= cut
    issues.push({
      axis: 'IMAGES', severity: gallery >= 3 ? 'LOW' : 'MEDIUM',
      message: `Chỉ ${gallery} ảnh gallery — nên ≥6 (đủ bật Zoom, bao gồm: kích thước, cách dùng, thành phần, so sánh, lifestyle, chứng nhận).`,
    })
  } else {
    strengths.push('Bộ ảnh gallery đạt số lượng tối thiểu 6 — đủ bật Zoom.')
  }
  if (!input.hasAplus) {
    imageScore -= 1
    issues.push({ axis: 'IMAGES', severity: 'LOW', message: 'Chưa có A+ Content — A+ giúp tăng CVR trung bình 5–8%.' })
  }
  imageScore = Math.max(0, Math.min(10, imageScore))

  // ---------- BACKEND SEARCH TERMS (20) ----------
  let backendScore = 20
  const backend = analyzeBackendSearchTerms(input.backendSearchTerms, titleBulletsText)
  if (backend.overLimit) {
    backendScore -= 10
    issues.push({
      axis: 'BACKEND', severity: 'HIGH',
      message: `Backend ${backend.bytesUsed}/249 bytes — VƯỢT hạn ngạch (đếm đúng UTF-8). Amazon bỏ phần thừa.`,
      fix: 'Dùng chuỗi tối ưu gợi ý bên dưới (đã khử trùng lặp + cắt đúng 249 bytes).',
    })
  } else if (backend.utilizationPct < 70) {
    backendScore -= 5
    issues.push({
      axis: 'BACKEND', severity: 'MEDIUM',
      message: `Backend mới dùng ${backend.bytesUsed}/249 bytes (${backend.utilizationPct}%) — còn ${249 - backend.bytesUsed} bytes trống để nhét từ khóa.`,
      fix: 'Thêm biến thể từ khóa chưa có trong tiêu đề/bullets.',
    })
  }
  if (backend.wasteBreakdown.alreadyInTitleBullets > 0) {
    backendScore -= 3
    issues.push({
      axis: 'BACKEND', severity: 'MEDIUM',
      message: `${backend.wasteBreakdown.alreadyInTitleBullets} bytes backend trùng từ đã có trong Title/Bullets — Amazon index sẵn, đây là bytes lãng phí.`,
      fix: 'Xóa từ trùng, thay từ ngữ cảnh mới.',
    })
  }
  if (backend.wasteBreakdown.internalDuplicates > 0) {
    backendScore -= 3
    issues.push({ axis: 'BACKEND', severity: 'MEDIUM', message: `${backend.wasteBreakdown.internalDuplicates} bytes từ khóa bị lặp nội bộ trong backend.` })
  }
  if (backend.wasteBreakdown.stopwords > 0) {
    backendScore -= 2
    issues.push({ axis: 'BACKEND', severity: 'LOW', message: `${backend.wasteBreakdown.stopwords} bytes stopwords (the/and/for...) — không cần trong backend.` })
  }
  if (backendScore >= 18) strengths.push('Backend Search Terms sạch trùng lặp, đúng hạn ngạch 249 bytes.')
  backendScore = Math.max(0, Math.min(20, backendScore))

  // ---------- TOTAL ----------
  const overall = titleScore + bulletScore + descScore + imageScore + backendScore
  const grade: ListingQualityResult['grade'] =
    overall >= 93 ? 'A+' : overall >= 85 ? 'A' : overall >= 75 ? 'B' : overall >= 60 ? 'C' : 'D'
  const highIssues = issues.filter((i) => i.severity === 'HIGH').length
  const complianceRisk: ListingQualityResult['complianceRisk'] = highIssues >= 3 ? 'HIGH' : highIssues >= 1 ? 'MEDIUM' : 'LOW'

  return {
    listingId: input.listingId,
    sku: input.sku,
    asin: input.asin,
    overall,
    grade,
    complianceRisk,
    axes: {
      title: { score: titleScore, max: 30 },
      bullets: { score: bulletScore, max: 25 },
      description: { score: descScore, max: 15 },
      images: { score: imageScore, max: 10 },
      backend: { score: backendScore, max: 20 },
    },
    backendByteAnalysis: backend,
    strengths,
    issues: issues.sort((a, b) => (a.severity === 'HIGH' ? -1 : b.severity === 'HIGH' ? 1 : 0)),
  }
}
