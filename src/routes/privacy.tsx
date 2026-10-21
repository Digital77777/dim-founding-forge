import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero } from "@/components/site/blocks";
import { SiteLayout } from "@/components/site/SiteLayout";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () => pageHead("/privacy", "Privacy Policy — Digital Intelligence Marketplace", "How Digital Intelligence Marketplace collects, uses and protects your personal information."),
  component: Privacy,
});

const SECTIONS: [string, string][] = [
  ["What we collect", "Account details (name, email), the profile and career information you choose to add, content you post in the community, your learning and project activity, and messages you send through our enquiry form."],
  ["How we use it", "To provide your DIM account and features, personalise recommendations such as your career roadmap, keep the community safe, respond to enquiries and improve DIM."],
  ["AI features", "When you generate an AI career roadmap, the goal and profile details you provide are processed by an AI model to produce suggestions. AI output is guidance, not professional advice."],
  ["Who can see your information", "Community posts are visible to other members. You control whether your profile and projects are public. We don't sell your personal information."],
  ["Your choices", "You can update your profile at any time and contact us to ask about access to, correction of or deletion of your information."],
  ["Security", "Access to your data is restricted by account-level permissions. No system is perfectly secure, but we work to protect your information."],
];

function Privacy() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Legal" title="Privacy policy" intro="A plain-language summary of how DIM handles your personal information." />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-16 sm:px-6">
        {SECTIONS.map(([t, b]) => (
          <section key={t}>
            <h2 className="font-display text-xl font-bold">{t}</h2>
            <p className="mt-2 text-muted-foreground">{b}</p>
          </section>
        ))}
        <p className="text-sm text-muted-foreground">
          Questions? <Link to="/contact" className="text-primary underline">Contact us</Link>.
        </p>
      </div>
    </SiteLayout>
  );
}
