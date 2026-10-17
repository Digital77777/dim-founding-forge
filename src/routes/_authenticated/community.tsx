import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, ImagePlus, Lightbulb, MessageCircle, Play, TrendingUp, Users, X } from "lucide-react";
import { useRef, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";
import { awardAchievement } from "@/lib/member-actions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/community")({
  head: () => ({
    meta: [
      { title: "DIM Community | Discussions, Reels & Member Spaces" },
      { name: "description", content: "Connect with DIM members, explore community spaces, and share discussions, photos and reels." },
      { property: "og:title", content: "DIM Community | Discussions, Reels & Member Spaces" },
      { property: "og:description", content: "Connect with DIM members, explore community spaces, and share discussions, photos and reels." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Community,
});

const QUICK_LINKS = [
  { icon: TrendingUp, label: "Progress", to: "/progress" as const },
  { icon: MessageCircle, label: "Notifications", to: "/notifications" as const },
  { icon: Calendar, label: "Events", to: "/events" as const },
  { icon: Lightbulb, label: "AI Tools", to: "/tools" as const },
  { icon: Users, label: "Members", to: "/connect" as const },
];

type Feed = "all" | "posts" | "media";

const FEED_OPTIONS: { key: Feed; label: string }[] = [
  { key: "all", label: "All" },
  { key: "posts", label: "Discussions" },
  { key: "media", label: "Reels & photos" },
];

function Community() {
  const { userId } = useMember();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [space, setSpace] = useState<string | null>(null);
  const [feed, setFeed] = useState<Feed>("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      const posts = (postsRes.data ?? []) as CommunityPostRow[];
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
          ? supabase
              .from("profiles")
              .select("id, full_name, headline, avatar_url")
              .in("id", authorIds)
          : Promise.resolve({ data: [] }),
        authorIds.length
          ? supabase.from("elite_members").select("user_id, founding_number").in("user_id", authorIds)
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
        likes: (likesRes.data ?? []) as { post_id: string; user_id: string }[],
        comments: (commentsRes.data ?? []) as PostComment[],
        authors,
        mediaUrls,
      };
    },
  });

  const d = data.data;

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
      if ((count ?? 0) >= 5) await awardAchievement(userId, "community_builder", "Community Builder");
      await queryClient.invalidateQueries({ queryKey: ["community"] });
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

  const visible = (d?.posts ?? []).filter((p) =>
    feed === "all" ? true : feed === "media" ? !!p.media_path : !p.media_path,
  );

  const railChip =
    "inline-flex h-10 shrink-0 snap-start items-center gap-2 rounded-full border border-primary/20 bg-card px-4 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 active:scale-95 motion-reduce:transition-none";

  const communityScrollHeader = (
    <div className="mx-auto max-w-7xl py-2.5">
      <div
        className="flex snap-x snap-proximity gap-2 overflow-x-auto overscroll-x-contain scroll-smooth px-3 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Community features"
      >
        <button
          type="button"
          className={cn(railChip, "border-transparent bg-ember text-primary-foreground shadow-glow hover:bg-ember")}
          onClick={() => {
            document.getElementById("composer")?.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
              block: "center",
            });
          }}
        >
          <ImagePlus className="size-4" /> Create a post
        </button>
        <Link to="/events" className={railChip}>
          <Calendar className="size-4 text-primary" /> Browse events
        </Link>
        <Link to="/notifications" className={railChip}>
          <MessageCircle className="size-4 text-primary" /> My inbox
        </Link>
        {QUICK_LINKS.map((item) => (
          <Link key={item.label} to={item.to} className={railChip}>
            <item.icon className="size-4 text-primary" /> {item.label}
          </Link>
        ))}
        <span className="w-1 shrink-0" aria-hidden />
      </div>
    </div>
  );

  return (
    <AppShell scrollHeader={communityScrollHeader}>
      {/* Welcome hero */}
      <section className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-background p-6 text-center">
        <h1 className="font-display text-3xl font-extrabold leading-tight text-ember sm:text-4xl">
          Welcome To Our AI Community
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Connect with founding members, share insights, post wins and reels, and grow together in
          the world of artificial intelligence.
        </p>

        <div className="mt-5 space-y-2">
          <Button
            className="w-full bg-ember text-primary-foreground shadow-glow"
            size="lg"
            onClick={() => document.getElementById("composer")?.scrollIntoView({ behavior: "smooth" })}
          >
            <ImagePlus className="mr-1 size-4" /> Create a post
          </Button>
          <Button asChild variant="secondary" size="lg" className="w-full">
            <Link to="/events">
              <Calendar className="mr-1 size-4" /> Browse events
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="w-full bg-primary/5 text-primary">
            <Link to="/notifications">
              <MessageCircle className="mr-1 size-4" /> My inbox
            </Link>
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.label}
              to={q.to}
              aria-label={q.label}
              className="inline-flex size-12 items-center justify-center rounded-full border border-primary/25 bg-card text-primary transition hover:bg-primary/10"
            >
              <q.icon className="size-5" />
            </Link>
          ))}
        </div>
      </section>

      {/* Spaces */}
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

      {/* Composer */}
      <section id="composer" className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold">Share something</h2>
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
          <Button
            className="ml-auto"
            onClick={post}
            disabled={busy || (!body.trim() && !file)}
          >
            {busy ? "Posting…" : "Post"}
          </Button>
        </div>
      </section>

      {/* Feed filter */}
      <div className="mt-6 grid grid-cols-3 gap-1 rounded-full bg-muted p-1">
        {(
          FEED_OPTIONS
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setFeed(t.key)}
            className={cn(
              "rounded-full py-2 text-sm font-semibold transition",
              feed === t.key ? "bg-card text-primary shadow-sm" : "text-muted-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <section className="mt-4 space-y-4">
        {visible.map((p) => {
          const likes = (d?.likes ?? []).filter((l) => l.post_id === p.id);
          const props = {
            post: p,
            liked: likes.some((l) => l.user_id === userId),
            likeCount: likes.length,
            comments: (d?.comments ?? []).filter((c) => c.post_id === p.id),
            authorFor: (id: string) => d?.authors.get(id),
            onToggleLike: () => toggleLike(p.id, likes.some((l) => l.user_id === userId)),
            onComment: (value: string) => addComment(p.id, value),
            mediaUrl: p.media_path ? (d?.mediaUrls.get(p.media_path) ?? null) : null,
          };
          return p.media_path ? (
            <MediaPostCard key={p.id} {...props} />
          ) : (
            <TextPostCard key={p.id} {...props} />
          );
        })}
        {!data.isLoading && visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing here yet — be the first founding member to start the conversation.
          </p>
        ) : null}
      </section>
    </AppShell>
  );
}
