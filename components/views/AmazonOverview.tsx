'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import { computeReadiness, computeMarginPct } from '@/lib/readiness-engine'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  Boxes,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  Flame,
  Globe2,
  HeartPulse,
  Megaphone,
  Package,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const revenueTrendData7d = [
  { day: '01/09', grossSales: 8420, organicSales: 5120, adSales: 3300, adSpend: 780, sessions: 2840, orders: 280 },
  { day: '02/09', grossSales: 9650, organicSales: 5900, adSales: 3750, adSpend: 840, sessions: 3120, orders: 320 },
  { day: '03/09', grossSales: 9100, organicSales: 5400, adSales: 3700, adSpend: 810, sessions: 2950, orders: 295 },
  { day: '04/09', grossSales: 11200, organicSales: 6800, adSales: 4400, adSpend: 950, sessions: 3680, orders: 380 },
  { day: '05/09', grossSales: 12450, organicSales: 7900, adSales: 4550, adSpend: 980, sessions: 4100, orders: 415 },
  { day: '06/09', grossSales: 13800, organicSales: 8900, adSales: 4900, adSpend: 1050, sessions: 4450, orders: 460 },
  { day: '07/09', grossSales: 14200, organicSales: 9200, adSales: 5000, adSpend: 1100, sessions: 4600, orders: 480 },
]

