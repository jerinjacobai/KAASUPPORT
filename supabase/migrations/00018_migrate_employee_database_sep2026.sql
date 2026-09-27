-- ========================================================
-- Migration: 00018_migrate_employee_database_sep2026.sql
-- Purpose: Migrate 28 Employees, 4 Departments, and 39 Physical Assets
-- Client: ISS Global Forwarding W.L.L (ISS Global Forwarding W.L.L - 01)
-- Source: Employee Database Sep2026.xlsx
-- ========================================================

-- 1. Ensure Hardware Categories
INSERT INTO public.asset_categories (name, is_active)
SELECT cat_name, true
FROM (VALUES
  ('Laptops'), ('Desktop'), ('Monitor'), ('IP-Phone'),
  ('Printer & Copier'), ('Peripherals'), ('Biometric Terminal')
) as t(cat_name)
WHERE NOT EXISTS (SELECT 1 FROM public.asset_categories WHERE name = t.cat_name);

-- 2. Drop overly restrictive hardware_type check constraint if present
ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_hardware_type_check;

-- 3. Ensure 4 Departments for ISS Global Forwarding W.L.L
INSERT INTO public.departments (id, company_id, name, code, is_active)
SELECT gen_random_uuid(), '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc'::uuid, d.name, d.code, true
FROM (VALUES
  ('Finance & Accounts', 'FIN'),
  ('Sales & Marketing', 'SALES'),
  ('Operations & Customer Service', 'OPS'),
  ('General Management', 'GMT')
) as d(name, code)
WHERE NOT EXISTS (
  SELECT 1 FROM public.departments
  WHERE company_id = '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc' AND code = d.code
);

-- 4. Provision 28 Employees & Contacts
DO $$
DECLARE
  comp_id uuid := '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc';
  usr_result jsonb;
  usr_id uuid;
