import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AuthLoading } from "@/components/dim/AuthLoading";
import { SessionExpired } from "@/components/dim/SessionExpired";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({
        to: "/auth",
        search: { reason: "expired", redirect: location.pathname },
        replace: true,
      });
    }

    // Send members through onboarding once, before the rest of the app.
    if (location.pathname !== "/onboarding") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", data.user.id)
        .maybeSingle();
      if (!profile?.onboarding_completed) throw redirect({ to: "/onboarding" });
    }

    return { user: data.user };
  },
  pendingMs: 0,
  pendingComponent: () => <AuthLoading />,
  errorComponent: () => (
    <SessionExpired
      title="We couldn't verify your session"
      message="Your sign-in may have expired or the connection dropped. Try signing in again — your progress is safe."
    />
  ),
  component: () => <Outlet />,
});
