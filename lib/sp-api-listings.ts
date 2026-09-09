// ====================================================================
// SP-API LISTINGS ITEMS 2021-08-01 — PUSH THẬT (GIAI ĐOẠN 4)
// --------------------------------------------------------------------
// Client-side KHÔNG BAO GIỜ import file này (chỉ API route server) —
// secrets nằm trong env server, không rò rỉ bundle.
//
// Flow thật:
//  1. LWA access token từ refresh_token (app: client_id/secret)
//  2. Ký AWS SigV4 (service 'execute-api') bằng IAM credential
//  3. PUT /listings/2021-08-01/marketplaces/{id}/skus/{sku} (JSON-PATCH)
//
// Thiếu BẤT KỲ env nào → caller (route) trả SIMULATED, không call.
// NOTE A+: A+ Content Publishing API (2020-11-01) là API riêng, phức tạp
// hơn — chưa gộp ở đây (lộ trình tiếp theo); PATCH này đẩy title/bullets/
// description/generic_keyword/images/purchasable_offer(price).
// ====================================================================

import crypto from 'crypto'

export interface ListingPatchPayload {
  sku: string
  productType: string // vd GROCERY
  title: string
  bulletPoints: string[]
  description: string
  genericKeywords: string // backend search terms
  imageUrl?: string // main image public URL (Supabase Storage)
  price?: number
  currency?: string // default USD
}

export interface SpApiPushResult {
  mode: 'LIVE' | 'SIMULATED'
  success: boolean
  submissionId?: string
  status?: number
  issues: { severity: string; code?: string; message: string }[]
  raw?: unknown
}

// ---------------- ENV GUARD ----------------

export function getSpApiEnv() {
  return {
    clientId: process.env.AMAZON_SP_API_CLIENT_ID,
    clientSecret: process.env.AMAZON_SP_API_CLIENT_SECRET,
    refreshToken: process.env.AMAZON_SP_API_REFRESH_TOKEN,
    awsAccessKey: process.env.AMAZON_SP_API_AWS_ACCESS_KEY_ID,
    awsSecretKey: process.env.AMAZON_SP_API_AWS_SECRET_ACCESS_KEY,
    awsSessionToken: process.env.AMAZON_SP_API_AWS_SESSION_TOKEN,
    awsRegion: process.env.AMAZON_SP_API_AWS_REGION || 'us-east-1',
    endpoint: process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-na.amazon.com',
    marketplaceId: process.env.AMAZON_MARKETPLACE_ID || 'ATVPDKIKX0DER', // US
  }
}

export function isSpApiLive(): boolean {
  const e = getSpApiEnv()
  return Boolean(
    e.clientId && e.clientSecret && e.refreshToken && e.awsAccessKey && e.awsSecretKey
  )
}

// ---------------- LWA TOKEN ----------------

let cachedToken: { token: string; expiresAt: number } | null = null

async function getLwaAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token
  const e = getSpApiEnv()
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: e.refreshToken!,
      client_id: e.clientId!,
      client_secret: e.clientSecret!,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`LWA token ${res.status}: ${text.slice(0, 300)}`)
  }
  const json = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 }
  return json.access_token
}

// ---------------- AWS SIGV4 (execute-api) ----------------

function hmac(key: string | crypto.BinaryLike, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest()
}

function sha256Hex(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex')
}

