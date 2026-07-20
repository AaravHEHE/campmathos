
DROP POLICY IF EXISTS "submissions_bucket_student_insert" ON storage.objects;
DROP POLICY IF EXISTS "submissions_student_update" ON storage.objects;
DROP POLICY IF EXISTS "submissions_student_delete" ON storage.objects;

CREATE POLICY "submissions_bucket_student_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'submissions'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id::text = (storage.foldername(name))[2]
      AND s.student_id = auth.uid()
      AND s.status = 'in_progress'
  )
);

CREATE POLICY "submissions_student_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'submissions'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id::text = (storage.foldername(name))[2]
      AND s.student_id = auth.uid()
      AND s.status = 'in_progress'
  )
)
WITH CHECK (
  bucket_id = 'submissions'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id::text = (storage.foldername(name))[2]
      AND s.student_id = auth.uid()
      AND s.status = 'in_progress'
  )
);

CREATE POLICY "submissions_student_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'submissions'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id::text = (storage.foldername(name))[2]
      AND s.student_id = auth.uid()
      AND s.status = 'in_progress'
  )
);
