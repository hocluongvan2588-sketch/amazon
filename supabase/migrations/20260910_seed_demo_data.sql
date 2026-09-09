-- ====================================================================
-- VEXIM — SEED DỮ LIỆU NỀN (TUỲ CHỌN, KHÔNG THỂ FAIL HARD)
-- Migration: 20260910_seed_demo_data.sql
--
-- Chạy SAU 20260910_rls_fix.sql. Mỗi section được bọc trong block
-- BEGIN...EXCEPTION: nếu section nào lỗi (schema khác biệt, dữ liệu
-- trùng, FK thiếu...), script CHỈ RA NOTICE rồi chạy tiếp section sau.
-- Toàn bộ seed dùng guard WHERE NOT EXISTS nên chạy lại không trùng.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. TỔ CHỨC + 2 NHÀ CUNG CẤP + MARKETPLACE
-- --------------------------------------------------------------------
DO $$
BEGIN
  INSERT INTO public.organizations (id, name, slug, country)
  SELECT '00000000-0000-0000-0000-000000000001', 'Vexim Global Holdings', 'vexim-global', 'VN'
  WHERE NOT EXISTS (SELECT 1 FROM public.organizations WHERE id = '00000000-0000-0000-0000-000000000001');

  INSERT INTO public.clients (id, organization_id, name, company_name, tax_code, contact_person, email, phone, province, category, service_tier, amazon_seller_id, amazon_store_name, connection_status)
  SELECT * FROM (VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Vinacacao Organics', 'Công ty Cổ phần Vinacacao Việt Nam', '0304892182', 'Nguyễn Văn Hùng (CEO)', 'hung.nguyen@vinacacao.com.vn', '+84 908 123 456', 'Bến Tre / TP.HCM', 'Grocery & Gourmet Food', 'AMAZON_GROWTH', 'A2VN94KAKL90US', 'Vinacacao USA Direct', 'CONNECTED'),
    ('22222222-2222-2222-2222-222222222222'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'An An Herbal Incense', 'Công ty TNHH Thảo Mộc An An', '2901928374', 'Trần Thị Thu Thảo (Founder)', 'thao.tran@ananherbal.vn', '+84 912 345 678', 'Hà Tĩnh', 'Home & Kitchen / Aromatherapy', 'AMAZON_OPERATIONS', 'A39XLM9812ZZUS', 'An An Natural Aromatics', 'CONNECTED')
  ) AS v(id, organization_id, name, company_name, tax_code, contact_person, email, phone, province, category, service_tier, amazon_seller_id, amazon_store_name, connection_status)
  WHERE NOT EXISTS (SELECT 1 FROM public.clients c WHERE c.id = v.id);

  INSERT INTO public.amazon_marketplaces (id, country_code, name, currency, endpoint)
  SELECT 'ATVPDKIKX0DER', 'US', 'Amazon.com (US)', 'USD', 'https://sellingpartnerapi-na.amazon.com'
  WHERE NOT EXISTS (SELECT 1 FROM public.amazon_marketplaces WHERE id = 'ATVPDKIKX0DER');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '[Vexim Seed 1] Bo qua (clients/marketplace): %', SQLERRM;
END $$;

