import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Check, ChevronLeft, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/dim/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";
import { awardAchievement } from "@/lib/member-actions";

export const Route = createFileRoute("/_authenticated/tools/$slug")({
  staticData: { sitemap: false },
  component: ToolDetail,
});

function ToolDetail() {
  const { slug } = Route.useParams();
  const { userId } = useMember();
  const queryClient = useQueryClient();

  const data = useQuery({
    queryKey: ["tool", slug, userId],
    queryFn: async () => {
      const [tool, save] = await Promise.all([
        supabase.from("ai_tools").select("*").eq("slug", slug).maybeSingle(),
        userId
          ? supabase
              .from("tool_saves")
              .select("id")
              .eq("user_id", userId)
              .eq("tool_slug", slug)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      return { tool: tool.data, saved: !!save.data };
    },
  });

  // Track exploration for the Tool Explorer achievement.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      await supabase.from("tool_views").insert({ user_id: userId, tool_slug: slug });
      if (cancelled) return;
      const { count } = await supabase
        .from("tool_views")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      if ((count ?? 0) >= 10) await awardAchievement(userId, "tool_explorer", "Tool Explorer");
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, slug]);

  const tool = data.data?.tool;

  async function toggleSave() {
    if (!userId) return;
    if (data.data?.saved) {
      await supabase.from("tool_saves").delete().eq("user_id", userId).eq("tool_slug", slug);
      toast("Removed from your tools.");
    } else {
      await supabase.from("tool_saves").insert({ user_id: userId, tool_slug: slug });
      toast.success("Saved to my tools.");
    }
    await queryClient.invalidateQueries({ queryKey: ["tool", slug] });
    await queryClient.invalidateQueries({ queryKey: ["tools-directory"] });
  }

  if (!data.isLoading && !tool) {
    return (
      <AppShell>
        <p className="text-muted-foreground">That tool could not be found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Link
        to="/tools"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> AI Tools Directory
      </Link>

      <header className="mt-4 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {tool?.category}
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold">{tool?.name}</h1>
        <p className="mt-2 text-muted-foreground">{tool?.tagline}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={toggleSave} variant={data.data?.saved ? "secondary" : "default"}>
            {data.data?.saved ? <Check className="size-4" /> : <Bookmark className="size-4" />}
            {data.data?.saved ? "Saved to my tools" : "Save to my tools"}
          </Button>
          {tool?.url ? (
            <Button variant="outline" asChild>
              <a href={tool.url} target="_blank" rel="noreferrer noopener">
                Open tool <ExternalLink className="size-4" />
              </a>
            </Button>
          ) : null}
        </div>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">What it does</h2>
          <p className="mt-2 text-sm text-foreground/80">{tool?.description}</p>

          <h3 className="mt-6 font-display text-lg font-bold">Who it's for</h3>
          <p className="mt-2 text-sm text-foreground/80">{tool?.who_for}</p>

          <h3 className="mt-6 font-display text-lg font-bold">Use cases</h3>
          <ul className="mt-2 space-y-2">
            {(tool?.use_cases ?? []).map((u) => (
              <li key={u} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>{u}</span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">At a glance</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Pricing tier</dt>
              <dd className="font-semibold">{tool?.pricing ?? "Varies"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Skill level</dt>
              <dd className="font-semibold">{tool?.skill_level}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Category</dt>
              <dd className="font-semibold">{tool?.category}</dd>
            </div>
          </dl>
          <Button variant="outline" className="mt-6 w-full" asChild>
            <Link to="/learn">Learn how to use it well</Link>
          </Button>
        </aside>
      </div>
    </AppShell>
  );
}
