
-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================
-- Tables (create all first, add policies after helpers)
-- ============================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  description TEXT,
  join_code TEXT NOT NULL UNIQUE CHECK (join_code ~ '^[A-Z0-9]{4,12}$'),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX classes_teacher_idx ON public.classes(teacher_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER classes_updated_at BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(class_id, student_id)
);
CREATE INDEX enrollments_student_idx ON public.enrollments(student_id);
CREATE INDEX enrollments_class_idx ON public.enrollments(class_id);
GRANT SELECT, INSERT, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  instructions TEXT,
  due_at TIMESTAMPTZ,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX assignments_class_idx ON public.assignments(class_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER assignments_updated_at BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TYPE public.problem_type AS ENUM ('short', 'mcq', 'free');

CREATE TABLE public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  type public.problem_type NOT NULL,
  prompt TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 1 CHECK (points >= 0 AND points <= 1000),
  correct_answer TEXT,
  choices JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX problems_assignment_idx ON public.problems(assignment_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.problems TO authenticated;
GRANT ALL ON public.problems TO service_role;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

CREATE TYPE public.submission_status AS ENUM ('in_progress', 'submitted', 'graded');

CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.submission_status NOT NULL DEFAULT 'in_progress',
  submitted_at TIMESTAMPTZ,
  auto_score INTEGER,
  final_score INTEGER,
  max_score INTEGER NOT NULL DEFAULT 0,
  teacher_feedback TEXT,
  graded_by UUID REFERENCES auth.users(id),
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);
CREATE INDEX submissions_student_idx ON public.submissions(student_id);
CREATE INDEX submissions_assignment_idx ON public.submissions(assignment_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER submissions_updated_at BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  response_text TEXT,
  image_url TEXT,
  selected_choice TEXT,
  auto_correct BOOLEAN,
  points_awarded INTEGER,
  teacher_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(submission_id, problem_id)
);
CREATE INDEX answers_submission_idx ON public.answers(submission_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.answers TO authenticated;
GRANT ALL ON public.answers TO service_role;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER answers_updated_at BEFORE UPDATE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Signup trigger (after profiles table exists)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Helpers (all tables exist now)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_enrolled(_class_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.enrollments WHERE class_id = _class_id AND student_id = _user_id); $$;

CREATE OR REPLACE FUNCTION public.owns_class(_class_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.classes WHERE id = _class_id AND teacher_id = _user_id); $$;

CREATE OR REPLACE FUNCTION public.owns_assignment(_assignment_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.assignments a JOIN public.classes c ON c.id = a.class_id
    WHERE a.id = _assignment_id AND c.teacher_id = _user_id
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_enrolled(UUID, UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.owns_class(UUID, UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.owns_assignment(UUID, UUID) FROM PUBLIC, anon;

-- ============================================================
-- Policies
-- ============================================================

-- profiles
CREATE POLICY "profiles_self_read" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_admin_read" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- classes
CREATE POLICY "classes_teacher_all" ON public.classes FOR ALL TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid() AND public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "classes_student_read" ON public.classes FOR SELECT TO authenticated
  USING (public.is_enrolled(id, auth.uid()));
CREATE POLICY "classes_admin_all" ON public.classes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- enrollments
CREATE POLICY "enrollments_student_read" ON public.enrollments FOR SELECT TO authenticated
  USING (student_id = auth.uid());
CREATE POLICY "enrollments_teacher_read" ON public.enrollments FOR SELECT TO authenticated
  USING (public.owns_class(class_id, auth.uid()));
CREATE POLICY "enrollments_student_delete" ON public.enrollments FOR DELETE TO authenticated
  USING (student_id = auth.uid());
CREATE POLICY "enrollments_teacher_delete" ON public.enrollments FOR DELETE TO authenticated
  USING (public.owns_class(class_id, auth.uid()));
CREATE POLICY "enrollments_admin_all" ON public.enrollments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
-- Insert is done only via join_class_by_code() (SECURITY DEFINER).

-- assignments
CREATE POLICY "assignments_teacher_all" ON public.assignments FOR ALL TO authenticated
  USING (public.owns_class(class_id, auth.uid()))
  WITH CHECK (public.owns_class(class_id, auth.uid()));
CREATE POLICY "assignments_student_read" ON public.assignments FOR SELECT TO authenticated
  USING (published AND public.is_enrolled(class_id, auth.uid()));
CREATE POLICY "assignments_admin_all" ON public.assignments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- problems (students fetch via server fn that strips correct_answer)
CREATE POLICY "problems_teacher_all" ON public.problems FOR ALL TO authenticated
  USING (public.owns_assignment(assignment_id, auth.uid()))
  WITH CHECK (public.owns_assignment(assignment_id, auth.uid()));
CREATE POLICY "problems_admin_all" ON public.problems FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- submissions
CREATE POLICY "submissions_student_read" ON public.submissions FOR SELECT TO authenticated
  USING (student_id = auth.uid());
CREATE POLICY "submissions_student_insert" ON public.submissions FOR INSERT TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND public.is_enrolled(
      (SELECT class_id FROM public.assignments WHERE id = assignment_id),
      auth.uid()
    )
  );
CREATE POLICY "submissions_student_update" ON public.submissions FOR UPDATE TO authenticated
  USING (student_id = auth.uid() AND status = 'in_progress')
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "submissions_teacher_read" ON public.submissions FOR SELECT TO authenticated
  USING (public.owns_assignment(assignment_id, auth.uid()));
CREATE POLICY "submissions_teacher_update" ON public.submissions FOR UPDATE TO authenticated
  USING (public.owns_assignment(assignment_id, auth.uid()))
  WITH CHECK (public.owns_assignment(assignment_id, auth.uid()));
CREATE POLICY "submissions_admin_all" ON public.submissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- answers
CREATE POLICY "answers_student_read" ON public.answers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.student_id = auth.uid()));
CREATE POLICY "answers_student_all" ON public.answers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.student_id = auth.uid() AND s.status = 'in_progress'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.student_id = auth.uid() AND s.status = 'in_progress'));
CREATE POLICY "answers_teacher_read" ON public.answers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND public.owns_assignment(s.assignment_id, auth.uid())));
CREATE POLICY "answers_teacher_update" ON public.answers FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND public.owns_assignment(s.assignment_id, auth.uid())));
CREATE POLICY "answers_admin_all" ON public.answers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- join_class_by_code
-- ============================================================
CREATE OR REPLACE FUNCTION public.join_class_by_code(_code TEXT)
RETURNS TABLE(class_id UUID, class_name TEXT, already_enrolled BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _class_id UUID; _class_name TEXT; _user UUID := auth.uid(); _existing UUID;
BEGIN
  IF _user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _code IS NULL OR length(_code) < 4 OR length(_code) > 12 THEN
    RAISE EXCEPTION 'Invalid code format';
  END IF;

  SELECT id, name INTO _class_id, _class_name
  FROM public.classes WHERE upper(join_code) = upper(_code) AND NOT archived;

  IF _class_id IS NULL THEN RAISE EXCEPTION 'No class matches that code'; END IF;

  SELECT id INTO _existing FROM public.enrollments
  WHERE class_id = _class_id AND student_id = _user;

  IF _existing IS NOT NULL THEN
    RETURN QUERY SELECT _class_id, _class_name, true; RETURN;
  END IF;

  INSERT INTO public.enrollments (class_id, student_id) VALUES (_class_id, _user);
  RETURN QUERY SELECT _class_id, _class_name, false;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.join_class_by_code(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_class_by_code(TEXT) TO authenticated;

-- ============================================================
-- Storage: submissions bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "submissions_bucket_student_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'submissions' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "submissions_bucket_student_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'submissions' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "submissions_bucket_teacher_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'submissions' AND public.has_role(auth.uid(), 'teacher'));
