/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, MessageCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/dim/AppShell";
import { PageHeader } from "@/components/dim/PageHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";

export const Route = createFileRoute("/_authenticated/connect")({
  staticData: { sitemap: false },
  component: Networking,
});

function Networking() {
  const { userId } = useMember();
  const queryClient = useQueryClient();
  const following = useQuery({
    queryKey: ["member-directory-following", userId],
    queryFn: async () => {
      if (!userId) return new Set<string>();
      const { data } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);
      return new Set((data ?? []).map((row) => row.following_id));
    },
    enabled: Boolean(userId),
  });

  const toggleFollow = useMutation({
    mutationFn: async (memberId: string) => {
      if (!userId) throw new Error("Not signed in");
      const isFollowing = following.data?.has(memberId);
      if (isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", userId)
          .eq("following_id", memberId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: userId, following_id: memberId });
        if (error) throw error;
      }
    },
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["member-directory-following", userId] }),
    onError: () => toast.error("Could not update your connection."),
  });

  const sendRequest = useMutation({
    mutationFn: async (recipientId: string) => {
      if (!userId) throw new Error("Not signed in");
      const { error } = await (supabase as any).from("message_requests").insert({
        sender_id: userId,
        recipient_id: recipientId,
        message: "I’d like to connect with you on DIM.",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Message request sent.");
      void queryClient.invalidateQueries({ queryKey: ["member-directory"] });
    },
    onError: () => toast.error("This member already has a pending request or cannot be contacted."),
  });

  const data = useQuery({
    queryKey: ["member-directory"],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, headline, location, skills")
        .eq("is_public", true)
        .limit(60);
      return { profiles: profiles ?? [] };
    },
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Networking"
        title="Connect with people"
        description="Discover members, follow their work and build a network around what you are learning."
      />
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(data.data?.profiles ?? []).map((p) => {
          const isFollowing = following.data?.has(p.id) ?? false;
          return (
            <article key={p.id} className="rounded-2xl border border-border bg-card p-5">
              <Link
                to="/members/$userId"
                params={{ userId: p.id }}
                className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {(p.full_name ?? "DM").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-display font-bold">
                      {p.full_name ?? "DIM member"}
                    </h3>
                    <p className="truncate text-sm text-muted-foreground">
                      {p.headline ?? p.location ?? "DIM member"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(p.skills ?? []).slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Link>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  variant={isFollowing ? "secondary" : "default"}
                  onClick={() => toggleFollow.mutate(p.id)}
                  disabled={toggleFollow.isPending || p.id === userId}
                >
                  {isFollowing ? <Check className="size-4" /> : <UserPlus className="size-4" />}
                  {p.id === userId ? "You" : isFollowing ? "Following" : "Follow"}
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/members/$userId" params={{ userId: p.id }}>
                    <MessageCircle className="size-4" />
                    View profile
                  </Link>
                </Button>
              </div>
              {p.id !== userId ? (
                <Button
                  className="mt-2 w-full"
                  variant="ghost"
                  onClick={() => sendRequest.mutate(p.id)}
                  disabled={sendRequest.isPending}
                >
                  <MessageCircle className="size-4" />
                  Message request
                </Button>
              ) : null}
            </article>
          );
        })}

        {!data.isLoading && (data.data?.profiles ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No public member profiles yet.</p>
        ) : null}
      </section>
    </AppShell>
  );
}
