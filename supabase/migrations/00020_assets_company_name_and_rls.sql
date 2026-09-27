-- Migration 00020: Assets company_name denormalization and RLS policies update
-- Ensures company name is directly stored and retrievable on assets without falling back to defaults

-- 1. Ensure company_name column exists on public.assets and populate it
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS company_name text;

UPDATE public.assets a 
SET company_name = c.name 
FROM public.companies c 
WHERE a.company_id = c.id;

-- Fallback to ensure all assets have the company name set to ISS Global Forwarding W.L.L
UPDATE public.assets
SET company_name = 'ISS Global Forwarding W.L.L'
WHERE company_name IS NULL OR company_name = '' OR company_name = 'KAA Client' OR company_name = 'International Technical Legacy';

-- Also update any lingering tickets
UPDATE public.tickets
SET company_id = '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc',
    contact_name = 'ISS Global Forwarding W.L.L'
WHERE company_id = '39856580-5cb7-4f50-9e9e-1b0ff6f70c7a' OR contact_name = 'International Technical Legacy';

-- Update qataritl037 user to ISS
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"is_kaa_internal": true, "company": "ISS Global Forwarding W.L.L", "company_id": "19d7c2df-46ed-43dd-bd48-3cbd6249c9dc"}'::jsonb
WHERE email = 'qataritl037@gmail.com';

INSERT INTO public.user_company_access (user_id, company_id)
VALUES ('3ece8d7f-449b-498f-8c50-faf7556cce3e', '19d7c2df-46ed-43dd-bd48-3cbd6249c9dc')
ON CONFLICT (user_id, company_id) DO NOTHING;

-- 2. Update RLS policies on companies so all authenticated users can view company masters
DROP POLICY IF EXISTS "companies_select_policy" ON public.companies;
CREATE POLICY "companies_select_policy" ON public.companies FOR SELECT USING (true);

-- 3. Update RLS policies on assets for universal visibility and authorized updates
DROP POLICY IF EXISTS "assets_select_policy" ON public.assets;
CREATE POLICY "assets_select_policy" ON public.assets FOR SELECT USING (true);

DROP POLICY IF EXISTS "assets_update_policy" ON public.assets;
CREATE POLICY "assets_update_policy" ON public.assets FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "assets_insert_policy" ON public.assets;
CREATE POLICY "assets_insert_policy" ON public.assets FOR INSERT TO authenticated WITH CHECK (true);
