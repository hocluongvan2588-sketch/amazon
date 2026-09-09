'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react'

// ====================================================================
// AMAZON INTEGRATION SETUP WIZARD (Giai đoạn 2)
// Bảng điều khiển đưa SP-API + Ads API từ SIMULATED sang LIVE:
//  1. Hiện trạng thái LIVE/SIMULATED + danh sách env còn thiếu
//  2. Hướng dẫn đăng ký Amazon Developer từng bước (link chính thống)
//  3. Sinh sẵn khối .env.local để copy-paste
//  4. Nút test kết nối thật (CONNECTION_CHECK) + khám phá Profile ID Ads
// BẢO MẬT: credentials CHỈ đặt qua biến môi trường phía server (.env.local /
// hosting env). Không bao giờ nhập secret qua trình duyệt vào DB.
// ====================================================================

interface GatewayStatus {
  spApi: { mode: string; missingEnv: string[]; marketplaceId: string; syncClientId: string }
  adsApi: { mode: string; missingEnv: string[]; profileId: string }
  note: string
}

const ENV_TEMPLATE = `# ===== AMAZON SP-API (bắt buộc để sync đơn hàng/tồn kho) =====
AMAZON_SP_API_CLIENT_ID=amzn1.application-oa2-client.xxxx
AMAZON_SP_API_CLIENT_SECRET=amzn.sp.sec.xxxx
AMAZON_SP_API_REFRESH_TOKEN=Atzr|IwEBIAxxxx
AMAZON_SP_API_AWS_ACCESS_KEY_ID=AKIAxxxx
AMAZON_SP_API_AWS_SECRET_ACCESS_KEY=xxxx
AMAZON_SP_API_AWS_REGION=us-east-1
AMAZON_MARKETPLACE_ID=ATVPDKIKX0DER
AMAZON_SELLER_ID=A2XXXXXXXXXX

# ===== Amazon Ads (bật PPC thật) =====
AMAZON_ADS_PROFILE_ID=1234567890

# ===== Gán dữ liệu sync về 1 client trong Supabase =====
# (UUID cột clients.id — xem Supabase Table Editor)
AMAZON_SYNC_CLIENT_ID=11111111-1111-1111-1111-111111111111

# ===== AI Copilot thật =====
AI_GATEWAY_API_KEY=your-key

# ===== Webhook forwarder =====
LOGISTICS_WEBHOOK_SECRET=<chuỗi ngẫu nhiên mạnh>`

const SETUP_STEPS = [
  {
    title: 'Tài khoản Seller Central Professional (US)',
    detail: 'Bắt buộc gói Professional ($39.99/tháng) mới đăng ký được developer app.',
    link: 'https://sellercentral.amazon.com',
  },
  {
    title: 'Đăng ký ứng dụng SP-API Developer',
    detail: 'Seller Central → App & Services → Develop apps → Add new app client. Yêu cầu vai trò: Orders, FBA Inventory, Product Listing, Seller Insights. Amazon duyệt 1–7 ngày.',
    link: 'https://sellercentral.amazon.com/sellingpartner/apikeys',
  },
  {
    title: 'Authorize app → nhận Refresh Token',
    detail: 'Sau khi duyệt: Authorize → đổi LWA Code lấy Refresh Token (Atzr|...). Redirect URL phải là domain HTTPS production.',
    link: 'https://developer-docs.amazon.com/sp-api/docs/user-guide',
  },
  {
    title: 'Tạo AWS IAM User (programmatic access)',
    detail: 'IAM → Users → Create user → Access key. SP-API không cần role ARN — connector ký SigV4 trực tiếp bằng access key.',
    link: 'https://console.aws.amazon.com/iam',
  },
  {
    title: 'Điền .env.local → restart → bấm Test kết nối',
    detail: 'Đủ 5 biến SP-API là Orders/Inventory chuyển LIVE. Bấm "Khám phá Profile Ads" lấy AMAZON_ADS_PROFILE_ID.',
    link: null,
  },
]

