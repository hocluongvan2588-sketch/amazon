// ====================================================================
// API ROUTE — PUSH A+ CONTENT LÊN AMAZON (SPRINT 4.1)
// POST /api/amazon/aplus/push
// Body: { asin, name, modules: [{ headline, body, imageUrl? }], action?: 'PUBLISH' }
// - action mặc định 'SUBMIT'  → tạo document + gán ASIN + NỘP DUYỆT
// - action 'PUBLISH'          → publish document đã APPROVED (body thêm refKey)
// Thiếu credentials SP-API → SIMULATED (preview payload, không gọi Amazon).
// ====================================================================

import { NextResponse } from 'next/server'
import { isSpApiLive } from '@/lib/sp-api-auth'
import {
  AplusModuleInput,
  buildAplusContentDocument,
  publishAplusContent,
  pushAplusContent,
} from '@/lib/sp-api-aplus'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body phải là JSON' }, { status: 400 })
  }

  const asin: string = body?.asin
  const name: string = body?.name || `Vexim A+ ${Date.now()}`
  const modules: AplusModuleInput[] = Array.isArray(body?.modules) ? body.modules : []
  const action: 'SUBMIT' | 'PUBLISH' = body?.action === 'PUBLISH' ? 'PUBLISH' : 'SUBMIT'
  const refKey: string | undefined = body?.refKey

  // ---------- Validate ----------
  if (!asin) return NextResponse.json({ error: 'Thiếu asin' }, { status: 400 })
  if (modules.length === 0 || modules.some((m) => !m.headline && !m.body)) {
    return NextResponse.json(
      { error: 'Cần ít nhất 1 module có headline hoặc body (tối đa 5 module)' },
      { status: 400 }
    )
  }
  if (action === 'PUBLISH' && !refKey) {
    return NextResponse.json(
      { error: 'PUBLISH cần refKey của document đã APPROVED (lấy từ lần SUBMIT)' },
      { status: 400 }
    )
  }

  // ---------- SIMULATED ----------
  if (!isSpApiLive()) {
    return NextResponse.json({
      mode: 'SIMULATED',
      result: {
        mode: 'SIMULATED',
        success: true,
        issues: [
          {
            severity: 'INFO',
            message:
              'Chưa có credentials SP-API — không gọi Amazon. Payload content document đã build hợp lệ ' +
              '(schema standardSingleImageHighlights); cấu hình AMAZON_SP_API_* để chuyển LIVE.',
          },
        ],
        raw: { preview: buildAplusContentDocument({ name, asin, modules }) },
      },
    })
  }

  // ---------- LIVE ----------
  try {
    if (action === 'PUBLISH') {
      const result = await publishAplusContent(refKey!, asin)
      return NextResponse.json({ mode: 'LIVE', result })
    }
    const result = await pushAplusContent({ name, asin, modules })
    return NextResponse.json({ mode: 'LIVE', result })
  } catch (err: any) {
    return NextResponse.json(
      {
        mode: 'LIVE',
        result: {
          mode: 'LIVE',
          success: false,
          issues: [
            { severity: 'ERROR', message: `A+ API thất bại: ${String(err?.message || err).slice(0, 300)}` },
          ],
        },
      },
      { status: 502 }
    )
  }
}
