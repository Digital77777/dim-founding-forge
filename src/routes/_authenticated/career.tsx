import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AppShell } from "@/components/dim/AppShell";
import { HubPage } from "@/components/dim/HubPage";
import { Icon } from "@/components/dim/Icon";
import { Button } from "@/components/ui/button";
import {
  CAREER_AUDIENCES,
  CAREER_FEATURES,
  CAREER_JOURNEY,
  CAREER_OPPORTUNITY_CARDS,
  type CareerLink,
} from "@/lib/career";
import { STAGES } from "@/lib/dim";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/career")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "DIM Career | AI Career Development & Career Acceleration" },
      {
        name: "description",
        content:
          "Explore DIM Career — a connected ecosystem for learning AI skills, building projects, developing your portfolio, preparing for opportunities, networking and growing your career.",
      },
      { property: "og:title", content: "DIM Career | AI Career Development & Career Acceleration" },
      {
        property: "og:description",
        content:
          "Turn your AI skills into a career: guidance, learning paths, projects, portfolio, preparation, networking and opportunities in one connected ecosystem.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://dim-founding-forge.lovable.app/career" }],
  }),
  component: CareerPage,
});

/** Typed-route helper: every CTA in the content model points at a real route. */
type Dest = "/learn";
const dest = (to: string) => to as Dest;

function Cta({
  link,
  variant = "outline",
  className,
}: {
  link: CareerLink;
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
}) {
  return (
    <Button variant={variant} className={className} asChild>
      <Link to={dest(link.to)}>
        {link.label}
        {link.soon ? (
          <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Soon
          </span>
        ) : (
          <ArrowRight className="size-4" aria-hidden />
        )}
      </Link>
    </Button>
  );
}

function SectionHeading({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{title}</h2>
      {lead ? <p className="mt-3 text-muted-foreground">{lead}</p> : null}
    </div>
  );
}

const HERO_FLOW = [
  "Goal",
  "Skills",
  "Learning",
  "Projects",
  "Portfolio",
  "Certifications",
  "Career preparation",
  "Opportunities",
];

const ROADMAP_FLOW = [
  "Career goal",
  "Assess",
  "Skill gaps",
  "Learning path",
  "Practical projects",
  "Certifications",
  "Portfolio",
  "CV",
  "Interview",
  "Network",
  "Opportunities",
];

function CareerPage() {
  return (
    <AppShell>
      <div className="space-y-16 pb-4 sm:space-y-24">
        <Hero />
        <Problem />
        <Advisor />
        <Roadmap />
        <Features />
        <Journey />
        <DashboardPreview />
        <Tools />
        <PortfolioToOpportunity />
        <ConnectSection />
        <Opportunities />
        <Audiences />
        <Ecosystem />
        <ValueProp />
        <Personalization />
        <HubContent />
        <FinalCta />
      </div>
    </AppShell>
  );
}

