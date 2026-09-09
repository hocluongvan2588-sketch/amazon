'use client'

import React from 'react'

export function renderInlineText(text: string, className?: string) {
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
          className="rounded bg-slate-200/80 px-1 py-0.5 font-mono text-[11px] font-semibold text-purple-900"
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
  return <span className={className}>{renderInlineText(text, className)}</span>
}
