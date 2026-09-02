import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Pause,
  Play,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";

import { FoundingBadge } from "@/components/dim/FoundingBadge";
import { initials, timeAgo, type PostAuthor } from "@/components/dim/CommunityPost";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/reels/")({
  validateSearch: z.object({ post: z.string().optional() }),
  component: Reels,
});

type Reel = {
  id: string;
  user_id: string;
  title: string | null;
  body: string;
  created_at: string;
  media_path: string | null;
  tags: string[];
  url: string | null;
};

function ReelCard({
  reel,
  author,
  liked,
  likeCount,
  commentCount,
  muted,
  onToggleMuted,
  onToggleLike,
  onComment,
  comments,
  authorFor,
}: {
  reel: Reel;
  author: PostAuthor | undefined;
  liked: boolean;
  likeCount: number;
  commentCount: number;
  muted: boolean;
  onToggleMuted: () => void;
  onToggleLike: () => void;
  onComment: (body: string) => Promise<void> | void;
  comments: { id: string; user_id: string; body: string }[];
  authorFor: (id: string) => PostAuthor | undefined;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const el = wrapRef.current;
    const video = videoRef.current;
    if (!el || !video) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.6, 1] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = muted;
  }, [muted]);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => undefined);
    else video.pause();
  }

  const long = reel.body.length > 120;

  return (
    <div
      ref={wrapRef}
      className="relative h-[100svh] w-full snap-start snap-always overflow-hidden bg-ink"
    >
      {reel.url ? (
        <video
          ref={videoRef}
          src={reel.url}
          loop
          playsInline
          muted={muted}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
          }}
          onClick={toggle}
          className="absolute inset-0 size-full object-contain"
          aria-label={reel.title ?? "Community reel"}
        />
      ) : (
        <div className="flex size-full items-center justify-center text-sm text-ink-foreground/70">
          Video unavailable
        </div>
      )}

      {/* Cinematic gradients for legible overlays */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />

      {!playing && reel.url ? (
        <button
          type="button"
          onClick={toggle}
          aria-label="Play video"
          className="absolute inset-0 grid place-items-center"
        >
          <span className="grid size-16 place-items-center rounded-full bg-ink/50 text-ink-foreground backdrop-blur">
            <Play className="size-7 fill-current" />
          </span>
        </button>
      ) : null}

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center gap-2 px-4 pt-4">
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label="Back to community"
          className="text-ink-foreground hover:bg-ink/40 hover:text-ink-foreground"
        >
          <Link to="/community">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <span className="font-display text-base font-extrabold tracking-wide text-ink-foreground">
          Reels
        </span>
        <button
          type="button"
          onClick={onToggleMuted}
          aria-label={muted ? "Unmute" : "Mute"}
          className="ml-auto grid size-9 place-items-center rounded-full bg-ink/50 text-ink-foreground backdrop-blur"
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="grid size-9 place-items-center rounded-full bg-ink/50 text-ink-foreground backdrop-blur"
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>
      </div>

      {/* Side actions */}
      <div className="absolute bottom-28 right-3 flex flex-col items-center gap-5 text-ink-foreground">
        <button type="button" onClick={onToggleLike} aria-label="Like" className="flex flex-col items-center">
          <Heart className={cn("size-8 drop-shadow", liked && "fill-current text-destructive")} />
          <span className="mt-1 text-xs font-semibold">{likeCount}</span>
        </button>
        <button
          type="button"
          onClick={() => setSheet(true)}
          aria-label="Comments"
          className="flex flex-col items-center"
        >
          <MessageCircle className="size-8 drop-shadow" />
          <span className="mt-1 text-xs font-semibold">{commentCount}</span>
        </button>
      </div>

      {/* Caption */}
      <div className="absolute inset-x-0 bottom-0 px-4 pb-8">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 border border-ink-foreground/30">
            <AvatarImage src={author?.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="bg-primary/20 text-primary-foreground">
              {initials(author?.full_name ?? null)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-ink-foreground">
                {author?.full_name ?? "DIM member"}
              </span>
              <FoundingBadge number={author?.founding_number ?? null} />
            </div>
            <p className="text-xs text-ink-foreground/70">{timeAgo(reel.created_at)}</p>
          </div>
        </div>

        {reel.title ? (
          <p className="mt-3 font-display text-base font-bold text-ink-foreground">{reel.title}</p>
        ) : null}
        {reel.body ? (
          <p className="mt-1 max-w-xl whitespace-pre-line text-sm leading-relaxed text-ink-foreground/90">
            {expanded || !long ? reel.body : `${reel.body.slice(0, 120).trimEnd()}… `}
            {long ? (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="font-semibold text-accent"
              >
                {expanded ? "less" : "more"}
              </button>
            ) : null}
          </p>
        ) : null}
        {reel.tags.length ? (
          <p className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-accent">
            {reel.tags.map((t) => (
              <span key={t}>#{t.replace(/^#/, "")}</span>
            ))}
          </p>
        ) : null}

        <div className="mt-4 h-0.5 w-full overflow-hidden rounded-full bg-ink-foreground/25">
          <div
            className="h-full rounded-full bg-ink-foreground/90 transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Comments sheet */}
      {sheet ? (
        <div className="absolute inset-0 z-10 flex flex-col justify-end">
          <button
            type="button"
            aria-label="Close comments"
            onClick={() => setSheet(false)}
            className="flex-1 bg-ink/50"
          />
          <div className="max-h-[65%] overflow-y-auto rounded-t-3xl bg-card p-4">
            <p className="text-center text-sm font-semibold">
              {commentCount} {commentCount === 1 ? "comment" : "comments"}
            </p>
            <div className="mt-4 space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <Avatar className="size-7">
                    <AvatarImage src={authorFor(c.user_id)?.avatar_url ?? undefined} alt="" />
                    <AvatarFallback className="bg-accent/20 text-[10px]">
                      {initials(authorFor(c.user_id)?.full_name ?? null)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl bg-muted px-3 py-2 text-sm">
                    <p className="text-xs font-semibold">
                      {authorFor(c.user_id)?.full_name ?? "DIM member"}
                    </p>
                    <p className="mt-0.5 text-foreground/90">{c.body}</p>
                  </div>
                </div>
              ))}
              {!comments.length ? (
                <p className="text-sm text-muted-foreground">Be the first to comment.</p>
              ) : null}
            </div>
            <div className="mt-4 flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a comment…"
                className="rounded-full bg-muted"
              />
              <Button
                size="icon"
                className="rounded-full"
                disabled={!draft.trim()}
                aria-label="Send comment"
                onClick={async () => {
                  await onComment(draft.trim());
                  setDraft("");
                }}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Reels() {
  const { post: startId } = Route.useSearch();
  const { userId } = useMember();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [muted, setMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const data = useQuery({
    queryKey: ["reels", userId],
    queryFn: async () => {
      const postsRes = await supabase
        .from("posts")
        .select("*")
        .eq("media_type", "video")
        .not("media_path", "is", null)
        .order("created_at", { ascending: false })
        .limit(30);
      const rows = postsRes.data ?? [];
      const ids = rows.map((p) => p.id);
      const authorIds = [...new Set(rows.map((p) => p.user_id))];

      const [likesRes, commentsRes, profilesRes, membersRes] = await Promise.all([
        ids.length
          ? supabase.from("likes").select("post_id, user_id").in("post_id", ids)
          : Promise.resolve({ data: [] }),
        ids.length
          ? supabase.from("comments").select("*").in("post_id", ids).order("created_at")
          : Promise.resolve({ data: [] }),
        authorIds.length
          ? supabase.from("profiles").select("id, full_name, headline, avatar_url").in("id", authorIds)
          : Promise.resolve({ data: [] }),
        authorIds.length
          ? supabase.from("elite_members").select("user_id, founding_number").in("user_id", authorIds)
          : Promise.resolve({ data: [] }),
      ]);

      const paths = rows.map((p) => p.media_path).filter((p): p is string => !!p);
      const urls = new Map<string, string>();
      if (paths.length) {
        const signed = await supabase.storage.from("community-media").createSignedUrls(paths, 60 * 60);
        (signed.data ?? []).forEach((entry, i) => {
          const path = paths[i];
          if (path && entry.signedUrl) urls.set(path, entry.signedUrl);
        });
      }

      const memberMap = new Map(
        (membersRes.data ?? []).map((m) => [m.user_id, m.founding_number as number | null]),
      );
      const authors = new Map<string, PostAuthor>(
        (profilesRes.data ?? []).map((p) => [
          p.id,
          {
            full_name: p.full_name,
            headline: p.headline,
            avatar_url: p.avatar_url,
            founding_number: memberMap.get(p.id) ?? null,
          },
        ]),
      );

      const reels: Reel[] = rows.map((p) => ({
        id: p.id,
        user_id: p.user_id,
        title: p.title,
        body: p.body,
        created_at: p.created_at,
        media_path: p.media_path,
        tags: (p.tags ?? []) as string[],
        url: p.media_path ? (urls.get(p.media_path) ?? null) : null,
      }));

      return {
        reels,
        likes: (likesRes.data ?? []) as { post_id: string; user_id: string }[],
        comments: (commentsRes.data ?? []) as { id: string; post_id: string; user_id: string; body: string }[],
        authors,
      };
    },
  });

  const reels = useMemo(() => {
    const list = data.data?.reels ?? [];
    if (!startId) return list;
    const idx = list.findIndex((r) => r.id === startId);
    if (idx <= 0) return list;
    return [list[idx]!, ...list.slice(0, idx), ...list.slice(idx + 1)];
  }, [data.data, startId]);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 });
  }, [startId]);

  async function toggleLike(postId: string, liked: boolean) {
    if (!userId) return;
    if (liked) await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId);
    else await supabase.from("likes").insert({ post_id: postId, user_id: userId });
    await queryClient.invalidateQueries({ queryKey: ["reels"] });
  }

  async function addComment(postId: string, body: string) {
    if (!userId || !body) return;
    await supabase.from("comments").insert({ post_id: postId, user_id: userId, body });
    await queryClient.invalidateQueries({ queryKey: ["reels"] });
  }

  if (!data.isLoading && reels.length === 0) {
    return (
      <div className="grid min-h-[100svh] place-items-center bg-ink px-6 text-center">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-foreground">No reels yet</h1>
          <p className="mt-2 text-sm text-ink-foreground/70">
            Share a video in the community and it will show up here.
          </p>
          <Button className="mt-6" onClick={() => navigate({ to: "/community" })}>
            Back to community
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[100svh] snap-y snap-mandatory overflow-y-auto overscroll-contain bg-ink"
    >
      {reels.map((reel) => {
        const likes = (data.data?.likes ?? []).filter((l) => l.post_id === reel.id);
        const comments = (data.data?.comments ?? []).filter((c) => c.post_id === reel.id);
        return (
          <ReelCard
            key={reel.id}
            reel={reel}
            author={data.data?.authors.get(reel.user_id)}
            liked={likes.some((l) => l.user_id === userId)}
            likeCount={likes.length}
            commentCount={comments.length}
            comments={comments}
            authorFor={(id) => data.data?.authors.get(id)}
            muted={muted}
            onToggleMuted={() => setMuted((v) => !v)}
            onToggleLike={() => toggleLike(reel.id, likes.some((l) => l.user_id === userId))}
            onComment={(body) => addComment(reel.id, body)}
          />
        );
      })}
    </div>
  );
}
