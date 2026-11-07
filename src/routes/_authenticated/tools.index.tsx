import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bookmark, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
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
  staticData: { sitemap: false },
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
  const [showSaved, setShowSaved] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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

  const visibleTools = showSaved ? tools.filter((tool) => d?.saved.has(tool.slug)) : tools;
  const featuredTools = activeRec
    ? tools.filter((tool) => activeRec.tool_slugs.includes(tool.slug)).slice(0, 3)
    : tools.filter((tool) => tool.featured).slice(0, 3);

  return (
    <AppShell>
      <PageHeader
        eyebrow="AI Tools"
        title="Find the right tool for the job."
        description="Tell us what you are trying to do, then compare a short list of useful tools instead of browsing endlessly."
      />

      <section className="mt-8 rounded-3xl bg-elite p-6 text-ink-foreground sm:p-8">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold">
          <Sparkles className="size-4" aria-hidden /> Start with your goal
        </p>
        <h2 className="mt-3 max-w-xl font-display text-2xl font-extrabold sm:text-3xl">
          What do you need help with?
        </h2>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(d?.recs ?? []).map((recommendation) => (
            <button
              key={recommendation.slug}
              onClick={() => setGoal(goal === recommendation.slug ? null : recommendation.slug)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                goal === recommendation.slug
                  ? "border-gold bg-gold/20 text-gold"
                  : "border-ink-foreground/25 hover:bg-ink-foreground/10",
              )}
            >
              {recommendation.label}
            </button>
          ))}
        </div>
        {activeRec ? (
          <div className="mt-5 rounded-2xl bg-ink-foreground/10 p-5">
            <p className="font-semibold">{activeRec.description}</p>
            <p className="mt-2 text-sm text-ink-foreground/75">
              Recommended path: {activeRec.steps.join(" → ")}
            </p>
            <Button variant="secondary" className="mt-4" asChild>
              <Link to="/learn">
                Learn the workflow <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        ) : null}
      </section>

      <section className="mt-8" aria-label="Search and filters">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search by problem, tool or category"
              className="h-12 pl-9"
            />
            {q ? (
              <button
                type="button"
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label="Clear search"
              >
                <X className="size-4" aria-hidden />
              </button>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-12 shrink-0"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
          </Button>
        </div>
        {showFilters ? (
          <div className="mt-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory(null)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold",
                  !category ? "border-primary bg-primary/10 text-primary" : "border-border",
                )}
              >
                All categories
              </button>
              {TOOL_CATEGORIES.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setCategory(category === item ? null : item)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold",
                    category === item
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {visibleTools.length} {visibleTools.length === 1 ? "tool" : "tools"} to explore
          </p>
          <button
            type="button"
            onClick={() => setShowSaved(!showSaved)}
            className={cn(
              "inline-flex items-center gap-2 text-sm font-semibold",
              showSaved ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Bookmark className="size-4" aria-hidden />{" "}
            {showSaved ? "Showing saved" : "My saved tools"}
          </button>
        </div>
      </section>

      {featuredTools.length ? (
        <section className="mt-8" aria-labelledby="recommended-tools-title">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                {activeRec ? "For your goal" : "A good place to start"}
              </p>
              <h2 id="recommended-tools-title" className="mt-2 font-display text-2xl font-bold">
                Recommended tools
              </h2>
            </div>
            {activeRec ? (
              <button
                type="button"
                onClick={() => setGoal(null)}
                className="text-sm font-semibold text-primary"
              >
                Clear goal
              </button>
            ) : null}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {featuredTools.map((tool) => (
              <ToolCard
                key={tool.slug}
                tool={tool}
                saved={d?.saved.has(tool.slug) ?? false}
                featured
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10" aria-labelledby="all-tools-title">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Browse
            </p>
            <h2 id="all-tools-title" className="mt-2 font-display text-2xl font-bold">
              All tools
            </h2>
          </div>
        </div>
        {visibleTools.length ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} saved={d?.saved.has(tool.slug) ?? false} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-semibold">No matching tools yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search or clear your filters.
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => {
                setQ("");
                setCategory(null);
                setShowSaved(false);
              }}
            >
              Reset discovery
            </Button>
          </div>
        )}
      </section>
    </AppShell>
  );
}

type DirectoryTool = {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  skill_level?: string | null;
  pricing?: string | null;
};

function ToolCard({
  tool,
  saved,
  featured = false,
}: {
  tool: DirectoryTool;
  saved: boolean;
  featured?: boolean;
}) {
  return (
    <Link
      to="/tools/$slug"
      params={{ slug: tool.slug }}
      className={cn(
        "group block rounded-3xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift",
        featured && "border-primary/20 bg-primary/[0.03]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
          {tool.category}
        </span>
        {saved ? (
          <Bookmark className="size-4 fill-current text-primary" aria-label="Saved" />
        ) : null}
      </div>
      <h3 className="mt-5 font-display text-lg font-bold">{tool.name}</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{tool.tagline}</p>
      <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          {tool.skill_level ?? "All levels"}
          {tool.pricing ? ` · ${tool.pricing}` : ""}
        </span>
        <ArrowRight
          className="size-4 text-primary transition-transform group-hover:translate-x-1"
          aria-hidden
        />
      </div>
    </Link>
  );
}
