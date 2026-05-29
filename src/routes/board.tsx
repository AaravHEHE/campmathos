import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Wordmark } from "@/components/Wordmark";
import { canonical, ogImage } from "@/lib/seo";
import { Reveal } from "@/components/Reveal";
import aaravPhoto from "@/assets/directors/aarav-arora.jpg";
import yifanPhoto from "@/assets/directors/yifan-bao.jpg";
import alanPhoto from "@/assets/directors/alan-zhan.jpg";

const OG = ogImage("/og-board.jpg");

export const Route = createFileRoute("/board")({
  component: BoardPage,
  head: () => ({
    meta: [
      { title: "Camp Directors — MathOs" },
      {
        name: "description",
        content:
          "Meet the MathOs Camp Directors — the high school students leading our free online summer applied math camp.",
      },
      { property: "og:title", content: "Camp Directors — MathOs" },
      {
        property: "og:description",
        content:
          "Meet the six Camp Directors behind MathOs, a free online summer applied math camp.",
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
  photo?: string;
};

const directors: Director[] = [
  {
    name: "Aarav Arora",
    bio: "NVHS Class of 2029. NVHS Robotics' first-ever sophomore Executive Board Member and a co-creator of NeighbrHub. eCYBERMISSION State Finalist and honorable mention.",
    accent: "bg-electric text-cream",
    photo: aaravPhoto,
  },
  {
    name: "Alan Zhan",
    bio: "NVHS Class of 2029. Member of NVHS Computing Team, Chess Team, and Math Team. #1 Neuqua Freshman in State Math, Highest record at state Chess.",
    accent: "bg-sun text-cream",
    photo: alanPhoto,
  },
  {
    name: "Shaury Sharma",
    bio: "NVHS Class of 2029. Member of NVHS Robotics Team, IJAS State Qualifier, NVHS Science Olympiad State Qualifier, and eCYBERMISSION State Finalist and honorable mention.",
    accent: "bg-coral text-cream",
  },
  {
    name: "Wenxuan Chen",
    bio: "NVHS Class of 2029. Math Team State Qualifier and member of IMSA / NVHS Robotics. AMC 8 Honor Roll",
    accent: "bg-electric text-cream",
  },
  {
    name: "Yifan Bao",
    bio: "NVHS Class of 2029. Math Team State Qualifier and Science Olympiad State Qualifier.",
    accent: "bg-coral text-cream",
    photo: yifanPhoto,
  },
  {
    name: "Atharv Mishra",
    bio: "NVHS Class of 2029. Member of NVHS Robotics, Speech, and Youth & Government teams, and eCYBERMISSION Finalist.",
    accent: "bg-sun text-cream",
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
          <p className="font-mono text-sm tracking-widest text-muted-foreground">Camp Directors</p>
          <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-7xl">
            The students <span className="italic text-electric">behind</span> <Wordmark />.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/75">
            <Wordmark /> is built and taught by six high school students who believe math should feel useful,
            not abstract. We design every session, mentor every camper, and run every workshop ourselves.
          </p>
        </div>
      </section>

      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {directors.map((d, i) => (
              <Reveal key={d.name} delay={(i % 3) * 0.2} amount={0.25}>
                <article className="group flex flex-col rounded-3xl border-2 border-ink bg-cream p-8 transition hover:-translate-y-1 hover:shadow-[8px_8px_0_0_var(--ink)]">
                  {/* Photo */}
                  <div
                    className={`relative flex h-56 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-ink ${d.accent}`}
                  >
                    {d.photo ? (
                      <img
                        src={d.photo}
                        alt={`${d.name}, Camp Director`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <>
                        <span className="font-display text-5xl font-black">{initials(d.name)}</span>
                        <span className="absolute bottom-2 right-3 font-mono text-[10px] tracking-widest opacity-70">
                          Photo soon
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="mt-6 font-display text-2xl font-black leading-tight">{d.name}</h2>
                  <p className="mt-4 text-sm text-ink/70">{d.bio}</p>
                </article>
              </Reveal>
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
