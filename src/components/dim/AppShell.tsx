import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, LogOut, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/dim/Icon";
import { FoundingBadge } from "@/components/dim/FoundingBadge";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";
import { NAV_GROUPS } from "@/lib/dim";
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

/** The Elite app shell: grouped ecosystem navigation plus member chrome. */
export function AppShell({ children }: { children: ReactNode }) {
  const { userId, membership } = useMember();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const unread = useQuery({
    queryKey: ["unread-notifications", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId!)
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
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>
          <Link to="/dashboard" className="font-display text-sm font-extrabold tracking-[0.22em]">
            DIM<span className="text-primary">ELITE</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <FoundingBadge
              number={membership?.founding_number ?? null}
              className="hidden sm:inline-flex"
            />
            <Button variant="ghost" size="icon" asChild aria-label="Notifications">
              <Link to="/notifications" className="relative">
                <Bell className="size-5" />
                {unread.data ? (
                  <span className="absolute right-1 top-1 size-2 rounded-full bg-primary" />
                ) : null}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
              <LogOut className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-border px-3 py-6 lg:block">
          <NavList />
        </aside>

        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              className="absolute inset-0 bg-foreground/40"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
            />
            <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-background px-3 py-5">
              <div className="mb-4 flex items-center justify-between px-2">
                <span className="font-display text-sm font-extrabold tracking-[0.22em]">
                  DIM<span className="text-primary">ELITE</span>
                </span>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
                  <X className="size-5" />
                </Button>
              </div>
              <NavList onNavigate={() => setOpen(false)} />
            </div>
          </div>
        ) : null}

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
