// ====================================================================
// API ROUTE — BUYER MESSAGING (SPRINT 4.1, COMMUNICATION)
// POST /api/amazon/messages/send
// Body: { amazonOrderId, text }
//
// MINH BẠCH: Amazon KHÔNG cung cấp endpoint đồng bộ hộp thư buyer —
// tin nhắn đến chỉ có trong Seller Central. Via API chỉ gửi được LOẠI
// TIN CHO PHÉP: createRestrictedMessage (nội dung chung, cần RDT vì
// chạm dữ liệu giới hạn PII). Inbox Vexim hydrate từ bảng
// customer_inquiries (email/forwarding/nhập tay) — không phải từ Amazon.
// ====================================================================

import { NextResponse } from 'next/server'
import { getSpApiEnv, isSpApiLive, signSpApiRequest } from '@/lib/sp-api-auth'
import { getLwaAccessToken } from '@/lib/sp-api-auth'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body phải là JSON' }, { status: 400 })
  }
  const { amazonOrderId, text } = body || {}
  if (!amazonOrderId || !text || !String(text).trim()) {
    return NextResponse.json(
      { error: 'Thiếu amazonOrderId hoặc text (nội dung tin nhắn)' },
      { status: 400 }
    )
  }

  const e = getSpApiEnv()
  const messagePath = `/messaging/v1/orders/${encodeURIComponent(String(amazonOrderId))}/messages/createRestrictedMessage`

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
              `Chưa có credentials SP-API — chưa gửi gì tới Amazon. Khi LIVE, reply sẽ gửi qua ` +
              `POST ${messagePath} bằng Restricted Data Token (RDT). Lưu ý: Amazon chỉ cho phép ` +
              `gửi tin nhắn trong 30 ngày kể từ ngày hoàn tất đơn (messaging window).`,
          },
        ],
      },
    })
  }

  try {
    // 1. Xin RDT cho messaging của đơn này (PII-restricted resource)
    const rdtBody = {
      restrictedResources: [
        { method: 'POST', path: messagePath, dataElements: ['buyerInfo'] },
      ],
    }
    const rdtUrl = new URL(`${e.endpoint}/tokens/2021-06-30/restrictedResources`)
    const rdtHeaders = signSpApiRequest('POST', rdtUrl, JSON.stringify(rdtBody))
    rdtHeaders['Content-Type'] = 'application/json'
    rdtHeaders['x-amz-access-token'] = await getLwaAccessToken()
    const rdtRes = await fetch(rdtUrl.toString(), {
      method: 'POST',
      headers: rdtHeaders,
      body: JSON.stringify(rdtBody),
    })
    const rdtJson: any = await rdtRes.json().catch(() => ({}))
    const rdt = rdtJson?.restrictedDataToken
    if (!rdt) {
      return NextResponse.json(
        {
          mode: 'LIVE',
          result: {
            mode: 'LIVE',
            success: false,
            issues: [
              { severity: 'ERROR', message: `Không lấy được RDT (HTTP ${rdtRes.status}) — kiểm tra quyền app/token` },
            ],
          },
        },
        { status: 502 }
      )
    }

    // 2. Gửi tin nhắn bằng RDT
    const msgUrl = new URL(`${e.endpoint}${messagePath}`)
    const msgHeaders = signSpApiRequest('POST', msgUrl, JSON.stringify({ text: String(text).slice(0, 2000) }))
    msgHeaders['Content-Type'] = 'application/json'
    msgHeaders['x-amz-access-token'] = rdt // RDT thay LWA token cho restricted resource
    const msgRes = await fetch(msgUrl.toString(), {
      method: 'POST',
      headers: msgHeaders,
      body: JSON.stringify({ text: String(text).slice(0, 2000) }),
    })
    const msgJson: any = await msgRes.json().catch(() => ({}))
    return NextResponse.json({
      mode: 'LIVE',
      result: {
        mode: 'LIVE',
        success: msgRes.status < 300,
        submissionId: msgJson?.wamId || undefined,
        status: msgRes.status,
        issues:
          msgRes.status < 300
            ? []
            : [{ severity: 'ERROR', message: String(msgJson?.errors?.[0]?.message || `HTTP ${msgRes.status}`).slice(0, 300) }],
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        mode: 'LIVE',
        result: {
          mode: 'LIVE',
          success: false,
          issues: [{ severity: 'ERROR', message: `Messaging API thất bại: ${String(err?.message || err).slice(0, 300)}` }],
        },
      },
      { status: 502 }
    )
  }
}
