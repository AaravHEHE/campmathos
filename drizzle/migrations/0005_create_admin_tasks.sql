CREATE TABLE public.admin_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  notes text,
  due_date date,
  assigned_to uuid NOT NULL,
  created_by uuid NOT NULL,
  done boolean NOT NULL DEFAULT false,
  done_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_tasks TO authenticated;
GRANT ALL ON public.admin_tasks TO service_role;
ALTER TABLE public.admin_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_tasks_admin_all ON public.admin_tasks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX admin_tasks_assigned_idx ON public.admin_tasks(assigned_to);
CREATE TRIGGER admin_tasks_updated_at BEFORE UPDATE ON public.admin_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();