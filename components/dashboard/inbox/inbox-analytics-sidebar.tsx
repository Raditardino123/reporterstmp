"use client";

import { Users } from "lucide-react";
import { GlassCard } from "@/components/design-system/glass-card";
import { EmptyState } from "@/components/empty-state";
import type { GmailMessage } from "@/lib/gmail";

type InboxAnalyticsSidebarProps = {
  messages: GmailMessage[];
  isLoading?: boolean;
};

export function InboxAnalyticsSidebar({
  messages,
  isLoading = false,
}: InboxAnalyticsSidebarProps) {
  const senders = new Map<string, { name: string; count: number }>();
  const hours = Array.from({ length: 24 }, () => 0);

  for (const message of messages) {
    const email = message.sender.email.trim().toLowerCase();
    if (email) {
      const current = senders.get(email);
      senders.set(email, {
        name: message.sender.name || message.sender.email,
        count: (current?.count ?? 0) + 1,
      });
    }

    const date = new Date(message.date);
    if (message.date && !Number.isNaN(date.getTime())) {
      hours[date.getHours()] += 1;
    }
  }

  const topSenders = [...senders.values()]
    .sort((first, second) => second.count - first.count)
    .slice(0, 5);
  const maxSenderCount = Math.max(1, ...topSenders.map((sender) => sender.count));
  const maxHourlyCount = Math.max(1, ...hours);

  return (
    <aside className="space-y-5">
      <GlassCard className="p-5">
        <div className="mb-5">
          <h2 className="font-display text-lg">Top senders</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Pada halaman ini
          </p>
        </div>
        {isLoading ? (
          <div className="space-y-4 py-2" aria-label="Memuat pengirim teratas">
            {[0, 1, 2, 3].map((item) => (
              <div key={item}>
                <div className="skeleton-shimmer mb-2 h-3 w-2/3 rounded" />
                <div className="skeleton-shimmer h-1.5 rounded-full" />
              </div>
            ))}
          </div>
        ) : topSenders.length ? (
          <ol className="space-y-4">
            {topSenders.map((sender, index) => (
              <li key={sender.name} className="min-w-0">
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                  <span className="truncate text-foreground/85">
                    <span className="mr-2 text-[10px] text-gold/70">
                      0{index + 1}
                    </span>
                    {sender.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {sender.count}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gold-sheen"
                    style={{ width: `${(sender.count / maxSenderCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState
            icon={Users}
            title="No senders yet."
            description="Pengirim teratas akan dihitung dari email Anda."
            compact
          />
        )}
      </GlassCard>

      <GlassCard className="p-5">
        <div className="mb-5">
          <h2 className="font-display text-lg">Emails per hour</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Pola waktu pesan pada halaman ini
          </p>
        </div>
        {isLoading ? (
          <div
            aria-label="Memuat heatmap email"
            className="skeleton-shimmer aspect-square w-full rounded-xl"
          />
        ) : (
          <div
            role="img"
            aria-label="Heatmap jumlah email per jam"
            className="grid grid-cols-6 gap-2"
          >
            {hours.map((count, hour) => {
              const intensity = count / maxHourlyCount;
              return (
                <div
                  key={hour}
                  title={`${String(hour).padStart(2, "0")}:00 · ${count} email`}
                  className="flex aspect-square flex-col items-center justify-center rounded-lg border border-gold/10 text-[9px] tabular-nums text-foreground/70"
                  style={{
                    backgroundColor: `rgba(212, 175, 55, ${0.035 + intensity * 0.3})`,
                    boxShadow:
                      count > 0
                        ? `inset 0 0 12px rgba(212,175,55,${intensity * 0.08})`
                        : undefined,
                  }}
                >
                  <span>{String(hour).padStart(2, "0")}</span>
                  <span className="mt-0.5 text-[8px] text-muted-foreground">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between text-[9px] text-muted-foreground">
          <span>00:00</span>
          <span>Intensitas email</span>
          <span>23:00</span>
        </div>
      </GlassCard>
    </aside>
  );
}
