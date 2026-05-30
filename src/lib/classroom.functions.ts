import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { attachAuthHeader } from "./classroom-auth";

// Get my role + display name (used by /app to redirect teachers).
export const getMe = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabaseAdmin.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", userId),
    ]);
    const roleList = (roles ?? []).map((r) => r.role);
    let role: "admin" | "teacher" | "student" = "student";
    if (roleList.includes("admin")) role = "admin";
    else if (roleList.includes("teacher")) role = "teacher";
    else if (roleList.includes("student")) role = "student";
    return {
      userId,
      displayName: profile?.display_name ?? null,
      role,
    };
  });

// Student dashboard: enrolled classes + assignment summary
export const getStudentDashboard = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    const { data: enrollments } = await supabaseAdmin
      .from("enrollments")
      .select("class_id, classes(id, name, description, archived)")
      .eq("student_id", userId);

    const classes = (enrollments ?? [])
      .map((e) => e.classes as { id: string; name: string; description: string | null; archived: boolean } | null)
      .filter((c): c is NonNullable<typeof c> => c !== null && !c.archived);

    const classIds = classes.map((c) => c.id);
    let assignments: Array<{
      id: string;
      class_id: string;
      class_name: string;
      title: string;
      due_at: string | null;
      submission_status: "not_started" | "in_progress" | "submitted" | "graded";
      final_score: number | null;
      max_score: number;
    }> = [];

    if (classIds.length) {
      const { data: aRows } = await supabaseAdmin
        .from("assignments")
        .select("id, class_id, title, due_at")
        .in("class_id", classIds)
        .eq("published", true)
        .order("due_at", { ascending: true, nullsFirst: false });

      const aIds = (aRows ?? []).map((a) => a.id);
      const { data: subs } = aIds.length
        ? await supabaseAdmin
            .from("submissions")
            .select("assignment_id, status, final_score, max_score")
            .in("assignment_id", aIds)
            .eq("student_id", userId)
        : { data: [] };

      const subMap = new Map(
        (subs ?? []).map((s) => [s.assignment_id, s] as const),
      );
      const classNameMap = new Map(classes.map((c) => [c.id, c.name] as const));

      assignments = (aRows ?? []).map((a) => {
        const s = subMap.get(a.id);
        return {
          id: a.id,
          class_id: a.class_id,
          class_name: classNameMap.get(a.class_id) ?? "",
          title: a.title,
          due_at: a.due_at,
          submission_status: (s?.status ?? "not_started") as
            | "not_started"
            | "in_progress"
            | "submitted"
            | "graded",
          final_score: s?.final_score ?? null,
          max_score: s?.max_score ?? 0,
        };
      });
    }
    return { classes, assignments };
  });

export const joinClassByCode = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ code: z.string().min(4).max(12) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    // Use SECURITY DEFINER fn join_class_by_code via authenticated client
    // — we go through admin client and pass user id manually:
    const code = data.code.trim().toUpperCase();
    const { data: cls } = await supabaseAdmin
      .from("classes")
      .select("id, name, archived")
      .ilike("join_code", code)
      .maybeSingle();
    if (!cls || cls.archived) throw new Error("No class matches that code");

    const { data: existing } = await supabaseAdmin
      .from("enrollments")
      .select("id")
      .eq("class_id", cls.id)
      .eq("student_id", context.userId)
      .maybeSingle();
    if (existing) {
      return { classId: cls.id, className: cls.name, alreadyEnrolled: true };
    }
    const { error } = await supabaseAdmin
      .from("enrollments")
      .insert({ class_id: cls.id, student_id: context.userId });
    if (error) throw new Error(error.message);
    return { classId: cls.id, className: cls.name, alreadyEnrolled: false };
  });

