-- File 2: supabase/migrations/00002_identity_tables.sql

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  phone text,
  timezone text DEFAULT 'UTC',
  locale text DEFAULT 'en',
  theme_preference text DEFAULT 'light',
  is_kaa_internal boolean DEFAULT false,
  is_active boolean DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text,
  description text,
  is_kaa_internal boolean DEFAULT false,
  is_system boolean DEFAULT false,
  permissions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  module text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  company_id uuid, -- Reference added later or nullable for global
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address inet,
  user_agent text,
  device_info jsonb,
  location jsonb,
  logged_in_at timestamptz DEFAULT now(),
  logged_out_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  company_id uuid,
  table_name text,
  record_id uuid,
  operation text CHECK (operation IN ('INSERT','UPDATE','DELETE')),
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Insert Default Roles
INSERT INTO roles (name, display_name, is_kaa_internal, is_system) VALUES
('super_admin', 'Super Admin', true, true),
('support_manager', 'Support Manager', true, true),
('service_coordinator', 'Service Coordinator', true, true),
('dispatcher', 'Dispatcher', true, true),
('engineer', 'Engineer', true, true),
('senior_engineer', 'Senior Engineer', true, true),
('project_manager_internal', 'Project Manager', true, true),
('sales', 'Sales', true, true),
('amc_manager', 'AMC Manager', true, true),
('inventory_manager', 'Inventory Manager', true, true),
('finance', 'Finance', true, true),
('management', 'Management', true, true),
('company_admin', 'Company Admin', false, true),
('client_project_manager', 'Client Project Manager', false, true),
('department_head', 'Department Head', false, true),
('employee', 'Employee', false, true),
('requester', 'Requester', false, true),
('approver', 'Approver', false, true),
('read_only', 'Read Only User', false, true)
ON CONFLICT (name) DO NOTHING;
