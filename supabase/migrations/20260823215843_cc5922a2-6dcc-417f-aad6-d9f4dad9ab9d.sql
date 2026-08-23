CREATE TABLE public.sponsor_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('money','resources')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sponsor_inquiries TO authenticated;
GRANT ALL ON public.sponsor_inquiries TO service_role;
ALTER TABLE public.sponsor_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view sponsor inquiries"
  ON public.sponsor_inquiries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));