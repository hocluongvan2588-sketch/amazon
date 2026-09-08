-- ====================================================================
-- VEXIM AMAZON OPERATIONS PLATFORM — SUPABASE SEED DATA
-- Vietnamese Suppliers & Initial Operations State
-- ====================================================================

-- 1. Insert Organization
INSERT INTO public.organizations (id, name, slug, country)
VALUES ('00000000-0000-0000-0000-000000000001', 'Vexim Global Holdings', 'vexim-global', 'VN')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Vietnamese Suppliers
INSERT INTO public.clients (id, organization_id, name, company_name, tax_code, contact_person, email, phone, province, category, service_tier, amazon_seller_id, amazon_store_name, connection_status)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Vinacacao Organics', 'Công ty Cổ phần Vinacacao Việt Nam', '0304892182', 'Nguyễn Văn Hùng (CEO)', 'hung.nguyen@vinacacao.com.vn', '+84 908 123 456', 'Bến Tre / TP.HCM', 'Grocery & Gourmet Food', 'AMAZON_GROWTH', 'A2VN94KAKL90US', 'Vinacacao USA Direct', 'CONNECTED'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'An An Herbal Incense', 'Công ty TNHH Thảo Mộc An An', '2901928374', 'Trần Thị Thu Thảo (Founder)', 'thao.tran@ananherbal.vn', '+84 912 345 678', 'Hà Tĩnh', 'Home & Kitchen / Aromatherapy', 'AMAZON_OPERATIONS', 'A39XLM9812ZZUS', 'An An Natural Aromatics', 'CONNECTED')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Marketplaces
INSERT INTO public.amazon_marketplaces (id, country_code, name, currency, endpoint)
VALUES ('ATVPDKIKX0DER', 'US', 'Amazon.com (US)', 'USD', 'https://sellingpartnerapi-na.amazon.com')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert 9 Users into public.users (Password: Anthai@88)
INSERT INTO public.users (id, email, full_name, role, department, title, phone, can_approve_high_risk, is_active)
VALUES
  ('u1111111-1111-1111-1111-111111111111', 'hocluongvan88@gmail.com', 'Lương Văn Học', 'SUPER_ADMIN', 'Ban Điều Hành & Quản Trị Tối Cao', 'Chief Executive Officer & Super Admin', '+84 988 888 888', TRUE, TRUE),
  ('u2222222-2222-2222-2222-222222222222', 'hocluongvan25@gmail.com', 'Nguyễn Tuấn Anh', 'OPS_MANAGER', 'Ban Quản Trị & Vận Hành Tổng Thể', 'Amazon Operations Director', '+84 925 252 525', TRUE, TRUE),
  ('u3333333-3333-3333-3333-333333333333', 'luonghoangminh88@gmail.com', 'Lương Hoàng Minh', 'PPC_SPECIALIST', 'Team Quảng Cáo & Growth PPC', 'Lead PPC & Growth Engineering Specialist', '+84 988 123 456', FALSE, TRUE),
  ('u4444444-4444-4444-4444-444444444444', 'anhnguyen94@gmail.com', 'Ánh Nguyễn', 'SUPPLY_CHAIN_SPECIALIST', 'Team Kho Vận & Chuỗi Cung Ứng FBA', 'Senior FBA Logistics & 3PL Manager', '+84 994 949 494', FALSE, TRUE),
  ('u5555555-5555-5555-5555-555555555555', 'hocluongvan26@gmail.com', 'Trần Thu Hà', 'BRAND_CS_SPECIALIST', 'Team Listing, CRO & Chăm Sóc Khách Hàng', 'Brand Experience & Listing Optimization Manager', '+84 926 262 626', FALSE, TRUE),
  ('u6666666-6666-6666-6666-666666666666', 'hocluongvan2588@gmail.com', 'Lê Hoàng Nam', 'COMPLIANCE_SPECIALIST', 'Team Pháp Lý, FDA & Soạn Đơn Kháng Cáo POA', 'Head of Amazon Compliance & Policy Counsel', '+84 925 888 888', TRUE, TRUE),
  ('u7777777-7777-7777-7777-777777777777', 'hocluongvan2788@gmail.com', 'Phạm Minh Trang', 'ACCOUNT_EXECUTIVE', 'Team Quản Lý Khách Hàng & Đối Tác', 'Senior Account Executive', '+84 927 888 888', FALSE, TRUE),
  ('u8888888-8888-8888-8888-888888888888', 'hocluongvan22@gmail.com', 'Nguyễn Văn Hùng', 'CLIENT_SUPPLIER', 'Công ty Cổ phần Vinacacao Việt Nam', 'Tổng Giám Đốc (CEO)', '+84 908 123 456', FALSE, TRUE),
  ('u9999999-9999-9999-9999-999999999999', 'hocluongvvan33@gmail.com', 'Trần Thị Thu Thảo', 'CLIENT_SUPPLIER', 'Công ty TNHH Thảo Mộc An An', 'Nhà Sáng Lập (Founder)', '+84 912 345 678', FALSE, TRUE)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  title = EXCLUDED.title,
  phone = EXCLUDED.phone,
  can_approve_high_risk = EXCLUDED.can_approve_high_risk;
