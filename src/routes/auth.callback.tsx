import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { AuthLoading } from "@/components/dim/AuthLoading";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  staticData: { sitemap: false },
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect:
      typeof search.redirect === "string" && search.redirect.startsWith("/")
        ? search.redirect
        : "/community",
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  useEffect(() => {
    let active = true;

    async function completeSignIn() {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("[v0] Google OAuth callback failed:", error.message);
          if (active) navigate({ to: "/auth", replace: true });
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (active) {
        navigate({ to: data.session ? redirect : "/auth", replace: true });
      }
    }

    void completeSignIn();
    return () => {
      active = false;
    };
  }, [navigate, redirect]);

  return <AuthLoading label="Completing Google sign-in…" />;
}
