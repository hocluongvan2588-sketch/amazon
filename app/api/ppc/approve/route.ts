import { NextRequest, NextResponse } from 'next/server'
import { getAdsConfig, pushNegativeKeywords } from '@/lib/ads-api-server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// ====================================================================
// VEXIM PPC APPROVAL API — POST /api/ppc/approve (Sprint 3.1)
// Human-in-the-loop: phê duyệt hàng loạt kiến nghị Negative Keyword.
// Body: { items: [{ searchTerm, campaignId?, matchType: NEGATIVE_EXACT | NEGATIVE_PHRASE }] }
// LIVE: đẩy Negative lên Amazon Ads thật + cập nhật status APPLIED trong DB.
// SIMULATED: trả simulated:true — KHÔNG đẩy Amazon, KHÔNG ghi DB.
// ====================================================================

interface ApproveItem {
  searchTerm: string
  campaignId?: string
  campaignName?: string
  matchType: 'NEGATIVE_EXACT' | 'NEGATIVE_PHRASE'
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { items?: ApproveItem[] }
    const items = (body.items || []).filter((i) => i.searchTerm && i.matchType)
    if (items.length === 0) {
      return NextResponse.json({ error: 'Không có kiến nghị nào được chọn' }, { status: 400 })
    }

    const cfg = getAdsConfig()
    if (!cfg) {
      return NextResponse.json({
        simulated: true,
        approved: 0,
        note: `CHẾ ĐỘ MÔ PHỎNG — đã ghi nhận duyệt ${items.length} từ khóa (không đẩy Amazon, không ghi DB). Thêm Ads credentials để áp dụng thật.`,
      })
    }

    // LIVE: đẩy Amazon trước
    const { success, failed } = await pushNegativeKeywords(
      cfg,
      items.map((i) => ({
        campaignId: i.campaignId || '',
        keywordText: i.searchTerm,
        matchType: i.matchType,
      }))
    )

    // Cập nhật DB status (best-effort, theo searchTerm + campaign)
    let dbUpdated = 0
    if (isSupabaseConfigured()) {
      const approvedTerms = items
        .filter((i) => !failed.some((f) => f.keywordText === i.searchTerm))
        .map((i) => i.searchTerm)
      if (approvedTerms.length > 0) {
        const { data } = await supabase
          .from('ppc_search_term_reports')
          .update({ status: 'APPLIED', updated_at: new Date().toISOString() })
          .in('search_term', approvedTerms)
          .select('id')
        dbUpdated = data?.length || 0
      }
    }

    return NextResponse.json({
      simulated: false,
      approved: success,
      failed,
      dbUpdated,
      note: `Đã đẩy ${success}/${items.length} Negative Keywords lên Amazon Ads.${dbUpdated ? ` Cập nhật ${dbUpdated} dòng trong DB.` : ''}`,
    })
  } catch (err: any) {
    console.error('[PpcApprove API]', err)
    return NextResponse.json({ error: err?.message || 'Lỗi phê duyệt' }, { status: 500 })
  }
}
