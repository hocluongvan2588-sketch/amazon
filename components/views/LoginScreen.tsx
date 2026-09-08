'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react'

export function LoginScreen() {
  const { login } = useAppState()
  const [email, setEmail] = useState('hocluongvan88@gmail.com')
  const [password, setPassword] = useState('Anthai@88')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email, password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-sans">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand header */}
        <div className="space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-2xl font-black text-white shadow-lg shadow-indigo-500/30 mx-auto">
            V
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-black tracking-wider text-white">VEXIM</span>
              <span className="rounded bg-indigo-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-300">
                US V2.0
              </span>
            </div>
            <div className="text-[11px] font-mono tracking-wider text-slate-400 mt-0.5">
              AMAZON OPERATIONS PLATFORM
            </div>
          </div>
          <h1 className="text-lg font-bold text-white pt-2">Đăng Nhập Cổng Điều Hành</h1>
          <p className="text-xs text-slate-400">
            Hệ thống quản trị vận hành và bảo vệ gian hàng Amazon Mỹ.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 block">
              Email đăng nhập:
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
            <label className="font-bold text-slate-300 block">
              Mật khẩu:
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
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <span className="text-[11px] text-slate-400">Bảo mật SOC2</span>
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
          <span>Vexim Platform</span>
        </div>
      </div>
    </div>
  )
}
