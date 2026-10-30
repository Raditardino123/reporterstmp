"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  MailSearch,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import { useMessages } from "@/hooks/use-gmail";
import { GlassCard } from "@/components/design-system/glass-card";
import { PageContainer } from "@/components/dashboard/page-container";
import { EmptyState } from "@/components/empty-state";
import { EmailDetailDialog } from "@/components/dashboard/inbox/email-detail-dialog";
import { InboxAnalyticsSidebar } from "@/components/dashboard/inbox/inbox-analytics-sidebar";
import type { GmailMessage } from "@/lib/gmail";
import { cn } from "@/lib/utils";

const pageSize = 25;

type InboxFilters = {
  unread: boolean;
  starred: boolean;
  important: boolean;
  hasAttachment: boolean;
  after: string;
  before: string;
  q: string;
};

function parsePageTokens(value: string | null): string[] {
  if (!value) return [];
  try {
    const tokens: unknown = JSON.parse(value);
    return Array.isArray(tokens) &&
      tokens.every((token) => typeof token === "string")
      ? tokens
      : [];
  } catch {
    return [];
  }
}

function toGmailDate(value: string) {
  return value.replace(/-/g, "/");
}

function addOneDay(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function buildGmailQuery(filters: InboxFilters) {
  const terms = [filters.q.trim()];
  if (filters.unread) terms.push("is:unread");
  if (filters.starred) terms.push("is:starred");
  if (filters.important) terms.push("is:important");
  if (filters.hasAttachment) terms.push("has:attachment");
  if (filters.after) terms.push(`after:${toGmailDate(filters.after)}`);
  if (filters.before) {
    terms.push(`before:${toGmailDate(addOneDay(filters.before))}`);
  }
  return terms.filter(Boolean).join(" ");
}

function getInitials(message: GmailMessage) {
  const source = message.sender.name || message.sender.email;
  const parts = source.trim().split(/[\s@._-]+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const labelStyles: Record<string, string> = {
  INBOX: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  UNREAD: "border-gold/25 bg-gold/10 text-gold-light",
  STARRED: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  IMPORTANT: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  SENT: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  CATEGORY_PROMOTIONS: "border-pink-400/20 bg-pink-400/10 text-pink-300",
  CATEGORY_SOCIAL: "border-blue-400/20 bg-blue-400/10 text-blue-300",
};

function readableLabel(label: string) {
  return label
    .replace(/^CATEGORY_/, "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function TableSkeleton() {
  return (
    <div aria-label="Memuat email" className="divide-y divide-border/60">
      {Array.from({ length: 7 }, (_, index) => (
        <div key={index} className="skeleton-shimmer h-[4.35rem]" />
      ))}
    </div>
  );
}

function InboxExplorerContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramsKey = searchParams.toString();
  const params = useMemo(() => new URLSearchParams(paramsKey), [paramsKey]);
  const [searchInput, setSearchInput] = useState(params.get("q") ?? "");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const filters: InboxFilters = {
    q: params.get("q") ?? "",
    unread: params.get("unread") === "1",
    starred: params.get("starred") === "1",
    important: params.get("important") === "1",
    hasAttachment: params.get("attachment") === "1",
    after: params.get("after") ?? "",
    before: params.get("before") ?? "",
  };
  const pageTokens = parsePageTokens(params.get("pages"));
  const pageNumber = pageTokens.length + 1;
  const currentPageToken = pageTokens.at(-1);
  const gmailQuery = buildGmailQuery(filters);
  const messagesQuery = useMessages({
    maxResults: pageSize,
    query: gmailQuery,
    pageToken: currentPageToken,
  });
  const messages = messagesQuery.data?.messages ?? [];

  useEffect(() => {
    setSearchInput(filters.q);
  }, [filters.q]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput === filters.q) return;
      const next = new URLSearchParams(paramsKey);
      if (searchInput.trim()) next.set("q", searchInput.trim());
      else next.delete("q");
      next.delete("pages");
      const queryString = next.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [filters.q, paramsKey, pathname, router, searchInput]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>, resetPages = true) => {
      const next = new URLSearchParams(paramsKey);
      for (const [key, value] of Object.entries(updates)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      if (resetPages) next.delete("pages");
      const queryString = next.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [paramsKey, pathname, router],
  );

  const toggleFilter = (key: "unread" | "starred" | "important" | "attachment") => {
    const nextValue = params.get(key) === "1" ? null : "1";
    updateParams({ [key]: nextValue });
  };

  const pageStart =
    messagesQuery.data && messages.length > 0
      ? (pageNumber - 1) * pageSize + 1
      : 0;
  const pageEnd = messagesQuery.data
    ? pageStart + messages.length - 1
    : 0;
  const total = messagesQuery.data?.resultSizeEstimate ?? 0;

  function goToNextPage() {
    const token = messagesQuery.data?.nextPageToken;
    if (!token) return;
    updateParams({ pages: JSON.stringify([...pageTokens, token]) }, false);
  }

  function goToPreviousPage() {
    if (pageTokens.length === 0) return;
    const previousTokens = pageTokens.slice(0, -1);
    updateParams(
      { pages: previousTokens.length ? JSON.stringify(previousTokens) : null },
      false,
    );
  }

  return (
    <>
      <PageContainer>
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            Gmail intelligence
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
            Inbox analytics
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Telusuri pesan, temukan pola pengirim, dan pahami ritme inbox Anda.
          </p>
        </div>

        <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="min-w-0 space-y-5">
            <GlassCard className="p-4 sm:p-5">
              <label className="flex min-h-14 items-center gap-3 rounded-xl border border-gold/20 bg-white/[0.045] px-4 shadow-soft backdrop-blur-xl transition focus-within:border-gold/50 focus-within:ring-2 focus-within:ring-gold/10">
                <Search aria-hidden="true" className="size-5 shrink-0 text-gold" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Cari email, pengirim, subjek..."
                  aria-label="Cari email"
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                {searchInput && (
                  <button
                    type="button"
                    aria-label="Hapus pencarian"
                    onClick={() => {
                      setSearchInput("");
                      updateParams({ q: null });
                    }}
                    className="rounded-md p-1 text-muted-foreground transition hover:text-foreground"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                )}
                <kbd className="hidden rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground sm:inline">
                  Gmail search
                </kbd>
              </label>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <SlidersHorizontal aria-hidden="true" className="size-3.5" />
                  Filter
                </span>
                {[
                  ["unread", "Unread"],
                  ["starred", "Starred"],
                  ["important", "Important"],
                  ["attachment", "Has attachment"],
                ].map(([key, label]) => {
                  const active = params.get(key) === "1";
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        toggleFilter(
                          key as "unread" | "starred" | "important" | "attachment",
                        )
                      }
                      className={cn(
                        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs transition",
                        active
                          ? "border-gold/40 bg-gold/10 text-gold-light"
                          : "border-border/80 bg-white/[0.025] text-muted-foreground hover:border-gold/25 hover:text-foreground",
                      )}
                    >
                      {key === "starred" && (
                        <Star aria-hidden="true" className="size-3" />
                      )}
                      {label}
                    </button>
                  );
                })}

                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <CalendarDays
                    aria-hidden="true"
                    className="size-3.5 text-gold/80"
                  />
                  <label className="sr-only" htmlFor="date-after">
                    Dari tanggal
                  </label>
                  <input
                    id="date-after"
                    type="date"
                    value={filters.after}
                    max={filters.before || undefined}
                    onChange={(event) =>
                      updateParams({ after: event.target.value || null })
                    }
                    className="h-8 w-[132px] rounded-lg border border-border/80 bg-background/70 px-2 text-[11px] text-muted-foreground outline-none transition focus:border-gold/40"
                  />
                  <span className="text-[10px] text-muted-foreground">to</span>
                  <label className="sr-only" htmlFor="date-before">
                    Sampai tanggal
                  </label>
                  <input
                    id="date-before"
                    type="date"
                    value={filters.before}
                    min={filters.after || undefined}
                    onChange={(event) =>
                      updateParams({ before: event.target.value || null })
                    }
                    className="h-8 w-[132px] rounded-lg border border-border/80 bg-background/70 px-2 text-[11px] text-muted-foreground outline-none transition focus:border-gold/40"
                  />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <MailSearch aria-hidden="true" className="size-4 text-gold" />
                  <h2 className="font-display text-lg">Messages</h2>
                  {messagesQuery.isFetching && (
                    <LoaderCircle
                      aria-label="Memperbarui pesan"
                      className="size-3.5 animate-spin text-gold"
                    />
                  )}
                </div>
                <p className="text-xs tabular-nums text-muted-foreground">
                  {total > 0
                    ? `${pageStart}–${pageEnd} dari ${total.toLocaleString("id-ID")}`
                    : messagesQuery.isPending
                      ? "Memuat pesan..."
                      : "Tidak ada pesan"}
                </p>
              </div>

              {messagesQuery.isPending ? (
                <TableSkeleton />
              ) : messagesQuery.isError ? (
                <div role="alert" className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                  <p className="text-sm font-medium">Pesan tidak dapat dimuat.</p>
                  <p className="mt-2 max-w-lg text-xs text-muted-foreground">
                    {messagesQuery.error.message}
                  </p>
                  <button
                    type="button"
                    onClick={() => void messagesQuery.refetch()}
                    className="mt-4 rounded-lg border border-gold/25 px-3 py-2 text-xs text-gold-light transition hover:bg-gold/10"
                  >
                    Coba lagi
                  </button>
                </div>
              ) : messages.length === 0 ? (
                <EmptyState
                  icon={MailSearch}
                  title="Tidak ada email ditemukan"
                  description="Coba ubah pencarian atau filter Anda untuk menemukan pesan yang dicari."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border/60 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        <th scope="col" className="px-5 py-3 font-medium sm:px-6">
                          Sender
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                          Subject
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                          Labels
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                          Date
                        </th>
                        <th scope="col" className="px-5 py-3 text-right font-medium sm:px-6">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {messages.map((message) => (
                        <tr
                          key={message.id}
                          tabIndex={0}
                          aria-label={`Buka email ${message.subject} dari ${message.sender.name || message.sender.email}`}
                          onClick={() => setSelectedMessageId(message.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedMessageId(message.id);
                            }
                          }}
                          className="group cursor-pointer transition hover:bg-white/[0.035] focus-visible:bg-white/[0.05] focus-visible:outline-none"
                        >
                          <td className="max-w-[200px] px-5 py-3.5 sm:px-6">
                            <div className="flex items-center gap-3">
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-[10px] font-semibold text-gold-light">
                                {getInitials(message)}
                              </span>
                              <span className="min-w-0">
                                <span
                                  className={cn(
                                    "block truncate text-xs",
                                    message.labels.includes("UNREAD")
                                      ? "font-semibold text-foreground"
                                      : "font-medium text-foreground/80",
                                  )}
                                >
                                  {message.sender.name || message.sender.email || "Unknown sender"}
                                </span>
                                <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                                  {message.sender.email}
                                </span>
                              </span>
                            </div>
                          </td>
                          <td className="max-w-[260px] px-4 py-3.5">
                            <span
                              className={cn(
                                "block truncate text-xs",
                                message.labels.includes("UNREAD")
                                  ? "font-semibold text-foreground"
                                  : "text-foreground/80",
                              )}
                            >
                              {message.subject}
                            </span>
                            <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                              {message.snippet}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex max-w-[190px] flex-wrap gap-1">
                              {message.labels.slice(0, 3).map((label) => (
                                <span
                                  key={label}
                                  className={cn(
                                    "rounded-full border px-2 py-0.5 text-[9px] leading-4",
                                    labelStyles[label] ??
                                      "border-border bg-white/[0.04] text-muted-foreground",
                                  )}
                                >
                                  {readableLabel(label)}
                                </span>
                              ))}
                              {message.labels.length > 3 && (
                                <span className="px-1 py-0.5 text-[9px] text-muted-foreground">
                                  +{message.labels.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-[10px] tabular-nums text-muted-foreground">
                            {formatDate(message.date)}
                          </td>
                          <td className="px-5 py-3.5 text-right sm:px-6">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedMessageId(message.id);
                              }}
                              className="rounded-lg border border-transparent px-2.5 py-1.5 text-[10px] text-muted-foreground transition hover:border-gold/25 hover:bg-gold/[0.06] hover:text-gold-light group-hover:border-border/70"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-5 py-3.5 sm:px-6">
                <p className="text-[11px] text-muted-foreground">
                  Halaman {pageNumber}
                  {total > 0 && ` · ${total.toLocaleString("id-ID")} hasil`}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goToPreviousPage}
                    disabled={pageTokens.length === 0 || messagesQuery.isFetching}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/80 px-3 text-xs text-muted-foreground transition hover:border-gold/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft aria-hidden="true" className="size-3.5" />
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={goToNextPage}
                    disabled={!messagesQuery.data?.nextPageToken || messagesQuery.isFetching}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gold/25 bg-gold/[0.06] px-3 text-xs text-gold-light transition hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight aria-hidden="true" className="size-3.5" />
                  </button>
                </div>
              </footer>
            </GlassCard>
          </div>

          <InboxAnalyticsSidebar
            messages={messages}
            isLoading={messagesQuery.isPending}
          />
        </div>
      </PageContainer>

      <EmailDetailDialog
        messageId={selectedMessageId}
        onClose={() => setSelectedMessageId(null)}
      />
    </>
  );
}

export function InboxExplorer() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <div className="skeleton-shimmer h-12 w-64 rounded-xl" />
          <div className="skeleton-shimmer mt-8 h-[32rem] rounded-2xl" />
        </PageContainer>
      }
    >
      <InboxExplorerContent />
    </Suspense>
  );
}
