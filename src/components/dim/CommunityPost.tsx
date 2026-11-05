import { Link } from "@tanstack/react-router";
import {
  Bookmark,
  Clapperboard,
  Eye,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Play,
  Send,
} from "lucide-react";
import { useState } from "react";


import { FoundingBadge } from "@/components/dim/FoundingBadge";
import { youtubeEmbedUrl, youtubeId, youtubeThumb } from "@/lib/reels";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type CommunityPostRow = {
  id: string;
  user_id: string;
  space_slug: string;
  title: string | null;
  body: string;
  created_at: string;
  media_path: string | null;
  media_type: string | null;
  media_url: string | null;
  tags: string[];
};

export type PostAuthor = {
  full_name: string | null;
  headline: string | null;
  avatar_url: string | null;
  founding_number: number | null;
};

export type PostComment = { id: string; post_id: string; user_id: string; body: string };

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} months`;
  return `${Math.round(months / 12)}y`;
}

export function initials(name: string | null) {
  if (!name) return "DM";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

type Handlers = {
  liked: boolean;
  likeCount: number;
  comments: PostComment[];
  authorFor: (userId: string) => PostAuthor | undefined;
  onToggleLike: () => void;
  onComment: (body: string) => Promise<void> | void;
};

function AuthorRow({
  author,
  post,
  compact,
}: {
  author: PostAuthor | undefined;
  post: CommunityPostRow;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className={compact ? "size-9" : "size-10"}>
        <AvatarImage src={author?.avatar_url ?? undefined} alt="" />
        <AvatarFallback className="bg-primary/10 text-primary">
          {initials(author?.full_name ?? null)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-sm font-semibold">
            {author?.full_name ?? "DIM member"}
          </span>
          <FoundingBadge number={author?.founding_number ?? null} />
        </div>
        <p className="text-xs text-muted-foreground">
          {timeAgo(post.created_at)} · {post.space_slug}
        </p>
      </div>
      <button
        type="button"
        aria-label="Post options"
        className="ml-auto rounded-full p-1.5 text-muted-foreground hover:bg-muted"
      >
        <MoreHorizontal className="size-5" />
      </button>
    </div>
  );
}

function Clamped({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 320;
  return (
    <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
      {open || !long ? text : `${text.slice(0, 320).trimEnd()}… `}
      {long ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="font-medium text-primary"
        >
          {open ? "less" : "more"}
        </button>
      ) : null}
    </p>
  );
}

function TagRow({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2 text-xs font-medium text-primary">
      {tags.map((t) => (
        <span key={t}>#{t.replace(/^#/, "")}</span>
      ))}
    </div>
  );
}

function CommentThread({
  comments,
  authorFor,
  onComment,
}: Pick<Handlers, "comments" | "authorFor" | "onComment">) {
  const [value, setValue] = useState("");
  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="flex gap-2">
          <Avatar className="size-7">
            <AvatarImage src={authorFor(c.user_id)?.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="bg-accent/20 text-[10px] text-accent-foreground">
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
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Write a comment…"
          className="rounded-full bg-muted"
        />
        <Button
          size="icon"
          className="rounded-full"
          disabled={!value.trim()}
          aria-label="Send comment"
          onClick={async () => {
            await onComment(value.trim());
            setValue("");
          }}
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}

/** Text-only post — Facebook style card. */
export function TextPostCard({
  post,
  mediaUrl: _mediaUrl,
  ...h
}: { post: CommunityPostRow; mediaUrl?: string | null } & Handlers) {
  const [showComments, setShowComments] = useState(false);
  return (
    <article className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="p-4">
        <AuthorRow author={h.authorFor(post.user_id)} post={post} />
        {post.title ? (
          <h3 className="mt-3 font-display text-base font-bold leading-snug">{post.title}</h3>
        ) : null}
        <div className="mt-2">
          <Clamped text={post.body} />
        </div>
        <div className="mt-3">
          <TagRow tags={post.tags} />
        </div>
      </div>

      {h.likeCount || h.comments.length ? (
        <div className="flex items-center gap-3 border-t border-border px-4 py-2 text-xs text-muted-foreground">
          {h.likeCount ? (
            <span className="inline-flex items-center gap-1">
              <span className="inline-flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Heart className="size-2.5 fill-current" />
              </span>
              {h.likeCount}
            </span>
          ) : null}
          {h.comments.length ? (
            <button
              type="button"
              onClick={() => setShowComments((v) => !v)}
              className="ml-auto hover:underline"
            >
              {h.comments.length} {h.comments.length === 1 ? "comment" : "comments"}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-1 border-t border-border p-1">
        <button
          type="button"
          onClick={h.onToggleLike}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold hover:bg-muted",
            h.liked ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Heart className={cn("size-4", h.liked && "fill-current")} /> Like
        </button>
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
        >
          <MessageCircle className="size-4" /> Comment
        </button>
      </div>

      {showComments ? (
        <div className="border-t border-border p-4">
          <CommentThread comments={h.comments} authorFor={h.authorFor} onComment={h.onComment} />
        </div>
      ) : null}
    </article>
  );
}

/** Image / video post — Instagram style card. */
export function MediaPostCard({
  post,
  mediaUrl,
  ...h
}: { post: CommunityPostRow; mediaUrl?: string | null } & Handlers) {
  const [showComments, setShowComments] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <article className="-mx-4 overflow-hidden border-y border-border bg-card shadow-sm sm:mx-0 sm:rounded-2xl sm:border">
      <div className="px-4 py-3">
        <AuthorRow author={h.authorFor(post.user_id)} post={post} compact />
      </div>

      <div className="relative w-full bg-ink">
        {mediaUrl ? (
          post.media_type === "video" ? (
            <Link
              to="/reels"
              search={{ post: post.id }}
              aria-label="Watch in Reels"
              className="group relative block aspect-[4/5] w-full"
            >
              <video
                src={mediaUrl}
                muted
                playsInline
                preload="metadata"
                className="size-full object-cover"
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/20" />
              <span className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="grid size-16 place-items-center rounded-full bg-ink/50 text-ink-foreground backdrop-blur transition group-hover:scale-105">
                  <Play className="size-7 fill-current" />
                </span>
              </span>
              <span className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink/60 px-2.5 py-1 text-[11px] font-semibold text-ink-foreground backdrop-blur">
                <Clapperboard className="size-3.5" /> Reel
              </span>
            </Link>
          ) : (
            <img
              src={mediaUrl}
              alt={post.title ?? "Community post"}
              loading="lazy"
              className="aspect-[4/5] size-full object-cover"
            />
          )
        ) : (
          <div className="flex aspect-[4/5] w-full items-center justify-center text-sm text-ink-foreground/70">
            Media unavailable
          </div>
        )}
      </div>


      <div className="flex items-center gap-4 px-4 pt-3">
        <button
          type="button"
          onClick={h.onToggleLike}
          aria-label="Like"
          className={cn(h.liked ? "text-destructive" : "text-foreground")}
        >
          <Heart className={cn("size-6", h.liked && "fill-current")} />
        </button>
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          aria-label="Comments"
          className="text-foreground"
        >
          <MessageCircle className="size-6" />
        </button>
        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <Eye className="size-5" />
        </span>
        <button
          type="button"
          onClick={() => setSaved((v) => !v)}
          aria-label="Save"
          className={cn("ml-auto", saved ? "text-primary" : "text-foreground")}
        >
          <Bookmark className={cn("size-6", saved && "fill-current")} />
        </button>
      </div>

      <div className="space-y-2 px-4 pb-4 pt-2">
        <p className="text-sm font-semibold">
          {h.likeCount} {h.likeCount === 1 ? "like" : "likes"}
        </p>
        {post.title ? <p className="text-sm font-semibold">{post.title}</p> : null}
        <div className="text-sm">
          <span className="mr-1.5 font-semibold">
            {h.authorFor(post.user_id)?.full_name ?? "DIM member"}
          </span>
          <Clamped text={post.body} />
        </div>
        <TagRow tags={post.tags} />
        {h.comments.length ? (
          <button
            type="button"
            onClick={() => setShowComments((v) => !v)}
            className="text-sm text-muted-foreground"
          >
            View all {h.comments.length} comments
          </button>
        ) : null}
        {showComments ? (
          <div className="pt-2">
            <CommentThread comments={h.comments} authorFor={h.authorFor} onComment={h.onComment} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
