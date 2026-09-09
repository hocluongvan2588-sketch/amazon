'use client'

import React from 'react'

import { utf8ByteLength } from '@/lib/listing-quality'
import { ListingIntelligencePanel } from './ListingIntelligencePanel'
import { useAppState } from '@/lib/state-context'
import { ListingData } from '@/lib/types'
import { SupabaseDatabaseService } from '@/lib/supabase-service'
import { useEffect, useRef, useState } from 'react'
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

/** Đếm đúng UTF-8 bytes (fix bug cũ: .length đếm ký tự — sai với Unicode/tiếng Việt) */
function backendSearchTermsBytes(text: string): number {
  return utf8ByteLength(text || '')
}

export function ListingManagement() {
  const { filteredListings, applyListingDraft, rescoreListing, saveListingEdits, pushListingToAmazon, products, selectedClientId, showToast } = useAppState()
  const [selectedListing, setSelectedListing] = useState<ListingData>(filteredListings[0] || null)
  const [activeTab, setActiveTab] = useState<'SIDE_BY_SIDE' | 'SCORECARD' | 'APLUS_CONTENT' | 'EDITOR'>('SIDE_BY_SIDE')

  // ================= GIAI ĐOẠN 4: LISTING EDITOR =================
  // Soạn thảo THẬT: title/bullets/description/backend keywords/A+ modules;
  // ảnh upload Supabase Storage; lưu DB (amazon_listings); đẩy PATCH lên Seller Central.
  const [editorTitle, setEditorTitle] = useState('')
  const [editorBullets, setEditorBullets] = useState<string[]>([])
  const [editorDescription, setEditorDescription] = useState('')
  const [editorKeywords, setEditorKeywords] = useState('')
  const [editorPrice, setEditorPrice] = useState('0')
  const [editorImages, setEditorImages] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pushing, setPushing] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const editorLoadedForRef = useRef<string | null>(null)

  // Nạp nội dung listing đang chọn vào editor (mỗi listing chỉ nạp 1 lần)
  useEffect(() => {
    if (!selectedListing || editorLoadedForRef.current === selectedListing.id) return
    editorLoadedForRef.current = selectedListing.id
    setEditorTitle(selectedListing.title || '')
    setEditorBullets(selectedListing.bulletPoints?.length ? [...selectedListing.bulletPoints] : [''])
    setEditorDescription(selectedListing.description || '')
    setEditorKeywords(selectedListing.backendSearchTerms || '')
    setEditorPrice(String(selectedListing.price || 0))
    const prod = products.find((pr) => pr.id === selectedListing.productId || pr.sku === selectedListing.sku)
    setEditorImages(
      prod
        ? [prod.mainImage, ...(prod.galleryImages || [])].filter(Boolean)
        : []
    )
  }, [selectedListing, products])

  const editorBackendBytes = utf8ByteLength(editorKeywords)
  const handleEditorUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedListing) return
    setUploadingImage(true)
    const res = await SupabaseDatabaseService.uploadListingImage(
      selectedClientId || 'client-vina-01',
      selectedListing.sku,
      file
    )
    if (res) {
      setEditorImages((prev) => [...prev, res.url])
      showToast(`Đã upload ảnh lên Supabase Storage (${Math.round(file.size / 1024)} KB).`, 'success')
    } else {
      showToast('Upload thất bại — cần cấu hình Supabase và chạy migration 20260914 (bucket product-images).', 'error')
    }
    setUploadingImage(false)
    e.target.value = ''
  }
  const handleEditorSave = async () => {
    if (!selectedListing) return
    setSaving(true)
    await saveListingEdits({
      ...selectedListing,
      title: editorTitle,
      bulletPoints: editorBullets.filter((b) => b.trim()),
      description: editorDescription,
      backendSearchTerms: editorKeywords,
      price: Number(editorPrice) || selectedListing.price,
    })
    setSaving(false)
  }
  const handleEditorPush = async () => {
    if (!selectedListing) return
    setPushing(true)
    await pushListingToAmazon(
      {
        ...selectedListing,
        title: editorTitle,
        bulletPoints: editorBullets.filter((b) => b.trim()),
        description: editorDescription,
        backendSearchTerms: editorKeywords,
        price: Number(editorPrice) || selectedListing.price,
      },
      editorImages[0]
    )
    setPushing(false)
  }

  return (
    <div className="space-y-6">
      {/* Sprint 3.2 — Listing Quality Score + Keyword Gap */}
      <ListingIntelligencePanel />
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
            onClick={() => selectedListing && rescoreListing(selectedListing.id)}
            title="Chấm lại điểm bằng listing-quality engine từ nội dung hiện có"
            className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Sparkles size={14} />
            <span>Chấm lại điểm (Engine nội bộ)</span>
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
                  { id: 'EDITOR', label: '✎ Editor & Đẩy lên Amazon' },
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
                      Backend Generic Keywords ({backendSearchTermsBytes(selectedListing.backendSearchTerms)}/249 bytes)
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
                          Backend Keywords Tối ưu ({backendSearchTermsBytes(selectedListing.aiOptimizationDraft.backendSearchTerms)}/249 bytes)
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
            {/* TAB 4: EDITOR & PUSH (GIAI ĐOẠN 4) */}
            {activeTab === 'EDITOR' && (
              <div className="space-y-4">
                <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-xs text-blue-900">
                  <Zap size={15} className="mt-0.5 shrink-0 text-blue-600" />
                  <div>
                    <strong>Editor trực tiếp:</strong> sửa nội dung bên dưới → <em>Lưu &amp; chấm điểm</em> ghi vào
                    bảng <code className="font-mono">amazon_listings</code> (Supabase) thay localStorage;{' '}
                    <em>Đẩy PATCH</em> gửi JSON-PATCH thật tới SP-API Listings Items khi đã cấu hình credentials
                    (thiếu credentials = MÔ PHỎNG, có báo rõ). Ảnh upload vào bucket <code className="font-mono">product-images</code>.
                    <div className="mt-1 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                      Lưu ý: A+ Content không đẩy qua PATCH này — Amazon yêu cầu A+ Content Publishing API riêng (lộ trình tiếp theo).
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="rounded-xl border border-border bg-white p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">Tiêu đề (Title)</span>
                    <span className={`font-mono text-[11px] ${editorTitle.length > 200 ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
                      {editorTitle.length}/200 ký tự (Amazon grocery khuyến nghị 80–200)
                    </span>
                  </div>
                  <textarea
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                {/* Bullets */}
                <div className="rounded-xl border border-border bg-white p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">5 Bullet Points</span>
                    <span className={`font-mono text-[11px] ${editorBullets.filter((b) => b.trim()).length > 5 ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
                      {editorBullets.filter((b) => b.trim()).length}/5 (Amazon tối đa 5)
                    </span>
                  </div>
                  {editorBullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-2 font-mono text-[10px] text-slate-400 w-4 shrink-0">{i + 1}.</span>
                      <textarea
                        value={b}
                        onChange={(e) => setEditorBullets((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
                        rows={2}
                        maxLength={500}
                        className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                      <button
                        onClick={() => setEditorBullets((prev) => prev.filter((_, j) => j !== i))}
                        className="mt-1 text-slate-300 hover:text-red-500"
                        title="Xóa bullet"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setEditorBullets((prev) => [...prev, ''])}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    + Thêm bullet
                  </button>
                </div>

                {/* Description */}
                <div className="rounded-xl border border-border bg-white p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">Mô tả sản phẩm (Product Description)</span>
                    <span className="font-mono text-[11px] text-slate-400">{editorDescription.length} ký tự</span>
                  </div>
                  <textarea
                    value={editorDescription}
                    onChange={(e) => setEditorDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                {/* Backend keywords + Price */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-white p-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">Từ khóa Backend</span>
                      <span className={`font-mono text-[11px] ${editorBackendBytes > 249 ? 'text-red-600 font-bold' : 'text-emerald-600'}`}>
                        {editorBackendBytes}/249 bytes UTF-8
                      </span>
                    </div>
                    <textarea
                      value={editorKeywords}
                      onChange={(e) => setEditorKeywords(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    <p className="text-[10px] text-slate-400">Hạn ngạch Amazon tính bằng BYTES — tiếng Việt có dấu tốn 2–3 bytes/ký tự.</p>
                  </div>
                  <div className="rounded-xl border border-border bg-white p-4 space-y-1.5">
                    <span className="text-xs font-bold text-slate-900">Giá bán (USD)</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editorPrice}
                      onChange={(e) => setEditorPrice(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    <p className="text-[10px] text-slate-400">Đẩy qua attribute purchasable_offer (marketplace US).</p>
                  </div>
                </div>

                {/* Images */}
                <div className="rounded-xl border border-border bg-white p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Ảnh Listing ({editorImages.length}) — ảnh 1 = MAIN cho PATCH</span>
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                    >
                      {uploadingImage ? 'Đang upload...' : 'Upload ảnh (Supabase Storage)'}
                    </button>
                    <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleEditorUploadImage} />
                  </div>
                  {editorImages.length === 0 ? (
                    <p className="py-4 text-center text-xs text-slate-400">Chưa có ảnh — upload JPEG/PNG/WebP ≤10MB.</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                      {editorImages.map((url, i) => (
                        <div key={url + i} className="group relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`anh-${i + 1}`} className="h-16 w-full rounded-lg border border-slate-200 object-cover" />
                          <span className="absolute left-1 top-1 rounded bg-slate-900/70 px-1 text-[9px] font-bold text-white">
                            {i === 0 ? 'MAIN' : i + 1}
                          </span>
                          {i > 0 && (
                            <button
                              onClick={() => setEditorImages((prev) => prev.filter((_, j) => j !== i))}
                              className="absolute right-0.5 top-0.5 hidden rounded bg-white/90 px-1 text-[10px] font-bold text-red-600 group-hover:block"
                              title="Gỡ ảnh khỏi danh sách"
                            >
                              ×
                            </button>
                          )}
                          {i > 0 && (
                            <button
                              onClick={() => setEditorImages((prev) => [prev[i], ...prev.filter((_, j) => j !== i)])}
                              className="absolute bottom-0.5 left-0.5 hidden rounded bg-white/90 px-1 text-[9px] font-bold text-blue-700 group-hover:block"
                              title="Đặt làm MAIN"
                            >
                              MAIN
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button
                    onClick={handleEditorSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} />
                    <span>{saving ? 'Đang lưu...' : 'Lưu & chấm điểm (DB)'}</span>
                  </button>
                  <button
                    onClick={handleEditorPush}
                    disabled={pushing}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Upload size={14} />
                    <span>{pushing ? 'Đang đẩy...' : 'Đẩy PATCH lên Seller Central'}</span>
                  </button>
                  <span className="text-[11px] text-slate-400">
                    PATCH ghi đè title/bullets/description/keywords/ảnh/giá trên Amazon US (SKU {selectedListing?.sku}).
                  </span>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  )
}
