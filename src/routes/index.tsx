import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import heroImg from "@/assets/hero-math.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Mathos — Summer applied math camp in Naperville | June 2026" },
      {
        name: "description",
        content:
          "Mathos is a free 4-week summer applied math camp at Naperville Public Library for grades 4–7, plus an Easy Python track for grades 5–7. June 2026.",
      },
      { property: "og:title", content: "Mathos — Summer applied math camp in Naperville" },
      {
        property: "og:description",
        content:
          "Four weeks of applied math for grades 4–7, plus Easy Python for grades 5–7. Naperville Public Library, June 2026.",
      },
      { property: "og:image", content: heroImg },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroImg },
    ],
  }),
});

type Week = {
  n: string;
  title: string;
  blurb: string;
  bullets: string[];
  detail: string;
  accent: string;
};

const weeks: Week[] = [
  {
    n: "01",
    title: "Graphing the real world",
    blurb:
      "Graphs aren't homework — they're how scientists, athletes, and investors read the world.",
    bullets: [
      "Plotting data from real measurements",
      "Linear and parabolic motion in sports",
      "Exponential growth: savings, viruses, populations",
    ],
    detail:
      "We start with the question every student asks: when will I actually use this? In week one, we plot heart rates from a sprint, model a basketball arc with a parabola, and watch a savings account grow exponentially. Every concept comes from a real situation, not a textbook problem.",
    accent: "bg-electric text-cream",
  },
  {
    n: "02",
    title: "Finance and probability",
    blurb:
      "How banks, casinos, and insurance companies all use the same math — and how to read it.",
    bullets: [
      "Probability with dice, cards, and real games",
      "Compound interest, debt, and the cost of waiting",
      "Expected value: when a deal is actually a deal",
    ],
    detail:
      "Probability and finance are the math adults use every day without realizing it. We run probability experiments by hand, then apply the same thinking to credit cards, savings accounts, and insurance. Students leave knowing how to evaluate a real financial offer and spot a bad bet.",
    accent: "bg-coral text-cream",
  },
  {
    n: "03",
    title: "Geometry and architecture",
    blurb:
      "Area, volume, and angles aren't decoration — they decide whether a building stands up.",
    bullets: [
      "Area, perimeter, and volume from blueprints",
      "Why triangles hold up bridges and skyscrapers",
      "Designing a tower under real constraints",
    ],
    detail:
      "Geometry becomes obvious once you build something. We measure the library itself, study why bridges use triangles instead of squares, and finish the week with a tower-design challenge where every team works inside a real budget and height limit.",
    accent: "bg-sun text-ink",
  },
  {
    n: "04",
    title: "Final project",
    blurb:
      "Pick a real problem. Use the math from weeks 1–3 to design a working solution.",
    bullets: [
      "City-block planning challenge",
      "Bridge engineering with load testing",
      "Showcase day for parents and family",
    ],
    detail:
      "Week four is when everything connects. Students choose a project — planning a city block, engineering a bridge, or pitching their own — and use graphing, probability, and geometry from earlier weeks to defend their design. We finish with a showcase day so families can see the work.",
    accent: "bg-ink text-cream",
  },
];

