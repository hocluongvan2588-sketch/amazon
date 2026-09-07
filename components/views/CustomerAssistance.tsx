'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import { CustomerMessage } from '@/lib/types'
import {
  AlertOctagon,
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  Clock,
  Edit3,
  Flame,
  Lock,
  MessageSquare,
  MessageSquareWarning,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  XCircle,
} from 'lucide-react'

export function CustomerAssistance() {
  const { filteredCustomerMessages, sendCustomerReply, currentRole } = useAppState()
  const [selectedMsg, setSelectedMsg] = useState<CustomerMessage>(filteredCustomerMessages[0] || null)
  const [draftReply, setDraftReply] = useState<string>(selectedMsg?.aiSuggestedDraft || '')
  const [isEditing, setIsEditing] = useState(false)

  const handleSelectMessage = (msg: CustomerMessage) => {
    setSelectedMsg(msg)
    setDraftReply(msg.finalReply || msg.aiSuggestedDraft || '')
    setIsEditing(false)
  }

  const handleSend = async () => {
    if (!selectedMsg) return
    await sendCustomerReply(selectedMsg.id, draftReply)
  }

  const getClassificationBadge = (classification: CustomerMessage['classification']) => {
    switch (classification) {
      case 'SAFETY_CRITICAL':
        return {
          pill: 'bg-red-600 text-white font-bold',
          badge: '🚨 SAFETY CRITICAL (CPSC/FDA RISK)',
        }
      case 'COMPLAINT':
        return {
          pill: 'bg-amber-100 text-amber-800 font-semibold',
          badge: '⚠️ Khiếu nại chất lượng',
        }
      case 'REFUND_REQUEST':
        return {
          pill: 'bg-purple-100 text-purple-800 font-semibold',
          badge: '💰 Yêu cầu hoàn tiền',
        }
      case 'PRODUCT_QUALITY':
        return {
          pill: 'bg-blue-100 text-blue-800 font-semibold',
          badge: '📦 Thắc mắc sản phẩm',
        }
      default:
        return {
          pill: 'bg-slate-100 text-slate-700 font-medium',
          badge: '💬 Câu hỏi thông thường',
        }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Buyer-Seller Messaging & AI Safety Gatekeeper
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Chăm sóc Khách hàng & Hỗ trợ AI
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân loại ý định khách hàng, soạn thảo thư chuẩn mực Amazon TOS tiếng Anh và tự động chặn phản hồi với các sự cố an toàn (Section 13).
          </p>
        </div>
      </div>

      {/* Safety Gatekeeper Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50/70 p-4">
        <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="text-xs text-rose-950">
          <strong className="font-bold">Quy tắc An toàn Nghiêm ngặt (Safety-critical Gate): </strong>
          Nếu phát hiện từ khóa liên quan đến chấn thương, dị ứng, nhiễm độc hoặc khiếu nại CPSC/FDA, hệ thống <strong>tuyệt đối không tự động trả lời</strong> mà kích hoạt báo động khẩn cấp tới Quản lý Vận hành (Operations Manager).
        </div>
      </div>

      {/* Main Layout: Left Messages Queue, Right Reply & Safety Inspector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Col: Message Queue (4 cols) */}
        <div className="space-y-3 lg:col-span-5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700">Hộp thư Amazon ({filteredCustomerMessages.length})</span>
            <span className="text-[11px] font-mono text-slate-400">Buyer-Seller Messaging</span>
          </div>

          <div className="space-y-2.5">
            {filteredCustomerMessages.map((msg) => {
              const isSelected = selectedMsg?.id === msg.id
              const classBadge = getClassificationBadge(msg.classification)
              const isSafety = msg.classification === 'SAFETY_CRITICAL'

              return (
                <button
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                    isSafety
                      ? 'border-red-300 bg-red-50/30 hover:border-red-400'
                      : isSelected
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                      : 'border-border bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs text-slate-900">{msg.customerName}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(msg.receivedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="mt-1">
                      <span className={`inline-block rounded px-1.5 py-0.2 text-[9px] ${classBadge.pill}`}>
                        {classBadge.badge}
                      </span>
                    </div>

                    <h4 className="font-semibold text-xs text-slate-800 line-clamp-1 mt-1.5">{msg.messageSubject}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{msg.messageBody}</p>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      {msg.orderId && <span>Order: {msg.orderId.slice(0, 15)}...</span>}
                      <span
                        className={`font-semibold ${
                          msg.status === 'SENT'
                            ? 'text-emerald-600'
                            : msg.status === 'ESCALATED_TO_HUMAN'
                            ? 'text-red-600 font-bold'
                            : 'text-amber-600'
                        }`}
                      >
                        {msg.status === 'SENT' ? 'Đã phản hồi' : msg.status === 'ESCALATED_TO_HUMAN' ? 'Đang Escalate' : 'Chờ duyệt'}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Col: Deep Message Inspector & Reply Composer (7 cols) */}
        {selectedMsg ? (
          <div className="space-y-4 lg:col-span-7">
            {/* Safety Incident Escalation Warning Banner */}
            {selectedMsg.classification === 'SAFETY_CRITICAL' && (
              <div className="rounded-xl border border-red-500 bg-red-600 text-white p-5 shadow-md">
                <div className="flex items-start gap-3">
                  <AlertOctagon size={24} className="shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-black tracking-wide">
                      CẢNH BÁO KHẨN CẤP: PHÁT HIỆN KHIẾU NẠI AN TOÀN SẢN PHẨM
                    </h3>
                    <p className="text-xs text-red-100 mt-1 leading-relaxed">
                      AI đã tự động khóa tính năng gửi tự động để ngăn ngừa rủi ro pháp lý. Từ khóa kích hoạt rủi ro:{' '}
                      <strong className="underline">{selectedMsg.safetyKeywords?.join(', ')}</strong>.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="rounded bg-red-800 px-2.5 py-1 text-[10px] font-mono font-bold">
                        Quy trình: Trực tiếp liên hệ khách + Cô lập lô hàng xưởng
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Inquiry Details Card */}
            <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{selectedMsg.customerName}</h3>
                    <span className="text-xs text-slate-400">• Amazon Buyer</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    Mã đơn hàng: {selectedMsg.orderId || 'Không có'} • Nhận lúc: {new Date(selectedMsg.receivedAt).toLocaleString('vi-VN')}
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    getClassificationBadge(selectedMsg.classification).pill
                  }`}
                >
                  {getClassificationBadge(selectedMsg.classification).badge}
                </span>
              </div>

              {/* Message Body */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-1">
                <div className="text-[10px] font-mono font-bold uppercase text-slate-400">
                  Nội dung thư khách hàng gửi:
                </div>
                <div className="text-xs font-semibold text-slate-900">{selectedMsg.messageSubject}</div>
                <p className="text-xs text-slate-700 leading-relaxed mt-2 whitespace-pre-wrap">
                  {selectedMsg.messageBody}
                </p>
              </div>

              {/* AI Draft Response Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <Sparkles size={14} className="text-blue-600" />
                    <span>Bản nháp phản hồi AI (Amazon TOS Compliant)</span>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <Edit3 size={12} />
                    <span>{isEditing ? 'Đang chỉnh sửa' : 'Tùy chỉnh nội dung'}</span>
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={draftReply}
                  onChange={(e) => setDraftReply(e.target.value)}
                  disabled={selectedMsg.status === 'SENT'}
                  className="w-full rounded-xl border border-blue-200 bg-blue-50/20 p-3 text-xs text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50"
                  placeholder="Nhập nội dung phản hồi khách hàng..."
                />

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>Đã kiểm tra không chứa link ngoài hoặc vi phạm Amazon Review Policy</span>
                  </div>

                  {selectedMsg.status !== 'SENT' ? (
                    <button
                      onClick={handleSend}
                      disabled={!draftReply.trim()}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                      <Send size={13} />
                      <span>Phê duyệt & Gửi qua Amazon Messaging</span>
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <CheckCircle2 size={15} />
                      <span>Đã gửi phản hồi thành công</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
