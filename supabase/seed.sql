-- ====================================================================
-- VEXIM AMAZON OPERATIONS PLATFORM — SUPABASE SEED DATA
-- Vietnamese Suppliers & Initial Operations State
-- ====================================================================

-- 1. Insert Organization
INSERT INTO organizations (id, name, slug, country)
VALUES ('00000000-0000-0000-0000-000000000001', 'Vexim Global Holdings', 'vexim-global', 'VN')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Vietnamese Suppliers
INSERT INTO clients (id, organization_id, name, company_name, tax_code, contact_person, email, phone, province, category, service_tier, amazon_seller_id, amazon_store_name, connection_status)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Vinacacao Organics', 'Công ty Cổ phần Vinacacao Việt Nam', '0304892182', 'Nguyễn Văn Hùng (CEO)', 'hung.nguyen@vinacacao.com.vn', '+84 908 123 456', 'Bến Tre / TP.HCM', 'Grocery & Gourmet Food', 'AMAZON_GROWTH', 'A2VN94KAKL90US', 'Vinacacao USA Direct', 'CONNECTED'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'An An Herbal Incense', 'Công ty TNHH Thảo Mộc An An', '2901928374', 'Trần Thị Thu Thảo (Founder)', 'thao.tran@ananherbal.vn', '+84 912 345 678', 'Hà Tĩnh', 'Home & Kitchen / Aromatherapy', 'AMAZON_OPERATIONS', 'A39XLM9812ZZUS', 'An An Natural Aromatics', 'CONNECTED'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Lotus Craft Vietnam', 'Hợp tác xã Mây Tre Đan Sen Việt', '0109283746', 'Lê Hoàng Nam (GĐ)', 'nam.le@lotuscraft.vn', '+84 983 222 333', 'Hà Nội / Ninh Bình', 'Kitchen & Dining / Eco Home', 'AMAZON_OPERATIONS', 'A18BBN4545LKUS', 'Lotus Craft Eco Kitchen', 'CONNECTED'),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'Highlands Cashew Co.', 'Công ty TNHH Chế Biến Hạt Tây Nguyên', '3700984512', 'Phạm Minh Đức (Xuất Khẩu)', 'duc.pham@highlandscashew.com', '+84 903 888 999', 'Bình Phước / Đắk Lắk', 'Grocery & Gourmet Food', 'AMAZON_LAUNCH', 'A2HIGH992811US', 'Highlands Cashew US Store', 'CONNECTED')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Marketplaces
INSERT INTO amazon_marketplaces (id, country_code, name, currency, endpoint)
VALUES ('ATVPDKIKX0DER', 'US', 'Amazon.com (US)', 'USD', 'https://sellingpartnerapi-na.amazon.com')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Products
INSERT INTO products (id, client_id, sku, asin, fnsku, upc, title, brand, category, price, cogs, fba_fee_estimated, estimated_margin_pct, status, readiness_score)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'VXM-COCOA-70DK', 'B0DC89X102', 'X00389102A', '893601234001', 'Vinacacao Pure Single Origin 70% Dark Chocolate Bar (Ben Tre, Vietnam) — 3.5oz Pack of 4', 'Vinacacao', 'Grocery & Gourmet Food', 24.99, 6.20, 4.85, 40.80, 'ACTIVE', 94),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'VXM-COCOA-PWD500', 'B0DD34Y205', 'X00490219B', '893601234002', 'Vinacacao Premium 100% Pure Cocoa Powder for Baking & Smoothies — 17.6oz (500g)', 'Vinacacao', 'Grocery & Gourmet Food', 16.99, 3.80, 3.95, 39.40, 'ACTIVE', 89),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'VXM-INC-AGAR100', 'B0EE89A901', 'X00551122C', '893809112001', 'An An Natural Vietnamese Agarwood Incense Sticks (Oud) for Meditation — 100 Sticks', 'An An Herbal', 'Home & Kitchen', 19.99, 3.10, 3.45, 52.20, 'ACTIVE', 91)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Inventory
INSERT INTO inventory (client_id, sku, asin, title, fba_available, fba_reserved, fba_inbound, daily_velocity_7d, daily_velocity_30d, days_of_supply, supplier_lead_time_days, risk_level, recommended_reorder_qty)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'VXM-COCOA-70DK', 'B0DC89X102', 'Vinacacao 70% Dark Chocolate Bar (Pack of 4)', 168, 24, 400, 14.20, 12.80, 11.80, 32, 'CRITICAL', 1200),
  ('11111111-1111-1111-1111-111111111111', 'VXM-COCOA-PWD500', 'B0DD34Y205', 'Vinacacao 100% Pure Cocoa Powder 500g', 340, 18, 250, 18.50, 16.00, 18.40, 30, 'HIGH', 800),
  ('22222222-2222-2222-2222-222222222222', 'VXM-INC-AGAR100', 'B0EE89A901', 'An An Natural Agarwood Incense 100s', 280, 12, 300, 11.20, 9.50, 25.00, 28, 'MEDIUM', 600);

