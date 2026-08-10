-- Remove the Google Classroom sync integration — not used going forward.
-- Drops the sync mirror tables, the OAuth token store, the classroom link
-- columns on registrations, and the cron job that hit the sync webhook.

DO $$
BEGIN
  PERFORM cron.unschedule('sync-classroom');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DROP TABLE IF EXISTS public.classroom_submissions;
DROP TABLE IF EXISTS public.classroom_students;
DROP TABLE IF EXISTS public.google_oauth_tokens;

ALTER TABLE public.registrations
  DROP COLUMN IF EXISTS classroom_course_id,
  DROP COLUMN IF EXISTS classroom_google_user_id,
  DROP COLUMN IF EXISTS classroom_match_status;
