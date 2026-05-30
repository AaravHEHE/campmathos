import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/classroom/AppShell";
import { useClassroomAuth, signOut } from "@/hooks/useClassroomAuth";
import { createClass, getTeacherDashboard } from "@/lib/teacher.functions";

export const Route = createFileRoute("/teacher/")({
  component: TeacherDashboard,
  head: () => ({
    meta: [
      { title: "Teacher dashboard — MathOs" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

interface ClassRow {
  id: string;
  name: string;
  description: string | null;
  join_code: string;
  archived: boolean;
}

function TeacherDashboard() {
  const auth = useClassroomAuth("teacher");
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [pending, setPending] = useState<Array<{ id: string; assignment_id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewerRole, setViewerRole] = useState<"admin" | "teacher" | null>(null);

  // create-class form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getTeacherDashboard();
        if (cancelled) return;
        setClasses(res.classes as ClassRow[]);
        setStudentCount(res.studentCount);
        setPending(res.pendingSubmissions as Array<{ id: string; assignment_id: string }>);
        setViewerRole((res.viewerRole ?? null) as "admin" | "teacher" | null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [auth.status]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await createClass({
        data: { name: name.trim(), description: description.trim() || null },
      });
      navigate({ to: "/teacher/class/$classId", params: { classId: res.classId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create class");
      setCreating(false);
    }
  };

  if (auth.status !== "authenticated") {
    return <div className="min-h-screen bg-cream" />;
  }

  const isAdmin = viewerRole === "admin";

  return (
    <AppShell
      role={auth.role}
      title={isAdmin ? "All classes (admin view)" : "Teacher dashboard"}
      displayName={auth.displayName}
      onSignOut={signOut}
    >
      {isAdmin && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-sun/40 px-5 py-3">
          <p className="font-mono text-xs uppercase tracking-widest">
            Admin · viewing every class in the camp
          </p>
          <Link
            to="/admin"
            className="rounded-full border-2 border-ink px-4 py-1.5 font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-cream"
          >
            ← Sign-ups dashboard
          </Link>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <Stat label="Classes" value={classes.length} accent="bg-electric text-cream" />
        <Stat label="Students" value={studentCount} accent="bg-sun text-ink" />
        <Stat label="Pending grading" value={pending.length} accent="bg-coral text-cream" />
      </div>


      <section className="mt-10 grid gap-8 md:grid-cols-[2fr_1fr]">
        <div>
          <h2 className="mb-4 font-display text-2xl font-black">Your classes</h2>
          {loading ? (
            <p className="font-mono text-sm text-ink/60">Loading…</p>
          ) : classes.length === 0 ? (
            <p className="rounded-2xl border-2 border-dashed border-ink/30 p-6 font-mono text-sm text-ink/60">
              No classes yet. Create your first one →
            </p>
          ) : (
            <ul className="space-y-3">
              {classes.map((c) => (
                <li
                  key={c.id}
                  className="rounded-2xl border-2 border-ink bg-cream p-5 shadow-[4px_4px_0_0_var(--ink)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        to="/teacher/class/$classId"
                        params={{ classId: c.id }}
                        className="font-display text-xl font-black hover:text-electric"
                      >
                        {c.name}
                      </Link>
                      {c.description && (
                        <p className="mt-1 max-w-prose font-mono text-xs text-ink/70">
                          {c.description}
                        </p>
                      )}
                    </div>
                    <span className="rounded-full border-2 border-ink bg-sun px-3 py-1 font-mono text-xs uppercase tracking-widest">
                      Code · {c.join_code}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form
          onSubmit={handleCreate}
          className="h-fit rounded-3xl border-2 border-ink bg-cream p-6 shadow-[6px_6px_0_0_var(--ink)]"
        >
          <h3 className="font-display text-xl font-black">Create class</h3>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Class name"
            className="mt-4 w-full rounded-full border-2 border-ink bg-cream px-4 py-2 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-electric/40"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={3}
            className="mt-3 w-full rounded-2xl border-2 border-ink bg-cream px-4 py-2 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-electric/40"
          />
          {error && <p className="mt-2 font-mono text-xs text-coral">{error}</p>}
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="mt-4 w-full rounded-full bg-ink px-5 py-2.5 font-semibold text-cream transition hover:bg-electric disabled:opacity-60"
          >
            {creating ? "…" : "Create"}
          </button>
        </form>
      </section>
    </AppShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className={`rounded-3xl border-2 border-ink p-5 ${accent}`}>
      <p className="font-mono text-[11px] uppercase tracking-widest opacity-80">{label}</p>
      <p className="mt-2 font-display text-4xl font-black">{value}</p>
    </div>
  );
}