function sigV4Headers(
  method: string,
  url: URL,
  body: string,
  region: string
): Record<string, string> {
  const e = getSpApiEnv()
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '') // 20260914T091500Z
  const dateStamp = amzDate.slice(0, 8)

  const payloadHash = sha256Hex(body || '')
  const canonicalHeaders =
    `host:${url.host}\n` +
    `x-amz-date:${amzDate}\n` +
    (e.awsSessionToken ? `x-amz-security-token:${e.awsSessionToken}\n` : '')
  const signedHeaders =
    'host;x-amz-date' + (e.awsSessionToken ? ';x-amz-security-token' : '')

  const canonicalRequest = [
    method,
    url.pathname,
    url.search.replace(/^\?/, ''),
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')

  const scope = `${dateStamp}/${region}/execute-api/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    scope,
    sha256Hex(canonicalRequest),
  ].join('\n')

  const kDate = hmac(`AWS4${e.awsSecretKey}`, dateStamp)
  const kRegion = hmac(kDate, region)
  const kService = hmac(kRegion, 'execute-api')
  const kSigning = hmac(kService, 'aws4_request')
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign, 'utf8').digest('hex')

  const headers: Record<string, string> = {
    'x-amz-date': amzDate,
    Authorization:
      `AWS4-HMAC-SHA256 Credential=${e.awsAccessKey}/${scope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`,
  }
  if (e.awsSessionToken) headers['x-amz-security-token'] = e.awsSessionToken
  return headers
}

// ---------------- PATCH BUILDERS ----------------

/** Cấu trúc attributes theo schema Listings Items (marketplace US).
 *  Giá trị văn bản chuẩn dạng [{ value, language_tag }]. */
export function buildListingPatchBody(p: ListingPatchPayload): Record<string, unknown> {
  const e = getSpApiEnv()
  const mk = (v: string) => [{ value: v, language_tag: 'en_US' }]
  const attributes: Record<string, unknown> = {
    title: mk(p.title),
    bullet_point: p.bulletPoints.map((b) => mk(b)),
    product_description: mk(p.description),
    // Backend search terms — hạn ngạch < 249 BYTES, engine 3.2 đã kiểm tra trước
    generic_keyword: [{ value: p.genericKeywords, language_tag: 'en_US' }],
  }
  if (p.imageUrl) {
    attributes.images = [
      {
        media_location: p.imageUrl,
        marketplace_id: e.marketplaceId,
        image_type: 'MAIN',
      },
    ]
  }
  if (p.price && p.price > 0) {
    attributes.purchasable_offer = [
      {
        marketplace_id: e.marketplaceId,
        our_price: [
          { schedule: [{ value_with_tax: [{ audience: 'ALL', value: p.price }] }] },
        ],
        ...(p.currency ? { currency: p.currency } : {}),
      },
    ]
  }
  return {
    productType: p.productType || 'GROCERY',
    patches: Object.keys(attributes).map((k) => ({
      op: 'replace',
      path: `/attributes/${k}`,
      value: attributes[k],
    })),
    issueLocale: 'en_US',
  }
}

// ---------------- PUSH ----------------

/** Đẩy PATCH lên Seller Central. Caller PHẢI kiểm tra isSpApiLive() trước —
 *  hàm này chỉ chạy khi env đầy đủ; lỗi network/API → throw cho route xử lý. */
export async function pushListingPatch(p: ListingPatchPayload): Promise<SpApiPushResult> {
  const e = getSpApiEnv()
  const token = await getLwaAccessToken()
  const body = JSON.stringify(buildListingPatchBody(p))
  const url = new URL(
    `${e.endpoint}/listings/2021-08-01/marketplaces/${e.marketplaceId}/skus/${encodeURIComponent(p.sku)}?issue_locale=en_US`
  )
  const headers = sigV4Headers('PUT', url, body, e.awsRegion)
  headers['Content-Type'] = 'application/json'
  headers['x-amz-access-token'] = token // LWA token riêng, KHÔNG ký vào SigV4

  const res = await fetch(url.toString(), { method: 'PUT', headers, body })
  const json: any = await res.json().catch(() => ({}))
  const issues = Array.isArray(json?.issues)
    ? (json.issues as any[]).map((i) => ({
        severity: String(i.severity || 'UNKNOWN'),
        code: i.code,
        message: String(i.message || '').slice(0, 300),
      }))
    : []

  return {
    mode: 'LIVE',
    success: res.ok && !issues.some((i) => i.severity === 'ERROR'),
    submissionId: json?.submissionId || undefined,
    status: res.status,
    issues,
    raw: { status: res.status, submissionId: json?.submissionId },
  }
}
