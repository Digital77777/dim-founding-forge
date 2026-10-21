import { createFileRoute } from "@tanstack/react-router";

import { PageHero, Section } from "@/components/site/blocks";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/organisations")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "/organisations",
      "Partner with DIM — Universities, Businesses & AI Tool Providers",
      "Explore collaboration with Digital Intelligence Marketplace around practical AI awareness, digital skills, student communities and relevant opportunities.",
    ),
  component: Organisations,
});

const GROUPS = [
  {
    title: "Universities and educational institutions",
    body: "Explore ways DIM could support AI awareness, practical digital skills, student communities and discovery of useful tools and opportunities.",
  },
  {
    title: "Businesses and employers",
    body: "Talk to us about collaboration around digital intelligence, practical AI adoption, skills and connecting with emerging talent.",
  },
  {
    title: "AI tool providers",
    body: "Explore how your tool could reach people learning and applying AI through DIM, subject to the directory's curation and any agreed arrangement.",
  },
  {
    title: "Community organisations",
    body: "Explore collaborations that make digital learning and practical AI engagement more accessible to the people you serve.",
  },
];

function Organisations() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="For organisations"
        title="Let's make practical AI more accessible, together."
        intro="DIM is open to conversations with organisations that share our goal of helping people turn curiosity about AI into skills, connections and opportunities."
      >
        <Button asChild size="lg" className="bg-ember text-primary-foreground shadow-glow">
          <a href="#enquiry">Make an enquiry</a>
        </Button>
      </PageHero>

      <Section eyebrow="Who we work with" title="Collaboration opportunities">
        <ul className="grid gap-4 md:grid-cols-2">
          {GROUPS.map((g) => (
            <li key={g.title} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-xl font-bold">{g.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{g.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8 max-w-3xl rounded-2xl border border-border bg-surface p-6 text-sm">
          <p className="font-semibold">What's available today</p>
          <p className="mt-2 text-muted-foreground">
            DIM's public platform — the Learning Hub, AI Tools Directory, community and career features — is available to
            individuals now. Formal partnership programmes, packages and pricing are not yet published; every collaboration
            starts with a conversation so we can agree what makes sense.
          </p>
        </div>
      </Section>

      <section id="enquiry" className="scroll-mt-20 bg-surface py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Partnership enquiry</h2>
            <p className="mt-4 text-muted-foreground">Tell us about your organisation and what you'd like to explore. The DIM team reviews every enquiry.</p>
          </div>
          <EnquiryForm sourcePage="/organisations" defaultType="University or student community" />
        </div>
      </section>
    </SiteLayout>
  );
}
