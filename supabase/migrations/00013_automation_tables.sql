-- File 13: supabase/migrations/00013_automation_tables.sql

CREATE TABLE IF NOT EXISTS automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  trigger_event text CHECK (trigger_event IN ('ticket_created','ticket_updated','status_changed','priority_changed','sla_breach','assignment_changed','comment_added')),
  conditions jsonb,
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES automation_rules(id) ON DELETE CASCADE,
  action_type text CHECK (action_type IN ('change_status','change_priority','assign_to','add_tag','send_notification','add_comment','escalate','webhook')),
  action_config jsonb,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES automation_rules(id) ON DELETE SET NULL,
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  action_type text,
  result text,
  error text,
  executed_at timestamptz DEFAULT now()
);
