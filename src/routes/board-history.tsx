import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Wordmark } from "@/components/Wordmark";
import { canonical, ogImage } from "@/lib/seo";
import { Reveal } from "@/components/Reveal";
import { DirectorCard } from "@/components/DirectorCard";
import { pastBoardYears } from "@/data/board-years";

const OG = ogImage("/og-board.jpg");

export const Route = createFileRoute("/board-history")({
  component: BoardHistoryPage,
  head: () => ({
    meta: [
      { title: "Past Camp Directors — MathOs board history" },
      {
        name: "description",
        content: "Every past MathOs Camp Director, year by year — giving credit where it's due.",
      },
      { property: "og:title", content: "Past Camp Directors — MathOs" },
      {
        property: "og:description",
        content: "A running record of every student who has helped build and teach MathOs.",
      },
      { property: "og:image", content: OG },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG },
    ],
    links: [canonical("/board-history")],
  }),
});

function BoardHistoryPage() {
  const years = pastBoardYears();

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />

      <section className="grid-paper border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <p className="font-mono text-sm tracking-widest text-muted-foreground">Camp Directors</p>
          <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-7xl">
            Every director, <span className="italic text-electric">every year</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/75">
            <Wordmark /> is run entirely by students, and a new group steps up each year. This page
            credits everyone who has helped build and teach camp in years past.
          </p>
          <Link
            to="/board"
            className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/40 transition hover:text-electric"
          >
            ← See the current board
          </Link>
        </div>
      </section>

      {years.length === 0 ? (
        <section className="border-b-2 border-ink">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
            <p className="text-lg text-ink/60">
              No past boards yet — this page fills in once a year wraps and a new one begins.
            </p>
          </div>
        </section>
      ) : (
        years.map((by) => (
          <section key={by.year} className="border-b-2 border-ink">
            <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
              <p className="font-mono text-sm tracking-widest text-muted-foreground">{by.year}</p>
              <h2 className="mt-2 font-display text-4xl font-black md:text-5xl">{by.year} board</h2>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {by.directors.map((d, i) => (
                  <DirectorCard key={`${by.year}-${d.name}`} director={d} delay={(i % 3) * 0.15} />
                ))}
              </div>
            </div>
          </section>
        ))
      )}

      <SiteFooter />
    </main>
  );
}
