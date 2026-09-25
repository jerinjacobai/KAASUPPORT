ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS asset_user text,
  ADD COLUMN IF NOT EXISTS hardware_type text NOT NULL DEFAULT 'Laptops'
    CHECK (hardware_type IN ('Laptops', 'Monitor')),
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS remarks text,
  ADD COLUMN IF NOT EXISTS suggestion text,
  ADD COLUMN IF NOT EXISTS provision_path text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('asset-provisions', 'asset-provisions', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "authenticated_upload_asset_provisions"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'asset-provisions');

CREATE POLICY "authenticated_read_asset_provisions"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'asset-provisions');
