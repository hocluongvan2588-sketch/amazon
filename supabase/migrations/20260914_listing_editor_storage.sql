CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- VEXIM GIAI ĐOẠN 4 — LISTING EDITOR + SUPABASE STORAGE
-- Migration: 20260914_listing_editor_storage.sql (idempotent, defensive)
--
-- 1) amazon_listings: nội dung listing SỐNG TRONG DB (trước đây chỉ
--    localStorage — đổi máy là mất). Cùng cấu trúc ListingData client.
-- 2) listing_images: metadata ảnh đã upload lên Storage (DB chỉ lưu
--    URL + path — KHÔNG lưu binary trong Postgres).
-- 3) Storage buckets: product-images (public read — Amazon fetch ảnh
--    từ URL khi PATCH listing) + compliance-docs (private).
--
-- ⚠️ BẢO MẬT: policy demo-mode 'vexim_demo_full_access' cho phép anon
-- đầy đủ quyền — chỉ dùng DEMO NỘI BỘ. Production: thay bằng policy
-- tenant-isolation theo auth.jwt() (xem docs/DATABASE_GO_LIVE_GUIDE.md).
-- ====================================================================

DO $$
DECLARE
  t text;
BEGIN
  -- ---------- 1. BẢNG AMAZON_LISTINGS ----------
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'amazon_listings') THEN
    CREATE TABLE public.amazon_listings (
      id TEXT PRIMARY KEY,                          -- trùng id client-side (list-01...)
      client_id TEXT NOT NULL,
      product_id TEXT,
      sku VARCHAR(100) NOT NULL,
      asin VARCHAR(50),
      title TEXT NOT NULL DEFAULT '',
      bullet_points JSONB NOT NULL DEFAULT '[]'::jsonb,
      description TEXT NOT NULL DEFAULT '',
      backend_search_terms TEXT NOT NULL DEFAULT '',
      aplus_content_html TEXT,
      aplus_modules JSONB DEFAULT '[]'::jsonb,
      price NUMERIC(12,2) NOT NULL DEFAULT 0,
      currency VARCHAR(5) NOT NULL DEFAULT 'USD',
      current_score JSONB DEFAULT '{}'::jsonb,      -- scorecard từ listing-quality engine
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_amazon_listings_sku ON public.amazon_listings(sku);
    CREATE INDEX IF NOT EXISTS idx_amazon_listings_client ON public.amazon_listings(client_id);
  END IF;

  -- ---------- 2. BẢNG LISTING_IMAGES ----------
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listing_images') THEN
    CREATE TABLE public.listing_images (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      client_id TEXT NOT NULL,
      sku VARCHAR(100) NOT NULL,
      storage_path TEXT NOT NULL,                   -- 'product-images/client-vina-01/VXM-xxx/1694...'
      url TEXT NOT NULL,                            -- public URL để đưa vào PATCH attributes.images
      sort_order INT NOT NULL DEFAULT 0,            -- 0 = MAIN image
      file_size_bytes BIGINT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_listing_images_sku ON public.listing_images(sku, sort_order);
  END IF;

  -- ---------- 3. POLICY DEMO-MODE ----------
  FOREACH t IN ARRAY ARRAY['amazon_listings','listing_images']
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS vexim_demo_full_access ON public.%I', t);
      EXECUTE format(
        'CREATE POLICY vexim_demo_full_access ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', t
      );
    END IF;
  END LOOP;
END $$;

-- ---------- 4. STORAGE BUCKETS ----------
-- product-images: PUBLIC (Amazon SP-API cần fetch được URL khi đồng bộ ảnh)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 10485760,
        ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE
  SET file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- compliance-docs: PRIVATE (chứng từ FDA/COA — chỉ app đọc qua URL có chữ ký)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('compliance-docs', 'compliance-docs', false, 26214400,
        ARRAY['application/pdf','image/jpeg','image/png'])
ON CONFLICT (id) DO UPDATE
  SET file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policy Storage demo-mode (public bucket: đọc tự do, ghi qua app;
-- private bucket: demo vẫn full — production bắt buộc siết theo auth)
DROP POLICY IF EXISTS "vexim_product_images_read" ON storage.objects;
CREATE POLICY "vexim_product_images_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "vexim_product_images_write" ON storage.objects;
CREATE POLICY "vexim_product_images_write" ON storage.objects
  FOR ALL TO anon, authenticated
  USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "vexim_compliance_docs_demo" ON storage.objects;
CREATE POLICY "vexim_compliance_docs_demo" ON storage.objects
  FOR ALL TO anon, authenticated
  USING (bucket_id = 'compliance-docs') WITH CHECK (bucket_id = 'compliance-docs');

-- Xác minh:
--   SELECT id, public FROM storage.buckets;
--   SELECT column_name FROM information_schema.columns WHERE table_name = 'amazon_listings';
