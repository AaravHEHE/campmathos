import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Wordmark } from "@/components/Wordmark";
import { Reveal } from "@/components/Reveal";
import { StatCard } from "@/components/StatCard";
import { PollIndicator } from "@/components/PollIndicator";
import { PhotoGallery } from "@/components/PhotoGallery";
import { canonical, ogImage } from "@/lib/seo";
import { sortedCampYears, type CampYear } from "@/data/camp-years";

const OG = ogImage("/og-default.jpg");

export const Route = createFileRoute("/through-the-years")({
  component: ThroughTheYearsPage,
  head: () => ({
    meta: [
      { title: "Through the Years — MathOs camp archive" },
      {
        name: "description",
        content:
          "MathOs, year by year: sign-up numbers, camper survey results, and photos from every camp we've run.",
      },
      { property: "og:title", content: "Through the Years — MathOs camp archive" },
      {
        property: "og:description",
        content: "A running archive of every MathOs camp — sign-ups, survey results, and photos, year by year.",
      },
      { property: "og:image", content: OG },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG },
    ],
    links: [canonical("/through-the-years")],
  }),
});

function YearSection({ camp }: { camp: CampYear }) {
  return (
    <>
      {/* Headline stats */}
      <section className="grid-paper border-b-2 border-ink bg-cream text-ink">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <Reveal>
            <p className="font-mono text-sm tracking-widest text-muted-foreground">{camp.year} at a glance</p>
            {camp.sessionDates && (
              <p className="mt-2 font-display text-2xl font-black md:text-3xl">{camp.sessionDates}</p>
            )}
            {camp.year === 2026 && (
              <p className="mt-4 max-w-2xl text-ink/75">
                2026 was our pilot year, so we ran camp fully online to gauge how the community would
                react. It was such a hit that we've shifted to a hybrid camp — in person and online —
                so our out-of-state campers can still join us.
              </p>
            )}
          </Reveal>
          <Reveal amount={0.2}>
            <div
              className={`mt-8 grid grid-cols-2 gap-4 ${camp.reach ? "sm:grid-cols-3 lg:grid-cols-5" : "sm:max-w-xs sm:grid-cols-1"}`}
            >
              <StatCard label="Registrants" value={camp.registrants} accent="bg-electric text-cream" />
              {camp.reach && (
                <>
                  <StatCard
                    label="Time zones reached"
                    value={camp.reach.timezones}
                    accent="bg-coral text-cream"
                  />
                  <StatCard label="States reached" value={camp.reach.states} accent="bg-sun text-ink" />
                  <StatCard
                    label="Schools reached"
                    value={camp.reach.schools}
                    accent="bg-sun text-ink"
                  />
                  <StatCard
                    label="Grade levels enrolled"
                    value={camp.reach.gradeLevels}
                    accent="bg-electric/80 text-cream"
                  />
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Student experience */}
      {camp.polls.length > 0 && (
        <section className="border-b-2 border-ink">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
            <Reveal>
              <p className="font-mono text-sm tracking-widest text-muted-foreground">Student experience</p>
              <h2 className="mt-2 font-display text-4xl font-black leading-[0.95] md:text-5xl">
                What campers told us.
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {camp.polls.map((poll, i) => (
                <Reveal key={poll.question} delay={i * 0.15} amount={0.3}>
                  <PollIndicator poll={poll} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {camp.testimonials && camp.testimonials.length > 0 && (
        <section className="border-b-2 border-ink bg-cream text-ink">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
            <Reveal>
              <p className="font-mono text-sm tracking-widest text-muted-foreground">In their words</p>
              <h2 className="mt-2 font-display text-4xl font-black leading-[0.95] md:text-5xl">
                What families told us.
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {camp.testimonials.map((t, i) => (
                <Reveal key={t.author + i} delay={i * 0.15} amount={0.3}>
                  <figure className="h-full rounded-3xl border-2 border-ink/20 bg-ink/[0.03] p-8">
                    <span className="font-display text-6xl font-black leading-none text-ink/20">"</span>
                    <blockquote className="-mt-4 font-display text-2xl font-medium italic leading-snug">
                      {t.quote}
                    </blockquote>
                    <figcaption className="mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      — {t.author}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Photo gallery */}
      <section className="border-b-2 border-ink bg-sun">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <Reveal>
            <p className="font-mono text-sm tracking-widest text-ink/60">Photo timeline</p>
            <h2 className="mt-2 font-display text-4xl font-black leading-[0.95] md:text-5xl">
              Moments from {camp.year}.
            </h2>
          </Reveal>
          <div className="mt-10">
            <PhotoGallery photos={camp.photos} />
          </div>
        </div>
      </section>

      {/* Highlights */}
      {camp.highlights && camp.highlights.length > 0 && (
        <section className="border-b-2 border-ink">
          <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
            <Reveal>
              <p className="font-mono text-sm tracking-widest text-muted-foreground">Highlights</p>
              <h2 className="mt-2 font-display text-4xl font-black md:text-5xl">
                What stood out in {camp.year}.
              </h2>
            </Reveal>
            <ul className="mt-8 space-y-3 font-mono text-sm">
              {camp.highlights.map((h) => (
                <li key={h} className="flex gap-3">
                  <span className="text-coral">→</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

function ThroughTheYearsPage() {
  const years = sortedCampYears();
  const [selectedYear, setSelectedYear] = useState<number>(years[0]?.year);
  const camp = years.find((y) => y.year === selectedYear) ?? years[0];

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />

      {/* HEADER */}
      <section className="grid-paper border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <p className="font-mono text-sm tracking-widest text-muted-foreground">Archive</p>
          <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-7xl">
            Through the <span className="italic text-electric">years</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/75">
            Every summer <Wordmark /> runs, we archive it here — sign-ups, what campers told us, and
            photos from the sessions themselves.
          </p>
        </div>
      </section>

      {/* YEAR NAVIGATION */}
      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 pt-10">
          {years.length > 1 ? (
            <div
              role="tablist"
              aria-label="Select a camp year"
              className="inline-flex items-center rounded-full border-2 border-ink bg-cream p-1 font-mono text-sm"
            >
              {years.map((y) => (
                <button
                  key={y.year}
                  type="button"
                  role="tab"
                  aria-selected={camp?.year === y.year}
                  onClick={() => setSelectedYear(y.year)}
                  className={`rounded-full px-5 py-2 font-semibold transition ${
                    camp?.year === y.year ? "bg-ink text-cream" : "text-ink/70 hover:text-ink"
                  }`}
                >
                  {y.year}
                </button>
              ))}
            </div>
          ) : (
            <p className="font-mono text-sm tracking-widest text-electric">{camp?.year} camp</p>
          )}
        </div>
      </section>

      {camp && <YearSection camp={camp} />}

      <section className="bg-coral">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center md:py-28">
          <h2 className="mx-auto max-w-3xl font-display text-5xl font-black leading-[0.9] text-cream md:text-7xl">
            Be part of next year's page.
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
