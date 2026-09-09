-- ====================================================================
-- VEXIM — RLS FIX (42P17 infinite recursion) — FILE BẮT BUỘC
-- Migration: 20260910_rls_fix.sql
--
-- FILE NÀY LÀ DUY NHẤT CẦN THIẾT ĐỂ APP VẬN HÀNH VỚI SUPABASE.
-- Script không thể lỗi hard: mọi thao tác policy đều IF EXISTS,
-- bảng không tồn tại thì tự bỏ qua.
--
-- Fix 1: Bảng public.users bị "infinite recursion detected in policy"
--        (policy cũ tự query chính bảng users trong mệnh đề EXISTS).
-- Fix 2: Các policy cũ phụ thuộc auth.jwt() (Supabase Auth) trong khi
--        app Vexim đăng nhập ở tầng ứng dụng -> anon đọc được 0 dòng.
--
-- ⚠️ BẢO MẬT: policy 'vexim_demo_full_access' cho phép anon đọc/ghi —
-- chỉ dùng cho DEMO NỘI BỘ. Khi mở production cho người ngoài, thay bằng
-- policy tenant-isolation theo auth.jwt() (xem docs/DATABASE_GO_LIVE_GUIDE.md).
-- ====================================================================

-- 1. XÓA CÁC POLICY CŨ GÂY CHẶN / ĐỆ QUY
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

-- 2. POLICY DEMO-MODE (anon + authenticated = full access) cho mọi bảng tồn tại
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

-- 3. KIỂM TRA (chạy riêng nếu muốn):
--    SELECT count(*) FROM public.users;  -- không còn lỗi 42P17
