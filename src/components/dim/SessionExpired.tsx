import { Link, useNavigate } from "@tanstack/react-router";
import { LockKeyhole, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

/** Friendly screen for a missing or expired session, with a one-click retry. */
export function SessionExpired({
  title = "Your session expired",
  message = "For your security we signed you out. Sign back in and you'll land exactly where you left off.",
  redirect,
}: {
  title?: string;
  message?: string;
  redirect?: string;
}) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function retry() {
    setBusy(true);
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setBusy(false);
      await navigate({ to: redirect ?? "/dashboard", replace: true });
      return;
    }
    await supabase.auth.signOut().catch(() => undefined);
    setBusy(false);
    await navigate({
      to: "/auth",
      search: { reason: "expired", redirect: redirect ?? "/dashboard" },
      replace: true,
    });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-16">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <LockKeyhole className="size-7" aria-hidden />
        </span>
        <h1 className="mt-6 text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>

        <div className="mt-8 flex flex-col gap-3">
          <Button onClick={retry} disabled={busy} className="w-full">
            <RefreshCw className={busy ? "size-4 animate-spin" : "size-4"} aria-hidden />
            {busy ? "Checking your session…" : "Sign in again"}
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link to="/">Back to the DIM ELITE home page</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
