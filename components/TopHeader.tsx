'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import { UserRole, WorkspaceMode } from '@/lib/types'
import {
  Bell,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  Cpu,
  Gavel,
  Layers,
  LayoutGrid,
  MapPin,
  Megaphone,
  RefreshCw,
  Search,
  Shield,
  Ship,
  Sparkles,
  Target,
  UserCheck,
  Zap,
} from 'lucide-react'

export function TopHeader({ onOpenChat }: { onOpenChat: () => void }) {
  const {
    currentRole,
    setCurrentRole,
    workspaceMode,
    setWorkspaceMode,
    selectedClientId,
    setSelectedClientId,
    clients,
    timeRange,
    setTimeRange,
    searchQuery,
    setSearchQuery,
    isScanning,
    isSyncing,
    runAiFullScan,
    recommendations,
  } = useAppState()

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false)
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false)

  const pendingApprovalsCount = recommendations.filter((r) => r.status === 'PENDING_APPROVAL').length

  const roleLabels: Record<UserRole, { label: string; tag: string; badgeColor: string }> = {
    SUPER_ADMIN: { label: 'Vexim Super Admin', tag: 'Toàn quyền hệ thống', badgeColor: 'bg-purple-100 text-purple-800' },
    OPS_MANAGER: { label: 'Amazon Ops Manager', tag: 'Quản lý vận hành', badgeColor: 'bg-blue-100 text-blue-800' },
    ACCOUNT_EXECUTIVE: { label: 'Account Executive', tag: 'Chăm sóc Client', badgeColor: 'bg-emerald-100 text-emerald-800' },
    COMPLIANCE_SPECIALIST: { label: 'Compliance Specialist', tag: 'Pháp lý & FDA', badgeColor: 'bg-amber-100 text-amber-800' },
    CLIENT_SUPPLIER: { label: 'Client / Supplier (Vinacacao)', tag: 'Nhà cung cấp VN', badgeColor: 'bg-sky-100 text-sky-800' },
  }

  const workspaceLabels: Record<WorkspaceMode, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; desc: string }> = {
    ALL_OPERATIONS: { label: 'Tất cả Phân hệ (Full Platform)', icon: LayoutGrid, desc: 'Toàn bộ 15 phân hệ Amazon Operations' },
    PPC_GROWTH: { label: 'PPC & Growth Engineering', icon: Zap, desc: 'Day-parting Rules, Search Term Harvester, Cannibalization' },
    SUPPLY_CHAIN: { label: 'Supply Chain & Geo-FBA Hub', icon: Ship, desc: 'Dynamic Lead-Time, Geo Inbound Placement Calculator' },
    BRAND_INTELLIGENCE: { label: 'Brand Intel & CRO Desk', icon: Target, desc: 'Reverse ASIN Radar & Funnel Diagnostic Heatmap' },
    COMPLIANCE_OPS: { label: 'Legal & Compliance Ops', icon: Gavel, desc: 'Automated POA Builder & USPTO Trademark Watch' },
    SUPPLIER_PORTAL: { label: 'Cổng Doanh Nghiệp VN (Supplier)', icon: Shield, desc: 'Báo cáo Doanh thu/Lợi nhuận ròng song tệ USD/VNĐ' },
  }

  const activeClient = clients.find((c) => c.id === selectedClientId)
  const CurrentWorkspaceIcon = workspaceLabels[workspaceMode]?.icon || LayoutGrid

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Workspace Mode Switcher & Supplier Selector */}
      <div className="flex items-center gap-3">
        {/* Deep-Tech Workspace Selector */}
        <div className="relative">
          <button
            onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
            className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/60 px-3 py-1.5 text-xs font-bold text-indigo-950 hover:bg-indigo-100/70 transition-colors shadow-xs"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <CurrentWorkspaceIcon size={12} />
            </div>
            <span className="hidden sm:inline">{workspaceLabels[workspaceMode]?.label}</span>
            <span className="sm:hidden font-mono text-[11px]">{workspaceMode.split('_')[0]}</span>
            <ChevronDown size={13} className="text-indigo-500" />
          </button>

          {workspaceDropdownOpen && (
            <div className="absolute left-0 mt-2 w-80 rounded-2xl border border-border bg-white p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Không Gian Làm Việc Chuyên Biệt (v2.0)
              </div>
              {(Object.keys(workspaceLabels) as WorkspaceMode[]).map((mode) => {
                const ItemIcon = workspaceLabels[mode].icon
                const isSelected = workspaceMode === mode
                return (
                  <button
                    key={mode}
                    onClick={() => {
                      setWorkspaceMode(mode)
                      setWorkspaceDropdownOpen(false)
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all ${
                      isSelected ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <ItemIcon size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold leading-tight truncate">{workspaceLabels[mode].label}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{workspaceLabels[mode].desc}</div>
                    </div>
                    {isSelected && <CheckCircle2 size={14} className="text-indigo-600 mt-1 shrink-0" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Supplier Selector */}
        {currentRole !== 'CLIENT_SUPPLIER' && (
          <div className="relative hidden md:block">
            <button
              onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <div className="flex h-4 w-4 items-center justify-center rounded bg-blue-600 text-[9px] font-bold text-white">
                {selectedClientId === 'ALL' ? 'ALL' : activeClient?.name?.slice(0, 2).toUpperCase() || 'VN'}
              </div>
              <span className="max-w-[130px] truncate">{selectedClientId === 'ALL' ? 'Tất cả Supplier' : activeClient?.name}</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {clientDropdownOpen && (
              <div className="absolute left-0 mt-1 w-72 rounded-xl border border-border bg-white p-2 shadow-xl z-50">
                <div className="px-2 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Chọn Supplier Việt Nam
                </div>
                <button
                  onClick={() => {
                    setSelectedClientId('ALL')
                    setClientDropdownOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-left transition-colors ${
                    selectedClientId === 'ALL' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers size={14} className="text-blue-600" />
                    <span>Toàn bộ Supplier (Tổng hợp Vexim)</span>
                  </div>
                  {selectedClientId === 'ALL' && <CheckCircle2 size={14} className="text-blue-600" />}
                </button>
                <div className="my-1 border-t border-slate-100" />
                {clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => {
                      setSelectedClientId(client.id)
                      setClientDropdownOpen(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left transition-colors ${
                      selectedClientId === client.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-900">{client.name}</div>
                      <div className="text-[10px] text-slate-400">{client.category} • {client.amazonStoreName}</div>
                    </div>
                    {selectedClientId === client.id && <CheckCircle2 size={14} className="text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Live SP-API Indicator */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/70 px-2.5 py-1 text-[11px] font-medium text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>SP-API: <strong className="font-semibold text-emerald-900">Live</strong></span>
        </div>
      </div>

      {/* Right: Search, AI Scanner, AI Chatbot, Role RBAC */}
      <div className="flex items-center gap-2.5">
        {/* Search bar */}
        <div className="relative hidden xl:block w-44">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm SKU, ASIN, Rule..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* AI Scan Trigger Button */}
        <button
          onClick={() => runAiFullScan()}
          disabled={isScanning}
          className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-all disabled:opacity-50"
          title="Kích hoạt quét toàn diện AI cho SKU, Inventory, PPC và Sức khỏe tài khoản"
        >
          {isScanning ? (
            <RefreshCw size={14} className="animate-spin text-blue-600" />
          ) : (
            <Sparkles size={14} className="text-blue-600" />
          )}
          <span className="hidden sm:inline">{isScanning ? 'Đang phân tích...' : 'AI Scan'}</span>
        </button>

        {/* Floating AI Chat Trigger */}
        <button
          onClick={onOpenChat}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-all"
        >
          <Bot size={14} />
          <span className="hidden sm:inline">Hỏi Vexim AI</span>
        </button>

        {/* Role Switcher Pill (RBAC Switcher) */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-2 py-1.5 text-xs hover:bg-slate-50 transition-colors"
          >
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${roleLabels[currentRole].badgeColor}`}>
              {currentRole.split('_')[0]}
            </span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-1 w-64 rounded-xl border border-border bg-white p-2 shadow-xl z-50">
              <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Chuyển đổi Role Demo (RBAC)
              </div>
              {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setCurrentRole(role)
                    if (role === 'CLIENT_SUPPLIER') setWorkspaceMode('SUPPLIER_PORTAL')
                    setRoleDropdownOpen(false)
                  }}
                  className={`flex w-full items-start justify-between rounded-lg px-2.5 py-2 text-left transition-colors ${
                    currentRole === role ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold">{roleLabels[role].label}</div>
                    <div className="text-[10px] text-slate-400">{roleLabels[role].tag}</div>
                  </div>
                  {currentRole === role && <CheckCircle2 size={14} className="text-blue-600 mt-0.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
