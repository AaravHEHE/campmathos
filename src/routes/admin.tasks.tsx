import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import {
  createAdminTask, deleteAdminTask, listAdminTasks, setAdminTaskDone,
  type AdminPerson, type AdminTask,
} from "@/lib/tasks.functions";

export const Route = createFileRoute("/admin/tasks")({
  component: AdminTasks,
  head: () => ({
    meta: [
      { title: "My tasks — MathOs Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

const field =
  "h-11 w-full rounded-xl border-2 border-ink bg-cream px-4 text-ink placeholder:text-ink/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-electric/30";

function AdminTasks() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [me, setMe] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [admins, setAdmins] = useState<AdminPerson[]>([]);
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [view, setView] = useState<string>("me");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [due, setDue] = useState("");
  const [assignee, setAssignee] = useState("");
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  const refresh = useCallback(async () => {
    const r = await listAdminTasks();
    setMe(r.me); setIsOwner(r.isOwner); setAdmins(r.admins); setTasks(r.tasks);
    setAssignee((a) => a || r.me);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate({ to: "/admin/login" });
      try { await refresh(); } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load";
        if (/forbidden|unauthorized/i.test(msg)) return navigate({ to: "/admin/login" });
        setError(msg);
      }
      setLoading(false);
    })();
  }, [navigate, refresh]);

  const emailOf = (id: string) => admins.find((a) => a.id === id)?.email ?? "Former admin";
  const targetId = view === "me" ? me : view;
  const shown = useMemo(
    () => (view === "all" ? tasks : tasks.filter((t) => t.assigned_to === targetId)),
    [tasks, view, targetId],
  );
  const open = shown.filter((t) => !t.done);
  const done = shown.filter((t) => t.done);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await createAdminTask({ data: { title, notes, dueDate: due, assignedTo: assignee || me } });
      setTitle(""); setNotes(""); setDue("");
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not add task"); }
    setSaving(false);
  };

  const toggle = async (t: AdminTask) => {
    setTasks((ts) => ts.map((x) => (x.id === t.id ? { ...x, done: !t.done } : x)));
    try { await setAdminTaskDone({ data: { id: t.id, done: !t.done } }); } catch { await refresh(); }
  };
  const remove = async (t: AdminTask) => {
    if (!confirm(`Delete "${t.title}"?`)) return;
    await deleteAdminTask({ data: { id: t.id } });
    await refresh();
  };
  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return setPwMsg("Use at least 8 characters.");
    const { error } = await supabase.auth.updateUser({ password: pw });
    setPwMsg(error ? error.message : "Password updated.");
    if (!error) setPw("");
  };

  const Row = ({ t }: { t: AdminTask }) => (
    <li className="flex items-start gap-3 border-b-2 border-ink/10 py-3 last:border-0">
      <input type="checkbox" checked={t.done} onChange={() => toggle(t)}
        aria-label={`Mark "${t.title}" ${t.done ? "not done" : "done"}`}
        className="mt-1 h-5 w-5 accent-[var(--color-electric)]" />
      <div className="min-w-0 flex-1">
        <p className={`font-semibold ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</p>
        {t.notes && <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{t.notes}</p>}
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          {t.due_date && <>Due {t.due_date} · </>}
          {view === "all" && <>For {emailOf(t.assigned_to)} · </>}
          From {t.created_by === me ? "you" : emailOf(t.created_by)}
        </p>
      </div>
      {isOwner && <button onClick={() => remove(t)} className="font-mono text-xs text-coral hover:underline">Delete</button>}
    </li>
  );

  return (
    <div className="min-h-screen bg-cream text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">CAMP DIRECTORS · TASKS</p>
            <h1 className="mt-2 font-display text-4xl font-black md:text-5xl">To-do list</h1>
          </div>
          <Link to="/admin" className="rounded-full border-2 border-ink px-5 py-2.5 font-semibold hover:bg-ink hover:text-cream">← Dashboard</Link>
        </div>

        {loading ? <p className="mt-10 font-mono">Loading…</p> : (
          <>
            {error && <p className="mt-6 font-mono text-sm text-coral">{error}</p>}
            {isOwner && <>
            <div className="mt-8 flex flex-wrap gap-2">
              {[{ id: "me", label: "My tasks" }, ...admins.filter((a) => a.id !== me).map((a) => ({ id: a.id, label: a.email })), { id: "all", label: "Everyone" }].map((o) => (
                <button key={o.id} onClick={() => setView(o.id)}
                  className={`rounded-full border-2 border-ink px-4 py-1.5 font-mono text-xs ${view === o.id ? "bg-ink text-cream" : "hover:bg-sun"}`}>
                  {o.label}
                </button>
              ))}
            </div>

            <form onSubmit={add} className="card-3d mt-6 grid gap-3 bg-cream p-6 md:grid-cols-[1fr_auto_auto]">
              <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New task…" className={field} maxLength={300} />
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={field} aria-label="Due date" />
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={field} aria-label="Assign to">
                {admins.map((a) => <option key={a.id} value={a.id}>{a.id === me ? "Me" : a.email}</option>)}
              </select>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)"
                className="min-h-20 rounded-xl border-2 border-ink bg-cream p-4 md:col-span-3" maxLength={2000} />
              <button disabled={saving} className="rounded-full bg-ink px-6 py-3 font-semibold text-cream hover:bg-electric disabled:opacity-60 md:col-span-3 md:justify-self-start">
                {saving ? "Adding…" : "Add task"}
              </button>
            </form>
            </>}

            <section className="card-3d mt-8 bg-cream p-6">
              <h2 className="font-display text-2xl font-black">Open ({open.length})</h2>
              {open.length === 0 ? <p className="mt-3 text-muted-foreground">Nothing to do here. 🎉</p> :
                <ul className="mt-2">{open.map((t) => <Row key={t.id} t={t} />)}</ul>}
              {done.length > 0 && (
                <>
                  <h2 className="mt-8 font-display text-xl font-black">Done ({done.length})</h2>
                  <ul className="mt-2">{done.map((t) => <Row key={t.id} t={t} />)}</ul>
                </>
              )}
            </section>

            <form onSubmit={changePw} className="card-3d mt-8 flex flex-wrap items-center gap-3 bg-cream p-6">
              <p className="w-full font-display text-xl font-black">Change my password</p>
              <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" autoComplete="new-password" className={`${field} max-w-xs`} />
              <button className="rounded-full border-2 border-ink px-5 py-2.5 font-semibold hover:bg-ink hover:text-cream">Update</button>
              {pwMsg && <p className="font-mono text-sm">{pwMsg}</p>}
            </form>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
