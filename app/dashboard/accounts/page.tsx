import type { Metadata } from "next";
import { GmailAccountManager } from "@/components/dashboard/accounts/gmail-account-manager";

export const metadata: Metadata = {
  title: "Akun Gmail",
  description: "Kelola akun Gmail yang digunakan sebagai pengirim laporan.",
  robots: { index: false, follow: false },
};

export default function GmailAccountsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-9 lg:py-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">
          Sender management
        </p>
        <h1 className="mt-2 font-display text-3xl text-ivory sm:text-4xl">
          Akun Gmail
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ivory/55">
          Kelola akun pengirim dan status penggunaannya untuk laporan Anda.
        </p>
      </div>
      <GmailAccountManager />
    </div>
  );
}
