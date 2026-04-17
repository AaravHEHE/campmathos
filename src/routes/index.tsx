import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero-math.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "MathOS — Summer Math Camp in Naperville | June 2026" },
      {
        name: "description",
        content:
          "MathOS is a 4-week summer math camp at Naperville Public Library for grades 4–7. Graphing, finance, geometry & a final project. June 2026.",
      },
      { property: "og:title", content: "MathOS — Summer Math Camp in Naperville" },
      {
        property: "og:description",
        content:
          "Four weeks of hands-on math for grades 4–7. Graphing, probability, architecture & a final build. Naperville Public Library, June 2026.",
      },
      { property: "og:image", content: heroImg },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroImg },
    ],
  }),
});

const weeks = [
  {
    n: "01",
    title: "Graphing",
    blurb: "From first plot to parabolas. We graph the world — linear, exponential, and beyond.",
    bullets: ["Intro to graphing", "Linear & parabola in the wild", "Exponential growth & finance"],
    accent: "bg-electric text-cream",
  },
  {
    n: "02",
    title: "Finance & Probability",
    blurb: "Roll the dice, flip the coin, then read the bank statement. Math that pays.",
    bullets: ["Dice, coins & probability grids", "Interest, debt & expected value", "Lessons from real money"],
    accent: "bg-coral text-cream",
  },
  {
    n: "03",
    title: "Geometry & Architecture",
    blurb: "Area, volume, surface — then design the tower that holds it all up.",
    bullets: ["Area, perimeter, volume", "Shapes that build cities", "Design your own tower"],
    accent: "bg-sun text-ink",
  },
  {
    n: "04",
    title: "Final Project",
    blurb: "Pick a problem worth solving. Plan a city. Build a bridge. Show your math.",
    bullets: ["City planning challenge", "Bridge engineering", "Showcase day"],
    accent: "bg-ink text-cream",
  },
];

function Marquee() {
  const items = ["MATHOS '26", "★", "GRADES 4–7", "★", "NAPERVILLE PUBLIC LIBRARY", "★", "JUNE", "★"];
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

function Index() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b-2 border-ink/80 bg-cream/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-black tracking-tight">MathOS</span>
            <span className="font-mono text-xs text-muted-foreground">v.2026</span>
          </a>
          <nav className="hidden items-center gap-8 font-mono text-sm md:flex">
            <a href="#curriculum" className="hover:text-electric">curriculum</a>
            <a href="#details" className="hover:text-electric">details</a>
            <a href="#faq" className="hover:text-electric">faq</a>
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
              <span className="font-semibold">MathOS</span> is a four-week summer camp for grades
              4–7. Graphing, probability, geometry & a final build — three sessions a week, all
              taught with curiosity over correctness.
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
                alt="Colorful collage of dice, geometric shapes and graphs representing the MathOS curriculum"
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
                Four weeks.
                <br />
                One way to see math.
              </h2>
            </div>
            <p className="max-w-sm text-ink/70">
              Each week stacks on the last — concepts move from the page to the world to a project
              students design themselves.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {weeks.map((w) => (
              <article
                key={w.n}
                className="group relative overflow-hidden rounded-3xl border-2 border-ink bg-cream p-8 transition hover:-translate-y-1 hover:shadow-[8px_8px_0_0_var(--ink)]"
              >
                <div className="flex items-start justify-between">
                  <span className={`rounded-full px-4 py-1 font-mono text-xs font-bold ${w.accent}`}>
                    WEEK {w.n}
                  </span>
                  <span className="font-display text-6xl font-black text-ink/10 transition group-hover:text-ink/20">
                    {w.n}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-4xl font-black">{w.title}</h3>
                <p className="mt-3 text-ink/70">{w.blurb}</p>
                <ul className="mt-6 space-y-2 border-t border-ink/15 pt-6 font-mono text-sm">
                  {w.bullets.map((b) => (
                    <li key={b} className="flex gap-3">
                      <span className="text-coral">→</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
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
              MathOS is the math half of a two-month program. CS launches in July with Scratch,
              Python, Java & C++ tracks for grades 1–7.
            </p>
          </div>

          <dl className="grid gap-px overflow-hidden rounded-3xl border-2 border-cream/20 bg-cream/10 md:col-span-7 md:grid-cols-2">
            {[
              ["When", "June 2026 · 4 weeks"],
              ["Where", "Naperville Public Library"],
              ["Cadence", "3 sessions per week"],
              ["Grades", "4th — 7th"],
              ["Cost", "Free for registered students"],
              ["Up next", "CS month begins July"],
            ].map(([k, v]) => (
              <div key={k} className="bg-ink p-8">
                <dt className="font-mono text-xs uppercase tracking-widest text-cream/50">{k}</dt>
                <dd className="mt-3 font-display text-2xl font-bold leading-tight">{v}</dd>
              </div>
            ))}
          </dl>
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
                q: "Who is MathOS for?",
                a: "Curious kids in grades 4–7. No competition-math background required — bring questions, not formulas.",
              },
              {
                q: "How is it taught?",
                a: "Hands-on. Dice and coins for probability. Sketches and grids for graphing. Real towers, real budgets, real bridges.",
              },
              {
                q: "What's the final project?",
                a: "Students choose: design a city block, plan a bridge, or pitch their own. We help turn the math into something you can see.",
              },
              {
                q: "Is there a CS option?",
                a: "Yes — the second month is CS. Scratch & Python (grades 1–4) and Java / C++ / Python (grades 5–7).",
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
      <section id="register" className="bg-sun">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center md:py-32">
          <p className="font-mono text-sm uppercase tracking-widest">/ register</p>
          <h2 className="mx-auto mt-4 max-w-4xl font-display text-6xl font-black leading-[0.9] md:text-8xl">
            Spend June <span className="italic">thinking</span> in math.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink/75">
            Spots are limited. Drop your name and we'll send registration details and the full
            schedule.
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
            MathOS<span className="text-coral">.</span>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            © 2026 MathOS · Naperville, IL · Built with curiosity
          </p>
        </div>
      </footer>
    </main>
  );
}
