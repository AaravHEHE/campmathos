import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Wordmark } from "@/components/Wordmark";
import { canonical, ogImage } from "@/lib/seo";
import { CAMP, fullAddress } from "@/lib/camp";
import { Reveal } from "@/components/Reveal";

const OG = ogImage("/og-details.jpg");

export const Route = createFileRoute("/details")({
  component: DetailsPage,
  head: () => ({
    meta: [
      { title: "Details — MathOs summer camp schedule and logistics" },
      {
        name: "description",
        content:
          "MathOs camp logistics: free for all students, Tue/Thu sessions in the early afternoon from June 2 through July 9, 2026, at Neuqua Valley High School. 3-hour sessions with a short break.",
      },
      { property: "og:title", content: "Details — MathOs summer camp" },
      {
        property: "og:description",
        content:
          "Schedule, location, session structure, and what to bring. MathOs is completely free.",
      },
      { property: "og:image", content: OG },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG },
    ],
    links: [canonical("/details")],
  }),
});

const facts: [string, string][] = [
  ["When", CAMP.humanDateRange],
  ["Where", fullAddress()],
  ["Days", CAMP.humanDays],
  ["Time", CAMP.humanTime],
  ["Session length", "3 hours (with a short break)"],
  ["Skill range", "5th grade math → Geometry (recommended)"],
  ["Affiliate program", "PythOs (CS camp) runs in July"],
  ["Cost", "Completely free"],
];

function DetailsPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />

      <section className="grid-paper border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <p className="font-mono text-sm tracking-widest text-muted-foreground">
            Details
          </p>
          <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-7xl">
            Everything <span className="italic text-electric">logistical</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/75">
            <Wordmark /> is a multi-week summer camp at Naperville Public Library, completely free for
            every camper. Here's exactly how it runs.
          </p>
        </div>
      </section>

      <section className="border-b-2 border-ink bg-ink text-cream">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <Reveal amount={0.15}>
            <dl className="grid gap-px overflow-hidden rounded-3xl border-2 border-cream/20 bg-cream/10 md:grid-cols-2">
              {facts.map(([k, v]) => (
                <div key={k} className="bg-ink p-8">
                  <dt className="font-mono text-xs tracking-widest text-cream/50">{k}</dt>
                  <dd className="mt-3 font-display text-2xl font-bold leading-[1.15] pb-1">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* CLASS STRUCTURE */}
      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <Reveal>
            <p className="font-mono text-sm tracking-widest text-muted-foreground">
              A typical session
            </p>
            <h2 className="mt-3 font-display text-5xl font-black md:text-6xl">
              3 hours, with room to <span className="italic">breathe</span>.
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-ink/75">
              Each <Wordmark /> session runs for about three hours in the early afternoon,
              with a short break in the middle so campers can rest, snack, and reset
              before the second half.
            </p>
          </Reveal>

          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                tag: "First ~80 min",
                title: "First half",
                body: "Concept, examples, and a hands-on activity. We open with the real-world question of the day, work through the math together, and start applying it.",
                accent: "bg-electric text-cream",
              },
              {
                tag: "~20 min",
                title: "Short break",
                body: "Snack, water, stretch. Campers are encouraged to bring a snack or drink — food is not provided.",
                accent: "bg-sun text-ink",
              },
              {
                tag: "Final ~80 min",
                title: "Second half",
                body: "Project work, group challenges, and Q&A. Instructors circulate to help one-on-one and pull together what we built.",
                accent: "bg-coral text-cream",
              },
            ].map((b, i) => (
              <Reveal key={b.title} delay={i * 0.25} amount={0.3}>
                <li className="rounded-3xl border-2 border-ink bg-cream p-6 shadow-[6px_6px_0_0_var(--ink)]">
                  <span
                    className={`inline-block rounded-full px-3 py-1 font-mono text-xs font-bold ${b.accent}`}
                  >
                    {b.tag}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-black">{b.title}</h3>
                  <p className="mt-3 text-ink/70">{b.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>

          <Reveal direction="scale" amount={0.3}>
            <div className="mt-12 rounded-3xl border-2 border-ink bg-electric p-6 text-cream md:flex md:items-center md:justify-between md:gap-8 md:p-8">
              <div className="max-w-xl">
                <p className="font-mono text-xs uppercase tracking-widest text-cream/70">
                  Add to calendar
                </p>
                <h3 className="mt-2 font-display text-2xl font-black md:text-3xl">
                  Drop every session into your calendar.
                </h3>
                <p className="mt-2 text-cream/85">
                  Download the .ics file — it includes every Tue/Thu session
                  from June 2 through July 9, 2026, with the library address pre-filled.
                </p>
              </div>
              <a
                href="/mathos.ics"
                download="mathos-2026.ics"
                className="mt-5 inline-flex min-h-11 items-center rounded-full border-2 border-cream bg-cream px-6 py-3 font-semibold text-ink shadow-[6px_6px_0_0_var(--ink)] transition hover:bg-sun hover:border-sun md:mt-0"
              >
                Download .ics →
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* WHAT TO BRING */}
      <section className="border-b-2 border-ink bg-sun">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:py-24">
          <Reveal direction="right">
            <div>
              <p className="font-mono text-sm tracking-widest text-ink/60">Bring</p>
              <h2 className="mt-3 font-display text-5xl font-black leading-[0.95]">
                What to bring.
              </h2>
              <ul className="mt-8 space-y-3 font-mono text-sm">
                <li className="flex gap-3">
                  <span className="text-coral">→</span>A pencil and a notebook (or scratch paper)
                </li>
                <li className="flex gap-3">
                  <span className="text-coral">→</span>A snack and a drink for the short break
                </li>
                <li className="flex gap-3">
                  <span className="text-coral">→</span>A computer if you join PythOs in July
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
          </Reveal>
          <Reveal direction="left" delay={0.2}>
            <div>
              <p className="font-mono text-sm tracking-widest text-ink/60">Drop-off</p>
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
          </Reveal>
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
