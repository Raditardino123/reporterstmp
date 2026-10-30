import type { Metadata } from "next";
import { ReportPreview } from "@/components/reports/report-preview";

export const metadata: Metadata = {
  title: "Report preview",
  description: "Preview laporan analitik email personal GmailReporter.",
  robots: { index: false, follow: false },
};

type ReportPreviewPageProps = {
  params: {
    reportId: string;
  };
};

export default function ReportPreviewPage({ params }: ReportPreviewPageProps) {
  return <ReportPreview reportId={params.reportId} />;
}
