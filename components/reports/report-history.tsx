"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, FileSpreadsheet, FileText } from "lucide-react";
import { GlassCard } from "@/components/design-system/glass-card";
import { EmptyState } from "@/components/empty-state";
import { readReportHistory } from "@/lib/report-storage";
import type { GeneratedReport } from "@/lib/reports";
import { Archive } from "lucide-react";

type ReportHistoryProps = {
  refreshKey: number;
};

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ReportHistory({ refreshKey }: ReportHistoryProps) {
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      setReports(readReportHistory());
      setError("");
    } catch (readError) {
      setError(
        readError instanceof Error
          ? readError.message
          : "Riwayat laporan tidak dapat dibaca.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [refreshKey]);

  return (
    <GlassCard className="p-5 sm:p-7">
      <div className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
          Archive
        </p>
        <h2 className="mt-2 font-display text-2xl">Report history</h2>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : isLoading ? (
        <div aria-label="Memuat riwayat laporan" className="skeleton-shimmer h-32 rounded-xl" />
      ) : reports.length ? (
        <ul className="divide-y divide-border/60">
          {reports.map((report) => (
            <li
              key={report.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-gold/[0.06] text-gold">
                  {report.format === "csv" ? (
                    <FileSpreadsheet aria-hidden="true" className="size-4" />
                  ) : (
                    <FileText aria-hidden="true" className="size-4" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    Email Intelligence · {report.period.startDate} – {report.period.endDate}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {report.summary.total.toLocaleString("id-ID")} email ·{" "}
                    {report.format.toUpperCase()} · {formatCreatedAt(report.createdAt)}
                  </p>
                </div>
              </div>
              <Link
                href={`/dashboard/reports/${encodeURIComponent(report.id)}`}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-border px-3 text-xs text-muted-foreground transition hover:border-gold/30 hover:text-gold-light sm:self-auto"
              >
                Buka preview
                <ArrowUpRight aria-hidden="true" className="size-3.5" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Archive}
          title="Your archive awaits."
          description="Laporan yang Anda buat akan tersimpan di sini untuk dibuka kembali kapan saja."
          compact
        />
      )}
    </GlassCard>
  );
}
