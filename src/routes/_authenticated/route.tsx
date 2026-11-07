import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppPageSkeleton } from "@/components/dim/AppPageSkeleton";
import { SessionExpired } from "@/components/dim/SessionExpired";
import { supabase } from "@/integrations/supabase/client";

// Members whose Founding membership has been confirmed this session.
const membershipChecked = new Set<string>();

export const Route = createFileRoute("/_authenticated")({
  staticData: { sitemap: "exclude-subtree" },
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

    // Claim a Founding 1,000 place on first arrival (wherever the member lands).
    if (!membershipChecked.has(data.user.id)) {
      const { data: member } = await supabase
        .from("elite_members")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (!member) {
        const name = (data.user.user_metadata?.["full_name"] as string | undefined) ?? null;
        await supabase.rpc("claim_membership", name ? { _full_name: name } : {});
      }
      membershipChecked.add(data.user.id);
    }

    return { user: data.user };
  },
  pendingMs: 0,
  pendingComponent: AppPageSkeleton,
  errorComponent: () => (
    <SessionExpired
      title="We couldn't verify your session"
      message="Your sign-in may have expired or the connection dropped. Try signing in again — your progress is safe."
    />
  ),
  component: () => <Outlet />,
});
