"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, LoaderCircle, Mail, Sparkles } from "lucide-react";
import { CursorGlow } from "@/components/cursor-glow";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Pendaftaran gagal. Silakan coba lagi.");
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Tidak dapat terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-navy-deep px-6 py-16">
      <CursorGlow />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_42%,rgba(212,175,55,0.12),transparent_38%),linear-gradient(145deg,#111A2E_0%,#0A0F1F_54%,#070B16_100%)]"
      />

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
            <div className="mb-7 flex justify-center">
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
                Buat akun Anda
              </h1>
              <p className="mt-3 text-sm leading-6 text-ivory/60">
                Mulai perjalanan insight inbox Anda dengan aman.
              </p>
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="register-name"
                  className="mb-2 block text-sm font-medium text-ivory/80"
                >
                  Nama
                </label>
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={80}
                  className="h-12 w-full rounded-xl border border-white/15 bg-navy-deep/65 px-4 text-sm text-ivory outline-none transition placeholder:text-ivory/35 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <label
                  htmlFor="register-email"
                  className="mb-2 block text-sm font-medium text-ivory/80"
                >
                  Email
                </label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  className="h-12 w-full rounded-xl border border-white/15 bg-navy-deep/65 px-4 text-sm text-ivory outline-none transition placeholder:text-ivory/35 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                  placeholder="nama@email.com"
                />
              </div>
              <div>
                <label
                  htmlFor="register-password"
                  className="mb-2 block text-sm font-medium text-ivory/80"
                >
                  Password
                </label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={72}
                  className="h-12 w-full rounded-xl border border-white/15 bg-navy-deep/65 px-4 text-sm text-ivory outline-none transition placeholder:text-ivory/35 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                  placeholder="8 hingga 72 byte"
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-300">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-navy-deep shadow-gold transition hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep disabled:cursor-wait disabled:opacity-70"
              >
                {isLoading && (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                )}
                {isLoading ? "Membuat akun..." : "Daftar"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-ivory/55">
              Sudah memiliki akun?{" "}
              <Link
                href="/login"
                className="font-medium text-gold-light hover:text-gold"
              >
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
