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
            / curriculum
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
                    / what we cover
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
                    / how it feels
                  </p>
                  <p className="mt-4 text-ink/80">{w.detail}</p>
                </div>
              </div>
            </article>
          ))}

          {/* Easy Python */}
          <article className="rounded-3xl border-2 border-ink bg-electric p-8 text-cream shadow-[8px_8px_0_0_var(--ink)] md:p-12">
            <span className="rounded-full bg-cream px-4 py-1 font-mono text-xs font-bold text-ink">
              Parallel track
            </span>
            <h2 className="mt-4 font-display text-4xl font-black md:text-5xl">
              Easy Python — build a retro 2D video game.
            </h2>
            <p className="mt-4 text-lg text-cream/85">
              Easy Python is a UI/UX-focused course built by the Mathos directors. We wrote a
              custom library of pre-coded helpers so campers don't have to build every piece from
              scratch — they get to spend their time designing and shipping the game they've
              always wanted to make. By the end of the course, every camper has a working
              retro-style 2D video game of their own. The full Easy Python course will live on its
              own dedicated website.
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
