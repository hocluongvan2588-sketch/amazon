'use client'

import React, { useState } from 'react'
import { useAppState, ActiveNavTab } from '@/lib/state-context'
import { UserRole } from '@/lib/types'
import {
  Activity,
  Crown,
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
  Gavel,
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
  Ship,
  Sparkles,
  Target,
  TrendingUp,
  Workflow,
  X,
  Zap,
} from 'lucide-react'

interface NavItemConfig {
  id: ActiveNavTab
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge?: number | string
  badgeVariant?: 'red' | 'amber' | 'blue' | 'green' | 'purple'
}

interface NavSection {
  title: string
  items: NavItemConfig[]
}

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    activeTab,
    setActiveTab,
    currentRole,
    recommendations,
    tasks,
    customerMessages,
    accountHealth,
    harvestedSearchTerms,
    poaDocuments,
  } = useAppState()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Calculate badge counts
  const pendingApprovals = recommendations.filter((r) => r.status === 'PENDING_APPROVAL').length
  const criticalSafetyMessages = customerMessages.filter((m) => m.classification === 'SAFETY_CRITICAL' && m.status !== 'SENT').length
  const openTasksCount = tasks.filter((t) => t.status === 'OPEN' || t.status === 'WAITING_APPROVAL').length
  const openHealthIssues = accountHealth.policyComplianceIssues.filter((i) => i.status === 'OPEN').length
  const pendingHarvest = harvestedSearchTerms.filter((t) => t.status === 'PENDING').length

  // Dynamically tailor the sidebar navigation depending on the active department role
  const getRoleSpecificNavSections = (role: UserRole): NavSection[] => {
    switch (role) {
      case 'PPC_SPECIALIST':
        return [
          {
            title: 'KHÔNG GIAN PPC & GROWTH',
            items: [
              {
                id: 'ppc-growth-desk',
                label: 'PPC & Growth Desk',
                icon: Zap,
                badge: pendingHarvest > 0 ? `${pendingHarvest} từ khóa` : undefined,
                badgeVariant: 'purple',
              },
              {
                id: 'ppc',
                label: 'Chiến Dịch Quảng Cáo',
                icon: Megaphone,
              },
              {
                id: 'promotions',
                label: 'Khuyến Mãi & Deals',
                icon: Flame,
              },
              {
                id: 'sales-analyst',
                label: 'AI Sales & ROAS Analyst',
                icon: TrendingUp,
              },
              {
                id: 'tasks',
                label: 'Nhiệm Vụ PPC Hôm Nay',
                icon: CheckSquare,
                badge: openTasksCount > 0 ? openTasksCount : undefined,
                badgeVariant: 'blue',
              },
            ],
          },
        ]

      case 'SUPPLY_CHAIN_SPECIALIST':
        return [
          {
            title: 'KHÔNG GIAN KHO VẬN & FBA',
            items: [
              {
                id: 'supply-chain-hub',
                label: 'Supply Chain & Geo-FBA',
                icon: Ship,
                badge: 'JIT Restock',
                badgeVariant: 'blue',
              },
              {
                id: 'inventory',
                label: 'Tồn Kho FBA & 3PL',
                icon: Boxes,
                badge: 'Cần nhập',
                badgeVariant: 'amber',
              },
              {
                id: 'orders',
                label: 'Đơn Hàng & Giao Vận',
                icon: PackageCheck,
              },
              {
                id: 'sync-center',
                label: 'SP-API Đồng Bộ Kho',
                icon: RefreshCw,
              },
              {
                id: 'tasks',
                label: 'Nhiệm Vụ Kho & Vận Chuyển',
                icon: CheckSquare,
                badge: openTasksCount > 0 ? openTasksCount : undefined,
                badgeVariant: 'blue',
              },
            ],
          },
        ]

      case 'BRAND_CS_SPECIALIST':
        return [
          {
            title: 'KHÔNG GIAN BRAND, LISTING & CS',
            items: [
              {
                id: 'brand-intelligence',
                label: 'Brand Intel & CRO Desk',
                icon: Target,
                badge: '2 CVR Gap',
                badgeVariant: 'purple',
              },
              {
                id: 'listings',
                label: 'Tối Ưu Listing & SEO',
                icon: Package,
              },
              {
                id: 'products',
                label: 'Sản Phẩm & Tiếp Nhận',
                icon: Rocket,
              },
              {
                id: 'customers',
                label: 'Chăm Sóc Khách Hàng (Inbox)',
                icon: MessageSquareWarning,
                badge: criticalSafetyMessages > 0 ? 'Khẩn' : undefined,
                badgeVariant: 'red',
              },
              {
                id: 'tasks',
                label: 'Nhiệm Vụ Content & CS',
                icon: CheckSquare,
                badge: openTasksCount > 0 ? openTasksCount : undefined,
                badgeVariant: 'blue',
              },
            ],
          },
        ]

      case 'COMPLIANCE_SPECIALIST':
        return [
          {
            title: 'KHÔNG GIAN PHÁP LÝ & AN TOÀN',
            items: [
              {
                id: 'compliance-ops-desk',
                label: 'Legal & Soạn Đơn POA',
                icon: Gavel,
                badge: 'POA Ready',
                badgeVariant: 'red',
              },
              {
                id: 'account-health',
                label: 'Sức Khỏe Tài Khoản',
                icon: HeartPulse,
                badge: openHealthIssues > 0 ? openHealthIssues : undefined,
                badgeVariant: 'amber',
              },
              {
                id: 'products',
                label: 'Kiểm Duyệt FDA / COA',
                icon: Rocket,
              },
              {
                id: 'audit-log',
                label: 'Nhật Ký Kiểm Toán (Audit)',
                icon: History,
              },
              {
                id: 'tasks',
                label: 'Nhiệm Vụ Pháp Lý',
                icon: CheckSquare,
                badge: openTasksCount > 0 ? openTasksCount : undefined,
                badgeVariant: 'blue',
              },
            ],
          },
        ]

      case 'CLIENT_SUPPLIER':
        return [
          {
            title: 'CỔNG DOANH NGHIỆP VIỆT NAM',
            items: [
              {
                id: 'supplier-portal',
                label: 'Cổng Doanh Nghiệp (P&L)',
                icon: ShieldCheck,
                badge: 'VNĐ / USD',
                badgeVariant: 'green',
              },
              {
                id: 'reports',
                label: 'Báo Cáo Doanh Thu & Lãi',
                icon: FileText,
              },
              {
                id: 'inventory',
                label: 'Tồn Kho Sản Phẩm',
                icon: Boxes,
              },
            ],
          },
        ]

      case 'SUPER_ADMIN':
      case 'OPS_MANAGER':
      case 'ACCOUNT_EXECUTIVE':
      default:
        // Super Admin & Ops Lead see full system cleanly categorized
        return [
          {
            title: 'QUẢN TRỊ CẤP CAO (MASTER CONTROL)',
            items: [
              { id: 'master-admin', label: 'Quản Trị, Cấp Quyền & P&L', icon: Crown, badge: 'Master', badgeVariant: 'purple' },
              { id: 'ai-efficiency', label: 'Tối Ưu Chi Phí AI ($1.42)', icon: Cpu, badge: '$1.42', badgeVariant: 'green' },
              { id: 'vexim-kpis', label: 'Hiệu Suất Vexim Agency', icon: Activity },
            ],
          },
          {
            title: 'CÁC DESK CHUYÊN SÂU (DEEP-TECH)',
            items: [
              { id: 'ppc-growth-desk', label: 'PPC & Growth Desk', icon: Zap, badge: pendingHarvest > 0 ? pendingHarvest : undefined, badgeVariant: 'purple' },
              { id: 'supply-chain-hub', label: 'Supply Chain & Geo-FBA', icon: Ship, badge: 'JIT', badgeVariant: 'blue' },
              { id: 'brand-intelligence', label: 'Brand Intel & CRO', icon: Target },
              { id: 'compliance-ops-desk', label: 'Legal & Soạn Đơn POA', icon: Gavel, badge: 'POA', badgeVariant: 'red' },
              { id: 'supplier-portal', label: 'Supplier Executive Portal', icon: ShieldCheck, badge: 'Client', badgeVariant: 'green' },
            ],
          },
          {
            title: 'AI CORE & VẬN HÀNH CHÍNH',
            items: [
              { id: 'ai-operations', label: 'AI Operations Center', icon: Sparkles, badge: pendingApprovals > 0 ? pendingApprovals : undefined, badgeVariant: 'red' },
              { id: 'overview', label: 'Tổng quan Amazon', icon: LayoutDashboard },
              { id: 'sales-analyst', label: 'AI Sales Analyst', icon: TrendingUp },
              { id: 'products', label: 'Sản phẩm & Launch', icon: Rocket },
              { id: 'listings', label: 'Tối ưu Listing', icon: Package },
              { id: 'inventory', label: 'Tồn kho FBA', icon: Boxes, badge: 'Cần nhập', badgeVariant: 'amber' },
              { id: 'orders', label: 'Đơn hàng & FBA', icon: PackageCheck },
              { id: 'customers', label: 'Chăm sóc Khách hàng', icon: MessageSquareWarning, badge: criticalSafetyMessages > 0 ? 'Khẩn' : undefined, badgeVariant: 'red' },
              { id: 'ppc', label: 'Quảng cáo PPC', icon: Megaphone },
              { id: 'promotions', label: 'Khuyến mãi & Deals', icon: Flame },
              { id: 'account-health', label: 'Sức khỏe Tài khoản', icon: HeartPulse, badge: openHealthIssues > 0 ? openHealthIssues : undefined, badgeVariant: 'amber' },
            ],
          },
          {
            title: 'QUẢN TRỊ & GOVERNANCE',
            items: [
              { id: 'tasks', label: 'Task Vận hành', icon: CheckSquare, badge: openTasksCount > 0 ? openTasksCount : undefined, badgeVariant: 'blue' },
              { id: 'reports', label: 'Báo cáo Hiệu suất', icon: FileText },
              { id: 'sync-center', label: 'SP-API Connector', icon: RefreshCw },
              { id: 'vexim-kpis', label: 'Hiệu suất Vexim', icon: Activity },
              { id: 'ai-efficiency', label: 'Tối ưu Chi phí AI', icon: Cpu, badge: '$1.42', badgeVariant: 'green' },
              { id: 'audit-log', label: 'Nhật ký Kiểm toán', icon: History },
            ],
          },
        ]
    }
  }

  const navSections = getRoleSpecificNavSections(currentRole)

  const getRoleHeaderInfo = () => {
    switch (currentRole) {
      case 'PPC_SPECIALIST':
        return { title: 'PPC Specialist', desc: 'Chuyên gia Quảng Cáo & Growth', color: 'bg-indigo-500 text-indigo-100 border-indigo-600' }
      case 'SUPPLY_CHAIN_SPECIALIST':
        return { title: 'Logistics Hub', desc: 'Chuyên gia Kho Vận & FBA', color: 'bg-cyan-600 text-cyan-100 border-cyan-700' }
      case 'BRAND_CS_SPECIALIST':
        return { title: 'Brand & CS Desk', desc: 'Listing & Chăm sóc Khách hàng', color: 'bg-purple-600 text-purple-100 border-purple-700' }
      case 'COMPLIANCE_SPECIALIST':
        return { title: 'Legal & Compliance', desc: 'Pháp Lý, FDA & POA', color: 'bg-rose-600 text-rose-100 border-rose-700' }
      case 'CLIENT_SUPPLIER':
        return { title: 'Supplier Portal', desc: 'Chủ Xưởng Việt Nam', color: 'bg-sky-600 text-sky-100 border-sky-700' }
      case 'SUPER_ADMIN':
      case 'OPS_MANAGER':
      default:
        return { title: 'Super Admin Mode', desc: 'Toàn quyền 15 Phân hệ', color: 'bg-slate-900 text-slate-100 border-slate-800' }
    }
  }

  const roleInfo = getRoleHeaderInfo()

  const getBadgeStyle = (variant?: 'red' | 'amber' | 'blue' | 'green' | 'purple') => {
    switch (variant) {
      case 'red':
        return 'bg-red-500 text-white font-bold'
      case 'amber':
        return 'bg-amber-100 text-amber-800 font-semibold'
      case 'green':
        return 'bg-emerald-100 text-emerald-800 font-semibold'
      case 'purple':
        return 'bg-purple-100 text-purple-800 font-semibold'
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
          isCollapsed ? 'w-[76px]' : 'w-[274px]'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-800 text-base font-extrabold text-white shadow-md shadow-blue-900/10">
              V
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-wider text-slate-900">VEXIM</span>
                  <span className="rounded bg-indigo-100 px-1.5 py-0.2 text-[9px] font-mono font-bold text-indigo-800">
                    Role Active
                  </span>
                </div>
                <div className="text-[10px] font-mono tracking-wider text-slate-400 truncate">
                  FOCUSED WORKSPACE
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

        {/* Current Active Role Highlight Card */}
        {!isCollapsed ? (
          <div className="mx-3 my-2.5 rounded-xl border border-slate-200 bg-slate-50/90 p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Bộ phận đang làm việc:</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="mt-1 font-bold text-xs text-slate-900">{roleInfo.title}</div>
            <div className="text-[10px] text-slate-500 truncate">{roleInfo.desc}</div>
          </div>
        ) : (
          <div className="mx-auto my-2 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs" title={roleInfo.title}>
            {currentRole.slice(0, 2)}
          </div>
        )}

        {/* Navigation List (Filtered strictly for active role) */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {navSections.map((section) => (
            <div key={section.title}>
              {!isCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
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
                          ? 'bg-indigo-600 text-white font-semibold shadow-xs'
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
          ))}
        </div>

        {/* Footer Security Badge */}
        <div className="border-t border-slate-200 p-3">
          {!isCollapsed ? (
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <div className="min-w-0 flex-1 truncate">
                <div className="font-semibold text-slate-800 truncate">Role Isolation Active</div>
                <div className="text-[10px] text-slate-400 truncate">Giao diện tập trung 100%</div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center p-1 text-emerald-600" title="Role Isolation Active">
              <ShieldCheck size={18} />
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
