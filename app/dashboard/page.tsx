import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageContainer } from "@/components/dashboard/page-container";
import { BadgePremium } from "@/components/design-system/badge-premium";
import { GmailOverview } from "@/components/dashboard/gmail-overview";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Ringkasan premium aktivitas email dan insight Gmail Anda.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Dashboard | GmailReporter",
    description: "Ringkasan aktivitas dan insight inbox Gmail Anda.",
  },
};

export default function DashboardPage() {
  return (
    <PageContainer>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <BadgePremium>Inbox intelligence</BadgePremium>
          <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
            Good morning.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Ringkasan aktivitas Gmail dan insight terbaru Anda.
          </p>
        </div>
        <Link
          href="/dashboard/inbox"
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-gold/25 bg-gold/5 px-4 text-sm font-medium text-gold transition hover:bg-gold/10 sm:self-auto"
        >
          Lihat insight <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <GmailOverview />
    </PageContainer>
  );
}
