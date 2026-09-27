-- ========================================================
-- Migration: 00019_tickets_category_priority_status.sql
-- Purpose: Add category, priority, and status text columns to public.tickets
--          with bidirectional synchronization trigger for FKs (category_id, priority_id, status_id)
-- ========================================================

-- 1. Add text columns with default values
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'Hardware',
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS status text DEFAULT 'open';

-- 2. Trigger function to synchronize text values and lookup foreign keys
CREATE OR REPLACE FUNCTION public.sync_tickets_text_and_fk()
RETURNS trigger AS $$
BEGIN
  -- Sync Category
  IF NEW.category IS NOT NULL AND NEW.category_id IS NULL THEN
    SELECT id INTO NEW.category_id FROM public.ticket_categories 
    WHERE LOWER(name) = LOWER(NEW.category) LIMIT 1;
  ELSIF NEW.category_id IS NOT NULL AND (NEW.category IS NULL OR NEW.category = '') THEN
    SELECT name INTO NEW.category FROM public.ticket_categories 
    WHERE id = NEW.category_id LIMIT 1;
  END IF;

  -- Sync Priority
  IF NEW.priority IS NOT NULL AND NEW.priority_id IS NULL THEN
    SELECT id INTO NEW.priority_id FROM public.ticket_priorities 
    WHERE LOWER(name) = LOWER(NEW.priority) LIMIT 1;
  ELSIF NEW.priority_id IS NOT NULL AND (NEW.priority IS NULL OR NEW.priority = '') THEN
    SELECT name INTO NEW.priority FROM public.ticket_priorities 
    WHERE id = NEW.priority_id LIMIT 1;
  END IF;

  -- Sync Status
  IF NEW.status IS NOT NULL AND NEW.status_id IS NULL THEN
    SELECT id INTO NEW.status_id FROM public.ticket_statuses 
    WHERE LOWER(name) = LOWER(NEW.status) LIMIT 1;
    IF NEW.status_id IS NULL AND LOWER(NEW.status) = 'open' THEN
      SELECT id INTO NEW.status_id FROM public.ticket_statuses 
      WHERE LOWER(name) = 'new' LIMIT 1;
    END IF;
  ELSIF NEW.status_id IS NOT NULL AND (NEW.status IS NULL OR NEW.status = '') THEN
    SELECT name INTO NEW.status FROM public.ticket_statuses 
    WHERE id = NEW.status_id LIMIT 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_tickets_text_and_fk ON public.tickets;
CREATE TRIGGER trg_sync_tickets_text_and_fk
BEFORE INSERT OR UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.sync_tickets_text_and_fk();

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
