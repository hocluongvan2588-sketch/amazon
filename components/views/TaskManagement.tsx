'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import { OperationalTask } from '@/lib/types'
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Sparkles,
  User,
  XCircle,
} from 'lucide-react'

export function TaskManagement() {
  const { filteredTasks, updateTaskStatus, openModal } = useAppState()
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN')

  const columns: { id: OperationalTask['status']; label: string; tone: string }[] = [
    { id: 'OPEN', label: 'Cần làm (Open)', tone: 'border-slate-300 bg-slate-50/50' },
    { id: 'IN_PROGRESS', label: 'Đang xử lý (In Progress)', tone: 'border-blue-300 bg-blue-50/20' },
    { id: 'WAITING_APPROVAL', label: 'Chờ Phê duyệt (Waiting Approval)', tone: 'border-amber-300 bg-amber-50/20' },
    { id: 'COMPLETED', label: 'Hoàn tất (Completed)', tone: 'border-emerald-300 bg-emerald-50/20' },
  ]

  const getPriorityBadge = (priority: OperationalTask['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500 text-white font-bold'
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 font-semibold'
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 font-semibold'
      default:
        return 'bg-slate-100 text-slate-700 font-medium'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Operations Workflow & Task Governance (Section 22)
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Quản lý Công việc & Task Vận hành
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tự động tạo task từ các AI Agents hoặc phân công thủ công cho đội ngũ Vexim Operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex rounded-lg border border-border bg-white p-1 text-xs">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`rounded-md px-3 py-1 font-semibold transition-colors ${
                viewMode === 'KANBAN' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`rounded-md px-3 py-1 font-semibold transition-colors ${
                viewMode === 'LIST' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Danh sách List
            </button>
          </div>

          <button
            onClick={() => openModal('CREATE_TASK')}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-all"
          >
            <Plus size={14} />
            <span>Tạo Task Mới</span>
          </button>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'KANBAN' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id)

            return (
              <div key={col.id} className={`rounded-xl border p-4 space-y-3 ${col.tone}`}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-xs font-bold text-slate-900">{col.label}</h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-2xs">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-border bg-white p-4 shadow-xs space-y-3 transition-all hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-slate-400">
                          #{task.taskNumber}
                        </span>
                        <span className={`rounded px-1.5 py-0.2 text-[9px] ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{task.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{task.description}</p>

                      {/* Source Agent Badge */}
                      <div className="flex items-center gap-1.5 text-[10px] text-blue-700 font-medium bg-blue-50/70 p-1.5 rounded-md">
                        <Bot size={12} />
                        <span>Nguồn: {task.source.replace('AI_', '').replace('_AGENT', '')}</span>
                      </div>

                      {/* Footer: Assignee & Due Date */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                        <div className="flex items-center gap-1">
                          <User size={11} className="text-slate-400" />
                          <span className="truncate max-w-[90px]">{task.assignedTo.split(' ')[0]}</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono">
                          <Calendar size={11} className="text-slate-400" />
                          <span>{task.dueDate}</span>
                        </div>
                      </div>

                      {/* Quick Status Toggle Actions */}
                      <div className="flex items-center gap-1.5 pt-1">
                        {task.status !== 'COMPLETED' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                            className="flex-1 rounded-md bg-emerald-50 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            Hoàn tất ✓
                          </button>
                        )}
                        {task.status === 'OPEN' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                            className="flex-1 rounded-md bg-blue-50 py-1 text-[10px] font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                          >
                            Bắt đầu →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="rounded-xl border border-border bg-white shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Task #</th>
                <th className="py-3 px-3">Tiêu đề Công việc</th>
                <th className="py-3 px-3">Mức độ Ưu tiên</th>
                <th className="py-3 px-3">Nguồn phát sinh</th>
                <th className="py-3 px-3">Người phụ trách</th>
                <th className="py-3 px-3">Hạn chót (Due)</th>
                <th className="py-3 px-4 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-500">#{task.taskNumber}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{task.title}</td>
                  <td className="py-3 px-3">
                    <span className={`rounded px-2 py-0.5 text-[9px] ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono text-[10px]">{task.source}</td>
                  <td className="py-3 px-3 text-slate-700">{task.assignedTo}</td>
                  <td className="py-3 px-3 font-mono text-slate-500">{task.dueDate}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-800">
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
