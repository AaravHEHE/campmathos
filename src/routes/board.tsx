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

type Director = {
  name: string;
  role: string;
  bio: string;
  accent: string;
};

const directors: Director[] = [
  {
    name: "Aarav Arora",
    role: "Co-founder · Curriculum",
    bio: "Aarav leads Mathos curriculum design, building the week-by-week applied math lessons. He's drawn to the math behind engineering and how a clear graph can change someone's mind.",
    accent: "bg-electric text-cream",
  },
  {
    name: "Shaury Sharma",
    role: "Co-founder · Operations",
    bio: "Shaury runs day-to-day operations — scheduling, the library partnership, and family communication. He believes the best way to learn math is to need it for something you actually care about.",
    accent: "bg-coral text-cream",
  },
  {
    name: "Alan Zhan",
    role: "Director · Pythos lead",
    bio: "Alan leads the Pythos computer-science program and built much of the custom Python library campers use to make games. He's interested in the overlap between problem-solving and design.",
    accent: "bg-sun text-ink",
  },
  {
    name: "Ediz Gusey",
    role: "Director · Instruction",
    bio: "Ediz heads instructor training and makes sure every Mathos session is hands-on, not lecture-heavy. He's especially passionate about geometry and showing kids the math hidden in buildings.",
    accent: "bg-ink text-cream",
  },
  {
    name: "Yifan Bao",
    role: "Director · Materials",
    bio: "Yifan designs Mathos' guided notes, problem sets, and the extra-stretch material we send curious campers home with. She loves probability and the way it shows up in everyday decisions.",
    accent: "bg-coral text-cream",
  },
  {
    name: "Wenxuan Chen",
    role: "Director · Showcase &amp; outreach",
    bio: "Wenxuan organizes the final showcase day and handles community outreach across Naperville. He's most excited when a camper presents their own project to a room full of family and friends.",
    accent: "bg-electric text-cream",
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
          <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
            / board of directors
          </p>
          <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-7xl">
            The students <span className="italic text-electric">behind</span> Mathos.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/75">
            Mathos is built and taught by six Neuqua Valley High School students who believe math
            should feel useful, not abstract. We design every session, mentor every camper, and
            run every workshop ourselves. Bios below are a starting point — directors will
            personalize them soon.
          </p>
        </div>
      </section>

      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {directors.map((d) => (
              <article
                key={d.name}
                className="group flex flex-col rounded-3xl border-2 border-ink bg-cream p-8 transition hover:-translate-y-1 hover:shadow-[8px_8px_0_0_var(--ink)]"
              >
                {/* Photo placeholder */}
                <div
                  className={`relative flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-ink ${d.accent}`}
                >
                  <span className="font-display text-5xl font-black">{initials(d.name)}</span>
                  <span className="absolute bottom-2 right-3 font-mono text-[10px] uppercase tracking-widest opacity-70">
                    photo soon
                  </span>
                </div>
                <h2 className="mt-6 font-display text-2xl font-black leading-tight">{d.name}</h2>
                <p
                  className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: d.role }}
                />
                <p className="mt-4 text-sm text-ink/70">{d.bio}</p>
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
