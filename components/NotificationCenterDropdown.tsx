'use client'

import React, { useState } from 'react'
import { useOutsideClick } from "@/lib/useOutsideClick"
import {
  Bell,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Gavel,
  HeartPulse,
  Mail,
  Megaphone,
  MessageSquareWarning,
  Package,
  ShieldAlert,
  Ship,
  Sparkles,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import { useAppState, ActiveNavTab } from '@/lib/state-context'

interface NotificationItem {
  id: string
  title: string
  description: string
  type: 'CRITICAL_SAFETY' | 'LOW_STOCK' | 'COMPLIANCE' | 'PPC_HARVEST' | 'LOGISTICS'
  timestamp: string
  isRead: boolean
  targetTab: ActiveNavTab
  clientName: string
}

export function NotificationCenterDropdown() {
  const { setActiveTab, recommendations, inventory, customerMessages } = useAppState()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useOutsideClick<HTMLDivElement>(() => setIsOpen(false))

  // Initial rich dynamic notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-01',
      title: '🚨 KHẨN CẤP: Khiếu nại an toàn trẻ nhỏ (CPSC/FDA)',
      description: 'Khách hàng báo cáo dằm cọ xát môi. AI đã khóa auto-reply, chuyển Ops Manager.',
      type: 'CRITICAL_SAFETY',
      timestamp: '10 phút trước',
      isRead: false,
      targetTab: 'customers',
      clientName: 'Lotus Craft Vietnam',
    },
    {
      id: 'notif-02',
      title: '🔴 CẢNH BÁO: SKU Socola 70% còn 11.8 ngày tồn kho FBA',
      description: 'Tồn khả dụng chỉ còn 168 units. Cần châm gấp 1,200 units từ kho 3PL California.',
      type: 'LOW_STOCK',
      timestamp: '25 phút trước',
      isRead: false,
      targetTab: 'supply-chain-hub',
      clientName: 'Vinacacao Organics',
    },
    {
      id: 'notif-03',
      title: '⚠️ PHÁP LÝ: Chặn Launch Hạt điều do thiếu nhãn dị ứng',
      description: 'Thiếu câu "Contains: Cashews (Tree Nuts)" chuẩn FALCPA của FDA Hoa Kỳ.',
      type: 'COMPLIANCE',
      timestamp: '1 giờ trước',
      isRead: false,
      targetTab: 'compliance-ops-desk',
      clientName: 'Highlands Cashew Co.',
    },
    {
      id: 'notif-04',
      title: '🌟 PPC VÀNG: Phát hiện từ khóa ACOS 12.4% (4 Orders)',
      description: 'Cụm từ "pure vietnamese dark cacao" đủ điều kiện cô lập sang Exact Match.',
      type: 'PPC_HARVEST',
      timestamp: '2 giờ trước',
      isRead: true,
      targetTab: 'ppc-growth-desk',
      clientName: 'Vinacacao Organics',
    },
    {
      id: 'notif-05',
      title: '🚢 TÀU BIỂN: Container VNM-LAX-88 đã thông quan Hải Quan',
      description: 'Hải quan CBP & FDA cấp phép Release. Xe kéo Drayage đang chuyển về kho 3PL.',
      type: 'LOGISTICS',
      timestamp: '4 giờ trước',
      isRead: true,
      targetTab: 'supply-chain-hub',
      clientName: 'Vinacacao Organics',
    },
  ])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const handleItemClick = (notif: NotificationItem) => {
    // Mark this one as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    )
    setActiveTab(notif.targetTab)
    setIsOpen(false)
  }

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'CRITICAL_SAFETY':
        return { icon: MessageSquareWarning, color: 'text-rose-600 bg-rose-100' }
      case 'LOW_STOCK':
        return { icon: Ship, color: 'text-amber-600 bg-amber-100' }
      case 'COMPLIANCE':
        return { icon: Gavel, color: 'text-red-600 bg-red-100' }
      case 'PPC_HARVEST':
        return { icon: Zap, color: 'text-purple-600 bg-purple-100' }
      case 'LOGISTICS':
        return { icon: Package, color: 'text-cyan-600 bg-cyan-100' }
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all shadow-xs"
        title="Trung tâm Thông báo & Cảnh báo Sự cố"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 font-mono text-[9px] font-black text-white ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-3.5 text-white">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-cyan-400">
                  <Bell size={14} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white leading-tight">Trung Tâm Thông Báo Realtime</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{unreadCount} cảnh báo chưa đọc</p>
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[10px] font-medium text-slate-300 hover:bg-white/20 hover:text-white transition-colors"
                >
                  <Check size={11} />
                  <span>Đọc tất cả</span>
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 text-xs">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Không có thông báo mới nào.
                </div>
              ) : (
                notifications.map((notif) => {
                  const { icon: Icon, color } = getNotifIcon(notif.type)
                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleItemClick(notif)}
                      className={`w-full p-3 text-left transition-colors flex items-start gap-2.5 hover:bg-slate-50 ${
                        !notif.isRead ? 'bg-blue-50/40' : 'bg-white'
                      }`}
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${color} mt-0.5`}>
                        <Icon size={14} />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {notif.title}
                          </span>
                          {!notif.isRead && (
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-600 shrink-0" />
                          )}
                        </div>

                        <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                          {notif.description}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                          <span className="text-slate-500 font-semibold">{notif.clientName}</span>
                          <span>{notif.timestamp}</span>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer with Email Gateway Info */}
            <div className="border-t border-slate-100 bg-slate-50 p-2.5 px-3 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Mail size={12} className="text-indigo-600" />
                <span>Email Gateway: <strong>AWS SES / Resend Active</strong></span>
              </span>
              <span className="text-emerald-600 font-bold">● Live Webhook</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
