import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Wordmark } from "@/components/Wordmark";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({
    meta: [
      { title: "Create account — Camp Mathos" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function SignupPage() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const { data, error: signErr } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { display_name: displayName.trim() || undefined },
      },
    });
    if (signErr) {
      setError(signErr.message);
      setLoading(false);
      return;
    }
    if (data.session) {
      window.location.href = "/app";
    } else {
      // Email confirmation required
      setError("Check your email to confirm your account, then sign in.");
      setLoading(false);
    }
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
          Camper sign up
        </p>
        <h1 className="mt-1 font-display text-3xl font-black">Create account</h1>
        <input
          required
          autoFocus
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={loading}
          placeholder="Your name"
          className="mt-6 w-full rounded-full border-2 border-ink bg-cream px-5 py-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-electric/40"
        />
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          placeholder="you@email.com"
          className="mt-3 w-full rounded-full border-2 border-ink bg-cream px-5 py-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-electric/40"
        />
        <input
          required
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          placeholder="Password (8+ characters)"
          className="mt-3 w-full rounded-full border-2 border-ink bg-cream px-5 py-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-electric/40"
        />
        {error && <p className="mt-3 font-mono text-sm text-coral">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-full bg-ink px-6 py-3 font-semibold text-cream transition hover:bg-electric disabled:opacity-60"
        >
          {loading ? "…" : "Create account"}
        </button>
        <p className="mt-4 font-mono text-xs text-ink/70">
          Already have an account?{" "}
          <Link to="/login" className="underline">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
