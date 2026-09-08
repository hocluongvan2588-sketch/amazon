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
  Compass,
  Cpu,
  Gavel,
  Layers,
  LayoutGrid,
  MapPin,
  Megaphone,
  MessageSquareWarning,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Ship,
  Sparkles,
  Target,
  UserCheck,
  User,
  Zap,
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
  } = useAppState()

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false)

  const pendingApprovalsCount = recommendations.filter((r) => r.status === 'PENDING_APPROVAL').length

  const roleConfigs: Record<UserRole, { label: string; department: string; tag: string; badgeColor: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
    PPC_SPECIALIST: { label: 'PPC & Growth Specialist', department: 'Team Quảng Cáo', tag: 'Tập trung Ads, Bid, Keyword Harvester', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Zap },
    SUPPLY_CHAIN_SPECIALIST: { label: 'Logistics & Supply Chain', department: 'Team Kho Vận FBA', tag: 'Tập trung Lead Time, Inbound Split & Tồn kho', badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: Ship },
    BRAND_CS_SPECIALIST: { label: 'Brand & Customer Experience', department: 'Team Nội Dung & CS', tag: 'Tập trung Listing SEO, CRO & Trả lời khách', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200', icon: Target },
    COMPLIANCE_SPECIALIST: { label: 'Compliance & Legal Counsel', department: 'Team Pháp Lý & FDA', tag: 'Tập trung Soạn POA, Sức khỏe TK, USPTO', badgeColor: 'bg-rose-100 text-rose-800 border-rose-200', icon: Gavel },
    SUPER_ADMIN: { label: 'Vexim Super Admin / Ops Lead', department: 'Ban Lãnh Đạo', tag: 'Toàn quyền 15 phân hệ & Duyệt rủi ro cao', badgeColor: 'bg-slate-900 text-white border-slate-700', icon: LayoutGrid },
    OPS_MANAGER: { label: 'Operations Manager', department: 'Quản Lý Vận Hành', tag: 'Điều phối toàn bộ dự án', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200', icon: LayoutGrid },
    ACCOUNT_EXECUTIVE: { label: 'Account Executive', department: 'Chăm Sóc Client', tag: 'Giao tiếp nhà xưởng', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: UserCheck },
    CLIENT_SUPPLIER: { label: 'Chủ Xưởng Việt Nam (Client)', department: 'Doanh Nghiệp VN', tag: 'Chỉ xem P&L, Dòng tiền & Báo cáo minh bạch', badgeColor: 'bg-sky-100 text-sky-800 border-sky-200', icon: ShieldCheck },
  }

  const activeClient = clients.find((c) => c.id === selectedClientId)
  const currentRoleConfig = roleConfigs[currentRole] || roleConfigs.PPC_SPECIALIST
  const RoleIcon = currentRoleConfig.icon

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Prominent Role Selector */}
      <div className="flex items-center gap-3">
        {/* Role Switcher (Department Selector) */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shadow-xs ${currentRoleConfig.badgeColor}`}
            title="Nhấn để chuyển đổi vai trò bộ phận làm việc"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/80 text-slate-900 shadow-xs">
              <RoleIcon size={12} />
            </div>
            <div className="text-left">
              <div className="leading-none text-[11px] font-black">{currentRoleConfig.label}</div>
              <div className="text-[9px] opacity-75 leading-tight font-medium hidden sm:block">{currentRoleConfig.department}</div>
            </div>
            <ChevronDown size={13} className="opacity-70 ml-1" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute left-0 mt-2 w-80 rounded-2xl border border-border bg-white p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Chuyển Đổi Không Gian Bộ Phận (Role Workspace)
              </div>
              {(Object.keys(roleConfigs) as UserRole[]).map((role) => {
                const config = roleConfigs[role]
                const ItemIcon = config.icon
                const isSelected = currentRole === role
                return (
                  <button
                    key={role}
                    onClick={() => {
                      setCurrentRole(role)
                      setRoleDropdownOpen(false)
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all ${
                      isSelected ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <ItemIcon size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold leading-tight truncate">{config.label}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{config.tag}</div>
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
          <span>SP-API: <strong className="font-semibold text-emerald-900">US Connected</strong></span>
        </div>
      </div>

      {/* Right: Search, AI Scanner, AI Chatbot */}
      <div className="flex items-center gap-2.5">
        {/* Search bar */}
        <div className="relative hidden xl:block w-44">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm SKU, ASIN, Rule..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* AI Scan Trigger Button */}
        <button
          onClick={() => runAiFullScan()}
          disabled={isScanning}
          className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-all disabled:opacity-50"
          title="Kích hoạt quét AI riêng cho bộ phận của bạn"
        >
          {isScanning ? (
            <RefreshCw size={14} className="animate-spin text-indigo-600" />
          ) : (
            <Sparkles size={14} className="text-indigo-600" />
          )}
          <span className="hidden sm:inline">{isScanning ? 'Đang quét...' : 'AI Quét Nhanh'}</span>
        </button>

        {/* Floating AI Chat Trigger */}
        <button
          onClick={onOpenChat}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all"
        >
          <Bot size={14} />
          <span className="hidden sm:inline">Hỏi Vexim AI</span>
        </button>

        {/* User Profile Avatar & Account Direct Link */}
        <button
          onClick={() => {
            setActiveTab('user-profile')
          }}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-900 to-indigo-700 text-xs font-black text-white shadow-xs hover:ring-2 hover:ring-indigo-400 transition-all"
          title="Tài khoản cá nhân & Đổi mật khẩu (hocluongvan88@gmail.com)"
        >
          {currentRole.slice(0, 2)}
        </button>
      </div>
    </header>
  )
}
