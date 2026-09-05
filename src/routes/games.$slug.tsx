import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { getPublicGame } from "@/lib/resources.functions";
import { levelLabel, weekLabel } from "@/data/resource-taxonomy";

export const Route = createFileRoute("/games/$slug")({
  loader: async ({ params }) => {
    const { resource } = await getPublicGame({ data: { slug: params.slug } });
    if (!resource) throw notFound();
    return { resource };
  },
  component: GamePage,
  notFoundComponent: () => <Missing />,
  errorComponent: () => <Missing />,
  head: ({ loaderData }) => {
    const title = loaderData?.resource?.title
      ? `${loaderData.resource.title} — MathOs games`
      : "Game — MathOs";
    const description =
      loaderData?.resource?.description ?? "A MathOs camper game.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
});

function Missing() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="font-display text-4xl font-black">Game unavailable</h1>
        <p className="mt-4 text-ink/70">
          This game may have been removed or isn't published yet.
        </p>
        <Link
          to="/resources"
          className="mt-8 inline-flex rounded-full border-2 border-ink bg-ink px-5 py-2 font-mono text-xs uppercase tracking-widest text-cream transition hover:bg-cream hover:text-ink"
        >
          ← Back to resources
        </Link>
      </div>
      <SiteFooter />
    </main>
  );
}

function GamePage() {
  const { resource } = Route.useLoaderData();
  const play = resource.external_url ?? resource.fileHref;

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />

      <section className="grid-paper border-b-2 border-ink">
        <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
          <Link
            to="/resources"
            className="font-mono text-xs uppercase tracking-widest text-ink/60 transition hover:text-electric"
          >
            ← Back to resources
          </Link>
          <p className="mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {levelLabel(resource.school_level)} · {weekLabel(resource.week_number)} · Game
          </p>
          <h1 className="mt-3 font-display text-4xl font-black leading-tight md:text-6xl">
            {resource.title}
          </h1>
          {resource.description ? (
            <p className="mt-5 max-w-2xl text-lg text-ink/75">{resource.description}</p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="card-3d-inverse p-8 md:p-10">
          <p className="font-mono text-xs uppercase tracking-widest opacity-70">
            How to play
          </p>
          <h2 className="mt-3 font-display text-3xl font-black">
            Ready when you are<span className="italic text-sun">.</span>
          </h2>
          <p className="mt-3 max-w-xl opacity-80">
            The game opens in a new tab so you can keep this page handy.
          </p>
          {play ? (
            <a
              href={play}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex rounded-full border-2 border-cream bg-cream px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-ink transition hover:bg-transparent hover:text-cream"
            >
              Play now →
            </a>
          ) : (
            <p className="mt-7 font-mono text-xs uppercase tracking-widest opacity-70">
              Link coming soon
            </p>
          )}
        </div>

        {resource.embed_url ? (
          <div className="card-3d mt-10 overflow-hidden bg-cream">
            <iframe
              src={resource.embed_url}
              title={resource.title}
              className="h-[70vh] w-full"
              allowFullScreen
            />
          </div>
        ) : null}
      </section>

      <SiteFooter />
    </main>
  );
}
