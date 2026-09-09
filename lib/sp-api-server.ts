import crypto from 'node:crypto'

// ====================================================================
// VEXIM — AMAZON SP-API REAL SERVER-SIDE CONNECTOR
// Thay thế simulator (lib/amazon-sp-api.ts) ở tầng SERVER:
//  - LWA (Login with Amazon) refresh_token -> access_token (cache tới khi hết hạn)
//  - AWS Signature V4 (service: execute-api) — BẮT BUỘC cho mọi call SP-API
//  - Retry 429 theo Retry-After, tự refresh token khi 401
// Chỉ chạy trên server (route handlers). Không import vào client component.
// Credentials đọc từ env — thiếu bất kỳ biến bắt buộc nào => LIVE MODE không bật.
// ====================================================================

const LWA_TOKEN_URL = 'https://api.amazon.com/auth/o2/token'

export interface SPApiCredentials {
  clientId: string
  clientSecret: string
  refreshToken: string
  awsAccessKeyId: string
  awsSecretAccessKey: string
  awsSessionToken?: string
  awsRegion: string
  endpoint: string
  marketplaceId: string
  sellerId?: string
}

const REQUIRED_ENV = [
  'AMAZON_SP_API_CLIENT_ID',
  'AMAZON_SP_API_CLIENT_SECRET',
  'AMAZON_SP_API_REFRESH_TOKEN',
  'AMAZON_SP_API_AWS_ACCESS_KEY_ID',
  'AMAZON_SP_API_AWS_SECRET_ACCESS_KEY',
] as const

/** Danh sách biến env CÒN THIẾU (không bao giờ trả về giá trị) */
export function missingSPApiEnv(): string[] {
  return REQUIRED_ENV.filter((k) => !process.env[k])
}

export function getSPApiCredentials(): SPApiCredentials | null {
  if (missingSPApiEnv().length > 0) return null
  return {
    clientId: process.env.AMAZON_SP_API_CLIENT_ID!,
    clientSecret: process.env.AMAZON_SP_API_CLIENT_SECRET!,
    refreshToken: process.env.AMAZON_SP_API_REFRESH_TOKEN!,
    awsAccessKeyId: process.env.AMAZON_SP_API_AWS_ACCESS_KEY_ID!,
    awsSecretAccessKey: process.env.AMAZON_SP_API_AWS_SECRET_ACCESS_KEY!,
    awsSessionToken: process.env.AMAZON_SP_API_AWS_SESSION_TOKEN,
    awsRegion: process.env.AMAZON_SP_API_AWS_REGION || 'us-east-1',
    endpoint: process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-na.amazon.com',
    marketplaceId: process.env.AMAZON_MARKETPLACE_ID || 'ATVPDKIKX0DER',
    sellerId: process.env.AMAZON_SELLER_ID,
  }
}

export class SPApiError extends Error {
  constructor(
    public code: string,
    public httpStatus: number | null,
    message: string
  ) {
    super(message)
  }
}

// ---------------- LWA TOKEN ----------------

let lwaCache: { token: string; expiresAt: number } | null = null

export async function getLWAAccessToken(creds: SPApiCredentials): Promise<string> {
  if (lwaCache && Date.now() < lwaCache.expiresAt - 60_000) return lwaCache.token

  const res = await fetch(LWA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: creds.refreshToken,
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
    }).toString(),
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) {
    throw new SPApiError(
      'LWA_TOKEN_FAILED',
      res.status,
      `LWA token exchange failed (${res.status}): ${(await res.text()).slice(0, 300)}`
    )
  }

  const json = (await res.json()) as { access_token: string; expires_in: number }
  lwaCache = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 }
  return lwaCache.token
}

// ---------------- AWS SIGV4 ----------------

const hmac = (key: crypto.BinaryLike | crypto.KeyObject, data: string) =>
  crypto.createHmac('sha256', key).update(data).digest()
const sha256hex = (data: string) => crypto.createHash('sha256').update(data).digest('hex')

function encodeRfc3986(str: string): string {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase()
  )
}

export interface SPApiResponse {
  status: number
  ok: boolean
  json: any
}

/**
 * Gọi SP-API có ký AWS SigV4. GET-only (đủ cho Orders/Inventory/Listings read).
 * Retry: 429 theo Retry-After (tối đa 1 lần), 401 do token hết hạn -> refresh 1 lần.
 */
