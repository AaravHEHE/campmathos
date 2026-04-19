import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Register — Mathos summer camp (free)" },
      {
        name: "description",
        content:
          "Register your child for Mathos, the free summer applied math camp at Naperville Public Library. Drop your email and we'll send schedule and library details.",
      },
      { property: "og:title", content: "Register — Mathos summer camp" },
      {
        property: "og:description",
        content:
          "Sign up with your email and show up to Naperville Public Library. Mathos is completely free.",
      },
    ],
  }),
});

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const { data, error } = await supabase.functions.invoke("send-registration-email", {
        body: { email: email.trim().toLowerCase() },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) {
        throw new Error((data as { error: string }).error);
      }
      setStatus("success");
      setEmail("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setErrorMsg(msg);
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />

      <section className="grid-paper border-b-2 border-ink">
        <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
          <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
            / register
          </p>
          <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-7xl">
            Sign up. Show up. <span className="italic text-electric">Free.</span>
          </h1>
          <p className="mt-6 text-lg text-ink/75">
            Drop your email and we'll send registration confirmation, the full schedule, and the
            library check-in details. The camp itself is completely free — no fees, no surprises.
          </p>

          {status === "success" ? (
            <div className="mt-10 rounded-3xl border-2 border-ink bg-sun p-8">
              <p className="font-mono text-xs uppercase tracking-widest text-ink/70">
                / you're in
              </p>
              <h2 className="mt-2 font-display text-3xl font-black md:text-4xl">
                Check your inbox 📬
              </h2>
              <p className="mt-3 text-ink/80">
                We just sent a confirmation. The full schedule and library check-in details
                will follow as we get closer to June. Questions? Reply to that email.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-6 inline-flex rounded-full border-2 border-ink bg-cream px-6 py-3 font-semibold text-ink transition hover:bg-ink hover:text-cream"
              >
                Sign up another email
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-3 sm:flex-row">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading"}
                  maxLength={320}
                  placeholder="parent@email.com"
                  className="flex-1 rounded-full border-2 border-ink bg-cream px-6 py-4 font-mono text-sm placeholder:text-ink/40 focus:outline-none focus:ring-4 focus:ring-electric/40 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="rounded-full bg-ink px-8 py-4 font-semibold text-cream shadow-[6px_6px_0_0_oklch(0.18_0.04_260_/_0.25)] transition hover:bg-electric disabled:opacity-60"
                >
                  {status === "loading" ? "Signing up…" : "Sign up"}
                </button>
              </form>

              {status === "error" && (
                <p className="mt-4 font-mono text-sm text-coral">
                  {errorMsg || "Something went wrong. Please try again."}
                </p>
              )}
            </>
          )}

          <p className="mt-6 font-mono text-xs text-muted-foreground">
            Questions? Email{" "}
            <a href="mailto:campmathos@gmail.com" className="underline hover:text-electric">
              campmathos@gmail.com
            </a>
            .
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
