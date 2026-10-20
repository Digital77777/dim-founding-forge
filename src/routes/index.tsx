import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, GraduationCap, Handshake, Sparkles, Users } from "lucide-react";

import { CardLink, CtaBand, EcosystemVisual, Eyebrow, Section, StatusBadge } from "@/components/site/blocks";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { getFoundingStats } from "@/lib/public.functions";
import { AUDIENCES, COMPANY, ECOSYSTEM, TAGLINE, pageHead } from "@/lib/site";

const TITLE = "Digital Intelligence Marketplace (DIM) — Elevate Your Digital IQ";
const DESCRIPTION =
  "Discover AI tools, build practical AI and digital skills, connect with a growing community and explore opportunities through one connected digital intelligence ecosystem.";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  loader: () => getFoundingStats(),
  head: () => ({
    ...pageHead("/", TITLE, DESCRIPTION),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: COMPANY,
          alternateName: "DIM",
          url: "https://digitalintelligencemarketplace.com",
          slogan: TAGLINE,
        }),
      },
    ],
  }),
  errorComponent: () => <Home open={null} />,
  component: HomeRoute,
});

function HomeRoute() {
  const stats = Route.useLoaderData();
  return <Home open={stats.remaining > 0} />;
}

const OPPORTUNITY = [
  { who: "Students", need: "Use AI well in your studies and build skills employers recognise." },
  { who: "Young professionals", need: "Bring practical AI into your work and plan your next career step." },
  { who: "First-time explorers", need: "Understand what AI can do for you, without jargon or pressure." },
  { who: "Creators and freelancers", need: "Create better work faster and share it with people who value it." },
  { who: "People with existing careers", need: "Apply AI to the work you already do, in your own way." },
  { who: "Organisations", need: "Engage people with practical AI and the digital economy." },
];

const AUDIENCE_ICONS = [GraduationCap, Sparkles, Sparkles, Users, Building2, Handshake];

