
-- Explicit student INSERT policy on enrollments (own row only)
CREATE POLICY "enrollments_student_insert"
ON public.enrollments
FOR INSERT
TO authenticated
WITH CHECK (
  student_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = enrollments.class_id AND NOT c.archived
  )
);

-- Storage: teachers can read submission files for assignments they own.
-- Path convention: <student_id>/<submission_id>/<filename>
CREATE POLICY "submissions_teacher_read"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'submissions'
  AND EXISTS (
    SELECT 1
    FROM public.submissions s
    WHERE s.id::text = (storage.foldername(name))[2]
      AND public.owns_assignment(s.assignment_id, auth.uid())
  )
);

-- Storage: owners (students) can update their own files
CREATE POLICY "submissions_student_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'submissions'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'submissions'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage: owners (students) can delete their own files
CREATE POLICY "submissions_student_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'submissions'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
