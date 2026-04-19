import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import heroImg from "@/assets/hero-math.jpg";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { weeks, type Week } from "@/data/weeks";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Mathos — Free summer applied math camp in Naperville | June 2026" },
      {
        name: "description",
        content:
          "Mathos (Greek for 'learning') is a completely free 4-week applied math camp at Naperville Public Library for grades 4–7. June 2026.",
      },
      { property: "og:title", content: "Mathos — Free summer applied math camp in Naperville" },
      {
        property: "og:description",
        content:
          "Four weeks of hands-on applied math for grades 4–7. Completely free. Naperville Public Library, June 2026.",
      },
      { property: "og:image", content: heroImg },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroImg },
    ],
  }),
});

function Marquee() {
  const items = [
    "Mathos '26",
    "★",
    "Completely free",
    "★",
    "Grades 4–7",
    "★",
    "Naperville Public Library",
    "★",
    "June",
    "★",
  ];
  const row = [...items, ...items, ...items, ...items];
  return (
    <div className="overflow-hidden border-y-2 border-ink bg-ink py-4">
      <div className="marquee flex whitespace-nowrap font-display text-3xl font-black tracking-tight text-cream md:text-5xl">
        {row.map((t, i) => (
          <span key={i} className="mx-8 inline-block">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function WeekTeaser({ week }: { week: Week }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="group relative overflow-hidden rounded-3xl border-2 border-ink bg-cream p-8 transition hover:-translate-y-1 hover:shadow-[8px_8px_0_0_var(--ink)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="block w-full text-left"
      >
        <div className="flex items-start justify-between">
          <span className={`rounded-full px-4 py-1 font-mono text-xs font-bold ${week.accent}`}>
            Week {week.n}
          </span>
          <span className="font-display text-6xl font-black text-ink/10 transition group-hover:text-ink/20">
            {week.n}
          </span>
        </div>
        <h3 className="mt-4 font-display text-3xl font-black">{week.title}</h3>
        <p className="mt-3 text-ink/70">{week.blurb}</p>
        <div className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-electric">
          {open ? "Show less −" : "Quick peek +"}
        </div>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "mt-6 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="space-y-2 border-t-2 border-ink/15 pt-6 font-mono text-sm">
            {week.bullets.map((b) => (
              <li key={b} className="flex gap-3">
                <span className="text-coral">→</span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

function Index() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />

      {/* HERO */}
      <section className="relative grid-paper border-b-2 border-ink">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-12 md:gap-8 md:py-24">
          <div className="md:col-span-7">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-cream px-4 py-1.5 font-mono text-xs tracking-widest">
              <span className="h-2 w-2 rounded-full bg-coral" />
              June 2026 · Naperville Public Library · 100% free
            </div>
            <h1 className="font-display text-[clamp(3rem,9vw,7.5rem)] font-black leading-[0.9]">
              Math is the
              <br />
              <span className="italic text-electric">operating</span>
              <br />
              system.
            </h1>
            <p className="mt-8 max-w-xl text-lg text-ink/75 md:text-xl">
              <span className="font-semibold">Mathos</span> — from the Greek for{" "}
              <span className="italic">learning</span> — is a{" "}
              <span className="font-semibold">completely free</span> four-week summer camp built
              around <span className="font-semibold">applied math</span>: the math behind money,
              buildings, sports, and decisions. For grades 4–7, taught by Neuqua Valley students.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="rounded-full bg-coral px-8 py-4 font-semibold text-cream shadow-[6px_6px_0_0_var(--ink)] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--ink)]"
              >
                I'm interested →
              </Link>
              <Link
                to="/curriculum"
                className="rounded-full border-2 border-ink px-8 py-4 font-semibold transition hover:bg-ink hover:text-cream"
              >
                See the curriculum
              </Link>
            </div>

            <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t-2 border-ink/20 pt-8 font-mono text-sm">
              <div>
                <dt className="text-muted-foreground">Cost</dt>
                <dd className="font-display text-3xl font-black">$0</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Sessions / wk</dt>
                <dd className="font-display text-3xl font-black">03</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Grades</dt>
                <dd className="font-display text-3xl font-black">4–7</dd>
              </div>
            </dl>
          </div>

          <div className="relative md:col-span-5">
            <div className="float-slow relative overflow-hidden rounded-3xl border-2 border-ink shadow-[12px_12px_0_0_var(--ink)]">
              <img
                src={heroImg}
                alt="Colorful collage of dice, geometric shapes and graphs representing the Mathos curriculum"
                width={1536}
                height={1024}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -left-6 -top-6 hidden h-20 w-20 rotate-12 items-center justify-center rounded-2xl border-2 border-ink bg-sun font-display text-4xl font-black md:flex">
              π
            </div>
            <div className="absolute -bottom-6 -right-4 hidden h-24 w-24 -rotate-6 items-center justify-center rounded-full border-2 border-ink bg-electric font-display text-3xl font-black text-cream md:flex">
              x²
            </div>
          </div>
        </div>
      </section>

      <Marquee />

      {/* CURRICULUM TEASER */}
      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-sm tracking-widest text-muted-foreground">
                Curriculum
              </p>
              <h2 className="mt-2 font-display text-5xl font-black md:text-7xl">
                Four weeks of
                <br />
                applied math.
              </h2>
            </div>
            <p className="max-w-sm text-ink/70">
              A quick look at what each week covers. For full week-by-week breakdowns, head to the
              curriculum page.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {weeks.map((w) => (
              <WeekTeaser key={w.n} week={w} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/curriculum"
              className="inline-flex rounded-full border-2 border-ink bg-ink px-8 py-4 font-semibold text-cream transition hover:bg-electric hover:border-electric"
            >
              Read the full curriculum →
            </Link>
          </div>

          {/* Pythos teaser */}
          <div className="mt-12 rounded-3xl border-2 border-ink bg-electric p-8 text-cream md:p-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="font-mono text-xs tracking-widest text-cream/70">
                  Sister program · July
                </p>
                <h3 className="mt-2 font-display text-3xl font-black md:text-4xl">
                  Pythos — build a 2D game in July.
                </h3>
                <p className="mt-3 text-cream/85">
                  After Mathos wraps, our directors run Pythos: a creative computer-science camp
                  with two age tracks (grades 1–4 in Scratch, grades 5–8 in Python with a custom
                  Turtle library). Every camper finishes with their own playable 2D game. Pythos
                  has its own dedicated site coming soon.
                </p>
              </div>
              <Link
                to="/about"
                className="shrink-0 rounded-full border-2 border-cream bg-cream px-6 py-3 font-semibold text-ink transition hover:bg-sun hover:border-sun"
              >
                More about us →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILS TEASER */}
      <section className="border-b-2 border-ink bg-ink text-cream">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-5">
            <p className="font-mono text-sm tracking-widest text-cream/60">/ Details</p>
            <h2 className="mt-2 font-display text-5xl font-black md:text-6xl">
              When, where, <span className="italic text-sun">how much</span>.
            </h2>
            <p className="mt-6 max-w-md text-cream/70">
              Mathos meets Monday, Wednesday, and Friday throughout June at Naperville Public
              Library. Every session is 2.5 hours with a 15-minute break in the middle.
            </p>
            <Link
              to="/details"
              className="mt-8 inline-flex rounded-full border-2 border-cream bg-cream px-6 py-3 font-semibold text-ink transition hover:bg-sun hover:border-sun"
            >
              See full details →
            </Link>
          </div>

          <dl className="grid gap-px overflow-hidden rounded-3xl border-2 border-cream/20 bg-cream/10 md:col-span-7 md:grid-cols-2">
            {[
              ["When", "June 2026 · 4 weeks"],
              ["Where", "Naperville Public Library"],
              ["Days", "Mon · Wed · Fri"],
              ["Session", "2.5 hrs (with 15-min break)"],
              ["Math grades", "4th — 7th (recommended)"],
              ["Cost", "Completely free"],
            ].map(([k, v]) => (
              <div key={k} className="bg-ink p-8">
                <dt className="font-mono text-xs tracking-widest text-cream/50">{k}</dt>
                <dd className="mt-3 font-display text-2xl font-bold leading-tight">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* EXTRA HELP — stays on home */}
      <section className="border-b-2 border-ink bg-sun">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:py-24">
          <div className="md:col-span-7">
            <p className="font-mono text-sm tracking-widest text-ink/60">/ Extra help</p>
            <h2 className="mt-2 font-display text-5xl font-black leading-[0.95] md:text-6xl">
              Stuck on something? <span className="italic">Just ask.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-ink/80">
              Every Mathos teacher is happy to meet one-on-one with any camper who needs extra
              help — whether that's a tricky topic from camp, homework from school, or a concept
              they've been wanting to understand for a while. We'll find time before or after a
              session and work through it together.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="rounded-3xl border-2 border-ink bg-cream p-8">
              <p className="font-mono text-xs tracking-widest text-muted-foreground">
                Want more material?
              </p>
              <h3 className="mt-2 font-display text-3xl font-black">
                Reach out — we'll send more.
              </h3>
              <p className="mt-3 text-ink/70">
                If your child is interested and wants to keep going between sessions, students or
                parents can email us and we'll share extra problem sets, project ideas, and
                reading recommendations matched to their grade.
              </p>
              <a
                href="mailto:campmathos@gmail.com?subject=More%20Mathos%20material"
                className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 font-semibold text-cream transition hover:bg-electric"
              >
                Email campmathos@gmail.com →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ TEASER */}
      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
          <p className="font-mono text-sm tracking-widest text-muted-foreground">/ FAQ</p>
          <h2 className="mt-2 font-display text-5xl font-black md:text-6xl">Common questions.</h2>
          <p className="mt-6 max-w-2xl text-lg text-ink/70">
            A few of the questions families ask most. We have a full FAQ page with everything
            else — schedule, drop-off, materials, attendance, and more.
          </p>

          <ul className="mt-10 space-y-4">
            {[
              "Is the camp really free?",
              "How do we sign up?",
              "What days does it meet?",
              "What should my child bring?",
            ].map((q) => (
              <li
                key={q}
                className="rounded-2xl border-2 border-ink bg-cream px-6 py-4 font-display text-xl font-bold"
              >
                {q}
              </li>
            ))}
          </ul>

          <Link
            to="/faq"
            className="mt-10 inline-flex rounded-full bg-ink px-8 py-4 font-semibold text-cream transition hover:bg-electric"
          >
            Read the full FAQ →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-coral">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center md:py-32">
          <p className="font-mono text-sm tracking-widest text-cream/80">/ Register</p>
          <h2 className="mx-auto mt-4 max-w-4xl font-display text-6xl font-black leading-[0.9] text-cream md:text-8xl">
            Spend June <span className="italic">thinking</span> in math.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-cream/85">
            Completely free. Drop your email to let us know you're interested — we'll send
            the schedule and library details as June gets closer. No commitment required.
          </p>
          <Link
            to="/register"
            className="mt-10 inline-flex rounded-full bg-ink px-8 py-4 font-semibold text-cream shadow-[6px_6px_0_0_oklch(0.18_0.04_260_/_0.25)] transition hover:bg-electric"
          >
            I'm interested →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
