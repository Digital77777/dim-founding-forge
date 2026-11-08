import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Pause,
  Play,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";

import { initials, timeAgo, type PostAuthor } from "@/components/dim/CommunityPost";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";
import { youtubeEmbedUrl, youtubeId, youtubeThumb } from "@/lib/reels";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  post: z.string().optional(),
  q: fallback(z.string(), "").default(""),
  tag: fallback(z.string(), "").default(""),
  author: fallback(z.string(), "").default(""),
  feed: fallback(z.string(), "all").default("all"),
});

export const Route = createFileRoute("/_authenticated/reels/")({
  staticData: { sitemap: false },
  validateSearch: zodValidator(searchSchema),
  component: Reels,
});

type Reel = {
  id: string;
  user_id: string;
  title: string | null;
  body: string;
  created_at: string;
  tags: string[];
  url: string | null;
  youtube: string | null;
};

function ReelMedia({
  reel,
  active,
  near,
  muted,
  onPlayingChange,
  onProgress,
  registerToggle,
}: {
  reel: Reel;
  active: boolean;
  near: boolean;
  muted: boolean;
  onPlayingChange: (playing: boolean) => void;
  onProgress: (pct: number) => void;
  registerToggle: (fn: (() => void) | null) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => undefined);
    else video.pause();
  }, []);

  useEffect(() => {
    if (reel.youtube) {
      registerToggle(null);
      return;
    }
    registerToggle(toggle);
    return () => registerToggle(null);
  }, [registerToggle, toggle, reel.youtube]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    if (active) void video.play().catch(() => undefined);
    else {
      video.pause();
      if (!near) video.currentTime = 0;
    }
  }, [active, near, muted]);

  if (reel.youtube) {
    return near ? (
      <iframe
        key={active ? "on" : "off"}
        src={youtubeEmbedUrl(reel.youtube, { autoplay: active, muted })}
        title={reel.title ?? "Community reel"}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 size-full"
      />
    ) : (
      <img
        src={youtubeThumb(reel.youtube)}
        alt=""
        className="absolute inset-0 size-full object-cover opacity-70"
      />
    );
  }

  if (!reel.url) {
    return (
      <div className="flex size-full items-center justify-center text-sm text-ink-foreground/70">
        Video unavailable
      </div>
    );
  }

  // Only mount nearby videos; the next one preloads fully so scrolling feels instant.
  if (!near) return <div className="absolute inset-0 bg-ink" />;

  return (
    <video
      ref={videoRef}
      src={reel.url}
      loop
      playsInline
      muted={muted}
      preload="auto"
      onPlay={() => onPlayingChange(true)}
      onPause={() => onPlayingChange(false)}
      onTimeUpdate={(e) => {
        const v = e.currentTarget;
        onProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
      }}
      onClick={toggle}
      className="absolute inset-0 size-full object-contain"
      aria-label={reel.title ?? "Community reel"}
    />
  );
}

