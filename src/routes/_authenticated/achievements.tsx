import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";

import { AppShell } from "@/components/dim/AppShell";
import { PageHeader } from "@/components/dim/PageHeader";
import { Icon } from "@/components/dim/Icon";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/achievements")({
  staticData: { sitemap: false },
  component: Achievements,
});

function Achievements() {
  const { earned } = useMember();
  const all = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data } = await supabase.from("achievements").select("*").order("sort");
      return data ?? [];
    },
  });

  const earnedMap = new Map(earned.map((e) => [e.achievement_code, e.earned_at]));

  return (
    <AppShell>
      <PageHeader
        eyebrow="Grow"
        title="Achievements"
        description="Earned from real activity across the ecosystem — learning, building, connecting and contributing to the beta."
      />

      <p className="mt-6 text-sm text-muted-foreground">
        {earnedMap.size} of {all.data?.length ?? 0} unlocked
      </p>

      <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(all.data ?? []).map((a) => {
          const at = earnedMap.get(a.code);
          return (
            <article
              key={a.code}
              className={cn(
                "rounded-2xl border p-5",
                at ? "border-gold/50 bg-gold/8" : "border-border bg-card opacity-80",
              )}
            >
              <div className="flex items-center gap-2">
                {at ? (
                  <Icon name={a.icon ?? "award"} className="size-5 text-gold" />
                ) : (
                  <Lock className="size-5 text-muted-foreground" />
                )}
                {a.stage ? (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {a.stage}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-3 font-display font-bold">{a.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {at ? `Unlocked ${new Date(at).toLocaleDateString()}` : "Not yet unlocked"}
              </p>
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}