-- 6. Insert AI Recommendations (Section 20, 31)
INSERT INTO ai_recommendations (client_id, agent_type, entity_type, entity_id, entity_identifier, title, description, reason, confidence_score, priority, risk_level, proposed_action, expected_impact, status)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'INVENTORY', 'INVENTORY', 'inv-01', 'VXM-COCOA-70DK (B0DC89X102)', 'Cảnh báo hết hàng FBA trong 11.8 ngày — Cần phê duyệt PO bổ sung 1,200 units', 'Tồn kho FBA hiện chỉ còn 168 units trong khi lead time biển từ Việt Nam cần 32 ngày.', 'Nếu không tạo PO ngay hôm nay, sản phẩm sẽ đứt hàng vào ngày 19/09 làm tụt hạng BSR.', 96, 'CRITICAL', 'HIGH', 'Tạo PO 1,200 units (900 sea + 300 air express cứu nguy).', 'Ngăn ngừa thất thoát ~$8,850 doanh thu và bảo vệ Organic Ranking BSR.', 'PENDING_APPROVAL'),
  ('11111111-1111-1111-1111-111111111111', 'PPC', 'KEYWORD', 'kw-02', 'SP_DarkChoc_Broad (cheap dark candy bar)', 'Giảm 35% bid từ khóa lãng phí ngân sách (ACOS 88.03% vs Target 28%)', 'Từ khóa broad tiêu $88 trong 7 ngày chỉ mang lại $99 doanh thu.', 'Khách tìm cheap kẹo $1-2 không phù hợp với phân khúc socola $24.99.', 94, 'HIGH', 'LOW', 'Giảm bid từ $0.85 xuống $0.55 và thêm negative keyword.', 'Tiết kiệm ~$180/tháng ngân sách quảng cáo không hiệu quả.', 'PENDING_APPROVAL');

-- ====================================================================
-- ====================================================================
-- 7. INSERT 9 OFFICIAL VEXIM & SUPPLIER TEAM ACCOUNTS
-- Password for all accounts: Anthai@88
-- ====================================================================

INSERT INTO users (id, email, full_name, role, organization_id, status)
VALUES
  ('u1111111-1111-1111-1111-111111111111', 'hocluongvan88@gmail.com', 'Lương Văn Học (Master Super Admin)', 'SUPER_ADMIN', '00000000-0000-0000-0000-000000000001', 'ACTIVE'),
  ('u2222222-2222-2222-2222-222222222222', 'hocluongvan25@gmail.com', 'Nguyễn Tuấn Anh (Operations Director)', 'OPS_MANAGER', '00000000-0000-0000-0000-000000000001', 'ACTIVE'),
  ('u3333333-3333-3333-3333-333333333333', 'luonghoangminh88@gmail.com', 'Lương Hoàng Minh (PPC Lead)', 'PPC_SPECIALIST', '00000000-0000-0000-0000-000000000001', 'ACTIVE'),
  ('u4444444-4444-4444-4444-444444444444', 'anhnguyen94@gmail.com', 'Ánh Nguyễn (Logistics Hub)', 'SUPPLY_CHAIN_SPECIALIST', '00000000-0000-0000-0000-000000000001', 'ACTIVE'),
  ('u5555555-5555-5555-5555-555555555555', 'hocluongvan26@gmail.com', 'Trần Thu Hà (Brand & CS Lead)', 'BRAND_CS_SPECIALIST', '00000000-0000-0000-0000-000000000001', 'ACTIVE'),
  ('u6666666-6666-6666-6666-666666666666', 'hocluongvan2588@gmail.com', 'Lê Hoàng Nam (Legal & FDA Counsel)', 'COMPLIANCE_SPECIALIST', '00000000-0000-0000-0000-000000000001', 'ACTIVE'),
  ('u7777777-7777-7777-7777-777777777777', 'hocluongvan2788@gmail.com', 'Phạm Minh Trang (Senior AE)', 'ACCOUNT_EXECUTIVE', '00000000-0000-0000-0000-000000000001', 'ACTIVE'),
  ('u8888888-8888-8888-8888-888888888888', 'hocluongvan22@gmail.com', 'Nguyễn Văn Hùng (CEO Vinacacao USA Direct)', 'CLIENT_SUPPLIER', '00000000-0000-0000-0000-000000000001', 'ACTIVE'),
  ('u9999999-9999-9999-9999-999999999999', 'hocluongvvan33@gmail.com', 'Trần Thị Thu Thảo (Founder Thảo Mộc An An)', 'CLIENT_SUPPLIER', '00000000-0000-0000-0000-000000000001', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;