-- File 12: supabase/migrations/00012_reporting_tables.sql

CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  widget_type text,
  title text,
  config jsonb,
  position jsonb,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  report_type text,
  filters jsonb,
  columns jsonb,
  sort_by jsonb,
  is_shared boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scheduled_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES saved_reports(id) ON DELETE CASCADE,
  schedule text,
  recipients text[],
  format text CHECK (format IN ('pdf','excel','csv')),
  is_active boolean DEFAULT true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kpi_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL,
  metrics jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS csat_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  rating int CHECK (rating >= 1 AND rating <= 5),
  comment text,
  nps_score int CHECK (nps_score >= 0 AND nps_score <= 10),
  ces_score int CHECK (ces_score >= 1 AND ces_score <= 7),
  created_at timestamptz DEFAULT now()
);
