import { Mail, MailOpen, Send, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/overview/stat-card";

export type KpiData = {
  totalEmails?: number;
  unread?: number;
  thisWeek?: number;
  weeklyChange?: number;
  topSender?: string;
  topSenderShare?: number;
};

type KpiGridProps = {
  data: KpiData;
  isLoading: boolean;
};

function formatNumber(value: number | undefined) {
  return value === undefined ? "—" : value.toLocaleString("id-ID");
}

export function KpiGrid({ data, isLoading }: KpiGridProps) {
  const total = data.totalEmails ?? 0;
  const unread = data.unread ?? 0;
  const unreadShare = total > 0 ? (unread / total) * 100 : undefined;

  return (
    <section
      aria-label="Statistik email"
      className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4"
    >
      <StatCard
        label="Total Emails"
        value={formatNumber(data.totalEmails)}
        detail="Jumlah pesan di seluruh akun Gmail"
        percentage={data.thisWeek !== undefined && total > 0 ? (data.thisWeek / total) * 100 : undefined}
        percentageLabel="porsi email minggu ini"
        icon={Mail}
        isLoading={isLoading}
      />
      <StatCard
        label="Unread"
        value={formatNumber(data.unread)}
        detail="Dihitung langsung dari query Gmail"
        percentage={unreadShare}
        percentageLabel="dari seluruh email"
        icon={MailOpen}
        tone="neutral"
        isLoading={isLoading}
      />
      <StatCard
        label="This Week"
        value={formatNumber(data.thisWeek)}
        detail="Pesan yang diterima dalam 7 hari terakhir"
        percentage={data.weeklyChange}
        percentageLabel="vs. 7 hari sebelumnya"
        tone={
          data.weeklyChange === undefined
            ? "neutral"
            : data.weeklyChange >= 0
              ? "positive"
              : "negative"
        }
        icon={Send}
        isLoading={isLoading}
      />
      <StatCard
        label="Top Sender"
        value={data.topSender ?? "—"}
        detail="Pengirim terbanyak dari 100 pesan terbaru"
        percentage={data.topSenderShare}
        percentageLabel="porsi pesan terbaru"
        icon={Users}
        isLoading={isLoading}
      />
    </section>
  );
}
