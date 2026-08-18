import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/dim/AppShell";
import { PageHeader } from "@/components/dim/PageHeader";
import { FoundingBadge } from "@/components/dim/FoundingBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";
import { awardAchievement } from "@/lib/member-actions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/community")({
  component: Community,
});

function Community() {
  const { userId } = useMember();
  const queryClient = useQueryClient();
  const [space, setSpace] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const data = useQuery({
    queryKey: ["community", space, userId],
    queryFn: async () => {
      const spacesRes = await supabase.from("community_spaces").select("*").order("sort");
      let postQuery = supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(40);
      if (space) postQuery = postQuery.eq("space_slug", space);
      const postsRes = await postQuery;
      const posts = postsRes.data ?? [];
      const ids = posts.map((p) => p.id);
      const authorIds = [...new Set(posts.map((p) => p.user_id))];
      const [likesRes, commentsRes, profilesRes, membersRes] = await Promise.all([
        ids.length
          ? supabase.from("likes").select("post_id, user_id").in("post_id", ids)
          : Promise.resolve({ data: [] }),
        ids.length
          ? supabase.from("comments").select("*").in("post_id", ids).order("created_at")
          : Promise.resolve({ data: [] }),
        authorIds.length
          ? supabase.from("profiles").select("id, full_name, headline").in("id", authorIds)
          : Promise.resolve({ data: [] }),
        authorIds.length
          ? supabase.from("elite_members").select("user_id, founding_number").in("user_id", authorIds)
          : Promise.resolve({ data: [] }),
      ]);
      return {
        spaces: spacesRes.data ?? [],
        posts,
        likes: (likesRes.data ?? []) as { post_id: string; user_id: string }[],
        comments: (commentsRes.data ?? []) as {
          id: string;
          post_id: string;
          user_id: string;
          body: string;
        }[],
        profiles: new Map((profilesRes.data ?? []).map((p) => [p.id, p])),
        members: new Map((membersRes.data ?? []).map((m) => [m.user_id, m.founding_number])),
      };
    },
  });

  const d = data.data;

  async function post() {
    if (!userId || !body.trim()) return;
    const target = space ?? d?.spaces[0]?.slug;
    if (!target) return;
    const { error } = await supabase.from("posts").insert({
      user_id: userId,
      space_slug: target,
      title: title.trim() || null,
      body: body.trim(),
    });
    if (error) {
      toast.error("Could not post that.");
      return;
    }
    setTitle("");
    setBody("");
    const { count } = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((count ?? 0) >= 5) await awardAchievement(userId, "community_builder", "Community Builder");
    await queryClient.invalidateQueries({ queryKey: ["community"] });
    toast.success("Posted to the community.");
  }

  async function toggleLike(postId: string, liked: boolean) {
    if (!userId) return;
    if (liked) await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId);
    else await supabase.from("likes").insert({ post_id: postId, user_id: userId });
    await queryClient.invalidateQueries({ queryKey: ["community"] });
  }

  async function addComment(postId: string) {
    if (!userId || !comment.trim()) return;
    await supabase.from("comments").insert({ post_id: postId, user_id: userId, body: comment.trim() });
    setComment("");
    await queryClient.invalidateQueries({ queryKey: ["community"] });
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Connect"
        title="Community"
        description="Spaces for DIM Learn, Build, Earn, Creator and Career conversations. Founding members are marked everywhere they appear."
      />

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSpace(null)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium",
            !space ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted",
          )}
        >
          All spaces
        </button>
        {(d?.spaces ?? []).map((s) => (
          <button
            key={s.slug}
            onClick={() => setSpace(s.slug)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium",
              space === s.slug
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-muted",
            )}
          >
            {s.name}
          </button>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold">Share something</h2>
        <Input
          className="mt-3"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          className="mt-3"
          rows={3}
          placeholder="What are you learning, building or figuring out?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button className="mt-3" onClick={post} disabled={!body.trim()}>
          Post
        </Button>
      </section>

      <section className="mt-6 space-y-4">
        {(d?.posts ?? []).map((p) => {
          const likes = (d?.likes ?? []).filter((l) => l.post_id === p.id);
          const liked = likes.some((l) => l.user_id === userId);
          const comments = (d?.comments ?? []).filter((c) => c.post_id === p.id);
          const author = d?.profiles.get(p.user_id);
          const number = d?.members.get(p.user_id) ?? null;
          return (
            <article key={p.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{author?.full_name ?? "DIM member"}</span>
                <FoundingBadge number={number} />
                <span className="ml-auto text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {p.space_slug}
                </span>
              </div>
              {p.title ? <h3 className="mt-3 font-display text-lg font-bold">{p.title}</h3> : null}
              <p className="mt-2 whitespace-pre-line text-sm text-foreground/85">{p.body}</p>
              <div className="mt-4 flex items-center gap-4 text-sm">
                <button
                  onClick={() => toggleLike(p.id, liked)}
                  className={cn(
                    "inline-flex items-center gap-1.5 font-medium",
                    liked ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Heart className={cn("size-4", liked && "fill-current")} /> {likes.length}
                </button>
                <button
                  onClick={() => setOpenComments(openComments === p.id ? null : p.id)}
                  className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground"
                >
                  <MessageSquare className="size-4" /> {comments.length}
                </button>
              </div>

              {openComments === p.id ? (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  {comments.map((c) => (
                    <div key={c.id} className="rounded-xl bg-muted/60 p-3 text-sm">
                      <p className="text-xs font-semibold text-muted-foreground">
                        {d?.profiles.get(c.user_id)?.full_name ?? "DIM member"}
                      </p>
                      <p className="mt-1">{c.body}</p>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment"
                    />
                    <Button onClick={() => addComment(p.id)} disabled={!comment.trim()}>
                      Send
                    </Button>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
        {!data.isLoading && (d?.posts ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No posts in this space yet — be the first founding member to start the conversation.
          </p>
        ) : null}
      </section>
    </AppShell>
  );
}
