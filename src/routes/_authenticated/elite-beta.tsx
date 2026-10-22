import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/dim/AppShell";
import { PageHeader } from "@/components/dim/PageHeader";
import { FoundingBadge, foundingLabel } from "@/components/dim/FoundingBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";
import { awardAchievement } from "@/lib/member-actions";
import { BETA_AVAILABILITY } from "@/lib/dim";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/elite-beta")({
  staticData: { sitemap: false },
  component: EliteBeta,
});

const TYPES = ["bug", "feature", "idea", "feedback", "content"];
const STATUSES = ["received", "reviewing", "planned", "shipped"];

function EliteBeta() {
  const { userId, membership } = useMember();
  const queryClient = useQueryClient();
  const [type, setType] = useState("feedback");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const data = useQuery({
    queryKey: ["feedback", userId],
    queryFn: async () => {
      const [items, votes] = await Promise.all([
        supabase.from("feedback_items").select("*").order("created_at", { ascending: false }).limit(60),
        supabase.from("feedback_votes").select("item_id, user_id"),
      ]);
      return { items: items.data ?? [], votes: votes.data ?? [] };
    },
  });

  async function submit() {
    if (!userId || !title.trim()) return;
    const { error } = await supabase
      .from("feedback_items")
      .insert({ user_id: userId, type, title: title.trim(), body: body.trim() || null });
    if (error) {
      toast.error("Could not submit that.");
      return;
    }
    setTitle("");
    setBody("");
    await awardAchievement(userId, "dim_contributor", "DIM Contributor");
    await queryClient.invalidateQueries({ queryKey: ["feedback"] });
    toast.success("Received. Thank you — this shapes the platform.");
  }

  async function vote(itemId: string, voted: boolean) {
    if (!userId) return;
    if (voted)
      await supabase.from("feedback_votes").delete().eq("item_id", itemId).eq("user_id", userId);
    else await supabase.from("feedback_votes").insert({ item_id: itemId, user_id: userId });
    await queryClient.invalidateQueries({ queryKey: ["feedback"] });
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Elite Beta"
        title="You are helping build DIM"
        description="Report bugs, request features, share ideas and suggest content. Everything you submit is visible in the loop below."
      />

      <div className="mt-6 rounded-2xl bg-elite p-6 text-ink-foreground">
        <FoundingBadge number={membership?.founding_number ?? null} size="md" showNumber={false} />
        <p className="mt-3 font-display text-2xl font-extrabold tabular-nums text-gold">
          {foundingLabel(membership?.founding_number) ?? "—"}
        </p>
        <p className="mt-2 text-sm text-ink-foreground/85">{BETA_AVAILABILITY}</p>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold">Submit to the beta team</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold capitalize",
                type === t ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <Input
          className="mt-3"
          placeholder="Short title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          className="mt-3"
          rows={3}
          placeholder="Tell us what happened, or what you'd like to see."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button className="mt-3" onClick={submit} disabled={!title.trim()}>
          Submit
        </Button>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {STATUSES.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {(data.data?.items ?? []).map((item) => {
            const votes = (data.data?.votes ?? []).filter((v) => v.item_id === item.id);
            const voted = votes.some((v) => v.user_id === userId);
            return (
              <article
                key={item.id}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <button
                  onClick={() => vote(item.id, voted)}
                  className={cn(
                    "flex w-12 shrink-0 flex-col items-center rounded-xl border py-2",
                    voted ? "border-primary bg-primary/10 text-primary" : "border-border",
                  )}
                >
                  <ChevronUp className="size-4" />
                  <span className="text-xs font-bold tabular-nums">{votes.length}</span>
                </button>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                    {item.type} · {item.status}
                  </p>
                  <h3 className="mt-1 font-semibold">{item.title}</h3>
                  {item.body ? (
                    <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                  ) : null}
                </div>
              </article>
            );
          })}
          {!data.isLoading && (data.data?.items ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No submissions yet — be the first.</p>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
