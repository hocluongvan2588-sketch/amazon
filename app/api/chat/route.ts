import { convertToModelMessages, gateway, streamText, type UIMessage } from 'ai'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages?: UIMessage[] }
    const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : []

    if (!messages.length) {
      return Response.json({ error: 'Vui lòng nhập câu hỏi.' }, { status: 400 })
    }

    const result = streamText({
      model: gateway('openai/gpt-5-mini'),
      system: `Bạn là Vexim AI, trợ lý vận hành Amazon cho đội ngũ Vexim. Luôn trả lời bằng tiếng Việt, ngắn gọn, rõ ràng và có cấu trúc. Hiện tại dashboard chỉ dùng dữ liệu demo: doanh thu 128,430 USD, 2,481 đơn hàng, tồn kho khả dụng 94.2%, SKU VXM-1042 có 18 units và cần nhập hàng. Không được tuyên bố đã truy cập Amazon hoặc dữ liệu thật. Nếu câu hỏi cần dữ liệu chưa có, hãy nói rõ giới hạn và đề xuất bước tiếp theo. Không tự ý phê duyệt hoặc thực hiện hành động tài chính.`,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 700,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('[v0] AI chat route error:', error)
    return Response.json({ error: 'Không thể kết nối AI Gateway.' }, { status: 503 })
  }
}
