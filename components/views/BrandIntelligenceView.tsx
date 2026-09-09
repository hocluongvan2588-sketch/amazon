'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import {
  AlertCircle,
  ArrowUpRight,
  BarChart2,
  Bookmark,
  CheckCircle2,
  Compass,
  Crosshair,
  ExternalLink,
  Eye,
  Flame,
  HelpCircle,
  Lightbulb,
  LineChart,
  Percent,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react'

export function BrandIntelligenceView() {
  const { competitorReverseAsins, conversionDiagnostics } = useAppState()
  const [activeTab, setActiveTab] = useState<'reverseasin' | 'diagnostics'>('reverseasin')
  const [selectedCompId, setSelectedCompId] = useState<string>('comp-lindt-01')

  const activeComp = competitorReverseAsins.find((c) => c.id === selectedCompId) || competitorReverseAsins[0]
  // Sprint audit: tiềm năng uplift tính TỪ dữ liệu diagnostics (trước đây hardcode +$7,460)
  const totalUpliftMonthly = conversionDiagnostics.reduce((sum, d) => sum + (d.estimatedRevenueUpliftMonthly || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-purple-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider">
              Brand Intelligence & CRO Desk
            </span>
            <span className="flex items-center gap-1 text-[11px] text-purple-300 font-medium">
              <Crosshair size={13} />
              Reverse ASIN & Market Radar
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Thấu thị Đối thủ & Chẩn đoán Tỷ lệ Chuyển đổi</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
            Bóc tách toàn diện chiến lược từ khóa của đối thủ dẫn đầu ngành (Reverse ASIN) và xác định điểm nghẽn chuyển đổi (CTR vs CVR Diagnostics) trên từng Listing.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs text-right">
            <div className="text-[10px] uppercase font-mono text-slate-400">Doanh thu Đối thủ Top 1</div>
            <div className="text-lg font-extrabold text-purple-300">${(activeComp.estimatedMonthlyRevenueUsd / 1000).toFixed(0)}k / tháng</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs text-right">
            <div className="text-[10px] uppercase font-mono text-slate-400">Tiềm năng tăng doanh thu CRO</div>
            <div className="text-lg font-extrabold text-emerald-400">+${totalUpliftMonthly.toLocaleString()} / tháng</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('reverseasin')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'reverseasin'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Target size={16} />
          <span>Reverse ASIN Competitor Radar</span>
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'diagnostics'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Percent size={16} />
          <span>Traffic & Conversion Diagnostics</span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
            {conversionDiagnostics.length} Cần tối ưu
          </span>
        </button>
      </div>

      {/* TAB 1: REVERSE ASIN COMPETITOR RADAR */}
      {activeTab === 'reverseasin' && (
        <div className="space-y-6">
          {/* Competitor Selector */}
          <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">Chọn đối thủ theo dõi:</span>
            <div className="flex flex-wrap gap-2">
              {competitorReverseAsins.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompId(comp.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCompId === comp.id
                      ? 'bg-purple-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {comp.competitorBrand} ({comp.competitorAsin})
                </button>
              ))}
            </div>
          </div>

          {/* Competitor Overview Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">
                    {activeComp.competitorBrand}
                  </span>
                  <span className="font-mono text-xs text-slate-400">ASIN: {activeComp.competitorAsin}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{activeComp.productTitle}</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-center">
                  <div className="text-[10px] uppercase font-mono text-slate-400">BSR Rank</div>
                  <div className="text-sm font-extrabold text-slate-900">#{activeComp.bsrRank}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-center">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Đơn / Tháng</div>
                  <div className="text-sm font-extrabold text-slate-900">{activeComp.estimatedMonthlyUnits.toLocaleString()} sp</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-center">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Đánh giá</div>
                  <div className="text-sm font-extrabold text-amber-600">★ {activeComp.reviewRating} ({activeComp.reviewCount.toLocaleString()})</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-center">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Độ trùng Keyword</div>
                  <div className="text-sm font-extrabold text-purple-700">{activeComp.keywordOverlapScore}%</div>
                </div>
              </div>
            </div>

            {/* Keyword Battle Matrix */}
            <div>
              <h4 className="text-xs font-bold uppercase font-mono text-slate-500 mb-3">
                Bảng Đấu Từ Khóa Trọng Điểm (Organic Rank Comparison):
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Từ khóa tìm kiếm (Search Term)</th>
                      <th className="p-3">Search Volume (Tháng)</th>
                      <th className="p-3">Thứ hạng Đối thủ</th>
                      <th className="p-3">Thứ hạng Vinacacao</th>
                      <th className="p-3 text-right">Hành động đề xuất</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeComp.sharedTopKeywords.map((kw, i) => (
                      <tr key={i} className="hover:bg-slate-50/80">
                        <td className="p-3 font-semibold text-slate-900">{kw.keyword}</td>
                        <td className="p-3 font-mono text-slate-600">{kw.searchVolume.toLocaleString()} search/mo</td>
                        <td className="p-3">
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-800">
                            Rank #{kw.competitorOrganicRank}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`rounded px-2 py-0.5 font-bold ${kw.ourOrganicRank < kw.competitorOrganicRank ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            Rank #{kw.ourOrganicRank}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button className="rounded-lg bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700 hover:bg-purple-100">
                            Tăng thầu Exact để vượt rank
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Strategic Insight */}
            <div className="rounded-xl bg-purple-50 p-4 border border-purple-200 flex items-start gap-3">
              <Sparkles size={18} className="text-purple-700 shrink-0 mt-0.5" />
              <div className="text-xs text-purple-950 space-y-1">
                <div className="font-bold">Nhận định Chiến lược Tấn công Thị trường:</div>
                <p className="leading-relaxed">{activeComp.pricingStrategyInsight}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRAFFIC & CONVERSION DIAGNOSTICS */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Chẩn đoán Điểm Nghẽn Phễu Chuyển Đổi (Conversion Funnel Bottlenecks)</h2>
            <p className="text-xs text-slate-500">
              AI phân tích tương quan giữa Lượt nhấp (CTR) và Tỷ lệ chuyển đổi đơn hàng (CVR) để chỉ ra chính xác lý do vì sao khách xem hàng nhưng không bấm nút &quot;Buy Now&quot;.
            </p>
          </div>

          <div className="grid gap-4">
            {conversionDiagnostics.map((diag) => (
              <div key={diag.sku} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {diag.sku}
                      </span>
                      <span className="font-mono text-xs text-slate-400">ASIN: {diag.asin}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{diag.title}</h3>
                  </div>

                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-right">
                    <div className="text-[10px] uppercase font-mono text-emerald-700 font-bold">Doanh thu tăng thêm khi sửa</div>
                    <div className="text-base font-black text-emerald-700">+${diag.estimatedRevenueUpliftMonthly.toFixed(2)}/tháng</div>
                  </div>
                </div>

                {/* Funnel Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <div className="text-[10px] uppercase font-mono text-slate-400">CTR Hiện tại</div>
                    <div className="text-sm font-extrabold text-slate-900">
                      {diag.ctr}% <span className="text-[10px] font-normal text-slate-500">(Chuẩn ngành: {diag.categoryBenchmarkCtr}%)</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <div className="text-[10px] uppercase font-mono text-slate-400">CVR (Tỷ lệ mua)</div>
                    <div className="text-sm font-extrabold text-slate-900">
                      {diag.unitSessionPercentage}% <span className="text-[10px] font-normal text-slate-500">(Chuẩn: {diag.categoryBenchmarkCvr}%)</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <div className="text-[10px] uppercase font-mono text-slate-400">Tỷ lệ thoát trang</div>
                    <div className="text-sm font-extrabold text-slate-900">{diag.bounceRate}%</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <div className="text-[10px] uppercase font-mono text-slate-400">Điểm nghẽn</div>
                    <div className="text-xs font-bold text-amber-700">{diag.bottleneckType.replace('_', ' ')}</div>
                  </div>
                </div>

                {/* AI Diagnosis Details */}
                <div className="rounded-xl bg-amber-50/60 p-4 border border-amber-200 space-y-2 text-xs">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertCircle size={15} className="text-amber-700" />
                    <span>{diag.diagnosisTitleVi}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{diag.diagnosisDetailVi}</p>
                  <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between">
                    <span className="font-semibold text-emerald-900">
                      👉 Giải pháp: {diag.suggestedActionVi}
                    </span>
                    <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700">
                      Tạo Task cho Designer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
