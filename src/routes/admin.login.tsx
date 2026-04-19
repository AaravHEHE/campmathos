import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const ADMIN_PASSWORD = "CampMathos123!@#";
const STORAGE_KEY = "mathos-admin-ok";

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
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY) === "1") {
      navigate({ to: "/admin" });
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      navigate({ to: "/admin" });
    } else {
      setError("Incorrect password.");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6 text-ink">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border-2 border-ink bg-cream p-8 shadow-[8px_8px_0_0_var(--ink)]"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          DIRECTORS ONLY
        </p>
        <h1 className="mt-2 font-display text-3xl font-black">Enter password</h1>
        <input
          required
          autoFocus
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          placeholder="Password"
          className="mt-6 w-full rounded-full border-2 border-ink bg-cream px-5 py-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-electric/40"
        />
        {error && <p className="mt-3 font-mono text-sm text-coral">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-full bg-ink px-6 py-3 font-semibold text-cream transition hover:bg-electric disabled:opacity-60"
        >
          {loading ? "…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
