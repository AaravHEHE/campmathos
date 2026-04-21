import { useEffect, useState } from "react";
import { CAMP } from "@/lib/camp";

/**
 * Live countdown to the camp's first session (CAMP.startDateISO at session start time).
 * Avoids hydration mismatch by only computing on the client (after mount).
 */
export function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Camp first session, America/Chicago (CDT = UTC-5 in June)
  const target = new Date(
    `${CAMP.startDateISO}T${CAMP.sessionStartTime}:00-05:00`
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
        {ended ? "Camp is in session" : "Countdown to camp (approx.)"}
      </p>
      <dl className="mt-3 flex items-start justify-center gap-2 md:gap-3">
        <span
          aria-hidden="true"
          className={`font-display text-3xl font-black leading-none md:text-4xl ${
            now === null ? "text-ink/30" : "text-ink/70"
          }`}
        >
          ~
        </span>
        <div className="grid flex-1 grid-cols-4 gap-3 md:gap-4">
          <Unit label="days" value={days} dim={now === null} />
          <Unit label="hrs" value={hours} dim={now === null} />
          <Unit label="min" value={minutes} dim={now === null} />
          <Unit label="sec" value={seconds} dim={now === null} />
        </div>
      </dl>
      <p className="mt-3 font-mono text-[11px] tracking-widest text-ink/60">
        First session opens
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