function Home({ open }: { open: boolean | null }) {
  const featured = ECOSYSTEM.filter((a) => ["learning", "ai-tools", "marketplace", "community", "career"].includes(a.slug));
  return (
    <SiteLayout>
      {/* 1. Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="pointer-events-none absolute inset-0 grid-paper opacity-40" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Eyebrow>{COMPANY} · {TAGLINE}</Eyebrow>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.03] sm:text-6xl">
              Your gateway to the <span className="text-ember">AI-powered digital economy.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Discover AI tools, develop practical skills, connect with a growing community, and explore opportunities
              through one connected digital intelligence ecosystem.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-ember text-primary-foreground shadow-glow">
                <Link to="/explore">
                  Explore DIM <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/elite">Discover DIM ELITE</Link>
              </Button>
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Learn → Build → Connect → Earn → Grow
            </p>
          </div>
          <EcosystemVisual />
        </div>
      </section>

      {/* 2. Opportunity */}
      <Section
        eyebrow="The opportunity"
        title="AI is changing how people learn, work and create. Everyone deserves a practical way in."
        intro="Useful AI skills, a supportive community and access to relevant opportunities shouldn't be reserved for software developers. DIM is built for people at every starting point."
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OPPORTUNITY.map((o) => (
            <li key={o.who} className="rounded-2xl border border-border bg-card p-5">
              <p className="font-display text-lg font-bold">{o.who}</p>
              <p className="mt-2 text-sm text-muted-foreground">{o.need}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* 3. Introducing DIM */}
      <Section
        tone="surface"
        eyebrow="Introducing DIM"
        title="One ecosystem for learning, AI discovery, community, careers and creating."
        intro={
          <>
            <p>
              {COMPANY} brings together digital learning, an AI tools directory, community spaces, career development and
              creator experiences in one account. You choose the parts that fit your goals.
            </p>
            <p className="mt-4">
              Some members come to explore AI tools for their studies. Others plan a career move, share their creative
              work, or build projects of their own. You don't have to become a developer or build a product to get value
              from DIM.
            </p>
          </>
        }
      />

      {/* 4. Ecosystem */}
      <Section
        eyebrow="Explore the ecosystem"
        title="What you can do with DIM"
        intro="Each area is labelled with its current status, so you always know what is ready to use today."
      >
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((a) => (
            <li key={a.slug} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-lift">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{a.stage}</span>
                <StatusBadge status={a.status} />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold">{a.name}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{a.summary}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">For:</span> {a.audience.join(" · ")}
              </p>
              <CardLink to={`/explore/${a.slug}`}>Learn more</CardLink>
            </li>
          ))}
          <li className="flex flex-col justify-center rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6">
            <h3 className="font-display text-xl font-bold">See the full ecosystem</h3>
            <p className="mt-2 text-sm text-muted-foreground">Including Build &amp; Portfolio and the Creator Hub.</p>
            <CardLink to="/explore">Explore DIM</CardLink>
          </li>
        </ul>
      </Section>

      {/* 5. DIM ELITE */}
      <section className="px-4 sm:px-6">
        <div className="relative mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-3xl bg-elite p-8 text-ink-foreground sm:p-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="pointer-events-none absolute inset-0 grid-paper opacity-15" aria-hidden />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-foreground/75">Flagship offering</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-5xl">DIM ELITE</h2>
            <p className="mt-4 max-w-xl text-ink-foreground/85">
              DIM ELITE brings the DIM experiences together in one connected membership — learning, AI tools, career
              development, community and creator resources — with new features added as they launch.
            </p>
          </div>
          <div className="relative rounded-2xl border border-ink-foreground/20 bg-ink-foreground/5 p-6">
            <p className="font-display text-lg font-bold">Founding 1,000 beta</p>
            <p className="mt-2 text-sm text-ink-foreground/80">
              The first 1,000 eligible members receive free access throughout the beta period.
            </p>
            {open !== null ? (
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-ink-foreground/70">
                {open ? "Founding places are currently open" : "All founding places have been claimed"}
              </p>
            ) : null}
            <Button asChild className="mt-5 w-full bg-ember text-primary-foreground">
              <Link to="/elite">Discover DIM ELITE</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 6. Who DIM serves */}
      <Section eyebrow="Who DIM serves" title="Built for people and organisations at every stage">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCES.map((a, i) => {
            const Ico = AUDIENCE_ICONS[i] ?? Users;
            return (
              <li key={a.title} className="flex flex-col rounded-2xl border border-border bg-card p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Ico className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">{a.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{a.body}</p>
                <CardLink to={a.to}>{a.cta}</CardLink>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* 7. DIM Society */}
      <Section
        tone="surface"
        eyebrow="DIM Society"
        title="The human side of DIM"
        intro="DIM Society is the community at the heart of the ecosystem — people who exchange knowledge, share useful tools and learn alongside each other. It is also how student communities can take part in DIM."
      >
        <Button asChild variant="outline" size="lg">
          <Link to="/society">Discover DIM Society</Link>
        </Button>
      </Section>

      {/* 8. Partnerships */}
      <Section
        eyebrow="Partnerships"
        title="Work with DIM"
        intro="We welcome conversations with universities, businesses, AI tool providers and community organisations who want to make practical AI more accessible."
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/organisations">For organisations</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/contact">Make a partnership enquiry</Link>
          </Button>
        </div>
      </Section>

      {/* 9. Closing CTA */}
      <CtaBand
        title="Your next opportunity starts with what you learn today."
        body="Explore the tools, skills, community and opportunities that can help you take your next step in the digital economy."
      >
        <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
          <Link to="/explore">Explore DIM</Link>
        </Button>
        <Button asChild size="lg" className="bg-ember text-primary-foreground">
          <Link to="/auth">Join DIM</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="border-ink-foreground/40 bg-transparent text-ink-foreground hover:bg-ink-foreground/10">
          <Link to="/elite">Discover DIM ELITE</Link>
        </Button>
      </CtaBand>
    </SiteLayout>
  );
}
