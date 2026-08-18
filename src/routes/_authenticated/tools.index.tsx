import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Sparkles } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/dim/AppShell";
import { PageHeader } from "@/components/dim/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";
import { TOOL_CATEGORIES } from "@/lib/dim";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tools/")({
  head: () => ({
    meta: [
      { title: "AI Tools Directory — DIM Elite" },
      {
        name: "description",
        content:
          "Explore AI tools across 14 categories, with personalized discovery that recommends a stack for what you're trying to accomplish.",
      },
      { property: "og:title", content: "AI Tools Directory — DIM Elite" },
      {
        property: "og:description",
        content: "A curated AI tools directory with personalized recommendations.",
      },
    ],
  }),
  component: ToolsDirectory,
});

function ToolsDirectory() {
  const { userId } = useMember();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);

  const data = useQuery({
    queryKey: ["tools-directory", userId],
    queryFn: async () => {
      const [tools, recs, saves] = await Promise.all([
        supabase.from("ai_tools").select("*").order("featured", { ascending: false }).order("name"),
        supabase.from("goal_recommendations").select("*"),
        userId
          ? supabase.from("tool_saves").select("tool_slug").eq("user_id", userId)
          : Promise.resolve({ data: [] }),
      ]);
      return {
        tools: tools.data ?? [],
        recs: recs.data ?? [],
        saved: new Set((saves.data ?? []).map((s) => s.tool_slug)),
      };
    },
  });

  const d = data.data;
  const activeRec = d?.recs.find((r) => r.slug === goal) ?? null;
  const term = q.trim().toLowerCase();

  let tools = d?.tools ?? [];
  if (activeRec) tools = tools.filter((t) => activeRec.tool_slugs.includes(t.slug));
  if (category) tools = tools.filter((t) => t.category === category);
  if (term)
    tools = tools.filter((t) =>
      [t.name, t.tagline, t.description, t.category].join(" ").toLowerCase().includes(term),
    );

  return (
    <AppShell>
      <PageHeader
        eyebrow="AI Tools"
        title="AI Tools Directory"
        description="Every tool mapped to what it does, who it's for and how to use it — across 14 categories."
      />

      <section className="mt-8 rounded-3xl bg-elite p-6 text-ink-foreground sm:p-8">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold">
          <Sparkles className="size-4" /> Personalized discovery
        </p>
        <h2 className="mt-3 font-display text-2xl font-extrabold">
          What are you trying to accomplish?
        </h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {(d?.recs ?? []).map((r) => (
            <button
              key={r.slug}
              onClick={() => setGoal(goal === r.slug ? null : r.slug)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                goal === r.slug
                  ? "border-gold bg-gold/20 text-gold"
                  : "border-ink-foreground/25 hover:bg-ink-foreground/10",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        {activeRec ? (
          <div className="mt-6 rounded-2xl bg-ink-foreground/10 p-5">
            <p className="font-semibold">{activeRec.description}</p>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-ink-foreground/85">
              {activeRec.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            {activeRec.path_slug ? (
              <Button variant="secondary" className="mt-5" asChild>
                <Link to="/learn">Start the matching learning path</Link>
              </Button>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="mt-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tools, categories or use cases"
            className="pl-9"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setCategory(null)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold",
              !category ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted",
            )}
          >
            All
          </button>
          {TOOL_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(category === c ? null : c)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold",
                category === c
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <p className="mt-6 text-xs text-muted-foreground">{tools.length} tools</p>
      <section className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map((t) => (
          <Link
            key={t.slug}
            to="/tools/$slug"
            params={{ slug: t.slug }}
            className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-lift"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                {t.category}
              </span>
              {d?.saved.has(t.slug) ? (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gold-foreground">
                  Saved
                </span>
              ) : null}
            </div>
            <h3 className="mt-2 font-display text-lg font-bold">{t.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {t.skill_level}
              {t.pricing ? ` · ${t.pricing}` : ""}
            </p>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
