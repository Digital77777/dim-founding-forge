import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero } from "@/components/site/blocks";
import { SiteLayout } from "@/components/site/SiteLayout";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  staticData: { sitemap: true },
  head: () => pageHead("/terms", "Terms and Conditions — Digital Intelligence Marketplace", "The terms that apply when you use Digital Intelligence Marketplace and DIM ELITE."),
  component: Terms,
});

const SECTIONS: [string, string][] = [
  ["Using DIM", "By creating an account you agree to use DIM lawfully and respectfully, and to keep your login details secure."],
  ["Community conduct", "Don't post content that is unlawful, harmful, harassing, misleading or that infringes others' rights. We may remove content or suspend accounts that break these rules."],
  ["Your content", "You keep ownership of what you post. You allow DIM to display it within the platform so other members can see it."],
  ["Beta features", "DIM ELITE and some features are in beta. They may change, be interrupted or be withdrawn. Features marked Coming Soon are not yet available."],
  ["No guarantees", "DIM provides learning, tools and pathways. We do not guarantee employment, income, certification or any specific outcome. AI-generated suggestions are guidance only."],
  ["Third-party tools", "The AI Tools Directory links to services run by other companies. Their own terms and privacy policies apply."],
  ["Changes", "We may update these terms and will communicate significant changes."],
];

function Terms() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Legal" title="Terms and conditions" intro="The ground rules for using Digital Intelligence Marketplace." />
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
