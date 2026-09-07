'use client'

import { useChat } from '@ai-sdk/react'
import { useState } from 'react'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  Boxes,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Command,
  FileText,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  PackageCheck,
  PanelRight,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react'

const sales = [
  { label: 'Mon', value: 44 },
  { label: 'Tue', value: 58 },
  { label: 'Wed', value: 49 },
  { label: 'Thu', value: 72 },
  { label: 'Fri', value: 66 },
  { label: 'Sat', value: 82 },
  { label: 'Sun', value: 76 },
]

const inventory = [
  { sku: 'VXM-1042', product: 'Daily Planner — Sage', channel: 'Amazon US', stock: 18, status: 'Cần nhập hàng', tone: 'red' },
  { sku: 'VXM-2098', product: 'Desk Organizer', channel: 'Amazon CA', stock: 42, status: 'Theo dõi', tone: 'amber' },
  { sku: 'VXM-3310', product: 'Travel Bottle Set', channel: 'Amazon UK', stock: 84, status: 'Ổn định', tone: 'green' },
]

function MetricCard({ icon: Icon, label, value, detail, trend, positive = true }: { icon: typeof CircleDollarSign; label: string; value: string; detail: string; trend: string; positive?: boolean }) {
  return (
    <div className="metric-card">
      <div className="metric-top"><span className="metric-icon"><Icon size={17} /></span><span className="metric-label">{label}</span><span className="metric-menu">···</span></div>
      <div className="metric-value">{value}</div>
      <div className="metric-bottom"><span className={positive ? 'trend-up' : 'trend-down'}>{positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{trend}</span><span className="metric-detail">{detail}</span></div>
    </div>
  )
}

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [period, setPeriod] = useState('7 ngày qua')
  const [dismissed, setDismissed] = useState<string[]>([])
  const { messages, input, handleInputChange, handleSubmit, status, error } = useChat({ api: '/api/chat' })
  const visibleInventory = inventory.filter((item) => !dismissed.includes(item.sku))

  return (
    <main className="app-shell">
      <aside className={sidebarOpen ? 'sidebar sidebar-open' : 'sidebar'}>
        <div className="brand"><div className="brand-mark">V</div><div><div className="brand-name">VEXIM</div><div className="brand-sub">AMAZON OPERATIONS</div></div><button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Đóng menu"><X size={17} /></button></div>
        <div className="workspace"><span className="workspace-dot" /> Vexim Holdings <ChevronDown size={14} /></div>
        <nav className="nav-list" aria-label="Điều hướng chính">
          <div className="nav-section">WORKSPACE</div>
          <a className="nav-item active" href="#overview"><LayoutDashboard size={17} /> Tổng quan</a>
          <a className="nav-item" href="#sales"><BarChart3 size={17} /> Doanh thu</a>
          <a className="nav-item" href="#inventory"><Boxes size={17} /> Tồn kho <span className="nav-count">3</span></a>
          <a className="nav-item" href="#orders"><PackageCheck size={17} /> Đơn hàng</a>
          <a className="nav-item" href="#clients"><Users size={17} /> Khách hàng</a>
          <div className="nav-section space-top">TOOLS</div>
          <a className="nav-item" href="#reports"><FileText size={17} /> Báo cáo</a>
          <a className="nav-item" href="#settings"><Settings2 size={17} /> Cài đặt</a>
        </nav>
        <div className="sidebar-footer"><div className="secure-row"><ShieldCheck size={16} /> Dữ liệu được bảo mật</div><div className="user-row"><div className="avatar">AN</div><div><strong>Alex Nguyen</strong><span>Administrator</span></div><ChevronDown size={14} /></div></div>
      </aside>
      {sidebarOpen && <button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Đóng menu" />}

      <section className="main-area">
        <header className="topbar"><button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Mở menu"><Menu size={20} /></button><div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>Tổng quan</strong></div><div className="top-actions"><button className="search-button" aria-label="Tìm kiếm"><Search size={17} /><span>Tìm kiếm</span><kbd>⌘ K</kbd></button><button className="ai-trigger" onClick={() => setChatOpen(true)}><Sparkles size={16} /> Hỏi Vexim AI</button><div className="top-avatar">AN</div></div></header>
        <div className="content" id="overview">
          <div className="page-heading"><div><div className="eyebrow"><span className="live-dot" /> LIVE WORKSPACE <span className="demo-pill">Demo data</span></div><h1>Chào buổi sáng, Alex.</h1><p>Đây là tình hình vận hành của bạn hôm nay.</p></div><div className="heading-actions"><button className="outline-button"><Command size={15} /> Chia sẻ</button><label className="period-select"><Clock3 size={15} /><select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Khoảng thời gian"><option>7 ngày qua</option><option>30 ngày qua</option><option>Quý này</option></select><ChevronDown size={14} /></label></div></div>
          <div className="metrics-grid"><MetricCard icon={CircleDollarSign} label="Doanh thu" value="$128,430" detail="so với kỳ trước" trend="12.5%" /><MetricCard icon={PackageCheck} label="Đơn hàng" value="2,481" detail="so với kỳ trước" trend="8.2%" /><MetricCard icon={Boxes} label="Tồn kho khả dụng" value="94.2%" detail="trên tất cả kênh" trend="2.1%" positive={false} /><MetricCard icon={Users} label="Khách hàng" value="12,846" detail="tổng khách hàng" trend="5.7%" /> </div>
          <div className="dashboard-grid"><section className="panel sales-panel" id="sales"><div className="panel-header"><div><h2>Doanh thu theo ngày</h2><span className="panel-sub">Tổng doanh thu từ tất cả marketplace</span></div><button className="dots">···</button></div><div className="chart"><div className="chart-y"><span>$20k</span><span>$15k</span><span>$10k</span><span>$5k</span><span>$0</span></div><div className="chart-area"><div className="chart-lines"><i /><i /><i /><i /><i /></div><div className="bars">{sales.map((item) => <div className="bar-col" key={item.label}><div className="bar-tooltip">${Math.round(item.value * 190)}k</div><div className="bar" style={{ height: `${item.value}%` }} /><span>{item.label}</span></div>)}</div></div></div></section>
          <section className="panel ai-panel"><div className="panel-header"><div className="ai-title"><span className="ai-icon"><Bot size={17} /></span><div><h2>Vexim AI</h2><span className="panel-sub">Trợ lý vận hành của bạn</span></div></div><span className="status-chip"><span /> Sẵn sàng</span></div><div className="ai-insight"><Sparkles size={18} /><div><strong>Phát hiện 3 cơ hội</strong><p>Tối ưu tồn kho có thể giúp tiết kiệm khoảng <b>$2,840</b> trong tháng này.</p></div></div><button className="ask-button" onClick={() => setChatOpen(true)}>Mở trợ lý AI <MessageSquareText size={15} /></button><div className="ai-suggestions"><span>Gợi ý nhanh</span><button onClick={() => setChatOpen(true)}>Tóm tắt rủi ro hôm nay</button><button onClick={() => setChatOpen(true)}>Kiểm tra doanh thu</button></div></section></div>
          <section className="panel inventory-panel" id="inventory"><div className="panel-header"><div><h2>Tồn kho cần chú ý</h2><span className="panel-sub">Các SKU có rủi ro ảnh hưởng doanh thu</span></div><button className="link-button">Xem tất cả <ArrowUpRight size={15} /></button></div><div className="table-wrap"><table><thead><tr><th>SẢN PHẨM</th><th>KÊNH</th><th>TỒN KHO</th><th>TRẠNG THÁI</th><th /></tr></thead><tbody>{visibleInventory.map((item) => <tr key={item.sku}><td><div className="product-cell"><div className="product-thumb">{item.product.slice(0, 1)}</div><div><strong>{item.product}</strong><span>{item.sku}</span></div></div></td><td><span className="channel">{item.channel}</span></td><td><strong>{item.stock} units</strong></td><td><span className={`status status-${item.tone}`}><span />{item.status}</span></td><td><button className="row-action" onClick={() => setDismissed([...dismissed, item.sku])} aria-label={`Ẩn ${item.product}`}><X size={15} /></button></td></tr>)}</tbody></table></div></section>
          <div className="bottom-grid"><section className="panel activity-panel"><div className="panel-header"><div><h2>Hoạt động gần đây</h2><span className="panel-sub">Cập nhật từ hệ thống</span></div><button className="dots">···</button></div>{['Đồng bộ doanh thu Amazon US hoàn tất', 'Cảnh báo tồn kho được tạo cho VXM-1042', 'Báo cáo tuần đã sẵn sàng'].map((activity, index) => <div className="activity-row" key={activity}><span className={`activity-icon activity-${index}`}><PackageCheck size={14} /></span><div><strong>{activity}</strong><span>{index === 0 ? '2 phút trước' : index === 1 ? '18 phút trước' : '1 giờ trước'}</span></div></div>)}</section><section className="panel health-panel"><div className="panel-header"><div><h2>Sức khỏe hệ thống</h2><span className="panel-sub">Kết nối marketplace</span></div><ShieldCheck size={18} className="health-icon" /></div><div className="health-progress"><div><span>Amazon US</span><strong>Đang hoạt động</strong></div><div className="progress-track"><i style={{ width: '100%' }} /></div></div><div className="health-progress"><div><span>Amazon CA</span><strong>Đang hoạt động</strong></div><div className="progress-track"><i style={{ width: '100%' }} /></div></div></section></div>
        </div>
      </section>
      {chatOpen && <div className="chat-overlay"><section className="chat-panel" aria-label="Trợ lý Vexim AI"><div className="chat-header"><div className="ai-title"><span className="ai-icon"><Bot size={17} /></span><div><strong>Vexim AI</strong><span>Trợ lý vận hành tiếng Việt</span></div></div><button onClick={() => setChatOpen(false)} aria-label="Đóng trợ lý"><X size={18} /></button></div><div className="chat-body">{messages.length === 0 && <div className="chat-welcome"><div className="welcome-orb"><Sparkles size={24} /></div><h3>Tôi có thể giúp gì?</h3><p>Hỏi tôi về doanh thu, tồn kho hoặc các cơ hội tối ưu vận hành.</p><div className="prompt-list"><button onClick={() => handleInputChange({ target: { value: 'Tóm tắt tình hình vận hành hôm nay' } } as React.ChangeEvent<HTMLInputElement>)}>Tóm tắt tình hình hôm nay</button><button onClick={() => handleInputChange({ target: { value: 'Tôi nên ưu tiên xử lý SKU nào?' } } as React.ChangeEvent<HTMLInputElement>)}>SKU nào cần ưu tiên?</button></div></div>}{messages.map((message) => <div className={`chat-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`} key={message.id}><span>{message.role === 'user' ? 'Bạn' : 'AI'}</span><p>{message.parts?.map((part) => part.type === 'text' ? part.text : '').join('')}</p></div>)}{status === 'submitted' || status === 'streaming' ? <div className="typing"><span /><span /><span /></div> : null}{error && <p className="chat-error">Không thể kết nối AI. Vui lòng kiểm tra cấu hình AI Gateway.</p>}</div><form className="chat-form" onSubmit={handleSubmit}><input value={input} onChange={handleInputChange} placeholder="Hỏi Vexim AI..." aria-label="Nhập câu hỏi" /><button type="submit" disabled={status === 'streaming' || !input.trim()} aria-label="Gửi câu hỏi"><Send size={17} /></button></form></section></div>}
    </main>
  )
}
