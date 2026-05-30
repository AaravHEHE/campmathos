# Classroom System Plan

A clean, modern classroom feature for Camp Mathos with two roles (student, teacher) layered onto the existing admin system. Built foundation-first: auth, role gating, schema, then UI.

## Roles & Access

- Existing `app_role` enum extended to `admin | teacher | student`.
- **Admin-only provisioning** for teachers: admins promote a registered user to teacher from the admin panel.
- Students self-register at `/signup` and get role `student` automatically.
- Route gating via `_authenticated` layout + child `beforeLoad` checks using `has_role()`.

## Core User Flows

**Student**
1. Sign up / log in → `/app` dashboard shows enrolled classes + pending assignments.
2. Enter class code → instantly enrolled.
3. Open class → list of assignments (with due date, status, score).
4. Open assignment → solve problems one-by-one, submit → see auto-graded score + teacher feedback when available.
5. Progress view: per-class completion %, scores, history.

**Teacher**
1. Log in → `/teacher` dashboard: their classes, recent submissions needing review.
2. Create class → auto-generated 6-char join code (regenerable).
3. View roster, remove students.
4. Create assignment → add problems of three types:
   - Short answer (numeric/text, exact-match auto-grade, case/whitespace-insensitive)
   - Multiple choice (auto-grade)
   - Free response (manual grade, text + optional image upload)
5. Review submissions per assignment → see auto-score, override score, leave feedback.

**Admin**
- Existing admin panel gets a "Promote to teacher" action on user rows.

## Problem Authoring & Solving UX

- LaTeX rendering with KaTeX in problem statements and student answers.
- **Math keyboard**: floating toolbar attached to text inputs with buttons for π, ², ³, √, ±, ×, ÷, ≤, ≥, ≠, ∞, fractions, parens, and common variables (x, y, n). Inserts at cursor position. Toggle-visible via a button next to the input.
- Free-response problems support optional image upload (Supabase Storage bucket `submissions`).

## Visual Design

Matches existing brand: cream/ink/electric/coral palette, Fraunces display, Space Grotesk body, 2px ink borders + chunky shadow cards. Dashboards use clean assignment cards with status pills (Not started / In progress / Submitted / Graded), progress bars per class, and a focused single-problem view when solving. Page transitions + reveals reuse Phase 3 primitives.

## Routes

```
/signup, /login                       public auth
/app                                  student dashboard (enrolled classes, upcoming work)
/app/join                             enter class code
/app/class/$classId                   class detail + assignment list
/app/assignment/$assignmentId         solve view (one problem at a time)
/app/assignment/$assignmentId/result  graded view + feedback

/teacher                              teacher dashboard
/teacher/class/new                    create class
/teacher/class/$classId               manage class (roster, code, assignments)
/teacher/class/$classId/assignment/new
/teacher/assignment/$assignmentId     edit problems
/teacher/assignment/$assignmentId/submissions          list student submissions
/teacher/submission/$submissionId     grade & feedback view

/admin                                existing — add Promote-to-Teacher action
```

All under `_authenticated` layout; child `beforeLoad` redirects students hitting `/teacher/*` and vice-versa.

## Database Schema

```text
app_role enum: admin | teacher | student   (extend existing)

classes
  id, name, description, join_code (unique, 6 char), teacher_id, archived, created_at

enrollments
  id, class_id, student_id, joined_at  (unique: class_id+student_id)

assignments
  id, class_id, title, instructions, due_at, published, created_at

problems
  id, assignment_id, position, type ('short'|'mcq'|'free'),
  prompt (text, LaTeX allowed), points,
  correct_answer (text, nullable),   -- short
  choices (jsonb, nullable),         -- mcq: [{id,label,correct}]

submissions
  id, assignment_id, student_id, status ('in_progress'|'submitted'|'graded'),
  submitted_at, auto_score, final_score, teacher_feedback, graded_by, graded_at
  unique(assignment_id, student_id)

answers
  id, submission_id, problem_id, response_text, image_url,
  auto_correct (bool nullable), points_awarded, teacher_comment
  unique(submission_id, problem_id)
```

Plus Storage bucket `submissions` (private; signed URLs).

## Security (RLS)

Use the existing `has_role()` security-definer pattern; add a `is_enrolled(class_id, user_id)` and `owns_class(class_id, user_id)` helper.

- **classes**: teacher reads/writes own; students read enrolled classes; admins all.
- **enrollments**: student inserts self with valid join_code (validated via security-definer fn `join_class_by_code(code)`); teacher reads roster of owned classes; admins all.
- **assignments / problems**: teacher full CRUD on own class; students read published assignments in enrolled classes; correct_answer column **never exposed** to students — return via a view that strips it for student-side reads, or fetch via server fn.
- **submissions / answers**: student CRUD own (insert/update while `in_progress`, no edits after `submitted`); teacher reads/grades for own classes.

All DB access goes through TanStack `createServerFn` with `requireSupabaseAuth`; admin operations through `supabaseAdmin` after server-side role checks.

## Auto-Grading

- Short answer: trim + lowercase + collapse whitespace, compare to `correct_answer`. Numeric answers parsed as floats with tolerance 1e-6.
- MCQ: compare selected choice id to the choice flagged `correct`.
- Free response: `auto_correct = null`, awaits teacher.
- On submit, server fn computes `auto_score`, sets `final_score = auto_score` if no free-response problems, status `graded`; otherwise `submitted`.
- Teacher grading view lets them override `points_awarded` per problem, recomputes `final_score`, sets status `graded`.

## Technical Notes (for the implementer)

- New deps: `katex`, `react-katex` (lightweight).
- Math keyboard: standalone `<MathKeyboard onInsert={...} />` component, used by short-answer + free-response inputs; tracks textarea cursor with `selectionStart`.
- Server fns organized under `src/lib/classroom.functions.ts` (student-facing) and `src/lib/teacher.functions.ts` (teacher-facing), with helpers in `*.server.ts`.
- Join code generator: 6 chars from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no ambiguous chars), retry on uniqueness collision.
- Reuse `Reveal`, `PageTransition` for consistent motion; honor `prefers-reduced-motion`.
- Extend existing admin page with a user-list + promote action (server fn that inserts a `teacher` row into `user_roles`).

## Build Order

1. Migration: extend enum, create tables + RLS + helpers + storage bucket.
2. Auth pages: `/signup`, `/login`, session wiring + role-aware redirect from `/login`.
3. `_authenticated` layout + role gates for `/app/*` and `/teacher/*`.
4. Student dashboard + join-by-code flow.
5. Teacher dashboard + class create + roster.
6. Assignment + problem authoring (teacher) with KaTeX preview.
7. Student assignment solve view + math keyboard + submit + auto-grade.
8. Teacher submissions list + grading view + feedback.
9. Admin promote-to-teacher action.
10. End-to-end smoke test through both roles; fix issues.
