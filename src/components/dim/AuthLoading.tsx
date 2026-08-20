import { Skeleton } from "@/components/ui/skeleton";

/** Full-screen skeleton shown while a session is being resolved or a redirect runs. */
export function AuthLoading({ label = "Preparing your Elite experience…" }: { label?: string }) {
  return (
    <main className="min-h-screen bg-background" aria-busy="true" aria-live="polite">
      <div className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <span className="font-display text-sm font-extrabold tracking-[0.22em]">
            DIM<span className="text-primary">ELITE</span>
          </span>
          <Skeleton className="ml-auto h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Skeleton className="mt-4 h-9 w-2/3 max-w-sm" />
        <Skeleton className="mt-3 h-4 w-1/2 max-w-xs" />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border p-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="mt-3 h-4 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