function Hero() {
  return (
    <section className="-mx-4 overflow-hidden rounded-none bg-elite px-5 py-12 text-ink-foreground sm:mx-0 sm:rounded-3xl sm:px-10 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-ink-foreground/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">
            <Sparkles className="size-3.5" aria-hidden /> DIM Career
          </p>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] sm:text-5xl">
            Turn Your AI Skills Into a Career.
          </h1>
          <p className="mt-4 text-lg font-semibold text-ink-foreground/85">
            Your pathway from learning to becoming career-ready.
          </p>
          <p className="mt-4 max-w-xl text-ink-foreground/75">
            DIM Career brings together personalized guidance, learning paths, practical skills,
            projects, certifications, portfolios, career preparation, networking and opportunities
            in one connected ecosystem.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to="/roadmap">
                Build My Career Path <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <a href="#career-features">Explore Career Features</a>
            </Button>
          </div>
        </div>

        <ul className="grid gap-2" aria-label="Career progression">
          {HERO_FLOW.map((step, i) => (
            <li
              key={step}
              className="flex items-center gap-3 rounded-2xl border border-ink-foreground/15 bg-ink-foreground/5 px-4 py-3 backdrop-blur-sm transition-colors hover:bg-ink-foreground/10 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gold/25 text-[11px] font-bold text-gold">
                {i + 1}
              </span>
              <span className="text-sm font-semibold uppercase tracking-[0.12em]">{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Problem() {
  const without = [
    "Courses",
    "Random tools",
    "Unclear roadmap",
    "Scattered projects",
    "Separate job searches",
    "Limited guidance",
  ];
  const withDim = [
    "Goal",
    "Roadmap",
    "Learning",
    "Building",
    "Portfolio",
    "Preparation",
    "Networking",
    "Opportunities",
    "Growth",
  ];
  return (
    <section>
      <SectionHeading
        eyebrow="The problem"
        title="Your Career Journey Shouldn't Feel Fragmented."
        lead="Learning, skills development, projects, certifications, CV preparation, interview preparation, networking, mentorship, jobs, internships and career guidance usually live on completely separate platforms. DIM Career brings the pieces together."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-muted/40 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Without a connected system
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {without.map((w) => (
              <span
                key={w}
                className="rounded-xl border border-dashed border-border bg-background px-3 py-1.5 text-sm text-muted-foreground"
              >
                {w}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-primary/25 bg-card p-6 shadow-lift">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            With DIM Career
          </p>
          <ol className="mt-4 flex flex-wrap items-center gap-2 text-sm font-semibold">
            {withDim.map((w, i) => (
              <li key={w} className="flex items-center gap-2">
                <span className="rounded-xl bg-primary/10 px-3 py-1.5 text-primary">{w}</span>
                {i < withDim.length - 1 ? (
                  <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden />
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Advisor() {
  return (
    <section>
      <SectionHeading
        eyebrow="Product preview"
        title="Meet Your Career AI Advisor."
        lead="Get personalized career guidance based on your goals, skills, experience, interests, certifications, portfolio and learning progress."
      />
      <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-lift">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-5 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-primary" aria-hidden /> Career AI Advisor
          </p>
          <span className="rounded-full bg-background px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Example preview
          </span>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          {[
            { k: "Career goal", v: "AI Product Manager" },
            { k: "Current skills", v: "AI • Research • Communication" },
            { k: "Potential skill gaps", v: "Product Strategy · AI Product Development · Data Analysis" },
            { k: "Recommended next step", v: "AI Product Management Foundations" },
          ].map((row) => (
            <div key={row.k} className="rounded-2xl border border-border bg-background p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {row.k}
              </p>
              <p className="mt-1.5 font-semibold">{row.v}</p>
            </div>
          ))}
          <div className="rounded-2xl bg-primary/10 p-4 sm:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Next milestone
            </p>
            <p className="mt-1.5 font-semibold">Build your first AI product case study.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-border px-5 py-4 sm:px-6">
          <Cta link={{ label: "Explore Career AI Advisor", to: "/coming-soon", soon: true }} />
          <p className="text-xs text-muted-foreground">
            The advisor is still being built — this is an illustration, not your data.
          </p>
        </div>
      </div>
    </section>
  );
}

function Roadmap() {
  return (
    <section>
      <SectionHeading
        eyebrow="Roadmap"
        title="Know Where You're Going."
        lead="Your Career Roadmap turns a career ambition into a structured journey."
      />
      <ol className="mt-8 flex flex-wrap gap-2">
        {ROADMAP_FLOW.map((step, i) => (
          <li
            key={step}
            className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-semibold shadow-sm"
          >
            <span className="text-[11px] font-bold text-primary">
              {String(i + 1).padStart(2, "0")}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <div className="mt-6">
        <Cta link={{ label: "Create My Roadmap", to: "/roadmap" }} variant="default" />
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="career-features" className="scroll-mt-24">
      <SectionHeading
        eyebrow="The system"
        title="Everything You Need to Accelerate Your Career."
        lead="DIM Career connects the skills, experience, tools, people and opportunities that can move you forward."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CAREER_FEATURES.map((f) => (
          <article
            key={f.n}
            className="flex flex-col rounded-3xl border border-border bg-card p-6 transition-shadow hover:shadow-lift"
          >
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Icon name={f.icon} className="size-5" />
              </span>
              <span className="font-display text-sm font-bold text-muted-foreground">{f.n}</span>
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">{f.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
            <ul className="mt-4 grid gap-1.5">
              {f.helps.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 pt-1">
              <Cta link={f.cta} className="w-full" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Journey() {
  const [open, setOpen] = useState<string | null>(CAREER_JOURNEY[0]!.key);
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const total = r.height + window.innerHeight;
      const seen = window.innerHeight - r.top;
      setProgress(Math.min(1, Math.max(0, seen / total)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section>
      <SectionHeading
        eyebrow="Signature experience"
        title="Your Career Journey, Connected."
        lead="Your career isn't one step. It's a journey. DIM Career connects the steps."
      />

      <div ref={ref} className="relative mt-10 pl-8 sm:pl-10">
        <div className="absolute left-3 top-0 h-full w-0.5 rounded bg-border sm:left-4" aria-hidden>
          <div
            className="w-full rounded bg-ember transition-[height] duration-300 motion-reduce:transition-none"
            style={{ height: `${Math.round(progress * 100)}%` }}
          />
        </div>

        <ol className="space-y-4">
          {CAREER_JOURNEY.map((s) => {
            const isOpen = open === s.key;
            return (
              <li key={s.key} className="relative">
                <span
                  className={cn(
                    "absolute -left-[1.42rem] top-6 grid size-6 place-items-center rounded-full border-2 border-background text-[10px] font-bold transition-all sm:-left-[1.67rem]",
                    isOpen
                      ? "scale-110 bg-primary text-primary-foreground shadow-glow"
                      : "bg-muted text-muted-foreground",
                  )}
                  aria-hidden
                >
                  {s.n}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : s.key)}
                  aria-expanded={isOpen}
                  className={cn(
                    "w-full rounded-3xl border bg-card p-5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isOpen ? "border-primary/40 shadow-lift" : "border-border hover:border-primary/30",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid size-9 place-items-center rounded-2xl transition-transform",
                        isOpen ? "scale-105 bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon name={s.icon} className="size-4" />
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                        {s.n} — {s.title}
                      </p>
                      <h3 className="font-display text-lg font-bold">{s.headline}</h3>
                    </div>
                  </div>

                  {isOpen ? (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">{s.body}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {s.examples.map((e) => (
                          <span
                            key={e}
                            className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </button>
                {isOpen ? (
                  <div className="mt-3">
                    <Cta link={s.cta} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-10 rounded-3xl bg-elite p-6 text-ink-foreground sm:p-10">
        <h3 className="font-display text-2xl font-bold sm:text-3xl">Keep growing.</h3>
        <p className="mt-3 max-w-2xl text-ink-foreground/80">
          Your career journey doesn't end when you reach an opportunity. DIM is designed to help you
          continue learning, building, connecting, earning and growing.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gold/20 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gold">
            DIM Career
          </span>
          <ArrowRight className="size-4 text-ink-foreground/60" aria-hidden />
          {STAGES.map((s, i) => (
            <span key={s.key} className="flex items-center gap-2">
              <Link
                to={dest(s.to)}
                className="rounded-full bg-ink-foreground/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] hover:bg-ink-foreground/20"
              >
                {s.label}
              </Link>
              {i < STAGES.length - 1 ? (
                <ArrowRight className="size-3.5 text-ink-foreground/50" aria-hidden />
              ) : null}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  const rows = [
    { k: "Career goal", v: "AI Product Manager" },
    { k: "Current focus", v: "AI Product Development" },
    { k: "Current learning path", v: "AI Product Management" },
    { k: "Projects", v: "3" },
    { k: "Certifications", v: "1" },
    { k: "CV", v: "Ready for review" },
  ];
  const bars = [
    { k: "Career progress", v: 42 },
    { k: "Portfolio", v: 78 },
    { k: "Interview readiness", v: 64 },
  ];
  return (
    <section>
      <SectionHeading
        eyebrow="Product preview"
        title="My Career, At a Glance."
        lead="An illustration of how your career dashboard is designed to work. Your own numbers live in Progress."
      />
      <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-lift sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <div key={r.k} className="rounded-2xl border border-border bg-background p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {r.k}
              </p>
              <p className="mt-1.5 font-semibold">{r.v}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {bars.map((b) => (
            <div key={b.k} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>{b.k}</span>
                <span className="text-primary">{b.v}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-ember" style={{ width: `${b.v}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-primary/10 p-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Next recommended action
            </p>
            <p className="mt-1 font-semibold">Complete your AI product case study.</p>
          </div>
          <Cta link={{ label: "View My Progress", to: "/progress" }} variant="default" />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Example figures shown for illustration — not your personal data.
        </p>
      </div>
    </section>
  );
}

function Tools() {
  const cats = [
    "Research",
    "Learning",
    "Productivity",
    "Writing",
    "Presentations",
    "Data",
    "Coding",
    "Career preparation",
    "Portfolio development",
    "Job preparation",
  ];
  return (
    <section>
      <SectionHeading
        eyebrow="Career tools"
        title="Learn Faster. Work Smarter."
        lead="The Career AI Tools Directory gathers AI and digital tools that help you prepare, research and build more efficiently."
      />
      <div className="mt-6 flex flex-wrap gap-2">
        {cats.map((c) => (
          <span
            key={c}
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium"
          >
            {c}
          </span>
        ))}
      </div>
      <div className="mt-6">
        <Cta link={{ label: "Explore Career AI Tools", to: "/tools" }} variant="default" />
      </div>
    </section>
  );
}

function PortfolioToOpportunity() {
  const flow = ["Skill", "Project", "Portfolio", "Profile", "Opportunity"];
  return (
    <section className="rounded-3xl border border-border bg-muted/30 p-6 sm:p-10">
      <SectionHeading
        eyebrow="Proof"
        title="Don't Just Say You Have Skills. Show Them."
        lead="DIM Career is designed to help you move from knowing something to demonstrating what you can do."
      />
      <ol className="mt-8 grid gap-3 sm:grid-cols-5">
        {flow.map((f, i) => (
          <li
            key={f}
            className="rounded-2xl border border-border bg-card p-4 text-center font-display font-bold"
          >
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Step {i + 1}
            </span>
            {f}
          </li>
        ))}
      </ol>
      <div className="mt-6">
        <Cta link={{ label: "Start Building My Portfolio", to: "/portfolio" }} variant="default" />
      </div>
    </section>
  );
}

function ConnectSection() {
  const cards = [
    {
      title: "Community",
      line: "Learn with others.",
      icon: "messages-square",
      cta: { label: "Open Community", to: "/community" } as CareerLink,
    },
    {
      title: "Networking",
      line: "Meet people with shared interests and goals.",
      icon: "users-round",
      cta: { label: "Start Networking", to: "/connect" } as CareerLink,
    },
    {
      title: "Mentorship",
      line: "Learn from experienced people when opportunities are available.",
      icon: "compass",
      cta: { label: "Explore Mentorship", to: "/coming-soon", soon: true } as CareerLink,
    },
  ];
  return (
    <section>
      <SectionHeading
        eyebrow="People"
        title="Your Career Doesn't Have to Be a Solo Journey."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <article key={c.title} className="rounded-3xl border border-border bg-card p-6">
            <span className="grid size-10 place-items-center rounded-2xl bg-connect/10 text-connect">
              <Icon name={c.icon} className="size-5" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold">{c.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.line}</p>
            <div className="mt-5">
              <Cta link={c.cta} className="w-full" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Opportunities() {
  return (
    <section>
      <SectionHeading
        eyebrow="Next steps"
        title="Learning Should Lead Somewhere."
        lead="DIM Career connects preparation with potential next steps: discover opportunities, prepare for them and build evidence of your capabilities."
      />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CAREER_OPPORTUNITY_CARDS.map((o) => (
          <Link
            key={o.label}
            to={dest(o.to)}
            className="rounded-2xl border border-border bg-card p-5 font-semibold transition-shadow hover:shadow-lift"
          >
            {o.label}
            {o.soon ? (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Soon
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}

function Audiences() {
  return (
    <section>
      <SectionHeading eyebrow="Where you're starting from" title="DIM Career for Different People." />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CAREER_AUDIENCES.map((a) => (
          <article key={a.title} className="flex flex-col rounded-3xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-bold">{a.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{a.line}</p>
            <ul className="mt-4 grid gap-1.5 text-sm">
              {a.items.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  {i}
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <Cta link={a.cta} className="w-full" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Ecosystem() {
  return (
    <section>
      <SectionHeading
        eyebrow="Ecosystem"
        title="Career Doesn't Exist in Isolation."
        lead="DIM Career connects these parts of the DIM ecosystem to help you progress professionally."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {STAGES.map((s) => (
          <Link
            key={s.key}
            to={dest(s.to)}
            className="rounded-3xl border border-border bg-card p-5 transition-shadow hover:shadow-lift"
          >
            <p className="font-display text-lg font-bold">{s.label}</p>
            <p className="mt-2 text-sm text-muted-foreground">{s.blurb}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ValueProp() {
  const parts = [
    "Your goal",
    "Your skills",
    "Your learning",
    "Your projects",
    "Your network",
    "Your opportunities",
  ];
  return (
    <section className="rounded-3xl bg-elite p-6 text-ink-foreground sm:p-10">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">More Than Courses.</h2>
      <div className="mt-6 flex flex-wrap gap-2">
        {parts.map((p) => (
          <span
            key={p}
            className="rounded-2xl bg-ink-foreground/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em]"
          >
            {p}
          </span>
        ))}
      </div>
      <p className="mt-6 font-display text-xl font-bold text-gold">= Your career journey</p>
      <p className="mt-3 max-w-2xl text-ink-foreground/80">
        DIM Career is designed to bring the pieces of career development together into one connected
        experience.
      </p>
    </section>
  );
}

function Personalization() {
  const options: { title: string; cta: CareerLink }[] = [
    { title: "I'm just starting", cta: { label: "Start Learning", to: "/learn" } },
    { title: "I'm building my skills", cta: { label: "Build Projects", to: "/build" } },
    {
      title: "I'm ready for opportunities",
      cta: { label: "Prepare & Explore", to: "/portfolio" },
    },
  ];
  return (
    <section>
      <SectionHeading title="Where Are You On Your Career Journey?" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {options.map((o) => (
          <article key={o.title} className="rounded-3xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-bold">{o.title}</h3>
            <div className="mt-4">
              <Cta link={o.cta} className="w-full" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function HubContent() {
  return (
    <section>
      <SectionHeading
        eyebrow="In the hub"
        title="Career Learning & Resources."
        lead="What do I need to become job-ready and accelerate my career?"
      />
      <div className="mt-2">
        <HubPage
          bare
          hub="career"
          eyebrow="Career"
          title="Career Hub"
          description=""
          question=""
        />
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="rounded-3xl border border-primary/25 bg-card p-6 text-center shadow-lift sm:p-12">
      <h2 className="font-display text-3xl font-bold sm:text-4xl">
        Your Next Career Move Starts Here.
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
        Discover what you need to learn, build, prove, connect and pursue next.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button size="lg" asChild>
          <Link to="/progress">
            Start My Career Journey <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <a href="#career-features">Explore DIM Career</a>
        </Button>
      </div>
      <div className="mt-10 border-t border-border pt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
          DIM Career
        </p>
        <p className="mt-3 font-display text-lg font-bold leading-relaxed">
          Discover your direction. Build your capabilities. Prove what you can do. Connect with
          people. Pursue opportunities. Keep growing.
        </p>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          DIM · Learn → Build → Connect → Earn → Grow
        </p>
      </div>
    </section>
  );
}
