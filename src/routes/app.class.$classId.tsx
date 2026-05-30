import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, StatusPill } from "@/components/classroom/AppShell";
import { useClassroomAuth, signOut } from "@/hooks/useClassroomAuth";
import { getStudentClass } from "@/lib/classroom.functions";

export const Route = createFileRoute("/app/class/$classId")({
  component: StudentClassPage,
  head: () => ({
    meta: [
      { title: "Class — Camp Mathos" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function StudentClassPage() {
  const { classId } = Route.useParams();
  const auth = useClassroomAuth("student");
  const fetchClass = useServerFn(getStudentClass);
  const [data, setData] = useState<Awaited<ReturnType<typeof getStudentClass>> | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    fetchClass({ data: { classId } })
      .then(setData)
      .catch((e) => setErr(e.message ?? "Could not load"));
  }, [auth.status, classId, fetchClass]);

  if (auth.status !== "authenticated") {
    return <div className="grid min-h-screen place-items-center bg-cream font-mono text-ink/60">Loading…</div>;
  }

  return (
    <AppShell role={auth.role} displayName={auth.displayName} onSignOut={signOut}>
      <Link to="/app" className="font-mono text-xs text-ink/60 hover:underline">
        ← All classes
      </Link>
      {err && <p className="mt-4 font-mono text-coral">{err}</p>}
      {data && (
        <>
          <h1 className="mt-3 font-display text-4xl font-black">{data.class.name}</h1>
          {data.class.description && (
            <p className="mt-2 text-ink/70">{data.class.description}</p>
          )}

          <h2 className="mt-10 mb-4 font-display text-2xl font-black">Assignments</h2>
          {data.assignments.length === 0 ? (
            <p className="font-mono text-sm text-ink/60">No assignments published yet.</p>
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
                    {a.due_at && (
                      <p className="font-mono text-xs text-ink/60">
                        Due {new Date(a.due_at).toLocaleDateString()}
                      </p>
                    )}
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
