import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import {
  adminGetClassroomStatus,
  adminDisconnectClassroom,
  adminSyncClassroom,
  adminListRegistrationsWithClassroom,
  adminGetRegistrationSubmissions,
  adminSearchClassroomStudents,
  adminLinkRegistrationToClassroom,
  adminUnlinkRegistrationFromClassroom,
  adminListClassroomCourses,
  type ClassroomRegistrationRow,
} from "@/lib/gclassroom.functions";

type CourseSummary = {
  course_id: string;
  course_name: string | null;
  students: number;
  last_synced_at: string | null;
};

export const Route = createFileRoute("/admin/classroom")({
  component: AdminClassroom,
  validateSearch: (s: Record<string, unknown>) => ({
    connected: s.connected === 1 || s.connected === "1" ? 1 : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Google Classroom — MathOs Camp Directors" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

type Status = Awaited<ReturnType<typeof adminGetClassroomStatus>>;

function AdminClassroom() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status | null>(null);
  const [rows, setRows] = useState<ClassroomRegistrationRow[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "matched" | "unmatched" | "manual">(
    "all",
  );
  const [detail, setDetail] = useState<ClassroomRegistrationRow | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: "/admin/login" });
        return;
      }
      try {
        const [s, r] = await Promise.all([
          adminGetClassroomStatus(),
          adminListRegistrationsWithClassroom(),
        ]);
        setStatus(s);
        setRows(r.rows);
      } catch (e) {
        setErr((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const stats = useMemo(() => {
    const matched = rows.filter((r) => r.classroom_google_user_id).length;
    const manual = rows.filter((r) => r.classroom_match_status === "manual").length;
    return { total: rows.length, matched, manual, unmatched: rows.length - matched };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "matched" && !r.classroom_google_user_id) return false;
      if (filter === "unmatched" && r.classroom_google_user_id) return false;
      if (filter === "manual" && r.classroom_match_status !== "manual") return false;
      if (!q) return true;
      const hay = [
        r.student_first_name,
        r.student_last_name,
        r.email,
        r.parent_first_name,
        r.parent_last_name,
        r.gc_student_name,
        r.gc_student_email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query, filter]);

  const reload = async () => {
    const [s, r] = await Promise.all([
      adminGetClassroomStatus(),
      adminListRegistrationsWithClassroom(),
    ]);
    setStatus(s);
    setRows(r.rows);
  };

  const runSyncNow = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await adminSyncClassroom();
      setSyncMsg(
        `Synced ${res.courses} course(s), ${res.students_upserted} student rows, ${res.submissions_upserted} submissions. Matched ${res.matched} new registration(s).` +
          (res.errors.length ? ` ${res.errors.length} warning(s).` : ""),
      );
      await reload();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSyncing(false);
    }
  };

  const disconnect = async () => {
    if (!confirm("Disconnect Google Classroom? Existing synced data stays.")) return;
    await adminDisconnectClassroom();
    await reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <SiteHeader />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-serif text-ink">Google Classroom</h1>
            <p className="text-ink/70 text-sm">
              Match camp registrations to students in your Google Classroom courses.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="px-3 py-2 text-sm rounded border border-ink/20 text-ink hover:bg-ink/5"
            >
              ← Sign-ups dashboard
            </Link>
          </div>
        </div>

        {search.connected === 1 && (
          <div className="mb-4 rounded border border-electric/40 bg-electric/10 text-ink px-4 py-2 text-sm">
            Google Classroom connected. Click "Sync now" to pull rosters.
          </div>
        )}
        {err && (
          <div className="mb-4 rounded border border-coral/40 bg-coral/10 text-ink px-4 py-2 text-sm">
            {err}
          </div>
        )}

        {loading ? (
          <p className="text-ink/60">Loading…</p>
        ) : (
          <>
            <ConnectionCard
              status={status}
              onSync={runSyncNow}
              syncing={syncing}
              syncMsg={syncMsg}
              onDisconnect={disconnect}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <StatCard label="Signups" value={stats.total} />
              <StatCard label="Matched" value={stats.matched} tone="electric" />
              <StatCard label="Needs review" value={stats.manual} tone="sun" />
              <StatCard label="Not in Classroom" value={stats.unmatched} tone="coral" />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or email…"
                className="flex-1 min-w-[220px] px-3 py-2 rounded border border-ink/20 bg-white text-ink"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="px-3 py-2 rounded border border-ink/20 bg-white text-ink"
              >
                <option value="all">All</option>
                <option value="matched">Matched only</option>
                <option value="unmatched">Not in Classroom</option>
                <option value="manual">Needs manual review</option>
              </select>
            </div>

            <div className="mt-4 overflow-x-auto rounded border border-ink/10 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-ink/5 text-ink/70 text-left">
                  <tr>
                    <th className="px-3 py-2">Student</th>
                    <th className="px-3 py-2">Grade</th>
                    <th className="px-3 py-2">Parent email</th>
                    <th className="px-3 py-2">In Classroom</th>
                    <th className="px-3 py-2">Assignments</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-t border-ink/10">
                      <td className="px-3 py-2">
                        <div className="text-ink">
                          {[r.student_first_name, r.student_last_name]
                            .filter(Boolean)
                            .join(" ") || "—"}
                        </div>
                        <div className="text-ink/50 text-xs">{r.email}</div>
                      </td>
                      <td className="px-3 py-2 text-ink/80">{r.grade_level ?? "—"}</td>
                      <td className="px-3 py-2 text-ink/70 text-xs">{r.email}</td>
                      <td className="px-3 py-2">
                        <MatchBadge row={r} />
                      </td>
                      <td className="px-3 py-2 text-ink/80">
                        {r.classroom_google_user_id ? (
                          <span>
                            {r.turned_in}/{r.total_assigned}
                            {r.total_assigned > 0 && r.turned_in === r.total_assigned && (
                              <span className="ml-1 text-electric">✓</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-ink/40">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => setDetail(r)}
                          className="text-electric hover:underline text-xs"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-ink/40">
                        No registrations match.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
      {detail && (
        <RegistrationDetailDialog
          row={detail}
          onClose={() => setDetail(null)}
          onChanged={async () => {
            await reload();
          }}
        />
      )}
      <SiteFooter />
    </div>
  );
}

function ConnectionCard({
  status,
  onSync,
  syncing,
  syncMsg,
  onDisconnect,
}: {
  status: Status | null;
  onSync: () => void;
  syncing: boolean;
  syncMsg: string | null;
  onDisconnect: () => void;
}) {
  if (!status) return null;
  if (!status.hasClient) {
    return (
      <div className="rounded border border-coral/30 bg-coral/5 text-ink p-4">
        <h2 className="font-serif text-lg mb-1">Google OAuth not configured</h2>
        <p className="text-sm text-ink/70">
          A developer needs to set <code>GOOGLE_OAUTH_CLIENT_ID</code> and{" "}
          <code>GOOGLE_OAUTH_CLIENT_SECRET</code> in Cloud secrets before this page
          can talk to Google Classroom.
        </p>
      </div>
    );
  }
  if (!status.connected) {
    return (
      <div className="rounded border border-ink/10 bg-white p-4">
        <h2 className="font-serif text-lg mb-1 text-ink">Not connected</h2>
        <p className="text-sm text-ink/70 mb-3">
          Sign in with the Camp Director's Google account that owns the camp's
          Classroom courses. This is a one-time step.
        </p>
        <a
          href="/api/public/oauth/google-classroom/callback?start=1"
          className="inline-block px-4 py-2 rounded bg-ink text-cream text-sm font-medium hover:opacity-90"
        >
          Connect Google Classroom
        </a>
      </div>
    );
  }
  return (
    <div className="rounded border border-ink/10 bg-white p-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="font-serif text-lg text-ink">
          Connected as {status.googleEmail ?? "Google account"}
        </h2>
        {syncMsg && <p className="text-xs text-ink/60 mt-1">{syncMsg}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onSync}
          disabled={syncing}
          className="px-3 py-2 rounded bg-electric text-cream text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {syncing ? "Syncing…" : "Sync now"}
        </button>
        <button
          onClick={onDisconnect}
          className="px-3 py-2 rounded border border-ink/20 text-ink text-sm hover:bg-ink/5"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

function MatchBadge({ row }: { row: ClassroomRegistrationRow }) {
  if (row.classroom_google_user_id) {
    const isManual = row.classroom_match_status === "manual";
    return (
      <div>
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs ${
            isManual ? "bg-sun/30 text-ink" : "bg-electric/20 text-electric"
          }`}
        >
          {isManual ? "Needs review" : "In Classroom"}
        </span>
        {row.gc_student_name && (
          <div className="text-xs text-ink/50 mt-0.5">{row.gc_student_name}</div>
        )}
      </div>
    );
  }
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs bg-coral/15 text-coral">
      Not joined
    </span>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: "electric" | "sun" | "coral" }) {
  const bg =
    tone === "electric"
      ? "bg-electric text-cream"
      : tone === "sun"
        ? "bg-sun text-ink"
        : tone === "coral"
          ? "bg-coral text-cream"
          : "bg-ink text-cream";
  return (
    <div className={`rounded p-4 ${bg}`}>
      <div className="text-2xl font-serif">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  );
}

interface Submission {
  coursework_title: string | null;
  due_at: string | null;
  state: string | null;
  late: boolean;
  assigned_grade: number | null;
  gc_updated_at: string | null;
}

function RegistrationDetailDialog({
  row,
  onClose,
  onChanged,
}: {
  row: ClassroomRegistrationRow;
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const [subs, setSubs] = useState<Submission[] | null>(null);
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<
    { course_id: string; course_name: string | null; google_user_id: string; email: string | null; full_name: string | null }[]
  >([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (!row.classroom_google_user_id) {
        setSubs([]);
        return;
      }
      const r = await adminGetRegistrationSubmissions({
        data: { registrationId: row.id },
      });
      setSubs(r.submissions);
    })();
  }, [row.id, row.classroom_google_user_id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (query.trim().length < 2) {
        setCandidates([]);
        return;
      }
      const r = await adminSearchClassroomStudents({ data: { query } });
      if (!cancelled) setCandidates(r.candidates);
    })();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const link = async (c: { course_id: string; google_user_id: string }) => {
    setBusy(true);
    try {
      await adminLinkRegistrationToClassroom({
        data: {
          registrationId: row.id,
          courseId: c.course_id,
          googleUserId: c.google_user_id,
        },
      });
      await onChanged();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const unlink = async () => {
    setBusy(true);
    try {
      await adminUnlinkRegistrationFromClassroom({
        data: { registrationId: row.id },
      });
      await onChanged();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-cream max-w-2xl w-full rounded shadow-xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-ink/10 flex items-center justify-between">
          <div>
            <div className="font-serif text-xl text-ink">
              {[row.student_first_name, row.student_last_name]
                .filter(Boolean)
                .join(" ") || row.email}
            </div>
            <div className="text-xs text-ink/60">{row.email}</div>
          </div>
          <button onClick={onClose} className="text-ink/60 hover:text-ink">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-6">
          <section>
            <h3 className="font-serif text-ink mb-2">Classroom link</h3>
            {row.classroom_google_user_id ? (
              <div className="text-sm text-ink/80">
                Linked to <strong>{row.gc_student_name ?? row.gc_student_email}</strong>{" "}
                in <em>{row.gc_course_name ?? "course"}</em>.
                <button
                  onClick={unlink}
                  disabled={busy}
                  className="ml-3 text-coral hover:underline text-xs"
                >
                  Unlink
                </button>
              </div>
            ) : (
              <p className="text-sm text-ink/60">
                Not linked to a Classroom student yet.
              </p>
            )}

            <div className="mt-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Classroom by name or email…"
                className="w-full px-3 py-2 rounded border border-ink/20 bg-white text-ink text-sm"
              />
              {candidates.length > 0 && (
                <ul className="mt-2 border border-ink/10 rounded divide-y divide-ink/10 bg-white">
                  {candidates.map((c) => (
                    <li
                      key={`${c.course_id}|${c.google_user_id}`}
                      className="p-2 flex items-center justify-between text-sm"
                    >
                      <div>
                        <div className="text-ink">{c.full_name ?? c.email}</div>
                        <div className="text-xs text-ink/50">
                          {c.email} · {c.course_name ?? c.course_id}
                        </div>
                      </div>
                      <button
                        onClick={() => link(c)}
                        disabled={busy}
                        className="px-2 py-1 rounded bg-ink text-cream text-xs hover:opacity-90"
                      >
                        Link
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section>
            <h3 className="font-serif text-ink mb-2">Assignments</h3>
            {subs === null ? (
              <p className="text-sm text-ink/60">Loading…</p>
            ) : subs.length === 0 ? (
              <p className="text-sm text-ink/60">No assignments synced yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-ink/60 text-left">
                  <tr>
                    <th className="py-1">Assignment</th>
                    <th className="py-1">Due</th>
                    <th className="py-1">Status</th>
                    <th className="py-1">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s, i) => (
                    <tr key={i} className="border-t border-ink/10">
                      <td className="py-1 text-ink">{s.coursework_title ?? "—"}</td>
                      <td className="py-1 text-ink/70">
                        {s.due_at ? new Date(s.due_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-1">
                        <StatePill state={s.state} late={s.late} />
                      </td>
                      <td className="py-1 text-ink/80">
                        {s.assigned_grade ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function StatePill({ state, late }: { state: string | null; late: boolean }) {
  const done = state === "TURNED_IN" || state === "RETURNED";
  const color = done
    ? "bg-electric/20 text-electric"
    : state === "CREATED"
      ? "bg-sun/30 text-ink"
      : "bg-ink/10 text-ink/70";
  const label = done
    ? state === "RETURNED"
      ? "Returned"
      : "Turned in"
    : state === "CREATED"
      ? "In progress"
      : state === "NEW"
        ? "Not started"
        : (state ?? "—");
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs ${color}`}>
      {label}
      {late && !done && <span className="ml-1 text-coral">late</span>}
    </span>
  );
}
