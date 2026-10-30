"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

type ErrorFallbackProps = {
  error: Error & { digest?: string };
  reset: () => void;
  dashboard?: boolean;
};

export function ErrorFallback({
  error,
  reset,
  dashboard = false,
}: ErrorFallbackProps) {
  useEffect(() => {
    console.error("GmailReporter page error:", error);
  }, [error]);

  return (
    <main className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-5 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-premium-glow"
      />
      <section className="glass-card gold-border relative w-full max-w-xl rounded-3xl p-7 text-center shadow-glass sm:p-10">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold shadow-glow">
          <AlertTriangle aria-hidden="true" className="size-6" />
        </span>
        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
          A momentary interruption
        </p>
        <h1 className="mt-3 font-display text-3xl">We’ll get you back on track.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Halaman ini mengalami kendala sementara. Coba muat ulang, atau kembali
          ke overview GmailReporter.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[10px] text-muted-foreground/70">
            Reference: {error.digest}
          </p>
        )}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gold-sheen px-4 text-xs font-semibold text-navy-deep shadow-gold transition hover:brightness-110"
          >
            <RefreshCw aria-hidden="true" className="size-3.5" />
            Coba lagi
          </button>
          <Link
            href={dashboard ? "/dashboard" : "/"}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-xs text-muted-foreground transition hover:border-gold/30 hover:text-foreground"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            {dashboard ? "Ke dashboard" : "Kembali ke beranda"}
          </Link>
        </div>
      </section>
    </main>
  );
}