-- --------------------------------------------------------------------
-- 2. 9 TÀI KHOẢN NHÂN SỰ (guard theo email — không phụ thuộc constraint)
--    Mật khẩu đăng nhập auth do migration 20260908 đảm nhiệm (Anthai@88)
-- --------------------------------------------------------------------
DO $$
BEGIN
  INSERT INTO public.users (id, organization_id, client_id, email, full_name, role, department, title, phone, can_approve_high_risk, is_active)
  SELECT v.id, v.organization_id, v.client_id, v.email, v.full_name, v.role::user_role_enum, v.department, v.title, v.phone, v.can_approve_high_risk, v.is_active
  FROM (VALUES
    ('b1111111-1111-1111-1111-111111111111'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, NULL::uuid, 'hocluongvan88@gmail.com', 'Lương Văn Học', 'SUPER_ADMIN', 'Ban Điều Hành & Quản Trị Tối Cao', 'Chief Executive Officer & Super Admin', '+84 988 888 888', TRUE, TRUE),
    ('b2222222-2222-2222-2222-222222222222'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, NULL::uuid, 'hocluongvan25@gmail.com', 'Nguyễn Tuấn Anh', 'OPS_MANAGER', 'Ban Quản Trị & Vận Hành Tổng Thể', 'Amazon Operations Director', '+84 925 252 525', TRUE, TRUE),
    ('b3333333-3333-3333-3333-333333333333'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, NULL::uuid, 'luonghoangminh88@gmail.com', 'Lương Hoàng Minh', 'PPC_SPECIALIST', 'Team Quảng Cáo & Growth PPC', 'Lead PPC & Growth Engineering Specialist', '+84 988 123 456', FALSE, TRUE),
    ('b4444444-4444-1111-1111-111111111111'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, NULL::uuid, 'anhnguyen94@gmail.com', 'Ánh Nguyễn', 'SUPPLY_CHAIN_SPECIALIST', 'Team Kho Vận & Chuỗi Cung Ứng FBA', 'Senior FBA Logistics & 3PL Manager', '+84 994 949 494', FALSE, TRUE),
    ('b5555555-5555-1111-1111-111111111111'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, NULL::uuid, 'hocluongvan26@gmail.com', 'Trần Thu Hà', 'BRAND_CS_SPECIALIST', 'Team Listing, CRO & Chăm Sóc Khách Hàng', 'Brand Experience & Listing Optimization Manager', '+84 926 262 626', FALSE, TRUE),
    ('b6666666-6666-1111-1111-111111111111'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, NULL::uuid, 'hocluongvan2588@gmail.com', 'Lê Hoàng Nam', 'COMPLIANCE_SPECIALIST', 'Team Pháp Lý, FDA & Soạn Đơn Kháng Cáo POA', 'Head of Amazon Compliance & Policy Counsel', '+84 925 888 888', TRUE, TRUE),
    ('b7777777-7777-1111-1111-111111111111'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, NULL::uuid, 'hocluongvan2788@gmail.com', 'Phạm Minh Trang', 'ACCOUNT_EXECUTIVE', 'Team Quản Lý Khách Hàng & Đối Tác', 'Senior Account Executive', '+84 927 888 888', FALSE, TRUE),
    ('b8888888-8888-1111-1111-111111111111'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'hocluongvan22@gmail.com', 'Nguyễn Văn Hùng', 'CLIENT_SUPPLIER', 'Công ty Cổ phần Vinacacao Việt Nam', 'Tổng Giám Đốc (CEO)', '+84 908 123 456', FALSE, TRUE),
    ('b9999999-9999-1111-1111-111111111111'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'hocluongvvan33@gmail.com', 'Trần Thị Thu Thảo', 'CLIENT_SUPPLIER', 'Công ty TNHH Thảo Mộc An An', 'Nhà Sáng Lập (Founder)', '+84 912 345 678', FALSE, TRUE)
  ) AS v(id, organization_id, client_id, email, full_name, role, department, title, phone, can_approve_high_risk, is_active)
  WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.email = v.email);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '[Vexim Seed 2] Bo qua (users): %', SQLERRM;
END $$;

