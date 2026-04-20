import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { canonical, ogImage } from "@/lib/seo";

const OG = ogImage("/og-faq.jpg");

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  head: () => ({
    meta: [
      { title: "FAQ — MathOs summer camp" },
      {
        name: "description",
        content:
          "Answers to the most common questions about MathOs: cost, schedule, attendance, drop-off, materials, prerequisites, the PythOs sister CS camp, and how to register.",
      },
      { property: "og:title", content: "FAQ — MathOs summer camp" },
      {
        property: "og:description",
        content:
          "Cost, schedule, attendance, drop-off, materials, prerequisites, PythOs, and how to register.",
      },
      { property: "og:image", content: OG },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG },
    ],
    links: [canonical("/faq")],
  }),
});

const faqs: { id: string; q: string; a: string }[] = [
  {
    id: "register",
    q: "How do we register?",
    a: "Sign up using your email through the registration page, and then just show up to Naperville Public Library using the details we share with you after you register.",
  },
  {
    id: "free",
    q: "Is the camp really free? Are there any fees or materials we have to pay for?",
    a: "MathOs is completely free. We recommend students bring a pencil and scratch paper, but if you don't have those, materials will be provided.",
  },
  {
    id: "schedule",
    q: "What days and times does the camp meet?",
    a: "The camp runs on Monday, Wednesday, and Friday throughout June 2026 at Naperville Public Library.",
  },
  {
    id: "attendance",
    q: "Is there an attendance policy? What if my child misses a class?",
    a: "There's no strict attendance policy. After each lesson, notes and slideshows are emailed home so families can catch up if a session is missed. Be aware that missing a class can put a camper a little behind, but our instructors are always there to help your child get right back on track.",
  },
  {
    id: "dropoff",
    q: "Do parents drop off, sign in, or stay for the session?",
    a: "Parents will sign their child in at the start of each lesson and sign them out at the end. You're welcome to stay for the session if you'd like — we just ask that you not be disruptive to the class. If you have any questions, instructors will be happy to answer them before or after class.",
  },
  {
    id: "snacks",
    q: "Are there snacks or breaks?",
    a: "Each session includes a 15-minute break. Campers are encouraged to bring a snack or a drink if they need one. Food will not be provided.",
  },
  {
    id: "bring",
    q: "What should my child bring?",
    a: "A pencil and a notebook are recommended. A calculator can be helpful but isn't required — instructors will assist whenever it's needed. For our July sister CS camp PythOs, a computer is required.",
  },
  {
    id: "ratio",
    q: "How many kids will be in a class? What's the student-to-instructor ratio?",
    a: "Class size and the number of instructors both depend on how many students sign up for the season — we scale to the group.",
  },
  {
    id: "grades",
    q: "What if my child is just outside the 4th–7th grade range?",
    a: "Grades 4–7 is a recommendation, not a hard rule. If you'd still like your child to attend, please reach out and they can be admitted on a special-request basis.",
  },
  {
    id: "pythos",
    q: "Are there any prerequisites for PythOs (the July CS camp)?",
    a: "There are no prerequisites — beginners are welcome. PythOs runs in July with two age tracks: grades 1–4 use Scratch on Mondays and Thursdays, and grades 5–8 use Python with a custom Turtle library on Tuesdays and Fridays. The only requirement is bringing a computer.",
  },
  {
    id: "showcase",
    q: "When is the showcase, and can families come?",
    a: "Showcase day is the Friday of week 4. Campers will present their final projects, and parents are strongly encouraged to attend.",
  },
  {
    id: "contact",
    q: "What's the best way to reach the directors?",
    a: "Email us at campmathos@gmail.com — that's the fastest way to reach the directors with any question.",
  },
  {
    id: "waitlist",
    q: "What if a session fills up — is there a waitlist?",
    a: "Sessions aren't expected to fill up. We have a flexible number of spots, so we can usually accommodate everyone who wants to attend.",
  },
  {
    id: "accommodations",
    q: "Do you offer accommodations for students with learning differences?",
    a: "Yes — please reach out for specific students. Email campmathos@gmail.com so we can make sure your child has a great experience.",
  },
  {
    id: "extra-help",
    q: "Can my child get extra help outside of class?",
    a: "Yes. Every MathOs teacher is willing to meet one-on-one with any camper who needs extra help — whether that's a tricky topic from camp, homework from school, or something else they want to understand. Just ask, or email campmathos@gmail.com.",
  },
];

function FaqPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const openFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;
      const el = containerRef.current?.querySelector<HTMLDetailsElement>(
        `details[id="${CSS.escape(hash)}"]`,
      );
      if (el) {
        el.open = true;
        // Defer scroll so layout settles after opening
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    };

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />

      <section className="grid-paper border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <p className="font-mono text-sm tracking-widest text-muted-foreground">
            FAQ
          </p>
          <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-7xl">
            Good <span className="italic text-electric">questions</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/75">
            If you don't see your question below, email us at{" "}
            <a href="mailto:campmathos@gmail.com" className="underline hover:text-electric">
              campmathos@gmail.com
            </a>{" "}
            and a director will get back to you.
          </p>
        </div>
      </section>

      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
          <div ref={containerRef} className="divide-y-2 divide-ink/15">
            {faqs.map((f) => (
              <details
                key={f.id}
                id={f.id}
                className="group py-6 scroll-mt-28"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                  <span className="font-display text-2xl font-bold md:text-3xl">{f.q}</span>
                  <span className="font-display text-3xl font-black text-electric transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl text-ink/70">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-coral">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center md:py-28">
          <h2 className="mx-auto max-w-3xl font-display text-5xl font-black leading-[0.9] text-cream md:text-7xl">
            Still have a question?
          </h2>
          <a
            href="mailto:campmathos@gmail.com"
            className="mt-10 inline-flex rounded-full bg-ink px-8 py-4 font-semibold text-cream transition hover:bg-electric"
          >
            Email campmathos@gmail.com →
          </a>
          <div className="mt-6">
            <Link to="/register" className="font-mono text-sm text-cream/80 underline">
              Or jump to register →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
