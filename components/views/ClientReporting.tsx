'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import { ClientPerformanceReport } from '@/lib/types'
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpRight,
  Bot,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  PackageCheck,
  Printer,
  Share2,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

export function ClientReporting() {
  const { filteredReports, selectedClientId, clients } = useAppState()
  const report = filteredReports[0]
  const client = clients.find((c) => c.id === selectedClientId)

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    if (!report) return
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Gross Sales,$${report.grossSales}\n` +
      `Growth Rate,${report.salesGrowthPercent}%\n` +
      `Orders,${report.ordersCount}\n` +
      `Units,${report.unitsSold}\n` +
      `Conversion Rate,${report.conversionRate}%\n` +
      `ACOS,${report.acos}%\n` +
      `Estimated Net Profit,$${report.estimatedGrossProfit}\n`

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Vexim_Amazon_Report_${client?.name || 'Supplier'}_Aug2026.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Supplier Executive Reporting & AI Summary (Section 24, 25)
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Báo cáo Hiệu suất Dành cho Nhà cung cấp
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            AI tự động tổng hợp báo cáo kinh doanh dễ hiểu bằng tiếng Việt — Nhà cung cấp không cần phải đọc 20 biểu đồ phức tạp.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download size={14} />
            <span>Xuất CSV / Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-all"
          >
            <Printer size={14} />
            <span>In Báo cáo (PDF Export)</span>
          </button>
        </div>
      </div>

      {report ? (
        <div className="space-y-6">
          {/* AI Executive Summary Callout Box */}
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/30 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-blue-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-blue-950">Bản Tóm tắt Điều hành từ Vexim AI (Executive Summary)</h3>
                  <span className="text-[11px] text-slate-500">Kỳ báo cáo: {report.startDate} đến {report.endDate}</span>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                Tăng trưởng +{report.salesGrowthPercent}%
              </span>
            </div>

            <p className="text-sm text-slate-800 leading-relaxed font-medium bg-white p-5 rounded-xl border border-blue-100 shadow-2xs">
              "{report.executiveSummaryVi}"
            </p>
          </div>

          {/* Supplier KPI Quad Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
              <span className="text-xs text-slate-500">Doanh thu Amazon US</span>
              <div className="mt-1 text-2xl font-black text-slate-900">${report.grossSales.toLocaleString()}</div>
              <div className="mt-1 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <ArrowUpRight size={13} /> +{report.salesGrowthPercent}% so với tháng trước
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
              <span className="text-xs text-slate-500">Đơn hàng Đã Giao (FBA)</span>
              <div className="mt-1 text-2xl font-black text-slate-900">{report.ordersCount} đơn</div>
              <div className="mt-1 text-[11px] text-slate-400">({report.unitsSold} sản phẩm bán ra)</div>
            </div>

            <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
              <span className="text-xs text-slate-500">Lợi nhuận gộp ước tính</span>
              <div className="mt-1 text-2xl font-black text-teal-700">${report.estimatedGrossProfit.toLocaleString()}</div>
              <div className="mt-1 text-[11px] font-bold text-teal-800">Biên lợi nhuận {report.estimatedNetMarginPercent}%</div>
            </div>

            <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
              <span className="text-xs text-slate-500">Tỷ lệ Chuyển đổi (CVR)</span>
              <div className="mt-1 text-2xl font-black text-indigo-900">{report.conversionRate}%</div>
              <div className="mt-1 text-[11px] text-emerald-600 font-bold">Cải thiện từ {report.previousConversionRate}%</div>
            </div>
          </div>

          {/* Top Performers & Action Plan Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top Products */}
            <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Top Sản phẩm Đóng góp Doanh thu
              </h4>
              <div className="space-y-2.5">
                {report.topPerformers.map((top) => (
                  <div
                    key={top.sku}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-3 border border-slate-100"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{top.title}</div>
                      <div className="text-[10px] font-mono text-slate-400">SKU: {top.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-blue-700">${top.revenue.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">{top.units} units bán</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Plan from Vexim */}
            <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Kế hoạch Hành động Vexim đề xuất cho tháng tới
              </h4>
              <div className="space-y-2">
                {report.keyRisksAndActionPlan.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold font-mono text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-xs text-slate-400">
          Chưa có báo cáo cho nhà cung cấp này.
        </div>
      )}
    </div>
  )
}
