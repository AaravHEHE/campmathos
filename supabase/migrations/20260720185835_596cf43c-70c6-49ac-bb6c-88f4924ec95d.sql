-- Google Classroom sync tables + registration link columns

CREATE TABLE public.classroom_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id text NOT NULL,
  course_name text,
  google_user_id text NOT NULL,
  email text,
  given_name text,
  family_name text,
  full_name text,
  joined_at timestamptz,
  last_synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, google_user_id)
);
GRANT SELECT ON public.classroom_students TO authenticated;
GRANT ALL ON public.classroom_students TO service_role;
ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read classroom_students"
  ON public.classroom_students FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_classroom_students_updated_at
  BEFORE UPDATE ON public.classroom_students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_classroom_students_course ON public.classroom_students(course_id);
CREATE INDEX idx_classroom_students_email ON public.classroom_students(lower(email));
CREATE INDEX idx_classroom_students_name ON public.classroom_students(lower(full_name));

CREATE TABLE public.classroom_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id text NOT NULL,
  coursework_id text NOT NULL,
  coursework_title text,
  due_at timestamptz,
  google_user_id text NOT NULL,
  state text,
  late boolean NOT NULL DEFAULT false,
  assigned_grade numeric,
  gc_updated_at timestamptz,
  last_synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, coursework_id, google_user_id)
);
GRANT SELECT ON public.classroom_submissions TO authenticated;
GRANT ALL ON public.classroom_submissions TO service_role;
ALTER TABLE public.classroom_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read classroom_submissions"
  ON public.classroom_submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_classroom_submissions_updated_at
  BEFORE UPDATE ON public.classroom_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_classroom_submissions_student
  ON public.classroom_submissions(course_id, google_user_id);

-- Link registrations to a classroom student
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS classroom_course_id text,
  ADD COLUMN IF NOT EXISTS classroom_google_user_id text,
  ADD COLUMN IF NOT EXISTS classroom_match_status text
    NOT NULL DEFAULT 'unmatched';
