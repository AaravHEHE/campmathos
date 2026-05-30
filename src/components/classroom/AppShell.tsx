import { Link } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { Wordmark } from "@/components/Wordmark";

export function AppShell({
  children,
  role,
  title,
  displayName,
  onSignOut,
}: {
  children: ReactNode;
  role: "student" | "teacher" | "admin";
  title?: string;
  displayName?: string | null;
  onSignOut: () => void;
}) {
  const isTeacher = role === "teacher" || role === "admin";
  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="border-b-2 border-ink bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="font-display text-2xl font-black">
            <Wordmark />
          </Link>
          <nav className="hidden items-center gap-4 font-mono text-sm md:flex">
            {isTeacher ? (
              <>
                <Link to="/teacher" className="hover:underline">
                  Teach
                </Link>
                <Link to="/app" className="hover:underline">
                  Student view
                </Link>
              </>
            ) : (
              <>
                <Link to="/app" className="hover:underline">
                  Dashboard
                </Link>
                <Link to="/app/join" className="hover:underline">
                  Join class
                </Link>
              </>
            )}
            {role === "admin" && (
              <Link to="/admin" className="hover:underline">
                Admin
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {displayName && (
              <span className="hidden font-mono text-xs text-ink/70 sm:inline">
                {displayName}
              </span>
            )}
            <button
              onClick={onSignOut}
              className="rounded-full border-2 border-ink bg-cream px-4 py-1.5 font-mono text-xs hover:bg-ink hover:text-cream"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        {title && (
          <h1 className="mb-8 font-display text-4xl font-black md:text-5xl">
            {title}
          </h1>
        )}
        {children}
      </main>
    </div>
  );
}

export function StatusPill({
  status,
}: {
  status: "not_started" | "in_progress" | "submitted" | "graded";
}) {
  const map: Record<typeof status, { label: string; cls: string }> = {
    not_started: { label: "Not started", cls: "bg-cream border-ink/40 text-ink/60" },
    in_progress: { label: "In progress", cls: "bg-sun border-ink text-ink" },
    submitted: { label: "Submitted", cls: "bg-electric border-ink text-cream" },
    graded: { label: "Graded", cls: "bg-coral border-ink text-cream" },
  };
  const v = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border-2 px-3 py-0.5 font-mono text-[11px] uppercase tracking-wider ${v.cls}`}
    >
      {v.label}
    </span>
  );
}
