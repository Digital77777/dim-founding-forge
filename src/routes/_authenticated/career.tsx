import { createFileRoute } from "@tanstack/react-router";

import { HubPage } from "@/components/dim/HubPage";

export const Route = createFileRoute("/_authenticated/career")({
  head: () => ({
    meta: [
      { title: "Career Hub — DIM Elite" },
      {
        name: "description",
        content:
          "Career roadmap, skills development, CV and interview readiness, certifications and mentorship inside DIM Elite.",
      },
      { property: "og:title", content: "Career Hub — DIM Elite" },
      {
        property: "og:description",
        content: "Become job-ready and accelerate your career with the DIM Career Hub.",
      },
    ],
  }),
  component: () => (
    <HubPage
      hub="career"
      eyebrow="Career"
      title="Career Hub"
      description="Your career roadmap, skills development, job readiness resources, certifications, workshops and the career community."
      question="What do I need to become job-ready and accelerate my career?"
    />
  ),
});
