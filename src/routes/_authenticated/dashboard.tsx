import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/dim/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FoundingBadge, foundingLabel } from "@/components/dim/FoundingBadge";
import { supabase } from "@/integrations/supabase/client";
import { firstName, greeting, useMember, useInvalidateMember } from "@/hooks/use-member";
import { BETA_AVAILABILITY, STAGES, stageClasses } from "@/lib/dim";

export const Route = createFileRoute("/_authenticated/dashboard")({
  staticData: { sitemap: false },
  component: Dashboard,
});

function Dashboard() {
  const { user, userId, profile, membership, earned, isLoading } = useMember();
  const invalidateMember = useInvalidateMember();
  const [claiming, setClaiming] = useState(false);

  // Claim the Founding Member number on first arrival.
  useEffect(() => {
    if (!userId || isLoading || membership || claiming) return;
    setClaiming(true);
    const name = (profile?.full_name ?? user?.user_metadata?.["full_name"] ?? null) as
      string | null;
    supabase.rpc("claim_membership", name ? { _full_name: name } : {}).then(() => {
      invalidateMember();
    });
  }, [userId, isLoading, membership, claiming, profile, user, invalidateMember]);

  const stats = useQuery({
    queryKey: ["dashboard-stats", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [lessons, totalLessons, projects, posts, tools, courses] = await Promise.all([
        supabase
          .from("lesson_progress")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId!),
        supabase.from("lessons").select("id", { count: "exact", head: true }),
        supabase
          .from("projects")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId!),
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("user_id", userId!),
        supabase
          .from("tool_views")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId!),
        supabase.from("courses").select("slug,title,description,level,duration_minutes").limit(3),
      ]);
      return {
        lessons: lessons.count ?? 0,
        totalLessons: totalLessons.count ?? 1,
        projects: projects.count ?? 0,
        posts: posts.count ?? 0,
        tools: tools.count ?? 0,
        nextCourses: courses.data ?? [],
      };
    },
  });

  const s = stats.data;
  const pct = {
    learn: s ? Math.min(100, Math.round((s.lessons / Math.max(s.totalLessons, 1)) * 100)) : 0,
    build: s ? Math.min(100, s.projects * 25) : 0,
    connect: s ? Math.min(100, s.posts * 20) : 0,
    earn: s ? Math.min(100, s.tools * 5) : 0,
    grow: Math.min(100, earned.length * 12),
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl bg-elite px-6 py-10 text-ink-foreground sm:px-10">
          <FoundingBadge number={membership?.founding_number ?? null} size="md" />
          <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
            {greeting()}, {firstName(profile, user)}.
          </h1>
          <p className="mt-3 max-w-xl text-ink-foreground/85">
            Welcome to DIM ELITE. You're one of the first 1,000 people helping shape the future of
            Digital Intelligence Marketplace.
          </p>
          {membership?.founding_number ? (
            <p className="mt-4 text-sm font-semibold tracking-[0.16em] text-gold">
              Founding Member {foundingLabel(membership.founding_number)}
            </p>
          ) : null}
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">Your DIM journey</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Learn → Build → Connect → Earn → Grow. Not a score — a picture of where you're investing
            your time.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STAGES.map((stage) => (
              <div key={stage.key} className="rounded-2xl border border-border bg-card p-5">
                <p className={`font-display text-lg font-bold ${stageClasses[stage.key].text}`}>
                  {stage.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{stage.promise}</p>
                <Progress value={pct[stage.key]} className="mt-4" />
                <p className="mt-2 text-xs tabular-nums text-muted-foreground">{pct[stage.key]}%</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
            <h3 className="font-display text-lg font-bold">Your focus today</h3>
            <ul className="mt-4 space-y-3">
              {(s?.nextCourses ?? []).map((c) => (
                <li key={c.slug} className="rounded-xl border border-border p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-learn">
                    Continue learning
                  </p>
                  <p className="mt-1 font-semibold">{c.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-bold">Elite Beta</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              You are helping build DIM. Your feedback helps shape the platform.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">{BETA_AVAILABILITY}</p>
            <Button variant="outline" className="mt-5 w-full" asChild>
              <Link to="/elite-beta">Share beta feedback</Link>
            </Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
