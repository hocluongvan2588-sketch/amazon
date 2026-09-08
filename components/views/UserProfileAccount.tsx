'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import { TeamMember, UserRole } from '@/lib/types'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Crown,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  QrCode,
  RefreshCw,
  Save,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  UserCheck,
  UserCog,
} from 'lucide-react'

export function UserProfileAccount() {
  const {
    currentRole,
    setCurrentRole,
    teamMembers,
    setSelectedClientId,
  } = useAppState()

  // Find the active team member based on role or default to master super admin
  const activeUser = teamMembers.find((m) => m.role === currentRole) || teamMembers[0]

  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [phoneValue, setPhoneValue] = useState(activeUser.phone || '+84 988 888 888')
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    if (currentPassword !== 'Anthai@88') {
      setPasswordError('Mật khẩu hiện tại không chính xác (Mật khẩu mặc định: Anthai@88)')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp.')
      return
    }

    setPasswordSuccess(true)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleSwitchAccount = (member: TeamMember) => {
    setCurrentRole(member.role)
    if (member.assignedClientIds.length === 1 && member.assignedClientIds[0] !== 'ALL') {
      setSelectedClientId(member.assignedClientIds[0])
    } else {
      setSelectedClientId('ALL')
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 text-2xl font-black text-white shadow-lg shadow-indigo-950/40">
              {activeUser.fullName.slice(0, 2).toUpperCase()}
              {activeUser.role === 'SUPER_ADMIN' && (
                <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-md">
                  <Crown size={14} />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{activeUser.fullName}</h1>
                <span className="rounded-full bg-indigo-500/30 border border-indigo-400/30 px-2.5 py-0.5 text-xs font-mono font-bold text-indigo-300">
                  {activeUser.role}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
                <Mail size={14} className="text-slate-400" />
                <span className="font-mono font-bold text-indigo-200">{activeUser.email}</span>
              </p>
              <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                <span className="flex items-center gap-1"><Building2 size={12} /> {activeUser.department}</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> Hà Nội, Việt Nam</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
            <div className="text-right">
              <div className="text-[10px] uppercase font-mono text-slate-400">Trạng Thái Xác Thực</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck size={14} /> SOC2 / SP-API Đã Ký
              </div>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Phiên: {activeUser.lastActive}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 cols: Profile details & Password Change */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Account Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck size={18} className="text-indigo-600" />
                <span>Thông Tin Tài Khoản & Phân Quyền Vai Trò</span>
              </h2>
              <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-mono font-bold text-slate-700">
                ID: {activeUser.id}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1">
                <div className="text-[10px] uppercase font-mono text-slate-400">Chức Danh Công Tác</div>
                <div className="font-bold text-slate-900">{activeUser.title || activeUser.department}</div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1">
                <div className="text-[10px] uppercase font-mono text-slate-400">Số Điện Thoại Liên Hệ</div>
                <div className="font-bold text-slate-900 font-mono">{phoneValue}</div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1">
                <div className="text-[10px] uppercase font-mono text-slate-400">Phạm Vi Gian Hàng Quản Lý</div>
                <div className="font-bold text-slate-900">
                  {activeUser.assignedClientIds.includes('ALL')
                    ? 'Toàn bộ 5 Gian Hàng Đối Tác'
                    : `${activeUser.assignedClientIds.join(', ')}`}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1">
                <div className="text-[10px] uppercase font-mono text-slate-400">Quyền Duyệt Lệnh Rủi Ro Cao</div>
                <div className="font-bold flex items-center gap-1">
                  {activeUser.canApproveHighRisk ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Có thẩm quyền phê duyệt
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1">
                      <Lock size={13} /> Cần Super Admin ký duyệt
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Password & Security Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound size={18} className="text-purple-600" />
                <span>Đổi Mật Khẩu & Bảo Mật Tài Khoản</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mật khẩu mặc định hệ thống cấp: <strong className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Anthai@88</strong>
              </p>
            </div>

            {passwordSuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Mật khẩu của tài khoản <strong>{activeUser.email}</strong> đã được cập nhật thành công!</span>
              </div>
            )}

            {passwordError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-900 flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mật khẩu hiện tại:</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Anthai@88"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mật khẩu mới:</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Xác nhận mật khẩu mới:</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-medium"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showPassword ? 'Ẩn ký tự' : 'Hiển thị mật khẩu'}</span>
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all"
                >
                  Cập Nhật Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right 1 col: Quick Account Switcher (9 Accounts Registered) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCog size={16} className="text-purple-600" />
                <span>9 Tài Khoản Phân Bổ Theo Email</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Bấm vào tài khoản bất kỳ để chuyển đổi đăng nhập và kiểm tra phân quyền tức thì:
              </p>
            </div>

            <div className="space-y-2">
              {teamMembers.map((member) => {
                const isCurrent = member.role === currentRole
                return (
                  <button
                    key={member.id}
                    onClick={() => handleSwitchAccount(member)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-500/20'
                        : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">{member.fullName}</span>
                        {member.role === 'SUPER_ADMIN' && <Crown size={12} className="text-amber-500 shrink-0" />}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 truncate">{member.email}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{member.department}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-bold ${
                        member.role === 'SUPER_ADMIN' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {member.role.split('_')[0]}
                      </span>
                      {isCurrent && (
                        <div className="text-[10px] font-bold text-indigo-600 mt-1 flex items-center gap-0.5 justify-end">
                          <CheckCircle2 size={11} /> Đang chọn
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
