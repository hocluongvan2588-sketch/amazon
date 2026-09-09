'use client'

import React, { useState, useMemo } from 'react'
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
  const { dynamicLeadTimeRoutes, geoFbaPlacements, inventory, products, showToast } = useAppState()
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-catlai-lax')
  const [activeTab, setActiveTab] = useState<'landedcost' | 'leadtime' | 'geoplacement' | 'buffer3pl' | 'webhooks'>('landedcost')
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false)

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
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'webhooks'
              ? 'border-cyan-600 text-cyan-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Radio size={16} />
          <span>Forwarder Webhook & Tracking</span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
        </button>
      </div>

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

      {/* TAB 3: 3PL BUFFER */}
      {activeTab === 'buffer3pl' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Mô hình Kho đệm 3PL California + Châm hàng FBA JIT</h2>
            <p className="text-xs text-slate-500">
              Giải pháp tối ưu cho doanh nghiệp Việt: Nhập container 40ft vào kho 3PL ngoại quan tại California với giá lưu kho rẻ, sau đó định kỳ châm từng pallet vào kho Amazon FBA để né phí lưu kho phạt quá hạn (Aged Inventory Surcharge).
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="text-xs font-bold uppercase font-mono text-slate-400">Tồn kho 3PL Buffer (California)</div>
              <div className="text-2xl font-black text-slate-900">4,200 <span className="text-xs font-medium text-slate-500">units</span></div>
              <p className="text-xs text-slate-500">Chi phí lưu kho 3PL: $0.45/pallet/ngày (Rẻ hơn 65% so với Amazon Q4 storage).</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="text-xs font-bold uppercase font-mono text-slate-400">Tồn kho Active FBA</div>
              <div className="text-2xl font-black text-indigo-700">1,820 <span className="text-xs font-medium text-slate-500">units</span></div>
              <p className="text-xs text-slate-500">Đủ bán trong 22.4 ngày theo tốc độ hiện tại, điểm sức khỏe tồn IPI đạt 680.</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3">
              <div className="text-xs font-bold uppercase font-mono text-emerald-700">Lệnh châm hàng tự động (JIT Trigger)</div>
              <div className="text-2xl font-black text-emerald-700">7 ngày nữa</div>
              <p className="text-xs text-emerald-800">Hệ thống sẽ tự động tạo Shipment 800 units từ kho 3PL sang kho ONT8 khi FBA còn 14 ngày tồn.</p>
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
    </div>
  )
}
