import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/dim/AppShell";
import { PageHeader } from "@/components/dim/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";
import { awardAchievement } from "@/lib/member-actions";

export const Route = createFileRoute("/_authenticated/build")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Build Hub — DIM Elite" },
      {
        name: "description",
        content: "Turn learning into proof: capture projects, tools used and outcomes in your DIM portfolio.",
      },
      { property: "og:title", content: "Build Hub — DIM Elite" },
      { property: "og:description", content: "Create projects and build your DIM portfolio." },
    ],
  }),
  component: BuildHub,
});

const TEMPLATES = [
  {
    title: "AI content system",
    summary: "Plan, write and schedule a week of content using an AI writing tool and a design tool.",
  },
  {
    title: "Short-form video series",
    summary: "Script, generate and edit three short videos on one topic to test an audience.",
  },
  {
    title: "Data mini-report",
    summary: "Take a public dataset, analyse it with an AI assistant and publish the findings.",
  },
  {
    title: "Small business toolkit",
    summary: "Build the offer, pricing, landing copy and outreach messages for a service idea.",
  },
];

function BuildHub() {
  const { userId } = useMember();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [link, setLink] = useState("");

  const projects = useQuery({
    queryKey: ["projects", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function create() {
    if (!userId || !title.trim()) return;
    const { error } = await supabase.from("projects").insert({
      user_id: userId,
      title: title.trim(),
      summary: summary.trim() || null,
      link: link.trim() || null,
      status: "in_progress",
    });
    if (error) {
      toast.error("Could not save that project.");
      return;
    }
    setTitle("");
    setSummary("");
    setLink("");
    await awardAchievement(userId, "first_project", "First Project");
    await queryClient.invalidateQueries({ queryKey: ["projects"] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    toast.success("Project added to your portfolio.");
  }

  async function setStatus(id: string, status: string) {
    await supabase.from("projects").update({ status }).eq("id", id);
    await queryClient.invalidateQueries({ queryKey: ["projects"] });
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Build"
        title="Build Hub"
        description="Applying what you learn is what makes it real. Start from a template, log what you build, and it becomes part of your portfolio."
      />

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Start a project</h2>
          <Input
            className="mt-3"
            placeholder="Project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            className="mt-3"
            rows={3}
            placeholder="What are you making, and what will it prove?"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <Input
            className="mt-3"
            placeholder="Link (optional)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <Button className="mt-3" onClick={create} disabled={!title.trim()}>
            Add project
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Project templates</h2>
          <ul className="mt-3 space-y-3">
            {TEMPLATES.map((t) => (
              <li key={t.title}>
                <button
                  className="w-full rounded-xl border border-border p-3 text-left hover:bg-muted"
                  onClick={() => {
                    setTitle(t.title);
                    setSummary(t.summary);
                  }}
                >
                  <p className="text-sm font-semibold">{t.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.summary}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold">Your projects</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(projects.data ?? []).map((p) => (
            <article key={p.id} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-build">
                {p.status.replace("_", " ")}
              </p>
              <h3 className="mt-1 font-display font-bold">{p.title}</h3>
              {p.summary ? (
                <p className="mt-1 text-sm text-muted-foreground">{p.summary}</p>
              ) : null}
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setStatus(p.id, "in_progress")}>
                  In progress
                </Button>
                <Button size="sm" onClick={() => setStatus(p.id, "complete")}>
                  Complete
                </Button>
              </div>
            </article>
          ))}
          {!projects.isLoading && (projects.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No projects yet. Pick a template on the right to get moving.
            </p>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
