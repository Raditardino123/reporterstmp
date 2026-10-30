"use client";

import dynamic from "next/dynamic";
import { RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { KpiGrid } from "@/components/dashboard/overview/kpi-grid";
import { RecentEmails } from "@/components/dashboard/overview/recent-emails";
import { GmailClientError, useLabels, useMessages, useProfile } from "@/hooks/use-gmail";
import type { GmailMessage } from "@/lib/gmail";

const noMessages: GmailMessage[] = [];

const ActivityChart = dynamic(
  () =>
    import("@/components/dashboard/overview/activity-chart").then(
      (module) => module.ActivityChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        aria-label="Memuat grafik aktivitas"
        className="skeleton-shimmer min-h-72 rounded-2xl"
      />
    ),
  },
);

const LabelDistribution = dynamic(
  () =>
    import("@/components/dashboard/overview/label-distribution").then(
      (module) => module.LabelDistribution,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        aria-label="Memuat distribusi label"
        className="skeleton-shimmer min-h-72 rounded-2xl"
      />
    ),
  },
);

function getErrorMessage(error: Error) {
  if (error instanceof GmailClientError && error.status === 401) {
    return "Akses Gmail perlu diperbarui. Silakan masuk kembali.";
  }
  return error.message || "Data Gmail tidak dapat dimuat.";
}

export function GmailOverview() {
  const profileQuery = useProfile();
  const messagesQuery = useMessages({ maxResults: 100 });
  const unreadQuery = useMessages({ maxResults: 1, query: "is:unread" });
  const thisWeekQuery = useMessages({ maxResults: 1, query: "newer_than:7d" });
  const previousWeekQuery = useMessages({
    maxResults: 1,
    query: "newer_than:14d older_than:7d",
  });
  const labelsQuery = useLabels();

  const messages = messagesQuery.data?.messages ?? noMessages;
  const labels = labelsQuery.data ?? [];
  const topSender = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>();
    for (const message of messages) {
      const email = message.sender.email.trim().toLowerCase();
      if (!email) continue;

      const current = counts.get(email);
      counts.set(email, {
        name: message.sender.name || message.sender.email,
        count: (current?.count ?? 0) + 1,
      });
    }

    return [...counts.entries()]
      .sort((first, second) => second[1].count - first[1].count)[0];
  }, [messages]);

  const currentWeekCount = thisWeekQuery.data?.resultSizeEstimate;
  const previousWeekCount = previousWeekQuery.data?.resultSizeEstimate;
  const weeklyChange =
    currentWeekCount !== undefined &&
    previousWeekCount !== undefined &&
    previousWeekCount > 0
      ? ((currentWeekCount - previousWeekCount) / previousWeekCount) * 100
      : currentWeekCount === 0 && previousWeekCount === 0
        ? 0
        : undefined;

  const isLoading =
    profileQuery.isPending ||
    messagesQuery.isPending ||
    unreadQuery.isPending ||
    thisWeekQuery.isPending ||
    previousWeekQuery.isPending ||
    labelsQuery.isPending;
  const requests = [
    profileQuery,
    messagesQuery,
    unreadQuery,
    thisWeekQuery,
    previousWeekQuery,
    labelsQuery,
  ];
  const firstError = requests.find((request) => request.error)?.error;

  function retryAll() {
    for (const request of requests) {
      if (request.isError) void request.refetch();
    }
  }

  return (
    <>
      {firstError && (
        <div
          role="alert"
          className="mt-7 flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm font-medium">Data Gmail belum bisa dimuat</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {getErrorMessage(firstError)}
            </p>
          </div>
          <button
            type="button"
            onClick={retryAll}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-border px-3 text-xs font-medium transition hover:bg-accent"
          >
            <RefreshCw aria-hidden="true" className="size-3.5" />
            Coba lagi
          </button>
        </div>
      )}

      <div className="mt-9">
        <KpiGrid
          isLoading={isLoading}
          data={{
            totalEmails: profileQuery.data?.totalMessages,
            unread: unreadQuery.data?.resultSizeEstimate,
            thisWeek: currentWeekCount,
            weeklyChange,
            topSender: topSender?.[1].name,
            topSenderShare:
              topSender && messages.length > 0
                ? (topSender[1].count / messages.length) * 100
                : undefined,
          }}
        />
      </div>

      <section
        aria-label="Analitik email"
        className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]"
      >
        <ActivityChart
          messages={messages}
          isLoading={messagesQuery.isPending}
          error={messagesQuery.isError}
        />
        <LabelDistribution
          messages={messages}
          labels={labels}
          isLoading={messagesQuery.isPending || labelsQuery.isPending}
          error={messagesQuery.isError || labelsQuery.isError}
        />
      </section>

      <section aria-label="Email terbaru" className="mt-6">
        <RecentEmails
          messages={messages}
          isLoading={messagesQuery.isPending}
          error={messagesQuery.isError}
          onRetry={() => void messagesQuery.refetch()}
        />
      </section>
    </>
  );
}
