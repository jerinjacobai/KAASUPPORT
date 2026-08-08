-- File 7: supabase/migrations/00007_field_service_tables.sql

CREATE TABLE IF NOT EXISTS engineers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  employee_id text,
  specializations text[],
  certifications text[],
  max_daily_visits int DEFAULT 5,
  current_location jsonb,
  is_available boolean DEFAULT true,
  rating decimal,
  total_visits int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS engineer_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id uuid REFERENCES engineers(id) ON DELETE CASCADE,
  category_id uuid REFERENCES ticket_categories(id) ON DELETE CASCADE,
  proficiency_level int CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS engineer_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id uuid REFERENCES engineers(id) ON DELETE CASCADE,
  day_of_week int CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time,
  end_time time,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS field_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  engineer_id uuid REFERENCES engineers(id) ON DELETE SET NULL,
  scheduled_date date,
  scheduled_start_time timestamptz,
  scheduled_end_time timestamptz,
  actual_start_time timestamptz,
  actual_end_time timestamptz,
  status text CHECK (status IN ('scheduled','en_route','arrived','in_progress','completed','cancelled','rescheduled')),
  check_in_location jsonb,
  check_out_location jsonb,
  check_in_time timestamptz,
  check_out_time timestamptz,
  travel_distance_km decimal,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS time_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  visit_id uuid REFERENCES field_visits(id) ON DELETE CASCADE,
  engineer_id uuid REFERENCES engineers(id) ON DELETE CASCADE,
  start_time timestamptz,
  end_time timestamptz,
  duration_minutes int,
  log_type text CHECK (log_type IN ('work','travel','break','waiting')),
  description text,
  is_billable boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS visit_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid REFERENCES field_visits(id) ON DELETE CASCADE,
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  signer_type text CHECK (signer_type IN ('customer','engineer')),
  signer_name text,
  signature_data text,
  signed_at timestamptz,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS visit_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid REFERENCES field_visits(id) ON DELETE CASCADE,
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  engineer_id uuid REFERENCES engineers(id) ON DELETE SET NULL,
  photo_type text CHECK (photo_type IN ('before','after','issue','resolution','site')),
  storage_path text NOT NULL,
  thumbnail_path text,
  caption text,
  gps_location jsonb,
  taken_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expense_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid REFERENCES field_visits(id) ON DELETE SET NULL,
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  engineer_id uuid REFERENCES engineers(id) ON DELETE CASCADE,
  expense_type text CHECK (expense_type IN ('travel','fuel','parking','meals','parts','tools','accommodation','other')),
  amount decimal NOT NULL,
  currency text DEFAULT 'INR',
  description text,
  receipt_path text,
  status text CHECK (status IN ('pending','approved','rejected','reimbursed')),
  approved_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  visit_id uuid REFERENCES field_visits(id) ON DELETE SET NULL,
  engineer_id uuid REFERENCES engineers(id) ON DELETE SET NULL,
  report_number text UNIQUE,
  company_logo_url text,
  issue_summary text,
  resolution_summary text,
  parts_used jsonb,
  labor_hours decimal,
  customer_signature_id uuid REFERENCES visit_signatures(id) ON DELETE SET NULL,
  engineer_signature_id uuid REFERENCES visit_signatures(id) ON DELETE SET NULL,
  pdf_path text,
  qr_verification_code text,
  status text CHECK (status IN ('draft','generated','sent','acknowledged')),
  generated_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);
