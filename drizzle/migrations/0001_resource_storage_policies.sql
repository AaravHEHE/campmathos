CREATE POLICY resource_files_admin_all ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id IN ('resource-files','resource-thumbnails') AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id IN ('resource-files','resource-thumbnails') AND public.has_role(auth.uid(), 'admin'));