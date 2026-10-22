import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/dim/AppShell";
import { PageHeader } from "@/components/dim/PageHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";

export const Route = createFileRoute("/_authenticated/notifications")({
  staticData: { sitemap: false },
  component: Notifications,
});

function Notifications() {
  const { userId } = useMember();
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["notifications", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  async function markAllRead() {
    if (!userId) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    await queryClient.invalidateQueries({ queryKey: ["unread-notifications"] });
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Notifications"
        title="Your notification centre"
        description="Courses, projects, community, tools, achievements and beta updates — all in one place."
        actions={
          <Button variant="outline" onClick={markAllRead}>
            Mark all read
          </Button>
        }
      />
      <ul className="mt-8 space-y-3">
        {(list.data ?? []).map((n) => (
          <li
            key={n.id}
            className={`rounded-2xl border p-5 ${n.read_at ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              {n.type}
            </p>
            <p className="mt-1 font-semibold">{n.title}</p>
            {n.body ? <p className="mt-1 text-sm text-muted-foreground">{n.body}</p> : null}
          </li>
        ))}
        {!list.isLoading && (list.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing yet. Start learning and building.</p>
        ) : null}
      </ul>
    </AppShell>
  );
}
