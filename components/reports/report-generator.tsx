"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  Check,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { useLabels } from "@/hooks/use-gmail";
import { GlassCard } from "@/components/design-system/glass-card";
import { ReportHistory } from "@/components/reports/report-history";
import { saveReportToHistory } from "@/lib/report-storage";
import { toast } from "sonner";
import type {
  GeneratedReport,
  ReportFilter,
  ReportFormat,
  ReportGenerateRequest,
} from "@/lib/reports";
import { cn } from "@/lib/utils";

type GenerateResponse = {
  report: GeneratedReport;
  fileName: string;
  mimeType: string;
  downloadUrl: string;
  error?: {
    message?: string;
  };
};

function localDate(daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const formats: Array<{
  value: ReportFormat;
  label: string;
  description: string;
  icon: typeof FileText;
}> = [
  { value: "pdf", label: "PDF", description: "Editorial report", icon: FileText },
  {
    value: "csv",
    label: "CSV",
    description: "Spreadsheet ready",
    icon: FileSpreadsheet,
  },
  { value: "json", label: "JSON", description: "Structured data", icon: FileJson },
];

export function ReportGenerator() {
  const router = useRouter();
  const labelsQuery = useLabels();
  const [startDate, setStartDate] = useState(() => localDate(30));
  const [endDate, setEndDate] = useState(() => localDate());
  const [labelId, setLabelId] = useState("");
  const [filter, setFilter] = useState<ReportFilter>("all");
  const [format, setFormat] = useState<ReportFormat>("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [historyVersion, setHistoryVersion] = useState(0);

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!startDate || !endDate || startDate > endDate) {
      setError("Pilih rentang tanggal yang valid.");
      return;
    }
    if (labelsQuery.isError) {
      setError("Daftar label Gmail belum tersedia. Muat ulang halaman lalu coba lagi.");
      return;
    }

    const requestBody: ReportGenerateRequest = {
      period: { startDate, endDate },
      labelId: labelId || undefined,
      filter,
      format,
    };

    setIsGenerating(true);
    const toastId = toast.loading("Menganalisis email dan menyusun laporan...");
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = (await response.json()) as GenerateResponse;
      if (!response.ok) {
        throw new Error(result.error?.message ?? "Laporan tidak dapat dibuat.");
      }

      saveReportToHistory(result.report);
      window.sessionStorage.setItem(
        `gmailreporter-download-${result.report.id}`,
        JSON.stringify({
          downloadUrl: result.downloadUrl,
          fileName: result.fileName,
          mimeType: result.mimeType,
        }),
      );
      setHistoryVersion((version) => version + 1);
      toast.success("Laporan berhasil dibuat.", {
        description: `${result.report.summary.total.toLocaleString("id-ID")} email dianalisis.`,
      });
      router.push(`/dashboard/reports/${encodeURIComponent(result.report.id)}`);
    } catch (generateError) {
      const message =
        generateError instanceof Error
          ? generateError.message
          : "Laporan tidak dapat dibuat. Periksa koneksi lalu coba lagi.";
      toast.error("Laporan gagal dibuat.", { description: message });
      setError(
        message,
      );
    } finally {
      toast.dismiss(toastId);
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-7">
      <GlassCard goldBorder className="relative overflow-hidden p-5 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-gold/[0.08] blur-3xl"
        />
        <div className="relative mb-7 flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold shadow-glow">
            <Sparkles aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
              Curated intelligence
            </p>
            <h2 className="mt-2 font-display text-2xl">Configure your report</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pilih periode dan fokus analisis untuk laporan Anda.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="relative space-y-7">
          <section aria-labelledby="report-period-heading">
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays aria-hidden="true" className="size-4 text-gold" />
              <h3
                id="report-period-heading"
                className="text-xs font-semibold uppercase tracking-[0.13em]"
              >
                Reporting period
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <label className="block">
                <span className="mb-1.5 block text-[11px] text-muted-foreground">
                  From
                </span>
                <input
                  type="date"
                  required
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="h-12 w-full rounded-xl border border-gold/15 bg-background/65 px-3 text-sm text-foreground outline-none transition focus:border-gold/45 focus:ring-2 focus:ring-gold/10"
                />
              </label>
              <span className="hidden pt-6 text-xs text-muted-foreground sm:block">
                through
              </span>
              <label className="block">
                <span className="mb-1.5 block text-[11px] text-muted-foreground">
                  To
                </span>
                <input
                  type="date"
                  required
                  value={endDate}
                  min={startDate || undefined}
                  max={localDate()}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="h-12 w-full rounded-xl border border-gold/15 bg-background/65 px-3 text-sm text-foreground outline-none transition focus:border-gold/45 focus:ring-2 focus:ring-gold/10"
                />
              </label>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.13em]">
                Gmail label
              </span>
              <select
                value={labelId}
                onChange={(event) => setLabelId(event.target.value)}
                disabled={labelsQuery.isPending || labelsQuery.isError}
                className="h-12 w-full rounded-xl border border-border/80 bg-background/65 px-3 text-sm text-foreground outline-none transition focus:border-gold/40 disabled:opacity-60"
              >
                <option value="">
                  {labelsQuery.isPending ? "Memuat label..." : "All labels"}
                </option>
                {(labelsQuery.data ?? []).map((label) => (
                  <option key={label.id} value={label.id}>
                    {label.name}
                  </option>
                ))}
              </select>
              {labelsQuery.isError && (
                <span className="mt-1.5 block text-[11px] text-destructive">
                  {labelsQuery.error.message}
                </span>
              )}
              {labelsQuery.isPending && (
                <span
                  aria-label="Memuat daftar label"
                  className="skeleton-shimmer mt-2 block h-1.5 w-full rounded-full"
                />
              )}
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.13em]">
                Message filter
              </span>
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value as ReportFilter)}
                className="h-12 w-full rounded-xl border border-border/80 bg-background/65 px-3 text-sm text-foreground outline-none transition focus:border-gold/40"
              >
                <option value="all">All messages</option>
                <option value="unread">Unread</option>
                <option value="starred">Starred</option>
                <option value="important">Important</option>
                <option value="attachment">Has attachment</option>
              </select>
            </label>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.13em]">
              Export format
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {formats.map(({ value, label, description, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={format === value}
                  onClick={() => setFormat(value)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3.5 text-left transition",
                    format === value
                      ? "border-gold/40 bg-gold/[0.08] shadow-[0_0_24px_rgba(212,175,55,0.07)]"
                      : "border-border/80 bg-white/[0.02] hover:border-gold/25 hover:bg-white/[0.04]",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      format === value
                        ? "bg-gold/15 text-gold"
                        : "bg-white/[0.05] text-muted-foreground",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">
                      {description}
                    </span>
                  </span>
                  {format === value && (
                    <Check aria-hidden="true" className="ml-auto size-4 text-gold" />
                  )}
                </button>
              ))}
            </div>
          </section>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-xs text-foreground"
            >
              <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
              {error}
            </div>
          )}

          <div className="flex flex-col justify-between gap-4 border-t border-border/60 pt-5 sm:flex-row sm:items-center">
            <p className="text-[11px] leading-5 text-muted-foreground">
              Maksimal 1.000 email per laporan agar proses tetap stabil.
            </p>
            <button
              type="submit"
              disabled={isGenerating || labelsQuery.isPending}
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-gold-sheen px-6 text-sm font-semibold text-navy-deep shadow-gold transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                  Generating report...
                </>
              ) : (
                <>
                  <Download aria-hidden="true" className="size-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </form>
      </GlassCard>

      <ReportHistory refreshKey={historyVersion} />
    </div>
  );
}
