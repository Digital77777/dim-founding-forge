import { createFileRoute, Link } from "@tanstack/react-router";

import { CardLink, CtaBand, PageHero, Section, StatusBadge } from "@/components/site/blocks";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { ECOSYSTEM, pageHead } from "@/lib/site";

export const Route = createFileRoute("/explore/")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "/explore",
      "Explore the DIM Ecosystem — Learning, AI Tools, Community & Careers",
      "See how DIM's Learning Hub, AI Tools Directory, Community, Career Development, Build Hub, Creator Hub and Marketplace connect — and what is available today.",
    ),
  component: Explore,
});

const STAGES = ["Learn", "Build", "Connect", "Earn", "Grow"] as const;

function Explore() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Explore DIM"
        title="One connected ecosystem, used your way."
        intro="DIM is organised around a simple journey — Learn, Build, Connect, Earn, Grow — with community connecting every step. Start wherever makes sense for you."
      >
        <Button asChild size="lg" className="bg-ember text-primary-foreground shadow-glow">
          <Link to="/auth">Join DIM</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/elite">Discover DIM ELITE</Link>
        </Button>
      </PageHero>

      {STAGES.map((stage, i) => {
        const areas = ECOSYSTEM.filter((a) => a.stage === stage);
        if (!areas.length) return null;
        return (
          <Section key={stage} tone={i % 2 ? "surface" : "default"} eyebrow={`0${i + 1} · ${stage}`} title={stageTitle(stage)}>
            <ul className="grid gap-4 md:grid-cols-2">
              {areas.map((a) => (
                <li key={a.slug} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-lift">
                  <StatusBadge status={a.status} className="self-start" />
                  <h3 className="mt-4 font-display text-2xl font-bold">{a.name}</h3>
                  <p className="mt-2 flex-1 text-muted-foreground">{a.summary}</p>
                  <CardLink to={`/explore/${a.slug}`}>About {a.name}</CardLink>
                </li>
              ))}
            </ul>
          </Section>
        );
      })}

      <CtaBand title="Ready to explore?" body="Create a free DIM account to use the features marked Available now.">
        <Button asChild size="lg" className="bg-ember text-primary-foreground">
          <Link to="/auth">Join DIM</Link>
        </Button>
      </CtaBand>
    </SiteLayout>
  );
}

function stageTitle(stage: (typeof STAGES)[number]) {
  return {
    Learn: "Gain knowledge and discover the right tools",
    Build: "Apply what you learn",
    Connect: "Find people to learn and grow with",
    Earn: "Create and explore opportunities",
    Grow: "Plan and track your progress",
  }[stage];
}
