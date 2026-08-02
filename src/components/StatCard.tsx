interface StatCardProps {
  label: string;
  value: string | number;
  accent?: string;
}

/** Generic headline-stat card — reused anywhere a page needs a single big number. */
export function StatCard({ label, value, accent = "bg-ink text-cream" }: StatCardProps) {
  return (
    <div className={`rounded-3xl border-2 border-ink p-6 shadow-[6px_6px_0_0_var(--ink)] ${accent}`}>
      <p className="font-mono text-xs uppercase tracking-widest opacity-70">{label}</p>
      <p className="mt-2 font-display text-4xl font-black leading-none md:text-5xl">{value}</p>
    </div>
  );
}
