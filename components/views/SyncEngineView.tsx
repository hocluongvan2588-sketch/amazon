'use client'

import React from 'react'
import { useAppState } from '@/lib/state-context'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  Globe2,
  Lock,
  Play,
  RefreshCw,
  Server,
  ShieldCheck,
  Zap,
} from 'lucide-react'

export function SyncEngineView() {
  const { syncJobs, triggerSyncJob, isSyncing, clients, selectedClientId, connectAmazonAccount, spApiQueueStatuses, showToast } = useAppState()
  const activeClient = clients.find((c) => c.id === selectedClientId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Amazon Selling Partner API Connector & Scheduler (Section 35, 36)
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Đồng bộ Dữ liệu Amazon SP-API
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lớp tích hợp chuẩn hóa (Normalized Data Abstraction Layer) bảo vệ logic vận hành và xử lý tự động rate limits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => triggerSyncJob('job-01')}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Đang đồng bộ SP-API...' : 'Đồng bộ Tất cả SP-API'}</span>
          </button>
        </div>
      </div>

      {/* OAuth & Connection Card */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/20">
              <Globe2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Amazon Seller Central Account (OAuth 2.0)</h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  AUTHORIZED (SP-API LIVE)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Marketplace: <strong className="text-slate-700">Amazon US (ATVPDKIKX0DER)</strong> • Seller ID: <span className="font-mono text-slate-700">{activeClient?.amazonSellerId || 'A2VN94KAKL90US'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => connectAmazonAccount(selectedClientId)}
              className="rounded-lg border border-border bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Re-authorize Token
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-mono">Bảo mật Credentials (Section 5.1)</div>
            <div className="font-bold text-slate-800">Tuyệt đối không lưu Password / OTP</div>
            <p className="text-[10px] text-slate-500">Chỉ sử dụng OAuth Refresh Token mã hóa AES-256 theo chuẩn bảo mật Amazon SPN.</p>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-mono">Hạn ngạch API Quota Remaining</div>
            <div className="font-bold text-emerald-600">98.4% Khả dụng</div>
            <p className="text-[10px] text-slate-500">Tự động điều tiết tần suất request tránh lỗi 429 Too Many Requests.</p>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-mono">Độ trễ SP-API Endpoint</div>
            <div className="font-bold text-slate-800">142 ms (AWS us-east-1)</div>
            <p className="text-[10px] text-slate-500">Kết nối trực tiếp hạ tầng Selling Partner API Bắc Mỹ.</p>
          </div>
        </div>
      </div>

      {/* SP-API Rate-Limit Token Bucket Queue & Offline Label Cache */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Token Bucket Queue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                SP-API Token Bucket Queue & Rate Limit Guard
              </h3>
            </div>
            <span className="rounded bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 text-[10px] font-mono">
              0 Throttling Errors (429)
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Thuật toán Exponential Backoff & Jitter tự động điều tiết tần suất request:
          </p>

          <div className="space-y-2 text-xs">
            {spApiQueueStatuses.map((q) => (
              <div key={q.endpoint} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-mono font-bold text-slate-800">{q.endpoint}</div>
                  <div className="text-[10px] text-slate-400">Tốc độ tối đa: {q.currentRateLimitPerSec} req/sec &bull; Bucket: {q.tokenBucketCapacity} tokens</div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-600 font-bold">Backoff: ~{q.backoffAverageSeconds}s</span>
                  <span className="text-[10px] text-slate-400 block">Queue: {q.activeQueueLength} job</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Offline Barcode & Label Cache */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Bộ Nhớ Đệm Tem Nhãn Offline (Offline Label Cache)
              </h3>
            </div>
            <span className="rounded bg-blue-100 text-blue-900 font-bold px-2 py-0.5 text-[10px] font-mono">
              🟢 ONLINE READY
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Bảo vệ dây chuyền đóng gói tại nhà máy Việt Nam: Toàn bộ mã FNSKU Code 128 & Box Labels được Pre-rendered vector PDF lưu trữ trên PostgreSQL/Supabase.
          </p>

          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200 text-xs space-y-1.5">
            <div className="flex justify-between font-bold text-blue-950">
              <span>Trạng thái Cache cục bộ:</span>
              <span>100% SKUs Cached (3/3 Active)</span>
            </div>
            <p className="text-[11px] text-blue-800">
              Ngay cả khi Amazon SP-API bị mất kết nối hoặc bảo trì, xưởng vẫn in được tem xuất hàng bình thường.
            </p>
          </div>

          <button
            onClick={() => showToast('Đã làm mới và đồng bộ 100% bộ nhớ đệm Offline Barcode Cache!', 'success')}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 py-2 text-xs font-bold text-slate-700 transition-colors"
          >
            Làm Mới Bộ Nhớ Đệm Offline Tem Nhãn
          </button>
        </div>
      </div>

      {/* Sync Jobs Scheduler Table */}
      <div className="rounded-xl border border-border bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
            Hàng đợi Tiến trình Tự động (Sync Scheduler Queue — Section 23)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Tên Tiến trình Đồng bộ</th>
                <th className="py-3 px-3">Module</th>
                <th className="py-3 px-3">Chu kỳ (Frequency)</th>
                <th className="py-3 px-3">Lần chạy gần nhất</th>
                <th className="py-3 px-3">Lần chạy kế tiếp</th>
                <th className="py-3 px-3">Bản ghi xử lý</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {syncJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>{job.name}</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-700 font-bold">
                      {job.module}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-semibold text-slate-700">{job.frequency.replace('_', ' ')}</td>

                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{job.lastRunTime}</td>

                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{job.nextRunTime}</td>

                  <td className="py-3 px-3 font-bold text-slate-900">{job.itemsProcessed} records</td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => triggerSyncJob(job.id)}
                      disabled={isSyncing}
                      className="rounded-lg border border-border bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition-colors disabled:opacity-50"
                    >
                      Sync ngay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
