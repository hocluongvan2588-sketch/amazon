'use client'

import { FormattedText } from "@/components/FormattedText"

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import { AIAgentType, AIRecommendation, AIRecommendationPriority } from '@/lib/types'
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bot,
  Boxes,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Filter,
  Flame,
  HeartPulse,
  Megaphone,
  MessageSquareWarning,
  Package,
  Play,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react'

export function AIOperationsCenter() {
  const {
    filteredRecommendations,
    approveRecommendation,
    rejectRecommendation,
    executeRecommendation,
    openModal,
    runAiFullScan,
    isScanning,
    agencyKpis,
    currentRole,
  } = useAppState()

  const [selectedAgent, setSelectedAgent] = useState<AIAgentType | 'ALL'>('ALL')
  const [selectedPriority, setSelectedPriority] = useState<AIRecommendationPriority | 'ALL'>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<'PENDING_APPROVAL' | 'APPROVED' | 'EXECUTED' | 'ALL'>('PENDING_APPROVAL')

  // Filter recommendations
  const displayedRecs = filteredRecommendations.filter((rec) => {
    if (selectedAgent !== 'ALL' && rec.agentType !== selectedAgent) return false
    if (selectedPriority !== 'ALL' && rec.priority !== selectedPriority) return false
    if (selectedStatus !== 'ALL' && rec.status !== selectedStatus) return false
    return true
  })

  // Priority counts
  const criticalCount = filteredRecommendations.filter((r) => r.priority === 'CRITICAL' && r.status === 'PENDING_APPROVAL').length
  const highCount = filteredRecommendations.filter((r) => r.priority === 'HIGH' && r.status === 'PENDING_APPROVAL').length
  const opportunityCount = filteredRecommendations.filter((r) => r.priority === 'OPPORTUNITY' && r.status === 'PENDING_APPROVAL').length
  const pendingCount = filteredRecommendations.filter((r) => r.status === 'PENDING_APPROVAL').length

  const getAgentBadge = (agent: AIAgentType) => {
    switch (agent) {
      case 'INVENTORY':
        return { label: 'Inventory Agent', icon: Boxes, color: 'bg-amber-50 text-amber-700 border-amber-200' }
      case 'LISTING':
        return { label: 'Listing Agent', icon: Package, color: 'bg-blue-50 text-blue-700 border-blue-200' }
      case 'PPC':
        return { label: 'PPC Agent', icon: Megaphone, color: 'bg-purple-50 text-purple-700 border-purple-200' }
      case 'SALES':
        return { label: 'Sales Analyst', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      case 'ACCOUNT_HEALTH':
        return { label: 'Health Agent', icon: HeartPulse, color: 'bg-red-50 text-red-700 border-red-200' }
      case 'CUSTOMER':
        return { label: 'Customer Safety', icon: MessageSquareWarning, color: 'bg-rose-50 text-rose-700 border-rose-200' }
      case 'COMPLIANCE':
        return { label: 'Compliance Gate', icon: ShieldCheck, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
      case 'PROMOTION':
        return { label: 'Promotion Agent', icon: Flame, color: 'bg-orange-50 text-orange-700 border-orange-200' }
      default:
        return { label: 'AI Agent', icon: Bot, color: 'bg-slate-50 text-slate-700 border-slate-200' }
    }
  }

  const getPriorityStyle = (priority: AIRecommendationPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return {
          pill: 'bg-red-500 text-white',
          border: 'border-red-200 bg-red-50/20',
          indicator: 'bg-red-500',
          badge: '🔴 CRITICAL',
        }
      case 'HIGH':
        return {
          pill: 'bg-amber-500 text-white',
          border: 'border-amber-200 bg-amber-50/20',
          indicator: 'bg-amber-500',
          badge: '🟠 HIGH PRIORITY',
        }
      case 'OPPORTUNITY':
        return {
          pill: 'bg-emerald-600 text-white',
          border: 'border-emerald-200 bg-emerald-50/20',
          indicator: 'bg-emerald-500',
          badge: '🟢 OPPORTUNITY',
        }
      default:
        return {
          pill: 'bg-slate-500 text-white',
          border: 'border-slate-200 bg-white',
          indicator: 'bg-slate-400',
          badge: '⚪ LOW',
        }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & High-level Metric Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Autonomous Operations Control Center
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Trung tâm AI Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân tích tự động đa tác nhân (Multi-Agent) • Kiểm soát chặt chẽ với Human-in-the-loop Approval Workflow.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => runAiFullScan()}
            disabled={isScanning}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? 'Đang chạy phân tích...' : 'Quét lại toàn bộ hệ thống'}</span>
          </button>
        </div>
      </div>

      {/* Priority Summary Cards Banner */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <button
          onClick={() => {
            setSelectedPriority('CRITICAL')
            setSelectedStatus('PENDING_APPROVAL')
          }}
          className={`flex items-start justify-between rounded-xl border p-4 text-left transition-all ${
            selectedPriority === 'CRITICAL'
              ? 'border-red-500 bg-red-50/50 ring-2 ring-red-500/20'
              : 'border-border bg-white hover:border-red-300'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
              <AlertOctagon size={16} />
              <span>Critical Issues</span>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{criticalCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Cần xử lý khẩn cấp</div>
          </div>
          <span className="rounded-full bg-red-100 p-1.5 text-red-600">
            <Zap size={16} />
          </span>
        </button>

        <button
          onClick={() => {
            setSelectedPriority('HIGH')
            setSelectedStatus('PENDING_APPROVAL')
          }}
          className={`flex items-start justify-between rounded-xl border p-4 text-left transition-all ${
            selectedPriority === 'HIGH'
              ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
              : 'border-border bg-white hover:border-amber-300'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
              <AlertTriangle size={16} />
              <span>High Priority</span>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{highCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Ảnh hưởng doanh thu</div>
          </div>
          <span className="rounded-full bg-amber-100 p-1.5 text-amber-600">
            <TrendingDown size={16} />
          </span>
        </button>

        <button
          onClick={() => {
            setSelectedPriority('OPPORTUNITY')
            setSelectedStatus('PENDING_APPROVAL')
          }}
          className={`flex items-start justify-between rounded-xl border p-4 text-left transition-all ${
            selectedPriority === 'OPPORTUNITY'
              ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
              : 'border-border bg-white hover:border-emerald-300'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <Sparkles size={16} />
              <span>Opportunities</span>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{opportunityCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Tối ưu & Tăng trưởng</div>
          </div>
          <span className="rounded-full bg-emerald-100 p-1.5 text-emerald-600">
            <TrendingUp size={16} />
          </span>
        </button>

        <div className="flex items-start justify-between rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/40 p-4 text-left">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
              <Bot size={16} />
              <span>AI Automation Rate</span>
            </div>
            <div className="mt-2 text-2xl font-black text-blue-900">{agencyKpis.aiAssistedOperationsRate}%</div>
            <div className="text-[10px] text-blue-600/80 mt-0.5">Tiết kiệm ~{agencyKpis.humanHoursSavedThisMonth}h nhân sự</div>
          </div>
          <span className="rounded-full bg-blue-100 p-1.5 text-blue-700">
            <ShieldCheck size={16} />
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 mr-1">
            <Filter size={13} /> Lọc theo Agent:
          </span>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'INVENTORY', label: 'Tồn kho (FBA)' },
            { id: 'PPC', label: 'Quảng cáo PPC' },
            { id: 'LISTING', label: 'Listing Copy' },
            { id: 'CUSTOMER', label: 'Customer Safety' },
            { id: 'SALES', label: 'Sales Analyst' },
            { id: 'COMPLIANCE', label: 'Compliance Gate' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedAgent(tab.id as any)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedAgent === tab.id
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Trạng thái:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="rounded-lg border border-border bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="PENDING_APPROVAL">Chờ phê duyệt ({pendingCount})</option>
            <option value="APPROVED">Đã phê duyệt</option>
            <option value="EXECUTED">Đã thực thi SP-API</option>
            <option value="ALL">Tất cả trạng thái</option>
          </select>
        </div>
      </div>

      {/* Recommendation Action Cards List */}
      <div className="space-y-4">
        {displayedRecs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center">
            <CheckCircle2 size={40} className="text-emerald-500 mb-3" />
            <h3 className="text-base font-bold text-slate-900">Không có hành động chờ xử lý trong bộ lọc này</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Tất cả các khuyến nghị của AI đã được đội ngũ Vexim phê duyệt hoặc chưa phát hiện bất thường mới.
            </p>
          </div>
        ) : (
          displayedRecs.map((rec) => {
            const agent = getAgentBadge(rec.agentType)
            const priorityStyle = getPriorityStyle(rec.priority)
            const AgentIcon = agent.icon

            return (
              <div
                key={rec.id}
                className={`group relative overflow-hidden rounded-xl border bg-white shadow-xs transition-all hover:shadow-md ${priorityStyle.border}`}
              >
                {/* Top Priority Indicator Line */}
                <div className={`h-1.5 w-full ${priorityStyle.indicator}`} />

                <div className="p-5">
                  {/* Row 1: Header metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${priorityStyle.pill}`}>
                        {priorityStyle.badge}
                      </span>

                      <span className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${agent.color}`}>
                        <AgentIcon size={13} />
                        {agent.label}
                      </span>

                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600">
                        {rec.entityIdentifier}
                      </span>

                      <span className="text-[10px] text-slate-400">
                        {rec.clientName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Bot size={13} className="text-blue-600" />
                        Độ tin cậy AI: <strong className="text-blue-700">{rec.confidenceScore}%</strong>
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Title & Description */}
                  <div className="mt-3">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {rec.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      <FormattedText text={rec.description} />
                    </p>
                  </div>

                  {/* Row 3: Reason & Expected Impact Grid */}
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-xl bg-slate-50/80 p-3.5 border border-slate-100">
                    <div>
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <AlertCircle size={12} className="text-amber-500" />
                        Nguyên nhân & Phân tích gốc rễ (Root Cause)
                      </div>
                      <p className="text-xs text-slate-700 mt-1 leading-normal font-medium">
                        {rec.reason}
                      </p>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Sparkles size={12} className="text-blue-500" />
                        Tác động kỳ vọng (Expected Impact)
                      </div>
                      <p className="text-xs text-emerald-800 font-semibold mt-1 leading-normal">
                        {rec.expectedImpact}
                      </p>
                    </div>
                  </div>

                  {/* Row 4: Proposed Action Banner */}
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50/60 p-2.5 border border-blue-100">
                    <Zap size={15} className="text-blue-600 mt-0.5 shrink-0" />
                    <div className="text-xs">
                      <strong className="text-blue-900">Hành động AI đề xuất: </strong>
                      <span className="text-blue-800"><FormattedText text={rec.proposedAction} /></span>
                    </div>
                  </div>

                  {/* Row 5: Action Buttons (Human-in-the-Loop) */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal('APPROVAL_DETAIL', rec)}
                        className="flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Eye size={13} />
                        <span>Xem chi tiết & Dữ liệu gốc (Diff)</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {rec.status === 'PENDING_APPROVAL' && (
                        <>
                          <button
                            onClick={() => rejectRecommendation(rec.id)}
                            className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                          >
                            <X size={13} />
                            <span>Bác bỏ (Reject)</span>
                          </button>

                          <button
                            onClick={() => approveRecommendation(rec.id)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                          >
                            <Check size={14} />
                            <span>Phê duyệt (Approve)</span>
                          </button>
                        </>
                      )}

                      {rec.status === 'APPROVED' && (
                        <button
                          onClick={() => executeRecommendation(rec.id)}
                          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
                        >
                          <Play size={13} />
                          <span>Thực thi lên Amazon US (SP-API)</span>
                        </button>
                      )}

                      {rec.status === 'EXECUTED' && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <CheckCircle2 size={15} />
                          <span>Đã thực thi trên Amazon US</span>
                        </span>
                      )}

                      {rec.status === 'REJECTED' && (
                        <span className="text-xs font-medium text-slate-400 italic">
                          Đã bị từ chối bởi {rec.rejectedBy}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
