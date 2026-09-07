'use client'

import React from 'react'
import { useAppState } from '@/lib/state-context'
import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bot,
  CircleDollarSign,
  Compass,
  DollarSign,
  Flame,
  HelpCircle,
  Lightbulb,
  Percent,
  RefreshCw,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react'

export function SalesAnalystView() {
  const { setActiveTab } = useAppState()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Diagnostic & Prescriptive Analytics Engine (Section 18)
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            AI Sales Analyst (Chẩn đoán & Đề xuất Tăng trưởng)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Module cốt lõi tự động trả lời: <strong className="text-slate-800">"Điều gì đã thay đổi? Tại sao thay đổi? Chúng ta cần làm gì tiếp theo?"</strong>
          </p>
        </div>
      </div>

      {/* 3 Pillars Big Questions Hero Banner */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Card 1: What changed? */}
        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/60 to-white p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-mono text-xs">
              01
            </div>
            <span>Điều gì đã thay đổi? (What changed?)</span>
          </div>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex justify-between border-b border-blue-100/60 pb-1.5">
              <span>Doanh thu tuần này:</span>
              <strong className="text-emerald-700 font-bold">$68,420 (+18.4%)</strong>
            </div>
            <div className="flex justify-between border-b border-blue-100/60 pb-1.5">
              <span>Lượng truy cập (Sessions):</span>
              <strong className="text-emerald-700 font-bold">22,940 (+12.1%)</strong>
            </div>
            <div className="flex justify-between border-b border-blue-100/60 pb-1.5">
              <span>Tỷ lệ chuyển đổi (CVR):</span>
              <strong className="text-emerald-700 font-bold">12.4% (từ 10.8%)</strong>
            </div>
            <div className="flex justify-between pb-1">
              <span>Chi phí Quảng cáo:</span>
              <strong className="text-slate-900 font-bold">$9,850 (ACOS 23.9%)</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Why did it change? */}
        <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-mono text-xs">
              02
            </div>
            <span>Tại sao lại thay đổi? (Why?)</span>
          </div>
          <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
            <div className="rounded-lg bg-white p-2.5 border border-indigo-100">
              <strong className="text-indigo-950 font-semibold block">• Động lực tăng trưởng chính:</strong>
              <span className="text-[11px] text-slate-600">
                SKU Chocolate 70% tăng +34% lượt mua sau khi cập nhật A+ Content và tiêu đề có từ khóa quà tặng "Organic Gift Pack".
              </span>
            </div>
            <div className="rounded-lg bg-white p-2.5 border border-indigo-100">
              <strong className="text-amber-900 font-semibold block">• Vấn đề phát sinh:</strong>
              <span className="text-[11px] text-slate-600">
                SKU Bột Cacao bị giảm -8.4% CVR do đối thủ "Navitas" hạ giá khuyến mãi về $14.99.
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: What should we do next? */}
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-mono text-xs">
              03
            </div>
            <span>Hành động tiếp theo? (What next?)</span>
          </div>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="rounded-lg bg-white p-2.5 border border-emerald-100 space-y-1">
              <span className="font-bold text-red-700 block">1. Nhập hàng khẩn cấp:</span>
              <span className="text-[11px] text-slate-600">
                Duyệt PO 1,200 units SKU Chocolate 70% (kết hợp 300 units Air) để tránh đứt hàng ngày 19/09.
              </span>
            </div>
            <div className="rounded-lg bg-white p-2.5 border border-emerald-100 space-y-1">
              <span className="font-bold text-blue-700 block">2. Chạy Coupon kích cầu:</span>
              <span className="text-[11px] text-slate-600">
                Kích hoạt Coupon 10% cho SKU Bột Cacao để giữ chân khách hàng nhạy cảm về giá.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Root Cause Decomposition Factor Matrix */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ma trận Phân tách Nguyên nhân Doanh thu (Revenue Waterfall Factor)</h3>
            <p className="text-xs text-slate-400">
              Phân tích tác động từng biến số độc lập lên kết quả kinh doanh Amazon US
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 text-xs">
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-mono">1. Traffic (Sessions)</span>
            <div className="text-base font-black text-emerald-600 flex items-center gap-1">
              <ArrowUpRight size={16} /> +12.1%
            </div>
            <p className="text-[11px] text-slate-500">Tăng nhờ từ khóa Top of Search chính xác.</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-mono">2. Conversion Rate (CVR)</span>
            <div className="text-base font-black text-emerald-600 flex items-center gap-1">
              <ArrowUpRight size={16} /> +1.6% pts
            </div>
            <p className="text-[11px] text-slate-500">Nội dung A+ Content và hình ảnh trực quan.</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-mono">3. Giá bán (Price)</span>
            <div className="text-base font-black text-slate-700">Không đổi ($24.99)</div>
            <p className="text-[11px] text-slate-500">Duy trì định vị phân khúc thủ công cao cấp.</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-mono">4. Quảng cáo PPC</span>
            <div className="text-base font-black text-purple-700">ACOS 23.9%</div>
            <p className="text-[11px] text-slate-500">Hiệu quả sinh lời đạt chuẩn mục tiêu &lt; 25%.</p>
          </div>

          <div className="rounded-xl bg-amber-50/60 p-3.5 border border-amber-200 space-y-1">
            <span className="text-amber-800 text-[10px] uppercase font-mono font-bold">5. Rủi ro Tồn kho</span>
            <div className="text-base font-black text-red-600">11.8 Days Left</div>
            <p className="text-[11px] text-red-700">Điểm nghẽn nghiêm trọng nhất hiện tại.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
