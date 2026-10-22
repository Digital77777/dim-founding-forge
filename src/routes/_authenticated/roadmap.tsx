import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Loader2, Pencil, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/dim/AppShell";
import { PageHeader } from "@/components/dim/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress as Bar } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";
import { generateRoadmap } from "@/lib/career.functions";

export const Route = createFileRoute("/_authenticated/roadmap")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "My Career Roadmap | DIM Career" },
      { name: "description", content: "Set your career goal and get an AI-powered roadmap with milestones you can track." },
      { property: "og:title", content: "My Career Roadmap | DIM Career" },
      { property: "og:description", content: "Set your career goal and get an AI-powered roadmap with milestones you can track." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RoadmapPage,
});

const ROLES = ["AI Engineer", "Data Analyst", "Product Manager", "Cloud Engineer", "UX Designer", "Software Developer"];
const LEVELS = ["Student", "Graduate", "Early-career (0–3 yrs)", "Experienced (3+ yrs)", "Career changer"];
const INTERESTS = ["Generative AI", "Data & analytics", "Cloud", "Cybersecurity", "Design", "Product", "Automation", "Marketing"];
const PATHS = [
  { v: "Hands-on projects", d: "Learn by building real things" },
  { v: "Structured courses", d: "Step-by-step lessons in order" },
  { v: "Certification-focused", d: "Work toward recognised certificates" },
  { v: "Mixed", d: "A balance of all three" },
];
const STAGE_LABEL: Record<string, string> = {
  discover: "Discover", assess: "Assess", learn: "Learn", build: "Build", certify: "Certify",
  showcase: "Showcase", prepare: "Prepare", connect: "Connect", apply: "Apply", grow: "Grow",
};

type Roadmap = {
  summary: string;
  milestones: { id: string; stage: string; title: string; detail: string }[];
  next_steps: { title: string; why: string; route: string }[];
};

type Plan = {
  target_role: string;
  experience_level: string | null;
  experience_summary: string | null;
  interests: string[];
  learning_path: string | null;
  portfolio_summary: string | null;
  roadmap: Roadmap | null;
};

type FeatureRoute = "/learn" | "/build" | "/tools" | "/portfolio" | "/profile" | "/community" | "/connect" | "/achievements" | "/progress";

