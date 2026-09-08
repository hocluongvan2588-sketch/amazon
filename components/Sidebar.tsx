'use client'

import React, { useState } from 'react'
import { useAppState, ActiveNavTab } from '@/lib/state-context'
import {
  Activity,
  AlertOctagon,
  BarChart3,
  Bot,
  Boxes,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Cpu,
  FileSpreadsheet,
  FileText,
  Flame,
  Globe2,
  HeartPulse,
  History,
  Layers,
  LayoutDashboard,
  Megaphone,
  MessageSquareWarning,
  Package,
  PackageCheck,
  RefreshCw,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Workflow,
  X,
} from 'lucide-react'

interface NavItemConfig {
  id: ActiveNavTab
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge?: number | string
  badgeVariant?: 'red' | 'amber' | 'blue' | 'green'
  rolesAllowed?: string[]
}

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { activeTab, setActiveTab, currentRole, recommendations, tasks, customerMessages, accountHealth } = useAppState()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Calculate badge counts
  const pendingApprovals = recommendations.filter((r) => r.status === 'PENDING_APPROVAL').length
  const criticalSafetyMessages = customerMessages.filter((m) => m.classification === 'SAFETY_CRITICAL' && m.status !== 'SENT').length
  const openTasksCount = tasks.filter((t) => t.status === 'OPEN' || t.status === 'WAITING_APPROVAL').length
  const openHealthIssues = accountHealth.policyComplianceIssues.filter((i) => i.status === 'OPEN').length

  const navSections: { title: string; items: NavItemConfig[] }[] = [
    {
      title: 'AI CORE',
      items: [
        {
          id: 'ai-operations',
          label: 'AI Operations',
          icon: Sparkles,
          badge: pendingApprovals > 0 ? pendingApprovals : undefined,
          badgeVariant: 'red',
        },
        {
          id: 'overview',
          label: 'Tổng quan Amazon',
          icon: LayoutDashboard,
        },
        {
          id: 'sales-analyst',
          label: 'AI Sales Analyst',
          icon: TrendingUp,
        },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          id: 'products',
          label: 'Sản phẩm & Launch',
          icon: Rocket,
        },
        {
          id: 'listings',
          label: 'Tối ưu Listing',
          icon: Package,
        },
        {
          id: 'inventory',
          label: 'Tồn kho FBA',
          icon: Boxes,
          badge: 'Cần nhập',
          badgeVariant: 'amber',
        },
        {
          id: 'orders',
          label: 'Đơn hàng & FBA',
          icon: PackageCheck,
        },
        {
          id: 'customers',
          label: 'Chăm sóc Khách hàng',
          icon: MessageSquareWarning,
          badge: criticalSafetyMessages > 0 ? 'Khẩn' : undefined,
          badgeVariant: 'red',
        },
        {
          id: 'ppc',
          label: 'Quảng cáo PPC',
          icon: Megaphone,
        },
        {
          id: 'promotions',
          label: 'Khuyến mãi & Deals',
          icon: Flame,
        },
        {
          id: 'account-health',
          label: 'Sức khỏe Tài khoản',
          icon: HeartPulse,
          badge: openHealthIssues > 0 ? openHealthIssues : undefined,
          badgeVariant: 'amber',
        },
      ],
    },
    {
      title: 'GOVERNANCE',
      items: [
        {
          id: 'tasks',
          label: 'Task Vận hành',
          icon: CheckSquare,
          badge: openTasksCount > 0 ? openTasksCount : undefined,
          badgeVariant: 'blue',
        },
        {
          id: 'reports',
          label: 'Báo cáo Hiệu suất',
          icon: FileText,
        },
        {
          id: 'sync-center',
          label: 'SP-API Connector',
          icon: RefreshCw,
        },
        {
          id: 'vexim-kpis',
          label: 'Hiệu suất Vexim',
          icon: Activity,
          rolesAllowed: ['SUPER_ADMIN', 'OPS_MANAGER', 'ACCOUNT_EXECUTIVE'],
        },
        {
          id: 'ai-efficiency',
          label: 'Tối ưu Chi phí AI',
          icon: Cpu,
          badge: '$1.42',
          badgeVariant: 'green',
          rolesAllowed: ['SUPER_ADMIN', 'OPS_MANAGER'],
        },
        {
          id: 'audit-log',
          label: 'Nhật ký Kiểm toán',
          icon: History,
          rolesAllowed: ['SUPER_ADMIN', 'OPS_MANAGER', 'COMPLIANCE_SPECIALIST'],
        },
      ],
    },
  ]

  const getBadgeStyle = (variant?: 'red' | 'amber' | 'blue' | 'green') => {
    switch (variant) {
      case 'red':
        return 'bg-red-500 text-white font-bold'
      case 'amber':
        return 'bg-amber-100 text-amber-800 font-semibold'
      case 'green':
        return 'bg-emerald-100 text-emerald-800 font-semibold'
      case 'blue':
      default:
        return 'bg-blue-100 text-blue-800 font-semibold'
    }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ease-in-out lg:static shrink-0 ${
          isCollapsed ? 'w-[76px]' : 'w-[268px]'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-900 via-blue-900 to-blue-700 text-base font-extrabold text-white shadow-md shadow-blue-900/10">
              V
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-wider text-slate-900">VEXIM</span>
                  <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[9px] font-mono font-bold text-blue-700">
                    US V1
                  </span>
                </div>
                <div className="text-[10px] font-mono tracking-wider text-slate-400 truncate">
                  AMAZON OPERATIONS
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Marketplace Pill */}
        {!isCollapsed ? (
          <div className="mx-3 my-2.5 flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
              <Globe2 size={14} className="text-blue-600 shrink-0" />
              <span className="truncate">Amazon US (Live SP-API)</span>
            </div>
            <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-500" title="Connected to SP-API" />
          </div>
        ) : (
          <div className="mx-auto my-2 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-blue-600">
            <Globe2 size={16} />
          </div>
        )}

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {navSections.map((section) => {
            const visibleItems = section.items.filter(
              (item) => !item.rolesAllowed || item.rolesAllowed.includes(currentRole)
            )
            if (visibleItems.length === 0) return null

            return (
              <div key={section.title}>
                {!isCollapsed && (
                  <div className="px-3 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    {section.title}
                  </div>
                )}
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.id

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id)
                          if (window.innerWidth < 1024) onClose()
                        }}
                        title={isCollapsed ? item.label : undefined}
                        className={`group flex w-full items-center rounded-lg text-xs font-medium transition-all ${
                          isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                        } ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <Icon
                            size={16}
                            className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}
                          />
                          {!isCollapsed && (
                            <span className="truncate whitespace-nowrap text-left">{item.label}</span>
                          )}
                        </div>

                        {!isCollapsed && item.badge !== undefined && (
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.2 text-[10px] ${getBadgeStyle(
                              item.badgeVariant
                            )}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Security Badge */}
        <div className="border-t border-slate-200 p-3">
          {!isCollapsed ? (
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <div className="min-w-0 flex-1 truncate">
                <div className="font-semibold text-slate-800 truncate">Tenant Isolation Active</div>
                <div className="text-[10px] text-slate-400 truncate">SOC2 & SP-API Guard</div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center p-1 text-emerald-600" title="Tenant Isolation Active">
              <ShieldCheck size={18} />
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
