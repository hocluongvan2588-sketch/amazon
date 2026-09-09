-- ====================================================================
-- VEXIM LOGISTICS, FREIGHT RATES & SHIPMENT INTAKE SCHEMA MIGRATION
-- Migration Date: 2026-09-09
-- ====================================================================

-- 1. FREIGHT RATE CARDS TABLE
CREATE TABLE IF NOT EXISTS freight_rate_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  carrier_partner_name VARCHAR(150) NOT NULL,
  transport_mode VARCHAR(50) NOT NULL, -- 'OCEAN_FCL_40HC', 'OCEAN_LCL', 'AIR_EXPRESS', etc.
  origin_port VARCHAR(100) NOT NULL,
  destination_port VARCHAR(100) NOT NULL,
  rate_per_cbm_usd NUMERIC(10, 2) DEFAULT 0,
  rate_per_kg_usd NUMERIC(10, 2) DEFAULT 0,
  rate_per_container_usd NUMERIC(10, 2) DEFAULT 0,
  fuel_surcharge_percent NUMERIC(5, 2) DEFAULT 0,
  documentation_fee_usd NUMERIC(10, 2) DEFAULT 0,
  drayage_est_usd NUMERIC(10, 2) DEFAULT 0,
  estimated_transit_days INTEGER NOT NULL,
  customs_clearance_days_est INTEGER NOT NULL,
  valid_until DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INBOUND SHIPMENTS TABLE
CREATE TABLE IF NOT EXISTS inbound_shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  shipment_code VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'VXM-SHP-2026-001'
  fba_shipment_id VARCHAR(100), -- e.g. 'FBA18VEXIM0902'
  status VARCHAR(50) DEFAULT 'DRAFT', -- 'DRAFT', 'BOOKED', 'IN_TRANSIT_OCEAN', 'CUSTOMS_CLEARING', 'AT_3PL_BUFFER', 'CHECKING_IN_FBA', 'COMPLETED'
  transport_mode VARCHAR(50) NOT NULL,
  origin_factory_address TEXT,
  origin_port VARCHAR(100),
  destination_port VARCHAR(100),
  destination_fba_hub VARCHAR(100),
  forwarder_name VARCHAR(150),
  bill_of_lading_number VARCHAR(100),
  container_number VARCHAR(100),
  vessel_name VARCHAR(150),
  voyage_number VARCHAR(50),
  total_units INTEGER NOT NULL DEFAULT 0,
  total_cartons INTEGER NOT NULL DEFAULT 0,
  total_gross_weight_kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_cbm NUMERIC(10, 3) NOT NULL DEFAULT 0,
  chargeable_weight_kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_fob_value_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_freight_cost_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_landed_cost_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
  landed_cost_per_unit_usd NUMERIC(10, 2) NOT NULL DEFAULT 0,
  etd_date DATE,
  eta_date DATE,
  fba_checkin_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SHIPMENT CARTON MANIFESTS (ITEMIZED SKUS PER SHIPMENT)
CREATE TABLE IF NOT EXISTS shipment_carton_manifests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES inbound_shipments(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  sku VARCHAR(100) NOT NULL,
  fnsku VARCHAR(100) NOT NULL,
  units_per_carton INTEGER NOT NULL,
  carton_count INTEGER NOT NULL,
  total_units INTEGER NOT NULL,
  fob_unit_cost_usd NUMERIC(10, 2) NOT NULL,
  carton_length_cm NUMERIC(8, 2) NOT NULL,
  carton_width_cm NUMERIC(8, 2) NOT NULL,
  carton_height_cm NUMERIC(8, 2) NOT NULL,
  carton_weight_kg NUMERIC(8, 2) NOT NULL,
  cbm_per_carton NUMERIC(8, 4) NOT NULL,
  total_cbm NUMERIC(10, 3) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FORWARDER REAL-TIME TRACKING EVENTS (WEBHOOK AUDIT LOG)
CREATE TABLE IF NOT EXISTS forwarder_tracking_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES inbound_shipments(id) ON DELETE CASCADE,
  carrier_name VARCHAR(150) NOT NULL,
  tracking_number VARCHAR(100) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  location_name VARCHAR(255),
  status_notes_vi TEXT,
  raw_payload JSONB,
  event_timestamp TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. HS CODE & US TARIFF MATRIX TABLE
CREATE TABLE IF NOT EXISTS customs_tariff_matrix (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hs_code_6digit VARCHAR(20) NOT NULL, -- e.g. '1805.00' (Cocoa powder)
  hts_us_code_10digit VARCHAR(20) NOT NULL, -- e.g. '1805.00.0000'
  product_category VARCHAR(150) NOT NULL,
  mfn_general_rate_percent NUMERIC(5, 2) DEFAULT 0,
  section_301_tariff_percent NUMERIC(5, 2) DEFAULT 0, -- 0% for Vietnam Origin
  gsp_status VARCHAR(50) DEFAULT 'ELIGIBLE',
  fda_prior_notice_required BOOLEAN DEFAULT TRUE,
  usda_aphis_required BOOLEAN DEFAULT FALSE,
  prop65_warning_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE freight_rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_carton_manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE forwarder_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE customs_tariff_matrix ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Allow authenticated users to read freight rates" ON freight_rate_cards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read shipments" ON inbound_shipments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read tariff matrix" ON customs_tariff_matrix FOR SELECT TO authenticated USING (true);
