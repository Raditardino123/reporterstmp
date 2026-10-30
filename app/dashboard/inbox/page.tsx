import type { Metadata } from "next";
import { InboxExplorer } from "@/components/dashboard/inbox/inbox-explorer";

export const metadata: Metadata = {
  title: "Inbox Analytics",
  description: "Analitik mendalam untuk pesan Gmail Anda.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Inbox Analytics | GmailReporter",
    description: "Cari, filter, dan pahami pola aktivitas pesan Gmail Anda.",
  },
};

export default function InboxPage() {
  return <InboxExplorer />;
}
