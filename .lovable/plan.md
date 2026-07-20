## Goal
Retire the in-app student/teacher portals from the public UI (keep files + DB intact) and give the admin a full read-only Google Classroom console at `/admin/classroom` that mirrors courses, rosters, coursework, and per-student submission status.

## Scope guardrails
- Only touch: `SiteHeader`, `SiteFooter`, `AppShell`, admin-login redirect, admin dashboard nav, and new `/admin/classroom/*` routes + server functions.
- Do NOT modify: marketing pages (home, about, board, faq, curriculum), registrations table/sync, broadcast email flow, RLS on classroom tables, any `src/routes/app.*` or `src/routes/teacher.*` route files (they stay on disk, just unlinked).

## Part 1 — Hide the old portals (routes stay, links go)
1. `SiteHeader.tsx` / mobile menu / `SiteFooter.tsx`: remove the "Sign in" link.
2. `src/routes/admin.login.tsx` (or the post-login redirect logic): always send to `/admin` after login. Drop the teacher-role branch to `/teacher`.
3. `src/routes/admin.index.tsx`: remove the "Teacher dashboard" / classwork nav pills; replace with a single "Google Classroom" link.
4. Leave `/app/*`, `/teacher/*`, `/login` route files, hooks, and DB tables (`classes`, `assignments`, `submissions`, `enrollments`, `user_roles`, `problems`, `answers`) untouched. They become unlisted URLs.

## Part 2 — Google Classroom admin console
Google OAuth client + `google_oauth_tokens` table + basic connect flow already exist (per earlier turn). Build the read UI on top.

### Server functions (`src/lib/classroom.functions.ts`)
All admin-only (`requireSupabaseAuth` + `has_role('admin')`); use the stored refresh token to mint an access token per call.
- `listCourses()` → `GET /v1/courses?teacherId=me` (active only).
- `getCourse(courseId)` → course details + teachers.
- `listCourseStudents(courseId)` → `.../students` (name, email, photo).
- `listCourseWork(courseId)` → assignments + due dates + max points.
- `listSubmissions(courseId, courseWorkId)` → `studentSubmissions` (state, late, assignedGrade, updateTime, attachments).
- `listStudentSubmissions(courseId, studentId)` → per-student view across all coursework (uses `courseWorkId=-` + `userId`).

### Routes (all under admin gate)
- `/admin/classroom` (`admin.classroom.index.tsx`) — connection status + course grid (name, section, student count, coursework count). "Sync now" button just re-queries.
- `/admin/classroom/$courseId` (`admin.classroom.$courseId.index.tsx`) — tabs: **Students** (roster table) and **Assignments** (coursework list with counts of Turned in / Missing / Graded).
- `/admin/classroom/$courseId/assignment/$courseWorkId` — submission table: student, state (Turned in / Late / Missing / Returned), grade, submitted-at, link to Classroom.
- `/admin/classroom/$courseId/student/$studentId` — per-student view: every assignment + their status/grade.

### UI details
- Reuse existing admin shell + shadcn Table/Badge/Tabs. State color mapping: Turned in = success, Late = warning, Missing = destructive, Returned = secondary.
- Every row links out to the original item on `classroom.google.com` (open in new tab) for actions we don't mirror.
- Loading via `useSuspenseQuery` + loader `ensureQueryData` per the query integration pattern; error/notFound boundaries on each route.

## Part 3 — Verification
1. Manual walkthrough: home/about/faq/board/curriculum unchanged; no "Sign in" in nav or footer; `/login`, `/app`, `/teacher` still resolve if typed directly.
2. Admin login lands on `/admin`; `/admin/classroom` loads courses, drill down works, submission counts match Classroom.
3. Playwright smoke: hit `/`, `/about`, `/faq` → screenshots identical to current; hit `/admin` after login → screenshot shows new Classroom link, no teacher link.

## Out of scope (call out to user, do not build)
- Writing back to Classroom (creating coursework, grading, messaging).
- Merging Classroom rosters with the `registrations` table.
- Reviving student-facing UI.
