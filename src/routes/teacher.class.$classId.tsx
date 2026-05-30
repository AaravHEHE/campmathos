import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/classroom/AppShell";
import { useClassroomAuth, signOut } from "@/hooks/useClassroomAuth";
import {
  createAssignment,
  getTeacherClass,
  regenerateJoinCode,
  removeStudent,
} from "@/lib/teacher.functions";

export const Route = createFileRoute("/teacher/class/$classId")({
  component: TeacherClassPage,
  head: () => ({
    meta: [
      { title: "Class — Teacher · MathOs" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

interface ClassInfo {
  id: string;
  name: string;
  description: string | null;
  join_code: string;
  archived: boolean;
}
interface RosterRow {
  id: string;
  student_id: string;
  joined_at: string;
  display_name: string | null;
}
interface AssignmentRow {
  id: string;
  title: string;
  due_at: string | null;
  published: boolean;
  created_at: string;
}

function TeacherClassPage() {
  const auth = useClassroomAuth("teacher");
  const { classId } = Route.useParams();
  const navigate = useNavigate();
  const [cls, setCls] = useState<ClassInfo | null>(null);
  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");

  // create assignment
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getTeacherClass({ data: { classId } });
      setCls(res.class as ClassInfo);
      setCode((res.class as ClassInfo).join_code);
      setRoster(res.roster as RosterRow[]);
      setAssignments(res.assignments as AssignmentRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.status, classId]);

  const handleRegenerate = async () => {
    if (!window.confirm("Generate a new join code? The old one will stop working.")) return;
    try {
      const res = await regenerateJoinCode({ data: { classId } });
      setCode(res.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleRemove = async (enrollmentId: string, name: string | null) => {
    if (!window.confirm(`Remove ${name ?? "this student"} from the class?`)) return;
    try {
      await removeStudent({ data: { classId, enrollmentId } });
      setRoster((r) => r.filter((x) => x.id !== enrollmentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await createAssignment({
        data: { classId, title: title.trim() },
      });
      navigate({
        to: "/teacher/assignment/$assignmentId",
        params: { assignmentId: res.assignmentId },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setCreating(false);
    }
  };

  if (auth.status !== "authenticated") return <div className="min-h-screen bg-cream" />;
  if (loading || !cls) {
    return (
      <AppShell role={auth.role} displayName={auth.displayName} onSignOut={signOut}>
        <p className="font-mono text-sm text-ink/60">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell role={auth.role} displayName={auth.displayName} onSignOut={signOut}>
      <Link to="/teacher" className="font-mono text-xs uppercase tracking-widest hover:underline">
        ← Back to dashboard
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black md:text-5xl">{cls.name}</h1>
          {cls.description && (
            <p className="mt-2 max-w-prose font-mono text-sm text-ink/70">{cls.description}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full border-2 border-ink bg-sun px-4 py-1.5 font-mono text-sm uppercase tracking-widest">
            Code · {code}
          </span>
          <button
            onClick={handleRegenerate}
            className="font-mono text-[11px] uppercase tracking-widest text-ink/70 hover:underline"
          >
            Regenerate code
          </button>
        </div>
      </div>
      {error && <p className="mt-3 font-mono text-sm text-coral">{error}</p>}

      <div className="mt-10 grid gap-10 lg:grid-cols-[3fr_2fr]">
        {/* Assignments */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-black">Assignments</h2>
          </div>
          <form
            onSubmit={handleCreateAssignment}
            className="mb-4 flex flex-wrap gap-2 rounded-2xl border-2 border-ink bg-cream p-3"
          >
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New assignment title"
              className="flex-1 rounded-full border-2 border-ink bg-cream px-4 py-2 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-electric/40"
            />
            <button
              type="submit"
              disabled={creating || !title.trim()}
              className="rounded-full bg-ink px-5 py-2 font-semibold text-cream hover:bg-electric disabled:opacity-60"
            >
              {creating ? "…" : "Create"}
            </button>
          </form>
          {assignments.length === 0 ? (
            <p className="rounded-2xl border-2 border-dashed border-ink/30 p-6 font-mono text-sm text-ink/60">
              No assignments yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {assignments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-2xl border-2 border-ink bg-cream p-4"
                >
                  <div>
                    <Link
                      to="/teacher/assignment/$assignmentId"
                      params={{ assignmentId: a.id }}
                      className="font-display text-lg font-black hover:text-electric"
                    >
                      {a.title}
                    </Link>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-ink/60">
                      {a.published ? "Published" : "Draft"}
                      {a.due_at ? ` · Due ${new Date(a.due_at).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <Link
                    to="/teacher/assignment/$assignmentId/submissions"
                    params={{ assignmentId: a.id }}
                    className="rounded-full border-2 border-ink px-4 py-1 font-mono text-xs hover:bg-ink hover:text-cream"
                  >
                    Submissions
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Roster */}
        <section>
          <h2 className="mb-4 font-display text-2xl font-black">
            Roster <span className="text-ink/50">({roster.length})</span>
          </h2>
          {roster.length === 0 ? (
            <p className="rounded-2xl border-2 border-dashed border-ink/30 p-6 font-mono text-sm text-ink/60">
              Share the code <strong>{code}</strong> so students can join.
            </p>
          ) : (
            <ul className="divide-y-2 divide-ink/10 rounded-2xl border-2 border-ink bg-cream">
              {roster.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="font-mono text-sm">{s.display_name ?? "Student"}</span>
                  <button
                    onClick={() => handleRemove(s.id, s.display_name)}
                    className="font-mono text-[11px] uppercase tracking-widest text-coral hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