export function AmazonOverview() {
  const {
    timeRange,
    setTimeRange,
    filteredProducts,
    filteredInventory,
    filteredOrders,
    filteredRecommendations,
    setActiveTab,
    accountHealth,
    currentRole,
  } = useAppState()

  const pendingUrgentRecs = filteredRecommendations.filter((r) => r.priority === 'CRITICAL' || r.priority === 'HIGH')

  return (
    <div className="space-y-6">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Amazon US Marketplace Performance (ATVPDKIKX0DER)
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Tổng quan Vận hành Amazon
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu đồng bộ trực tiếp từ Amazon Selling Partner API (SP-API) & Ads API.
          </p>
        </div>

        {/* Time Period Pill Selector */}
        <div className="flex items-center rounded-xl border border-border bg-white p-1 shadow-xs">
          {[
            { id: 'today', label: 'Hôm nay' },
            { id: 'yesterday', label: 'Hôm qua' },
            { id: '7days', label: '7 ngày qua' },
            { id: '30days', label: '30 ngày qua' },
            { id: '90days', label: 'Quý này' },
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setTimeRange(period.id as any)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                timeRange === period.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Proactive Alert Banner (if critical issues exist) */}
      {pendingUrgentRecs.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50/70 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-amber-900">
                AI phát hiện {pendingUrgentRecs.length} vấn đề cần đội ngũ Vận hành phê duyệt ngay
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Bao gồm rủi ro hết hàng SKU Chocolate 70% trong 11 ngày và từ khóa PPC bleeding ACOS 88%.
              </p>
            </div>
          </div>

          {currentRole !== 'CLIENT_SUPPLIER' ? (
            <button
              onClick={() => setActiveTab('ai-operations')}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors shrink-0 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Xem & Phê duyệt tại AI Center</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('supplier-portal')}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors shrink-0 cursor-pointer"
            >
              <ShieldCheck size={14} />
              <span>Xem Cổng Tài Chính P&L</span>
            </button>
          )}
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        {/* Gross Revenue */}
        <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Doanh thu (Gross Sales)</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <CircleDollarSign size={18} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">$68,420</div>
          <div className="mt-1 flex items-center gap-1 text-[11px]">
            <span className="flex items-center font-bold text-emerald-600">
              <ArrowUpRight size={13} /> +18.4%
            </span>
            <span className="text-slate-400">so với kỳ trước</span>
          </div>
        </div>

        {/* Orders & Units */}
        <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Đơn hàng (Orders)</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <PackageCheck size={18} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">2,190 <span className="text-xs font-normal text-slate-400">(2,845 units)</span></div>
          <div className="mt-1 flex items-center gap-1 text-[11px]">
            <span className="flex items-center font-bold text-emerald-600">
              <ArrowUpRight size={13} /> +12.1%
            </span>
            <span className="text-slate-400">AOV: $31.24</span>
          </div>
        </div>

        {/* Conversion Rate (CVR) */}
        <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tỷ lệ Chuyển đổi (CVR)</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">12.4%</div>
          <div className="mt-1 flex items-center gap-1 text-[11px]">
            <span className="flex items-center font-bold text-emerald-600">
              <ArrowUpRight size={13} /> +1.6%
            </span>
            <span className="text-slate-400">22,940 sessions</span>
          </div>
        </div>

        {/* Estimated Profit & Margin */}
        <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Lợi nhuận gộp ước tính</span>
            <div className="rounded-lg bg-teal-50 p-2 text-teal-600">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">$27,950</div>
          <div className="mt-1 flex items-center gap-1 text-[11px]">
            <span className="font-bold text-teal-700">Biên lợi nhuận 40.8%</span>
            <span className="text-slate-400">sau FBA fee</span>
          </div>
        </div>
      </div>

      {/* Secondary Advertising & Health Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        {/* Ad Spend */}
        <div className="rounded-xl border border-border bg-white p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Chi phí Quảng cáo (Ad Spend)</div>
          <div className="text-lg font-bold text-slate-900 mt-1">$9,850</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tạo ra $41,200 Ad Sales</div>
        </div>

        {/* ACOS & TACOS */}
        <div className="rounded-xl border border-border bg-white p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">ACOS / TACOS</div>
          <div className="text-lg font-bold text-slate-900 mt-1">
            23.9% <span className="text-xs font-normal text-slate-500">/ TACOS 14.4%</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Dưới ngưỡng mục tiêu 25%</div>
        </div>

        {/* Inventory Value */}
        <div className="rounded-xl border border-border bg-white p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Giá trị Tồn kho FBA</div>
          <div className="text-lg font-bold text-slate-900 mt-1">$4,948 <span className="text-xs font-normal text-slate-400">(COGS)</span></div>
          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">1 SKU cần nhập khẩn</div>
        </div>

        {/* Account Health */}
        <div className="rounded-xl border border-border bg-white p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Sức khỏe Tài khoản (AHR)</div>
          <div className="text-lg font-bold text-emerald-600 mt-1 flex items-center gap-1">
            <ShieldCheck size={18} />
            <span>288 / 1000</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Trạng thái: Healthy (0 vi phạm)</div>
        </div>
      </div>

      {/* Main Chart Section: Sales Trend & Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales & Traffic Trend Chart (2 cols) */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Biểu đồ Doanh thu & Quảng cáo theo ngày</h2>
              <p className="text-xs text-slate-400">Doanh thu tự nhiên (Organic) vs Doanh thu qua tài trợ (Ads)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Organic Sales
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Ad Sales
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Ad Spend
              </span>
            </div>
          </div>

          <div className="mt-5 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData7d} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAds" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  formatter={(value: any, name: any) => [`$${value.toLocaleString()}`, name === 'organicSales' ? 'Organic Sales' : name === 'adSales' ? 'Ad Sales' : 'Ad Spend']}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '11px', border: 'none' }}
                />
                <Area type="monotone" dataKey="organicSales" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOrganic)" />
                <Area type="monotone" dataKey="adSales" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAds)" />
                <Line type="monotone" dataKey="adSpend" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Card: AI Executive Summary & Diagnostics */}
        <div className="flex flex-col justify-between rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 via-white to-slate-50 p-5 shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Bot size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">AI Sales Analyst</h3>
                  <span className="text-[10px] text-slate-500">Tự động chẩn đoán tuần này</span>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Tăng trưởng tốt
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="rounded-lg bg-white p-3 border border-slate-100 shadow-xs">
                <strong className="text-blue-900 block font-semibold">1. Điều gì đã thay đổi?</strong>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Doanh thu tăng +18.4% đạt $68,420. Tỷ lệ chuyển đổi CVR tăng mạnh từ 10.8% lên 12.4%.
                </p>
              </div>

              <div className="rounded-lg bg-white p-3 border border-slate-100 shadow-xs">
                <strong className="text-blue-900 block font-semibold">2. Tại sao có sự thay đổi?</strong>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Vexim đã cập nhật A+ Content và tiêu đề cho SKU Chocolate 70%, giúp tăng thêm +34% add-to-cart.
                </p>
              </div>

              <div className="rounded-lg bg-white p-3 border border-slate-100 shadow-xs">
                <strong className="text-blue-900 block font-semibold">3. Hành động đề xuất tiếp theo?</strong>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Cần bổ sung 1,200 units FBA ngay trước ngày 19/09 để tránh bị gián đoạn Best Seller Rank.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('sales-analyst')}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
          >
            <Sparkles size={14} />
            <span>Xem phân tích chi tiết AI Analyst</span>
          </button>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Danh mục Sản phẩm Vận hành</h2>
            <p className="text-xs text-slate-400">Hiệu suất và tồn kho FBA của từng mã SKU</p>
          </div>
          <button
            onClick={() => setActiveTab('products')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Xem tất cả sản phẩm →
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">Sản phẩm / SKU</th>
                <th className="py-2.5 px-3">Giá bán</th>
                <th className="py-2.5 px-3">Biên lợi nhuận</th>
                <th className="py-2.5 px-3">Tồn kho FBA</th>
                <th className="py-2.5 px-3">Tốc độ bán (7d)</th>
                <th className="py-2.5 px-3">Amazon Readiness</th>
                <th className="py-2.5 px-3 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.mainImage}
                        alt={prod.title}
                        className="h-9 w-9 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 line-clamp-1 max-w-sm">{prod.title}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          SKU: {prod.sku} • ASIN: {prod.asin}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">${prod.price.toFixed(2)}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-emerald-600">{computeMarginPct(prod)}%</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-800">
                      {filteredInventory.find((i) => i.sku === prod.sku)?.fbaAvailable || 0} units
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {filteredInventory.find((i) => i.sku === prod.sku)?.dailyVelocity7d || 0} units/ngày
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full ${
                            computeReadiness(prod).overall >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${computeReadiness(prod).overall}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-700">
                        {computeReadiness(prod).overall}/100
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        prod.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {prod.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
