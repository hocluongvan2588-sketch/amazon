'use client'

import React, { useState } from 'react'
import { useOutsideClick } from '@/lib/useOutsideClick'
import { InventoryItem } from '@/lib/types'
import { calculateCbm } from '@/lib/logistics-engine'
import {
  AlertCircle,
  Boxes,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck2,
  HelpCircle,
  MapPin,
  Package,
  QrCode,
  Send,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
} from 'lucide-react'

interface SupplierReadyConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  item: InventoryItem | null
  onConfirm: (data: {
    inventoryItemId: string
    sku: string
    readyQty: number
    cargoReadyDate: string
    factoryAddress: string
    notes: string
    cbmEst: number
    cartonsCount: number
  }) => void
}

export function SupplierReadyConfirmationModal({
  isOpen,
  onClose,
  item,
  onConfirm,
}: SupplierReadyConfirmationModalProps) {
  const modalRef = useOutsideClick<HTMLDivElement>(onClose, isOpen)

  const [unitsPerBox, setUnitsPerBox] = useState<number>(24)
  const [totalUnits, setTotalUnits] = useState<number>(item?.recommendedReorderQty || 1200)
  const [cargoReadyDate, setCargoReadyDate] = useState<string>(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0] // 3 days from now
  )
  const [factoryAddress, setFactoryAddress] = useState<string>(
    'Khu Công Nghiệp Giao Long, Huyện Châu Thành, Tỉnh Bến Tre'
  )
  const [cartonLengthCm, setCartonLengthCm] = useState<number>(45)
  const [cartonWidthCm, setCartonWidthCm] = useState<number>(35)
  const [cartonHeightCm, setCartonHeightCm] = useState<number>(28)
  const [hasFNSKULabel, setHasFNSKULabel] = useState<boolean>(true)
  const [hasPalletISPM15, setHasPalletISPM15] = useState<boolean>(true)
  const [hasCOACertificate, setHasCOACertificate] = useState<boolean>(true)
  const [notes, setNotes] = useState<string>('Hàng đã đóng thùng carton 5 lớp, dán sẵn tem barcode FNSKU lên từng hộp.')

  if (!isOpen || !item) return null

  const cartonsCount = Math.ceil(totalUnits / unitsPerBox)
  const cbmEst = calculateCbm(cartonLengthCm, cartonWidthCm, cartonHeightCm, cartonsCount)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm({
      inventoryItemId: item.id,
      sku: item.sku,
      readyQty: totalUnits,
      cargoReadyDate,
      factoryAddress,
      notes: `${notes} • ${hasFNSKULabel ? 'Đã dán FNSKU' : 'Chưa FNSKU'} • ${hasPalletISPM15 ? 'Pallet hun trùng ISPM-15' : ''}`,
      cbmEst,
      cartonsCount,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Package size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-teal-400/20 px-2 py-0.5 font-mono text-[10px] font-bold text-teal-300">
                  PHIẾU XÁC NHẬN XUẤT XƯỞNG
                </span>
                <span className="text-xs text-slate-300">Báo Hàng Cho Đội Ngũ Kho Vexim</span>
              </div>
              <h2 className="text-lg font-bold text-white">Xác Nhận Lô Hàng Sẵn Sàng Tại Nhà Máy</h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* 1. Product Summary Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Sản phẩm cần bổ sung tồn kho:
                </span>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-1">
                  <span>SKU: <strong className="text-slate-800">{item.sku}</strong></span>
                  <span>&bull;</span>
                  <span>ASIN: <strong className="text-slate-800">{item.asin}</strong></span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-red-600 block font-bold">Tồn FBA Hiện Tại</span>
                <span className="text-lg font-black text-red-600">{item.fbaAvailable} units</span>
                <span className="text-[10px] text-slate-400 block font-mono">Còn {item.daysOfSupply.toFixed(1)} ngày bán</span>
              </div>
            </div>
          </div>

          {/* 2. Quantity & Carton Specification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Số Lượng Hàng Đóng Gói (Units) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={totalUnits}
                  onChange={(e) => setTotalUnits(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-bold font-mono text-slate-900 focus:border-teal-500 focus:outline-hidden"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">hộp / sp</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Đề xuất AI: <strong>+{item.recommendedReorderQty} units</strong> (đủ bán trong 60 ngày tiếp theo).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ngày Hàng Đóng Xong (Ready Date - CRD) *
              </label>
              <input
                type="date"
                required
                value={cargoReadyDate}
                onChange={(e) => setCargoReadyDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold font-mono text-slate-900 focus:border-teal-500 focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Vexim sẽ căn cứ ngày này để điều xe tải và book chỗ trên tàu biển.
              </p>
            </div>
          </div>

          {/* 3. Packaging & Volume Estimation */}
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3.5 space-y-3">
            <div className="text-xs font-bold text-teal-950 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Boxes size={14} className="text-teal-700" />
                Quy Cách Đóng Thùng & Thể Tích Tính Cước (CBM):
              </span>
              <span className="font-mono text-xs font-black text-teal-900">
                {cartonsCount} Thùng ~ {cbmEst} m³
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-medium">Số sp / Thùng</span>
                <input
                  type="number"
                  value={unitsPerBox}
                  onChange={(e) => setUnitsPerBox(Math.max(1, Number(e.target.value)))}
                  className="w-full mt-0.5 rounded-lg border border-slate-300 p-1.5 text-xs font-mono font-bold bg-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium">Dài (cm)</span>
                <input
                  type="number"
                  value={cartonLengthCm}
                  onChange={(e) => setCartonLengthCm(Number(e.target.value))}
                  className="w-full mt-0.5 rounded-lg border border-slate-300 p-1.5 text-xs font-mono font-bold bg-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium">Rộng (cm)</span>
                <input
                  type="number"
                  value={cartonWidthCm}
                  onChange={(e) => setCartonWidthCm(Number(e.target.value))}
                  className="w-full mt-0.5 rounded-lg border border-slate-300 p-1.5 text-xs font-mono font-bold bg-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium">Cao (cm)</span>
                <input
                  type="number"
                  value={cartonHeightCm}
                  onChange={(e) => setCartonHeightCm(Number(e.target.value))}
                  className="w-full mt-0.5 rounded-lg border border-slate-300 p-1.5 text-xs font-mono font-bold bg-white"
                />
              </div>
            </div>
          </div>

          {/* 4. Factory Pickup Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Địa Chỉ Xưởng Lấy Hàng Tại Việt Nam *
            </label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={factoryAddress}
                onChange={(e) => setFactoryAddress(e.target.value)}
                className="w-full pl-8 rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 5. Quality & Packaging Checklist */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Cam Kết Tiêu Chuẩn Xuất Khẩu Mỹ (Checklist):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasFNSKULabel}
                  onChange={(e) => setHasFNSKULabel(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-[11px] font-medium text-slate-700">Đã dán tem FNSKU Barcode</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPalletISPM15}
                  onChange={(e) => setHasPalletISPM15(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-[11px] font-medium text-slate-700">Pallet Gỗ Hun Trùng ISPM-15</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasCOACertificate}
                  onChange={(e) => setHasCOACertificate(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-[11px] font-medium text-slate-700">COA Vi Sinh Phòng Lab Đạt Chuẩn</span>
              </label>
            </div>
          </div>

          {/* 6. Notes for Vexim Logistics Team */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ghi Chú Cho Đội Ngũ Kho Vexim:</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ví dụ: Hàng có thể xếp dỡ từ 8h sáng ngày 12/09, liên hệ quản đốc xưởng qua SĐT..."
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800"
            />
          </div>

          {/* Footer CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>Thông tin sẽ được mã hóa và chuyển ngay tới Trưởng phòng Logistics Vexim.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Hủy
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-teal-800 hover:to-emerald-800 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Send size={14} />
                <span>Xác Nhận & Gửi Tới Trưởng Kho Vexim</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
