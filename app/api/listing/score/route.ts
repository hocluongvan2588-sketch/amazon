import { NextRequest, NextResponse } from 'next/server'
import { scoreListing, analyzeBackendSearchTerms, utf8ByteLength } from '@/lib/listing-quality'
import { analyzeKeywordGaps } from '@/lib/keyword-gap'
import { mockListings, mockProducts, mockCompetitorReverseAsins } from '@/lib/mock-data'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// ====================================================================
// VEXIM LISTING INTELLIGENCE API — POST /api/listing/score (Sprint 3.2)
// 1) Listing Quality Score 100 điểm (5 trục) — chấm từ NỘI DUNG THẬT
// 2) Backend byte analysis đúng hạn ngạch 249 UTF-8 bytes (fix bug .length)
// 3) Keyword Gap Analysis vs Top đối thủ ngách
// Body: { listingId? } hoặc { custom: { title, bulletPoints, description, backendSearchTerms } }
// Lưu lịch sử điểm vào listing_scores_history (best-effort, defensive).
// ====================================================================

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      listingId?: string
      custom?: {
        sku?: string
        asin?: string
        title: string
        bulletPoints: string[]
        description: string
        backendSearchTerms: string
        mainImage?: string
        galleryImages?: string[]
      }
    }

    // ---------- Chế độ custom (kiểm thử nội dung tuỳ ý, vd tiếng Việt) ----------
    if (body.custom) {
      const c = body.custom
      if (!c.title || !c.backendSearchTerms) {
        return NextResponse.json({ error: 'custom.title và custom.backendSearchTerms là bắt buộc' }, { status: 400 })
      }
      const result = scoreListing({
        listingId: 'custom',
        sku: c.sku || 'CUSTOM',
        asin: c.asin || 'CUSTOM',
        title: c.title,
        bulletPoints: c.bulletPoints || [],
        description: c.description || '',
        backendSearchTerms: c.backendSearchTerms,
        mainImage: c.mainImage,
        galleryImages: c.galleryImages,
      })
      return NextResponse.json({ dataSource: 'CUSTOM_INPUT', result, note: 'Chấm điểm nội dung tuỳ ý gửi lên.' })
    }

    // ---------- Lấy listing: mock (app chưa hydrate amazon_listings) ----------
    const listings = mockListings
    const target = body.listingId ? listings.find((l) => l.id === body.listingId) : listings[0]
    if (!target) {
      return NextResponse.json({ error: `Không tìm thấy listing ${body.listingId}` }, { status: 404 })
    }
    const product = mockProducts.find((p) => p.id === target.productId)

    const result = scoreListing({
      listingId: target.id,
      sku: target.sku,
      asin: target.asin,
      title: target.title,
      bulletPoints: target.bulletPoints,
      description: target.description,
      backendSearchTerms: target.backendSearchTerms,
      mainImage: product?.mainImage,
      galleryImages: product?.galleryImages,
      hasAplus: !!target.aplusContentHtml,
    })

    // ---------- Keyword Gap vs đối thủ ngách ----------
    const competitorInputs = mockCompetitorReverseAsins.map((c) => ({
      competitorAsin: c.competitorAsin,
      competitorBrand: c.competitorBrand,
      sharedTopKeywords: c.sharedTopKeywords.map((k) => ({
        keyword: k.keyword,
        competitorOrganicRank: k.competitorOrganicRank,
        ourOrganicRank: k.ourOrganicRank,
        searchVolume: k.searchVolume,
      })),
    }))
    const gap = analyzeKeywordGaps(
      competitorInputs,
      [target.title, ...target.bulletPoints, target.backendSearchTerms].join(' ')
    )

    // ---------- Lưu lịch sử (defensive — bảng có thể chưa migrate) ----------
    let historySaved = false
    let historyNote = ''
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('listing_scores_history').insert({
          sku: target.sku,
          asin: target.asin,
          overall_score: result.overall,
          title_score: result.axes.title.score,
          bullet_score: result.axes.bullets.score,
          description_score: result.axes.description.score,
          image_score: result.axes.images.score,
          backend_score: result.axes.backend.score,
          backend_bytes_used: result.backendByteAnalysis.bytesUsed,
          backend_utilization_pct: result.backendByteAnalysis.utilizationPct,
          grade: result.grade,
          compliance_risk: result.complianceRisk,
          issues: result.issues,
        })
        if (!error) historySaved = true
        else if ((error.message || '').includes('does not exist')) {
          historyNote = 'Bảng listing_scores_history chưa có — chạy migration 20260913_listing_intelligence.sql để lưu lịch sử.'
        } else historyNote = error.message
      } catch (e: any) {
        historyNote = String(e?.message || e)
      }
    }

    return NextResponse.json({
      dataSource: 'SIMULATED_MOCK',
      result,
      keywordGap: gap,
      historySaved,
      ...(historyNote ? { historyNote } : {}),
      note: 'Điểm chấm từ nội dung listing demo (mock). Khi amazon_listings có dữ liệu thật, engine chấm thẳng trên đó.',
    })
  } catch (err: any) {
    console.error('[ListingScore API]', err)
    return NextResponse.json({ error: err?.message || 'Lỗi chấm điểm' }, { status: 500 })
  }
}

// GET nhanh: đếm bytes 1 chuỗi bất kỳ (tiện kiểm tra bug fix)
export async function GET(req: NextRequest) {
  const text = new URL(req.url).searchParams.get('text') || ''
  return NextResponse.json({
    characters: text.length,
    utf8Bytes: utf8ByteLength(text),
    within249Bytes: utf8ByteLength(text) <= 249,
    truncatedTo249: analyzeBackendSearchTerms(text, '').optimizedSuggestion.slice(0, 0) || undefined,
  })
}
