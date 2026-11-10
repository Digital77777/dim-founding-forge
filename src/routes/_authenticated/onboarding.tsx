import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FoundingBadge, foundingLabel } from "@/components/dim/FoundingBadge";
import { supabase } from "@/integrations/supabase/client";
import { firstName, useMember, useInvalidateMember } from "@/hooks/use-member";
import { EXPERIENCE_LEVELS, INTEREST_OPTIONS, ONBOARDING_GOALS } from "@/lib/dim";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding")({
  staticData: { sitemap: false },
  component: Onboarding,
});

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-foreground/80 hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}

function Onboarding() {
  const { user, userId, profile, membership, isLoading } = useMember();
  const invalidateMember = useInvalidateMember();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<string[]>([]);
  const [level, setLevel] = useState<string>("");
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Make sure a Founding Member number exists before screen one renders.
  useEffect(() => {
    if (!userId || isLoading || membership) return;
    const name = (profile?.full_name ?? user?.user_metadata?.["full_name"] ?? null) as
      string | null;
    supabase
      .rpc("claim_membership", name ? { _full_name: name } : {})
      .then(() => invalidateMember());
  }, [userId, isLoading, membership, profile, user, invalidateMember]);

  function toggle(list: string[], set: (v: string[]) => void, value: string) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function finish() {
    if (!userId) return;
    setSaving(true);
    setSaveError(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        goals,
        interests,
        experience_level: level || null,
        onboarding_completed: true,
      })
      .eq("id", userId);

    if (error) {
      console.error("[v0] Onboarding save failed:", error);
      setSaveError("We couldn't save your setup. Please try again.");
      setSaving(false);
      return;
    }

    await invalidateMember();
    setSaving(false);
    navigate({ to: "/community" });
  }

  const steps = [
    {
      eyebrow: "Welcome to DIM Elite",
      title: `Welcome, ${firstName(profile, user)}.`,
      body: "One app. One account. One ecosystem. You're joining as a founding member of the DIM Elite beta.",
      canContinue: true,
      content: (
        <div className="mt-6 rounded-2xl border border-gold/40 bg-gold/8 p-6">
          <FoundingBadge
            number={membership?.founding_number ?? null}
            size="lg"
            showNumber={false}
          />
          <p className="mt-4 font-display text-4xl font-extrabold tabular-nums text-gold-foreground">
            {foundingLabel(membership?.founding_number) ?? "Assigning…"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your founding member number. It stays yours beyond the beta.
          </p>
        </div>
      ),
    },
    {
      eyebrow: "Step 2 of 5",
      title: "What do you want to achieve?",
      body: "Pick everything that applies. This shapes your dashboard, recommendations and learning paths.",
      canContinue: goals.length > 0,
      content: (
        <div className="mt-6 flex flex-wrap gap-2">
          {ONBOARDING_GOALS.map((g) => (
            <Chip
              key={g}
              label={g}
              selected={goals.includes(g)}
              onClick={() => toggle(goals, setGoals, g)}
            />
          ))}
        </div>
      ),
    },
    {
      eyebrow: "Step 3 of 5",
      title: "Where are you starting from?",
      body: "There's no wrong answer — it only changes where we begin.",
      canContinue: !!level,
      content: (
        <div className="mt-6 grid gap-3">
          {EXPERIENCE_LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={cn(
                "rounded-2xl border p-5 text-left transition-colors",
                level === l ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
              )}
            >
              <p className="font-display font-bold">{l}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {l === "Beginner"
                  ? "New to AI and digital tools."
                  : l === "Intermediate"
                    ? "I've used some tools and want to go deeper."
                    : "I work with these tools and want to build and earn."}
              </p>
            </button>
          ))}
        </div>
      ),
    },
    {
      eyebrow: "Step 4 of 5",
      title: "What are you interested in?",
      body: "Choose a few topics. We'll use them across Learn, Tools and Community.",
      canContinue: interests.length > 0,
      content: (
        <div className="mt-6 flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((i) => (
            <Chip
              key={i}
              label={i}
              selected={interests.includes(i)}
              onClick={() => toggle(interests, setInterests, i)}
            />
          ))}
        </div>
      ),
    },
    {
      eyebrow: "You're set",
      title: "Your DIM journey is ready.",
      body: "Learn → Build → Connect → Earn → Grow. Everything connects to the same account and the same progress.",
      canContinue: true,
      content: (
        <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
          <li>Goals: {goals.join(", ") || "—"}</li>
          <li>Experience: {level || "—"}</li>
          <li>Interests: {interests.join(", ") || "—"}</li>
        </ul>
      ),
    },
  ];

  const current = steps[step]!;
  const isLast = step === steps.length - 1;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Progress value={((step + 1) / steps.length) * 100} />
        <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-lift sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            {current.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">{current.title}</h1>
          <p className="mt-3 text-muted-foreground">{current.body}</p>
          {current.content}

          {saveError ? (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {saveError}
            </p>
          ) : null}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            <Button
              onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
              disabled={!current.canContinue || saving}
            >
              {isLast ? (saving ? "Saving…" : "Enter DIM Elite") : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