export const getStudentClass = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input) => z.object({ classId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    // confirm enrollment
    const { data: enroll } = await supabaseAdmin
      .from("enrollments")
      .select("id")
      .eq("class_id", data.classId)
      .eq("student_id", context.userId)
      .maybeSingle();
    if (!enroll) throw new Error("Not enrolled in this class");

    const [{ data: cls }, { data: assignments }] = await Promise.all([
      supabaseAdmin
        .from("classes")
        .select("id, name, description, teacher_id")
        .eq("id", data.classId)
        .maybeSingle(),
      supabaseAdmin
        .from("assignments")
        .select("id, title, due_at, instructions")
        .eq("class_id", data.classId)
        .eq("published", true)
        .order("due_at", { ascending: true, nullsFirst: false }),
    ]);
    if (!cls) throw new Error("Class not found");

    const aIds = (assignments ?? []).map((a) => a.id);
    const { data: subs } = aIds.length
      ? await supabaseAdmin
          .from("submissions")
          .select("assignment_id, status, final_score, max_score")
          .in("assignment_id", aIds)
          .eq("student_id", context.userId)
      : { data: [] };
    const subMap = new Map((subs ?? []).map((s) => [s.assignment_id, s] as const));
    const decorated = (assignments ?? []).map((a) => {
      const s = subMap.get(a.id);
      return {
        ...a,
        submission_status: (s?.status ?? "not_started") as
          | "not_started"
          | "in_progress"
          | "submitted"
          | "graded",
        final_score: s?.final_score ?? null,
        max_score: s?.max_score ?? 0,
      };
    });
    return { class: cls, assignments: decorated };
  });

// Returns assignment + problems WITHOUT correct_answer + current in-progress answers
export const getAssignmentToSolve = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ assignmentId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: a } = await supabaseAdmin
      .from("assignments")
      .select("id, title, instructions, due_at, published, class_id, classes(name)")
      .eq("id", data.assignmentId)
      .maybeSingle();
    if (!a || !a.published) throw new Error("Assignment not available");

    // enrollment check
    const { data: enroll } = await supabaseAdmin
      .from("enrollments")
      .select("id")
      .eq("class_id", a.class_id)
      .eq("student_id", context.userId)
      .maybeSingle();
    if (!enroll) throw new Error("Not enrolled in this class");

    const { data: problems } = await supabaseAdmin
      .from("problems")
      .select("id, position, prompt, type, points, choices")
      .eq("assignment_id", data.assignmentId)
      .order("position", { ascending: true });

    // Strip "correct" flag from MCQ choices so the answer key isn't leaked.
    const safeProblems = (problems ?? []).map((p) => ({
      ...p,
      choices: Array.isArray(p.choices)
        ? (p.choices as Array<{ id: string; label: string; correct?: boolean }>).map(
            ({ id, label }) => ({ id, label }),
          )
        : null,
    }));

    // ensure or get current submission
    let { data: sub } = await supabaseAdmin
      .from("submissions")
      .select("id, status, max_score, final_score")
      .eq("assignment_id", data.assignmentId)
      .eq("student_id", context.userId)
      .maybeSingle();

    if (!sub) {
      const maxScore = safeProblems.reduce((sum, p) => sum + (p.points ?? 1), 0);
      const { data: inserted, error } = await supabaseAdmin
        .from("submissions")
        .insert({
          assignment_id: data.assignmentId,
          student_id: context.userId,
          status: "in_progress",
          max_score: maxScore,
        })
        .select("id, status, max_score, final_score")
        .single();
      if (error) throw new Error(error.message);
      sub = inserted;
    }

    const { data: answers } = await supabaseAdmin
      .from("answers")
      .select("problem_id, response_text, selected_choice, image_url")
      .eq("submission_id", sub.id);

    return {
      assignment: { id: a.id, title: a.title, instructions: a.instructions, due_at: a.due_at, className: (a.classes as { name: string } | null)?.name ?? "" },
      problems: safeProblems,
      submission: sub,
      answers: answers ?? [],
    };
  });

