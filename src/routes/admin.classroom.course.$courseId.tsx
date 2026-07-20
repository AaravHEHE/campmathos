import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { adminGetClassroomCourseDetail } from "@/lib/gclassroom.functions";

export const Route = createFileRoute("/admin/classroom/course/$courseId")({
  component: CourseDetail,
  head: () => ({
    meta: [
      { title: "Classroom course — MathOs" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

type Detail = Awaited<ReturnType<typeof adminGetClassroomCourseDetail>>;

function CourseDetail() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [tab, setTab] = useState<"students" | "assignments">("students");
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
        const d = await adminGetClassroomCourseDetail({ data: { courseId } });
        setDetail(d);
      } catch (e) {
        setErr((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <SiteHeader />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <div className="mb-4 text-sm">
          <Link to="/admin/classroom" className="text-ink/60 hover:text-ink">
            ← Google Classroom
          </Link>
        </div>
        {loading ? (
          <p className="text-ink/60">Loading course…</p>
        ) : err ? (
          <p className="text-coral">{err}</p>
        ) : !detail ? (
          <p className="text-ink/60">Course not found.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-3xl font-serif text-ink">
                  {detail.course.name ?? "Untitled course"}
                </h1>
                <p className="text-ink/60 text-sm">
                  {detail.students.length} student{detail.students.length === 1 ? "" : "s"} ·{" "}
                  {detail.coursework.length} assignment{detail.coursework.length === 1 ? "" : "s"}
                </p>
              </div>
              <a
                href={`https://classroom.google.com/c/${detail.course.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-electric hover:underline"
              >
                Open in Google Classroom ↗
              </a>
            </div>

            <div className="mt-6 flex gap-2 border-b border-ink/10">
              {(["students", "assignments"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm capitalize ${
                    tab === t
                      ? "border-b-2 border-ink text-ink font-medium"
                      : "text-ink/50 hover:text-ink"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "students" ? (
              <div className="mt-4 overflow-x-auto rounded border border-ink/10 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-ink/5 text-ink/70 text-left">
                    <tr>
                      <th className="px-3 py-2">Student</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Turned in</th>
                      <th className="px-3 py-2">Graded</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.students.map((s) => (
                      <tr key={s.google_user_id} className="border-t border-ink/10">
                        <td className="px-3 py-2 text-ink">{s.full_name ?? "—"}</td>
                        <td className="px-3 py-2 text-ink/70 text-xs">{s.email ?? "—"}</td>
                        <td className="px-3 py-2 text-ink/80">
                          {s.turned_in}/{s.total}
                        </td>
                        <td className="px-3 py-2 text-ink/80">
                          {s.graded}/{s.total}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Link
                            to="/admin/classroom/course/$courseId/student/$studentId"
                            params={{ courseId, studentId: s.google_user_id }}
                            className="text-electric hover:underline text-xs"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {detail.students.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-center text-ink/40">
                          No students synced.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto rounded border border-ink/10 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-ink/5 text-ink/70 text-left">
                    <tr>
                      <th className="px-3 py-2">Assignment</th>
                      <th className="px-3 py-2">Due</th>
                      <th className="px-3 py-2">Turned in</th>
                      <th className="px-3 py-2">Late</th>
                      <th className="px-3 py-2">Missing</th>
                      <th className="px-3 py-2">Graded</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.coursework.map((c) => (
                      <tr key={c.coursework_id} className="border-t border-ink/10">
                        <td className="px-3 py-2 text-ink">
                          {c.coursework_title ?? "Untitled"}
                        </td>
                        <td className="px-3 py-2 text-ink/70 text-xs">
                          {c.due_at ? new Date(c.due_at).toLocaleString() : "—"}
                        </td>
                        <td className="px-3 py-2 text-ink/80">
                          {c.turned_in}/{c.total}
                        </td>
                        <td className="px-3 py-2 text-ink/80">{c.late}</td>
                        <td className="px-3 py-2 text-ink/80">{c.missing}</td>
                        <td className="px-3 py-2 text-ink/80">
                          {c.graded}/{c.total}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Link
                            to="/admin/classroom/course/$courseId/assignment/$courseworkId"
                            params={{ courseId, courseworkId: c.coursework_id }}
                            className="text-electric hover:underline text-xs"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {detail.coursework.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-3 py-6 text-center text-ink/40">
                          No assignments synced yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
