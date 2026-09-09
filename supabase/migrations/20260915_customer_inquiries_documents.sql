-- ====================================================================
-- VEXIM SPRINT 4.1 — INBOX & PRODUCT DOCUMENTS HYDRATION
-- Migration: 20260915_customer_inquiries_documents.sql (idempotent)
--
-- 1) customer_inquiries: hộp thư CS sống trong DB (trước đây chỉ
--    localStorage). KHÔNG phải sync từ Amazon — Amazon không mở
--    endpoint đọc hộp thư buyer; nguồn = email forwarding/nhập tay/
--    webhook. Cột khớp 1-1 type CustomerMessage client.
-- 2) product_documents: chứng từ sản phẩm (file upload lên bucket
--    private compliance-docs của migration 20260914; DB chỉ lưu path).
--
-- ⚠️ Policy demo-mode — production: thay bằng tenant-isolation theo
-- auth.jwt() (docs/DATABASE_GO_LIVE_GUIDE.md).
-- ====================================================================

DO $$
DECLARE
  t text;
BEGIN
  -- ---------- 1. CUSTOMER_INQUIRIES ----------
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_inquiries') THEN
    CREATE TABLE public.customer_inquiries (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      amazon_message_id VARCHAR(100),
      amazon_order_id VARCHAR(50),
      customer_name TEXT,
      received_at TIMESTAMPTZ DEFAULT NOW(),
      message_subject TEXT DEFAULT '',
      message_body TEXT DEFAULT '',
      classification VARCHAR(30) DEFAULT 'NORMAL_INQUIRY',
      safety_risk_detected BOOLEAN DEFAULT FALSE,
      safety_keywords JSONB DEFAULT '[]'::jsonb,
      ai_suggested_draft TEXT DEFAULT '',
      final_reply TEXT,
      status VARCHAR(30) DEFAULT 'UNREAD',
      approved_by TEXT,
      sent_at TIMESTAMPTZ
    );
    CREATE INDEX IF NOT EXISTS idx_custinq_client ON public.customer_inquiries(client_id, received_at DESC);
    CREATE INDEX IF NOT EXISTS idx_custinq_class ON public.customer_inquiries(classification);
  END IF;

  -- ---------- 2. PRODUCT_DOCUMENTS ----------
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_documents') THEN
    CREATE TABLE public.product_documents (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      product_id TEXT,
      sku VARCHAR(100),
      title TEXT NOT NULL,
      type VARCHAR(30) NOT NULL DEFAULT 'COA',
      file_name TEXT DEFAULT '',
      file_url TEXT DEFAULT '#',
      storage_path TEXT,
      file_size TEXT DEFAULT '',
      upload_date TIMESTAMPTZ DEFAULT NOW(),
      status VARCHAR(20) DEFAULT 'UNDER_REVIEW',
      extracted_data JSONB DEFAULT '{}'::jsonb
    );
    CREATE INDEX IF NOT EXISTS idx_proddoc_product ON public.product_documents(product_id);
    CREATE INDEX IF NOT EXISTS idx_proddoc_sku ON public.product_documents(sku);
  END IF;

  -- ---------- 3. POLICY DEMO-MODE ----------
  FOREACH t IN ARRAY ARRAY['customer_inquiries','product_documents']
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

-- Xác minh:
--   SELECT column_name FROM information_schema.columns WHERE table_name = 'customer_inquiries';
--   SELECT column_name FROM information_schema.columns WHERE table_name = 'product_documents';
