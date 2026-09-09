'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAppState } from '@/lib/state-context'
import { Product, ProductDocument, ProductReadinessScore } from '@/lib/types'
import { computeReadiness, computeMarginPct } from '@/lib/readiness-engine'
import { SupabaseDatabaseService } from '@/lib/supabase-service'
import { BarcodeAndLabelPrintModal } from "@/components/modals/BarcodeAndLabelPrintModal"
import { Printer } from "lucide-react"
import {
  AlertCircle,
  AlertOctagon,
  ArrowRight,
  Boxes,
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  Layers,
  Lock,
  Package,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
  Zap,
} from 'lucide-react'

export function ProductManagement() {
  const { filteredProducts, openModal, setActiveTab, harvestedSearchTerms, addProductDocument, selectedClientId, showToast } = useAppState()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(filteredProducts[0] || null)
  const [activeSubTab, setActiveSubTab] = useState<'DETAILS' | 'READINESS' | 'DOCUMENTS' | 'COMPLIANCE'>('READINESS')
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false)
  const [labelModalProduct, setLabelModalProduct] = useState<Product | null>(null)

  // Sprint audit: readiness chấm THẬT từ dữ liệu sản phẩm qua lib/readiness-engine.ts
  // (trước đây hiển thị điểm lưu sẵn 94/89/... trong mock-data — không phải điểm tính toán)
  const searchTermPool = useMemo(
    () => harvestedSearchTerms.map((t) => t.searchTerm),
    [harvestedSearchTerms]
  )
  const scoredById = useMemo(() => {
    const map = new Map<string, ProductReadinessScore>()
    filteredProducts.forEach((p) => map.set(p.id, computeReadiness(p, searchTermPool)))
    return map
  }, [filteredProducts, searchTermPool])
  const selectedScore = selectedProduct
    ? scoredById.get(selectedProduct.id) || computeReadiness(selectedProduct, searchTermPool)
    : null

  // giữ selection luôn hợp lệ khi danh sách thay đổi (hydrate DB / intake / đổi client)
  useEffect(() => {
    if (filteredProducts.length === 0) {
      if (selectedProduct !== null) setSelectedProduct(null)
      return
    }
    if (!selectedProduct || !filteredProducts.some((p) => p.id === selectedProduct.id)) {
      setSelectedProduct(filteredProducts[0])
    }
  }, [filteredProducts, selectedProduct])

  // Upload chứng từ: nhập metadata THẬT từ file người dùng chọn (lưu localStorage).
  // File chưa upload lên cloud storage & chưa OCR — trạng thái UNDER_REVIEW, minh bạch với người dùng.
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadDocType, setUploadDocType] = useState<ProductDocument['type']>('COA')
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedProduct) return
    setUploadingDoc(true)
    const doc: ProductDocument = {
      id: `doc-${Date.now()}`,
      title: file.name.replace(/\.[^.]+$/, ''),
      type: uploadDocType,
      fileUrl: '#',
      fileName: file.name,
      fileSize:
        file.size > 1048576
          ? `${(file.size / 1048576).toFixed(1)} MB`
          : `${Math.max(1, Math.round(file.size / 1024))} KB`,
      uploadDate: new Date().toISOString().slice(0, 10),
      status: 'UNDER_REVIEW',
    }
    // Sprint 4.1: file lên Supabase Storage bucket PRIVATE compliance-docs + row DB
    // (bucket đã tạo bởi migration 20260914; bảng product_documents bởi 20260915)
    const up = await SupabaseDatabaseService.uploadProductDocument(
      selectedClientId || 'client-vina-01',
      selectedProduct.sku,
      doc,
      file
    )
    if (up.ok) {
      showToast('Đã upload chứng từ vào Supabase Storage (private) + ghi DB — trạng thái UNDER_REVIEW.', 'success')
    } else {
      showToast(
        'Chưa upload được lên Storage (cần migration 20260914 + 20260915) — tạm lưu metadata cục bộ.',
        'info'
      )
    }
    // Always reflect in local state (localStorage fallback + instant UI)
    addProductDocument(selectedProduct.id, doc)
    setUploadingDoc(false)
    e.target.value = ''
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Product Catalog & Launch Readiness Engine
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Quản lý Sản phẩm & Launch Amazon US
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Đánh giá toàn diện sản phẩm Việt Nam trước khi đưa lên Amazon US (Intake → Compliance Gate → Readiness Score).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setLabelModalProduct(selectedProduct || filteredProducts[0])
              setIsLabelModalOpen(true)
            }}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all"
          >
            <Printer size={15} className="text-cyan-600" />
            <span>Xuất Nhãn FNSKU & Box ID (PDF)</span>
          </button>
          <button
            onClick={() => openModal('PRODUCT_INTAKE')}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-all"
          >
            <Plus size={15} />
            <span>Tiếp nhận Sản phẩm Mới (Intake)</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Left Product List, Right Product Detail & Readiness Inspector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Col: Product Catalog Selection (4 cols) */}
        <div className="space-y-3 lg:col-span-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700">Danh mục SKU ({filteredProducts.length})</span>
            <span className="text-[11px] font-mono text-slate-400">Chọn để đánh giá</span>
          </div>

          <div className="space-y-2.5">
            {filteredProducts.map((prod) => {
              const isSelected = selectedProduct?.id === prod.id
              const pScore = scoredById.get(prod.id)
              const hasBlockers = (pScore?.blockersCount || 0) > 0

              return (
                <button
                  key={prod.id}
                  onClick={() => setSelectedProduct(prod)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                      : 'border-border bg-white hover:border-slate-300'
                  }`}
                >
                  <img
                    src={prod.mainImage}
                    alt={prod.title}
                    className="h-14 w-14 rounded-lg object-cover border border-slate-200 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] font-bold text-slate-500">{prod.sku}</span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                          prod.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : prod.status === 'READY_FOR_LAUNCH'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {prod.status}
                      </span>
                    </div>

                    <h4 className="font-semibold text-xs text-slate-900 line-clamp-1 mt-0.5">{prod.title}</h4>

                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-900">${prod.price.toFixed(2)}</span>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">Readiness:</span>
                        <span
                          className={`font-mono font-bold text-[11px] ${
                            hasBlockers ? 'text-red-600' : 'text-emerald-600'
                          }`}
                        >
                          {pScore?.overall ?? '—'}/100
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Col: Product Deep Inspector (8 cols) */}
        {selectedProduct ? (
          <div className="space-y-4 lg:col-span-8">
            {/* Top Product Banner Card */}
            <div className="rounded-xl border border-border bg-white p-5 shadow-xs">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start justify-between">
                <div className="flex items-start gap-4">
                  <img
                    src={selectedProduct.mainImage}
                    alt={selectedProduct.title}
                    className="h-20 w-20 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                        {selectedProduct.sku}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600">
                        ASIN: {selectedProduct.asin}
                      </span>
                      <span className="text-xs text-slate-400">• {selectedProduct.category}</span>
                    </div>

                    <h2 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                      {selectedProduct.title}
                    </h2>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span>Thương hiệu: <strong className="text-slate-900">{selectedProduct.brand}</strong></span>
                      <span>Giá bán: <strong className="text-slate-900">${selectedProduct.price.toFixed(2)}</strong></span>
                      <span>Giá vốn xuất xưởng (COGS): <strong className="text-slate-900">${selectedProduct.cogs.toFixed(2)}</strong></span>
                      <span>Biên lợi nhuận ròng: <strong className="text-emerald-600">{computeMarginPct(selectedProduct)}%</strong></span>
                    </div>
                  </div>
                </div>

                {/* Launch Action Button or Block Badge */}
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  {selectedScore?.canLaunch ? (
                    <button
                      onClick={() => setActiveTab('listings')}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all"
                    >
                      <Rocket size={14} />
                      <span>Sẵn sàng Launch Amazon US</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
                      <Lock size={14} />
                      <span>BLOCK LAUNCH ({selectedScore?.blockersCount ?? 0} Blockers)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-tabs inside Inspector */}
              <div className="mt-5 flex border-b border-slate-100 text-xs font-semibold gap-6">
                {[
                  { id: 'READINESS', label: 'Amazon Readiness Score' },
                  { id: 'DOCUMENTS', label: `Hồ sơ & Chứng chỉ (${selectedProduct.documents.length})` },
                  { id: 'COMPLIANCE', label: `Đánh giá Pháp lý & FDA (${selectedProduct.complianceIssues.length})` },
                  { id: 'DETAILS', label: 'Thông số Kỹ thuật & Kích thước' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id as any)}
                    className={`pb-2.5 transition-colors ${
                      activeSubTab === tab.id
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT: READINESS SCORE */}
            {activeSubTab === 'READINESS' && (
              <div className="space-y-4">
                {/* Readiness Breakdown Scorecard */}
                <div className="rounded-xl border border-border bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Điểm Đánh giá Sẵn sàng (Amazon Readiness)</h3>
                      <p className="text-xs text-slate-400">
                        Engine chấm 7 tiêu chí TRỰC TIẾP từ dữ liệu sản phẩm (title, ảnh, chi phí, chứng từ, pháp lý,
                        keyword harvest) — không dùng điểm lưu sẵn
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black font-mono text-slate-900">
                        {selectedScore?.overall ?? '—'}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">/ 100 Điểm</span>
                    </div>
                  </div>

                  {/* 7 Component Progress Bars */}
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      { label: '1. Thông tin sản phẩm (Product Specs)', score: selectedScore?.productInfo ?? 0 },
                      { label: '2. Chất lượng Listing (Listing Quality)', score: selectedScore?.listingQuality ?? 0 },
                      { label: '3. Hình ảnh & Media Assets', score: selectedScore?.mediaAssets ?? 0 },
                      { label: '4. Độ phủ Từ khóa (Keyword Coverage)', score: selectedScore?.keywordCoverage ?? 0 },
                      { label: '5. Giá bán & Cạnh tranh (Pricing)', score: selectedScore?.pricingCompetitiveness ?? 0 },
                      { label: '6. Tuân thủ Pháp lý (Compliance)', score: selectedScore?.complianceScore ?? 0 },
                      { label: '7. Hồ sơ Chứng từ (Documentation)', score: selectedScore?.documentationScore ?? 0 },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">{item.label}</span>
                          <span className="font-mono font-bold text-slate-900">{item.score}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full transition-all ${
                              item.score >= 85
                                ? 'bg-emerald-500'
                                : item.score >= 70
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations & Blockers List */}
                  <div className="mt-5 rounded-lg bg-slate-50 p-4 border border-slate-100 space-y-2">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-blue-600" />
                      Khuyến nghị tự động — sinh từ khoảng trống dữ liệu thật của sản phẩm:
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {(selectedScore?.recommendations || []).map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DOCUMENTS */}
            {activeSubTab === 'DOCUMENTS' && (
              <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Hồ sơ Pháp lý & Chứng nhận Xuất xứ</h3>
                    <p className="text-xs text-slate-400">
                      Nhập liệu thủ công — AI OCR Extractor (Section 28) CHƯA kết nối dịch vụ (lộ trình Giai đoạn 4);
                      chứng từ mới sẽ ở trạng thái UNDER_REVIEW
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={uploadDocType}
                      onChange={(e) => setUploadDocType(e.target.value as ProductDocument['type'])}
                      className="rounded-lg border border-border bg-white px-2 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      <option value="COA">COA (Kiểm nghiệm)</option>
                      <option value="FDA_REGISTRATION">FDA Registration</option>
                      <option value="LABEL_SPEC">Label Spec</option>
                      <option value="USDA_ORGANIC">USDA Organic</option>
                      <option value="SAFETY_DATA">Safety Data Sheet</option>
                      <option value="PHYTOSANITARY">Phytosanitary</option>
                      <option value="FACTORY_AUDIT">Factory Audit</option>
                    </select>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingDoc}
                      className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <Upload size={13} className={uploadingDoc ? 'animate-pulse' : ''} />
                      <span>{uploadingDoc ? 'Đang upload...' : 'Tải lên chứng từ mới'}</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={handleDocUpload}
                    />
                  </div>
                </div>

                {selectedProduct.documents.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    Chưa có tài liệu nào được tải lên cho sản phẩm này.
                    <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block text-left">
                      Lưu ý vận hành: chứng từ hiện lưu metadata cục bộ (localStorage) và chưa qua OCR.
                      Lưu trữ đám mây + trích xuất tự động thuộc Giai đoạn 4 (Supabase Storage).
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedProduct.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="rounded-xl border border-border bg-slate-50/50 p-4 transition-all hover:bg-white hover:border-slate-300"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 shrink-0">
                              <FileCheck2 size={20} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-900">{doc.title}</h4>
                                <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                                  {doc.status}
                                </span>
                              </div>
                              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                                {doc.fileName} • {doc.fileSize} • Ngày tải lên: {doc.uploadDate}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Extracted Data Preview by AI */}
                        {doc.extractedData && (
                          <div className="mt-3 rounded-lg bg-white p-3 border border-slate-200 text-xs space-y-1">
                            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                              <Sparkles size={11} /> Dữ liệu AI trích xuất tự động:
                            </div>
                            {doc.extractedData.manufacturer && (
                              <div>Cơ sở sản xuất: <strong>{doc.extractedData.manufacturer}</strong></div>
                            )}
                            {doc.extractedData.certNumber && (
                              <div>Mã đăng ký FDA: <strong>{doc.extractedData.certNumber}</strong></div>
                            )}
                            {doc.extractedData.ingredients && (
                              <div>Thành phần: <strong>{doc.extractedData.ingredients.join(', ')}</strong></div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: COMPLIANCE */}
            {activeSubTab === 'COMPLIANCE' && (
              <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">AI Compliance Gatekeeper</h3>
                  <p className="text-xs text-slate-400">
                    Kiểm tra các rủi ro vi phạm chính sách FDA, Prop 65, Labeling và Hải quan Hoa Kỳ.
                  </p>
                </div>

                {selectedProduct.complianceIssues.length === 0 ? (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-emerald-900 text-xs">
                    <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold">Không phát hiện rủi ro pháp lý</div>
                      <div className="text-[11px] text-emerald-700 mt-0.5">
                        Sản phẩm đã vượt qua tất cả bài kiểm tra tuân thủ tiêu chuẩn Amazon US Food & Beverage.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedProduct.complianceIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="rounded-xl border border-red-200 bg-red-50/50 p-4 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-bold text-red-700">
                            <ShieldAlert size={15} />
                            {issue.title}
                          </span>
                          <span className="rounded bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-800">
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-slate-700">{issue.description}</p>
                        <div className="rounded-lg bg-white p-2.5 border border-red-100 text-slate-800">
                          <strong className="text-red-900">Giải pháp khắc phục: </strong>
                          <span>{issue.remedy}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: DETAILS */}
            {activeSubTab === 'DETAILS' && (
              <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Thông số Kỹ thuật Vận hành & FBA Tier</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 text-xs">
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <div className="text-slate-400 text-[10px]">Trọng lượng (Weight)</div>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedProduct.weightLbs} lbs</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <div className="text-slate-400 text-[10px]">Kích thước đóng gói</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {selectedProduct.dimensionsInches.length} x {selectedProduct.dimensionsInches.width} x {selectedProduct.dimensionsInches.height} in
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <div className="text-slate-400 text-[10px]">Phí Amazon FBA ước tính</div>
                    <div className="font-bold text-slate-900 mt-0.5">${selectedProduct.fbaFeeEstimated.toFixed(2)}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <div className="text-slate-400 text-[10px]">Phí Hoa hồng Amazon (Referral)</div>
                    <div className="font-bold text-slate-900 mt-0.5">${selectedProduct.referralFeeEstimated.toFixed(2)} (15%)</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <div className="text-slate-400 text-[10px]">Mã UPC / EAN</div>
                    <div className="font-bold font-mono text-slate-900 mt-0.5">{selectedProduct.upc}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-slate-400 text-[10px]">Mã FNSKU Amazon</div>
                      <div className="font-bold font-mono text-slate-900 mt-0.5">{selectedProduct.fnsku}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLabelModalProduct(selectedProduct)
                        setIsLabelModalOpen(true)
                      }}
                      className="flex items-center gap-1 rounded bg-cyan-50 px-2 py-1 text-[11px] font-bold text-cyan-700 hover:bg-cyan-100 transition-colors"
                      title="In nhãn FNSKU Barcode & Box Label PDF"
                    >
                      <Printer size={12} />
                      <span>In Nhãn PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
      {/* Barcode & Label Print Modal */}
      <BarcodeAndLabelPrintModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        product={labelModalProduct}
        allProducts={filteredProducts}
      />
    </div>
  )
}
