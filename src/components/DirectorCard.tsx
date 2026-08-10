import type { Director } from "@/data/board-years";
import { Reveal } from "@/components/Reveal";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DirectorCard({ director, delay = 0 }: { director: Director; delay?: number }) {
  return (
    <Reveal delay={delay} amount={0.25}>
      <article className="group flex flex-col rounded-3xl border-2 border-ink bg-cream p-8 transition hover:-translate-y-1 hover:shadow-[8px_8px_0_0_var(--ink)]">
        {/* Photo */}
        <div
          className={`relative flex h-56 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-ink ${director.accent}`}
        >
          {director.photo ? (
            <img
              src={director.photo}
              alt={`${director.name}, Camp Director`}
              loading="lazy"
              className="h-full w-full object-contain"
            />
          ) : (
            <>
              <span className="font-display text-5xl font-black">{initials(director.name)}</span>
              <span className="absolute bottom-2 right-3 font-mono text-[10px] tracking-widest opacity-70">
                Photo soon
              </span>
            </>
          )}
        </div>
        <h2 className="mt-6 font-display text-2xl font-black leading-tight">{director.name}</h2>
        <p className="mt-4 text-sm text-ink/70">{director.bio}</p>
      </article>
    </Reveal>
  );
}
