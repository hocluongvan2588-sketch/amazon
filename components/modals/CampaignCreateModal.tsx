'use client'

import React, { useState } from 'react'
import { useOutsideClick } from "@/lib/useOutsideClick"
import {
  Megaphone,
  X,
  Target,
  DollarSign,
  Percent,
  Sparkles,
  Layers,
  CheckCircle2,
  Sliders,
  ShieldCheck,
} from 'lucide-react'
import { useAppState } from '@/lib/state-context'

interface CampaignCreateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CampaignCreateModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { createCampaign, selectedClientId, clients, products } = useAppState()

  const [campaignName, setCampaignName] = useState('')
  const [type, setType] = useState<'SPONSORED_PRODUCTS' | 'SPONSORED_BRANDS' | 'SPONSORED_DISPLAY'>('SPONSORED_PRODUCTS')
  const [targetingType, setTargetingType] = useState<'AUTO' | 'MANUAL'>('MANUAL')
  const [dailyBudget, setDailyBudget] = useState<number>(30)
  const [targetAcos, setTargetAcos] = useState<number>(20)
  const [defaultBid, setDefaultBid] = useState<number>(0.85)
  const [strategy, setStrategy] = useState<'DYNAMIC_DOWN_ONLY' | 'DYNAMIC_UP_AND_DOWN' | 'FIXED_BIDS'>('DYNAMIC_DOWN_ONLY')
  const modalRef = useOutsideClick<HTMLDivElement>(onClose)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!campaignName.trim()) return

    createCampaign({
      campaignName,
      type,
      targetingType,
      dailyBudget: Number(dailyBudget),
      targetAcos: Number(targetAcos),
      clientId: selectedClientId || clients[0]?.id || 'client-vina-01',
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div ref={modalRef} className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Megaphone size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-purple-400/20 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-300">
                  AMAZON ADS API V3
                </span>
                <span className="text-xs text-slate-400">Sponsored Ads Creator</span>
              </div>
              <h2 className="text-lg font-bold text-white">Tạo Chiến Dịch Quảng Cáo Mới</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Campaign Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tên Chiến Dịch (Campaign Name) *
            </label>
            <input
              type="text"
              required
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="VD: [SP] - Vinacacao Cocoa Powder - Exact Top 10"
              className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:outline-hidden"
            />
          </div>

          {/* Ad Format & Targeting Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Loại Định Dạng Quảng Cáo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-purple-500 focus:outline-hidden"
              >
                <option value="SPONSORED_PRODUCTS">Sponsored Products (SP)</option>
                <option value="SPONSORED_BRANDS">Sponsored Brands (Video/Store)</option>
                <option value="SPONSORED_DISPLAY">Sponsored Display (Retargeting)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phương Thức Nhắm Mục Tiêu
              </label>
              <select
                value={targetingType}
                onChange={(e) => setTargetingType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-purple-500 focus:outline-hidden"
              >
                <option value="MANUAL">Manual Targeting (Từ khóa tùy chọn)</option>
                <option value="AUTO">Automatic Targeting (AI Discovery)</option>
              </select>
            </div>
          </div>

          {/* Budget & Target ACOS */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ngân Sách Ngày ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
                <input
                  type="number"
                  min="5"
                  step="5"
                  required
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(Number(e.target.value))}
                  className="w-full pl-7 rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold font-mono text-slate-900 focus:border-purple-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target ACOS (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="100"
                  required
                  value={targetAcos}
                  onChange={(e) => setTargetAcos(Number(e.target.value))}
                  className="w-full pr-7 rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold font-mono text-slate-900 focus:border-purple-500 focus:outline-hidden"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Giá Thầu Mặc Định ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
                <input
                  type="number"
                  min="0.1"
                  step="0.05"
                  required
                  value={defaultBid}
                  onChange={(e) => setDefaultBid(Number(e.target.value))}
                  className="w-full pl-7 rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold font-mono text-slate-900 focus:border-purple-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Bidding Strategy Banner */}
          <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-3 text-xs text-purple-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles size={13} className="text-purple-600" />
              <span>Chiến lược đấu thầu AI (Bidding Strategy):</span>
            </div>
            <p className="text-[11px] text-purple-800">
              Mặc định kích hoạt <strong>Dynamic Bids - Down Only</strong> (Tự động giảm thầu khi khả năng chuyển đổi thấp) kết hợp luật <strong>Inventory-Aware PPC Throttling</strong>.
            </p>
          </div>

          {/* Footer CTA */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 px-5 py-2 text-xs font-bold text-white shadow-md hover:from-purple-800 hover:to-indigo-800 transition-all active:scale-[0.98]"
            >
              <CheckCircle2 size={15} />
              <span>Khởi Tạo Chiến Dịch Ngay</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
