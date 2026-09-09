import {
  detectNegativeSearchTerms,
  evaluateKeywordBid,
  optimizePlacements,
  type BidProposal,
  type NegativeProposal,
  type PlacementProposal,
  type SearchTermRow,
  type PlacementRow,
} from './ppc-intelligence'
import { mockPpcCampaigns, mockPpcKeywords, mockOrders, mockHarvestedSearchTerms, mockPlacementMetrics } from './mock-data'
import { supabase, isSupabaseConfigured } from './supabase'
import {
  getAdsConfig,
  type AdsConfig,
  adsFetch,
  createAdsReport,
  pollAdsReport,
  downloadAdsReport,
  pushKeywordBidUpdates,
  pushNegativeKeywords,
} from './ads-api-server'

// ====================================================================
// VEXIM PPC OPTIMIZE RUNNER (SERVER-ONLY) — Sprint 3.1
// Dùng chung bởi /api/ppc/optimize (UI) và /api/cron/ppc-optimizer (worker).
// Nguyên tắc: SIMULATED KHÔNG BAO GIỜ ghi DB / đẩy Amazon (chuẩn phase 2).
// LIVE: pull report Ads API -> engine -> ghi ppc_* + algorithm_runs ->
//       autoApply (opt-in) đẩy bid/negative lên Amazon thật.
// ====================================================================

export type PpcModule = 'BID_ADJUSTMENT' | 'NEGATIVE_KEYWORDS' | 'PLACEMENT'

export interface OptimizeOutcome {
  module: PpcModule
  mode: 'LIVE' | 'SIMULATED'
  windowDays: number
  proposals: (BidProposal | NegativeProposal | PlacementProposal)[]
  stats: { analyzed: number; proposed: number; estimatedImpactUsd: number }
  warnings: string[]
  applied?: { success: number; failed: { id: string; error: string }[] }
  runLogged?: boolean
}

/** Tính AOV trung bình theo client từ đơn hàng (mock hoặc DB tương lai) */
function computeAovByClient(): Record<string, number> {
  const sums: Record<string, { total: number; n: number }> = {}
  for (const o of mockOrders) {
    sums[o.clientId] = sums[o.clientId] || { total: 0, n: 0 }
    sums[o.clientId].total += o.orderTotal
    sums[o.clientId].n += 1
  }
  const out: Record<string, number> = {}
  for (const [cid, s] of Object.entries(sums)) out[cid] = s.n > 0 ? Number((s.total / s.n).toFixed(2)) : 24
  return out
}

// ---------------- Ghi DB (LIVE only, defensive) ----------------

async function maybeInsert(table: string, rows: any[]): Promise<string | null> {
  if (rows.length === 0) return null
  if (!isSupabaseConfigured()) return 'Supabase chưa cấu hình'
  const { error } = await supabase.from(table).insert(rows)
  if (!error) return null
  if (error.code === '42P01' || (error.message || '').includes('does not exist')) {
    return `Bảng ${table} chưa tồn tại — chạy migration 20260911_ppc_intelligence.sql`
  }
  return `${table}: ${error.message}`
}

async function logAlgorithmRun(entry: {
  algorithmName: string
  module: PpcModule
  triggerSource: string
  stats: OptimizeOutcome['stats']
  warnings: string[]
  windowDays: number
}): Promise<boolean> {
  const err = await maybeInsert('algorithm_runs', [
    {
      algorithm_name: entry.algorithmName,
      module: entry.module,
      mode: 'LIVE',
      trigger_source: entry.triggerSource,
      input_summary: { windowDays: entry.windowDays },
      output_summary: { warnings: entry.warnings },
      items_analyzed: entry.stats.analyzed,
      items_proposed: entry.stats.proposed,
      estimated_impact_usd: entry.stats.estimatedImpactUsd,
      status: 'SUCCESS',
      finished_at: new Date().toISOString(),
    },
  ])
  if (err) {
    console.warn('[PpcOptimize] algorithm_runs:', err)
    return false
  }
  return true
}

