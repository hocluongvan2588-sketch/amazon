'use client'

import React, { useState } from 'react'
import { useAppState, ActiveNavTab } from '@/lib/state-context'
import { FormattedText } from '@/components/FormattedText'
import {
  Award,
  BookOpen,
  Bot,
  Boxes,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  Crown,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Flame,
  Gavel,
  GraduationCap,
  HeartPulse,
  HelpCircle,
  Layers,
  Megaphone,
  MessageSquareWarning,
  Package,
  Printer,
  Rocket,
  Search,
  ShieldAlert,
  ShieldCheck,
  Ship,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react'

interface TrainingModule {
  id: string
  number: string
  title: string
  subtitle: string
  instructor: string
  roleTag: string
  estimatedTime: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  color: string
  relatedTab: ActiveNavTab
  summary: string
  sections: {
    title: string
    content: string
  }[]
}

export function TrainingKnowledgeHub() {
  const { setActiveTab, showToast } = useAppState()
  const [selectedModuleId, setSelectedModuleId] = useState<string>('mod-01')
  const [searchQuery, setSearchQuery] = useState('')
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>({
    'mod-01': true,
  })

  const trainingModules: TrainingModule[] = [
    {
      id: 'mod-01',
      number: 'MODULE 01',
      title: 'Cẩm Nang Onboarding & Hệ Thống Vận Hành Vexim OS',
      subtitle: 'Triết lý vận hành AI + Human-in-the-loop, Bản đồ 9 tài khoản & 5 điều răn kỷ luật',
      instructor: 'Lương Văn Học (Tổng Giám Đốc)',
      roleTag: 'Toàn Bộ Nhân Sự Mới',
      estimatedTime: '45 Phút',
      icon: Rocket,
      color: 'from-blue-600 to-indigo-700',
      relatedTab: 'overview',
      summary: 'Giới thiệu bức tranh tổng quan về Vexim Global, phân quyền 9 tài khoản nhân sự và lộ trình 7 ngày hòa nhập.',
      sections: [
        {
          title: '1. Sứ Mệnh & Triết Lý "AI-Powered with Human-in-the-Loop"',
          content: `Vexim Global là Nền tảng Tăng tốc Thương hiệu Xuất khẩu Toàn diện (Amazon Accelerator & Full-Service Enabler) cho các nhà sản xuất Việt Nam (Vinacacao, An An, Lotus Craft...).

**2 Nguyên tắc cốt tử:**
- **80% Tác vụ dữ liệu được Tự Động Hóa:** Thuật toán AI liên tục quét tồn kho FBA, bóc tách từ khóa tìm kiếm, đo lường tốc độ bán.
- **100% Quyết định Tài chính & Pháp lý do Con Người Phê Duyệt:** AI chỉ tạo đề xuất (Proposals). Trưởng bộ phận chuyên trách là người bấm **"Duyệt Lệnh"** trước khi bắn API lên Amazon.`,
        },
        {
          title: '2. Bản Đồ 9 Tài Khoản & Phân Hệ Làm Việc (RBAC)',
          content: `Hệ thống phân quyền Role-Based Access Control chặt chẽ:
- **Lương Văn Học (Super Admin - CEO):** Phê duyệt chiến lược vĩ mô, ngân sách > $50k, ký hợp đồng xưởng mới.
- **Nguyễn Tuấn Anh (Operations Director):** Điều phối tổng thể toàn bộ dự án, quản trị SLA.
- **Lương Hoàng Minh (PPC Lead):** Quản trị chiến dịch Ads, thuật toán thu hoạch từ khóa, kiểm soát ACOS.
- **Ánh Nguyễn (Logistics Lead):** Quản trị chuỗi cung ứng 47 ngày, kho đệm 3PL California, in tem nhãn.
- **Trần Thu Hà (Brand & CS Lead):** Tối ưu Listing CRO, A+ Content, bóc tách VOC, trực chat 24h.
- **Lê Hoàng Nam (Legal Counsel Lead):** Thẩm định FDA, hồ sơ FSVP, đơn kháng cáo POA, nhãn hiệu USPTO.
- **Phạm Minh Trang (Senior AE):** Chăm sóc chủ xưởng, gửi báo cáo P&L minh bạch ngày 01 hàng tháng.
- **Chủ xưởng Việt Nam (Vinacacao, An An):** Xem P&L và số dư tài khoản ngân hàng Mỹ độc lập.`,
        },
        {
          title: '3. 5 Điều Răn Kỷ Luật Vận Hành Sống Còn',
          content: `1. **Triệt tiêu đứt hàng (Zero Stock-out):** Mọi SKU chủ lực phải luôn duy trì Days of Supply ≥ 14 ngày.
2. **Khóa AI khi gặp khiếu nại an toàn y tế:** Chuyển ngay cho Legal Lead và Ops Manager xử lý trong 2 giờ.
3. **Bảo vệ dòng tiền quảng cáo:** Không bao giờ tăng bid vượt trần $3.50/click hoặc chi tiêu vượt 105% ngân sách ngày.
4. **Chuẩn hóa mã vạch GS1 & xét nghiệm COA:** Không đẩy sản phẩm thiếu tem nhãn hoặc vi sinh.
5. **Bảo mật dữ liệu xưởng 100%:** Tuyệt đối không tiết lộ số liệu kinh doanh giữa các nhà cung cấp.`,
        },
      ],
    },
    {
      id: 'mod-02',
      number: 'MODULE 02',
      title: 'Quảng Cáo Amazon PPC & Thuật Toán Tăng Trưởng',
      subtitle: 'Phễu 4 tầng (SP/SB/PAT), 4 thuật toán Harvesting / Dayparting / Bleeder Negation',
      instructor: 'Lương Hoàng Minh (PPC & Growth Lead)',
      roleTag: 'Team Quảng Cáo PPC',
      estimatedTime: '60 Phút',
      icon: Zap,
      color: 'from-purple-600 to-indigo-700',
      relatedTab: 'ppc-growth-desk',
      summary: 'Làm chủ Amazon Ads API v3, thuật toán thu hoạch từ khóa chuyển đổi và cân bằng ACOS ≤ 18% & TACOS ≤ 10%.',
      sections: [
        {
          title: '1. Bộ Chỉ Số KPIs Định Lượng',
          content: `- **ACOS Chiến dịch:** Cam kết duy trì ≤ 18% – 22%.
- **TACOS Toàn Gian Hàng:** Kiểm soát ≤ 8% – 10% (đảm bảo doanh số tự nhiên Organic chiếm > 60%).
- **ROAS Trung Bình:** Đạt từ 4.5x – 5.5x.
- **Organic Rank:** Đưa từ khóa chủ lực lọt Top 1 – Top 5 trang 1 Amazon US.`,
        },
        {
          title: '2. Ma Trận Phễu Quảng Cáo 4 Tầng Chuẩn Quốc Tế',
          content: `1. **[SP] Auto Discovery:** Bật cả 4 nhóm (Close, Loose, Sub, Comp) với giá thầu thấp ($0.35 – $0.65) để thu thập cụm từ tìm kiếm mới.
2. **[SP] Broad / Phrase Research:** Nhắm từ khóa mở rộng (+vietnamese +cacao) với giá thầu $0.65 – $0.95.
3. **[SP] Exact Performance:** Chỉ chứa từ khóa vàng chuyển đổi cao với giá thầu $1.20 – $2.20 + Top-of-Search Boost (+50% đến +80%).
4. **[PAT] Product Targeting:** Chạy hiển thị trên ASIN đối thủ đắt tiền hơn và phòng thủ trên chính các ASIN của xưởng mình.`,
        },
        {
          title: '3. 4 Quy Tắc Thuật Toán Tự Động Hóa Cốt Tử',
          content: `🌾 **Thu hoạch Từ khóa Vàng (Harvesting):**
- *Điều kiện:* Orders 7 ngày ≥ 3 đơn và ACOS thực tế < 20%.
- *Hành động:* Thêm vào Exact Match với Bid = CPC thực tế x 1.15; đồng thời thêm vào Negative Exact của chiến dịch Auto/Broad.

🩸 **Phủ định Từ khóa Đốt Tiền (Bleeder Negation):**
- *Điều kiện:* Clicks ≥ 15 và Orders = 0.
- *Hành động:* Lập tức đưa vào Negative Exact để cắt lỗ.

⏰ **Tối ưu Theo Giờ Vàng Nước Mỹ (Dynamic Dayparting):**
- *00:00 – 06:00 EST:* Hạ 40% giá thầu.
- *10:00 – 14:00 & 19:00 – 22:00 EST:* Tăng 20%–25% giá thầu.

🛡️ **Bắt tay Kho Vận (Inventory-Aware PPC Throttling):**
- Khi Days of Supply ≤ 14 ngày: Giảm 30% ngân sách chiến dịch mở rộng, chỉ giữ chiến dịch Brand Defense.`,
        },
      ],
    },
    {
      id: 'mod-03',
      number: 'MODULE 03',
      title: 'Kho Vận FBA, Chuỗi Cung Ứng & In Tem Nhãn Chuẩn Xưởng',
      subtitle: 'Hải trình 47 ngày (Cát Lái - LAX), Thuật toán chia kho Bờ Đông - Bờ Tây ($0 Fee), In tem FNSKU PDF',
      instructor: 'Ánh Nguyễn (Logistics & FBA Hub Lead)',
      roleTag: 'Team Kho Vận & Chuỗi Cung Ứng',
      estimatedTime: '55 Phút',
      icon: Ship,
      color: 'from-cyan-600 to-blue-700',
      relatedTab: 'supply-chain-hub',
      summary: 'Quy trình kiểm soát 5 chặng vận tải biển, tối ưu $0 phí Inbound Placement 2026 và điều phối kho đệm 3PL California.',
      sections: [
        {
          title: '1. Ma Trận 5 Chặng Lead Time Tuyến Việt – Mỹ (47 Ngày)',
          content: `- **Chặng 1 — Sản xuất tại xưởng VN:** 12 – 14 ngày (theo dõi tiến độ PO, dán nhãn FNSKU).
- **Chặng 2 — Vận tải biển Trans-Pacific:** 20 – 24 ngày (Cát Lái / Hải Phòng sang Long Beach / New York).
- **Chặng 3 — Thông quan Hải quan Mỹ (CBP/FDA):** 3 – 5 ngày (nộp hồ sơ Prior Notice trước 5 ngày).
- **Chặng 4 — Kéo xe Drayage nội địa Mỹ:** 2 – 3 ngày (từ cảng về kho 3PL California).
- **Chặng 5 — FBA Receiving:** 4 – 7 ngày (quét nhận lên kệ Buy Box Amazon).
- **Tổng Lead Time:** 47 ngày (+9 ngày dự phòng mùa cao điểm Q4).`,
        },
        {
          title: '2. Thuật Toán Chia Kho Geo-FBA 2026 ($0.00 Phí Placement)',
          content: `Amazon thu phí phạt $0.21 – $0.34/sp nếu gửi 1 kho duy nhất.
**Quy tắc phân bổ chuẩn của Vexim:**
- **60% Lô hàng (1,800 units):** Đi kho Bờ Tây ONT8 (California).
- **40% Lô hàng (1,200 units):** Đi kho Bờ Đông TEB9 (New Jersey).
- **Tiết kiệm:** Miễn 100% phí Inbound Placement, tiết kiệm ròng $840 – $2,500/container.`,
        },
        {
          title: '3. Hướng Dẫn In Tem Nhãn FNSKU & Box Labels Chuẩn 300 DPI',
          content: `- **Tem FNSKU Sản phẩm:** Khổ 50x30mm hoặc A4 30-up, in độ nét 300 DPI, dán đè phẳng hoàn toàn lên mã UPC gốc.
- **Tem Thùng Carton Lớn (FBA Box ID):** Khổ 4x6 inch, dán đủ 2 tem ở 2 góc bên của mỗi thùng. Trọng lượng thùng ≤ 50 lbs (22.6 kg).`,
        },
      ],
    },
    {
      id: 'mod-04',
      number: 'MODULE 04',
      title: 'Tối Ưu Listing CRO, A+ Content & Trải Nghiệm Khách Hàng (CX)',
      subtitle: 'Viết Listing chuẩn SEO Rufus AI / COSMO, Thiết kế Brand Story, Khóa AI khi dính lỗi y tế',
      instructor: 'Trần Thu Hà (Brand Experience & Listing Lead)',
      roleTag: 'Team Nội Dung, Brand & CS',
      estimatedTime: '50 Phút',
      icon: Target,
      color: 'from-pink-600 to-rose-700',
      relatedTab: 'brand-intelligence',
      summary: 'Kỹ năng nâng tỷ lệ chuyển đổi Listing lên ≥ 18%, bóc tách Voice of Customer và bảo vệ gian hàng trước khiếu nại.',
      sections: [
        {
          title: '1. Cấu Trúc Tiêu Đề Vàng (Product Title Formula)',
          content: `$$\\text{Title} = \\text{[Brand]} + \\text{[Core Benefit Keyword]} + \\text{[Key Feature/Origin]} + \\text{[Pack Size/Weight]}$$
*Ví dụ chuẩn:* \`Vinacacao Pure Single Origin 70% Dark Chocolate Bar (Ben Tre, Vietnam) — 3.5oz Pack of 4\``,
        },
        {
          title: '2. 5 Key Feature Bullets Tập Trung Giải Quyết Nỗi Đau',
          content: `- **Bullet 1:** Nguồn gốc & Tính độc bản (Authentic Single Origin Mekong Delta).
- **Bullet 2:** Hương vị & Chất lượng cốt lõi (22-24% Natural Fat Cocoa Butter).
- **Bullet 3:** Chứng chỉ Sức khỏe (USDA Organic, Non-GMO Verified).
- **Bullet 4:** Thành phần Sạch (Clean Ingredients: 0% Palm Oil, Vegan, Gluten-Free).
- **Bullet 5:** Quy cách Đóng gói & Quà tặng (Airtight Protective Foil Packaging).`,
        },
        {
          title: '3. Vòng Kiểm Soát Khẩn Cấp Tin Nhắn CS (Safety Gate)',
          content: `Khi khách gửi tin nhắn chứa từ khóa rủi ro (*Dị ứng, Ngộ độc, Dị vật, Khiếu nại CPSC/FDA*):
- 🛑 **Hệ thống tự động ngắt tính năng AI trả lời 100%.**
- 🚨 Bắn cờ đỏ tới Quản lý Vận hành và Legal Lead gọi điện/viết thư trực tiếp trong 2 giờ.`,
        },
      ],
    },
    {
      id: 'mod-05',
      number: 'MODULE 05',
      title: 'Pháp Lý Amazon, Đạo Luật FDA & Soạn Đơn Kháng Cáo (POA)',
      subtitle: '5 Đạo luật liên bang Hoa Kỳ (FDA FFR, FALCPA, Prop 65, Lacey Act, EPA), Mẫu đơn POA 3 phần',
      instructor: 'Lê Hoàng Nam (Head of Legal & Compliance)',
      roleTag: 'Team Pháp Lý & FDA',
      estimatedTime: '65 Phút',
      icon: Gavel,
      color: 'from-rose-600 to-red-800',
      relatedTab: 'compliance-ops-desk',
      summary: 'Làm chủ các quy chuẩn khắt khe nhất của luật pháp Hoa Kỳ, bảo vệ điểm AHR 250-300 và gỡ cờ đỏ trong 48h.',
      sections: [
        {
          title: '1. 5 Đạo Luật Liên Bang Hoa Kỳ Bắt Buộc Thuộc Lòng',
          content: `1. **FDA Food Facility Registration (FFR):** Đăng ký cơ sở thực phẩm + mã UFI/DUNS. Gia hạn các năm chẵn (01/10 – 31/12).
2. **FALCPA & FASTER Act:** Bắt buộc in hoa 9 nhóm dị ứng lớn: \`Contains: Cashews (Tree Nuts)\`.
3. **California Proposition 65:** Kiểm nghiệm kim loại nặng Lead/Cadmium. Dán nhãn cảnh báo nếu vượt ngưỡng.
4. **USDA Lacey Act:** Khai báo tên khoa học thực vật học (*Aquilaria crassna*, *Bambusoideae*) cho Nhang & Tre.
5. **EPA / FIFRA Pesticides:** Cấm tuyệt đối từ "Antibacterial", "Antiviral", "Disinfectant" nếu không có giấy phép EPA.`,
        },
        {
          title: '2. Công Thức Đơn Kháng Cáo 3 Phần Chuẩn Luật Sư (Plan of Action)',
          content: `🔍 **Phần 1 — Root Cause of the Issue (Nguyên nhân gốc rễ):** Nhận diện chính xác tại sao sự cố xảy ra trong khâu đóng gói/QC, không đổ lỗi cho bên thứ ba.
⚡ **Phần 2 — Immediate Corrective Actions (Hành động khắc phục ngay):** Đã hoàn tiền cho khách, dỡ lô hàng về kho 3PL California dán lại toàn bộ tem nhãn mới.
🛡️ **Phần 3 — Preventive Measures (Biện pháp phòng ngừa lâu dài):** Nâng cấp máy scan mã vạch tự động tại nhà máy Việt Nam, bổ sung chuyên gia PCQI kiểm định từng lô.`,
        },
        {
          title: '3. Quy Trình FSVP & Chỉ Định Nhân Sự QI Nhà Máy',
          content: `- Hướng dẫn Trưởng phòng QA/QC nhà máy Việt Nam học chứng chỉ FSPCA PCQI (20 giờ).
- US LLC tại Wyoming ban hành quyết định "Designation of Qualified Individual" để ký duyệt hồ sơ hải quan hợp pháp.`,
        },
      ],
    },
    {
      id: 'mod-06',
      number: 'MODULE 06',
      title: 'Quản Trị Khách Hàng (AE) & Báo Cáo Tài Chính P&L Minh Bạch',
      subtitle: 'Quy trình chăm sóc chủ xưởng VN, Giải trình P&L 5 dòng tiền, Bộ quy tắc xử lý khủng hoảng',
      instructor: 'Phạm Minh Trang (Senior Account Executive)',
      roleTag: 'Team Account Executive & Kế Toán',
      estimatedTime: '45 Phút',
      icon: ShieldCheck,
      color: 'from-emerald-600 to-teal-700',
      relatedTab: 'supplier-portal',
      summary: 'Kỹ năng giao tiếp đồng hành với ban lãnh đạo nhà xưởng, giải trình báo cáo tài chính và duy trì tỷ lệ CSAT ≥ 4.8/5.',
      sections: [
        {
          title: '1. Lịch Trình Chăm Sóc Chủ Xưởng Định Kỳ',
          content: `- **Hàng ngày:** Gửi tin nhắn tóm tắt doanh số và số đơn hàng hôm trước qua nhóm Zalo VIP.
- **Hàng tuần:** Báo cáo tiến độ vận đơn tàu biển & Days of Supply nhắc xưởng chuẩn bị lịch đóng hàng PO mới.
- **Hàng tháng:** Gửi Báo cáo Tài chính P&L chính thức bản PDF kèm buổi họp 45 phút phân tích tăng trưởng chiến lược.
- **Đột xuất:** Thông báo ngay khi có sự cố kèm phương án xử lý đã được Vexim chuẩn bị sẵn.`,
        },
        {
          title: '2. Giải Trình 5 Dòng Tiền Trên Bảng P&L Minh Bạch',
          content: `1. **Tổng Doanh Thu Xuất Khẩu (Gross Sales USD):** Tổng tiền khách Mỹ thanh toán.
2. **Chi Phí FBA & Phí Sàn (Amazon Fees ~30% – 33%):** Phí lưu kho, hoa hồng 15%, Pick & Pack.
3. **Chi Phí Quảng Cáo (PPC Spend ~10% – 12%):** ACOS cam kết ≤ 20%.
4. **Chi Phí Vận Tải & Kho 3PL California (~8% – 10%):** Cước biển và phí lưu kho ngoại quan.
5. **LỢI NHUẬN RÒNG CHUYỂN VỀ TÀI KHOẢN (Net Profit):** Đạt từ 35% – 45% doanh thu, bảo chứng qua sao kê ngân hàng Mercury Bank.`,
        },
        {
          title: '3. Bộ Quy Tắc Xử Lý Khủng Hoảng Tâm Lý Khách Hàng',
          content: `- Khi Doanh số giảm trong tuần: Chủ động gửi phân tích nguyên nhân (đối thủ chạy deal, mùa vụ) kèm phương án khắc phục ngay.
- Khi Hàng bị kẹt cảng do bão: Đề xuất phương án bay Air Express 200 units cứu nguy Buy Box.
- Luôn giữ tính minh bạch: Mọi số liệu trên Vexim Platform đều đối soát trực tiếp với Amazon SP-API.`,
        },
      ],
    },
  ]

  const activeModule = trainingModules.find((m) => m.id === selectedModuleId) || trainingModules[0]

  const toggleModuleCompleted = (modId: string) => {
    const isNowDone = !completedModules[modId]
    setCompletedModules((prev) => ({
      ...prev,
      [modId]: isNowDone,
    }))
    if (showToast) {
      showToast(
        isNowDone
          ? `Đã hoàn thành ${activeModule.number}: ${activeModule.title}`
          : `Đã mở lại trạng thái học tập cho ${activeModule.number}`,
        isNowDone ? 'success' : 'info'
      )
    }
  }

  const completedCount = Object.values(completedModules).filter(Boolean).length
  const progressPercent = Math.round((completedCount / trainingModules.length) * 100)

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-xl border border-indigo-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded bg-indigo-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-wider">
              Vexim Academy 2026
            </span>
            <span className="flex items-center gap-1 text-[11px] text-cyan-300 font-medium">
              <GraduationCap size={14} />
              Chương Trình Đào Tạo Nội Bộ Chuẩn Hóa
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Học Viện Đào Tạo & Cẩm Nang Vận Hành Vexim
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
            Toàn bộ quy trình, công thức toán học, kịch bản xử lý khủng hoảng và hướng dẫn vận hành chuyên sâu cho 4 phân hệ Amazon US.
          </p>
        </div>

        {/* Progress Card */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs text-right space-y-1.5 min-w-[200px]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[10px] uppercase">Tiến Độ Đào Tạo</span>
            <span className="font-bold text-emerald-400">{completedCount} / {trainingModules.length} Modules</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400">Hoàn thành: {progressPercent}% giáo trình</div>
        </div>
      </div>

      {/* Main Grid: Sidebar Module List (4 cols) & Full-text Content Reader (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: MODULE SELECTOR */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider px-1">
            <span>6 Modules Đào Tạo</span>
            <span className="text-[10px] text-indigo-600 font-mono">VXM-TRN-2026</span>
          </div>

          <div className="space-y-2">
            {trainingModules.map((mod) => {
              const Icon = mod.icon
              const isSelected = selectedModuleId === mod.id
              const isDone = !!completedModules[mod.id]

              return (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModuleId(mod.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs ring-1 ring-indigo-500/30'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${mod.color} text-white shadow-xs mt-0.5`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold uppercase text-indigo-600">
                        {mod.number}
                      </span>
                      {isDone && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.2 rounded">
                          <Check size={10} /> Đã học
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                      {mod.title}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <span>{mod.estimatedTime}</span>
                      <span>&bull;</span>
                      <span className="truncate">{mod.roleTag}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: FULL-TEXT TRAINING CONTENT READER */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          {/* Module Header in Reader */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="rounded bg-indigo-100 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-800 uppercase">
                  {activeModule.number}
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  Dành cho: {activeModule.roleTag}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 leading-tight">
                {activeModule.title}
              </h2>
              <p className="text-xs text-slate-500">
                Giảng viên phụ trách: <strong>{activeModule.instructor}</strong> &bull; Thời lượng: <strong>{activeModule.estimatedTime}</strong>
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => toggleModuleCompleted(activeModule.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  completedModules[activeModule.id]
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 size={14} />
                <span>{completedModules[activeModule.id] ? 'Đã Hoàn Thành' : 'Đánh Dấu Đã Học'}</span>
              </button>

              <button
                onClick={() => setActiveTab(activeModule.relatedTab)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
                title="Mở không gian làm việc thực tế của phân hệ này"
              >
                <span>Mở Phân Hệ Thao Tác</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Module Summary Callout */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 text-xs text-indigo-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-indigo-900">
              <Sparkles size={14} className="text-indigo-600" />
              <span>Mục tiêu đầu ra của Module:</span>
            </div>
            <p className="text-[11px] text-indigo-800 leading-relaxed">
              {activeModule.summary}
            </p>
          </div>

          {/* Detailed Content Sections */}
          <div className="space-y-6 divide-y divide-slate-100 text-slate-800">
            {activeModule.sections.map((sec, idx) => (
              <div key={idx} className={`${idx > 0 ? 'pt-6' : ''} space-y-2.5`}>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 font-mono text-[10px] font-bold text-slate-700">
                    {idx + 1}
                  </span>
                  <span>{sec.title}</span>
                </h3>

                <div className="rounded-xl bg-slate-50/70 p-4 border border-slate-100/80 leading-relaxed text-xs">
                  <FormattedText text={sec.content} />
                </div>
              </div>
            ))}
          </div>

          {/* Module Footer Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 text-xs">
            <div className="text-slate-400 text-[11px]">
              Tài liệu đào tạo lưu trữ tại: <code className="font-mono text-purple-900">docs/training/</code>
            </div>
            <button
              onClick={() => {
                const nextIdx = (trainingModules.findIndex((m) => m.id === selectedModuleId) + 1) % trainingModules.length
                setSelectedModuleId(trainingModules[nextIdx].id)
              }}
              className="flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <span>Xem Module Kế Tiếp</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
