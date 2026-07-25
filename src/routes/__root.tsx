import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
  ScriptOnce,
} from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";

import appCss from "../styles.css?url";
import { PageTransition } from "@/components/PageTransition";

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800;9..144,900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap";

const themeBootstrap = `(function() {
  try {
    var stored = localStorage.getItem("mathos-theme");
    var prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = stored === "dark" || stored === "light"
      ? stored
      : (prefers ? "dark" : "light");
    if (theme === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();`;

function NotFoundComponent() {
  return (
    <div className="grid-paper flex min-h-screen items-center justify-center bg-cream px-6 py-16 text-ink">
      <div className="mx-auto max-w-2xl text-center">
        <div
          className="mx-auto mb-8 flex h-44 w-44 items-center justify-center rounded-full border-2 border-ink bg-sun shadow-[10px_10px_0_0_var(--ink)] md:h-56 md:w-56"
          aria-hidden="true"
        >
          <span className="font-display text-[6rem] font-black leading-none text-ink md:text-[8rem]">
            4<span className="text-coral">0</span>4
          </span>
        </div>
        <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
          Lost in the curriculum
        </p>
        <h1 className="mt-2 font-display text-5xl font-black md:text-6xl">
          We couldn't compute that page.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-lg text-ink/75">
          The link might be old, the page may have moved, or the URL has a typo.
          Let's get you back on track.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center rounded-full border-2 border-ink bg-coral px-6 py-3 font-semibold text-cream shadow-[6px_6px_0_0_var(--ink)] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--ink)]"
          >
            ← Back home
          </Link>
          <Link
            to="/curriculum"
            className="inline-flex min-h-11 items-center rounded-full border-2 border-ink bg-cream px-6 py-3 font-semibold text-ink transition hover:bg-ink hover:text-cream"
          >
            See the curriculum
          </Link>
          <Link
            to="/faq"
            className="inline-flex min-h-11 items-center rounded-full border-2 border-ink bg-cream px-6 py-3 font-semibold text-ink transition hover:bg-ink hover:text-cream"
          >
            Read FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MathOs — Free online summer applied math camp" },
      { name: "description", content: "Sign up for MathOs — a free online summer math camp taught live over Zoom by the math team." },
      { name: "author", content: "MathOs" },
      { name: "theme-color", content: "#f6f1e3" },
      { property: "og:title", content: "MathOs — Free online summer applied math camp" },
      { property: "og:description", content: "Sign up for MathOs — a free online summer math camp taught live over Zoom by the math team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "MathOs — Free online summer applied math camp" },
      { name: "twitter:description", content: "Sign up for MathOs — a free online summer math camp taught live over Zoom by the math team." },
      { name: "google-site-verification", content: "dXMpzAOy3Cvqx_18iVe_bCRF36D4mZ3P5D98mFRAVyI" },

    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preload", as: "style", href: FONTS_HREF },
      { rel: "stylesheet", href: FONTS_HREF },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ScriptOnce>{themeBootstrap}</ScriptOnce>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </AnimatePresence>
    </>
  );
}
