// ====================================================================
// VEXIM — AMAZON ADS API REAL CLIENT (SERVER-ONLY)
// Giai đoạn 2: đọc profiles + Sponsored Products campaigns THẬT.
// Khác SP-API: KHÔNG cần SigV4, chỉ cần LWA access token (phải được authorize
// với scope advertising::campaign_management) + Profile ID.
// Docs: https://advertising-api.amazon.com (NA), header Scope = profileId.
// ====================================================================

import { supabase } from './supabase'

const ADS_ENDPOINT_NA = 'https://advertising-api.amazon.com'

export interface AdsConfig {
  clientId: string
  clientSecret: string
  refreshToken: string
  profileId: string
  endpoint: string
}

export function missingAdsEnv(): string[] {
  const missing: string[] = []
  if (!process.env.AMAZON_SP_API_CLIENT_ID && !process.env.AMAZON_ADS_CLIENT_ID) missing.push('AMAZON_ADS_CLIENT_ID (hoặc dùng lại AMAZON_SP_API_CLIENT_ID)')
  if (!process.env.AMAZON_SP_API_CLIENT_SECRET && !process.env.AMAZON_ADS_CLIENT_SECRET) missing.push('AMAZON_ADS_CLIENT_SECRET (hoặc dùng lại AMAZON_SP_API_CLIENT_SECRET)')
  if (!process.env.AMAZON_SP_API_REFRESH_TOKEN && !process.env.AMAZON_ADS_REFRESH_TOKEN) missing.push('AMAZON_ADS_REFRESH_TOKEN (hoặc dùng lại AMAZON_SP_API_REFRESH_TOKEN)')
  if (!process.env.AMAZON_ADS_PROFILE_ID) missing.push('AMAZON_ADS_PROFILE_ID')
  return missing
}

export function getAdsConfig(): AdsConfig | null {
  if (missingAdsEnv().length > 0) return null
  return {
    clientId: process.env.AMAZON_ADS_CLIENT_ID || process.env.AMAZON_SP_API_CLIENT_ID!,
    clientSecret: process.env.AMAZON_ADS_CLIENT_SECRET || process.env.AMAZON_SP_API_CLIENT_SECRET!,
    refreshToken: process.env.AMAZON_ADS_REFRESH_TOKEN || process.env.AMAZON_SP_API_REFRESH_TOKEN!,
    profileId: process.env.AMAZON_ADS_PROFILE_ID!,
    endpoint: process.env.AMAZON_ADS_ENDPOINT || ADS_ENDPOINT_NA,
  }
}

/** Lấy LWA token riêng cho Ads (cache nội bộ — scope có thể khác SP-API) */
let adsTokenCache: { token: string; expiresAt: number } | null = null

async function getAdsAccessToken(cfg: AdsConfig): Promise<string> {
  if (adsTokenCache && Date.now() < adsTokenCache.expiresAt - 60_000) return adsTokenCache.token
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: cfg.refreshToken,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
    }).toString(),
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) {
    throw new Error(`Ads LWA token failed (${res.status}): ${(await res.text()).slice(0, 300)}`)
  }
  const json = (await res.json()) as { access_token: string; expires_in: number }
  adsTokenCache = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 }
  return adsTokenCache.token
}

export async function adsFetch(cfg: AdsConfig, path: string, init?: RequestInit): Promise<Response> {
  const token = await getAdsAccessToken(cfg)
  return fetch(cfg.endpoint + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Amazon-Advertising-API-ClientId': cfg.clientId,
      'Amazon-Advertising-API-Scope': cfg.profileId,
      'Content-Type': 'application/vnd.spCampaign.v3+json',
      Accept: 'application/vnd.spCampaign.v3+json',
      ...(init?.headers || {}),
    },
    signal: AbortSignal.timeout(20_000),
  })
}

