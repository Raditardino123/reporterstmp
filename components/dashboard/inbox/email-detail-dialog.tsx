"use client";

import { useEffect } from "react";
import {
  ExternalLink,
  Mail,
  X,
} from "lucide-react";
import { useMessageById } from "@/hooks/use-gmail";

type EmailDetailDialogProps = {
  messageId: string | null;
  onClose: () => void;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal tidak tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

export function EmailDetailDialog({
  messageId,
  onClose,
}: EmailDetailDialogProps) {
  const query = useMessageById(messageId);
  const message = query.data;

  useEffect(() => {
    if (!messageId) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [messageId, onClose]);

  if (!messageId) return null;

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-deep/75 p-3 backdrop-blur-md sm:p-6"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-detail-title"
        className="glass-card gold-border flex max-h-[min(88vh,900px)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl shadow-glass"
      >
        <header className="flex items-start justify-between gap-5 border-b border-border/70 px-5 py-5 sm:px-8">
          <div className="min-w-0">
            <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
              <Mail aria-hidden="true" className="size-3.5" />
              Inbox message
            </p>
            <h2
              id="email-detail-title"
              className="font-display text-xl leading-snug sm:text-2xl"
            >
              {message?.subject ?? "Detail email"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail email"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 text-muted-foreground transition hover:border-gold/30 hover:text-foreground"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-7">
          {query.isPending ? (
            <div
              role="status"
              aria-label="Memuat isi pesan"
              className="space-y-5 py-5"
            >
              <div className="skeleton-shimmer h-4 w-2/3 rounded" />
              <div className="skeleton-shimmer h-4 w-1/2 rounded" />
              <div className="skeleton-shimmer h-4 w-1/3 rounded" />
              <div className="space-y-3 pt-6">
                <div className="skeleton-shimmer h-3 w-full rounded" />
                <div className="skeleton-shimmer h-3 w-full rounded" />
                <div className="skeleton-shimmer h-3 w-5/6 rounded" />
                <div className="skeleton-shimmer h-3 w-4/6 rounded" />
              </div>
            </div>
          ) : query.isError ? (
            <div role="alert" className="flex min-h-64 flex-col items-center justify-center">
              <p className="text-sm font-medium">Detail email tidak dapat dimuat.</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {query.error.message}
              </p>
              <button
                type="button"
                onClick={() => void query.refetch()}
                className="mt-4 rounded-lg border border-gold/25 px-3 py-2 text-xs text-gold-light transition hover:bg-gold/10"
              >
                Coba lagi
              </button>
            </div>
          ) : message ? (
            <>
              <dl className="space-y-2 border-b border-border/60 pb-5 text-xs sm:text-sm">
                <div className="flex gap-3">
                  <dt className="w-14 shrink-0 text-muted-foreground">Dari</dt>
                  <dd className="min-w-0 break-all text-foreground">
                    {message.from || message.sender.email}
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-14 shrink-0 text-muted-foreground">Kepada</dt>
                  <dd className="min-w-0 break-all text-foreground">
                    {message.to || "Tidak tersedia"}
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-14 shrink-0 text-muted-foreground">Tanggal</dt>
                  <dd className="text-foreground">{formatDate(message.date)}</dd>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {message.labels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-gold/20 bg-gold/[0.06] px-2.5 py-1 text-[10px] text-gold-light"
                    >
                      {label.replace(/^CATEGORY_/, "").replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </dl>
              <article className="min-h-48 whitespace-pre-wrap break-words py-6 text-sm leading-7 text-foreground/90">
                {message.body || message.snippet || "Isi pesan kosong."}
              </article>
              <a
                href={`https://mail.google.com/mail/u/0/#all/${encodeURIComponent(message.id)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gold-sheen px-4 text-xs font-semibold text-navy-deep shadow-gold transition hover:brightness-110"
              >
                Open in Gmail
                <ExternalLink aria-hidden="true" className="size-3.5" />
              </a>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