-- --------------------------------------------------------------------
-- 3. SẢN PHẨM (guard theo client_id + sku)
-- --------------------------------------------------------------------
DO $$
BEGIN
  INSERT INTO public.products (id, client_id, sku, asin, fnsku, upc, title, brand, category, sub_category, main_image, price, cogs, fba_fee_estimated, referral_fee_estimated, estimated_margin_pct, weight_lbs, dimensions_inches, status, readiness_score)
  SELECT v.id, v.client_id, v.sku, v.asin, v.fnsku, v.upc, v.title, v.brand, v.category, v.sub_category, v.main_image, v.price, v.cogs, v.fba_fee_estimated, v.referral_fee_estimated, v.estimated_margin_pct, v.weight_lbs, v.dimensions_inches::jsonb, v.status, v.readiness_score
  FROM (VALUES
    ('a1111111-1111-1111-1111-111111111111'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'VXM-COCOA-70DK', 'B0DC89X102', 'X00389102A', '893601234001',
     'Vinacacao Pure Single Origin 70% Dark Chocolate Bar (Ben Tre, Vietnam) — 3.5oz Pack of 4', 'Vinacacao', 'Grocery & Gourmet Food', 'Candy & Chocolate Bars',
     'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=80',
     24.99, 6.20, 4.85, 3.75, 40.80, 0.95, '{"length": 7.2, "width": 3.6, "height": 1.8}', 'ACTIVE', 94),
    ('a2222222-2222-2222-2222-222222222222'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'VXM-COCOA-PWD500', 'B0DD34Y205', 'X00490219B', '893601234002',
     'Vinacacao Premium 100% Pure Cocoa Powder for Baking & Smoothies — 17.6oz (500g)', 'Vinacacao', 'Grocery & Gourmet Food', 'Cocoa Powder',
     'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80',
     16.99, 3.80, 3.95, 2.55, 39.40, 1.18, '{"length": 8.5, "width": 5.5, "height": 2.2}', 'ACTIVE', 89),
    ('a3333333-3333-3333-3333-333333333333'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'VXM-INC-AGAR100', 'B0EE89A901', 'X00551122C', '893809112001',
     'An An Natural Vietnamese Agarwood Incense Sticks (Oud) for Meditation & Yoga — 100 Sticks, 8.5 Inch', 'An An Herbal', 'Home & Kitchen', 'Incense Sticks',
     'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=80',
     19.99, 3.10, 3.45, 3.00, 52.20, 0.45, '{"length": 9.0, "width": 2.2, "height": 1.5}', 'ACTIVE', 91)
  ) AS v(id, client_id, sku, asin, fnsku, upc, title, brand, category, sub_category, main_image, price, cogs, fba_fee_estimated, referral_fee_estimated, estimated_margin_pct, weight_lbs, dimensions_inches, status, readiness_score)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.products p WHERE p.client_id = v.client_id AND p.sku = v.sku
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '[Vexim Seed 3] Bo qua (products): %', SQLERRM;
END $$;

-- --------------------------------------------------------------------
-- 4. TỒN KHO FBA (guard theo sku)
-- --------------------------------------------------------------------
DO $$
BEGIN
  INSERT INTO public.inventory (id, client_id, sku, asin, title, fba_available, fba_reserved, fba_inbound, daily_velocity_7d, daily_velocity_30d, days_of_supply, supplier_lead_time_days, reorder_point_units, risk_level, recommended_reorder_qty, estimated_stockout_date, last_restocked_at)
  SELECT v.id, v.client_id, v.sku, v.asin, v.title, v.fba_available, v.fba_reserved, v.fba_inbound, v.daily_velocity_7d, v.daily_velocity_30d, v.days_of_supply, v.supplier_lead_time_days, v.reorder_point_units, v.risk_level::inventory_risk_enum, v.recommended_reorder_qty, v.estimated_stockout_date, v.last_restocked_at::timestamptz
  FROM (VALUES
    ('c1111111-1111-1111-1111-111111111111'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'VXM-COCOA-70DK', 'B0DC89X102', 'Vinacacao 70% Dark Chocolate Bar (Pack of 4)', 168, 24, 400, 14.2, 12.8, 11.8, 32, 500, 'CRITICAL', 1200, '2026-09-19'::date, '2026-08-10'),
    ('c2222222-2222-2222-2222-222222222222'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'VXM-COCOA-PWD500', 'B0DD34Y205', 'Vinacacao 100% Pure Cocoa Powder 500g', 340, 18, 250, 18.5, 16.0, 18.4, 30, 580, 'HIGH', 800, '2026-09-26'::date, '2026-08-18'),
    ('c3333333-3333-3333-3333-333333333333'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'VXM-INC-AGAR100', 'B0EE89A901', 'An An Natural Agarwood Incense 100s', 280, 12, 300, 11.2, 9.5, 25.0, 28, 340, 'MEDIUM', 600, '2026-10-02'::date, '2026-08-25')
  ) AS v(id, client_id, sku, asin, title, fba_available, fba_reserved, fba_inbound, daily_velocity_7d, daily_velocity_30d, days_of_supply, supplier_lead_time_days, reorder_point_units, risk_level, recommended_reorder_qty, estimated_stockout_date, last_restocked_at)
  WHERE NOT EXISTS (SELECT 1 FROM public.inventory i WHERE i.sku = v.sku);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '[Vexim Seed 4] Bo qua (inventory): %', SQLERRM;
