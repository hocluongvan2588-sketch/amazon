-- ====================================================================
-- VEXIM — RLS FIX (42P17 infinite recursion) + DEMO-MODE ACCESS + SEED
-- Migration: 20260910_rls_fix_and_seed.sql
-- Chạy file này trong Supabase Dashboard → SQL Editor → Run (idempotent,
-- chạy lại nhiều lần không sao).
--
-- FIX 1: Bảng public.users bị lỗi "infinite recursion detected in policy"
--        vì policy super_admin_all_users tự query chính bảng users.
--        -> DROP 3 policy cũ, tạo policy demo-mode không đệ quy.
--
-- FIX 2: Các policy cũ dùng auth.jwt() (Supabase Auth) trong khi app Vexim
--        đăng nhập ở tầng ứng dụng (không dùng Supabase Auth) nên anonymous
--        key đọc được 0 dòng. -> Tạo policy 'vexim_demo_full_access' cho
--        TO anon, authenticated. Đây là chế độ DEMO NỘI BỘ. Trước khi lên
--        production, PHẢI thay bằng policy multi-tenant theo auth.jwt().
--
-- SEED : Dữ liệu nền (idempotent ON CONFLICT): tổ chức, 2 nhà cung cấp,
--        9 tài khoản nhân sự, sản phẩm, tồn kho, bảng giá cước 4 hãng tàu,
--        1 vận đơn inbound mẫu, biểu thuế HS 1805.00.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. XÓA CÁC POLICY CŨ GÂY CHẶN / ĐỆ QUY
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS super_admin_all_users ON public.users;
DROP POLICY IF EXISTS user_read_own_profile ON public.users;
DROP POLICY IF EXISTS user_update_own_profile ON public.users;

DROP POLICY IF EXISTS client_isolation_policy ON public.clients;
DROP POLICY IF EXISTS product_isolation_policy ON public.products;
DROP POLICY IF EXISTS inventory_isolation_policy ON public.inventory;
DROP POLICY IF EXISTS recs_isolation_policy ON public.ai_recommendations;

DROP POLICY IF EXISTS "Allow authenticated users to read freight rates" ON public.freight_rate_cards;
DROP POLICY IF EXISTS "Allow authenticated users to read shipments" ON public.inbound_shipments;
DROP POLICY IF EXISTS "Allow authenticated users to read tariff matrix" ON public.customs_tariff_matrix;

-- --------------------------------------------------------------------
-- 2. POLICY DEMO-MODE (anon + authenticated = full access)
--    Lưu ý production: thay bằng policy tenant-isolation theo auth.jwt()
-- --------------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'organizations','clients','users','amazon_marketplaces','amazon_accounts',
    'products','product_documents','product_compliance','amazon_listings',
    'inventory','orders','advertising_campaigns','advertising_keywords',
    'customer_inquiries','promotions','ai_recommendations','tasks',
    'activity_logs','sync_jobs','client_reports',
    'freight_rate_cards','inbound_shipments','shipment_carton_manifests',
    'forwarder_tracking_events','customs_tariff_matrix'
  ]
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS vexim_demo_full_access ON public.%I', t);
      EXECUTE format(
        'CREATE POLICY vexim_demo_full_access ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)',
        t
      );
    END IF;
  END LOOP;
END $$;

