'use client'

import React, { useState, useMemo } from 'react'
import { useOutsideClick } from '@/lib/useOutsideClick'
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  Flame,
  Gavel,
  Layers,
  Mail,
  Megaphone,
  MessageSquareWarning,
  Package,
  ShieldAlert,
  ShieldCheck,
  Ship,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  X,
  Zap,
} from 'lucide-react'
import { useAppState, ActiveNavTab } from '@/lib/state-context'
import { AppNotification, NotificationType, UserRole } from '@/lib/types'

export function NotificationCenterDropdown() {
  const {
    currentRole,
    currentUser,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
    setActiveTab,
  } = useAppState()

  const [isOpen, setIsOpen] = useState(false)
  const [scopeFilter, setScopeFilter] = useState<'MY_ROLE' | 'ALL_SYSTEM'>('MY_ROLE')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

  const dropdownRef = useOutsideClick<HTMLDivElement>(() => setIsOpen(false), isOpen)

  const isClient = currentRole === 'CLIENT_SUPPLIER'

  // Determine if a notification is relevant to the active user's role & multi-tenant client boundary
  const isRelevantToRole = (notif: AppNotification, role: UserRole): boolean => {
    // 1. Role match
    const roles = notif.targetRoles as (UserRole | 'ALL')[]
    const roleMatches =
      role === 'SUPER_ADMIN' ||
      role === 'OPS_MANAGER' ||
      roles.includes('ALL') ||
      roles.includes(role)

    if (!roleMatches) return false

    // 2. Strict Client Supplier Isolation:
    // A Vietnamese Factory Owner must ONLY see notifications for their own brand/clientId!
    if (role === 'CLIENT_SUPPLIER') {
      const assignedIds = currentUser.assignedClientIds || []
      if (assignedIds.length > 0 && !assignedIds.includes('ALL')) {
        if (notif.clientId && !assignedIds.includes(notif.clientId)) {
          return false
        }
      }
    }

    return true
  }

  // Filtered notifications based on user role and tenant client boundary
  const roleNotifications = useMemo(() => {
    return notifications.filter((n) => isRelevantToRole(n, currentRole))
  }, [notifications, currentRole, currentUser])

  const displayedNotifications = useMemo(() => {
    // Client suppliers only see their role-specific notifications (no cross-agency leak)
    let list = isClient || scopeFilter === 'MY_ROLE' ? roleNotifications : notifications

    if (categoryFilter !== 'ALL') {
      list = list.filter((n) => {
        if (categoryFilter === 'CRITICAL') return n.priority === 'CRITICAL' || n.type === 'CRITICAL_SAFETY'
        if (categoryFilter === 'PPC') return n.type === 'PPC_HARVEST'
        if (categoryFilter === 'SUPPLY') return n.type === 'LOW_STOCK' || n.type === 'LOGISTICS'
        if (categoryFilter === 'COMPLIANCE') return n.type === 'COMPLIANCE' || n.type === 'CRITICAL_SAFETY'
        if (categoryFilter === 'APPROVAL') return n.type === 'APPROVAL' || n.type === 'TASK'
        return true
      })
    }

    return list
  }, [scopeFilter, roleNotifications, notifications, categoryFilter, isClient])

  // Unread counts
  const unreadRoleCount = useMemo(() => {
    return roleNotifications.filter((n) => !n.isRead).length
  }, [roleNotifications])

  const handleItemClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id)

    // Intelligently route based on role:
    // If user is a Client Supplier, navigate to their Supplier Dashboard / Inventory instead of internal AI tools
    if (isClient) {
      if (notif.type === 'LOW_STOCK' || notif.type === 'LOGISTICS') {
        setActiveTab('inventory')
      } else if (notif.type === 'FINANCE') {
        setActiveTab('reports')
      } else {
        setActiveTab('supplier-portal')
      }
    } else if (notif.targetTab) {
      setActiveTab(notif.targetTab as ActiveNavTab)
    }

    setIsOpen(false)
  }

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case 'CRITICAL_SAFETY':
        return { icon: MessageSquareWarning, color: 'text-rose-600 bg-rose-100 border-rose-200' }
      case 'LOW_STOCK':
        return { icon: Ship, color: 'text-amber-600 bg-amber-100 border-amber-200' }
      case 'COMPLIANCE':
        return { icon: Gavel, color: 'text-red-600 bg-red-100 border-red-200' }
      case 'PPC_HARVEST':
        return { icon: Zap, color: 'text-purple-600 bg-purple-100 border-purple-200' }
      case 'LOGISTICS':
        return { icon: Package, color: 'text-cyan-600 bg-cyan-100 border-cyan-200' }
      case 'APPROVAL':
        return { icon: Sparkles, color: 'text-emerald-600 bg-emerald-100 border-emerald-200' }
      case 'TASK':
        return { icon: UserCheck, color: 'text-blue-600 bg-blue-100 border-blue-200' }
      case 'LISTING':
        return { icon: Sparkles, color: 'text-indigo-600 bg-indigo-100 border-indigo-200' }
      case 'FINANCE':
        return { icon: TrendingUp, color: 'text-emerald-600 bg-emerald-100 border-emerald-200' }
      case 'SYSTEM':
      default:
        return { icon: Bell, color: 'text-slate-600 bg-slate-100 border-slate-200' }
    }
  }

  const getRoleBadgeLabel = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Giám Đốc Vận Hành'
      case 'OPS_MANAGER':
        return 'Ops Manager'
      case 'PPC_SPECIALIST':
        return 'PPC & Growth Team'
      case 'SUPPLY_CHAIN_SPECIALIST':
        return 'Supply Chain Team'
      case 'BRAND_CS_SPECIALIST':
        return 'Brand & CS Team'
      case 'COMPLIANCE_SPECIALIST':
        return 'Pháp Lý & FDA'
      case 'ACCOUNT_EXECUTIVE':
        return 'Account Executive'
      case 'CLIENT_SUPPLIER':
        return `Nhà Xưởng: ${currentUser.department || 'Supplier'}`
      default:
        return 'Vexim Team'
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all shadow-xs"
        title="Trung tâm Thông báo"
      >
        <Bell size={16} />
        {unreadRoleCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 font-mono text-[9px] font-black text-white ring-2 ring-white animate-pulse">
            {unreadRoleCount > 9 ? '9+' : unreadRoleCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 sm:w-[420px] rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-3.5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-cyan-400">
                  <Bell size={14} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white leading-tight">
                    {isClient ? 'Thông Báo Hoạt Động Doanh Nghiệp' : 'Trung Tâm Điều Phối Thông Báo'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                    <span className="font-medium text-cyan-300">
                      {getRoleBadgeLabel(currentRole)}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {unreadRoleCount} chưa đọc
                    </span>
                  </div>
                </div>
              </div>

              {unreadRoleCount > 0 && (
                <button
                  onClick={() => markAllNotificationsAsRead(currentRole)}
                  className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[10px] font-medium text-slate-300 hover:bg-white/20 hover:text-white transition-colors"
                  title="Đánh dấu tất cả thông báo là đã đọc"
                >
                  <CheckCheck size={12} />
                  <span>Đọc tất cả</span>
                </button>
              )}
            </div>

            {/* Scope Switcher: ONLY for Super Admin / Ops Manager. Suppliers only see their own brand alerts. */}
            {!isClient && (
              <div className="mt-3 flex items-center gap-1 rounded-xl bg-white/10 p-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setScopeFilter('MY_ROLE')}
                  className={`flex-1 rounded-lg py-1 px-2 font-semibold transition-all ${
                    scopeFilter === 'MY_ROLE'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Phòng ban của tôi ({roleNotifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setScopeFilter('ALL_SYSTEM')}
                  className={`flex-1 rounded-lg py-1 px-2 font-semibold transition-all ${
                    scopeFilter === 'ALL_SYSTEM'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Toàn bộ Agency ({notifications.length})
                </button>
              </div>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] no-scrollbar">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`rounded-lg px-2 py-0.5 font-medium transition-colors whitespace-nowrap ${
                categoryFilter === 'ALL'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tất cả ({displayedNotifications.length})
            </button>
            <button
              onClick={() => setCategoryFilter('SUPPLY')}
              className={`rounded-lg px-2 py-0.5 font-medium transition-colors whitespace-nowrap ${
                categoryFilter === 'SUPPLY'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'bg-white border border-slate-200 text-cyan-700 hover:bg-cyan-50'
              }`}
            >
              📦 Tồn kho & Vận tải
            </button>
            {!isClient && (
              <>
                <button
                  onClick={() => setCategoryFilter('CRITICAL')}
                  className={`rounded-lg px-2 py-0.5 font-medium transition-colors whitespace-nowrap ${
                    categoryFilter === 'CRITICAL'
                      ? 'bg-rose-600 text-white font-bold'
                      : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  🚨 Khẩn cấp
                </button>
                <button
                  onClick={() => setCategoryFilter('PPC')}
                  className={`rounded-lg px-2 py-0.5 font-medium transition-colors whitespace-nowrap ${
                    categoryFilter === 'PPC'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-white border border-slate-200 text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  ⚡ PPC
                </button>
              </>
            )}
            <button
              onClick={() => setCategoryFilter('APPROVAL')}
              className={`rounded-lg px-2 py-0.5 font-medium transition-colors whitespace-nowrap ${
                categoryFilter === 'APPROVAL'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              ✨ Tiến độ & P&L
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 text-xs">
            {displayedNotifications.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 space-y-1">
                <Bell size={24} className="mx-auto text-slate-300 mb-1" />
                <p className="font-semibold text-slate-600">Không có thông báo mới</p>
                <p className="text-[11px] text-slate-400">
                  {isClient
                    ? 'Các cập nhật đơn hàng, xuất nhập kho và báo cáo P&L sẽ xuất hiện tại đây.'
                    : 'Các hành động vận hành mới sẽ xuất hiện tại đây.'}
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => {
                const { icon: Icon, color } = getNotifIcon(notif.type)
                return (
                  <div
                    key={notif.id}
                    className={`relative w-full p-3 text-left transition-all flex items-start gap-2.5 hover:bg-slate-50 group ${
                      !notif.isRead ? 'bg-blue-50/40 font-medium' : 'bg-white'
                    }`}
                  >
                    {/* Notification Icon */}
                    <button
                      type="button"
                      onClick={() => handleItemClick(notif)}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${color} mt-0.5 cursor-pointer shadow-2xs`}
                    >
                      <Icon size={15} />
                    </button>

                    {/* Content Body */}
                    <div
                      className="flex-1 min-w-0 space-y-1 cursor-pointer"
                      onClick={() => handleItemClick(notif)}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-bold text-slate-900 text-xs truncate leading-snug">
                          {notif.title}
                        </span>
                        {!notif.isRead && (
                          <span className="h-2 w-2 rounded-full bg-rose-600 shrink-0 ring-2 ring-white" />
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                        {notif.description}
                      </p>

                      {/* Meta Footer */}
                      <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono pt-1 gap-1">
                        <div className="flex items-center gap-1.5">
                          {notif.clientName && (
                            <span className="text-slate-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                              {notif.clientName}
                            </span>
                          )}
                          <span className="text-indigo-600 font-semibold font-sans">
                            {isClient
                              ? (notif.type === 'LOW_STOCK' ? '👉 Bấm xem Tồn Kho' : '👉 Bấm xem Chi Tiết')
                              : '👉 Mở phân hệ'}
                          </span>
                        </div>
                        <span className="text-slate-400">{notif.timestamp}</span>
                      </div>
                    </div>

                    {/* Quick Dismiss / Delete */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearNotification(notif.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-opacity"
                      title="Xóa thông báo này"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 p-2.5 px-3 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <span>
                {isClient ? 'Cổng kết nối Doanh nghiệp' : 'Event Dispatcher'}:{' '}
                <strong>{isClient ? 'Bảo mật đa nhà cung cấp' : 'Role-Based Routing Active'}</strong>
              </span>
            </span>
            <span className="text-slate-400 font-mono">Vexim Amazon OS</span>
          </div>
        </div>
      )}
    </div>
  )
}
