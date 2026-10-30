import { Mail, RefreshCw } from "lucide-react";
import type { GmailMessage } from "@/lib/gmail";
import { GlassCard } from "@/components/design-system/glass-card";
import { EmptyState } from "@/components/empty-state";

type RecentEmailsProps = {
  messages: GmailMessage[];
  isLoading: boolean;
  error?: boolean;
  onRetry: () => void;
};

function getInitials(message: GmailMessage) {
  const source = message.sender.name || message.sender.email;
  const parts = source.trim().split(/[\s@._-]+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}

function formatEmailDate(date: string) {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Tanggal tidak tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(parsedDate);
}

function RecentEmailsSkeleton() {
  return (
    <div aria-label="Memuat email terbaru" className="mt-4 divide-y divide-border/60">
      {[0, 1, 2, 3, 4].map((item) => (
        <div key={item} className="flex items-center gap-3 py-3.5">
          <div className="skeleton-shimmer size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="skeleton-shimmer h-3.5 w-2/3 rounded" />
            <div className="skeleton-shimmer h-3 w-1/2 rounded" />
          </div>
          <div className="skeleton-shimmer h-3 w-14 rounded" />
        </div>
      ))}
    </div>
  );
}

export function RecentEmails({
  messages,
  isLoading,
  error = false,
  onRetry,
}: RecentEmailsProps) {
  const recentMessages = [...messages]
    .sort((first, second) => {
      const firstDate = first.internalDate
        ? Number(first.internalDate)
        : new Date(first.date).getTime();
      const secondDate = second.internalDate
        ? Number(second.internalDate)
        : new Date(second.date).getTime();
      return secondDate - firstDate;
    })
    .slice(0, 5);

  return (
    <GlassCard className="p-5 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl">Recent emails</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Lima pesan terakhir dari Gmail
          </p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-xl border border-gold/15 bg-gold/[0.06] text-gold">
          <Mail aria-hidden="true" className="size-4" />
        </span>
      </div>

      {isLoading ? (
        <RecentEmailsSkeleton />
      ) : error ? (
        <div
          role="alert"
          className="mt-5 flex min-h-44 flex-col items-center justify-center text-center"
        >
          <p className="text-sm text-muted-foreground">
            Email terbaru tidak dapat dimuat.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-foreground transition hover:border-gold/30 hover:text-gold-light"
          >
            <RefreshCw aria-hidden="true" className="size-3.5" />
            Coba lagi
          </button>
        </div>
      ) : recentMessages.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="Your inbox is quiet."
          description="Email terbaru akan muncul di sini setelah Gmail tersambung."
          compact
        />
      ) : (
        <ul className="mt-3 divide-y divide-border/60">
          {recentMessages.map((message, index) => {
            const isUnread = message.labels.includes("UNREAD");

            return (
              <li key={message.id} className="flex min-w-0 items-center gap-3 py-3.5">
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-xs font-semibold text-gold-light"
                  style={{ opacity: Math.max(0.7, 1 - index * 0.06) }}
                >
                  {getInitials(message)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    {isUnread && (
                      <span className="size-1.5 shrink-0 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.7)]" />
                    )}
                    <p
                      className={`truncate text-sm ${
                        isUnread ? "font-semibold text-foreground" : "font-medium text-foreground/85"
                      }`}
                      title={message.subject}
                    >
                      {message.subject}
                    </p>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {message.sender.name || message.sender.email || message.from}
                  </p>
                </div>
                <time
                  dateTime={message.date || undefined}
                  className="shrink-0 text-[10px] tabular-nums text-muted-foreground"
                >
                  {formatEmailDate(message.date)}
                </time>
              </li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}
