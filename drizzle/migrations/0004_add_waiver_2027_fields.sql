-- 2027 participant waiver: Zoom recording consent, the date typed by the
-- signer, and which waiver version they agreed to. Sensitive minor-data table;
-- RLS unchanged (no public read).
ALTER TABLE public.camp_enrollments
  ADD COLUMN recording_consent BOOLEAN,
  ADD COLUMN waiver_signed_date DATE,
  ADD COLUMN waiver_version TEXT;