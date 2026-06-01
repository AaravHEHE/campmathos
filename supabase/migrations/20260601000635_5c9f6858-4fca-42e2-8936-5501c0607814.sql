
-- Tighten student update policy on submissions: forbid setting grade/status fields.
-- All real submission writes go through server functions using the admin client.
DROP POLICY IF EXISTS "submissions_student_update" ON public.submissions;

CREATE POLICY "submissions_student_update"
ON public.submissions
FOR UPDATE
TO authenticated
USING (student_id = auth.uid() AND status = 'in_progress')
WITH CHECK (
  student_id = auth.uid()
  AND status = 'in_progress'
  AND final_score IS NULL
  AND auto_score IS NULL
  AND graded_by IS NULL
  AND graded_at IS NULL
  AND teacher_feedback IS NULL
  AND submitted_at IS NULL
);

-- Remove overly broad teacher read on submissions storage bucket.
-- No student uploads currently use storage; reintroduce a class-scoped policy when uploads are added.
DROP POLICY IF EXISTS "submissions_bucket_teacher_read" ON storage.objects;
