'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, FileSearch, Loader2, RefreshCw, Search, ShieldAlert, Trophy } from 'lucide-react'
import { useAppState } from '@/lib/state-context'

// ====================================================================
// LISTING INTELLIGENCE PANEL (Sprint 3.2)
// 1) "Chấm điểm SEO Listing": Quality Score 100 điểm theo 5 trục
//    (Title 30 / Bullets 25 / Description 15 / Images 10 / Backend 20)
// 2) Backend byte analysis đúng UTF-8 249 bytes (fix bug .length)
// 3) Keyword Gap vs Top đối thủ (HIGH_PRIORITY / OPPORTUNITY / DEFENDED)
// ====================================================================

interface ScoreIssue {
  axis: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  message: string
  fix?: string
}
interface ScoreResult {
  listingId: string
  sku: string
  asin: string
  overall: number
  grade: string
  complianceRisk: string
  axes: Record<'title' | 'bullets' | 'description' | 'images' | 'backend', { score: number; max: number }>
  backendByteAnalysis: {
    bytesUsed: number
    byteLimit: number
    utilizationPct: number
    overLimit: boolean
    wastedBytes: number
    wasteBreakdown: Record<string, number>
    optimizedSuggestion: string
    suggestionBytes: number
  }
  strengths: string[]
  issues: ScoreIssue[]
}
interface GapItem {
  keyword: string
  bestCompetitorBrand: string
  bestCompetitorRank: number
  ourRank: number
  searchVolume: number
  gapScore: number
  status: string
  recommendedAction: string
  reason: string
}
interface GapResult {
  gaps: GapItem[]
  contextualSuggestions: { phrase: string; baseKeyword: string; suggestedPlacement: string; rationale: string }[]
  summary: { keywordsCompared: number; highPriority: number; opportunities: number; defended: number; ourCoveragePct: number }
}

const AXIS_LABEL: Record<string, string> = {
  title: 'Title (30đ)',
  bullets: 'Bullets (25đ)',
  description: 'Description (15đ)',
  images: 'Images (10đ)',
  backend: 'Backend Terms (20đ)',
}
const SEV_COLOR: Record<string, string> = { HIGH: 'text-red-600', MEDIUM: 'text-amber-600', LOW: 'text-slate-500' }
const STATUS_COLOR: Record<string, string> = {
  HIGH_PRIORITY_GAP: 'bg-red-100 text-red-700',
  OPPORTUNITY: 'bg-amber-100 text-amber-700',
  DEFENDED: 'bg-emerald-100 text-emerald-700',
  LOW_POTENTIAL: 'bg-slate-100 text-slate-500',
}

