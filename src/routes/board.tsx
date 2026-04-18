import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/board")({
  component: BoardPage,
  head: () => ({
    meta: [
      { title: "Board of directors — Mathos" },
      {
        name: "description",
        content:
          "Meet the Mathos board of directors — the Neuqua Valley students leading our free summer applied math camp in Naperville.",
      },
      { property: "og:title", content: "Board of directors — Mathos" },
      {
        property: "og:description",
        content:
          "Meet the six directors behind Mathos, a free summer applied math camp at Naperville Public Library.",
      },
    ],
  }),
});

const directors = [
  { name: "Aarav Arora", role: "Director" },
  { name: "Shaury Sharma", role: "Director" },
  { name: "Alan Zhan", role: "Director" },
  { name: "Ediz Gusey", role: "Director" },
  { name: "Yifan Bao", role: "Director" },
  { name: "Wenxuan Chen", role: "Director" },
];

const accents = [
  "bg-electric text-cream",
  "bg-coral text-cream",
  "bg-sun text-ink",
  "bg-ink text-cream",
  "bg-coral text-cream",
  "bg-electric text-cream",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function BoardPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />

      <section className="grid-paper border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
            / board of directors
          </p>
          <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-7xl">
            The students <span className="italic text-electric">behind</span> Mathos.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/75">
            Mathos is built and taught by six Neuqua Valley High School students who believe math
            should feel useful, not abstract. We design every session, mentor every camper, and
            run every workshop ourselves.
          </p>
        </div>
      </section>

      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {directors.map((d, i) => (
              <article
                key={d.name}
                className="group rounded-3xl border-2 border-ink bg-cream p-8 transition hover:-translate-y-1 hover:shadow-[8px_8px_0_0_var(--ink)]"
              >
                <div
                  className={`flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-ink font-display text-3xl font-black ${accents[i]}`}
                >
                  {initials(d.name)}
                </div>
                <h2 className="mt-6 font-display text-3xl font-black leading-tight">{d.name}</h2>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {d.role}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-16 rounded-3xl border-2 border-ink bg-ink p-10 text-cream md:p-14">
            <p className="font-mono text-sm uppercase tracking-widest text-cream/60">
              / extra help
            </p>
            <h2 className="mt-3 font-display text-4xl font-black md:text-5xl">
              We meet kids where they are.
            </h2>
            <p className="mt-5 max-w-2xl text-cream/80">
              Every director is happy to meet one-on-one with any camper who needs a little extra
              help — whether that's reviewing a concept, working through homework from school, or
              just talking through an idea. Just ask during a session, or email{" "}
              <a href="mailto:Mathos@gmail.com" className="underline">
                Mathos@gmail.com
              </a>{" "}
              and we'll set up a time.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
