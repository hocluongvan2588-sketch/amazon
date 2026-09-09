'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  AlertTriangle,
  Ban,
  Bot,
  CheckCircle2,
  Loader2,
  MapPin,
  Play,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

// ====================================================================
// PPC INTELLIGENCE PANEL (Sprint 3.1) — 3 nút tính năng theo Deliverable:
//  1) "Bật tự động tối ưu Bid" (toggle; ON = autoApply khi LIVE; mặc định OFF
//     = chỉ đề xuất chờ duyệt — Safety Guardrail chống đốt tiền nhà xưởng)
//  2) "Báo cáo kiến nghị phủ định từ khóa" (chọn nhiều -> phê duyệt hàng loạt)
//  3) Placement Optimization (Top of Search vs Product Pages)
// Kết quả phân tích luôn gắn nhãn LIVE/SIMULATED minh bạch.
// ====================================================================

interface BidProposal {
  keywordId: string
  keywordText: string
  matchType: string
  campaignName: string
  currentBid: number
  recommendedBid: number
  changePct: number
  action: 'INCREASE' | 'DECREASE' | 'HOLD' | 'NO_DATA'
  acosPct: number | null
  cvrPct: number
  clicks: number
  reason: string
}
interface NegativeProposal {
  searchTerm: string
  campaignName: string
  clicks: number
  spend: number
  orders: number
  acosPct: number | null
  negativeType: 'NEGATIVE_EXACT' | 'NEGATIVE_PHRASE'
  estimatedSavingsUsd: number
  reason: string
}
interface PlacementProposal {
  campaignName: string
  placement: string
  currentBoostPct: number
  suggestedBoostPct: number
  action: 'BOOST_UP' | 'BOOST_DOWN' | 'HOLD'
  reason: string
}

const ACTION_BADGE: Record<string, string> = {
  INCREASE: 'bg-emerald-100 text-emerald-700',
  BOOST_UP: 'bg-emerald-100 text-emerald-700',
  DECREASE: 'bg-red-100 text-red-700',
  BOOST_DOWN: 'bg-red-100 text-red-700',
  HOLD: 'bg-slate-100 text-slate-600',
  NO_DATA: 'bg-slate-100 text-slate-500',
}

