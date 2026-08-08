-- File 6: supabase/migrations/00006_sla_and_escalation_tables.sql

CREATE TABLE IF NOT EXISTS sla_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  description text,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sla_policy_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sla_policy_id uuid REFERENCES sla_policies(id) ON DELETE CASCADE,
  priority_id uuid REFERENCES ticket_priorities(id) ON DELETE CASCADE,
  response_time_minutes int NOT NULL,
  resolution_time_minutes int NOT NULL,
  business_hours_only boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_sla (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE UNIQUE,
  sla_policy_id uuid REFERENCES sla_policies(id) ON DELETE SET NULL,
  response_due_at timestamptz,
  resolution_due_at timestamptz,
  first_responded_at timestamptz,
  resolved_at timestamptz,
  response_breached boolean DEFAULT false,
  resolution_breached boolean DEFAULT false,
  paused_at timestamptz,
  total_paused_minutes int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS escalation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  priority_id uuid REFERENCES ticket_priorities(id) ON DELETE CASCADE,
  trigger_type text CHECK (trigger_type IN ('response_breach','resolution_breach','no_assignment','customer_complaint')),
  trigger_minutes int,
  notify_role_id uuid REFERENCES roles(id) ON DELETE SET NULL,
  notify_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  auto_reassign boolean DEFAULT false,
  escalation_level int DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS escalation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  escalation_rule_id uuid REFERENCES escalation_rules(id) ON DELETE SET NULL,
  level int,
  from_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  to_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);
