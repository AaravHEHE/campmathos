import { useEffect, useState } from "react";
import { CAMP } from "@/lib/camp";

/**
 * Returns the ISO date (YYYY-MM-DD) of the first Monday of June for the
 * upcoming camp year. If we're already past the first Monday of June this
 * year, rolls forward to next year.
 */
function firstMondayOfJuneISO(): string {
  const now = new Date();
  let year = now.getFullYear();
  const candidate = (y: number) => {
    const d = new Date(y, 5, 1); // June = month index 5
    const offset = (8 - d.getDay()) % 7; // 0=Sun, 1=Mon … shift to next Mon
    d.setDate(1 + offset);
    return d;
  };
  let target = candidate(year);
  if (target.getTime() < now.getTime()) target = candidate(++year);
  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, "0");
  const dd = String(target.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Live countdown to the first Monday of June (the camp's first session).
 * Avoids hydration mismatch by only computing on the client (after mount).
 */
export function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // First Monday of June, 1:00 PM America/Chicago (CDT = UTC-5 in June)
  const target = new Date(
    `${firstMondayOfJuneISO()}T${CAMP.sessionStartTime}:00-05:00`
  ).getTime();

  // Render placeholder shell during SSR / pre-mount
  const diffMs = now === null ? 0 : Math.max(0, target - now);
  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const ended = now !== null && diffMs === 0;

  return (
    <div
      className="rounded-3xl border-2 border-ink bg-cream/90 p-5 shadow-[6px_6px_0_0_var(--ink)] backdrop-blur md:p-6"
      role="timer"
      aria-live="polite"
      aria-label="Countdown to first MathOs session"
    >
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {ended ? "Camp is in session" : "Countdown to camp"}
      </p>
      <dl className="mt-3 grid grid-cols-4 gap-3 md:gap-4">
        <Unit label="days" value={days} dim={now === null} />
        <Unit label="hrs" value={hours} dim={now === null} />
        <Unit label="min" value={minutes} dim={now === null} />
        <Unit label="sec" value={seconds} dim={now === null} />
      </dl>
      <p className="mt-3 font-mono text-[11px] tracking-widest text-ink/60">
        First session · 1:00 PM
      </p>
    </div>
  );
}

function Unit({
  label,
  value,
  dim,
}: {
  label: string;
  value: number;
  dim: boolean;
}) {
  return (
    <div className="text-center">
      <dd
        className={`font-display text-3xl font-black leading-none tabular-nums md:text-4xl ${
          dim ? "text-ink/30" : "text-ink"
        }`}
      >
        {String(value).padStart(2, "0")}
      </dd>
      <dt className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink/60">
        {label}
      </dt>
    </div>
  );
}
