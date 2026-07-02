import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { adminListRegistrations, adminDeleteRegistration, adminListFormEmails } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { SignupsChart } from "@/components/admin/SignupsChart";
import { BroadcastForm } from "@/components/admin/BroadcastForm";
import { EmailOneDialog } from "@/components/admin/EmailOneDialog";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
  head: () => ({
    meta: [
      { title: "Sign-ups dashboard — MathOs Camp Directors" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

interface Registration {
  id: string;
  email: string;
  created_at: string;
  student_first_name: string | null;
  student_last_name: string | null;
  parent_first_name: string | null;
  parent_last_name: string | null;
  phone: string | null;
  grade_level: string | null;
}

type SortKey = "created_at" | "email" | "grade" | "student";
type SortDir = "asc" | "desc";
type FormFilter = "all" | "filled" | "not_filled";

// Map free-text grade values to a canonical order (lower = earlier).
// Unknown/blank grades sort to the very end.
function gradeOrder(raw: string | null | undefined): number {
  if (!raw) return 999;
  const s = raw.trim().toLowerCase();
  const nth = s.match(/(\d+)\s*(?:st|nd|rd|th)?\s*grade/);
  if (nth) return parseInt(nth[1], 10);
  if (/pre[-\s]?algebra/.test(s)) return 20;
  if (/algebra\s*1|algebra\s*i(\b|$)/.test(s)) return 21;
  if (/geometry/.test(s)) return 22;
  if (/algebra\s*2|algebra\s*ii/.test(s)) return 23;
  if (/pre[-\s]?calc/.test(s)) return 24;
  if (/calc/.test(s)) return 25;
  const anyNum = s.match(/\d+/);
  if (anyNum) return parseInt(anyNum[0], 10);
  return 998;
}

function studentName(r: Registration): string {
  const parts = [r.student_first_name, r.student_last_name].filter(Boolean);
  return parts.join(" ").trim();
}


function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Registration[]>([]);
  const [formEmails, setFormEmails] = useState<Set<string>>(new Set());
  const [formSyncError, setFormSyncError] = useState<string | null>(null);
  const [error, setError] = useState("");

  // UI state
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("grade");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState(""); // YYYY-MM-DD, local
  const [dateTo, setDateTo] = useState(""); // YYYY-MM-DD, local (inclusive)
  const [formFilter, setFormFilter] = useState<FormFilter>("all");
  const [emailTarget, setEmailTarget] = useState<Registration | null>(null);


  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session) {
        navigate({ to: "/admin/login" });
        return;
      }
      // Verify admin role server-side via RLS-protected user_roles read.
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      if (cancelled) return;
      const isAdmin = (roles ?? []).some((r) => r.role === "admin");
      if (!isAdmin) {
        await supabase.auth.signOut();
        navigate({ to: "/admin/login" });
        return;
      }
      try {
        const [{ rows: data }, formRes] = await Promise.all([
          adminListRegistrations(),
          adminListFormEmails().catch((e) => ({
            emails: [] as string[],
            error: e instanceof Error ? e.message : "Could not load form responses",
          })),
        ]);
        if (cancelled) return;
        setRows((data as Registration[]) ?? []);
        setFormEmails(new Set(formRes.emails ?? []));
        setFormSyncError(formRes.error ?? null);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Failed to load sign-ups";
        setError(msg);
        if (/forbidden|unauthorized/i.test(msg)) {
          await supabase.auth.signOut();
          navigate({ to: "/admin/login" });
          return;
        }
      }
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const hasFilledForm = (email: string) =>
    formEmails.has(email.trim().toLowerCase());

  // Filtered + sorted view
  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromTs = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    // dateTo is inclusive — add 1 day to include the entire selected day.
    const toTs = dateTo ? new Date(`${dateTo}T00:00:00`).getTime() + 24 * 60 * 60 * 1000 : null;
    const filtered = rows.filter((r) => {
      if (q) {
        const hay = [
          r.email,
          r.student_first_name ?? "",
          r.student_last_name ?? "",
          r.parent_first_name ?? "",
          r.parent_last_name ?? "",
          r.grade_level ?? "",
          r.phone ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (fromTs || toTs) {
        const t = new Date(r.created_at).getTime();
        if (fromTs && t < fromTs) return false;
        if (toTs && t >= toTs) return false;
      }
      if (formFilter === "filled" && !hasFilledForm(r.email)) return false;
      if (formFilter === "not_filled" && hasFilledForm(r.email)) return false;
      return true;
    });
    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "email") cmp = a.email.localeCompare(b.email);
      else if (sortKey === "student")
        cmp = studentName(a).localeCompare(studentName(b));
      else if (sortKey === "grade") {
        cmp = gradeOrder(a.grade_level) - gradeOrder(b.grade_level);
        if (cmp === 0) cmp = studentName(a).localeCompare(studentName(b));
      } else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [rows, search, sortKey, sortDir, dateFrom, dateTo, formFilter, formEmails]);

  const filtersActive = Boolean(search || dateFrom || dateTo || formFilter !== "all");
  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setFormFilter("all");
  };

  // Stats
  const stats = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let last24h = 0;
    let today = 0;
    let thisWeek = 0;
    let filled = 0;
    let notFilled = 0;
    for (const r of rows) {
      const t = new Date(r.created_at).getTime();
      if (now - t <= day) last24h++;
      if (t >= todayStart.getTime()) today++;
      if (t >= weekStart.getTime()) thisWeek++;
      if (hasFilledForm(r.email)) filled++;
      else notFilled++;
    }
    return { total: rows.length, last24h, today, thisWeek, filled, notFilled };
  }, [rows, formEmails]);

  const csv = useMemo(() => {
    const esc = (v: string | null | undefined) =>
      `"${(v ?? "").replace(/"/g, '""')}"`;
    const header =
      "student_first_name,student_last_name,grade_level,parent_first_name,parent_last_name,email,phone,created_at\n";
    const body = visibleRows
      .map((r) =>
        [
          esc(r.student_first_name),
          esc(r.student_last_name),
          esc(r.grade_level),
          esc(r.parent_first_name),
          esc(r.parent_last_name),
          esc(r.email),
          esc(r.phone),
          r.created_at,
        ].join(","),
      )
      .join("\n");
    return header + body;
  }, [visibleRows]);


  const downloadCsv = () => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mathos-signups-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  const copyEmail = async (r: Registration) => {
    try {
      await navigator.clipboard.writeText(r.email);
      setCopiedId(r.id);
      setTimeout(() => setCopiedId((cur) => (cur === r.id ? null : cur)), 1500);
    } catch {
      // Ignore clipboard failures silently.
    }
  };

  const copyAllVisible = async () => {
    if (visibleRows.length === 0) return;
    try {
      await navigator.clipboard.writeText(visibleRows.map((r) => r.email).join(", "));
      setCopiedId("__all__");
      setTimeout(() => setCopiedId((cur) => (cur === "__all__" ? null : cur)), 1500);
    } catch {
      // Ignore.
    }
  };

  const deleteRow = async (r: Registration) => {
    const ok = window.confirm(
      `Remove ${r.email} from the sign-ups list?\n\nThis cannot be undone.`,
    );
    if (!ok) return;
    setDeletingId(r.id);
    setError("");
    try {
      await adminDeleteRegistration({ data: { id: r.id } });
      setRows((prev) => prev.filter((row) => row.id !== r.id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not delete";
      setError(`Could not delete: ${msg}`);
    }
    setDeletingId(null);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "email" ? "asc" : "desc");
    }
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-cream text-ink">
        <SiteHeader />
        <section className="border-b-2 border-ink">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div className="w-full max-w-md">
                <div className="h-3 w-48 animate-pulse rounded-full bg-ink/15" />
                <div className="mt-3 h-12 w-72 animate-pulse rounded-2xl bg-ink/15" />
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="h-11 w-40 animate-pulse rounded-full bg-ink/15" />
                <div className="h-11 w-32 animate-pulse rounded-full bg-ink/15" />
                <div className="h-11 w-24 animate-pulse rounded-full bg-ink/15" />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[92px] animate-pulse rounded-3xl border-2 border-ink/20 bg-ink/10"
                />
              ))}
            </div>

            <div className="mt-8 h-11 w-full max-w-sm animate-pulse rounded-full bg-ink/15" />

            <div className="mt-6 overflow-hidden rounded-3xl border-2 border-ink/20">
              <div className="h-12 w-full bg-ink/80" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between gap-4 px-6 py-4 ${
                    i % 2 === 0 ? "bg-cream" : "bg-cream/60"
                  }`}
                >
                  <div className="h-4 w-1/3 animate-pulse rounded-full bg-ink/15" />
                  <div className="h-4 w-1/4 animate-pulse rounded-full bg-ink/10" />
                  <div className="flex gap-2">
                    <div className="h-7 w-16 animate-pulse rounded-full bg-ink/10" />
                    <div className="h-7 w-16 animate-pulse rounded-full bg-coral/20" />
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center font-mono text-xs text-muted-foreground">
              Loading sign-ups…
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />
      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-6xl px-6 py-16">
          {/* Header */}
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                CAMP DIRECTORS · SIGN-UPS
              </p>
              <h1 className="mt-2 font-display text-4xl font-black md:text-5xl">
                Interest list
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/teacher"
                className="rounded-full border-2 border-ink bg-electric px-5 py-2.5 font-semibold text-cream transition hover:bg-ink"
              >
                Manage classes →
              </Link>
              <button
                onClick={downloadCsv}
                disabled={visibleRows.length === 0}
                className="rounded-full border-2 border-ink bg-sun px-5 py-2.5 font-semibold transition hover:bg-ink hover:text-cream disabled:opacity-50"
              >
                Download CSV{search ? " (filtered)" : ""}
              </button>
              <button
                onClick={copyAllVisible}
                disabled={visibleRows.length === 0}
                className="rounded-full border-2 border-ink px-5 py-2.5 font-semibold transition hover:bg-ink hover:text-cream disabled:opacity-50"
              >
                {copiedId === "__all__"
                  ? "Copied ✓"
                  : `Copy ${visibleRows.length} email${visibleRows.length === 1 ? "" : "s"}`}
              </button>
              <button
                onClick={handleSignOut}
                className="rounded-full border-2 border-ink px-5 py-2.5 font-semibold transition hover:bg-ink hover:text-cream"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Total" value={stats.total} accent="bg-ink text-cream" />
            <StatCard label="Form filled" value={stats.filled} accent="bg-electric text-cream" />
            <StatCard label="Form NOT filled" value={stats.notFilled} accent="bg-coral text-cream" />
            <StatCard label="This week" value={stats.thisWeek} accent="bg-sun text-ink" />
          </div>

          {formSyncError && (
            <p className="mt-4 font-mono text-xs text-coral">
              Google Form sync issue: {formSyncError}
            </p>
          )}

          {/* Sign-ups chart */}
          <div className="mt-6">
            <SignupsChart rows={rows} days={30} />
          </div>

          {/* Broadcast composer */}
          <div className="mt-6">
            <BroadcastForm registrations={rows} formEmails={formEmails} />
          </div>

          {/* Filters */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-auto sm:min-w-[16rem]">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by email…"
                  className="w-full rounded-full border-2 border-ink bg-cream px-5 py-2.5 font-mono text-sm placeholder:text-ink/40 focus:outline-none focus:ring-4 focus:ring-electric/40"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-ink/50 hover:text-ink"
                  >
                    ✕
                  </button>
                )}
              </div>
              <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/70">
                From
                <input
                  type="date"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="rounded-full border-2 border-ink bg-cream px-3 py-1.5 font-mono text-xs focus:outline-none focus:ring-4 focus:ring-electric/40"
                />
              </label>
              <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/70">
                To
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded-full border-2 border-ink bg-cream px-3 py-1.5 font-mono text-xs focus:outline-none focus:ring-4 focus:ring-electric/40"
                />
              </label>
              <div className="inline-flex items-center rounded-full border-2 border-ink p-0.5 font-mono text-[10px] uppercase tracking-widest">
                {(["all", "filled", "not_filled"] as FormFilter[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormFilter(f)}
                    className={`rounded-full px-3 py-1 transition ${
                      formFilter === f
                        ? "bg-ink text-cream"
                        : "text-ink/70 hover:text-ink"
                    }`}
                  >
                    {f === "all" ? "All" : f === "filled" ? "Form ✓" : "Form ✗"}
                  </button>
                ))}
              </div>
              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full border-2 border-ink/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink/70 transition hover:border-ink hover:text-ink"
                >
                  Clear filters
                </button>
              )}
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              Showing {visibleRows.length} of {rows.length}
            </p>
          </div>

          {error && (
            <p className="mt-6 font-mono text-sm text-coral">{error}</p>
          )}

          {/* Table */}
          <div className="mt-6 overflow-x-auto rounded-3xl border-2 border-ink">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-ink text-cream">
                <tr>
                  <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest">
                    <button
                      type="button"
                      onClick={() => toggleSort("grade")}
                      className="font-mono uppercase tracking-widest hover:text-sun"
                    >
                      Grade{sortIndicator("grade")}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest">
                    <button
                      type="button"
                      onClick={() => toggleSort("student")}
                      className="font-mono uppercase tracking-widest hover:text-sun"
                    >
                      Student{sortIndicator("student")}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest">
                    Parent
                  </th>
                  <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest">
                    <button
                      type="button"
                      onClick={() => toggleSort("email")}
                      className="font-mono uppercase tracking-widest hover:text-sun"
                    >
                      Email{sortIndicator("email")}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest">
                    Phone
                  </th>
                  <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest">
                    <button
                      type="button"
                      onClick={() => toggleSort("created_at")}
                      className="font-mono uppercase tracking-widest hover:text-sun"
                    >
                      Submitted{sortIndicator("created_at")}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest">
                    Form
                  </th>
                  <th className="px-4 py-3 text-right font-mono text-xs uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-ink/60">
                      {rows.length === 0
                        ? "No sign-ups yet — they'll show up here as parents register."
                        : "No sign-ups match the current filters."}
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((r, i) => {
                    const filled = hasFilledForm(r.email);
                    const parent = [r.parent_first_name, r.parent_last_name]
                      .filter(Boolean)
                      .join(" ");
                    const student = studentName(r);
                    return (
                      <tr
                        key={r.id}
                        className={i % 2 === 0 ? "bg-cream" : "bg-cream/60"}
                      >
                        <td className="px-4 py-3 font-mono text-sm">
                          {r.grade_level ?? (
                            <span className="text-ink/30">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          {student || <span className="text-ink/30">—</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-ink/70">
                          {parent || <span className="text-ink/30">—</span>}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">
                          <a
                            href={`https://mail.google.com/mail/?view=cm&fs=1&authuser=campmathos@gmail.com&to=${encodeURIComponent(r.email)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-electric hover:underline"
                          >
                            {r.email}
                          </a>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-ink/70">
                          {r.phone ?? <span className="text-ink/30">—</span>}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-ink/70">
                          {new Date(r.created_at).toLocaleString("en-US", {
                            timeZone: "America/Chicago",
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                              filled
                                ? "border-electric/40 bg-electric/10 text-electric"
                                : "border-coral/40 bg-coral/10 text-coral"
                            }`}
                          >
                            {filled ? "Filled ✓" : "Not filled"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEmailTarget(r)}
                              className="rounded-full border border-electric/60 bg-electric/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-electric transition hover:bg-electric hover:text-cream"
                            >
                              Email
                            </button>
                            <button
                              type="button"
                              onClick={() => copyEmail(r)}
                              className="rounded-full border border-ink/30 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink/80 transition hover:bg-ink hover:text-cream"
                            >
                              {copiedId === r.id ? "Copied ✓" : "Copy"}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteRow(r)}
                              disabled={deletingId === r.id}
                              className="rounded-full border border-coral/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-coral transition hover:bg-coral hover:text-cream disabled:opacity-50"
                            >
                              {deletingId === r.id ? "Deleting…" : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {emailTarget && (
            <EmailOneDialog
              email={emailTarget.email}
              displayName={
                studentName(emailTarget) ||
                [emailTarget.parent_first_name, emailTarget.parent_last_name]
                  .filter(Boolean)
                  .join(" ") ||
                null
              }
              onClose={() => setEmailTarget(null)}
            />
          )}

        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className={`rounded-3xl border-2 border-ink p-5 ${accent}`}>
      <p className="font-mono text-[10px] uppercase tracking-widest opacity-80">{label}</p>
      <p className="mt-2 font-display text-4xl font-black leading-none">{value}</p>
    </div>
  );
}
