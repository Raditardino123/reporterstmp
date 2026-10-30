import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function BadgePremium({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-light",
        className,
      )}
      {...props}
    />
  );
}
