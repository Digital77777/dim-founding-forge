import { createFileRoute } from "@tanstack/react-router";

import { PageHero } from "@/components/site/blocks";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CONTACT, WHATSAPP_DISPLAY, WHATSAPP_LINK, pageHead } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  head: () =>
    pageHead("/contact", "Contact DIM — Partnerships & General Enquiries", "Send Digital Intelligence Marketplace a partnership, media or general enquiry."),
  component: Contact,
});

function Contact() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Contact" title="Talk to DIM." intro="Partnerships, media or a general question — send us a message and the team will reply by email." />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Prefer WhatsApp?{" "}
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">
              Chat with us on WhatsApp
            </a>{" "}
            ({WHATSAPP_DISPLAY}).
          </p>
          <p>Members who need help with their account can also use the beta feedback centre inside the app.</p>
          {CONTACT.email ? (
            <p>
              Email: <a className="text-primary underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </p>
          ) : null}
        </div>
        <EnquiryForm sourcePage="/contact" />
      </section>
    </SiteLayout>
  );
}
