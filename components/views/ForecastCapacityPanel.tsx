'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { CalendarClock, Box, Gauge, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { useAppState } from '@/lib/state-context'

// ====================================================================
// FORECAST & CAPACITY PANEL (Sprint 3.3)
// 1) Days of Supply thời gian thực: velocity trọng số 50/30/20 (7/14/30d)
// 2) Capacity Bid Suggestion: ft³ cần mua thêm cho đỉnh Q4 + mức $/ft³ tối ưu
//    (≤50% biên lợi nhuận trên ft³ — giữ 100% Performance Credits)
// Nút "Dùng gợi ý để Nộp Bid" điền thẳng số liệu vào hành động đấu giá.
// ====================================================================

interface Suggestion {
  extraCubicFeetToBuy: number
  suggestedBidPerCubicFeet: number
  maxSafeBidPerCubicFeet: number
  marginPerCubicFeet: number
  requiredCubicFeet: number
  freeCubicFeet: number
  targetCoverageUnits: number
  projectedPeakVelocity: number
  estimatedReservationFeeUsd: number
  warnings: string[]
  formula: string
}

interface ForecastRow {
  sku: string
  asin: string
  title: string
  fbaAvailable: number
  fbaInbound: number
  velocities: { v7: number; v14: number; v30: number; v14IsFallback: boolean; weighted: number }
  daysOfSupply: number
  daysOfSupplyWithInbound: number
  projectedPeakVelocity: number
  estimatedStockoutDate: string | null
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'HEALTHY'
  formula: string
  capacitySuggestion: Suggestion
}

interface ForecastResponse {
  dataSource: 'DATABASE_LIVE' | 'SIMULATED_MOCK'
  currentSeason: { label: string; value: number; isPeak: boolean }
  forecasts: ForecastRow[]
  consolidatedBid: {
    storageType: string
    extraCubicFeetToBuy: number
    suggestedBidPerCubicFeet: number
    estimatedReservationFeeUsd: number
  }
}

const RISK_BADGE: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HEALTHY: 'bg-emerald-100 text-emerald-700',
}

