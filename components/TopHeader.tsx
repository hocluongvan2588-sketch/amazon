'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import { UserRole } from '@/lib/types'
import {
  Bell,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock,
  Layers,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  UserCheck,
} from 'lucide-react'

export function TopHeader({ onOpenChat }: { onOpenChat: () => void }) {
  const {
    currentRole,
    setCurrentRole,
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
    openModal,
  } = useAppState()

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false)

  const pendingApprovalsCount = recommendations.filter((r) => r.status === 'PENDING_APPROVAL').length

  const roleLabels: Record<UserRole, { label: string; tag: string; badgeColor: string }> = {
    SUPER_ADMIN: { label: 'Vexim Super Admin', tag: 'Toàn quyền hệ thống', badgeColor: 'bg-purple-100 text-purple-800' },
    OPS_MANAGER: { label: 'Amazon Ops Manager', tag: 'Quản lý vận hành', badgeColor: 'bg-blue-100 text-blue-800' },
    ACCOUNT_EXECUTIVE: { label: 'Account Executive', tag: 'Chăm sóc Client', badgeColor: 'bg-emerald-100 text-emerald-800' },
    COMPLIANCE_SPECIALIST: { label: 'Compliance Specialist', tag: 'Pháp lý & FDA', badgeColor: 'bg-amber-100 text-amber-800' },
    CLIENT_SUPPLIER: { label: 'Client / Supplier (Vinacacao)', tag: 'Nhà cung cấp VN', badgeColor: 'bg-sky-100 text-sky-800' },
  }

  const activeClient = clients.find((c) => c.id === selectedClientId)

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-white/95 px-6 backdrop-blur-md">
      {/* Left: Supplier Selector & Tenant Switcher */}
      <div className="flex items-center gap-4">
        {currentRole !== 'CLIENT_SUPPLIER' ? (
          <div className="relative">
            <button
              onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
              className="flex items-center gap-2.5 rounded-lg border border-border bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-[10px] font-bold text-white">
                {selectedClientId === 'ALL' ? 'ALL' : activeClient?.name?.slice(0, 2).toUpperCase() || 'VN'}
              </div>
              <span>{selectedClientId === 'ALL' ? 'Tất cả Nhà cung cấp (Vexim View)' : activeClient?.name || 'Chọn Supplier'}</span>
              <ChevronDown size={14} className="text-slate-400" />
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
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50/70 px-3 py-1.5 text-xs text-sky-900">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-sky-600 text-[10px] font-bold text-white">VC</div>
            <span className="font-semibold">Vinacacao Organics</span>
            <span className="rounded bg-sky-200/80 px-1.5 py-0.5 text-[9px] font-mono text-sky-800">Tenant Locked</span>
          </div>
        )}

        {/* SP-API Sync Status Live Pill */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/70 px-2.5 py-1 text-[11px] font-medium text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>Amazon SP-API: <strong className="font-semibold text-emerald-900">US Live</strong></span>
        </div>
      </div>

      {/* Right: Actions, Role Switcher & AI Trigger */}
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="relative hidden lg:block w-48">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm SKU, ASIN, Task..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* AI Scan Trigger Button */}
        <button
          onClick={() => runAiFullScan()}
          disabled={isScanning}
          className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-all disabled:opacity-50"
          title="Kích hoạt quét toàn diện AI cho SKU, Inventory, PPC và Sức khỏe tài khoản"
        >
          {isScanning ? (
            <RefreshCw size={14} className="animate-spin text-blue-600" />
          ) : (
            <Sparkles size={14} className="text-blue-600" />
          )}
          <span>{isScanning ? 'Đang phân tích...' : 'AI Scan'}</span>
        </button>

        {/* Floating AI Chat Trigger */}
        <button
          onClick={onOpenChat}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-all"
        >
          <Bot size={14} />
          <span>Hỏi Vexim AI</span>
        </button>

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs hover:bg-slate-50 transition-colors"
          >
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${roleLabels[currentRole].badgeColor}`}>
              {currentRole.replace('_', ' ')}
            </span>
            <ChevronDown size={13} className="text-slate-400" />
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
