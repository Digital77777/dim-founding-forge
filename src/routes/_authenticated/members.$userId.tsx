import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, MessageCircle, UserPlus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/dim/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";

export const Route = createFileRoute("/_authenticated/members/$userId")({
  staticData: { sitemap: false },
  component: PublicMemberProfile,
});

function PublicMemberProfile() {
  const { userId: viewerId } = useMember();
  const { userId } = Route.useParams();
  const queryClient = useQueryClient();

  const profile = useQuery({
    queryKey: ["public-member-profile", userId, viewerId],
    queryFn: async () => {
      const [{ data: member }, { count: followers }] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id, full_name, headline, bio, location, institution, industry, career_goal, skills, interests, avatar_url, is_public",
          )
          .eq("id", userId)
          .eq("is_public", true)
          .maybeSingle(),
        supabase
          .from("follows")
          .select("follower_id", { count: "exact", head: true })
          .eq("following_id", userId),
      ]);
      if (!member) return null;
      let isFollowing = false;
      if (viewerId && viewerId !== userId) {
        const { data } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", viewerId)
          .eq("following_id", userId)
          .maybeSingle();
        isFollowing = Boolean(data);
      }
      return { member, followers: followers ?? 0, isFollowing };
    },
  });

  const toggleFollow = useMutation({
    mutationFn: async () => {
      if (!viewerId || viewerId === userId) throw new Error("You cannot follow this profile.");
      if (profile.data?.isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", viewerId)
          .eq("following_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: viewerId, following_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["public-member-profile", userId, viewerId] }),
    onError: () => toast.error("Could not update your connection."),
  });

  const member = profile.data?.member;
  const initials = (member?.full_name ?? "DIM").slice(0, 2).toUpperCase();

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/connect">
            <ArrowLeft className="size-4" />
            Back to people
          </Link>
        </Button>
        {profile.isLoading ? (
          <div className="mt-4 h-72 animate-pulse rounded-3xl bg-muted" />
        ) : null}
        {!profile.isLoading && !member ? (
          <section className="mt-4 rounded-3xl border border-border bg-card p-8 text-center">
            <h1 className="font-display text-2xl font-bold">Profile unavailable</h1>
            <p className="mt-2 text-muted-foreground">
              This member has not made their profile public.
            </p>
          </section>
        ) : member ? (
          <>
            <section className="mt-4 overflow-hidden rounded-3xl border border-border bg-card">
              <div className="h-28 bg-gradient-to-r from-primary/20 via-primary/5 to-secondary/20" />
              <div className="px-6 pb-6">
                <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="grid size-24 place-items-center rounded-full border-4 border-card bg-primary/10 text-2xl font-bold text-primary">
                    {initials}
                  </div>
                  {viewerId !== userId ? (
                    <div className="flex gap-2">
                      <Button
                        variant={profile.data?.isFollowing ? "secondary" : "default"}
                        onClick={() => toggleFollow.mutate()}
                        disabled={toggleFollow.isPending}
                      >
                        {profile.data?.isFollowing ? (
                          <Check className="size-4" />
                        ) : (
                          <UserPlus className="size-4" />
                        )}
                        {profile.data?.isFollowing ? "Following" : "Follow"}
                      </Button>
                      <Button variant="outline">
                        <MessageCircle className="size-4" />
                        Message
                      </Button>
                    </div>
                  ) : null}
                </div>
                <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight">
                  {member.full_name ?? "DIM member"}
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                  {member.headline ?? "DIM member"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {[member.location, member.institution, member.industry]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <div className="mt-5 flex gap-6 text-sm">
                  <span>
                    <strong className="text-foreground">{profile.data?.followers ?? 0}</strong>{" "}
                    followers
                  </span>
                  <span>
                    <strong className="text-foreground">{member.skills?.length ?? 0}</strong> skills
                  </span>
                </div>
              </div>
            </section>
            <section className="mt-4 rounded-3xl border border-border bg-card p-6">
              <h2 className="font-display text-xl font-bold">About</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {member.bio ?? "This member has not added an introduction yet."}
              </p>
            </section>
            <section className="mt-4 rounded-3xl border border-border bg-card p-6">
              <h2 className="font-display text-xl font-bold">Skills and interests</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {[...(member.skills ?? []), ...(member.interests ?? [])].map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
