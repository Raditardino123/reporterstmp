import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { AppChrome } from "@/components/app-chrome";
import { AppProviders } from "@/components/app-providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["600", "700", "800"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "GmailReporter",
    template: "%s | GmailReporter",
  },
  description: "Analisis dan laporan Gmail Anda dalam satu dashboard premium.",
  openGraph: {
    type: "website",
    siteName: "GmailReporter",
    title: "GmailReporter — Private Inbox Intelligence",
    description:
      "Insight email personal dengan kejernihan dan elegansi premium.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GmailReporter — Private Inbox Intelligence",
    description:
      "Insight email personal dengan kejernihan dan elegansi premium.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`light ${inter.variable} ${poppins.variable}`}>
      <body>
        <AppProviders>
          <AppChrome>{children}</AppChrome>
        </AppProviders>
      </body>
    </html>
  );
}
