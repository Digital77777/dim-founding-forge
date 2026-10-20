import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { CtaBand, PageHero, Section, StatusBadge } from "@/components/site/blocks";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { STATUS_LABEL, findArea, pageHead } from "@/lib/site";

export const Route = createFileRoute("/explore/$area")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const area = findArea(params.area);
    if (!area) throw notFound();
    return area;
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? pageHead(`/explore/${params.area}`, `${loaderData.name} — Digital Intelligence Marketplace`, loaderData.summary)
      : { meta: [{ title: "Not found — DIM" }, { name: "robots", content: "noindex" }] },
  notFoundComponent: () => (
    <SiteLayout>
      <PageHero eyebrow="Explore DIM" title="We couldn't find that part of DIM." intro="It may have moved or not exist yet.">
        <Button asChild>
          <Link to="/explore">See the full ecosystem</Link>
        </Button>
      </PageHero>
    </SiteLayout>
  ),
  component: AreaPage,
});

function AreaPage() {
  const a = Route.useLoaderData();
  const live = a.status === "available" || a.status === "beta";
  return (
    <SiteLayout>
      <PageHero eyebrow={`Explore DIM · ${a.stage}`} title={a.name} intro={a.summary}>
        <StatusBadge status={a.status} className="self-center" />
      </PageHero>

      <Section title="The problem it addresses" intro={a.problem}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-bold">Who it's for</h3>
            <ul className="mt-4 space-y-2">
              {a.audience.map((x) => (
                <li key={x} className="flex gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden /> {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-bold">{live ? "What you get" : "What's planned"}</h3>
            <ul className="mt-4 space-y-2">
              {a.benefits.map((x) => (
                <li key={x} className="flex gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden /> {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm">
            <span className="font-semibold">Current availability: {STATUS_LABEL[a.status]}.</span>{" "}
            {live
              ? "Sign in or create a free DIM account to use it — you'll be taken straight there."
              : "This area is not yet open for use. Members can see its plans inside the app and will be able to use it once it launches."}
          </p>
        </div>
      </Section>

      <CtaBand title={live ? `Start using ${a.name}` : `Follow ${a.name} as it develops`} body="One DIM account gives you access to every part of the ecosystem that is open today.">
        <Button asChild size="lg" className="bg-ember text-primary-foreground">
          <a href={a.appPath}>{a.cta}</a>
        </Button>
        <Button asChild size="lg" variant="outline" className="border-ink-foreground/40 bg-transparent text-ink-foreground hover:bg-ink-foreground/10">
          <Link to="/explore">Back to the ecosystem</Link>
        </Button>
      </CtaBand>
    </SiteLayout>
  );
}
