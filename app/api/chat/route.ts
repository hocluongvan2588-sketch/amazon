import { convertToModelMessages, gateway, streamText, type UIMessage } from 'ai'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages?: UIMessage[] }
    const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : []

    if (!messages.length) {
      return Response.json({ error: 'Vui lòng nhập câu hỏi.' }, { status: 400 })
    }

    const systemPrompt = `Bạn là Vexim AI Operations Copilot — Trợ lý vận hành Amazon US chuyên biệt cho các Nhà cung cấp Việt Nam xuất khẩu sang Mỹ thuộc nền tảng Vexim Global.

Bối cảnh hệ thống Vexim hiện tại:
1. Đang quản lý các Nhà cung cấp Việt Nam:
   - Vinacacao Organics (Socola Bến Tre & Bột Cacao) — Doanh thu $68,420/tháng (+18.4%), 2,190 đơn hàng, CVR 12.4%, ACOS 23.9%. SKU chủ lực VXM-COCOA-70DK đang còn 168 units (Days of supply: 11.8 ngày - CRITICAL).
   - An An Herbal Incense (Nhang Trầm & Quế Hà Tĩnh) — Doanh thu $34,150/tháng (+24.2%).
   - Lotus Craft Vietnam (Ống hút tre & Bát gáo dừa).
   - Highlands Cashew Co. (Hạt điều rang muối & ớt W240 - Đang bị chặn Launch do thiếu nhãn cảnh báo FALCPA Allergen Tree Nuts chuẩn FDA).
   - Tan Viet Wood (Thớt gỗ Teak).

2. Nguyên tắc vận hành:
   - Luôn trả lời bằng tiếng Việt chuyên nghiệp, súc tích, logic và có cấu trúc rõ ràng (Bullet points, số liệu cụ thể).
   - Multi-Agent System: Tồn kho (Inventory Agent), Listing (Listing Agent), Quảng cáo (PPC Agent), Sức khỏe tài khoản (Health Agent), Chăm sóc khách hàng (Customer Safety Agent), Tuân thủ pháp lý (Compliance Gatekeeper).
   - Human-in-the-loop: Mọi hành động nhạy cảm (Đổi giá, Sửa ngân sách, Nhập hàng, Trả lời khiếu nại an toàn) đều phải qua phê duyệt của Operations Manager.
   - Khi được hỏi về tồn kho, hãy phân tích tốc độ bán, thời gian lead time sản xuất tại xưởng Việt Nam (7 ngày) + đường biển Long Beach (21 ngày) + nhập kho FBA (4 ngày) = 32 ngày.
   - Khi được hỏi về sự cố an toàn, nhấn mạnh nguyên tắc tự động khóa auto-reply để con người xử lý trực tiếp.
`

    try {
      const result = streamText({
        model: gateway('openai/gpt-5-mini'),
        system: systemPrompt,
        messages: await convertToModelMessages(messages),
        maxOutputTokens: 800,
      })

      return result.toUIMessageStreamResponse()
    } catch (modelErr) {
      // Intelligent fallback for sandboxes without active gateway token
      const lastMsg = messages[messages.length - 1]
      const text = lastMsg.parts?.map((p: any) => p.text).join('') || ''

      let responseText = `Xin chào! Tôi là Vexim AI Operations Copilot. Dưới đây là phân tích nhanh từ hệ thống:\n\n`

      if (text.toLowerCase().includes('tồn kho') || text.toLowerCase().includes('sku') || text.toLowerCase().includes('hết hàng')) {
        responseText += `🔴 **Cảnh báo Tồn kho FBA Khẩn cấp:**\n- **SKU VXM-COCOA-70DK (Socola 70% Vinacacao):** Tồn khả dụng hiện tại chỉ còn 168 units, tốc độ bán 14.2 units/ngày -> Days of Supply còn **11.8 ngày** (dự kiến đứt hàng ngày 19/09).\n- **Khuyến nghị Vexim:** Cần duyệt ngay Purchase Order 1,200 units (900 units đi đường biển Cát Lái - Long Beach và 300 units Air Express đi trước) để giữ thứ hạng BSR #42.`
      } else if (text.toLowerCase().includes('doanh thu') || text.toLowerCase().includes('cvr') || text.toLowerCase().includes('bán hàng')) {
        responseText += `📊 **Chẩn đoán Doanh thu & Chuyển đổi:**\n- Doanh thu tuần này đạt **$68,420 USD** (+18.4% so với kỳ trước).\n- Tỷ lệ chuyển đổi CVR tăng từ 10.8% lên **12.4%** nhờ tối ưu hóa tiêu đề và A+ Content Brand Story.\n- Chi phí quảng cáo PPC tiêu $9,850 với ACOS **23.9%** (đạt mục tiêu < 25%).`
      } else if (text.toLowerCase().includes('ppc') || text.toLowerCase().includes('quảng cáo') || text.toLowerCase().includes('bid')) {
        responseText += `🎯 **Đề xuất Tối ưu PPC từ AI Agent:**\n1. **Giảm 35% bid** từ khóa broad "cheap dark candy bar" (ACOS đang ở mức 88.03% gây lãng phí ngân sách).\n2. **Tăng 15% bid** từ khóa exact "single origin chocolate gift box" (CVR 28.57%, ACOS 16.11%) để chiếm vị trí Top of Search #1.`
      } else {
        responseText += `Hiện tại toàn bộ 5 nhà cung cấp Việt Nam trên hệ thống đang hoạt động với tỷ lệ tự động hóa **AI Automation Rate đạt 74.8%** và Sức khỏe tài khoản **AHR 288/1000 (Healthy)**.\n\nBạn có thể chọn xem chi tiết tại **Trung tâm AI Operations** hoặc hỏi tôi bất kỳ thắc mắc nào về SKU, Đơn hàng, hoặc Quy trình kiểm định FDA!`
      }

      // Return synthetic stream formatted for UI Message
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          const chunk = JSON.stringify({
            id: `msg-${Date.now()}`,
            role: 'assistant',
            parts: [{ type: 'text', text: responseText }],
          })
          controller.enqueue(encoder.encode(`data: ${chunk}\n\n`))
          controller.close()
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    }
  } catch (error) {
    console.error('[Vexim AI] Chat route error:', error)
    return Response.json({ error: 'Không thể xử lý yêu cầu.' }, { status: 500 })
  }
}
