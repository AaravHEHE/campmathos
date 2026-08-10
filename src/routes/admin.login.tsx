import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { markAdminSignedIn } from "@/lib/adminSession";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
  validateSearch: (s: Record<string, unknown>): { next?: string } =>
    typeof s.next === "string" ? { next: s.next } : {},

  head: () => ({
    meta: [
      { title: "Director login — MathOs" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

/** Only same-origin relative paths may be used as a post-login redirect. */
function safeNext(next: string | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}


function AdminLoginPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const redirectTo = safeNext(next);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // On a fresh page load, force sign-out so reloading always returns the
  // Camp Director to this login form (even if the Supabase token is still
  // cached in localStorage). Skipped when an authorization flow sent the
  // Director here, so approving app access doesn't loop.
  useEffect(() => {
    if (redirectTo) return;
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) {
        await supabase.auth.signOut();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [redirectTo]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError || !signInData.session) {
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }

    // Only admins may sign in through this form now.
    const { data: roleRows, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", signInData.session.user.id);

    const roles = (roleRows ?? []).map((r) => r.role as string);
    const isAdmin = roles.includes("admin");

    if (roleError || !isAdmin) {
      await supabase.auth.signOut();
      setError("This account does not have Director access.");
      setLoading(false);
      return;
    }

    markAdminSignedIn();
    if (redirectTo) {
      window.location.href = redirectTo;
      return;
    }
    navigate({ to: "/admin" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6 text-ink">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm card-3d bg-cream p-8"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          DIRECTORS & TEACHERS
        </p>
        <h1 className="mt-2 font-display text-3xl font-black">Sign in</h1>
        <input
          required
          autoFocus
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          placeholder="Director@email.com"
          className="mt-6 w-full rounded-full border-2 border-ink bg-cream px-5 py-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-electric/40"
        />
        <input
          required
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          placeholder="Password"
          className="mt-3 w-full rounded-full border-2 border-ink bg-cream px-5 py-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-electric/40"
        />
        {error && <p className="mt-3 font-mono text-sm text-coral">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-full bg-ink px-6 py-3 font-semibold text-cream transition hover:bg-electric disabled:opacity-60"
        >
          {loading ? "…" : "Sign in"}
        </button>
        <p className="mt-4 font-mono text-[11px] text-muted-foreground">
          Director accounts are provisioned by an existing admin. Contact{" "}
          <a href="mailto:campmathos@gmail.com" className="underline">campmathos@gmail.com</a>{" "}
          if you need access.
        </p>
      </form>
    </main>
  );
}