BEGIN
  -- User: Alex Raju Abraham
  usr_result := public.admin_create_user(
    'alex.abraham@iss-gf.com',
    'KaaPass2026!#',
    'Alex Raju Abraham',
    'Client User',
    'Country Finance Manager',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '001850', 'department', 'FIN') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'alex.abraham@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Alex', 'Raju Abraham', 'alex.abraham@iss-gf.com', 'Country Finance Manager', 'FIN', true, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Country Finance Manager', department = 'FIN' WHERE email = 'alex.abraham@iss-gf.com';
  END IF;

  -- User: Anna Key Mercado
  usr_result := public.admin_create_user(
    'anna.mercado@iss-gf.com',
    'KaaPass2026!#',
    'Anna Key Mercado',
    'Client User',
    'Sales Executive',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '003587', 'department', 'SALES') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'anna.mercado@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Anna', 'Key Mercado', 'anna.mercado@iss-gf.com', 'Sales Executive', 'SALES', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Sales Executive', department = 'SALES' WHERE email = 'anna.mercado@iss-gf.com';
  END IF;

  -- User: Arman Antonio Austria
  usr_result := public.admin_create_user(
    'arman.austria@iss-gf.com',
    'KaaPass2026!#',
    'Arman Antonio Austria',
    'Client User',
    'Customer Service Executive',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '004913', 'department', 'OPS') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'arman.austria@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Arman', 'Antonio Austria', 'arman.austria@iss-gf.com', 'Customer Service Executive', 'OPS', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Customer Service Executive', department = 'OPS' WHERE email = 'arman.austria@iss-gf.com';
  END IF;

  -- User: Arumugapandian Kanagaraj
  usr_result := public.admin_create_user(
    'arumugapandian.kanagaraj@iss-gf.com',
    'KaaPass2026!#',
    'Arumugapandian Kanagaraj',
    'Client User',
    'Sales Executive',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '004980', 'department', 'SALES') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'arumugapandian.kanagaraj@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Arumugapandian', 'Kanagaraj', 'arumugapandian.kanagaraj@iss-gf.com', 'Sales Executive', 'SALES', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Sales Executive', department = 'SALES' WHERE email = 'arumugapandian.kanagaraj@iss-gf.com';
  END IF;

  -- User: Carina Mia Consignado
  usr_result := public.admin_create_user(
    'carina.consignado@iss-gf.com',
    'KaaPass2026!#',
    'Carina Mia Consignado',
    'Client User',
    'Customer Service Executive',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '003300', 'department', 'OPS') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'carina.consignado@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Carina', 'Mia Consignado', 'carina.consignado@iss-gf.com', 'Customer Service Executive', 'OPS', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Customer Service Executive', department = 'OPS' WHERE email = 'carina.consignado@iss-gf.com';
  END IF;

  -- User: Femina Abdul Saleem Muhammad Ali
  usr_result := public.admin_create_user(
    'femina.ali@iss-gf.com',
    'KaaPass2026!#',
    'Femina Abdul Saleem Muhammad Ali',
    'Client User',
    'Sales Executive',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '004911', 'department', 'SALES') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'femina.ali@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Femina', 'Abdul Saleem Muhammad Ali', 'femina.ali@iss-gf.com', 'Sales Executive', 'SALES', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Sales Executive', department = 'SALES' WHERE email = 'femina.ali@iss-gf.com';
  END IF;

  -- User: Glenwish Joseph Fernando
  usr_result := public.admin_create_user(
    'glenwish.fernando@iss-gf.com',
    'KaaPass2026!#',
    'Glenwish Joseph Fernando',
    'Client User',
    'Head of Sales and Marketing',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '004142', 'department', 'SALES') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'glenwish.fernando@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Glenwish', 'Joseph Fernando', 'glenwish.fernando@iss-gf.com', 'Head of Sales and Marketing', 'SALES', true, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Head of Sales and Marketing', department = 'SALES' WHERE email = 'glenwish.fernando@iss-gf.com';
  END IF;

  -- User: Hasim Madappattuparambil Ummer
  usr_result := public.admin_create_user(
    'hasim.ummer@iss-gf.com',
    'KaaPass2026!#',
    'Hasim Madappattuparambil Ummer',
    'Client User',
    'Customer Service Executive',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '004890', 'department', 'OPS') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'hasim.ummer@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Hasim', 'Madappattuparambil Ummer', 'hasim.ummer@iss-gf.com', 'Customer Service Executive', 'OPS', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Customer Service Executive', department = 'OPS' WHERE email = 'hasim.ummer@iss-gf.com';
  END IF;

  -- User: Hisham Nasar Aval Peedikayil
  usr_result := public.admin_create_user(
    'hisham.peedikayil@iss-gf.com',
    'KaaPass2026!#',
    'Hisham Nasar Aval Peedikayil',
    'Client User',
    'Pricing Executive',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '003728', 'department', 'OPS') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'hisham.peedikayil@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Hisham', 'Nasar Aval Peedikayil', 'hisham.peedikayil@iss-gf.com', 'Pricing Executive', 'OPS', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Pricing Executive', department = 'OPS' WHERE email = 'hisham.peedikayil@iss-gf.com';
  END IF;

  -- User: Jaisritha Venkatasamy
  usr_result := public.admin_create_user(
    'jaisritha.venkatasamy@iss-gf.com',
    'KaaPass2026!#',
    'Jaisritha Venkatasamy',
    'Client User',
    'Customer Service Manager',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '003586', 'department', 'OPS') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'jaisritha.venkatasamy@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Jaisritha', 'Venkatasamy', 'jaisritha.venkatasamy@iss-gf.com', 'Customer Service Manager', 'OPS', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Customer Service Manager', department = 'OPS' WHERE email = 'jaisritha.venkatasamy@iss-gf.com';
  END IF;

  -- User: Joan Bejemel Acompanado
  usr_result := public.admin_create_user(
    'joan.acompanado@iss-gf.com',
    'KaaPass2026!#',
    'Joan Bejemel Acompanado',
    'Client User',
    'Accounts Payable Accountant',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '003721', 'department', 'FIN') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'joan.acompanado@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Joan', 'Bejemel Acompanado', 'joan.acompanado@iss-gf.com', 'Accounts Payable Accountant', 'FIN', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Accounts Payable Accountant', department = 'FIN' WHERE email = 'joan.acompanado@iss-gf.com';
  END IF;

  -- User: Leila Mae Balberan
  usr_result := public.admin_create_user(
    'leila.balberan@iss-gf.com',
    'KaaPass2026!#',
    'Leila Mae Balberan',
    'Client User',
    'Sales Executive',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '003822', 'department', 'SALES') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'leila.balberan@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Leila', 'Mae Balberan', 'leila.balberan@iss-gf.com', 'Sales Executive', 'SALES', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Sales Executive', department = 'SALES' WHERE email = 'leila.balberan@iss-gf.com';
  END IF;

  -- User: Megha Sreedethan
  usr_result := public.admin_create_user(
    'megha.sreedethan@iss-gf.com',
    'KaaPass2026!#',
    'Megha Sreedethan',
    'Client User',
    'Sales Executive',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '004851', 'department', 'SALES') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'megha.sreedethan@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Megha', 'Sreedethan', 'megha.sreedethan@iss-gf.com', 'Sales Executive', 'SALES', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Sales Executive', department = 'SALES' WHERE email = 'megha.sreedethan@iss-gf.com';
  END IF;

  -- User: Mohammed Anfas
  usr_result := public.admin_create_user(
    'mohammed.anfas@iss-gf.com',
    'KaaPass2026!#',
    'Mohammed Anfas',
    'Client User',
    'Customer Service Executive',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '004764', 'department', 'OPS') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'mohammed.anfas@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Mohammed', 'Anfas', 'mohammed.anfas@iss-gf.com', 'Customer Service Executive', 'OPS', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Customer Service Executive', department = 'OPS' WHERE email = 'mohammed.anfas@iss-gf.com';
  END IF;

  -- User: Muhammed Shafi Khuraishi Kannankilath
  usr_result := public.admin_create_user(
    'muhammed.kannankilath@iss-gf.com',
    'KaaPass2026!#',
    'Muhammed Shafi Khuraishi Kannankilath',
    'Client User',
    'Messenger',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '004888', 'department', 'OPS') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'muhammed.kannankilath@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Muhammed', 'Shafi Khuraishi Kannankilath', 'muhammed.kannankilath@iss-gf.com', 'Messenger', 'OPS', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Messenger', department = 'OPS' WHERE email = 'muhammed.kannankilath@iss-gf.com';
  END IF;

  -- User: Mylene Butalid Tumbiga
  usr_result := public.admin_create_user(
    'mylene.tumbiga@iss-gf.com',
    'KaaPass2026!#',
    'Mylene Butalid Tumbiga',
    'Client User',
    'Sales Executive',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '003710', 'department', 'SALES') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'mylene.tumbiga@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Mylene', 'Butalid Tumbiga', 'mylene.tumbiga@iss-gf.com', 'Sales Executive', 'SALES', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Sales Executive', department = 'SALES' WHERE email = 'mylene.tumbiga@iss-gf.com';
  END IF;

  -- User: Noha Ahmed Kamal Ahmed Elmaghrabi
  usr_result := public.admin_create_user(
    'noha.elmaghrabi@iss-gf.com',
    'KaaPass2026!#',
    'Noha Ahmed Kamal Ahmed Elmaghrabi',
    'Client User',
    'Sales Executive',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '004265', 'department', 'SALES') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'noha.elmaghrabi@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Noha', 'Ahmed Kamal Ahmed Elmaghrabi', 'noha.elmaghrabi@iss-gf.com', 'Sales Executive', 'SALES', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Sales Executive', department = 'SALES' WHERE email = 'noha.elmaghrabi@iss-gf.com';
  END IF;

  -- User: Prasanna Kumar Ponnappan
  usr_result := public.admin_create_user(
    'prasanna.ponnappan@iss-gf.com',
    'KaaPass2026!#',
    'Prasanna Kumar Ponnappan',
    'Client User',
    'Pricing Executive',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '003657', 'department', 'OPS') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'prasanna.ponnappan@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Prasanna', 'Kumar Ponnappan', 'prasanna.ponnappan@iss-gf.com', 'Pricing Executive', 'OPS', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Pricing Executive', department = 'OPS' WHERE email = 'prasanna.ponnappan@iss-gf.com';
  END IF;

  -- User: Renjith Pulikkal Venugopal
  usr_result := public.admin_create_user(
    'renjith.venugopal@iss-gf.com',
    'KaaPass2026!#',
    'Renjith Pulikkal Venugopal',
    'Client User',
    'Accounts Receivable Accountant',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '004915', 'department', 'FIN') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'renjith.venugopal@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Renjith', 'Pulikkal Venugopal', 'renjith.venugopal@iss-gf.com', 'Accounts Receivable Accountant', 'FIN', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Accounts Receivable Accountant', department = 'FIN' WHERE email = 'renjith.venugopal@iss-gf.com';
  END IF;

  -- User: Sajeena Ummanoor
  usr_result := public.admin_create_user(
    'sajeena.ummanoor@iss-gf.com',
    'KaaPass2026!#',
    'Sajeena Ummanoor',
    'Client User',
    'Sales Executive',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '004852', 'department', 'SALES') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'sajeena.ummanoor@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Sajeena', 'Ummanoor', 'sajeena.ummanoor@iss-gf.com', 'Sales Executive', 'SALES', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Sales Executive', department = 'SALES' WHERE email = 'sajeena.ummanoor@iss-gf.com';
  END IF;

  -- User: Swaroop Madayi Kundancherry
  usr_result := public.admin_create_user(
    'swaroop.kundancherry@iss-gf.com',
    'KaaPass2026!#',
    'Swaroop Madayi Kundancherry',
    'Client User',
    'Customer Service Executive',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '004934', 'department', 'OPS') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'swaroop.kundancherry@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Swaroop', 'Madayi Kundancherry', 'swaroop.kundancherry@iss-gf.com', 'Customer Service Executive', 'OPS', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Customer Service Executive', department = 'OPS' WHERE email = 'swaroop.kundancherry@iss-gf.com';
  END IF;

  -- User: Vijay Anand Ravichandran
  usr_result := public.admin_create_user(
    'vijay.ravichandran@iss-gf.com',
    'KaaPass2026!#',
    'Vijay Anand Ravichandran',
    'Client User',
    'Chief Operating Officer',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '003571', 'department', 'GMT') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'vijay.ravichandran@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Vijay', 'Anand Ravichandran', 'vijay.ravichandran@iss-gf.com', 'Chief Operating Officer', 'GMT', true, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Chief Operating Officer', department = 'GMT' WHERE email = 'vijay.ravichandran@iss-gf.com';
  END IF;

  -- User: Prem Kumar Jegatheesan
  usr_result := public.admin_create_user(
    'prem.jegatheesan@iss-gf.com',
    'KaaPass2026!#',
    'Prem Kumar Jegatheesan',
    'Client User',
    'Customer Service Executive',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '005006', 'department', 'OPS') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'prem.jegatheesan@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Prem', 'Kumar Jegatheesan', 'prem.jegatheesan@iss-gf.com', 'Customer Service Executive', 'OPS', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Customer Service Executive', department = 'OPS' WHERE email = 'prem.jegatheesan@iss-gf.com';
  END IF;

  -- User: Mohammed Thanveer Ahamedlebbe Hasan
  usr_result := public.admin_create_user(
    'mohammed.hasan@iss-gf.com',
    'KaaPass2026!#',
    'Mohammed Thanveer Ahamedlebbe Hasan',
    'Client User',
    'Operations executive- clearance',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', 'Contract', 'department', 'OPS') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'mohammed.hasan@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Mohammed', 'Thanveer Ahamedlebbe Hasan', 'mohammed.hasan@iss-gf.com', 'Operations executive- clearance', 'OPS', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Operations executive- clearance', department = 'OPS' WHERE email = 'mohammed.hasan@iss-gf.com';
  END IF;

  -- User: Samia Ahmed Khalid Ahmaed
  usr_result := public.admin_create_user(
    'samia.ahmaed@iss-gf.com',
    'KaaPass2026!#',
    'Samia Ahmed Khalid Ahmaed',
    'Client User',
    'Business Development Manager',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '005026', 'department', 'SALES') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'samia.ahmaed@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Samia', 'Ahmed Khalid Ahmaed', 'samia.ahmaed@iss-gf.com', 'Business Development Manager', 'SALES', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Business Development Manager', department = 'SALES' WHERE email = 'samia.ahmaed@iss-gf.com';
  END IF;

  -- User: Jenzel Marie Mangaring Narciso
  usr_result := public.admin_create_user(
    'jenzel.narciso@iss-gf.com',
    'KaaPass2026!#',
    'Jenzel Marie Mangaring Narciso',
    'Client User',
    'Customer Service Executive',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '005027', 'department', 'OPS') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'jenzel.narciso@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Jenzel', 'Marie Mangaring Narciso', 'jenzel.narciso@iss-gf.com', 'Customer Service Executive', 'OPS', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Customer Service Executive', department = 'OPS' WHERE email = 'jenzel.narciso@iss-gf.com';
  END IF;

  -- User: Aravind Sreekanthan Nair
  usr_result := public.admin_create_user(
    'aravind.nair@iss-gf.com',
    'KaaPass2026!#',
    'Aravind Sreekanthan Nair',
    'Client User',
    'Business Development Manager',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '005023', 'department', 'SALES') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'aravind.nair@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Aravind', 'Sreekanthan Nair', 'aravind.nair@iss-gf.com', 'Business Development Manager', 'SALES', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Business Development Manager', department = 'SALES' WHERE email = 'aravind.nair@iss-gf.com';
  END IF;

  -- User: Arti Satish Singh
  usr_result := public.admin_create_user(
    'arti.singh@iss-gf.com',
    'KaaPass2026!#',
    'Arti Satish Singh',
    'Client User',
    'Sales Executive',
    'ISS Global Forwarding W.L.L'
  );
  usr_id := (usr_result->>'user_id')::uuid;
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('employee_code', '005062', 'department', 'SALES') WHERE id = usr_id;
  IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'arti.singh@iss-gf.com') THEN
    INSERT INTO public.contacts (company_id, user_id, first_name, last_name, email, designation, department, is_primary, is_active)
    VALUES (comp_id, usr_id, 'Arti', 'Satish Singh', 'arti.singh@iss-gf.com', 'Sales Executive', 'SALES', false, true);
  ELSE
    UPDATE public.contacts SET user_id = usr_id, designation = 'Sales Executive', department = 'SALES' WHERE email = 'arti.singh@iss-gf.com';
  END IF;

