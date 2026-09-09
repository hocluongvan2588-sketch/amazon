'use client'

import React, { useState } from 'react'
import { useOutsideClick } from "@/lib/useOutsideClick"
import { useAppState } from '@/lib/state-context'
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  FileCheck2,
  Lock,
  Package,
  Rocket,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'

export function ProductIntakeModal() {
  const { activeModal, closeModal, addProduct, selectedClientId, clients } = useAppState()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Form State
  const [title, setTitle] = useState('')
  const [brand, setBrand] = useState(clients.find((c) => c.id === selectedClientId)?.name || 'Vinacacao')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState('Grocery & Gourmet Food')
  const [price, setPrice] = useState('21.99')
  const [cogs, setCogs] = useState('5.50')
  const [weightLbs, setWeightLbs] = useState('0.85')
  const [dimensions, setDimensions] = useState({ length: '7.5', width: '4.0', height: '2.0' })
  const [uploadedDocName, setUploadedDocName] = useState('FDA_Facility_Registration_2026.pdf')
  const modalRef = useOutsideClick<HTMLDivElement>(closeModal)

  if (activeModal?.type !== 'PRODUCT_INTAKE') return null

  const handleFinish = () => {
    addProduct({
      title: title || 'Sản phẩm mới xuất khẩu US',
      brand: brand || 'Vexim Supplier',
      sku: sku || `VXM-NEW-${Math.floor(100 + Math.random() * 900)}`,
      category,
      price: parseFloat(price) || 21.99,
      cogs: parseFloat(cogs) || 5.5,
      weightLbs: parseFloat(weightLbs) || 0.85,
      dimensionsInches: {
        length: parseFloat(dimensions.length) || 7.5,
        width: parseFloat(dimensions.width) || 4.0,
        height: parseFloat(dimensions.height) || 2.0,
      },
    })
    closeModal()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div ref={modalRef} className="relative w-full max-w-xl rounded-2xl border border-border bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">
              Quy trình Tiếp nhận Sản phẩm (Section 26 - Launch Module)
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Tiếp nhận Sản phẩm Việt Nam lên Amazon US
            </h3>
          </div>
          <button
            onClick={closeModal}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 border-b border-slate-100 pb-3">
          <span className={step === 1 ? 'text-blue-600 font-bold' : ''}>1. Thông tin cơ bản</span>
          <span>→</span>
          <span className={step === 2 ? 'text-blue-600 font-bold' : ''}>2. Kích thước & COGS</span>
          <span>→</span>
          <span className={step === 3 ? 'text-blue-600 font-bold' : ''}>3. Chứng từ FDA / COA</span>
          <span>→</span>
          <span className={step === 4 ? 'text-blue-600 font-bold' : ''}>4. Đánh giá Readiness</span>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">Tên sản phẩm (Title):</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Bột Cacao Nguyên Chất Đắk Lắk 500g..."
                className="w-full rounded-lg border border-border p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">Thương hiệu (Brand):</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full rounded-lg border border-border p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-800 block mb-1">Mã SKU dự kiến:</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="VXM-DAKLAK-500"
                  className="w-full rounded-lg border border-border p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">Ngành hàng Amazon US (Category):</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-border p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Grocery & Gourmet Food</option>
                <option>Home & Kitchen / Aromatherapy</option>
                <option>Kitchen & Dining / Eco Home</option>
                <option>Health & Household</option>
                <option>Beauty & Personal Care</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">Giá bán Amazon US ($):</label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-lg border border-border p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-800 block mb-1">Giá vốn xưởng VN (COGS $):</label>
                <input
                  type="text"
                  value={cogs}
                  onChange={(e) => setCogs(e.target.value)}
                  className="w-full rounded-lg border border-border p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">Trọng lượng (lbs):</label>
              <input
                type="text"
                value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                className="w-full rounded-lg border border-border p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">Kích thước Dài x Rộng x Cao (inches):</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Dài (in)"
                  value={dimensions.length}
                  onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })}
                  className="rounded-lg border border-border p-2 text-xs text-slate-800"
                />
                <input
                  type="text"
                  placeholder="Rộng (in)"
                  value={dimensions.width}
                  onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
                  className="rounded-lg border border-border p-2 text-xs text-slate-800"
                />
                <input
                  type="text"
                  placeholder="Cao (in)"
                  value={dimensions.height}
                  onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
                  className="rounded-lg border border-border p-2 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-3 text-xs">
            <div className="rounded-xl border border-dashed border-blue-300 bg-blue-50/40 p-6 text-center space-y-2">
              <Upload size={24} className="mx-auto text-blue-600" />
              <div className="font-bold text-slate-800">Tải lên hồ sơ chứng nhận chất lượng</div>
              <p className="text-[11px] text-slate-500">
                FDA Food Facility Registration, COA Heavy Metals, USDA Organic, Label Spec PDF
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 size={16} className="text-emerald-600" />
                <span className="font-mono text-[11px] text-slate-700">{uploadedDocName}</span>
              </div>
              <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                OCR Verified
              </span>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-3 text-xs">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900">Amazon Readiness Score:</span>
                <span className="font-mono text-xl font-black text-emerald-800">84 / 100</span>
              </div>
              <div className="text-[11px] text-emerald-800">
                ✓ Đã xác thực cơ sở đăng ký FDA 2026.
                <br />
                ✓ Biên lợi nhuận dự kiến &gt; 42% đạt chuẩn scale trên Amazon US.
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Quay lại
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep((step + 1) as any)}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
            >
              <span>Tiếp tục</span>
              <ArrowRight size={13} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              <Check size={14} />
              <span>Xác nhận & Chuyển vào Hàng đợi Vận hành</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
