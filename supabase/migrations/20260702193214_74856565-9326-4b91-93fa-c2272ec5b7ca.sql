
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS student_first_name text,
  ADD COLUMN IF NOT EXISTS student_last_name text,
  ADD COLUMN IF NOT EXISTS parent_first_name text,
  ADD COLUMN IF NOT EXISTS parent_last_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS grade_level text;
