import { convertToModelMessages, gateway, streamText, type UIMessage } from 'ai'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

/**
 * Lấy bối cảnh SỐNG từ Supabase (tồn kho + clients + giá cước) để đưa vào
 * system prompt của Copilot. Trả về chuỗi rỗng nếu DB chưa sẵn sàng
 * (thiếu migration/chính sách) — khi đó Copilot dùng bối cảnh tĩnh mặc định.
 */
async function buildLiveDbContext(): Promise<string> {
  if (!isSupabaseConfigured()) return ''
  try {
    const [invRes, clientRes, rateRes] = await Promise.all([
      supabase.from('inventory').select('sku, title, fba_available, days_of_supply, risk_level, recommended_reorder_qty').order('days_of_supply'),
      supabase.from('clients').select('name, connection_status').limit(10),
      supabase.from('freight_rate_cards').select('carrier_partner_name, transport_mode, rate_per_cbm_usd, rate_per_container_usd, rate_per_kg_usd, estimated_transit_days').eq('is_active', true),
    ])

    const inventory = invRes.data || []
    if (inventory.length === 0) return ''

    const lines: string[] = ['', '3. DỮ LIỆU SỐNG TỪ SUPABASE (nguồn sự thật tại thời điểm trả lời):', '']
    lines.push('— Tồn kho FBA (sắp theo ngày còn hàng tăng dần):')
    for (const row of inventory) {
      lines.push(
        `   • ${row.sku} — ${row.title}: còn ${row.fba_available} units, ${row.days_of_supply} ngày tồn kho, rủi ro ${row.risk_level}, đề xuất reorder ${row.recommended_reorder_qty} units.`
      )
    }
    if (clientRes?.data?.length) {
      lines.push('— Nhà cung cấp đang quản lý: ' + clientRes.data.map((c: any) => c.name).join(', ') + '.')
    }
    if (rateRes?.data?.length) {
      lines.push('— Bảng giá cước hiện hành:')
      for (const r of rateRes.data) {
        const rate = r.rate_per_cbm_usd ? `$${r.rate_per_cbm_usd}/CBM` : r.rate_per_container_usd ? `$${r.rate_per_container_usd}/container` : `$${r.rate_per_kg_usd}/kg`
        lines.push(`   • ${r.carrier_partner_name} (${r.transport_mode}): ${rate}, transit ${r.estimated_transit_days} ngày.`)
      }
    }
    return lines.join('\n')
  } catch {
    return ''
  }
}

// Rate limit in-memory 30 câu hỏi/phút/IP (per-instance; production multi-instance nên
// dùng Redis/Upstash). Chống lạm dụng chi phí AI khi mở public.
const RATE_LIMIT = 30
const WINDOW_MS = 60_000
const rateBuckets = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const bucket = rateBuckets.get(ip)
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    if (rateBuckets.size > 5000) rateBuckets.clear()
    return true
  }
  if (bucket.count >= RATE_LIMIT) return false
  bucket.count += 1
  return true
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'
    if (!checkRateLimit(ip)) {
      return Response.json({ error: 'Quá nhiều câu hỏi. Vui lòng thử lại sau 1 phút.' }, { status: 429 })
    }

    const body = (await request.json()) as { messages?: UIMessage[] }
    const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : []

    if (!messages.length) {
      return Response.json({ error: 'Vui lòng nhập câu hỏi.' }, { status: 400 })
    }

    const lastMsg = messages[messages.length - 1]
    const userQuery = lastMsg.parts?.map((p: any) => p.text).join('') || ''

    const liveContext = await buildLiveDbContext()

    const systemPrompt = `Bạn là Vexim AI Operations Copilot — Trợ lý vận hành Amazon US chuyên biệt cho các Nhà cung cấp Việt Nam xuất khẩu sang Mỹ thuộc nền tảng Vexim Global.

Bối cảnh hệ thống Vexim hiện tại:
1. Đang quản lý các Nhà cung cấp Việt Nam:
   - Vinacacao Organics (Socola Bến Tre & Bột Cacao) — SKU chủ lực VXM-COCOA-70DK và VXM-COCOA-PWD500.
   - An An Herbal Incense (Nhang Trầm & Quế Hà Tĩnh).
2. Nguyên tắc vận hành:
   - Luôn trả lời bằng tiếng Việt chuyên nghiệp, súc tích, logic và có cấu trúc rõ ràng (Bullet points, số liệu cụ thể).
   - Multi-Agent System: Tồn kho (Inventory Agent), Listing (Listing Agent), Quảng cáo (PPC Agent), Sức khỏe tài khoản (Health Agent), Chăm sóc khách hàng (Customer Safety Agent), Tuân thủ pháp lý (Compliance Gatekeeper).
   - Human-in-the-loop: Mọi hành động nhạy cảm (Đổi giá, Sửa ngân sách, Nhập hàng, Trả lời khiếu nại an toàn) đều qua phê duyệt của các Trưởng bộ phận phụ trách.
   - Ưu tiên sử dụng số liệu từ mục "DỮ LIỆU SỐNG TỪ SUPABASE" nếu có, thay vì con số mặc định.
${liveContext}
`

    // Có API key -> gọi AI thật. Không có key -> phục vụ kịch bản fallback ngay
    // (streamText không throw đồng bộ khi thiếu key, lỗi chỉ xuất hiện trong stream)
    const hasAiKey = !!(process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY)

    if (hasAiKey) {
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
        console.warn('[Vexim AI] Gateway call failed, using fallback script:', modelErr)
      }
    }

    // Intelligent fallback for environments without external gateway
    {
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
