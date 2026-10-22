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
  const { userId } = useMember();
  const [path, setPath] = useState<string | null>(null);

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
      return {
        paths: paths.data ?? [],
        courses: courses.data ?? [],
        enrolments: enrolments.data ?? [],
        progress: progress.data ?? [],
        lessonCount: (lessons.data ?? []).length,
      };
    },
  });

  const d = data.data;
  const enrolled = new Set((d?.enrolments ?? []).map((e) => e.course_slug));
  const doneByCourse = (d?.progress ?? []).reduce<Record<string, number>>((acc, p) => {
    acc[p.course_slug] = (acc[p.course_slug] ?? 0) + 1;
    return acc;
  }, {});

  const courses = (d?.courses ?? []).filter((c) => !path || c.path_slug === path);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Learn"
        title="Learning Hub"
        description="Structured paths built around what you want to achieve. Complete lessons, track progress and unlock achievements as you go."
      />

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
              <Button className="mt-4" variant={enrolled.has(c.slug) ? "default" : "outline"} asChild>
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
