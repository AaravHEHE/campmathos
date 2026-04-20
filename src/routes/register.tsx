import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { canonical, ogImage } from "@/lib/seo";

const OG = ogImage("/og-register.jpg");

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Express interest — MathOs summer camp (free)" },
      {
        name: "description",
        content:
          "Let us know your child is interested in MathOs, the free summer applied math camp at Naperville Public Library. No commitment — we'll send schedule and library details as June gets closer.",
      },
      { property: "og:title", content: "Express interest — MathOs summer camp" },
      {
        property: "og:description",
        content:
          "Drop your email to express interest. No commitment required. MathOs is a completely free summer math camp at Naperville Public Library.",
      },
      { property: "og:image", content: OG },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG },
    ],
    links: [canonical("/register")],
  }),
});

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const { data, error } = await supabase.functions.invoke("send-registration-email", {
        body: { email: email.trim().toLowerCase() },
      });

      // The edge function may return a non-2xx with a JSON body. Try to read
      // the body from the error context first so we surface friendly messages
      // instead of generic "Edge Function returned a non-2xx status code".
      let payload = (data ?? null) as
        | { error?: string; duplicate?: boolean; message?: string; ok?: boolean }
        | null;

      if (error) {
        const ctx = (error as { context?: Response }).context;
        if (ctx && typeof ctx.json === "function") {
          try {
            payload = await ctx.json();
          } catch {
            // ignore parse failure, fall through to generic message
          }
        }
        if (!payload?.duplicate && !payload?.error) {
          throw new Error(payload?.message || "Something went wrong. Please try again.");
        }
      }

      if (payload?.duplicate) {
        setStatus("duplicate");
        return;
      }
      if (payload?.error) {
        throw new Error(payload.error);
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
          <p className="font-mono text-sm tracking-widest text-muted-foreground">
            Interest form
          </p>
          <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-7xl">
            Curious? <span className="italic text-electric">Tell us.</span>
          </h1>
          <p className="mt-6 text-lg text-ink/75">
            This isn't a commitment — just a heads-up that your family is interested. Drop your
            email and we'll send the full schedule, library check-in details, and any updates as
            June gets closer. Decide later whether to come. The camp itself is always free.
          </p>

          {status === "success" ? (
            <div className="mt-10 rounded-3xl border-2 border-ink bg-sun p-8">
              <p className="font-mono text-xs tracking-widest text-ink/70">
                Noted
              </p>
              <h2 className="mt-2 font-display text-3xl font-black md:text-4xl">
                Thanks for letting us know 📬
              </h2>
              <p className="mt-3 text-ink/80">
                We just sent a confirmation. We'll follow up with the full schedule and library
                details as we get closer to June — no commitment until then. Questions? Reply to
                that email.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-6 inline-flex rounded-full border-2 border-ink bg-cream px-6 py-3 font-semibold text-ink transition hover:bg-ink hover:text-cream"
              >
                Add another email
              </button>
            </div>
          ) : status === "duplicate" ? (
            <div className="mt-10 rounded-3xl border-2 border-ink bg-electric p-8 text-cream">
              <p className="font-mono text-xs tracking-widest text-cream/70">
                Already on the list
              </p>
              <h2 className="mt-2 font-display text-3xl font-black md:text-4xl">
                Looks like you've already signed up 📬
              </h2>
              <p className="mt-3 text-cream/85">
                We already have <strong>{email}</strong> on our interest list — no need to sign
                up again. We'll be in touch as June gets closer with the schedule and library
                details. Questions? Email{" "}
                <a href="mailto:campmathos@gmail.com" className="underline">
                  campmathos@gmail.com
                </a>
                .
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setEmail("");
                }}
                className="mt-6 inline-flex rounded-full border-2 border-cream bg-ink px-6 py-3 font-semibold text-cream transition hover:bg-cream hover:text-ink"
              >
                Use a different email
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
                  {status === "loading" ? "Sending…" : "I'm interested"}
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

          {/* Discreet director link — sign-in is gated by Supabase Auth + admin role. */}
          <div className="mt-12">
            <Link
              to="/admin/login"
              aria-label="Director sign-in"
              className="font-mono text-[10px] tracking-widest text-ink/20 transition hover:text-ink/60"
            >
              Admin
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
