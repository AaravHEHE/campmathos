import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/classroom/AppShell";
import { useClassroomAuth, signOut } from "@/hooks/useClassroomAuth";
import { getSubmissionForGrading, gradeSubmission } from "@/lib/teacher.functions";

export const Route = createFileRoute("/teacher/submission/$submissionId")({
  component: GradePage,
  head: () => ({
    meta: [
      { title: "Grade submission — MathOs" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

interface Problem {
  id: string;
  position: number;
  prompt: string;
  type: "short" | "mcq" | "free";
  points: number;
  choices: Array<{ id: string; label: string; correct?: boolean }> | null;
  correct_answer: string | null;
}
interface Answer {
  id: string;
  problem_id: string;
  response_text: string | null;
  selected_choice: string | null;
  image_url: string | null;
  auto_correct: boolean | null;
  points_awarded: number | null;
  teacher_comment: string | null;
}

function GradePage() {
  const auth = useClassroomAuth("teacher");
  const { submissionId } = Route.useParams();
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("");
  const [title, setTitle] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    (async () => {
      try {
        const res = await getSubmissionForGrading({ data: { submissionId } });
        const sub = res.submission as {
          assignment_id: string;
          teacher_feedback: string | null;
          assignments: { title: string } | null;
        };
        setAssignmentId(sub.assignment_id);
        setTitle(sub.assignments?.title ?? "Assignment");
        setFeedback(sub.teacher_feedback ?? "");
        setStudentName(res.studentName);
        setProblems(res.problems as Problem[]);
        // Seed default points: auto-correct → full points, else 0
        const ps = res.problems as Problem[];
        const seeded = (res.answers as Answer[]).map((a) => {
          if (a.points_awarded != null) return a;
          const prob = ps.find((p) => p.id === a.problem_id);
          const max = prob?.points ?? 0;
          return { ...a, points_awarded: a.auto_correct ? max : 0 };
        });
        setAnswers(seeded);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      }
      setLoading(false);
    })();
  }, [auth.status, submissionId]);

  const setPoints = (answerId: string, pts: number) => {
    setAnswers((arr) => arr.map((a) => (a.id === answerId ? { ...a, points_awarded: pts } : a)));
  };
  const setComment = (answerId: string, comment: string) => {
    setAnswers((arr) =>
      arr.map((a) => (a.id === answerId ? { ...a, teacher_comment: comment } : a)),
    );
  };

  const totalEarned = answers.reduce((s, a) => s + (a.points_awarded ?? 0), 0);
  const totalMax = problems.reduce((s, p) => s + p.points, 0);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await gradeSubmission({
        data: {
          submissionId,
          feedback: feedback.trim() || null,
          answers: answers.map((a) => ({
            answerId: a.id,
            pointsAwarded: a.points_awarded ?? 0,
            teacherComment: a.teacher_comment ?? null,
          })),
        },
      });
      navigate({
        to: "/teacher/assignment/$assignmentId/submissions",
        params: { assignmentId },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  };

  if (auth.status !== "authenticated") return <div className="min-h-screen bg-cream" />;
  if (loading) {
    return (
      <AppShell role={auth.role} displayName={auth.displayName} onSignOut={signOut}>
        <p className="font-mono text-sm text-ink/60">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell role={auth.role} displayName={auth.displayName} onSignOut={signOut}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink/70">{title}</p>
          <h1 className="mt-1 font-display text-3xl font-black md:text-4xl">
            Grading · {studentName}
          </h1>
        </div>
        <div className="rounded-full border-2 border-ink bg-electric px-5 py-2 font-display text-lg font-black text-cream">
          {totalEarned} / {totalMax}
        </div>
      </div>
      {error && <p className="mt-2 font-mono text-sm text-coral">{error}</p>}

      <div className="mt-6 space-y-4">
        {problems.map((p, idx) => {
          const a = answers.find((x) => x.problem_id === p.id);
          if (!a) return null;
          const studentResponse =
            p.type === "mcq"
              ? (p.choices ?? []).find((c) => c.id === a.selected_choice)?.label ??
                "(no choice)"
              : a.response_text ?? "(blank)";
          const expected =
            p.type === "mcq"
              ? (p.choices ?? []).find((c) => c.correct)?.label ?? "—"
              : p.correct_answer ?? "—";
          return (
            <article
              key={p.id}
              className="rounded-3xl border-2 border-ink bg-cream p-5 shadow-[4px_4px_0_0_var(--ink)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full border-2 border-ink bg-ink px-3 py-1 font-mono text-xs text-cream">
                  Problem {idx + 1} · {p.type}
                </span>
                {p.type !== "free" && (
                  <span
                    className={`rounded-full border-2 border-ink px-3 py-0.5 font-mono text-xs ${
                      a.auto_correct ? "bg-electric text-cream" : "bg-coral text-cream"
                    }`}
                  >
                    {a.auto_correct ? "Auto: correct" : "Auto: wrong"}
                  </span>
                )}
              </div>
              <p className="mt-3 whitespace-pre-wrap font-mono text-sm">{p.prompt}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border-2 border-ink/30 bg-cream p-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
                    Student response
                  </p>
                  <p className="mt-1 whitespace-pre-wrap font-mono text-sm">{studentResponse}</p>
                </div>
                {p.type !== "free" && (
                  <div className="rounded-2xl border-2 border-ink/30 bg-cream p-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
                      Expected
                    </p>
                    <p className="mt-1 whitespace-pre-wrap font-mono text-sm">{expected}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 font-mono text-xs">
                  Points
                  <input
                    type="number"
                    min={0}
                    max={p.points}
                    value={a.points_awarded ?? 0}
                    onChange={(e) =>
                      setPoints(
                        a.id,
                        Math.max(0, Math.min(p.points, Number(e.target.value) || 0)),
                      )
                    }
                    className="w-20 rounded-md border-2 border-ink bg-cream px-2 py-0.5 font-mono text-sm"
                  />
                  <span className="text-ink/60">/ {p.points}</span>
                </label>
                <input
                  value={a.teacher_comment ?? ""}
                  onChange={(e) => setComment(a.id, e.target.value)}
                  placeholder="Comment for student (optional)"
                  className="flex-1 rounded-full border-2 border-ink/40 bg-cream px-3 py-1.5 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-electric/40"
                />
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 rounded-3xl border-2 border-ink bg-cream p-5">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink/70">
          Overall feedback (optional)
        </span>
        <textarea
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="mt-2 w-full rounded-2xl border-2 border-ink bg-cream px-4 py-2 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-electric/40"
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-ink px-6 py-2.5 font-semibold text-cream hover:bg-electric disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save grade"}
        </button>
      </div>
    </AppShell>
  );
}
