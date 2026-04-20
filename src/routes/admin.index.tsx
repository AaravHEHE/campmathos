import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { adminListRegistrations, adminDeleteRegistration } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { SignupsChart } from "@/components/admin/SignupsChart";
import { BroadcastForm } from "@/components/admin/BroadcastForm";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
  head: () => ({
    meta: [
      { title: "Sign-ups dashboard — MathOs directors" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

interface Registration {
  id: string;
  email: string;
  created_at: string;
}

type SortKey = "created_at" | "email";
type SortDir = "asc" | "desc";

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Registration[]>([]);
  const [error, setError] = useState("");

  // UI state
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session) {
        navigate({ to: "/admin/login" });
        return;
      }
      try {
        const { rows: data } = await adminListRegistrations();
        if (cancelled) return;
        setRows((data as Registration[]) ?? []);
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

  // Filtered + sorted view
  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q ? rows.filter((r) => r.email.toLowerCase().includes(q)) : rows;
    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "email") cmp = a.email.localeCompare(b.email);
      else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [rows, search, sortKey, sortDir]);

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
    for (const r of rows) {
      const t = new Date(r.created_at).getTime();
      if (now - t <= day) last24h++;
      if (t >= todayStart.getTime()) today++;
      if (t >= weekStart.getTime()) thisWeek++;
    }
    return { total: rows.length, last24h, today, thisWeek };
  }, [rows]);

  const csv = useMemo(() => {
    // CSV reflects the current filtered/sorted view so directors can export a slice.
    const header = "email,created_at\n";
    const body = visibleRows
      .map((r) => `"${r.email.replace(/"/g, '""')}",${r.created_at}`)
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
                DIRECTORS · SIGN-UPS
              </p>
              <h1 className="mt-2 font-display text-4xl font-black md:text-5xl">
                Interest list
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
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
            <StatCard label="Today" value={stats.today} accent="bg-electric text-cream" />
            <StatCard label="This week" value={stats.thisWeek} accent="bg-sun text-ink" />
            <StatCard label="Last 24h" value={stats.last24h} accent="bg-coral text-cream" />
          </div>

          {/* Search */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
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
            <p className="font-mono text-xs text-muted-foreground">
              Showing {visibleRows.length} of {rows.length}
            </p>
          </div>

          {error && (
            <p className="mt-6 font-mono text-sm text-coral">{error}</p>
          )}

          {/* Table */}
          <div className="mt-6 overflow-hidden rounded-3xl border-2 border-ink">
            <table className="w-full text-left">
              <thead className="bg-ink text-cream">
                <tr>
                  <th className="px-6 py-3 font-mono text-xs uppercase tracking-widest">
                    <button
                      type="button"
                      onClick={() => toggleSort("email")}
                      className="font-mono uppercase tracking-widest hover:text-sun"
                    >
                      Email{sortIndicator("email")}
                    </button>
                  </th>
                  <th className="px-6 py-3 font-mono text-xs uppercase tracking-widest">
                    <button
                      type="button"
                      onClick={() => toggleSort("created_at")}
                      className="font-mono uppercase tracking-widest hover:text-sun"
                    >
                      Submitted{sortIndicator("created_at")}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-right font-mono text-xs uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-ink/60">
                      {rows.length === 0
                        ? "No sign-ups yet — they'll show up here as parents register."
                        : `No sign-ups match "${search}".`}
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((r, i) => (
                    <tr key={r.id} className={i % 2 === 0 ? "bg-cream" : "bg-cream/60"}>
                      <td className="px-6 py-3 font-mono text-sm">
                        <a
                          href={`mailto:${r.email}`}
                          className="hover:text-electric hover:underline"
                        >
                          {r.email}
                        </a>
                      </td>
                      <td className="px-6 py-3 font-mono text-sm text-ink/70">
                        {new Date(r.created_at).toLocaleString("en-US", {
                          timeZone: "America/Chicago",
                        })}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="inline-flex gap-2">
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
                  ))
                )}
              </tbody>
            </table>
          </div>
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
