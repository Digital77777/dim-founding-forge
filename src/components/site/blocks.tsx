import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { STATUS_LABEL, type Status } from "@/lib/site";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<Status, string> = {
  available: "border-accent/40 bg-accent/10 text-foreground",
  beta: "border-primary/40 bg-primary/10 text-primary",
  development: "border-gold/40 bg-gold/10 text-gold",
  planned: "border-border bg-muted text-muted-foreground",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
        STATUS_STYLE[status],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", status === "available" ? "bg-accent" : status === "beta" ? "bg-primary" : status === "development" ? "bg-gold" : "bg-muted-foreground")} aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{children}</p>;
}

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  tone = "default",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  children?: ReactNode;
  tone?: "default" | "surface";
}) {
  return (
    <section id={id} className={cn("py-16 sm:py-24", tone === "surface" && "bg-surface")}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h2>
          {intro ? <div className="mt-4 text-base text-muted-foreground sm:text-lg">{intro}</div> : null}
        </div>
        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </section>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/8 via-background to-background">
      <div className="pointer-events-none absolute inset-0 grid-paper opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">{title}</h1>
        <div className="mt-5 max-w-2xl text-lg text-muted-foreground">{intro}</div>
        {children ? <div className="mt-8 flex flex-wrap gap-3">{children}</div> : null}
      </div>
    </section>
  );
}

export function CardLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <a href={to} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
      {children}
      <ArrowRight className="size-4" aria-hidden />
    </a>
  );
}

export function CtaBand({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-elite px-6 py-14 text-center text-ink-foreground sm:px-12">
        <div className="pointer-events-none absolute inset-0 grid-paper opacity-15" aria-hidden />
        <div className="relative">
          <h2 className="mx-auto max-w-3xl font-display text-3xl font-extrabold leading-tight sm:text-5xl">{title}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-ink-foreground/85">{body}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function Faq({ items }: { items: { q: string; a: ReactNode }[] }) {
  return (
    <Accordion type="single" collapsible className="max-w-3xl rounded-2xl border border-border bg-card px-5">
      {items.map((it, i) => (
        <AccordionItem key={it.q} value={`q${i}`} className={i === items.length - 1 ? "border-b-0" : ""}>
          <AccordionTrigger className="text-left text-base font-semibold">{it.q}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{it.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/** Ecosystem diagram: DIM at the centre of the Learn → Build → Connect → Earn → Grow loop. */
export function EcosystemVisual() {
  const nodes = [
    { label: "Learn", x: 50, y: 8, c: "text-learn border-learn/40" },
    { label: "Build", x: 90, y: 38, c: "text-build border-build/40" },
    { label: "Connect", x: 75, y: 86, c: "text-connect border-connect/40" },
    { label: "Earn", x: 25, y: 86, c: "text-earn border-earn/40" },
    { label: "Grow", x: 10, y: 38, c: "text-grow border-grow/40" },
  ];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md" role="img" aria-label="DIM ecosystem: Learn, Build, Connect, Earn and Grow, connected by community">
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <linearGradient id="dimRing" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="50%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--gold)" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="40" fill="none" stroke="url(#dimRing)" strokeWidth="0.6" strokeDasharray="1.5 1.5" />
        {nodes.map((n) => (
          <line key={n.label} x1="50" y1="50" x2={n.x} y2={n.y} stroke="var(--border)" strokeWidth="0.4" />
        ))}
        {nodes.map((n, i) => {
          const m = nodes[(i + 1) % nodes.length]!;
          return <line key={`${n.label}-r`} x1={n.x} y1={n.y} x2={m.x} y2={m.y} stroke="url(#dimRing)" strokeWidth="0.5" opacity="0.6" />;
        })}
      </svg>
      <div className="absolute left-1/2 top-1/2 grid size-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ember text-center text-primary-foreground shadow-glow sm:size-36">
        <div>
          <p className="font-display text-3xl font-extrabold tracking-widest">DIM</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] opacity-90">Community at the core</p>
        </div>
      </div>
      {nodes.map((n) => (
        <span
          key={n.label}
          className={cn("absolute -translate-x-1/2 -translate-y-1/2 rounded-full border bg-card px-3 py-1.5 text-sm font-bold shadow-lift sm:px-4 sm:py-2", n.c)}
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          {n.label}
        </span>
      ))}
    </div>
  );
}

export { Link };
