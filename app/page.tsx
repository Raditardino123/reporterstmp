import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CursorGlow } from "@/components/cursor-glow";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Private Inbox Intelligence",
  description:
    "Ubah aktivitas Gmail menjadi insight dan laporan yang jernih dengan GmailReporter.",
  openGraph: {
    title: "GmailReporter — Private Inbox Intelligence",
    description:
      "Ubah aktivitas Gmail menjadi insight dan laporan yang jernih.",
  },
};

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <CursorGlow />
      <section className="relative mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Mail aria-hidden="true" className="size-7" />
        </div>
        <p className="mb-3 text-sm font-medium text-primary">GmailReporter</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Ringkasan Gmail, lebih mudah dipahami.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Hubungkan Gmail untuk mulai melihat insight dan laporan email Anda.
        </p>
        <Button asChild className="mt-8">
          <Link href="/dashboard">
            Buka dashboard <ArrowRight aria-hidden="true" className="ml-2 size-4" />
          </Link>
        </Button>
      </section>
    </main>
  );
}
