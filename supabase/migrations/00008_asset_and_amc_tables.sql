-- File 8: supabase/migrations/00008_asset_and_amc_tables.sql

CREATE TABLE IF NOT EXISTS asset_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text,
  parent_id uuid REFERENCES asset_categories(id) ON DELETE CASCADE,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  category_id uuid REFERENCES asset_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  asset_tag text UNIQUE,
  serial_number text,
  model text,
  manufacturer text,
  specifications jsonb,
  purchase_date date,
  purchase_price decimal,
  installation_date date,
  location text,
  location_details jsonb,
  status text CHECK (status IN ('active','inactive','maintenance','retired','disposed')),
  condition text CHECK (condition IN ('excellent','good','fair','poor','critical')),
  qr_code text UNIQUE,
  barcode text,
  photos text[],
  documents jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS warranties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  warranty_type text,
  provider text,
  start_date date,
  end_date date,
  terms text,
  coverage_details jsonb,
  document_path text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS amc_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  contract_number text UNIQUE,
  name text NOT NULL,
  description text,
  start_date date,
  end_date date,
  total_visits int,
  used_visits int DEFAULT 0,
  remaining_visits int GENERATED ALWAYS AS (total_visits - used_visits) STORED,
  response_sla_minutes int,
  resolution_sla_minutes int,
  contract_value decimal,
  billing_cycle text,
  included_parts jsonb,
  included_labor boolean DEFAULT true,
  excluded_services text[],
  auto_renew boolean DEFAULT false,
  status text CHECK (status IN ('draft','active','expired','cancelled','renewed')),
  renewal_reminder_days int DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS amc_contract_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES amc_contracts(id) ON DELETE CASCADE,
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(contract_id, asset_id)
);

CREATE TABLE IF NOT EXISTS amc_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES amc_contracts(id) ON DELETE CASCADE,
  ticket_id uuid REFERENCES tickets(id) ON DELETE SET NULL,
  visit_date date,
  visit_type text CHECK (visit_type IN ('preventive','corrective','installation','inspection')),
  notes text,
  parts_used jsonb,
  is_chargeable boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add asset_id FK to tickets
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS asset_id uuid;
ALTER TABLE tickets ADD CONSTRAINT fk_tickets_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL;
