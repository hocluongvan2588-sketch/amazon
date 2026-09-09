// ====================================================================
// VEXIM KEYWORD GAP ANALYSIS (Sprint 3.2) — COSMOS/SEMANTIC HEURISTIC
// So sánh tập từ khóa của mình vs Top đối thủ ngách (dữ liệu reverse-ASIN
// sharedTopKeywords: rank đối thủ / rank mình / search volume).
// Đầu ra: keyword gap có điểm ưu tiên + hành động chèn (TITLE/BULLETS/
// BACKEND) + gợi ý cụm ngữ cảnh (contextual phrases).
// Thuần hàm, không network/DB. Heuristic Vexim theo best-practice công khai
// (Amazon không công bố thuật toán tìm kiếm nội bộ A10/Cosmos).
// ====================================================================

export interface SharedKeywordRow {
  keyword: string
  competitorOrganicRank: number
  ourOrganicRank: number // 0 = chưa rank
  searchVolume: number
}

export interface CompetitorInput {
  competitorAsin: string
  competitorBrand: string
  sharedTopKeywords: SharedKeywordRow[]
}

export interface KeywordGapItem {
  keyword: string
  bestCompetitorRank: number
  bestCompetitorBrand: string
  ourRank: number // 0 = chưa rank
  searchVolume: number
  gapScore: number
  status: 'HIGH_PRIORITY_GAP' | 'OPPORTUNITY' | 'DEFENDED' | 'LOW_POTENTIAL'
  recommendedAction: 'ADD_TO_TITLE' | 'ADD_TO_BULLETS' | 'ADD_TO_BACKEND' | 'MONITOR'
  reason: string
}

export interface KeywordGapResult {
  gaps: KeywordGapItem[]
  contextualSuggestions: { phrase: string; baseKeyword: string; suggestedPlacement: 'TITLE' | 'BULLETS' | 'BACKEND'; rationale: string }[]
  summary: {
    keywordsCompared: number
    highPriority: number
    opportunities: number
    defended: number
    ourCoveragePct: number
  }
}

const HIGH_INTENT_TOKENS = [
  'buy', 'gift', 'gifts', 'pack', 'set', 'organic', 'premium', 'best', 'gourmet',
  'single origin', 'authentic', 'natural', 'handmade', 'sugar free', 'vegan',
]

function intentFactor(keyword: string): number {
  const lower = keyword.toLowerCase()
  return HIGH_INTENT_TOKENS.some((t) => lower.includes(t)) ? 1.15 : 1.0
}

function compRankFactor(rank: number): number {
  if (rank <= 10) return 1.0
  if (rank <= 30) return 0.6
  return 0.3
}

