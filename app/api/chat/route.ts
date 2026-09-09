import { convertToModelMessages, gateway, streamText, type UIMessage } from 'ai'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages?: UIMessage[] }
    const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : []

    if (!messages.length) {
      return Response.json({ error: 'Vui lòng nhập câu hỏi.' }, { status: 400 })
    }

    const lastMsg = messages[messages.length - 1]
    const userQuery = lastMsg.parts?.map((p: any) => p.text).join('') || ''

    const systemPrompt = `Bạn là Vexim AI Operations Copilot — Trợ lý vận hành Amazon US chuyên biệt cho các Nhà cung cấp Việt Nam xuất khẩu sang Mỹ thuộc nền tảng Vexim Global.

Bối cảnh hệ thống Vexim hiện tại:
1. Đang quản lý các Nhà cung cấp Việt Nam:
   - Vinacacao Organics (Socola Bến Tre & Bột Cacao) — Doanh thu $68,420/tháng (+18.4%), 2,190 đơn hàng, CVR 12.4%, ACOS 23.9%. SKU chủ lực VXM-COCOA-70DK đang còn 168 units (Days of supply: 11.8 ngày - CRITICAL).
   - An An Herbal Incense (Nhang Trầm & Quế Hà Tĩnh) — Doanh thu $34,150/tháng (+24.2%).
   - Lotus Craft Vietnam (Ống hút tre & Bát gáo dừa) — Phát hiện khiếu nại an toàn dằm cọ xát môi (Đã khóa AI tự động, chuyển Ops Manager xử lý).
   - Highlands Cashew Co. (Hạt điều rang muối & ớt W240 - Đang bị chặn Launch do thiếu nhãn cảnh báo FALCPA Allergen Tree Nuts chuẩn FDA).
   - Tan Viet Wood (Thớt gỗ Teak).

2. Nguyên tắc vận hành:
   - Luôn trả lời bằng tiếng Việt chuyên nghiệp, súc tích, logic và có cấu trúc rõ ràng (Bullet points, số liệu cụ thể).
   - Multi-Agent System: Tồn kho (Inventory Agent), Listing (Listing Agent), Quảng cáo (PPC Agent), Sức khỏe tài khoản (Health Agent), Chăm sóc khách hàng (Customer Safety Agent), Tuân thủ pháp lý (Compliance Gatekeeper).
   - Human-in-the-loop: Mọi hành động nhạy cảm (Đổi giá, Sửa ngân sách, Nhập hàng, Trả lời khiếu nại an toàn) đều qua phê duyệt của các Trưởng bộ phận phụ trách.
   - Khi được hỏi về 3 vấn đề khẩn cấp nhất:
     1. SKU Socola 70% Vinacacao chỉ còn 11.8 ngày tồn kho (Cần châm hàng 3PL sang FBA).
     2. Sự cố an toàn khách hàng Lotus Craft (Khóa AI, Human-in-the-loop gọi điện chăm sóc).
     3. Chặn xuất bản Hạt điều Highlands Cashew do thiếu nhãn cảnh báo dị ứng chuẩn FALCPA của FDA.
`

    try {
      // Use higher token allowance to prevent reasoning models from hitting length limits
      const result = streamText({
        model: gateway('openai/gpt-4o-mini'),
        system: systemPrompt,
        messages: await convertToModelMessages(messages),
        maxOutputTokens: 2500,
      })

      return result.toUIMessageStreamResponse()
    } catch (modelErr) {
      // Intelligent fallback for environments without external gateway
      let responseText = `Xin chào! Tôi là Vexim AI Operations Copilot. Dưới đây là phân tích từ hệ thống:\n\n`

      if (userQuery.toLowerCase().includes('khẩn cấp') || userQuery.toLowerCase().includes('hôm nay') || userQuery.toLowerCase().includes('tóm tắt')) {
        responseText = `🚨 **TÓM TẮT 3 VẤN ĐỀ VẬN HÀNH KHẨN CẤP NHẤT HÔM NAY (VEXIM OPS):**

1. 🔴 **Nguy cơ Đứt Hàng FBA — SKU VXM-COCOA-70DK (Vinacacao):**
   - **Thực trạng:** Tồn khả dụng FBA chỉ còn **168 units** (Days of Supply: **11.8 ngày**). Với tốc độ bán 14.2 sp/ngày, sản phẩm sẽ hết sạch hàng trước ngày 19/09.
   - **Hành động đề xuất:** Kích hoạt lệnh xuất **4 Pallet (1,200 units)** từ kho đệm 3PL California châm gấp vào kho FBA ONT8 trong 48h. Đồng thời hạ 30% ngân sách chiến dịch PPC Broad.

2. 🚨 **Cảnh Báo An Toàn Sản Phẩm — Gian hàng Lotus Craft:**
   - **Thực trạng:** Khách hàng Mỹ phản ánh trẻ nhỏ bị dằm cọ xát môi khi dùng ống hút tre.
   - **Hành động:** Hệ thống đã **tự động khóa tính năng trả lời tự động của AI**. Đề xuất Giám đốc Vận hành liên hệ chăm sóc khách hàng trực tiếp, hoàn tiền 100% và kiểm tra lô sản xuất #LC26-04.

3. ⚠️ **Chặn Xuất Bản Do Thiếu Nhãn Cảnh Báo FDA — Highlands Cashew:**
   - **Thực trạng:** Sản phẩm Hạt điều W240 thiếu câu cảnh báo dị ứng bắt buộc *"Contains: Cashews (Tree Nuts)"* theo luật FALCPA của FDA Hoa Kỳ.
   - **Hành động:** Khóa nút Publish lên Amazon US; chuyển file thiết kế tem phụ cho xưởng Bình Phước in dán bổ sung trước khi đóng container.`
      } else if (userQuery.toLowerCase().includes('tồn kho') || userQuery.toLowerCase().includes('sku') || userQuery.toLowerCase().includes('hết hàng')) {
        responseText = `🔴 **Cảnh báo Tồn kho FBA Khẩn cấp:**\n- **SKU VXM-COCOA-70DK (Socola 70% Vinacacao):** Tồn khả dụng hiện tại chỉ còn 168 units, tốc độ bán 14.2 units/ngày -> Days of Supply còn **11.8 ngày**.\n- **Khuyến nghị:** Kéo 1,200 units từ kho 3PL California vào FBA ONT8 và hạ 30% bid PPC broad.`
      } else if (userQuery.toLowerCase().includes('doanh thu') || userQuery.toLowerCase().includes('cvr') || userQuery.toLowerCase().includes('bán hàng')) {
        responseText = `📊 **Chẩn đoán Doanh thu & Chuyển đổi:**\n- Doanh thu tuần này đạt **$68,420 USD** (+18.4% so với kỳ trước).\n- Tỷ lệ chuyển đổi CVR đạt **12.4%** nhờ tối ưu hóa tiêu đề và A+ Content Brand Story.\n- ACOS duy trì ở mức an toàn **23.9%**.`
      } else if (userQuery.toLowerCase().includes('ppc') || userQuery.toLowerCase().includes('quảng cáo') || userQuery.toLowerCase().includes('bid')) {
        responseText = `🎯 **Đề xuất Tối ưu PPC từ AI Agent:**\n1. **Giảm 35% bid** từ khóa broad "cheap dark candy bar" (ACOS 88.03% gây lãng phí ngân sách).\n2. **Tăng 15% bid** từ khóa exact "single origin chocolate gift box" (CVR 28.57%, ACOS 16.11%) để chiếm Top of Search.`
      } else {
        responseText = `Toàn bộ 5 nhà cung cấp Việt Nam đang vận hành với tỷ lệ tự động hóa **AI Automation Rate 74.8%** và Sức khỏe tài khoản **AHR 288/1000 (Healthy)**.\n\nBạn có thể hỏi tôi bất kỳ thắc mắc nào về SKU, Đơn hàng, PPC hoặc Quy chuẩn FDA!`
      }

      // Return synthetic stream formatted for UI Message
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          const chunk = JSON.stringify({
            type: 'text-delta',
            textDelta: responseText,
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
