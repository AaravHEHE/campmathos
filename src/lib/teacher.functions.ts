import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { attachAuthHeader, generateJoinCode } from "./classroom-auth";
import { assertTeacherOrAdmin, assertAdmin } from "./classroom-auth.server";

async function ownsClass(classId: string, userId: string): Promise<boolean> {
  const role = await import("./classroom-auth.server").then((m) => m.getUserRole(userId));
  if (role === "admin") return true;
  const { data } = await supabaseAdmin
    .from("classes")
    .select("teacher_id")
    .eq("id", classId)
    .maybeSingle();
  return !!data && data.teacher_id === userId;
}

export const getTeacherDashboard = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertTeacherOrAdmin(context.userId);
    const { data: classes } = await supabaseAdmin
      .from("classes")
      .select("id, name, description, join_code, archived, created_at")
      .eq("teacher_id", context.userId)
      .order("created_at", { ascending: false });

    const classIds = (classes ?? []).map((c) => c.id);
    const [{ count: studentCount }, { data: recentSubs }] = await Promise.all([
      classIds.length
        ? supabaseAdmin
            .from("enrollments")
            .select("id", { count: "exact", head: true })
            .in("class_id", classIds)
        : Promise.resolve({ count: 0 }),
      classIds.length
        ? supabaseAdmin
            .from("submissions")
            .select("id, status, submitted_at, assignment_id, student_id, assignments!inner(id, title, class_id)")
            .in("assignments.class_id", classIds)
            .eq("status", "submitted")
            .order("submitted_at", { ascending: false })
            .limit(10)
        : Promise.resolve({ data: [] }),
    ]);
    return {
      classes: classes ?? [],
      studentCount: studentCount ?? 0,
      pendingSubmissions: recentSubs ?? [],
    };
  });

export const createClass = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        name: z.string().min(1).max(120),
        description: z.string().max(1000).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertTeacherOrAdmin(context.userId);
    for (let attempt = 0; attempt < 6; attempt++) {
      const code = generateJoinCode();
      const { data: row, error } = await supabaseAdmin
        .from("classes")
        .insert({
          name: data.name,
          description: data.description ?? null,
          join_code: code,
          teacher_id: context.userId,
        })
        .select("id")
        .single();
      if (!error && row) return { classId: row.id };
      if (error && !error.message.toLowerCase().includes("duplicate")) {
        throw new Error(error.message);
      }
    }
    throw new Error("Could not generate unique join code");
  });

export const regenerateJoinCode = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input) => z.object({ classId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    if (!(await ownsClass(data.classId, context.userId))) throw new Error("Forbidden");
    for (let attempt = 0; attempt < 6; attempt++) {
      const code = generateJoinCode();
      const { error } = await supabaseAdmin
        .from("classes")
        .update({ join_code: code })
        .eq("id", data.classId);
      if (!error) return { code };
    }
    throw new Error("Could not regenerate code");
  });

export const getTeacherClass = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input) => z.object({ classId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    if (!(await ownsClass(data.classId, context.userId))) throw new Error("Forbidden");
    const [{ data: cls }, { data: roster }, { data: assignments }] = await Promise.all([
      supabaseAdmin
        .from("classes")
        .select("id, name, description, join_code, archived")
        .eq("id", data.classId)
        .maybeSingle(),
      supabaseAdmin
        .from("enrollments")
        .select("id, joined_at, student_id")
        .eq("class_id", data.classId)
        .order("joined_at", { ascending: false }),
      supabaseAdmin
        .from("assignments")
        .select("id, title, due_at, published, created_at")
        .eq("class_id", data.classId)
        .order("created_at", { ascending: false }),
    ]);
    if (!cls) throw new Error("Class not found");

    const ids = (roster ?? []).map((r) => r.student_id);
    const { data: profs } = ids.length
      ? await supabaseAdmin.from("profiles").select("id, display_name").in("id", ids)
      : { data: [] };
    const profMap = new Map((profs ?? []).map((p) => [p.id, p.display_name] as const));
    const rosterOut = (roster ?? []).map((r) => ({
      ...r,
      display_name: profMap.get(r.student_id) ?? null,
    }));
    return { class: cls, roster: rosterOut, assignments: assignments ?? [] };

  });

