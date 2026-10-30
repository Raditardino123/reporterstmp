import type { GeneratedReport } from "@/lib/reports";

const storageKey = "gmailreporter-report-history";
const maxSavedReports = 20;

export function readReportHistory(): GeneratedReport[] {
  const value = window.localStorage.getItem(storageKey);
  if (!value) return [];

  const parsed: unknown = JSON.parse(value);
  if (
    !Array.isArray(parsed) ||
    !parsed.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as GeneratedReport).id === "string" &&
        typeof (item as GeneratedReport).createdAt === "string",
    )
  ) {
    throw new Error("Riwayat laporan tersimpan memiliki format yang tidak valid.");
  }

  return parsed as GeneratedReport[];
}

export function saveReportToHistory(report: GeneratedReport): GeneratedReport[] {
  const history = readReportHistory().filter((item) => item.id !== report.id);
  const next = [report, ...history].slice(0, maxSavedReports);
  window.localStorage.setItem(storageKey, JSON.stringify(next));
  return next;
}

export function findSavedReport(id: string): GeneratedReport | null {
  return readReportHistory().find((report) => report.id === id) ?? null;
}
