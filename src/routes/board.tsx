import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { canonical, ogImage } from "@/lib/seo";
import { Reveal } from "@/components/Reveal";

const OG = ogImage("/og-board.jpg");

export const Route = createFileRoute("/board")({
  component: BoardPage,
  head: () => ({
    meta: [
      { title: "Board of camp directors — MathOs" },
      {
        name: "description",
        content:
          "Meet the MathOs board of camp directors — the Neuqua Valley students leading our free summer applied math camp in Naperville.",
      },
      { property: "og:title", content: "Board of camp directors — MathOs" },
      {
        property: "og:description",
        content:
          "Meet the five camp directors behind MathOs, a free summer applied math camp at Naperville Public Library.",
      },
      { property: "og:image", content: OG },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG },
    ],
    links: [canonical("/board")],
  }),
});

type Director = {
  name: string;
  bio: string;
  accent: string;
};

const directors: Director[] = [
  {
    name: "Aarav Arora",
    bio: "Neuqua Valley Class of 2029. Neuqua Robotics' first-ever sophomore Executive Board Member and a founding member of NeighbrHub. Ecybermission State Finalist",
    accent: "bg-electric text-cream",
  },
  {
    name: "Alan Zhan",
    bio: "Neuqua Valley Class of 2029. Member of NVHS Computing Team, Chess Team, and Math Team — qualified for State in both Chess and Math.",
    accent: "bg-sun text-ink",
  },
  {
    name: "Shaury Sharma",
    bio: "Neuqua Valley Class of 2029. Member of NVHS Robotics Team, IJAS State Qualifier, and NVHS Science Olympiad State Qualifier.",
    accent: "bg-coral text-cream",
  },
  {
    name: "Wenxuan Chen",
    bio: "Neuqua Valley Class of 2029. Math Team State Qualifier and member of IMSA / NVHS Robotics.",
    accent: "bg-electric text-cream",
  },
  {
    name: "Yifan Bao",
    bio: "Neuqua Valley Class of 2029. Math Team State Qualifier and Science Olympiad State Qualifier.",
    accent: "bg-coral text-cream",
  },
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
          <p className="font-mono text-sm tracking-widest text-muted-foreground">
            Board of camp directors
          </p>
          <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-7xl">
            The students <span className="italic text-electric">behind</span> MathOs.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/75">
            MathOs is built and taught by five Neuqua Valley High School students who believe math
            should feel useful, not abstract. We design every session, mentor every camper, and
            run every workshop ourselves.
          </p>
        </div>
      </section>

      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {directors.map((d, i) => (
              <Reveal key={d.name} delay={(i % 3) * 0.2} amount={0.25}>
                <article className="group flex flex-col rounded-3xl border-2 border-ink bg-cream p-8 transition hover:-translate-y-1 hover:shadow-[8px_8px_0_0_var(--ink)]">
                  {/* Photo placeholder */}
                  <div
                    className={`relative flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-ink ${d.accent}`}
                  >
                    <span className="font-display text-5xl font-black">{initials(d.name)}</span>
                    <span className="absolute bottom-2 right-3 font-mono text-[10px] tracking-widest opacity-70">
                      Photo soon
                    </span>
                  </div>
                  <h2 className="mt-6 font-display text-2xl font-black leading-tight">{d.name}</h2>
                  <p className="mt-4 text-sm text-ink/70">{d.bio}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal direction="scale" amount={0.2}>
            <div className="mt-16 rounded-3xl border-2 border-ink bg-ink p-10 text-cream md:p-14">
              <p className="font-mono text-sm tracking-widest text-cream/60">
                Extra help
              </p>
              <h2 className="mt-3 font-display text-4xl font-black md:text-5xl">
                We meet kids where they are.
              </h2>
              <p className="mt-5 max-w-2xl text-cream/80">
                Every director is happy to meet one-on-one with any camper who needs a little extra
                help — whether that's reviewing a concept, working through homework from school, or
                just talking through an idea. Just ask during a session, or email{" "}
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
