import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { weeks } from "@/data/weeks";

export const Route = createFileRoute("/curriculum")({
  component: CurriculumPage,
  head: () => ({
    meta: [
      { title: "Curriculum — Mathos summer camp" },
      {
        name: "description",
        content:
          "Full week-by-week breakdown of the Mathos applied math curriculum: graphing, finance and probability, geometry and architecture, and a final project showcase.",
      },
      { property: "og:title", content: "Curriculum — Mathos summer camp" },
      {
        property: "og:description",
        content:
          "Four weeks of applied math: graphing the real world, finance and probability, geometry and architecture, and a final project showcase.",
      },
    ],
  }),
});

function CurriculumPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />

      <section className="grid-paper border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
            CURRICULUM
          </p>
          <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-7xl">
            Four weeks of <span className="italic text-electric">applied</span> math.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/75">
            Every Mathos session is built around math you can actually use — money, buildings,
            sports, decisions. Below is the full week-by-week plan for June 2026.
          </p>
        </div>
      </section>

      {/* THREE THEMES */}
      <section className="border-b-2 border-ink bg-ink text-cream">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <p className="font-mono text-sm uppercase tracking-widest text-cream/60">
            THREE THEMES
          </p>
          <h2 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-6xl">
            Math, mapped to the
            <br />
            <span className="italic text-sun">real world</span>.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                tag: "/ engineering",
                title: "Graphing",
                body: "Read, build, and defend graphs the way engineers and analysts do.",
                accent: "bg-electric text-cream",
              },
              {
                tag: "/ decision-making",
                title: "Probability + Finance",
                body: "Use the same math banks, casinos, and insurance companies use every day.",
                accent: "bg-coral text-cream",
              },
              {
                tag: "/ architecture",
                title: "Geometry",
                body: "Design structures with area, volume, and angle relationships that have to actually hold up.",
                accent: "bg-sun text-ink",
              },
            ].map((t) => (
              <article
                key={t.title}
                className="rounded-3xl border-2 border-cream/30 bg-cream/5 p-6"
              >
                <span
                  className={`inline-block rounded-full px-3 py-1 font-mono text-xs font-bold ${t.accent}`}
                >
                  {t.tag}
                </span>
                <h3 className="mt-4 font-display text-3xl font-black">{t.title}</h3>
                <p className="mt-3 text-cream/75">{t.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-5xl space-y-12 px-6 py-20 md:py-28">
          {weeks.map((w) => (
            <article
              key={w.n}
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
                  <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    WHAT WE COVER
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
                  <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    HOW IT FEELS
                  </p>
                  <p className="mt-4 text-ink/80">{w.detail}</p>
                </div>
              </div>
            </article>
          ))}

          {/* SUPPORT CALLOUT */}
          <article className="grid gap-6 rounded-3xl border-2 border-ink bg-sun p-8 md:grid-cols-3 md:p-12">
            <div className="md:col-span-1">
              <p className="font-mono text-xs uppercase tracking-widest text-ink/60">
                BUILT-IN SUPPORT
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
                director will meet one-on-one with any camper — for camp topics, school homework,
                or anything in between.
              </li>
              <li>
                <span className="font-display text-lg font-black">Stretch material.</span> Curious
                campers get harder problem sets, project ideas, and reading recommendations to
                explore between sessions.
              </li>
            </ul>
          </article>

          {/* Pythos */}
          <article className="rounded-3xl border-2 border-ink bg-electric p-8 text-cream shadow-[8px_8px_0_0_var(--ink)] md:p-12">
            <span className="rounded-full bg-cream px-4 py-1 font-mono text-xs font-bold text-ink">
              Sister program · July
            </span>
            <h2 className="mt-4 font-display text-4xl font-black md:text-5xl">
              Pythos — our computer-science camp.
            </h2>
            <p className="mt-4 text-lg text-cream/85">
              After Mathos finishes in June, the same directors run{" "}
              <span className="font-semibold">Pythos</span> in July: a creative CS program for two
              age groups. Grades 1–4 use Scratch on Mondays and Thursdays; grades 5–8 use Python
              with a custom Turtle-graphics library on Tuesdays and Fridays. We focus on logic,
              creativity, and problem-solving over memorizing syntax — and every camper finishes
              with their own playable 2D game. Pythos has its own dedicated website coming soon.
            </p>
            <Link
              to="/board"
              className="mt-8 inline-flex rounded-full border-2 border-cream bg-cream px-6 py-3 font-semibold text-ink transition hover:bg-sun hover:border-sun"
            >
              Meet the directors →
            </Link>
          </article>
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