// ---------------- SIMULATED sources (dữ liệu demo rõ ràng) ----------------

function simulatedBidProposals(windowDays: number): BidProposal[] {
  const aov = computeAovByClient()
  return mockPpcKeywords
    .map((kw) => {
      const camp = mockPpcCampaigns.find((c) => c.id === kw.campaignId)
      if (!camp) return null
      return evaluateKeywordBid({
        keywordId: kw.id,
        keywordText: kw.keywordText,
        matchType: kw.matchType,
        campaignId: camp.id,
        campaignName: camp.campaignName,
        clientId: camp.clientId,
        currentBid: kw.bid,
        clicks: kw.clicks,
        spend: kw.spend,
        sales: kw.sales,
        orders: kw.orders,
        targetAcosPct: camp.targetAcos,
        aovUsd: aov[camp.clientId] ?? 24,
      })
    })
    .filter((x): x is BidProposal => x !== null)
    .slice(0, windowDays >= 14 ? 40 : 20)
}

function simulatedNegativeProposals(windowDays: number): NegativeProposal[] {
  return detectNegativeSearchTerms(
    mockHarvestedSearchTerms.map((t) => ({
      id: t.id,
      searchTerm: t.searchTerm,
      matchTypeSource: t.matchTypeSource,
      campaignName: t.campaignName,
      impressions: t.impressions,
      clicks: t.clicks,
      spend: t.spend,
      sales: t.sales,
      orders: t.orders,
    })),
    { minClicks: windowDays >= 14 ? 15 : 10 }
  )
}

function simulatedPlacementProposals(): PlacementProposal[] {
  const camp = mockPpcCampaigns[0]
  const rows: PlacementRow[] = mockPlacementMetrics.map((p: any) => ({
    campaignId: camp?.id,
    campaignName: p.campaignName,
    placement: p.placement,
    impressions: p.impressions,
    clicks: p.clicks,
    spend: p.spend,
    sales: p.sales,
    orders: p.orders,
    currentBoostPct: p.currentBoostPct,
    targetAcosPct: 25,
  }))
  return optimizePlacements(rows)
}

// ---------------- LIVE pulls (Ads API v3 reports) ----------------

function dateRange(days: number): { startDate: string; endDate: string } {
  const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')
  const end = new Date(Date.now() - 86400_000) // yesterday (data completeness)
  const start = new Date(end.getTime() - (days - 1) * 86400_000)
  return { startDate: fmt(start), endDate: fmt(end) }
}

async function liveSearchTermRows(cfg: AdsConfig, days: number): Promise<SearchTermRow[]> {
  const { startDate, endDate } = dateRange(days)
  const reportId = await createAdsReport(cfg, {
    recordType: 'searchTerm',
    startDate,
    endDate,
    metrics: ['impressions', 'clicks', 'cost', 'purchases14d', 'sales14d'],
  })
  const rows = await downloadAdsReport(await pollAdsReport(cfg, reportId))
  return rows.map((r: any) => ({
    searchTerm: r.searchTerm || r.search_term || '(unknown)',
    matchTypeSource: r.matchType || 'UNKNOWN',
    campaignId: r.campaignId,
    campaignName: r.campaignName || String(r.campaignId || ''),
    adGroupName: r.adGroupName,
    impressions: Number(r.impressions || 0),
    clicks: Number(r.clicks || 0),
    spend: Number(r.cost || 0),
    sales: Number(r.sales14d || 0),
    orders: Number(r.purchases14d || 0),
  }))
}

