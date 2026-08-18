import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/dim/AppShell";
import { PageHeader } from "@/components/dim/PageHeader";
import { Button } from "@/components/ui/button";
import { COMING_SOON_FEATURES } from "@/lib/dim";

export const Route = createFileRoute("/_authenticated/coming-soon")({
  component: ComingSoonIndex,
});

function ComingSoonIndex() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Coming soon"
        title="What's next in DIM Elite"
        description="Every one of these is included in DIM Elite. As a founding member you get access as each one launches."
      />
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {COMING_SOON_FEATURES.map((f) => (
          <article key={f.key} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-foreground">
              Coming soon
            </p>
            <h2 className="mt-2 font-display text-lg font-bold">{f.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{f.summary}</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to={f.to}>Learn more</Link>
            </Button>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
