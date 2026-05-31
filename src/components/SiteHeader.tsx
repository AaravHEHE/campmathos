import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Wordmark } from "@/components/Wordmark";

const navLinks = [
  { to: "/about", label: "About" },
  { to: "/curriculum", label: "Curriculum" },
  { to: "/details", label: "Details" },
  { to: "/board", label: "Camp Directors" },
  { to: "/faq", label: "FAQ" },
  { to: "/register", label: "Register" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  // Close menu when route changes / Escape pressed; prevent body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink/80 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
        <Link to="/" aria-label="MathOs home" className="flex items-center" onClick={() => setOpen(false)}>
          <span className="font-display text-3xl font-black leading-none tracking-tight md:text-4xl">
            <Wordmark />
          </span>
        </Link>

        <nav className="hidden items-center gap-7 font-mono text-sm md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-1 py-2 hover:text-electric"
              activeProps={{ className: "text-electric" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden items-center rounded-md px-2 py-2 font-mono text-sm hover:text-electric md:inline-flex"
          >
            Sign in
          </Link>
          <ThemeToggle className="hidden sm:inline-flex" />
          <Link
            to="/register"
            className="hidden min-h-11 items-center rounded-full border-2 border-ink bg-ink px-5 py-2 text-sm font-semibold text-cream transition hover:bg-electric hover:border-electric md:inline-flex"
          >
            I'm interested →
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-cream text-ink transition hover:bg-ink hover:text-cream md:hidden"
          >
            {open ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-[60px] z-30 bg-ink/40 backdrop-blur-sm md:hidden"
          />
          <div id="mobile-nav" className="fixed inset-x-0 top-[60px] z-40 border-b-2 border-ink bg-cream md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 font-mono text-base">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-xl px-4 py-3 hover:bg-ink hover:text-cream"
                  activeProps={{ className: "text-electric" }}
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-3 flex items-center gap-3 border-t-2 border-ink/15 px-2 pt-4">
                <ThemeToggle />
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center justify-center rounded-full border-2 border-ink bg-cream px-5 py-3 font-semibold text-ink"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 flex-1 items-center justify-center rounded-full border-2 border-ink bg-coral px-5 py-3 font-semibold text-cream"
                >
                  I'm interested →
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-ink bg-cream">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row md:items-center">
        <div className="font-display text-2xl font-black">
          <span className="text-electric">Math</span><span className="text-coral">Os.</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-xs">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className="inline-flex min-h-11 items-center hover:text-electric">
              {l.label}
            </Link>
          ))}
          <Link to="/register" className="inline-flex min-h-11 items-center hover:text-electric">
            Interest form
          </Link>
          <Link to="/login" className="inline-flex min-h-11 items-center hover:text-electric">
            Student sign in
          </Link>
          <Link to="/admin/login" className="text-cream/0 hover:text-ink/40" aria-label="Admin" tabIndex={-1}>
            Admin
          </Link>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          2026 MathOs · Online camp ·{" "}
          <u>
            <a href="mailto:campmathos@gmail.com">campmathos@gmail.com</a>
          </u>
        </p>

      </div>
    </footer>
  );
}
