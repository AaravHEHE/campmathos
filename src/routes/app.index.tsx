import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, StatusPill } from "@/components/classroom/AppShell";
import { useClassroomAuth, signOut } from "@/hooks/useClassroomAuth";
import { getStudentDashboard } from "@/lib/classroom.functions";

export const Route = createFileRoute("/app/")({
  component: StudentDashboard,
  head: () => ({
    meta: [
      { title: "Dashboard — Camp Mathos" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function StudentDashboard() {
  const auth = useClassroomAuth("student");
  const fetchDash = useServerFn(getStudentDashboard);
  const [data, setData] = useState<Awaited<ReturnType<typeof getStudentDashboard>> | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    fetchDash()
      .then(setData)
      .catch((e) => setErr(e.message ?? "Failed to load"));
  }, [auth.status, fetchDash]);

  if (auth.status !== "authenticated") {
    return <div className="grid min-h-screen place-items-center bg-cream font-mono text-ink/60">Loading…</div>;
  }

  return (
    <AppShell role={auth.role} displayName={auth.displayName} onSignOut={signOut} title="Your classes">
      {err && <p className="font-mono text-coral">{err}</p>}
      {!data && !err && <p className="font-mono text-ink/60">Loading…</p>}
      {data && (
        <>
          <div className="mb-10 flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-sm text-ink/70">
              {data.classes.length} {data.classes.length === 1 ? "class" : "classes"} enrolled
            </p>
            <Link
              to="/app/join"
              className="rounded-full border-2 border-ink bg-electric px-5 py-2 font-semibold text-cream shadow-[4px_4px_0_0_var(--ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_var(--ink)]"
            >
              + Join a class
            </Link>
          </div>

          {data.classes.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-ink/40 p-10 text-center font-mono text-sm text-ink/60">
              You haven't joined any classes yet. Ask your camp director for a join code.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {data.classes.map((c) => (
                <Link
                  key={c.id}
                  to="/app/class/$classId"
                  params={{ classId: c.id }}
                  className="rounded-2xl border-2 border-ink bg-cream p-5 shadow-[4px_4px_0_0_var(--ink)] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_var(--ink)]"
                >
                  <h3 className="font-display text-2xl font-black">{c.name}</h3>
                  {c.description && <p className="mt-1 text-sm text-ink/70">{c.description}</p>}
                </Link>
              ))}
            </div>
          )}

          <h2 className="mt-12 mb-4 font-display text-2xl font-black">Upcoming work</h2>
          {data.assignments.length === 0 ? (
            <p className="font-mono text-sm text-ink/60">Nothing assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {data.assignments.map((a) => (
                <Link
                  key={a.id}
                  to="/app/assignment/$assignmentId"
                  params={{ assignmentId: a.id }}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink bg-cream px-4 py-3 hover:bg-sun"
                >
                  <div>
                    <p className="font-semibold">{a.title}</p>
                    <p className="font-mono text-xs text-ink/60">
                      {a.class_name}
                      {a.due_at && ` • due ${new Date(a.due_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {a.submission_status === "graded" && (
                      <span className="font-mono text-sm">
                        {a.final_score ?? 0}/{a.max_score}
                      </span>
                    )}
                    <StatusPill status={a.submission_status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