export function ListingIntelligencePanel() {
  const { listings, showToast } = useAppState()
  const [selectedId, setSelectedId] = useState<string>(listings[0]?.id || '')
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [gap, setGap] = useState<GapResult | null>(null)
  const [meta, setMeta] = useState<{ dataSource?: string; note?: string; historySaved?: boolean; historyNote?: string } | null>(null)

  const run = useCallback(
    async (listingId: string) => {
      if (!listingId) return
      setLoading(true)
      try {
        const res = await fetch('/api/listing/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId }),
        })
        const data = await res.json()
        if (data.error) {
          showToast(`Lỗi chấm điểm: ${data.error}`, 'error')
          return
        }
        setScore(data.result)
        setGap(data.keywordGap)
        setMeta(data)
        showToast(
          `Chấm điểm xong: ${data.result.sku} đạt ${data.result.overall}/100 (${data.result.grade}) — ${(data.keywordGap?.summary?.highPriority || 0)} gap ưu tiên.`,
          'success'
        )
      } catch (e: any) {
        showToast(`Lỗi: ${e?.message || e}`, 'error')
      } finally {
        setLoading(false)
      }
    },
    [showToast]
  )

  useEffect(() => {
    if (listings.length > 0 && !selectedId) setSelectedId(listings[0].id)
  }, [listings, selectedId])

  return (
    <div className="rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50/60 to-white p-5 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white">
            <FileSearch size={15} />
          </span>
          <div>
            <h2 className="text-sm font-black text-slate-900">Listing Quality Score &amp; Keyword Gap (Giai đoạn 3)</h2>
            <p className="text-[11px] text-slate-500">
              Chấm 100 điểm từ nội dung thật (5 trục) • Backend đếm đúng <strong>UTF-8 249 bytes</strong> • Gap analysis vs Top đối thủ
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-[11px] font-semibold text-slate-700 focus:border-violet-500 focus:outline-none"
          >
            {listings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.sku} — {l.title.slice(0, 40)}...
              </option>
            ))}
          </select>
          <button
            onClick={() => run(selectedId)}
            disabled={loading || !selectedId}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-2 text-[11px] font-bold text-white shadow-xs hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
            Chấm điểm SEO Listing
          </button>
        </div>
      </div>

      {score && (
        <div className="mt-4 space-y-4">
          {/* Tổng quan */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            <div className="rounded-xl bg-violet-600 p-3 text-white">
              <p className="text-[9.5px] font-bold uppercase tracking-wider opacity-80">Tổng điểm</p>
              <p className="text-xl font-black">{score.overall}/100</p>
              <p className="text-[10px] font-bold">Grade {score.grade}</p>
            </div>
            {Object.entries(score.axes).map(([axis, v]) => (
              <div key={axis} className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500">{AXIS_LABEL[axis]}</p>
                <p className={`text-xl font-black ${v.score >= v.max * 0.85 ? 'text-emerald-600' : v.score >= v.max * 0.6 ? 'text-amber-600' : 'text-red-600'}`}>
                  {v.score}
                  <span className="text-[10px] text-slate-400">/{v.max}</span>
                </p>
              </div>
            ))}
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500">Rủi ro chính sách</p>
              <p className={`flex items-center gap-1 text-lg font-black ${score.complianceRisk === 'HIGH' ? 'text-red-600' : score.complianceRisk === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {score.complianceRisk === 'LOW' ? <CheckCircle2 size={14} /> : <ShieldAlert size={14} />}
                {score.complianceRisk}
              </p>
            </div>
          </div>

          {/* Backend bytes analysis */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black text-slate-800">
                Backend Search Terms — đếm chuẩn UTF-8: {score.backendByteAnalysis.bytesUsed}/{score.backendByteAnalysis.byteLimit} bytes
                <span className="ml-2 text-[10px] font-semibold text-slate-500">
                  ({score.backendByteAnalysis.utilizationPct}% • lãng phí {score.backendByteAnalysis.wastedBytes} bytes)
                </span>
              </p>
              {score.backendByteAnalysis.overLimit ? (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9.5px] font-black text-red-700">VƯỢT NGẠCH</span>
              ) : (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9.5px] font-black text-emerald-700">TRONG HẠN NGẠCH</span>
              )}
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${score.backendByteAnalysis.overLimit ? 'bg-red-500' : score.backendByteAnalysis.utilizationPct >= 70 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                style={{ width: `${Math.min(100, score.backendByteAnalysis.utilizationPct)}%` }}
              />
            </div>
            <p className="mt-2 text-[9.5px] text-slate-400">
              Lãng phí: {Object.entries(score.backendByteAnalysis.wasteBreakdown).map(([k, v]) => `${k} ${v}B`).join(' • ')} —
              lưu ý ký tự Unicode/tiếng Việt chiếm 2–3 bytes (bug đếm .length đã sửa).
            </p>
            {score.backendByteAnalysis.optimizedSuggestion && (
              <div className="mt-2 rounded-lg bg-slate-50 p-2">
                <p className="text-[9.5px] font-black uppercase tracking-wider text-slate-500">
                  Chuỗi tối ưu gợi ý ({score.backendByteAnalysis.suggestionBytes} bytes):
                </p>
                <p className="mt-1 font-mono text-[10px] leading-relaxed text-slate-700">{score.backendByteAnalysis.optimizedSuggestion}</p>
              </div>
            )}
          </div>

          {/* Issues */}
          {score.issues.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] font-black text-slate-800">Việc cần sửa ({score.issues.length}) — sắp theo mức nghiêm trọng</p>
              <ul className="mt-2 space-y-1.5">
                {score.issues.map((i, idx) => (
                  <li key={idx} className="text-[10.5px] leading-relaxed">
                    <span className={`font-black ${SEV_COLOR[i.severity]}`}>[{i.severity}/{i.axis}]</span>{' '}
                    <span className="text-slate-700">{i.message}</span>
                    {i.fix && <span className="text-slate-400"> → {i.fix}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {score.strengths.length > 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
              {score.strengths.map((s, idx) => (
                <p key={idx} className="flex items-start gap-1.5 text-[10.5px] font-semibold text-emerald-700">
                  <Trophy size={11} className="mt-0.5 shrink-0" /> {s}
                </p>
              ))}
            </div>
          )}

          {/* Keyword Gap */}
          {gap && (
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black text-slate-800">
                  Keyword Gap vs Top đối thủ — {gap.summary.keywordsCompared} từ khóa so sánh
                </p>
                <p className="text-[10px] font-semibold text-slate-500">
                  🔴 {gap.summary.highPriority} ưu tiên • 🟡 {gap.summary.opportunities} cơ hội • 🟢 {gap.summary.defended} giữ được • coverage rank {gap.summary.ourCoveragePct}%
                </p>
              </div>
              <div className="mt-2 max-h-[280px] overflow-y-auto rounded-lg border border-slate-100">
                <table className="w-full min-w-[640px] text-left text-[10.5px]">
                  <thead className="sticky top-0 bg-slate-50 text-[9px] font-black uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-2.5 py-1.5">Từ khóa</th>
                      <th className="px-2.5 py-1.5">Đối thủ tốt nhất</th>
                      <th className="px-2.5 py-1.5">Mình</th>
                      <th className="px-2.5 py-1.5">Volume</th>
                      <th className="px-2.5 py-1.5">Gap score</th>
                      <th className="px-2.5 py-1.5">Trạng thái → Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {gap.gaps.slice(0, 12).map((g) => (
                      <tr key={g.keyword} className="hover:bg-slate-50/60">
                        <td className="px-2.5 py-1.5 font-bold text-slate-800">{g.keyword}</td>
                        <td className="px-2.5 py-1.5 font-mono text-slate-600">
                          #{g.bestCompetitorRank} <span className="text-[9px] text-slate-400">{g.bestCompetitorBrand}</span>
                        </td>
                        <td className="px-2.5 py-1.5 font-mono">
                          {g.ourRank === 0 ? <span className="font-bold text-red-500">Chưa rank</span> : `#${g.ourRank}`}
                        </td>
                        <td className="px-2.5 py-1.5 font-mono text-slate-600">{g.searchVolume.toLocaleString()}</td>
                        <td className="px-2.5 py-1.5 font-mono font-black text-violet-700">{g.gapScore.toLocaleString()}</td>
                        <td className="px-2.5 py-1.5">
                          <span className={`rounded-full px-2 py-0.5 text-[8.5px] font-black ${STATUS_COLOR[g.status]}`}>{g.status}</span>
                          <span className="ml-1 text-[9px] font-bold text-slate-600">→ {g.recommendedAction}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {gap.contextualSuggestions.length > 0 && (
                <div className="mt-2.5">
                  <p className="text-[9.5px] font-black uppercase tracking-wider text-slate-500">Gợi ý cụm ngữ cảnh (Cosmos/semantic):</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {gap.contextualSuggestions.map((s, i) => (
                      <span key={i} title={s.rationale} className="cursor-help rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[9.5px] font-bold text-violet-700">
                        {s.phrase} → {s.suggestedPlacement}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {meta?.note && <p className="text-[9.5px] text-slate-400">{meta.note}{meta.historyNote ? ` • ${meta.historyNote}` : ''}</p>}
        </div>
      )}

      {!score && !loading && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-slate-300 p-4 text-[10.5px] text-slate-400">
          <AlertTriangle size={12} /> Chọn listing rồi bấm "Chấm điểm SEO Listing" — engine phân tích nội dung thật, không dùng điểm hardcode.
        </div>
      )}
    </div>
  )
}
