'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import {
  AlertCircle,
  Anchor,
  ArrowRight,
  Boxes,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  Flame,
  Globe2,
  MapPin,
  Navigation,
  Package,
  Ship,
  Sparkles,
  TrendingUp,
  Truck,
  Zap,
} from 'lucide-react'

export function SupplyChainHub() {
  const { dynamicLeadTimeRoutes, geoFbaPlacements, inventory } = useAppState()
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-catlai-lax')
  const [activeTab, setActiveTab] = useState<'leadtime' | 'geoplacement' | 'buffer3pl'>('leadtime')

  const currentRoute = dynamicLeadTimeRoutes.find((r) => r.id === selectedRouteId) || dynamicLeadTimeRoutes[0]

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-cyan-950 p-6 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-cyan-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
              Deep-Tech Logistics Hub
            </span>
            <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-medium">
              <Ship size={13} />
              Trans-Pacific Dynamic Matrix
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Supply Chain Modeling & Geo-FBA Hub</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
            Mô phỏng thời gian Lead Time thực tế (Hải quan Mỹ, Kẹt cảng Cát Lái / Long Beach) và thuật toán phân bổ kho FBA Bờ Đông - Bờ Tây giảm phí Inbound Fee 2026.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs text-right">
            <div className="text-[10px] uppercase font-mono text-slate-400">Lead Time Tuyến LAX</div>
            <div className="text-lg font-extrabold text-cyan-400">{currentRoute.totalLeadTimeDays} Ngày</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs text-right">
            <div className="text-[10px] uppercase font-mono text-slate-400">Tiết kiệm Inbound Split</div>
            <div className="text-lg font-extrabold text-emerald-400">+$840 / Lô</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('leadtime')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'leadtime'
              ? 'border-cyan-600 text-cyan-700'
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
              ? 'border-cyan-600 text-cyan-700'
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
              ? 'border-cyan-600 text-cyan-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes size={16} />
          <span>3PL Buffer & JIT Restock</span>
        </button>
      </div>

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
    </div>
  )
}
