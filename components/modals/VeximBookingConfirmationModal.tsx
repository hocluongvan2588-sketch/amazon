'use client'

import React, { useState } from 'react'
import { useOutsideClick } from '@/lib/useOutsideClick'
import { InventoryItem, FreightRateCard } from '@/lib/types'
import { DEFAULT_RATE_CARDS } from '@/lib/logistics-engine'
import {
  AlertCircle,
  Anchor,
  Boxes,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  HelpCircle,
  MapPin,
  Navigation,
  Package,
  Phone,
  QrCode,
  Send,
  ShieldCheck,
  Ship,
  Sparkles,
  Truck,
  User,
  X,
} from 'lucide-react'

interface VeximBookingConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  item: InventoryItem | null
  rateCards?: FreightRateCard[]
  onConfirm: (data: {
    inventoryItemId: string
    sku: string
    carrierName: string
    billOfLadingNumber: string
    fbaShipmentId: string
    pickupDateTime: string
    driverInfo: string
    licensePlate: string
    etdPort: string
    etaFba: string
  }) => void
}

export function VeximBookingConfirmationModal({
  isOpen,
  onClose,
  item,
  rateCards,
  onConfirm,
}: VeximBookingConfirmationModalProps) {
  const modalRef = useOutsideClick<HTMLDivElement>(onClose, isOpen)

  const carrierOptions: FreightRateCard[] = rateCards && rateCards.length > 0 ? rateCards : DEFAULT_RATE_CARDS

  const [carrierName, setCarrierName] = useState<string>('Kerry / Flexport Ocean LCL')
  const [billOfLadingNumber, setBillOfLadingNumber] = useState<string>('KRY-VNM-LAX-8801')
  const [fbaShipmentId, setFbaShipmentId] = useState<string>('FBA18VEXIM0902')
  const [pickupDateTime, setPickupDateTime] = useState<string>('2026-09-12 08:30 Sáng')
  const [driverInfo, setDriverInfo] = useState<string>('Nguyễn Văn Long (SĐT: 0918.234.567)')
  const [licensePlate, setLicensePlate] = useState<string>('Xe tải 5 tấn: 51C-882.19')
  const [etdPort, setEtdPort] = useState<string>('Cát Lái (HCMC) - 15/09/2026')
  const [etaFba, setEtaFba] = useState<string>('Kho ONT8 (California) - 08/10/2026')

  if (!isOpen || !item) return null

  const readyQty = item.supplierReadyQty || item.recommendedReorderQty || 1200
  const readyDate = item.supplierReadyDate || '12/09/2026'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm({
      inventoryItemId: item.id,
      sku: item.sku,
      carrierName,
      billOfLadingNumber,
      fbaShipmentId,
      pickupDateTime,
      driverInfo,
      licensePlate,
      etdPort,
      etaFba,
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
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Ship size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-cyan-400/20 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
                  VEXIM LOGISTICS DESK
                </span>
                <span className="text-xs text-slate-300">Xác Nhận Booking & Điều Xe Lấy Hàng</span>
              </div>
              <h2 className="text-lg font-bold text-white">Phê Duyệt Lệnh Xuất Hàng Cho Nhà Máy</h2>
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
          {/* 1. Factory Submission Information Received */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 font-mono flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-blue-600" />
                Thông tin xưởng đã báo sẵn sàng:
              </span>
              <span className="rounded bg-blue-200/80 px-2 py-0.5 text-[10px] font-bold text-blue-900 font-mono">
                CRD: {readyDate}
              </span>
            </div>

            <div className="text-xs text-slate-800 space-y-1 pt-1">
              <div className="font-bold text-sm text-slate-900">{item.title}</div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600 text-[11px]">
                <span>Mã SKU: <strong className="text-slate-900 font-mono">{item.sku}</strong></span>
                <span>&bull;</span>
                <span>Số lượng xưởng đóng gói: <strong className="text-blue-700 font-bold">+{readyQty.toLocaleString()} units</strong></span>
                <span>&bull;</span>
                <span>Tồn kho FBA: <strong className="text-red-600">{item.fbaAvailable} units</strong> (Còn {item.daysOfSupply.toFixed(1)} ngày)</span>
              </div>
              {item.supplierReadyNotes && (
                <div className="text-[11px] text-slate-600 italic bg-white/70 p-2 rounded-lg border border-blue-100 mt-1">
                  &ldquo;{item.supplierReadyNotes}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* 2. Carrier & Freight Booking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Đối Tác Vận Tải Quốc Tế (Carrier / Forwarder) *
              </label>
              <select
                value={carrierName}
                onChange={(e) => setCarrierName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-cyan-500 focus:outline-hidden"
              >
                {carrierOptions.map((rc) => (
                  <option key={rc.id} value={rc.carrierPartnerName}>
                    {rc.carrierPartnerName} ({rc.originPort} &rarr; {rc.destinationPort})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mã Vận Đơn Đường Biển (Bill of Lading - B/L) *
              </label>
              <input
                type="text"
                required
                value={billOfLadingNumber}
                onChange={(e) => setBillOfLadingNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold font-mono text-slate-900 focus:border-cyan-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 3. Trucking Pickup Details (To dispatch to Vietnam Factory) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Truck size={15} className="text-indigo-600" />
              Lịch Điều Xe Tải Đến Lấy Hàng Tại Xưởng:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Thời Gian Xe Đến Xưởng:</label>
                <input
                  type="text"
                  required
                  value={pickupDateTime}
                  onChange={(e) => setPickupDateTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Biển Số Xe & Trọng Tải:</label>
                <input
                  type="text"
                  required
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Thông Tin Tài Xế & SĐT Liên Hệ:</label>
                <input
                  type="text"
                  required
                  value={driverInfo}
                  onChange={(e) => setDriverInfo(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* 4. Amazon FBA Shipment & Port Milestones */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">Mã Amazon FBA Shipment ID:</label>
              <input
                type="text"
                required
                value={fbaShipmentId}
                onChange={(e) => setFbaShipmentId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">Ngày Tàu Rời Cảng (ETD):</label>
              <input
                type="text"
                value={etdPort}
                onChange={(e) => setEtdPort(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">Dự Kiến Đến Kho FBA (ETA):</label>
              <input
                type="text"
                value={etaFba}
                onChange={(e) => setEtaFba(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-bold text-emerald-800"
              />
            </div>
          </div>

          {/* Footer CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck size={16} className="text-cyan-600 shrink-0" />
              <span>Chủ xưởng sẽ nhận được ngay thông báo lệnh điều xe & mã B/L trên Cổng Doanh Nghiệp.</span>
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
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-700 to-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-cyan-800 hover:to-blue-800 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Send size={14} />
                <span>Xác Nhận Booking & Gửi Lịch Lấy Hàng Cho Chủ Xưởng</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
