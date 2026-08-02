import type { PollResult } from "@/data/camp-years";

interface PollIndicatorProps {
  poll: PollResult;
  /** Label for the low end of the scale (e.g. "Very easy"). */
  lowLabel?: string;
  /** Label for the high end of the scale (e.g. "Very difficult"). */
  highLabel?: string;
}

/**
 * Numeric + visual 1-5 indicator for a Likert poll result. Deliberately
 * uses a single neutral fill color regardless of question — a high
 * "difficulty" score isn't a bad result, so no success/failure coding.
 */
export function PollIndicator({ poll, lowLabel = "Low", highLabel = "High" }: PollIndicatorProps) {
  const segments = Array.from({ length: poll.scale }, (_, i) => i + 1);
  const filled = Math.round(poll.average);
  const summary = `${poll.question}: average ${poll.average.toFixed(1)} out of ${poll.scale}, from ${poll.responseCount} response${poll.responseCount === 1 ? "" : "s"}.`;

  return (
    <div
      role="group"
      aria-label={summary}
      className="rounded-3xl border-2 border-ink bg-cream p-6"
    >
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{poll.question}</p>
      <p className="mt-3 font-display text-4xl font-black">
        {poll.average.toFixed(1)}
        <span className="ml-1 text-xl font-bold text-ink/40">/ {poll.scale}</span>
      </p>

      <div className="mt-4 flex gap-1.5" aria-hidden="true">
        {segments.map((n) => (
          <span
            key={n}
            className={`h-3 flex-1 rounded-full border-2 border-ink ${n <= filled ? "bg-ink" : "bg-cream"}`}
          />
        ))}
      </div>
      <div
        className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
        aria-hidden="true"
      >
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>

      <p className="mt-3 font-mono text-xs text-ink/50">
        {poll.responseCount} response{poll.responseCount === 1 ? "" : "s"}
      </p>
    </div>
  );
}
