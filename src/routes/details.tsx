import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/details")({
  component: DetailsPage,
  head: () => ({
    meta: [
      { title: "Details — Mathos summer camp schedule and logistics" },
      {
        name: "description",
        content:
          "Mathos camp logistics: free for all students, Monday/Wednesday/Friday in June 2026 at Naperville Public Library, 2.5-hour sessions with a 15-minute break.",
      },
      { property: "og:title", content: "Details — Mathos summer camp" },
      {
        property: "og:description",
        content:
          "Schedule, location, session structure, and what to bring. Mathos is completely free.",
      },
    ],
  }),
});

const facts: [string, string][] = [
  ["When", "June 2026 · 4 weeks"],
  ["Where", "Naperville Public Library"],
  ["Days", "Monday, Wednesday, Friday"],
  ["Session length", "2.5 hours (1 hr · 15-min break · 1 hr 15)"],
  ["Math grades", "4th — 7th (recommended)"],
  ["Sister program", "Pythos (CS camp) runs in July"],
  ["Cost", "Completely free"],
  ["Showcase", "Friday of week 4 — families invited"],
];

function DetailsPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />

      <section className="grid-paper border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
            / details
          </p>
          <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-7xl">
            Everything <span className="italic text-electric">logistical</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/75">
            Mathos is a four-week summer camp at Naperville Public Library, completely free for
            every camper. Here's exactly how it runs.
          </p>
        </div>
      </section>

      <section className="border-b-2 border-ink bg-ink text-cream">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <dl className="grid gap-px overflow-hidden rounded-3xl border-2 border-cream/20 bg-cream/10 md:grid-cols-2">
            {facts.map(([k, v]) => (
              <div key={k} className="bg-ink p-8">
                <dt className="font-mono text-xs uppercase tracking-widest text-cream/50">{k}</dt>
                <dd className="mt-3 font-display text-2xl font-bold leading-tight">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CLASS STRUCTURE */}
      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
            / a typical session
          </p>
          <h2 className="mt-3 font-display text-5xl font-black md:text-6xl">
            2.5 hours, with room to <span className="italic">breathe</span>.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-ink/75">
            Each Mathos session runs two and a half hours, broken in the middle by a 15-minute
            break so campers can rest, snack, and reset before diving back in.
          </p>

          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                tag: "00:00 — 01:00",
                title: "First hour",
                body: "Concept, examples, and a hands-on activity. We open with the real-world question of the day, work through the math together, and start applying it.",
                accent: "bg-electric text-cream",
              },
              {
                tag: "01:00 — 01:15",
                title: "15-minute break",
                body: "Snack, water, stretch. Campers are encouraged to bring a snack or drink — food is not provided.",
                accent: "bg-sun text-ink",
              },
              {
                tag: "01:15 — 02:30",
                title: "Second hour-plus",
                body: "Project work, group challenges, and Q&A. Instructors circulate to help one-on-one and pull together what we built.",
                accent: "bg-coral text-cream",
              },
            ].map((b) => (
              <li
                key={b.title}
                className="rounded-3xl border-2 border-ink bg-cream p-6 shadow-[6px_6px_0_0_var(--ink)]"
              >
                <span
                  className={`inline-block rounded-full px-3 py-1 font-mono text-xs font-bold ${b.accent}`}
                >
                  {b.tag}
                </span>
                <h3 className="mt-4 font-display text-2xl font-black">{b.title}</h3>
                <p className="mt-3 text-ink/70">{b.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* WHAT TO BRING */}
      <section className="border-b-2 border-ink bg-sun">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:py-24">
          <div>
            <p className="font-mono text-sm uppercase tracking-widest text-ink/60">/ bring</p>
            <h2 className="mt-3 font-display text-5xl font-black leading-[0.95]">
              What to bring.
            </h2>
            <ul className="mt-8 space-y-3 font-mono text-sm">
              <li className="flex gap-3">
                <span className="text-coral">→</span>A pencil and a notebook (or scratch paper)
              </li>
              <li className="flex gap-3">
                <span className="text-coral">→</span>A snack and a drink for the 15-minute break
              </li>
              <li className="flex gap-3">
                <span className="text-coral">→</span>A computer if you join Pythos in July
                (required for the CS camp)
              </li>
              <li className="flex gap-3">
                <span className="text-coral">→</span>A calculator if you have one — not required,
                instructors will help when needed
              </li>
            </ul>
            <p className="mt-6 max-w-md text-ink/75">
              Don't have something? Don't worry — basic materials will be provided so no camper is
              left out.
            </p>
          </div>
          <div>
            <p className="font-mono text-sm uppercase tracking-widest text-ink/60">/ drop-off</p>
            <h2 className="mt-3 font-display text-5xl font-black leading-[0.95]">
              Drop-off and pick-up.
            </h2>
            <p className="mt-6 text-lg text-ink/80">
              Parents sign their child in at the start of each session and sign them out at the
              end. You're welcome to stay for the session if you'd like — we just ask that you keep
              quiet so the class can focus. Instructors are happy to answer parent questions
              before or after class.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-coral">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center md:py-28">
          <h2 className="mx-auto max-w-3xl font-display text-5xl font-black leading-[0.9] text-cream md:text-7xl">
            Save your spot — it's free.
          </h2>
          <Link
            to="/register"
            className="mt-10 inline-flex rounded-full bg-ink px-8 py-4 font-semibold text-cream transition hover:bg-electric"
          >
            Sign up →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
