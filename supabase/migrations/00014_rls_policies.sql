-- File 14: supabase/migrations/00014_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_company_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_watchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_policy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_sla ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineers ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineer_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineer_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE amc_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE amc_contract_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE amc_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_article_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_article_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE csat_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_log ENABLE ROW LEVEL SECURITY;

-- 1. profiles: Users can read their own profile, KAA staff can read all (assuming some simple logic)
CREATE POLICY "user_read_profile" ON profiles FOR SELECT USING (auth.uid() = id OR is_kaa_internal = true);
CREATE POLICY "user_update_profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. companies: Users can only see companies they have access to via user_company_access
CREATE POLICY "company_isolation" ON companies
  FOR ALL TO authenticated
  USING (id IN (SELECT kaa.current_user_company_ids()))
  WITH CHECK (id IN (SELECT kaa.current_user_company_ids()));

-- 3. branches: Scoped to user's company access
CREATE POLICY "company_isolation" ON branches
  FOR ALL TO authenticated
  USING (company_id IN (SELECT kaa.current_user_company_ids()))
  WITH CHECK (company_id IN (SELECT kaa.current_user_company_ids()));

-- departments: Scoped to user's company access
CREATE POLICY "company_isolation" ON departments
  FOR ALL TO authenticated
  USING (company_id IN (SELECT kaa.current_user_company_ids()))
  WITH CHECK (company_id IN (SELECT kaa.current_user_company_ids()));

-- 4. tickets: Company-scoped via user_company_access
CREATE POLICY "company_isolation" ON tickets
  FOR ALL TO authenticated
  USING (company_id IN (SELECT kaa.current_user_company_ids()))
  WITH CHECK (company_id IN (SELECT kaa.current_user_company_ids()));

-- 5. ticket_comments, activities, attachments
CREATE POLICY "company_isolation" ON ticket_comments
  FOR ALL TO authenticated
  USING (ticket_id IN (SELECT id FROM tickets WHERE company_id IN (SELECT kaa.current_user_company_ids())))
  WITH CHECK (ticket_id IN (SELECT id FROM tickets WHERE company_id IN (SELECT kaa.current_user_company_ids())));

CREATE POLICY "company_isolation" ON ticket_activities
  FOR ALL TO authenticated
  USING (ticket_id IN (SELECT id FROM tickets WHERE company_id IN (SELECT kaa.current_user_company_ids())))
  WITH CHECK (ticket_id IN (SELECT id FROM tickets WHERE company_id IN (SELECT kaa.current_user_company_ids())));

CREATE POLICY "company_isolation" ON ticket_attachments
  FOR ALL TO authenticated
  USING (ticket_id IN (SELECT id FROM tickets WHERE company_id IN (SELECT kaa.current_user_company_ids())))
  WITH CHECK (ticket_id IN (SELECT id FROM tickets WHERE company_id IN (SELECT kaa.current_user_company_ids())));

-- 8. assets: Company-scoped
CREATE POLICY "company_isolation" ON assets
  FOR ALL TO authenticated
  USING (company_id IN (SELECT kaa.current_user_company_ids()))
  WITH CHECK (company_id IN (SELECT kaa.current_user_company_ids()));

-- 9. amc_contracts: Company-scoped
CREATE POLICY "company_isolation" ON amc_contracts
  FOR ALL TO authenticated
  USING (company_id IN (SELECT kaa.current_user_company_ids()))
  WITH CHECK (company_id IN (SELECT kaa.current_user_company_ids()));

-- 11. kb_articles: Public read for published
CREATE POLICY "public_read_kb" ON kb_articles
  FOR SELECT TO authenticated
  USING (status = 'published');

-- 12. notifications: User can only see their own
CREATE POLICY "user_notifications" ON notifications
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 13. audit_logs: Read-only, company-scoped for clients, all for KAA admins. NO UPDATE OR DELETE policy.
CREATE POLICY "company_isolation_audit" ON audit_logs
  FOR SELECT TO authenticated
  USING (company_id IN (SELECT kaa.current_user_company_ids()));
