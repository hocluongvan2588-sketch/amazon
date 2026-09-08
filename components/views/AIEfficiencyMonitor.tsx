'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import { aiRouter } from '@/lib/ai-router'
import { aiSemanticCache } from '@/lib/ai-cache'
import {
  Activity,
  ArrowRight,
  Bot,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  Cpu,
  Database,
  DollarSign,
  Filter,
  Flame,
  Layers,
  Percent,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sliders,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react'

export function AIEfficiencyMonitor() {
  const { agencyKpis } = useAppState()
  const routerStats = aiRouter.getStats()
  const cacheStats = aiSemanticCache.getHitRate()

  // Interactive Scale Simulator State
  const [supplierCount, setSupplierCount] = useState<number>(50)
  const [averageSkusPerSupplier, setAverageSkusPerSupplier] = useState<number>(10)

  // Calculations for Scale Simulator
  const simulatedMonthlyRevenue = supplierCount * 1200 // Average $1,200/mo fee
  const simulatedAiCost = supplierCount * 1.42
  const simulatedAiMargin = (((simulatedMonthlyRevenue - simulatedAiCost) / simulatedMonthlyRevenue) * 100).toFixed(2)
  const simulatedTokensSavedMillion = ((supplierCount * averageSkusPerSupplier * 31200 * 0.952) / 1000000).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              AI Unit Economics & Cost-Optimization Architecture
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Kiến trúc Tối ưu Chi phí AI & Hiệu năng
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mô hình kết hợp: <strong className="text-slate-800">80% Toán học & Mã cứng (Code $0) + 20% AI Lập luận (Prompt Distillation)</strong> giúp chi phí vận hành chỉ ~$1.42/supplier/tháng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            <Cpu size={14} className="text-emerald-600" />
            <span>AI Cost: $1.42 / Supplier / Tháng</span>
          </span>
        </div>
      </div>

      {/* Flagship KPI Quad: AI Cost vs Revenue vs Compression */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        {/* Cost per Client */}
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900">Chi phí AI / Client</span>
            <div className="rounded-lg bg-emerald-100 p-1.5 text-emerald-700">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-800 font-mono">$1.42 <span className="text-xs font-normal text-slate-500">/ tháng</span></div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Tối ưu hơn 94% so với gọi AI thô</div>
        </div>

        {/* Total AI Spend */}
        <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng Chi phí AI Tháng này</span>
            <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
              <CircleDollarSign size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">${routerStats.totalSpendUsdThisMonth.toFixed(2)}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Trên 5 Nhà cung cấp đang hoạt động</div>
        </div>

        {/* Token Compression Rate */}
        <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900">Tỷ lệ Nén Tokens (Distillation)</span>
            <div className="rounded-lg bg-purple-100 p-1.5 text-purple-700">
              <Zap size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-purple-900 font-mono">{routerStats.tokensSavedPercentage}%</div>
          <div className="text-[10px] text-purple-700 font-medium mt-0.5">Tiết kiệm ~2.97M raw SP-API tokens</div>
        </div>

        {/* Gross Margin on AI */}
        <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Biên Lợi nhuận Cơ sở AI</span>
            <div className="rounded-lg bg-teal-50 p-1.5 text-teal-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-teal-700 font-mono">99.95%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Thu $154k / Chi $7.10 tiền API</div>
        </div>
      </div>

      {/* 3 Pillars Architecture Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pillar 1: Tier 3 - Deterministic Code ($0) */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white font-mono text-xs font-bold">
                T3
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Tier 3: Pure Math & SQL</h3>
                <span className="text-[10px] text-slate-400 font-mono">TypeScript / PostgreSQL</span>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-black text-emerald-800">
              $0.00 COST
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
              <strong className="text-slate-900 block">• Tính toán Days of Supply:</strong>
              <span className="text-[11px] text-slate-500">Công thức toán học chia tồn kho cho tốc độ bán weighted (7d/30d).</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
              <strong className="text-slate-900 block">• Bộ lọc Ngưỡng (Anomaly Gate):</strong>
              <span className="text-[11px] text-slate-500">Tự động chặn 88% SKU bình thường không gửi lên LLM.</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] font-mono font-bold text-slate-500 flex justify-between border-t border-slate-100">
            <span>Số lần thực thi tháng này:</span>
            <span className="text-slate-900">{routerStats.tierBreakdown.tier3CodeExecutions.toLocaleString()} calls</span>
          </div>
        </div>

        {/* Pillar 2: Tier 1 - Fast & Cheap Mini LLM ($0.15 / 1M) */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/20 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-mono text-xs font-bold">
                T1
              </div>
              <div>
                <h3 className="text-xs font-bold text-blue-900">Tier 1: Fast Mini LLMs</h3>
                <span className="text-[10px] text-blue-600 font-mono">GPT-4o-mini / Haiku</span>
              </div>
            </div>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 font-mono text-[10px] font-black text-blue-800">
              $0.15 / 1M
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
            <div className="rounded-lg bg-white p-2.5 border border-blue-100">
              <strong className="text-blue-950 block">• Phân tích Nguyên nhân (Root Cause):</strong>
              <span className="text-[11px] text-slate-600">Đọc số liệu đã chẩn đoán và viết khuyến nghị tiếng Việt ngắn gọn.</span>
            </div>
            <div className="rounded-lg bg-white p-2.5 border border-blue-100">
              <strong className="text-blue-950 block">• Phân loại CS & Ý định Từ khóa:</strong>
              <span className="text-[11px] text-slate-600">Phát hiện intent từ khóa cheap/gift và kiểm duyệt từ khóa an toàn.</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] font-mono font-bold text-blue-700 flex justify-between border-t border-blue-100">
            <span>Số lần gọi tháng này (85%):</span>
            <span>{routerStats.tierBreakdown.tier1MiniCalls} calls (~$0.07)</span>
          </div>
        </div>

        {/* Pillar 3: Tier 2 - Deep Reasoning ($3.00 / 1M) */}
        <div className="rounded-xl border border-purple-200 bg-purple-50/20 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white font-mono text-xs font-bold">
                T2
              </div>
              <div>
                <h3 className="text-xs font-bold text-purple-900">Tier 2: Deep Copywriting</h3>
                <span className="text-[10px] text-purple-600 font-mono">Claude 3.5 Sonnet</span>
              </div>
            </div>
            <span className="rounded-full bg-purple-100 px-2 py-0.5 font-mono text-[10px] font-black text-purple-800">
              $3.00 / 1M
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
            <div className="rounded-lg bg-white p-2.5 border border-purple-100">
              <strong className="text-purple-950 block">• Viết lại A+ Content Brand Story:</strong>
              <span className="text-[11px] text-slate-600">Sáng tạo văn phong bản địa hóa Mỹ cho nông sản đặc sản Việt Nam.</span>
            </div>
            <div className="rounded-lg bg-white p-2.5 border border-purple-100">
              <strong className="text-purple-950 block">• Nghiên cứu Đa Đối thủ Phức tạp:</strong>
              <span className="text-[11px] text-slate-600">Tổng hợp định vị 10 thương hiệu đối thủ top đầu ngách.</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] font-mono font-bold text-purple-700 flex justify-between border-t border-purple-100">
            <span>Số lần gọi tháng này (15%):</span>
            <span>{routerStats.tierBreakdown.tier2SonnetCalls} calls (~$0.48)</span>
          </div>
        </div>
      </div>

      {/* Semantic Cache Performance & Anomaly Funnel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Semantic Cache Box */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Bộ nhớ đệm Ngữ nghĩa (Semantic Cache)</h3>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
              Cache Hit: {cacheStats.hitRatePercentage}%
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Dữ liệu phân tích đối thủ cùng ngành (ví dụ: ngách socola, nhang trầm, nông sản) được lưu đệm trong 7 ngày. Khi tối ưu các SKU cùng ngành, hệ thống tái sử dụng phân tích cũ và **không phát sinh chi phí gọi AI mới**.
          </p>

          <div className="grid grid-cols-2 gap-3 text-center text-xs pt-2">
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Lượt trúng Cache (Hits)</span>
              <span className="font-mono font-black text-sm text-emerald-600">{cacheStats.totalHits} lượt ($0)</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Lượt gọi mới (Misses)</span>
              <span className="font-mono font-black text-sm text-slate-800">{cacheStats.totalMisses} lượt</span>
            </div>
          </div>
        </div>

        {/* Anomaly Filtering Funnel */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Phễu Lọc Bất thường (Anomaly Funnel)</h3>
            </div>
            <span className="rounded bg-purple-100 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-800">
              88% Bypass Rate
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2 border border-slate-100">
              <span>1. Quét định kỳ toàn bộ SKU (Code $0):</span>
              <strong className="font-mono text-slate-900">120 SKUs</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2 border border-slate-100">
              <span>2. SKU Tồn kho/ACOS bình thường (Bỏ qua AI):</span>
              <strong className="font-mono text-emerald-600">106 SKUs (88.3%)</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-purple-50 p-2 border border-purple-200">
              <span className="font-bold text-purple-900">3. SKU Chạm ngưỡng Bất thường (Kích hoạt AI):</span>
              <strong className="font-mono text-purple-900">14 SKUs (Chi phí $0.02)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Scale Cost Simulator */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 shadow-md space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Sliders size={15} />
              <span>Mô phỏng Chi phí AI khi Mở rộng Quy mô (Scale Simulator)</span>
            </div>
            <h3 className="text-base font-black text-white mt-1">
              Dự phóng Kinh tế khi Vexim quản lý từ 10 đến 500 Nhà cung cấp
            </h3>
          </div>
          <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 font-mono text-xs font-bold text-emerald-300">
            Biên lợi nhuận AI: {simulatedAiMargin}%
          </span>
        </div>

        {/* Sliders Control */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 text-xs">
          <div className="space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Số lượng Nhà cung cấp (Suppliers):</span>
              <strong className="font-mono text-sm text-blue-400 font-bold">{supplierCount} Doanh nghiệp</strong>
            </div>
            <input
              type="range"
              min="5"
              max="500"
              step="5"
              value={supplierCount}
              onChange={(e) => setSupplierCount(parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Số SKU trung bình mỗi Supplier:</span>
              <strong className="font-mono text-sm text-blue-400 font-bold">{averageSkusPerSupplier} SKUs</strong>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={averageSkusPerSupplier}
              onChange={(e) => setAverageSkusPerSupplier(parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Projected Economics Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2">
          <div className="rounded-xl bg-white/10 p-3.5 border border-white/10 text-center">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Doanh thu Dịch vụ Vexim</span>
            <span className="text-xl font-black font-mono text-white mt-1 block">
              ${simulatedMonthlyRevenue.toLocaleString()}
            </span>
          </div>

          <div className="rounded-xl bg-white/10 p-3.5 border border-white/10 text-center">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Tổng Chi phí API AI</span>
            <span className="text-xl font-black font-mono text-emerald-400 mt-1 block">
              ${simulatedAiCost.toFixed(0)} <span className="text-xs font-normal">/ tháng</span>
            </span>
          </div>

          <div className="rounded-xl bg-white/10 p-3.5 border border-white/10 text-center">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Tokens Tiết kiệm Được</span>
            <span className="text-xl font-black font-mono text-purple-300 mt-1 block">
              {simulatedTokensSavedMillion} Triệu
            </span>
          </div>

          <div className="rounded-xl bg-white/10 p-3.5 border border-white/10 text-center">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Tỷ suất LN Gộp AI</span>
            <span className="text-xl font-black font-mono text-teal-300 mt-1 block">
              {simulatedAiMargin}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
