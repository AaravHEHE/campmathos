import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, StatusPill } from "@/components/classroom/AppShell";
import { useClassroomAuth, signOut } from "@/hooks/useClassroomAuth";
import { getAssignmentSubmissions } from "@/lib/teacher.functions";

export const Route = createFileRoute("/teacher/assignment/$assignmentId/submissions")({
  component: SubmissionsPage,
  head: () => ({
    meta: [
      { title: "Submissions — MathOs" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

interface Sub {
  id: string;
  student_id: string;
  status: "in_progress" | "submitted" | "graded";
  submitted_at: string | null;
  graded_at: string | null;
  auto_score: number | null;
  final_score: number | null;
  max_score: number;
  student_name: string;
}

function SubmissionsPage() {
  const auth = useClassroomAuth("teacher");
  const { assignmentId } = Route.useParams();
  const [title, setTitle] = useState("");
  const [classId, setClassId] = useState("");
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    (async () => {
      try {
        const res = await getAssignmentSubmissions({ data: { assignmentId } });
        const a = res.assignment as { id: string; title: string; class_id: string };
        setTitle(a.title);
        setClassId(a.class_id);
        setSubs(res.submissions as Sub[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      }
      setLoading(false);
    })();
  }, [auth.status, assignmentId]);

  if (auth.status !== "authenticated") return <div className="min-h-screen bg-cream" />;

  return (
    <AppShell role={auth.role} displayName={auth.displayName} onSignOut={signOut}>
      {classId && (
        <Link
          to="/teacher/class/$classId"
          params={{ classId }}
          className="font-mono text-xs uppercase tracking-widest hover:underline"
        >
          ← Back to class
        </Link>
      )}
      <h1 className="mt-3 font-display text-3xl font-black md:text-4xl">
        Submissions · <span className="text-ink/70">{title}</span>
      </h1>
      <Link
        to="/teacher/assignment/$assignmentId"
        params={{ assignmentId }}
        className="mt-2 inline-block font-mono text-xs uppercase tracking-widest text-electric hover:underline"
      >
        Edit assignment →
      </Link>

      {error && <p className="mt-4 font-mono text-sm text-coral">{error}</p>}

      {loading ? (
        <p className="mt-6 font-mono text-sm text-ink/60">Loading…</p>
      ) : subs.length === 0 ? (
        <p className="mt-6 rounded-2xl border-2 border-dashed border-ink/30 p-6 font-mono text-sm text-ink/60">
          No submissions yet.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-3xl border-2 border-ink bg-cream">
          <table className="w-full text-left">
            <thead className="bg-ink text-cream">
              <tr>
                <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest">Student</th>
                <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest">Submitted</th>
                <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest">Score</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {subs.map((s, i) => (
                <tr key={s.id} className={i % 2 === 0 ? "bg-cream" : "bg-cream/60"}>
                  <td className="px-4 py-3 font-mono text-sm">{s.student_name}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={s.status} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink/70">
                    {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">
                    {s.final_score != null
                      ? `${s.final_score} / ${s.max_score}`
                      : s.auto_score != null
                        ? `${s.auto_score} / ${s.max_score} (auto)`
                        : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {s.status !== "in_progress" && (
                      <Link
                        to="/teacher/submission/$submissionId"
                        params={{ submissionId: s.id }}
                        className="rounded-full border-2 border-ink px-3 py-1 font-mono text-xs hover:bg-ink hover:text-cream"
                      >
                        {s.status === "graded" ? "Review" : "Grade"}
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
