import { NextRequest, NextResponse } from 'next/server'
import {
  getSPApiCredentials,
  missingSPApiEnv,
  spCheckConnection,
} from '@/lib/sp-api-server'
import {
  syncOrdersToDatabase,
  updateInventoryFromAmazon,
} from '@/lib/amazon-sync-service'
import {
  getAdsConfig,
  missingAdsEnv,
  adsListProfiles,
  syncAdsCampaignsToDatabase,
} from '@/lib/ads-api-server'
import { supabase } from '@/lib/supabase'
import type { SyncResult } from '@/lib/amazon-sp-api'

// ====================================================================
// VEXIM AMAZON SYNC GATEWAY — POST /api/amazon/sync  |  GET = trạng thái
// Giai đoạn 2:
//  - LIVE + ORDERS:    pull Amazon -> UPSERT bảng `orders` (kèm thống kê DB)
//  - LIVE + INVENTORY: pull FBA summaries -> UPDATE tồn kho SKU đã có
//  - LIVE + PERFORMANCE_ADS: Ads API profiles/campaigns -> bảng advertising_campaigns
//  - SIMULATED (thiếu credentials): KHÔNG BAO GIỜ ghi DB, trả simulated:true
// ====================================================================

async function resolveClientId(): Promise<string | null> {
  const envClient = process.env.AMAZON_SYNC_CLIENT_ID
  if (envClient && /^[0-9a-f-]{36}$/i.test(envClient)) return envClient
  const { data } = await supabase.from('clients').select('id').limit(1).maybeSingle()
  return data?.id || null
}

export async function GET() {
  const missingSP = missingSPApiEnv()
  const missingAds = missingAdsEnv()
  return NextResponse.json({
    spApi: {
      mode: missingSP.length === 0 ? 'LIVE' : 'SIMULATED',
      missingEnv: missingSP,
      marketplaceId: process.env.AMAZON_MARKETPLACE_ID || 'ATVPDKIKX0DER (default)',
      syncClientId: process.env.AMAZON_SYNC_CLIENT_ID || '(auto: client đầu tiên trong DB)',
    },
    adsApi: {
      mode: missingAds.length === 0 ? 'LIVE' : 'SIMULATED',
      missingEnv: missingAds,
      profileId: process.env.AMAZON_ADS_PROFILE_ID || '(chưa đặt — dùng POST module ADS_PROFILES để khám phá)',
    },
    note:
      missingSP.length === 0
        ? 'SP-API sẵn sàng LIVE — sync sẽ gọi Amazon thật và ghi vào Supabase.'
        : 'SP-API đang SIMULATED — kết quả mô phỏng, KHÔNG ghi DB. Điền env trong .env.local rồi restart.',
  })
}

const okResult = (module: string, details: string, itemsCount = 0, extra?: Partial<SyncResult>): SyncResult => ({
  module,
  success: true,
  itemsCount,
  simulated: false,
  syncedAt: new Date().toISOString(),
  details,
  ...extra,
})

