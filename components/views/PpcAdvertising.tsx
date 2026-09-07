'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import { PpcCampaign, PpcKeyword } from '@/lib/types'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  CircleDollarSign,
  Edit3,
  Filter,
  Megaphone,
  Percent,
  Play,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react'

export function PpcAdvertising() {
  const { filteredCampaigns, filteredKeywords, setActiveTab, openModal } = useAppState()
  const [activeTab, setActiveTabLocal] = useState<'CAMPAIGNS' | 'KEYWORDS' | 'SEARCH_TERMS'>('CAMPAIGNS')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-purple-600" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Amazon Sponsored Ads (SP / SB) & Bid Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Quản lý Quảng cáo Amazon PPC
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            AI PPC Agent liên tục phát hiện từ khóa lãng phí ngân sách (Bleeders) và cơ hội scale từ khóa chuyển đổi cao (Section 19).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('ai-operations')}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-all"
          >
            <Sparkles size={14} />
            <span>Xem Đề xuất Điều chỉnh Bid tại AI Center</span>
          </button>
        </div>
      </div>

      {/* PPC Metric Overview Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Chi phí Ads 7 ngày</span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <Megaphone size={18} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">$2,485</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tạo ra $11,450 Ad Sales</div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ACOS Chiến dịch</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <Percent size={18} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">21.7%</div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Mục tiêu (Target): 25.0%</div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">TACOS (Toàn bộ Brand)</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Target size={18} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-900">12.35%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tỷ lệ chi phí QC / Tổng doanh thu</div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ROAS Trung bình</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-900">4.61x</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Mỗi $1 chi phí sinh ra $4.61</div>
        </div>
      </div>

      {/* Sub-tabs for Campaigns vs Keywords */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTabLocal('CAMPAIGNS')}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            activeTab === 'CAMPAIGNS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-border'
          }`}
        >
          Danh sách Chiến dịch ({filteredCampaigns.length})
        </button>
        <button
          onClick={() => setActiveTabLocal('KEYWORDS')}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            activeTab === 'KEYWORDS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-border'
          }`}
        >
          Từ khóa & Báo cáo Giá thầu ({filteredKeywords.length})
        </button>
      </div>

      {/* TAB 1: CAMPAIGNS TABLE */}
      {activeTab === 'CAMPAIGNS' && (
        <div className="rounded-xl border border-border bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Tên Chiến dịch PPC</th>
                  <th className="py-3 px-3">Loại / Targeting</th>
                  <th className="py-3 px-3">Ngân sách / ngày</th>
                  <th className="py-3 px-3">Chi tiêu (7d)</th>
                  <th className="py-3 px-3">Doanh thu Ads</th>
                  <th className="py-3 px-3">ACOS / Target</th>
                  <th className="py-3 px-3">ROAS</th>
                  <th className="py-3 px-4 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCampaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{camp.campaignName}</div>
                      <div className="text-[10px] font-mono text-slate-400">ID: {camp.id}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-700">
                        {camp.type} • {camp.targetingType}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-900">${camp.dailyBudget.toFixed(2)}/ngày</td>

                    <td className="py-3 px-3 font-bold text-purple-700">${camp.spend7d.toFixed(2)}</td>

                    <td className="py-3 px-3 font-bold text-slate-900">${camp.sales7d.toFixed(2)}</td>

                    <td className="py-3 px-3">
                      <div className="font-mono text-sm font-black">
                        <span className={camp.acos <= camp.targetAcos ? 'text-emerald-600' : 'text-red-600'}>
                          {camp.acos.toFixed(1)}%
                        </span>
                        <span className="text-slate-400 font-normal text-xs"> / {camp.targetAcos}%</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-bold text-indigo-700">{camp.roas.toFixed(2)}x</td>

                    <td className="py-3 px-4 text-right">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        {camp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: KEYWORDS & BID RECS TABLE */}
      {activeTab === 'KEYWORDS' && (
        <div className="rounded-xl border border-border bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Từ khóa (Target Keyword)</th>
                  <th className="py-3 px-3">Match Type</th>
                  <th className="py-3 px-3">Giá thầu (Bid)</th>
                  <th className="py-3 px-3">Clicks / CTR</th>
                  <th className="py-3 px-3">Chi tiêu (Spend)</th>
                  <th className="py-3 px-3">Doanh thu / Đơn</th>
                  <th className="py-3 px-3">ACOS</th>
                  <th className="py-3 px-3">Tỷ lệ CVR</th>
                  <th className="py-3 px-4 text-right">Khuyến nghị AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredKeywords.map((kw) => (
                  <tr key={kw.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      "{kw.keywordText}"
                      <div className="text-[10px] text-slate-400">{kw.campaignName}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                        {kw.matchType}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-900">${kw.bid.toFixed(2)}</td>

                    <td className="py-3 px-3 text-slate-600">
                      {kw.clicks} clicks <span className="text-slate-400 font-mono text-[10px]">({kw.ctr}%)</span>
                    </td>

                    <td className="py-3 px-3 font-semibold text-purple-700">${kw.spend.toFixed(2)}</td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">${kw.sales.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400">{kw.orders} orders</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`font-mono font-bold ${kw.acos > 40 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {kw.acos.toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-3 px-3 font-bold text-slate-800">{kw.conversionRate}%</td>

                    <td className="py-3 px-4 text-right">
                      {kw.acos > 40 ? (
                        <span className="rounded-md bg-red-100 px-2 py-1 text-[10px] font-bold text-red-800">
                          Hạ bid 35% (Bleeding)
                        </span>
                      ) : kw.acos < 20 ? (
                        <span className="rounded-md bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800">
                          Tăng bid 15% (Scale Top #1)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Duy trì ổn định</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
