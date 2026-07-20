import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { adminGetClassroomAssignment } from "@/lib/gclassroom.functions";

export const Route = createFileRoute(
  "/admin/classroom/course/$courseId/assignment/$courseworkId",
)({
  component: AssignmentDetail,
  head: () => ({
    meta: [
      { title: "Classroom assignment — MathOs" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

type Detail = Awaited<ReturnType<typeof adminGetClassroomAssignment>>;

function stateBadge(state: string | null, late: boolean) {
  const s = (state ?? "").toUpperCase();
  if (s === "TURNED_IN")
    return { label: late ? "Turned in (late)" : "Turned in", cls: "bg-electric/20 text-electric" };
  if (s === "RETURNED") return { label: "Returned", cls: "bg-ink/10 text-ink" };
  if (s === "CREATED" || s === "NEW" || s === "RECLAIMED_BY_STUDENT")
    return { label: "Missing", cls: "bg-coral/15 text-coral" };
  return { label: state ?? "—", cls: "bg-ink/5 text-ink/60" };
}

function AssignmentDetail() {
  const { courseId, courseworkId } = Route.useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: "/admin/login" });
        return;
      }
      try {
        setDetail(await adminGetClassroomAssignment({ data: { courseId, courseworkId } }));
      } catch (e) {
        setErr((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, courseworkId, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <SiteHeader />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <div className="mb-4 text-sm">
          <Link
            to="/admin/classroom/course/$courseId"
            params={{ courseId }}
            className="text-ink/60 hover:text-ink"
          >
            ← {detail?.assignment.course_name ?? "Course"}
          </Link>
        </div>
        {loading ? (
          <p className="text-ink/60">Loading…</p>
        ) : err ? (
          <p className="text-coral">{err}</p>
        ) : !detail ? (
          <p className="text-ink/60">Not found.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-3xl font-serif text-ink">
                  {detail.assignment.title ?? "Untitled assignment"}
                </h1>
                <p className="text-ink/60 text-sm">
                  Due{" "}
                  {detail.assignment.due_at
                    ? new Date(detail.assignment.due_at).toLocaleString()
                    : "—"}
                </p>
              </div>
              <a
                href={`https://classroom.google.com/c/${courseId}/a/${courseworkId}/details`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-electric hover:underline"
              >
                Open in Google Classroom ↗
              </a>
            </div>

            <div className="mt-6 overflow-x-auto rounded border border-ink/10 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-ink/5 text-ink/70 text-left">
                  <tr>
                    <th className="px-3 py-2">Student</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Grade</th>
                    <th className="px-3 py-2">Updated</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {detail.submissions.map((s) => {
                    const b = stateBadge(s.state, s.late);
                    return (
                      <tr key={s.google_user_id} className="border-t border-ink/10">
                        <td className="px-3 py-2">
                          <div className="text-ink">{s.student_name ?? "—"}</div>
                          <div className="text-ink/50 text-xs">{s.student_email ?? ""}</div>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${b.cls}`}>
                            {b.label}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-ink/80">
                          {s.assigned_grade != null ? s.assigned_grade : "—"}
                        </td>
                        <td className="px-3 py-2 text-ink/70 text-xs">
                          {s.gc_updated_at ? new Date(s.gc_updated_at).toLocaleString() : "—"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Link
                            to="/admin/classroom/course/$courseId/student/$studentId"
                            params={{ courseId, studentId: s.google_user_id }}
                            className="text-electric hover:underline text-xs"
                          >
                            Student →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {detail.submissions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-ink/40">
                        No submissions synced.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
