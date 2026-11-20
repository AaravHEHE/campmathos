CREATE OR REPLACE FUNCTION public.is_tasks_owner(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id = '6028a082-f94d-450e-845a-a8d686bfead5'::uuid AND public.has_role(_user_id, 'admin')
$$;

DROP POLICY IF EXISTS admin_tasks_admin_all ON public.admin_tasks;
CREATE POLICY admin_tasks_owner_all ON public.admin_tasks FOR ALL TO authenticated
  USING (public.is_tasks_owner(auth.uid())) WITH CHECK (public.is_tasks_owner(auth.uid()));
CREATE POLICY admin_tasks_assignee_read ON public.admin_tasks FOR SELECT TO authenticated
  USING (assigned_to = auth.uid() AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY admin_tasks_assignee_update ON public.admin_tasks FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid() AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (assigned_to = auth.uid());

CREATE OR REPLACE FUNCTION public.admin_tasks_limit_assignee_edits()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT public.is_tasks_owner(auth.uid()) AND auth.uid() IS NOT NULL AND (
    NEW.title IS DISTINCT FROM OLD.title OR NEW.notes IS DISTINCT FROM OLD.notes OR
    NEW.due_date IS DISTINCT FROM OLD.due_date OR NEW.assigned_to IS DISTINCT FROM OLD.assigned_to OR
    NEW.created_by IS DISTINCT FROM OLD.created_by) THEN
    RAISE EXCEPTION 'Only the main account can edit tasks';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS admin_tasks_limit_assignee_edits ON public.admin_tasks;
CREATE TRIGGER admin_tasks_limit_assignee_edits BEFORE UPDATE ON public.admin_tasks
  FOR EACH ROW EXECUTE FUNCTION public.admin_tasks_limit_assignee_edits();