/** Lấy hiệu suất theo từ khóa: report 'keyword' + danh sách bid/text từ /sp/keywords/list */
async function liveKeywordRows(
  cfg: AdsConfig,
  days: number
): Promise<{ bidProposals: BidProposal[]; keywordCount: number }> {
  const { startDate, endDate } = dateRange(days)
  const reportId = await createAdsReport(cfg, {
    recordType: 'keyword',
    startDate,
    endDate,
    metrics: ['clicks', 'cost', 'purchases14d', 'sales14d'],
  })
  const perfRows = await downloadAdsReport(await pollAdsReport(cfg, reportId))
  const perfMap = new Map<string, any>()
  for (const r of perfRows) {
    if (r.keywordId) perfMap.set(String(r.keywordId), r)
  }

  // Danh sách metadata từ khóa (text, bid, matchType, campaignId) — adsFetch đã gắn auth + scope
  const listRes = await adsFetch(cfg, '/sp/keywords/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.spkeywordslist.v3+json',
      Accept: 'application/vnd.spkeywordslist.v3+json',
    },
    body: JSON.stringify({ pageSize: 100, includeExtendedDataFields: false }),
  })
  if (!listRes.ok) throw new Error(`Keyword list HTTP ${listRes.status}: ${(await listRes.text()).slice(0, 200)}`)
  const listJson: any = await listRes.json()
  const keywords: any[] = listJson?.keywords || []

  const defaultTargetAcos = Number(process.env.PPC_DEFAULT_TARGET_ACOS || 25)
  const defaultAov = Number(process.env.PPC_DEFAULT_AOV_USD || 24)
  const out: BidProposal[] = []
  for (const k of keywords) {
    const perf = perfMap.get(String(k.keywordId))
    if (!perf) continue
    out.push(
      evaluateKeywordBid({
        keywordId: String(k.keywordId),
        keywordText: k.keywordText || String(k.keywordId),
        matchType: k.matchType || 'UNKNOWN',
        campaignId: String(k.campaignId || ''),
        campaignName: k.campaignName || String(k.campaignId || ''),
        clientId: 'AMAZON_LIVE',
        currentBid: Number(k.bid || 0),
        clicks: Number(perf.clicks || 0),
        spend: Number(perf.cost || 0),
        sales: Number(perf.sales14d || 0),
        orders: Number(perf.purchases14d || 0),
        targetAcosPct: defaultTargetAcos,
        aovUsd: defaultAov,
      })
    )
  }
  return { bidProposals: out, keywordCount: keywords.length }
}

async function livePlacementRows(cfg: AdsConfig, days: number): Promise<PlacementRow[]> {
  const { startDate, endDate } = dateRange(days)
  const reportId = await createAdsReport(cfg, {
    recordType: 'placement',
    startDate,
    endDate,
    metrics: ['impressions', 'clicks', 'cost', 'purchases14d', 'sales14d'],
  })
  const rows = await downloadAdsReport(await pollAdsReport(cfg, reportId))
  const mapPlacement = (p: string): PlacementRow['placement'] =>
    p === 'PLACEMENT_TOP_OF_SEARCH' || p === 'TOP_OF_SEARCH'
      ? 'TOP_OF_SEARCH'
      : p === 'PLACEMENT_PRODUCT_PAGE' || p === 'DETAIL_PAGE_ON_AMAZON' || p === 'PLACEMENT_DETAIL_PAGE'
        ? 'PRODUCT_PAGES'
        : 'REST_OF_SEARCH'
  return rows.map((r: any) => ({
    campaignId: r.campaignId,
    campaignName: r.campaignName || String(r.campaignId || ''),
    placement: mapPlacement(String(r.placement || '')),
    impressions: Number(r.impressions || 0),
    clicks: Number(r.clicks || 0),
    spend: Number(r.cost || 0),
    sales: Number(r.sales14d || 0),
    orders: Number(r.purchases14d || 0),
    currentBoostPct: 0,
    targetAcosPct: 25,
  }))
}

// ---------------- MAIN RUNNER ----------------