function ReelCard({
  reel,
  index,
  activeIndex,
  author,
  liked,
  likeCount,
  commentCount,
  comments,
  authorFor,
  following,
  muted,
  onToggleMuted,
  onToggleLike,
  onToggleFollow,
  onComment,
  onTagClick,
  onActive,
  isSelf,
}: {
  reel: Reel;
  index: number;
  activeIndex: number;
  author: PostAuthor | undefined;
  liked: boolean;
  likeCount: number;
  commentCount: number;
  comments: { id: string; user_id: string; body: string }[];
  authorFor: (id: string) => PostAuthor | undefined;
  following: boolean;
  muted: boolean;
  onToggleMuted: () => void;
  onToggleLike: () => void;
  onToggleFollow: () => void;
  onComment: (body: string) => Promise<void> | void;
  onTagClick: (tag: string) => void;
  onActive: (index: number) => void;
  isSelf: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<(() => void) | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [draft, setDraft] = useState("");
  const [controlsVisible, setControlsVisible] = useState(true);

  const active = index === activeIndex;
  const mediaIsPlaying = reel.youtube ? active : playing;
  const clearView = active && mediaIsPlaying && !controlsVisible && !sheet;

  useEffect(() => {
    if (active) setControlsVisible(true);
  }, [active]);

  useEffect(() => {
    if (!mediaIsPlaying || !active || sheet) return;
    const timer = window.setTimeout(() => setControlsVisible(false), 900);
    return () => window.clearTimeout(timer);
  }, [active, mediaIsPlaying, sheet]);

  const revealControls = () => setControlsVisible(true);
  const near = Math.abs(index - activeIndex) <= 1;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && entry.intersectionRatio > 0.6) onActive(index);
      },
      { threshold: [0, 0.6, 1] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [index, onActive]);

  const long = reel.body.length > 120;

  return (
    <div
      ref={wrapRef}
      onPointerDown={revealControls}
      className="relative isolate h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full snap-start snap-always snap-stop-always overflow-hidden bg-ink"
    >
      <ReelMedia
        reel={reel}
        active={active}
        near={near}
        muted={muted}
        onPlayingChange={setPlaying}
        onProgress={setProgress}
        registerToggle={(fn) => {
          toggleRef.current = fn;
        }}
      />
      {clearView ? (
        <button
          type="button"
          aria-label="Show reel controls"
          onPointerDown={revealControls}
          className="absolute inset-0 z-10 cursor-default bg-transparent"
        />
      ) : null}

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/80 to-transparent transition-opacity duration-300",
          clearView && "opacity-0",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent transition-opacity duration-300",
          clearView && "opacity-0",
        )}
      />

      {!playing && !reel.youtube && near ? (
        <button
          type="button"
          onClick={() => toggleRef.current?.()}
          aria-label="Play video"
          className={cn(
            "absolute inset-0 grid place-items-center transition-opacity duration-300",
            clearView && "pointer-events-none opacity-0",
          )}
        >
          <span className="grid size-16 place-items-center rounded-full bg-ink/50 text-ink-foreground backdrop-blur">
            <Play className="size-7 fill-current" />
          </span>
        </button>
      ) : null}

      <div
        className={cn(
          "absolute bottom-28 right-3 flex flex-col items-center gap-5 text-ink-foreground transition-opacity duration-300",
          clearView && "pointer-events-none opacity-0",
        )}
      >
        <button
          type="button"
          onClick={onToggleLike}
          aria-label="Like"
          className="flex flex-col items-center"
        >
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
        {!reel.youtube ? (
          <button
            type="button"
            onClick={() => toggleRef.current?.()}
            aria-label={playing ? "Pause" : "Play"}
            className="grid size-9 place-items-center rounded-full bg-ink/50 backdrop-blur"
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onToggleMuted}
          aria-label={muted ? "Unmute" : "Mute"}
          className="grid size-9 place-items-center rounded-full bg-ink/50 backdrop-blur"
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      </div>

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 px-4 pb-8 transition-opacity duration-300",
          clearView && "pointer-events-none opacity-0",
        )}
      >
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
            </div>
            <p className="text-xs text-ink-foreground/70">{timeAgo(reel.created_at)}</p>
          </div>
          {!isSelf ? (
            <button
              type="button"
              onClick={onToggleFollow}
              className={cn(
                "ml-auto rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur",
                following
                  ? "border-ink-foreground/40 text-ink-foreground"
                  : "border-transparent bg-ink-foreground text-ink",
              )}
            >
              {following ? "Following" : "Follow"}
            </button>
          ) : null}
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
              <button key={t} type="button" onClick={() => onTagClick(t)}>
                #{t.replace(/^#/, "")}
              </button>
            ))}
          </p>
        ) : null}

        <div className="mt-4 h-0.5 w-full overflow-hidden rounded-full bg-ink-foreground/25">
          <div
            className="h-full rounded-full bg-ink-foreground/90 transition-[width] duration-150"
            style={{ width: `${reel.youtube ? 0 : progress}%` }}
          />
        </div>
      </div>

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
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/reels/" });
  const { userId } = useMember();
  const queryClient = useQueryClient();
  const [muted, setMuted] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [panel, setPanel] = useState(false);
  const [term, setTerm] = useState(search.q);
  const [reelsPage, setReelsPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const data = useQuery({
    queryKey: ["reels", userId, reelsPage],
    queryFn: async () => {
      const postsRes = await supabase
        .from("posts")
        .select("*")
        .eq("media_type", "video")
        .order("created_at", { ascending: false })
        .limit((reelsPage + 1) * 60);
      const rows = (postsRes.data ?? []).filter((p) => p.media_path || p.media_url);
      const ids = rows.map((p) => p.id);
      const authorIds = [...new Set(rows.map((p) => p.user_id))];

      const [myLikesRes, likeCountsRes, commentsRes, profilesRes, membersRes, followsRes] =
        await Promise.all([
          ids.length && userId
            ? supabase.from("likes").select("post_id").eq("user_id", userId).in("post_id", ids)
            : Promise.resolve({ data: [] }),
          ids.length
            ? supabase.from("like_counts").select("post_id, like_count").in("post_id", ids)
            : Promise.resolve({ data: [] }),
          ids.length
            ? supabase.from("comments").select("*").in("post_id", ids).order("created_at")
            : Promise.resolve({ data: [] }),
          authorIds.length
            ? supabase
                .from("profiles")
                .select("id, full_name, headline, avatar_url")
                .in("id", authorIds)
            : Promise.resolve({ data: [] }),
          authorIds.length
            ? supabase
                .from("member_badges")
                .select("user_id, founding_number")
                .in("user_id", authorIds)
            : Promise.resolve({ data: [] }),
          userId
            ? supabase.from("follows").select("following_id").eq("follower_id", userId)
            : Promise.resolve({ data: [] }),
        ]);

      const paths = rows.map((p) => p.media_path).filter((p): p is string => !!p);
      const urls = new Map<string, string>();
      if (paths.length) {
        const signed = await supabase.storage
          .from("community-media")
          .createSignedUrls(paths, 60 * 60);
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
        tags: (p.tags ?? []) as string[],
        url: p.media_path ? (urls.get(p.media_path) ?? null) : null,
        youtube: p.media_url ? youtubeId(p.media_url) : null,
      }));

      return {
        reels,
        likes: (myLikesRes.data ?? []) as { post_id: string }[],
        likeCounts: new Map<string, number>(
          (likeCountsRes.data ?? []).map((c) => [c.post_id as string, c.like_count as number]),
        ),
        comments: (commentsRes.data ?? []) as {
          id: string;
          post_id: string;
          user_id: string;
          body: string;
        }[],
        authors,
        following: new Set((followsRes.data ?? []).map((f) => f.following_id as string)),
      };
    },
  });

  const all = data.data?.reels ?? [];
  const canLoadMore = all.length === (reelsPage + 1) * 60;

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !canLoadMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !data.isFetching) setReelsPage((page) => page + 1);
      },
      { root: containerRef.current, rootMargin: "640px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [canLoadMore, data.isFetching]);

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    all.forEach((r) => r.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
  }, [all]);

  const authorOptions = useMemo(() => {
    const seen = new Map<string, string>();
    all.forEach((r) => {
      const name = data.data?.authors.get(r.user_id)?.full_name ?? "DIM member";
      if (!seen.has(r.user_id)) seen.set(r.user_id, name);
    });
    return [...seen.entries()];
  }, [all, data.data]);

  const reels = useMemo(() => {
    const q = search.q.trim().toLowerCase();
    let list = all.filter((r) => {
      if (search.feed === "following" && !data.data?.following.has(r.user_id)) return false;
      if (search.tag && !r.tags.some((t) => t.toLowerCase() === search.tag.toLowerCase()))
        return false;
      if (search.author && r.user_id !== search.author) return false;
      if (q) {
        const name = data.data?.authors.get(r.user_id)?.full_name?.toLowerCase() ?? "";
        const haystack = `${r.title ?? ""} ${r.body} ${r.tags.join(" ")} ${name}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    if (search.post) {
      const idx = list.findIndex((r) => r.id === search.post);
      if (idx > 0) list = [list[idx]!, ...list.slice(0, idx), ...list.slice(idx + 1)];
    }
    return list;
  }, [all, data.data, search.feed, search.tag, search.author, search.q, search.post]);

  useEffect(() => {
    setActiveIndex(0);
    setReelsPage(0);
    containerRef.current?.scrollTo({ top: 0 });
  }, [search.post, search.tag, search.author, search.feed, search.q]);

  const setFilters = useCallback(
    (patch: Partial<typeof search>) => {
      void navigate({ search: { ...search, ...patch, post: undefined } });
    },
    [navigate, search],
  );

  async function toggleLike(postId: string, liked: boolean) {
    if (!userId) return;
    if (liked) await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId);
    else await supabase.from("likes").insert({ post_id: postId, user_id: userId });
    await queryClient.invalidateQueries({ queryKey: ["reels"] });
  }

  async function toggleFollow(authorId: string, following: boolean) {
    if (!userId || authorId === userId) return;
    if (following)
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", userId)
        .eq("following_id", authorId);
    else await supabase.from("follows").insert({ follower_id: userId, following_id: authorId });
    await queryClient.invalidateQueries({ queryKey: ["reels"] });
  }

  async function addComment(postId: string, body: string) {
    if (!userId || !body) return;
    await supabase.from("comments").insert({ post_id: postId, user_id: userId, body });
    await queryClient.invalidateQueries({ queryKey: ["reels"] });
  }

  const filterCount =
    (search.tag ? 1 : 0) + (search.author ? 1 : 0) + (search.feed === "following" ? 1 : 0);

  return (
    <div className="relative bg-ink">
      {/* Top chrome: back, search, filters, create */}
      <div className="fixed inset-x-0 top-0 z-30 px-3 pt-3">
        <div className="flex items-center gap-2">
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
          <form
            className="relative flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              setFilters({ q: term });
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-foreground/70" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search reels, tags, members"
              aria-label="Search reels"
              className="h-10 w-full rounded-full border border-ink-foreground/20 bg-ink/60 pl-9 pr-9 text-sm text-ink-foreground placeholder:text-ink-foreground/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {term ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setTerm("");
                  setFilters({ q: "" });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-foreground/70"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </form>
          <button
            type="button"
            onClick={() => setPanel((v) => !v)}
            aria-label="Filters"
            className="relative grid size-10 shrink-0 place-items-center rounded-full border border-ink-foreground/20 bg-ink/60 text-ink-foreground backdrop-blur"
          >
            <SlidersHorizontal className="size-4" />
            {filterCount ? (
              <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-accent text-[10px] font-bold text-ink">
                {filterCount}
              </span>
            ) : null}
          </button>
          <Button
            asChild
            size="icon"
            className="size-10 shrink-0 rounded-full"
            aria-label="Create a reel"
          >
            <Link to="/reels/create">
              <Plus className="size-5" />
            </Link>
          </Button>
        </div>

        {/* Following / All */}
        <div className="mt-2 flex gap-2">
          {(
            [
              { key: "all", label: "For you" },
              { key: "following", label: "Following" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setFilters({ feed: t.key })}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur transition",
                search.feed === t.key
                  ? "bg-ink-foreground text-ink"
                  : "border border-ink-foreground/20 bg-ink/50 text-ink-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
          {search.tag ? (
            <button
              onClick={() => setFilters({ tag: "" })}
              className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-ink"
            >
              #{search.tag} <X className="size-3" />
            </button>
          ) : null}
          {search.author ? (
            <button
              onClick={() => setFilters({ author: "" })}
              className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-ink"
            >
              {authorOptions.find(([id]) => id === search.author)?.[1] ?? "Member"}
              <X className="size-3" />
            </button>
          ) : null}
        </div>
      </div>

      {panel ? (
        <div className="fixed inset-0 z-40 flex flex-col justify-end">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setPanel(false)}
            className="flex-1 bg-ink/60"
          />
          <div className="max-h-[70%] overflow-y-auto rounded-t-3xl bg-card p-5">
            <div className="flex items-center">
              <h2 className="font-display text-lg font-bold">Filter reels</h2>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => {
                  setTerm("");
                  setFilters({ q: "", tag: "", author: "", feed: "all" });
                }}
              >
                Reset
              </Button>
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tags
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {allTags.length ? (
                allTags.map(([tag, count]) => (
                  <button
                    key={tag}
                    onClick={() => setFilters({ tag: search.tag === tag ? "" : tag })}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium",
                      search.tag === tag
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    #{tag} <span className="text-xs text-muted-foreground">{count}</span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No tags yet.</p>
              )}
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Creators
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {authorOptions.map(([id, name]) => (
                <button
                  key={id}
                  onClick={() => setFilters({ author: search.author === id ? "" : id })}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium",
                    search.author === id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted",
                  )}
                >
                  {name}
                </button>
              ))}
            </div>

            <Button className="mt-6 w-full" onClick={() => setPanel(false)}>
              Show {reels.length} {reels.length === 1 ? "reel" : "reels"}
            </Button>
          </div>
        </div>
      ) : null}

      {!data.isLoading && reels.length === 0 ? (
        <div className="grid min-h-[100svh] place-items-center px-6 text-center">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink-foreground">
              {all.length ? "No reels match those filters" : "No reels yet"}
            </h1>
            <p className="mt-2 text-sm text-ink-foreground/70">
              {all.length
                ? "Try clearing the search, tag or creator filter."
                : "Be the first founding member to publish a reel."}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild>
                <Link to="/reels/create">Create a reel</Link>
              </Button>
              {all.length ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setTerm("");
                    setFilters({ q: "", tag: "", author: "", feed: "all" });
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button asChild variant="secondary">
                  <Link to="/community">Back to community</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="fixed inset-0 z-20 h-[100dvh] snap-y snap-mandatory overflow-y-auto overscroll-y-contain overscroll-x-none touch-pan-y"
        >
          {reels.map((reel, i) => {
            const liked = (data.data?.likes ?? []).some((l) => l.post_id === reel.id);
            const comments = (data.data?.comments ?? []).filter((c) => c.post_id === reel.id);
            const isFollowing = !!data.data?.following.has(reel.user_id);
            return (
              <ReelCard
                key={reel.id}
                reel={reel}
                index={i}
                activeIndex={activeIndex}
                author={data.data?.authors.get(reel.user_id)}
                liked={liked}
                likeCount={data.data?.likeCounts.get(reel.id) ?? 0}
                commentCount={comments.length}
                comments={comments}
                authorFor={(id) => data.data?.authors.get(id)}
                following={isFollowing}
                isSelf={reel.user_id === userId}
                muted={muted}
                onToggleMuted={() => setMuted((v) => !v)}
                onToggleLike={() => toggleLike(reel.id, liked)}
                onToggleFollow={() => toggleFollow(reel.user_id, isFollowing)}
                onComment={(body) => addComment(reel.id, body)}
                onTagClick={(tag) => setFilters({ tag })}
                onActive={setActiveIndex}
              />
            );
          })}
          {canLoadMore ? (
            <div
              ref={loadMoreRef}
              className="flex h-24 snap-start items-center justify-center text-sm text-ink-foreground/70"
              aria-live="polite"
            >
              {data.isFetching ? "Loading more reels…" : "Swipe for more"}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
