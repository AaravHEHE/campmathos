import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Wordmark } from "@/components/Wordmark";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (s) => ({ redirect: (s.redirect as string) || "/app" }),
  head: () => ({
    meta: [
      { title: "Sign in — Camp Mathos" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled || !data.session) return;
      await routeByRole(data.session.user.id);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function routeByRole(userId: string) {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const list = (roles ?? []).map((r) => r.role as string);
    // Camper sign-in is for students only. Directors and teachers must use
    // the Director sign-in page so their workflows stay separate.
    if (list.includes("admin") || list.includes("teacher")) {
      await supabase.auth.signOut();
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }
    const dest = search.redirect && search.redirect !== "/app" ? search.redirect : "/app";
    navigate({ to: dest, replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error: signErr } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (signErr || !data.user) {
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }
    await routeByRole(data.user.id);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6 text-ink">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border-2 border-ink bg-cream p-8 shadow-[8px_8px_0_0_var(--ink)]"
      >
        <Link to="/" className="font-display text-2xl font-black">
          <Wordmark />
        </Link>
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Camp sign in
        </p>
        <h1 className="mt-1 font-display text-3xl font-black">Welcome back</h1>
        <input
          required
          autoFocus
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          placeholder="you@email.com"
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
        <p className="mt-4 font-mono text-xs text-ink/70">
          New here?{" "}
          <Link to="/signup" className="underline">
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
}
