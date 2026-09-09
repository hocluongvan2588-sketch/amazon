'use client'

import React, { useState, useMemo } from 'react'
import { VeximBookingConfirmationModal } from "@/components/modals/VeximBookingConfirmationModal"
import { ThreePlDispatchModal } from "@/components/modals/ThreePlDispatchModal"
import { useAppState } from '@/lib/state-context'
import { BarcodeAndLabelPrintModal } from "@/components/modals/BarcodeAndLabelPrintModal"
import { DEFAULT_RATE_CARDS, calculateFullLandedCost, calculateCbm, calculateVolumetricWeight } from '@/lib/logistics-engine'
import { InboundShipmentItem, FreightRateCard } from '@/lib/types'
import {
  AlertCircle,
  Anchor,
  ArrowRight,
  Boxes,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  Download,
  FileText,
  Flame,
  Globe2,
  Layers,
  MapPin,
  Navigation,
  Package,
  Plus,
  Printer,
  Radio,
  RefreshCw,
  Send,
  Ship,
  Sparkles,
  TrendingUp,
  Truck,
  Zap,
} from 'lucide-react'

export function SupplyChainHub() {
  const {
    dynamicLeadTimeRoutes,
    geoFbaPlacements,
    inventory,
    products,
    showToast,
    confirmShipmentBooking,
    reverseLogisticsItems,
    demurrageRecords,
    fbaCapacityUsages,
    etaDeviationAlerts,
    triggerAutoRemovalOrder,
    gradeAndRelabelItem,
    dispatchDrayagePull,
    submitCapacityBid,
    simulateEtaDeviation,
  } = useAppState()
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-catlai-lax')
  const [activeTab, setActiveTab] = useState<'intake-queue' | 'buffer3pl' | 'reverse-logistics' | 'ior-demurrage' | 'capacity-limits' | 'landedcost' | 'leadtime' | 'geoplacement' | 'webhooks'>('intake-queue')
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false)
  const [selectedItemForBooking, setSelectedItemForBooking] = useState<any>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selected3plItem, setSelected3plItem] = useState<any>(null)
  const [isThreePlModalOpen, setIsThreePlModalOpen] = useState(false)

  // Landed Cost & CBM Calculator Form State (Fully Interactive Dynamic Engine)
  const [selectedProdId, setSelectedProdId] = useState<string>(products[0]?.id || '')
  const [selectedRateCardId, setSelectedRateCardId] = useState<string>(DEFAULT_RATE_CARDS[0].id)
  const [unitsPerBox, setUnitsPerBox] = useState<number>(24)
  const [boxCount, setBoxCount] = useState<number>(50)
  const [cartonLengthCm, setCartonLengthCm] = useState<number>(45)
  const [cartonWidthCm, setCartonWidthCm] = useState<number>(35)
  const [cartonHeightCm, setCartonHeightCm] = useState<number>(28)
  const [cartonWeightKg, setCartonWeightKg] = useState<number>(8.5)
  const [fobPriceUsd, setFobPriceUsd] = useState<number>(5.5)
  const [tariffRatePercent, setTariffRatePercent] = useState<number>(0.0) // 0% for Vietnam GSP eligible
  const [fbaPlacementOption, setFbaPlacementOption] = useState<'SPLIT_5_REGIONS' | 'SINGLE_DESTINATION'>('SPLIT_5_REGIONS')

  // Selected entities
  const currentRoute = dynamicLeadTimeRoutes.find((r) => r.id === selectedRouteId) || dynamicLeadTimeRoutes[0]
  const currentRateCard = DEFAULT_RATE_CARDS.find((r) => r.id === selectedRateCardId) || DEFAULT_RATE_CARDS[0]
  const selectedProduct = products.find((p) => p.id === selectedProdId) || products[0]

  // When product changes, prefill reasonable defaults
  const handleProductSelect = (prodId: string) => {
    setSelectedProdId(prodId)
    const p = products.find((prod) => prod.id === prodId)
    if (p) {
      setFobPriceUsd(p.cogs || 5.5)
    }
  }

  // Real-time calculation using logistics engine
  const calculationResult = useMemo(() => {
    const item: InboundShipmentItem = {
      sku: selectedProduct?.sku || 'VXM-SKU-01',
      asin: selectedProduct?.asin || 'B09XTRA41',
      title: selectedProduct?.title || 'Sản phẩm xuất khẩu',
      unitsPerCarton: unitsPerBox,
      cartonCount: boxCount,
      totalUnits: unitsPerBox * boxCount,
      fobUnitCostUsd: fobPriceUsd,
      cartonDimensionsCm: {
        length: cartonLengthCm,
        width: cartonWidthCm,
        height: cartonHeightCm,
      },
      cartonWeightKg: cartonWeightKg,
    }

    return calculateFullLandedCost({
      item,
      rateCard: currentRateCard,
      tariffDutyPercent: tariffRatePercent,
      fbaPlacementOption,
    })
  }, [
    selectedProduct,
    unitsPerBox,
    boxCount,
    cartonLengthCm,
    cartonWidthCm,
    cartonHeightCm,
    cartonWeightKg,
    fobPriceUsd,
    currentRateCard,
    tariffRatePercent,
    fbaPlacementOption,
  ])

  // Simulated Webhook Event Stream
  const [webhookLogs, setWebhookLogs] = useState([
    {
      id: 'wh-01',
      carrier: 'Kerry / Flexport Ocean LCL',
      trackingNo: 'KERRY-VNM-LAX-8801',
      event: 'CUSTOMS_CLEARED',
      location: 'Cảng Long Beach (LGB), California',
      statusVi: 'Hải quan CBP & FDA đã cấp phép Release. Xe kéo Drayage đang chuyển về kho 3PL.',
      timestamp: '2 giờ trước',
    },
    {
      id: 'wh-02',
      carrier: 'Maersk Direct Pacific',
      trackingNo: 'MAEU-98217382',
      event: 'VESSEL_DEPARTED',
      location: 'Cảng Cát Lái (HCMC)',
      statusVi: 'Tàu container MAERSK MC-KINNEY đã rời cảng Cát Lái, hành trình 21 ngày tới LAX.',
      timestamp: 'Hôm qua',
    },
  ])

  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false)

  const handleTestWebhookPing = async () => {
    setIsSimulatingWebhook(true)
    try {
      const res = await fetch('/api/webhooks/logistics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'MILESTONE_UPDATED',
          shipmentId: 'VXM-SHP-2026-003',
          trackingNumber: 'FLEXPORT-LAX-9942',
          carrierName: 'Flexport Ocean Express',
          containerNumber: 'TGHU9821039',
          currentLocation: 'Khu vực tiếp nhận Kho 3PL Ontario, CA',
          etaTimestamp: new Date().toISOString(),
          statusNotesVi: 'Container đã dỡ xuống bãi kho 3PL California. Sẵn sàng bốc dỡ và dán tem FBA.',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setWebhookLogs((prev) => [
          {
            id: data.eventReceived?.id || `wh-${Date.now()}`,
            carrier: data.eventReceived?.carrier || 'Flexport Ocean Express',
            trackingNo: 'FLEXPORT-LAX-9942',
            event: 'MILESTONE_UPDATED',
            location: data.eventReceived?.location || 'Kho 3PL Ontario, CA',
            statusVi: data.eventReceived?.notesVi || 'Container đã cập kho 3PL thành công.',
            timestamp: 'Vừa xong',
          },
          ...prev,
        ])
        if (showToast) {
          showToast('Đã nhận Webhook Tracking từ Forwarder thành công!', 'success')
        }
      }
    } catch (e) {
      if (showToast) {
        showToast('Đã kích hoạt mô phỏng nhận Webhook Tracking.', 'info')
      }
    } finally {
      setIsSimulatingWebhook(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-cyan-950 p-6 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-cyan-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
              Deep-Tech Logistics Engine
            </span>
            <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-medium">
              <Ship size={13} />
              Trans-Pacific Dynamic Matrix & Landed Cost
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Supply Chain Modeling & Landed Cost Hub</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
            Bộ tính toán Landed Cost tự động (CBM/KGS, cước biển, thuế US), dự báo Lead Time đa chặng và cổng tiếp nhận Webhook tracking thời gian thực từ Forwarder.
          </p>
        </div>

        {/* Quick KPI stats and Action */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsLabelModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2.5 text-xs font-bold text-white shadow-xs backdrop-blur-xs transition-all"
          >
            <Printer size={15} className="text-cyan-300" />
            <span>Xuất Nhãn FNSKU & Box ID (PDF)</span>
          </button>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs text-right">
            <div className="text-[10px] uppercase font-mono text-slate-400">Lead Time Tuyến LAX</div>
            <div className="text-lg font-extrabold text-cyan-400">{currentRoute.totalLeadTimeDays} Ngày</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs text-right">
            <div className="text-[10px] uppercase font-mono text-slate-400">Landed Cost Hệ Số</div>
            <div className="text-lg font-extrabold text-emerald-400">{calculationResult.landedCostMultiplier}x FOB</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap border-b border-slate-200">
        <button
          onClick={() => setActiveTab('intake-queue')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'intake-queue'
              ? 'border-cyan-600 text-cyan-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck size={16} />
          <span>Hàng Đợi Lô Hàng Xưởng Báo</span>
          <span className="rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-[10px] font-bold">
            {inventory.filter((i) => i.supplierReadyStatus === 'FACTORY_READY' || i.riskLevel === 'CRITICAL').length} Lô Cần Xử Lý
          </span>
        </button>
        <button
          onClick={() => setActiveTab('landedcost')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'landedcost'
              ? 'border-cyan-600 text-cyan-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calculator size={16} />
          <span>Máy Tính Landed Cost & CBM/KGS</span>
          <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-800">
            Real-time Logic
          </span>
        </button>

        <button
          onClick={() => setActiveTab('leadtime')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'leadtime'
              ? 'border-cyan-600 text-cyan-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock size={16} />
          <span>Dynamic Lead Time Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('geoplacement')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'geoplacement'
              ? 'border-cyan-600 text-cyan-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin size={16} />
          <span>Geo-FBA Placement Calculator</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            Tiết kiệm $0.28/unit
          </span>
        </button>

        <button
          onClick={() => setActiveTab('buffer3pl')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'buffer3pl'
              ? 'border-cyan-600 text-cyan-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes size={16} />
          <span>3PL Buffer & JIT Restock</span>
        </button>

        <button
          onClick={() => setActiveTab('reverse-logistics')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'reverse-logistics'
              ? 'border-cyan-600 text-cyan-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RefreshCw size={16} />
          <span>Xử Lý Hàng Trả (Reverse Logistics)</span>
          <span className="rounded-full bg-indigo-100 text-indigo-800 px-2 py-0.5 text-[10px] font-bold">
            {reverseLogisticsItems.length} Lô Hoàn
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ior-demurrage')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'ior-demurrage'
              ? 'border-cyan-600 text-cyan-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Anchor size={16} />
          <span>Cảnh Báo Phí Cảng & IOR</span>
          <span className="rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-bold">
            {demurrageRecords.filter((d) => d.riskLevel === 'WARNING' || d.riskLevel === 'CRITICAL_URGENT').length} Cont Cần Kéo
          </span>
        </button>

        <button
          onClick={() => setActiveTab('capacity-limits')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'capacity-limits'
              ? 'border-cyan-600 text-cyan-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers size={16} />
          <span>Hạn Ngạch FBA & Đấu Giá Dung Lượng</span>
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'webhooks'
              ? 'border-cyan-600 text-cyan-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Radio size={16} />
          <span>Tracking Tàu & Độ Lệch ETA</span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
        </button>
      </div>

            {/* TAB: FACTORY CARGO INTAKE QUEUE */}
      {activeTab === 'intake-queue' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-cyan-600 animate-pulse" />
                <h2 className="text-sm font-bold text-slate-900">
                  Danh Sách Lô Hàng Các Nhà Xưởng Việt Nam Đã Báo Sẵn Sàng (Factory Intake Queue)
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Nơi đội ngũ Logistics Vexim tiếp nhận phiếu xuất xưởng từ Vinacacao, An An, Lotus Craft &rarr; Phê duyệt book tàu &rarr; Điều xe tải đến lấy hàng.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-cyan-900 bg-cyan-50 px-3 py-1.5 rounded-lg border border-cyan-200 shrink-0">
              SLA Book Xe: &le; 48 Giờ
            </span>
          </div>

          {/* Shipment Queue Cards */}
          <div className="grid grid-cols-1 gap-4">
            {inventory.map((item) => {
              const isFactoryReady = item.supplierReadyStatus === 'FACTORY_READY'
              const isBooked = item.supplierReadyStatus === 'BOOKED_TRANSIT'
              const readyQty = item.supplierReadyQty || item.recommendedReorderQty || 1200
              const readyDate = item.supplierReadyDate || '12/09/2026'

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border bg-white p-5 shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isBooked
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : isFactoryReady
                      ? 'border-cyan-400 ring-2 ring-cyan-500/10'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 text-[10px] font-mono">
                        VINACACAO / SUPPLIER
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700">{item.sku}</span>
                      {isBooked ? (
                        <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-0.5 text-[10px] flex items-center gap-1">
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          Đã Book Tàu & Điều Xe (B/L: {item.bookingDetails?.billOfLadingNumber || 'KRY-VNM-LAX-8801'})
                        </span>
                      ) : isFactoryReady ? (
                        <span className="rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold px-2.5 py-0.5 text-[10px] flex items-center gap-1 animate-pulse">
                          <Clock size={11} className="text-cyan-600" />
                          Xưởng Đã Báo Sẵn Sàng (Chờ Vexim Book Tàu)
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 text-[10px]">
                          Cần Bổ Sung Tồn Kho
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span>Số lượng đóng gói: <strong className="text-blue-700 font-bold font-mono">+{readyQty.toLocaleString()} units</strong></span>
                      <span>&bull;</span>
                      <span>Ngày xưởng sẵn sàng (CRD): <strong className="text-slate-900 font-mono">{readyDate}</strong></span>
                      <span>&bull;</span>
                      <span>Tồn FBA: <strong className="text-red-600 font-bold">{item.fbaAvailable} sp</strong> (Còn {item.daysOfSupply.toFixed(1)} ngày)</span>
                    </div>

                    {item.bookingDetails && (
                      <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Hãng tàu:</span>
                          <strong className="text-slate-800">{item.bookingDetails.carrierName}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Xe lấy hàng:</span>
                          <strong className="text-slate-800">{item.bookingDetails.pickupDateTime} ({item.bookingDetails.licensePlate})</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Mã B/L & FBA ID:</span>
                          <strong className="font-mono text-cyan-800">{item.bookingDetails.billOfLadingNumber} / {item.bookingDetails.fbaShipmentId}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {isBooked ? (
                      <button
                        onClick={() => {
                          setSelectedItemForBooking(item)
                          setIsBookingModalOpen(true)
                        }}
                        className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors"
                      >
                        Cập Nhật Lịch Xe
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedItemForBooking(item)
                          setIsBookingModalOpen(true)
                        }}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-cyan-500 hover:to-blue-500 transition-all cursor-pointer active:scale-[0.98]"
                      >
                        <Ship size={15} />
                        <span>Phê Duyệt & Điều Xe Lấy Hàng</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

            {/* TAB: REVERSE LOGISTICS & UNSELLABLE GRADING */}
      {activeTab === 'reverse-logistics' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                <h2 className="text-base font-bold text-slate-900">
                  Xử Lý Hàng Hoàn Về & Tái Sinh Giá Trị Sản Phẩm (Reverse Logistics & 3PL Grading)
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Quy trình tự động tạo lệnh Removal Order rút hàng Unsellable từ kho Amazon FBA về kho đệm 3PL California &bull; Kiểm định chất lượng Grade A/B/C &bull; Thay vỏ hộp, dán lại tem FNSKU ($0.35/sp) để châm ngược lại FBA hoặc thanh lý thu hồi vốn.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => triggerAutoRemovalOrder('VN-COCOA-ORGANIC-500G')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:from-indigo-500 hover:to-blue-500 transition-all cursor-pointer"
              >
                <Package size={14} />
                <span>Tạo Lệnh Auto-Removal Rút Về 3PL</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-1">
              <div className="text-[10px] font-bold uppercase text-emerald-800 font-mono">Grade A (Tái Xuất FBA New)</div>
              <div className="text-2xl font-black text-emerald-950">92.4% <span className="text-xs font-normal text-slate-600">tỷ lệ thu hồi</span></div>
              <p className="text-[11px] text-emerald-800">Chỉ móp hộp carton ngoài, ruột nguyên vẹn. Dán tem FNSKU mới và bán giá gốc.</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-1">
              <div className="text-[10px] font-bold uppercase text-amber-800 font-mono">Grade B (Thanh Lý Buôn Sỉ)</div>
              <div className="text-2xl font-black text-amber-950">55.0% <span className="text-xs font-normal text-slate-600">thu hồi vốn</span></div>
              <p className="text-[11px] text-amber-800">Cấn vỏ/xước nhẹ. Thanh lý cho đối tác sỉ Los Angeles hoặc bán Used - Like New.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-500 font-mono">Grade C (Tiêu Hủy Hợp Pháp)</div>
              <div className="text-2xl font-black text-slate-900">0% <span className="text-xs font-normal text-slate-600">biên bản COD</span></div>
              <p className="text-[11px] text-slate-500">Hàng vỡ/hết hạn. Cấp chứng thư Certificate of Destruction để giảm trừ thuế.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                Danh Sách Lô Hàng Hoàn Unsellable Đang Xử Lý Tại 3PL California
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {reverseLogisticsItems.map((item) => (
                <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <img src={item.imageUrl} alt={item.title} className="h-12 w-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{item.sku}</span>
                        <span className="rounded bg-slate-100 text-slate-700 font-mono px-2 py-0.5 text-[10px]">
                          Lệnh Rút: {item.removalOrderId} ({item.fbaWarehouseOrigin})
                        </span>
                        <span className="rounded-full bg-indigo-100 text-indigo-800 px-2 py-0.5 text-[10px] font-bold">
                          {item.unitsReturned} sp hoàn về
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <strong>Kết quả kiểm định 3PL:</strong> {item.inspectionNotes}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {item.status === 'INSPECTED_AT_3PL' || item.status === 'TRANSIT_TO_3PL' ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => gradeAndRelabelItem(item.id, 'GRADE_A_NEW', 'Đã đổi hộp mới, dán lại tem FNSKU barcode sạch sẽ, đạt chuẩn 100% tái xuất FBA.')}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer"
                        >
                          ✓ Duyệt Grade A (Tái Xuất FBA)
                        </button>
                        <button
                          onClick={() => gradeAndRelabelItem(item.id, 'GRADE_B_LIQUIDATE', 'Đã chuyển bán thanh lý thu hồi 55% vốn.')}
                          className="rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900 cursor-pointer"
                        >
                          Duyệt Grade B (Thanh Lý)
                        </button>
                      </div>
                    ) : item.status === 'RE_INJECTED_FBA' ? (
                      <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        Đã Châm Ngược Lại FBA (Shipment: {item.recycledIntoFbaShipmentId})
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 text-amber-900 px-3 py-1 text-xs font-bold">
                        Đã Thanh Lý Thu Hồi ${item.estimatedValueRecoveryUsd}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: IOR & DEMURRAGE COUNTDOWN */}
      {activeTab === 'ior-demurrage' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-base font-bold text-slate-900">
                  Quản Lý Pháp Nhân IOR & Bộ Đếm Cảnh Báo Phí Lưu Bãi Cảng (Demurrage & Detention Countdown)
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Cảng Los Angeles / Long Beach chỉ cho phép 4-5 ngày Free Time &bull; Phạt $150–$350/ngày nếu quá hạn &bull; Hệ thống tự động đếm ngược giờ miễn phí và cảnh báo hối thúc đội xe kéo container về kho 3PL trước hạn chót.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {demurrageRecords.map((record) => {
              const isUrgent = record.riskLevel === 'WARNING' || record.riskLevel === 'CRITICAL_URGENT'
              const isPulled = record.gateOutStatus === 'PULLED_TO_3PL'

              return (
                <div
                  key={record.id}
                  className={`rounded-2xl border p-5 shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white ${
                    isPulled
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : isUrgent
                      ? 'border-amber-400 ring-2 ring-amber-500/10'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded-lg">
                        Cont #{record.containerNumber}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-600">
                        B/L: {record.billOfLading}
                      </span>
                      <span className="rounded bg-sky-100 text-sky-800 font-mono font-bold text-[10px] px-2 py-0.5">
                        Mô hình IOR: {record.iorModel === 'DDP_FORWARDER' ? 'DDP Forwarder Ủy Thác' : 'Foreign IOR Continuous Bond'}
                      </span>
                      {isPulled ? (
                        <span className="rounded-full bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 text-[10px]">
                          ✓ Đã Kéo Về Kho 3PL An Toàn
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 text-[10px] animate-pulse">
                          ⏳ Còn {record.remainingFreeHours} Giờ Miễn Phí Lưu Bãi
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-800 font-bold">
                      Cảng đến: <span className="text-indigo-700">{record.arrivalPort}</span> &bull; Tàu: {record.vesselName}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-mono">Đơn vị xe tải phụ trách (Drayage Trucker):</span>
                        <strong className="text-slate-800">{record.drayageAssignedTrucker}</strong>
                        <div className="text-[11px] text-slate-500 font-mono">SĐT Điều Phối: {record.truckerPhone}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-mono">Hạn chót Free Time (Last Free Day):</span>
                        <strong className="text-red-700 font-mono text-sm">{new Date(record.lastFreeDayTimestamp).toLocaleString('vi-VN')}</strong>
                        <div className="text-[10px] text-slate-500">Mức phạt quá hạn: ${record.estimatedDemurrageFeePerDay}/ngày</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isPulled ? (
                      <span className="text-xs font-bold text-emerald-700">Đã tránh $675 phí phạt bãi</span>
                    ) : (
                      <button
                        onClick={() => dispatchDrayagePull(record.id)}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                      >
                        <Truck size={14} />
                        <span>Kéo Cont Về 3PL (Cứu Phí Cảng)</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB: CAPACITY LIMITS & BIDDING */}
      {activeTab === 'capacity-limits' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                <h2 className="text-base font-bold text-slate-900">
                  Quản Lý Hạn Ngạch Lưu Kho FBA & Đấu Giá Dung Lượng (FBA Capacity Limits & Manager Bidding)
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Amazon cấp hạn ngạch theo Cubic Feet ($ft^3$) &bull; Tích hợp công cụ đấu giá dung lượng (Capacity Bidding) để mở thêm hạn ngạch nhập hàng mùa cao điểm Q4 &bull; Tự động hoàn 100% phí cọc qua Performance Credits khi bán tốt.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fbaCapacityUsages.map((cap) => (
              <div key={cap.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-blue-100 text-blue-900 font-mono font-bold px-2 py-0.5 text-xs">
                      {cap.storageType}
                    </span>
                    <span className="text-xs text-slate-500">Loại lưu kho Amazon US</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-800">
                    {cap.currentUsageCubicFeet.toLocaleString()} / {cap.monthlyLimitCubicFeet.toLocaleString()} ft³ ({cap.utilizationPercentage}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      cap.utilizationPercentage > 85 ? 'bg-red-500' : cap.utilizationPercentage > 75 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, cap.utilizationPercentage)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Dung lượng còn trống:</span>
                    <strong className="text-emerald-700 text-sm font-mono">
                      +{(cap.monthlyLimitCubicFeet - cap.currentUsageCubicFeet).toLocaleString()} ft³
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Dự kiến tháng sau:</span>
                    <strong className="text-slate-800 text-sm font-mono">
                      ~{cap.nextMonthEstimatedLimitCubicFeet.toLocaleString()} ft³
                    </strong>
                  </div>
                </div>

                {/* Capacity Bidding Box */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-blue-600" />
                      Đấu Giá Xin Thêm Dung Lượng (Capacity Bid):
                    </span>
                    {cap.biddingStatus === 'BID_SUBMITTED' && (
                      <span className="rounded-full bg-blue-200 text-blue-900 font-bold px-2 py-0.5 text-[10px]">
                        ✓ Đã Nộp Bid (+{cap.requestedExtraCubicFeet} ft³)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => submitCapacityBid(cap.storageType, 450, 0.15)}
                      disabled={cap.biddingStatus === 'BID_SUBMITTED'}
                      className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 text-xs transition-colors cursor-pointer"
                    >
                      {cap.biddingStatus === 'BID_SUBMITTED'
                        ? `Đang Chờ Amazon Phê Duyệt (+${cap.requestedExtraCubicFeet} ft³ @ $${cap.bidPricePerCubicFeet}/ft³)`
                        : `Nộp Bid Xin Thêm +450 ft³ ($0.15/ft³)`}
                    </button>
                  </div>
                  <span className="text-[10px] text-blue-800 block">
                    Đủ điều kiện nhận Performance Credits hoàn 100% chi phí khi đạt target doanh thu.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

            {/* TAB: REVERSE LOGISTICS & UNSELLABLE GRADING */}
      {activeTab === 'reverse-logistics' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                <h2 className="text-base font-bold text-slate-900">
                  Xử Lý Hàng Hoàn Về & Tái Sinh Giá Trị Sản Phẩm (Reverse Logistics & 3PL Grading)
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Quy trình tự động tạo lệnh Removal Order rút hàng Unsellable từ kho Amazon FBA về kho đệm 3PL California &bull; Kiểm định chất lượng Grade A/B/C &bull; Thay vỏ hộp, dán lại tem FNSKU ($0.35/sp) để châm ngược lại FBA hoặc thanh lý thu hồi vốn.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => triggerAutoRemovalOrder('VN-COCOA-ORGANIC-500G')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:from-indigo-500 hover:to-blue-500 transition-all cursor-pointer"
              >
                <Package size={14} />
                <span>Tạo Lệnh Auto-Removal Rút Về 3PL</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-1">
              <div className="text-[10px] font-bold uppercase text-emerald-800 font-mono">Grade A (Tái Xuất FBA New)</div>
              <div className="text-2xl font-black text-emerald-950">92.4% <span className="text-xs font-normal text-slate-600">tỷ lệ thu hồi</span></div>
              <p className="text-[11px] text-emerald-800">Chỉ móp hộp carton ngoài, ruột nguyên vẹn. Dán tem FNSKU mới và bán giá gốc.</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-1">
              <div className="text-[10px] font-bold uppercase text-amber-800 font-mono">Grade B (Thanh Lý Buôn Sỉ)</div>
              <div className="text-2xl font-black text-amber-950">55.0% <span className="text-xs font-normal text-slate-600">thu hồi vốn</span></div>
              <p className="text-[11px] text-amber-800">Cấn vỏ/xước nhẹ. Thanh lý cho đối tác sỉ Los Angeles hoặc bán Used - Like New.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-500 font-mono">Grade C (Tiêu Hủy Hợp Pháp)</div>
              <div className="text-2xl font-black text-slate-900">0% <span className="text-xs font-normal text-slate-600">biên bản COD</span></div>
              <p className="text-[11px] text-slate-500">Hàng vỡ/hết hạn. Cấp chứng thư Certificate of Destruction để giảm trừ thuế.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                Danh Sách Lô Hàng Hoàn Unsellable Đang Xử Lý Tại 3PL California
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {reverseLogisticsItems.map((item) => (
                <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <img src={item.imageUrl} alt={item.title} className="h-12 w-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{item.sku}</span>
                        <span className="rounded bg-slate-100 text-slate-700 font-mono px-2 py-0.5 text-[10px]">
                          Lệnh Rút: {item.removalOrderId} ({item.fbaWarehouseOrigin})
                        </span>
                        <span className="rounded-full bg-indigo-100 text-indigo-800 px-2 py-0.5 text-[10px] font-bold">
                          {item.unitsReturned} sp hoàn về
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <strong>Kết quả kiểm định 3PL:</strong> {item.inspectionNotes}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {item.status === 'INSPECTED_AT_3PL' || item.status === 'TRANSIT_TO_3PL' ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => gradeAndRelabelItem(item.id, 'GRADE_A_NEW', 'Đã đổi hộp mới, dán lại tem FNSKU barcode sạch sẽ, đạt chuẩn 100% tái xuất FBA.')}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer"
                        >
                          ✓ Duyệt Grade A (Tái Xuất FBA)
                        </button>
                        <button
                          onClick={() => gradeAndRelabelItem(item.id, 'GRADE_B_LIQUIDATE', 'Đã chuyển bán thanh lý thu hồi 55% vốn.')}
                          className="rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900 cursor-pointer"
                        >
                          Duyệt Grade B (Thanh Lý)
                        </button>
                      </div>
                    ) : item.status === 'RE_INJECTED_FBA' ? (
                      <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        Đã Châm Ngược Lại FBA (Shipment: {item.recycledIntoFbaShipmentId})
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 text-amber-900 px-3 py-1 text-xs font-bold">
                        Đã Thanh Lý Thu Hồi ${item.estimatedValueRecoveryUsd}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: IOR & DEMURRAGE COUNTDOWN */}
      {activeTab === 'ior-demurrage' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-base font-bold text-slate-900">
                  Quản Lý Pháp Nhân IOR & Bộ Đếm Cảnh Báo Phí Lưu Bãi Cảng (Demurrage & Detention Countdown)
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Cảng Los Angeles / Long Beach chỉ cho phép 4-5 ngày Free Time &bull; Phạt $150–$350/ngày nếu quá hạn &bull; Hệ thống tự động đếm ngược giờ miễn phí và cảnh báo hối thúc đội xe kéo container về kho 3PL trước hạn chót.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {demurrageRecords.map((record) => {
              const isUrgent = record.riskLevel === 'WARNING' || record.riskLevel === 'CRITICAL_URGENT'
              const isPulled = record.gateOutStatus === 'PULLED_TO_3PL'

              return (
                <div
                  key={record.id}
                  className={`rounded-2xl border p-5 shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white ${
                    isPulled
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : isUrgent
                      ? 'border-amber-400 ring-2 ring-amber-500/10'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded-lg">
                        Cont #{record.containerNumber}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-600">
                        B/L: {record.billOfLading}
                      </span>
                      <span className="rounded bg-sky-100 text-sky-800 font-mono font-bold text-[10px] px-2 py-0.5">
                        Mô hình IOR: {record.iorModel === 'DDP_FORWARDER' ? 'DDP Forwarder Ủy Thác' : 'Foreign IOR Continuous Bond'}
                      </span>
                      {isPulled ? (
                        <span className="rounded-full bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 text-[10px]">
                          ✓ Đã Kéo Về Kho 3PL An Toàn
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 text-[10px] animate-pulse">
                          ⏳ Còn {record.remainingFreeHours} Giờ Miễn Phí Lưu Bãi
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-800 font-bold">
                      Cảng đến: <span className="text-indigo-700">{record.arrivalPort}</span> &bull; Tàu: {record.vesselName}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-mono">Đơn vị xe tải phụ trách (Drayage Trucker):</span>
                        <strong className="text-slate-800">{record.drayageAssignedTrucker}</strong>
                        <div className="text-[11px] text-slate-500 font-mono">SĐT Điều Phối: {record.truckerPhone}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-mono">Hạn chót Free Time (Last Free Day):</span>
                        <strong className="text-red-700 font-mono text-sm">{new Date(record.lastFreeDayTimestamp).toLocaleString('vi-VN')}</strong>
                        <div className="text-[10px] text-slate-500">Mức phạt quá hạn: ${record.estimatedDemurrageFeePerDay}/ngày</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isPulled ? (
                      <span className="text-xs font-bold text-emerald-700">Đã tránh $675 phí phạt bãi</span>
                    ) : (
                      <button
                        onClick={() => dispatchDrayagePull(record.id)}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                      >
                        <Truck size={14} />
                        <span>Kéo Cont Về 3PL (Cứu Phí Cảng)</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB: CAPACITY LIMITS & BIDDING */}
      {activeTab === 'capacity-limits' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                <h2 className="text-base font-bold text-slate-900">
                  Quản Lý Hạn Ngạch Lưu Kho FBA & Đấu Giá Dung Lượng (FBA Capacity Limits & Manager Bidding)
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Amazon cấp hạn ngạch theo Cubic Feet ($ft^3$) &bull; Tích hợp công cụ đấu giá dung lượng (Capacity Bidding) để mở thêm hạn ngạch nhập hàng mùa cao điểm Q4 &bull; Tự động hoàn 100% phí cọc qua Performance Credits khi bán tốt.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fbaCapacityUsages.map((cap) => (
              <div key={cap.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-blue-100 text-blue-900 font-mono font-bold px-2 py-0.5 text-xs">
                      {cap.storageType}
                    </span>
                    <span className="text-xs text-slate-500">Loại lưu kho Amazon US</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-800">
                    {cap.currentUsageCubicFeet.toLocaleString()} / {cap.monthlyLimitCubicFeet.toLocaleString()} ft³ ({cap.utilizationPercentage}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      cap.utilizationPercentage > 85 ? 'bg-red-500' : cap.utilizationPercentage > 75 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, cap.utilizationPercentage)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Dung lượng còn trống:</span>
                    <strong className="text-emerald-700 text-sm font-mono">
                      +{(cap.monthlyLimitCubicFeet - cap.currentUsageCubicFeet).toLocaleString()} ft³
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Dự kiến tháng sau:</span>
                    <strong className="text-slate-800 text-sm font-mono">
                      ~{cap.nextMonthEstimatedLimitCubicFeet.toLocaleString()} ft³
                    </strong>
                  </div>
                </div>

                {/* Capacity Bidding Box */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-blue-600" />
                      Đấu Giá Xin Thêm Dung Lượng (Capacity Bid):
                    </span>
                    {cap.biddingStatus === 'BID_SUBMITTED' && (
                      <span className="rounded-full bg-blue-200 text-blue-900 font-bold px-2 py-0.5 text-[10px]">
                        ✓ Đã Nộp Bid (+{cap.requestedExtraCubicFeet} ft³)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => submitCapacityBid(cap.storageType, 450, 0.15)}
                      disabled={cap.biddingStatus === 'BID_SUBMITTED'}
                      className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 text-xs transition-colors cursor-pointer"
                    >
                      {cap.biddingStatus === 'BID_SUBMITTED'
                        ? `Đang Chờ Amazon Phê Duyệt (+${cap.requestedExtraCubicFeet} ft³ @ $${cap.bidPricePerCubicFeet}/ft³)`
                        : `Nộp Bid Xin Thêm +450 ft³ ($0.15/ft³)`}
                    </button>
                  </div>
                  <span className="text-[10px] text-blue-800 block">
                    Đủ điều kiện nhận Performance Credits hoàn 100% chi phí khi đạt target doanh thu.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 0: INTERACTIVE LANDED COST & CBM/KGS CALCULATOR */}
      {activeTab === 'landedcost' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: INPUT CONTROLS (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calculator size={16} className="text-cyan-600" />
                <span>Thông Số Lô Hàng Xuất Khẩu</span>
              </h2>
              <span className="font-mono text-[10px] bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded font-bold">
                Auto-Calc Active
              </span>
            </div>

            {/* 1. Select Product */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                1. Sản Phẩm Xuất Xưởng
              </label>
              <select
                value={selectedProdId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-900 shadow-xs focus:border-cyan-500 focus:outline-hidden"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.brand}] {p.title.substring(0, 40)}... ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Select Carrier Rate Card */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                2. Tuyến Vận Tải & Đối Tác Freight
              </label>
              <select
                value={selectedRateCardId}
                onChange={(e) => setSelectedRateCardId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-900 shadow-xs focus:border-cyan-500 focus:outline-hidden"
              >
                {DEFAULT_RATE_CARDS.map((rc) => (
                  <option key={rc.id} value={rc.id}>
                    {rc.carrierPartnerName} ({rc.originPort} &rarr; {rc.destinationPort})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Carton Spec & Packaging */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số sp/thùng (Units/Box)</label>
                <input
                  type="number"
                  min="1"
                  value={unitsPerBox}
                  onChange={(e) => setUnitsPerBox(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tổng số Thùng (Boxes)</label>
                <input
                  type="number"
                  min="1"
                  value={boxCount}
                  onChange={(e) => setBoxCount(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold font-mono"
                />
              </div>
            </div>

            {/* 4. Carton Dimensions (cm) & Weight (kg) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kích thước Thùng Carton (Dài x Rộng x Cao cm)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Dài (cm)"
                  value={cartonLengthCm}
                  onChange={(e) => setCartonLengthCm(Number(e.target.value))}
                  className="rounded-lg border border-slate-300 p-2 text-xs font-mono font-bold"
                />
                <input
                  type="number"
                  placeholder="Rộng (cm)"
                  value={cartonWidthCm}
                  onChange={(e) => setCartonWidthCm(Number(e.target.value))}
                  className="rounded-lg border border-slate-300 p-2 text-xs font-mono font-bold"
                />
                <input
                  type="number"
                  placeholder="Cao (cm)"
                  value={cartonHeightCm}
                  onChange={(e) => setCartonHeightCm(Number(e.target.value))}
                  className="rounded-lg border border-slate-300 p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trọng lượng/Thùng (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={cartonWeightKg}
                  onChange={(e) => setCartonWeightKg(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Giá Vốn FOB ($/sp)</label>
                <input
                  type="number"
                  step="0.1"
                  value={fobPriceUsd}
                  onChange={(e) => setFobPriceUsd(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono font-bold text-indigo-700"
                />
              </div>
            </div>

            {/* 5. Tariff Rate & FBA Placement Strategy */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thuế Nhập Khẩu US (%)</label>
                <select
                  value={tariffRatePercent}
                  onChange={(e) => setTariffRatePercent(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold"
                >
                  <option value={0.0}>0% (GSP / Free Tariff)</option>
                  <option value={3.5}>3.5% (Nông sản chế biến)</option>
                  <option value={6.5}>6.5% (Thủ công mỹ nghệ / Gỗ)</option>
                  <option value={10.0}>10.0% (Special Goods)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chiến Lược Inbound FBA</label>
                <select
                  value={fbaPlacementOption}
                  onChange={(e) => setFbaPlacementOption(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold"
                >
                  <option value="SPLIT_5_REGIONS">Smart Split 5 Vùng ($0 Fee)</option>
                  <option value="SINGLE_DESTINATION">Single 1 Điểm ($0.28/sp)</option>
                </select>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: REAL-TIME CALCULATION BREAKDOWN (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top Summary Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">Tổng Số Lượng</span>
                <div className="text-lg font-black text-slate-900">{calculationResult.totalUnits.toLocaleString()} sp</div>
                <span className="text-[10px] text-slate-500">{calculationResult.totalCartons} Thùng</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">Thể Tích CBM</span>
                <div className="text-lg font-black text-cyan-700">{calculationResult.totalCbm} m³</div>
                <span className="text-[10px] text-slate-500">Volumetric Weight</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">Trọng Lượng Gross</span>
                <div className="text-lg font-black text-slate-900">{calculationResult.grossWeightKg} kg</div>
                <span className="text-[10px] text-slate-500">Actual Weight</span>
              </div>

              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl p-3.5 text-white space-y-1 shadow-xs">
                <span className="text-[10px] font-mono uppercase text-emerald-100">Landed Cost / Unit</span>
                <div className="text-xl font-black text-white">${calculationResult.finalLandedCostPerUnit.toFixed(2)}</div>
                <span className="text-[10px] text-emerald-200">({calculationResult.landedCostMultiplier}x FOB gốc)</span>
              </div>
            </div>

            {/* Comprehensive Cost Structure Waterfall Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Bảng Phân Tích Cấu Thành Chi Phí Đưa Hàng Vào Kho FBA (Landed Cost Waterfall)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chi tiết từ giá xưởng FOB Việt Nam &rarr; Cước biển/hàng không &rarr; Thuế nhập khẩu US &rarr; Kho Amazon US.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {/* 1. FOB Goods Cost */}
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                    <span className="font-semibold text-slate-800">1. Giá vốn sản xuất tại xưởng VN (FOB Value):</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">${(calculationResult.fobCostPerUnit * calculationResult.totalUnits).toFixed(2)}</span>
                    <span className="text-[11px] text-slate-400 ml-2 font-mono">(${calculationResult.fobCostPerUnit.toFixed(2)}/sp)</span>
                  </div>
                </div>

                {/* 2. Freight Cost */}
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-cyan-600" />
                    <span className="font-semibold text-slate-800">2. Cước vận tải quốc tế ({currentRateCard.carrierPartnerName}):</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">${calculationResult.freightCostUsd.toFixed(2)}</span>
                    <span className="text-[11px] text-slate-400 ml-2 font-mono">(${calculationResult.freightCostPerUnit.toFixed(2)}/sp)</span>
                  </div>
                </div>

                {/* 3. Tariff Duty */}
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-600" />
                    <span className="font-semibold text-slate-800">3. Thuế nhập khẩu Hải quan Mỹ (US Tariff {tariffRatePercent}%):</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">${calculationResult.importTariffDutyUsd.toFixed(2)}</span>
                    <span className="text-[11px] text-slate-400 ml-2 font-mono">(${calculationResult.dutyCostPerUnit.toFixed(2)}/sp)</span>
                  </div>
                </div>

                {/* 4. Drayage & Customs Clearance */}
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-indigo-600" />
                    <span className="font-semibold text-slate-800">4. Phí thông quan CBP/FDA & Xe kéo cảng Drayage:</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">${calculationResult.customsAndDrayageUsd.toFixed(2)}</span>
                    <span className="text-[11px] text-slate-400 ml-2 font-mono">(${(calculationResult.customsAndDrayageUsd / calculationResult.totalUnits).toFixed(2)}/sp)</span>
                  </div>
                </div>

                {/* 5. FBA Inbound Fee */}
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-600" />
                    <span className="font-semibold text-slate-800">5. Phí Inbound Placement Amazon FBA (Chính sách 2026):</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${calculationResult.fbaInboundPlacementFeeUsd === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {calculationResult.fbaInboundPlacementFeeUsd === 0 ? '$0.00 (Tối ưu Split)' : `$${calculationResult.fbaInboundPlacementFeeUsd.toFixed(2)}`}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2 font-mono">(${calculationResult.fbaInboundFeePerUnit.toFixed(2)}/sp)</span>
                  </div>
                </div>

                {/* Total Landed Summary Bar */}
                <div className="py-3 bg-slate-50 p-4 rounded-xl flex items-center justify-between font-bold text-sm mt-2">
                  <span className="text-slate-900">TỔNG CHI PHÍ ĐƯA HÀNG VÀO KHO (TOTAL LANDED COST):</span>
                  <div className="text-right">
                    <span className="text-emerald-700 text-lg">${calculationResult.totalLandedCostUsd.toLocaleString()}</span>
                    <span className="text-xs text-slate-500 ml-2 font-mono">(${calculationResult.finalLandedCostPerUnit.toFixed(2)} / unit)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: DYNAMIC LEAD TIME MATRIX */}
      {activeTab === 'leadtime' && (
        <div className="space-y-6">
          {/* Route Selector Pill */}
          <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">Chọn tuyến xuất khẩu:</span>
            <div className="flex flex-wrap gap-2">
              {dynamicLeadTimeRoutes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedRouteId === route.id
                      ? 'bg-cyan-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {route.originPort} &rarr; {route.destinationPort}
                </button>
              ))}
            </div>
          </div>

          {/* Lead Time Timeline Breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {currentRoute.originPort} &rarr; {currentRoute.destinationPort}
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  Điểm tiếp nhận FBA: <strong className="text-slate-800">{currentRoute.destinationFbaHub}</strong>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Trung bình thông thường:</span>{' '}
                  <strong className="text-slate-700">{currentRoute.historicalAverageDays} ngày</strong>
                </div>
                <div>
                  <span className="text-slate-400">Dự báo mùa Q4 hiện tại:</span>{' '}
                  <strong className="text-cyan-700 font-extrabold text-sm">{currentRoute.totalLeadTimeDays} ngày</strong>{' '}
                  <span className="text-red-600 font-bold">(+{currentRoute.congestionDelayDays} ngày nghẽn)</span>
                </div>
              </div>
            </div>

            {/* Stage-by-Stage Flow */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>1. Xưởng VN</span>
                  <Package size={16} className="text-blue-600" />
                </div>
                <div className="text-lg font-black text-slate-900">{currentRoute.factoryProductionDays} Ngày</div>
                <div className="text-[11px] text-slate-500">Sản xuất & Đóng gói nhãn FNSKU</div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>2. Vận tải biển</span>
                  <Ship size={16} className="text-cyan-600" />
                </div>
                <div className="text-lg font-black text-slate-900">{currentRoute.oceanTransitDays} Ngày</div>
                <div className="text-[11px] text-slate-500">Tàu container xuyên Thái Bình Dương</div>
              </div>

              <div className="rounded-xl bg-amber-50/70 p-4 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span>3. Hải quan Mỹ</span>
                  <AlertCircle size={16} className="text-amber-600" />
                </div>
                <div className="text-lg font-black text-amber-900">{currentRoute.portCustomsClearanceDays} Ngày</div>
                <div className="text-[11px] text-amber-700">Kiểm tra FDA & Thông quan CBP</div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>4. Drayage Kéo xe</span>
                  <Truck size={16} className="text-indigo-600" />
                </div>
                <div className="text-lg font-black text-slate-900">{currentRoute.domesticDrayageDays} Ngày</div>
                <div className="text-[11px] text-slate-500">Kéo từ cảng biển về kho 3PL / FBA</div>
              </div>

              <div className="rounded-xl bg-emerald-50/70 p-4 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>5. FBA Check-in</span>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
                <div className="text-lg font-black text-emerald-900">{currentRoute.fbaCheckinDays} Ngày</div>
                <div className="text-[11px] text-emerald-700">Amazon quét barcode lên kệ Buy Box</div>
              </div>
            </div>

            {/* Seasonal Alert Box */}
            <div className="mt-6 rounded-xl bg-cyan-50 p-4 border border-cyan-200 flex items-start gap-3">
              <Sparkles size={18} className="text-cyan-700 shrink-0 mt-0.5" />
              <div className="text-xs text-cyan-950 space-y-1">
                <div className="font-bold">Dự báo Trí tuệ Nhân tạo Chuỗi Cung Ứng:</div>
                <p>{currentRoute.seasonalSurgeForecast}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GEO-FBA PLACEMENT CALCULATOR */}
      {activeTab === 'geoplacement' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Máy Tính Tối Ưu Phí FBA Inbound Placement 2026</h2>
            <p className="text-xs text-slate-500">
              Amazon áp dụng chính sách thu phí Inbound Placement Service Fee ($0.21 - $0.34/unit) nếu gửi hàng vào 1 điểm. Thuật toán Vexim tính toán điểm chia Split thông minh để triệt tiêu chi phí này.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {geoFbaPlacements.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                  plan.recommended
                    ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{plan.strategyName}</span>
                    {plan.recommended && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Đề xuất tối ưu nhất
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{plan.description}</p>

                  {/* Financial calculation */}
                  <div className="rounded-xl bg-slate-50 p-4 space-y-2 border border-slate-100 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Phí Inbound Placement / Unit:</span>
                      <strong className={plan.fbaPlacementFeePerUnit === 0 ? 'text-emerald-600' : 'text-slate-900'}>
                        ${plan.fbaPlacementFeePerUnit.toFixed(2)}/sp
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tổng phí Amazon thu trên lô 3,000 units:</span>
                      <strong className="text-slate-900">${plan.totalPlacementFeeUsd.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Chi phí vận tải nội địa (Freight Inbound):</span>
                      <strong className="text-slate-900">${plan.inboundFreightCostUsd.toFixed(2)}</strong>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm">
                      <span className="text-slate-900">Tổng chi phí đưa hàng vào kho:</span>
                      <span className={plan.recommended ? 'text-emerald-600' : 'text-slate-900'}>
                        ${plan.totalInboundCostUsd.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Regional breakdown */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                      Phân bổ điểm tiếp nhận hàng:
                    </div>
                    {plan.regionalBreakdown.map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-slate-200">
                        <span className="font-medium text-slate-800">{r.region} ({r.warehouseCode})</span>
                        <span className="font-mono font-bold text-cyan-800">{r.percentage}% ({r.units} sp)</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Tốc độ giao Prime:</span>
                  <span className="font-bold text-emerald-700">{plan.avgDeliveryTimeToPrimeBuyer}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 3PL BUFFER & FBA INJECTION DISPATCH */}
      {activeTab === 'buffer3pl' && (
        <div className="space-y-5">
          {/* Top Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                <h2 className="text-base font-bold text-slate-900">
                  Hệ Thống Quản Lý Tồn Kho 3PL California & Cơ Chế Bắn Lệnh Châm Hàng FBA JIT
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Quản lý tồn kho 2 tầng (2-Tier Inventory Ledger): Lưu trữ container tại kho đệm 3PL ngoại quan ở Chino/Ontario (CA) với chi phí thấp ($0.45/pallet/ngày), kết hợp cơ chế bắn lệnh xuất kho tự động (Auto-Dispatch Email / API / Portal 1-Click) để châm hàng vào FBA trong 24h khi FBA chạm ngưỡng an toàn.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-200 px-3 py-1.5 text-xs font-bold font-mono">
                California Hub: Chino &bull; Ontario &bull; Westminster
              </span>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-xs">
              <div className="text-[11px] font-bold uppercase font-mono text-slate-400">Tổng Tồn Kho 3PL Buffer (Mỹ)</div>
              <div className="text-3xl font-black text-slate-900">4,200 <span className="text-sm font-medium text-slate-500">units</span></div>
              <p className="text-xs text-slate-500">Phí lưu kho 3PL: $0.45/pallet/ngày (Tiết kiệm 65% so với phí lưu kho quá hạn FBA).</p>
            </div>

            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 space-y-2 shadow-xs">
              <div className="text-[11px] font-bold uppercase font-mono text-indigo-600">Tồn Kho Active FBA (Kho Amazon)</div>
              <div className="text-3xl font-black text-indigo-700">1,820 <span className="text-sm font-medium text-slate-500">units</span></div>
              <p className="text-xs text-indigo-900">Đủ bán trong 22.4 ngày theo tốc độ hiện tại, chỉ số sức khỏe lưu kho IPI đạt 680.</p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 space-y-2 shadow-xs">
              <div className="text-[11px] font-bold uppercase font-mono text-emerald-700">Tổng Số Ngày Tồn Kho Toàn Chuỗi (Total DOS)</div>
              <div className="text-3xl font-black text-emerald-700">74.2 <span className="text-sm font-medium text-slate-500">ngày</span></div>
              <p className="text-xs text-emerald-800">FBA (22.4d) + 3PL California (51.8d) ➔ An toàn tuyệt đối trước biến số chậm tàu.</p>
            </div>
          </div>

          {/* 3PL SKU Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Boxes size={16} className="text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                  Bảng Kê Tồn Kho Chi Tiết 3PL California & Lệnh Điều Phối Tiếp Viện
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                Tự động kích hoạt Lệnh Châm Hàng khi FBA DOS &le; 14 ngày
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Sản Phẩm & SKU</th>
                    <th className="py-3 px-3">Tồn Kho 3PL CA</th>
                    <th className="py-3 px-3">Tồn FBA Amazon</th>
                    <th className="py-3 px-3">Tốc Độ Bán</th>
                    <th className="py-3 px-3">FBA DOS</th>
                    <th className="py-3 px-3">Cảnh Báo Nhắc Xưởng VN</th>
                    <th className="py-3 px-4 text-right">Thao Tác Điều Phối</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventory.map((item) => {
                    const estimated3plStock = item.sku.includes('VN-COCOA') ? 2400 : item.sku.includes('VN-CASHEW') ? 1200 : 600
                    const isFbaLow = item.daysOfSupply <= 18
                    const is3plLow = estimated3plStock <= 800

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <img src={item.imageUrl} alt={item.title} className="h-9 w-9 rounded-lg object-cover border border-slate-200" />
                            <div>
                              <div className="font-bold text-slate-900 line-clamp-1 max-w-xs">{item.title}</div>
                              <div className="text-[10px] font-mono text-slate-400">SKU: {item.sku}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 text-sm font-mono">{estimated3plStock.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 block font-sans">units tại Chino Hub</span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-bold text-indigo-700 text-sm font-mono">{item.fbaAvailable.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 block font-sans">units tại ONT8</span>
                        </td>

                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {item.dailyVelocity7d} u/ngày
                        </td>

                        <td className="py-3 px-3">
                          <span className={`font-mono font-bold text-xs ${isFbaLow ? 'text-red-600' : 'text-emerald-700'}`}>
                            {item.daysOfSupply.toFixed(1)} ngày
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {is3plLow ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-bold">
                              ⚠️ 3PL Sắp Cạn &rarr; Cần Nhắc Xưởng VN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-medium">
                              🟢 3PL Đủ Bán {(estimated3plStock / Math.max(1, item.dailyVelocity7d)).toFixed(0)} ngày
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {is3plLow && (
                              <button
                                onClick={() => {
                                  showToast(`Đã gửi cảnh báo nhắc xưởng ${item.sku} bắt đầu mẻ sản xuất mới!`, 'info')
                                }}
                                className="rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 text-[11px] font-bold text-amber-900 transition-colors"
                              >
                                🔔 Nhắc Xưởng SX
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelected3plItem({
                                  ...item,
                                  recommendedTransferQty: isFbaLow ? 600 : 300,
                                })
                                setIsThreePlModalOpen(true)
                              }}
                              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer active:scale-[0.98]"
                            >
                              <Truck size={13} />
                              <span>Bắn Lệnh Châm FBA</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FORWARDER WEBHOOK & LIVE TRACKING */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-bold text-slate-900">Forwarder Tracking Webhook Endpoint (REST & EDI 214)</h2>
              </div>
              <p className="text-xs text-slate-500">
                Endpoint nhận dữ liệu tự động từ các đối tác Flexport, Kerry, Maersk, Unifa, Project44: <code className="font-mono text-indigo-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded">POST /api/webhooks/logistics</code>
              </p>
            </div>

            <button
              onClick={handleTestWebhookPing}
              disabled={isSimulatingWebhook}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 transition-all shrink-0 cursor-pointer"
            >
              {isSimulatingWebhook ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
              <span>Mô phỏng Nhận Webhook Payload</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Nhật Ký Dữ Liệu Vận Chuyển Real-Time (Live Forwarder Stream)
            </h3>

            <div className="divide-y divide-slate-100">
              {webhookLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    <Ship size={16} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{log.carrier}</span>
                      <span className="font-mono text-[10px] text-slate-400">{log.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded font-bold text-slate-700">{log.trackingNo}</span>
                      <span>&bull;</span>
                      <span className="text-cyan-800 font-semibold">{log.location}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{log.statusVi}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Barcode & Label Print Modal */}
      <BarcodeAndLabelPrintModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        product={selectedProduct}
        allProducts={products}
      />
      {/* 3PL Dispatch & FBA Injection Modal */}
      <ThreePlDispatchModal
        isOpen={isThreePlModalOpen}
        onClose={() => setIsThreePlModalOpen(false)}
        item={selected3plItem}
        onSuccess={(data) => {
          showToast(`Đã bắn Lệnh Xuất Kho ${data.transferQty} units (${data.fbaShipmentCode}) tới ${data.selected3pl}!`, 'success')
        }}
      />

      {/* Vexim Booking Confirmation Modal */}
      <VeximBookingConfirmationModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        item={selectedItemForBooking}
        onConfirm={(data) => {
          confirmShipmentBooking(data)
        }}
      />
    </div>
  )
}
