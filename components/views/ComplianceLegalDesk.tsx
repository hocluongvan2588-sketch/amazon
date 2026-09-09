'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Gavel,
  History,
  Lock,
  Plus,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

export function ComplianceLegalDesk() {
  const { poaDocuments, trademarkWatches, submitPoaAppeal } = useAppState()
  const [activeTab, setActiveTab] = useState<'poa' | 'trademark'>('poa')
  const [selectedPoaId, setSelectedPoaId] = useState<string>('poa-foodsafety-01')

  const activePoa = poaDocuments.find((p) => p.id === selectedPoaId) || poaDocuments[0]

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-6 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-rose-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300 uppercase tracking-wider">
              Legal & Compliance Ops Desk
            </span>
            <span className="flex items-center gap-1 text-[11px] text-rose-300 font-medium">
              <Gavel size={13} />
              Amazon Seller Performance & USPTO Guard
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Trung Tâm Pháp Lý & Soạn Hồ Sơ Kháng Cáo (POA)</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
            Tự động sinh Đơn Kháng Cáo 3 phần (Root Cause, Corrective Actions, Preventive Measures) chuẩn văn phong luật sư Mỹ và radar giám sát sở hữu trí tuệ USPTO.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs text-right">
            <div className="text-[10px] uppercase font-mono text-slate-400">Tỷ lệ gỡ kháng cáo thành công</div>
            <div className="text-lg font-extrabold text-emerald-400">96.8%</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs text-right">
            <div className="text-[10px] uppercase font-mono text-slate-400">Hạn chót USPTO gần nhất</div>
            <div className="text-lg font-extrabold text-amber-400">15/10/2026</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('poa')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'poa'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={16} />
          <span>Automated POA Generator</span>
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
            {poaDocuments.length} Case
          </span>
        </button>

        <button
          onClick={() => setActiveTab('trademark')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'trademark'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert size={16} />
          <span>USPTO & Trademark Watch</span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
            {trademarkWatches.length} Cảnh báo IP
          </span>
        </button>
      </div>

      {/* TAB 1: AUTOMATED POA BUILDER */}
      {activeTab === 'poa' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            {/* Header info */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-mono font-bold text-red-800">
                    {activePoa.amazonNoticeType.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-xs text-slate-400">ASIN: {activePoa.asin}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Hồ sơ Kháng cáo (Plan of Action): {activePoa.productName}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right text-xs">
                  <div className="text-slate-400 font-mono text-[10px]">HẠN NỘP AMAZON</div>
                  <div className="font-bold text-red-600">13/09/2026 (Còn 5 ngày)</div>
                </div>
                {activePoa.status === 'SUBMITTED_TO_AMAZON' ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-2 rounded-lg">
                    <CheckCircle2 size={15} /> Đã gửi Amazon SP-API
                  </span>
                ) : (
                  <button
                    onClick={() => submitPoaAppeal(activePoa.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-all"
                  >
                    <Send size={14} />
                    <span>Nộp Đơn Kháng Cáo (1-Click)</span>
                  </button>
                )}
              </div>
            </div>

            {/* The 3-Section Plan of Action */}
            <div className="space-y-5">
              {/* SECTION 1: ROOT CAUSE */}
              <div className="rounded-xl border border-slate-200 p-5 space-y-2 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase font-mono text-rose-800 flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[10px] font-black text-rose-900">
                      1
                    </span>
                    Root Cause Analysis (Phân tích Nguyên nhân Gốc rễ)
                  </h4>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    AI Legal Verified
                  </span>
                </div>
                <div className="rounded-lg bg-white p-3 border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed">
                  {activePoa.rootCauseAnalysisEn}
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  Bản dịch tiếng Việt: {activePoa.rootCauseAnalysisVi}
                </div>
              </div>

              {/* SECTION 2: IMMEDIATE CORRECTIVE ACTIONS */}
              <div className="rounded-xl border border-slate-200 p-5 space-y-2 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase font-mono text-rose-800 flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[10px] font-black text-rose-900">
                      2
                    </span>
                    Immediate Corrective Actions (Hành động Khắc phục Ngay)
                  </h4>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    AI Legal Verified
                  </span>
                </div>
                <div className="rounded-lg bg-white p-3 border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed">
                  {activePoa.immediateCorrectiveActionsEn}
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  Bản dịch tiếng Việt: {activePoa.immediateCorrectiveActionsVi}
                </div>
              </div>

              {/* SECTION 3: PREVENTIVE MEASURES */}
              <div className="rounded-xl border border-slate-200 p-5 space-y-2 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase font-mono text-rose-800 flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[10px] font-black text-rose-900">
                      3
                    </span>
                    Long-term Preventive Measures (Biện pháp Phòng ngừa Lâu dài)
                  </h4>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    AI Legal Verified
                  </span>
                </div>
                <div className="rounded-lg bg-white p-3 border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed">
                  {activePoa.preventiveMeasuresEn}
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  Bản dịch tiếng Việt: {activePoa.preventiveMeasuresVi}
                </div>
              </div>
            </div>

            {/* Evidence Packaging Vault */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
              <div className="text-xs font-bold uppercase font-mono text-slate-700 flex items-center gap-2">
                <FileCheck size={16} className="text-emerald-600" />
                <span>Bằng chứng đính kèm tự động từ Hồ sơ Chuỗi Cung Ứng (Evidence Package):</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {activePoa.attachedEvidence.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={14} className="text-rose-600 shrink-0" />
                      <span className="truncate font-medium text-slate-800">{doc.name}</span>
                    </div>
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0">
                      Đã ký số
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USPTO TRADEMARK WATCH */}
      {activeTab === 'trademark' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Cơ quan Sở hữu Trí tuệ Mỹ (USPTO Trademark Watch Radar)</h2>
            <p className="text-xs text-slate-500">
              Tự động rà soát cơ sở dữ liệu USPTO để phát hiện các bên trung gian nộp đơn đăng ký nhãn hiệu tương tự, giúp thương hiệu Việt bảo vệ nhãn hiệu trước khi hết hạn phản đối (Opposition Period).
            </p>
          </div>

          <div className="grid gap-4">
            {trademarkWatches.map((watch) => (
              <div
                key={watch.id}
                className={`rounded-2xl border p-6 transition-all ${
                  watch.similarityScore >= 85
                    ? 'border-red-300 bg-red-50/30'
                    : 'border-slate-200 bg-white shadow-xs'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-black text-slate-900 bg-white border border-slate-300 px-3 py-1 rounded-lg">
                        {watch.trademarkName}
                      </span>
                      <span className="font-mono text-xs text-slate-500">Serial: #{watch.serialNumber}</span>
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
                        Độ tương đồng: {watch.similarityScore}%
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      Bên nộp đơn: <strong className="text-slate-900">{watch.applicantName}</strong> &bull; Phân loại: {watch.usptoClass} &bull; Ngày nộp: {watch.filingDate}
                    </div>

                    <div className="rounded-xl bg-white p-3 border border-slate-200 text-xs text-slate-800 space-y-1">
                      <div className="font-bold text-red-700">{watch.riskAssessmentVi}</div>
                      <div className="text-slate-600">
                        ⚖️ <strong>Khuyến nghị Hành động:</strong> {watch.recommendedLegalAction}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white border border-slate-200 p-4 text-right space-y-2 shrink-0">
                    <div>
                      <div className="text-[10px] uppercase font-mono text-slate-400">Hạn chót Nộp Phản Đối</div>
                      <div className="text-sm font-black text-red-600">{watch.oppositionDeadline}</div>
                    </div>
                    <button className="w-full rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-all">
                      Chuyển Luật Sư Mỹ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
