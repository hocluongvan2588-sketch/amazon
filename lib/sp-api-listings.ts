// ====================================================================
// SP-API LISTINGS ITEMS 2021-08-01 — PUSH THẬT (GIAI ĐOẠN 4)
// Server-only (route API). Auth chung ở lib/sp-api-auth.ts.
// PATCH 6 path: title/bullet_point/product_description/generic_keyword/
// images/purchasable_offer. Thiếu env → caller trả SIMULATED.
// ====================================================================

import { getSpApiEnv, spApiSignedFetch } from './sp-api-auth'

export interface ListingPatchPayload {
  sku: string
  productType: string // vd GROCERY
  title: string
  bulletPoints: string[]
  description: string
  genericKeywords: string // backend search terms (<249 bytes đã validate)
  imageUrl?: string // main image public URL (Supabase Storage)
  price?: number
  currency?: string
}

export interface SpApiPushResult {
  mode: 'LIVE' | 'SIMULATED'
  success: boolean
  submissionId?: string
  status?: number
  issues: { severity: string; code?: string; message: string }[]
  raw?: unknown
}

export { getSpApiEnv, isSpApiLive } from './sp-api-auth'
import { isSpApiLive as _isLive } from './sp-api-auth'
void _isLive

// ---------------- PATCH BUILDERS ----------------

/** Cấu trúc attributes theo schema Listings Items (marketplace US). */
export function buildListingPatchBody(p: ListingPatchPayload): Record<string, unknown> {
  const e = getSpApiEnv()
  const mk = (v: string) => [{ value: v, language_tag: 'en_US' }]
  const attributes: Record<string, unknown> = {
    title: mk(p.title),
    bullet_point: p.bulletPoints.map((b) => mk(b)),
    product_description: mk(p.description),
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

/** Đẩy PATCH Listings lên Seller Central (LIVE). */
export async function pushListingPatch(p: ListingPatchPayload): Promise<SpApiPushResult> {
  const e = getSpApiEnv()
  const body = buildListingPatchBody(p)
  const path =
    `/listings/2021-08-01/marketplaces/${e.marketplaceId}/skus/${encodeURIComponent(p.sku)}?issue_locale=en_US`
  const { status, json } = await spApiSignedFetch('PUT', path, body)
  const issues = Array.isArray(json?.issues)
    ? (json.issues as any[]).map((i) => ({
        severity: String(i.severity || 'UNKNOWN'),
        code: i.code,
        message: String(i.message || '').slice(0, 300),
      }))
    : []
  return {
    mode: 'LIVE',
    success: status >= 200 && status < 300 && !issues.some((i) => i.severity === 'ERROR'),
    submissionId: json?.submissionId || undefined,
    status,
    issues,
    raw: { status, submissionId: json?.submissionId },
  }
}
