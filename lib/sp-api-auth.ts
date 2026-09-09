// ====================================================================
// SP-API AUTH DÙNG CHUNG (GĐ4) — LWA token + AWS SigV4
// Server-only: các route API import file này; client bundle KHÔNG.
// Thiếu env → isSpApiLive()=false, caller trả SIMULATED.
// ====================================================================

import crypto from 'crypto'

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

export async function getLwaAccessToken(): Promise<string> {
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

// ---------------- AWS SIGV4 (execute-api) — dùng chung các module SP-API ----------------

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


export interface SignedRequestParts {
  method: string
  url: URL
  headers: Record<string, string>
}

/** Chuẩn bị headers SigV4 cho request tới SP-API (execute-api). */
export function signSpApiRequest(method: string, url: URL, body: string): Record<string, string> {
  return sigV4Headers(method, url, body, getSpApiEnv().awsRegion)
}

/** Fetch có ký SigV4 + LWA/RDT token (token truyền vào header x-amz-access-token). */
export async function spApiSignedFetch(
  method: string,
  path: string,
  body: unknown,
  accessTokenOverride?: string
): Promise<{ status: number; json: any }> {
  const e = getSpApiEnv()
  const url = new URL(path.startsWith('http') ? path : e.endpoint + path)
  const bodyStr = body === undefined ? '' : JSON.stringify(body)
  const headers = signSpApiRequest(method, url, bodyStr)
  headers['Content-Type'] = 'application/json'
  headers['x-amz-access-token'] = accessTokenOverride || (await getLwaAccessToken())
  const res = await fetch(url.toString(), { method, headers, body: bodyStr || undefined })
  const json = await res.json().catch(() => ({}))
  return { status: res.status, json }
}
