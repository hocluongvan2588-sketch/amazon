-- ====================================================================
-- VEXIM SPRINT 4.1 — SEED DỮ LIỆU MẪU CHO CÁC BẢNG MỚI
-- Migration: 20260916_seed_phase41_demo.sql (idempotent)
--
-- TẠI SAO CẦN FILE NÀY: các bảng mới (customer_inquiries,
-- product_documents, amazon_listings) sau migration TRỐNG — app giữ
-- nguyên dữ liệu localStorage cũ nên nhìn "chưa có gì mới". Seed này
-- đưa dữ liệu mẫu vào DB để hydration ghi đè và anh THẤY ngay dữ liệu
-- sống trong DB (sửa DB → app đổi, không phụ thuộc máy).
--
-- Chạy SAU 20260915. Chạy lại bao nhiêu lần cũng an toàn — ON CONFLICT DO NOTHING.
-- Lưu ý client_id khớp dữ liệu hiện có ('client-vina-01' — kiểm tra:
--   SELECT id FROM clients LIMIT 5;  -- sửa nếu khác)
-- ====================================================================

-- ---------- 1. INBOX MẪU (3 tin: 1 SAFETY_CRITICAL, 1 REFUND, 1 NORMAL) ----------
INSERT INTO public.customer_inquiries
  (id, client_id, amazon_message_id, amazon_order_id, customer_name, received_at,
   message_subject, message_body, classification, safety_risk_detected, safety_keywords,
   ai_suggested_draft, status)
VALUES
  ('inq-db-01', 'client-vina-01', 'AMZ-MSG-99001', '111-7777888-9990001',
   'Sarah Mitchell', NOW() - INTERVAL '5 hours',
   'Swelling after eating the dark chocolate bar',
   'Hi, my husband had a mild allergic reaction (lip swelling) after eating one bar of the 70% dark chocolate. He is okay now but we want to report it. The lot code is VN2026-08.',
   'SAFETY_CRITICAL', TRUE, '["allergic reaction","swelling","lot code"]',
   'We are very sorry to hear this and take it seriously. Could you share the lot code photos and the purchase date? We are initiating an internal quality review of this batch immediately and will follow up within 24 hours.',
   'UNREAD'),

  ('inq-db-02', 'client-vina-01', 'AMZ-MSG-99002', '111-7777888-9990002',
   'David Tran', NOW() - INTERVAL '1 day',
   'Received a torn pouch - refund request',
   'The cocoa powder pouch arrived with a torn corner and some powder leaked inside the box. I would like a refund or replacement please.',
   'REFUND_REQUEST', FALSE, '[]',
   'We apologize for the damaged packaging. A replacement is on its way — no need to return the item. If you prefer a refund instead, just reply here and we will process it immediately.',
   'UNREAD'),

  ('inq-db-03', 'client-vina-01', 'AMZ-MSG-99003', '111-7777888-9990003',
   'Emily Rodriguez', NOW() - INTERVAL '2 days',
   'Is this product organic certified?',
   'Hello, is your 100% cocoa powder USDA organic certified? I could not find the certification info on the listing page.',
   'NORMAL_INQUIRY', FALSE, '[]',
   'Great question! Yes — our cocoa powder is USDA Organic certified (certifier: Control Union), and the certificate number is printed on the back of every pouch. We are also adding this info to the listing images this month.',
   'UNREAD')
ON CONFLICT (id) DO NOTHING;

-- ---------- 2. CHỨNG TỪ MẪU (bảng product_documents) ----------
INSERT INTO public.product_documents
  (id, client_id, product_id, sku, title, type, file_name, file_url, storage_path,
   file_size, upload_date, status, extracted_data)
