-- ====================================================================
-- VEXIM AMAZON OPERATIONS PLATFORM — SUPABASE POSTGRESQL SCHEMA V1.0
-- Sections 30, 31, 32, 37 of Technical & Functional Specification
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE user_role_enum AS ENUM (
  'SUPER_ADMIN',
  'OPS_MANAGER',
  'ACCOUNT_EXECUTIVE',
  'COMPLIANCE_SPECIALIST',
  'CLIENT_SUPPLIER'
);

CREATE TYPE service_tier_enum AS ENUM (
  'AMAZON_AUDIT',
  'AMAZON_LAUNCH',
  'AMAZON_OPERATIONS',
  'AMAZON_GROWTH'
);

CREATE TYPE ai_agent_type_enum AS ENUM (
  'INVENTORY',
  'LISTING',
  'SALES',
  'PPC',
  'ACCOUNT_HEALTH',
  'PROMOTION',
  'CUSTOMER',
  'COMPLIANCE'
);

CREATE TYPE priority_enum AS ENUM ('CRITICAL', 'HIGH', 'OPPORTUNITY', 'LOW');
CREATE TYPE risk_level_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE recommendation_status_enum AS ENUM (
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'MODIFIED',
  'EXECUTED'
);

CREATE TYPE task_status_enum AS ENUM (
  'OPEN',
  'IN_PROGRESS',
  'WAITING_APPROVAL',
  'APPROVED',
  'COMPLETED',
  'REJECTED'
);

CREATE TYPE inventory_risk_enum AS ENUM (
  'HEALTHY',
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
  'OVERSTOCK'
);

CREATE TYPE sync_status_enum AS ENUM (
  'SYNC_PENDING',
  'SYNC_RUNNING',
  'SYNC_SUCCESS',
  'SYNC_FAILED'
);

-- ====================================================================
-- 3. LAYER 1: ORGANIZATIONS, CLIENTS & USERS (MULTI-TENANT)
-- ====================================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  country VARCHAR(10) DEFAULT 'VN',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  tax_code VARCHAR(50),
  contact_person VARCHAR(150),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  province VARCHAR(100),
  category VARCHAR(100),
  service_tier service_tier_enum DEFAULT 'AMAZON_OPERATIONS',
  amazon_seller_id VARCHAR(100),
  amazon_store_name VARCHAR(255),
  connection_status VARCHAR(50) DEFAULT 'CONNECTED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL, -- NULL for Vexim Staff
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'CLIENT_SUPPLIER',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 4. LAYER 2: AMAZON ACCOUNTS & MARKETPLACES (SP-API)
-- ====================================================================

CREATE TABLE amazon_marketplaces (
  id VARCHAR(50) PRIMARY KEY, -- 'ATVPDKIKX0DER' for US
  country_code VARCHAR(5) NOT NULL, -- 'US'
  name VARCHAR(100) NOT NULL, -- 'Amazon.com'
  currency VARCHAR(10) DEFAULT 'USD',
  endpoint TEXT NOT NULL
);

CREATE TABLE amazon_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  marketplace_id VARCHAR(50) NOT NULL REFERENCES amazon_marketplaces(id),
  seller_id VARCHAR(100) NOT NULL,
  store_name VARCHAR(255) NOT NULL,
  auth_status VARCHAR(50) DEFAULT 'AUTHORIZED',
  token_encrypted TEXT, -- AES-256 encrypted refresh token
  token_expiry TIMESTAMPTZ,
  account_health_rating INT DEFAULT 280,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 5. LAYER 3: PRODUCTS, DOCUMENTS & COMPLIANCE
