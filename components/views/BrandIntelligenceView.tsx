'use client'

import React, { useMemo, useState } from 'react'
import { useAppState } from '@/lib/state-context'
import { ConversionDiagnostic } from '@/lib/types'
import {
  buildCompetitorInsight,
  buildConversionDiagnostic,
  computeConversionDiagnostics,
  keywordBattleAction,
} from '@/lib/cro-engine'
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
  const { competitorReverseAsins, conversionDiagnostics, products, inventory, createTask, setActiveTab: setGlobalTab } = useAppState()
  const [activeTab, setActiveTab] = useState<'reverseasin' | 'diagnostics'>('reverseasin')
  const [selectedCompId, setSelectedCompId] = useState<string>('comp-lindt-01')

  const activeComp = competitorReverseAsins.find((c) => c.id === selectedCompId) || competitorReverseAsins[0]

  // Sprint audit: chẩn đoán TÍNH TỪ ENGINE (lib/cro-engine.ts) từ 3 nguồn:
  //  (1) chỉ số phiên SP-API Business (SIMULATED) trong state,
  //  (2) giá bán từ products, (3) velocity từ inventory.
  // Trước đây: +$4,620/+$2,840, loại nghẽn, toàn bộ câu chẩn đoán đều LƯU SẴN trong mock-data.
  const scoredDiagnostics = useMemo(
    () =>
      computeConversionDiagnostics(
        conversionDiagnostics,
        products.map((p) => ({ sku: p.sku, price: p.price })),
        inventory.map((i) => ({ sku: i.sku, dailyVelocity7d: i.dailyVelocity7d }))
      ),
    [conversionDiagnostics, products, inventory]
  )
  const totalUpliftMonthly = scoredDiagnostics.reduce((sum, d) => sum + d.estimatedRevenueUpliftMonthly, 0)

  // Sản phẩm nhà ta để so sánh với đối thủ (match theo từ trùng title, vd "chocolate")
  const ourCompProduct = useMemo(() => {
    const words = activeComp.productTitle.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 5)
    return (
      products.find((p) => words.some((w) => p.title.toLowerCase().includes(w))) || products[0]
    )
  }, [activeComp, products])
  const strategicInsight = buildCompetitorInsight(activeComp, ourCompProduct)

  const handleCreateCroTask = (diag: ConversionDiagnostic) => {
    createTask({
      title: `[CRO] ${diag.sku}: sửa ${diag.bottleneckType.replace(/_/g, ' ')} (Brand Intel Desk)`,
      description:
        `${diag.diagnosisTitleVi}\n\n${diag.diagnosisDetailVi}\n\n` +
        `👉 Hành động: ${diag.suggestedActionVi}\n\n` +
        `Kỳ vọng: +$${diag.estimatedRevenueUpliftMonthly.toLocaleString()} doanh thu/tháng ` +
        `(engine tính từ velocity × giá × khoảng trống tới benchmark).`,
      priority: 'HIGH',
      status: 'OPEN',
      assignedTo: 'Trần Thu Hà (Content, CRO & CS)',
      assignedRole: 'BRAND_CS_SPECIALIST',
      source: 'AI_LISTING_AGENT',
      linkedEntity: { type: 'LISTING', id: diag.sku, name: diag.title },
    })
  }

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
            {scoredDiagnostics.length} Cần tối ưu
          </span>
        </button>
      </div>

      {/* TAB 1: REVERSE ASIN COMPETITOR RADAR */}
      {activeTab === 'reverseasin' && (
        <div className="space-y-6">
          {/* Sprint audit: minh bạch nguồn dữ liệu market (trước đây nhìn như số thật) */}
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <strong>Nguồn dữ liệu MARKET đang là MẪU (SIMULATED):</strong> BSR, đơn/tháng, rank từ khóa của đối thủ
              cần Amazon Brand Analytics hoặc API bên thứ 3 (Helium10/DataDweomer) để chuyển LIVE — hệ thống chưa có
              kết nối này. Cấu trúc bảng & logic đề xuất đã sẵn sàng nhận dữ liệu thật.
            </div>
          </div>

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
                          {(() => {
                            // Sprint audit: hành động theo RULE rank/volume (trước đây 1 câu lặp cho mọi dòng,
                            // kể cả dòng ta đang THẮNG rank); bấm nhảy sang PPC Growth để thực thi
                            const act = keywordBattleAction(kw)
                            return (
                              <button
                                onClick={() => setGlobalTab('ppc')}
                                title="Mở không gian PPC Growth để thực hiện"
                                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                                  act.weWin
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    : act.urgency === 'ATTACK'
                                    ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {act.label}
                              </button>
                            )
                          })()}
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
                <div className="font-bold">Nhận định Chiến lược Tấn công Thị trường (sinh tự động từ dữ liệu):</div>
                <p className="leading-relaxed">{strategicInsight}</p>
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
              Engine phân tích tương quan giữa Lượt nhấp (CTR) và Tỷ lệ chuyển đổi (CVR) để chỉ ra vì sao khách xem
              hàng nhưng không bấm &quot;Buy Now&quot;. Sessions &amp; doanh thu tăng thêm được TÍNH TỪ velocity tồn kho × giá ×
              khoảng trống benchmark (không lưu sẵn); SKU đạt chuẩn không xuất hiện ở đây.
            </p>
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
              <AlertCircle size={13} className="mt-0.5 shrink-0 text-amber-600" />
              <span>
                <strong>Đầu vào CTR/CVR/bounce là chỉ số SP-API Business ở chế độ MÔ PHỎNG</strong> (chưa có credentials
                Amazon) — khi kết nối LIVE, số phiên &amp; uplift sẽ tự cập nhật theo hiệu suất thật.
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            {scoredDiagnostics.map((diag) => (
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
                  <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                    <span className="font-semibold text-emerald-900">
                      👉 Giải pháp: {diag.suggestedActionVi}
                    </span>
                    <button
                      onClick={() => handleCreateCroTask(diag)}
                      title="Tạo task HIGH priority giao Content & CRO, hiện trong mục Nhiệm Vụ Content & CS"
                      className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                    >
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
