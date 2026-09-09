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

async function adsFetch(cfg: AdsConfig, path: string, init?: RequestInit): Promise<Response> {
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