END $$;

-- 5. Insert / Upsert 39 Hardware Assets

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description, remarks
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '2e7d2de6-5a84-4011-aa90-ccb771043b6a'::uuid, '2d7e85ac-5ebc-48c9-871b-0ceab733dfde'::uuid, 'Lenovo ThinkPad (Alex Raju Abraham)', 'QADOHWNA0035', 'Lenovo ThinkPad', 'Laptops',
        'active', 'good', 'Alex Raju Abraham', 'LENOVO MT-THINK PADX13,GEN2I | Device Name :- QADOHWNA0035 | RAM 16GB, 512GB', 'Slow- RAM Upgrade'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        description = EXCLUDED.description,
        remarks = EXCLUDED.remarks,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '2e7d2de6-5a84-4011-aa90-ccb771043b6a'::uuid, 'a25c1ffd-123f-49cc-be16-02ebe645c879'::uuid, 'Lenovo Monitor L22 (Alex Raju Abraham)', 'AST-ISS-MON-001850', 'Lenovo Monitor L22', 'Monitor',
        'active', 'good', 'Alex Raju Abraham', 'Desktop Monitor for Alex Raju Abraham'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '2e7d2de6-5a84-4011-aa90-ccb771043b6a'::uuid, '8bdc10e8-72fd-4b55-a36d-cdbfd835f0c7'::uuid, 'Avaya IP Phone - Ext 101 - Avaya', 'AST-ISS-PHN-001850', 'Avaya IP Phone', 'IP-Phone',
        'active', 'good', 'Alex Raju Abraham', 'Ext 101 - Avaya'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '2e7d2de6-5a84-4011-aa90-ccb771043b6a'::uuid, '7cea9116-52a8-48c7-b182-f6a006e624a0'::uuid, 'Mouse and Keyboard(deLL) (Alex Raju Abraham)', 'AST-ISS-PER-001850', 'Mouse and Keyboard(deLL)', 'Peripherals',
        'active', 'good', 'Alex Raju Abraham', 'Mouse and Keyboard(deLL) assigned to Alex Raju Abraham'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description, remarks
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '0c7bfeb9-5f29-475c-8d0c-3eeb1af15d39'::uuid, '2d7e85ac-5ebc-48c9-871b-0ceab733dfde'::uuid, 'HP ProBook 450 (Arman Antonio Austria)', 'QADOHWNA00034', 'HP ProBook 450', 'Laptops',
        'active', 'good', 'Arman Antonio Austria', 'HP - HP probook 450 15.6inch g9 Notebook | Device Name :-QADOHWNA00034 | Ram :- 8Gb,, SSD : 512GB', 'Slow- RAM Upgrade'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        description = EXCLUDED.description,
        remarks = EXCLUDED.remarks,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '0c7bfeb9-5f29-475c-8d0c-3eeb1af15d39'::uuid, 'a25c1ffd-123f-49cc-be16-02ebe645c879'::uuid, 'Lenovo Monitor L22- (Arman Antonio Austria)', 'AST-ISS-MON-004913', 'Lenovo Monitor L22-', 'Monitor',
        'active', 'good', 'Arman Antonio Austria', 'Desktop Monitor for Arman Antonio Austria'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description, remarks
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '0c7bfeb9-5f29-475c-8d0c-3eeb1af15d39'::uuid, '2d7e85ac-5ebc-48c9-871b-0ceab733dfde'::uuid, 'HP ProBook 450 (Carina Mia Consignado)', 'QADOHWNA00031', 'HP ProBook 450', 'Laptops',
        'active', 'good', 'Carina Mia Consignado', 'HP - HP probook 450 15.6inch g9 Notebook | Device Name :-QADOHWNA00031 | Ram :- 32Gb,, SSD : 512GB', 'Laptop Keyboard Contition is Bad( some keys are missing ) and laptop ver slow also'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        description = EXCLUDED.description,
        remarks = EXCLUDED.remarks,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '0c7bfeb9-5f29-475c-8d0c-3eeb1af15d39'::uuid, 'a25c1ffd-123f-49cc-be16-02ebe645c879'::uuid, 'Lenovo Monitor L22- (Carina Mia Consignado)', 'AST-ISS-MON-003300', 'Lenovo Monitor L22-', 'Monitor',
        'active', 'good', 'Carina Mia Consignado', 'Desktop Monitor for Carina Mia Consignado'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '0c7bfeb9-5f29-475c-8d0c-3eeb1af15d39'::uuid, '8bdc10e8-72fd-4b55-a36d-cdbfd835f0c7'::uuid, 'Avaya IP Phone - Ext 119 - Avaya', 'AST-ISS-PHN-003300', 'Avaya IP Phone', 'IP-Phone',
        'active', 'good', 'Carina Mia Consignado', 'Ext 119 - Avaya'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '0c7bfeb9-5f29-475c-8d0c-3eeb1af15d39'::uuid, '7cea9116-52a8-48c7-b182-f6a006e624a0'::uuid, 'Mouse and Keyboard (Logic tech & Dell ) (Carina Mia Consignado)', 'AST-ISS-PER-003300', 'Mouse and Keyboard (Logic tech & Dell )', 'Peripherals',
        'active', 'good', 'Carina Mia Consignado', 'Mouse and Keyboard (Logic tech & Dell ) assigned to Carina Mia Consignado'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description, remarks
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '09de0ac4-fd07-4317-9cd0-b4d52bdddb2d'::uuid, '2d7e85ac-5ebc-48c9-871b-0ceab733dfde'::uuid, 'HP ProBook 450 (Glenwish Joseph Fernando)', 'QADOHWNA00030', 'HP ProBook 450', 'Laptops',
        'active', 'good', 'Glenwish Joseph Fernando', 'HP - HP probook 450 15.6inch g9 Notebook | Device Name :-QADOHWNA00030 | Ram :- 8Gb,, SSD : 512GB', ''
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        description = EXCLUDED.description,
        remarks = EXCLUDED.remarks,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '09de0ac4-fd07-4317-9cd0-b4d52bdddb2d'::uuid, 'a25c1ffd-123f-49cc-be16-02ebe645c879'::uuid, 'Lenovo Monitor L22 (Glenwish Joseph Fernando)', 'AST-ISS-MON-004142', 'Lenovo Monitor L22', 'Monitor',
        'active', 'good', 'Glenwish Joseph Fernando', 'Desktop Monitor for Glenwish Joseph Fernando'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '09de0ac4-fd07-4317-9cd0-b4d52bdddb2d'::uuid, '8bdc10e8-72fd-4b55-a36d-cdbfd835f0c7'::uuid, 'Avaya IP Phone - Ext 105 - Avaya', 'AST-ISS-PHN-004142', 'Avaya IP Phone', 'IP-Phone',
        'active', 'good', 'Glenwish Joseph Fernando', 'Ext 105 - Avaya'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '09de0ac4-fd07-4317-9cd0-b4d52bdddb2d'::uuid, '7cea9116-52a8-48c7-b182-f6a006e624a0'::uuid, 'Dell Mouse and Keyboard (Glenwish Joseph Fernando)', 'AST-ISS-PER-004142', 'Dell Mouse and Keyboard', 'Peripherals',
        'active', 'good', 'Glenwish Joseph Fernando', 'Dell Mouse and Keyboard assigned to Glenwish Joseph Fernando'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description, remarks
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '0c7bfeb9-5f29-475c-8d0c-3eeb1af15d39'::uuid, '2d7e85ac-5ebc-48c9-871b-0ceab733dfde'::uuid, 'Lenovo ThinkPad (Hasim Madappattuparambil Ummer)', 'AST-ISS-LAP-004890', 'Lenovo ThinkPad', 'Laptops',
        'active', 'good', 'Hasim Madappattuparambil Ummer', 'Lenovo - thinkpad  e16 Gen3- ULTRA 5 | Sys Model : 21sr005jgr | Ram :- 24Gb,, SSD : 512GB', 'system Hang issue'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        description = EXCLUDED.description,
        remarks = EXCLUDED.remarks,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '0c7bfeb9-5f29-475c-8d0c-3eeb1af15d39'::uuid, 'a25c1ffd-123f-49cc-be16-02ebe645c879'::uuid, 'Lenovo Monitor L22-E (Hasim Madappattuparambil Ummer)', 'AST-ISS-MON-004890', 'Lenovo Monitor L22-E', 'Monitor',
        'active', 'good', 'Hasim Madappattuparambil Ummer', 'Desktop Monitor for Hasim Madappattuparambil Ummer'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description, remarks
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '0c7bfeb9-5f29-475c-8d0c-3eeb1af15d39'::uuid, '2d7e85ac-5ebc-48c9-871b-0ceab733dfde'::uuid, 'HP ProBook 450 (Hisham Nasar Aval Peedikayil)', 'QADOHWNA00026', 'HP ProBook 450', 'Laptops',
        'active', 'good', 'Hisham Nasar Aval Peedikayil', 'HP - HP probook 450 15.6inch g9 Notebook | Device Name :-QADOHWNA00026 | Ram :- 8Gb,, SSD : 512GB', 'Slowness'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        description = EXCLUDED.description,
        remarks = EXCLUDED.remarks,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '0c7bfeb9-5f29-475c-8d0c-3eeb1af15d39'::uuid, 'a25c1ffd-123f-49cc-be16-02ebe645c879'::uuid, 'Lenovo Monitor L22 (Hisham Nasar Aval Peedikayil)', 'AST-ISS-MON-003728', 'Lenovo Monitor L22', 'Monitor',
        'active', 'good', 'Hisham Nasar Aval Peedikayil', 'Desktop Monitor for Hisham Nasar Aval Peedikayil'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '0c7bfeb9-5f29-475c-8d0c-3eeb1af15d39'::uuid, '7cea9116-52a8-48c7-b182-f6a006e624a0'::uuid, 'Mouse ( Logic) (Hisham Nasar Aval Peedikayil)', 'AST-ISS-PER-003728', 'Mouse ( Logic)', 'Peripherals',
        'active', 'good', 'Hisham Nasar Aval Peedikayil', 'Mouse ( Logic) assigned to Hisham Nasar Aval Peedikayil'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description, remarks
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '2e7d2de6-5a84-4011-aa90-ccb771043b6a'::uuid, '2d7e85ac-5ebc-48c9-871b-0ceab733dfde'::uuid, 'HP ProBook 450 (Joan Bejemel Acompanado)', 'QADOHWNA00015', 'HP ProBook 450', 'Laptops',
        'active', 'good', 'Joan Bejemel Acompanado', 'HP PROBOOK 450G8NOTEBOOK PC | Device Name: qadohwna00015 | Ram:-8Gb | SSD: 512GB', 'Slowness'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        description = EXCLUDED.description,
        remarks = EXCLUDED.remarks,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '2e7d2de6-5a84-4011-aa90-ccb771043b6a'::uuid, 'a25c1ffd-123f-49cc-be16-02ebe645c879'::uuid, 'Lenovo Monitor L22 (Joan Bejemel Acompanado)', 'AST-ISS-MON-003721', 'Lenovo Monitor L22', 'Monitor',
        'active', 'good', 'Joan Bejemel Acompanado', 'Desktop Monitor for Joan Bejemel Acompanado'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '2e7d2de6-5a84-4011-aa90-ccb771043b6a'::uuid, '8bdc10e8-72fd-4b55-a36d-cdbfd835f0c7'::uuid, 'Avaya IP Phone - Ext :118 -Avaya', 'AST-ISS-PHN-003721', 'Avaya IP Phone', 'IP-Phone',
        'active', 'good', 'Joan Bejemel Acompanado', 'Ext :118 -Avaya'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '2e7d2de6-5a84-4011-aa90-ccb771043b6a'::uuid, '7cea9116-52a8-48c7-b182-f6a006e624a0'::uuid, 'Dell KeyBoard and Mouse (Joan Bejemel Acompanado)', 'AST-ISS-PER-003721', 'Dell KeyBoard and Mouse', 'Peripherals',
        'active', 'good', 'Joan Bejemel Acompanado', 'Dell KeyBoard and Mouse assigned to Joan Bejemel Acompanado'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description, remarks
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '0c7bfeb9-5f29-475c-8d0c-3eeb1af15d39'::uuid, '2d7e85ac-5ebc-48c9-871b-0ceab733dfde'::uuid, 'Notebook PC (Prasanna Kumar Ponnappan)', 'AST-ISS-LAP-003657', 'Notebook PC', 'Laptops',
        'active', 'good', 'Prasanna Kumar Ponnappan', 'HP proobook 450g8 Nootbook Pc | QADOHwna00021 | 16GB RAM | 512 SSD', 'Slow (  New System Assigned )'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        description = EXCLUDED.description,
        remarks = EXCLUDED.remarks,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description, remarks
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '2e7d2de6-5a84-4011-aa90-ccb771043b6a'::uuid, '2d7e85ac-5ebc-48c9-871b-0ceab733dfde'::uuid, 'Lenovo ThinkPad (Renjith Pulikkal Venugopal)', 'AST-ISS-LAP-004915', 'Lenovo ThinkPad', 'Laptops',
        'active', 'good', 'Renjith Pulikkal Venugopal', 'Lenovo - thinkpad  e16 Gen3- ULTRA 5 |  | Ram :- 8Gb,, SSD : 512GB', 'Slow'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        description = EXCLUDED.description,
        remarks = EXCLUDED.remarks,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '2e7d2de6-5a84-4011-aa90-ccb771043b6a'::uuid, 'a25c1ffd-123f-49cc-be16-02ebe645c879'::uuid, 'Lenovo Monitor L22 (Renjith Pulikkal Venugopal)', 'AST-ISS-MON-004915', 'Lenovo Monitor L22', 'Monitor',
        'active', 'good', 'Renjith Pulikkal Venugopal', 'Desktop Monitor for Renjith Pulikkal Venugopal'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '2e7d2de6-5a84-4011-aa90-ccb771043b6a'::uuid, '7cea9116-52a8-48c7-b182-f6a006e624a0'::uuid, 'Dell KeyBoard and Mouse (Renjith Pulikkal Venugopal)', 'AST-ISS-PER-004915', 'Dell KeyBoard and Mouse', 'Peripherals',
        'active', 'good', 'Renjith Pulikkal Venugopal', 'Dell KeyBoard and Mouse assigned to Renjith Pulikkal Venugopal'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description, remarks
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '0c7bfeb9-5f29-475c-8d0c-3eeb1af15d39'::uuid, '2d7e85ac-5ebc-48c9-871b-0ceab733dfde'::uuid, 'HP ProBook 450 (Swaroop Madayi Kundancherry)', 'QADOHWNA00025', 'HP ProBook 450', 'Laptops',
        'active', 'good', 'Swaroop Madayi Kundancherry', 'HP - HP probook 450 15.6inch g9 Notebook | Device Name :-QADOHWNA00025 | Ram :- 8Gb,, SSD : 512GB', 'slow'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        description = EXCLUDED.description,
        remarks = EXCLUDED.remarks,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description, remarks
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '0c7bfeb9-5f29-475c-8d0c-3eeb1af15d39'::uuid, '2d7e85ac-5ebc-48c9-871b-0ceab733dfde'::uuid, 'Lenovo ThinkPad (Prem Kumar Jegatheesan)', 'AST-ISS-LAP-005006', 'Lenovo ThinkPad', 'Laptops',
        'active', 'good', 'Prem Kumar Jegatheesan', 'Lenovo - thinkpad  e14 Gen7 | Sys Model : 21u2003ygr | Ram :- 16Gb,, SSD : 512GB', ''
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        description = EXCLUDED.description,
        remarks = EXCLUDED.remarks,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '0c7bfeb9-5f29-475c-8d0c-3eeb1af15d39'::uuid, 'a25c1ffd-123f-49cc-be16-02ebe645c879'::uuid, 'Lenovo Monitor L22 (Prem Kumar Jegatheesan)', 'AST-ISS-MON-005006', 'Lenovo Monitor L22', 'Monitor',
        'active', 'good', 'Prem Kumar Jegatheesan', 'Desktop Monitor for Prem Kumar Jegatheesan'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description, remarks
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '0c7bfeb9-5f29-475c-8d0c-3eeb1af15d39'::uuid, '2d7e85ac-5ebc-48c9-871b-0ceab733dfde'::uuid, 'Lenovo ThinkPad (Mohammed Thanveer Ahamedlebbe Hasan)', 'AST-ISS-LAP-L1', 'Lenovo ThinkPad', 'Laptops',
        'active', 'good', 'Mohammed Thanveer Ahamedlebbe Hasan', 'Lenovo - thinkpad  e16 Gen3- ULTRA 5 | Sys Model : 21ma000bgr | Ram :- 8Gb,, SSD : 512GB', 'Slow - Ram Upgarde'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        description = EXCLUDED.description,
        remarks = EXCLUDED.remarks,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '0c7bfeb9-5f29-475c-8d0c-3eeb1af15d39'::uuid, 'a25c1ffd-123f-49cc-be16-02ebe645c879'::uuid, 'Benq Monitor ,Lenovo Monitor (Mohammed Thanveer Ahamedlebbe Hasan)', 'AST-ISS-MON-M2', 'Benq Monitor ,Lenovo Monitor', 'Monitor',
        'active', 'good', 'Mohammed Thanveer Ahamedlebbe Hasan', 'Desktop Monitor for Mohammed Thanveer Ahamedlebbe Hasan'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '0c7bfeb9-5f29-475c-8d0c-3eeb1af15d39'::uuid, '7cea9116-52a8-48c7-b182-f6a006e624a0'::uuid, 'HP Hub - HDMi Connection (Mohammed Thanveer Ahamedlebbe Hasan)', 'AST-ISS-OTH-O3', 'HP Hub - HDMi Connection', 'Peripherals',
        'active', 'good', 'Mohammed Thanveer Ahamedlebbe Hasan', 'HP Hub - HDMi Connection assigned to Mohammed Thanveer Ahamedlebbe Hasan'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

      INSERT INTO public.assets (
        company_id, department_id, category_id, name, asset_tag, model, hardware_type,
        status, condition, asset_user, description, remarks
      ) VALUES (
        '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', '0c7bfeb9-5f29-475c-8d0c-3eeb1af15d39'::uuid, '2d7e85ac-5ebc-48c9-871b-0ceab733dfde'::uuid, 'Lenovo ThinkPad (Jenzel Marie Mangaring Narciso)', 'AST-ISS-LAP-005027', 'Lenovo ThinkPad', 'Laptops',
        'active', 'good', 'Jenzel Marie Mangaring Narciso', 'Lenovo - thinkpad  e14 Gen7 | Sys Model :  21u2003ygr | Ram :- 16Gb,, SSD : 512GB', 'slow'
      )
      ON CONFLICT (asset_tag) DO UPDATE SET
        asset_user = EXCLUDED.asset_user,
        description = EXCLUDED.description,
        remarks = EXCLUDED.remarks,
        department_id = EXCLUDED.department_id,
        category_id = EXCLUDED.category_id;
    

    INSERT INTO public.assets (
      company_id, category_id, name, asset_tag, model, hardware_type,
      status, condition, location, asset_user, description
    ) VALUES (
      '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', 'a0bcd2bc-c61c-4c9c-bdf0-e1be3a9b3d35'::uuid, 'HP LASERJET P2035', 'AST-ISS-SHR-01', 'LASERJET P2035', 'Printer & Copier',
      'active', 'good', 'STAFF AREA', 'Shared Office Equipment', 'Shared office equipment at STAFF AREA'
    )
    ON CONFLICT (asset_tag) DO UPDATE SET
      location = EXCLUDED.location,
      asset_user = EXCLUDED.asset_user,
      category_id = EXCLUDED.category_id;
  

    INSERT INTO public.assets (
      company_id, category_id, name, asset_tag, model, hardware_type,
      status, condition, location, asset_user, description
    ) VALUES (
      '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', 'a0bcd2bc-c61c-4c9c-bdf0-e1be3a9b3d35'::uuid, 'CANON', 'AST-ISS-SHR-02', 'CANON', 'Printer & Copier',
      'active', 'good', 'STAFF AREA', 'Shared Office Equipment', 'Shared office equipment at STAFF AREA'
    )
    ON CONFLICT (asset_tag) DO UPDATE SET
      location = EXCLUDED.location,
      asset_user = EXCLUDED.asset_user,
      category_id = EXCLUDED.category_id;
  

    INSERT INTO public.assets (
      company_id, category_id, name, asset_tag, model, hardware_type,
      status, condition, location, asset_user, description
    ) VALUES (
      '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', 'a0bcd2bc-c61c-4c9c-bdf0-e1be3a9b3d35'::uuid, 'HP LASERJET M283FDW', 'AST-ISS-SHR-03', 'LASERJET M283FDW', 'Printer & Copier',
      'active', 'good', 'ALEX', 'Alex Raju Abraham', 'Shared office equipment at ALEX'
    )
    ON CONFLICT (asset_tag) DO UPDATE SET
      location = EXCLUDED.location,
      asset_user = EXCLUDED.asset_user,
      category_id = EXCLUDED.category_id;
  

    INSERT INTO public.assets (
      company_id, category_id, name, asset_tag, model, hardware_type,
      status, condition, location, asset_user, description
    ) VALUES (
      '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', 'a0bcd2bc-c61c-4c9c-bdf0-e1be3a9b3d35'::uuid, 'UTAX 2508CI', 'AST-ISS-SHR-04', '2508CI', 'Printer & Copier',
      'active', 'good', 'STAFF AREA', 'Shared Office Equipment', 'Shared office equipment at STAFF AREA'
    )
    ON CONFLICT (asset_tag) DO UPDATE SET
      location = EXCLUDED.location,
      asset_user = EXCLUDED.asset_user,
      category_id = EXCLUDED.category_id;
  

    INSERT INTO public.assets (
      company_id, category_id, name, asset_tag, model, hardware_type,
      status, condition, location, asset_user, description
    ) VALUES (
      '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc', 'f9a4eeec-9acb-47d9-9e44-176ec4585c6b'::uuid, 'BIOTIME - ZKTECO ETRANCE', 'AST-ISS-SHR-05', 'ETRANCE', 'Biometric Terminal',
      'active', 'good', 'STAFF AREA', 'Shared Office Equipment', 'Shared office equipment at STAFF AREA'
    )
    ON CONFLICT (asset_tag) DO UPDATE SET
      location = EXCLUDED.location,
      asset_user = EXCLUDED.asset_user,
      category_id = EXCLUDED.category_id;
  