-- --------------------------------------------------------------------
-- 3. SEED: TỔ CHỨC + 2 NHÀ CUNG CẤP VIỆT NAM
-- --------------------------------------------------------------------
INSERT INTO public.organizations (id, name, slug, country)
VALUES ('00000000-0000-0000-0000-000000000001', 'Vexim Global Holdings', 'vexim-global', 'VN')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.clients (id, organization_id, name, company_name, tax_code, contact_person, email, phone, province, category, service_tier, amazon_seller_id, amazon_store_name, connection_status)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Vinacacao Organics', 'Công ty Cổ phần Vinacacao Việt Nam', '0304892182', 'Nguyễn Văn Hùng (CEO)', 'hung.nguyen@vinacacao.com.vn', '+84 908 123 456', 'Bến Tre / TP.HCM', 'Grocery & Gourmet Food', 'AMAZON_GROWTH', 'A2VN94KAKL90US', 'Vinacacao USA Direct', 'CONNECTED'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'An An Herbal Incense', 'Công ty TNHH Thảo Mộc An An', '2901928374', 'Trần Thị Thu Thảo (Founder)', 'thao.tran@ananherbal.vn', '+84 912 345 678', 'Hà Tĩnh', 'Home & Kitchen / Aromatherapy', 'AMAZON_OPERATIONS', 'A39XLM9812ZZUS', 'An An Natural Aromatics', 'CONNECTED')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.amazon_marketplaces (id, country_code, name, currency, endpoint)
VALUES ('ATVPDKIKX0DER', 'US', 'Amazon.com (US)', 'USD', 'https://sellingpartnerapi-na.amazon.com')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------
-- 4. SEED: 9 TÀI KHOẢN NHÂN SỰ (mật khẩu auth do migration 20260908 lo)
-- --------------------------------------------------------------------
INSERT INTO public.users (id, organization_id, client_id, email, full_name, role, department, title, phone, can_approve_high_risk, is_active)
VALUES
  ('b1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', NULL, 'hocluongvan88@gmail.com', 'Lương Văn Học', 'SUPER_ADMIN', 'Ban Điều Hành & Quản Trị Tối Cao', 'Chief Executive Officer & Super Admin', '+84 988 888 888', TRUE, TRUE),
  ('b2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', NULL, 'hocluongvan25@gmail.com', 'Nguyễn Tuấn Anh', 'OPS_MANAGER', 'Ban Quản Trị & Vận Hành Tổng Thể', 'Amazon Operations Director', '+84 925 252 525', TRUE, TRUE),
  ('b3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', NULL, 'luonghoangminh88@gmail.com', 'Lương Hoàng Minh', 'PPC_SPECIALIST', 'Team Quảng Cáo & Growth PPC', 'Lead PPC & Growth Engineering Specialist', '+84 988 123 456', FALSE, TRUE),
  ('b4444444-4444-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', NULL, 'anhnguyen94@gmail.com', 'Ánh Nguyễn', 'SUPPLY_CHAIN_SPECIALIST', 'Team Kho Vận & Chuỗi Cung Ứng FBA', 'Senior FBA Logistics & 3PL Manager', '+84 994 949 494', FALSE, TRUE),
  ('b5555555-5555-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', NULL, 'hocluongvan26@gmail.com', 'Trần Thu Hà', 'BRAND_CS_SPECIALIST', 'Team Listing, CRO & Chăm Sóc Khách Hàng', 'Brand Experience & Listing Optimization Manager', '+84 926 262 626', FALSE, TRUE),
  ('b6666666-6666-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', NULL, 'hocluongvan2588@gmail.com', 'Lê Hoàng Nam', 'COMPLIANCE_SPECIALIST', 'Team Pháp Lý, FDA & Soạn Đơn Kháng Cáo POA', 'Head of Amazon Compliance & Policy Counsel', '+84 925 888 888', TRUE, TRUE),
  ('b7777777-7777-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', NULL, 'hocluongvan2788@gmail.com', 'Phạm Minh Trang', 'ACCOUNT_EXECUTIVE', 'Team Quản Lý Khách Hàng & Đối Tác', 'Senior Account Executive', '+84 927 888 888', FALSE, TRUE),
  ('b8888888-8888-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'hocluongvan22@gmail.com', 'Nguyễn Văn Hùng', 'CLIENT_SUPPLIER', 'Công ty Cổ phần Vinacacao Việt Nam', 'Tổng Giám Đốc (CEO)', '+84 908 123 456', FALSE, TRUE),
  ('b9999999-9999-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'hocluongvvan33@gmail.com', 'Trần Thị Thu Thảo', 'CLIENT_SUPPLIER', 'Công ty TNHH Thảo Mộc An An', 'Nhà Sáng Lập (Founder)', '+84 912 345 678', FALSE, TRUE)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  title = EXCLUDED.title,
  phone = EXCLUDED.phone,
  client_id = EXCLUDED.client_id,
  can_approve_high_risk = EXCLUDED.can_approve_high_risk,
  is_active = EXCLUDED.is_active;

-- --------------------------------------------------------------------
-- 5. SEED: SẢN PHẨM (3 SKU chủ lực)
-- --------------------------------------------------------------------
INSERT INTO public.products (id, client_id, sku, asin, fnsku, upc, title, brand, category, sub_category, main_image, price, cogs, fba_fee_estimated, referral_fee_estimated, estimated_margin_pct, weight_lbs, dimensions_inches, status, readiness_score)
VALUES
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'VXM-COCOA-70DK', 'B0DC89X102', 'X00389102A', '893601234001',
   'Vinacacao Pure Single Origin 70% Dark Chocolate Bar (Ben Tre, Vietnam) — 3.5oz Pack of 4', 'Vinacacao', 'Grocery & Gourmet Food', 'Candy & Chocolate Bars',
   'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=80',
   24.99, 6.20, 4.85, 3.75, 40.80, 0.95, '{"length": 7.2, "width": 3.6, "height": 1.8}'::jsonb, 'ACTIVE', 94),
  ('a2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'VXM-COCOA-PWD500', 'B0DD34Y205', 'X00490219B', '893601234002',
   'Vinacacao Premium 100% Pure Cocoa Powder for Baking & Smoothies — 17.6oz (500g)', 'Vinacacao', 'Grocery & Gourmet Food', 'Cocoa Powder',
   'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80',
   16.99, 3.80, 3.95, 2.55, 39.40, 1.18, '{"length": 8.5, "width": 5.5, "height": 2.2}'::jsonb, 'ACTIVE', 89),
  ('a3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'VXM-INC-AGAR100', 'B0EE89A901', 'X00551122C', '893809112001',
   'An An Natural Vietnamese Agarwood Incense Sticks (Oud) for Meditation & Yoga — 100 Sticks, 8.5 Inch', 'An An Herbal', 'Home & Kitchen', 'Incense Sticks',
   'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=80',
   19.99, 3.10, 3.45, 3.00, 52.20, 0.45, '{"length": 9.0, "width": 2.2, "height": 1.5}'::jsonb, 'ACTIVE', 91)
ON CONFLICT (client_id, sku) DO NOTHING;

-- --------------------------------------------------------------------
-- 6. SEED: TỒN KHO FBA (nguồn sự thật duy nhất mới cho Supply Chain Hub)
-- --------------------------------------------------------------------
INSERT INTO public.inventory (id, client_id, sku, asin, title, fba_available, fba_reserved, fba_inbound, daily_velocity_7d, daily_velocity_30d, days_of_supply, supplier_lead_time_days, reorder_point_units, risk_level, recommended_reorder_qty, estimated_stockout_date, last_restocked_at)
VALUES
  ('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'VXM-COCOA-70DK', 'B0DC89X102', 'Vinacacao 70% Dark Chocolate Bar (Pack of 4)',
   168, 24, 400, 14.2, 12.8, 11.8, 32, 500, 'CRITICAL', 1200, '2026-09-19', '2026-08-10'),
  ('c2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'VXM-COCOA-PWD500', 'B0DD34Y205', 'Vinacacao 100% Pure Cocoa Powder 500g',
   340, 18, 250, 18.5, 16.0, 18.4, 30, 580, 'HIGH', 800, '2026-09-26', '2026-08-18'),
  ('c3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'VXM-INC-AGAR100', 'B0EE89A901', 'An An Natural Agarwood Incense 100s',
   280, 12, 300, 11.2, 9.5, 25.0, 28, 340, 'MEDIUM', 600, '2026-10-02', '2026-08-25')
ON CONFLICT (id) DO UPDATE SET
  fba_available = EXCLUDED.fba_available,
  fba_reserved = EXCLUDED.fba_reserved,
  fba_inbound = EXCLUDED.fba_inbound,
  daily_velocity_7d = EXCLUDED.daily_velocity_7d,
  daily_velocity_30d = EXCLUDED.daily_velocity_30d,
  days_of_supply = EXCLUDED.days_of_supply,
  risk_level = EXCLUDED.risk_level,
  estimated_stockout_date = EXCLUDED.estimated_stockout_date,
  updated_at = NOW();

-- --------------------------------------------------------------------
-- 7. SEED: BẢNG GIÁ CƯỚC 4 HÃNG TÀU (thay DEFAULT_RATE_CARDS hardcode)
-- --------------------------------------------------------------------
INSERT INTO public.freight_rate_cards (id, carrier_partner_name, transport_mode, origin_port, destination_port, rate_per_cbm_usd, rate_per_kg_usd, rate_per_container_usd, fuel_surcharge_percent, documentation_fee_usd, drayage_est_usd, estimated_transit_days, customs_clearance_days_est, valid_until, is_active)
VALUES
  ('d1111111-1111-1111-1111-111111111111', 'Kerry / Flexport Ocean LCL', 'OCEAN_LCL', 'Cát Lái (HCMC)', 'Los Angeles (LAX / LGB)', 115.00, NULL, NULL, 8.5, 65, 180, 24, 4, '2026-12-31', TRUE),
  ('d2222222-2222-2222-2222-222222222222', 'Maersk / ONE FCL 40HC Direct', 'OCEAN_FCL_40HC', 'Cát Lái (HCMC)', 'Long Beach (LGB)', NULL, NULL, 4850.00, 12.0, 95, 450, 21, 3, '2026-12-31', TRUE),
  ('d3333333-3333-3333-3333-333333333333', 'Unifa / Expeditors Ocean LCL', 'OCEAN_LCL', 'Hải Phòng (HPH)', 'Los Angeles (LAX)', 125.00, NULL, NULL, 8.5, 65, 180, 26, 4, '2026-12-31', TRUE),
  ('d4444444-4444-1111-1111-111111111111', 'DHL Express / FedEx Priority', 'AIR_EXPRESS', 'Tân Sơn Nhất (SGN)', 'Ontario Airport (ONT/LAX)', NULL, 7.20, NULL, 16.0, 35, 0, 5, 1, '2026-12-31', TRUE)
ON CONFLICT (id) DO UPDATE SET
  rate_per_cbm_usd = EXCLUDED.rate_per_cbm_usd,
  rate_per_kg_usd = EXCLUDED.rate_per_kg_usd,
  rate_per_container_usd = EXCLUDED.rate_per_container_usd,
  fuel_surcharge_percent = EXCLUDED.fuel_surcharge_percent,
  documentation_fee_usd = EXCLUDED.documentation_fee_usd,
  drayage_est_usd = EXCLUDED.drayage_est_usd,
  estimated_transit_days = EXCLUDED.estimated_transit_days,
  valid_until = EXCLUDED.valid_until,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- --------------------------------------------------------------------
-- 8. SEED: 1 VẬN ĐƠN INBOUND MẪU (Cocoa Powder 500g, 800 units)
-- --------------------------------------------------------------------
INSERT INTO public.inbound_shipments (id, client_id, shipment_code, fba_shipment_id, status, transport_mode, origin_factory_address, origin_port, destination_port, destination_fba_hub, forwarder_name, bill_of_lading_number, total_units, total_cartons, total_gross_weight_kg, total_cbm, chargeable_weight_kg, total_fob_value_usd, total_freight_cost_usd, total_landed_cost_usd, landed_cost_per_unit_usd, etd_date, eta_date)
VALUES
  ('e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'VXM-SHP-2026-001', 'FBA18VEXIM0902', 'BOOKED', 'OCEAN_LCL',
   'Xưởng đóng gói Vinacacao, KP3, Bình Đại, Bến Tre', 'Cát Lái (HCMC)', 'Los Angeles (LAX / LGB)', 'ONT8',
   'Kerry / Flexport Ocean LCL', 'KRY-VNM-LAX-8801',
   800, 34, 452.0, 1.020, 1020.0, 3040.00, 460.81, 3500.81, 4.38, '2026-09-15', '2026-10-09')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.shipment_carton_manifests (shipment_id, product_id, sku, fnsku, units_per_carton, carton_count, total_units, fob_unit_cost_usd, carton_length_cm, carton_width_cm, carton_height_cm, carton_weight_kg, cbm_per_carton, total_cbm)
SELECT 'e1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'VXM-COCOA-PWD500', 'X00490219B', 24, 34, 800, 3.80, 40.0, 30.0, 25.0, 13.30, 0.030, 1.020
WHERE NOT EXISTS (SELECT 1 FROM public.shipment_carton_manifests WHERE shipment_id = 'e1111111-1111-1111-1111-111111111111');

-- --------------------------------------------------------------------
-- 9. SEED: BIỂU THUẾ HS 1805.00 (Cocoa powder — US import matrix)
-- --------------------------------------------------------------------
INSERT INTO public.customs_tariff_matrix (hs_code_6digit, hts_us_code_10digit, product_category, mfn_general_rate_percent, section_301_tariff_percent, gsp_status, fda_prior_notice_required, usda_aphis_required, prop65_warning_required)
SELECT v.* FROM (VALUES
  ('1805.00', '1805.00.0030', 'Cocoa Powder, Unsweetened (Vinacacao PWD500)', 0.00, 0.00, 'NOT_ELIGIBLE', TRUE, FALSE, FALSE),
  ('1806.32', '1806.32.0053', 'Chocolate Bars, Filled/Unfilled (Vinacacao 70DK)', 5.60, 0.00, 'NOT_ELIGIBLE', TRUE, FALSE, FALSE)
) AS v(hs_code_6digit, hts_us_code_10digit, product_category, mfn_general_rate_percent, section_301_tariff_percent, gsp_status, fda_prior_notice_required, usda_aphis_required, prop65_warning_required)
WHERE NOT EXISTS (SELECT 1 FROM public.customs_tariff_matrix WHERE hs_code_6digit = v.hs_code_6digit);

-- ====================================================================
-- KIỂM TRA SAU KHI CHẠY: (SQL Editor)
--   SELECT count(*) FROM public.users;                -- 9
--   SELECT count(*) FROM public.products;             -- 3
--   SELECT carrier_partner_name FROM public.freight_rate_cards;  -- 4 hãng tàu
--   SELECT shipment_code, bill_of_lading_number FROM public.inbound_shipments;
-- ====================================================================
