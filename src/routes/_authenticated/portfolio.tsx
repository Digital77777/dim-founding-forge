import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/dim/AppShell";
import { PageHeader } from "@/components/dim/PageHeader";
import { FoundingBadge } from "@/components/dim/FoundingBadge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";

export const Route = createFileRoute("/_authenticated/portfolio")({
  staticData: { sitemap: false },
  component: Portfolio,
});

function Portfolio() {
  const { userId, profile, membership, earned } = useMember();

  const data = useQuery({
    queryKey: ["portfolio", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [projects, courses] = await Promise.all([
        supabase.from("projects").select("*").eq("user_id", userId!).order("created_at", { ascending: false }),
        supabase
          .from("enrollments")
          .select("course_slug, completed_at")
          .eq("user_id", userId!)
          .not("completed_at", "is", null),
      ]);
      return { projects: projects.data ?? [], courses: courses.data ?? [] };
    },
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="My Portfolio"
        title={profile?.full_name ?? "Your portfolio"}
        description={profile?.headline ?? "Projects, completed courses and achievements in one shareable view."}
        actions={
          <Button variant="outline" asChild>
            <Link to="/profile">Edit profile</Link>
          </Button>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <FoundingBadge number={membership?.founding_number ?? null} size="md" />
        <span className="text-sm text-muted-foreground">
          {earned.length} achievements · {data.data?.projects.length ?? 0} projects ·{" "}
          {data.data?.courses.length ?? 0} courses completed
        </span>
      </div>

      {profile?.bio ? (
        <p className="mt-6 max-w-2xl whitespace-pre-line text-foreground/85">{profile.bio}</p>
      ) : null}

      {(profile?.skills ?? []).length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {(profile?.skills ?? []).map((s) => (
            <span key={s} className="rounded-full border border-border px-3 py-1 text-xs font-semibold">
              {s}
            </span>
          ))}
        </div>
      ) : null}

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold">Projects</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(data.data?.projects ?? []).map((p) => (
            <article key={p.id} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-build">
                {p.status.replace("_", " ")}
              </p>
              <h3 className="mt-1 font-display font-bold">{p.title}</h3>
              {p.summary ? <p className="mt-1 text-sm text-muted-foreground">{p.summary}</p> : null}
            </article>
          ))}
          {!data.isLoading && (data.data?.projects ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing here yet.{" "}
              <Link to="/build" className="font-semibold text-primary">
                Start a project in the Build Hub.
              </Link>
            </p>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
