# Google Classroom sync in Admin Dashboard

Goal: in the admin registrations table, show for each student (a) whether they've joined the Google Classroom course, (b) which assignments they've turned in, and keep the parent↔student link that already exists in `registrations`.

## Auth approach

Google Classroom's API does not accept plain API keys — it requires OAuth as a real Google user who is a teacher/co-teacher of the course. Since only one Director's personal Google account will authorize this, we do a one-time OAuth handshake and store the refresh token as a server secret. All admins share that view (they don't each need to sign into Google).

- Create a Google Cloud OAuth client (Web app, "External" consent, in "Testing" mode — Director's Google email added as a test user).
- Scopes (read-only, minimum viable):
  - `classroom.courses.readonly`
  - `classroom.rosters.readonly`
  - `classroom.profile.emails`
  - `classroom.coursework.students.readonly`
  - `classroom.student-submissions.students.readonly`
- One-time consent flow at `/admin/integrations/google-classroom` completes OAuth, exchanges the code for a refresh token, and stores it as `GOOGLE_CLASSROOM_REFRESH_TOKEN` (plus `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET`) via the secrets tool. After that, no one has to sign into Google again unless the token is revoked.

## Data model

New table `public.classroom_students` (server-only, `service_role` grants; admin-scoped SELECT policy via `has_role('admin')`):
- `course_id`, `course_name`
- `google_user_id`, `email`, `given_name`, `family_name`, `full_name`
- `joined_at`
- `last_synced_at`

New table `public.classroom_submissions`:
- `course_id`, `coursework_id`, `coursework_title`, `due_at`
- `google_user_id`
- `state` (`NEW` / `CREATED` / `TURNED_IN` / `RETURNED`), `late`, `assigned_grade`, `updated_at`

New nullable columns on `public.registrations`:
- `classroom_google_user_id text` (once matched)
- `classroom_match_status text` (`matched` / `unmatched` / `manual`)

No changes to any existing table's RLS, and no changes to the existing camper/teacher schema.

## Sync mechanism

- New TanStack server route `POST /api/public/hooks/sync-classroom` (HMAC-verified, same pattern as `sync-form-emails`). Called every 5 min by `pg_cron`, and manually from the admin UI.
- Handler flow (all inside handler, uses `google-auth-library` + `googleapis` — both Worker-compatible):
  1. Exchange refresh token → access token.
  2. `courses.list(teacherId=me, courseStates=ACTIVE)`.
  3. For each course: `students.list` → upsert into `classroom_students`.
  4. `courseWork.list` → for each coursework: `studentSubmissions.list` → upsert into `classroom_submissions`.
  5. Run matching pass: for every `registrations` row without a `classroom_google_user_id`, try to match by (a) parent email = classroom email (rare but common for younger kids), (b) exact `lower(first+last)` name match, (c) fuzzy match (Levenshtein ≤ 2) with a `manual` flag needing confirmation.

## Admin UI changes (additive only — existing screens untouched)

- New tab/section on `/admin` alongside the existing registrations table: **"Google Classroom"** panel showing per-course join counts and a "Sync now" button.
- Add two columns to the existing registrations table:
  - **Joined GC** — green check / red x / yellow "?" (needs manual link)
  - **Assignments** — small `3/5 turned in` badge with tooltip listing statuses; clicking opens a drawer with per-assignment state.
- New route `/admin/registrations/$id/link-classroom` — dialog to manually pick a Classroom student when auto-match is ambiguous.

Nothing on the marketing pages (`/`, `/about`, `/faq`, `/board`, `/login`, `/admin/login`) changes.

## Out of scope (call out before building)

- Parent emails in Google Classroom itself: Classroom's API only exposes **guardian** relationships if guardians were formally invited by the teacher through Classroom's guardian feature. If that's not set up, we cannot pull parent info from Classroom — we keep using the Google Form's parent name/email in `registrations` and just link the *student* record.
- Writing back to Classroom (creating assignments, grading) — read-only for now.
- The OAuth app stays in Google's "Testing" mode. That's fine because only the Director's account authorizes it. Publishing to "Production" would require Google's app verification (weeks of review) and is not needed.

## Technical section

Files added:
- `supabase/migrations/<ts>_classroom_sync.sql` — 2 tables + grants + RLS + 2 columns on `registrations`.
- `src/routes/api.public.hooks.sync-classroom.ts` — cron/webhook entry.
- `src/lib/classroom.functions.ts` — `adminListClassroomStatus`, `adminSyncClassroom`, `adminLinkRegistrationToClassroom` (all `.middleware([requireSupabaseAuth])` + `has_role('admin')` check).
- `src/lib/classroom.server.ts` — googleapis client factory (loaded via `await import` inside handlers), refresh-token exchange, list/upsert helpers.
- `src/routes/admin.integrations.google-classroom.tsx` — one-time OAuth consent landing + "Connected as …" status.
- `src/components/admin/ClassroomStatusCell.tsx` + `ClassroomSubmissionsDrawer.tsx` + `LinkClassroomDialog.tsx`.
- Extend `src/routes/admin.index.tsx` and `src/lib/admin.functions.ts::adminListRegistrations` to join in classroom status (LEFT JOIN via `classroom_google_user_id`).

Secrets requested via `add_secret` (after user confirms plan):
- `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` — from Google Cloud Console.
- `GOOGLE_CLASSROOM_REFRESH_TOKEN` — captured server-side during the one-time consent, not pasted by the user.
- `CLASSROOM_SYNC_WEBHOOK_SECRET` — generated via `generate_secret` for pg_cron HMAC.

Packages: `bun add googleapis google-auth-library` (both work on Cloudflare Workers with `nodejs_compat`).

Existing pages, routes, RLS on other tables, and cron jobs are not modified.
