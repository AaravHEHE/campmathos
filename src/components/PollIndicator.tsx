import type { PollResult } from "@/data/camp-years";

/** A single highlighted aggregate percentage — for when only one summary stat is available. */
function SummaryStat({ poll }: { poll: PollResult }) {
  const stat = poll.summaryStat!;
  const summary = `${poll.question}: ${stat.percent}% ${stat.description}.`;
  return (
    <div role="group" aria-label={summary} className="card-3d bg-cream p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{poll.question}</p>
      <p className="mt-3 font-display text-5xl font-black">{stat.percent}%</p>
      <p className="mt-3 text-sm text-ink/70">{stat.description}</p>
    </div>
  );
}

/** Percentage-per-bucket bars — for real bucketed survey results (no invented average). */
function BucketBars({ poll }: { poll: PollResult }) {
  const buckets = poll.buckets!;
  const summary = `${poll.question}: ${buckets.map((b) => `${b.label} ${b.percent}%`).join(", ")}.`;
  return (
    <div role="group" aria-label={summary} className="card-3d bg-cream p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{poll.question}</p>
      <div className="mt-4 space-y-3" aria-hidden="true">
        {buckets.map((b) => (
          <div key={b.label}>
            <div className="flex items-baseline justify-between gap-3 font-mono text-xs">
              <span className="text-ink/70">{b.label}</span>
              <span className="font-bold text-ink">{b.percent}%</span>
            </div>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full border border-ink/30 bg-ink/10">
              <div className="h-full bg-primary" style={{ width: `${b.percent}%` }} />
            </div>

          </div>
        ))}
      </div>
      {poll.note && <p className="mt-4 font-mono text-xs text-ink/50">{poll.note}</p>}
    </div>
  );
}

/** Numeric average + 1-5 segmented bar — for years with a clean computed average. */
function AverageBar({ poll }: { poll: PollResult }) {
  const segments = Array.from({ length: poll.scale }, (_, i) => i + 1);
  const filled = Math.round(poll.average!);
  const summary = `${poll.question}: average ${poll.average!.toFixed(1)} out of ${poll.scale}${
    poll.responseCount ? `, from ${poll.responseCount} responses` : ""
  }.`;
  return (
    <div role="group" aria-label={summary} className="card-3d bg-cream p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{poll.question}</p>
      <p className="mt-3 font-display text-4xl font-black">
        {poll.average!.toFixed(1)}
        <span className="ml-1 text-xl font-bold text-ink/40">/ {poll.scale}</span>
      </p>
      <div className="mt-4 flex gap-1.5" aria-hidden="true">
        {segments.map((n) => (
          <span
            key={n}
            className={`h-3 flex-1 rounded-full border-2 border-ink/40 ${n <= filled ? "bg-primary" : "bg-ink/10"}`}
          />
        ))}
      </div>
      {poll.responseCount != null && (
        <p className="mt-3 font-mono text-xs text-ink/50">
          {poll.responseCount} response{poll.responseCount === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}

/**
 * Renders whichever real data shape a poll actually has — a single summary
 * stat, a bucketed percentage breakdown, or a clean numeric average. Never
 * fabricates a number a shape doesn't have.
 */
export function PollIndicator({ poll }: { poll: PollResult }) {
  if (poll.summaryStat) return <SummaryStat poll={poll} />;
  if (poll.buckets && poll.buckets.length > 0) return <BucketBars poll={poll} />;
  if (poll.average != null) return <AverageBar poll={poll} />;
  return null;
}
