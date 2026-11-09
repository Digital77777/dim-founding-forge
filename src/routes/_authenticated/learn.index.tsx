import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AppShell } from "@/components/dim/AppShell";
import { PageHeader } from "@/components/dim/PageHeader";
import { Icon } from "@/components/dim/Icon";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/learn/")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Learning Hub — DIM Elite" },
      {
        name: "description",
        content: "Learning paths, courses and lessons that take you from AI curious to AI capable.",
      },
      { property: "og:title", content: "Learning Hub — DIM Elite" },
      { property: "og:description", content: "Learning paths and courses inside DIM Elite." },
    ],
  }),
  component: LearnHub,
});

function LearnHub() {
  const { userId, profile } = useMember();
  const [path, setPath] = useState<string | null>(null);
  const [planner, setPlanner] = useState({ goal: "", level: "", time: "", outcome: "" });
  const [hasPlan, setHasPlan] = useState(false);

  const data = useQuery({
    queryKey: ["learn-hub", userId],
    queryFn: async () => {
      const [paths, courses, enrolments, progress, lessons] = await Promise.all([
        supabase.from("learning_paths").select("*").order("sort"),
        supabase.from("courses").select("*").order("sort"),
        userId
          ? supabase.from("enrollments").select("course_slug, completed_at").eq("user_id", userId)
          : Promise.resolve({ data: [] }),
        userId
          ? supabase.from("lesson_progress").select("course_slug").eq("user_id", userId)
          : Promise.resolve({ data: [] }),
        supabase.from("lessons").select("id, module_id"),
      ]);
      if (paths.error) throw paths.error;
      if (courses.error) throw courses.error;

      return {
        paths: paths.data ?? [],
        courses: courses.data ?? [],
        enrolments: enrolments.data ?? [],
        progress: progress.data ?? [],
        lessonCount: (lessons.data ?? []).length,
      };
    },
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const d = data.data;
  const enrolled = new Set((d?.enrolments ?? []).map((e) => e.course_slug));
  const doneByCourse = (d?.progress ?? []).reduce<Record<string, number>>((acc, p) => {
    acc[p.course_slug] = (acc[p.course_slug] ?? 0) + 1;
    return acc;
  }, {});

  const courses = (d?.courses ?? []).filter((c) => !path || c.path_slug === path);
  const focusTerms = [
    profile?.career_goal,
    profile?.industry,
    ...(profile?.goals ?? []),
    ...(profile?.interests ?? []),
    ...(profile?.skills ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const profileRecommendedPath = (d?.paths ?? [])
    .map((candidate) => ({
      candidate,
      score: `${candidate.title} ${candidate.description ?? ""}`
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 3 && focusTerms.includes(word)).length,
    }))
    .sort((a, b) => b.score - a.score)[0]?.candidate;
  const recommendedPath = hasPlan
    ? ((d?.paths ?? []).find((candidate) => candidate.slug === path) ?? profileRecommendedPath)
    : profileRecommendedPath;
  const recommendedCourse =
    (d?.courses ?? []).find((course) => course.path_slug === recommendedPath?.slug) ??
    d?.courses?.[0];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Learn"
        title="Learning Hub"
        description="Structured paths built around what you want to achieve. Complete lessons, track progress and unlock achievements as you go."
      />

      {data.error ? (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          We couldn&apos;t load the course catalog. Refresh the page and try again.
        </div>
      ) : null}

      <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Find your starting point
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            What would you like to learn?
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Answer four quick questions and we&apos;ll suggest a path built around your goals.
          </p>
        </div>
        <form
          className="mt-6 grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const goalMap: Record<string, string> = {
              create: "ai-creator",
              career: "ai-career",
              business: "ai-entrepreneur",
              productivity: "digital-productivity",
              tools: "ai-tools-mastery",
              future: "future-of-work",
              share: "build-in-public",
            };
            const match = goalMap[planner.goal];
            const selected =
              d?.paths?.find((candidate) => candidate.slug === match) ?? d?.paths?.[0];
            setPath(selected?.slug ?? null);
            setHasPlan(true);
          }}
        >
          <label className="grid gap-2 text-sm font-semibold">
            I want to…
            <select
              required
              value={planner.goal}
              onChange={(event) => setPlanner({ ...planner, goal: event.target.value })}
              className="h-11 rounded-xl border border-border bg-background px-3 font-normal"
            >
              <option value="">Choose a goal</option>
              <option value="create">Create better content</option>
              <option value="career">Grow my career</option>
              <option value="business">Build a business</option>
              <option value="productivity">Work more effectively</option>
              <option value="tools">Master AI tools</option>
              <option value="future">Prepare for the future</option>
              <option value="share">Build in public</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            I&apos;m starting at…
            <select
              required
              value={planner.level}
              onChange={(event) => setPlanner({ ...planner, level: event.target.value })}
              className="h-11 rounded-xl border border-border bg-background px-3 font-normal"
            >
              <option value="">Choose your level</option>
              <option>Brand new to this</option>
              <option>I know the basics</option>
              <option>Ready for a challenge</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            I can learn for…
            <select
              required
              value={planner.time}
              onChange={(event) => setPlanner({ ...planner, time: event.target.value })}
              className="h-11 rounded-xl border border-border bg-background px-3 font-normal"
            >
              <option value="">Choose a pace</option>
              <option>15 minutes a day</option>
              <option>30 minutes a day</option>
              <option>A few hours a week</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            I want to finish with…
            <select
              required
              value={planner.outcome}
              onChange={(event) => setPlanner({ ...planner, outcome: event.target.value })}
              className="h-11 rounded-xl border border-border bg-background px-3 font-normal"
            >
              <option value="">Choose an outcome</option>
              <option>A useful project</option>
              <option>A portfolio piece</option>
              <option>A repeatable workflow</option>
              <option>A launch-ready idea</option>
            </select>
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full sm:w-auto">
              {hasPlan ? "Update my recommendations" : "Show my recommendations"}
            </Button>
          </div>
        </form>
      </section>

      <section className="mt-8 overflow-hidden rounded-3xl border border-learn/20 bg-gradient-to-br from-learn/10 via-card to-primary/5 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-learn">
              Your next best step
            </p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              {profile?.career_goal
                ? `Build toward ${profile.career_goal}`
                : "Turn learning into something real"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Your path is designed around momentum: learn one useful concept, apply it in a
              project, and leave with work you can show.
            </p>
          </div>
          {recommendedCourse ? (
            <Button asChild>
              <Link to="/learn/$course" params={{ course: recommendedCourse.slug }}>
                Start recommended course
              </Link>
            </Button>
          ) : null}
        </div>
        {recommendedPath ? (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-4">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-learn/15 text-learn">
              <Icon name={recommendedPath.icon ?? "graduation-cap"} className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Recommended path
              </p>
              <p className="truncate font-display font-bold">{recommendedPath.title}</p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold">Learning paths</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setPath(null)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium",
              !path ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted",
            )}
          >
            All paths
          </button>
          {(d?.paths ?? []).map((p) => (
            <button
              key={p.slug}
              onClick={() => setPath(p.slug)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
                path === p.slug
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted",
              )}
            >
              <Icon name={p.icon ?? "graduation-cap"} className="size-4" />
              {p.title}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((c) => {
          const done = doneByCourse[c.slug] ?? 0;
          return (
            <article
              key={c.slug}
              className="flex flex-col rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-lift"
            >
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-learn">
                <span>{c.level}</span>
                <span className="text-muted-foreground">· {c.duration_minutes} min</span>
              </div>
              <h3 className="mt-2 font-display text-lg font-bold">{c.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{c.description}</p>
              {done > 0 ? (
                <>
                  <Progress value={Math.min(100, done * 20)} className="mt-4" />
                  <p className="mt-2 text-xs text-muted-foreground">{done} lessons completed</p>
                </>
              ) : null}
              <Button
                className="mt-4"
                variant={enrolled.has(c.slug) ? "default" : "outline"}
                asChild
              >
                <Link to="/learn/$course" params={{ course: c.slug }}>
                  {enrolled.has(c.slug) ? "Continue course" : "View course"}
                </Link>
              </Button>
            </article>
          );
        })}
        {!data.isLoading && courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No courses in this path yet.</p>
        ) : null}
      </section>
    </AppShell>
  );
}
