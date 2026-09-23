import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";

import { AppShell } from "@/components/dim/AppShell";
import { PageHeader } from "@/components/dim/PageHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

/**
 * Shared renderer for the Creator and Career hubs: hub courses plus the
 * curated resource shelves that answer "what do I need to do this?".
 */
export function HubPage({
  hub,
  eyebrow,
  title,
  description,
  question,
  bare = false,
}: {
  hub: string;
  eyebrow: string;
  title: string;
  description: string;
  question: string;
  /** Render just the hub content, for embedding inside another page. */
  bare?: boolean;
}) {
  const data = useQuery({
    queryKey: ["hub", hub],
    queryFn: async () => {
      const [resources, courses] = await Promise.all([
        supabase.from("resources").select("*").eq("hub", hub).order("sort"),
        supabase.from("courses").select("*").eq("hub", hub).order("sort"),
      ]);
      return { resources: resources.data ?? [], courses: courses.data ?? [] };
    },
  });

  const d = data.data;
  const categories = [...new Set((d?.resources ?? []).map((r) => r.category))];
  const Shell = bare
    ? ({ children }: { children: React.ReactNode }) => <div>{children}</div>
    : AppShell;

  return (
    <Shell>
      {bare ? null : (
        <>
          <PageHeader eyebrow={eyebrow} title={title} description={description} />

          <p className="mt-6 rounded-2xl border border-border bg-muted/50 p-5 font-display text-lg font-bold">
            {question}
          </p>
        </>
      )}



      {(d?.courses ?? []).length > 0 ? (
        <section className="mt-8">
          <h2 className="font-display text-lg font-bold">Learning for this hub</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(d?.courses ?? []).map((c) => (
              <article key={c.slug} className="rounded-2xl border border-border bg-card p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-learn">
                  {c.level} · {c.duration_minutes} min
                </p>
                <h3 className="mt-2 font-display font-bold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link to="/learn/$course" params={{ course: c.slug }}>
                    Open course
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {categories.map((cat) => (
        <section key={cat} className="mt-8">
          <h2 className="font-display text-lg font-bold">{cat}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(d?.resources ?? [])
              .filter((r) => r.category === cat)
              .map((r) => (
                <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
                  {r.kind ? (
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                      {r.kind}
                    </p>
                  ) : null}
                  <h3 className="mt-1 font-semibold">{r.title}</h3>
                  {r.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
                  ) : null}
                  {r.url ? (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary"
                    >
                      Open <ExternalLink className="size-3.5" />
                    </a>
                  ) : null}
                </div>
              ))}
          </div>
        </section>
      ))}

      {!data.isLoading && (d?.resources ?? []).length === 0 && (d?.courses ?? []).length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Resources for this hub are being added as the beta progresses.
        </p>
      ) : null}
    </Shell>
  );
}