export async function runPpcOptimize(params: {
  module: PpcModule
  windowDays?: number
  autoApply?: boolean
  triggerSource?: 'CRON' | 'MANUAL_UI' | 'API'
}): Promise<OptimizeOutcome> {
  const windowDays = params.windowDays === 14 ? 14 : 7
  const autoApply = !!params.autoApply
  const triggerSource = params.triggerSource || 'MANUAL_UI'
  const cfg = getAdsConfig()
  const mode: 'LIVE' | 'SIMULATED' = cfg ? 'LIVE' : 'SIMULATED'
  const warnings: string[] = []

  // ---------- SIMULATED ----------
  if (!cfg) {
    let proposals: OptimizeOutcome['proposals'] = []
    let impact = 0
    let analyzedCount = 0
    let proposedCount = 0
    if (params.module === 'BID_ADJUSTMENT') {
      proposals = simulatedBidProposals(windowDays)
      analyzedCount = proposals.length
      const actionable = proposals.filter((p: any) => ['INCREASE', 'DECREASE'].includes(p.action))
      proposedCount = actionable.length
      impact = actionable.reduce((s, p: any) => s + Math.abs(p.changePct) * 0.1 * p.currentBid, 0)
    } else if (params.module === 'NEGATIVE_KEYWORDS') {
      analyzedCount = mockHarvestedSearchTerms.length
      proposals = simulatedNegativeProposals(windowDays)
      proposedCount = proposals.length
      impact = proposals.reduce((s, p: any) => s + (p.estimatedSavingsUsd || 0), 0)
    } else {
      proposals = simulatedPlacementProposals()
      analyzedCount = proposals.length
      proposedCount = proposals.filter((p: any) => ['BOOST_UP', 'BOOST_DOWN'].includes(p.action)).length
    }
    return {
      module: params.module,
      mode: 'SIMULATED',
      windowDays,
      proposals,
      stats: { analyzed: analyzedCount, proposed: proposedCount, estimatedImpactUsd: Number(impact.toFixed(2)) },
      warnings: [
        'CHẾ ĐỘ MÔ PHỎNG — chạy trên dữ liệu demo, KHÔNG ghi DB, KHÔNG đẩy Amazon. Thêm Ads credentials để chuyển LIVE.',
        ...(autoApply ? ['autoApply bị bỏ qua trong chế độ mô phỏng.'] : []),
      ],
    }
  }

  // ---------- LIVE ----------
  try {
    if (params.module === 'BID_ADJUSTMENT') {
      const { bidProposals, keywordCount } = await liveKeywordRows(cfg, windowDays)
      const actionable = bidProposals.filter((p) => p.action === 'INCREASE' || p.action === 'DECREASE')
      const impact = actionable.reduce(
        (s2, p) => s2 + Math.abs(p.changePct) * 0.1 * p.currentBid,
        0
      )

      const dbErr = await maybeInsert('ppc_bid_change_log', actionable.map((p) => ({
        client_id: null, amazon_keyword_id: p.keywordId, campaign_id: p.campaignId,
        keyword_text: p.keywordText, match_type: p.matchType,
        old_bid: p.currentBid, new_bid: p.recommendedBid, change_pct: p.changePct,
        reason: p.reason, window_days: windowDays,
        target_acos: p.targetAcosPct, cvr_pct: p.cvrPct, aov_usd: 0,
        execution_mode: autoApply ? 'AUTO_APPLIED' : 'SUGGESTED',
        status: 'PENDING',
      })))
      if (dbErr) warnings.push(dbErr)
      const runLogged = await logAlgorithmRun({
        algorithmName: 'Target-ACOS Dynamic Bid Adjustment', module: params.module, triggerSource,
        stats: { analyzed: keywordCount, proposed: actionable.length, estimatedImpactUsd: impact },
        warnings, windowDays,
      })

      let applied
      if (autoApply && actionable.length > 0) {
        const { success, failed } = await pushKeywordBidUpdates(
          cfg,
          actionable.map((p) => ({ keywordId: p.keywordId, bid: p.recommendedBid }))
        )
        applied = { success: success.length, failed: failed.map((f) => ({ id: f.keywordId, error: f.error })) }
      }
      return {
        module: params.module, mode: 'LIVE', windowDays, proposals: bidProposals,
        stats: { analyzed: keywordCount, proposed: actionable.length, estimatedImpactUsd: Number(impact.toFixed(2)) },
        warnings, applied, runLogged,
      }
    }

    if (params.module === 'NEGATIVE_KEYWORDS') {
      const rows = await liveSearchTermRows(cfg, windowDays)
      const proposals = detectNegativeSearchTerms(rows, { minClicks: windowDays >= 14 ? 15 : 10 })
      const impact = proposals.reduce((s, p) => s + p.estimatedSavingsUsd, 0)

      // Ghi DB + log run (best-effort)
      const dbErr = await maybeInsert('ppc_search_term_reports', (proposals as NegativeProposal[]).map((p) => ({
        client_id: null, campaign_id: p.campaignId || null, campaign_name: p.campaignName,
        search_term: p.searchTerm, match_type_source: p.matchTypeSource,
        clicks: p.clicks, spend: p.spend, orders: p.orders, acos: p.acosPct,
        suggested_action: p.negativeType, estimated_savings_usd: p.estimatedSavingsUsd,
        status: 'PENDING', report_date: new Date().toISOString().slice(0, 10),
      })))
      if (dbErr) warnings.push(dbErr)
      const runLogged = await logAlgorithmRun({
        algorithmName: 'Auto Negative Keyword Detection', module: params.module, triggerSource,
        stats: { analyzed: rows.length, proposed: proposals.length, estimatedImpactUsd: impact }, warnings, windowDays,
      })

      let applied
      if (autoApply && proposals.length > 0) {
        const { success, failed } = await pushNegativeKeywords(
          cfg,
          proposals.map((p) => ({
            campaignId: p.campaignId || '',
            keywordText: p.searchTerm,
            matchType: p.negativeType,
          }))
        )
        applied = { success, failed: failed.map((f) => ({ id: f.keywordText, error: f.error })) }
      }
      return {
        module: params.module, mode: 'LIVE', windowDays, proposals,
        stats: { analyzed: rows.length, proposed: proposals.length, estimatedImpactUsd: Number(impact.toFixed(2)) },
        warnings, applied, runLogged,
      }
    }

    // PLACEMENT
    const rows = await livePlacementRows(cfg, windowDays)
    const proposals = optimizePlacements(rows)
    const dbErr = await maybeInsert('ppc_placement_metrics', (proposals as PlacementProposal[]).map((p) => ({
      campaign_name: p.campaignName, placement: p.placement,
      current_boost_pct: p.currentBoostPct, suggested_boost_pct: p.suggestedBoostPct,
      status: 'PENDING', report_date: new Date().toISOString().slice(0, 10),
    })))
    if (dbErr) warnings.push(dbErr)
    const runLogged = await logAlgorithmRun({
      algorithmName: 'Placement Optimization (ToS vs Product Pages)', module: params.module, triggerSource,
      stats: { analyzed: rows.length, proposed: proposals.filter((p) => p.action !== 'HOLD').length, estimatedImpactUsd: 0 },
      warnings, windowDays,
    })
    return {
      module: params.module, mode: 'LIVE', windowDays, proposals,
      stats: { analyzed: rows.length, proposed: proposals.filter((p) => p.action !== 'HOLD').length, estimatedImpactUsd: 0 },
      warnings, runLogged,
    }
  } catch (err: any) {
    console.error('[PpcOptimize LIVE]', err)
    await logAlgorithmRun({
      algorithmName: `runPpcOptimize:${params.module}`, module: params.module, triggerSource,
      stats: { analyzed: 0, proposed: 0, estimatedImpactUsd: 0 },
      warnings: [String(err?.message || err)], windowDays,
    }).catch(() => false)
    return {
      module: params.module, mode: 'LIVE', windowDays, proposals: [],
      stats: { analyzed: 0, proposed: 0, estimatedImpactUsd: 0 },
      warnings: [`LIVE run thất bại (minh bạch, không mô phỏng thay thế): ${err?.message || err}`],
    }
  }
}
