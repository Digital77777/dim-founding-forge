import { createFileRoute, Link } from "@tanstack/react-router";

import { CtaBand, PageHero, Section, StatusBadge } from "@/components/site/blocks";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/society")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "/society",
      "DIM Society — The DIM Community for Students and Professionals",
      "DIM Society is the community side of Digital Intelligence Marketplace: people who learn from each other, share useful AI tools and discover relevant activities and opportunities.",
    ),
  component: Society,
});

const WAYS = [
  ["Learn from one another", "Ask questions, share what's working and learn faster with peers in topic spaces."],
  ["Discover useful tools", "Members share the AI tools that actually help with their studies, work and creative projects."],
  ["Share knowledge and experience", "Post wins, lessons, photos, videos and reels about what you're learning and building."],
  ["Find activities and opportunities", "Community events and opportunity listings are being developed and will appear here as they launch."],
  ["Bring your community in", "Student societies and other groups can explore taking part in the wider DIM ecosystem."],
];

function Society() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="DIM Society"
        title="Grow with people who are learning AI too."
        intro="Community connects every part of DIM. DIM Society is where members exchange knowledge, discover tools and take part in the wider ecosystem together."
      >
        <Button asChild size="lg" className="bg-ember text-primary-foreground shadow-glow">
          <Link to="/auth">Join the community</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/contact">Enquire about a community</Link>
        </Button>
      </PageHero>

      <Section eyebrow="Why community matters" title="People learn faster together" intro="AI changes quickly. Having people to compare notes with makes it easier to keep up, stay motivated and turn learning into real progress.">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WAYS.map(([t, d]) => (
            <li key={t} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-bold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="surface" eyebrow="Community initiative" title="DIM Society at UCT">
        <div className="max-w-3xl rounded-2xl border border-border bg-card p-6">
          <StatusBadge status="development" />
          <p className="mt-4 text-muted-foreground">
            DIM Society at UCT is a student community-building initiative that aims to bring practical AI learning, useful
            tools and peer connection to students. It is a DIM community initiative and is not an official programme of
            the University of Cape Town. We'll share progress here as it is confirmed.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/contact">Ask about getting involved</Link>
          </Button>
        </div>
      </Section>

      <CtaBand title="Your community is waiting." body="Create a free DIM account to join the discussion spaces today.">
        <Button asChild size="lg" className="bg-ember text-primary-foreground">
          <Link to="/auth">Join DIM</Link>
        </Button>
      </CtaBand>
    </SiteLayout>
  );
}
