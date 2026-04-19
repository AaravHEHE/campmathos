import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
  head: () => ({
    meta: [
      { title: "Director login — Mathos" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate({ to: "/admin" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate({ to: "/admin" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (signUpError) throw signUpError;
        setInfo(
          "Account created. If email confirmation is required, check your inbox. An admin still needs to grant your account director access in the database before you can view sign-ups."
        );
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />
      <section className="grid-paper border-b-2 border-ink">
        <div className="mx-auto max-w-md px-6 py-20 md:py-28">
          <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
            / directors only
          </p>
          <h1 className="mt-3 font-display text-4xl font-black md:text-5xl">
            {mode === "signin" ? "Director sign in" : "Create director account"}
          </h1>
          <p className="mt-4 text-ink/70">
            This area is for Mathos directors to view camp sign-ups. Parents looking to
            register should head to the{" "}
            <Link to="/register" className="underline hover:text-electric">
              registration page
            </Link>
            .
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-4 rounded-3xl border-2 border-ink bg-cream p-6"
          >
            <div>
              <label className="font-mono text-xs uppercase tracking-widest text-ink/60">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                maxLength={320}
                className="mt-1 w-full rounded-full border-2 border-ink bg-cream px-5 py-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-electric/40"
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-widest text-ink/60">
                Password
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                minLength={8}
                maxLength={128}
                className="mt-1 w-full rounded-full border-2 border-ink bg-cream px-5 py-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-electric/40"
              />
            </div>

            {error && <p className="font-mono text-sm text-coral">{error}</p>}
            {info && <p className="font-mono text-sm text-ink/70">{info}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-ink px-6 py-3 font-semibold text-cream transition hover:bg-electric disabled:opacity-60"
            >
              {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError("");
                setInfo("");
              }}
              className="block w-full text-center font-mono text-xs text-muted-foreground underline"
            >
              {mode === "signin"
                ? "First time? Create a director account"
                : "Already have an account? Sign in"}
            </button>
          </form>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
