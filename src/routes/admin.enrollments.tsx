import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  adminDeleteEnrollment,
  adminGetCapacity,
  adminListEnrollments,
  adminSaveCapacity,
  adminSetEnrollmentStatus,
  type CapacityStatus,
  type Enrollment,
} from "@/lib/enrollments.functions";

export const Route = createFileRoute("/admin/enrollments")({
  component: AdminEnrollments,
  head: () => ({
    meta: [
      { title: "Enrollments — MathOs Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

const CAMP_YEAR = 2027;
const STATUSES = ["pending", "confirmed", "waitlisted", "withdrawn"] as const;
type Status = (typeof STATUSES)[number];
type FormatFilter = "all" | "in_person" | "online" | "undecided";

// Same sorter as the interest-list dashboard: numeric grades first, then alpha.
function gradeOrder(raw: string | null | undefined): number {
  if (!raw) return 999;
  const match = raw.match(/\d+/);
  return match ? parseInt(match[0], 10) : 998;
}

function formatLabel(f: string) {
  return f === "in_person" ? "In person" : f === "online" ? "Online" : "Undecided";
}

const STATUS_STYLES: Record<Status, string> = {
  pending: "bg-sun text-ink",
  confirmed: "bg-electric text-cream",
  waitlisted: "bg-coral text-cream",
  withdrawn: "bg-ink/10 text-ink/60",
};

const fieldClass =
  "h-11 rounded-xl border-2 border-ink bg-cream px-4 text-ink placeholder:text-ink/40 focus-visible:ring-4 focus-visible:ring-electric/30";

function AdminEnrollments() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<Enrollment[]>([]);
  const [capacity, setCapacity] = useState<CapacityStatus | null>(null);
  const [capInPerson, setCapInPerson] = useState("");
  const [capOnline, setCapOnline] = useState("");
  const [capSaved, setCapSaved] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [selected, setSelected] = useState<Enrollment | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session) {
        navigate({ to: "/admin/login" });
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      if (cancelled) return;
      if (!(roles ?? []).some((r) => r.role === "admin")) {
        await supabase.auth.signOut();
        navigate({ to: "/admin/login" });
        return;
      }
      try {
        const [{ rows: data }, cap] = await Promise.all([
          adminListEnrollments(),
          adminGetCapacity({ data: { campYear: CAMP_YEAR } }),
        ]);
        if (cancelled) return;
        setRows(data ?? []);
        setCapacity(cap);
        setCapInPerson(cap.caps.in_person?.toString() ?? "");
        setCapOnline(cap.caps.online?.toString() ?? "");
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Failed to load enrollments";
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

  const yearRows = useMemo(
    () => rows.filter((r) => r.camp_year === CAMP_YEAR),
    [rows],
  );

  const grades = useMemo(() => {
    const set = new Set(yearRows.map((r) => r.grade_level));
    return Array.from(set).sort((a, b) => gradeOrder(a) - gradeOrder(b) || a.localeCompare(b));
  }, [yearRows]);

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return yearRows
      .filter((r) => {
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        if (formatFilter !== "all" && r.format_preference !== formatFilter) return false;
        if (gradeFilter !== "all" && r.grade_level !== gradeFilter) return false;
        if (q) {
          const hay = [
            r.student_first_name, r.student_last_name, r.parent_first_name,
            r.parent_last_name, r.parent_email, r.parent_phone, r.school, r.grade_level,
          ].join(" ").toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) =>
        gradeOrder(a.grade_level) - gradeOrder(b.grade_level) ||
        a.student_last_name.localeCompare(b.student_last_name),
      );
  }, [yearRows, search, statusFilter, formatFilter, gradeFilter]);

  // Status counts per format for the tile row.
  const tiles = useMemo(() => {
    const blank = () => ({ in_person: 0, online: 0, undecided: 0, total: 0 });
    const counts: Record<Status, ReturnType<typeof blank>> = {
      pending: blank(), confirmed: blank(), waitlisted: blank(), withdrawn: blank(),
    };
    for (const r of yearRows) {
      const bucket = counts[r.status as Status];
      if (!bucket) continue;
      const f = r.format_preference as "in_person" | "online" | "undecided";
      bucket[f] += 1;
      bucket.total += 1;
    }
    return counts;
  }, [yearRows]);

  const refreshRow = (id: string, status: Status) => {
    setRows((current) => current.map((r) => (r.id === id ? { ...r, status } : r)));
    setSelected((current) => (current?.id === id ? { ...current, status } : current));
  };

  const handleStatusChange = async (id: string, status: Status) => {
    setBusyId(id);
    setNotice("");
    try {
      await adminSetEnrollmentStatus({ data: { id, status } });
      refreshRow(id, status);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not update status.");
    } finally {
      setBusyId(null);
    }
  };

  const handlePromote = async (enrollment: Enrollment) => {
    setBusyId(enrollment.id);
    setNotice("");
    try {
      const { data, error } = await supabase.functions.invoke("broadcast-email", {
        body: { mode: "promote-enrollment", enrollmentId: enrollment.id },
      });
      if (error) throw new Error("Promotion failed — please try again.");
      // The promotion can succeed while the email fails: the function then
      // returns ok:true with an error message. Trust ok over error.
      if (!data?.ok) throw new Error(data?.error || "Promotion failed — please try again.");
      refreshRow(enrollment.id, "confirmed");
      setNotice(
        data?.alreadyConfirmed
          ? data.message || `${enrollment.student_first_name} is already confirmed — they have a spot. If the family wasn't emailed, contact them directly.`
          : data?.emailSent
          ? `Promoted ${enrollment.student_first_name} and emailed the family with a 7-day response deadline.`
          : `${enrollment.student_first_name} is confirmed — but the notification email did not send, so please contact the family directly. Do not promote again.`,
      );
      const cap = await adminGetCapacity({ data: { campYear: CAMP_YEAR } });
      setCapacity(cap);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Promotion failed.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (enrollment: Enrollment) => {
    if (!window.confirm(`Delete the enrollment for ${enrollment.student_first_name} ${enrollment.student_last_name}? This cannot be undone.`)) return;
    setBusyId(enrollment.id);
    try {
      await adminDeleteEnrollment({ data: { id: enrollment.id } });
      setRows((current) => current.filter((r) => r.id !== enrollment.id));
      setSelected(null);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusyId(null);
    }
  };

  const handleSaveCapacity = async () => {
    setCapSaved(false);
    setNotice("");
    const parse = (v: string) => {
      const n = parseInt(v, 10);
      return v.trim() && Number.isInteger(n) && n > 0 ? n : null;
    };
    try {
      await adminSaveCapacity({
        data: { campYear: CAMP_YEAR, inPerson: parse(capInPerson), online: parse(capOnline) },
      });
      const cap = await adminGetCapacity({ data: { campYear: CAMP_YEAR } });
      setCapacity(cap);
      setCapSaved(true);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not save capacity.");
    }
  };

  const downloadCsv = () => {
    const esc = (v: string | null | undefined) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = [
      "Student first", "Student last", "Grade", "Date of birth", "Address", "State", "School",
      "Parent first", "Parent last", "Parent email", "Parent phone", "Format",
      "Emergency contact", "Emergency phone", "Emergency relationship",
      "Medical notes", "Photo consent", "Waiver signed at", "Waiver signature",
      "Status", "Submitted",
    ].join(",");
    const body = visibleRows.map((r) => [
      r.student_first_name, r.student_last_name, r.grade_level, r.date_of_birth,
      r.address, r.state, r.school, r.parent_first_name, r.parent_last_name,
      r.parent_email, r.parent_phone, r.format_preference,
      r.emergency_contact_name, r.emergency_contact_phone, r.emergency_contact_relationship,
      r.medical_notes, r.photo_consent ? "yes" : "no", r.waiver_signed_at,
      r.waiver_signature_name, r.status, r.created_at,
    ].map(esc).join(",")).join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mathos-${CAMP_YEAR}-enrollments.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-cream text-ink">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-6 py-24 font-mono">Loading enrollments…</div>
      </main>
    );
  }
  if (error && rows.length === 0) {
    return (
      <main className="min-h-screen bg-cream text-ink">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-6 py-24 font-mono text-coral">{error}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />
      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                CAMP DIRECTORS · ENROLLMENTS
              </p>
              <h1 className="mt-2 font-display text-4xl font-black md:text-5xl">
                {CAMP_YEAR} enrollments
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/admin" className="rounded-full border-2 border-ink px-5 py-2.5 font-semibold transition hover:bg-ink hover:text-cream">
                ← Interest list
              </Link>
              <button
                onClick={downloadCsv}
                disabled={visibleRows.length === 0}
                className="rounded-full border-2 border-ink bg-sun px-5 py-2.5 font-semibold transition hover:bg-ink hover:text-cream disabled:opacity-50"
              >
                Download CSV
              </button>
              <button
                onClick={handleSignOut}
                className="rounded-full border-2 border-ink px-5 py-2.5 font-semibold transition hover:bg-ink hover:text-cream"
              >
                Sign out
              </button>
            </div>
          </div>

          {notice && (
            <p className="mt-6 card-3d bg-sun px-5 py-4 font-mono text-sm">{notice}</p>
          )}

          {/* Status tiles */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATUSES.map((status) => (
              <div key={status} className={`card-3d p-5 ${STATUS_STYLES[status]}`}>
                <p className="font-mono text-xs uppercase tracking-widest opacity-80">{status}</p>
                <p className="mt-1 font-display text-4xl font-black">{tiles[status].total}</p>
                <p className="mt-2 font-mono text-xs opacity-80">
                  {tiles[status].in_person} in person · {tiles[status].online} online · {tiles[status].undecided} undecided
                </p>
              </div>
            ))}
          </div>

          {/* Capacity settings */}
          <div className="mt-8 card-3d bg-cream p-6">
            <p className="font-mono text-xs font-bold uppercase tracking-widest">Capacity limits ({CAMP_YEAR})</p>
            <p className="mt-2 text-sm text-ink/70">
              Leave blank for no cap. When a format fills up, new enrollments are waitlisted automatically.
              {capacity && (
                <>
                  {" "}Currently confirmed: {capacity.confirmed.in_person} in person
                  {capacity.caps.in_person !== null && ` / ${capacity.caps.in_person}`},{" "}
                  {capacity.confirmed.online} online
                  {capacity.caps.online !== null && ` / ${capacity.caps.online}`}.
                </>
              )}
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <label className="block">
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest">In-person cap</span>
                <Input type="number" min={1} value={capInPerson} onChange={(e) => setCapInPerson(e.target.value)} placeholder="No cap" className={`${fieldClass} w-36`} />
              </label>
              <label className="block">
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest">Online cap</span>
                <Input type="number" min={1} value={capOnline} onChange={(e) => setCapOnline(e.target.value)} placeholder="No cap" className={`${fieldClass} w-36`} />
              </label>
              <Button type="button" onClick={handleSaveCapacity} className="h-11 rounded-full bg-ink px-6 text-cream hover:bg-electric">
                {capSaved ? "Saved ✓" : "Save caps"}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, school…"
              className={`${fieldClass} w-full sm:w-72`}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | Status)} className={`${fieldClass} cursor-pointer`}>
              <option value="all">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={formatFilter} onChange={(e) => setFormatFilter(e.target.value as FormatFilter)} className={`${fieldClass} cursor-pointer`}>
              <option value="all">All formats</option>
              <option value="in_person">In person</option>
              <option value="online">Online</option>
              <option value="undecided">Undecided</option>
            </select>
            <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className={`${fieldClass} cursor-pointer`}>
              <option value="all">All grades</option>
              {grades.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="mt-6 overflow-x-auto card-3d bg-cream">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b-2 border-ink font-mono text-xs uppercase tracking-widest">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Format</th>
                  <th className="px-4 py-3">Parent</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center font-mono text-muted-foreground">No enrollments match.</td></tr>
                )}
                {visibleRows.map((r) => (
                  <tr key={r.id} className="border-b border-ink/10 align-top">
                    <td className="px-4 py-3 font-semibold">{r.student_first_name} {r.student_last_name}</td>
                    <td className="px-4 py-3">{r.grade_level}</td>
                    <td className="px-4 py-3">{formatLabel(r.format_preference)}</td>
                    <td className="px-4 py-3">
                      {r.parent_first_name} {r.parent_last_name}
                      <br />
                      <a href={`mailto:${r.parent_email}`} className="text-electric underline">{r.parent_email}</a>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={r.status}
                        disabled={busyId === r.id}
                        onChange={(e) => handleStatusChange(r.id, e.target.value as Status)}
                        className={`cursor-pointer rounded-full border-2 border-ink px-3 py-1 font-mono text-xs font-bold uppercase ${STATUS_STYLES[r.status as Status] ?? ""}`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setSelected(r)} className="rounded-full border-2 border-ink px-3 py-1 font-mono text-xs font-bold transition hover:bg-ink hover:text-cream">
                          Details
                        </button>
                        {r.status === "waitlisted" && (
                          <button
                            onClick={() => handlePromote(r)}
                            disabled={busyId === r.id}
                            className="rounded-full border-2 border-ink bg-electric px-3 py-1 font-mono text-xs font-bold text-cream transition hover:bg-ink disabled:opacity-50"
                          >
                            Promote + email
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <SiteFooter />

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink/50" onClick={() => setSelected(null)}>
          <aside
            className="h-full w-full max-w-lg overflow-y-auto border-l-2 border-ink bg-cream p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Enrollment detail</p>
                <h2 className="mt-1 font-display text-3xl font-black">
                  {selected.student_first_name} {selected.student_last_name}
                </h2>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-full border-2 border-ink px-4 py-1.5 font-mono text-sm transition hover:bg-ink hover:text-cream">
                Close ✕
              </button>
            </div>

            <dl className="mt-6 space-y-4">
              {([
                ["Status", selected.status],
                ["Camp year", String(selected.camp_year)],
                ["Grade", selected.grade_level],
                ["Date of birth", selected.date_of_birth],
                ["Address", `${selected.address}, ${selected.state}`],
                ["School", selected.school],
                ["Format", formatLabel(selected.format_preference)],
                ["Parent", `${selected.parent_first_name} ${selected.parent_last_name}`],
                ["Parent email", selected.parent_email],
                ["Parent phone", selected.parent_phone],
                ["Emergency contact", `${selected.emergency_contact_name} (${selected.emergency_contact_relationship})`],
                ["Emergency phone", selected.emergency_contact_phone],
                ["Photo consent", selected.photo_consent ? "Yes" : "No"],
                ["Waiver signed by", selected.waiver_signature_name],
                ["Waiver signed at", selected.waiver_signed_at ? new Date(selected.waiver_signed_at).toLocaleString() : "—"],
                ["Submitted", new Date(selected.created_at).toLocaleString()],
              ] as Array<[string, string]>).map(([label, value]) => (
                <div key={label}>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</dt>
                  <dd className="mt-1 break-words">{value}</dd>
                </div>
              ))}
              <div className="card-3d bg-sun p-4">
                <dt className="font-mono text-[10px] uppercase tracking-widest">Medical notes</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words">{selected.medical_notes || "None provided"}</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              {selected.status === "waitlisted" && (
                <Button
                  type="button"
                  onClick={() => handlePromote(selected)}
                  disabled={busyId === selected.id}
                  className="rounded-full bg-electric px-6 text-cream hover:bg-ink"
                >
                  Promote + email family
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDelete(selected)}
                disabled={busyId === selected.id}
                className="rounded-full border-2 border-coral text-coral hover:bg-coral hover:text-cream"
              >
                Delete enrollment
              </Button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
