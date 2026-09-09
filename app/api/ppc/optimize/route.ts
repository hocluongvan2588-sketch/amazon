import { NextRequest, NextResponse } from 'next/server'
import { runPpcOptimize, type PpcModule } from '@/lib/ppc-optimize-runner'

// ====================================================================
// VEXIM PPC OPTIMIZATION API — POST /api/ppc/optimize (Sprint 3.1)
// Body: { module: BID_ADJUSTMENT | NEGATIVE_KEYWORDS | PLACEMENT,
//         windowDays?: 7 | 14, autoApply?: boolean (mặc định false) }
// SIMULATED: engine chạy trên dữ liệu demo, KHÔNG ghi DB/Amazon (có cờ).
// LIVE: pull Ads API -> engine -> ghi ppc_* + algorithm_runs;
//       autoApply=true mới đẩy bid/negative lên Amazon thật (opt-in).
// ====================================================================

const VALID_MODULES: PpcModule[] = ['BID_ADJUSTMENT', 'NEGATIVE_KEYWORDS', 'PLACEMENT']

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      module?: string
      windowDays?: number
      autoApply?: boolean
    }
    const module = (body.module || 'BID_ADJUSTMENT') as PpcModule
    if (!VALID_MODULES.includes(module)) {
      return NextResponse.json({ error: `module không hỗ trợ. Dùng: ${VALID_MODULES.join(', ')}` }, { status: 400 })
    }

    const outcome = await runPpcOptimize({
      module,
      windowDays: body.windowDays === 14 ? 14 : 7,
      autoApply: !!body.autoApply,
      triggerSource: 'MANUAL_UI',
    })

    return NextResponse.json(outcome)
  } catch (err: any) {
    console.error('[PpcOptimize API]', err)
    return NextResponse.json({ error: err?.message || 'Lỗi không xác định' }, { status: 500 })
  }
}
