-- App role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- User roles table (separate from any profile to prevent privilege escalation)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer role check (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Registrations table
CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_registrations_created_at ON public.registrations (created_at DESC);
CREATE INDEX idx_registrations_email ON public.registrations (lower(email));
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can submit a registration
CREATE POLICY "Anyone can register"
  ON public.registrations FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(email) <= 320
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

-- Only admins can read registrations
CREATE POLICY "Admins can view registrations"
  ON public.registrations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete registrations
CREATE POLICY "Admins can delete registrations"
  ON public.registrations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));