import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero, Section } from "@/components/site/blocks";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { ARTICLES, INSIGHT_CATEGORIES, pageHead } from "@/lib/site";

export const Route = createFileRoute("/insights/")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "/insights",
      "DIM Insights — Practical AI, Digital Skills & Career Development",
      "Articles from Digital Intelligence Marketplace on practical AI, AI tools and workflows, digital skills, careers, student resources and creator opportunities.",
    ),
  component: Insights,
});

function Insights() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Insights" title="Plain-language guides for working with AI." intro="Ideas and updates on learning, building skills and growing your career — written for people, not engineers." />
      <Section title="Topics">
        <ul className="flex flex-wrap gap-2">
          {INSIGHT_CATEGORIES.map((c) => (
            <li key={c} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">{c}</li>
          ))}
        </ul>
        {ARTICLES.length ? (
          <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ARTICLES.map((a) => (
              <li key={a.slug} className="rounded-2xl border border-border bg-card p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{a.category}</p>
                <h2 className="mt-2 font-display text-xl font-bold">
                  <Link to="/insights/$slug" params={{ slug: a.slug }} className="hover:underline">{a.title}</Link>
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{a.excerpt}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 max-w-2xl rounded-2xl border border-dashed border-border bg-surface p-8">
            <h2 className="font-display text-xl font-bold">The first articles are on their way.</h2>
            <p className="mt-2 text-sm text-muted-foreground">In the meantime, members share practical tips every day in the DIM community.</p>
            <Button asChild className="mt-5">
              <Link to="/auth">Join the community</Link>
            </Button>
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}
