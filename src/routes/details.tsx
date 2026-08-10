import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Wordmark } from "@/components/Wordmark";
import { CAMP } from "@/lib/camp";
import { weeks } from "@/data/weeks";
import { canonical, ogImage } from "@/lib/seo";
import { Reveal } from "@/components/Reveal";
import aboutLearning from "@/assets/about-learning.png";
import themeGraphing from "@/assets/theme-graphing.png";
import themeProbability from "@/assets/theme-probability.png";
import themeGeometry from "@/assets/theme-geometry.png";

const OG = ogImage("/og-details.jpg");

export const Route = createFileRoute("/details")({
  component: DetailsPage,
  head: () => ({
    meta: [
      { title: "Details — MathOs mission, curriculum, and camp logistics" },
      {
        name: "description",
        content:
          "Everything about MathOs in one place: what it is and why, the week-by-week curriculum, and the schedule, format, and logistics for July 2026.",
      },
      { property: "og:title", content: "Details — MathOs mission, curriculum, and logistics" },
      {
        property: "og:description",
        content:
          "What MathOs is, what campers learn week by week, and exactly how the free hybrid sessions run.",
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
  ["Where", "Hybrid — in person or live over Zoom"],
  ["Days", CAMP.humanDays],
  ["Time", CAMP.humanTime],
  ["Session length", "2 hours (with a short break)"],
  ["Skill range", "4th grade math → 7th grade math (recommended)"],
  ["Platform", "In-person location and Zoom link sent before each session"],
  ["Cost", "Completely free"],
];

const pillars: { tag: string; title: string; body: string; accent: string }[] = [
  {
    tag: "hands-on",
    title: "Activities, not lectures.",
    body: "Custom games, challenges, and builds for every concept — minimal note-taking, high participation.",
    accent: "bg-electric text-cream",
  },
  {
    tag: "guided",
    title: "Structured guided notes.",
    body: "Pre-built notes that simplify complex ideas into a reference campers can actually reuse.",
    accent: "bg-coral text-cream",
  },
  {
    tag: "supportive",
    title: "1-on-1 help.",
    body: "Any Camp Director will meet a camper one-on-one — camp topics, school homework, or curiosity.",
    accent: "bg-sun text-ink",
  },
  {
    tag: "stretching",
    title: "More for the curious.",
    body: "Harder problem sets, project ideas, and reading picks matched to a camper's current level.",
    accent: "bg-ink text-cream",
  },
];

const themes = [
  {
    tag: "engineering",
    title: "Graphing",
    body: "Read and build graphs the way engineers and analysts do.",
    img: themeGraphing,
  },
  {
    tag: "decision-making",
    title: "Probability & finance",
    body: "The math banks, markets, and insurers use every day.",
    img: themeProbability,
  },
  {
    tag: "architecture",
    title: "Geometry",
    body: "Area, volume, and angles — the math that keeps buildings standing.",
    img: themeGeometry,
  },
];

const sessionStructure = [
  {
    tag: "First ~60 min",
    title: "First half",
    body: "The real-world question of the day, the math behind it, and a hands-on activity applying it.",
    accent: "bg-electric text-cream",
  },
  {
    tag: "~15 min",
    title: "Short break",
    body: "Snack, water, stretch. Cameras and mics off — a reset before the second half.",
    accent: "bg-sun text-ink",
  },
  {
    tag: "Final ~45 min",
    title: "Second half",
    body: "Project work and group challenges in breakout rooms, with instructors floating room to room.",
    accent: "bg-coral text-cream",
  },
];

function DetailsPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />

      {/* HERO */}
      <section className="grid-paper border-b-2 border-ink">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-7">
            <p className="font-mono text-sm tracking-widest text-muted-foreground">Details</p>
            <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-7xl">
              <span className="italic">
                <Wordmark />
              </span>{" "}
              means learning.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-ink/75">
              The name comes from the Greek word for "learning." <Wordmark /> is a free, student-led
              hybrid summer program — join in person or online — that teaches applied math, the kind engineers, analysts, and
              architects actually use — through hands-on activities instead of lectures. No fees, no
              exams, no pressure. Everything you need to know is on this page.
            </p>
          </div>
          <Reveal direction="scale" className="md:col-span-5">
            <div className="rotate-1 card-3d bg-cream p-3">
              <img
                src={aboutLearning}
                alt="A collage of graphs, dice, and geometric shapes representing the MathOs curriculum"
                width={1024}
                height={1024}
                className="aspect-square w-full rounded-2xl object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* QUICK FACTS */}
      <section className="border-b-2 border-ink bg-ink text-cream">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <Reveal>
            <p className="font-mono text-sm tracking-widest text-cream/60">At a glance</p>
            <h2 className="mt-2 font-display text-4xl font-black leading-[0.95] md:text-5xl">
              Everything logistical, in one table.
            </h2>
          </Reveal>
          <Reveal amount={0.15}>
            <dl className="mt-10 grid gap-px overflow-hidden rounded-3xl border-2 border-cream/20 bg-cream/10 md:grid-cols-2">
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

      {/* HOW WE TEACH */}
      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <p className="font-mono text-sm tracking-widest text-muted-foreground">How we teach</p>
          <h2 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-6xl">
            Math you can <span className="italic text-electric">actually use</span>.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-ink/75">
            Most kids meet math as formulas with no obvious purpose. <Wordmark /> connects the math
            campers already see in school to engineering, finance, and architecture — and keeps
            every session built around doing, not copying from a board.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.15} amount={0.3}>
                <article className="card-3d bg-cream p-8">
                  <span className={`inline-block rounded-full px-3 py-1 font-mono text-xs font-bold ${p.accent}`}>
                    {p.tag}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-black">{p.title}</h3>
                  <p className="mt-3 text-ink/70">{p.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CURRICULUM */}
      <section className="border-b-2 border-ink bg-ink text-cream">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <Reveal>
            <p className="font-mono text-sm tracking-widest text-cream/60">Curriculum</p>
            <h2 className="mt-2 font-display text-5xl font-black leading-[0.95] md:text-6xl">
              Four weeks, mapped to the <span className="italic text-sun">real world</span>.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {themes.map((t, i) => (
              <Reveal key={t.title} delay={i * 0.2} amount={0.3}>
                <article className="overflow-hidden card-3d-inverse bg-cream/5">
                  <img
                    src={t.img}
                    alt=""
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="h-36 w-full border-b-2 border-cream/30 object-cover"
                  />
                  <div className="p-6">
                    <span className={`inline-block rounded-full px-3 py-1 font-mono text-xs font-bold bg-cream text-ink`}>
                      {t.tag}
                    </span>
                    <h3 className="mt-4 font-display text-2xl font-black">{t.title}</h3>
                    <p className="mt-2 text-cream/75">{t.body}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal amount={0.15}>
            <div className="mt-12 overflow-x-auto rounded-3xl border-2 border-cream/20">
              <table className="w-full min-w-[720px] text-left">
                <thead className="bg-cream/10 font-mono text-xs uppercase tracking-widest text-cream/60">
                  <tr>
                    <th className="px-5 py-4">Week</th>
                    <th className="px-5 py-4">Topic</th>
                    <th className="px-5 py-4">What campers do</th>
                    <th className="px-5 py-4">Why it matters</th>
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((w, i) => (
                    <tr key={w.n} className={i % 2 === 0 ? "bg-cream/5" : ""}>
                      <td className="px-5 py-5 align-top font-display text-2xl font-black text-cream/40">
                        {w.n}
                      </td>
                      <td className="px-5 py-5 align-top font-display text-lg font-bold">{w.title}</td>
                      <td className="px-5 py-5 align-top text-sm text-cream/80">
                        <ul className="space-y-1.5">
                          {w.bullets.map((b) => (
                            <li key={b} className="flex gap-2">
                              <span className="text-sun">→</span>
                              {b}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-5 py-5 align-top text-sm text-cream/70">{w.blurb}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* A TYPICAL SESSION */}
      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <Reveal>
            <p className="font-mono text-sm tracking-widest text-muted-foreground">A typical session</p>
            <h2 className="mt-3 font-display text-5xl font-black md:text-6xl">
              2 hours, with room to <span className="italic">breathe</span>.
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-ink/75">
              Every session runs {CAMP.humanTime.toLowerCase()}, split into two halves with a short
              break in between.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {sessionStructure.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.2} amount={0.3}>
                <article className="card-3d bg-cream p-6">
                  <span className={`inline-block rounded-full px-3 py-1 font-mono text-xs font-bold ${b.accent}`}>
                    {b.tag}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-black">{b.title}</h3>
                  <p className="mt-3 text-ink/70">{b.body}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal direction="scale" amount={0.3}>
            <div className="mt-12 rounded-3xl border-2 border-ink bg-electric p-6 text-cream md:flex md:items-center md:justify-between md:gap-8 md:p-8">
              <div className="max-w-xl">
                <p className="font-mono text-xs uppercase tracking-widest text-cream/70">Add to calendar</p>
                <h3 className="mt-2 font-display text-2xl font-black md:text-3xl">
                  Drop every session into your calendar.
                </h3>
                <p className="mt-2 text-cream/85">
                  The .ics file includes every session from {CAMP.humanDateRange}, with a reminder that
                  the Zoom link arrives by email.
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

      {/* WHAT YOU NEED + JOINING */}
      <section className="border-b-2 border-ink bg-sun">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:py-24">
          <Reveal direction="right">
            <div>
              <p className="font-mono text-sm tracking-widest text-ink/60">Set up</p>
              <h2 className="mt-3 font-display text-5xl font-black leading-[0.95]">What you need.</h2>
              <ul className="mt-8 space-y-3 font-mono text-sm">
                <li className="flex gap-3">
                  <span className="text-coral">→</span>A laptop, desktop, tablet, or phone with Zoom (online campers)
                </li>
                <li className="flex gap-3">
                  <span className="text-coral">→</span>A reliable internet connection
                </li>
                <li className="flex gap-3">
                  <span className="text-coral">→</span>A pencil and notebook (or scratch paper)
                </li>
                <li className="flex gap-3">
                  <span className="text-coral">→</span>A calculator if you have one — not required
                </li>
              </ul>
              <p className="mt-6 max-w-md text-ink/75">
                Don't have something? Reach out — we'll figure it out so no camper is left out.
              </p>
            </div>
          </Reveal>
          <Reveal direction="left" delay={0.2}>
            <div>
              <p className="font-mono text-sm tracking-widest text-ink/60">Joining a session</p>
              <h2 className="mt-3 font-display text-5xl font-black leading-[0.95]">How it works.</h2>
              <p className="mt-6 text-lg text-ink/80">
                Camp is hybrid: come in person or join live over Zoom, whichever works for your family. We
                email the in-person location and the Zoom link to every registered family before each
                session. Online campers are encouraged (but never required) to turn cameras on; mics stay
                muted until it's time to share. Parents are welcome to sit in — Camp Directors are happy to
                answer questions before or after class. Our pilot year ran fully online to gauge how the
                community would react, and because it was such a hit we moved to a hybrid format so our
                out-of-state campers can still join.
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