export const removeStudent = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({ classId: z.string().uuid(), enrollmentId: z.string().uuid() })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (!(await ownsClass(data.classId, context.userId))) throw new Error("Forbidden");
    const { error } = await supabaseAdmin
      .from("enrollments")
      .delete()
      .eq("id", data.enrollmentId)
      .eq("class_id", data.classId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createAssignment = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        classId: z.string().uuid(),
        title: z.string().min(1).max(200),
        instructions: z.string().max(5000).optional().nullable(),
        dueAt: z.string().nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (!(await ownsClass(data.classId, context.userId))) throw new Error("Forbidden");
    const { data: row, error } = await supabaseAdmin
      .from("assignments")
      .insert({
        class_id: data.classId,
        title: data.title,
        instructions: data.instructions ?? null,
        due_at: data.dueAt || null,
        published: false,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { assignmentId: row.id };
  });

async function ownsAssignment(assignmentId: string, userId: string) {
  const role = await import("./classroom-auth.server").then((m) => m.getUserRole(userId));
  if (role === "admin") {
    const { data } = await supabaseAdmin.from("assignments").select("id").eq("id", assignmentId).maybeSingle();
    return !!data;
  }
  const { data } = await supabaseAdmin
    .from("assignments")
    .select("classes!inner(teacher_id)")
    .eq("id", assignmentId)
    .maybeSingle();
  return !!data && (data.classes as { teacher_id: string } | null)?.teacher_id === userId;
}

export const getAssignmentForEdit = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input) => z.object({ assignmentId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    if (!(await ownsAssignment(data.assignmentId, context.userId))) throw new Error("Forbidden");
    const { data: a } = await supabaseAdmin
      .from("assignments")
      .select("id, title, instructions, due_at, published, class_id")
      .eq("id", data.assignmentId)
      .maybeSingle();
    if (!a) throw new Error("Not found");
    const { data: problems } = await supabaseAdmin
      .from("problems")
      .select("id, position, prompt, type, points, choices, correct_answer")
      .eq("assignment_id", data.assignmentId)
      .order("position");
    return { assignment: a, problems: problems ?? [] };
  });

const problemSchema = z.object({
  id: z.string().uuid().optional(),
  position: z.number().int().min(0),
  prompt: z.string().min(1).max(10000),
  type: z.enum(["short", "mcq", "free"]),
  points: z.number().int().min(0).max(1000),
  correct_answer: z.string().max(2000).nullable().optional(),
  choices: z
    .array(
      z.object({
        id: z.string().min(1).max(64),
        label: z.string().min(1).max(1000),
        correct: z.boolean().optional(),
      }),
    )
    .nullable()
    .optional(),
});

export const saveAssignment = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        assignmentId: z.string().uuid(),
        title: z.string().min(1).max(200),
        instructions: z.string().max(5000).nullable().optional(),
        dueAt: z.string().nullable().optional(),
        published: z.boolean(),
        problems: z.array(problemSchema).max(200),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (!(await ownsAssignment(data.assignmentId, context.userId))) throw new Error("Forbidden");

    await supabaseAdmin
      .from("assignments")
      .update({
        title: data.title,
        instructions: data.instructions ?? null,
        due_at: data.dueAt || null,
        published: data.published,
      })
      .eq("id", data.assignmentId);

    // Replace problems (delete + insert) — assignments are typically small.
    await supabaseAdmin
      .from("problems")
      .delete()
      .eq("assignment_id", data.assignmentId);

    if (data.problems.length) {
      const rows = data.problems.map((p, idx) => ({
        assignment_id: data.assignmentId,
        position: idx,
        prompt: p.prompt,
        type: p.type,
        points: p.points,
        correct_answer: p.type === "short" ? p.correct_answer ?? null : null,
        choices: p.type === "mcq" ? p.choices ?? [] : null,
      }));
      const { error } = await supabaseAdmin.from("problems").insert(rows);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const getAssignmentSubmissions = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input) => z.object({ assignmentId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    if (!(await ownsAssignment(data.assignmentId, context.userId))) throw new Error("Forbidden");
    const { data: a } = await supabaseAdmin
      .from("assignments")
      .select("id, title, class_id")
      .eq("id", data.assignmentId)
      .maybeSingle();
    if (!a) throw new Error("Not found");
    const { data: subs } = await supabaseAdmin
      .from("submissions")
      .select("id, student_id, status, submitted_at, graded_at, auto_score, final_score, max_score")
      .eq("assignment_id", data.assignmentId)
      .order("submitted_at", { ascending: false, nullsFirst: false });
    const ids = (subs ?? []).map((s) => s.student_id);
    const { data: profs } = ids.length
      ? await supabaseAdmin.from("profiles").select("id, display_name").in("id", ids)
      : { data: [] };
    const map = new Map((profs ?? []).map((p) => [p.id, p.display_name] as const));
    return {
      assignment: a,
      submissions: (subs ?? []).map((s) => ({
        ...s,
        student_name: map.get(s.student_id) ?? "Student",
      })),
    };
  });

