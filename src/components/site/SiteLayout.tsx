import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { COMPANY, CONTACT, ECOSYSTEM, SOCIALS, TAGLINE, WHATSAPP_DISPLAY, WHATSAPP_LINK } from "@/lib/site";
import { cn } from "@/lib/utils";

type NavLink = { label: string; to: string };
type NavEntry = NavLink & { children?: NavLink[] };

const NAV: NavEntry[] = [
  { label: "Home", to: "/" },
  {
    label: "Explore DIM",
    to: "/explore",
    children: [
      { label: "The ecosystem", to: "/explore" },
      ...ECOSYSTEM.map((a) => ({ label: a.name, to: `/explore/${a.slug}` })),
    ],
  },
  { label: "DIM ELITE", to: "/elite" },
  { label: "DIM Society", to: "/society" },
  { label: "For Organisations", to: "/organisations" },
  { label: "About Us", to: "/about" },
  { label: "Insights", to: "/insights" },
];

/** WhatsApp glyph (simple-icons, CC0). Lucide has no brand icons. */
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

/** Floating WhatsApp chat button, shown on every public page. */
function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noreferrer"
      aria-label={`Chat with ${COMPANY} on WhatsApp`}
      className="fixed bottom-5 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lift transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-whatsapp sm:bottom-6 sm:right-6"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}

/** Wordmark. Replace with the official DIM logo file once it is added to the project. */
export function Wordmark({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="flex flex-col leading-none">
      <span className={cn("font-display text-base font-extrabold tracking-[0.18em]", inverted ? "text-ink-foreground" : "text-foreground")}>
        DIM<span className="text-primary">.</span>
      </span>
      <span className={cn("mt-1 text-[10px] font-semibold uppercase tracking-[0.14em]", inverted ? "text-ink-foreground/70" : "text-muted-foreground")}>
        {COMPANY}
      </span>
    </span>
  );
}

function useSignedIn() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => data.subscription.unsubscribe();
  }, []);
  return signedIn;
}

function AccountActions({ signedIn, stacked = false }: { signedIn: boolean; stacked?: boolean }) {
  if (signedIn) {
    return (
      <Button asChild className={cn(stacked && "w-full")}>
        <Link to="/community">Open the app</Link>
      </Button>
    );
  }
  return (
    <div className={cn("flex items-center gap-2", stacked && "flex-col items-stretch")}>
      <Button asChild variant="ghost" className={cn(stacked && "w-full border border-border")}>
        <Link to="/auth" search={{ mode: "signin" }}>Sign In</Link>
      </Button>
      <Button asChild className={cn("bg-ember text-primary-foreground shadow-glow", stacked && "w-full")}>
        <Link to="/auth">Join DIM</Link>
      </Button>
    </div>
  );
}

function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const signedIn = useSignedIn();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`));

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" aria-label={`${COMPANY} home`} className="shrink-0">
            <Wordmark />
          </Link>

          <nav aria-label="Main" className="ml-8 hidden items-center gap-6 lg:flex">
            {NAV.map((item) =>
              item.children ? (
                <div key={item.to} className="group relative">
                  <Link
                    to={item.to}
                    className={cn(
                      "inline-flex items-center gap-1 py-2 text-sm font-medium transition-colors hover:text-primary",
                      isActive(item.to) ? "text-primary" : "text-foreground/80",
                    )}
                  >
                    {item.label}
                    <ChevronDown className="size-3.5 transition-transform group-focus-within:rotate-180 group-hover:rotate-180" aria-hidden />
                  </Link>
                  <div className="invisible absolute left-0 top-full w-64 pt-3 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <ul className="rounded-2xl border border-border bg-popover p-2 shadow-lift">
                      {item.children.map((c) => (
                        <li key={c.to}>
                          <Link to={c.to} className="block rounded-xl px-3 py-2 text-sm hover:bg-muted focus-visible:bg-muted">
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "py-2 text-sm font-medium transition-colors hover:text-primary",
                    isActive(item.to) ? "text-primary" : "text-foreground/80",
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="ml-auto hidden lg:block">
            <AccountActions signedIn={signedIn} />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </header>

      {open ? (
        <div id="site-mobile-menu" className="fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto bg-background px-4 pb-10 pt-4 lg:hidden">
          <nav aria-label="Mobile" className="divide-y divide-border">
            {NAV.map((item) => (
              <div key={item.to} className="py-1">
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block px-2 py-3 text-lg font-semibold",
                    isActive(item.to) ? "text-primary" : "text-foreground",
                  )}
                >
                  {item.label}
                </Link>
                {item.children ? (
                  <ul className="ml-3 border-l border-border pl-3">
                    {item.children.slice(1).map((c) => (
                      <li key={c.to}>
                        <Link to={c.to} onClick={() => setOpen(false)} className="block px-2 py-2 text-sm text-muted-foreground hover:text-foreground">
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
            <div className="py-1">
              <Link to="/contact" onClick={() => setOpen(false)} className="block px-2 py-3 text-lg font-semibold text-foreground">
                Contact
              </Link>
            </div>
          </nav>
          <div className="mt-6">
            <AccountActions signedIn={signedIn} stacked />
          </div>
        </div>
      ) : null}
    </>
  );
}

const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: "Explore",
    links: [{ label: "The ecosystem", to: "/explore" }, ...ECOSYSTEM.slice(0, 5).map((a) => ({ label: a.name, to: `/explore/${a.slug}` }))],
  },
  {
    title: "DIM",
    links: [
      { label: "DIM ELITE", to: "/elite" },
      { label: "DIM Society", to: "/society" },
      { label: "For Organisations", to: "/organisations" },
      { label: "Partnerships", to: "/contact" },
      { label: "About Us", to: "/about" },
      { label: "Insights", to: "/insights" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Join DIM", to: "/auth" },
      { label: "Sign in", to: "/auth?mode=signin" },
      { label: "Contact", to: "/contact" },
      { label: "Privacy policy", to: "/privacy" },
      { label: "Terms and conditions", to: "/terms" },
    ],
  },
];

function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Wordmark inverted />
          <p className="mt-4 font-display text-lg font-bold text-ember">{TAGLINE}</p>
          <p className="mt-3 max-w-sm text-sm text-ink-foreground/75">
            One account for learning, AI tools, community and career development — built for people starting from any level.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 underline underline-offset-4">
                <WhatsAppIcon className="size-4" /> WhatsApp {WHATSAPP_DISPLAY}
              </a>
            </li>
            {CONTACT.email ? (
              <li>
                <a href={`mailto:${CONTACT.email}`} className="underline underline-offset-4">
                  {CONTACT.email}
                </a>
              </li>
            ) : (
              <li>
                <Link to="/contact" className="font-semibold underline underline-offset-4">
                  Send us a message
                </Link>
              </li>
            )}
          </ul>
          {SOCIALS.length ? (
            <ul className="mt-4 flex flex-wrap gap-3 text-sm">
              {SOCIALS.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-foreground/60">{col.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a href={l.to} className="text-ink-foreground/85 hover:text-ink-foreground hover:underline">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ink-foreground/15">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-ink-foreground/60 sm:px-6">
          © {new Date().getFullYear()} {COMPANY} (DIM). All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}
