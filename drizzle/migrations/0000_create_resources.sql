CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  school_level TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  topic TEXT,
  resource_type TEXT NOT NULL,
  file_url TEXT,
  external_url TEXT,
  embed_url TEXT,
  thumbnail_url TEXT,
  slug TEXT UNIQUE,
  position INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.resources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY resources_public_read ON public.resources
  FOR SELECT TO anon, authenticated USING (published);

CREATE POLICY resources_admin_all ON public.resources
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX resources_lookup_idx ON public.resources (school_level, week_number, resource_type, position);