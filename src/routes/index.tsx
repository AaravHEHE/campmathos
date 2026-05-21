import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import heroImg from "@/assets/hero-math.jpg";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Wordmark } from "@/components/Wordmark";
import { weeks, type Week } from "@/data/weeks";

import { canonical, ogImage, campEventJsonLd } from "@/lib/seo";
import { Reveal } from "@/components/Reveal";

const OG = ogImage("/og-default.jpg");

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "MathOs — Free summer applied math camp in Naperville | Summer 2026" },
      {
        name: "description",
        content:
          "MathOs is a completely free applied math camp at Naperville Public Library. Recommended skill range 5th grade math through Geometry. Tuesdays and Thursdays, 3-hour sessions in the early afternoon, June 2 – July 9, 2026.",
      },
      { property: "og:title", content: "MathOs — Free summer applied math camp in Naperville" },
      {
        property: "og:description",
        content:
          "Hands-on applied math from 5th-grade arithmetic through Geometry. Completely free. Naperville Public Library, summer 2026.",
      },
      { property: "og:image", content: OG },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG },
    ],
    links: [canonical("/")],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(campEventJsonLd()),
      },
    ],
  }),
});

function Marquee() {
  const items: ReactNode[] = [
    <><span className="text-electric">Math</span><span className="text-coral">Os</span> '26</>,
    "★",
    "Completely free",
    "★",
    "5th grade math → Geometry",
    "★",
    "Neuqua Valley HS",
    "★",
    "June",
    "★",
  ];
  const row = [...items, ...items, ...items, ...items];
  return (
    <div className="overflow-hidden border-y-2 border-ink bg-ink py-6 md:py-8">
      <div className="marquee flex whitespace-nowrap font-display text-3xl font-black leading-[1.25] tracking-tight text-cream md:text-5xl">
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
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-ink bg-cream p-8 transition hover:-translate-y-1 hover:shadow-[8px_8px_0_0_var(--ink)]">
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
            <h1 className="font-display text-[clamp(2.5rem,8vw,7.5rem)] font-black leading-[0.9] break-words">
              Math is the
              <br />
              <span className="italic text-electric">operating</span>
              <br />
              system.
            </h1>
            <p className="mt-8 max-w-xl text-lg text-ink/75 md:text-xl">
              For 5th-grade math through Geometry, taught by Neuqua Valley students.
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
                className="rounded-full border-2 border-ink bg-cream px-8 py-4 font-semibold text-ink shadow-[6px_6px_0_0_var(--ink)] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--ink)]"
              >
                See the curriculum
              </Link>
            </div>

            <dl className="mt-14 grid max-w-lg grid-cols-4 gap-6 border-t-2 border-ink/20 pt-8 font-mono text-sm">
              <div>
                <dt className="text-muted-foreground">Cost</dt>
                <dd className="font-display text-2xl font-black md:text-3xl">$0</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Weeks</dt>
                <dd className="font-display text-2xl font-black md:text-3xl">04</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Sessions / wk</dt>
                <dd className="font-display text-2xl font-black md:text-3xl">03</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Skill</dt>
                <dd className="font-display text-lg font-black leading-tight md:text-xl">5th gr → Geo</dd>
              </div>
            </dl>
          </div>

          <div className="relative md:col-span-5">
            <div className="float-slow relative overflow-hidden rounded-3xl border-2 border-ink shadow-[12px_12px_0_0_var(--ink)]">
              <img
                src={heroImg}
                alt="Colorful collage of dice, geometric shapes and graphs representing the MathOs curriculum"
                width={1536}
                height={1024}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <Marquee />

      {/* CURRICULUM TEASER */}
      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <Reveal>
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
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2 md:items-stretch">
            {weeks.map((w, i) => (
              <Reveal key={w.n} delay={i * 0.25} amount={0.2} className="h-full">
                <WeekTeaser week={w} />
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.05}>
            <div className="mt-10 text-center">
              <Link
                to="/curriculum"
                className="inline-flex rounded-full border-2 border-ink bg-ink px-8 py-4 font-semibold text-cream transition hover:bg-electric hover:border-electric"
              >
                Read the full curriculum →
              </Link>
            </div>
          </Reveal>

        </div>
      </section>

      {/* DETAILS TEASER */}
      <section className="border-b-2 border-ink bg-ink text-cream">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:py-28">
          <Reveal direction="right" className="md:col-span-5">
            <p className="font-mono text-sm tracking-widest text-cream/60">Details</p>
            <h2 className="mt-2 font-display text-5xl font-black md:text-6xl">
              When, where, <span className="italic text-sun">how much</span>.
            </h2>
            <p className="mt-6 max-w-md text-cream/70">
              <Wordmark /> meets Tuesdays and Thursdays in the early afternoon
              at Neuqua Valley High School from June 2 through July 9, 2026.
            </p>
            <Link
              to="/details"
              className="mt-8 inline-flex rounded-full border-2 border-cream bg-cream px-6 py-3 font-semibold text-ink transition hover:bg-sun hover:border-sun"
            >
              See full details →
            </Link>
          </Reveal>

          <Reveal direction="up" amount={0.2} className="md:col-span-7">
            <dl className="grid gap-px overflow-hidden rounded-3xl border-2 border-cream/20 bg-cream/10 md:grid-cols-2">
              {[
                ["When", "June – July 2026"],
                ["Where", "Naperville Library, 95th St"],
                ["Days", "Tue · Thu"],
                ["Time", "Early afternoon (3 hr)"],
                ["Skill", "5th gr → Geometry"],
                ["Cost", "Free"],
              ].map(([k, v]) => (
                <div key={k} className="bg-ink p-8">
                  <dt className="font-mono text-xs tracking-widest text-cream/50">{k}</dt>
                  <dd className="mt-3 font-display text-2xl font-bold leading-tight">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* EXTRA HELP — stays on home */}
      <section className="border-b-2 border-ink bg-sun">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:py-24">
          <Reveal direction="right" className="md:col-span-7">
            <p className="font-mono text-sm tracking-widest text-ink/60">Extra help</p>
            <h2 className="mt-2 font-display text-5xl font-black leading-[0.95] md:text-6xl">
              Stuck on something? <span className="italic">Just ask.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-ink/80">
              Every <Wordmark /> teacher is happy to meet one-on-one with any camper who needs extra
              help — whether that's a tricky topic from camp, homework from school, or a concept
              they've been wanting to understand for a while. We'll find time before or after a
              session and work through it together.
            </p>
          </Reveal>
          <Reveal direction="left" delay={0.1} className="md:col-span-5">
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
                reading recommendations matched to their current skill level.
              </p>
              <a
                href="mailto:campmathos@gmail.com?subject=More%20Mathos%20material"
                className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 font-semibold text-cream transition hover:bg-electric"
              >
                Email campmathos@gmail.com →
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ TEASER */}
      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
          <Reveal>
            <p className="font-mono text-sm tracking-widest text-muted-foreground">FAQ</p>
            <h2 className="mt-2 font-display text-5xl font-black md:text-6xl">Common questions.</h2>
            <p className="mt-6 max-w-2xl text-lg text-ink/70">
              A few of the questions families ask most. We have a full FAQ page with everything
              else — schedule, drop-off, materials, attendance, and more.
            </p>
          </Reveal>

          <ul className="mt-10 space-y-4">
            {[
              { q: "Is the camp really free?", id: "free" },
              { q: "How do we sign up?", id: "register" },
              { q: "What days does it meet?", id: "schedule" },
              { q: "What should my child bring?", id: "bring" },
            ].map(({ q, id }, i) => (
              <Reveal key={id} delay={i * 0.2} amount={0.4}>
                <li>
                  <Link
                    to="/faq"
                    hash={id}
                    className="block rounded-2xl border-2 border-ink bg-cream px-6 py-4 font-display text-xl font-bold transition hover:bg-electric hover:text-cream"
                  >
                    {q}
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.1}>
            <Link
              to="/faq"
              className="mt-10 inline-flex rounded-full bg-ink px-8 py-4 font-semibold text-cream transition hover:bg-electric"
            >
              Read the full FAQ →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-coral">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center md:py-32">
          <Reveal direction="scale" amount={0.3}>
            <p className="font-mono text-sm tracking-widest text-cream/80">Register</p>
            <h2 className="mx-auto mt-4 max-w-4xl font-display text-[clamp(2.75rem,9vw,8rem)] font-black leading-[0.9] text-cream break-words">
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
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
