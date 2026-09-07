'use client'

import React from 'react'
import { useAppState } from '@/lib/state-context'
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  ExternalLink,
  HeartPulse,
  Package,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  XCircle,
} from 'lucide-react'

export function AccountHealthCenter() {
  const { accountHealth, setActiveTab, createTask } = useAppState()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Amazon Seller Performance & Policy Compliance Engine
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Sức khỏe Tài khoản & Tuân thủ Chính sách
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            AI Account Health Agent quét định kỳ dữ liệu ODR, LSR, VTR và phát hiện sớm các vi phạm trước khi tài khoản bị gắn cờ (Section 15, 16).
          </p>
        </div>
      </div>

      {/* Account Health Rating (AHR) Bar Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white font-mono text-2xl font-black shadow-lg shadow-emerald-600/20">
              {accountHealth.overallScore}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">Account Health Rating (AHR)</h2>
                <span className="rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
                  HEALTHY (TỐT)
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Thang điểm Amazon 200 - 1000. Tài khoản đang ở trạng thái an toàn cao và được ưu tiên cấp Buy Box.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <span className="text-slate-400 block">Trường hợp mở (Cases):</span>
              <strong className="text-slate-900 font-bold">{accountHealth.openCasesCount} trường hợp</strong>
            </div>
          </div>
        </div>

        {/* Amazon AHR Progress Track */}
        <div className="mt-6 space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono font-semibold text-slate-500">
            <span>Critical (0 - 99)</span>
            <span>At Risk (100 - 199)</span>
            <span className="text-emerald-700 font-bold">Healthy (200 - 1000) ★ Current: 288</span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-600"
              style={{ width: `${(accountHealth.overallScore / 1000) * 100 + 15}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3 Core Amazon Performance Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* ODR */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Tỷ lệ Đơn hàng Khuyết tật (ODR)</span>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Đạt chuẩn</span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {accountHealth.orderDefectRate.value}%
          </div>
          <div className="text-xs text-slate-400">
            Mục tiêu Amazon: <strong className="text-slate-700">&lt; {accountHealth.orderDefectRate.target}%</strong> (Bao gồm A-to-z guarantee claims & negative feedback).
          </div>
        </div>

        {/* LSR */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Tỷ lệ Giao hàng Trễ (LSR)</span>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Đạt chuẩn</span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {accountHealth.lateShipmentRate.value}%
          </div>
          <div className="text-xs text-slate-400">
            Mục tiêu Amazon: <strong className="text-slate-700">&lt; {accountHealth.lateShipmentRate.target}%</strong> (Áp dụng cho FBM orders).
          </div>
        </div>

        {/* VTR */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Tỷ lệ Tracking Hợp lệ (VTR)</span>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Đạt chuẩn</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {accountHealth.validTrackingRate.value}%
          </div>
          <div className="text-xs text-slate-400">
            Mục tiêu Amazon: <strong className="text-slate-700">&gt; {accountHealth.validTrackingRate.target}%</strong> (Đồng bộ số vận đơn FedEx, UPS, USPS).
          </div>
        </div>
      </div>

      {/* Policy Compliance & Open Issues List */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Danh sách Cảnh báo & Vấn đề Tuân thủ Chính sách</h3>
            <p className="text-xs text-slate-400">
              Quản lý các thông báo từ Amazon SP-API Account Health Notification
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {accountHealth.policyComplianceIssues.map((issue) => (
            <div
              key={issue.id}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 transition-colors hover:bg-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      issue.severity === 'HIGH'
                        ? 'bg-red-100 text-red-800'
                        : issue.severity === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {issue.severity}
                  </span>
                  <span className="font-semibold text-xs text-slate-900">{issue.title}</span>
                  <span className="rounded bg-slate-200/80 px-1.5 py-0.2 font-mono text-[9px] text-slate-700">
                    {issue.affectedAsin}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-500">
                  Hạn xử lý (Deadline): <strong className="text-red-700">{issue.deadline}</strong>
                </div>
              </div>

              <div className="rounded-lg bg-white p-3 border border-slate-200 text-xs text-slate-800">
                <strong className="text-blue-900 block font-semibold">Khuyến nghị từ AI Health Agent: </strong>
                <p className="text-slate-600 mt-0.5">{issue.recommendedAction}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
