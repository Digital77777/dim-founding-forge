import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Heart,
  MessageCircle,
  PlaySquare,
  Send,
  Users,
  Video,
} from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/dim/AppShell";
import { PageHeader } from "@/components/dim/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";

export const Route = createFileRoute("/_authenticated/activity")({
  staticData: { sitemap: false },
  component: ActivityPage,
});

type ActivityPost = {
  id: string;
  title: string | null;
  body: string | null;
  created_at: string;
  media_type: string | null;
  media_path: string | null;
  space_slug: string | null;
  mediaUrl?: string;
};
type ActivityComment = { id: string; post_id: string; body: string; created_at: string };
type Request = {
  id: string;
  status: string;
  message: string;
  created_at: string;
  direction: "sent" | "received";
};

function ActivityPage() {
  const { userId } = useMember();
  const [view, setView] = useState("overview");
  const activity = useQuery({
    queryKey: ["my-activity", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [postsRes, commentsRes, likesRes, followsRes, requestsRes] = await Promise.all([
        supabase
          .from("posts")
          .select("id, title, body, created_at, media_type, media_path, space_slug")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("comments")
          .select("id, post_id, body, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        supabase.from("likes").select("post_id").eq("user_id", userId),
        supabase.from("follows").select("following_id").eq("follower_id", userId),
        supabase
          .from("message_requests")
          .select("id, sender_id, recipient_id, status, message, created_at")
          .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
          .order("created_at", { ascending: false }),
      ]);
      const posts = (postsRes.data ?? []) as ActivityPost[];
      const paths = posts.map((post) => post.media_path).filter((path): path is string => !!path);
      const mediaUrls = new Map<string, string>();
      if (paths.length) {
        const { data: signed } = await supabase.storage
          .from("community-media")
          .createSignedUrls(paths, 60 * 60);
        (signed ?? []).forEach((entry, index) => {
          const path = paths[index];
          if (path && entry.signedUrl) mediaUrls.set(path, entry.signedUrl);
        });
      }
      return {
        posts: posts.map((post) => ({
          ...post,
          mediaUrl: post.media_path ? mediaUrls.get(post.media_path) : undefined,
        })),
        comments: (commentsRes.data ?? []) as ActivityComment[],
        likes: (likesRes.data ?? []).map((like) => like.post_id as string),
        follows: (followsRes.data ?? []).map((follow) => follow.following_id as string),
        requests: (requestsRes.data ?? []).map((request) => ({
          ...request,
          direction: request.sender_id === userId ? "sent" : "received",
        })) as Request[],
      };
    },
  });

  const d = activity.data;
  const reels = useMemo(
    () => d?.posts.filter((post) => post.media_type === "video") ?? [],
    [d?.posts],
  );
  const photos = useMemo(
    () => d?.posts.filter((post) => post.media_type !== "video") ?? [],
    [d?.posts],
  );
  const likedPosts = useMemo(
    () => d?.posts.filter((post) => d.likes.includes(post.id)) ?? [],
    [d?.likes, d?.posts],
  );
  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
      new Date(date),
    );

  return (
    <AppShell>
      <PageHeader
        eyebrow="Your community footprint"
        title="My activity"
        description="Keep track of everything you have shared, watched, liked, commented on and started across DIM Community."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={Activity} label="Posts" value={d?.posts.length ?? 0} />
        <Metric icon={Video} label="Reels" value={reels.length} />
        <Metric icon={Heart} label="Likes" value={d?.likes.length ?? 0} />
        <Metric icon={Users} label="Connections" value={d?.follows.length ?? 0} />
      </div>
      <Tabs value={view} onValueChange={setView} className="mt-8">
        <TabsList className="grid h-auto w-full grid-cols-3 rounded-2xl bg-muted p-1">
          <TabsTrigger value="overview" className="rounded-xl py-2.5">
            Overview
          </TabsTrigger>
          <TabsTrigger value="content" className="rounded-xl py-2.5">
            Posts & reels
          </TabsTrigger>
          <TabsTrigger value="engagement" className="rounded-xl py-2.5">
            Engagement
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-5 space-y-5">
          <section>
            <SectionTitle icon={PlaySquare} title="Your latest posts" count={photos.length} />
            <div className="grid gap-4 md:grid-cols-2">
              {photos.slice(0, 4).map((post) => (
                <PostActivityCard key={post.id} post={post} formatDate={formatDate} />
              ))}
            </div>
            {!photos.length ? (
              <EmptyState
                title="No posts yet"
                copy="Share your first idea with the DIM community."
              />
            ) : null}
          </section>
          <section>
            <SectionTitle icon={Video} title="Your reels" count={reels.length} />
            <div className="grid gap-4 md:grid-cols-2">
              {reels.slice(0, 2).map((post) => (
                <PostActivityCard key={post.id} post={post} formatDate={formatDate} />
              ))}
            </div>
            {!reels.length ? (
              <EmptyState
                title="No reels yet"
                copy="Create a short video to share what you are building."
              />
            ) : null}
          </section>
        </TabsContent>
        <TabsContent value="content" className="mt-5 space-y-4">
          {d?.posts.map((post) => (
            <PostActivityCard key={post.id} post={post} formatDate={formatDate} />
          ))}
          {!d?.posts.length ? (
            <EmptyState
              title="Your content will appear here"
              copy="Posts and reels you publish are collected in one place."
            />
          ) : null}
        </TabsContent>
        <TabsContent value="engagement" className="mt-5 space-y-5">
          <section>
            <SectionTitle icon={Heart} title="Posts you liked" count={likedPosts.length} />
            {likedPosts.map((post) => (
              <PostActivityCard key={post.id} post={post} formatDate={formatDate} compact />
            ))}
            {!likedPosts.length ? (
              <EmptyState
                title="No likes yet"
                copy="When you like a community post, it will appear here."
              />
            ) : null}
          </section>
          <section>
            <SectionTitle
              icon={MessageCircle}
              title="Comments you left"
              count={d?.comments.length ?? 0}
            />
            {d?.comments.slice(0, 6).map((comment) => (
              <Card key={comment.id} className="mb-3 rounded-2xl">
                <CardContent className="flex items-start gap-3 p-4">
                  <MessageCircle className="mt-0.5 size-4 text-primary" />
                  <div>
                    <p className="text-sm">{comment.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!d?.comments.length ? (
              <EmptyState
                title="No comments yet"
                copy="Join the conversation and your replies will be tracked here."
              />
            ) : null}
          </section>
          <section>
            <SectionTitle icon={Send} title="Message requests" count={d?.requests.length ?? 0} />
            {d?.requests.slice(0, 6).map((request) => (
              <Card key={request.id} className="mb-3 rounded-2xl">
                <CardContent className="flex items-center gap-3 p-4">
                  <span className="grid size-9 place-items-center rounded-full bg-primary/10">
                    <Send className="size-4 text-primary" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {request.direction === "sent" ? "Request sent" : "Request received"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{request.message}</p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {request.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
            {!d?.requests.length ? (
              <EmptyState
                title="No message requests"
                copy="Your networking requests will appear here."
              />
            ) : null}
          </section>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: number;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center gap-3 p-4">
        <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
function SectionTitle({
  icon: Icon,
  title,
  count,
}: {
  icon: typeof Activity;
  title: string;
  count: number;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="size-5 text-primary" />
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <Badge variant="secondary">{count}</Badge>
    </div>
  );
}
function PostActivityCard({
  post,
  formatDate,
  compact = false,
}: {
  post: ActivityPost;
  formatDate: (date: string) => string;
  compact?: boolean;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex gap-4 p-4">
        {post.mediaUrl && !compact ? (
          <img src={post.mediaUrl} alt="" className="size-20 shrink-0 rounded-xl object-cover" />
        ) : (
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            {post.media_type === "video" ? (
              <Video className="size-5" />
            ) : (
              <PlaySquare className="size-5" />
            )}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{post.media_type === "video" ? "Reel" : "Post"}</Badge>
            {post.space_slug ? (
              <span className="text-xs text-muted-foreground">{post.space_slug}</span>
            ) : null}
          </div>
          <p className="mt-2 line-clamp-2 font-semibold">
            {post.title || post.body || "Untitled post"}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock3 className="size-3" />
            {formatDate(post.created_at)}
          </p>
        </div>
        <Button size="icon" variant="ghost" aria-label="Open post">
          <ArrowUpRight className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
function EmptyState({ title, copy }: { title: string; copy: string }) {
  return (
    <Card className="rounded-2xl border-dashed">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <CheckCircle2 className="size-7 text-primary/70" />
        <p className="mt-3 font-semibold">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{copy}</p>
      </CardContent>
    </Card>
  );
}
