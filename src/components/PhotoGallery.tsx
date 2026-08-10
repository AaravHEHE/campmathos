import type { CampPhoto } from "@/data/camp-years";

/** Responsive lazy-loaded photo grid. Renders a tasteful empty state when there are no photos yet. */
export function PhotoGallery({ photos }: { photos: CampPhoto[] }) {
  if (photos.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-ink/25 bg-cream/60 p-10 text-center">
        <p className="font-mono text-sm text-ink/50">Photos from this year are coming soon.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((p) => (
        <figure key={p.src} className="overflow-hidden rounded-3xl border-2 border-ink bg-cream">
          <div className="flex h-64 w-full items-center justify-center bg-ink/5">
            <img
              src={p.src}
              alt={p.alt}
              loading="lazy"
              width={640}
              height={480}
              className="h-full w-full object-contain"
            />
          </div>
          {p.caption && (
            <figcaption className="border-t-2 border-ink px-4 py-3 text-sm text-ink/70">
              {p.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
