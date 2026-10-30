import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type GoldButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline";
};

export function GoldButton({
  className,
  variant = "solid",
  ...props
}: GoldButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        variant === "solid"
          ? "bg-gold-sheen text-navy-deep shadow-gold hover:-translate-y-0.5 hover:brightness-110"
          : "border border-gold/40 bg-gold/5 text-gold-light hover:border-gold/70 hover:bg-gold/10",
        className,
      )}
      {...props}
    />
  );
}
