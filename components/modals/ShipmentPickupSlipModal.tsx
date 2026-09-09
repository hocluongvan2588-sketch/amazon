'use client'

import React from 'react'
import { useOutsideClick } from '@/lib/useOutsideClick'
import { InventoryItem } from '@/lib/types'
import {
  Calendar,
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  MapPin,
  Package,
  Phone,
  Printer,
  QrCode,
  ShieldCheck,
  Ship,
  Truck,
  User,
  X,
} from 'lucide-react'

interface ShipmentPickupSlipModalProps {
  isOpen: boolean
  onClose: () => void
  item: InventoryItem | null
}

export function ShipmentPickupSlipModal({
  isOpen,
  onClose,
  item,
}: ShipmentPickupSlipModalProps) {
  const modalRef = useOutsideClick<HTMLDivElement>(onClose, isOpen)

  if (!isOpen || !item) return null

  const booking = item.bookingDetails || {
    carrierName: 'Kerry / Flexport Ocean LCL',
    billOfLadingNumber: 'KRY-VNM-LAX-8801',
    fbaShipmentId: 'FBA18VEXIM0902',
    pickupDateTime: '2026-09-12 08:30 Sáng',
    driverInfo: 'Nguyễn Văn Long (SĐT: 0918.234.567)',
    licensePlate: 'Xe tải 5 tấn: 51C-882.19',
    etdPort: 'Cát Lái (HCMC) - 15/09/2026',
    etaFba: 'Kho ONT8 (California) - 08/10/2026',
    confirmedBy: 'Ánh Nguyễn (Logistics Lead)',
    confirmedAt: new Date().toISOString(),
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Truck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-400/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                  LỆNH ĐIỀU XE & PHIẾU XUẤT XƯỞNG
                </span>
                <span className="text-xs text-slate-300">Vexim Logistics Dispatch Slip</span>
              </div>
              <h2 className="text-lg font-bold text-white">Phiếu Điều Xe Lấy Hàng & Vận Đơn B/L</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs text-slate-800">
          {/* Status banner */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                <CheckCircle2 size={18} />
              </span>
              <div>
                <div className="font-bold text-sm text-emerald-950">Vexim Đã Hoàn Tất Book Tàu & Điều Xe Tải</div>
                <div className="text-[11px] text-emerald-800">
                  Người xác nhận: <strong>{booking.confirmedBy}</strong> &bull; Hàng xuất khẩu sang kho FBA Mỹ
                </div>
              </div>
            </div>
            <span className="font-mono text-xs font-bold bg-white text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200">
              {item.sku}
            </span>
          </div>

          {/* 1. Trucking & Pickup Schedule */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
              <Truck size={14} className="text-emerald-600" />
              1. Thông Tin Xe Tải Đến Bốc Hàng Tại Xưởng:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-medium uppercase">Thời gian xe đến:</span>
                <div className="font-bold text-slate-900 text-sm">{booking.pickupDateTime}</div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-medium uppercase">Biển số xe & Tải trọng:</span>
                <div className="font-bold text-slate-900 text-sm">{booking.licensePlate}</div>
              </div>

              <div className="sm:col-span-2 bg-white p-3 rounded-lg border border-slate-200 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-medium uppercase">Tài xế nhận hàng:</span>
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <User size={14} className="text-slate-500" />
                  <span>{booking.driverInfo}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Shipment & Ocean Carrier Info */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
              <Ship size={14} className="text-cyan-600" />
              2. Vận Đơn Tàu Biển & Mã Kho Amazon US:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-medium uppercase">Hãng tàu vận chuyển:</span>
                <div className="font-bold text-slate-900">{booking.carrierName}</div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-medium uppercase">Mã Vận Đơn (B/L Number):</span>
                <div className="font-mono font-black text-cyan-800 text-sm">{booking.billOfLadingNumber}</div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-medium uppercase">Mã Amazon FBA Shipment ID:</span>
                <div className="font-mono font-bold text-purple-900">{booking.fbaShipmentId}</div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-medium uppercase">Số lượng xuất xưởng:</span>
                <div className="font-bold text-emerald-700 font-mono">+{item.supplierReadyQty || 1200} units</div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-medium uppercase">Cảng xuất (ETD):</span>
                <div className="font-medium text-slate-800">{booking.etdPort}</div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-medium uppercase">Dự kiến đến kho FBA (ETA):</span>
                <div className="font-bold text-emerald-800">{booking.etaFba}</div>
              </div>
            </div>
          </div>

          {/* Checklist reminder */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-[11px] text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <FileCheck2 size={13} className="text-amber-700" />
              Lưu ý chuẩn bị trước khi xe tải đến:
            </div>
            <ul className="list-disc list-inside text-amber-800 space-y-0.5">
              <li>Đảm bảo các thùng carton đã dán tem FNSKU và tem Box ID chuẩn 100%.</li>
              <li>Chuẩn bị sẵn 02 bản Phiếu Giao Nhận Hàng để tài xế ký xác nhận số lượng thùng.</li>
              <li>Pallet đã bọc màng PE chống ẩm và có tem hun trùng ISPM-15.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Printer size={14} />
            <span>In Phiếu Giao Nhận</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
