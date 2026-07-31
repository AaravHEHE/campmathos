ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS camp_year integer NOT NULL DEFAULT 2026;
UPDATE public.registrations SET camp_year = 2026 WHERE camp_year IS DISTINCT FROM 2026;
CREATE INDEX IF NOT EXISTS registrations_camp_year_idx ON public.registrations (camp_year);