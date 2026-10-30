"use client";

import { useState, type FormEvent } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Circle,
  LoaderCircle,
  Mail,
  Play,
  Terminal,
} from "lucide-react";
import { useLiveReport } from "@/hooks/use-live-report";

const MAX_LOOP_COUNT = 3;

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--:--";
  return date.toLocaleTimeString("id-ID", { hour12: false });
}

function logMessage(
  status: string,
  senderEmail: string,
  targetEmail: string,
) {
  if (status === "SENDING") {
    return `Mengirim via ${senderEmail} ke ${targetEmail}...`;
  }
  if (status === "SUCCESS") {
    return `Mengirim via ${senderEmail} ke ${targetEmail}... SUCCESS`;
  }
  if (status === "FAILED") {
    return `Mengirim via ${senderEmail} ke ${targetEmail}... FAILED`;
  }
  return `${status}: ${senderEmail} → ${targetEmail}`;
}

export function ReporterDashboard() {
  const { logs, isConnected, isSending, error: liveError } = useLiveReport();
  const [formMessage, setFormMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage(
      "Form siap, tetapi pengiriman belum diaktifkan: API/engine pengiriman belum tersedia. Tidak ada email yang dikirim.",
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-9 lg:py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">
          Reporter workspace
        </p>
        <h1 className="mt-2 font-display text-3xl text-ivory sm:text-4xl">
          Auto Reporter
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ivory/55">
          Atur konten laporan dan pantau aktivitas terbaru dari akun Anda.
        </p>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
        <section className="glass-card gold-border relative overflow-hidden rounded-3xl p-6 shadow-glass sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-gold/10 blur-3xl"
          />
          <div className="relative">
            <div className="mb-7 flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold shadow-glow">
                <Mail aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-light">
                  Report configuration
                </p>
                <h2 className="mt-1 font-display text-2xl text-ivory">
                  Buat Laporan Baru
                </h2>
                <p className="mt-1 text-sm text-ivory/55">
                  Loop dibatasi maksimal {MAX_LOOP_COUNT} untuk penggunaan
                  terkontrol.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="relative space-y-5">
              <div>
                <label
                  htmlFor="report-target-emails"
                  className="mb-2 block text-sm font-medium text-ivory/80"
                >
                  Target Email
                </label>
                <input
                  id="report-target-emails"
                  name="targetEmails"
                  type="text"
                  required
                  maxLength={1000}
                  placeholder="support@domain.com, 628xxx@c.us"
                  className="h-12 w-full rounded-xl border border-white/15 bg-navy-deep/65 px-4 text-sm text-ivory outline-none transition placeholder:text-ivory/35 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                />
                <p className="mt-2 text-xs text-ivory/40">
                  Pisahkan beberapa alamat dengan koma.
                </p>
              </div>

              <div>
                <label
                  htmlFor="report-subject"
                  className="mb-2 block text-sm font-medium text-ivory/80"
                >
                  Subject
                </label>
                <input
                  id="report-subject"
                  name="subject"
                  type="text"
                  required
                  maxLength={200}
                  placeholder="Subjek laporan"
                  className="h-12 w-full rounded-xl border border-white/15 bg-navy-deep/65 px-4 text-sm text-ivory outline-none transition placeholder:text-ivory/35 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                />
              </div>

              <div>
                <label
                  htmlFor="report-body"
                  className="mb-2 block text-sm font-medium text-ivory/80"
                >
                  Body
                </label>
                <textarea
                  id="report-body"
                  name="body"
                  required
                  maxLength={10000}
                  rows={7}
                  placeholder="Tulis isi laporan..."
                  className="w-full resize-y rounded-xl border border-white/15 bg-navy-deep/65 px-4 py-3 text-sm leading-6 text-ivory outline-none transition placeholder:text-ivory/35 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="report-loop-count"
                    className="mb-2 block text-sm font-medium text-ivory/80"
                  >
                    Loop Count
                  </label>
                  <input
                    id="report-loop-count"
                    name="loopCount"
                    type="number"
                    min={1}
                    max={MAX_LOOP_COUNT}
                    defaultValue={1}
                    required
                    className="h-12 w-full rounded-xl border border-white/15 bg-navy-deep/65 px-4 text-sm text-ivory outline-none transition focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="report-delay"
                    className="mb-2 block text-sm font-medium text-ivory/80"
                  >
                    Delay (Detik)
                  </label>
                  <input
                    id="report-delay"
                    name="delaySeconds"
                    type="number"
                    min={60}
                    max={3600}
                    defaultValue={60}
                    required
                    className="h-12 w-full rounded-xl border border-white/15 bg-navy-deep/65 px-4 text-sm text-ivory outline-none transition focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                  />
                </div>
              </div>
              <p className="text-xs leading-5 text-ivory/40">
                Batas form: maksimal {MAX_LOOP_COUNT} loop dan jeda minimal 60
                detik. Validasi server juga diperlukan sebelum pengiriman
                diaktifkan.
              </p>

              {formMessage && (
                <p
                  role="status"
                  className="flex gap-2 rounded-xl border border-gold/20 bg-gold/[0.06] px-4 py-3 text-sm leading-6 text-gold-light"
                >
                  <AlertCircle
                    aria-hidden="true"
                    className="mt-1 size-4 shrink-0"
                  />
                  {formMessage}
                </p>
              )}

              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 text-base font-semibold text-navy-deep shadow-gold transition hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep"
              >
                <Play aria-hidden="true" className="size-5 fill-current" />
                Mulai Laporan
              </button>
              <p className="text-center text-xs text-ivory/40">
                Tombol saat ini hanya memvalidasi tampilan form; tidak memulai
                pengiriman.
              </p>
            </form>
          </div>
        </section>

        <section
          id="live-monitor"
          className="glass-card gold-border scroll-mt-24 overflow-hidden rounded-3xl shadow-glass"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                <Terminal aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-xl text-ivory">
                  Live Monitor
                </h2>
                <div className="mt-1 flex items-center gap-1.5 text-xs">
                  {isConnected ? (
                    <>
                      <CheckCircle2
                        aria-hidden="true"
                        className="size-3.5 text-emerald-300"
                      />
                      <span className="text-emerald-200">Terhubung</span>
                    </>
                  ) : (
                    <>
                      <Circle
                        aria-hidden="true"
                        className="size-3.5 text-ivory/40"
                      />
                      <span className="text-ivory/45">Menghubungkan...</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div
              className={
                isSending
                  ? "inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-xs text-gold-light"
                  : "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-ivory/45"
              }
            >
              {isSending ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-3.5 animate-spin"
                />
              ) : (
                <Activity aria-hidden="true" className="size-3.5" />
              )}
              {isSending ? "Sedang berjalan" : "Idle"}
            </div>
          </div>

          <div
            role="log"
            aria-live="polite"
            aria-label="Log aktivitas laporan"
            className="min-h-[420px] max-h-[680px] space-y-3 overflow-y-auto bg-[#05080b] p-5 font-mono text-xs leading-5 sm:p-6"
          >
            <p className="text-emerald-300/70">
              GmailReporter live stream · log akun Anda
            </p>
            <p className="text-white/35">
              ─────────────────────────────────────
            </p>
            {liveError && (
              <p className="text-red-300">[SSE] {liveError}</p>
            )}
            {logs.length === 0 && !liveError && (
              <p className="text-white/45">
                Menunggu aktivitas laporan baru...
              </p>
            )}
            {logs.map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-[auto_1fr] gap-x-3 break-words"
              >
                <span className="text-white/40">
                  [{formatTime(log.sentAt)}]
                </span>
                <span
                  className={
                    log.status === "SUCCESS"
                      ? "text-emerald-300"
                      : log.status === "FAILED"
                        ? "text-red-300"
                        : log.status === "SENDING"
                          ? "text-gold-light"
                          : "text-white/75"
                  }
                >
                  {logMessage(log.status, log.gmailSender.email, log.targetEmail)}
                  {log.errorMessage ? ` — ${log.errorMessage}` : ""}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-[11px] text-ivory/40 sm:px-6">
            <span>{logs.length} log terbaru</span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              SSE
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
