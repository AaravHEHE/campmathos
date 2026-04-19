import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
  head: () => ({
    meta: [
      { title: "Sign-ups dashboard — Mathos directors" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

interface Registration {
  id: string;
  email: string;
  created_at: string;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [rows, setRows] = useState<Registration[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: "/admin/login" });
        return;
      }
      if (cancelled) return;
      setUserEmail(session.user.email ?? "");

      // Check admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const isAdmin = (roles ?? []).some((r) => r.role === "admin");
      setAuthorized(isAdmin);

      if (isAdmin) {
        const { data, error: queryError } = await supabase
          .from("registrations")
          .select("id, email, created_at")
          .order("created_at", { ascending: false });
        if (queryError) {
          setError(queryError.message);
        } else {
          setRows((data as Registration[]) ?? []);
        }
      }
      setLoading(false);
    };

    check();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/admin/login" });
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const csv = useMemo(() => {
    const header = "email,created_at\n";
    const body = rows
      .map((r) => `${r.email.replace(/"/g, '""')},${r.created_at}`)
      .join("\n");
    return header + body;
  }, [rows]);

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

  if (loading) {
    return (
      <main className="min-h-screen bg-cream text-ink">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center font-mono text-sm text-muted-foreground">
          Loading…
        </div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-cream text-ink">
        <SiteHeader />
        <section className="border-b-2 border-ink">
          <div className="mx-auto max-w-2xl px-6 py-20">
            <p className="font-mono text-sm uppercase tracking-widest text-coral">
              / not authorized
            </p>
            <h1 className="mt-3 font-display text-4xl font-black">
              Your account isn't a director yet.
            </h1>
            <p className="mt-4 text-ink/70">
              You're signed in as <strong>{userEmail}</strong>, but this account hasn't been
              granted director access. Ask an existing director to add your account, then come
              back here.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleSignOut}
                className="rounded-full border-2 border-ink px-6 py-3 font-semibold transition hover:bg-ink hover:text-cream"
              >
                Sign out
              </button>
              <Link
                to="/"
                className="rounded-full bg-ink px-6 py-3 font-semibold text-cream transition hover:bg-electric"
              >
                Home
              </Link>
            </div>
          </div>
        </section>
        <SiteFooter />
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
                / directors · sign-ups
              </p>
              <h1 className="mt-2 font-display text-4xl font-black md:text-5xl">
                {rows.length} {rows.length === 1 ? "registration" : "registrations"}
              </h1>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Signed in as {userEmail}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={downloadCsv}
                disabled={rows.length === 0}
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

          {error && (
            <p className="mt-6 font-mono text-sm text-coral">Error loading sign-ups: {error}</p>
          )}

          <div className="mt-10 overflow-hidden rounded-3xl border-2 border-ink">
            <table className="w-full text-left">
              <thead className="bg-ink text-cream">
                <tr>
                  <th className="px-6 py-3 font-mono text-xs uppercase tracking-widest">Email</th>
                  <th className="px-6 py-3 font-mono text-xs uppercase tracking-widest">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center text-ink/60">
                      No sign-ups yet — they'll show up here as parents register.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={r.id} className={i % 2 === 0 ? "bg-cream" : "bg-cream/60"}>
                      <td className="px-6 py-3 font-mono text-sm">{r.email}</td>
                      <td className="px-6 py-3 font-mono text-sm text-ink/70">
                        {new Date(r.created_at).toLocaleString("en-US", {
                          timeZone: "America/Chicago",
                        })}
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
