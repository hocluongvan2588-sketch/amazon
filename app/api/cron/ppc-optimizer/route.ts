import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { runPpcOptimize } from '@/lib/ppc-optimize-runner'

// ====================================================================
// VEXIM PPC OPTIMIZER WORKER — GET/POST /api/cron/ppc-optimizer (Sprint 3.1)
// Cron job định kỳ chạy cả 3 thuật toán. Cấu hình lịch (vercel.json mục 3.4):
//   - Khuyến nghị: mỗi giờ trong giờ quảng cáo, hoặc daily.
// AUTH: header x-cron-secret (hoặc Bearer) phải khớp env CRON_SECRET.
//   - CRON_SECRET chưa đặt + NODE_ENV=production -> TỪ CHỐI (secure default).
//   - Dev không secret -> cho phép (có cảnh báo).
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

async function runFullCycle(triggerSource: 'CRON') {
  const modules = ['BID_ADJUSTMENT', 'NEGATIVE_KEYWORDS', 'PLACEMENT'] as const
  const results = []
  for (const module of modules) {
    const outcome = await runPpcOptimize({ module, windowDays: 7, autoApply: false, triggerSource })
    results.push({
      module,
      mode: outcome.mode,
      analyzed: outcome.stats.analyzed,
      proposed: outcome.stats.proposed,
      estimatedImpactUsd: outcome.stats.estimatedImpactUsd,
      warnings: outcome.warnings,
    })
  }
  return results
}

export async function GET(req: NextRequest) {
  if (!assertCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized: thiếu/sai CRON_SECRET (header x-cron-secret)' }, { status: 401 })
  }
  const started = Date.now()
  const results = await runFullCycle('CRON')
  return NextResponse.json({
    success: true,
    durationMs: Date.now() - started,
    ranAt: new Date().toISOString(),
    results,
  })
}

export async function POST(req: NextRequest) {
  return GET(req)
}
