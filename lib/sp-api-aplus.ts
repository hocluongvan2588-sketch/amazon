// ====================================================================
// SP-API A+ CONTENT PUBLISHING API 2020-11-01 (SPRINT 4.1)
// Server-only. Flow thật theo Amazon:
//   1. POST /aplus/2020-11-01/contentDocuments  → tạo content document
//      (module chuẩn: standardSingleImageHighlights: headline+body+image)
//   2. POST /aplus/2020-11-01/contentDocuments/{key}/variations → gán ASIN
//   3. POST .../approvalSubmissions → nộp duyệt (Amazon review ~24-48h)
//   4. POST .../publishmentSubmissions → xuất bản sau khi được duyệt
// Route chỉ tự động hóa bước 1-3; bước 4 nút riêng để chủ động.
// ====================================================================

import { getSpApiEnv, spApiSignedFetch } from './sp-api-auth'

export interface AplusModuleInput {
  headline: string
  body: string
  imageUrl?: string
}

export interface AplusPushPayload {
  name: string // tên content document (≤100 ký tự)
  asin: string
  modules: AplusModuleInput[] // 1-5 module
}

export interface AplusPushResult {
  mode: 'LIVE' | 'SIMULATED'
  success: boolean
  contentReferenceKey?: string
  submissionId?: string
  status?: number
  issues: { severity: string; code?: string; message: string }[]
  raw?: unknown
}

/** Build contentDocument theo schema A+ (module standardSingleImageHighlights). */
export function buildAplusContentDocument(p: AplusPushPayload): Record<string, unknown> {
  const e = getSpApiEnv()
  return {
    contentDocument: {
      name: p.name.slice(0, 100),
      marketplaceId: e.marketplaceId,
      locale: 'en_US',
      modules: p.modules.slice(0, 5).map((m, i) => ({
        standardSingleImageHighlights: {
          headline: { value: m.headline.slice(0, 90) },
          body: { value: [{ value: m.body.slice(0, 1000) }] },
          ...(m.imageUrl ? { image: { source: { mediaLocation: m.imageUrl } } } : {}),
          backgroundColor: '#FFFFFF',
          decorative: i === 0,
        },
      })),
    },
  }
}

/** Bước 1-3: tạo document → gán ASIN → nộp duyệt. */
export async function pushAplusContent(p: AplusPushPayload): Promise<AplusPushResult> {
  const e = getSpApiEnv()
  const mIds = e.marketplaceId
  const issues: AplusPushResult['issues'] = []

  // (1) tạo content document
  const docBody = buildAplusContentDocument(p)
  const created = await spApiSignedFetch(
    'POST',
    `/aplus/2020-11-01/contentDocuments?marketplaceIds=${mIds}`,
    docBody
  )
  if (created.status >= 300) {
    return {
      mode: 'LIVE',
      success: false,
      status: created.status,
      issues: parseAplusIssues(created.json, 'Tạo content document thất bại'),
      raw: created.json,
    }
  }
  const refKey: string | undefined = created.json?.contentReferenceKey
  if (!refKey) {
    return {
      mode: 'LIVE', success: false, status: created.status,
      issues: [{ severity: 'ERROR', message: 'Amazon không trả contentReferenceKey' }],
      raw: created.json,
    }
  }

  // (2) gán ASIN
  const vari = await spApiSignedFetch(
    'POST',
    `/aplus/2020-11-01/contentDocuments/${refKey}/variations?marketplaceIds=${mIds}`,
    { asinSet: [p.asin] }
  )
  if (vari.status >= 300) {
    issues.push(...parseAplusIssues(vari.json, `Gán ASIN ${p.asin} thất bại`))
  }

  // (3) nộp duyệt (bắt buộc trước khi publish; Amazon review 24-48h)
  const appr = await spApiSignedFetch(
    'POST',
    `/aplus/2020-11-01/contentDocuments/${refKey}/approvalSubmissions?marketplaceIds=${mIds}`,
    {}
  )
  if (appr.status >= 300) {
    issues.push(...parseAplusIssues(appr.json, 'Nộp duyệt thất bại'))
  }

  return {
    mode: 'LIVE',
    success: issues.every((i) => i.severity !== 'ERROR'),
    contentReferenceKey: refKey,
    submissionId: appr.json?.submissionId || vari.json?.submissionId,
    status: appr.status,
    issues: [
      ...issues,
      {
        severity: 'INFO',
        message:
          'Đã nộp duyệt — Amazon rà soát thủ công ~24-48 giờ. Sau khi APPROVED, gọi publishmentSubmissions để xuất bản lên ASIN.',
      },
    ],
    raw: { refKey, variationStatus: vari.status, approvalStatus: appr.status },
  }
}

/** Bước 4 (nút riêng): publish sau khi Amazon APPROVED. */
export async function publishAplusContent(refKey: string, asin: string): Promise<AplusPushResult> {
  const e = getSpApiEnv()
  const pub = await spApiSignedFetch(
    'POST',
    `/aplus/2020-11-01/contentDocuments/${refKey}/publishmentSubmissions?marketplaceIds=${e.marketplaceId}`,
    { asin: asin }
  )
  return {
    mode: 'LIVE',
    success: pub.status < 300,
    status: pub.status,
    submissionId: pub.json?.submissionId,
    issues: pub.status < 300 ? [] : parseAplusIssues(pub.json, 'Publish thất bại (kiểm tra document đã APPROVED chưa)'),
    raw: pub.json,
  }
}

function parseAplusIssues(json: any, fallback: string): AplusPushResult['issues'] {
  if (Array.isArray(json?.errors) && (json.errors as any[]).length > 0) {
    return (json.errors as any[]).map((er) => ({
      severity: 'ERROR',
      code: er.code,
      message: String(er.message || er.details || '').slice(0, 300),
    }))
  }
  if (Array.isArray(json?.issues) && (json.issues as any[]).length > 0) {
    return (json.issues as any[]).map((er) => ({
      severity: String(er.severity || 'ERROR'),
      code: er.code,
      message: String(er.message || '').slice(0, 300),
    }))
  }
  return [{ severity: 'ERROR', message: `${fallback} (HTTP)` }]
}
