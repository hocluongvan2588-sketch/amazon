import { NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured, SUPABASE_URL } from '@/lib/supabase'

// ====================================================================
// VEXIM SYSTEM HEALTH CHECK — GET /api/system/health
// Thẩm định 1 cái nhìn: hệ thống đang chạy DATABASE THẬT hay FALLBACK?
// - supabase: kết nối + RLS fix đã áp dụng chưa (users hết lỗi 42P17?)
// - tables:   số dòng mỗi bảng nghiệp vụ (0 = chưa seed, null = lỗi)
// - integrations: AI Gateway key & webhook secret đã cấu hình chưa
// Mọi query đều có timeout 5s + chạy song song -> endpoint luôn trả lời nhanh,
// kể cả khi mạng tới Supabase bị chặn/treo.
// ====================================================================

const BIZ_TABLES = [
  'clients',
  'users',
  'products',
  'inventory',
  'freight_rate_cards',
  'inbound_shipments',
  'forwarder_tracking_events',
] as const

const QUERY_TIMEOUT_MS = 5000

export async function GET() {
  const result: Record<string, any> = {
    checkedAt: new Date().toISOString(),
    mode: 'UNKNOWN', // DATABASE_LIVE | DEGRADED | FALLBACK_MOCK
    supabase: {
      configured: isSupabaseConfigured(),
      projectRef: SUPABASE_URL.replace(/^https:\/\//, '').split('.')[0] || null,
      reachable: false,
      rlsFixed: null as boolean | null,
    },
    tables: {} as Record<string, number | null>,
    integrations: {
      aiGatewayKey: !!process.env.AI_GATEWAY_API_KEY,
      logisticsWebhookSecret: !!process.env.LOGISTICS_WEBHOOK_SECRET,
    },
  }

  if (!isSupabaseConfigured()) {
    result.mode = 'FALLBACK_MOCK'
    return NextResponse.json(result)
  }

  // Đếm dòng song song, mỗi bảng có timeout riêng
  const countTable = async (t: string): Promise<number | null> => {
    try {
      const { count, error } = await supabase
        .from(t)
        .select('*', { count: 'exact', head: true })
        .abortSignal(AbortSignal.timeout(QUERY_TIMEOUT_MS))
      if (error) {
        // 42P17 = RLS recursion chưa fix
        if (t === 'users') result.supabase.rlsFixed = false
        return null
      }
      if (t === 'users') result.supabase.rlsFixed = true
      return count ?? 0
    } catch {
      if (t === 'users') result.supabase.rlsFixed = null
      return null
    }
  }

  const entries = await Promise.all(
    BIZ_TABLES.map(async (t) => [t, await countTable(t)] as const)
  )
  result.tables = Object.fromEntries(entries)

  result.supabase.reachable =
    result.supabase.rlsFixed !== null || Object.values(result.tables).some((v) => v !== null)

  // Kết luận chế độ vận hành
  const seeded =
    (result.tables['inventory'] ?? 0) > 0 && (result.tables['freight_rate_cards'] ?? 0) > 0
  if (result.supabase.reachable && result.supabase.rlsFixed && seeded) {
    result.mode = 'DATABASE_LIVE'
  } else if (result.supabase.reachable && result.supabase.rlsFixed) {
    result.mode = 'DEGRADED' // DB kết nối được nhưng chưa có dữ liệu -> app dùng mock nền
  } else {
    result.mode = 'FALLBACK_MOCK'
  }

  return NextResponse.json(result)
}
