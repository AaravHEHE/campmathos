import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { canonical, ogImage } from "@/lib/seo";

const OG = ogImage("/og-sponsors.jpg");

export const Route = createFileRoute("/sponsors")({
  component: SponsorsPage,
  head: () => ({
    meta: [
      { title: "Sponsor MathOs — help keep the camp free" },
      {
        name: "description",
        content:
          "MathOs is a free, student-run applied math camp. Sponsors help cover venue costs, snacks, and materials — donate money or offer resources in a minute.",
      },
      { property: "og:title", content: "Sponsor MathOs — help keep the camp free" },
      {
        property: "og:description",
        content:
          "Support a free, student-run applied math summer camp. Donate money or offer resources like venue space, snacks, and supplies.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://campmathos.com/sponsors" },
      { property: "og:image", content: OG },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG },
    ],
    links: [canonical("/sponsors")],
  }),
});

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

type Choice = "money" | "resources";

function SponsorsPage() {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const pick = (next: Choice) => {
    setChoice(next);
    setStatus("idle");
    setErrorMsg("");
  };

  const reset = () => {
    setChoice(null);
    setName("");
    setEmail("");
    setMessage("");
    setStatus("idle");
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!choice) return;
    const cleanedEmail = email.trim().toLowerCase();
    const cleanedName = name.trim();

    if (!cleanedName) {
      setErrorMsg("Please tell us your name.");
      setStatus("error");
      return;
    }
    if (!EMAIL_RE.test(cleanedEmail) || cleanedEmail.length > 320) {
      setErrorMsg("That doesn't look like a valid email address — please check it for typos.");
      setStatus("error");
      return;
    }
    if (choice === "resources" && !message.trim()) {
      setErrorMsg("Let us know what you'd like to offer so we can follow up.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    try {
      const { data, error } = await supabase.functions.invoke("send-registration-email", {
        body: {
          kind: "sponsor",
          type: choice,
          name: cleanedName,
          email: cleanedEmail,
          message: message.trim(),
        },
      });

      let payload = (data ?? null) as { error?: string; ok?: boolean } | null;

      if (error) {
        const ctx = (error as { context?: Response }).context;
        if (ctx && typeof ctx.json === "function") {
          try {
            payload = await ctx.json();
          } catch {
            // ignore parse failure
          }
        }
        if (!payload?.error) {
          throw new Error("Something went wrong. Please try again.");
        }
      }
      if (payload?.error) throw new Error(payload.error);

      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />

      <section className="grid-paper border-b-2 border-ink">
        <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
          <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
            Support MathOs
          </p>
          <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-7xl">
            Help us keep this <span className="italic text-electric">free</span>.
          </h1>
          <p className="mt-6 text-lg text-ink/75">
            MathOs is entirely free and entirely student-run — built and taught by the math team.
            Sponsors help cover the things that make camp happen: venue costs, snacks, printed
            materials, and equipment. Every bit goes straight back to the campers.
          </p>

          {status === "success" ? (
            <div className="mt-12 card-3d bg-sun p-8">
              <p className="font-mono text-xs uppercase tracking-widest text-ink/70">
                Message received
              </p>
              <h2 className="mt-2 font-display text-3xl font-black md:text-4xl">
                Thanks — we'll be in touch 🎉
              </h2>
              <p className="mt-3 text-ink/80">
                We've sent a confirmation to <strong>{email}</strong> and passed your note along to
                our Camp Directors. Questions in the meantime? Reply to that email or write to{" "}
                <a href="mailto:campmathos@gmail.com" className="underline">
                  campmathos@gmail.com
                </a>
                .
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-6 inline-flex min-h-[44px] items-center rounded-full border-2 border-ink bg-cream px-6 py-3 font-semibold text-ink transition hover:bg-ink hover:text-cream"
              >
                Send another message
              </button>
            </div>
          ) : (
            <>
              <div className="mt-12 card-3d-inverse bg-ink p-6 text-cream">
                <p className="font-mono text-xs uppercase tracking-widest opacity-70">
                  No payment here
                </p>
                <p className="mt-2 text-base">
                  This form just starts the conversation — nothing is charged and no payment details
                  are collected. A Camp Director will email you back personally.
                </p>
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-2">
                <ChoiceCard
                  active={choice === "money"}
                  onClick={() => pick("money")}
                  label="Donate Money"
                  blurb="Cover venue, snacks, and materials directly."
                  icon={
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M14.5 9.2A3 3 0 0 0 12 8c-1.4 0-2.5.8-2.5 1.9 0 2.6 5 1.4 5 4.1 0 1.1-1.1 2-2.5 2a3 3 0 0 1-2.5-1.2M12 6.5v11" />
                    </svg>
                  }
                />
                <ChoiceCard
                  active={choice === "resources"}
                  onClick={() => pick("resources")}
                  label="Donate Resources"
                  blurb="Venue space, snacks, supplies, or equipment."
                  icon={
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 8h18v12H3z" />
                      <path d="M3 8l2-4h14l2 4M12 4v16" />
                    </svg>
                  }
                />
              </div>

              {choice && (
                <form onSubmit={handleSubmit} className="mt-10 card-3d bg-cream p-6 md:p-8">
                  <p className="font-mono text-xs uppercase tracking-widest text-ink/60">
                    {choice === "money" ? "Monetary sponsorship" : "Resource donation"}
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-black">
                    Tell us a little{" "}
                    <span className="italic text-electric">about you</span>.
                  </h2>

                  <div className="mt-6 flex flex-col gap-4">
                    <label className="flex flex-col gap-2">
                      <span className="font-mono text-xs uppercase tracking-widest text-ink/60">
                        Name
                      </span>
                      <input
                        required
                        type="text"
                        value={name}
                        maxLength={120}
                        onChange={(e) => setName(e.target.value)}
                        disabled={status === "loading"}
                        placeholder="Your name"
                        className="rounded-full border-2 border-ink bg-cream px-6 py-4 font-mono text-sm placeholder:text-ink/40 focus:outline-none focus:ring-4 focus:ring-electric/40 disabled:opacity-60"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="font-mono text-xs uppercase tracking-widest text-ink/60">
                        Email
                      </span>
                      <input
                        required
                        type="email"
                        value={email}
                        maxLength={320}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={status === "loading"}
                        placeholder="you@email.com"
                        className="rounded-full border-2 border-ink bg-cream px-6 py-4 font-mono text-sm placeholder:text-ink/40 focus:outline-none focus:ring-4 focus:ring-electric/40 disabled:opacity-60"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="font-mono text-xs uppercase tracking-widest text-ink/60">
                        {choice === "money" ? "Message (optional)" : "What would you like to offer?"}
                      </span>
                      <textarea
                        value={message}
                        rows={choice === "money" ? 3 : 4}
                        maxLength={2000}
                        required={choice === "resources"}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={status === "loading"}
                        placeholder={
                          choice === "money"
                            ? "Anything you'd like us to know"
                            : "venue space, snacks, school supplies, equipment"
                        }
                        className="rounded-3xl border-2 border-ink bg-cream px-6 py-4 font-mono text-sm placeholder:text-ink/40 focus:outline-none focus:ring-4 focus:ring-electric/40 disabled:opacity-60"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="mt-6 rounded-full bg-ink px-8 py-4 font-semibold text-cream shadow-[6px_6px_0_0_oklch(0.18_0.04_260_/_0.25)] transition hover:bg-electric disabled:opacity-60"
                  >
                    {status === "loading" ? "Sending…" : "Send it over"}
                  </button>

                  {status === "error" && (
                    <p className="mt-4 font-mono text-sm text-coral">
                      {errorMsg || "Something went wrong — please try again."}
                    </p>
                  )}
                </form>
              )}
            </>
          )}

          <p className="mt-8 font-mono text-lg text-muted-foreground">
            Prefer email? Write to{" "}
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

function ChoiceCard({
  active,
  onClick,
  label,
  blurb,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  blurb: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`card-3d p-8 text-left transition ${
        active ? "bg-electric text-cream" : "bg-cream text-ink hover:bg-sun"
      }`}
    >
      <span className="inline-flex">{icon}</span>
      <span className="mt-4 block font-display text-3xl font-black">{label}</span>
      <span className={`mt-2 block text-base ${active ? "text-cream/85" : "text-ink/70"}`}>
        {blurb}
      </span>
    </button>
  );
}
