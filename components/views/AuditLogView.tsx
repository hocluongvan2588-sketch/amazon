'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import {
  Activity,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  History,
  Lock,
  Search,
  ShieldCheck,
  User,
} from 'lucide-react'

export function AuditLogView() {
  const { auditLogs } = useAppState()
  const [searchQuery, setSearchQuery] = useState('')

  const displayedLogs = auditLogs.filter((log) => {
    if (
      searchQuery &&
      !log.actionType.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.entityName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.actorName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Immutable Operations Audit Trail & Security (Section 32)
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Nhật ký Thao tác & Kiểm toán (Audit Log)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ghi nhận minh bạch 100% mọi hành động AI đề xuất, nhân viên phê duyệt và thay đổi tham số lên Amazon SP-API.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <History size={14} className="text-blue-600" />
          <span>Tổng cộng {auditLogs.length} bản ghi kiểm toán</span>
        </div>

        <div className="relative w-64">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo hành động, thực thể..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-slate-50 pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-border bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Thời gian (UTC)</th>
                <th className="py-3 px-3">Tác tử (Actor / Role)</th>
                <th className="py-3 px-3">Nguồn</th>
                <th className="py-3 px-3">Loại Thao tác (Action)</th>
                <th className="py-3 px-3">Đối tượng (Entity)</th>
                <th className="py-3 px-3">Trước / Sau khi Thay đổi</th>
                <th className="py-3 px-4 text-right">Ghi chú Phê duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{log.timestamp}</td>

                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{log.actorName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.actorRole}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold font-mono ${
                        log.source === 'HUMAN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.source === 'AI_AGENT'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {log.source}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-slate-800">{log.actionType}</td>

                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-900 line-clamp-1 max-w-xs">{log.entityName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{log.entityType}</div>
                  </td>

                  <td className="py-3 px-3 text-[11px]">
                    {log.beforeValue && <div className="text-slate-400 line-through">{log.beforeValue}</div>}
                    {log.afterValue && <div className="font-bold text-slate-800">{log.afterValue}</div>}
                  </td>

                  <td className="py-3 px-4 text-right text-[11px] text-slate-600 max-w-xs truncate">
                    {log.approvalNotes}
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
