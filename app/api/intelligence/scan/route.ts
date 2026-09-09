import { NextResponse } from 'next/server'
import { runIntelligenceScan } from '@/lib/intelligence-scan'

// ====================================================================
// VEXIM INTELLIGENCE FULL SCAN API — POST/GET /api/intelligence/scan
// Sprint 3.4: scan thật cả 5 engine (PPC bid/negative/placement + Forecast
// 50/30/20 + Listing Quality/Gap). Không setTimeout giả — thời gian chạy là
// thời gian engine tính thật.
// ====================================================================

export async function POST() {
  try {
    const result = await runIntelligenceScan('MANUAL_UI')
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[IntelligenceScan API]', err)
    return NextResponse.json({ error: err?.message || 'Lỗi scan' }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
