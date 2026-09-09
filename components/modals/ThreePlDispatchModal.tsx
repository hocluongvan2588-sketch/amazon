'use client'

import React, { useState } from 'react'
import { useOutsideClick } from '@/lib/useOutsideClick'
import {
  Boxes,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileCheck2,
  FileText,
  Mail,
  Package,
  Printer,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
  Zap,
} from 'lucide-react'

interface ThreePlDispatchModalProps {
  isOpen: boolean
  onClose: () => void
  item: any
  onSuccess?: (dispatchData: any) => void
}

export function ThreePlDispatchModal({
  isOpen,
  onClose,
  item,
  onSuccess,
}: ThreePlDispatchModalProps) {
  const modalRef = useOutsideClick<HTMLDivElement>(onClose, isOpen)
  const [selected3pl, setSelected3pl] = useState<'chino-fastlog' | 'ontario-global' | 'westminster-vn'>('chino-fastlog')
  const [dispatchMethod, setDispatchMethod] = useState<'AUTO_EMAIL' | 'API_WEBHOOK' | 'PORTAL_TOKEN'>('AUTO_EMAIL')
  const [transferQty, setTransferQty] = useState<number>(item?.recommendedTransferQty || 600)
  const [destinationFba, setDestinationFba] = useState<string>('ONT8 - Amazon Fulfillment Center (Moreno Valley, CA)')
  const [palletCount, setPalletCount] = useState<number>(2)
  const [isDispatching, setIsDispatching] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [dispatchSuccess, setDispatchSuccess] = useState(false)

  if (!isOpen || !item) return null

  const threePlPartners = [
    {
      id: 'chino-fastlog',
      name: 'Chino California Buffer Hub (FastLogistics US)',
      type: 'Kho Đối tác Chiến lược Vexim',
      connection: 'AUTO_EMAIL_AND_PORTAL',
      email: 'dispatch@chinologistics-us.com',
      contact: 'Mr. David Tran (Kho Vận California)',
      address: '14200 Central Ave, Chino, CA 91710',
      currentStock: 2400,
      feePerPalletDay: '$0.45',
    },
    {
      id: 'ontario-global',
      name: 'Ontario Global 3PL Network',
      type: 'Kho 3PL Quốc tế Tích hợp API',
      connection: 'REST_API_LIVE',
      email: 'operations@ontarioglobal3pl.com',
      contact: 'Amazon EDI Team',
      address: '4250 E Airport Dr, Ontario, CA 91761',
      currentStock: 1200,
      feePerPalletDay: '$0.52',
    },
    {
      id: 'westminster-vn',
      name: 'Westminster Hub (Kho Doanh Nghiệp Việt)',
      type: 'Kho Truyền thống (No-API)',
      connection: 'AUTO_EMAIL_AND_PDF',
      email: 'khovan@westminsterlogistics.com',
      contact: 'Anh Quang Nguyễn (Quản lý kho)',
      address: '7800 Westminster Blvd, Westminster, CA 92683',
      currentStock: 600,
      feePerPalletDay: '$0.40',
    },
  ]

  const active3pl = threePlPartners.find((p) => p.id === selected3pl) || threePlPartners[0]
  const fbaShipmentCode = `FBA18-INJ-${item.sku.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6)}-${Math.floor(1000 + Math.random() * 9000)}`
  const amazonBolNumber = `BOL-AMZ-${Math.floor(100000 + Math.random() * 900000)}`

  const emailDraft = `Kính gửi Ban Quản Lý Kho ${active3pl.name},
(Attn: ${active3pl.contact} - ${active3pl.email})

Vexim Logistics trân trọng gửi Lệnh Xuất Kho & Châm Hàng FBA (Work Order & FBA Injection) như sau:

1. THÔNG TIN LÔ HÀNG XUẤT:
- Sản phẩm: ${item.title}
- SKU: ${item.sku} | ASIN: ${item.asin || 'B0C7XYZ890'}
- Số lượng xuất: ${transferQty} units (${palletCount} Pallets chuẩn Amazon 40x48 inch)
- Mã Amazon Inbound Shipment: ${fbaShipmentCode}
- Mã Amazon B/L (BOL): ${amazonBolNumber}

2. ĐIỂM ĐẾN & THỜI GIAN GIAO HÀNG:
- Kho Amazon nhận: ${destinationFba}
- Phương thức vận chuyển: Amazon LTL Partner Carrier (Xe tải Amazon tới lấy)
- Lịch hẹn lấy hàng tại kho (Dock Pickup Window): Ngày mai lúc 09:00 AM - 11:30 AM PST

3. HỒ SƠ & TEM ĐÃ ĐÍNH KÈM SẴN:
- [PDF] Tem dán Pallet (04 mặt/Pallet có mã QR Barcode FBA)
- [PDF] Packing Slip & Lệnh xuất kho (Pick List)
- [PDF] Vận đơn Bill of Lading (Amazon Carrier BOL)

Quý kho vui lòng in tem dán lên pallet theo quy chuẩn Amazon và bàn giao cho tài xế xe tải Amazon khi đến nhận.
Sau khi hoàn tất, xin bấm xác nhận nhanh tại đường link Portal: https://vexim.app/3pl-portal/dispatch-token-${Math.floor(100000 + Math.random() * 900000)}

Trân trọng,
Ánh Nguyễn - Logistics & Supply Chain Specialist | Vexim Platform`

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailDraft)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleExecuteDispatch = async () => {
    setIsDispatching(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsDispatching(false)
    setDispatchSuccess(true)
    if (onSuccess) {
      onSuccess({
        sku: item.sku,
        transferQty,
        selected3pl: active3pl.name,
        fbaShipmentCode,
        destinationFba,
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-100 text-slate-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Boxes size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-indigo-400/20 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-300">
                  3PL DISPATCH & FBA INJECTION ENGINE
                </span>
                <span className="text-xs text-slate-300">Kho Đệm California ➔ Kho Amazon FBA</span>
              </div>
              <h2 className="text-lg font-bold text-white">Tạo Lệnh Châm Hàng FBA Từ Kho 3PL</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {dispatchSuccess ? (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-950">
                  Lệnh Châm Hàng Đã Được Phát Đi Thành Công!
                </h3>
                <p className="text-xs text-emerald-800 mt-1 max-w-md mx-auto">
                  Hệ thống đã tự động gửi email Lệnh Xuất Kho kèm toàn bộ Tem Pallet FBA (PDF) tới{' '}
                  <strong>{active3pl.email}</strong> và tạo Shipment ID <strong>{fbaShipmentCode}</strong>.
                </p>
              </div>

              <div className="rounded-xl bg-white p-4 border border-emerald-200 text-left text-xs space-y-2 max-w-lg mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">Số lượng chuyển FBA:</span>
                  <strong className="text-indigo-700 font-mono">+{transferQty} units ({palletCount} Pallets)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tồn kho 3PL còn lại:</span>
                  <strong className="text-slate-900 font-mono">{(active3pl.currentStock - transferQty).toLocaleString()} units</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời gian xe Amazon đến lấy:</span>
                  <strong className="text-slate-900">Ngày mai 09:00 AM PST (LTL Appointment)</strong>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Đóng & Quay Lại Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Product summary banner */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] text-slate-400 font-semibold uppercase">Sản phẩm điều phối:</div>
                  <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    SKU: {item.sku} &bull; FBA Hiện Tại: <span className="text-red-600 font-bold">{item.fbaAvailable} units</span> (Còn {item.daysOfSupply?.toFixed(1) || 12} ngày bán)
                  </div>
                </div>
                <span className="rounded-lg bg-indigo-100 text-indigo-800 font-bold font-mono px-3 py-1.5 text-xs border border-indigo-200">
                  Cần Châm Gấp
                </span>
              </div>

              {/* Step 1: Select 3PL Warehouse */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block text-xs">
                  1. Chọn Kho Đệm 3PL Lưu Trữ Hàng Tại Mỹ:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {threePlPartners.map((p) => {
                    const isSelected = selected3pl === p.id
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelected3pl(p.id as any)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 line-clamp-1">{p.name.split('(')[0]}</span>
                          {isSelected && <CheckCircle2 size={15} className="text-indigo-600 shrink-0" />}
                        </div>
                        <div className="text-[10px] text-slate-500">{p.type}</div>
                        <div className="text-[11px] font-bold text-slate-800 font-mono">
                          Tồn kho: <span className="text-indigo-700">{p.currentStock.toLocaleString()} sp</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Cơ chế: <span className="font-semibold text-slate-600">{p.connection === 'REST_API_LIVE' ? '🟢 REST API' : '📧 Auto-Email + Portal'}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Step 2: Transfer Quantity & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Số Lượng Chuyển Sang FBA (Units):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={transferQty}
                      onChange={(e) => {
                        const val = Number(e.target.value)
                        setTransferQty(val)
                        setPalletCount(Math.max(1, Math.ceil(val / 300)))
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-bold font-mono text-slate-900 focus:outline-indigo-600"
                    />
                    <span className="text-xs text-slate-500 shrink-0 font-medium font-mono">~{palletCount} Pallets</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Quy cách: 300 units / pallet tiêu chuẩn Amazon US (40x48 inch)
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Kho Amazon FBA Tiếp Nhận (FC Destination):
                  </label>
                  <select
                    value={destinationFba}
                    onChange={(e) => setDestinationFba(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-indigo-600"
                  >
                    <option value="ONT8 - Amazon Fulfillment Center (Moreno Valley, CA)">ONT8 - Moreno Valley, CA (Cách 3PL 25 dặm - 24h nhận)</option>
                    <option value="LGB8 - Amazon Fulfillment Center (Rialto, CA)">LGB8 - Rialto, CA (Cách 3PL 32 dặm - 24h nhận)</option>
                    <option value="LAX9 - Amazon Fulfillment Center (Fontana, CA)">LAX9 - Fontana, CA (Cách 3PL 28 dặm)</option>
                    <option value="SBD1 - Amazon Fulfillment Center (San Bernardino, CA)">SBD1 - San Bernardino, CA</option>
                  </select>
                  <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                    ⚡ Kho gần, xe LTL giao trong 24h giúp FBA nhận hàng tức thì.
                  </span>
                </div>
              </div>

              {/* Step 3: Dispatch Method & No-API Fallback Engine */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block text-xs">
                    3. Kênh Bắn Lệnh Xuất Kho Tới 3PL:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDispatchMethod('AUTO_EMAIL')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                        dispatchMethod === 'AUTO_EMAIL'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      📧 Email Tự Động (No-API)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDispatchMethod('PORTAL_TOKEN')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                        dispatchMethod === 'PORTAL_TOKEN'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      🔗 Link Portal 1-Click
                    </button>
                    <button
                      type="button"
                      onClick={() => setDispatchMethod('API_WEBHOOK')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                        dispatchMethod === 'API_WEBHOOK'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      ⚡ REST API / EDI
                    </button>
                  </div>
                </div>

                {/* Email / Work Order Preview */}
                <div className="relative rounded-xl border border-slate-200 bg-slate-900 p-3.5 text-slate-200 font-mono text-[11px] leading-relaxed">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <span className="text-[10px] font-bold text-slate-400">
                      GỬI TỚI: {active3pl.email} ({active3pl.contact})
                    </span>
                    <button
                      onClick={handleCopyEmail}
                      className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300 font-sans cursor-pointer"
                    >
                      {isCopied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span>{isCopied ? 'Đã sao chép' : 'Sao chép nội dung'}</span>
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-[10.5px] text-slate-300 max-h-36 overflow-y-auto">
                    {emailDraft}
                  </pre>
                </div>
              </div>

              {/* Attachments preview */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-indigo-950 font-medium">
                  <FileCheck2 size={16} className="text-indigo-600" />
                  <span>Bộ chứng từ tự động tạo & đính kèm:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-white border border-indigo-200 px-2 py-0.5 text-[10px] font-mono text-indigo-900 font-bold">
                    📄 FBA Pallet Labels (4x6 in)
                  </span>
                  <span className="rounded bg-white border border-indigo-200 px-2 py-0.5 text-[10px] font-mono text-indigo-900 font-bold">
                    📄 Carrier BOL: {amazonBolNumber}
                  </span>
                  <span className="rounded bg-white border border-indigo-200 px-2 py-0.5 text-[10px] font-mono text-indigo-900 font-bold">
                    📄 Pick List Slip
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!dispatchSuccess && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>

            <button
              onClick={handleExecuteDispatch}
              disabled={isDispatching}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 transition-all cursor-pointer active:scale-[0.98]"
            >
              {isDispatching ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Đang Tạo Shipment & Bắn Lệnh...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Bắn Lệnh Xuất Kho 3PL & Châm Hàng FBA</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
