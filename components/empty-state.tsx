import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 text-center ${
        compact ? "py-8" : "min-h-56 py-12"
      }`}
    >
      <div className="empty-state-illustration relative flex size-16 items-center justify-center rounded-[1.35rem] border border-gold/20 bg-gold/[0.055] text-gold">
        <span
          aria-hidden="true"
          className="absolute -inset-2 -z-10 rounded-[1.7rem] border border-gold/10"
        />
        <Icon aria-hidden="true" className="size-6" />
      </div>
      <h3 className="mt-5 font-display text-xl">{title}</h3>
      <p className="mt-2 max-w-md text-xs leading-5 text-muted-foreground sm:text-sm">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