VALUES
  ('doc-db-01', 'client-vina-01', NULL, 'VXM-COCOA-70DK',
   'FDA Food Facility Registration (DB)',
   'FDA_REGISTRATION', 'FDA_Vinacacao_Facility_Reg_2026.pdf', '#', NULL,
   '1.4 MB', NOW() - INTERVAL '30 days', 'VERIFIED',
   '{"manufacturer": "Vinacacao Corp, Ben Tre Facility", "countryOfOrigin": "Vietnam", "certNumber": "FDA-19382019482", "expiryDate": "2027-12-31"}'::jsonb),

  ('doc-db-02', 'client-vina-01', NULL, 'VXM-COCOA-70DK',
   'COA Heavy Metals & Microbiological (DB)',
   'COA', 'COA_VN2026-08_Lab.pdf', '#', NULL,
   '890 KB', NOW() - INTERVAL '20 days', 'VERIFIED',
   '{"productName": "70% Dark Chocolate Bar", "ingredients": ["Cocoa mass", "Cane sugar", "Cocoa butter"]}'::jsonb),

  ('doc-db-03', 'client-vina-01', NULL, 'VXM-COCOA-PWD500',
   'COA Cocoa Powder Batch #PWD-2026-03 (DB)',
   'COA', 'COA_PWD_2026-03.pdf', '#', NULL,
   '1.1 MB', NOW() - INTERVAL '10 days', 'VERIFIED',
   '{"productName": "100% Cocoa Powder 500g"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ---------- 3. LISTINGS MẪU (bảng amazon_listings — nội dung khớp mock) ----------
INSERT INTO public.amazon_listings
  (id, client_id, sku, asin, title, bullet_points, description, backend_search_terms,
   price, currency, updated_at)
VALUES
  ('list-01', 'client-vina-01', 'VXM-COCOA-70DK', 'B0DC89X102',
   'Vinacacao Pure Single Origin 70% Dark Chocolate Bar (Ben Tre, Vietnam) — 3.5oz Pack of 4',
   '["SINGLE ORIGIN BEN TRE: Handcrafted from Trinitario cacao grown along the Mekong Delta silt — traceable from pod to bar.", "70% CACAO, 3 INGREDIENTS ONLY: Cocoa mass, cane sugar, cocoa butter. Zero palm oil, dairy, or soy lecithin.", "AWARD-WINING FLAVOR: Red fruit and warm spice notes with a smooth, glossy snap — judge-selected at Vietnam Cocoa Awards 2025.", "ETHICALLY SOURCED: Direct-trade partnership with 120+ multi-generational farming families at fair wages.", "GIFT-READY 4-PACK: Elegant matte-finish bars (3.5oz each), perfect for gourmet gifting and pairings."]',
   'Experience the terroir of Ben Tre, Vietnam — the coconut capital turned single-origin cacao destination. Our 70% dark chocolate is stone-ground in small batches and wrapped within 48 hours of conching.',
   'dark chocolate bar 70 single origin vietnamese chocolate gourmet chocolate gifts keto chocolate sugar free dark chocolate',
   24.99, 'USD', NOW()),

  ('list-02', 'client-vina-01', 'VXM-COCOA-PWD500', 'B0DC90Y203',
   'Vinacacao Premium 100% Pure Cocoa Powder for Baking & Smoothies — 17.6oz (500g)',
   '["100% PURE COCOA: Single ingredient, nothing added — no sugar, no dairy, no alkalizing agents.", "RICH & SMOOTH: Naturally processed for a deep, fudgy flavor ideal for brownies, hot cocoa, and keto smoothies.", "CERTIFIED QUALITY: Heavy-metals tested (COA in listing images), USDA Organic certified, Non-GMO.", "RESEALABLE 500G POUCH: Baking-friendly zip pouch keeps powder fresh for months.", "SUPPORT FARMING FAMILIES: Every pouch supports direct-trade wages for 120+ farmers in Ben Tre."]',
   'One ingredient, endless possibilities. Vinacacao cocoa powder is cold-pressed from single-origin Ben Tre beans, unsweetened and unalkalized for maximum flavor flexibility.',
   'cocoa powder unsweetened baking cocoa organic cacao powder keto baking ingredients hot chocolate mix',
   16.99, 'USD', NOW())
ON CONFLICT (id) DO NOTHING;

-- Xác minh:
--   SELECT count(*) FROM customer_inquiries;  -- 3
--   SELECT count(*) FROM product_documents;   -- 3
--   SELECT count(*) FROM amazon_listings;     -- 2
