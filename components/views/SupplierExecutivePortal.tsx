'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Building2,
  CheckCircle2,
  Coins,
  DollarSign,
  Download,
  Flame,
  Globe2,
  Lock,
  MessageSquare,
  Package,
  PhoneCall,
  PieChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
} from 'lucide-react'

export function SupplierExecutivePortal() {
  const { clients, selectedClientId, reports, inventory } = useAppState()
  const [currency, setCurrency] = useState<'USD' | 'VND'>('VND')
  const exchangeRate = 25450 // 1 USD = 25,450 VND

  const activeClient = clients.find((c) => c.id === (selectedClientId === 'ALL' ? 'client-vina-01' : selectedClientId)) || clients[0]
  const clientReport = reports.find((r) => r.clientId === activeClient.id) || reports[0]

  const formatMoney = (usdAmount: number) => {
    if (currency === 'USD') {
      return `$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }
    const vndAmount = usdAmount * exchangeRate
    if (vndAmount >= 1_000_000_000) {
      return `${(vndAmount / 1_000_000_000).toFixed(2)} Tỷ VNĐ`
    }
    return `${(vndAmount / 1_000_000).toFixed(0)} Triệu VNĐ`
  }

  // Financial Waterfall breakdown (Estimated based on standard Amazon US structure)
  const grossSales = clientReport.grossSales
  const amazonReferralFee = grossSales * 0.15 // 15% referral
  const fbaFulfillmentFee = grossSales * 0.22 // ~22% FBA pick & pack
  const ppcSpend = clientReport.adSpend
  const oceanFreightAnd3pl = grossSales * 0.065 // ~6.5% Ocean freight + 3PL buffer storage & drayage
  const cogsManufacturing = grossSales * 0.28 // ~28% COGS
  const estimatedNetProfit = grossSales - amazonReferralFee - fbaFulfillmentFee - ppcSpend - oceanFreightAnd3pl - cogsManufacturing

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-blue-950 p-6 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-sky-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-sky-300 uppercase tracking-wider">
              Cổng Thông Tin Doanh Nghiệp Việt Nam
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck size={14} />
              Vexim Managed Service Active
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {activeClient.companyName}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
            Gian hàng Amazon US: <strong className="text-sky-300">{activeClient.amazonStoreName}</strong> &bull; Gói dịch vụ: <strong className="text-emerald-300">{activeClient.serviceTier.replace('_', ' ')}</strong>
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-xl backdrop-blur-xs border border-white/10">
          <button
            onClick={() => setCurrency('VND')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              currency === 'VND' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            🇻🇳 VNĐ (Tỷ giá 25,450)
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              currency === 'USD' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            🇺🇸 USD ($)
          </button>
        </div>
      </div>

      {/* 4 Core Financial Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Doanh thu 30 ngày</span>
            <Coins size={16} className="text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{formatMoney(grossSales)}</div>
          <div className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-600">
            <ArrowUpRight size={14} />
            <span>+{clientReport.salesGrowthPercent}% so với tháng trước</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Lợi nhuận ròng ước tính</span>
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">{formatMoney(estimatedNetProfit)}</div>
          <div className="mt-1 text-xs text-slate-500 font-medium">
            Biên lợi nhuận ròng: <strong className="text-emerald-700">{clientReport.estimatedNetMarginPercent}%</strong>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Đơn hàng & Sản phẩm bán</span>
            <Package size={16} className="text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{clientReport.ordersCount.toLocaleString()} <span className="text-sm font-normal text-slate-500">đơn</span></div>
          <div className="mt-1 text-xs text-slate-500">
            Tổng: <strong>{clientReport.unitsSold.toLocaleString()} sản phẩm</strong>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Hiệu quả Quảng cáo (TACOS)</span>
            <Flame size={16} className="text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{clientReport.tacos}%</div>
          <div className="mt-1 text-xs text-emerald-600 font-bold">
            ✓ Nằm trong ngưỡng an toàn (&lt; 15%)
          </div>
        </div>
      </div>

      {/* Financial P&L Waterfall Breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Bảng Bóc Tách Dòng Tiền & Lợi Nhuận Thực Nhận (P&L Waterfall)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Minh bạch 100% từng đồng chi phí trên Amazon US để đối soát với khoản tiền về tài khoản ngân hàng Việt Nam.
            </p>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">
            <Download size={14} />
            <span>Tải Báo Cáo Excel</span>
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 font-bold">
            <span className="text-slate-900">(+) Tổng Doanh Thu Bán Hàng (Gross Merchandise Value):</span>
            <span className="text-slate-900 text-sm">{formatMoney(grossSales)} (100%)</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/40 border border-red-100 text-red-900 font-medium">
            <span>(-) Phí Hoa Hồng Bán Hàng Amazon (Referral Fee ~15%):</span>
            <span className="font-bold">-{formatMoney(amazonReferralFee)} (15.0%)</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/40 border border-red-100 text-red-900 font-medium">
            <span>(-) Phí Hoàn Tất Đơn Hàng FBA (FBA Pick, Pack & Weight Fee):</span>
            <span className="font-bold">-{formatMoney(fbaFulfillmentFee)} (22.0%)</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/40 border border-red-100 text-red-900 font-medium">
            <span>(-) Chi Phí Quảng Cáo Amazon PPC Ads:</span>
            <span className="font-bold">-{formatMoney(ppcSpend)} ({clientReport.tacos}%)</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-50/40 border border-cyan-100 text-cyan-900 font-medium">
            <span className="flex items-center gap-1.5">
              <span>(-) Chi Phí Vận Tải Quốc Tế & Kho Đệm 3PL California (Ocean Freight & 3PL):</span>
            </span>
            <span className="font-bold">-{formatMoney(oceanFreightAnd3pl)} (6.5%)</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-medium">
            <span>(-) Giá Vốn Sản Xuất Xuất Xưởng Tại VN (COGS):</span>
            <span className="font-bold">-{formatMoney(cogsManufacturing)} (28.0%)</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-black text-sm">
            <span>(=) LỢI NHUẬN RÒNG CUỐI CÙNG VỀ DOANH NGHIỆP:</span>
            <span className="text-emerald-700 text-base">{formatMoney(estimatedNetProfit)} ({clientReport.estimatedNetMarginPercent}%)</span>
          </div>
        </div>
      </div>

      {/* Executive AI Briefing & Account Team Support */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left: AI Executive Briefing */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase font-mono text-slate-500">
            <Sparkles size={16} className="text-blue-600" />
            <span>Tóm Tắt Điều Hành Từ Vexim AI (Executive Summary):</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {clientReport.executiveSummaryVi}
          </p>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="text-xs font-bold text-slate-900">Kế hoạch Hành động Tháng Tới:</div>
            <ul className="space-y-1 text-xs text-slate-600">
              {clientReport.keyRisksAndActionPlan.map((action, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">&bull;</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Vexim Account Team & Guarded Notice */}
        <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-6 shadow-xs space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-900">
              <UserCheck size={16} className="text-sky-700" />
              <span>Đội Ngũ Phụ Trách Gian Hàng</span>
            </div>
            <div className="text-xs text-slate-600">
              Account Executive: <strong>Minh Trang (Vexim Ops)</strong>
            </div>
          </div>

          <div className="rounded-xl bg-white p-3 border border-sky-100 text-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <Lock size={14} className="text-sky-600" />
              <span>Chế độ Bảo vệ Tài khoản (Guarded Mode)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Mọi thay đổi nhạy cảm về giá bán, tồn kho FBA và ngân sách quảng cáo đều được Vexim kiểm soát bằng thuật toán AI và phê duyệt bởi chuyên gia.
            </p>
          </div>

          <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-sky-800 transition-all">
            <PhoneCall size={14} />
            <span>Liên hệ Hotline Vexim Support</span>
          </button>
        </div>
      </div>
    </div>
  )
}
