import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Crown } from "lucide-react";
import { useEffect, useState } from "react";

import { AuthLoading } from "@/components/dim/AuthLoading";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { getFoundingStats } from "@/lib/public.functions";
import {
  BETA_AVAILABILITY,
  ELITE_INCLUDES,
  FOUNDING_CAP,
  STAGES,
  TIERS,
  stageClasses,
} from "@/lib/dim";

const TITLE = "DIM ELITE — The First 1,000 Founding Members";
const DESCRIPTION =
  "The complete Digital Intelligence Marketplace experience. Learn, build, connect, earn and grow — free during the Elite Beta for the first 1,000 founding members.";

export const Route = createFileRoute("/")({
  loader: () => getFoundingStats(),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  errorComponent: () => <Landing stats={{ taken: 0, remaining: FOUNDING_CAP, cap: FOUNDING_CAP }} />,
  component: LandingRoute,
});

function LandingRoute() {
  const stats = Route.useLoaderData();
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session) {
        setSignedIn(true);
        navigate({ to: "/dashboard", replace: true });
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) {
        setSignedIn(true);
        navigate({ to: "/dashboard", replace: true });
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  if (signedIn) return <AuthLoading label="Taking you into DIM ELITE…" />;

  return <Landing stats={stats} signedIn={signedIn} />;
}

function Landing({
  stats,
  signedIn = false,
}: {
  stats: { taken: number; remaining: number; cap: number };
  signedIn?: boolean;
}) {
  return (
    <main>
      <section className="relative overflow-hidden bg-elite text-ink-foreground">
        <div className="absolute inset-0 grid-paper opacity-[0.15]" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/12 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
            <Crown className="size-3.5" aria-hidden />
            Founding {FOUNDING_CAP.toLocaleString()} Beta
          </span>

          <h1 className="mt-8 max-w-3xl text-5xl font-bold leading-[0.95] sm:text-7xl">
            DIM ELITE
            <span className="block text-ember">The first 1,000.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-ink-foreground/85">
            The complete Digital Intelligence Marketplace experience — one app, one account, one
            ecosystem. Free during the Elite Beta.
          </p>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-ink-foreground/70">
            Learn. Build. Connect. Earn. Grow.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button size="lg" asChild>
              <Link to={signedIn ? "/dashboard" : "/auth"}>
                {signedIn ? "Enter the app" : "Become a founding member"}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <div className="rounded-xl border border-ink-foreground/20 px-4 py-2 text-sm">
              <span className="font-semibold tabular-nums text-gold">
                {stats.remaining.toLocaleString()}
              </span>{" "}
              of {stats.cap.toLocaleString()} founding spots remaining
            </div>
          </div>

          <p className="mt-6 max-w-lg text-xs text-ink-foreground/60">{BETA_AVAILABILITY}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold sm:text-4xl">The DIM loop</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Everything in DIM connects. You learn something, apply it, meet people doing the same,
          find opportunities, and grow — then go round again.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STAGES.map((stage, i) => (
            <div
              key={stage.key}
              className={`rounded-2xl border border-border bg-card p-5 shadow-lift ring-1 ${stageClasses[stage.key].ring}`}
            >
              <span className={`text-xs font-semibold tabular-nums ${stageClasses[stage.key].text}`}>
                0{i + 1}
              </span>
              <h3 className={`mt-2 text-xl font-bold ${stageClasses[stage.key].text}`}>
                {stage.label}
              </h3>
              <p className="mt-1 text-sm font-medium">{stage.promise}</p>
              <p className="mt-3 text-sm text-muted-foreground">{stage.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold sm:text-4xl">What's included with Elite</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {ELITE_INCLUDES.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">
            Features still in development appear inside Elite marked{" "}
            <span className="font-semibold">Coming Soon — Included in DIM Elite</span>, so founding
            members can see the ecosystem as it develops.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold sm:text-4xl">Where Elite sits</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          The public tiers each answer a different need. Elite answers all of them at once, for the
          first 1,000 members.
        </p>

        <div className="mt-10 grid gap-4 lg:grid-cols-5">
          {TIERS.map((tier) => (
            <div key={tier.name} className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-display text-lg font-bold">{tier.name}</h3>
              <p className="mt-1 text-2xl font-bold">{tier.price}</p>
              <p className="text-xs text-muted-foreground">{tier.cadence}</p>
              <p className="mt-3 text-sm italic text-muted-foreground">"{tier.line}"</p>
              <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                {tier.features.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
            </div>
          ))}

          <div className="rounded-2xl border-2 border-gold bg-ember p-5 text-primary-foreground shadow-glow">
            <h3 className="font-display text-lg font-bold">Elite</h3>
            <p className="mt-1 text-2xl font-bold">Free</p>
            <p className="text-xs opacity-85">during the Founding 1,000 Beta</p>
            <p className="mt-3 text-sm italic opacity-90">"I want the full DIM experience."</p>
            <ul className="mt-4 space-y-1.5 text-xs opacity-90">
              <li>· Creator + Career + core ecosystem</li>
              <li>· Coming Soon features as they launch</li>
              <li>· Founding Member status retained</li>
              <li>· No fixed beta end date</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-ink py-20 text-ink-foreground">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            The first 1,000 aren't just users of DIM.
            <span className="block text-ember">They're the people helping build DIM.</span>
          </h2>
          <p className="mt-6 text-ink-foreground/80">
            Founding Members keep their status beyond the beta, with a visible marker on their
            profile, posts and achievements.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link to="/auth">
              Claim your founding place
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-6xl px-6 text-xs text-muted-foreground">
          <p className="font-semibold uppercase tracking-[0.2em]">
            Digital Intelligence Marketplace
          </p>
          <p className="mt-2">{BETA_AVAILABILITY}</p>
        </div>
      </footer>
    </main>
  );
}
