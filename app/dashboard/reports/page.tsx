import type { Metadata } from "next";
import { FileText, ShieldCheck } from "lucide-react";
import { PageContainer } from "@/components/dashboard/page-container";
import { ReportGenerator } from "@/components/reports/report-generator";

export const metadata: Metadata = {
  title: "Reports",
  description: "Buat laporan analitik email Gmail.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Reports | GmailReporter",
    description: "Buat laporan premium dari aktivitas email Gmail Anda.",
  },
};

export default function ReportsPage() {
  return (
    <PageContainer className="max-w-[1200px]">
      <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-light">
            <FileText aria-hidden="true" className="size-3.5" />
            Curated intelligence
          </div>
          <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
            Reports
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Ubah aktivitas inbox menjadi laporan yang jernih, terstruktur, dan
            siap dibagikan.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <ShieldCheck aria-hidden="true" className="size-4 text-gold" />
          Gmail read-only · Private to your account
        </div>
      </header>
      <ReportGenerator />
    </PageContainer>
  );
}
