'use client'

import React from 'react'
import { useAppState, ActiveNavTab } from '@/lib/state-context'
import {
  Activity,
  AlertOctagon,
  BarChart3,
  Bot,
  Boxes,
  CheckSquare,
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

  // Calculate badge counts
  const pendingApprovals = recommendations.filter((r) => r.status === 'PENDING_APPROVAL').length
  const criticalSafetyMessages = customerMessages.filter((m) => m.classification === 'SAFETY_CRITICAL' && m.status !== 'SENT').length
  const openTasksCount = tasks.filter((t) => t.status === 'OPEN' || t.status === 'WAITING_APPROVAL').length
  const openHealthIssues = accountHealth.policyComplianceIssues.filter((i) => i.status === 'OPEN').length

  const navSections: { title: string; items: NavItemConfig[] }[] = [
    {
      title: 'AI OPERATIONS CORE',
      items: [
        {
          id: 'ai-operations',
          label: 'AI Operations Center',
          icon: Sparkles,
          badge: pendingApprovals > 0 ? pendingApprovals : undefined,
          badgeVariant: 'red',
        },
        {
          id: 'overview',
          label: 'Amazon US Overview',
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
      title: 'OPERATIONS WORKSPACE',
      items: [
        {
          id: 'products',
          label: 'Sản phẩm & Launch',
          icon: Rocket,
        },
        {
          id: 'listings',
          label: 'Tối ưu Listing AI',
          icon: Package,
        },
        {
          id: 'inventory',
          label: 'Tồn kho & FBA Forecast',
          icon: Boxes,
          badge: 'Cần nhập',
          badgeVariant: 'amber',
        },
        {
          id: 'orders',
          label: 'Đơn hàng & Vận chuyển',
          icon: PackageCheck,
        },
        {
          id: 'customers',
          label: 'CS & Hỗ trợ Khách hàng',
          icon: MessageSquareWarning,
          badge: criticalSafetyMessages > 0 ? 'Khẩn' : undefined,
          badgeVariant: 'red',
        },
        {
          id: 'ppc',
          label: 'Quảng cáo Amazon PPC',
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
      title: 'GOVERNANCE & REPORTING',
      items: [
        {
          id: 'tasks',
          label: 'Quản lý Task Vận hành',
          icon: CheckSquare,
          badge: openTasksCount > 0 ? openTasksCount : undefined,
          badgeVariant: 'blue',
        },
        {
          id: 'reports',
          label: 'Báo cáo & AI Summary',
          icon: FileText,
        },
        {
          id: 'sync-center',
          label: 'Amazon SP-API Connector',
          icon: RefreshCw,
        },
        {
          id: 'vexim-kpis',
          label: 'Hiệu suất Vexim & AI KPI',
          icon: Activity,
          rolesAllowed: ['SUPER_ADMIN', 'OPS_MANAGER', 'ACCOUNT_EXECUTIVE'],
        },
        {
          id: 'audit-log',
          label: 'Nhật ký Thao tác (Audit)',
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
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-900 via-blue-900 to-blue-700 text-base font-extrabold text-white shadow-md shadow-blue-900/10">
              V
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-wider text-slate-900">VEXIM</span>
                <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[9px] font-mono font-bold text-blue-700">
                  US V1
                </span>
              </div>
              <div className="text-[10px] font-mono tracking-wider text-slate-400">AMAZON OPERATIONS</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Marketplace Pill */}
        <div className="mx-3 my-3 flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <Globe2 size={14} className="text-blue-600" />
            <span>Target: Amazon.com (US)</span>
          </div>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" title="Connected to SP-API" />
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
          {navSections.map((section) => {
            // Filter by role permissions if specified
            const visibleItems = section.items.filter(
              (item) => !item.rolesAllowed || item.rolesAllowed.includes(currentRole)
            )
            if (visibleItems.length === 0) return null

            return (
              <div key={section.title}>
                <div className="px-3 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
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
                        className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/20'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            size={16}
                            className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}
                          />
                          <span>{item.label}</span>
                        </div>

                        {item.badge !== undefined && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] ${getBadgeStyle(
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
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-600">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-800">Tenant Isolation & Audit</div>
              <div className="text-[10px] text-slate-400">SOC2 & Amazon SP-API Compliant</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