export const getSubmissionForGrading = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ submissionId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: sub } = await supabaseAdmin
      .from("submissions")
      .select("id, student_id, status, auto_score, final_score, max_score, teacher_feedback, submitted_at, graded_at, assignment_id, assignments(id, title, class_id, classes(name))")
      .eq("id", data.submissionId)
      .maybeSingle();
    if (!sub) throw new Error("Not found");
    if (!(await ownsAssignment(sub.assignment_id, context.userId))) throw new Error("Forbidden");

    const [{ data: problems }, { data: answers }, { data: profile }] = await Promise.all([
      supabaseAdmin
        .from("problems")
        .select("id, position, prompt, type, points, choices, correct_answer")
        .eq("assignment_id", sub.assignment_id)
        .order("position"),
      supabaseAdmin
        .from("answers")
        .select("id, problem_id, response_text, selected_choice, image_url, auto_correct, points_awarded, teacher_comment")
        .eq("submission_id", sub.id),
      supabaseAdmin.from("profiles").select("display_name").eq("id", sub.student_id).maybeSingle(),
    ]);
    return {
      submission: sub,
      problems: problems ?? [],
      answers: answers ?? [],
      studentName: profile?.display_name ?? "Student",
    };
  });

export const gradeSubmission = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        submissionId: z.string().uuid(),
        feedback: z.string().max(5000).nullable().optional(),
        answers: z.array(
          z.object({
            answerId: z.string().uuid(),
            pointsAwarded: z.number().int().min(0).max(10000),
            teacherComment: z.string().max(2000).nullable().optional(),
          }),
        ),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: sub } = await supabaseAdmin
      .from("submissions")
      .select("id, assignment_id, max_score")
      .eq("id", data.submissionId)
      .maybeSingle();
    if (!sub) throw new Error("Not found");
    if (!(await ownsAssignment(sub.assignment_id, context.userId))) throw new Error("Forbidden");

    for (const a of data.answers) {
      await supabaseAdmin
        .from("answers")
        .update({
          points_awarded: a.pointsAwarded,
          teacher_comment: a.teacherComment ?? null,
        })
        .eq("id", a.answerId)
        .eq("submission_id", data.submissionId);
    }

    const final = data.answers.reduce((sum, a) => sum + a.pointsAwarded, 0);
    const { error } = await supabaseAdmin
      .from("submissions")
      .update({
        status: "graded",
        final_score: final,
        teacher_feedback: data.feedback ?? null,
        graded_by: context.userId,
        graded_at: new Date().toISOString(),
      })
      .eq("id", data.submissionId);
    if (error) throw new Error(error.message);
    return { ok: true, finalScore: final };
  });

// Admin: list users + promote/demote
export const adminListUsersWithRoles = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, display_name, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const map = new Map<string, string[]>();
    for (const r of roles ?? []) {
      const arr = map.get(r.user_id) ?? [];
      arr.push(r.role);
      map.set(r.user_id, arr);
    }
    return {
      users: (profiles ?? []).map((p) => ({
        ...p,
        roles: map.get(p.id) ?? [],
      })),
    };
  });

export const adminSetTeacherRole = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ userId: z.string().uuid(), isTeacher: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    if (data.isTeacher) {
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: data.userId, role: "teacher" })
        .select();
    } else {
      await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", "teacher");
    }
    return { ok: true };
  });

// Admin-only: provision a new teacher account directly (email + password).
export const adminCreateTeacher = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        email: z.string().email().max(320),
        password: z.string().min(8).max(200),
        displayName: z.string().min(1).max(120),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email.toLowerCase().trim(),
      password: data.password,
      email_confirm: true,
      user_metadata: { display_name: data.displayName.trim() },
    });
    if (createErr || !created.user) {
      throw new Error(createErr?.message ?? "Could not create account");
    }
    const userId = created.user.id;

    // Ensure profile exists (the handle_new_user trigger usually does this,
    // but we upsert just in case).
    await supabaseAdmin
      .from("profiles")
      .upsert({ id: userId, display_name: data.displayName.trim() }, { onConflict: "id" });

    // Remove auto-assigned student role and grant teacher role.
    await supabaseAdmin.from("user_roles").delete().eq("user_id", userId).eq("role", "student");
    await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "teacher" })
      .select();

    return { ok: true, userId };
  });
