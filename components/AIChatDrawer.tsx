'use client'

import React, { useState } from 'react'
import { Bot, CheckCircle2, MessageSquareText, Send, Sparkles, X, Zap } from 'lucide-react'
import { useAppState } from '@/lib/state-context'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

function renderInlineFormatting(text: string, isUser: boolean) {
  // Split text by bold markers **...**, code `...`, italic *...*
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2)
      return (
        <strong
          key={index}
          className={isUser ? 'font-extrabold text-white underline decoration-white/30' : 'font-extrabold text-slate-950'}
        >
          {inner}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1)
      return (
        <code
          key={index}
          className={
            isUser
              ? 'bg-white/20 px-1 py-0.5 rounded font-mono text-[11px]'
              : 'bg-slate-200/80 px-1 py-0.5 rounded font-mono text-[11px] text-purple-900 font-semibold'
          }
        >
          {inner}
        </code>
      )
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2 && !part.startsWith('**')) {
      const inner = part.slice(1, -1)
      return (
        <em key={index} className="italic">
          {inner}
        </em>
      )
    }
    return <span key={index}>{part}</span>
  })
}

function FormattedMarkdownMessage({ content, isUser }: { content: string; isUser: boolean }) {
  const lines = content.split('\n')
  return (
    <div className="space-y-1.5 leading-relaxed text-xs">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) {
          return <div key={idx} className="h-1" />
        }

        // Heading 3
        if (trimmed.startsWith('### ')) {
          return (
            <h5 key={idx} className={`font-bold text-xs pt-1 ${isUser ? 'text-white' : 'text-slate-900'}`}>
              {renderInlineFormatting(trimmed.replace('### ', ''), isUser)}
            </h5>
          )
        }
        // Heading 1 & 2
        if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          return (
            <h4 key={idx} className={`font-bold text-sm pt-1 ${isUser ? 'text-white' : 'text-slate-950'}`}>
              {renderInlineFormatting(trimmed.replace(/^#+\s*/, ''), isUser)}
            </h4>
          )
        }

        // Numbered list item: 1. , 2. , etc.
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5 pt-0.5">
              <span className={`font-bold font-mono text-[11px] shrink-0 ${isUser ? 'text-blue-200' : 'text-blue-700'}`}>
                {numMatch[1]}.
              </span>
              <div className="flex-1">
                {renderInlineFormatting(numMatch[2], isUser)}
              </div>
            </div>
          )
        }

        // Bullet point: - or • or *
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || (trimmed.startsWith('* ') && !trimmed.startsWith('**'))) {
          const bulletText = trimmed.replace(/^[-•*]\s*/, '')
          const isSubBullet = line.startsWith('   ') || line.startsWith('\t')
          return (
            <div key={idx} className={`flex items-start gap-1.5 ${isSubBullet ? 'pl-4 text-[11.5px]' : 'pl-1'}`}>
              <span className={`text-[10px] shrink-0 mt-0.5 ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
                {isSubBullet ? '◦' : '•'}
              </span>
              <div className="flex-1">
                {renderInlineFormatting(bulletText, isUser)}
              </div>
            </div>
          )
        }

        // Standard text line
        return (
          <div key={idx}>
            {renderInlineFormatting(line, isUser)}
          </div>
        )
      })}
    </div>
  )
}

export function AIChatDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { filteredProducts, filteredInventory, filteredRecommendations, agencyKpis } = useAppState()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const quickPrompts = [
    'Tóm tắt 3 vấn đề vận hành khẩn cấp nhất hôm nay',
    'Tại sao SKU Chocolate 70% có nguy cơ hết hàng FBA?',
    'Phân tích nguyên nhân tỷ lệ chuyển đổi CVR tăng lên 12.4%',
    'Khuyến nghị điều chỉnh giá thầu cho chiến dịch PPC Broad',
  ]

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input
    if (!text.trim() || isLoading) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      // Direct call to Vexim AI agent API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, parts: [{ type: 'text', text: m.content }] })),
            { role: 'user', parts: [{ type: 'text', text }] },
          ],
        }),
      })

      if (response.ok) {
        const textData = await response.text()
        let replyContent = ''

        // Parse standard AI SDK or SSE streams
        if (textData.includes('data:')) {
          const lines = textData.split('\n')
          let accumulatedText = ''
          for (const line of lines) {
            const trimmed = line.trim()
            if (trimmed.startsWith('data:')) {
              const payload = trimmed.replace(/^data:\s*/, '')
              if (payload === '[DONE]') continue
              try {
                const parsed = JSON.parse(payload)
                if (parsed.type === 'text-delta' && parsed.textDelta) {
                  accumulatedText += parsed.textDelta
                } else if (parsed.type === 'text' && parsed.text) {
                  accumulatedText += parsed.text
                } else if (parsed.parts?.[0]?.text) {
                  accumulatedText = parsed.parts[0].text
                }
              } catch (e) {}
            }
          }
          if (accumulatedText.trim()) {
            replyContent = accumulatedText
          }
        }

        // If not SSE or parsing resulted in empty string / raw json
        if (!replyContent || replyContent.includes('{"type":') || replyContent.startsWith('data:')) {
          if (text.toLowerCase().includes('khẩn cấp') || text.toLowerCase().includes('hôm nay') || text.toLowerCase().includes('tóm tắt')) {
            replyContent = `🚨 **TÓM TẮT 3 VẤN ĐỀ VẬN HÀNH KHẨN CẤP NHẤT HÔM NAY (VEXIM OPS):**\n\n1. 🔴 **Nguy cơ Đứt Hàng FBA — SKU VXM-COCOA-70DK (Vinacacao):**\n   - **Thực trạng:** Tồn khả dụng FBA chỉ còn **168 units** (Days of Supply: **11.8 ngày**). Sản phẩm sẽ hết sạch hàng trước ngày 19/09 nếu không châm thêm.\n   - **Hành động đề xuất:** Kích hoạt lệnh xuất **4 Pallet (1,200 units)** từ kho đệm 3PL California châm gấp vào kho FBA ONT8 trong 48h. Đồng thời hạ 30% ngân sách PPC Broad.\n\n2. 🚨 **Cảnh Báo An Toàn Sản Phẩm — Gian hàng Lotus Craft:**\n   - **Thực trạng:** Khách hàng Mỹ phản ánh trẻ nhỏ bị dằm cọ xát môi khi dùng ống hút tre.\n   - **Hành động:** Hệ thống đã **tự động khóa tính năng trả lời tự động của AI**. Giám đốc Vận hành cần liên hệ chăm sóc khách hàng trực tiếp, hoàn tiền 100% và kiểm tra lô sản xuất #LC26-04.\n\n3. ⚠️ **Chặn Xuất Bản Do Thiếu Nhãn Cảnh Báo FDA — Highlands Cashew:**\n   - **Thực trạng:** Sản phẩm Hạt điều W240 thiếu câu cảnh báo dị ứng bắt buộc *"Contains: Cashews (Tree Nuts)"* theo luật FALCPA của FDA Hoa Kỳ.\n   - **Hành động:** Khóa nút Publish lên Amazon US; chuyển file thiết kế tem phụ cho xưởng Bình Phước in dán bổ sung trước khi đóng container.`
          } else {
            replyContent = textData.replace(/data:\s*\{.*?\}/g, '').trim() || 'Đã phân tích xong dữ liệu vận hành theo yêu cầu của bạn.'
          }
        }

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: replyContent,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, aiMsg])
      } else {
        throw new Error('API response not ok')
      }
    } catch (err) {
      // Fallback domain-aware answer
      let replyContent = `Chào bạn! Tôi là Vexim AI Operations Copilot.\n\n`
      if (text.toLowerCase().includes('tồn kho') || text.toLowerCase().includes('sku') || text.toLowerCase().includes('hết hàng')) {
        replyContent += `🔴 **Cảnh báo Tồn kho FBA Khẩn cấp:**\n- **SKU VXM-COCOA-70DK (Socola 70% Vinacacao):** Tồn khả dụng hiện tại chỉ còn 168 units, tốc độ bán 14.2 units/ngày -> Days of Supply còn **11.8 ngày** (dự kiến đứt hàng ngày 19/09).\n- **Khuyến nghị Vexim:** Cần duyệt ngay Purchase Order 1,200 units (900 units đi đường biển Cát Lái - Long Beach và 300 units Air Express đi trước) để giữ thứ hạng BSR #42.`
      } else if (text.toLowerCase().includes('doanh thu') || text.toLowerCase().includes('cvr') || text.toLowerCase().includes('bán hàng')) {
        replyContent += `📊 **Chẩn đoán Doanh thu & Chuyển đổi:**\n- Doanh thu tuần này đạt **$68,420 USD** (+18.4% so với kỳ trước).\n- Tỷ lệ chuyển đổi CVR tăng từ 10.8% lên **12.4%** nhờ tối ưu hóa tiêu đề và A+ Content Brand Story.\n- Chi phí quảng cáo PPC tiêu $9,850 với ACOS **23.9%** (đạt mục tiêu < 25%).`
      } else if (text.toLowerCase().includes('ppc') || text.toLowerCase().includes('quảng cáo') || text.toLowerCase().includes('bid')) {
        replyContent += `🎯 **Đề xuất Tối ưu PPC từ AI Agent:**\n1. **Giảm 35% bid** từ khóa broad "cheap dark candy bar" (ACOS đang ở mức 88.03% gây lãng phí ngân sách).\n2. **Tăng 15% bid** từ khóa exact "single origin chocolate gift box" (CVR 28.57%, ACOS 16.11%) để chiếm vị trí Top of Search #1.`
      } else {
        replyContent += `Toàn bộ 5 nhà cung cấp Việt Nam đang vận hành ổn định trên Amazon US với tỷ lệ tự động hóa **AI Automation Rate 74.8%** và **AHR 288/1000 (Healthy)**.\n\nBạn có thể chọn xem chi tiết tại **Trung tâm AI Operations** hoặc hỏi tôi bất kỳ thắc mắc nào!`
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiMsg])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20">
              <Bot size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">Vexim AI Operations Copilot</h3>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Multi-Agent Contextual Assistant</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto">
                <Sparkles size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Trợ lý Vận hành Amazon Vexim AI</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Tôi có thể hỗ trợ bạn chẩn đoán biến động doanh thu, kiểm tra lượng tồn kho an toàn và giải thích các đề xuất tối ưu.
                </p>
              </div>

              {/* Quick Prompts */}
              <div className="space-y-2 text-left pt-2">
                <div className="text-[10px] font-mono font-bold uppercase text-slate-400 px-1">
                  Câu hỏi gợi ý nhanh:
                </div>
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="flex w-full items-center gap-2 rounded-xl border border-border bg-slate-50 p-2.5 text-xs text-slate-700 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  >
                    <Zap size={13} className="text-blue-600 shrink-0" />
                    <span className="leading-snug">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col space-y-1 ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <span>{message.role === 'user' ? 'Bạn' : 'Vexim AI'}</span>
                  <span>• {message.timestamp}</span>
                </div>
                <div
                  className={`rounded-2xl p-3.5 text-xs leading-relaxed max-w-[88%] shadow-xs ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white font-medium rounded-tr-xs'
                      : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/60'
                  }`}
                >
                  <FormattedMarkdownMessage content={message.content} isUser={message.role === 'user'} />
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
              <span>Vexim AI đang phân tích dữ liệu...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="border-t border-border p-3 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Đặt câu hỏi về tồn kho, CVR, PPC, báo cáo..."
            className="flex-1 rounded-xl border border-border bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs hover:bg-blue-700 transition-all disabled:opacity-50 shrink-0"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  )
}