-- ====================================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  sku VARCHAR(100) NOT NULL,
  asin VARCHAR(50) NOT NULL,
  fnsku VARCHAR(50),
  upc VARCHAR(50),
  title TEXT NOT NULL,
  brand VARCHAR(150),
  category VARCHAR(150),
  sub_category VARCHAR(150),
  main_image TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  price NUMERIC(10, 2) NOT NULL,
  cogs NUMERIC(10, 2) NOT NULL,
  fba_fee_estimated NUMERIC(10, 2) DEFAULT 0,
  referral_fee_estimated NUMERIC(10, 2) DEFAULT 0,
  estimated_margin_pct NUMERIC(5, 2) DEFAULT 0,
  weight_lbs NUMERIC(8, 3),
  dimensions_inches JSONB DEFAULT '{"length": 0, "width": 0, "height": 0}'::jsonb,
  status VARCHAR(50) DEFAULT 'ACTIVE', -- 'DRAFT', 'COMPLIANCE_REVIEW', 'READY_FOR_LAUNCH', 'ACTIVE'
  readiness_score INT DEFAULT 0,
  readiness_breakdown JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, sku)
);

CREATE TABLE product_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  doc_type VARCHAR(50) NOT NULL, -- 'FDA_REGISTRATION', 'COA', 'LABEL_SPEC', 'USDA_ORGANIC'
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size VARCHAR(50),
  status VARCHAR(50) DEFAULT 'VERIFIED', -- 'VERIFIED', 'UNDER_REVIEW', 'REJECTED'
  extracted_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_compliance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  issue_code VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  severity VARCHAR(50) NOT NULL, -- 'CRITICAL_BLOCK', 'WARNING', 'INFO'
  category VARCHAR(50), -- 'FDA', 'PROPOSITION_65', 'LABELING', 'HAZMAT'
  description TEXT,
  remedy TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 6. LAYER 4: LISTINGS & OPTIMIZATION DRAFTS
-- ====================================================================

CREATE TABLE amazon_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(100) NOT NULL,
  asin VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  bullet_points JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  backend_search_terms TEXT,
  aplus_content_html TEXT,
  current_score INT DEFAULT 0,
  score_breakdown JSONB DEFAULT '{}'::jsonb,
  ai_optimization_draft JSONB DEFAULT '{}'::jsonb,
  last_optimized_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 7. LAYER 5: INVENTORY & STOCKOUT FORECAST
-- ====================================================================

CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  sku VARCHAR(100) NOT NULL,
  asin VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  fba_available INT DEFAULT 0,
  fba_reserved INT DEFAULT 0,
  fba_inbound INT DEFAULT 0,
  daily_velocity_7d NUMERIC(8, 2) DEFAULT 0,
  daily_velocity_30d NUMERIC(8, 2) DEFAULT 0,
  days_of_supply NUMERIC(8, 2) DEFAULT 0,
  supplier_lead_time_days INT DEFAULT 32,
  reorder_point_units INT DEFAULT 0,
  risk_level inventory_risk_enum DEFAULT 'HEALTHY',
  recommended_reorder_qty INT DEFAULT 0,
  estimated_stockout_date DATE,
  last_restocked_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 8. LAYER 6: ORDERS & FULFILLMENT
-- ====================================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amazon_order_id VARCHAR(100) UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  purchase_date TIMESTAMPTZ NOT NULL,
  order_status VARCHAR(50) NOT NULL, -- 'PENDING', 'UNSHIPPED', 'SHIPPED', 'DELIVERED', 'CANCELLED'
  fulfillment_channel VARCHAR(20) DEFAULT 'FBA',
  order_total NUMERIC(10, 2) NOT NULL,
  item_count INT DEFAULT 1,
  customer_city VARCHAR(100),
  customer_state VARCHAR(50),
  customer_postal_code VARCHAR(50),
  carrier VARCHAR(100),
  tracking_number VARCHAR(150),
  has_problem BOOLEAN DEFAULT FALSE,
  problem_reason TEXT,
  ai_problem_diagnosis TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 9. LAYER 7: ADVERTISING PPC & PROMOTIONS
-- ====================================================================

