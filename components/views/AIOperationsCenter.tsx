'use client'

import React, { useState, useEffect } from 'react'
import { FormattedText } from '@/components/FormattedText'
import { useAppState } from '@/lib/state-context'
import { AIAgentType, AIRecommendation, AIRecommendationPriority, UserRole } from '@/lib/types'
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
  Crown,
  Eye,
  FileText,
  Filter,
  Flame,
  Gavel,
  HeartPulse,
  Megaphone,
  MessageSquareWarning,
  Package,
  Play,
  RefreshCw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Ship,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  User,
  X,
  Zap,
} from 'lucide-react'

type DepartmentPillar = 'ALL' | 'PPC' | 'SUPPLY_CHAIN' | 'BRAND_CX' | 'COMPLIANCE'

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

  // Default department pillar based on current active role
  const getDefaultPillar = (role: UserRole): DepartmentPillar => {
    switch (role) {
      case 'PPC_SPECIALIST':
        return 'PPC'
      case 'SUPPLY_CHAIN_SPECIALIST':
        return 'SUPPLY_CHAIN'
      case 'BRAND_CS_SPECIALIST':
        return 'BRAND_CX'
      case 'COMPLIANCE_SPECIALIST':
        return 'COMPLIANCE'
      default:
        return 'ALL'
    }
  }

  const [activePillar, setActivePillar] = useState<DepartmentPillar>(getDefaultPillar(currentRole))
  const [selectedAgent, setSelectedAgent] = useState<AIAgentType | 'ALL'>('ALL')
  const [selectedPriority, setSelectedPriority] = useState<AIRecommendationPriority | 'ALL'>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<'PENDING_APPROVAL' | 'APPROVED' | 'EXECUTED' | 'ALL'>('PENDING_APPROVAL')

  // Sync active pillar if role changes
  useEffect(() => {
    setActivePillar(getDefaultPillar(currentRole))
  }, [currentRole])

  // Map pillar to agent types
  const isAgentInPillar = (agentType: AIAgentType, pillar: DepartmentPillar): boolean => {
    switch (pillar) {
      case 'PPC':
        return ['PPC', 'PROMOTION', 'SALES'].includes(agentType)
      case 'SUPPLY_CHAIN':
        return ['INVENTORY', 'SALES'].includes(agentType)
      case 'BRAND_CX':
        return ['LISTING', 'CUSTOMER', 'SALES'].includes(agentType)
      case 'COMPLIANCE':
        return ['COMPLIANCE', 'ACCOUNT_HEALTH', 'CUSTOMER'].includes(agentType)
      case 'ALL':
      default:
        return true
    }
  }

  // Filter recommendations based on Role & Selected Department Pillar
  const displayedRecs = filteredRecommendations.filter((rec) => {
    // 1. Department Pillar filter
    if (!isAgentInPillar(rec.agentType, activePillar)) return false
    // 2. Specific agent filter
    if (selectedAgent !== 'ALL' && rec.agentType !== selectedAgent) return false
    // 3. Priority filter
    if (selectedPriority !== 'ALL' && rec.priority !== selectedPriority) return false
    // 4. Status filter
    if (selectedStatus !== 'ALL' && rec.status !== selectedStatus) return false
    return true
  })

  // Priority counts within current pillar
  const pillarRecs = filteredRecommendations.filter((r) => isAgentInPillar(r.agentType, activePillar))
  const criticalCount = pillarRecs.filter((r) => r.priority === 'CRITICAL' && r.status === 'PENDING_APPROVAL').length
  const highCount = pillarRecs.filter((r) => r.priority === 'HIGH' && r.status === 'PENDING_APPROVAL').length
  const opportunityCount = pillarRecs.filter((r) => r.priority === 'OPPORTUNITY' && r.status === 'PENDING_APPROVAL').length
  const pendingCount = pillarRecs.filter((r) => r.status === 'PENDING_APPROVAL').length

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

  const getAssigneeInfo = (rec: AIRecommendation) => {
    if (rec.agentType === 'PPC' || rec.agentType === 'PROMOTION' || rec.title.toLowerCase().includes('bid')) {
      return { name: 'Lương Hoàng Minh', role: 'PPC & Growth Lead', badgeColor: 'bg-purple-100 text-purple-800' }
    }
    if (rec.agentType === 'INVENTORY' || rec.title.toLowerCase().includes('tồn kho') || rec.title.toLowerCase().includes('lead time')) {
      return { name: 'Ánh Nguyễn', role: 'Logistics & FBA Lead', badgeColor: 'bg-cyan-100 text-cyan-800' }
    }
    if (rec.agentType === 'LISTING' || (rec.agentType === 'CUSTOMER' && !rec.title.toLowerCase().includes('khẩn cấp'))) {
      return { name: 'Trần Thu Hà', role: 'Brand & Listing Lead', badgeColor: 'bg-blue-100 text-blue-800' }
    }
    if (rec.agentType === 'COMPLIANCE' || rec.agentType === 'ACCOUNT_HEALTH' || rec.title.toLowerCase().includes('dị ứng') || rec.title.toLowerCase().includes('fda')) {
      return { name: 'Lê Hoàng Nam', role: 'Legal & Compliance Lead', badgeColor: 'bg-rose-100 text-rose-800' }
    }
    return { name: 'Nguyễn Tuấn Anh', role: 'Amazon Operations Director', badgeColor: 'bg-slate-100 text-slate-800' }
  }

  const getPriorityStyle = (priority: AIRecommendationPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return {
          pill: 'bg-red-500 text-white',
          border: 'border-red-200 bg-red-50/20',
          indicator: 'bg-red-500',
          badge: '🔴 NGUY CẤP',
        }
      case 'HIGH':
        return {
          pill: 'bg-amber-500 text-white',
          border: 'border-amber-200 bg-amber-50/20',
          indicator: 'bg-amber-500',
          badge: '🟠 ƯU TIÊN CAO',
        }
      case 'OPPORTUNITY':
        return {
          pill: 'bg-emerald-600 text-white',
          border: 'border-emerald-200 bg-emerald-50/20',
          indicator: 'bg-emerald-500',
          badge: '🟢 CƠ HỘI TĂNG TRƯỞNG',
        }
      default:
        return {
          pill: 'bg-slate-500 text-white',
          border: 'border-slate-200 bg-white',
          indicator: 'bg-slate-400',
          badge: '⚪ TIÊU CHUẨN',
        }
    }
  }

  const isExecutiveRole = ['SUPER_ADMIN', 'OPS_MANAGER', 'ACCOUNT_EXECUTIVE'].includes(currentRole)

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
            Phân quyền chuyên sâu theo 4 bộ phận • Kiểm soát chặt chẽ với Human-in-the-loop Approval Workflow.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => runAiFullScan()}
            disabled={isScanning}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? 'Đang chạy phân tích...' : 'Quét lại toàn bộ hệ thống'}</span>
          </button>
        </div>
      </div>

      {/* DEPARTMENT PILLAR SELECTOR TABS (Role-Segregated Navigation) */}
      {isExecutiveRole ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Crown size={14} className="text-purple-600" />
            Phân hệ:
          </span>
          {[
            { id: 'ALL', label: 'Toàn Cơ Quan (Master View)', icon: Crown, count: filteredRecommendations.filter((r) => r.status === 'PENDING_APPROVAL').length },
            { id: 'PPC', label: 'Team PPC & Growth (Minh)', icon: Zap, count: filteredRecommendations.filter((r) => isAgentInPillar(r.agentType, 'PPC') && r.status === 'PENDING_APPROVAL').length },
            { id: 'SUPPLY_CHAIN', label: 'Team Kho Vận & FBA (Ánh)', icon: Ship, count: filteredRecommendations.filter((r) => isAgentInPillar(r.agentType, 'SUPPLY_CHAIN') && r.status === 'PENDING_APPROVAL').length },
            { id: 'BRAND_CX', label: 'Team Brand & CS (Hà)', icon: Target, count: filteredRecommendations.filter((r) => isAgentInPillar(r.agentType, 'BRAND_CX') && r.status === 'PENDING_APPROVAL').length },
            { id: 'COMPLIANCE', label: 'Team Pháp Lý & FDA (Nam)', icon: Gavel, count: filteredRecommendations.filter((r) => isAgentInPillar(r.agentType, 'COMPLIANCE') && r.status === 'PENDING_APPROVAL').length },
          ].map((pillar) => (
            <button
              key={pillar.id}
              onClick={() => {
                setActivePillar(pillar.id as DepartmentPillar)
                setSelectedAgent('ALL')
              }}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                activePillar === pillar.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <pillar.icon size={14} className={activePillar === pillar.id ? 'text-cyan-400' : 'text-slate-400'} />
              <span>{pillar.label}</span>
              {pillar.count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] ${
                    activePillar === pillar.id ? 'bg-cyan-400 text-slate-950 font-extrabold' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {pillar.count}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        /* Focused Banner for Specialist Roles */
        <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
              <Bot size={16} />
            </span>
            <div>
              <div className="text-xs font-bold text-blue-950">
                Không Gian AI Độc Quyền: {activePillar === 'PPC' ? 'PPC & Tăng Trưởng Doanh Thu' : activePillar === 'SUPPLY_CHAIN' ? 'Kho Vận & Quản Trị Chuỗi Cung Ứng' : activePillar === 'BRAND_CX' ? 'Thương Hiệu & Trải Nghiệm Khách Hàng' : 'Pháp Lý, FDA & Sức Khỏe Tài Khoản'}
              </div>
              <div className="text-[11px] text-blue-700">
                Chỉ hiển thị các đề xuất thuộc quyền hạn phê duyệt của bạn. Các phân hệ khác được cách ly an toàn.
              </div>
            </div>
          </div>
          <span className="rounded-md bg-blue-100 px-2.5 py-1 font-mono text-[10px] font-bold text-blue-800 uppercase">
            Role: {currentRole.replace('_', ' ')}
          </span>
        </div>
      )}

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
          {(activePillar === 'ALL'
            ? [
                { id: 'ALL', label: 'Tất cả Agents' },
                { id: 'INVENTORY', label: 'Tồn kho (FBA)' },
                { id: 'PPC', label: 'Quảng cáo PPC' },
                { id: 'LISTING', label: 'Listing Copy' },
                { id: 'CUSTOMER', label: 'Customer Safety' },
                { id: 'SALES', label: 'Sales Analyst' },
                { id: 'COMPLIANCE', label: 'Compliance Gate' },
              ]
            : activePillar === 'PPC'
            ? [
                { id: 'ALL', label: 'Tất cả PPC' },
                { id: 'PPC', label: 'Chiến Dịch PPC' },
                { id: 'PROMOTION', label: 'Deals & Coupons' },
                { id: 'SALES', label: 'Sales Velocity' },
              ]
            : activePillar === 'SUPPLY_CHAIN'
            ? [
                { id: 'ALL', label: 'Tất cả Kho Vận' },
                { id: 'INVENTORY', label: 'Tồn Kho FBA & 3PL' },
                { id: 'SALES', label: 'Tốc Độ Bán Hàng' },
              ]
            : activePillar === 'BRAND_CX'
            ? [
                { id: 'ALL', label: 'Tất cả Brand & CX' },
                { id: 'LISTING', label: 'Listing Copy & SEO' },
                { id: 'CUSTOMER', label: 'Chăm Sóc Khách Hàng' },
              ]
            : [
                { id: 'ALL', label: 'Tất cả Pháp Lý' },
                { id: 'COMPLIANCE', label: 'Cổng FDA / FSMA' },
                { id: 'ACCOUNT_HEALTH', label: 'Sức Khỏe Gian Hàng' },
                { id: 'CUSTOMER', label: 'Sự Cố An Toàn' },
              ]
          ).map((tab) => (
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
            className="rounded-lg border border-border bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="PENDING_APPROVAL">Chờ phê duyệt ({pendingCount})</option>
            <option value="APPROVED">Đã phê duyệt</option>
            <option value="EXECUTED">Đã thực thi</option>
            <option value="ALL">Tất cả trạng thái</option>
          </select>
        </div>
      </div>

      {/* Recommendations Feed List */}
      <div className="space-y-4">
        {displayedRecs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mx-auto mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Phân hệ đang hoạt động ở trạng thái tối ưu!
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Không có đề xuất tồn đọng nào cần xử lý trong phân hệ này. Hệ thống AI đang tự động giám sát 24/7.
            </p>
          </div>
        ) : (
          displayedRecs.map((rec) => {
            const agent = getAgentBadge(rec.agentType)
            const priority = getPriorityStyle(rec.priority)
            const assignee = getAssigneeInfo(rec)
            const Icon = agent.icon

            return (
              <div
                key={rec.id}
                className={`group rounded-2xl border bg-white p-5 shadow-xs transition-all hover:shadow-md ${priority.border}`}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  {/* Left Column: Details */}
                  <div className="space-y-2.5 flex-1">
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${agent.color}`}>
                        <Icon size={12} />
                        <span>{agent.label}</span>
                      </span>

                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${priority.pill}`}>
                        {priority.badge}
                      </span>

                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-600">
                        {rec.clientName}
                      </span>

                      {rec.entityIdentifier && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-500">
                          ID: {rec.entityIdentifier}
                        </span>
                      )}

                      {/* Assignee Badge */}
                      <span className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${assignee.badgeColor}`}>
                        <User size={11} />
                        <span>Phụ trách: {assignee.name}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      <FormattedText text={rec.title} />
                    </h3>

                    {/* Description */}
                    <p className="text-xs leading-relaxed text-slate-600">
                      <FormattedText text={rec.description} />
                    </p>

                    {/* Proposed Action Box */}
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Sparkles size={13} className="text-blue-600" />
                        <span>Hành động AI đề xuất:</span>
                      </div>
                      <div className="text-slate-700 leading-relaxed pl-4">
                        <FormattedText text={rec.proposedAction} />
                      </div>
                    </div>

                    {/* Impact Reasoning */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
                      <span><strong>Tác động:</strong> {rec.expectedImpact}</span>
                      <span>&bull;</span>
                      <span><strong>Mức độ tự tin AI:</strong> {rec.confidenceScore}%</span>
                      <span>&bull;</span>
                      <span className="font-mono text-[10px] text-slate-400">Tạo lúc: {rec.createdAt}</span>
                    </div>
                  </div>

                  {/* Right Column: Human Action CTA Buttons */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                    {rec.status === 'PENDING_APPROVAL' && (
                      <>
                        <button
                          onClick={() => approveRecommendation(rec.id)}
                          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-[0.98]"
                        >
                          <Check size={14} />
                          <span>Duyệt Lệnh</span>
                        </button>
                        <button
                          onClick={() => rejectRecommendation(rec.id)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                          Bác bỏ
                        </button>
                      </>
                    )}

                    {rec.status === 'APPROVED' && (
                      <button
                        onClick={() => executeRecommendation(rec.id)}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all"
                      >
                        <Play size={14} />
                        <span>Bắn Lệnh SP-API</span>
                      </button>
                    )}

                    {rec.status === 'EXECUTED' && (
                      <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={14} />
                        <span>Đã thực thi thành công</span>
                      </span>
                    )}
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
