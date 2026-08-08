-- File 5: supabase/migrations/00005_support_core_tables.sql

CREATE TABLE IF NOT EXISTS ticket_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  color text,
  icon text,
  sort_order int DEFAULT 0,
  is_closed boolean DEFAULT false,
  is_default boolean DEFAULT false,
  is_system boolean DEFAULT false,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_name text,
  parent_id uuid REFERENCES ticket_categories(id) ON DELETE CASCADE,
  icon text,
  color text,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_priorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text,
  color text,
  icon text,
  sort_order int DEFAULT 0,
  response_time_minutes int,
  resolution_time_minutes int,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  -- asset_id added in 00008
  category_id uuid REFERENCES ticket_categories(id),
  priority_id uuid REFERENCES ticket_priorities(id),
  status_id uuid REFERENCES ticket_statuses(id),
  title text NOT NULL,
  description text,
  source text CHECK (source IN ('portal','mobile','erp','widget','website','qr_code','email','whatsapp','phone','internal','preventive_maintenance','iot')),
  reported_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_team text,
  contact_name text,
  contact_email text,
  contact_phone text,
  location jsonb,
  preferred_visit_time timestamptz,
  tags text[] DEFAULT '{}',
  custom_fields jsonb DEFAULT '{}'::jsonb,
  is_billable boolean DEFAULT false,
  estimated_hours decimal,
  actual_hours decimal,
  device_info jsonb,
  browser_info jsonb,
  gps_location jsonb,
  ai_category_suggestion text,
  ai_priority_suggestion text,
  ai_summary text,
  ai_duplicate_of uuid REFERENCES tickets(id) ON DELETE SET NULL,
  resolution_summary text,
  resolved_at timestamptz,
  closed_at timestamptz,
  first_response_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_internal boolean DEFAULT false,
  mentioned_users uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  activity_type text NOT NULL,
  description text,
  old_value text,
  new_value text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES ticket_comments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  file_name text,
  file_type text,
  file_size bigint,
  storage_path text NOT NULL,
  thumbnail_path text,
  is_photo_before boolean,
  is_photo_after boolean,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_watchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(ticket_id, user_id)
);

CREATE TABLE IF NOT EXISTS ticket_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  target_ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  link_type text CHECK (link_type IN ('related','duplicate','blocks','blocked_by','parent','child')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_custom_field_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  category_id uuid REFERENCES ticket_categories(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  field_label text NOT NULL,
  field_type text CHECK (field_type IN ('text','number','date','select','multiselect','checkbox','url','email','phone')),
  options jsonb,
  is_required boolean DEFAULT false,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES ticket_categories(id) ON DELETE SET NULL,
  priority_id uuid REFERENCES ticket_priorities(id) ON DELETE SET NULL,
  title_template text,
  description_template text,
  custom_fields jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Default inserts
INSERT INTO ticket_statuses (name, display_name, color, sort_order, is_closed, is_default, is_system) VALUES
('draft', 'Draft', '#94a3b8', 1, false, true, true),
('submitted', 'Submitted', '#3b82f6', 2, false, false, true),
('new', 'New', '#60a5fa', 3, false, false, true),
('accepted', 'Accepted', '#22d3ee', 4, false, false, true),
('assigned', 'Assigned', '#a78bfa', 5, false, false, true),
('acknowledged', 'Acknowledged', '#8b5cf6', 6, false, false, true),
('engineer_en_route', 'Engineer En Route', '#f59e0b', 7, false, false, true),
('arrived_on_site', 'Arrived On Site', '#f97316', 8, false, false, true),
('in_progress', 'In Progress', '#eab308', 9, false, false, true),
('waiting_customer', 'Waiting Customer', '#fb923c', 10, false, false, true),
('waiting_approval', 'Waiting Approval', '#fbbf24', 11, false, false, true),
('waiting_third_party', 'Waiting Third Party', '#d97706', 12, false, false, true),
('waiting_spare_parts', 'Waiting Spare Parts', '#92400e', 13, false, false, true),
('escalated', 'Escalated', '#ef4444', 14, false, false, true),
('resolved', 'Resolved', '#10b981', 15, false, false, true),
('verification_pending', 'Verification Pending', '#14b8a6', 16, false, false, true),
('customer_review', 'Customer Review', '#06b6d4', 17, false, false, true),
('closed', 'Closed', '#22c55e', 18, true, false, true),
('cancelled', 'Cancelled', '#6b7280', 19, true, false, true),
('reopened', 'Reopened', '#f43f5e', 20, false, false, true),
('merged', 'Merged', '#8b5cf6', 21, true, false, true),
('duplicate', 'Duplicate', '#9ca3af', 22, true, false, true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO ticket_categories (name, display_name) VALUES
('Software', 'Software'), ('Hardware', 'Hardware'), ('Network', 'Network'), 
('Electrical', 'Electrical'), ('Mechanical', 'Mechanical'), ('PLC', 'PLC'), 
('Database', 'Database'), ('Cloud', 'Cloud'), ('Printer', 'Printer'), 
('Camera', 'Camera'), ('Biometric', 'Biometric'), ('Attendance', 'Attendance'), 
('ERP', 'ERP'), ('Payroll', 'Payroll'), ('HRMS', 'HRMS'), ('Inventory', 'Inventory'), 
('CRM', 'CRM'), ('API', 'API'), ('Integration', 'Integration'), ('Email', 'Email'), 
('Mobile App', 'Mobile App'), ('Website', 'Website'), ('Security', 'Security'), 
('Performance', 'Performance'), ('Training', 'Training'), ('Other', 'Other');

INSERT INTO ticket_priorities (name, display_name, color, sort_order, response_time_minutes, resolution_time_minutes) VALUES
('emergency', 'Emergency', '#dc2626', 1, 15, 60),
('critical', 'Critical', '#ef4444', 2, 30, 120),
('high', 'High', '#f97316', 3, 60, 240),
('medium', 'Medium', '#eab308', 4, 240, 480),
('low', 'Low', '#22c55e', 5, 480, 1440),
('planning', 'Planning', '#94a3b8', 6, 1440, 10080)
ON CONFLICT (name) DO NOTHING;
