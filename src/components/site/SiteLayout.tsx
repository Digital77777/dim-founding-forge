import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { COMPANY, CONTACT, ECOSYSTEM, SOCIALS, TAGLINE } from "@/lib/site";
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
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" aria-label={`${COMPANY} home`} className="shrink-0">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 xl:flex">
          {NAV.map((item) =>
            item.children ? (
              <div key={item.to} className="group relative">
                <Link
                  to={item.to}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                    isActive(item.to) ? "text-primary" : "text-foreground/80",
                  )}
                >
                  {item.label}
                  <ChevronDown className="size-3.5 transition-transform group-focus-within:rotate-180 group-hover:rotate-180" aria-hidden />
                </Link>
                <div className="invisible absolute left-0 top-full w-64 pt-2 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
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
                  "rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  isActive(item.to) ? "text-primary" : "text-foreground/80",
                )}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="ml-auto hidden xl:block">
          <AccountActions signedIn={signedIn} />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="ml-auto xl:hidden"
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
        <div id="site-mobile-menu" className="fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto bg-background px-4 pb-10 pt-4 xl:hidden">
          <nav aria-label="Mobile" className="space-y-1">
            {NAV.map((item) => (
              <div key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn("block rounded-xl px-3 py-3 text-base font-semibold", isActive(item.to) ? "bg-primary/10 text-primary" : "hover:bg-muted")}
                >
                  {item.label}
                </Link>
                {item.children ? (
                  <ul className="ml-3 border-l border-border pl-3">
                    {item.children.slice(1).map((c) => (
                      <li key={c.to}>
                        <Link to={c.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
            <Link to="/contact" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-base font-semibold hover:bg-muted">
              Contact
            </Link>
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
            {COMPANY} helps people turn curiosity about AI into practical skills, meaningful connections and opportunities.
          </p>
          {CONTACT.email ? (
            <a href={`mailto:${CONTACT.email}`} className="mt-4 inline-block text-sm underline underline-offset-4">
              {CONTACT.email}
            </a>
          ) : (
            <Link to="/contact" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
              Send us a message
            </Link>
          )}
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
    </div>
  );
}
