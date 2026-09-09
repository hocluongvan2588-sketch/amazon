import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { runIntelligenceScan } from '@/lib/intelligence-scan'

// ====================================================================
// VEXIM INTELLIGENCE DAILY WORKER — GET/POST /api/cron/intelligence-scan
// Sprint 3.4: cron hằng ngày (vercel.json / GitHub Actions) — chạy full scan
// (PPC + Forecast + Listing) và ghi audit trail.
// AUTH: CRON_SECRET bắt buộc khớp ở production (Vercel Cron tự gửi
// `Authorization: Bearer $CRON_SECRET`); dev không secret -> cho phép.
// ====================================================================

function assertCronAuth(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  const provided =
    req.headers.get('x-cron-secret') ||
    (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!provided) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(secret)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export async function GET(req: NextRequest) {
  if (!assertCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized: thiếu/sai CRON_SECRET' }, { status: 401 })
  }
  const started = Date.now()
  const scan = await runIntelligenceScan('CRON')
  return NextResponse.json({
    success: true,
    durationMs: Date.now() - started,
    mode: scan.mode,
    dataSource: scan.dataSource,
    totals: scan.totals,
    ppc: scan.ppc,
    inventory: scan.inventory,
    listings: scan.listings,
    runLogged: scan.runLogged,
    warnings: scan.warnings,
    ranAt: scan.runAt,
  })
}

export async function POST(req: NextRequest) {
  return GET(req)
}