CREATE TABLE advertising_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amazon_campaign_id VARCHAR(100),
  campaign_name VARCHAR(255) NOT NULL,
  campaign_type VARCHAR(50) DEFAULT 'SPONSORED_PRODUCTS',
  targeting_type VARCHAR(20) DEFAULT 'MANUAL',
  status VARCHAR(20) DEFAULT 'ENABLED',
  daily_budget NUMERIC(10, 2) NOT NULL,
  spend_7d NUMERIC(10, 2) DEFAULT 0,
  sales_7d NUMERIC(10, 2) DEFAULT 0,
  orders_7d INT DEFAULT 0,
  impressions_7d INT DEFAULT 0,
  clicks_7d INT DEFAULT 0,
  acos NUMERIC(5, 2) DEFAULT 0,
  target_acos NUMERIC(5, 2) DEFAULT 25.00,
  tacos NUMERIC(5, 2) DEFAULT 0,
  roas NUMERIC(5, 2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE advertising_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES advertising_campaigns(id) ON DELETE CASCADE,
  keyword_text VARCHAR(255) NOT NULL,
  match_type VARCHAR(20) NOT NULL, -- 'EXACT', 'PHRASE', 'BROAD'
  bid NUMERIC(8, 2) NOT NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  spend NUMERIC(10, 2) DEFAULT 0,
  sales NUMERIC(10, 2) DEFAULT 0,
  orders INT DEFAULT 0,
  acos NUMERIC(5, 2) DEFAULT 0,
  conversion_rate NUMERIC(5, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ENABLED',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customer_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amazon_message_id VARCHAR(100) UNIQUE,
  order_id VARCHAR(100),
  customer_name VARCHAR(150),
  received_at TIMESTAMPTZ DEFAULT NOW(),
  message_subject VARCHAR(255),
  message_body TEXT NOT NULL,
  classification VARCHAR(50) NOT NULL, -- 'NORMAL_INQUIRY', 'COMPLAINT', 'REFUND_REQUEST', 'PRODUCT_QUALITY', 'SAFETY_CRITICAL'
  safety_risk_detected BOOLEAN DEFAULT FALSE,
  safety_keywords JSONB DEFAULT '[]'::jsonb,
  ai_suggested_draft TEXT,
  final_reply TEXT,
  status VARCHAR(50) DEFAULT 'PENDING_APPROVAL', -- 'PENDING_APPROVAL', 'SENT', 'ESCALATED_TO_HUMAN'
  approved_by VARCHAR(100),
  sent_at TIMESTAMPTZ
);

CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  promo_type VARCHAR(50) NOT NULL,
  discount_value NUMERIC(10, 2) NOT NULL,
  discount_type VARCHAR(20) DEFAULT 'PERCENT',
  target_skus JSONB DEFAULT '[]'::jsonb,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  attributed_sales NUMERIC(10, 2) DEFAULT 0,
  sales_uplift_pct NUMERIC(5, 2) DEFAULT 0,
  margin_impact_pct NUMERIC(5, 2) DEFAULT 0,
  roi NUMERIC(5, 2) DEFAULT 0
);

-- ====================================================================
-- 10. LAYER 8: AI RECOMMENDATIONS & HUMAN APPROVAL ENGINE
-- (Mục 20, 21, 31, 32)
-- ====================================================================

CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amazon_account_id UUID REFERENCES amazon_accounts(id) ON DELETE SET NULL,
  agent_type ai_agent_type_enum NOT NULL,
  entity_type VARCHAR(50) NOT NULL, -- 'INVENTORY', 'LISTING', 'KEYWORD', 'CUSTOMER_MESSAGE', 'COMPLIANCE'
  entity_id VARCHAR(100) NOT NULL,
  entity_identifier VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  reason TEXT NOT NULL,
  confidence_score INT DEFAULT 90,
  priority priority_enum NOT NULL DEFAULT 'HIGH',
  risk_level risk_level_enum NOT NULL DEFAULT 'MEDIUM',
  proposed_action TEXT NOT NULL,
  action_data JSONB DEFAULT '{}'::jsonb,
  before_state JSONB DEFAULT '{}'::jsonb,
  proposed_state JSONB DEFAULT '{}'::jsonb,
  expected_impact TEXT NOT NULL,
  requires_explicit_approval BOOLEAN DEFAULT TRUE,
  status recommendation_status_enum DEFAULT 'PENDING_APPROVAL',
  reject_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by VARCHAR(100),
  rejected_at TIMESTAMPTZ,
  rejected_by VARCHAR(100),
  executed_at TIMESTAMPTZ
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_number SERIAL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  recommendation_id UUID REFERENCES ai_recommendations(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority priority_enum DEFAULT 'HIGH',
  status task_status_enum DEFAULT 'OPEN',
  assigned_to VARCHAR(150),
  assigned_role user_role_enum DEFAULT 'OPS_MANAGER',
  due_date DATE,
  source VARCHAR(100) DEFAULT 'MANUAL_OPS',
  linked_entity JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  actor_name VARCHAR(150) NOT NULL,
  actor_role user_role_enum NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'HUMAN', 'AI_AGENT', 'SP_API_SYNC'
  agent_type VARCHAR(50),
  action_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  entity_name VARCHAR(255) NOT NULL,
  before_value TEXT,
  after_value TEXT,
  approval_notes TEXT,
  ip_address VARCHAR(50)
);

