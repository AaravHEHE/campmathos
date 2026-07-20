// Google Classroom API helpers. Server-only. Never import from browser code.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const TOKEN_ROW_ID = "director"; // single-row token store

export interface StoredToken {
  refresh_token: string;
  google_email: string | null;
  scope: string | null;
  connected_at: string;
}

export async function loadStoredToken(): Promise<StoredToken | null> {
  const { data, error } = await supabaseAdmin
    .from("google_oauth_tokens")
    .select("refresh_token, google_email, scope, connected_at")
    .eq("id", TOKEN_ROW_ID)
    .maybeSingle();
  if (error) throw new Error(`token load failed: ${error.message}`);
  return data ?? null;
}

export async function saveStoredToken(t: {
  refresh_token: string;
  google_email: string | null;
  scope: string | null;
}) {
  const { error } = await supabaseAdmin.from("google_oauth_tokens").upsert(
    {
      id: TOKEN_ROW_ID,
      refresh_token: t.refresh_token,
      google_email: t.google_email,
      scope: t.scope,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) throw new Error(`token save failed: ${error.message}`);
}

export async function deleteStoredToken() {
  const { error } = await supabaseAdmin
    .from("google_oauth_tokens")
    .delete()
    .eq("id", TOKEN_ROW_ID);
  if (error) throw new Error(`token delete failed: ${error.message}`);
}

export const REQUIRED_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.rosters.readonly",
  "https://www.googleapis.com/auth/classroom.profile.emails",
  "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
  "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
];

export function requireOAuthClient() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Google OAuth is not configured. Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET.",
    );
  }
  return { clientId, clientSecret };
}

export function buildAuthorizeUrl(redirectUri: string, state: string): string {
  const { clientId } = requireOAuthClient();
  const p = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: REQUIRED_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p.toString()}`;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const { clientId, clientSecret } = requireOAuthClient();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const j = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    id_token?: string;
    scope?: string;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !j.access_token) {
    throw new Error(`token exchange failed: ${j.error ?? res.status} ${j.error_description ?? ""}`);
  }
  let email: string | null = null;
  if (j.id_token) {
    try {
      const payload = JSON.parse(
        Buffer.from(j.id_token.split(".")[1], "base64").toString("utf8"),
      );
      email = (payload.email as string) ?? null;
    } catch {
      /* ignore */
    }
  }
  return {
    access_token: j.access_token,
    refresh_token: j.refresh_token ?? null,
    scope: j.scope ?? null,
    google_email: email,
  };
}

export async function getFreshAccessToken(): Promise<string> {
  const stored = await loadStoredToken();
  if (!stored) throw new Error("Google Classroom is not connected yet.");
  const { clientId, clientSecret } = requireOAuthClient();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: stored.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  const j = (await res.json()) as { access_token?: string; error?: string; error_description?: string };
  if (!res.ok || !j.access_token) {
    throw new Error(`token refresh failed: ${j.error ?? res.status} ${j.error_description ?? ""}`);
  }
  return j.access_token;
}

// --- Classroom REST calls ---

interface GCourse {
  id: string;
  name: string;
  courseState: string;
}
interface GStudent {
  courseId: string;
  userId: string;
  profile?: {
    id?: string;
    name?: { givenName?: string; familyName?: string; fullName?: string };
    emailAddress?: string;
  };
}
interface GCoursework {
  id: string;
  title: string;
  courseId: string;
  dueDate?: { year: number; month: number; day: number };
  dueTime?: { hours?: number; minutes?: number };
  updateTime?: string;
}
interface GSubmission {
  id: string;
  courseId: string;
  courseWorkId: string;
  userId: string;
  state?: string;
  late?: boolean;
  assignedGrade?: number;
  updateTime?: string;
}

async function gcFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`https://classroom.googleapis.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GC ${path} ${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

