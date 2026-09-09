import { NextRequest, NextResponse } from 'next/server'
import {
  getSPApiCredentials,
  missingSPApiEnv,
  spCheckConnection,
  spSyncInventory,
  spSyncOrders,
} from '@/lib/sp-api-server'
import type { SyncResult } from '@/lib/amazon-sp-api'

// ====================================================================
// VEXIM AMAZON SYNC GATEWAY — POST /api/amazon/sync  |  GET = trạng thái
// LIVE MODE: đủ 5 env bắt buộc (LWA client + refresh token + IAM keys)
//            -> gọi Amazon SP-API THẬT (SigV4, rate-limit aware).
// SIMULATED: thiếu credentials -> trả simulated:true để UI báo thẳng người dùng
//            (không còn "giả vờ thành công" như bản cũ).
// ====================================================================

export async function GET() {
  const missing = missingSPApiEnv()
  return NextResponse.json({
    mode: missing.length === 0 ? 'LIVE' : 'SIMULATED',
    missingEnv: missing,
    endpointConfigured: !!process.env.AMAZON_SP_API_ENDPOINT,
    marketplaceId: process.env.AMAZON_MARKETPLACE_ID || 'ATVPDKIKX0DER (default)',
    note:
      missing.length === 0
        ? 'Đủ credentials — sync sẽ gọi Amazon SP-API thật.'
        : 'Thiếu credentials — sync chạy chế độ mô phỏng, kết quả KHÔNG phải dữ liệu Amazon thật.',
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { module?: string; sku?: string }
    const mod = body.module || 'ORDERS'

    // 1. Chưa đủ credentials -> chế độ mô phỏng (minh bạch qua cờ simulated)
    if (missingSPApiEnv().length > 0) {
      return NextResponse.json({
        simulated: true,
        reason: 'MISSING_CREDENTIALS',
        missingEnv: missingSPApiEnv(),
        result: {
          module: mod,
          success: true,
          itemsCount: 0,
          simulated: true,
          syncedAt: new Date().toISOString(),
          details:
            'CHẾ ĐỘ MÔ PHỎNG — chưa cấu hình Amazon SP-API credentials. Kết quả không phải dữ liệu Amazon thật. Xem GET /api/amazon/sync để biết biến còn thiếu.',
        } satisfies SyncResult,
      })
    }

    const creds = getSPApiCredentials()!

    // 2. LIVE MODE — gọi Amazon thật theo module
    switch (mod) {
      case 'CONNECTION_CHECK': {
        const health = await spCheckConnection(creds)
        return NextResponse.json({
          simulated: false,
          result: {
            module: 'SELLERS_V1',
            success: health.status === 'HEALTHY',
            itemsCount: health.marketplaces.length,
            simulated: false,
            syncedAt: new Date().toISOString(),
            details: health.status === 'HEALTHY'
              ? `Kết nối SP-API THẬT thành công. Marketplaces: ${health.marketplaces.join(', ')}`
              : `Kết nối lỗi: ${health.error}`,
            error: health.error,
          } satisfies SyncResult,
        })
      }

      case 'ORDERS': {
        const r = await spSyncOrders(creds)
        const breakdown = Object.entries(r.orderStatuses)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
        return NextResponse.json({
          simulated: false,
          result: {
            module: 'ORDERS_V0',
            success: true,
            itemsCount: r.orderCount,
            simulated: false,
            syncedAt: new Date().toISOString(),
            details: `Đã tải THẬT ${r.orderCount} đơn hàng 7 ngày qua từ Amazon (${breakdown || 'không có đơn'}).`,
          } satisfies SyncResult,
        })
      }

      case 'INVENTORY': {
        const r = await spSyncInventory(creds)
        return NextResponse.json({
          simulated: false,
          result: {
            module: 'FBA_INVENTORY_V1',
            success: true,
            itemsCount: r.skuCount,
            simulated: false,
            syncedAt: new Date().toISOString(),
            details: `Đã tải THẬT tồn kho FBA: ${r.skuCount} SKU, tổng ${r.totalQuantity} units khả dụng.`,
          } satisfies SyncResult,
        })
      }

      case 'PERFORMANCE_ADS': {
        // Amazon Ads API là hệ thống riêng (advertising-api.amazon.com, OAuth khác)
        // -> chưa implement trong giai đoạn này, trả lỗi rõ ràng thay vì giả thành công.
        return NextResponse.json({
          simulated: false,
          result: {
            module: 'AMAZON_ADS_V3',
            success: false,
            itemsCount: 0,
            simulated: false,
            syncedAt: new Date().toISOString(),
            details:
              'Amazon Ads API cần OAuth flow riêng (advertising-api.amazon.com) — chưa triển khai ở giai đoạn này. Cần thêm scope + profileId của Amazon Ads.',
            error: 'ADS_API_NOT_IMPLEMENTED',
          } satisfies SyncResult,
        })
      }

      case 'AI_NIGHTLY_SCAN': {
        // Quét nội bộ bằng AI engine của platform, không cần gọi Amazon
        return NextResponse.json({
          simulated: false,
          result: {
            module: 'AI_NIGHTLY_SCAN',
            success: true,
            itemsCount: 0,
            simulated: false,
            syncedAt: new Date().toISOString(),
            details: 'Quét vận hành nội bộ (không gọi Amazon API). Chạy lại qua AI Operations tab.',
          } satisfies SyncResult,
        })
      }

      default:
        return NextResponse.json({ error: `Module không hỗ trợ: ${mod}` }, { status: 400 })
    }
  } catch (err: any) {
    console.error('[Vexim SP-API Sync]', err)
    return NextResponse.json(
      {
        simulated: false,
        result: {
          module: 'UNKNOWN',
          success: false,
          itemsCount: 0,
          simulated: false,
          syncedAt: new Date().toISOString(),
          details: `Lỗi đồng bộ Amazon: ${err?.message || err}`,
          error: err?.code || 'SP_API_ERROR',
        } satisfies SyncResult,
      },
      { status: 200 }
    )
  }
}
