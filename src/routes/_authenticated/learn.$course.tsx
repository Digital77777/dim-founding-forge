import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/dim/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";
import { awardAchievement } from "@/lib/member-actions";

export const Route = createFileRoute("/_authenticated/learn/$course")({
  component: CoursePage,
});

function CoursePage() {
  const { course } = Route.useParams();
  const { userId } = useMember();
  const queryClient = useQueryClient();

  const data = useQuery({
    queryKey: ["course", course, userId],
    queryFn: async () => {
      const [courseRes, modulesRes] = await Promise.all([
        supabase.from("courses").select("*").eq("slug", course).maybeSingle(),
        supabase.from("modules").select("*").eq("course_slug", course).order("sort"),
      ]);
      const moduleIds = (modulesRes.data ?? []).map((m) => m.id);
      const [lessonsRes, progressRes, enrolRes] = await Promise.all([
        moduleIds.length
          ? supabase.from("lessons").select("*").in("module_id", moduleIds).order("sort")
          : Promise.resolve({ data: [] }),
        userId
          ? supabase.from("lesson_progress").select("lesson_id").eq("user_id", userId)
          : Promise.resolve({ data: [] }),
        userId
          ? supabase
              .from("enrollments")
              .select("id")
              .eq("user_id", userId)
              .eq("course_slug", course)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      return {
        course: courseRes.data,
        modules: modulesRes.data ?? [],
        lessons: (lessonsRes.data ?? []) as {
          id: string;
          module_id: string;
          title: string;
          content: string | null;
          duration_minutes: number;
        }[],
        completed: new Set((progressRes.data ?? []).map((p) => p.lesson_id)),
        enrolled: !!enrolRes.data,
      };
    },
  });

  const d = data.data;
  const total = d?.lessons.length ?? 0;
  const done = d ? d.lessons.filter((l) => d.completed.has(l.id)).length : 0;

  async function enroll() {
    if (!userId) return;
    await supabase.from("enrollments").insert({ user_id: userId, course_slug: course });
    await queryClient.invalidateQueries({ queryKey: ["course", course] });
    toast.success("Enrolled. Your progress is saved as you go.");
  }

  async function complete(lessonId: string) {
    if (!userId) return;
    if (!d?.enrolled) await enroll();
    const { error } = await supabase
      .from("lesson_progress")
      .insert({ user_id: userId, lesson_id: lessonId, course_slug: course });
    if (error && !error.message.includes("duplicate")) {
      toast.error("Could not save that lesson.");
      return;
    }
    if (done + 1 >= total && total > 0) {
      await supabase
        .from("enrollments")
        .update({ completed_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("course_slug", course);
      await awardAchievement(userId, "first_course", "First Course");
      toast.success("Course complete. Achievement unlocked.");
    }
    await queryClient.invalidateQueries({ queryKey: ["course", course] });
    await queryClient.invalidateQueries({ queryKey: ["learn-hub"] });
  }

  if (!data.isLoading && !d?.course) {
    return (
      <AppShell>
        <p className="text-muted-foreground">That course could not be found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Link
        to="/learn"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Learning Hub
      </Link>

      <header className="mt-4 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-learn">
          {d?.course?.level} · {d?.course?.duration_minutes} min
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold">{d?.course?.title}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{d?.course?.description}</p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <div className="min-w-40 flex-1">
            <Progress value={total ? (done / total) * 100 : 0} />
            <p className="mt-2 text-xs text-muted-foreground">
              {done} of {total} lessons complete
            </p>
          </div>
          {!d?.enrolled ? <Button onClick={enroll}>Enrol in this course</Button> : null}
        </div>
      </header>

      <section className="mt-8 space-y-6">
        {(d?.modules ?? []).map((m, mi) => (
          <div key={m.id} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Module {mi + 1}
            </p>
            <h2 className="mt-1 font-display text-lg font-bold">{m.title}</h2>
            {m.summary ? <p className="mt-1 text-sm text-muted-foreground">{m.summary}</p> : null}
            <ul className="mt-4 space-y-3">
              {(d?.lessons ?? [])
                .filter((l) => l.module_id === m.id)
                .map((l) => {
                  const isDone = d?.completed.has(l.id);
                  return (
                    <li key={l.id} className="rounded-xl border border-border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold">{l.title}</p>
                          <p className="text-xs text-muted-foreground">{l.duration_minutes} min</p>
                        </div>
                        <Button
                          size="sm"
                          variant={isDone ? "secondary" : "default"}
                          onClick={() => complete(l.id)}
                          disabled={isDone}
                        >
                          {isDone ? (
                            <>
                              <Check className="size-4" /> Completed
                            </>
                          ) : (
                            "Mark complete"
                          )}
                        </Button>
                      </div>
                      {l.content ? (
                        <p className="mt-3 whitespace-pre-line text-sm text-foreground/80">
                          {l.content}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
