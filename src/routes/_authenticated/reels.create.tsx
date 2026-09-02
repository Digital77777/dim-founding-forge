import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clapperboard, Link2, Upload, X, Youtube } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/dim/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";
import { awardAchievement } from "@/lib/member-actions";
import { parseTags, youtubeEmbedUrl, youtubeId } from "@/lib/reels";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/reels/create")({
  head: () => ({
    meta: [
      { title: "Create a Reel — DIM ELITE" },
      {
        name: "description",
        content:
          "Publish a reel to the DIM ELITE community: upload a video or paste a YouTube link, add a caption and hashtags.",
      },
      { property: "og:title", content: "Create a Reel — DIM ELITE" },
      {
        property: "og:description",
        content: "Upload a video or share a YouTube link with the founding 1,000.",
      },
    ],
  }),
  component: CreateReel,
});

type Mode = "upload" | "youtube";

const MAX_BYTES = 200 * 1024 * 1024;

function CreateReel() {
  const { userId } = useMember();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [space, setSpace] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const spaces = useQuery({
    queryKey: ["community-spaces"],
    queryFn: async () => {
      const { data } = await supabase.from("community_spaces").select("*").order("sort");
      return data ?? [];
    },
  });

  const ytId = mode === "youtube" ? youtubeId(link) : null;
  const linkInvalid = mode === "youtube" && link.trim().length > 0 && !ytId;
  const canPublish = mode === "upload" ? !!file : !!ytId;

  function pickFile(f: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    if (f && !f.type.startsWith("video/")) {
      toast.error("Reels need a video file.");
      return;
    }
    if (f && f.size > MAX_BYTES) {
      toast.error("That video is larger than 200MB.");
      return;
    }
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function publish() {
    if (!userId || !canPublish || busy) return;
    const target = space ?? spaces.data?.[0]?.slug;
    if (!target) {
      toast.error("No community space available yet.");
      return;
    }
    setBusy(true);
    try {
      let mediaPath: string | null = null;
      if (mode === "upload" && file) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage
          .from("community-media")
          .upload(path, file, { contentType: file.type });
        if (up.error) {
          toast.error("Could not upload that video.");
          return;
        }
        mediaPath = path;
      }

      const { error } = await supabase.from("posts").insert({
        user_id: userId,
        space_slug: target,
        title: title.trim() || null,
        body: caption.trim(),
        media_path: mediaPath,
        media_url: mode === "youtube" && ytId ? `https://www.youtube.com/watch?v=${ytId}` : null,
        media_type: "video",
        tags: parseTags(tags),
      });
      if (error) {
        toast.error("Could not publish that reel.");
        return;
      }

      const { count } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("media_type", "video");
      if ((count ?? 0) >= 3) await awardAchievement(userId, "reel_creator", "Reel Creator");

      await queryClient.invalidateQueries({ queryKey: ["reels"] });
      await queryClient.invalidateQueries({ queryKey: ["community"] });
      toast.success("Your reel is live.");
      navigate({ to: "/reels", search: {} });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild aria-label="Back to Reels">
            <Link to="/reels" search={{}}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <h1 className="font-display text-2xl font-extrabold">Create a Reel</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload a video from your device or paste a YouTube link. Add a caption and hashtags so
          other founding members can find it.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
          {(
            [
              { key: "upload", label: "Upload video", icon: Upload },
              { key: "youtube", label: "YouTube link", icon: Youtube },
            ] as { key: Mode; label: string; icon: typeof Upload }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setMode(t.key)}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full py-2 text-sm font-semibold transition",
                mode === t.key ? "bg-card text-primary shadow-sm" : "text-muted-foreground",
              )}
            >
              <t.icon className="size-4" /> {t.label}
            </button>
          ))}
        </div>

        <section className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          {mode === "upload" ? (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              />
              {preview ? (
                <div className="relative overflow-hidden rounded-xl border border-border bg-ink">
                  <video src={preview} controls playsInline className="max-h-80 w-full object-contain" />
                  <button
                    type="button"
                    onClick={() => pickFile(null)}
                    aria-label="Remove video"
                    className="absolute right-2 top-2 rounded-full bg-ink/70 p-1.5 text-ink-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 px-6 py-12 text-center transition hover:border-primary/60"
                >
                  <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                    <Clapperboard className="size-6" />
                  </span>
                  <span className="font-semibold">Select a video</span>
                  <span className="text-xs text-muted-foreground">
                    MP4, MOV or WebM · up to 200MB · vertical looks best
                  </span>
                </button>
              )}
            </>
          ) : (
            <>
              <label className="text-sm font-semibold" htmlFor="yt">
                YouTube link
              </label>
              <div className="mt-2 flex items-center gap-2">
                <Link2 className="size-4 shrink-0 text-muted-foreground" />
                <Input
                  id="yt"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=… or a Shorts link"
                />
              </div>
              {linkInvalid ? (
                <p className="mt-2 text-xs font-medium text-destructive">
                  That doesn&apos;t look like a YouTube video link.
                </p>
              ) : null}
              {ytId ? (
                <div className="mt-4 overflow-hidden rounded-xl border border-border bg-ink">
                  <iframe
                    src={youtubeEmbedUrl(ytId, { autoplay: false })}
                    title="YouTube preview"
                    allow="accelerometer; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="aspect-video w-full"
                  />
                </div>
              ) : null}
            </>
          )}

          <Input
            className="mt-4"
            placeholder="Headline (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            className="mt-3"
            rows={3}
            placeholder="Write a caption…"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          <Input
            className="mt-3"
            placeholder="Hashtags, e.g. #ai-tools #buildinpublic"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          {parseTags(tags).length ? (
            <p className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-primary">
              {parseTags(tags).map((t) => (
                <span key={t}>#{t}</span>
              ))}
            </p>
          ) : null}

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Space
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(spaces.data ?? []).map((s) => {
                const active = (space ?? spaces.data?.[0]?.slug) === s.slug;
                return (
                  <button
                    key={s.slug}
                    onClick={() => setSpace(s.slug)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            className="mt-5 w-full bg-ember text-primary-foreground shadow-glow"
            size="lg"
            disabled={!canPublish || busy}
            onClick={publish}
          >
            {busy ? "Publishing…" : "Publish reel"}
          </Button>
        </section>
      </div>
    </AppShell>
  );
}
