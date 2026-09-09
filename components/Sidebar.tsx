'use client'

import React, { useState } from 'react'
import { useAppState, ActiveNavTab } from '@/lib/state-context'
import { UserRole } from '@/lib/types'
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
  Crown,
  GraduationCap,
  FileSpreadsheet,
  FileText,
  Flame,
  Gavel,
  Globe2,
  HeartPulse,
  History,
  Layers,
  LayoutDashboard,
  LogOut,
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
  User,
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
    currentUser,
    logout,
    recommendations,
    tasks,
    customerMessages,
    accountHealth,
    harvestedSearchTerms,
    conversionDiagnostics,
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
              { id: 'ppc-growth-desk', label: 'PPC & Growth Desk', icon: Zap, badge: pendingHarvest > 0 ? `${pendingHarvest} từ khóa` : undefined, badgeVariant: 'purple' },
              { id: 'ppc', label: 'Chiến Dịch Quảng Cáo', icon: Megaphone },
              { id: 'promotions', label: 'Khuyến Mãi & Deals', icon: Flame },
              { id: 'sales-analyst', label: 'AI Sales & ROAS Analyst', icon: TrendingUp },
              { id: 'tasks', label: 'Nhiệm Vụ PPC Hôm Nay', icon: CheckSquare, badge: openTasksCount > 0 ? openTasksCount : undefined, badgeVariant: 'blue' },
              { id: 'training-academy', label: 'Giáo Trình Đào Tạo PPC', icon: GraduationCap, badge: 'Module 02', badgeVariant: 'purple' },
              { id: 'user-profile', label: 'Thông Tin Cá Nhân & MK', icon: User },
            ],
          },
        ]

      case 'SUPPLY_CHAIN_SPECIALIST':
        return [
          {
            title: 'KHÔNG GIAN KHO VẬN & FBA',
            items: [
              { id: 'supply-chain-hub', label: 'Supply Chain & Geo-FBA', icon: Ship, badge: 'JIT Restock', badgeVariant: 'blue' },
              { id: 'inventory', label: 'Tồn Kho FBA & 3PL', icon: Boxes, badge: 'Cần nhập', badgeVariant: 'amber' },
              { id: 'orders', label: 'Đơn Hàng & Giao Vận', icon: PackageCheck },
              { id: 'sync-center', label: 'SP-API Đồng Bộ Kho', icon: RefreshCw },
              { id: 'tasks', label: 'Nhiệm Vụ Kho & Vận Chuyển', icon: CheckSquare, badge: openTasksCount > 0 ? openTasksCount : undefined, badgeVariant: 'blue' },
              { id: 'training-academy', label: 'Giáo Trình Đào Tạo Kho', icon: GraduationCap, badge: 'Module 03', badgeVariant: 'blue' },
              { id: 'user-profile', label: 'Thông Tin Cá Nhân & MK', icon: User },
            ],
          },
        ]

      case 'BRAND_CS_SPECIALIST':
        return [
          {
            title: 'KHÔNG GIAN BRAND, LISTING & CS',
            items: [
              { id: 'brand-intelligence', label: 'Brand Intel & CRO Desk', icon: Target, badge: conversionDiagnostics.filter((d) => d.unitSessionPercentage < d.categoryBenchmarkCvr).length > 0 ? `${conversionDiagnostics.filter((d) => d.unitSessionPercentage < d.categoryBenchmarkCvr).length} CVR Gap` : undefined, badgeVariant: 'purple' },
              { id: 'listings', label: 'Tối Ưu Listing & SEO', icon: Package },
              { id: 'products', label: 'Sản Phẩm & Tiếp Nhận', icon: Rocket },
              { id: 'customers', label: 'Chăm Sóc Khách Hàng (Inbox)', icon: MessageSquareWarning, badge: criticalSafetyMessages > 0 ? 'Khẩn' : undefined, badgeVariant: 'red' },
              { id: 'tasks', label: 'Nhiệm Vụ Content & CS', icon: CheckSquare, badge: openTasksCount > 0 ? openTasksCount : undefined, badgeVariant: 'blue' },
              { id: 'training-academy', label: 'Giáo Trình Brand & CS', icon: GraduationCap, badge: 'Module 04', badgeVariant: 'purple' },
              { id: 'user-profile', label: 'Thông Tin Cá Nhân & MK', icon: User },
            ],
          },
        ]

      case 'COMPLIANCE_SPECIALIST':
        return [
          {
            title: 'KHÔNG GIAN PHÁP LÝ & AN TOÀN',
            items: [
              { id: 'compliance-ops-desk', label: 'Legal & Soạn Đơn POA', icon: Gavel, badge: 'POA Ready', badgeVariant: 'red' },
              { id: 'account-health', label: 'Sức Khỏe Tài Khoản', icon: HeartPulse, badge: openHealthIssues > 0 ? openHealthIssues : undefined, badgeVariant: 'amber' },
              { id: 'products', label: 'Kiểm Duyệt FDA / COA', icon: Rocket },
              { id: 'audit-log', label: 'Nhật Ký Kiểm Toán (Audit)', icon: History },
              { id: 'tasks', label: 'Nhiệm Vụ Pháp Lý', icon: CheckSquare, badge: openTasksCount > 0 ? openTasksCount : undefined, badgeVariant: 'blue' },
              { id: 'training-academy', label: 'Giáo Trình Pháp Lý & FDA', icon: GraduationCap, badge: 'Module 05', badgeVariant: 'red' },
              { id: 'user-profile', label: 'Thông Tin Cá Nhân & MK', icon: User },
            ],
          },
        ]

      case 'CLIENT_SUPPLIER':
        return [
          {
            title: 'CỔNG DOANH NGHIỆP VIỆT NAM',
            items: [
              { id: 'supplier-portal', label: 'Cổng Doanh Nghiệp (P&L)', icon: ShieldCheck, badge: 'VNĐ / USD', badgeVariant: 'green' },
              { id: 'reports', label: 'Báo Cáo Doanh Thu & Lãi', icon: FileText },
              { id: 'inventory', label: 'Tồn Kho Sản Phẩm', icon: Boxes },
              { id: 'user-profile', label: 'Thông Tin Cá Nhân & MK', icon: User },
            ],
          },
        ]

      case 'SUPER_ADMIN':
        return [
          {
            title: 'BÀN ĐIỀU HÀNH TỔNG GIÁM ĐỐC (EXECUTIVE)',
            items: [
              { id: 'overview', label: 'Executive Dashboard & P&L', icon: LayoutDashboard },
              { id: 'master-admin', label: 'Quản Trị Nhân Sự & Cấp Quyền', icon: Crown, badge: 'Master', badgeVariant: 'purple' },
              { id: 'supplier-portal', label: 'Danh Mục Nhà Xưởng & P&L', icon: ShieldCheck, badge: 'Clients', badgeVariant: 'green' },
              { id: 'vexim-kpis', label: 'Chỉ Số Hiệu Suất Toàn Cơ Quan', icon: Activity },
              { id: 'ai-efficiency', label: 'Chi Phí Hạ Tầng AI ($1.42)', icon: Cpu, badge: '$1.42', badgeVariant: 'green' },
              { id: 'audit-log', label: 'Nhật Ký Kiểm Toán (Audit Trail)', icon: History },
              { id: 'training-academy', label: 'Học Viện Đào Tạo Vexim', icon: GraduationCap, badge: '6 Modules', badgeVariant: 'purple' },
              { id: 'user-profile', label: 'Tài Khoản Cá Nhân & Mật Khẩu', icon: User },
            ],
          },
          {
            title: 'CHẾ ĐỘ THANH TRA CHUYÊN MÔN (AUDIT DRILL-DOWN)',
            items: [
              { id: 'supply-chain-hub', label: 'Soi Tiến Độ Kho & Hải Quan', icon: Ship },
              { id: 'ppc-growth-desk', label: 'Soi Hiệu Quả Quảng Cáo PPC', icon: Zap },
              { id: 'compliance-ops-desk', label: 'Soi Pháp Lý & Sức Khỏe TK', icon: Gavel },
              { id: 'brand-intelligence', label: 'Soi Thị Phần & Listing CRO', icon: Target },
            ],
          },
        ]

      case 'OPS_MANAGER':
      case 'ACCOUNT_EXECUTIVE':
      default:
        return [
          {
            title: 'BÀN QUẢN LÝ VẬN HÀNH (OPS DESK)',
            items: [
              { id: 'overview', label: 'Tổng Quan Vận Hành', icon: LayoutDashboard },
              { id: 'ai-operations', label: 'AI Operations Center', icon: Sparkles, badge: pendingApprovals > 0 ? pendingApprovals : undefined, badgeVariant: 'red' },
              { id: 'tasks', label: 'Giao Việc & Tiến Độ', icon: CheckSquare, badge: openTasksCount > 0 ? openTasksCount : undefined, badgeVariant: 'blue' },
              { id: 'supplier-portal', label: 'Cổng Khách Hàng', icon: ShieldCheck },
              { id: 'reports', label: 'Báo Cáo Hiệu Suất', icon: FileText },
              { id: 'user-profile', label: 'Thông Tin Cá Nhân & MK', icon: User },
            ],
          },
          {
            title: 'PHÂN HỆ CHUYÊN SÂU',
            items: [
              { id: 'supply-chain-hub', label: 'Supply Chain & Geo-FBA', icon: Ship },
              { id: 'ppc-growth-desk', label: 'PPC Growth Desk', icon: Zap },
              { id: 'brand-intelligence', label: 'Brand Intel & CRO', icon: Target },
              { id: 'compliance-ops-desk', label: 'Legal & Soạn Đơn POA', icon: Gavel },
              { id: 'products', label: 'Sản Phẩm & Tiếp Nhận', icon: Rocket },
              { id: 'inventory', label: 'Tồn Kho FBA & 3PL', icon: Boxes },
              { id: 'account-health', label: 'Sức Khỏe Gian Hàng', icon: HeartPulse },
            ],
          },
        ]
    }
  }

  const navSections = getRoleSpecificNavSections(currentRole)

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
                    US V2
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

        {/* Marketplace Pill */}
        {!isCollapsed ? (
          <div className="mx-3 my-2.5 flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
              <Globe2 size={14} className="text-blue-600 shrink-0" />
              <span className="truncate">Amazon US (SP-API Live)</span>
            </div>
            <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-500" title="Connected to SP-API" />
          </div>
        ) : (
          <div className="mx-auto my-2 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-blue-600">
            <Globe2 size={16} />
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

        {/* Footer User Account & Logout Card */}
        <div className="border-t border-slate-200 p-3 bg-slate-50/50">
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 p-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-slate-900 to-indigo-800 text-xs font-bold text-white">
                  {currentUser.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1 truncate">
                  <div className="font-bold text-xs text-slate-900 truncate flex items-center gap-1">
                    <span>{currentUser.fullName}</span>
                    {currentUser.role === 'SUPER_ADMIN' && <Crown size={11} className="text-amber-500 shrink-0" />}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">{currentUser.email}</div>
                </div>
              </div>

              {/* 2 Action Buttons side by side */}
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  onClick={() => setActiveTab('user-profile')}
                  className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  <User size={13} />
                  <span>Hồ Sơ & MK</span>
                </button>
                <button
                  onClick={() => logout()}
                  className="flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50/80 py-1.5 text-[11px] font-bold text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                  title="Đăng xuất khỏi tài khoản"
                >
                  <LogOut size={13} />
                  <span>Đăng Xuất</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setActiveTab('user-profile')}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                title="Thông tin cá nhân"
              >
                <User size={16} />
              </button>
              <button
                onClick={() => logout()}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
