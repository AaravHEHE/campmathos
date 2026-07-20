import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { supabase } from "@/integrations/supabase/client";

const attachAuthHeader = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data: { session } } = await supabase.auth.getSession();
    return next({
      headers: session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {},
    });
  },
);

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("Authorization check failed");
  if (!data) throw new Error("Forbidden");
}

// --- Status of the Google Classroom connection ---
export const adminGetClassroomStatus = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const hasClient = Boolean(
      process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    );
    const { loadStoredToken } = await import("./gclassroom.server");
    const stored = hasClient ? await loadStoredToken() : null;
    return {
      hasClient,
      connected: Boolean(stored),
      googleEmail: stored?.google_email ?? null,
      connectedAt: stored?.connected_at ?? null,
    };
  });

// --- Disconnect ---
export const adminDisconnectClassroom = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { deleteStoredToken } = await import("./gclassroom.server");
    await deleteStoredToken();
    return { ok: true };
  });

// --- Trigger sync now ---
export const adminSyncClassroom = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { runSync } = await import("./gclassroom.server");
    return await runSync();
  });

// --- List courses summary ---
export const adminListClassroomCourses = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("classroom_students")
      .select("course_id, course_name, last_synced_at");
    if (error) throw new Error(error.message);
    const byCourse = new Map<string, { course_id: string; course_name: string | null; students: number; last_synced_at: string | null }>();
    for (const r of data ?? []) {
      const c = byCourse.get(r.course_id) ?? {
        course_id: r.course_id,
        course_name: r.course_name,
        students: 0,
        last_synced_at: null,
      };
      c.students += 1;
      if (!c.last_synced_at || (r.last_synced_at && r.last_synced_at > c.last_synced_at))
        c.last_synced_at = r.last_synced_at;
      byCourse.set(r.course_id, c);
    }
    return { courses: Array.from(byCourse.values()) };
  });

export interface ClassroomRegistrationRow {
  id: string;
  email: string;
  student_first_name: string | null;
  student_last_name: string | null;
  grade_level: string | null;
  parent_first_name: string | null;
  parent_last_name: string | null;
  classroom_course_id: string | null;
  classroom_google_user_id: string | null;
  classroom_match_status: string;
  gc_student_email: string | null;
  gc_student_name: string | null;
  gc_course_name: string | null;
  turned_in: number;
  total_assigned: number;
}

// --- Combined registrations + classroom status view ---
export const adminListRegistrationsWithClassroom = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ rows: ClassroomRegistrationRow[] }> => {
    await assertAdmin(context.userId);
    const [regsRes, studentsRes, subsRes] = await Promise.all([
      supabaseAdmin
        .from("registrations")
        .select(
          "id, email, student_first_name, student_last_name, grade_level, parent_first_name, parent_last_name, classroom_course_id, classroom_google_user_id, classroom_match_status, created_at",
        )
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("classroom_students")
        .select("course_id, course_name, google_user_id, email, full_name"),
      supabaseAdmin
        .from("classroom_submissions")
        .select("course_id, google_user_id, state"),
    ]);
    if (regsRes.error) throw new Error(regsRes.error.message);
    if (studentsRes.error) throw new Error(studentsRes.error.message);
    if (subsRes.error) throw new Error(subsRes.error.message);

    const sMap = new Map<string, { email: string | null; full_name: string | null; course_name: string | null }>();
    for (const s of studentsRes.data ?? []) {
      sMap.set(`${s.course_id}|${s.google_user_id}`, {
        email: s.email,
        full_name: s.full_name,
        course_name: s.course_name,
      });
    }
    const subCounts = new Map<string, { turned_in: number; total: number }>();
    for (const s of subsRes.data ?? []) {
      const k = `${s.course_id}|${s.google_user_id}`;
      const c = subCounts.get(k) ?? { turned_in: 0, total: 0 };
      c.total += 1;
      if (s.state === "TURNED_IN" || s.state === "RETURNED") c.turned_in += 1;
      subCounts.set(k, c);
    }

    const rows: ClassroomRegistrationRow[] = (regsRes.data ?? []).map((r) => {
      const key =
        r.classroom_course_id && r.classroom_google_user_id
          ? `${r.classroom_course_id}|${r.classroom_google_user_id}`
          : null;
      const gc = key ? sMap.get(key) : undefined;
      const counts = key ? subCounts.get(key) : undefined;
      return {
        id: r.id,
        email: r.email,
        student_first_name: r.student_first_name,
        student_last_name: r.student_last_name,
        grade_level: r.grade_level,
        parent_first_name: r.parent_first_name,
        parent_last_name: r.parent_last_name,
        classroom_course_id: r.classroom_course_id,
        classroom_google_user_id: r.classroom_google_user_id,
        classroom_match_status: r.classroom_match_status ?? "unmatched",
        gc_student_email: gc?.email ?? null,
        gc_student_name: gc?.full_name ?? null,
        gc_course_name: gc?.course_name ?? null,
        turned_in: counts?.turned_in ?? 0,
        total_assigned: counts?.total ?? 0,
      };
    });
    return { rows };
  });

// --- Candidates for manual linking (search classroom_students by name/email) ---
export const adminSearchClassroomStudents = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((i: { query: string }) => i)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const q = data.query.trim().toLowerCase();
    if (q.length < 2) return { candidates: [] };
    const { data: rows, error } = await supabaseAdmin
      .from("classroom_students")
      .select("course_id, course_name, google_user_id, email, full_name")
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(20);
    if (error) throw new Error(error.message);
    return { candidates: rows ?? [] };
  });

// --- Manual link ---
export const adminLinkRegistrationToClassroom = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator(
    (i: { registrationId: string; courseId: string; googleUserId: string }) => i,
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("registrations")
      .update({
        classroom_course_id: data.courseId,
        classroom_google_user_id: data.googleUserId,
        classroom_match_status: "manual",
      })
      .eq("id", data.registrationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// --- Unlink ---
export const adminUnlinkRegistrationFromClassroom = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((i: { registrationId: string }) => i)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("registrations")
      .update({
        classroom_course_id: null,
        classroom_google_user_id: null,
        classroom_match_status: "unmatched",
      })
      .eq("id", data.registrationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// --- Per-registration assignment detail ---
export const adminGetRegistrationSubmissions = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((i: { registrationId: string }) => i)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: reg, error: rErr } = await supabaseAdmin
      .from("registrations")
      .select("classroom_course_id, classroom_google_user_id")
      .eq("id", data.registrationId)
      .maybeSingle();
    if (rErr) throw new Error(rErr.message);
    if (!reg?.classroom_course_id || !reg.classroom_google_user_id)
      return { submissions: [] };
    const { data: subs, error } = await supabaseAdmin
      .from("classroom_submissions")
      .select("coursework_title, due_at, state, late, assigned_grade, gc_updated_at")
      .eq("course_id", reg.classroom_course_id)
      .eq("google_user_id", reg.classroom_google_user_id)
      .order("due_at", { ascending: true, nullsFirst: false });
    if (error) throw new Error(error.message);
    return { submissions: subs ?? [] };
  });
