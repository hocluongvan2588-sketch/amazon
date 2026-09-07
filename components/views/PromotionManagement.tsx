'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import { Promotion } from '@/lib/types'
import {
  AlertCircle,
  CircleDollarSign,
  Flame,
  Percent,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react'

export function PromotionManagement() {
  const { filteredPromotions, setActiveTab } = useAppState()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-orange-500" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Amazon Deals, Coupons & Margin Impact Simulator
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Quản lý Khuyến mãi & Flash Deals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mô phỏng tác động biên lợi nhuận và tỷ lệ tăng trưởng đơn hàng (Sales Uplift vs Margin Sacrifice) theo Section 14.
          </p>
        </div>
      </div>

      {/* Promotion Cards Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredPromotions.map((promo) => (
          <div key={promo.id} className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                    {promo.type}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      promo.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {promo.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1.5">{promo.name}</h3>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Thời gian: {promo.startDate} đến {promo.endDate}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-black text-orange-600">
                  {promo.discountType === 'PERCENT' ? `-${promo.discountValue}%` : `-$${promo.discountValue}`}
                </div>
                <span className="text-[10px] text-slate-400">Mức chiết khấu</span>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <div className="text-[10px] text-slate-400">Doanh số tạo ra</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">${promo.attributedSales.toLocaleString()}</div>
              </div>

              <div className="rounded-lg bg-emerald-50 p-2.5 border border-emerald-100">
                <div className="text-[10px] text-emerald-800 font-medium">Tăng trưởng (Uplift)</div>
                <div className="text-sm font-bold text-emerald-700 mt-0.5">+{promo.salesUpliftPercent}%</div>
              </div>

              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <div className="text-[10px] text-slate-400">Tác động Biên LN</div>
                <div className="text-sm font-bold text-amber-600 mt-0.5">{promo.marginImpactPercent}%</div>
              </div>
            </div>

            {/* AI Advisor Note */}
            <div className="rounded-lg bg-blue-50/70 p-3 border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
              <Sparkles size={14} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Đánh giá AI Promotion Engine: </strong>
                <span>
                  Chương trình coupon 15% đang hoạt động rất tốt với ROI 4.8x. Doanh số tăng 34.2% bù đắp hoàn toàn phần giảm 4.8% biên lợi nhuận. Khuyến nghị gia hạn thêm 7 ngày.
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
