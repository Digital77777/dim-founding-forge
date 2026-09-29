import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, ChevronRight, LogOut, Menu, Settings, UserRound, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/dim/Icon";
import { FoundingBadge } from "@/components/dim/FoundingBadge";
import { supabase } from "@/integrations/supabase/client";
import { useMember, firstName } from "@/hooks/use-member";
import { NAV_GROUPS, TAB_ITEMS } from "@/lib/dim";
import { cn } from "@/lib/utils";

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="space-y-6 pb-10">
      {NAV_GROUPS.map((group) => (
        <div key={group.group}>
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {group.group}
          </p>
          <ul className="mt-2 space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/75 hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon name={item.icon} className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.soon ? (
                      <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Soon
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Facebook-style full menu: profile card plus a grid of every Elite feature. */
function MenuSheet({
  onClose,
  onSignOut,
  name,
  headline,
  foundingNumber,
}: {
  onClose: () => void;
  onSignOut: () => void;
  name: string;
  headline: string | null;
  foundingNumber: number | null;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background lg:hidden">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
          <X className="size-5" />
        </Button>
        <h2 className="font-display text-lg font-extrabold">Menu</h2>
        <Button variant="ghost" size="icon" asChild className="ml-auto" aria-label="Profile settings">
          <Link to="/profile" onClick={onClose}>
            <Settings className="size-5" />
          </Link>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 pb-24">
        <Link
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <UserRound className="size-6" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold">{name}</span>
            <span className="block truncate text-sm text-muted-foreground">
              {headline ?? "View your profile"}
            </span>
          </span>
          <ChevronRight className="ml-auto size-5 shrink-0 text-muted-foreground" />
        </Link>

        <div className="mt-3">
          <FoundingBadge number={foundingNumber} size="md" />
        </div>

        {NAV_GROUPS.map((group) => (
          <section key={group.group} className="mt-6">
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {group.group}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {group.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className="rounded-2xl border border-border bg-card p-3 shadow-sm transition-colors hover:border-primary/40"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-muted text-primary">
                    <Icon name={item.icon} className="size-5" />
                  </span>
                  <span className="mt-2 block text-sm font-semibold leading-tight">{item.label}</span>
                  {item.soon ? (
                    <span className="mt-1 inline-block rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Soon
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </section>
        ))}

        <button
          onClick={onSignOut}
          className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-muted text-primary">
            <LogOut className="size-5" />
          </span>
          <span className="font-semibold">Log out</span>
        </button>
      </div>
    </div>
  );
}

/** The Elite app shell: sticky header, Facebook-style menu, sticky feature footer. */
export function AppShell({
  children,
  scrollHeader,
}: {
  children: ReactNode;
  scrollHeader?: ReactNode;
}) {
  const { user, userId, profile, membership } = useMember();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showFeatureRail, setShowFeatureRail] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function updateFeatureRail() {
      setShowFeatureRail(Boolean(scrollHeader) && window.scrollY > 160);
    }

    updateFeatureRail();
    window.addEventListener("scroll", updateFeatureRail, { passive: true });
    return () => window.removeEventListener("scroll", updateFeatureRail);
  }, [scrollHeader]);

  const unread = useQuery({
    queryKey: ["unread-notifications", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return 0;
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .is("read_at", null);
      return count ?? 0;
    },
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
          <Link to="/dashboard" className="font-display text-sm font-extrabold tracking-[0.22em]">
            DIM<span className="text-primary">ELITE</span>
          </Link>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <FoundingBadge
              number={membership?.founding_number ?? null}
              className="hidden sm:inline-flex"
            />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" asChild aria-label="Notifications">
              <Link to="/notifications" className="relative">
                <Bell className="size-5" />
                {unread.data ? (
                  <span className="absolute right-1 top-1 size-2 rounded-full bg-primary" />
                ) : null}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild aria-label="Profile">
              <Link to="/profile">
                <UserRound className="size-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              aria-label="Sign out"
              className="hidden lg:inline-flex"
            >
              <LogOut className="size-5" />
            </Button>
          </div>
        </div>
        {scrollHeader ? (
          <div
            aria-hidden={!showFeatureRail}
            className={cn(
              "grid overflow-hidden border-t border-border bg-background/95 shadow-sm transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none",
              showFeatureRail
                ? "grid-rows-[1fr] opacity-100"
                : "pointer-events-none grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="min-h-0">{scrollHeader}</div>
          </div>
        ) : null}
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-border px-3 py-6 lg:block">
          <NavList />
        </aside>

        {open ? (
          <MenuSheet
            onClose={() => setOpen(false)}
            onSignOut={signOut}
            name={firstName(profile, user) === "there" ? "Your profile" : (profile?.full_name ?? firstName(profile, user))}
            headline={profile?.headline ?? null}
            foundingNumber={membership?.founding_number ?? null}
          />
        ) : null}

        <main className="min-w-0 flex-1 px-4 py-8 pb-24 sm:px-6 lg:px-8 lg:pb-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        <ul className="flex items-stretch">
          {TAB_ITEMS.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <li key={item.to} className="flex-1">
                <Link
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon name={item.icon} className="size-5" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
