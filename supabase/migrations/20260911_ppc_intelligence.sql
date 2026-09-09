-- ====================================================================
-- VEXIM SPRINT 3.1 — PPC INTELLIGENCE LAYER TABLES
-- Migration: 20260911_ppc_intelligence.sql (TUỲ CHỌN khi LIVE, có thể chạy
-- nhiều lần; mỗi CREATE đều IF NOT EXISTS; policy có guard bảng).
--  1) ppc_search_term_reports — dữ liệu Search Term Report + kiến nghị phủ định
--  2) ppc_placement_metrics   — hiệu suất theo vị trí (ToS / Product Pages...)
--  3) ppc_bid_change_log      — mọi thay đổi bid (đề xuất/tự động) có audit
--  4) algorithm_runs          — nhật ký mọi lần thuật toán chạy (audit trail)
-- LƯU Ý BẢO MẬT: dùng chung chế độ policy demo của migration 20260910
-- (vexim_demo_full_access). Khi lên production thay policy tenant-isolation.
-- ====================================================================

-- 1. SEARCH TERM REPORTS + NEGATIVE PROPOSALS
CREATE TABLE IF NOT EXISTS public.ppc_search_term_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID,
  campaign_id VARCHAR(100),
  campaign_name VARCHAR(255),
  ad_group_name VARCHAR(255),
  search_term TEXT NOT NULL,
  match_type_source VARCHAR(30),
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  spend NUMERIC(12,2) DEFAULT 0,
  sales NUMERIC(12,2) DEFAULT 0,
  orders INT DEFAULT 0,
  acos NUMERIC(8,2),
  cvr NUMERIC(8,2),
  suggested_action VARCHAR(40),       -- NEGATIVE_EXACT | NEGATIVE_PHRASE | PROMOTE_EXACT | NONE
  estimated_savings_usd NUMERIC(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING | APPROVED | REJECTED | APPLIED
  report_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ppc_str_client_status ON public.ppc_search_term_reports(client_id, status);

-- 2. PLACEMENT METRICS (TOP_OF_SEARCH / PRODUCT_PAGES / REST_OF_SEARCH)
CREATE TABLE IF NOT EXISTS public.ppc_placement_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID,
  campaign_id VARCHAR(100),
  campaign_name VARCHAR(255),
  placement VARCHAR(30) NOT NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  spend NUMERIC(12,2) DEFAULT 0,
  sales NUMERIC(12,2) DEFAULT 0,
  orders INT DEFAULT 0,
  acos NUMERIC(8,2),
  cvr NUMERIC(8,2),
  current_boost_pct NUMERIC(5,2) DEFAULT 0,
  suggested_boost_pct NUMERIC(5,2),
  status VARCHAR(20) DEFAULT 'PENDING',
  report_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BID CHANGE LOG (đầy đủ audit: đề xuất hay tự động, ai duyệt)
CREATE TABLE IF NOT EXISTS public.ppc_bid_change_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID,
  amazon_keyword_id VARCHAR(100),
  campaign_id VARCHAR(100),
  keyword_text TEXT,
  match_type VARCHAR(20),
  old_bid NUMERIC(10,2) NOT NULL,
  new_bid NUMERIC(10,2) NOT NULL,
  change_pct NUMERIC(6,2),
  reason TEXT,
  window_days INT DEFAULT 7,
  target_acos NUMERIC(6,2),
  cvr_pct NUMERIC(6,2),
  aov_usd NUMERIC(10,2),
  execution_mode VARCHAR(20) DEFAULT 'SUGGESTED', -- SUGGESTED | AUTO_APPLIED
  status VARCHAR(20) DEFAULT 'PENDING',           -- PENDING | APPROVED | REJECTED | EXECUTED | FAILED
  decided_by VARCHAR(150),
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ppc_bidlog_keyword ON public.ppc_bid_change_log(amazon_keyword_id, created_at DESC);

-- 4. ALGORITHM RUNS (audit trail mọi lần engine chạy)
CREATE TABLE IF NOT EXISTS public.algorithm_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  algorithm_name VARCHAR(100) NOT NULL,
  module VARCHAR(50),
  mode VARCHAR(20) NOT NULL,              -- LIVE | SIMULATED
  trigger_source VARCHAR(50),             -- CRON | MANUAL_UI | API
  input_summary JSONB DEFAULT '{}'::jsonb,
  output_summary JSONB DEFAULT '{}'::jsonb,
  items_analyzed INT DEFAULT 0,
  items_proposed INT DEFAULT 0,
  items_applied INT DEFAULT 0,
  estimated_impact_usd NUMERIC(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'SUCCESS',
  error TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- POLICY demo-mode (chỉ tác động bảng mới có tồn tại, không đụng bảng khác)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['ppc_search_term_reports','ppc_placement_metrics','ppc_bid_change_log','algorithm_runs']
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS vexim_demo_full_access ON public.%I', t);
      EXECUTE format('CREATE POLICY vexim_demo_full_access ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', t);
    END IF;
  END LOOP;
END $$;

-- Xác minh:
--   SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'ppc%';
--   SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='algorithm_runs';
