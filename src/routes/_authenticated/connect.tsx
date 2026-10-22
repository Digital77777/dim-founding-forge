import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/dim/AppShell";
import { PageHeader } from "@/components/dim/PageHeader";
import { FoundingBadge } from "@/components/dim/FoundingBadge";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/connect")({
  staticData: { sitemap: false },
  component: Networking,
});

function Networking() {
  const data = useQuery({
    queryKey: ["member-directory"],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, headline, location, skills")
        .eq("is_public", true)
        .limit(60);
      const ids = (profiles ?? []).map((p) => p.id);
      const { data: members } = ids.length
        ? await supabase.from("elite_members").select("user_id, founding_number").in("user_id", ids)
        : { data: [] };
      return {
        profiles: profiles ?? [],
        numbers: new Map((members ?? []).map((m) => [m.user_id, m.founding_number])),
      };
    },
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Networking"
        title="Member directory"
        description="Find other founding members to learn, build and collaborate with."
      />
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(data.data?.profiles ?? []).map((p) => (
          <article key={p.id} className="rounded-2xl border border-border bg-card p-5">
            <FoundingBadge number={data.data?.numbers.get(p.id) ?? null} />
            <h3 className="mt-3 font-display font-bold">{p.full_name ?? "DIM member"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.headline ?? p.location ?? ""}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(p.skills ?? []).slice(0, 4).map((s) => (
                <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">
                  {s}
                </span>
              ))}
            </div>
          </article>
        ))}
        {!data.isLoading && (data.data?.profiles ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No public member profiles yet.</p>
        ) : null}
      </section>
    </AppShell>
  );
}
