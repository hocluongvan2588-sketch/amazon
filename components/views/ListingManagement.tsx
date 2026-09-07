'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import { ListingData } from '@/lib/types'
import {
  AlertCircle,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  Edit3,
  ExternalLink,
  Flame,
  Globe2,
  Layers,
  Package,
  Play,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  Zap,
} from 'lucide-react'

export function ListingManagement() {
  const { filteredListings, applyListingDraft, isSyncing, openModal } = useAppState()
  const [selectedListing, setSelectedListing] = useState<ListingData>(filteredListings[0] || null)
  const [activeTab, setActiveTab] = useState<'SIDE_BY_SIDE' | 'SCORECARD' | 'APLUS_CONTENT'>('SIDE_BY_SIDE')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleRegenerateAI = async () => {
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsGenerating(false)
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              AI Listing Assistant & Conversion Optimizer
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Quản lý & Tối ưu Listing Amazon US
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân tích điểm chuẩn Listing (AI Score 0-100), nghiên cứu đối thủ và tạo bản nháp tối ưu hóa tỷ lệ chuyển đổi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRegenerateAI}
            disabled={isGenerating}
            className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <Sparkles size={14} className={isGenerating ? 'animate-spin' : ''} />
            <span>{isGenerating ? 'AI đang phân tích...' : 'AI Phân tích lại Listing'}</span>
          </button>
        </div>
      </div>

      {/* Listing Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filteredListings.map((list) => (
          <button
            key={list.id}
            onClick={() => setSelectedListing(list)}
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all ${
              selectedListing?.id === list.id
                ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold shadow-xs'
                : 'border-border bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="font-mono text-[10px] text-slate-400">{list.sku}</span>
            <span className="line-clamp-1 max-w-[200px]">{list.title}</span>
            <span className="rounded bg-blue-100 px-1.5 py-0.2 font-mono text-[10px] text-blue-800 font-bold">
              {list.currentScore.overall}/100
            </span>
          </button>
        ))}
      </div>

      {selectedListing && (
        <div className="space-y-6">
          {/* Scorecard Overview Bar */}
          <div className="rounded-xl border border-border bg-white p-5 shadow-xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-mono text-lg font-black shadow-md shadow-blue-600/20">
                  {selectedListing.currentScore.overall}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">AI Listing Quality Score</h3>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Conversion Grade: {selectedListing.currentScore.conversionPotential}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mã ASIN: <span className="font-mono text-slate-700 font-semibold">{selectedListing.asin}</span> • Giá niêm yết: <strong className="text-slate-900">${selectedListing.price}</strong>
                  </p>
                </div>
              </div>

              {/* Sub-Tabs */}
              <div className="flex rounded-lg border border-border bg-slate-50 p-1 text-xs">
                {[
                  { id: 'SIDE_BY_SIDE', label: 'So sánh Trước & Sau AI Draft' },
                  { id: 'SCORECARD', label: 'Chi tiết Điểm số & Đối thủ' },
                  { id: 'APLUS_CONTENT', label: 'A+ Brand Content Story' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`rounded-md px-3 py-1 font-semibold transition-colors ${
                      activeTab === tab.id ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Scores Grid */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5 text-center">
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Tiêu đề (Title)</div>
                <div className="text-base font-black text-slate-900 mt-0.5">{selectedListing.currentScore.titleScore}/100</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">5 Bullet Points</div>
                <div className="text-base font-black text-slate-900 mt-0.5">{selectedListing.currentScore.bulletScore}/100</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Từ khóa Backend</div>
                <div className="text-base font-black text-slate-900 mt-0.5">{selectedListing.currentScore.keywordScore}/100</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Nội dung A+</div>
                <div className="text-base font-black text-slate-900 mt-0.5">{selectedListing.currentScore.contentScore}/100</div>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2.5 border border-emerald-100">
                <div className="text-[10px] text-emerald-800 font-medium">Rủi ro Chính sách</div>
                <div className="text-base font-black text-emerald-700 mt-0.5">{selectedListing.currentScore.complianceRisk}</div>
              </div>
            </div>
          </div>

          {/* TAB 1: SIDE BY SIDE COMPARISON */}
          {activeTab === 'SIDE_BY_SIDE' && (
            <div className="space-y-4">
              {selectedListing.aiOptimizationDraft && (
                <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-blue-900">
                        Bản tối ưu hóa AI V2 đã sẵn sàng ({selectedListing.aiOptimizationDraft.projectedScore}/100 Điểm)
                      </div>
                      <p className="text-xs text-blue-800 mt-0.5">
                        {selectedListing.aiOptimizationDraft.reasoning}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => applyListingDraft(selectedListing.id)}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all shrink-0 disabled:opacity-50"
                  >
                    <Check size={14} />
                    <span>Áp dụng bản AI Draft này</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Column Left: Current Live Amazon US Listing */}
                <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Globe2 size={16} className="text-slate-600" />
                      <h4 className="text-xs font-bold text-slate-900">Listing Hiện tại trên Amazon US (Live)</h4>
                    </div>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600">
                      Score: {selectedListing.currentScore.overall}/100
                    </span>
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      Tiêu đề sản phẩm (Title — {selectedListing.title.length} ký tự)
                    </div>
                    <p className="text-xs font-semibold text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                      {selectedListing.title}
                    </p>
                  </div>

                  {/* 5 Bullets */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      5 Key Feature Bullets
                    </div>
                    <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-700">
                      {selectedListing.bulletPoints.map((bullet, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="font-mono text-slate-400 font-bold shrink-0">{idx + 1}.</span>
                          <span className="leading-relaxed">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Backend Search Terms */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      Backend Generic Keywords ({selectedListing.backendSearchTerms.length}/249 bytes)
                    </div>
                    <p className="text-xs font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {selectedListing.backendSearchTerms}
                    </p>
                  </div>
                </div>

                {/* Column Right: AI Optimized Proposal */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/20 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-blue-600" />
                      <h4 className="text-xs font-bold text-blue-900">Bản đề xuất Tối ưu AI (Optimization Proposal)</h4>
                    </div>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-800">
                      Target Score: {selectedListing.aiOptimizationDraft?.projectedScore || 96}/100
                    </span>
                  </div>

                  {selectedListing.aiOptimizationDraft ? (
                    <>
                      {/* AI Title */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono font-bold uppercase text-blue-600">
                          Tiêu đề Đã Tối ưu (High-Intent Keywords — {selectedListing.aiOptimizationDraft.title.length} ký tự)
                        </div>
                        <p className="text-xs font-semibold text-slate-900 bg-white p-3 rounded-lg border border-blue-200 leading-relaxed shadow-2xs">
                          {selectedListing.aiOptimizationDraft.title}
                        </p>
                      </div>

                      {/* AI Bullets */}
                      <div className="space-y-2">
                        <div className="text-[10px] font-mono font-bold uppercase text-blue-600">
                          5 Key Bullets Tối ưu Chuyển đổi (CVR Focused)
                        </div>
                        <div className="space-y-2 bg-white p-3 rounded-lg border border-blue-200 text-xs text-slate-800 shadow-2xs">
                          {selectedListing.aiOptimizationDraft.bulletPoints.map((bullet, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="font-mono text-blue-600 font-bold shrink-0">{idx + 1}.</span>
                              <span className="leading-relaxed">{bullet}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Backend Keywords */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono font-bold uppercase text-blue-600">
                          Backend Keywords Tối ưu ({selectedListing.aiOptimizationDraft.backendSearchTerms.length}/249 bytes)
                        </div>
                        <p className="text-xs font-mono text-slate-700 bg-white p-2.5 rounded-lg border border-blue-200 shadow-2xs">
                          {selectedListing.aiOptimizationDraft.backendSearchTerms}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400">
                      Chưa có bản nháp AI nào cho sản phẩm này. Bấm nút AI Scan ở góc trên để tạo mới.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCORECARD & COMPETITOR RESEARCH */}
          {activeTab === 'SCORECARD' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Điểm mạnh của Listing Hiện tại (Strengths)
                </h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  {selectedListing.currentScore.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertCircle size={16} className="text-amber-600" />
                  Điểm yếu & Cơ hội Cải thiện (Weaknesses)
                </h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  {selectedListing.currentScore.weaknesses.map((weak, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">!</span>
                      <span>{weak}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: A+ CONTENT BRAND STORY */}
          {activeTab === 'APLUS_CONTENT' && (
            <div className="rounded-xl border border-border bg-white p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900">A+ Enhanced Brand Content Draft (Amazon US)</h4>
                <p className="text-xs text-slate-400">
                  Cấu trúc câu chuyện thương hiệu thủ công Việt Nam (Mekong Delta Single Origin Terroir)
                </p>
              </div>

              {/* A+ Modules Mockup */}
              <div className="space-y-6 max-w-3xl mx-auto border border-slate-200 rounded-xl p-6 bg-slate-50/50">
                {/* Module 1: Header Brand Hero */}
                <div className="rounded-xl overflow-hidden bg-slate-900 text-white p-8 text-center space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400">
                    Direct Trade & Single Origin
                  </span>
                  <h3 className="text-xl font-black">FROM THE HEART OF MEKONG DELTA TO YOUR CUP</h3>
                  <p className="text-xs text-slate-300 max-w-xl mx-auto">
                    Cultivated along the nutrient-rich silt of Ben Tre rivers. Each cocoa pod is hand-selected by multi-generational farming families.
                  </p>
                </div>

                {/* Module 2: 3 Comparison Pillars */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg bg-white p-4 border border-slate-200 space-y-1">
                    <div className="text-base font-black text-blue-600">100% Organic</div>
                    <div className="text-[11px] text-slate-600">USDA & Non-GMO Verified</div>
                  </div>
                  <div className="rounded-lg bg-white p-4 border border-slate-200 space-y-1">
                    <div className="text-base font-black text-blue-600">3 Pure Ingredients</div>
                    <div className="text-[11px] text-slate-600">Zero Palm Oil, Dairy or Soy</div>
                  </div>
                  <div className="rounded-lg bg-white p-4 border border-slate-200 space-y-1">
                    <div className="text-base font-black text-blue-600">Fair Wages</div>
                    <div className="text-[11px] text-slate-600">Supporting 120+ Farmers</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
