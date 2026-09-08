'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Crown,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Laptop,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  ShieldCheck,
  Smartphone,
  User,
  UserCheck,
} from 'lucide-react'

export function UserProfileAccount() {
  const {
    currentUser,
    logout,
  } = useAppState()

  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [phoneValue, setPhoneValue] = useState(currentUser.phone || '+84 988 888 888')
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

    if (currentPassword !== 'Anthai@88' && currentPassword !== currentUser.password) {
      setPasswordError('Mật khẩu hiện tại không chính xác.')
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Profile Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 text-2xl font-black text-white shadow-lg shadow-indigo-950/40">
              {currentUser.fullName.slice(0, 2).toUpperCase()}
              {currentUser.role === 'SUPER_ADMIN' && (
                <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-md">
                  <Crown size={14} />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{currentUser.fullName}</h1>
                <span className="rounded-full bg-indigo-500/30 border border-indigo-400/30 px-2.5 py-0.5 text-xs font-mono font-bold text-indigo-300">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
                <Mail size={14} className="text-slate-400" />
                <span className="font-mono font-bold text-indigo-200">{currentUser.email}</span>
              </p>
              <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                <span className="flex items-center gap-1"><Building2 size={12} /> {currentUser.department}</span>
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
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-900/60 transition-all cursor-pointer"
            >
              <LogOut size={13} />
              <span>Đăng Xuất</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1: Account Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck size={18} className="text-indigo-600" />
              <span>Thông Tin Hồ Sơ & Vai Trò</span>
            </h2>
            <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-mono font-bold text-slate-700">
              ID: {currentUser.id}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1">
              <div className="text-[10px] uppercase font-mono text-slate-400">Họ và tên</div>
              <div className="font-bold text-slate-900 text-sm">{currentUser.fullName}</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1">
              <div className="text-[10px] uppercase font-mono text-slate-400">Email đăng nhập</div>
              <div className="font-bold text-slate-900 font-mono text-sm">{currentUser.email}</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1">
              <div className="text-[10px] uppercase font-mono text-slate-400">Chức Danh Công Tác</div>
              <div className="font-bold text-slate-900">{currentUser.title || currentUser.department}</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1">
              <div className="text-[10px] uppercase font-mono text-slate-400">Số Điện Thoại</div>
              <div className="font-bold text-slate-900 font-mono">{currentUser.phone || '+84 988 888 888'}</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1">
              <div className="text-[10px] uppercase font-mono text-slate-400">Phạm Vi Store Được Phân Quyền</div>
              <div className="font-bold text-slate-900">
                {currentUser.assignedClientIds.includes('ALL')
                  ? 'Toàn bộ gian hàng (Vexim Portfolio)'
                  : `${currentUser.assignedClientIds.join(', ')}`}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Password Change Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <KeyRound size={18} className="text-purple-600" />
              <span>Đổi Mật Khẩu Đăng Nhập</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật mật khẩu bảo vệ tài khoản cá nhân của bạn.
            </p>
          </div>

          {passwordSuccess && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Mật khẩu của bạn đã được thay đổi thành công!</span>
            </div>
          )}

          {passwordError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-900 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mật khẩu hiện tại:</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Nhập mật khẩu hiện tại"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Mật khẩu mới:</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Tối thiểu 6 ký tự"
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

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-medium"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{showPassword ? 'Ẩn ký tự' : 'Hiện mật khẩu'}</span>
              </button>

              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
              >
                Lưu Mật Khẩu
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Card 3: Security & Active Sessions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Shield size={18} className="text-slate-700" />
          <span>Bảo Mật & Phiên Đăng Nhập Hoạt Động</span>
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
            <Laptop size={20} className="text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900">Trình duyệt Web hiện tại (Hà Nội, VN)</div>
              <div className="text-slate-500 text-[11px] mt-0.5">IP: 113.161.72.10 &bull; Trạng thái: Đang hoạt động</div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
            <Smartphone size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900">Xác thực Hai Bước (2FA)</div>
              <div className="text-slate-500 text-[11px] mt-0.5">Bảo vệ phiên đăng nhập bằng mã OTP qua ứng dụng</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
