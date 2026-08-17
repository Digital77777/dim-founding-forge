import { Link } from "@tanstack/react-router";
import { BellRing, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";
import { EARN_DISCLAIMER } from "@/lib/dim";

/**
 * The Coming Soon experience. A feature can appear in Elite before it is
 * finished — but it must say so clearly and offer something to do right now.
 */
export function ComingSoon({
  feature,
  title,
  summary,
  bullets,
  showEarnDisclaimer = false,
}: {
  feature: string;
  title: string;
  summary: string;
  bullets: string[];
  showEarnDisclaimer?: boolean;
}) {
  const { userId } = useMember();
  const [notified, setNotified] = useState(false);
  const [saving, setSaving] = useState(false);

  async function notifyMe() {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("coming_soon_interest")
      .insert({ user_id: userId, feature });
    setSaving(false);
    if (error && !error.message.includes("duplicate")) {
      toast.error("Could not save that. Try again.");
      return;
    }
    setNotified(true);
    toast.success(`You're on the list for ${title}.`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lift">
        <div className="bg-elite px-6 py-10 text-ink-foreground sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Coming soon</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-ink-foreground/70">
            Included in DIM Elite
          </p>
          <p className="mt-5 max-w-xl text-ink-foreground/85">{summary}</p>
        </div>

        <div className="px-6 py-8 sm:px-10">
          <p className="text-muted-foreground">
            We're building this experience as part of the DIM ecosystem. As an Elite Founding Member,
            you'll be among the first to access it when it launches.
          </p>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {showEarnDisclaimer ? (
            <p className="mt-6 rounded-xl border border-border bg-muted/60 p-4 text-xs text-muted-foreground">
              {EARN_DISCLAIMER}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={notifyMe} disabled={saving || notified}>
              <BellRing className="size-4" aria-hidden />
              {notified ? "We'll notify you" : "Notify me"}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard">See what's available now</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
