"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, Mail, Plus, ShieldCheck, Trash2 } from "lucide-react";

type GmailAccount = {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
};

export function GmailAccountManager() {
  const [accounts, setAccounts] = useState<GmailAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/gmail-accounts", {
        cache: "no-store",
      });
      const result = (await response.json()) as {
        accounts?: GmailAccount[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(result.error ?? "Tidak dapat memuat akun Gmail.");
      }
      setAccounts(result.accounts ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Tidak dapat memuat akun Gmail.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setNotice("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/gmail-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          appPassword: formData.get("appPassword"),
        }),
      });
      const result = (await response.json()) as {
        account?: GmailAccount;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Tidak dapat menyimpan akun Gmail.");
      }

      if (result.account) {
        setAccounts((current) => [result.account!, ...current]);
      }
      form.reset();
      setNotice("Akun Gmail berhasil ditambahkan.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Tidak dapat menyimpan akun Gmail.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleAccount(account: GmailAccount) {
    setPendingId(account.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/gmail-accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: account.id,
          isActive: !account.isActive,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Tidak dapat mengubah status akun.");
      }

      setAccounts((current) =>
        current.map((item) =>
          item.id === account.id
            ? { ...item, isActive: !account.isActive }
            : item,
        ),
      );
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Tidak dapat mengubah status akun.",
      );
    } finally {
      setPendingId(null);
    }
  }

  async function deleteAccount(account: GmailAccount) {
    if (!window.confirm(`Hapus akun ${account.email}?`)) return;

    setPendingId(account.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(
        `/api/gmail-accounts?id=${encodeURIComponent(account.id)}`,
        { method: "DELETE" },
      );
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Tidak dapat menghapus akun.");
      }
      setAccounts((current) =>
        current.filter((item) => item.id !== account.id),
      );
      setNotice("Akun Gmail berhasil dihapus.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Tidak dapat menghapus akun.",
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="glass-card gold-border rounded-3xl p-6 shadow-glass sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
            <Mail aria-hidden="true" className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-xl text-ivory">
              Tambahkan akun pengirim
            </h2>
            <p className="mt-1 text-sm leading-6 text-ivory/55">
              Simpan akun Gmail yang akan digunakan untuk mengirim laporan.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
        >
          <div>
            <label
              htmlFor="gmail-account-email"
              className="mb-2 block text-sm font-medium text-ivory/80"
            >
              Email Gmail
            </label>
            <input
              id="gmail-account-email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              placeholder="nama@gmail.com"
              className="h-12 w-full rounded-xl border border-white/15 bg-navy-deep/65 px-4 text-sm text-ivory outline-none transition placeholder:text-ivory/35 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
            />
          </div>
          <div>
            <label
              htmlFor="gmail-account-app-password"
              className="mb-2 block text-sm font-medium text-ivory/80"
            >
              App Password
            </label>
            <input
              id="gmail-account-app-password"
              name="appPassword"
              type="password"
              autoComplete="new-password"
              inputMode="numeric"
              pattern="[0-9]{16}"
              minLength={16}
              maxLength={16}
              required
              placeholder="16 digit"
              className="h-12 w-full rounded-xl border border-white/15 bg-navy-deep/65 px-4 text-sm text-ivory outline-none transition placeholder:text-ivory/35 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-navy-deep shadow-gold transition hover:bg-gold-light disabled:cursor-wait disabled:opacity-70"
          >
            {isSubmitting ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            ) : (
              <Plus aria-hidden="true" className="size-4" />
            )}
            Tambahkan
          </button>
        </form>

        <p className="mt-4 flex items-center gap-2 text-xs text-gold-light/80">
          <ShieldCheck aria-hidden="true" className="size-4 shrink-0" />
          Gunakan App Password, bukan password Gmail utama.
        </p>
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
        >
          {notice}
        </p>
      )}

      <section className="glass-card gold-border overflow-hidden rounded-3xl shadow-glass">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8">
          <div>
            <h2 className="font-display text-xl text-ivory">
              Akun Gmail terdaftar
            </h2>
            <p className="mt-1 text-sm text-ivory/50">
              {accounts.length} akun pengirim
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-14 text-sm text-ivory/55">
            <LoaderCircle
              aria-hidden="true"
              className="size-4 animate-spin text-gold"
            />
            Memuat akun...
          </div>
        ) : accounts.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Mail
              aria-hidden="true"
              className="mx-auto size-8 text-gold/60"
            />
            <p className="mt-3 text-sm text-ivory/60">
              Belum ada akun Gmail yang ditambahkan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-white/[0.025] text-xs uppercase tracking-wider text-ivory/45">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium sm:px-8">
                    Email Gmail
                  </th>
                  <th scope="col" className="px-6 py-4 font-medium">
                    App Password
                  </th>
                  <th scope="col" className="px-6 py-4 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-right font-medium sm:px-8">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.07]">
                {accounts.map((account) => (
                  <tr key={account.id} className="text-ivory/80">
                    <td className="px-6 py-4 font-medium sm:px-8">
                      {account.email}
                    </td>
                    <td className="px-6 py-4 tracking-[0.2em] text-ivory/45">
                      ••••••••••••••••
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          account.isActive
                            ? "inline-flex items-center gap-2 text-xs text-emerald-300"
                            : "inline-flex items-center gap-2 text-xs text-ivory/45"
                        }
                      >
                        <span
                          className={
                            account.isActive
                              ? "size-1.5 rounded-full bg-emerald-400"
                              : "size-1.5 rounded-full bg-ivory/35"
                          }
                        />
                        {account.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 sm:px-8">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={pendingId === account.id}
                          onClick={() => void toggleAccount(account)}
                          className="rounded-lg border border-gold/25 px-3 py-2 text-xs font-medium text-gold-light transition hover:bg-gold/10 disabled:cursor-wait disabled:opacity-60"
                        >
                          {pendingId === account.id
                            ? "Memproses..."
                            : account.isActive
                              ? "Nonaktifkan"
                              : "Aktifkan"}
                        </button>
                        <button
                          type="button"
                          disabled={pendingId === account.id}
                          onClick={() => void deleteAccount(account)}
                          aria-label={`Hapus akun ${account.email}`}
                          className="flex size-9 items-center justify-center rounded-lg border border-red-400/20 text-red-300 transition hover:bg-red-400/10 disabled:cursor-wait disabled:opacity-60"
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
