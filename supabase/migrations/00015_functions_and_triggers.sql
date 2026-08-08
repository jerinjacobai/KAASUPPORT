-- File 15: supabase/migrations/00015_functions_and_triggers.sql

-- 1. Ticket Number Generator
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq;

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TICK-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad(nextval('ticket_number_seq')::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger for ticket_number
CREATE TRIGGER tr_generate_ticket_number
BEFORE INSERT ON tickets
FOR EACH ROW
WHEN (NEW.ticket_number IS NULL)
EXECUTE FUNCTION generate_ticket_number();

-- 3. update_updated_at generic function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Triggers for updated_at (sample for a few tables, would need for all)
CREATE TRIGGER tr_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. Audit Trigger Function
CREATE OR REPLACE FUNCTION log_audit_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_company_id uuid;
BEGIN
  v_user_id := auth.uid();
  -- Try to get company_id if exists in NEW or OLD
  BEGIN
    IF TG_OP = 'DELETE' THEN
      EXECUTE 'SELECT company_id FROM ' || TG_TABLE_NAME || ' WHERE id = $1' INTO v_company_id USING OLD.id;
    ELSE
      EXECUTE 'SELECT company_id FROM ' || TG_TABLE_NAME || ' WHERE id = $1' INTO v_company_id USING NEW.id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_company_id := NULL;
  END;

  INSERT INTO audit_logs (user_id, company_id, table_name, record_id, operation, old_data, new_data)
  VALUES (
    v_user_id,
    v_company_id,
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  
  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Attach audit triggers
CREATE TRIGGER tr_audit_tickets AFTER INSERT OR UPDATE OR DELETE ON tickets FOR EACH ROW EXECUTE FUNCTION log_audit_change();
CREATE TRIGGER tr_audit_assets AFTER INSERT OR UPDATE OR DELETE ON assets FOR EACH ROW EXECUTE FUNCTION log_audit_change();
CREATE TRIGGER tr_audit_amc_contracts AFTER INSERT OR UPDATE OR DELETE ON amc_contracts FOR EACH ROW EXECUTE FUNCTION log_audit_change();

-- 7. create_ticket_activity
CREATE OR REPLACE FUNCTION create_ticket_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status_id IS DISTINCT FROM NEW.status_id THEN
    INSERT INTO ticket_activities (ticket_id, user_id, activity_type, description, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'status_change', 'Status changed', OLD.status_id::text, NEW.status_id::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_ticket_activity AFTER UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION create_ticket_activity();

-- 8. handle_new_user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 9. calculate_sla_deadlines (stub for now, needs logic based on policies)
CREATE OR REPLACE FUNCTION calculate_sla_deadlines()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple insert for now, real logic would query sla_policies
  INSERT INTO ticket_sla (ticket_id, response_due_at, resolution_due_at)
  VALUES (NEW.id, now() + interval '4 hours', now() + interval '24 hours');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Trigger for SLA
CREATE TRIGGER tr_calculate_sla AFTER INSERT ON tickets FOR EACH ROW EXECUTE FUNCTION calculate_sla_deadlines();

-- 11. deduct_amc_visit
CREATE OR REPLACE FUNCTION deduct_amc_visit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- If visit is associated with a contract, deduct one
    UPDATE amc_contracts
    SET used_visits = used_visits + 1
    WHERE id = (SELECT contract_id FROM amc_visits WHERE visit_id = NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
