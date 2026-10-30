import type { Metadata } from "next";
import {
  ArrowUpRight,
  BarChart3,
  Check,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { BadgePremium } from "@/components/design-system/badge-premium";
import { GlassCard } from "@/components/design-system/glass-card";
import { GoldButton } from "@/components/design-system/gold-button";
import { SectionTitle } from "@/components/design-system/section-title";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Design System",
  description: "Komponen Playful Minimalist GmailReporter.",
  openGraph: {
    title: "Design System | GmailReporter",
    description: "Design language cerah, sederhana, dan mudah digunakan.",
  },
};

const colors = [
  { name: "Sunny Yellow", value: "#FFCC00", className: "bg-gold" },
  { name: "Clean White", value: "#FFFFFF", className: "bg-white" },
  { name: "Bold Black", value: "#000000", className: "bg-black" },
];

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a href="/" className="flex items-center gap-3" aria-label="GmailReporter home">
          <span className="flex size-10 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold">
            <Mail aria-hidden="true" className="size-5" />
          </span>
          <span className="font-display text-lg">GmailReporter</span>
        </a>
      </header>

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-12 lg:px-10 lg:pt-20">
        <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <BadgePremium>
              <Sparkles aria-hidden="true" className="size-3" />
              A brighter way to care
            </BadgePremium>
            <h1 className="mt-7 max-w-3xl font-display text-5xl leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Kejelasan dalam setiap{" "}
              <span className="text-gold">percakapan.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Tampilan sederhana, ceria, dan mudah dipahami untuk pengalaman
              GmailReporter sehari-hari.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <GoldButton>
                Jelajahi laporan
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </GoldButton>
              <GoldButton variant="outline">Lihat dokumentasi</GoldButton>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck aria-hidden="true" className="size-4 text-gold" />
              Private by design · Read-only access
            </div>
          </div>

          <GlassCard goldBorder className="relative overflow-hidden p-6 sm:p-8">
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inbox overview</p>
                <h2 className="mt-2 font-display text-2xl">Weekly intelligence</h2>
              </div>
              <BadgePremium>Live report</BadgePremium>
            </div>
            <div className="relative mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-xl border-2 border-black bg-white p-4">
                <p className="text-xs text-muted-foreground">Messages reviewed</p>
                <p className="mt-2 text-3xl font-semibold">2,481</p>
                <p className="mt-2 text-xs text-gold-light">+12.8% this week</p>
              </div>
              <div className="rounded-xl border-2 border-black bg-white p-4">
                <p className="text-xs text-muted-foreground">Focus score</p>
                <p className="mt-2 text-3xl font-semibold">94<span className="text-base text-muted-foreground">/100</span></p>
                <p className="mt-2 text-xs text-gold-light">Excellent clarity</p>
              </div>
            </div>
            <div className="relative mt-4 rounded-xl border-2 border-black bg-white p-4">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-medium">Email activity</p>
                <span className="text-xs text-muted-foreground">Last 7 days</span>
              </div>
              <div className="flex h-24 items-end gap-2">
                {[42, 68, 51, 84, 60, 94, 72, 100, 64, 82, 57, 91].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t-sm bg-gold"
                      style={{ height: `${height}%`, opacity: 0.55 + index * 0.035 }}
                    />
                  ),
                )}
              </div>
            </div>
          </GlassCard>
        </section>

        <section className="mt-28">
          <SectionTitle
            eyebrow="Visual language"
            title="Cerah. Sederhana. Berkarakter."
            description="Kuning cerah, putih, hitam, dan tipografi yang jelas membentuk bahasa visual yang konsisten."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {colors.map((color) => (
              <GlassCard key={color.name} className="p-4">
                <div
                  className={`h-24 rounded-xl border-2 border-black ${color.className}`}
                />
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm font-medium">{color.name}</p>
                  <span className="font-mono text-xs text-muted-foreground">
                    {color.value}
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        <section className="mt-28">
          <SectionTitle
            eyebrow="Component library"
            title="Sederhana. Konsisten. Berkarakter."
            description="Komponen dasar untuk menyusun pengalaman GmailReporter."
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <Card className="p-6">
              <p className="mb-5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Actions
              </p>
              <div className="flex flex-wrap gap-3">
                <Button>
                  Buat laporan <ArrowUpRight aria-hidden="true" className="size-4" />
                </Button>
                <Button variant="outline">Pelajari</Button>
              </div>
            </Card>
            <GlassCard className="p-6">
              <p className="mb-5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Status
              </p>
              <div className="flex flex-wrap gap-2">
                <BadgePremium>
                  <Sparkles aria-hidden="true" className="size-3" />
                  Premium
                </BadgePremium>
                <BadgePremium className="border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                  <Check aria-hidden="true" className="size-3" />
                  Synced
                </BadgePremium>
              </div>
            </GlassCard>
            <Card className="p-6">
              <p className="mb-5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Typography
              </p>
              <p className="font-display text-3xl">Built for bright ideas.</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Poppins memberi heading karakter tegas; Inter menjaga teks
                antarmuka tetap nyaman dibaca.
              </p>
              <Input
                aria-label="Contoh input"
                placeholder="Contoh input"
                className="mt-4"
              />
            </Card>
          </div>
        </section>

        <section className="mt-28">
          <GlassCard
            goldBorder
            className="flex flex-col items-start justify-between gap-6 p-7 sm:flex-row sm:items-center sm:p-10"
          >
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <BarChart3 aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="font-display text-2xl">Insight yang lebih bermakna.</p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Gunakan design system ini untuk menghadirkan laporan email
                  dengan nuansa yang konsisten dan eksklusif.
                </p>
              </div>
            </div>
            <GoldButton className="shrink-0">
              Mulai sekarang <ArrowUpRight aria-hidden="true" className="size-4" />
            </GoldButton>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}
