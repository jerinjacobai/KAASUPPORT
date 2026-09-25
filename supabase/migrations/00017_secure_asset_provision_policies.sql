DROP POLICY IF EXISTS "authenticated_upload_asset_provisions" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_read_asset_provisions" ON storage.objects;

CREATE POLICY "authenticated_upload_own_asset_provisions"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'asset-provisions'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "company_read_asset_provisions"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'asset-provisions'
    AND EXISTS (
      SELECT 1
      FROM public.assets AS a
      WHERE a.provision_path = storage.objects.name
    )
  );