export const saveAnswer = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        submissionId: z.string().uuid(),
        problemId: z.string().uuid(),
        responseText: z.string().max(20000).nullish(),
        selectedChoice: z.string().max(64).nullish(),
        imageUrl: z.string().url().max(1024).nullish(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    // Confirm submission belongs to user + is still in_progress
    const { data: sub } = await supabaseAdmin
      .from("submissions")
      .select("id, student_id, status")
      .eq("id", data.submissionId)
      .maybeSingle();
    if (!sub || sub.student_id !== context.userId) throw new Error("Forbidden");
    if (sub.status !== "in_progress") throw new Error("Submission is locked");

    const { data: existing } = await supabaseAdmin
      .from("answers")
      .select("id")
      .eq("submission_id", data.submissionId)
      .eq("problem_id", data.problemId)
      .maybeSingle();

    const payload = {
      submission_id: data.submissionId,
      problem_id: data.problemId,
      response_text: data.responseText ?? null,
      selected_choice: data.selectedChoice ?? null,
      image_url: data.imageUrl ?? null,
    };

    if (existing) {
      const { error } = await supabaseAdmin
        .from("answers")
        .update(payload)
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("answers").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

function normalizeShort(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function shortAnswerCorrect(student: string | null, correct: string | null): boolean {
  if (!student || !correct) return false;
  const a = normalizeShort(student);
  const b = normalizeShort(correct);
  if (a === b) return true;
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) {
    return Math.abs(na - nb) < 1e-6;
  }
  return false;
}

export const submitAssignment = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ submissionId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: sub } = await supabaseAdmin
      .from("submissions")
      .select("id, student_id, status, assignment_id")
      .eq("id", data.submissionId)
      .maybeSingle();
    if (!sub || sub.student_id !== context.userId) throw new Error("Forbidden");
    if (sub.status !== "in_progress") throw new Error("Already submitted");

    const { data: problems } = await supabaseAdmin
      .from("problems")
      .select("id, type, points, correct_answer, choices")
      .eq("assignment_id", sub.assignment_id);

    const { data: answers } = await supabaseAdmin
      .from("answers")
      .select("id, problem_id, response_text, selected_choice")
      .eq("submission_id", sub.id);

    const answerMap = new Map((answers ?? []).map((a) => [a.problem_id, a] as const));
    let autoScore = 0;
    let maxScore = 0;
    let hasManual = false;

    for (const p of problems ?? []) {
      const pts = p.points ?? 1;
      maxScore += pts;
      const ans = answerMap.get(p.id);
      let autoCorrect: boolean | null = null;
      let awarded = 0;

      if (p.type === "short") {
        autoCorrect = shortAnswerCorrect(ans?.response_text ?? null, p.correct_answer ?? null);
        awarded = autoCorrect ? pts : 0;
      } else if (p.type === "mcq") {
        const choices = Array.isArray(p.choices)
          ? (p.choices as Array<{ id: string; correct?: boolean }>)
          : [];
        const correctChoice = choices.find((c) => c.correct);
        autoCorrect = !!ans?.selected_choice && !!correctChoice && ans.selected_choice === correctChoice.id;
        awarded = autoCorrect ? pts : 0;
      } else {
        // free response — manual grade
        autoCorrect = null;
        awarded = 0;
        hasManual = true;
      }
      autoScore += awarded;

      if (ans) {
        await supabaseAdmin
          .from("answers")
          .update({ auto_correct: autoCorrect, points_awarded: awarded })
          .eq("id", ans.id);
      } else {
        // create placeholder so grading view sees the problem
        await supabaseAdmin.from("answers").insert({
          submission_id: sub.id,
          problem_id: p.id,
          auto_correct: autoCorrect,
          points_awarded: awarded,
        });
      }
    }

    const newStatus: "submitted" | "graded" = hasManual ? "submitted" : "graded";
    const { error } = await supabaseAdmin
      .from("submissions")
      .update({
        status: newStatus,
        submitted_at: new Date().toISOString(),
        auto_score: autoScore,
        final_score: hasManual ? null : autoScore,
        max_score: maxScore,
      })
      .eq("id", sub.id);
    if (error) throw new Error(error.message);

    return { ok: true, autoScore, maxScore, status: newStatus };
  });

export const getSubmissionResult = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ assignmentId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: sub } = await supabaseAdmin
      .from("submissions")
      .select("id, status, auto_score, final_score, max_score, teacher_feedback, submitted_at, graded_at, assignment_id, assignments(title, class_id, classes(name))")
      .eq("assignment_id", data.assignmentId)
      .eq("student_id", context.userId)
      .maybeSingle();
    if (!sub) throw new Error("No submission yet");
    const { data: problems } = await supabaseAdmin
      .from("problems")
      .select("id, position, prompt, type, points, choices, correct_answer")
      .eq("assignment_id", data.assignmentId)
      .order("position");
    const { data: answers } = await supabaseAdmin
      .from("answers")
      .select("problem_id, response_text, selected_choice, image_url, auto_correct, points_awarded, teacher_comment")
      .eq("submission_id", sub.id);
    return { submission: sub, problems: problems ?? [], answers: answers ?? [] };
  });