CREATE TABLE sync_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  module VARCHAR(50) NOT NULL,
  frequency VARCHAR(50) NOT NULL,
  status sync_status_enum DEFAULT 'SYNC_SUCCESS',
  last_run_time TIMESTAMPTZ DEFAULT NOW(),
  next_run_time TIMESTAMPTZ,
  items_processed INT DEFAULT 0,
  error_count INT DEFAULT 0,
  last_error_message TEXT
);

CREATE TABLE client_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  period VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  gross_sales NUMERIC(12, 2) NOT NULL,
  sales_growth_pct NUMERIC(5, 2) DEFAULT 0,
  units_sold INT NOT NULL,
  orders_count INT NOT NULL,
  conversion_rate NUMERIC(5, 2) NOT NULL,
  acos NUMERIC(5, 2) NOT NULL,
  tacos NUMERIC(5, 2) NOT NULL,
  estimated_profit NUMERIC(12, 2) NOT NULL,
  executive_summary_vi TEXT NOT NULL,
  top_performers JSONB DEFAULT '[]'::jsonb,
  key_risks_and_actions JSONB DEFAULT '[]'::jsonb,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 11. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ====================================================================

CREATE INDEX idx_products_client_sku ON products(client_id, sku);
CREATE INDEX idx_products_asin ON products(asin);
CREATE INDEX idx_inventory_client_risk ON inventory(client_id, risk_level);
CREATE INDEX idx_orders_client_status ON orders(client_id, order_status);
CREATE INDEX idx_recs_client_status_priority ON ai_recommendations(client_id, status, priority);
CREATE INDEX idx_tasks_client_status ON tasks(client_id, status);
CREATE INDEX idx_activity_logs_time ON activity_logs(timestamp DESC);

-- ====================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES (Mục 37 Multi-Tenant)
-- ====================================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Vexim Staff can access all records, Suppliers can only access their own tenant
CREATE POLICY client_isolation_policy ON clients
  FOR ALL
  USING (
    auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'OPS_MANAGER', 'ACCOUNT_EXECUTIVE', 'COMPLIANCE_SPECIALIST')
    OR id::text = (auth.jwt() ->> 'client_id')
  );

CREATE POLICY product_isolation_policy ON products
  FOR ALL
  USING (
    auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'OPS_MANAGER', 'ACCOUNT_EXECUTIVE', 'COMPLIANCE_SPECIALIST')
    OR client_id::text = (auth.jwt() ->> 'client_id')
  );

CREATE POLICY inventory_isolation_policy ON inventory
  FOR ALL
  USING (
    auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'OPS_MANAGER', 'ACCOUNT_EXECUTIVE', 'COMPLIANCE_SPECIALIST')
    OR client_id::text = (auth.jwt() ->> 'client_id')
  );

CREATE POLICY recs_isolation_policy ON ai_recommendations
  FOR ALL
  USING (
    auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'OPS_MANAGER', 'ACCOUNT_EXECUTIVE', 'COMPLIANCE_SPECIALIST')
    OR client_id::text = (auth.jwt() ->> 'client_id')
  );
