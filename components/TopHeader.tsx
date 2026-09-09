'use client'

import { useOutsideClick } from "@/lib/useOutsideClick"
import { NotificationCenterDropdown } from "@/components/NotificationCenterDropdown"

import React, { useEffect, useState } from 'react'
import { useAppState } from '@/lib/state-context'
import { UserRole } from '@/lib/types'
import {
  Bell,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  Crown,
  Cpu,
  Gavel,
  KeyRound,
  Layers,
  LayoutGrid,
  Lock,
  LogOut,
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
  User,
  UserCheck,
  UserCog,
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
    setActiveTab,
    logout,
    currentUser,
    teamMembers,
  } = useAppState()

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  // Sprint audit: nhãn SP-API giờ là TRẠNG THÁI THẬT từ gateway (hết era
  // "US Live" hardcode trong khi hệ thống đang SIMULATED)
  const [spApiMode, setSpApiMode] = useState<'LIVE' | 'SIMULATED' | 'CHECKING'>('CHECKING')
  useEffect(() => {
    let mounted = true
    fetch('/api/amazon/sync')
      .then((r) => r.json())
      .then((d) => {
        if (mounted && d?.spApi?.mode) setSpApiMode(d.spApi.mode)
      })
      .catch(() => {
        if (mounted) setSpApiMode('SIMULATED')
      })
    return () => {
      mounted = false
    }
  }, [])

  const roleDropdownRef = useOutsideClick<HTMLDivElement>(() => setRoleDropdownOpen(false))
  const clientDropdownRef = useOutsideClick<HTMLDivElement>(() => setClientDropdownOpen(false))
  const profileDropdownRef = useOutsideClick<HTMLDivElement>(() => setProfileDropdownOpen(false))

  const pendingApprovalsCount = recommendations.filter((r) => r.status === 'PENDING_APPROVAL').length

  const roleConfigs: Record<UserRole, { label: string; department: string; tag: string; badgeColor: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
    SUPER_ADMIN: { label: 'Vexim Super Admin / Master', department: 'Ban Lãnh Đạo', tag: 'Toàn quyền 15 phân hệ & Quản trị', badgeColor: 'bg-slate-900 text-white border-slate-700', icon: Crown },
    OPS_MANAGER: { label: 'Operations Director', department: 'Quản Lý Vận Hành', tag: 'Điều phối toàn bộ dự án', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200', icon: LayoutGrid },
    PPC_SPECIALIST: { label: 'PPC & Growth Specialist', department: 'Team Quảng Cáo', tag: 'Tập trung Ads, Bid, Keyword Harvester', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Zap },
    SUPPLY_CHAIN_SPECIALIST: { label: 'Logistics & Supply Chain', department: 'Team Kho Vận FBA', tag: 'Tập trung Lead Time, Inbound Split & Tồn kho', badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: Ship },
    BRAND_CS_SPECIALIST: { label: 'Brand & Customer Experience', department: 'Team Nội Dung & CS', tag: 'Tập trung Listing SEO, CRO & Trả lời khách', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200', icon: Target },
    COMPLIANCE_SPECIALIST: { label: 'Compliance & Legal Counsel', department: 'Team Pháp Lý & FDA', tag: 'Tập trung Soạn POA, Sức khỏe TK, USPTO', badgeColor: 'bg-rose-100 text-rose-800 border-rose-200', icon: Gavel },
    ACCOUNT_EXECUTIVE: { label: 'Account Executive', department: 'Chăm Sóc Client', tag: 'Giao tiếp nhà xưởng', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: UserCheck },
    CLIENT_SUPPLIER: { label: 'Chủ Xưởng Việt Nam (Client)', department: 'Doanh Nghiệp VN', tag: 'Chỉ xem P&L, Dòng tiền & Báo cáo minh bạch', badgeColor: 'bg-sky-100 text-sky-800 border-sky-200', icon: ShieldCheck },
  }

  const activeClient = clients.find((c) => c.id === selectedClientId)
  const currentRoleConfig = roleConfigs[currentRole] || roleConfigs.SUPER_ADMIN
  const RoleIcon = currentRoleConfig.icon

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Prominent Role Selector */}
      <div className="flex items-center gap-3">
        {/* Role Switcher (Department Selector) */}
        <div ref={roleDropdownRef} className="relative">
          <button
            onClick={() => {
              setRoleDropdownOpen(!roleDropdownOpen)
              setProfileDropdownOpen(false)
              setClientDropdownOpen(false)
            }}
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
          <div ref={clientDropdownRef} className="relative hidden md:block">
            <button
              onClick={() => {
                setClientDropdownOpen(!clientDropdownOpen)
                setRoleDropdownOpen(false)
                setProfileDropdownOpen(false)
              }}
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

        {/* SP-API Indicator — trạng thái thật từ /api/amazon/sync */}
        {spApiMode === 'LIVE' ? (
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/70 px-2.5 py-1 text-[11px] font-medium text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>SP-API: <strong className="font-semibold text-emerald-900">US Live</strong></span>
          </div>
        ) : spApiMode === 'SIMULATED' ? (
          <div
            title="Chưa cấu hình Amazon SP-API credentials — dữ liệu Amazon đang MÔ PHỎNG. Thêm credentials theo hướng dẫn ở tab Đồng bộ SP-API."
            className="hidden lg:flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800 cursor-help"
          >
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
            </span>
            <span>SP-API: <strong className="font-semibold text-amber-900">Mô Phỏng (Chưa Kết Nối)</strong></span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
            <span>SP-API: <strong>Đang kiểm tra...</strong></span>
          </div>
        )}
      </div>

      {/* Right: Search, AI Scanner, AI Chatbot & User Profile with Logout */}
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

        {/* Interactive Notification Bell */}
        <NotificationCenterDropdown />

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

        {/* User Account Avatar & Interactive Profile Dropdown */}
        <div ref={profileDropdownRef} className="relative">
          <button
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen)
              setRoleDropdownOpen(false)
              setClientDropdownOpen(false)
            }}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1 pr-2 hover:bg-slate-100 transition-all shadow-xs"
            title="Tài khoản cá nhân & Đăng xuất"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-slate-900 via-indigo-900 to-indigo-700 text-xs font-black text-white shadow-xs">
              {currentUser.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-[11px] font-bold text-slate-900 leading-tight truncate max-w-[110px]">
                {currentUser.fullName.split(' ')[0]}
              </div>
              <div className="text-[9px] font-mono text-slate-400 leading-none truncate max-w-[110px]">
                {currentUser.email.split('@')[0]}
              </div>
            </div>
            <ChevronDown size={12} className="text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* User Header in Dropdown */}
              <div className="p-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                    {currentUser.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate flex items-center gap-1">
                      <span>{currentUser.fullName}</span>
                      {currentUser.role === 'SUPER_ADMIN' && <Crown size={12} className="text-amber-400" />}
                    </div>
                    <div className="text-[10px] font-mono text-indigo-200 truncate">{currentUser.email}</div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-300">
                  <span>Vai trò: <strong className="text-white">{currentUser.role}</strong></span>
                  <span className="rounded bg-emerald-500/30 px-1.5 py-0.2 text-emerald-300 font-mono">Online</span>
                </div>
              </div>

              {/* Action Menu Items */}
              <div className="space-y-0.5 text-xs">
                <button
                  onClick={() => {
                    setActiveTab('user-profile')
                    setProfileDropdownOpen(false)
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 transition-colors"
                >
                  <User size={15} className="text-indigo-600" />
                  <span className="font-semibold">Thông Tin Cá Nhân & Mật Khẩu</span>
                </button>

                {currentRole === 'SUPER_ADMIN' && (
                  <button
                    onClick={() => {
                      setActiveTab('master-admin')
                      setProfileDropdownOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-purple-50 hover:text-purple-900 transition-colors"
                  >
                    <Crown size={15} className="text-amber-500" />
                    <span className="font-semibold">Bảng Quản Trị Super Admin</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveTab('user-profile')
                    setProfileDropdownOpen(false)
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <UserCog size={15} className="text-slate-500" />
                  <span>9 Tài Khoản Phân Quyền (Switch)</span>
                </button>
              </div>

              {/* Logout Button */}
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => {
                  setProfileDropdownOpen(false)
                  logout()
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 transition-colors text-xs font-bold cursor-pointer"
              >
                <LogOut size={15} className="text-red-600" />
                <span>Đăng Xuất (Logout)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
