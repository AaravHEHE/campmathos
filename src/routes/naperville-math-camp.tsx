import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Wordmark } from "@/components/Wordmark";
import { CAMP, fullAddress } from "@/lib/camp";
import { canonical, ogImage, campEventJsonLd } from "@/lib/seo";

const OG = ogImage("/og-naperville.jpg");

export const Route = createFileRoute("/naperville-math-camp")({
  component: NapervilleMathCampPage,
  head: () => ({
    meta: [
      { title: "Naperville Math Camp 2026 — Free summer camp (5th grade math → Geometry)" },
      {
        name: "description",
        content:
          "Looking for a free summer math camp in Naperville, IL? MathOs runs Tue/Thu sessions in the early afternoon at Neuqua Valley High School from June 2 through July 9, 2026. Recommended skill range: 5th grade math through Geometry. Zero cost.",
      },
      { property: "og:title", content: "Naperville Math Camp 2026 — Free, 5th grade math → Geometry" },
      {
        property: "og:description",
        content:
          "MathOs is a free multi-week applied math camp at Neuqua Valley High School, summer 2026.",
      },
      { property: "og:image", content: OG },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG },
    ],
    links: [canonical("/naperville-math-camp")],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(campEventJsonLd()),
      },
    ],
  }),
});

function NapervilleMathCampPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />

      <section className="grid-paper border-b-2 border-ink">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <p className="font-mono text-sm tracking-widest text-muted-foreground">
            Naperville · Summer 2026
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.25rem,7vw,5.5rem)] font-black leading-[0.95]">
            Free <span className="italic text-electric">math camp</span>
            <br />
            for Naperville kids.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/75">
            <Wordmark /> is a multi-week applied math summer camp hosted at
            Neuqua Valley High School. Completely free,
            recommended for campers working at 5th-grade math through Geometry,
            taught by Neuqua Valley High School students.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex min-h-11 items-center rounded-full border-2 border-ink bg-coral px-6 py-3 font-semibold text-cream shadow-[6px_6px_0_0_var(--ink)] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--ink)]"
            >
              Save my spot →
            </Link>
            <Link
              to="/curriculum"
              className="inline-flex min-h-11 items-center rounded-full border-2 border-ink bg-cream px-6 py-3 font-semibold text-ink transition hover:bg-ink hover:text-cream"
            >
              See the curriculum
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-ink bg-ink text-cream">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <dl className="grid gap-px overflow-hidden rounded-3xl border-2 border-cream/20 bg-cream/10 md:grid-cols-2">
            {[
              ["Dates", CAMP.humanDateRange],
              ["Days", CAMP.humanDays],
              ["Time", CAMP.humanTime],
              ["Cost", "Completely free ($0)"],
              ["Skill range", "5th grade math → Geometry (recommended)"],
              ["Location", fullAddress()],
            ].map(([k, v]) => (
              <div key={k} className="bg-ink p-6 md:p-8">
                <dt className="font-mono text-xs tracking-widest text-cream/50">{k}</dt>
                <dd className="mt-2 font-display text-xl font-bold leading-tight md:text-2xl">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-3xl px-6 py-20 md:py-24">
          <h2 className="font-display text-4xl font-black md:text-5xl">
            Why a Naperville summer math camp?
          </h2>
          <div className="mt-8 space-y-5 text-lg text-ink/80">
            <p>
              Most math summer programs cost hundreds of dollars per week. We
              wanted Naperville families to have a serious applied-math option
              that's genuinely accessible — so we made <Wordmark /> completely free.
            </p>
            <p>
              Sessions are hosted at Neuqua Valley High School. Drop your
              child off or sit quietly in the back of the room — parents are
              welcome.
            </p>
            <p>
              The curriculum is hands-on: graphing real-world data, probability
              with dice and cards, geometry through architecture, and a final
              showcase project that families are invited to attend.
            </p>
          </div>
          <Link
            to="/curriculum"
            className="mt-10 inline-flex min-h-11 items-center rounded-full border-2 border-ink bg-cream px-6 py-3 font-semibold text-ink transition hover:bg-ink hover:text-cream"
          >
            Read the full curriculum →
          </Link>
        </div>
      </section>

      <section className="bg-coral">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center md:py-24">
          <h2 className="font-display text-5xl font-black leading-[0.9] text-cream md:text-6xl">
            Ready to sign up your student?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-cream/85">
            Drop your email and we'll send schedule and library details as June
            gets closer. No commitment.
          </p>
          <Link
            to="/register"
            className="mt-10 inline-flex min-h-11 items-center rounded-full bg-ink px-8 py-4 font-semibold text-cream transition hover:bg-electric"
          >
            I'm interested →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
