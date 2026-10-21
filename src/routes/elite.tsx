import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { CtaBand, Faq, PageHero, Section, StatusBadge } from "@/components/site/blocks";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { getFoundingStats } from "@/lib/public.functions";
import { pageHead, type Status } from "@/lib/site";

export const Route = createFileRoute("/elite")({
  staticData: { sitemap: true },
  loader: () => getFoundingStats(),
  head: () =>
    pageHead(
      "/elite",
      "DIM ELITE — Founding 1,000 Beta | Digital Intelligence Marketplace",
      "DIM ELITE connects learning, AI tools, career development, community and creator resources in one membership. The first 1,000 eligible members get free access during the beta.",
    ),
  errorComponent: () => <Elite open={null} />,
  component: () => <Elite open={Route.useLoaderData().remaining > 0} />,
});

const INCLUDED: { name: string; detail: string; status: Status }[] = [
  { name: "Learning Hub & learning paths", detail: "Courses and resources across AI fundamentals and practical skills.", status: "available" },
  { name: "AI Tools Directory", detail: "Curated AI tools grouped by what they help you do.", status: "available" },
  { name: "Career development", detail: "Guided goal setup, career resources and milestone tracking.", status: "available" },
  { name: "AI career guidance", detail: "An AI-generated personal roadmap and next-step suggestions. Advice, not a guarantee.", status: "beta" },
  { name: "Community", detail: "Spaces, posts, reels, comments and a member directory.", status: "available" },
  { name: "Build Hub & portfolio", detail: "Record projects and share a portfolio.", status: "available" },
  { name: "Creator Hub", detail: "Creator learning and resources.", status: "available" },
  { name: "Achievements & progress", detail: "Badges and a scorecard of your progress.", status: "available" },
  { name: "Beta feedback centre", detail: "Tell the DIM team what to build next.", status: "beta" },
  { name: "Marketplace", detail: "Offer and discover digital products and services.", status: "development" },
  { name: "Events & workshops", detail: "Live and online community events.", status: "development" },
  { name: "Opportunities & earning pathways", detail: "Discover relevant opportunities.", status: "development" },
  { name: "Mentorship, interview prep, jobs board", detail: "Further career experiences.", status: "planned" },
];

const WHO = ["Students", "Early-career professionals", "People exploring AI", "Creators and freelancers", "People applying AI to their existing work or studies"];

function Elite({ open }: { open: boolean | null }) {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="DIM ELITE · A flagship offering of Digital Intelligence Marketplace"
        title="More ways to learn, apply AI and grow with DIM."
        intro="Discover a connected experience designed to help you explore AI tools, develop practical skills, connect with a community and pursue your digital goals."
      >
        <Button asChild size="lg" className="bg-ember text-primary-foreground shadow-glow">
          <Link to="/auth">Join DIM ELITE</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/auth" search={{ mode: "signin" }}>I already have an account</Link>
        </Button>
      </PageHero>

      <Section
        eyebrow="What it is"
        title="The connected DIM experience, in one membership"
        intro="DIM ELITE is part of Digital Intelligence Marketplace, not a separate company. It brings DIM's learning, AI discovery, career, community and creator experiences together so they work as one journey: Learn → Build → Connect → Earn → Grow."
      />

      <Section tone="surface" eyebrow="Who it's for" title="Wherever you're starting from">
        <ul className="flex flex-wrap gap-3">
          {WHO.map((w) => (
            <li key={w} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">{w}</li>
          ))}
        </ul>
      </Section>

      <Section id="availability" eyebrow="Included experiences" title="What's available now — and what's coming" intro="Every feature is labelled honestly. Features in development appear in the app as Coming Soon and become available to members as they launch.">
        <ul className="grid gap-4 md:grid-cols-2">
          {INCLUDED.map((f) => (
            <li key={f.name} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold">{f.name}</h3>
                <StatusBadge status={f.status} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{f.detail}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="surface" eyebrow="Beta access" title="The Founding 1,000 beta">
        <div className="max-w-3xl rounded-2xl border border-primary/30 bg-card p-6 shadow-lift">
          <ul className="space-y-3 text-sm">
            {[
              "The first 1,000 eligible members receive free access to DIM ELITE throughout the beta period.",
              "The beta has no fixed end date. We'll share any changes clearly and in advance.",
              "Founding members keep a visible founding status on their profile.",
              "A founding place is assigned automatically when you create your account, while places remain.",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden /> {t}
              </li>
            ))}
          </ul>
          {open !== null ? (
            <p className="mt-5 text-sm font-semibold text-primary">
              {open ? "Founding places are currently open." : "All founding places have now been claimed."}
            </p>
          ) : null}
        </div>
      </Section>

      <Section eyebrow="How to join" title="Three steps">
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            ["Create your DIM account", "Sign up with email or Google."],
            ["Complete onboarding", "Tell us your goals so DIM can point you to the right places."],
            ["Start in the community", "Explore every area from the app menu."],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-2xl border border-border bg-card p-6">
              <span className="font-display text-3xl font-extrabold text-ember">0{i + 1}</span>
              <h3 className="mt-3 font-display text-lg font-bold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="surface" eyebrow="FAQ" title="Questions about DIM ELITE">
        <Faq
          items={[
            { q: "What is DIM ELITE?", a: "A membership within Digital Intelligence Marketplace that brings DIM's learning, AI tools, career, community and creator experiences together in one account." },
            { q: "Who can join?", a: "Anyone who wants to explore and apply AI — students, professionals, creators and curious newcomers. You don't need to be technical." },
            { q: "How does DIM ELITE relate to DIM?", a: "DIM is the company and the wider ecosystem. DIM ELITE is a flagship offering within it." },
            { q: "What is included?", a: <>See the list above — each item shows whether it is available now, in beta or in development.</> },
            { q: "How does beta access work?", a: "The first 1,000 eligible members get free access throughout the beta. There is no fixed end date, and we don't promise free access beyond the beta period." },
            { q: "Which features are available now?", a: "Learning Hub, AI Tools Directory, Community, career development, Build Hub, Creator Hub and achievements. The marketplace, events and opportunities are in development." },
            { q: "How do I access my account?", a: <>Use <Link to="/auth" search={{ mode: "signin" }} className="text-primary underline">Sign In</Link> with the email or Google account you joined with.</> },
            { q: "Where can I find help?", a: <>Send us a message through the <Link to="/contact" className="text-primary underline">contact page</Link>, or share feedback in the app's beta feedback centre.</> },
          ]}
        />
      </Section>

      <CtaBand title="Join the first 1,000." body="Help shape DIM ELITE as it grows.">
        <Button asChild size="lg" className="bg-ember text-primary-foreground">
          <Link to="/auth">Join DIM ELITE</Link>
        </Button>
      </CtaBand>
    </SiteLayout>
  );
}