/** Liệt kê profiles quảng cáo của tài khoản (bước "khám phá" khi chưa biết profileId) */
export async function adsListProfiles(cfg: AdsConfig): Promise<{
  profiles: { profileId: number; countryCode: string; currency: string; accountName?: string }[]
}> {
  const token = await getAdsAccessToken(cfg)
  const res = await fetch(ADS_ENDPOINT_NA + '/v2/profiles', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Amazon-Advertising-API-ClientId': cfg.clientId,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(20_000),
  })
  if (!res.ok) {
    throw new Error(`Profiles HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
  }
  const list: any[] = await res.json()
  return {
    profiles: list.map((p) => ({
      profileId: p.profileId,
      countryCode: p.countryCode,
      currency: p.currencyInfo,
      accountName: p.accountInfo?.name,
    })),
  }
}

export interface AdsCampaignSummary {
  amazonCampaignId: string
  name: string
  state: string
  dailyBudget: number
}

/** Liệt kê Sponsored Products campaigns (v3 list, không kèm metrics — metrics cần async report) */
export async function adsListSponsoredProductsCampaigns(
  cfg: AdsConfig
): Promise<{ campaigns: AdsCampaignSummary[] }> {
  const res = await adsFetch(cfg, '/sp/campaigns/list', {
    method: 'POST',
    body: JSON.stringify({ pageSize: 100, includeExtendedDataFields: false }),
  })
  if (!res.ok) {
    throw new Error(`Campaigns HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
  }
  const json: any = await res.json()
  const campaigns: any[] = json?.campaigns || []
  return {
    campaigns: campaigns.map((c) => ({
      amazonCampaignId: String(c.campaignId),
      name: c.name,
      state: c.state,
      dailyBudget: Number(c?.budget?.budget ?? 0),
    })),
  }
}

/** Đồng bộ metadata campaigns vào bảng advertising_campaigns (upsert theo amazon_campaign_id + client) */
export async function syncAdsCampaignsToDatabase(
  cfg: AdsConfig,
  clientId: string
): Promise<{ synced: number; dbError?: string }> {
  const { campaigns } = await adsListSponsoredProductsCampaigns(cfg)
  if (campaigns.length === 0) return { synced: 0 }

  const { data: existing } = await supabase
    .from('advertising_campaigns')
    .select('id, amazon_campaign_id')
    .eq('client_id', clientId)
  const existingMap = new Map((existing || []).map((r: any) => [r.amazon_campaign_id, r.id]))

  let synced = 0
  let dbError: string | undefined
  for (const c of campaigns) {
    const row: Record<string, any> = {
      client_id: clientId,
      amazon_campaign_id: c.amazonCampaignId,
      campaign_name: c.name,
      campaign_type: 'SPONSORED_PRODUCTS',
      status: c.state === 'ENABLED' ? 'ENABLED' : c.state === 'PAUSED' ? 'PAUSED' : 'ARCHIVED',
      daily_budget: c.dailyBudget,
      updated_at: new Date().toISOString(),
    }
    const existingId = existingMap.get(c.amazonCampaignId)
    const { error } = existingId
      ? await supabase.from('advertising_campaigns').update(row).eq('id', existingId)
      : await supabase.from('advertising_campaigns').insert(row)
    if (error) dbError = error.message
    else synced += 1
  }
  return { synced, dbError }
}

// ====================================================================
// SPRINT 3.1 — ADS REPORTING v3 + PUSH OPERATIONS (LIVE mode)
// Báo cáo Amazon Ads là ASYNC: create -> poll -> download (gzip JSON).
// Shapes theo Amazon Ads API chính thức; lỗi trả transparrently (không giả).
// ====================================================================

export interface AdsReportRequest {
  recordType: 'searchTerm' | 'keyword' | 'placement'
  startDate: string // YYYYMMDD
  endDate: string // YYYYMMDD
  metrics: string[]
  stateFilter?: string[]
}

