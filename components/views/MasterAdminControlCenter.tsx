'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import { UserRole, TeamMember } from '@/lib/types'
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bot,
  Building2,
  CheckCircle2,
  Coins,
  Cpu,
  Crown,
  DollarSign,
  Eye,
  FileCheck,
  FileText,
  Gavel,
  History,
  Key,
  Layers,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Unlock,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react'

export function MasterAdminControlCenter() {
  const {
    teamMembers,
    updateTeamMemberRole,
    toggleTeamMemberHighRiskApproval,
    toggleTeamMemberStatus,
    addTeamMember,
    clients,
    agencyKpis,
    reports,
    recommendations,
    approveRecommendation,
    rejectRecommendation,
    auditLogs,
  } = useAppState()

  const [activeSubTab, setActiveSubTab] = useState<'rbac' | 'financial-overview' | 'approvals-audit'>('rbac')
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [newMemberForm, setNewMemberForm] = useState<Partial<TeamMember>>({
    fullName: '',
    email: '',
    role: 'PPC_SPECIALIST',
    department: 'Team Quảng Cáo & Growth',
    canApproveHighRisk: false,
    phone: '',
  })

  // Filter high risk recommendations waiting for Super Admin
  const highRiskApprovals = recommendations.filter(
    (r) => r.status === 'PENDING_APPROVAL' && (r.priority === 'CRITICAL' || r.riskLevel === 'HIGH' || r.requiresExplicitApproval)
  )

  const roleOptions: { value: UserRole; label: string; color: string }[] = [
    { value: 'SUPER_ADMIN', label: 'Super Admin / Lãnh Đạo', color: 'bg-purple-100 text-purple-800' },
    { value: 'PPC_SPECIALIST', label: 'PPC Specialist', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'SUPPLY_CHAIN_SPECIALIST', label: 'Logistics Specialist', color: 'bg-cyan-100 text-cyan-800' },
    { value: 'BRAND_CS_SPECIALIST', label: 'Brand & CS Specialist', color: 'bg-purple-100 text-purple-800' },
    { value: 'COMPLIANCE_SPECIALIST', label: 'Legal & Compliance Lead', color: 'bg-rose-100 text-rose-800' },
    { value: 'CLIENT_SUPPLIER', label: 'Chủ Xưởng Việt Nam (Client)', color: 'bg-sky-100 text-sky-800' },
  ]

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberForm.fullName || !newMemberForm.email) return
    addTeamMember(newMemberForm)
    setShowAddMemberModal(false)
    setNewMemberForm({
      fullName: '',
      email: '',
      role: 'PPC_SPECIALIST',
      department: 'Team Quảng Cáo & Growth',
      canApproveHighRisk: false,
      phone: '',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Master Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 p-6 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-purple-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
              <Crown size={12} className="text-amber-400" />
              Super Admin Master Control
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck size={14} />
              Toàn quyền Quản trị & Cấp Quyền
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Trung Tâm Quản Trị, Cấp Quyền & Giám Sát Cấp Cao</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
            Trang điều hành tối cao dành cho Ban Lãnh Đạo: Phân quyền nhân sự (RBAC), Tổng quan báo cáo tài chính toàn cơ quan và Phê duyệt các lệnh rủi ro cao.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs text-right">
            <div className="text-[10px] uppercase font-mono text-slate-400">Doanh số Quản lý</div>
            <div className="text-lg font-extrabold text-purple-300">${agencyKpis.totalManagedRevenueMonthly.toLocaleString()} / mo</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs text-right">
            <div className="text-[10px] uppercase font-mono text-slate-400">Lệnh Chờ Duyệt Cao Cấp</div>
            <div className="text-lg font-extrabold text-amber-400">{highRiskApprovals.length} lệnh</div>
          </div>
        </div>
      </div>

      {/* 3 Main Management Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('rbac')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeSubTab === 'rbac'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCog size={16} />
          <span>Quản Trị Nhân Sự & Cấp Quyền (RBAC)</span>
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
            {teamMembers.length} Thành viên
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('financial-overview')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeSubTab === 'financial-overview'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 size={16} />
          <span>Tổng Quan Báo Cáo & Tài Chính Toàn Agency</span>
        </button>

        <button
          onClick={() => setActiveSubTab('approvals-audit')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeSubTab === 'approvals-audit'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert size={16} />
          <span>Hàng Đợi Phê Duyệt Cấp Cao & Kiểm Toán</span>
          {highRiskApprovals.length > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
              {highRiskApprovals.length} Khẩn
            </span>
          )}
        </button>
      </div>

      {/* SUB-TAB 1: RBAC & TEAM MEMBER ACCESS CONTROL */}
      {activeSubTab === 'rbac' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">Danh Sách Nhân Sự & Bảng Phân Quyền Vai Trò</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cấp quyền truy cập đúng vai trò chuyên môn để nhân viên chỉ thấy giao diện của họ, kiểm soát quyền duyệt lệnh rủi ro cao.
              </p>
            </div>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="flex items-center gap-2 rounded-xl bg-purple-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-purple-800 transition-all shrink-0"
            >
              <UserPlus size={15} />
              <span>Thêm Nhân Sự / Cấp Tài Khoản</span>
            </button>
          </div>

          {/* Team Members Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-4">Nhân sự & Email</th>
                  <th className="p-4">Bộ phận</th>
                  <th className="p-4">Vai trò (Role Được Gán)</th>
                  <th className="p-4">Phạm vi Store</th>
                  <th className="p-4 text-center">Duyệt Lệnh Nhạy Cảm</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        {member.fullName}
                        {member.role === 'SUPER_ADMIN' && <Crown size={13} className="text-amber-500" />}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">{member.email}</div>
                    </td>

                    <td className="p-4 text-slate-600 font-medium">
                      {member.department}
                    </td>

                    <td className="p-4">
                      <select
                        value={member.role}
                        onChange={(e) => updateTeamMemberRole(member.id, e.target.value as UserRole)}
                        disabled={member.id === 'user-01'} // protect root super admin
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      >
                        {roleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-700 font-semibold">
                        {member.assignedClientIds.includes('ALL') ? 'Toàn bộ 5 Store' : `${member.assignedClientIds.length} Store chỉ định`}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleTeamMemberHighRiskApproval(member.id)}
                        disabled={member.role === 'SUPER_ADMIN'}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
                          member.canApproveHighRisk
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title="Bật/Tắt quyền duyệt thay đổi giá > 15% hoặc ngân sách Ads lớn"
                      >
                        {member.canApproveHighRisk ? '✓ Đã cấp quyền' : '✕ Bị chặn'}
                      </button>
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          member.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {member.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {member.id !== 'user-01' && (
                        <button
                          onClick={() => toggleTeamMemberStatus(member.id)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                        >
                          {member.status === 'ACTIVE' ? 'Khóa TK' : 'Mở TK'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Role Permission Matrix Infobox */}
          <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-5 space-y-2">
            <div className="text-xs font-bold uppercase font-mono text-purple-900 flex items-center gap-2">
              <ShieldCheck size={16} className="text-purple-700" />
              <span>Chính Sách Phân Quyền Bảo Mật Tuyệt Đối (Zero Trust RBAC):</span>
            </div>
            <p className="text-xs text-purple-950 leading-relaxed">
              Mỗi nhân sự chỉ nhìn thấy thanh Sidebar tương ứng với nhiệm vụ của họ. Mọi thay đổi về giá bán, duyệt rút tiền hoặc thay đổi ngân sách vượt ngưỡng quy định đều bắt buộc phải được chuyển về <strong>Hàng Đợi Phê Duyệt Cấp Cao của Super Admin</strong>.
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: EXECUTIVE FINANCIAL & PORTFOLIO OVERVIEW */}
      {activeSubTab === 'financial-overview' && (
        <div className="space-y-6">
          {/* Top 4 Macro KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
                <span>Tổng GMV 5 Nhà Xưởng</span>
                <Coins size={16} className="text-purple-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">${agencyKpis.totalManagedRevenueMonthly.toLocaleString()}</div>
              <div className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-600">
                <ArrowUpRight size={14} />
                <span>+{agencyKpis.averageClientGrowthRate}% so với tháng trước</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
                <span>Doanh thu Dịch vụ Vexim</span>
                <DollarSign size={16} className="text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-600">$25,700 <span className="text-xs font-normal text-slate-500">/ tháng</span></div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                Từ 5 hợp đồng quản trị trọn gói
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
                <span>Chi phí AI / Client</span>
                <Cpu size={16} className="text-blue-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-blue-600">$1.42 <span className="text-xs font-normal text-slate-500">/ tháng</span></div>
              <div className="mt-1 text-xs text-emerald-600 font-bold">
                Biên lợi nhuận AI: 99.95%
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
                <span>Số Giờ Tiết Kiệm Được</span>
                <Sparkles size={16} className="text-amber-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">{agencyKpis.humanHoursSavedThisMonth} giờ</div>
              <div className="mt-1 text-xs text-slate-500">
                Tỷ lệ tự động hóa: <strong>{agencyKpis.aiAssistedOperationsRate}%</strong>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown by Service Tier */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Cơ Cấu Doanh Thu Dịch Vụ Vexim (Service Revenue Breakdown)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div className="text-[10px] uppercase font-mono text-slate-400">Amazon Audit</div>
                <div className="text-lg font-black text-slate-900">${agencyKpis.serviceRevenueBreakdown.amazonAudit.toLocaleString()}</div>
                <div className="text-[11px] text-slate-500 mt-1">Khảo sát & Đánh giá thị trường</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div className="text-[10px] uppercase font-mono text-slate-400">Amazon Launch</div>
                <div className="text-lg font-black text-slate-900">${agencyKpis.serviceRevenueBreakdown.amazonLaunch.toLocaleString()}</div>
                <div className="text-[11px] text-slate-500 mt-1">Listing, FDA & Launch sản phẩm</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div className="text-[10px] uppercase font-mono text-slate-400">Amazon Operations</div>
                <div className="text-lg font-black text-slate-900">${agencyKpis.serviceRevenueBreakdown.amazonOperations.toLocaleString()}</div>
                <div className="text-[11px] text-slate-500 mt-1">Phí vận hành định kỳ hàng tháng</div>
              </div>
              <div className="rounded-xl bg-purple-50 p-4 border border-purple-200">
                <div className="text-[10px] uppercase font-mono text-purple-700 font-bold">Amazon Growth</div>
                <div className="text-lg font-black text-purple-900">${agencyKpis.serviceRevenueBreakdown.amazonGrowth.toLocaleString()}</div>
                <div className="text-[11px] text-purple-700 mt-1">Chia sẻ doanh thu tăng trưởng</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: HIGH-RISK APPROVAL QUEUE & MASTER AUDIT TRAIL */}
      {activeSubTab === 'approvals-audit' && (
        <div className="space-y-6">
          {/* High-Risk Approvals */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert size={18} className="text-red-600" />
                  <span>Hàng Đợi Phê Duyệt Cấp Lãnh Đạo (Master High-Risk Queue)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Các hành động nhạy cảm đòi hỏi chữ ký điện tử của Super Admin trước khi được gửi lên Amazon SP-API.
                </p>
              </div>
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                {highRiskApprovals.length} Lệnh chờ duyệt
              </span>
            </div>

            {highRiskApprovals.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                ✓ Hiện không có lệnh rủi ro cao nào đang chờ phê duyệt. Toàn bộ hệ thống an toàn!
              </div>
            ) : (
              <div className="space-y-3">
                {highRiskApprovals.map((rec) => (
                  <div key={rec.id} className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-mono font-bold text-red-800">
                          {rec.priority} RISK
                        </span>
                        <span className="font-bold text-sm text-slate-900">{rec.title}</span>
                      </div>
                      <p className="text-xs text-slate-600">{rec.description}</p>
                      <div className="text-[11px] text-slate-500">
                        Gian hàng: <strong>{rec.clientName}</strong> &bull; Hành động: <strong>{rec.proposedAction}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => rejectRecommendation(rec.id)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Bác bỏ
                      </button>
                      <button
                        onClick={() => approveRecommendation(rec.id)}
                        className="rounded-lg bg-purple-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-purple-800"
                      >
                        Ký Duyệt & Thực Thi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Master Audit Log Trail */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History size={18} className="text-slate-600" />
              <span>Nhật Ký Kiểm Toán Toàn Cơ Quan (Master Audit Trail - Realtime)</span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Thời gian (UTC)</th>
                    <th className="p-3">Người thực hiện</th>
                    <th className="p-3">Hành động</th>
                    <th className="p-3">Đối tượng</th>
                    <th className="p-3">Ghi chú phê duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.slice(0, 6).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono text-slate-500">{log.timestamp}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{log.actorName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{log.actorRole}</div>
                      </td>
                      <td className="p-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-800">
                          {log.actionType}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-800">{log.entityName}</td>
                      <td className="p-3 text-slate-600 truncate max-w-xs">{log.approvalNotes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD TEAM MEMBER */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Cấp Tài Khoản & Phân Quyền Nhân Sự</h3>
              <button onClick={() => setShowAddMemberModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Họ và tên nhân viên:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hoàng Văn Long"
                  value={newMemberForm.fullName}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, fullName: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Email công ty:</label>
                <input
                  type="email"
                  required
                  placeholder="long.hoang@vexim.io"
                  value={newMemberForm.email}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Gán vai trò chuyên môn (Role):</label>
                <select
                  value={newMemberForm.role}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value as UserRole })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Bộ phận trực thuộc:</label>
                <input
                  type="text"
                  placeholder="Team Quảng Cáo / Team Kho / Team CS"
                  value={newMemberForm.department}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, department: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-2 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-purple-700 px-4 py-2 font-bold text-white hover:bg-purple-800 shadow-xs"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
