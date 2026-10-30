"use client";

import { ErrorFallback } from "@/components/error-fallback";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="bg-navy text-foreground">
        <ErrorFallback error={error} reset={reset} />
      </body>
    </html>
  );
}
