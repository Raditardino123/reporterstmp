import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { CredentialsSignInForm } from "@/components/auth/credentials-sign-in-form";
import { CursorGlow } from "@/components/cursor-glow";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke GmailReporter dengan akun Google atau email Anda.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Masuk | GmailReporter",
    description:
      "Masuk secara aman dengan akun Google atau email untuk menganalisis Gmail.",
  },
};

const particles = [
  "left-[10%] top-[18%] size-1",
  "left-[18%] top-[72%] size-1.5",
  "left-[28%] top-[38%] size-1",
  "left-[39%] top-[13%] size-1.5",
  "left-[48%] top-[83%] size-1",
  "left-[61%] top-[25%] size-1",
  "left-[73%] top-[70%] size-1.5",
  "left-[84%] top-[34%] size-1",
  "left-[92%] top-[84%] size-1",
  "left-[7%] top-[90%] size-1",
  "left-[89%] top-[10%] size-1.5",
  "left-[55%] top-[55%] size-1",
];

type LoginPageProps = {
  searchParams: {
    callbackUrl?: string | string[];
    registered?: string | string[];
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const requestedCallbackUrl = Array.isArray(searchParams.callbackUrl)
    ? searchParams.callbackUrl[0]
    : searchParams.callbackUrl;
  const callbackUrl =
    requestedCallbackUrl?.startsWith("/") &&
    !requestedCallbackUrl.startsWith("//")
      ? requestedCallbackUrl
      : "/dashboard";
  const registered = Array.isArray(searchParams.registered)
    ? searchParams.registered[0]
    : searchParams.registered;

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-navy-deep px-6 py-16">
      <CursorGlow />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_42%,rgba(212,175,55,0.12),transparent_38%),linear-gradient(145deg,#111A2E_0%,#0A0F1F_54%,#070B16_100%)]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {particles.map((position, index) => (
          <span
            key={position}
            className={`gold-particle absolute rounded-full bg-gold shadow-[0_0_14px_rgba(212,175,55,0.85)] ${position}`}
            style={{ animationDelay: `${(index % 6) * -0.7}s` }}
          />
        ))}
      </div>

      <Link
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm text-ivory/60 transition hover:text-gold-light"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Kembali
      </Link>

      <section className="w-full max-w-md">
        <div className="glass-card gold-border relative overflow-hidden rounded-3xl p-8 shadow-glass sm:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-gold/10 blur-3xl"
          />
          <div className="relative">
            <div className="mb-8 flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold shadow-glow">
                <Mail aria-hidden="true" className="size-7" />
              </div>
            </div>

            <div className="text-center">
              <div className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-light">
                <Sparkles aria-hidden="true" className="size-3.5" />
                GmailReporter
              </div>
              <h1 className="font-display text-3xl tracking-tight text-ivory sm:text-4xl">
                Selamat datang kembali
              </h1>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-ivory/60">
                Insight berharga dari inbox Anda, disajikan dengan kejernihan
                dan elegansi.
              </p>
            </div>

            <div className="mt-8">
              <GoogleSignInButton callbackUrl={callbackUrl} />
            </div>

            <div className="my-6 flex items-center gap-3 text-xs text-ivory/40">
              <span className="h-px flex-1 bg-white/10" />
              Atau masuk dengan Email
              <span className="h-px flex-1 bg-white/10" />
            </div>

            {registered === "1" && (
              <p
                role="status"
                className="mb-4 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200"
              >
                Akun berhasil dibuat. Silakan masuk.
              </p>
            )}
            <CredentialsSignInForm callbackUrl={callbackUrl} />

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ivory/45">
              <LockKeyhole aria-hidden="true" className="size-3.5 text-gold/80" />
              Lindungi akun dan akses Gmail Anda
            </div>

            <p className="mt-5 text-center text-sm text-ivory/55">
              Belum memiliki akun?{" "}
              <Link
                href="/register"
                className="font-medium text-gold-light hover:text-gold"
              >
                Daftar
              </Link>
            </p>

            <p className="mt-8 text-center text-xs leading-5 text-ivory/35">
              Dengan melanjutkan, Anda mengizinkan GmailReporter membaca pesan
              Gmail untuk membuat laporan.
            </p>
          </div>
        </div>
        <p className="mt-6 text-center text-xs tracking-wide text-ivory/35">
          PRIVATE BY DESIGN <span className="mx-2 text-gold/60">·</span> YOUR
          INBOX, INSIGHTFULLY
        </p>
      </section>
    </main>
  );
}
