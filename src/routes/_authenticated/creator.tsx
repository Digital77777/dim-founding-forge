import { createFileRoute } from "@tanstack/react-router";

import { HubPage } from "@/components/dim/HubPage";

export const Route = createFileRoute("/_authenticated/creator")({
  head: () => ({
    meta: [
      { title: "Creator Hub — DIM Elite" },
      {
        name: "description",
        content:
          "Everything you need to build, launch and grow as a creator: learning, tools, prompts, templates and challenges.",
      },
      { property: "og:title", content: "Creator Hub — DIM Elite" },
      { property: "og:description", content: "Creator learning, resources and challenges in DIM Elite." },
    ],
  }),
  component: () => (
    <HubPage
      hub="creator"
      eyebrow="Creator"
      title="Creator Hub"
      description="Premium creator learning, tools, prompt and content resources, challenges, templates and the creator community."
      question="What do I need to build, launch and grow?"
    />
  ),
});
