'use client'

import React, { useState } from 'react'
import { SupplierReadyConfirmationModal } from "@/components/modals/SupplierReadyConfirmationModal"
import { useAppState } from '@/lib/state-context'
import { InventoryItem, InventoryRisk } from '@/lib/types'
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Flame,
  Layers,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Ship,
  Sparkles,
  TrendingUp,
  Truck,
  Zap,
} from 'lucide-react'

export function InventoryManagement() {
  const {
    filteredInventory,
    openModal,
    createTask,
    setActiveTab,
    currentRole,
    showToast,
    submitSupplierReadyNotification,
  } = useAppState()
  const [filterRisk, setFilterRisk] = useState<InventoryRisk | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItemForReady, setSelectedItemForReady] = useState<InventoryItem | null>(null)
  const [isReadyModalOpen, setIsReadyModalOpen] = useState(false)

  const displayedItems = filteredInventory.filter((item) => {
    if (filterRisk !== 'ALL' && item.riskLevel !== filterRisk) return false
    if (searchQuery && !item.sku.toLowerCase().includes(searchQuery.toLowerCase()) && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  const getRiskBadge = (risk: InventoryRisk) => {
    switch (risk) {
      case 'CRITICAL':
        return {
          pill: 'bg-red-500 text-white font-bold',
          badge: '🔴 CRITICAL (< 14d)',
          desc: 'Nguy cơ đứt hàng trước khi nhập',
        }
      case 'HIGH':
        return {
          pill: 'bg-amber-500 text-white font-bold',
          badge: '🟠 HIGH (14 - 21d)',
          desc: 'Tồn kho thấp, cần đặt hàng',
        }
      case 'MEDIUM':
        return {
          pill: 'bg-blue-100 text-blue-800 font-semibold',
          badge: '🔵 MEDIUM (21 - 30d)',
          desc: 'Theo dõi chu kỳ sản xuất',
        }
      case 'HEALTHY':
        return {
          pill: 'bg-emerald-100 text-emerald-800 font-semibold',
          badge: '🟢 HEALTHY (> 30d)',
          desc: 'Tồn kho ổn định',
        }
      default:
        return {
          pill: 'bg-slate-100 text-slate-700 font-medium',
          badge: 'OVERSTOCK',
          desc: 'Tồn kho dư thừa',
        }
    }
  }

  const handleActionClick = (item: InventoryItem) => {
    if (currentRole === 'CLIENT_SUPPLIER') {
      setSelectedItemForReady(item)
      setIsReadyModalOpen(true)
    } else {
      createTask({
        clientId: item.clientId,
        title: `Tạo Purchase Order ${item.recommendedReorderQty} units SKU ${item.sku}`,
        description: `Tồn kho khả dụng: ${item.fbaAvailable} units (Days of Supply: ${item.daysOfSupply.toFixed(1)} ngày). Cần book xưởng sản xuất và chuẩn bị hồ sơ xuất khẩu.`,
        priority: item.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        status: 'OPEN',
        assignedRole: 'OPS_MANAGER',
        source: 'AI_INVENTORY_AGENT',
        linkedEntity: { type: 'INVENTORY', id: item.id, name: item.sku },
      })
      if (showToast) {
        showToast(`Đã tạo Task PO cho Logistics Lead Ánh Nguyễn!`, 'success')
      }
    }
  }

  const handleConfirmSupplierReady = (data: any) => {
    submitSupplierReadyNotification(data)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              FBA Inventory Velocity & Supply Chain Forecasting
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Quản lý Tồn kho & Dự báo FBA
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tính toán Days of Supply theo thời gian thực kết hợp chu kỳ sản xuất tại xưởng Việt Nam + Hải trình cảng Long Beach (Lead time ~32 ngày).
          </p>
        </div>

        {currentRole === 'CLIENT_SUPPLIER' ? (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('supplier-portal')}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-all cursor-pointer"
            >
              <Boxes size={14} />
              <span>Về Cổng Doanh Nghiệp P&L</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('ai-operations')}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-all"
            >
              <Sparkles size={14} />
              <span>Xem Đề xuất Nhập hàng tại AI Center</span>
            </button>
          </div>
        )}
      </div>

      {/* Inventory Metric Highlights */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Tổng SKU Đang Quản lý</div>
          <div className="mt-1 text-2xl font-black text-slate-900">{filteredInventory.length} SKUs</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Kho Amazon US FBA</div>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50/40 p-4 shadow-xs">
          <div className="text-xs font-bold text-red-700">Rủi ro Hết hàng (Critical)</div>
          <div className="mt-1 text-2xl font-black text-red-900">
            {filteredInventory.filter((i) => i.riskLevel === 'CRITICAL').length} SKUs
          </div>
          <div className="text-[10px] text-red-600 mt-0.5">&lt; 14 ngày tồn kho</div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 shadow-xs">
          <div className="text-xs font-bold text-blue-700">Hàng Đang Trên Biển (Inbound)</div>
          <div className="mt-1 text-2xl font-black text-blue-900">
            {filteredInventory.reduce((acc, i) => acc + i.fbaInbound, 0)} units
          </div>
          <div className="text-[10px] text-blue-600 mt-0.5">Đang vận chuyển tới LGB8, ONT8</div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Chu kỳ Lead Time Bình quân</div>
          <div className="mt-1 text-2xl font-black text-slate-900">32 Ngày</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Xưởng VN (7d) + Sea (21d) + FC (4d)</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 mr-1">
            <Filter size={13} /> Lọc mức độ rủi ro:
          </span>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'CRITICAL', label: '🔴 Critical (<14d)' },
            { id: 'HIGH', label: '🟠 High (14-21d)' },
            { id: 'MEDIUM', label: '🔵 Medium (21-30d)' },
            { id: 'HEALTHY', label: '🟢 Healthy (>30d)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterRisk(tab.id as any)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                filterRisk === tab.id
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-56">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm SKU hoặc tên hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-slate-50 pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="rounded-xl border border-border bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Sản phẩm / SKU</th>
                <th className="py-3 px-3">Tồn khả dụng (FBA)</th>
                <th className="py-3 px-3">Hàng giữ (Reserved)</th>
                <th className="py-3 px-3">Đang về (Inbound)</th>
                <th className="py-3 px-3">Tốc độ bán (7d / 30d)</th>
                <th className="py-3 px-3">Days of Supply (DOS)</th>
                <th className="py-3 px-3">Rủi ro Tồn kho</th>
                <th className="py-3 px-3">Đề xuất Nhập (AI PO)</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedItems.map((item) => {
                const riskInfo = getRiskBadge(item.riskLevel)

                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 line-clamp-1 max-w-xs">{item.title}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            SKU: {item.sku} • ASIN: {item.asin}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-sm text-slate-900">{item.fbaAvailable}</span>
                      <span className="text-[10px] text-slate-400 block">units</span>
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      <span>{item.fbaReserved} units</span>
                    </td>

                    <td className="py-3 px-3">
                      {item.fbaInbound > 0 ? (
                        <span className="flex items-center gap-1 font-semibold text-blue-700">
                          <Ship size={13} /> {item.fbaInbound} units
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{item.dailyVelocity7d} u/ngày</div>
                      <div className="text-[10px] text-slate-400">30d: {item.dailyVelocity30d} u/ngày</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono text-sm font-black text-slate-900">
                        {item.daysOfSupply.toFixed(1)} ngày
                      </div>
                      {item.estimatedStockoutDate && (
                        <div className="text-[10px] font-mono text-red-600">
                          Hết hàng: {item.estimatedStockoutDate}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] ${riskInfo.pill}`}>
                        {riskInfo.badge}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {item.recommendedReorderQty > 0 ? (
                        <span className="font-bold text-blue-700">
                          +{item.recommendedReorderQty} units
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Chưa cần đặt</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {item.supplierReadyStatus === 'FACTORY_READY' ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-300">
                            <CheckCircle2 size={12} className="text-emerald-600" />
                            <span>Đã Báo Sẵn Sàng (+{item.supplierReadyQty || item.recommendedReorderQty} sp)</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Ngày lấy hàng: {item.supplierReadyDate || '12/09'}
                          </span>
                        </div>
                      ) : item.recommendedReorderQty > 0 ? (
                        <button
                          onClick={() => handleActionClick(item)}
                          className={`rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer ${
                            currentRole === 'CLIENT_SUPPLIER'
                              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:scale-[0.98]'
                              : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
                          }`}
                          title={
                            currentRole === 'CLIENT_SUPPLIER'
                              ? 'Mở phiếu xác nhận lô hàng đã đóng gói xong để Vexim điều xe đến lấy'
                              : 'Tạo Task PO giao việc nội bộ cho Logistics Lead'
                          }
                        >
                          {currentRole === 'CLIENT_SUPPLIER' ? '📦 Báo Xưởng Đã Sẵn Sàng' : 'Tạo Task PO'}
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">Tồn kho ổn định</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Supplier Ready Confirmation Modal */}
      <SupplierReadyConfirmationModal
        isOpen={isReadyModalOpen}
        onClose={() => setIsReadyModalOpen(false)}
        item={selectedItemForReady}
        onConfirm={handleConfirmSupplierReady}
      />
    </div>
  )
}