END $$;

-- --------------------------------------------------------------------
-- 5. BẢNG GIÁ CƯỚC 4 HÃNG TÀU (guard theo carrier_partner_name)
-- --------------------------------------------------------------------
DO $$
BEGIN
  INSERT INTO public.freight_rate_cards (id, carrier_partner_name, transport_mode, origin_port, destination_port, rate_per_cbm_usd, rate_per_kg_usd, rate_per_container_usd, fuel_surcharge_percent, documentation_fee_usd, drayage_est_usd, estimated_transit_days, customs_clearance_days_est, valid_until, is_active)
  SELECT v.id, v.carrier_partner_name, v.transport_mode, v.origin_port, v.destination_port, v.rate_per_cbm_usd, v.rate_per_kg_usd, v.rate_per_container_usd, v.fuel_surcharge_percent, v.documentation_fee_usd, v.drayage_est_usd, v.estimated_transit_days, v.customs_clearance_days_est, v.valid_until, v.is_active
  FROM (VALUES
    ('d1111111-1111-1111-1111-111111111111'::uuid, 'Kerry / Flexport Ocean LCL', 'OCEAN_LCL', 'Cát Lái (HCMC)', 'Los Angeles (LAX / LGB)', 115.00, NULL::numeric, NULL::numeric, 8.5, 65, 180, 24, 4, '2026-12-31'::date, TRUE),
    ('d2222222-2222-2222-2222-222222222222'::uuid, 'Maersk / ONE FCL 40HC Direct', 'OCEAN_FCL_40HC', 'Cát Lái (HCMC)', 'Long Beach (LGB)', NULL::numeric, NULL::numeric, 4850.00, 12.0, 95, 450, 21, 3, '2026-12-31'::date, TRUE),
    ('d3333333-3333-3333-3333-333333333333'::uuid, 'Unifa / Expeditors Ocean LCL', 'OCEAN_LCL', 'Hải Phòng (HPH)', 'Los Angeles (LAX)', 125.00, NULL::numeric, NULL::numeric, 8.5, 65, 180, 26, 4, '2026-12-31'::date, TRUE),
    ('d4444444-4444-1111-1111-111111111111'::uuid, 'DHL Express / FedEx Priority', 'AIR_EXPRESS', 'Tân Sơn Nhất (SGN)', 'Ontario Airport (ONT/LAX)', NULL::numeric, 7.20, NULL::numeric, 16.0, 35, 0, 5, 1, '2026-12-31'::date, TRUE)
  ) AS v(id, carrier_partner_name, transport_mode, origin_port, destination_port, rate_per_cbm_usd, rate_per_kg_usd, rate_per_container_usd, fuel_surcharge_percent, documentation_fee_usd, drayage_est_usd, estimated_transit_days, customs_clearance_days_est, valid_until, is_active)
  WHERE NOT EXISTS (SELECT 1 FROM public.freight_rate_cards f WHERE f.carrier_partner_name = v.carrier_partner_name);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '[Vexim Seed 5] Bo qua (freight_rate_cards): %', SQLERRM;
END $$;

