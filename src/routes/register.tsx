import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thanks! We'll be in touch with registration details.");
            }}
            className="mt-10 flex flex-col gap-3 sm:flex-row"
          >
            <input
              required
              type="email"
              placeholder="parent@email.com"
              className="flex-1 rounded-full border-2 border-ink bg-cream px-6 py-4 font-mono text-sm placeholder:text-ink/40 focus:outline-none focus:ring-4 focus:ring-electric/40"
            />
            <button
              type="submit"
              className="rounded-full bg-ink px-8 py-4 font-semibold text-cream shadow-[6px_6px_0_0_oklch(0.18_0.04_260_/_0.25)] transition hover:bg-electric"
            >
              Sign up
            </button>
          </form>

          <p className="mt-6 font-mono text-xs text-muted-foreground">
            Questions? Email{" "}
            <a href="mailto:Mathos@gmail.com" className="underline hover:text-electric">
              Mathos@gmail.com
            </a>
            .
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
