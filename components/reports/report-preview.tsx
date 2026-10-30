"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  FileQuestion,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { GlassCard } from "@/components/design-system/glass-card";
import { EmptyState } from "@/components/empty-state";
import { PageContainer } from "@/components/dashboard/page-container";
import { findSavedReport } from "@/lib/report-storage";
import type { GeneratedReport } from "@/lib/reports";

const ReportActivityChart = dynamic(
  () =>
    import("@/components/reports/report-activity-chart").then(
      (module) => module.ReportActivityChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        aria-label="Memuat grafik laporan"
        className="skeleton-shimmer mt-4 h-56 rounded-xl"
      />
    ),
  },
);

function formatDate(value: string, options: Intl.DateTimeFormatOptions = {}) {
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
    ...options,
  }).format(date);
}

type ReportPreviewProps = {
  reportId: string;
};

export function ReportPreview({ reportId }: ReportPreviewProps) {
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    try {
      setReport(findSavedReport(reportId));
    } catch (readError) {
      setError(
        readError instanceof Error
          ? readError.message
          : "Laporan tidak dapat dibaca.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  async function downloadReport() {
    if (!report) return;
    setIsDownloading(true);
    try {
      const savedDownload = window.sessionStorage.getItem(
        `gmailreporter-download-${report.id}`,
      );
      if (savedDownload) {
        const parsed = JSON.parse(savedDownload) as {
          downloadUrl?: string;
          fileName?: string;
        };
        if (parsed.downloadUrl && parsed.fileName) {
          const anchor = document.createElement("a");
          anchor.href = parsed.downloadUrl;
          anchor.download = parsed.fileName;
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          return;
        }
      }

      const { createReportFile } = await import("@/lib/report-files");
      const blob = createReportFile(report, report.format);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `gmailreporter-${report.period.startDate}-${report.period.endDate}.${report.format}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "File laporan gagal dibuat.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="skeleton-shimmer h-[32rem] rounded-3xl" />
      </PageContainer>
    );
  }

  if (error || !report) {
    return (
      <PageContainer>
        <GlassCard className="mx-auto max-w-xl p-8 text-center">
          <div role={error ? "alert" : "status"}>
            <EmptyState
              icon={FileQuestion}
              title="Report not found."
              description={
                error ||
                "Laporan ini tidak ditemukan di riwayat lokal perangkat ini."
              }
              action={
                <Link
                  href="/dashboard/reports"
                  className="inline-flex items-center gap-2 text-sm text-gold-light"
                >
                  <ArrowLeft aria-hidden="true" className="size-4" />
                  Kembali ke Reports
                </Link>
              }
            />
          </div>
        </GlassCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-[1200px]">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground transition hover:text-gold-light"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Report archive
        </Link>
        <button
          type="button"
          onClick={() => void downloadReport()}
          disabled={isDownloading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gold-sheen px-4 text-xs font-semibold text-navy-deep shadow-gold transition hover:brightness-110 disabled:opacity-60"
        >
          <Download aria-hidden="true" className="size-3.5" />
          {isDownloading ? "Preparing..." : `Download ${report.format.toUpperCase()}`}
        </button>
      </div>

      <article className="overflow-hidden rounded-[1.75rem] border border-gold/20 bg-[#0A0F1F] text-[#F5F1E8] shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
        <header className="relative isolate min-h-[420px] overflow-hidden border-b border-gold/15 px-7 py-9 sm:px-12 sm:py-12 lg:px-16">
          <div className="absolute inset-4 -z-10 rounded-[1.4rem] border border-gold/20 sm:inset-6" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-[#D4AF37]">
                <Mail aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="font-display text-sm tracking-wide">GmailReporter</p>
                <p className="mt-0.5 text-[8px] uppercase tracking-[0.22em] text-[#B6B2A7]">
                  Private inbox intelligence
                </p>
              </div>
            </div>
            <span className="rounded-full border border-gold/25 px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-[#E8CC70]">
              Confidential report
            </span>
          </div>

          <div className="mt-20 max-w-3xl sm:mt-24">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">
              Communication intelligence · {report.format.toUpperCase()} edition
            </p>
            <h1 className="mt-5 font-display text-4xl leading-[1.08] tracking-tight sm:text-6xl">
              Your inbox,
              <br />
              <span className="text-[#D4AF37]">in perspective.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-[#B6B2A7]">
              A considered view of your communication landscape, prepared
              exclusively for your account.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t border-gold/20 pt-5">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#B6B2A7]">
                Reporting period
              </p>
              <p className="mt-1.5 font-display text-lg">
                {formatDate(report.period.startDate)} — {formatDate(report.period.endDate)}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#B6B2A7]">
                Prepared
              </p>
              <p className="mt-1.5 text-xs">
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "long",
                  timeStyle: "short",
                }).format(new Date(report.createdAt))}
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-8 bg-[#0D1425] px-5 py-7 sm:px-10 sm:py-10 lg:px-14">
          {report.truncated && (
            <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3 text-xs leading-5 text-amber-200">
              Laporan ini dibatasi hingga 1.000 email. Persempit rentang tanggal
              untuk analisis yang lebih lengkap.
            </div>
          )}

          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">
                  01 · Executive summary
                </p>
                <h2 className="mt-2 font-display text-2xl">The essential figures</h2>
              </div>
              <span className="hidden items-center gap-1.5 text-[10px] text-[#B6B2A7] sm:flex">
                <ShieldCheck aria-hidden="true" className="size-3.5 text-[#D4AF37]" />
                Read-only source
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Total emails", report.summary.total],
                ["Unread", report.summary.unread],
                ["Starred", report.summary.starred],
                ["Important", report.summary.important],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4"
                >
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#A7A9B2]">
                    {label}
                  </p>
                  <p className="mt-3 font-display text-3xl tabular-nums text-[#F5F1E8]">
                    {Number(value).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                02 · Daily cadence
              </p>
              <h2 className="mt-2 font-display text-xl">Messages over time</h2>
              <ReportActivityChart data={report.perDay} />
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                03 · Subject vocabulary
              </p>
              <h2 className="mt-2 font-display text-xl">Top keywords</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {report.topKeywords.length ? (
                  report.topKeywords.slice(0, 14).map((item, index) => (
                    <span
                      key={item.keyword}
                      className="rounded-full border px-3 py-1.5 text-xs"
                      style={{
                        borderColor: `rgba(212,175,55,${0.12 + Math.max(0, 5 - index) * 0.035})`,
                        backgroundColor: `rgba(212,175,55,${0.035 + Math.max(0, 5 - index) * 0.012})`,
                        color: index < 3 ? "#E8CC70" : "#C3C0B7",
                      }}
                    >
                      {item.keyword}
                      <span className="ml-1.5 text-[9px] opacity-60">{item.count}</span>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-[#A7A9B2]">Tidak ada kata kunci menonjol.</p>
                )}
              </div>
              <p className="mt-5 text-[10px] leading-5 text-[#9295A0]">
                Frequent terms from message subjects, excluding common
                connective words.
              </p>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
              <div className="border-b border-white/[0.08] px-5 py-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                  04 · Correspondence
                </p>
                <h2 className="mt-1.5 font-display text-xl">Leading senders</h2>
              </div>
              {report.perSender.length ? (
                <div className="divide-y divide-white/[0.06]">
                  {report.perSender.slice(0, 8).map((sender, index) => (
                    <div
                      key={sender.email || sender.name}
                      className="flex items-center justify-between gap-4 px-5 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="text-[9px] tabular-nums text-[#D4AF37]/70">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-[#F5F1E8]">
                            {sender.name}
                          </p>
                          <p className="mt-0.5 truncate text-[10px] text-[#9295A0]">
                            {sender.email}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs tabular-nums text-[#E8CC70]">
                        {sender.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-5 text-xs text-[#A7A9B2]">Belum ada data pengirim.</p>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
              <div className="border-b border-white/[0.08] px-5 py-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                  05 · Classification
                </p>
                <h2 className="mt-1.5 font-display text-xl">Labels & categories</h2>
              </div>
              {report.perLabel.length ? (
                <div className="divide-y divide-white/[0.06]">
                  {report.perLabel.slice(0, 8).map((label) => (
                    <div
                      key={label.id}
                      className="flex items-center justify-between gap-3 px-5 py-3"
                    >
                      <span className="truncate text-xs text-[#C3C0B7]">
                        {label.name.replace(/^CATEGORY_/, "").replace(/_/g, " ")}
                      </span>
                      <span className="text-xs tabular-nums text-[#E8CC70]">
                        {label.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-5 text-xs text-[#A7A9B2]">Belum ada label pada pesan.</p>
              )}
            </div>
          </section>

          <footer className="flex flex-col justify-between gap-3 border-t border-gold/15 pt-5 text-[9px] uppercase tracking-[0.14em] text-[#9295A0] sm:flex-row">
            <span>GmailReporter · Private inbox intelligence</span>
            <span>Confidential · Generated {formatDate(report.createdAt.slice(0, 10))}</span>
          </footer>
        </div>
      </article>
    </PageContainer>
  );
}
