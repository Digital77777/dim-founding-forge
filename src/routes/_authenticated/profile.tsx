import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/dim/AppShell";
import { PageHeader } from "@/components/dim/PageHeader";
import { FoundingBadge, foundingLabel } from "@/components/dim/FoundingBadge";
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
