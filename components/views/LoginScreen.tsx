'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import { TeamMember, UserRole } from '@/lib/types'
import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  Crown,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'

export function LoginScreen() {
  const { login, teamMembers } = useAppState()
  const [email, setEmail] = useState('hocluongvan88@gmail.com')
  const [password, setPassword] = useState('Anthai@88')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email, password)
  }

  const handleQuickLogin = (member: TeamMember) => {
    setEmail(member.email)
    setPassword(member.password || 'Anthai@88')
    login(member.email, member.password || 'Anthai@88')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-sans">
      <div className="w-full max-w-4xl grid gap-8 lg:grid-cols-12 items-center">
        {/* Left column: Login Form */}
        <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-10 shadow-2xl space-y-6">
          {/* Brand header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-xl font-black text-white shadow-lg shadow-indigo-500/30">
                V
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-wider text-white">VEXIM</span>
                  <span className="rounded bg-indigo-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-300">
                    AUTH PORTAL
                  </span>
                </div>
                <div className="text-[11px] font-mono tracking-wider text-slate-400">
                  AMAZON OPERATIONS PLATFORM
                </div>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white pt-2">Đăng Nhập Cổng Điều Hành</h1>
            <p className="text-xs text-slate-400">
              Hệ thống vận hành Amazon US và phân quyền chuyên môn cho Doanh nghiệp Việt Nam.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 flex items-center justify-between">
                <span>Email tài khoản:</span>
                <span className="text-[10px] font-normal text-indigo-400">Master: hocluongvan88@gmail.com</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@vexim.io"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 pl-10 pr-3 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 flex items-center justify-between">
                <span>Mật khẩu:</span>
                <span className="text-[10px] font-mono text-indigo-400">Mặc định: Anthai@88</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 pl-10 pr-10 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/10 bg-slate-800 text-indigo-600 focus:ring-0"
                />
                <span>Ghi nhớ phiên đăng nhập</span>
              </label>
              <span className="text-[11px] text-slate-400">Bảo mật SOC2 & SP-API</span>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-blue-500 transition-all cursor-pointer"
            >
              <span>Đăng Nhập Vào Hệ Thống</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Footer badge */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-400" />
              Mã hóa 256-bit AES
            </span>
            <span>Vexim Operations Platform v2.0</span>
          </div>
        </div>

        {/* Right column: 9 Registered Accounts Quick-Select */}
        <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase font-mono">
              <Sparkles size={14} />
              <span>9 Tài Khoản Đã Cấu Hình (1-Click Login)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Nhấp vào bất kỳ tài khoản nào để đăng nhập ngay mà không cần nhập lại mật khẩu:
            </p>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {teamMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => handleQuickLogin(member)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  member.role === 'SUPER_ADMIN'
                    ? 'border-indigo-500/60 bg-indigo-950/40 hover:bg-indigo-900/50'
                    : 'border-white/5 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white truncate">{member.fullName}</span>
                    {member.role === 'SUPER_ADMIN' && <Crown size={12} className="text-amber-400 shrink-0" />}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate">{member.email}</div>
                  <div className="text-[10px] text-indigo-300 truncate">{member.department}</div>
                </div>

                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-mono font-bold ${
                  member.role === 'SUPER_ADMIN' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}>
                  {member.role.split('_')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
