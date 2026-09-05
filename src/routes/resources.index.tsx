import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { ResourceCard } from "@/components/ResourceCard";
import { listPublicResources, type PublicResource } from "@/lib/resources.functions";
import {
  CURRICULUM_WEEKS,
  RESOURCE_CATEGORIES,
  SCHOOL_LEVELS,
  levelLabel,
  weekLabel,
  type SchoolLevel,
} from "@/data/resource-taxonomy";

export const Route = createFileRoute("/resources/")({
  loader: async () => await listPublicResources(),
  component: ResourcesPage,
  errorComponent: () => (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="font-display text-4xl font-black">Resources are unavailable</h1>
        <p className="mt-4 text-ink/70">
          Something went wrong loading the materials. Please refresh and try again.
        </p>
      </div>
      <SiteFooter />
    </main>
  ),
  head: () => ({
    meta: [
      { title: "Camper resources — MathOs" },
      {
        name: "description",
        content: "Optional notes, slideshows and games for MathOs campers.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Camper resources — MathOs" },
      {
        property: "og:description",
        content: "Optional notes, slideshows and games for MathOs campers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ResourcesPage() {
  const { rows } = Route.useLoaderData();
  const [level, setLevel] = useState<SchoolLevel | null>(null);
  const [week, setWeek] = useState<number | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, PublicResource[]>();
    if (!level || !week) return map;
    for (const c of RESOURCE_CATEGORIES) map.set(c.value, []);
    for (const r of rows) {
      if (r.school_level !== level || r.week_number !== week) continue;
      map.get(r.resource_type)?.push(r);
    }
    return map;
  }, [rows, level, week]);

  const countFor = (lvl: string, wk: number) =>
    rows.filter((r) => r.school_level === lvl && r.week_number === wk).length;

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />

      <section className="grid-paper border-b-2 border-ink">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
            Camper materials
          </p>
          <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-7xl">
            Resources<span className="italic text-electric">.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/75">
            Optional materials and activities for Camp MathOs students.
          </p>

          {/* Breadcrumb / step trail */}
          {level ? (
            <div className="mt-8 flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-widest">
              <button
                type="button"
                onClick={() => {
                  setLevel(null);
                  setWeek(null);
                }}
                className="rounded-full border-2 border-ink px-3 py-1 transition hover:bg-ink hover:text-cream"
              >
                ← All levels
              </button>
              <span className="text-ink/40">/</span>
              <span className="text-electric">{levelLabel(level)}</span>
              {week ? (
                <>
                  <span className="text-ink/40">/</span>
                  <button
                    type="button"
                    onClick={() => setWeek(null)}
                    className="rounded-full border-2 border-ink px-3 py-1 transition hover:bg-ink hover:text-cream"
                  >
                    {weekLabel(week)} ✕
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14 md:py-20">
        {/* Step 1 — school level */}
        {!level ? (
          <div className="grid gap-6 md:grid-cols-2">
            {SCHOOL_LEVELS.map((l, i) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setLevel(l.value)}
                className={`card-3d p-10 text-left transition hover:-translate-y-0.5 ${
                  i === 0 ? "bg-electric text-cream" : "bg-coral text-cream"
                }`}
              >
                <p className="font-mono text-xs uppercase tracking-widest opacity-80">
                  Choose your level
                </p>
                <h2 className="mt-3 font-display text-4xl font-black">{l.label}</h2>
                <p className="mt-3 text-sm opacity-90">
                  Notes, slideshows and games from all four weeks.
                </p>
              </button>
            ))}
          </div>
        ) : null}

        {/* Step 2 — week */}
        {level && !week ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {CURRICULUM_WEEKS.map((w) => {
              const n = countFor(level, w.number);
              return (
                <button
                  key={w.number}
                  type="button"
                  onClick={() => setWeek(w.number)}
                  className="card-3d bg-cream p-7 text-left transition hover:-translate-y-0.5"
                >
                  <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
                    Week {String(w.number).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-black leading-tight">
                    {w.topic}
                  </h3>
                  <p className="mt-2 text-sm text-ink/60">{w.title}</p>
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-electric">
                    {n === 0 ? "No materials yet" : `${n} item${n === 1 ? "" : "s"}`}
                  </p>
                </button>
              );
            })}
          </div>
        ) : null}

        {/* Step 3 — categories */}
        {level && week ? (
          <div className="space-y-14">
            {RESOURCE_CATEGORIES.map((c) => {
              const items = grouped.get(c.value) ?? [];
              return (
                <div key={c.value}>
                  <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-3">
                    <h3 className="font-display text-3xl font-black">{c.label}</h3>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-ink/50">
                      {items.length} item{items.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  {items.length === 0 ? (
                    <p className="mt-6 rounded-2xl border-2 border-dashed border-ink/25 px-6 py-8 text-center font-mono text-sm text-ink/50">
                      No resources available yet.
                    </p>
                  ) : (
                    <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((r) => (
                        <ResourceCard key={r.id} resource={r} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </section>

      <SiteFooter />
    </main>
  );
}
