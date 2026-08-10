import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Wordmark } from "@/components/Wordmark";
import { canonical, ogImage } from "@/lib/seo";
import { Reveal } from "@/components/Reveal";
import { DirectorCard } from "@/components/DirectorCard";
import { currentBoardYear } from "@/data/board-years";

const OG = ogImage("/og-board.jpg");

export const Route = createFileRoute("/board")({
  component: BoardPage,
  head: () => ({
    meta: [
      { title: "Camp Directors — MathOs" },
      {
        name: "description",
        content:
          "Meet the MathOs Camp Directors — the math team leading our free hybrid summer applied math camp.",
      },
      { property: "og:title", content: "Camp Directors — MathOs" },
      {
        property: "og:description",
        content:
          "Meet the six Camp Directors behind MathOs, a free hybrid summer applied math camp.",
      },
      { property: "og:image", content: OG },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG },
    ],
    links: [canonical("/board")],
  }),
});

function BoardPage() {
  const board = currentBoardYear();

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />

      <section className="grid-paper border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <p className="font-mono text-sm tracking-widest text-muted-foreground">Camp Directors</p>
          <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-7xl">
            The students <span className="italic text-electric">behind</span> <Wordmark />.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/75">
            <Wordmark /> is built and taught by the math team, who believe math should feel useful,
            not abstract. We design every session, mentor every camper, and run every workshop ourselves.
          </p>
          <Link
            to="/board-history"
            className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/40 transition hover:text-electric"
          >
            See who helped us out in the past →
          </Link>
        </div>
      </section>

      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <p className="font-mono text-sm tracking-widest text-muted-foreground">{board.year} board</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {board.directors.map((d, i) => (
              <DirectorCard key={d.name} director={d} delay={(i % 3) * 0.2} />
            ))}
          </div>

          <Reveal direction="scale" amount={0.2}>
            <div className="mt-16 rounded-3xl border-2 border-ink bg-ink p-10 text-cream md:p-14">
              <p className="font-mono text-sm tracking-widest text-cream/60">Extra help</p>
              <h2 className="mt-3 font-display text-4xl font-black md:text-5xl">We meet kids where they are.</h2>
              <p className="mt-5 max-w-2xl text-cream/80">
                Every Camp Director is happy to meet one-on-one with any camper who needs a little extra help — whether
                that's reviewing a concept, working through homework from school, or just talking through an idea. Just
                ask during a session, or email{" "}
                <a href="mailto:campmathos@gmail.com" className="underline">
                  campmathos@gmail.com
                </a>{" "}
                and we'll set up a time.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
