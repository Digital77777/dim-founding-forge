import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/dim/AppShell";
import { PageHeader } from "@/components/dim/PageHeader";
import { Progress as Bar } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";
import { STAGES, stageClasses } from "@/lib/dim";

export const Route = createFileRoute("/_authenticated/progress")({
  component: ProgressPage,
});

function ProgressPage() {
  const { userId, earned } = useMember();

  const stats = useQuery({
    queryKey: ["progress", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [lessons, totalLessons, courses, projects, posts, comments, tools, saves] =
        await Promise.all([
          supabase.from("lesson_progress").select("id", { count: "exact", head: true }).eq("user_id", userId!),
          supabase.from("lessons").select("id", { count: "exact", head: true }),
          supabase
            .from("enrollments")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId!)
            .not("completed_at", "is", null),
          supabase.from("projects").select("id", { count: "exact", head: true }).eq("user_id", userId!),
          supabase.from("posts").select("id", { count: "exact", head: true }).eq("user_id", userId!),
          supabase.from("comments").select("id", { count: "exact", head: true }).eq("user_id", userId!),
          supabase.from("tool_views").select("id", { count: "exact", head: true }).eq("user_id", userId!),
          supabase.from("tool_saves").select("id", { count: "exact", head: true }).eq("user_id", userId!),
        ]);
      return {
        lessons: lessons.count ?? 0,
        totalLessons: Math.max(totalLessons.count ?? 1, 1),
        courses: courses.count ?? 0,
        projects: projects.count ?? 0,
        posts: posts.count ?? 0,
        comments: comments.count ?? 0,
        tools: tools.count ?? 0,
        saves: saves.count ?? 0,
      };
    },
  });

  const s = stats.data;
  const pct: Record<string, number> = {
    learn: s ? Math.min(100, Math.round((s.lessons / s.totalLessons) * 100)) : 0,
    build: s ? Math.min(100, s.projects * 25) : 0,
    connect: s ? Math.min(100, (s.posts + s.comments) * 10) : 0,
    earn: s ? Math.min(100, s.saves * 10 + s.tools * 2) : 0,
    grow: Math.min(100, earned.length * 12),
  };

  const metrics = [
    { label: "Lessons completed", value: s?.lessons ?? 0 },
    { label: "Courses completed", value: s?.courses ?? 0 },
    { label: "Projects", value: s?.projects ?? 0 },
    { label: "Community posts", value: s?.posts ?? 0 },
    { label: "Comments", value: s?.comments ?? 0 },
    { label: "Tools explored", value: s?.tools ?? 0 },
    { label: "Tools saved", value: s?.saves ?? 0 },
    { label: "Achievements", value: earned.length },
  ];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Progress"
        title="Member scorecard"
        description="Guidance, not judgement. This shows where you're investing your time across the DIM loop so you can rebalance on purpose."
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STAGES.map((stage) => (
          <div key={stage.key} className="rounded-2xl border border-border bg-card p-5">
            <p className={`font-display text-lg font-bold ${stageClasses[stage.key].text}`}>
              {stage.label}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stage.promise}</p>
            <Bar value={pct[stage.key] ?? 0} className="mt-4" />
            <p className="mt-2 text-xs tabular-nums text-muted-foreground">{pct[stage.key] ?? 0}%</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="font-display text-3xl font-extrabold tabular-nums">{m.value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {m.label}
            </p>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
