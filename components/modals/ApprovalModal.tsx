'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import { AIRecommendation } from '@/lib/types'
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  Edit3,
  Play,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'

export function ApprovalModal() {
  const { activeModal, closeModal, approveRecommendation, rejectRecommendation, executeRecommendation, modifyRecommendation } =
    useAppState()

  const rec: AIRecommendation = activeModal?.data
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [modifiedDataJson, setModifiedDataJson] = useState(JSON.stringify(rec?.actionData || {}, null, 2))

  if (activeModal?.type !== 'APPROVAL_DETAIL' || !rec) return null

  const handleApprove = async () => {
    if (isEditing) {
      try {
        const parsed = JSON.parse(modifiedDataJson)
        await modifyRecommendation(rec.id, parsed)
      } catch (err) {
        alert('JSON không hợp lệ. Vui lòng kiểm tra lại định dạng dữ liệu.')
        return
      }
    } else {
      await approveRecommendation(rec.id)
    }
    closeModal()
  }

  const handleReject = async () => {
    await rejectRecommendation(rec.id, rejectReason)
    closeModal()
  }

  const handleExecute = async () => {
    await executeRecommendation(rec.id)
    closeModal()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                  rec.priority === 'CRITICAL'
                    ? 'bg-red-500 text-white'
                    : rec.priority === 'HIGH'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {rec.priority}
              </span>
              <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold font-mono text-blue-800">
                {rec.agentType} AGENT
              </span>
              <span className="text-xs font-mono text-slate-500">{rec.entityIdentifier}</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mt-2">{rec.title}</h3>
          </div>

          <button
            onClick={closeModal}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Diagnosis & Reasoning */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2 text-xs">
          <div className="font-mono text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
            <Bot size={12} className="text-blue-600" />
            Phân tích & Chẩn đoán Gốc rễ (Root Cause Analysis):
          </div>
          <p className="text-slate-700 leading-relaxed font-medium">{rec.reason}</p>
        </div>

        {/* Expected Impact & Risk Guardrails */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-xl bg-emerald-50/70 p-3.5 border border-emerald-100 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 flex items-center gap-1">
              <Sparkles size={12} /> Tác động Kỳ vọng (Impact)
            </span>
            <p className="text-emerald-900 font-semibold">{rec.expectedImpact}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 flex items-center gap-1">
              <ShieldCheck size={12} /> Mức độ Rủi ro (Risk Level)
            </span>
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  rec.riskLevel === 'CRITICAL' ? 'bg-red-500' : rec.riskLevel === 'HIGH' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              <span>{rec.riskLevel} RISK • Confidence: {rec.confidenceScore}%</span>
            </div>
          </div>
        </div>

        {/* Before vs Proposed State Comparison Diff */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase text-slate-500">
              So sánh Trạng thái (Before vs Proposed State):
            </span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
            >
              <Edit3 size={12} />
              <span>{isEditing ? 'Hủy chỉnh sửa' : 'Tùy chỉnh thông số'}</span>
            </button>
          </div>

          {isEditing ? (
            <textarea
              rows={4}
              value={modifiedDataJson}
              onChange={(e) => setModifiedDataJson(e.target.value)}
              className="w-full rounded-xl border border-blue-300 bg-blue-50/20 p-3 font-mono text-xs text-slate-800 leading-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
              <div className="rounded-lg bg-slate-100 p-3 border border-slate-200">
                <span className="text-slate-400 block text-[9px] uppercase">Trạng thái Hiện tại (Before):</span>
                <pre className="mt-1 text-slate-700 whitespace-pre-wrap font-mono">
                  {JSON.stringify(rec.beforeState || rec.actionData, null, 2)}
                </pre>
              </div>

              <div className="rounded-lg bg-blue-50/70 p-3 border border-blue-200">
                <span className="text-blue-600 block text-[9px] uppercase font-bold">Đề xuất Thay đổi (After):</span>
                <pre className="mt-1 text-blue-900 font-bold whitespace-pre-wrap font-mono">
                  {JSON.stringify(rec.proposedState || rec.actionData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Reject Reason input if active */}
        {showRejectInput && (
          <div className="space-y-2 rounded-xl bg-red-50 p-3 border border-red-200">
            <label className="text-xs font-bold text-red-900 block">Lý do bác bỏ đề xuất:</label>
            <input
              type="text"
              placeholder="Nhập lý do bác bỏ (ví dụ: Không khớp ngân sách Q3...)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full rounded-lg border border-red-300 bg-white p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        )}

        {/* Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={closeModal}
            className="rounded-lg border border-border bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            {rec.status === 'PENDING_APPROVAL' && (
              <>
                {!showRejectInput ? (
                  <button
                    onClick={() => setShowRejectInput(true)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                  >
                    Bác bỏ (Reject)
                  </button>
                ) : (
                  <button
                    onClick={handleReject}
                    className="rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                  >
                    Xác nhận Bác bỏ
                  </button>
                )}

                <button
                  onClick={handleApprove}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all"
                >
                  <Check size={14} />
                  <span>{isEditing ? 'Lưu & Phê duyệt' : 'Phê duyệt (Approve)'}</span>
                </button>
              </>
            )}

            {rec.status === 'APPROVED' && (
              <button
                onClick={handleExecute}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all"
              >
                <Play size={14} />
                <span>Thực thi lên Amazon SP-API</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
