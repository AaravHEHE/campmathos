DROP TABLE IF EXISTS public.classroom_submissions;
DROP TABLE IF EXISTS public.classroom_students;
DROP TABLE IF EXISTS public.google_oauth_tokens;
ALTER TABLE public.registrations DROP COLUMN IF EXISTS classroom_course_id;
ALTER TABLE public.registrations DROP COLUMN IF EXISTS classroom_google_user_id;
ALTER TABLE public.registrations DROP COLUMN IF EXISTS classroom_match_status;