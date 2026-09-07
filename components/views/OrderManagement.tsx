'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import { Order } from '@/lib/types'
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Boxes,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Globe2,
  MapPin,
  Package,
  PackageCheck,
  Search,
  Truck,
  XCircle,
} from 'lucide-react'

export function OrderManagement() {
  const { filteredOrders } = useAppState()
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const displayedOrders = filteredOrders.filter((order) => {
    if (selectedStatus !== 'ALL' && order.orderStatus !== selectedStatus) return false
    if (
      searchQuery &&
      !order.amazonOrderId.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !order.customerCity.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }
    return true
  })

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800'
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800'
      case 'UNSHIPPED':
        return 'bg-indigo-100 text-indigo-800'
      case 'PENDING':
        return 'bg-amber-100 text-amber-800'
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-700'
      case 'REFUNDED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              FBA Real-time Fulfillment & Problem Stream
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Quản lý Đơn hàng & Vận chuyển
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu đồng bộ trực tiếp từ Amazon Orders API (FBA Fulfillment, Tracking Numbers, và Chẩn đoán Problem Orders).
          </p>
        </div>
      </div>

      {/* Order Status Counters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:gap-4">
        {[
          { label: 'Tổng Đơn hàng', count: 2190, tone: 'text-slate-900' },
          { label: 'Đang Giao (Shipped)', count: 420, tone: 'text-blue-600' },
          { label: 'Đã Giao (Delivered)', count: 1725, tone: 'text-emerald-600' },
          { label: 'Chờ Xử lý (Pending)', count: 32, tone: 'text-amber-600' },
          { label: 'Đơn có Vấn đề (Problem)', count: 13, tone: 'text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-white p-3.5 shadow-xs">
            <div className="text-[11px] font-medium text-slate-500">{stat.label}</div>
            <div className={`mt-1 text-2xl font-black ${stat.tone}`}>{stat.count}</div>
          </div>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 mr-1">
            <Filter size={13} /> Lọc theo trạng thái:
          </span>
          {['ALL', 'PENDING', 'UNSHIPPED', 'SHIPPED', 'DELIVERED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedStatus === st
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-56">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm mã Amazon Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-slate-50 pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-border bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Amazon Order ID</th>
                <th className="py-3 px-3">Thời gian đặt</th>
                <th className="py-3 px-3">Sản phẩm & Số lượng</th>
                <th className="py-3 px-3">Giá trị đơn</th>
                <th className="py-3 px-3">Fulfillment</th>
                <th className="py-3 px-3">Địa chỉ nhận (US)</th>
                <th className="py-3 px-3">Vận chuyển / Tracking</th>
                <th className="py-3 px-4 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedOrders.map((ord) => (
                <React.Fragment key={ord.id}>
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {ord.amazonOrderId}
                    </td>

                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {new Date(ord.purchaseDate).toLocaleString('vi-VN', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 line-clamp-1 max-w-xs">
                        {ord.items[0]?.title}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {ord.items[0]?.sku} • x{ord.items[0]?.quantity} unit
                      </div>
                    </td>

                    <td className="py-3 px-3 font-bold text-slate-900">${ord.orderTotal.toFixed(2)}</td>

                    <td className="py-3 px-3">
                      <span className="rounded bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                        {ord.fulfillmentChannel}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        {ord.customerCity}, {ord.customerState} {ord.customerPostalCode}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[11px] text-slate-600">
                      {ord.carrier ? (
                        <div>
                          <div className="font-medium text-slate-800">{ord.carrier}</div>
                          <div className="font-mono text-[9px] text-slate-400">{ord.trackingNumber}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Đang chuẩn bị hàng</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(ord.orderStatus)}`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                  </tr>

                  {/* Problem Order AI Diagnosis Banner */}
                  {ord.hasProblem && ord.aiProblemDiagnosis && (
                    <tr className="bg-amber-50/50">
                      <td colSpan={8} className="py-2.5 px-4 text-xs border-b border-amber-200">
                        <div className="flex items-center gap-2 text-amber-900">
                          <Bot size={14} className="text-amber-600 shrink-0" />
                          <strong className="font-bold">Chẩn đoán sự cố đơn hàng (AI Diagnosis): </strong>
                          <span>{ord.aiProblemDiagnosis}</span>
                          <span className="text-amber-700/80 font-mono text-[10px] ml-auto">({ord.problemReason})</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
