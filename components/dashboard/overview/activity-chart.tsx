"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { GmailMessage } from "@/lib/gmail";
import { GlassCard } from "@/components/design-system/glass-card";

type ActivityChartProps = {
  messages: GmailMessage[];
  isLoading: boolean;
  error?: boolean;
};

function getLastSevenDays(messages: GmailMessage[]) {
  const counts = new Map<string, number>();
  const now = new Date();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset),
    );
    counts.set(date.toISOString().slice(0, 10), 0);
  }

  for (const message of messages) {
    if (!message.date) continue;
    const dateKey = new Date(message.date).toISOString().slice(0, 10);
    if (counts.has(dateKey)) {
      counts.set(dateKey, (counts.get(dateKey) ?? 0) + 1);
    }
  }

  return [...counts].map(([date, emails]) => ({ date, emails }));
}

function ChartSkeleton() {
  return (
    <div
      aria-label="Memuat aktivitas email"
      className="skeleton-shimmer mt-7 h-64 rounded-xl"
    />
  );
}

export function ActivityChart({
  messages,
  isLoading,
  error = false,
}: ActivityChartProps) {
  const data = getLastSevenDays(messages);

  return (
    <GlassCard className="min-w-0 p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl">Email activity</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Email masuk · 7 hari terakhir
          </p>
        </div>
        <span className="rounded-full border border-gold/20 bg-gold/[0.06] px-3 py-1 text-[11px] font-medium text-gold-light">
          7 hari
        </span>
      </div>

      {isLoading ? (
        <ChartSkeleton />
      ) : error ? (
        <div
          role="status"
          className="mt-7 flex h-64 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground"
        >
          Grafik tidak dapat dimuat.
        </div>
      ) : (
        <div className="mt-5 h-64 w-full" aria-label="Grafik email masuk per hari">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 12, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="emailActivityGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E8CC70" stopOpacity={0.38} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.015} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="rgba(255,255,255,0.07)"
                strokeDasharray="3 5"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickFormatter={(value: string) =>
                  new Date(`${value}T12:00:00Z`).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    timeZone: "UTC",
                  })
                }
                dy={10}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(10,15,31,0.94)",
                  border: "1px solid rgba(212,175,55,0.25)",
                  borderRadius: 12,
                  color: "#F5F1E8",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
                }}
                labelStyle={{ color: "#E8CC70", marginBottom: 4 }}
                labelFormatter={(value) =>
                  new Date(`${String(value)}T12:00:00Z`).toLocaleDateString(
                    "id-ID",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      timeZone: "UTC",
                    },
                  )
                }
                formatter={(value) => [`${value} email`, "Masuk"]}
              />
              <Area
                type="monotone"
                dataKey="emails"
                stroke="#D4AF37"
                strokeWidth={2.5}
                fill="url(#emailActivityGold)"
                activeDot={{
                  r: 5,
                  fill: "#E8CC70",
                  stroke: "#0A0F1F",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      {!isLoading && !error && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Grafik dihitung dari hingga 100 pesan Gmail terbaru.
        </p>
      )}
    </GlassCard>
  );
}