async function listAll<T>(
  path: string,
  token: string,
  itemsKey: string,
): Promise<T[]> {
  const out: T[] = [];
  let pageToken: string | undefined;
  do {
    const sep = path.includes("?") ? "&" : "?";
    const url = `${path}${sep}pageSize=100${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const j = (await gcFetch(url, token)) as Record<string, unknown>;
    const items = (j[itemsKey] as T[] | undefined) ?? [];
    out.push(...items);
    pageToken = (j.nextPageToken as string | undefined) ?? undefined;
  } while (pageToken);
  return out;
}

export async function listActiveTeacherCourses(token: string) {
  return listAll<GCourse>(
    "/courses?teacherId=me&courseStates=ACTIVE",
    token,
    "courses",
  );
}

export async function listCourseStudents(courseId: string, token: string) {
  return listAll<GStudent>(`/courses/${courseId}/students`, token, "students");
}

export async function listCourseWork(courseId: string, token: string) {
  return listAll<GCoursework>(`/courses/${courseId}/courseWork`, token, "courseWork");
}

export async function listSubmissions(courseId: string, cwId: string, token: string) {
  return listAll<GSubmission>(
    `/courses/${courseId}/courseWork/${cwId}/studentSubmissions`,
    token,
    "studentSubmissions",
  );
}

function dueDateToTs(cw: GCoursework): string | null {
  if (!cw.dueDate) return null;
  const { year, month, day } = cw.dueDate;
  const h = cw.dueTime?.hours ?? 0;
  const m = cw.dueTime?.minutes ?? 0;
  return new Date(Date.UTC(year, month - 1, day, h, m)).toISOString();
}

export interface SyncSummary {
  courses: number;
  students_upserted: number;
  submissions_upserted: number;
  matched: number;
  errors: string[];
}

// Full sync + auto-match to registrations.
export async function runSync(): Promise<SyncSummary> {
  const summary: SyncSummary = {
    courses: 0,
    students_upserted: 0,
    submissions_upserted: 0,
    matched: 0,
    errors: [],
  };
  const token = await getFreshAccessToken();
  const courses = await listActiveTeacherCourses(token);
  summary.courses = courses.length;

  for (const course of courses) {
    // Students
    try {
      const students = await listCourseStudents(course.id, token);
      const rows = students.map((s) => ({
        course_id: course.id,
        course_name: course.name,
        google_user_id: s.userId,
        email: s.profile?.emailAddress?.toLowerCase() ?? null,
        given_name: s.profile?.name?.givenName ?? null,
        family_name: s.profile?.name?.familyName ?? null,
        full_name: s.profile?.name?.fullName ?? null,
        joined_at: null,
        last_synced_at: new Date().toISOString(),
      }));
      if (rows.length > 0) {
        const { error } = await supabaseAdmin
          .from("classroom_students")
          .upsert(rows, { onConflict: "course_id,google_user_id" });
        if (error) summary.errors.push(`students ${course.id}: ${error.message}`);
        else summary.students_upserted += rows.length;
      }
    } catch (e) {
      summary.errors.push(`students ${course.id}: ${(e as Error).message}`);
    }

    // Coursework + submissions
    try {
      const works = await listCourseWork(course.id, token);
      for (const cw of works) {
        try {
          const subs = await listSubmissions(course.id, cw.id, token);
          const rows = subs.map((s) => ({
            course_id: course.id,
            coursework_id: cw.id,
            coursework_title: cw.title,
            due_at: dueDateToTs(cw),
            google_user_id: s.userId,
            state: s.state ?? null,
            late: Boolean(s.late),
            assigned_grade:
              typeof s.assignedGrade === "number" ? s.assignedGrade : null,
            gc_updated_at: s.updateTime ?? null,
            last_synced_at: new Date().toISOString(),
          }));
          if (rows.length > 0) {
            const { error } = await supabaseAdmin
              .from("classroom_submissions")
              .upsert(rows, {
                onConflict: "course_id,coursework_id,google_user_id",
              });
            if (error)
              summary.errors.push(
                `subs ${course.id}/${cw.id}: ${error.message}`,
              );
            else summary.submissions_upserted += rows.length;
          }
        } catch (e) {
          summary.errors.push(
            `subs ${course.id}/${cw.id}: ${(e as Error).message}`,
          );
        }
      }
    } catch (e) {
      summary.errors.push(`coursework ${course.id}: ${(e as Error).message}`);
    }
  }

  // Auto-match unmatched registrations.
  summary.matched = await autoMatchRegistrations();
  return summary;
}

function normName(s: string | null | undefined): string {
  return (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

export async function autoMatchRegistrations(): Promise<number> {
  const { data: regs, error: rErr } = await supabaseAdmin
    .from("registrations")
    .select(
      "id, email, student_first_name, student_last_name, classroom_google_user_id, classroom_match_status",
    );
  if (rErr) throw new Error(rErr.message);
  const { data: students, error: sErr } = await supabaseAdmin
    .from("classroom_students")
    .select("course_id, google_user_id, email, full_name, given_name, family_name");
  if (sErr) throw new Error(sErr.message);

  // Index by email and by full-name.
  const byEmail = new Map<string, { course_id: string; google_user_id: string }>();
  const byName = new Map<string, { course_id: string; google_user_id: string }[]>();
  for (const s of students ?? []) {
    if (s.email) byEmail.set(s.email.toLowerCase(), s);
    const nameKeys = new Set<string>();
    if (s.full_name) nameKeys.add(normName(s.full_name));
    if (s.given_name || s.family_name)
      nameKeys.add(normName(`${s.given_name ?? ""} ${s.family_name ?? ""}`));
    for (const k of nameKeys) {
      const list = byName.get(k) ?? [];
      list.push(s);
      byName.set(k, list);
    }
  }

  let matched = 0;
  for (const r of regs ?? []) {
    if (r.classroom_google_user_id) continue; // already linked
    // Try student email = registration email (rare but happens).
    let hit = r.email ? byEmail.get(r.email.toLowerCase()) : undefined;
    let status = "matched";
    if (!hit) {
      const key = normName(
        `${r.student_first_name ?? ""} ${r.student_last_name ?? ""}`,
      );
      if (key.trim().length > 0) {
        const list = byName.get(key);
        if (list && list.length === 1) hit = list[0];
        else if (list && list.length > 1) status = "manual";
      }
    }
    if (!hit) continue;
    const { error: uErr } = await supabaseAdmin
      .from("registrations")
      .update({
        classroom_course_id: hit.course_id,
        classroom_google_user_id: hit.google_user_id,
        classroom_match_status: status,
      })
      .eq("id", r.id);
    if (!uErr) matched += 1;
  }
  return matched;
}
