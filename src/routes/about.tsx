import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About MathOs — Free applied math camp in Naperville" },
      {
        name: "description",
        content:
          "MathOs comes from the Greek word for 'learning.' We're a student-led nonprofit running a free, hands-on applied math camp at Naperville Public Library, with a sister CS program called PythOs.",
      },
      { property: "og:title", content: "About MathOs — Free applied math camp" },
      {
        property: "og:description",
        content:
          "A student-led nonprofit teaching applied math through hands-on activities, real projects, and zero pressure.",
      },
    ],
  }),
});

const pillars: { tag: string; title: string; body: string; accent: string }[] = [
  {
    tag: "/ hands-on",
    title: "Activities, not lectures.",
    body: "We design custom games, challenges, and builds for every concept. Note-taking is minimal so participation can stay high.",
    accent: "bg-electric text-cream",
  },
  {
    tag: "/ guided",
    title: "Structured guided notes.",
    body: "Every lesson comes with clear, pre-built notes that simplify complex ideas — campers leave with a reference they can actually use later.",
    accent: "bg-coral text-cream",
  },
  {
    tag: "/ supportive",
    title: "Optional out-of-class help.",
    body: "Any director will meet one-on-one with any camper who needs extra time on a topic — from camp, from school, or just curiosity.",
    accent: "bg-sun text-ink",
  },
  {
    tag: "/ stretching",
    title: "Extra material for the curious.",
    body: "Campers who want to go further get harder problem sets, project ideas, and reading recommendations matched to their grade.",
    accent: "bg-ink text-cream",
  },
];

function AboutPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />

      {/* HERO */}
      <section className="grid-paper border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <p className="font-mono text-sm tracking-widest text-muted-foreground">
            About
          </p>
          <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-7xl">
            <span className="italic text-electric">MathOs</span> means
            <br />
            learning.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/75">
            The name comes from the Greek word for "learning" or "knowledge." MathOs is a
            one-month summer program designed by a team of Neuqua Valley High School students to
            make math feel useful, hands-on, and genuinely exciting — not abstract.
          </p>
        </div>
      </section>

      {/* MISSION */}
      <section className="border-b-2 border-ink bg-ink text-cream">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-5">
            <p className="font-mono text-sm tracking-widest text-cream/60">Mission</p>
            <h2 className="mt-2 font-display text-5xl font-black leading-[0.95] md:text-6xl">
              Math you can <span className="italic text-sun">actually use</span>.
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-lg text-cream/80">
              Most kids meet math as a stack of formulas with no obvious purpose. We think that's
              backwards. MathOs teaches incoming 4th–7th graders how the math they already see in
              school connects to engineering, finance, and architecture — the things adults
              actually pay for and build with.
            </p>
            <p className="mt-5 text-lg text-cream/80">
              The whole program is{" "}
              <span className="font-semibold text-cream">completely free</span>, low-pressure, and
              project-based. There are no fees, no strict attendance rules, and no exams. Just
              real problems, real tools, and real things to build.
            </p>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <p className="font-mono text-sm tracking-widest text-muted-foreground">
            How we teach
          </p>
          <h2 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-6xl">
            Built around how kids
            <br />
            actually learn.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-ink/75">
            Our teaching philosophy prioritizes hands-on learning over passive instruction. Every
            session is built so campers spend most of their time doing — building, debating,
            testing — instead of copying from a board.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {pillars.map((p) => (
              <article
                key={p.title}
                className="rounded-3xl border-2 border-ink bg-cream p-8 shadow-[6px_6px_0_0_var(--ink)]"
              >
                <span
                  className={`inline-block rounded-full px-3 py-1 font-mono text-xs font-bold ${p.accent}`}
                >
                  {p.tag}
                </span>
                <h3 className="mt-4 font-display text-2xl font-black">{p.title}</h3>
                <p className="mt-3 text-ink/70">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PYTHOS */}
      <section className="border-b-2 border-ink bg-electric">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 text-cream md:grid-cols-12 md:py-28">
          <div className="md:col-span-7">
            <p className="font-mono text-sm tracking-widest text-cream/70">
              Sister program
            </p>
            <h2 className="mt-2 font-display text-5xl font-black leading-[0.95] md:text-6xl">
              Meet <span className="italic text-sun">PythOs</span>.
            </h2>
            <p className="mt-6 max-w-2xl text-cream/85">
              After MathOs wraps in June, our directors run a sister computer-science program
              called <span className="font-semibold">PythOs</span> in July. Two age tracks, both
              focused on building real games — not memorizing syntax. PythOs has its own
              dedicated website coming soon.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="rounded-3xl border-2 border-cream bg-cream/10 p-6">
              <p className="font-mono text-xs tracking-widest text-cream/70">
                July tracks
              </p>
              <ul className="mt-4 space-y-3 font-mono text-sm">
                <li className="flex gap-3">
                  <span className="text-sun">→</span>Grades 1–4 · Mondays &amp; Thursdays · Scratch
                </li>
                <li className="flex gap-3">
                  <span className="text-sun">→</span>Grades 5–8 · Tuesdays &amp; Fridays · Python +
                  Turtle
                </li>
                <li className="flex gap-3">
                  <span className="text-sun">→</span>Final showcase: every camper ships a 2D game
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-coral">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center md:py-28">
          <h2 className="mx-auto max-w-3xl font-display text-5xl font-black leading-[0.9] text-cream md:text-7xl">
            Spend June learning the way it should feel.
          </h2>
          <Link
            to="/register"
            className="mt-10 inline-flex rounded-full bg-ink px-8 py-4 font-semibold text-cream transition hover:bg-electric"
          >
            Reserve a spot →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
