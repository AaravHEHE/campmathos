-- Archive existing (2026) registrants and start tracking sign-ups by camp year.
-- New rows default to 2027; every row that already exists at migration time
-- belongs to the 2026 camp and is backfilled explicitly below.
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS camp_year integer NOT NULL DEFAULT 2027;

UPDATE public.registrations SET camp_year = 2026;

CREATE INDEX IF NOT EXISTS idx_registrations_camp_year ON public.registrations (camp_year);
