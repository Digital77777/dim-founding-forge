import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Calendar,
  ImagePlus,
  MessageCircle,
  Play,
  Users,
  UserSearch,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/dim/AppShell";
import {
  MediaPostCard,
  TextPostCard,
  type CommunityPostRow,
  type PostAuthor,
  type PostComment,
} from "@/components/dim/CommunityPost";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { youtubeId } from "@/lib/reels";
import { useMember } from "@/hooks/use-member";
import { awardAchievement } from "@/lib/member-actions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/community")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "DIM Community | Discussions, Reels & Member Spaces" },
      {
        name: "description",
        content:
          "Connect with DIM members, explore community spaces, and share discussions, photos and reels.",
      },
      { property: "og:title", content: "DIM Community | Discussions, Reels & Member Spaces" },
      {
        property: "og:description",
        content:
          "Connect with DIM members, explore community spaces, and share discussions, photos and reels.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Community,
});

function Community() {
  const { userId } = useMember();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [space, setSpace] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [feedPage, setFeedPage] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const featureRailRef = useRef<HTMLDivElement>(null);
  const featureRailDragRef = useRef({ active: false, moved: false, startX: 0, scrollLeft: 0 });

  const data = useQuery({
    queryKey: ["community", space, userId, feedPage],
    queryFn: async () => {
      const spacesRes = await supabase.from("community_spaces").select("*").order("sort");
      let postQuery = supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit((feedPage + 1) * 40);
      if (space) postQuery = postQuery.eq("space_slug", space);
      const postsRes = await postQuery;
      const posts = (postsRes.data ?? []) as CommunityPostRow[];
      const ids = posts.map((p) => p.id);
      const authorIds = [...new Set(posts.map((p) => p.user_id))];
      const [myLikesRes, likeCountsRes, commentsRes, profilesRes, membersRes] = await Promise.all([
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
      ]);

      const paths = posts.map((p) => p.media_path).filter((p): p is string => !!p);
      const mediaUrls = new Map<string, string>();
      if (paths.length) {
        const signed = await supabase.storage
          .from("community-media")
          .createSignedUrls(paths, 60 * 60);
        (signed.data ?? []).forEach((entry, i) => {
          const path = paths[i];
          if (path && entry.signedUrl) mediaUrls.set(path, entry.signedUrl);
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

      return {
        spaces: spacesRes.data ?? [],
        posts,
        likes: (myLikesRes.data ?? []) as { post_id: string }[],
        likeCounts: new Map<string, number>(
          (likeCountsRes.data ?? []).map((c) => [c.post_id as string, c.like_count as number]),
        ),
        comments: (commentsRes.data ?? []) as PostComment[],
        authors,
        mediaUrls,
      };
    },
  });

  const d = data.data;
  const canLoadMore = (d?.posts.length ?? 0) === (feedPage + 1) * 40;

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !canLoadMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !data.isFetching) setFeedPage((page) => page + 1);
      },
      { rootMargin: "640px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [canLoadMore, data.isFetching]);

  useEffect(() => {
    setFeedPage(0);
  }, [space, userId]);

  function pickFile(f: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function post() {
    if (!userId || (!body.trim() && !file)) return;
    const target = space ?? d?.spaces[0]?.slug;
    if (!target) return;
    setBusy(true);
    try {
      let mediaPath: string | null = null;
      let mediaType: "image" | "video" | null = null;
      if (file) {
        mediaType = file.type.startsWith("video/") ? "video" : "image";
        const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage
          .from("community-media")
          .upload(path, file, { contentType: file.type });
        if (up.error) {
          toast.error("Could not upload that file.");
          return;
        }
        mediaPath = path;
      }

      const parsedTags = tags
        .split(/[,\s]+/)
        .map((t) => t.replace(/^#/, "").trim())
        .filter(Boolean)
        .slice(0, 5);

      const { error } = await supabase.from("posts").insert({
        user_id: userId,
        space_slug: target,
        title: title.trim() || null,
        body: body.trim(),
        media_path: mediaPath,
        media_type: mediaType,
        tags: parsedTags,
      });
      if (error) {
        toast.error("Could not post that.");
        return;
      }
      setTitle("");
      setBody("");
      setTags("");
      pickFile(null);
      const { count } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      if ((count ?? 0) >= 5)
        await awardAchievement(userId, "community_builder", "Community Builder");
      await queryClient.invalidateQueries({ queryKey: ["community"] });
      setComposerOpen(false);
      toast.success("Shared with the community.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleLike(postId: string, liked: boolean) {
    if (!userId) return;
    if (liked) await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId);
    else await supabase.from("likes").insert({ post_id: postId, user_id: userId });
    await queryClient.invalidateQueries({ queryKey: ["community"] });
  }

  async function addComment(postId: string, value: string) {
    if (!userId || !value) return;
    await supabase.from("comments").insert({ post_id: postId, user_id: userId, body: value });
    await queryClient.invalidateQueries({ queryKey: ["community"] });
  }

  const visible = d?.posts ?? [];

  const railChip =
    "inline-flex h-9 w-max shrink-0 snap-start items-center justify-center gap-1.5 rounded-full border border-primary/20 bg-card px-3 text-xs font-semibold whitespace-nowrap text-foreground shadow-sm transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 active:scale-95 motion-reduce:transition-none";

  const communityScrollHeader = (
    <div className="mx-auto max-w-7xl py-2.5">
      <div
        ref={featureRailRef}
        className="flex w-full cursor-grab snap-x snap-proximity gap-2 overflow-x-auto overscroll-x-contain scroll-smooth px-3 touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing"
        aria-label="Community features"
        onPointerDown={(event) => {
          const rail = featureRailRef.current;
          if (!rail) return;
          featureRailDragRef.current = {
            active: true,
            moved: false,
            startX: event.clientX,
            scrollLeft: rail.scrollLeft,
          };
          rail.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const drag = featureRailDragRef.current;
          const rail = featureRailRef.current;
          if (!drag.active || !rail) return;
          const distance = event.clientX - drag.startX;
          if (Math.abs(distance) > 4) drag.moved = true;
          rail.scrollLeft = drag.scrollLeft - distance;
        }}
        onPointerUp={(event) => {
          featureRailDragRef.current.active = false;
          featureRailRef.current?.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          featureRailDragRef.current.active = false;
        }}
        onClickCapture={(event) => {
          if (featureRailDragRef.current.moved) {
            event.preventDefault();
            event.stopPropagation();
            featureRailDragRef.current.moved = false;
          }
        }}
      >
        <button type="button" className={railChip} onClick={() => setComposerOpen(true)}>
          <ImagePlus className="size-3.5 shrink-0 text-primary sm:size-4" /> Create a post
        </button>
        <Link to="/events" className={railChip}>
          <Calendar className="size-3.5 shrink-0 text-primary sm:size-4" /> Browse events
        </Link>
        <Link to="/inbox" className={railChip}>
          <MessageCircle className="size-3.5 shrink-0 text-primary sm:size-4" /> My inbox
        </Link>
        <Link to="/activity" className={railChip}>
          <Activity className="size-3.5 shrink-0 text-primary sm:size-4" /> My activity
        </Link>
        <Link to="/connect" className={railChip}>
          <UserSearch className="size-3.5 shrink-0 text-primary sm:size-4" /> Find members
        </Link>
      </div>
    </div>
  );

  const spacePill = (active: boolean) =>
    cn(
      "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
      active
        ? "border-transparent bg-primary text-primary-foreground shadow-sm"
        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
    );

  return (
    <AppShell scrollHeader={communityScrollHeader}>
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            DIM Community
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight sm:text-3xl">
            Community feed
          </h1>
        </div>
      </header>

      {/* Spaces */}
      <div
        className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Community spaces"
      >
        <button onClick={() => setSpace(null)} className={spacePill(!space)}>
          All spaces
        </button>
        {(d?.spaces ?? []).map((s) => (
          <button
            key={s.slug}
            onClick={() => setSpace(s.slug)}
            className={spacePill(space === s.slug)}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Composer (opened from "Create a post") */}
      <Sheet open={composerOpen} onOpenChange={setComposerOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[90vh] overflow-y-auto rounded-t-3xl pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
        >
          <SheetHeader className="text-left">
            <SheetTitle className="font-display">Create a post</SheetTitle>
            <SheetDescription>
              Share what you're learning, building or figuring out.
            </SheetDescription>
          </SheetHeader>
          <Input
            className="mt-3"
            placeholder="Headline (optional)"
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
          <Input
            className="mt-3"
            placeholder="Tags, e.g. ai-tools research"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          {preview ? (
            <div className="relative mt-3 overflow-hidden rounded-xl border border-border">
              {file?.type.startsWith("video/") ? (
                <video src={preview} controls className="max-h-72 w-full bg-ink object-contain" />
              ) : (
                <img src={preview} alt="Selected upload" className="max-h-72 w-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => pickFile(null)}
                aria-label="Remove attachment"
                className="absolute right-2 top-2 rounded-full bg-ink/70 p-1.5 text-ink-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : null}

          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <ImagePlus className="mr-1 size-4" /> Photo
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Play className="mr-1 size-4" /> Video
            </Button>
            <Button className="ml-auto" onClick={post} disabled={busy || (!body.trim() && !file)}>
              {busy ? "Posting…" : "Post"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Feed */}
      <section id="feed" className="mt-4 scroll-mt-32 space-y-4">
        {visible.map((p) => {
          const liked = (d?.likes ?? []).some((l) => l.post_id === p.id);
          const props = {
            post: p,
            liked,
            likeCount: d?.likeCounts.get(p.id) ?? 0,
            comments: (d?.comments ?? []).filter((c) => c.post_id === p.id),
            authorFor: (id: string) => d?.authors.get(id),
            onToggleLike: () => toggleLike(p.id, liked),
            onComment: (value: string) => addComment(p.id, value),
            mediaUrl: p.media_path ? (d?.mediaUrls.get(p.media_path) ?? null) : null,
          };
          return p.media_path || (p.media_url && youtubeId(p.media_url)) ? (
            <MediaPostCard key={p.id} {...props} />
          ) : (
            <TextPostCard key={p.id} {...props} />
          );
        })}
        {canLoadMore ? (
          <div
            ref={loadMoreRef}
            className="flex min-h-16 items-center justify-center text-sm text-muted-foreground"
            aria-live="polite"
          >
            {data.isFetching ? "Loading more posts…" : "Scroll for more"}
          </div>
        ) : null}
        {!data.isLoading && visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing here yet — be the first founding member to start the conversation.
          </p>
        ) : null}
      </section>
    </AppShell>
  );
}
