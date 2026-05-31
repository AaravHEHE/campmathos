import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { colorizeMathOs } from "@/components/Wordmark";
import { canonical, ogImage } from "@/lib/seo";
import { Reveal } from "@/components/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const OG = ogImage("/og-faq.jpg");

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  head: () => ({
    meta: [
      { title: "FAQ — MathOs summer camp" },
      {
        name: "description",
        content:
          "Answers to the most common questions about MathOs: cost, schedule, joining online, materials, prerequisites, and how to register.",
      },
      { property: "og:title", content: "FAQ — MathOs summer camp" },
      {
        property: "og:description",
        content:
          "Cost, schedule, joining online, materials, prerequisites, and how to register.",
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
    a: "Sign up using your email through the registration page and filling out a short google form. Before each session we'll email you the Zoom link and a short reminder.",
  },
  {
    id: "free",
    q: "Is the camp really free? Are there any fees or materials we have to pay for?",
    a: "MathOs is completely free. We recommend students have a pencil and scratch paper on the side, but nothing else is required.",
  },
  {
    id: "schedule",
    q: "What days and times does the camp meet?",
    a: "The camp runs on Tuesday and Thursday from July 7 through July 30, 2026, live online over Zoom. Each session is two hours, 3–5 PM Central, with a short break in the middle.",
  },
  {
    id: "attendance",
    q: "Is there an attendance policy? What if my child misses a class?",
    a: "There's no strict attendance policy. After each lesson, notes and slideshows are emailed home so families can catch up if a session is missed. Be aware that missing a class can put a camper a little behind, but our instructors are always there to help your child get right back on track.",
  },
  {
    id: "joining",
    q: "How does my child join each session?",
    a: "We email the Zoom link to every registered family before each session. Click the link a few minutes early — cameras are encouraged but not required, and mics can stay muted until it's time to share. Parents are welcome to sit in alongside their child.",
  },
  {
    id: "snacks",
    q: "Are there snacks or breaks?",
    a: "Each session includes a short break (about 15 minutes). Campers can grab a snack or a drink and step away from the screen.",
  },
  {
    id: "bring",
    q: "What should my child bring?",
    a: "A pencil and a notebook are recommended. A calculator can be helpful but isn't required — instructors will assist whenever it's needed.",
  },
  {
    id: "ratio",
    q: "How many kids will be in a class? What's the student-to-instructor ratio?",
    a: "Class size and the number of instructors both depend on how many students sign up for the season — we scale to the group.",
  },
  {
    id: "grades",
    q: "What if my child is just outside the recommended skill range?",
    a: "The 4th-grade-math-to-7th-grade-math range is a recommendation, not a hard rule. If you'd still like your child to attend, please reach out and they can be admitted on a special-request basis.",
  },
  {
    id: "showcase",
    q: "When is the showcase, and can families come?",
    a: "Showcase day is the final Thursday of camp. Campers will present their final projects, and parents are strongly encouraged to attend.",
  },
  {
    id: "contact",
    q: "What's the best way to reach the Camp Directors?",
    a: "Email us at campmathos@gmail.com — that's the fastest way to reach the Camp Directors with any question.",
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
  const [openId, setOpenId] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const openFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) {
        setOpenId("");
        return;
      }
      const el = containerRef.current?.querySelector<HTMLElement>(
        `[data-faq-id="${CSS.escape(hash)}"]`,
      );
      if (!el) return;
      setOpenId(hash);
      const t1 = window.setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      const t2 = window.setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 700);
      const t3 = window.setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 1400);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        window.clearTimeout(t3);
      };
    };

    const cleanupRef = { current: undefined as undefined | (() => void) };
    cleanupRef.current = openFromHash();
    const handler = () => {
      cleanupRef.current?.();
      cleanupRef.current = openFromHash();
    };
    window.addEventListener("hashchange", handler);
    return () => {
      window.removeEventListener("hashchange", handler);
      cleanupRef.current?.();
    };
  }, []);

  const handleValueChange = (value: string) => {
    setOpenId(value);
    if (value) {
      window.history.replaceState(null, "", `#${value}`);
    } else {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

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
            and a Camp Director will get back to you.
          </p>
        </div>
      </section>

      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
          <Accordion
            type="single"
            collapsible
            value={openId}
            onValueChange={handleValueChange}
          >
            <div ref={containerRef} className="divide-y-2 divide-ink/15">
              {faqs.map((f, i) => (
                <Reveal key={f.id} delay={(i % 4) * 0.12} amount={0.4}>
                  <AccordionItem
                    value={f.id}
                    data-faq-id={f.id}
                    className="border-none scroll-mt-28"
                  >
                    <AccordionTrigger className="py-6 hover:no-underline [&>svg]:hidden">
                      <span className="flex w-full items-center justify-between gap-6">
                        <span className="text-left font-display text-2xl font-bold md:text-3xl">
                          {f.q}
                        </span>
                        <span
                          className={`font-display text-3xl font-black text-electric transition-transform duration-300 ${openId === f.id ? "rotate-45" : ""}`}
                        >
                          +
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <p className="max-w-3xl text-ink/70">{colorizeMathOs(f.a)}</p>
                    </AccordionContent>
                  </AccordionItem>
                </Reveal>
              ))}
            </div>
          </Accordion>
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
