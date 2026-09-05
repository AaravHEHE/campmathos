import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { getPublicResource } from "@/lib/resources.functions";
import { categoryLabel, levelLabel, weekLabel } from "@/data/resource-taxonomy";

export const Route = createFileRoute("/resources/$resourceId")({
  loader: async ({ params }) => {
    const { resource } = await getPublicResource({ data: { id: params.resourceId } });
    if (!resource) throw notFound();
    return { resource };
  },
  component: ResourceViewer,
  notFoundComponent: () => <Missing />,
  errorComponent: () => <Missing />,
  head: ({ loaderData }) => {
    const title = loaderData?.resource?.title
      ? `${loaderData.resource.title} — MathOs resources`
      : "Resource — MathOs";
    const description =
      loaderData?.resource?.description ?? "A MathOs camper resource.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
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
        <h1 className="font-display text-4xl font-black">Resource unavailable</h1>
        <p className="mt-4 text-ink/70">
          This item may have been removed or isn't published yet.
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

function ResourceViewer() {
  const { resource } = Route.useLoaderData();
  const href = resource.fileHref ?? resource.external_url;
  const isPdf = !!resource.fileHref && /\.pdf(\?|$)/i.test(resource.file_url ?? "");
  const embed = resource.embed_url;

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
            {levelLabel(resource.school_level)} · {weekLabel(resource.week_number)} ·{" "}
            {categoryLabel(resource.resource_type)}
          </p>
          <h1 className="mt-3 font-display text-4xl font-black leading-tight md:text-6xl">
            {resource.title}
          </h1>
          {resource.description ? (
            <p className="mt-5 max-w-2xl text-lg text-ink/75">{resource.description}</p>
          ) : null}
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex rounded-full border-2 border-ink bg-ink px-5 py-2 font-mono text-xs uppercase tracking-widest text-cream transition hover:bg-cream hover:text-ink"
            >
              Open in a new tab →
            </a>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        {embed ? (
          <div className="card-3d overflow-hidden bg-cream">
            <iframe
              src={embed}
              title={resource.title}
              className="h-[70vh] w-full"
              allowFullScreen
            />
          </div>
        ) : isPdf && href ? (
          <div className="card-3d overflow-hidden bg-cream">
            <iframe src={href} title={resource.title} className="h-[80vh] w-full" />
          </div>
        ) : resource.thumbnailHref ? (
          <div className="card-3d overflow-hidden bg-cream">
            <img
              src={resource.thumbnailHref}
              alt={resource.title}
              className="w-full object-contain"
            />
          </div>
        ) : (
          <p className="rounded-2xl border-2 border-dashed border-ink/25 px-6 py-10 text-center font-mono text-sm text-ink/50">
            Use the button above to open this resource.
          </p>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
