'use client'

import React from 'react'
import { useAppState } from '@/lib/state-context'
import {
  Activity,
  ArrowUpRight,
  Bot,
  Building2,
  CircleDollarSign,
  Clock,
  DollarSign,
  Layers,
  Package,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Workflow,
  Zap,
} from 'lucide-react'

export function VeximBusinessKpi() {
  const { agencyKpis, clients } = useAppState()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Vexim Agency Business & Automation Rate (Section 42, 43)
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Hiệu suất Dịch vụ Vexim & Chỉ số AI
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi tổng thể các gói dịch vụ (Audit, Launch, Operations, Growth) và tỷ lệ tự động hóa vận hành AI Automation Rate.
          </p>
        </div>
      </div>

      {/* Flagship KPI: AI Automation Rate & Hours Saved */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 shadow-md space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Bot size={16} />
              <span>AI-Assisted Operations Rate (Chỉ số Tự động hóa)</span>
            </div>
            <div className="mt-2 text-4xl font-black tracking-tight text-white font-mono">
              {agencyKpis.aiAssistedOperationsRate}%
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-lg">
              {agencyKpis.humanApprovedRecommendations} trên tổng số {agencyKpis.totalAIRecommendationsGenerated} nhiệm vụ vận hành được AI tự động phát hiện, chuẩn bị nháp và nhân viên Vexim phê duyệt thực thi.
            </p>
          </div>

          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-md border border-white/10 space-y-1 text-right">
            <div className="text-[10px] uppercase font-mono text-blue-300">Nhân lực Tiết kiệm Tháng này</div>
            <div className="text-2xl font-black text-white">{agencyKpis.humanHoursSavedThisMonth} Giờ</div>
            <div className="text-[10px] text-slate-400">Tương đương ~2.1 Full-time VA</div>
          </div>
        </div>

        {/* Breakdown Funnel Progress Bar */}
        <div className="space-y-2 border-t border-white/10 pt-4">
          <div className="flex justify-between text-xs text-slate-300">
            <span>1. AI Phát hiện: <strong>142 tasks</strong></span>
            <span>2. Human Duyệt: <strong>108 tasks</strong></span>
            <span>3. Thực thi SP-API: <strong>104 tasks</strong></span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400"
              style={{ width: `${agencyKpis.aiAssistedOperationsRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Agency Portfolio Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Khách hàng Nhà cung cấp</div>
          <div className="mt-1 text-2xl font-black text-slate-900">{agencyKpis.totalManagedClients} Doanh nghiệp</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">100% Doanh nghiệp Việt Nam</div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Tổng SKU Đang Vận hành</div>
          <div className="mt-1 text-2xl font-black text-slate-900">{agencyKpis.activeManagedSkus} SKUs</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Kho FBA Amazon US</div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Tổng Doanh thu Quản lý (GMV)</div>
          <div className="mt-1 text-2xl font-black text-slate-900">${agencyKpis.totalManagedRevenueMonthly.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">+{agencyKpis.averageClientGrowthRate}% Tăng trưởng bình quân</div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Doanh thu Phí Dịch vụ Vexim</div>
          <div className="mt-1 text-2xl font-black text-blue-700">
            ${(
              agencyKpis.serviceRevenueBreakdown.amazonAudit +
              agencyKpis.serviceRevenueBreakdown.amazonLaunch +
              agencyKpis.serviceRevenueBreakdown.amazonOperations +
              agencyKpis.serviceRevenueBreakdown.amazonGrowth
            ).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Phí quản lý SaaS & Managed Ops</div>
        </div>
      </div>

      {/* Service Packages Matrix (Section 42) */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Mô hình Dịch vụ Vexim (Packages Matrix)</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-slate-900">Amazon Audit</span>
              <span className="font-mono text-xs font-black text-blue-700">$100 - $300</span>
            </div>
            <div className="text-[11px] text-slate-500">Đánh giá tiềm năng sản phẩm, phân tích đối thủ & kiểm định pháp lý ban đầu.</div>
            <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-200">
              1 Client đang dùng (Tan Viet Wood)
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-slate-900">Amazon Launch</span>
              <span className="font-mono text-xs font-black text-blue-700">$500 - $1,500/SKU</span>
            </div>
            <div className="text-[11px] text-slate-500">Xây dựng Listing chuẩn SEO, hồ sơ FDA/COA, thiết kế A+ Content và kế hoạch ra mắt.</div>
            <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-200">
              1 Client đang dùng (Highlands Cashew)
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-blue-900">Amazon Operations</span>
              <span className="font-mono text-xs font-black text-blue-700">$500 - $1,000/tháng</span>
            </div>
            <div className="text-[11px] text-slate-600">Vận hành trọn gói: Quản lý FBA tồn kho, đơn hàng, CS phản hồi và bảo vệ Account Health.</div>
            <div className="text-[10px] font-mono text-blue-600 font-bold pt-2 border-t border-blue-100">
              2 Clients (Lotus Craft, An An)
            </div>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-purple-900">Amazon Growth</span>
              <span className="font-mono text-xs font-black text-purple-700">$1,000 - $2,500+/tháng</span>
            </div>
            <div className="text-[11px] text-slate-600">Vận hành + Tối ưu hóa PPC chuyên sâu, chiến lược tăng trưởng thị phần và tối ưu biên lợi nhuận.</div>
            <div className="text-[10px] font-mono text-purple-600 font-bold pt-2 border-t border-purple-100">
              1 Client chủ lực (Vinacacao)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