-- --------------------------------------------------------------------
-- 6. VẬN ĐƠN INBOUND MẪU + MANIFEST (manifest tự bỏ qua nếu thiếu sản phẩm)
-- --------------------------------------------------------------------
DO $$
BEGIN
  INSERT INTO public.inbound_shipments (id, client_id, shipment_code, fba_shipment_id, status, transport_mode, origin_factory_address, origin_port, destination_port, destination_fba_hub, forwarder_name, bill_of_lading_number, total_units, total_cartons, total_gross_weight_kg, total_cbm, chargeable_weight_kg, total_fob_value_usd, total_freight_cost_usd, total_landed_cost_usd, landed_cost_per_unit_usd, etd_date, eta_date)
  SELECT 'e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'VXM-SHP-2026-001', 'FBA18VEXIM0902', 'BOOKED', 'OCEAN_LCL',
   'Xưởng đóng gói Vinacacao, KP3, Bình Đại, Bến Tre', 'Cát Lái (HCMC)', 'Los Angeles (LAX / LGB)', 'ONT8',
   'Kerry / Flexport Ocean LCL', 'KRY-VNM-LAX-8801',
   800, 34, 452.0, 1.020, 1020.0, 3040.00, 460.81, 3500.81, 4.38, '2026-09-15', '2026-10-09'
  WHERE NOT EXISTS (SELECT 1 FROM public.inbound_shipments WHERE shipment_code = 'VXM-SHP-2026-001');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '[Vexim Seed 6a] Bo qua (inbound_shipments): %', SQLERRM;
END $$;

DO $$
BEGIN
  -- Chỉ insert manifest khi CẢ shipment VÀ product đều tồn tại -> không thể vi phạm FK
  INSERT INTO public.shipment_carton_manifests (shipment_id, product_id, sku, fnsku, units_per_carton, carton_count, total_units, fob_unit_cost_usd, carton_length_cm, carton_width_cm, carton_height_cm, carton_weight_kg, cbm_per_carton, total_cbm)
  SELECT s.id, p.id, 'VXM-COCOA-PWD500', 'X00490219B', 24, 34, 800, 3.80, 40.0, 30.0, 25.0, 13.30, 0.030, 1.020
  FROM public.inbound_shipments s
  JOIN public.products p ON p.sku = 'VXM-COCOA-PWD500'
  WHERE s.shipment_code = 'VXM-SHP-2026-001'
    AND NOT EXISTS (SELECT 1 FROM public.shipment_carton_manifests m WHERE m.shipment_id = s.id);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '[Vexim Seed 6b] Bo qua (carton_manifests): %', SQLERRM;
END $$;

-- --------------------------------------------------------------------
-- 7. BIỂU THUẾ HS (guard theo hs_code_6digit)
-- --------------------------------------------------------------------
DO $$
BEGIN
  INSERT INTO public.customs_tariff_matrix (hs_code_6digit, hts_us_code_10digit, product_category, mfn_general_rate_percent, section_301_tariff_percent, gsp_status, fda_prior_notice_required, usda_aphis_required, prop65_warning_required)
  SELECT v.hs_code_6digit, v.hts_us_code_10digit, v.product_category, v.mfn_general_rate_percent, v.section_301_tariff_percent, v.gsp_status, v.fda_prior_notice_required, v.usda_aphis_required, v.prop65_warning_required
  FROM (VALUES
    ('1805.00', '1805.00.0030', 'Cocoa Powder, Unsweetened (Vinacacao PWD500)', 0.00, 0.00, 'NOT_ELIGIBLE', TRUE, FALSE, FALSE),
    ('1806.32', '1806.32.0053', 'Chocolate Bars, Filled/Unfilled (Vinacacao 70DK)', 5.60, 0.00, 'NOT_ELIGIBLE', TRUE, FALSE, FALSE)
  ) AS v(hs_code_6digit, hts_us_code_10digit, product_category, mfn_general_rate_percent, section_301_tariff_percent, gsp_status, fda_prior_notice_required, usda_aphis_required, prop65_warning_required)
  WHERE NOT EXISTS (SELECT 1 FROM public.customs_tariff_matrix c WHERE c.hs_code_6digit = v.hs_code_6digit);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '[Vexim Seed 7] Bo qua (customs_tariff_matrix): %', SQLERRM;
END $$;

-- ====================================================================
-- Xác minh sau khi chạy:
--   SELECT count(*) FROM public.users;                 -- mong đợi: 9
--   SELECT sku, fba_available FROM public.inventory;   -- 3 SKU
--   SELECT carrier_partner_name FROM public.freight_rate_cards;  -- 4 hãng tàu
-- Lỗi (nếu có) chỉ hiện dạng NOTICE: "[Vexim Seed N] Bo qua: ..." — không dừng script.
-- ====================================================================