export function ForecastCapacityPanel() {
  const { showToast, submitCapacityBid } = useAppState()
  const [data, setData] = useState<ForecastResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/inventory/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCoverageDays: 45, safetyFactor: 1.15 }),
      })
      setData(await res.json())
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const applySuggestedBid = async () => {
    if (!data?.consolidatedBid || data.consolidatedBid.extraCubicFeetToBuy <= 0) return
    setSubmitting(true)
    try {
      submitCapacityBid(
        'STANDARD_SIZE',
        data.consolidatedBid.extraCubicFeetToBuy,
        data.consolidatedBid.suggestedBidPerCubicFeet
      )
    } finally {
      setSubmitting(false)
    }
  }

  const bid = data?.consolidatedBid

  return (
    <div className="rounded-2xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50/60 to-white p-5 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600 text-white">
            <Gauge size={15} />
          </span>
          <div>
            <h2 className="text-sm font-black text-slate-900">
              Dự báo Kiệt kho &amp; Đấu giá Dung lượng Q4 (Giai đoạn 3)
            </h2>
            <p className="text-[11px] text-slate-500">
              Velocity trọng số <strong>50% (7d) / 30% (14d) / 20% (30d)</strong> • Days of Supply thời gian thực •
              ft³ cần mua + bid $/ft³ tối ưu (≤50% biên lợi nhuận)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                data.dataSource === 'DATABASE_LIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {data.dataSource === 'DATABASE_LIVE' ? 'DATABASE_LIVE' : 'SIMULATED_MOCK'}
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
        </div>
      </div>

      {loading && !data && (
        <div className="mt-6 flex items-center gap-2 text-[11px] text-slate-400">
          <Loader2 size={13} className="animate-spin" /> Đang chạy dự báo 50/30/20...
        </div>
      )}

      {/* Consolidated bid suggestion */}
      {bid && (
        <div className="mt-4 rounded-xl border border-cyan-300 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
                <Box size={16} />
              </span>
              <div>
                <p className="text-[12px] font-black text-slate-900">
                  Đề xuất: mua thêm <span className="text-cyan-700">+{bid.extraCubicFeetToBuy.toLocaleString()} ft³</span>{' '}
                  @ <span className="text-cyan-700">${bid.suggestedBidPerCubicFeet}/ft³</span>
                </p>
                <p className="text-[10.5px] text-slate-500">
                  Tổng dự kiến: ${bid.estimatedReservationFeeUsd.toLocaleString()} • Coverage 45 ngày đỉnh Q4 (×1.65) •
                  Safety 1.15
                </p>
              </div>
            </div>
            <button
              onClick={applySuggestedBid}
              disabled={submitting || bid.extraCubicFeetToBuy <= 0}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-2.5 text-[11px] font-bold text-white shadow-xs hover:bg-cyan-700 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {bid.extraCubicFeetToBuy <= 0 ? 'Không cần mua thêm' : 'Dùng gợi ý để Nộp Bid'}
            </button>
          </div>
        </div>
      )}

      {/* Forecast table */}
      {data && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[860px] text-left text-[10.5px]">
            <thead className="bg-slate-50 text-[9.5px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2">SKU</th>
                <th className="px-3 py-2">Velocity 7/14/30 (u/ngày)</th>
                <th className="px-3 py-2">Weighted (50/30/20)</th>
                <th className="px-3 py-2">DoS thực tế</th>
                <th className="px-3 py-2">Ngày đứt hàng</th>
                <th className="px-3 py-2">Risk</th>
                <th className="px-3 py-2">ft³ cần mua (Q4)</th>
                <th className="px-3 py-2">Bid max an toàn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.forecasts.map((f) => (
                <tr key={f.sku} className="hover:bg-slate-50/60">
                  <td className="px-3 py-2">
                    <p className="font-bold text-slate-800">{f.sku}</p>
                    <p className="line-clamp-1 max-w-[180px] text-[9.5px] text-slate-400">{f.title}</p>
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-600">
                    {f.velocities.v7} / {f.velocities.v14}
                    {f.velocities.v14IsFallback && <span title="14d suy từ 7d+30d (chưa có dữ liệu 14d)">*</span>} /{' '}
                    {f.velocities.v30}
                  </td>
                  <td className="px-3 py-2">
                    <span className="rounded bg-cyan-50 px-1.5 py-0.5 font-mono font-bold text-cyan-700">
                      {f.velocities.weighted}
                    </span>
                    <span className="ml-1 text-[9px] text-slate-400">
                      → đỉnh {f.projectedPeakVelocity} (×1.65)
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono font-bold text-slate-800">
                    {f.daysOfSupply} ngày
                    <span className="ml-1 text-[9px] font-normal text-slate-400">
                      (có inbound: {f.daysOfSupplyWithInbound})
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock size={10} /> {f.estimatedStockoutDate || '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${RISK_BADGE[f.riskLevel]}`}>
                      {f.riskLevel}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono">
                    {f.capacitySuggestion.extraCubicFeetToBuy > 0 ? (
                      <span className="font-bold text-cyan-700">
                        +{f.capacitySuggestion.extraCubicFeetToBuy.toLocaleString()} ft³
                      </span>
                    ) : (
                      <span className="text-slate-400">Đủ hạn ngạch</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-600">
                    ${f.capacitySuggestion.suggestedBidPerCubicFeet}/ft³
                    <span className="block text-[9px] text-slate-400">
                      trần ${f.capacitySuggestion.maxSafeBidPerCubicFeet} (50% biên ${f.capacitySuggestion.marginPerCubicFeet}/ft³)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-slate-100 px-3 py-2 text-[9.5px] text-slate-400">
            * Velocity 14 ngày chưa có dữ liệu — tạm suy từ trung bình 7d/30d. Chạy migration 20260912 để có cột
            <code className="mx-1 rounded bg-slate-100 px-1 font-mono">daily_velocity_14d</code>
            chính xác. Công thức mẫu: {data.forecasts[0]?.formula}
          </div>
        </div>
      )}
    </div>
  )
}
