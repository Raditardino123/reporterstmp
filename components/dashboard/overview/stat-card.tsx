import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { GlassCard } from "@/components/design-system/glass-card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  percentage?: number;
  percentageLabel: string;
  tone?: "positive" | "negative" | "neutral";
  isLoading?: boolean;
};

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  percentage,
  percentageLabel,
  tone = "neutral",
  isLoading = false,
}: StatCardProps) {
  const TrendIcon =
    percentage === undefined
      ? Minus
      : tone === "negative"
        ? ArrowDownRight
        : ArrowUpRight;

  return (
    <GlassCard className="group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:border-gold/35 hover:shadow-[0_12px_42px_rgba(212,175,55,0.12)] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 size-32 rounded-full bg-gold/0 blur-3xl transition duration-500 group-hover:bg-gold/10"
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-4 truncate font-display text-4xl tracking-tight sm:text-[2.65rem]">
            {isLoading ? (
              <span className="skeleton-shimmer inline-block h-10 w-28 rounded-lg" />
            ) : (
              value
            )}
          </p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-gold/20 bg-gold/[0.07] text-gold transition duration-300 group-hover:border-gold/40 group-hover:bg-gold/15 group-hover:shadow-glow">
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </div>
      <div className="relative mt-5 flex min-h-5 items-center gap-1.5">
        {percentage === undefined ? (
          <Minus aria-hidden="true" className="size-3.5 text-muted-foreground" />
        ) : (
          <TrendIcon
            aria-hidden="true"
            className={cn(
              "size-3.5",
              tone === "positive" && "text-emerald-400",
              tone === "negative" && "text-rose-400",
              tone === "neutral" && "text-gold",
            )}
          />
        )}
        {percentage === undefined ? (
          <span className="text-xs text-muted-foreground">
            Persentase belum tersedia
          </span>
        ) : (
          <span
            className={cn(
              "text-xs font-semibold tabular-nums",
              tone === "positive" && "text-emerald-400",
              tone === "negative" && "text-rose-400",
              tone === "neutral" && "text-gold-light",
            )}
          >
            {percentage > 0 ? "+" : ""}
            {percentage.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%
          </span>
        )}
        <span className="truncate text-xs text-muted-foreground">
          {percentageLabel}
        </span>
      </div>
      <p className="relative mt-1 truncate text-[11px] text-muted-foreground/75">
        {detail}
      </p>
    </GlassCard>
  );
}