const failResult = (module: string, details: string, error: string): SyncResult => ({
  module,
  success: false,
  itemsCount: 0,
  simulated: false,
  syncedAt: new Date().toISOString(),
  details,
  error,
})

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { module?: string }
    const mod = body.module || 'ORDERS'

    // ---------- ADS: kiểm tra credentials riêng ----------
    if (mod === 'PERFORMANCE_ADS' || mod === 'ADS_PROFILES') {
      const adsMissing = missingAdsEnv()
      if (adsMissing.length > 0) {
        return NextResponse.json({
          simulated: true,
          reason: 'MISSING_ADS_CREDENTIALS',
          missingEnv: adsMissing,
          result: {
            module: mod,
            success: true,
            itemsCount: 0,
            simulated: true,
            syncedAt: new Date().toISOString(),
            details: `CHẾ ĐỘ MÔ PHỎNG — thiếu Amazon Ads config: ${adsMissing.join(', ')}`,
          } satisfies SyncResult,
        })
      }
      const cfg = getAdsConfig()!

      if (mod === 'ADS_PROFILES') {
        // Khám phá profileId (chạy 1 lần sau khi authorize)
        try {
          const { profiles } = await adsListProfiles(cfg)
          return NextResponse.json({
            simulated: false,
            result: okResult(
              'ADS_PROFILES',
              `Tìm thấy ${profiles.length} profile quảng cáo: ${profiles
                .map((p) => `#${p.profileId} (${p.countryCode}, ${p.currency})`)
                .join(' | ')}. Đặt AMAZON_ADS_PROFILE_ID rồi chạy lại PERFORMANCE_ADS.`,
              profiles.length
            ),
            profiles,
          })
        } catch (err: any) {
          return NextResponse.json({
            simulated: false,
            result: failResult('ADS_PROFILES', `Lỗi Ads API: ${err?.message || err}`, 'ADS_API_ERROR'),
          })
        }
      }

      // PERFORMANCE_ADS: sync campaigns metadata vào DB
      try {
        const clientId = await resolveClientId()
        if (!clientId) {
          return NextResponse.json({
            simulated: false,
            result: failResult('AMAZON_ADS_V3', 'Không xác định được client trong DB để gắn campaigns', 'NO_CLIENT'),
          })
        }
        const { synced, dbError } = await syncAdsCampaignsToDatabase(cfg, clientId)
        return NextResponse.json({
          simulated: false,
          result: okResult(
            'AMAZON_ADS_V3',
            `Đã đồng bộ THẬT ${synced} campaigns từ Amazon Ads vào Supabase.${dbError ? ' Lỗi một phần: ' + dbError : ''} (Metrics 7 ngày cần async report — giai đoạn sau.)`,
            synced,
            dbError ? { warnings: [dbError] } : undefined
          ),
        })
      } catch (err: any) {
        return NextResponse.json({
          simulated: false,
          result: failResult('AMAZON_ADS_V3', `Lỗi Ads API: ${err?.message || err}`, 'ADS_API_ERROR'),
        })
      }
    }

    // ---------- SP-API: kiểm tra credentials ----------
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
            'CHẾ ĐỘ MÔ PHỎNG — chưa cấu hình Amazon SP-API credentials. Kết quả không phải dữ liệu Amazon thật và KHÔNG ghi vào DB. Xem GET /api/amazon/sync.',
        } satisfies SyncResult,
      })
    }

    const creds = getSPApiCredentials()!

    switch (mod) {
      case 'CONNECTION_CHECK': {
        const health = await spCheckConnection(creds)
        return NextResponse.json({
          simulated: false,
          result: okResult(
            'SELLERS_V1',
            health.status === 'HEALTHY'
              ? `Kết nối SP-API THẬT thành công. Marketplaces: ${health.marketplaces.join(', ')}`
              : `Kết nối lỗi: ${health.error}`,
            health.marketplaces.length,
            health.status === 'HEALTHY' ? undefined : { success: false, error: 'CONNECTION_FAILED' }
          ),
        })
      }

      case 'ORDERS': {
        const r = await syncOrdersToDatabase(creds)
        return NextResponse.json({
          simulated: false,
          dbWrite: { written: r.dbWritten, inserted: r.inserted, updated: r.updated, error: r.dbError },
          result: okResult(
            'ORDERS_V0',
            `Đã tải THẬT ${r.fetched} đơn hàng 7 ngày qua từ Amazon. Ghi DB: +${r.inserted} mới, ${r.updated} cập nhật.${r.dbError ? ' Cảnh báo: ' + r.dbError : ''}${r.fetched === 0 ? ' (Tài khoản chưa có đơn trong 7 ngày.)' : ''}`,
            r.fetched,
            r.dbError ? { warnings: [r.dbError] } : undefined
          ),
        })
      }

      case 'INVENTORY': {
        const r = await updateInventoryFromAmazon(creds)
        return NextResponse.json({
          simulated: false,
          dbWrite: { written: r.dbWritten, skusUpdated: r.skusUpdated, skusSkipped: r.skusSkipped, error: r.dbError },
          result: okResult(
            'FBA_INVENTORY_V1',
            `Tồn kho FBA THẬT: ${r.skuCount} SKU / ${r.totalQuantity} units. Đã cập nhật ${r.skusUpdated} SKU trong Supabase (bỏ qua ${r.skusSkipped} SKU chưa có trong hệ thống).`,
            r.skuCount,
            r.dbError ? { warnings: [r.dbError] } : undefined
          ),
        })
      }

      case 'AI_NIGHTLY_SCAN': {
        return NextResponse.json({
          simulated: false,
          result: okResult(
            'AI_NIGHTLY_SCAN',
            'Quét vận hành nội bộ (không gọi Amazon API). Chạy lại qua AI Operations tab.'
          ),
        })
      }

      default:
        return NextResponse.json({ error: `Module không hỗ trợ: ${mod}` }, { status: 400 })
    }
  } catch (err: any) {
    console.error('[Vexim SP-API Sync]', err)
    return NextResponse.json({
      simulated: false,
      result: failResult(
        'UNKNOWN',
        `Lỗi đồng bộ Amazon: ${err?.message || err}`,
        err?.code || 'SP_API_ERROR'
      ),
    })
  }
}
