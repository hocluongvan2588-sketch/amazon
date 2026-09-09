-- ====================================================================
-- VEXIM SPRINT 3.2 — LISTING INTELLIGENCE TABLES
-- Migration: 20260913_listing_intelligence.sql (idempotent, defensive)
-- listing_scores_history: lịch sử mỗi lần engine chấm điểm listing
-- (theo dõi cải thiện sau tối ưu SEO). Bọc trong DO $$ để không bao giờ
-- fail hard nếu bảng tồn tại khác schema.
-- ====================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listing_scores_history') THEN
    CREATE TABLE public.listing_scores_history (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      listing_id UUID,
      sku VARCHAR(100),
      asin VARCHAR(50),
      overall_score INT NOT NULL,
      title_score INT,
      bullet_score INT,
      description_score INT,
      image_score INT,
      backend_score INT,
      backend_bytes_used INT,
      backend_utilization_pct NUMERIC(5,1),
      grade VARCHAR(2),
      compliance_risk VARCHAR(10),
      issues JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_listing_scores_sku ON public.listing_scores_history(sku, created_at DESC);
  END IF;

  -- Policy demo-mode (khớp chuẩn các migration trước)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listing_scores_history') THEN
    EXECUTE 'ALTER TABLE public.listing_scores_history ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS vexim_demo_full_access ON public.listing_scores_history';
    EXECUTE 'CREATE POLICY vexim_demo_full_access ON public.listing_scores_history FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- Xác minh:
--   SELECT column_name FROM information_schema.columns WHERE table_name = 'listing_scores_history';
