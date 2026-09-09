'use client'

import React from 'react'

export function renderInlineText(text: string) {
  if (!text) return null
  // Split by bold (**text**), code (`text`), and italic (*text*)
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2)
      return (
        <strong key={index} className="font-bold text-slate-900">
          {inner}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1)
      return (
        <code
          key={index}
          className="rounded bg-slate-200/90 px-1 py-0.5 font-mono text-[11px] font-semibold text-purple-900"
        >
          {inner}
        </code>
      )
    }
    return <span key={index}>{part}</span>
  })
}

export function FormattedText({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null

  const lines = text.split('\n')

  return (
    <div className={`space-y-1.5 text-xs text-slate-700 leading-relaxed ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-indigo-600 font-bold shrink-0 leading-5">&bull;</span>
              <span className="flex-1">{renderInlineText(trimmed.slice(2))}</span>
            </div>
          )
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+\.)\s(.*)/)
          if (match) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="font-mono font-bold text-indigo-600 shrink-0">{match[1]}</span>
                <span className="flex-1">{renderInlineText(match[2])}</span>
              </div>
            )
          }
        }
        return <p key={idx}>{renderInlineText(line)}</p>
      })}
    </div>
  )
}
