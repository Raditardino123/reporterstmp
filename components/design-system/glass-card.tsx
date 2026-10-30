import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  goldBorder?: boolean;
};

export function GlassCard({
  className,
  goldBorder = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl",
        goldBorder && "gold-border",
        className,
      )}
      {...props}
    />
  );
}
