import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { weeks } from "@/data/weeks";
import { canonical, ogImage } from "@/lib/seo";
import { Reveal } from "@/components/Reveal";

const OG = ogImage("/og-curriculum.jpg");

export const Route = createFileRoute("/curriculum")({
  component: CurriculumPage,
  head: () => ({
    meta: [
      { title: "Curriculum — MathOs summer camp" },
      {
        name: "description",
        content:
          "Full week-by-week breakdown of the MathOs applied math curriculum: graphing, finance and probability, geometry and architecture, and a final project showcase.",
      },
      { property: "og:title", content: "Curriculum — MathOs summer camp" },
      {
        property: "og:description",
        content:
          "Four weeks of applied math: graphing the real world, finance and probability, geometry and architecture, and a final project showcase.",
      },
      { property: "og:image", content: OG },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG },
    ],
    links: [canonical("/curriculum")],
  }),
});

function CurriculumPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />

      <section className="grid-paper border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <p className="font-mono text-sm tracking-widest text-muted-foreground">
            Curriculum
          </p>
          <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-7xl">
            Four weeks of <span className="italic text-electric">applied</span> math.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/75">
            Every MathOs session is built around math you can actually use — money, buildings,
            sports, decisions. Below is the full week-by-week plan for June 2026.
          </p>
        </div>
      </section>

      {/* THREE THEMES */}
      <section className="border-b-2 border-ink bg-ink text-cream">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <Reveal>
            <p className="font-mono text-sm tracking-widest text-cream/60">
              Three themes
            </p>
            <h2 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-6xl">
              Math, mapped to the
              <br />
              <span className="italic text-sun">real world</span>.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                tag: "engineering",
                title: "Graphing",
                body: "Read, build, and defend graphs the way engineers and analysts do.",
                accent: "bg-electric text-cream",
              },
              {
                tag: "decision-making",
                title: "Probability + Finance",
                body: "Use the same math banks, casinos, and insurance companies use every day.",
                accent: "bg-coral text-cream",
              },
              {
                tag: "architecture",
                title: "Geometry",
                body: "Design structures with area, volume, and angle relationships that have to actually hold up.",
                accent: "bg-sun text-ink",
              },
            ].map((t, i) => (
              <Reveal key={t.title} delay={i * 0.25} amount={0.3}>
                <article className="rounded-3xl border-2 border-cream/30 bg-cream/5 p-6">
                  <span
                    className={`inline-block rounded-full px-3 py-1 font-mono text-xs font-bold ${t.accent}`}
                  >
                    {t.tag}
                  </span>
                  <h3 className="mt-4 font-display text-3xl font-black">{t.title}</h3>
                  <p className="mt-3 text-cream/75">{t.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-5xl space-y-12 px-6 py-20 md:py-28">
          {weeks.map((w, i) => (
            <Reveal key={w.n} delay={(i % 2) * 0.15} amount={0.2}>
              <article
                className="rounded-3xl border-2 border-ink bg-cream p-8 shadow-[8px_8px_0_0_var(--ink)] md:p-12"
              >
                <div className="flex items-start justify-between gap-6">
                  <span
                    className={`rounded-full px-4 py-1 font-mono text-xs font-bold ${w.accent}`}
                  >
                    Week {w.n}
                  </span>
                  <span className="font-display text-7xl font-black text-ink/10">{w.n}</span>
                </div>
                <h2 className="mt-4 font-display text-4xl font-black md:text-5xl">{w.title}</h2>
                <p className="mt-4 text-lg text-ink/75">{w.blurb}</p>

                <div className="mt-8 grid gap-8 md:grid-cols-2">
                  <div>
                    <p className="font-mono text-xs tracking-widest text-muted-foreground">
                      What we cover
                    </p>
                    <ul className="mt-4 space-y-3 font-mono text-sm">
                      {w.bullets.map((b) => (
                        <li key={b} className="flex gap-3">
                          <span className="text-coral">→</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-mono text-xs tracking-widest text-muted-foreground">
                      How it feels
                    </p>
                    <p className="mt-4 text-ink/80">{w.detail}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}

          {/* SUPPORT CALLOUT */}
          <Reveal direction="scale" amount={0.2}>
            <article className="grid gap-6 rounded-3xl border-2 border-ink bg-sun p-8 md:grid-cols-3 md:p-12">
              <div className="md:col-span-1">
                <p className="font-mono text-xs tracking-widest text-ink/60">
                  Built-in support
                </p>
                <h3 className="mt-2 font-display text-3xl font-black">However you learn.</h3>
              </div>
              <ul className="md:col-span-2 space-y-4 text-ink/80">
                <li>
                  <span className="font-display text-lg font-black">Guided notes.</span> Every
                  lesson comes with structured, pre-built notes that simplify complex ideas.
                </li>
                <li>
                  <span className="font-display text-lg font-black">Out-of-class help.</span> Any
                  Camp Director will meet one-on-one with any camper — for camp topics, school homework,
                  or anything in between.
                </li>
                <li>
                  <span className="font-display text-lg font-black">Stretch material.</span> Curious
                  campers get harder problem sets, project ideas, and reading recommendations to
                  explore between sessions.
                </li>
              </ul>
            </article>
          </Reveal>

          {/* PythOs */}
          <Reveal direction="scale" amount={0.2}>
            <article className="rounded-3xl border-2 border-ink bg-electric p-8 text-cream shadow-[8px_8px_0_0_var(--ink)] md:p-12">
              <span className="rounded-full bg-cream px-4 py-1 font-mono text-xs font-bold text-ink">
                Affiliate program · July
              </span>
              <h2 className="mt-4 font-display text-4xl font-black md:text-5xl">
                PythOs — our computer-science camp.
              </h2>
              <p className="mt-4 text-lg text-cream/85">
                After MathOs finishes in June, the same Camp Directors run{" "}
                <span className="font-semibold">PythOs</span> in July: a creative CS program for two
                age groups. Grades 1–4 use Scratch on Mondays and Thursdays; grades 5–8 use Python
                with a custom Turtle-graphics library on Tuesdays and Fridays. We focus on logic,
                creativity, and problem-solving over memorizing syntax — and every camper finishes
                with their own playable 2D game. PythOs has its own dedicated website coming soon.
              </p>
              <Link
                to="/board"
                className="mt-8 inline-flex rounded-full border-2 border-cream bg-cream px-6 py-3 font-semibold text-ink transition hover:bg-sun hover:border-sun"
              >
                Meet the Camp Directors →
              </Link>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-coral">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center md:py-28">
          <h2 className="mx-auto max-w-3xl font-display text-5xl font-black leading-[0.9] text-cream md:text-7xl">
            Ready to join us in June?
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