export function AmazonIntegrationSetup() {
  const [status, setStatus] = useState<GatewayStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [profilesResult, setProfilesResult] = useState<{ loading: boolean; msg: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const loadStatus = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/amazon/sync')
      setStatus(await res.json())
    } catch {
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  const runConnectionCheck = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/amazon/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 'CONNECTION_CHECK' }),
      })
      const data = await res.json()
      const r = data?.result
      setTestResult({
        ok: !!r?.success && !r?.simulated,
        msg: r?.simulated
          ? 'Đang SIMULATED — điền credentials rồi restart server đã, test lúc này chỉ trả mô phỏng.'
          : r?.details || 'Không rõ phản hồi',
      })
    } catch (e: any) {
      setTestResult({ ok: false, msg: `Lỗi gọi gateway: ${e?.message || e}` })
    } finally {
      setTesting(false)
      loadStatus()
    }
  }

  const discoverAdProfiles = async () => {
    setProfilesResult({ loading: true, msg: '' })
    try {
      const res = await fetch('/api/amazon/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 'ADS_PROFILES' }),
      })
      const data = await res.json()
      const r = data?.result
      const profiles = data?.profiles || []
      setProfilesResult({
        loading: false,
        msg: r?.simulated
          ? `SIMULATED — còn thiếu: ${(data.missingEnv || []).join(', ')}`
          : profiles.length > 0
            ? `Tìm thấy ${profiles.length} profile → copy Profile ID cần dùng vào AMAZON_ADS_PROFILE_ID: ${profiles.map((p: any) => `#${p.profileId} (${p.countryCode})`).join(', ')}`
            : r?.details || 'Không có profile nào',
      })
    } catch (e: any) {
      setProfilesResult({ loading: false, msg: `Lỗi: ${e?.message || e}` })
    }
  }

  const copyEnv = async () => {
    try {
      await navigator.clipboard.writeText(ENV_TEMPLATE)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const ModeBadge = ({ mode }: { mode: string }) =>
    mode === 'LIVE' ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
        <CheckCircle2 size={11} /> LIVE — AMAZON THẬT
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
        <AlertTriangle size={11} /> SIMULATED — MÔ PHỎNG
      </span>
    )

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <KeyRound size={15} />
            </span>
            <div>
              <h2 className="text-sm font-black text-slate-900">Amazon Integration Setup (Giai đoạn 2)</h2>
              <p className="text-[11px] text-slate-500">
                Đưa SP-API &amp; Ads API từ chế độ mô phỏng sang dữ liệu Amazon thật.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={loadStatus}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      {/* Trạng thái 2 hệ thống */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">SP-API (Orders / Inventory)</span>
            {status ? <ModeBadge mode={status.spApi.mode} /> : <Loader2 size={13} className="animate-spin" />}
          </div>
          {status && status.spApi.missingEnv.length > 0 && (
            <p className="mt-2 text-[10.5px] leading-relaxed text-slate-500">
              Còn thiếu: <code className="rounded bg-slate-100 px-1 font-mono text-[10px] text-slate-700">{status.spApi.missingEnv.join('</code>, <code className="rounded bg-slate-100 px-1 font-mono text-[10px] text-slate-700">')}</code>
            </p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Amazon Ads (PPC)</span>
            {status ? <ModeBadge mode={status.adsApi.mode} /> : <Loader2 size={13} className="animate-spin" />}
          </div>
          {status && status.adsApi.missingEnv.length > 0 && (
            <p className="mt-2 text-[10.5px] leading-relaxed text-slate-500">
              Còn thiếu: <code className="rounded bg-slate-100 px-1 font-mono text-[10px] text-slate-700">{status.adsApi.missingEnv.join('</code>, <code className="rounded bg-slate-100 px-1 font-mono text-[10px] text-slate-700">')}</code>
            </p>
          )}
        </div>
      </div>

      {/* Hành động nhanh */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={runConnectionCheck}
          disabled={testing || loading}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {testing ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
          Test kết nối Amazon thật
        </button>
        <button
          onClick={discoverAdProfiles}
          disabled={profilesResult?.loading || loading}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {profilesResult?.loading ? <Loader2 size={12} className="animate-spin" /> : <ExternalLink size={12} />}
          Khám phá Profile Ads
        </button>
        <button
          onClick={copyEnv}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
        >
          <Copy size={12} /> {copied ? 'Đã copy!' : 'Copy mẫu .env.local'}
        </button>
      </div>

      {testResult && (
        <div className={`mt-3 flex items-start gap-2 rounded-xl p-3 text-[11px] font-semibold ${testResult.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {testResult.ok ? <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> : <XCircle size={14} className="mt-0.5 shrink-0" />}
          <span>{testResult.msg}</span>
        </div>
      )}
      {profilesResult && !profilesResult.loading && profilesResult.msg && (
        <div className="mt-2 rounded-xl bg-slate-50 p-3 text-[11px] font-medium text-slate-600">{profilesResult.msg}</div>
      )}

      {/* 5 bước đăng ký */}
      <div className="mt-4">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500">5 bước kích hoạt dữ liệu Amazon thật</h3>
        <ol className="mt-2 space-y-2">
          {SETUP_STEPS.map((s, i) => (
            <li key={i} className="flex gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[11.5px] font-bold text-slate-800">{s.title}</p>
                <p className="text-[10.5px] leading-relaxed text-slate-500">{s.detail}</p>
                {s.link && (
                  <a href={s.link} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-blue-600 hover:underline">
                    Mở link chính thống <ExternalLink size={9} />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-[10.5px] leading-relaxed text-amber-700">
          <strong>Bảo mật:</strong> credentials chỉ đặt qua biến môi trường phía server (<code className="font-mono">.env.local</code> / hosting env) — <strong>không bao giờ</strong> nhập secret qua form trình duyệt hay lưu vào database (RLS đang ở chế độ demo, ai có anon key cũng đọc được DB).
        </p>
      </div>
    </div>
  )
}