function RoadmapPage() {
  const { userId } = useMember();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const generate = useServerFn(generateRoadmap);

  const data = useQuery({
    queryKey: ["career-plan", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [plan, ms] = await Promise.all([
        supabase.from("career_plans").select("*").eq("user_id", userId!).maybeSingle(),
        supabase.from("career_milestones").select("milestone_key").eq("user_id", userId!),
      ]);
      return {
        plan: plan.data as unknown as Plan | null,
        done: new Set((ms.data ?? []).map((m) => m.milestone_key)),
      };
    },
  });

  const gen = useMutation({
    mutationFn: () => generate(),
    onSuccess: (res) => {
      if (!res.ok) return void toast.error(res.error);
      toast.success("Your personalized roadmap is ready.");
      qc.invalidateQueries({ queryKey: ["career-plan"] });
    },
    onError: () => toast.error("Couldn't reach the AI advisor. Please try again."),
  });

  const toggle = useMutation({
    mutationFn: async ({ key, on }: { key: string; on: boolean }) => {
      const res = on
        ? await supabase.from("career_milestones").insert({ user_id: userId!, milestone_key: key })
        : await supabase.from("career_milestones").delete().eq("user_id", userId!).eq("milestone_key", key);
      if (res.error) throw res.error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["career-plan"] }),
    onError: () => toast.error("Couldn't update that milestone."),
  });

  const plan = data.data?.plan ?? null;
  const done = data.data?.done ?? new Set<string>();

  if (data.isLoading || !userId) {
    return (
      <AppShell>
        <div className="grid min-h-[40vh] place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div>
      </AppShell>
    );
  }

  if (!plan || editing) {
    return (
      <AppShell>
        <PageHeader eyebrow="Career setup" title="Set your career goal" description="A few quick questions. We use your answers across DIM Career and to build your AI roadmap." />
        <GoalSetup
          userId={userId}
          initial={plan}
          onDone={async () => {
            setEditing(false);
            await qc.invalidateQueries({ queryKey: ["career-plan"] });
            gen.mutate();
          }}
          onCancel={plan ? () => setEditing(false) : undefined}
        />
      </AppShell>
    );
  }

  const roadmap = plan.roadmap;
  const total = roadmap?.milestones.length ?? 0;
  const complete = roadmap?.milestones.filter((m) => done.has(m.id)).length ?? 0;
  const pct = total ? Math.round((complete / total) * 100) : 0;
  const stages = roadmap ? Array.from(new Set(roadmap.milestones.map((m) => m.stage))) : [];

  return (
    <AppShell>
      <PageHeader eyebrow="Roadmap" title={`Your path to ${plan.target_role}`} description="Created by the AI advisor from your goals, skills, experience and portfolio. Tick off milestones as you go." />

      <section className="mt-6 flex flex-wrap gap-2 text-xs">
        {[plan.experience_level, plan.learning_path, ...plan.interests].filter(Boolean).map((t) => (
          <span key={t} className="rounded-full border border-border bg-card px-3 py-1">{t}</span>
        ))}
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}><Pencil className="size-3.5" /> Edit goal</Button>
      </section>

      {!roadmap || gen.isPending ? (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6 text-center">
          {gen.isPending ? (
            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> The AI advisor is building your roadmap…</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Your goal is saved. Generate your personalized roadmap.</p>
              <Button className="mt-4" onClick={() => gen.mutate()}><Sparkles className="size-4" /> Generate my roadmap</Button>
            </>
          )}
        </section>
      ) : (
        <>
          <section className="mt-6 rounded-2xl border border-border bg-card p-5">
            <p className="text-sm leading-relaxed">{roadmap.summary}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="font-semibold">{complete} of {total} milestones complete</span>
              <span className="tabular-nums text-muted-foreground">{pct}%</span>
            </div>
            <Bar value={pct} className="mt-2" />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Object.keys(STAGE_LABEL).map((k) => {
                const items = roadmap.milestones.filter((m) => m.stage === k);
                const full = items.length > 0 && items.every((m) => done.has(m.id));
                return (
                  <span key={k} className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${full ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {STAGE_LABEL[k]}
                  </span>
                );
              })}
            </div>
          </section>

          <section className="mt-6">
            <h2 className="font-display text-lg font-bold">Recommended next steps</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {roadmap.next_steps.map((s) => (
                <div key={s.title} className="flex flex-col rounded-2xl border border-border bg-card p-4">
                  <p className="font-semibold">{s.title}</p>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">{s.why}</p>
                  <Button size="sm" variant="secondary" className="mt-3 self-start" asChild>
                    <Link to={s.route as FeatureRoute}>Go <ArrowRight className="size-3.5" /></Link>
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 space-y-6">
            {stages.map((stage) => (
              <div key={stage}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{STAGE_LABEL[stage] ?? stage}</h3>
                <ol className="mt-2 space-y-2">
                  {roadmap.milestones.filter((m) => m.stage === stage).map((m) => {
                    const on = done.has(m.id);
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          aria-pressed={on}
                          disabled={toggle.isPending}
                          onClick={() => toggle.mutate({ key: m.id, on: !on })}
                          className="flex w-full items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border ${on ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                            {on && <Check className="size-3.5" aria-hidden />}
                          </span>
                          <span>
                            <span className={`block font-semibold ${on ? "text-muted-foreground line-through" : ""}`}>{m.title}</span>
                            <span className="block text-sm text-muted-foreground">{m.detail}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </section>

          <div className="mt-8">
            <Button variant="secondary" onClick={() => { if (confirm("Regenerate your roadmap? Your ticked milestones will reset.")) gen.mutate(); }}>
              <Sparkles className="size-4" /> Regenerate roadmap
            </Button>
          </div>
        </>
      )}
    </AppShell>
  );
}

function GoalSetup({ userId, initial, onDone, onCancel }: { userId: string; initial: Plan | null; onDone: () => void; onCancel?: (() => void) | undefined }) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [summary, setSummary] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [path, setPath] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initial) return;
    setRole(initial.target_role);
    setLevel(initial.experience_level ?? "");
    setSummary(initial.experience_summary ?? "");
    setInterests(initial.interests);
    setPath(initial.learning_path ?? "");
    setPortfolio(initial.portfolio_summary ?? "");
  }, [initial]);

  const canNext = [role.trim().length > 1, !!level, interests.length > 0, !!path][step] ?? true;

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("career_plans").upsert({
      user_id: userId,
      target_role: role.trim().slice(0, 80),
      experience_level: level,
      experience_summary: summary.trim().slice(0, 1000) || null,
      interests,
      learning_path: path,
      portfolio_summary: portfolio.trim().slice(0, 1000) || null,
    });
    if (!error) await supabase.from("profiles").update({ career_goal: role.trim().slice(0, 80) }).eq("id", userId);
    setSaving(false);
    if (error) return void toast.error("Couldn't save your goal. Please try again.");
    onDone();
  }

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm transition ${active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`;

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-medium text-muted-foreground">Step {step + 1} of 5</p>
      <Bar value={((step + 1) / 5) * 100} className="mt-2" />

      <div className="mt-6 space-y-4">
        {step === 0 && (
          <>
            <label htmlFor="role" className="font-semibold">What role are you aiming for?</label>
            <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. AI Engineer" maxLength={80} />
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => <button key={r} type="button" className={chip(role === r)} onClick={() => setRole(r)}>{r}</button>)}
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <p className="font-semibold">Where are you today?</p>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => <button key={l} type="button" className={chip(level === l)} onClick={() => setLevel(l)}>{l}</button>)}
            </div>
            <label htmlFor="exp" className="block text-sm font-medium">Briefly describe your experience (optional)</label>
            <Textarea id="exp" value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={1000} placeholder="Studies, jobs, skills you use…" />
          </>
        )}
        {step === 2 && (
          <>
            <p className="font-semibold">What interests you? Pick any.</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <button key={i} type="button" className={chip(interests.includes(i))}
                  onClick={() => setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]))}>{i}</button>
              ))}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <p className="font-semibold">How do you prefer to learn?</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {PATHS.map((p) => (
                <button key={p.v} type="button" onClick={() => setPath(p.v)}
                  className={`rounded-2xl border p-4 text-left ${path === p.v ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary"}`}>
                  <span className="block font-semibold">{p.v}</span>
                  <span className="block text-sm text-muted-foreground">{p.d}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <label htmlFor="pf" className="font-semibold">Anything in your portfolio we should know? (optional)</label>
            <Textarea id="pf" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} maxLength={1000} placeholder="Projects, links, achievements… Your DIM projects and profile skills are included automatically." />
          </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {step > 0 ? <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button> : onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
        {step < 4 ? (
          <Button disabled={!canNext} onClick={() => setStep(step + 1)}>Next <ArrowRight className="size-4" /></Button>
        ) : (
          <Button disabled={saving} onClick={save}>{saving ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Save & build my roadmap</Button>
        )}
      </div>
    </section>
  );
}
