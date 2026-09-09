'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock,
  Coins,
  Cpu,
  DollarSign,
  Filter,
  Layers,
  Megaphone,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  StopCircle,
  TrendingUp,
  Zap,
} from 'lucide-react'

export function PpcGrowthDesk() {
  const {
    algorithmicBidRules,
    harvestedSearchTerms,
    cannibalizationAlerts,
    filteredCampaigns,
    promoteSearchTerm,
    negateSearchTerm,
    toggleBidRule,
  } = useAppState()

  const [activeTab, setActiveTab] = useState<'harvester' | 'rules' | 'cannibalization'>('harvester')
  const [filterAction, setFilterAction] = useState<string>('ALL')

  const totalDailySavings = algorithmicBidRules.reduce((acc, r) => acc + (r.status === 'ACTIVE' ? r.estimatedDailySavingsUsd : 0), 0)
  const pendingHarvestCount = harvestedSearchTerms.filter((t) => t.status === 'PENDING').length

  const filteredHarvestTerms = harvestedSearchTerms.filter((term) => {
    if (filterAction === 'PROMOTE_EXACT') return term.suggestedAction === 'PROMOTE_EXACT'
    if (filterAction === 'ADD_NEGATIVE_EXACT') return term.suggestedAction === 'ADD_NEGATIVE_EXACT'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-indigo-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-wider">
              Deep-Tech PPC Desk
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <Zap size={13} />
              Algorithmic Engine Active
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">PPC & Growth Engineering Desk</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
            Tự động hóa thầu thuật toán (Day-parting), bóc tách từ khóa chuyển đổi (Search Term Harvester) và triệt tiêu xung đột giá thầu nội bộ (Cannibalization).
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs text-right">
            <div className="text-[10px] uppercase font-mono text-slate-400">Tiết kiệm thuật toán / Ngày</div>
            <div className="text-lg font-extrabold text-emerald-400">+${totalDailySavings.toFixed(2)}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs text-right">
            <div className="text-[10px] uppercase font-mono text-slate-400">Từ khóa chờ phân bổ</div>
            <div className="text-lg font-extrabold text-indigo-300">{pendingHarvestCount} cụm từ</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('harvester')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'harvester'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search size={16} />
          <span>Search Term Harvester</span>
          {pendingHarvestCount > 0 && (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
              {pendingHarvestCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'rules'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu size={16} />
          <span>Algorithmic Bid Canvas</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            {algorithmicBidRules.filter((r) => r.status === 'ACTIVE').length} Active
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cannibalization')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'cannibalization'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle size={16} />
          <span>Cannibalization Radar</span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
            {cannibalizationAlerts.length} Cảnh báo
          </span>
        </button>
      </div>

      {/* TAB 1: SEARCH TERM HARVESTER */}
      {activeTab === 'harvester' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Bóc tách Từ khóa Thực tế từ Khách hàng Mỹ (Amazon SQS Harvest)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                AI phát hiện các cụm từ sinh ra đơn hàng có ACOS thấp để đưa vào Exact, đồng thời chặn các từ khóa rác làm thâm hụt ngân sách.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Lọc:</span>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="ALL">Tất cả từ khóa ({harvestedSearchTerms.length})</option>
                <option value="PROMOTE_EXACT">Cần đưa vào Exact</option>
                <option value="ADD_NEGATIVE_EXACT">Cần phủ định (Negative)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredHarvestTerms.map((term) => (
              <div
                key={term.id}
                className={`rounded-xl border p-4 sm:p-5 transition-all bg-white ${
                  term.status === 'PROMOTED'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : term.status === 'NEGATED'
                    ? 'border-slate-200 opacity-60'
                    : 'border-slate-200 shadow-xs hover:border-indigo-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                        &quot;{term.searchTerm}&quot;
                      </span>
                      <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-700">
                        Nguồn: {term.matchTypeSource} Match
                      </span>
                      {term.suggestedAction === 'PROMOTE_EXACT' ? (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                          <TrendingUp size={12} /> Đề xuất: Chuyển sang EXACT (ACOS {term.acos.toFixed(1)}%)
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-800 flex items-center gap-1">
                          <AlertTriangle size={12} /> Đề xuất: Phủ định (NEGATIVE EXACT)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      Chiến dịch: <strong className="text-slate-700">{term.campaignName}</strong> &bull; Nhóm: {term.adGroupName}
                    </div>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-4 gap-3 border-y sm:border-y-0 sm:border-x border-slate-100 py-2 sm:py-0 sm:px-4">
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono">CLICKS / CVR</div>
                      <div className="text-xs font-bold text-slate-800">{term.clicks} ({term.cvr.toFixed(1)}%)</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono">ORDERS</div>
                      <div className="text-xs font-bold text-slate-800">{term.orders} đơn</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono">SPEND / SALES</div>
                      <div className="text-xs font-bold text-slate-800">${term.spend} / ${term.sales}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono">ACOS</div>
                      <div className={`text-xs font-extrabold ${term.acos > 0 && term.acos <= 25 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {term.sales > 0 ? `${term.acos.toFixed(1)}%` : 'Không ra đơn'}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {term.status === 'PROMOTED' ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg">
                        <CheckCircle2 size={14} /> Đã chuyển Exact
                      </span>
                    ) : term.status === 'NEGATED' ? (
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                        Đã phủ định
                      </span>
                    ) : term.suggestedAction === 'PROMOTE_EXACT' ? (
                      <button
                        onClick={() => promoteSearchTerm(term.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all"
                      >
                        <Zap size={14} />
                        <span>Duyệt Exact (1-Click)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => negateSearchTerm(term.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-all"
                      >
                        <StopCircle size={14} />
                        <span>Phủ định từ khóa</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ALGORITHMIC BID CANVAS */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Cấu hình Quy tắc Đấu thầu Tự động (Algorithmic Bidding Canvas)</h2>
            <p className="text-xs text-slate-500">
              Các thuật toán điều tiết bid tự động theo thời gian thực để đón giờ cao điểm mua sắm của khách Mỹ (EST / PST) và tự động giảm bid khi kho hàng sắp hết.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {algorithmicBidRules.map((rule) => (
              <div
                key={rule.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  rule.status === 'ACTIVE'
                    ? 'border-indigo-200 bg-white shadow-xs'
                    : 'border-slate-200 bg-slate-50/60 opacity-70'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${
                        rule.ruleType === 'DAY_PARTING'
                          ? 'bg-purple-100 text-purple-800'
                          : rule.ruleType === 'INVENTORY_THROTTLE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {rule.ruleType.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => toggleBidRule(rule.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        rule.status === 'ACTIVE' ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          rule.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{rule.ruleName}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {rule.ruleType === 'DAY_PARTING' && 'Tăng +25% bid lúc 18h-23h (giờ Mỹ), giảm -40% lúc 1h-6h sáng.'}
                      {rule.ruleType === 'INVENTORY_THROTTLE' && 'Tự động hạ 30% bid khi tồn kho FBA còn dưới 14 ngày để chống đứt hàng.'}
                      {rule.ruleType === 'TARGET_ACOS_TUNER' && 'Duy trì ACOS mục tiêu 22%, tự động nâng bid cho từ khóa sinh lời cao.'}
                    </p>
                  </div>

                  {/* Visual Parameters */}
                  <div className="rounded-lg bg-slate-50 p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Số lần kích hoạt 24h:</span>
                      <strong className="text-slate-900">{rule.executionsCount24h} lần</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Ước tính tiết kiệm/ngày:</span>
                      <strong className="text-emerald-600">+${rule.estimatedDailySavingsUsd.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>Kích hoạt gần nhất:</span>
                      <span className="text-slate-400">Vừa xong (06:00 UTC)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Chiến dịch áp dụng:</span>
                  <span className="font-mono font-bold text-indigo-700">{rule.targetCampaignIds.length} Campaigns</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CANNIBALIZATION RADAR */}
      {activeTab === 'cannibalization' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Radar Triệt tiêu Xung đột Giá thầu Nội bộ (Keyword Cannibalization Map)</h2>
            <p className="text-xs text-slate-500">
              Phát hiện tình trạng 2 sản phẩm của cùng một gian hàng cùng đấu thầu 1 từ khóa, dẫn đến việc tự đẩy giá click CPC của chính mình lên cao.
            </p>
          </div>

          <div className="grid gap-4">
            {cannibalizationAlerts.map((alert) => (
              <div key={alert.id} className="rounded-2xl border border-amber-200 bg-amber-50/30 p-5 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-slate-900 bg-white border border-amber-300 px-3 py-1 rounded-lg">
                        &quot;{alert.keyword}&quot;
                      </span>
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
                        {alert.campaignCount} Chiến dịch đang tự dẫm chân nhau
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      💡 <strong>Khuyến nghị AI:</strong> {alert.recommendation}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white border border-amber-200 p-3 text-right">
                    <div className="text-[10px] uppercase font-mono text-slate-400">Chi phí lãng phí ước tính/tháng</div>
                    <div className="text-base font-extrabold text-red-600">-${alert.wastedSpendEstimate.toFixed(2)}/tháng</div>
                  </div>
                </div>

                {/* SKU Conflict breakdown */}
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {alert.conflictingSkus.map((sku) => (
                    <div key={sku.sku} className="rounded-lg bg-white p-3 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{sku.sku}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{sku.title}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-indigo-700">Bid: ${sku.currentBid.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">ACOS: {sku.acos}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