export async function spApiFetch(
  creds: SPApiCredentials,
  path: string,
  query: Record<string, string> = {},
  depth = 0
): Promise<SPApiResponse> {
  const accessToken = await getLWAAccessToken(creds)

  const url = new URL(creds.endpoint + path)
  const sortedQuery = Object.keys(query)
    .sort()
    .map((k) => `${encodeRfc3986(k)}=${encodeRfc3986(query[k])}`)
    .join('&')
  url.search = sortedQuery

  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '') // YYYYMMDD'T'HHMMSS'Z'
  const dateStamp = amzDate.slice(0, 8)
  const host = url.host

  const signedHeaderList = ['host', 'x-amz-access-token', 'x-amz-date']
  if (creds.awsSessionToken) signedHeaderList.push('x-amz-security-token')
  const signedHeaders = signedHeaderList.join(';')

  const canonicalHeaders =
    `host:${host}\n` +
    `x-amz-access-token:${accessToken}\n` +
    `x-amz-date:${amzDate}\n` +
    (creds.awsSessionToken ? `x-amz-security-token:${creds.awsSessionToken}\n` : '')

  const canonicalRequest = [
    'GET',
    url.pathname,
    sortedQuery,
    canonicalHeaders,
    signedHeaders,
    sha256hex(''),
  ].join('\n')

  const scope = `${dateStamp}/${creds.awsRegion}/execute-api/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    scope,
    sha256hex(canonicalRequest),
  ].join('\n')

  let signingKey: crypto.BinaryLike | crypto.KeyObject = 'AWS4' + creds.awsSecretAccessKey
  for (const part of [dateStamp, creds.awsRegion, 'execute-api', 'aws4_request']) {
    signingKey = hmac(signingKey, part)
  }
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex')

  const headers: Record<string, string> = {
    'x-amz-access-token': accessToken,
    'x-amz-date': amzDate,
    Authorization: `AWS4-HMAC-SHA256 Credential=${creds.awsAccessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    'User-Agent': 'vexim-ops-platform/1.0',
  }
  if (creds.awsSessionToken) headers['x-amz-security-token'] = creds.awsSessionToken

  let res: Response
  try {
    res = await fetch(url.toString(), {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(20_000),
    })
  } catch (err: any) {
    throw new SPApiError('NETWORK_ERROR', null, `Không kết nối được SP-API: ${err?.message || err}`)
  }

  // 429 -> retry 1 lần theo Retry-After
  if (res.status === 429 && depth === 0) {
    const wait = Math.min(Number(res.headers.get('retry-after') || 5), 10)
    await new Promise((r) => setTimeout(r, wait * 1000))
    return spApiFetch(creds, path, query, depth + 1)
  }
  // Token hết hạn giữa chừng -> clear cache, retry 1 lần
  if (res.status === 401 && depth === 0) {
    lwaCache = null
    return spApiFetch(creds, path, query, depth + 1)
  }

  let json: any = null
  try {
    json = await res.json()
  } catch {
    json = null
  }
  return { status: res.status, ok: res.ok, json }
}

// ---------------- NGHIỆP VỤ ----------------

/** Kiểm tra kết nối: seller có tham gia marketplace nào (GET /sellers/v1) */
export async function spCheckConnection(creds: SPApiCredentials): Promise<{
  status: 'HEALTHY' | 'ERROR'
  marketplaces: string[]
  error?: string
}> {
  const res = await spApiFetch(creds, '/sellers/v1/marketplaceParticipations')
  if (!res.ok) {
    return {
      status: 'ERROR',
      marketplaces: [],
      error: `HTTP ${res.status}: ${JSON.stringify(res.json?.errors?.[0] || {}).slice(0, 300)}`,
    }
  }
  const parts: any[] = res.json?.payload || []
  return {
    status: 'HEALTHY',
    marketplaces: parts.map(
      (p) => p?.marketplace?.name || p?.marketplace?.id || String(p?.marketplace?.id)
    ),
  }
}

/** Đồng bộ đơn hàng 7 ngày gần nhất (GET /orders/v0/orders) */
export async function spSyncOrders(creds: SPApiCredentials): Promise<{
  orderCount: number
  latestPurchaseDate?: string
  orderStatuses: Record<string, number>
}> {
  const createdAfter = new Date(Date.now() - 7 * 86400_000).toISOString()
  const res = await spApiFetch(creds, '/orders/v0/orders', {
    MarketplaceIds: creds.marketplaceId,
    CreatedAfter: createdAfter,
    MaxResults: '50',
    OrderStatuses: 'PendingAvailability,Pending,Shipped,PartiallyShipped,Unshipped,InvoiceUnconfirmed,Canceled,Unfulfillable',
  })
  if (!res.ok) {
    throw new SPApiError(
      'ORDERS_SYNC_FAILED',
      res.status,
      `HTTP ${res.status}: ${JSON.stringify(res.json?.errors?.[0] || {}).slice(0, 300)}`
    )
  }
  const orders: any[] = res.json?.payload?.Orders || []
  const statuses: Record<string, number> = {}
  for (const o of orders) statuses[o.OrderStatus] = (statuses[o.OrderStatus] || 0) + 1
  return {
    orderCount: orders.length,
    latestPurchaseDate: orders[0]?.PurchaseDate,
    orderStatuses: statuses,
  }
}

/** Đồng bộ tóm tắt tồn kho FBA (GET /fba/inventory/v1/summaries) */
export async function spSyncInventory(creds: SPApiCredentials): Promise<{
  skuCount: number
  totalQuantity: number
}> {
  const res = await spApiFetch(creds, '/fba/inventory/v1/summaries', {
    marketplaceIds: creds.marketplaceId,
    details: 'false',
  })
  if (!res.ok) {
    throw new SPApiError(
      'INVENTORY_SYNC_FAILED',
      res.status,
      `HTTP ${res.status}: ${JSON.stringify(res.json?.errors?.[0] || {}).slice(0, 300)}`
    )
  }
  const summaries: any[] = res.json?.payload?.inventorySummaries || []
  return {
    skuCount: summaries.length,
    totalQuantity: summaries.reduce((s, x) => s + (x?.totalQuantity || 0), 0),
  }
}

/** Kiểm tra 1 listing theo SKU (GET /listings/v2/items/{sellerId}/{sku}) */
export async function spGetListing(
  creds: SPApiCredentials,
  sku: string
): Promise<{ ok: boolean; status: number; summary?: any }> {
  if (!creds.sellerId) {
    throw new SPApiError('MISSING_SELLER_ID', null, 'Chưa cấu hình AMAZON_SELLER_ID')
  }
  const res = await spApiFetch(creds, `/listings/v2/items/${encodeURIComponent(creds.sellerId)}/${encodeURIComponent(sku)}`, {
    marketplaceIds: creds.marketplaceId,
    includedData: 'summaries',
  })
  return { ok: res.ok, status: res.status, summary: res.json?.summaries?.[0] }
}
