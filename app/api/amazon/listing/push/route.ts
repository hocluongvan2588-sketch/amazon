// ====================================================================
// API ROUTE — PUSH LISTING PATCH LÊN AMAZON SELLER CENTRAL (GĐ4)
// POST /api/amazon/listing/push
// Body: { sku, title, bulletPoints[], description, genericKeywords,
//         imageUrl?, price?, productType? }
// - env SP-API đầy đủ  → LIVE: LWA + SigV4 + Listings Items PATCH thật
// - thiếu env           → SIMULATED (trung thực, không bịa Feed ID)
// Server-only: secrets chỉ tồn tại ở đây, không bao giờ về client.
// ====================================================================

import { NextResponse } from 'next/server'
import {
  buildListingPatchBody,
  getSpApiEnv,
  isSpApiLive,
  pushListingPatch,
  SpApiPushResult,
} from '@/lib/sp-api-listings'
import { utf8ByteLength } from '@/lib/listing-quality'

export const runtime = 'nodejs' // cần node:crypto cho SigV4

const GENERIC_KEYWORD_BYTE_LIMIT = 249

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body phải là JSON' }, { status: 400 })
  }

  const { sku, title, bulletPoints, description, genericKeywords, imageUrl, price, productType } =
    body || {}

  // ---------- Validate dữ liệu đầu vào ----------
  const missing: string[] = []
  if (!sku) missing.push('sku')
  if (!title || !String(title).trim()) missing.push('title')
  if (!Array.isArray(bulletPoints) || bulletPoints.filter(Boolean).length === 0)
    missing.push('bulletPoints')
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Thiếu trường bắt buộc: ${missing.join(', ')}` },
      { status: 400 }
    )
  }

  // Backend keywords: chuẩn hạn ngạch Amazon 249 BYTES (UTF-8)
  const kw = String(genericKeywords || '')
  const kwBytes = utf8ByteLength(kw)
  if (kwBytes > GENERIC_KEYWORD_BYTE_LIMIT) {
    return NextResponse.json(
      {
        error:
          `Backend search terms ${kwBytes} bytes vượt hạn ngạch Amazon ${GENERIC_KEYWORD_BYTE_LIMIT} bytes — ` +
          `rút gọn trước khi đẩy (xem Engine Backend ở tab Tối Ưu Listing).`,
      },
      { status: 422 }
    )
  }

  // ---------- Chế độ SIMULATED (thiếu credentials) ----------
  if (!isSpApiLive()) {
    const result: SpApiPushResult = {
      mode: 'SIMULATED',
      success: true,
      issues: [
        {
          severity: 'INFO',
          message:
            'Chưa có credentials SP-API — không có request nào gửi tới Amazon. ' +
            'Payload PATCH đã build hợp lệ; cấu hình AMAZON_SP_API_* để chuyển LIVE.',
        },
      ],
      raw: { preview: buildListingPatchBody({ sku, productType, title, bulletPoints, description, genericKeywords, imageUrl, price }) },
    }
    return NextResponse.json({ mode: 'SIMULATED', spApi: getSpApiEnv().marketplaceId, result })
  }

  // ---------- LIVE: đẩy thật ----------
  try {
    const result = await pushListingPatch({
      sku: String(sku),
      productType: String(productType || 'GROCERY'),
      title: String(title),
      bulletPoints: (bulletPoints as string[]).filter(Boolean).map(String),
      description: String(description || ''),
      genericKeywords: kw,
      imageUrl: imageUrl ? String(imageUrl) : undefined,
      price: Number(price) > 0 ? Number(price) : undefined,
      currency: 'USD',
    })
    return NextResponse.json({ mode: 'LIVE', result })
  } catch (err: any) {
    return NextResponse.json(
      {
        mode: 'LIVE',
        result: {
          mode: 'LIVE',
          success: false,
          issues: [
            {
              severity: 'ERROR',
              message: `SP-API call thất bại: ${String(err?.message || err).slice(0, 300)}`,
            },
          ],
        } satisfies SpApiPushResult,
      },
      { status: 502 }
    )
  }
}
