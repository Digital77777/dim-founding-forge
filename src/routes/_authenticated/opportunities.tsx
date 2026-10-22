import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/dim/AppShell";
import { ComingSoon } from "@/components/dim/ComingSoon";
import { COMING_SOON_FEATURES } from "@/lib/dim";

const feature = COMING_SOON_FEATURES.find((f) => f.key === "opportunities")!;

export const Route = createFileRoute("/_authenticated/opportunities")({
  staticData: { sitemap: false },
  component: () => (
    <AppShell>
      <ComingSoon
        feature={feature.key}
        title={feature.title}
        summary={feature.summary}
        bullets={feature.bullets}
        showEarnDisclaimer={true}
      />
    </AppShell>
  ),
});
