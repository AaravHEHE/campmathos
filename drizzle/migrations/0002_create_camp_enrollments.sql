CREATE TABLE public.camp_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_year INTEGER NOT NULL,
  student_first_name TEXT NOT NULL,
  student_last_name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  address TEXT NOT NULL,
  state TEXT NOT NULL,
  school TEXT NOT NULL,
  parent_first_name TEXT NOT NULL,
  parent_last_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  format_preference TEXT NOT NULL CHECK (format_preference IN ('in_person', 'online', 'undecided')),
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  emergency_contact_relationship TEXT NOT NULL,
  medical_notes TEXT,
  photo_consent BOOLEAN NOT NULL,
  waiver_signed_at TIMESTAMPTZ,
  waiver_signature_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'waitlisted', 'withdrawn')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.camp_enrollments IS 'Contains sensitive minor and medical data. RLS is mandatory: no public reads or direct public inserts; submissions must use the dedicated server endpoint.';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.camp_enrollments TO authenticated;
GRANT ALL ON public.camp_enrollments TO service_role;

ALTER TABLE public.camp_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to camp enrollments"
  ON public.camp_enrollments
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX camp_enrollments_year_status_idx
  ON public.camp_enrollments (camp_year, status);
CREATE INDEX camp_enrollments_parent_email_idx
  ON public.camp_enrollments (lower(parent_email));

CREATE TRIGGER camp_enrollments_updated_at
  BEFORE UPDATE ON public.camp_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();