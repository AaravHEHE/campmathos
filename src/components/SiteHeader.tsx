import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink/80 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-black tracking-tight">Mathos</span>
          <span className="font-mono text-xs text-muted-foreground">v.2026</span>
        </Link>
        <nav className="hidden items-center gap-7 font-mono text-sm md:flex">
          <Link
            to="/about"
            className="hover:text-electric"
            activeProps={{ className: "text-electric" }}
          >
            About
          </Link>
          <Link
            to="/curriculum"
            className="hover:text-electric"
            activeProps={{ className: "text-electric" }}
          >
            Curriculum
          </Link>
          <Link
            to="/details"
            className="hover:text-electric"
            activeProps={{ className: "text-electric" }}
          >
            Details
          </Link>
          <Link
            to="/board"
            className="hover:text-electric"
            activeProps={{ className: "text-electric" }}
          >
            Board
          </Link>
          <Link
            to="/faq"
            className="hover:text-electric"
            activeProps={{ className: "text-electric" }}
          >
            FAQ
          </Link>
        </nav>
        <Link
          to="/register"
          className="rounded-full border-2 border-ink bg-ink px-5 py-2 text-sm font-semibold text-cream transition hover:bg-electric hover:border-electric"
        >
          Register →
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-ink bg-cream">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row md:items-center">
        <div className="font-display text-2xl font-black">
          Mathos<span className="text-coral">.</span>
        </div>
        <div className="flex flex-wrap items-center gap-6 font-mono text-xs">
          <Link to="/about" className="hover:text-electric">
            About
          </Link>
          <Link to="/curriculum" className="hover:text-electric">
            Curriculum
          </Link>
          <Link to="/details" className="hover:text-electric">
            Details
          </Link>
          <Link to="/board" className="hover:text-electric">
            Board
          </Link>
          <Link to="/faq" className="hover:text-electric">
            FAQ
          </Link>
          <Link to="/register" className="hover:text-electric">
            Register
          </Link>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          © 2026 Mathos · Naperville, IL · Mathos@gmail.com
        </p>
      </div>
    </footer>
  );
}