function Marquee() {
  const items = ["Mathos '26", "★", "Grades 4–7", "★", "Naperville Public Library", "★", "June", "★"];
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

function WeekCard({ week }: { week: Week }) {
  const [open, setOpen] = useState(false);
  return (
    <article
      className="group relative overflow-hidden rounded-3xl border-2 border-ink bg-cream p-8 transition hover:-translate-y-1 hover:shadow-[8px_8px_0_0_var(--ink)]"
    >
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
        <h3 className="mt-4 font-display text-4xl font-black">{week.title}</h3>
        <p className="mt-3 text-ink/70">{week.blurb}</p>
        <ul className="mt-6 space-y-2 border-t border-ink/15 pt-6 font-mono text-sm">
          {week.bullets.map((b) => (
            <li key={b} className="flex gap-3">
              <span className="text-coral">→</span>
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-electric">
          {open ? "Show less −" : "Read more +"}
        </div>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "mt-6 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="border-t-2 border-ink/15 pt-6 text-ink/80">{week.detail}</p>
        </div>
      </div>
    </article>
  );
}

function Index() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b-2 border-ink/80 bg-cream/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-black tracking-tight">Mathos</span>
            <span className="font-mono text-xs text-muted-foreground">v.2026</span>
          </a>
          <nav className="hidden items-center gap-8 font-mono text-sm md:flex">
            <a href="#curriculum" className="hover:text-electric">Curriculum</a>
            <a href="#details" className="hover:text-electric">Details</a>
            <Link to="/board" className="hover:text-electric">Board</Link>
            <a href="#faq" className="hover:text-electric">FAQ</a>
          </nav>
          <a
            href="#register"
            className="rounded-full border-2 border-ink bg-ink px-5 py-2 text-sm font-semibold text-cream transition hover:bg-electric hover:border-electric"
          >
            Register →
          </a>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative grid-paper border-b-2 border-ink">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-12 md:gap-8 md:py-24">
          <div className="md:col-span-7">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-cream px-4 py-1.5 font-mono text-xs uppercase tracking-widest">
              <span className="h-2 w-2 rounded-full bg-coral" />
              June 2026 · Naperville Public Library
            </div>
            <h1 className="font-display text-[clamp(3rem,9vw,7.5rem)] font-black leading-[0.9]">
              Math is the
              <br />
              <span className="italic text-electric">operating</span>
              <br />
              system.
            </h1>
            <p className="mt-8 max-w-xl text-lg text-ink/75 md:text-xl">
              <span className="font-semibold">Mathos</span> is a four-week summer camp built around{" "}
              <span className="font-semibold">applied math</span> — the math behind money,
              buildings, sports, and decisions. For grades 4–7, with an Easy Python track for
              grades 5–7, taught by Neuqua Valley students.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#register"
                className="rounded-full bg-coral px-8 py-4 font-semibold text-cream shadow-[6px_6px_0_0_var(--ink)] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--ink)]"
              >
                Reserve a spot
              </a>
              <a
                href="#curriculum"
                className="rounded-full border-2 border-ink px-8 py-4 font-semibold transition hover:bg-ink hover:text-cream"
              >
                See the curriculum
              </a>
            </div>

            <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t-2 border-ink/20 pt-8 font-mono text-sm">
              <div>
                <dt className="text-muted-foreground">Weeks</dt>
                <dd className="font-display text-3xl font-black">04</dd>
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

      {/* CURRICULUM */}
      <section id="curriculum" className="border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                / curriculum
              </p>
              <h2 className="mt-2 font-display text-5xl font-black md:text-7xl">
                Four weeks of
                <br />
                applied math.
              </h2>
            </div>
            <p className="max-w-sm text-ink/70">
              Every week is built around math you can actually use — money, buildings, sports,
              decisions. Tap any card to read more about that week.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {weeks.map((w) => (
              <WeekCard key={w.n} week={w} />
            ))}
          </div>

          {/* Easy Python track */}
          <div className="mt-10 rounded-3xl border-2 border-ink bg-electric p-8 text-cream md:p-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="font-mono text-xs uppercase tracking-widest text-cream/70">
                  / grades 5–7 track
                </p>
                <h3 className="mt-2 font-display text-3xl font-black md:text-4xl">
                  Easy Python — built and taught by our directors.
                </h3>
                <p className="mt-3 text-cream/85">
                  Older campers (grades 5–7) join an Easy Python track designed from scratch by the
                  Mathos directors. We use the same applied-math mindset: small projects, real
                  output, no jargon. No prior coding experience needed.
                </p>
              </div>
              <Link
                to="/board"
                className="shrink-0 rounded-full border-2 border-cream bg-cream px-6 py-3 font-semibold text-ink transition hover:bg-sun hover:border-sun"
              >
                Meet the directors →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILS */}
      <section id="details" className="border-b-2 border-ink bg-ink text-cream">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-5">
            <p className="font-mono text-sm uppercase tracking-widest text-cream/60">/ details</p>
            <h2 className="mt-2 font-display text-5xl font-black md:text-6xl">
              When, where, <span className="italic text-sun">who</span>.
            </h2>
            <p className="mt-6 max-w-md text-cream/70">
              Mathos runs through June. The Easy Python track for grades 5–7 is built and taught
              by our directors and runs alongside the math curriculum.
            </p>
          </div>

          <dl className="grid gap-px overflow-hidden rounded-3xl border-2 border-cream/20 bg-cream/10 md:col-span-7 md:grid-cols-2">
            {[
              ["When", "June 2026 · 4 weeks"],
              ["Where", "Naperville Public Library"],
              ["Cadence", "3 sessions per week"],
              ["Math grades", "4th — 7th"],
              ["Easy Python", "Grades 5–7, by our directors"],
              ["Cost", "Free for registered students"],
            ].map(([k, v]) => (
              <div key={k} className="bg-ink p-8">
                <dt className="font-mono text-xs uppercase tracking-widest text-cream/50">{k}</dt>
                <dd className="mt-3 font-display text-2xl font-bold leading-tight">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* EXTRA HELP */}
      <section className="border-b-2 border-ink bg-sun">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:py-24">
          <div className="md:col-span-7">
            <p className="font-mono text-sm uppercase tracking-widest text-ink/60">/ extra help</p>
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
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                / want more material?
              </p>
              <h3 className="mt-2 font-display text-3xl font-black">
                Reach out — we'll send more.
              </h3>
              <p className="mt-3 text-ink/70">
                If your child is interested and wants to keep going between sessions, students or
                parents can reach out and we'll share extra problem sets, project ideas, and
                reading recommendations matched to their grade.
              </p>
              <a
                href="mailto:hello@campmathos.com?subject=More%20Mathos%20material"
                className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 font-semibold text-cream transition hover:bg-electric"
              >
                Email us →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b-2 border-ink">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
          <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">/ faq</p>
          <h2 className="mt-2 font-display text-5xl font-black md:text-6xl">Good questions.</h2>

          <div className="mt-12 divide-y-2 divide-ink/15">
            {[
              {
                q: "Who is Mathos for?",
                a: "Curious kids in grades 4–7 who want to see where math actually shows up in the real world. No competition-math background required.",
              },
              {
                q: "How is it taught?",
                a: "Hands-on and applied. Dice and cards for probability. Real budgets for finance. Real towers and bridges for geometry. Math should produce something you can see.",
              },
              {
                q: "What's the Easy Python track?",
                a: "A beginner-friendly Python track for grades 5–7, designed and taught by the Mathos directors. Same applied mindset — small projects, real output.",
              },
              {
                q: "Can my child get extra help?",
                a: "Yes. Every teacher is willing to meet one-on-one with any camper who wants more practice or has questions outside of session time. Just ask, or email us.",
              },
              {
                q: "How do we get more material?",
                a: "Email us and we'll send extra problem sets, project ideas, and reading recommendations matched to your child's grade.",
              },
            ].map((f) => (
              <details key={f.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                  <span className="font-display text-2xl font-bold md:text-3xl">{f.q}</span>
                  <span className="font-display text-3xl font-black text-electric transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-2xl text-ink/70">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="register" className="bg-coral">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center md:py-32">
          <p className="font-mono text-sm uppercase tracking-widest text-cream/80">/ register</p>
          <h2 className="mx-auto mt-4 max-w-4xl font-display text-6xl font-black leading-[0.9] text-cream md:text-8xl">
            Spend June <span className="italic">thinking</span> in math.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-cream/85">
            Spots are limited. Drop your email and we'll send registration details, the full
            schedule, and extra material if you want it.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thanks! We'll be in touch with registration details.");
            }}
            className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row"
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
              Notify me
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-2 border-ink bg-cream">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row md:items-center">
          <div className="font-display text-2xl font-black">
            Mathos<span className="text-coral">.</span>
          </div>
          <div className="flex items-center gap-6 font-mono text-xs">
            <Link to="/board" className="hover:text-electric">Board of directors</Link>
            <a href="#register" className="hover:text-electric">Register</a>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            © 2026 Mathos · Naperville, IL · Built with curiosity
          </p>
        </div>
      </footer>
    </main>
  );
}