export function analyzeKeywordGaps(
  competitors: CompetitorInput[],
  ourListingText: string
): KeywordGapResult {
  const ourWords = new Set(
    ourListingText
      .toLowerCase()
      .split(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+/)
      .filter((w) => w.length > 1)
  )

  // Gom theo keyword: best competitor rank + volume max + our best rank
  const byKeyword = new Map<string, KeywordGapItem>()
  for (const comp of competitors) {
    for (const kw of comp.sharedTopKeywords || []) {
      const lower = kw.keyword.toLowerCase().trim()
      if (!lower) continue
      const existing = byKeyword.get(lower)
      const candidate: KeywordGapItem = {
        keyword: lower,
        bestCompetitorRank: kw.competitorOrganicRank,
        bestCompetitorBrand: comp.competitorBrand,
        ourRank: kw.ourOrganicRank,
        searchVolume: kw.searchVolume,
        gapScore: 0,
        status: 'LOW_POTENTIAL',
        recommendedAction: 'MONITOR',
        reason: '',
      }
      if (!existing) {
        byKeyword.set(lower, candidate)
      } else {
        if (kw.competitorOrganicRank < existing.bestCompetitorRank) {
          existing.bestCompetitorRank = kw.competitorOrganicRank
          existing.bestCompetitorBrand = comp.competitorBrand
        }
        if (existing.ourRank === 0 && kw.ourOrganicRank > 0) existing.ourRank = kw.ourOrganicRank
        else if (kw.ourOrganicRank > 0) existing.ourRank = Math.min(existing.ourRank || 999, kw.ourOrganicRank)
        existing.searchVolume = Math.max(existing.searchVolume, kw.searchVolume)
      }
    }
  }

  const gaps: KeywordGapItem[] = []
  let ourCoverage = 0

  for (const item of byKeyword.values()) {
    // Từ khóa mình đã phủ trong nội dung listing (word-level coverage)
    const kwTokens = item.keyword.split(/\s+/)
    const coveredTokens = kwTokens.filter((t) => ourWords.has(t)).length
    const covered = coveredTokens === kwTokens.length
    if (item.ourRank > 0) ourCoverage += 1

    // Hệ số khoảng cách rank: đối thủ rank tốt mà mình rank kém/chưa rank
    let positionFactor: number
    if (item.ourRank === 0) {
      positionFactor = 1.0 // chưa rank = khoảng trống lớn nhất
    } else if (item.ourRank > item.bestCompetitorRank) {
      positionFactor = Math.min(1, (item.ourRank - item.bestCompetitorRank) / 40 + 0.3)
    } else {
      positionFactor = 0 // mình đang tốt hơn hoặc bằng -> DEFENDED
    }

    const gapScore = Math.round(item.searchVolume * positionFactor * compRankFactor(item.bestCompetitorRank) * intentFactor(item.keyword))

    let status: KeywordGapItem['status']
    if (positionFactor === 0) status = 'DEFENDED'
    else if (gapScore >= 1500 && (item.ourRank === 0 || item.ourRank > 30)) status = 'HIGH_PRIORITY_GAP'
    else if (gapScore >= 400) status = 'OPPORTUNITY'
    else if (gapScore >= 100) status = 'OPPORTUNITY'
    else status = 'LOW_POTENTIAL'

    let recommendedAction: KeywordGapItem['recommendedAction']
    if (status === 'DEFENDED' || status === 'LOW_POTENTIAL') recommendedAction = 'MONITOR'
    else if (covered) recommendedAction = 'ADD_TO_BACKEND' // đã trong content -> tăng độ sâu backend
    else if (item.ourRank === 0 && item.searchVolume >= 2000 && gapScore >= 1500) recommendedAction = 'ADD_TO_TITLE'
    else recommendedAction = 'ADD_TO_BULLETS'

    const reason =
      status === 'DEFENDED'
        ? `Mình đang rank ${item.ourRank} tốt hơn/hạng với đối thủ tốt nhất ${item.bestCompetitorRank} — giữ vị trí, monitor.`
        : `Đối thủ ${item.bestCompetitorBrand} rank ${item.bestCompetitorRank}, mình ${item.ourRank === 0 ? 'CHƯA RANK' : `rank ${item.ourRank}`}, volume ${item.searchVolume.toLocaleString()}/tháng.`

    gaps.push({ ...item, gapScore, status, recommendedAction, reason })
  }

  gaps.sort((a, b) => b.gapScore - a.gapScore)

  // Contextual suggestions: ghép gap keyword + modifier ngữ cảnh
  const CONTEXT_MODIFIERS = ['premium', 'authentic', 'gift set', 'organic', 'gourmet', 'single origin']
  const contextualSuggestions: KeywordGapResult['contextualSuggestions'] = []
  for (const g of gaps.filter((x) => x.status === 'HIGH_PRIORITY_GAP' || x.status === 'OPPORTUNITY').slice(0, 8)) {
    const modifier = CONTEXT_MODIFIERS.find((m) => !g.keyword.includes(m)) || 'premium'
    contextualSuggestions.push({
      phrase: `${g.keyword} ${modifier}`,
      baseKeyword: g.keyword,
      suggestedPlacement:
        g.recommendedAction === 'ADD_TO_TITLE' ? 'TITLE' : g.recommendedAction === 'ADD_TO_BULLETS' ? 'BULLETS' : 'BACKEND',
      rationale: `Cụm ngữ cảnh (contextual) tự nhiên cho Cosmos/semantic indexing — phủ biến thể tìm kiếm quanh "${g.keyword}" (volume ${g.searchVolume.toLocaleString()}) mà không spam exact-match.`,
    })
  }

  return {
    gaps,
    contextualSuggestions,
    summary: {
      keywordsCompared: gaps.length,
      highPriority: gaps.filter((g) => g.status === 'HIGH_PRIORITY_GAP').length,
      opportunities: gaps.filter((g) => g.status === 'OPPORTUNITY').length,
      defended: gaps.filter((g) => g.status === 'DEFENDED').length,
      ourCoveragePct: gaps.length ? Number(((ourCoverage / gaps.length) * 100).toFixed(0)) : 0,
    },
  }
}
