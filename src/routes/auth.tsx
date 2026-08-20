import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown, Info } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { AuthLoading } from "@/components/dim/AuthLoading";
import { BETA_AVAILABILITY } from "@/lib/dim";

const TITLE = "Join DIM ELITE — Founding 1,000 Beta";
const DESCRIPTION =
  "Create your DIM ELITE account and claim a founding member place in the Digital Intelligence Marketplace beta.";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): {
    reason?: string;
    redirect?: string;
  } => {
    const reason = typeof search['reason'] === "string" ? search['reason'] : undefined;
    const raw = typeof search['redirect'] === "string" ? search['redirect'] : undefined;
    const redirect = raw?.startsWith("/") ? raw : undefined;
    return {
      ...(reason ? { reason } : {}),
      ...(redirect ? { redirect } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { reason, redirect } = Route.useSearch();
  const expired = reason === "expired";
  const target = redirect && redirect !== "/auth" ? redirect : "/dashboard";
  const [mode, setMode] = useState<"signup" | "signin">(expired ? "signin" : "signup");
  const [resolving, setResolving] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) {
        setRedirecting(true);
        navigate({ to: target, replace: true });
        return;
      }
      setResolving(false);
    });
    return () => {
      active = false;
    };
  }, [navigate, target]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Welcome to DIM ELITE.");
      setRedirecting(true);
      navigate({ to: target, replace: true });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRedirecting(true);
    navigate({ to: target, replace: true });
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Try again.");
      return;
    }
    if (result.redirected) return;
    setRedirecting(true);
    navigate({ to: target, replace: true });
  }

  if (redirecting || resolving) {
    return (
      <AuthLoading
        label={redirecting ? "Signing you in…" : "Checking your session…"}
      />
    );
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-elite p-12 text-ink-foreground lg:block">
        <div className="absolute inset-0 grid-paper opacity-[0.15]" aria-hidden />
        <div className="relative flex h-full flex-col justify-between">
          <Link to="/" className="text-sm font-semibold uppercase tracking-[0.24em]">
            DIM ELITE
          </Link>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
              <Crown className="size-3.5" aria-hidden />
              Founding 1,000
            </span>
            <h2 className="mt-6 max-w-sm text-4xl font-bold leading-tight">
              You're one of the first 1,000 people helping shape DIM.
            </h2>
            <p className="mt-4 max-w-sm text-sm text-ink-foreground/75">
              Learn. Build. Connect. Earn. Grow. — the complete DIM experience, free during the
              Elite Beta.
            </p>
          </div>
          <p className="text-xs text-ink-foreground/60">{BETA_AVAILABILITY}</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold">
            {mode === "signup" ? "Claim your founding place" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Create your account to receive a Founding Member number."
              : "Sign in to continue your DIM journey."}
          </p>

          {expired ? (
            <div className="mt-6 flex gap-3 rounded-2xl border border-border bg-muted/50 p-4 text-left">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <p className="text-sm text-muted-foreground">
                Your session expired, so we brought you here. Sign in and we'll take you straight
                back to where you were.
              </p>
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "signup" ? (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {mode === "signup" ? "Create my Elite account" : "Sign in"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={google}>
            Continue with Google
          </Button>

          <button
            type="button"
            className="mt-6 w-full text-sm text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          >
            {mode === "signup"
              ? "Already a member? Sign in"
              : "New here? Claim a founding place"}
          </button>
        </div>
      </div>
    </main>
  );
}