export function PpcIntelligencePanel() {
  const [autoBid, setAutoBid] = useState(false)
  const [running, setRunning] = useState<string | null>(null)
  const [mode, setMode] = useState<'LIVE' | 'SIMULATED' | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [bids, setBids] = useState<BidProposal[]>([])
  const [negatives, setNegatives] = useState<NegativeProposal[]>([])
  const [placements, setPlacements] = useState<PlacementProposal[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [approving, setApproving] = useState(false)
  const [approvalNote, setApprovalNote] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('vexim_ppc_auto_bid')
    if (saved === '1') setAutoBid(true)
  }, [])

  const toggleAutoBid = () => {
    const next = !autoBid
    setAutoBid(next)
    localStorage.setItem('vexim_ppc_auto_bid', next ? '1' : '0')
  }

  const runModule = useCallback(
    async (module: 'BID_ADJUSTMENT' | 'NEGATIVE_KEYWORDS' | 'PLACEMENT') => {
      setRunning(module)
      setWarnings([])
      setApprovalNote(null)
      try {
        const res = await fetch('/api/ppc/optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ module, windowDays: 7, autoApply: autoBid }),
        })
        const data = await res.json()
        setMode(data.mode || null)
        setWarnings(data.warnings || [])
        if (module === 'BID_ADJUSTMENT') setBids(data.proposals || [])
        if (module === 'NEGATIVE_KEYWORDS') {
          setNegatives(data.proposals || [])
          setSelected(new Set())
        }
        if (module === 'PLACEMENT') setPlacements(data.proposals || [])
      } catch (e: any) {
        setWarnings([`Lỗi gọi engine: ${e?.message || e}`])
      } finally {
        setRunning(null)
      }
    },
    [autoBid]
  )

  const approveNegatives = async () => {
    if (selected.size === 0) return
    setApproving(true)
    setApprovalNote(null)
    try {
      const items = negatives
        .filter((n) => selected.has(n.searchTerm))
        .map((n) => ({ searchTerm: n.searchTerm, campaignName: n.campaignName, matchType: n.negativeType }))
      const res = await fetch('/api/ppc/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const data = await res.json()
      setApprovalNote(data.note || data.error || 'Xong')
      if (!data.simulated) {
        setNegatives((prev) => prev.filter((n) => !selected.has(n.searchTerm)))
        setSelected(new Set())
      }
    } catch (e: any) {
      setApprovalNote(`Lỗi: ${e?.message || e}`)
    } finally {
      setApproving(false)
    }
  }

  const toggleSelect = (term: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(term)) next.delete(term)
      else next.add(term)
      return next
    })
  }

  const Btn = ({
    id,
    icon,
    label,
    onClick,
  }: {
    id: string
    icon: React.ReactNode
    label: string
    onClick: () => void
  }) => (
    <button
      onClick={onClick}
      disabled={running !== null}
      className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50"
    >
      {running === id ? <Loader2 size={12} className="animate-spin" /> : icon}
      {label}
    </button>
  )

  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white p-5 shadow-xs">
      {/* Header + Auto toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Bot size={15} />
            </span>
            <div>
              <h2 className="text-sm font-black text-slate-900">PPC Intelligence Engine (Giai đoạn 3)</h2>
              <p className="text-[11px] text-slate-500">
                Target-ACOS Dynamic Bid • Auto Negative Keywords • Placement Boost — mặc định CHỈ ĐỀ XUẤT chờ duyệt.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={toggleAutoBid}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[11px] font-bold shadow-xs transition-all ${
            autoBid ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {autoBid ? <ShieldCheck size={14} /> : <Bot size={14} />}
          {autoBid ? 'Đang TỰ ĐỘNG áp bid' : 'Bật tự động tối ưu Bid'}
          <span className={`h-2 w-2 rounded-full ${autoBid ? 'animate-pulse bg-emerald-200' : 'bg-slate-300'}`} />
        </button>
      </div>

      {autoBid && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-[10.5px] leading-relaxed text-amber-700">
            <strong>Auto-apply đang bật:</strong> khi hệ thống LIVE (có Ads credentials), bid sẽ được đẩy thẳng lên Amazon với
            guardrail ±20%/lần, bid floor $0.25. Trong chế độ SIMULATED vẫn chỉ là đề xuất có nhãn.
          </p>
        </div>
      )}

      {/* 3 nút chạy thuật toán */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Btn id="BID_ADJUSTMENT" icon={<TrendingUp size={12} />} label="Chạy phân tích Bid (Target ACOS)" onClick={() => runModule('BID_ADJUSTMENT')} />
        <Btn id="NEGATIVE_KEYWORDS" icon={<Ban size={12} />} label="Báo cáo kiến nghị phủ định từ khóa" onClick={() => runModule('NEGATIVE_KEYWORDS')} />
        <Btn id="PLACEMENT" icon={<MapPin size={12} />} label="Tối ưu Placement (ToS vs Product Pages)" onClick={() => runModule('PLACEMENT')} />
        {mode && (
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
              mode === 'LIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {mode === 'LIVE' ? 'LIVE — DỮ LIỆU AMAZON THẬT' : 'SIMULATED — DỮ LIỆU DEMO'}
          </span>
        )}
      </div>

      {warnings.length > 0 && (
        <div className="mt-3 rounded-xl bg-slate-100 p-3">
          {warnings.map((w, i) => (
            <p key={i} className="text-[10.5px] font-medium text-slate-600">
              • {w}
            </p>
          ))}
        </div>
      )}

      {/* BID RESULTS */}
      {bids.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[720px] text-left text-[10.5px]">
            <thead className="bg-slate-50 text-[9.5px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2">Từ khóa</th>
                <th className="px-3 py-2">Bid hiện tại → đề xuất</th>
                <th className="px-3 py-2">ACOS / CVR</th>
                <th className="px-3 py-2">Hành động</th>
                <th className="px-3 py-2">Lý do (engine)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bids.map((b) => (
                <tr key={b.keywordId} className="hover:bg-slate-50/60">
                  <td className="px-3 py-2">
                    <p className="font-bold text-slate-800">{b.keywordText}</p>
                    <p className="text-[9.5px] text-slate-400">
                      {b.matchType} • {b.campaignName} • {b.clicks} clicks
                    </p>
                  </td>
                  <td className="px-3 py-2 font-mono font-bold">
                    ${b.currentBid.toFixed(2)} → <span className="text-indigo-700">${b.recommendedBid.toFixed(2)}</span>
                    {b.changePct !== 0 && (
                      <span className={`ml-1 ${b.changePct > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        ({b.changePct > 0 ? '+' : ''}
                        {b.changePct}%)
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-600">
                    {b.acosPct === null ? '∞' : `${b.acosPct}%`} / {b.cvrPct}%
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-black ${ACTION_BADGE[b.action]}`}>{b.action}</span>
                  </td>
                  <td className="max-w-[260px] px-3 py-2 text-[9.5px] leading-relaxed text-slate-500">{b.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* NEGATIVE RESULTS */}
      {negatives.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-700">
              Chọn {selected.size}/{negatives.length} từ khóa đốt tiền (tiết kiệm ước tính $
              {negatives
                .filter((n) => selected.has(n.searchTerm))
                .reduce((s, n) => s + n.estimatedSavingsUsd, 0)
                .toFixed(2)}
              /window)
            </p>
            <button
              onClick={approveNegatives}
              disabled={approving || selected.size === 0}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-[10.5px] font-bold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {approving ? <Loader2 size={11} className="animate-spin" /> : <Ban size={11} />}
              Phê duyệt phủ định ({selected.size})
            </button>
          </div>
          {approvalNote && <p className="mb-2 rounded-lg bg-indigo-50 p-2 text-[10.5px] font-semibold text-indigo-700">{approvalNote}</p>}
          <div className="max-h-[320px] overflow-y-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[640px] text-left text-[10.5px]">
              <thead className="sticky top-0 bg-slate-50 text-[9.5px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2">Chọn</th>
                  <th className="px-3 py-2">Search Term</th>
                  <th className="px-3 py-2">Clicks / Đơn</th>
                  <th className="px-3 py-2">Đốt $</th>
                  <th className="px-3 py-2">Loại phủ định</th>
                  <th className="px-3 py-2">Lý do</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {negatives.map((n) => (
                  <tr key={n.searchTerm} className="hover:bg-slate-50/60">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(n.searchTerm)}
                        onChange={() => toggleSelect(n.searchTerm)}
                        className="h-3.5 w-3.5 accent-red-600"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-bold text-slate-800">{n.searchTerm}</p>
                      <p className="text-[9.5px] text-slate-400">{n.campaignName}</p>
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-600">
                      {n.clicks} / <span className="font-bold text-red-600">{n.orders}</span>
                    </td>
                    <td className="px-3 py-2 font-mono font-bold text-red-600">${n.spend.toFixed(2)}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-black text-red-700">{n.negativeType}</span>
                    </td>
                    <td className="max-w-[240px] px-3 py-2 text-[9.5px] text-slate-500">{n.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PLACEMENT RESULTS */}
      {placements.length > 0 && (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {placements.map((p, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">{p.placement.replace(/_/g, ' ')}</p>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${ACTION_BADGE[p.action]}`}>
                  {p.action === 'BOOST_UP' ? `+${p.suggestedBoostPct - p.currentBoostPct}%` : p.action === 'BOOST_DOWN' ? 'về 0%' : 'GIỮ'}
                </span>
              </div>
              <p className="mt-1 line-clamp-1 text-[10.5px] font-bold text-slate-800">{p.campaignName}</p>
              <p className="mt-1 font-mono text-[10.5px] text-slate-600">
                Boost: {p.currentBoostPct}% → <span className="font-bold text-indigo-700">{p.suggestedBoostPct}%</span>
              </p>
              <p className="mt-1.5 line-clamp-3 text-[9.5px] leading-relaxed text-slate-500">{p.reason}</p>
            </div>
          ))}
        </div>
      )}

      {bids.length === 0 && negatives.length === 0 && placements.length === 0 && running === null && mode === null && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-slate-300 p-4 text-[10.5px] text-slate-400">
          <Play size={12} /> Chọn một trong 3 thuật toán phía trên để chạy phân tích. Kết quả đầu tiên sẽ hiển thị tại đây.
        </div>
      )}
    </div>
  )
}