/** Tạo báo cáo v3 (POST /reporting/reports) -> reportId */
export async function createAdsReport(cfg: AdsConfig, req: AdsReportRequest): Promise<string> {
  const res = await adsFetch(cfg, '/reporting/reports', {
    method: 'POST',
    headers: { Accept: 'application/vnd.createasyncreportrequest.v3+json' },
    body: JSON.stringify({
      name: `vexim-${req.recordType}-${Date.now()}`,
      startDate: req.startDate,
      endDate: req.endDate,
      configuration: {
        adProduct: 'SPONSORED_PRODUCTS',
        // spSearchTerm dùng cho cả searchTerm/keyword; placement dùng spCampaigns
        reportTypeId: req.recordType === 'placement' ? 'spCampaigns' : 'spSearchTerm',
        groupBy: [req.recordType],
        columns: req.metrics,
        timeUnit: 'SUMMARY',
        format: 'GZIP_JSON',
      },
    }),
  })
  if (!res.ok) throw new Error(`Create report HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const json: any = await res.json()
  if (!json?.reportId) throw new Error('Create report: thiếu reportId: ' + JSON.stringify(json).slice(0, 200))
  return json.reportId
}

/** Poll báo cáo tới khi COMPLETED (tối đa ~60s) -> URL tải */
export async function pollAdsReport(cfg: AdsConfig, reportId: string): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const res = await fetch(`${cfg.endpoint}/reporting/reports/${reportId}`, {
      headers: {
        Authorization: `Bearer ${await getAdsAccessToken(cfg)}`,
        'Amazon-Advertising-API-ClientId': cfg.clientId,
        'Amazon-Advertising-API-Scope': cfg.profileId,
        Accept: 'application/vnd.getasyncreportrequest.v3+json',
      },
      signal: AbortSignal.timeout(20_000),
    })
    if (!res.ok) throw new Error(`Poll report HTTP ${res.status}`)
    const json: any = await res.json()
    if (json.status === 'COMPLETED' && json.url) return json.url
    if (json.status === 'FAILED' || json.status === 'CANCELLED') {
      throw new Error(`Report ${json.status}: ${JSON.stringify(json.failureReason || '').slice(0, 200)}`)
    }
    await new Promise((r) => setTimeout(r, 3000))
  }
  throw new Error('Report timeout sau 60s — thử lại sau.')
}

/** Tải + giải nén gzip JSON -> mảng dòng dữ liệu */
export async function downloadAdsReport(url: string): Promise<any[]> {
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })
  if (!res.ok) throw new Error(`Download report HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const { gzipSync } = await import('node:zlib')
  let text: string
  try {
    text = gzipSync(buf).toString('utf-8')
  } catch {
    text = buf.toString('utf-8') // không nén thì dùng nguyên
  }
  const json = JSON.parse(text)
  return Array.isArray(json) ? json : (json?.rows ?? [])
}

/** Đẩy cập nhật bid từ khóa (legacy v2 POST /sp/keywords — ổn định, dùng rộng rãi) */
export async function pushKeywordBidUpdates(
  cfg: AdsConfig,
  updates: { keywordId: string; bid: number }[]
): Promise<{ success: string[]; failed: { keywordId: string; error: string }[] }> {
  const res = await adsFetch(cfg, '/sp/keywords', {
    method: 'POST',
    headers: { 'Content-Type': 'application/vnd.spkeywords.v2+json', Accept: 'application/vnd.spkeywords.v2+json' },
    body: JSON.stringify(
      updates.map((u) => ({ keywordId: u.keywordId, state: 'enabled', bid: Number(u.bid.toFixed(2)) }))
    ),
  })
  const json: any = await res.json().catch(() => ({}))
  const results: any[] = json || []
  const success: string[] = []
  const failed: { keywordId: string; error: string }[] = []
  for (const r of results) {
    if (r.code === '206' || r.code === 206 || r.keywordId) success.push(String(r.keywordId))
    else failed.push({ keywordId: String(r.keywordId || '?'), error: r.description || `HTTP ${res.status}` })
  }
  if (!res.ok && results.length === 0) throw new Error(`Update bids HTTP ${res.status}: ${JSON.stringify(json).slice(0, 300)}`)
  return { success, failed }
}

/** Đẩy Negative Exact/Phrase vào chiến dịch (v2 POST /sp/negativeKeywords) */
export async function pushNegativeKeywords(
  cfg: AdsConfig,
  negatives: { campaignId: string; adGroupId?: string; keywordText: string; matchType: 'NEGATIVE_EXACT' | 'NEGATIVE_PHRASE' }[]
): Promise<{ success: number; failed: { keywordText: string; error: string }[] }> {
  const res = await adsFetch(cfg, '/sp/negativeKeywords', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.spnegativekeywords.v2+json',
      Accept: 'application/vnd.spnegativekeywords.v2+json',
    },
    body: JSON.stringify(
      negatives.map((n) => ({
        campaignId: n.campaignId,
        adGroupId: n.adGroupId,
        state: 'enabled',
        keywordText: n.keywordText,
        matchType: n.matchType === 'NEGATIVE_PHRASE' ? 'negativePhrase' : 'negativeExact',
      }))
    ),
  })
  const json: any = await res.json().catch(() => ({}))
  const results: any[] = json || []
  const failed = results
    .filter((r) => !(r.code === '206' || r.code === 206 || r.keywordId))
    .map((r) => ({ keywordText: String(r.keywordText || '?'), error: r.description || `HTTP ${res.status}` }))
  if (!res.ok && results.length === 0) throw new Error(`Push negatives HTTP ${res.status}: ${JSON.stringify(json).slice(0, 300)}`)
  return { success: results.length - failed.length, failed }
}
