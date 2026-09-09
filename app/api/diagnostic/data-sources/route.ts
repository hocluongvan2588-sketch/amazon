// ====================================================================
// API ROUTE — CHẨN ĐOÁN NGUỒN DỮ LIỆU (SPRINT 4.1)
// GET /api/diagnostic/data-sources
// Trả về: bảng nào TỒN TẠI trong Supabase, bao nhiêu dòng, bucket Storage
// nào hoạt động, SP-API đã cấu hình chưa. Dùng để trả lời chính xác câu
// "dữ liệu mới đã deploy chưa" — không đoán.
// Không lộ giá trị secret (chỉ boolean).
// ====================================================================

import { NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export const runtime = 'nodejs'

const TABLES_TO_CHECK = [
  'products',
  'amazon_listings',
  'listing_images',
  'customer_inquiries',
  'product_documents',
]

const BUCKETS_TO_CHECK = ['product-images', 'compliance-docs']

export async function GET() {
  const out: Record<string, unknown> = {
    checkedAt: new Date().toISOString(),
    supabaseConfigured: isSupabaseConfigured(),
    supabaseUrl: (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace('https://', '').split('.')[0] + '***',
    tables: {} as Record<string, string | number>,
    buckets: {} as Record<string, string>,
    spApi: {
      listingPushLive: Boolean(
        process.env.AMAZON_SP_API_CLIENT_ID &&
          process.env.AMAZON_SP_API_REFRESH_TOKEN &&
          process.env.AMAZON_SP_API_AWS_ACCESS_KEY_ID
      ),
    },
  }

  if (!out.supabaseConfigured) {
    return NextResponse.json({ ...out, error: 'Supabase chưa cấu hình env' }, { status: 200 })
  }

  // ---------- 1. Bảng: tồn tại & số dòng ----------
  for (const t of TABLES_TO_CHECK) {
    const { count, error } = await supabase
      .from(t)
      .select('*', { count: 'exact', head: true })
    ;(out.tables as Record<string, unknown>)[t] = error
      ? `KHÔNG TỒN TẠI hoặc LỖI RLS: ${error.message.slice(0, 120)}`
      : `OK — ${count ?? 0} dòng`
  }

  // ---------- 2. Bucket Storage: list thử (cần policy read) ----------
  for (const b of BUCKETS_TO_CHECK) {
    const { error } = await supabase.storage.from(b).list('', { limit: 1 })
    ;(out.buckets as Record<string, string>)[b] = error
      ? `LỖI: ${error.message.slice(0, 120)} (bucket chưa tạo bởi migration 20260914 hoặc thiếu policy)`
      : 'OK — bucket đọc được'
  }

  return NextResponse.json(out)
}
