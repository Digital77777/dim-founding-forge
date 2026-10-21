import { createFileRoute, Link } from "@tanstack/react-router";

import { CtaBand, PageHero, Section } from "@/components/site/blocks";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { COMPANY, TAGLINE, pageHead } from "@/lib/site";

export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "/about",
      "About Digital Intelligence Marketplace (DIM) — Mission & Vision",
      "Learn what Digital Intelligence Marketplace is, the problem it addresses, its mission, vision and principles, and how to collaborate with DIM.",
    ),
  component: About,
});

const PRINCIPLES = [
  ["Your journey, your way", "People apply AI in different ways. DIM never forces everyone down the same path."],
  ["Practical over hype", "We focus on skills and tools people can actually use."],
  ["Honest by default", "We say clearly what's available, what's in beta and what's still coming."],
  ["Community at the core", "Learning sticks when people share it with others."],
  ["Accessible to all", "Built for South Africa, Africa and beyond — not only for technical experts."],
];

const PROGRESS = [
  "Launched the DIM ELITE Founding 1,000 beta.",
  "Released the Learning Hub, AI Tools Directory and community spaces with posts and reels.",
  "Released career development tools, including AI-generated personal roadmaps.",
  "Released the Build Hub, portfolio, Creator Hub and achievements.",
  "Marketplace, events and opportunities are in development.",
];

function About() {
  return (
    <SiteLayout>
      <PageHero eyebrow="About DIM" title={TAGLINE} intro={`${COMPANY} (DIM) is a technology company building a human-centred ecosystem around practical AI, digital learning, community and opportunity.`} />

      <Section eyebrow="The problem" title="AI is everywhere — practical guidance isn't" intro="Many people know AI matters but don't know where to start, which tools to trust, or how to turn new skills into real progress. Resources are scattered and often assume a technical background." />

      <Section tone="surface" eyebrow="Mission" title="Our mission">
        <p className="max-w-3xl text-lg text-muted-foreground">
          To enable people to learn practical AI skills, build real projects where they choose to, connect with a
          supportive community, and discover opportunities in an accessible, empowering and innovative ecosystem.
        </p>
      </Section>

      <Section eyebrow="Vision" title="Our vision">
        <p className="max-w-3xl text-lg text-muted-foreground">
          An ecosystem where anyone — in South Africa, across Africa and internationally — can raise their digital IQ and
          take part confidently in the AI-powered economy.
        </p>
      </Section>

      <Section tone="surface" eyebrow="Principles" title="What guides us">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map(([t, d]) => (
            <li key={t} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-bold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="How it connects" title="Learn → Build → Connect → Earn → Grow" intro="Learning gives you knowledge. Applying AI turns it into evidence. Community gives you people to grow with. Opportunities let you use what you know. Then the cycle continues." />

      <Section tone="surface" eyebrow="Progress" title="Where DIM is today">
        <ul className="max-w-3xl space-y-3">
          {PROGRESS.map((p) => (
            <li key={p} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">{p}</li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Team" title="The people behind DIM" intro="Team and founder profiles will be published here soon." />

      <CtaBand title="Collaborate with DIM" body="Whether you're a learner, a community or an organisation, we'd like to hear from you.">
        <Button asChild size="lg" className="bg-ember text-primary-foreground">
          <Link to="/contact">Contact us</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="border-ink-foreground/40 bg-transparent text-ink-foreground hover:bg-ink-foreground/10">
          <Link to="/organisations">For organisations</Link>
        </Button>
      </CtaBand>
    </SiteLayout>
  );
}
