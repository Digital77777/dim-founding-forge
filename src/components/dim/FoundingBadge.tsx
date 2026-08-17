import { Crown } from "lucide-react";

import { cn } from "@/lib/utils";
import { FOUNDING_CAP } from "@/lib/dim";

/** The Founding 1,000 status marker. Shown on profiles, posts and achievements. */
export function FoundingBadge({
  number,
  size = "sm",
  showNumber = true,
  className,
}: {
  number?: number | null;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  className?: string;
}) {
  const pad = (n: number) => String(n).padStart(4, "0");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/12 font-semibold uppercase tracking-[0.14em] text-gold-foreground",
        size === "sm" && "px-2.5 py-0.5 text-[10px]",
        size === "md" && "px-3 py-1 text-[11px]",
        size === "lg" && "px-4 py-1.5 text-xs",
        className,
      )}
    >
      <Crown className={cn(size === "lg" ? "size-4" : "size-3", "text-gold")} aria-hidden />
      Founding {FOUNDING_CAP.toLocaleString()}
      {showNumber && typeof number === "number" ? (
        <span className="tabular-nums opacity-80">#{pad(number)}</span>
      ) : null}
    </span>
  );
}

export function foundingLabel(number?: number | null) {
  if (typeof number !== "number") return null;
  return `#${String(number).padStart(4, "0")} / ${FOUNDING_CAP}`;
}
