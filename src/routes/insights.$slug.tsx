import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { PageHero } from "@/components/site/blocks";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { ARTICLES, pageHead } from "@/lib/site";

export const Route = createFileRoute("/insights/$slug")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const article = ARTICLES.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? pageHead(`/insights/${params.slug}`, `${loaderData.title} — DIM Insights`, loaderData.excerpt)
      : { meta: [{ title: "Unavailable — DIM Insights" }, { name: "robots", content: "noindex" }] },
  notFoundComponent: () => (
    <SiteLayout>
      <PageHero eyebrow="Insights" title="Article not found" intro="It may have moved or been removed.">
        <Button asChild>
          <Link to="/insights">All insights</Link>
        </Button>
      </PageHero>
    </SiteLayout>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const a = Route.useLoaderData();
  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{a.category} · {a.date}</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight">{a.title}</h1>
        <div className="mt-8 space-y-5 text-lg leading-relaxed text-foreground/90">
          {a.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </article>
    </SiteLayout>
  );
}
