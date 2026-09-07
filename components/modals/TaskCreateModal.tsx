'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/state-context'
import { OperationalTask } from '@/lib/types'
import { Check, Plus, X } from 'lucide-react'

export function TaskCreateModal() {
  const { activeModal, closeModal, createTask, selectedClientId, clients } = useAppState()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<OperationalTask['priority']>('HIGH')
  const [assignedTo, setAssignedTo] = useState('Alex Nguyen (Operations Manager)')
  const [dueDate, setDueDate] = useState('2026-09-12')

  if (activeModal?.type !== 'CREATE_TASK') return null

  const handleSave = () => {
    if (!title.trim()) return
    createTask({
      clientId: selectedClientId === 'ALL' ? 'client-vina-01' : selectedClientId,
      title,
      description,
      priority,
      assignedTo,
      dueDate,
      source: 'MANUAL_OPS',
    })
    closeModal()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 my-8">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Tạo Nhiệm vụ Vận hành Mới</h3>
            <p className="text-xs text-slate-400">Giao việc cho đội ngũ Vexim Operations hoặc Compliance</p>
          </div>
          <button onClick={closeModal} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-800 block mb-1">Tiêu đề Công việc:</label>
            <input
              type="text"
              placeholder="Ví dụ: Kiểm tra lại COA kiểm nghiệm kim loại nặng cho lô hàng mới..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-800 block mb-1">Mô tả chi tiết & Yêu cầu:</label>
            <textarea
              rows={3}
              placeholder="Nhập chi tiết hướng dẫn xử lý..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">Mức độ Ưu tiên:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full rounded-lg border border-border p-2 text-xs text-slate-800"
              >
                <option value="CRITICAL">🔴 CRITICAL</option>
                <option value="HIGH">🟠 HIGH</option>
                <option value="MEDIUM">🔵 MEDIUM</option>
                <option value="LOW">⚪ LOW</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">Hạn hoàn tất (Due Date):</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-border p-2 text-xs text-slate-800"
              >
              </input>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-800 block mb-1">Người phụ trách:</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full rounded-lg border border-border p-2 text-xs text-slate-800"
            >
              <option>Alex Nguyen (Operations Manager)</option>
              <option>Trần Minh Tuấn (Ops Specialist)</option>
              <option>Lê Hoàng Yến (PPC Lead)</option>
              <option>Vũ Hải Đăng (Compliance Lead)</option>
              <option>Ngô Mỹ Linh (Content Specialist)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={closeModal}
            className="rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Check size={14} />
            <span>Tạo Task</span>
          </button>
        </div>
      </div>
    </div>
  )
}
