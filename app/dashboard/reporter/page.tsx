import type { Metadata } from "next";
import { ReporterDashboard } from "@/components/reporter/reporter-dashboard";

export const metadata: Metadata = {
  title: "Auto Reporter",
  description: "Buat dan pantau laporan secara live.",
  robots: { index: false, follow: false },
};

export default function ReporterPage() {
  return <ReporterDashboard />;
}
