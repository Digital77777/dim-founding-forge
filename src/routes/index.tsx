import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Building2, GraduationCap, Handshake, Sparkles, Users } from "lucide-react";

import {
  CardLink,
  CtaBand,
  EcosystemVisual,
  Eyebrow,
  Section,
  StatusBadge,
} from "@/components/site/blocks";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { getFoundingStats } from "@/lib/public.functions";
import { supabase } from "@/integrations/supabase/client";
import { AUDIENCES, COMPANY, ECOSYSTEM, TAGLINE, pageHead } from "@/lib/site";

const TITLE = "Digital Intelligence Marketplace (DIM) — Elevate Your Digital IQ";
const DESCRIPTION =
  "Discover AI tools, build practical AI and digital skills, connect with a growing community and explore opportunities through one connected digital intelligence ecosystem.";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  loader: () => getFoundingStats(),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session && typeof window !== "undefined") {
      const lastRoute = window.localStorage.getItem("dim:last-authenticated-route");
      const safeReturnRoutes = [
        "/community",
        "/connect",
        "/inbox",
        "/learn",
        "/profile",
        "/progress",
        "/portfolio",
        "/build",
        "/tools",
        "/marketplace",
        "/dashboard",
        "/activity",
      ];
      let isSafeReturnRoute = Boolean(
        lastRoute &&
        safeReturnRoutes.some((route) => lastRoute === route || lastRoute.startsWith(`${route}/`)),
      );
      if (isSafeReturnRoute && lastRoute?.startsWith("/learn/")) {
        const courseSlug = lastRoute.split("/").filter(Boolean).at(-1);
        const { data: course } = courseSlug
          ? await supabase.from("courses").select("slug").eq("slug", courseSlug).maybeSingle()
          : { data: null };
        isSafeReturnRoute = Boolean(course);
      }
      if (isSafeReturnRoute) throw redirect({ to: lastRoute as never, replace: true });
      window.localStorage.removeItem("dim:last-authenticated-route");
      throw redirect({ to: "/community", replace: true });
    }
  },
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

const STEPS = [
  { name: "Learn", line: "Courses and a curated AI tools directory, chosen for real goals." },
  { name: "Build", line: "Turn what you learn into projects you can show." },
  { name: "Connect", line: "A community that shares what works — and what doesn't." },
  { name: "Earn", line: "Creator resources today, with a marketplace on the way." },
  { name: "Grow", line: "Career planning and progress you can actually track." },
];

const GET_STARTED = [
  ["Create a free account", "Sign up with email or Google. It takes a couple of minutes."],
  [
    "Set your direction",
    "A short setup asks what you want to achieve, so DIM can point you to the right places.",
  ],
  [
    "Start in the community",
    "Meet other members, ask questions and explore every area from one app.",
  ],
];

const AUDIENCE_ICONS = [GraduationCap, Sparkles, Sparkles, Users, Building2, Handshake];

function Home({ open }: { open: boolean | null }) {
  const featured = ECOSYSTEM.filter((a) =>
    ["learning", "ai-tools", "community", "career", "build"].includes(a.slug),
  );
  return (
    <SiteLayout>
      {/* 1. Hero */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Eyebrow>Digital Intelligence Marketplace</Eyebrow>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">
              Learn AI. Build skills. <span className="text-ember">Grow your career.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              DIM brings courses, a curated AI tools directory, a community of peers and career
              planning together in one free account — so you can start where you are and move at
              your own pace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-ember text-primary-foreground shadow-glow">
                <Link to="/auth">Join DIM — it's free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/explore">Explore the ecosystem</Link>
              </Button>
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              {TAGLINE}
            </p>
          </div>
          <EcosystemVisual />
        </div>
      </section>

      {/* 2. What DIM is, in plain words */}
      <Section tone="surface" eyebrow="What DIM is" title="In plain words">
        <div className="max-w-3xl space-y-4 text-lg text-muted-foreground">
          <p>
            If you are trying to make sense of AI — which tools to trust, what to learn and where it
            can take you — you don't have to piece it together from scattered sources, or figure it
            out alone.
          </p>
          <p>
            DIM puts the pieces in one place. You learn at your own pace, try tools that fit your
            goals, share your work with people on the same path, and plan what comes next. One
            account, and no technical background required.
          </p>
        </div>
      </Section>

      {/* 3. What you can do */}
      <Section
        eyebrow="Explore the ecosystem"
        title="What you can do with DIM"
        intro="Each area is labelled with its current status, so you always know what is ready to use today."
      >
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((a) => (
            <li key={a.slug} className="flex flex-col rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {a.stage}
                </span>
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
            <p className="mt-2 text-sm text-muted-foreground">
              Including the Creator Hub and the marketplace in development.
            </p>
            <CardLink to="/explore">Explore DIM</CardLink>
          </li>
        </ul>
      </Section>

      {/* 4. How it works */}
      <Section
        tone="surface"
        eyebrow="How it works"
        title="One journey, five steps"
        intro="Everything in DIM connects to the same loop. Start anywhere — the pieces build on each other."
      >
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s.name} className="rounded-2xl border border-border bg-card p-5">
              <span className="font-display text-sm font-bold text-ember">0{i + 1}</span>
              <h3 className="mt-2 font-display text-lg font-bold">{s.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.line}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 5. DIM ELITE */}
      <section className="px-4 sm:px-6">
        <div className="relative mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-3xl bg-elite p-8 text-ink-foreground sm:p-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-foreground/75">
              Flagship offering
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-5xl">DIM ELITE</h2>
            <p className="mt-4 max-w-xl text-ink-foreground/85">
              DIM ELITE brings the DIM experiences together in one connected membership — learning,
              AI tools, career development, community and creator resources — with new features
              added as they launch.
            </p>
          </div>
          <div className="relative rounded-2xl border border-ink-foreground/20 bg-ink-foreground/5 p-6">
            <p className="font-display text-lg font-bold">Founding 1,000 beta</p>
            <p className="mt-2 text-sm text-ink-foreground/80">
              The first 1,000 eligible members receive free access throughout the beta period.
            </p>
            {open !== null ? (
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-ink-foreground/70">
                {open
                  ? "Founding places are currently open"
                  : "All founding places have been claimed"}
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
              <li
                key={a.title}
                className="flex flex-col rounded-2xl border border-border bg-card p-6"
              >
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

      {/* 7. Getting started */}
      <Section tone="surface" eyebrow="Getting started" title="Three steps and you're in">
        <ol className="grid gap-4 md:grid-cols-3">
          {GET_STARTED.map(([t, d], i) => (
            <li key={t} className="rounded-2xl border border-border bg-card p-6">
              <span className="font-display text-3xl font-extrabold text-ember">0{i + 1}</span>
              <h3 className="mt-3 font-display text-lg font-bold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 8. Closing CTA */}
      <CtaBand
        title="Start where you are."
        body="Create a free DIM account today — or take a look around the ecosystem first."
      >
        <Button asChild size="lg" className="bg-ember text-primary-foreground">
          <Link to="/auth">Join DIM</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="border-ink-foreground/40 bg-transparent text-ink-foreground hover:bg-ink-foreground/10"
        >
          <Link to="/explore">Explore DIM</Link>
        </Button>
      </CtaBand>
    </SiteLayout>
  );
}
