import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Circle } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/dim/AppShell";
import { PageHeader } from "@/components/dim/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress as Bar } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useInvalidateMember, useMember } from "@/hooks/use-member";

export const Route = createFileRoute("/_authenticated/roadmap")({
  head: () => ({
    meta: [
      { title: "My Career Roadmap | DIM Career" },
      { name: "description", content: "Set your career goal and follow a step-by-step roadmap that tracks your real progress." },
      { property: "og:title", content: "My Career Roadmap | DIM Career" },
      { property: "og:description", content: "Set your career goal and follow a step-by-step roadmap that tracks your real progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RoadmapPage,
});

const SUGGESTED = [
  "AI Engineer",
  "Data Analyst",
  "Product Manager",
  "Cloud Engineer",
  "UX Designer",
  "Digital Marketer",
  "Software Developer",
  "Cybersecurity Analyst",
];

type Dest = "/profile" | "/learn" | "/build" | "/portfolio" | "/connect" | "/coming-soon" | "/opportunities";

type Step = { n: string; title: string; hint: string; done: boolean | null; to: Dest; cta: string };

function RoadmapPage() {
  const { userId, profile } = useMember();
  const invalidate = useInvalidateMember();
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.career_goal) setGoal(profile.career_goal);
  }, [profile?.career_goal]);

  const counts = useQuery({
    queryKey: ["roadmap", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [enr, proj, pub, fol] = await Promise.all([
        supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("user_id", userId!),
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("user_id", userId!),
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("user_id", userId!).eq("is_public", true),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", userId!),
      ]);
      return { enr: enr.count ?? 0, proj: proj.count ?? 0, pub: pub.count ?? 0, fol: fol.count ?? 0 };
    },
  });

  async function saveGoal(value: string) {
    const v = value.trim();
    if (!userId || !v) return toast.error("Tell us the career you're aiming for.");
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ career_goal: v }).eq("id", userId);
    setSaving(false);
    if (error) return toast.error("Couldn't save your goal. Please try again.");
    setGoal(v);
    invalidate();
    toast.success("Your roadmap is ready.");
  }

  const c = counts.data;
  const p = profile;
  const steps: Step[] = [
    { n: "01", title: "Career goal", hint: "Choose the role you're working toward.", done: !!p?.career_goal, to: "/profile", cta: "Edit goal" },
    { n: "02", title: "Assess", hint: "Add your current skills to your profile.", done: (p?.skills.length ?? 0) > 0, to: "/profile", cta: "Add skills" },
    { n: "03", title: "Skill gaps", hint: "List the goals and skills you want to develop.", done: (p?.goals.length ?? 0) > 0, to: "/profile", cta: "Set goals" },
    { n: "04", title: "Learning path", hint: "Enroll in a course aligned with your goal.", done: (c?.enr ?? 0) > 0, to: "/learn", cta: "Start learning" },
    { n: "05", title: "Practical projects", hint: "Create your first project.", done: (c?.proj ?? 0) > 0, to: "/build", cta: "Start a project" },
    { n: "06", title: "Certifications", hint: "Add certifications you hold or are preparing for.", done: (p?.certifications.length ?? 0) > 0, to: "/profile", cta: "Add certifications" },
    { n: "07", title: "Portfolio", hint: "Make at least one project public.", done: (c?.pub ?? 0) > 0, to: "/portfolio", cta: "Open portfolio" },
    { n: "08", title: "CV", hint: "Add a headline and bio to your profile.", done: !!(p?.headline && p?.bio), to: "/profile", cta: "Complete profile" },
    { n: "09", title: "Interview", hint: "Interview practice is coming soon.", done: null, to: "/coming-soon", cta: "Coming soon" },
    { n: "10", title: "Network", hint: "Follow at least one member.", done: (c?.fol ?? 0) > 0, to: "/connect", cta: "Find people" },
    { n: "11", title: "Opportunities", hint: "Opportunity discovery is coming soon.", done: null, to: "/opportunities", cta: "Coming soon" },
  ];
  const tracked = steps.filter((s) => s.done !== null);
  const doneCount = tracked.filter((s) => s.done).length;
  const pct = Math.round((doneCount / tracked.length) * 100);
  const next = steps.find((s) => s.done === false);
  const hasGoal = !!p?.career_goal;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Roadmap"
        title={hasGoal ? `Your path to ${p!.career_goal}` : "Create your career roadmap"}
        description="Steps update automatically as you learn, build and connect across DIM."
      />

      <section className="mt-8 rounded-2xl border border-border bg-card p-5">
        <label htmlFor="goal" className="text-sm font-semibold">
          What career are you aiming for?
        </label>
        <form
          className="mt-3 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            saveGoal(goal);
          }}
        >
          <Input id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. AI Engineer" maxLength={80} />
          <Button type="submit" disabled={saving}>
            {hasGoal ? "Update roadmap" : "Create My Roadmap"}
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => saveGoal(s)}
              className="rounded-full border border-border px-3 py-1 text-xs hover:border-primary hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {hasGoal && (
        <>
          <section className="mt-6 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">{doneCount} of {tracked.length} steps complete</span>
              <span className="tabular-nums text-muted-foreground">{pct}%</span>
            </div>
            <Bar value={pct} className="mt-3" />
            {next && (
              <p className="mt-3 text-sm text-muted-foreground">
                Next up: <span className="font-medium text-foreground">{next.title}</span> — {next.hint}
              </p>
            )}
          </section>

          <ol className="mt-6 space-y-3">
            {steps.map((s) => (
              <li key={s.n} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                <span className={`grid size-9 shrink-0 place-items-center rounded-full ${s.done ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}>
                  {s.done ? <Check className="size-4" aria-label="Done" /> : s.done === null ? <Circle className="size-3" aria-hidden /> : <span className="text-xs font-semibold">{s.n}</span>}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.hint}</p>
                </div>
                {!s.done && (
                  <Button size="sm" variant={s.done === null ? "secondary" : "default"} asChild>
                    <Link to={s.to}>
                      {s.cta} <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  </Button>
                )}
              </li>
            ))}
          </ol>
        </>
      )}
    </AppShell>
  );
}
