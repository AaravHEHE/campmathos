// Daily sign-ups line chart for the admin dashboard.
// Uses recharts (already in deps). Honors prefers-reduced-motion.
import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface Props {
  rows: { created_at: string }[];
  /** Number of days back from today to show (inclusive of today). */
  days?: number;
}

interface Point {
  date: string; // ISO date "YYYY-MM-DD"
  label: string; // short display
  count: number;
}

function startOfChicagoDay(d: Date): Date {
  // Use America/Chicago day boundaries via en-CA locale (sortable yyyy-mm-dd).
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  // Construct local Date — only used for label formatting, not arithmetic.
  return new Date(`${iso}T00:00:00`);
}

function isoDay(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function SignupsChart({ rows, days = 30 }: Props) {
  const data = useMemo<Point[]>(() => {
    const buckets = new Map<string, number>();
    const today = new Date();
    // Pre-fill last N days with 0 so the chart isn't sparse.
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      buckets.set(isoDay(d), 0);
    }
    for (const r of rows) {
      const key = isoDay(new Date(r.created_at));
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return Array.from(buckets.entries()).map(([date, count]) => {
      const d = startOfChicagoDay(new Date(`${date}T12:00:00Z`));
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return { date, label, count };
    });
  }, [rows, days]);

  const total = data.reduce((s, p) => s + p.count, 0);

  return (
    <div className="rounded-3xl border-2 border-ink bg-cream p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Sign-ups · last {days} days
          </p>
          <p className="mt-1 font-display text-2xl font-black">{total} total</p>
        </div>
      </div>
      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="oklch(0.18 0.04 280 / 0.08)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
              stroke="oklch(0.18 0.04 280 / 0.4)"
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
              stroke="oklch(0.18 0.04 280 / 0.4)"
              width={28}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(0.18 0.04 280)",
                color: "oklch(0.97 0.02 80)",
                border: "none",
                borderRadius: 12,
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 12,
              }}
              labelStyle={{ color: "oklch(0.97 0.02 80)" }}
              formatter={(v: number) => [`${v} sign-up${v === 1 ? "" : "s"}`, ""]}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="oklch(0.62 0.22 250)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "oklch(0.62 0.22 250)" }}
              activeDot={{ r: 5 }}
              isAnimationActive={
                typeof window !== "undefined" &&
                !window.matchMedia("(prefers-reduced-motion: reduce)").matches
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
