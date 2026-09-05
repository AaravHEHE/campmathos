import { Link } from "@tanstack/react-router";
import type { PublicResource } from "@/lib/resources.functions";

const ACCENTS = ["bg-electric", "bg-coral", "bg-sun", "bg-ink"];

function typeLabel(type: string) {
  if (type === "notes") return "Note";
  if (type === "slideshows") return "Slideshow";
  return "Game";
}

/**
 * Card used on the Resources portal. Never a bare link — always a
 * card-3d box with a preview, title, description and actions.
 */
export function ResourceCard({ resource }: { resource: PublicResource }) {
  const isGame = resource.resource_type === "games";
  const accent = ACCENTS[resource.title.length % ACCENTS.length];
  const initial = resource.title.trim().charAt(0).toUpperCase() || "?";

  const preview = (
    <div className="relative aspect-[16/10] w-full overflow-hidden border-b-2 border-ink">
      {resource.thumbnailHref ? (
        <img
          src={resource.thumbnailHref}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center ${accent} ${
            accent === "bg-sun" ? "text-ink" : "text-cream"
          }`}
        >
          <span className="font-display text-6xl font-black">{initial}</span>
        </div>
      )}
      <span className="absolute left-3 top-3 rounded-full border-2 border-ink bg-cream px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-ink">
        {typeLabel(resource.resource_type)}
      </span>
    </div>
  );

  const body = (
    <div className="p-5">
      <h4 className="font-display text-xl font-black leading-tight">{resource.title}</h4>
      {resource.description ? (
        <p className="mt-2 line-clamp-3 text-sm text-ink/70">{resource.description}</p>
      ) : null}
      <span className="mt-4 inline-flex min-h-9 items-center rounded-full border-2 border-ink bg-ink px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-cream transition group-hover:bg-electric group-hover:border-electric">
        {isGame ? "Play →" : "Open →"}
      </span>
    </div>
  );

  const className =
    "card-3d group block overflow-hidden bg-cream text-left transition hover:-translate-y-0.5";

  if (isGame && resource.slug) {
    return (
      <Link to="/games/$slug" params={{ slug: resource.slug }} className={className}>
        {preview}
        {body}
      </Link>
    );
  }

  return (
    <Link
      to="/resources/$resourceId"
      params={{ resourceId: resource.id }}
      className={className}
    >
      {preview}
      {body}
    </Link>
  );
}
