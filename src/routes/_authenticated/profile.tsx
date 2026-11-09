import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/dim/AppShell";
import { PageHeader } from "@/components/dim/PageHeader";
import { FoundingBadge, foundingLabel } from "@/components/dim/FoundingBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useMember, useInvalidateMember } from "@/hooks/use-member";

export const Route = createFileRoute("/_authenticated/profile")({
  staticData: { sitemap: false },
  component: ProfilePage,
});

function ProfilePage() {
  const { userId, profile, membership } = useMember();
  const invalidateMember = useInvalidateMember();
  const [form, setForm] = useState({
    full_name: "",
    headline: "",
    bio: "",
    location: "",
    institution: "",
    industry: "",
    career_goal: "",
    skills: "",
    interests: "",
    certifications: "",
    is_public: true,
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      headline: profile.headline ?? "",
      bio: profile.bio ?? "",
      location: profile.location ?? "",
      institution: profile.institution ?? "",
      industry: profile.industry ?? "",
      career_goal: profile.career_goal ?? "",
      skills: (profile.skills ?? []).join(", "),
      interests: (profile.interests ?? []).join(", "),
      certifications: (profile.certifications ?? []).join(", "),
      is_public: profile.is_public,
    });
  }, [profile]);

  const list = (v: string) =>
    v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  async function cropToSquare(file: File) {
    const image = new Image();
    image.src = URL.createObjectURL(file);
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not read image"));
    });
    const size = Math.min(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1200;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare image editor");
    context.drawImage(
      image,
      (image.naturalWidth - size) / 2,
      (image.naturalHeight - size) / 2,
      size,
      size,
      0,
      0,
      1200,
      1200,
    );
    URL.revokeObjectURL(image.src);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    );
    if (!blob) throw new Error("Could not crop image");
    return new File([blob], `${file.name.replace(/\\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" });
  }

  async function uploadAvatar(file: File) {
    if (!userId) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file for your profile picture.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Profile pictures must be smaller than 10 MB.");
      return;
    }
    setUploadingAvatar(true);
    try {
      const extension = file.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
      const path = `avatars/${userId}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("community-media")
        .upload(path, file, {
          contentType: file.type || "application/octet-stream",
          cacheControl: "3600",
          upsert: true,
        });
      if (uploadError) throw uploadError;
      const { data: publicData } = supabase.storage.from("community-media").getPublicUrl(path);
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicData.publicUrl })
        .eq("id", userId);
      if (profileError) throw profileError;
      await invalidateMember();
      toast.success("Profile picture updated.");
    } catch {
      toast.error("Could not update your profile picture.");
    } finally {
      setUploadingAvatar(false);
      setPendingAvatar(null);
      if (pendingAvatarUrl) URL.revokeObjectURL(pendingAvatarUrl);
      setPendingAvatarUrl(null);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  async function save() {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name || null,
        headline: form.headline || null,
        bio: form.bio || null,
        location: form.location || null,
        institution: form.institution || null,
        industry: form.industry || null,
        career_goal: form.career_goal || null,
        skills: list(form.skills),
        interests: list(form.interests),
        certifications: list(form.certifications),
        is_public: form.is_public,
      })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      toast.error("Could not save your profile.");
      return;
    }
    await invalidateMember();
    toast.success("Profile saved.");
  }

  const field = (key: keyof typeof form, label: string, placeholder?: string) => (
    <div>
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        className="mt-1.5"
        placeholder={placeholder}
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <AppShell>
      <PageHeader
        eyebrow="Profile"
        title="Your DIM profile"
        description="One profile across the whole ecosystem — learning, building, community and career."
      />

      <section className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
        <Avatar className="size-20 border-4 border-background shadow-md">
          <AvatarImage src={profile?.avatar_url ?? undefined} alt="Your profile picture" />
          <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
            {(profile?.full_name ?? userId ?? "DIM").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Profile picture</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Shown next to your posts, reels and member profile.
          </p>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (!file.type.startsWith("image/")) {
                toast.error("Choose an image file for your profile picture.");
                return;
              }
              setPendingAvatar(file);
              setPendingAvatarUrl(URL.createObjectURL(file));
              setCropOpen(true);
              event.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            disabled={uploadingAvatar}
            onClick={() => avatarInputRef.current?.click()}
          >
            {uploadingAvatar ? "Uploading…" : "Choose image"}
          </Button>
          {pendingAvatar ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Choose “Use original” or crop it before uploading.
            </p>
          ) : null}
        </div>
      </section>

      {cropOpen && pendingAvatar && pendingAvatarUrl ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="crop-title"
            className="w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="crop-title" className="font-display text-xl font-bold">
                  Edit profile picture
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Crop to a square only if you want to.
                </p>
              </div>
              <button
                type="button"
                className="text-sm text-muted-foreground"
                onClick={() => {
                  setCropOpen(false);
                  setPendingAvatar(null);
                  setPendingAvatarUrl(null);
                }}
              >
                Cancel
              </button>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl bg-muted">
              <img
                src={pendingAvatarUrl}
                alt="Selected profile picture preview"
                className="mx-auto aspect-square max-h-[55vh] w-full object-contain"
              />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                disabled={uploadingAvatar}
                onClick={() => {
                  setCropOpen(false);
                  void uploadAvatar(pendingAvatar);
                }}
              >
                Use original
              </Button>
              <Button
                disabled={uploadingAvatar}
                onClick={async () => {
                  const cropped = await cropToSquare(pendingAvatar);
                  setCropOpen(false);
                  void uploadAvatar(cropped);
                }}
              >
                Crop and upload
              </Button>
            </div>
          </section>
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl border border-gold/40 bg-gold/8 p-5">
        <FoundingBadge number={membership?.founding_number ?? null} size="md" showNumber={false} />
        <p className="mt-3 font-display text-2xl font-extrabold tabular-nums text-gold-foreground">
          {foundingLabel(membership?.founding_number) ?? "—"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Founding Member status stays with your account beyond the beta.
        </p>
      </div>

      <section className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
        {field("full_name", "Full name")}
        {field("headline", "Headline", "AI-curious marketing student")}
        {field("location", "Location")}
        {field("institution", "Institution or company")}
        {field("industry", "Industry")}
        {field("career_goal", "Career goal")}
        {field("skills", "Skills (comma separated)")}
        {field("interests", "Interests (comma separated)")}
        {field("certifications", "Certifications (comma separated)")}
        <div className="sm:col-span-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            rows={4}
            className="mt-1.5"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border p-4 sm:col-span-2">
          <div>
            <p className="font-semibold">Public profile</p>
            <p className="text-sm text-muted-foreground">
              Let other members find you in the community and networking directory.
            </p>
          </div>
          <Switch
            checked={form.is_public}
            onCheckedChange={(v) => setForm({ ...form, is_public: v })}
          />
        </div>
        <div className="sm:col-span-2">
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </section>
    </AppShell>
  );
}
