"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { GmailLabel, GmailMessage } from "@/lib/gmail";
import { GlassCard } from "@/components/design-system/glass-card";
import { EmptyState } from "@/components/empty-state";
import { PieChart as PieChartIcon } from "lucide-react";

type LabelDistributionProps = {
  messages: GmailMessage[];
  labels: GmailLabel[];
  isLoading: boolean;
  error?: boolean;
};

const categoryLabels: Record<string, string> = {
  CATEGORY_PERSONAL: "Inbox",
  CATEGORY_PROMOTIONS: "Promo",
  CATEGORY_SOCIAL: "Sosial",
  CATEGORY_UPDATES: "Update",
  CATEGORY_FORUMS: "Forum",
};

const chartColors = ["#D4AF37", "#E8CC70", "#B98F2E", "#8F7440", "#65708A", "#42506B"];

function getDistribution(messages: GmailMessage[], labels: GmailLabel[]) {
  const labelNames = new Map(labels.map((label) => [label.id, label.name]));
  const counts = new Map<string, number>();

  for (const message of messages) {
    const categoryId = Object.keys(categoryLabels).find((id) =>
      message.labels.includes(id),
    );
    const category = categoryId
      ? categoryLabels[categoryId]
      : message.labels.includes("INBOX")
        ? "Inbox"
        : "Lainnya";

    counts.set(category, (counts.get(category) ?? 0) + 1);
  }

  return [...counts]
    .map(([name, value]) => ({ name, value }))
    .sort((first, second) => second.value - first.value)
    .map((item) => ({
      ...item,
      sourceLabel:
        item.name === "Inbox"
          ? labelNames.get("INBOX") ?? "Inbox"
          : item.name,
    }));
}

export function LabelDistribution({
  messages,
  labels,
  isLoading,
  error = false,
}: LabelDistributionProps) {
  const data = getDistribution(messages, labels);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <GlassCard className="min-w-0 p-5 sm:p-7">
      <div>
        <h2 className="font-display text-xl">Label distribution</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kategori pada pesan terbaru
        </p>
      </div>

      {isLoading ? (
        <div
          aria-label="Memuat distribusi label"
          className="mt-7 flex h-60 items-center justify-center"
        >
          <div className="skeleton-shimmer size-40 rounded-full" />
        </div>
      ) : error ? (
        <EmptyState
          icon={PieChartIcon}
          title="Distribution unavailable."
          description="Distribusi label tidak dapat dimuat saat ini."
          compact
        />
      ) : total === 0 ? (
        <EmptyState
          icon={PieChartIcon}
          title="No categories yet."
          description="Kategori email akan muncul setelah pesan Gmail tersedia."
          compact
        />
      ) : (
        <>
          <div className="relative mt-3 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={86}
                  paddingAngle={3}
                  stroke="rgba(10,15,31,0.8)"
                  strokeWidth={2}
                >
                  {data.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,15,31,0.94)",
                    border: "1px solid rgba(212,175,55,0.25)",
                    borderRadius: 12,
                    color: "#F5F1E8",
                  }}
                  formatter={(value, name) => [`${value} email`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl">{total}</span>
              <span className="mt-0.5 text-[10px] text-muted-foreground">
                pesan terbaru
              </span>
            </div>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
            {data.map((item, index) => (
              <li
                key={item.name}
                className="flex min-w-0 items-center gap-2 text-xs"
              >
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: chartColors[index % chartColors.length] }}
                />
                <span className="truncate text-muted-foreground">
                  {item.sourceLabel}
                </span>
                <span className="ml-auto tabular-nums text-foreground">
                  {Math.round((item.value / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </GlassCard>
  );
}
