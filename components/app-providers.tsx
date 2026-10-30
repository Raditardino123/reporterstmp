"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { useState } from "react";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          closeButton
          visibleToasts={4}
          toastOptions={{
            classNames: {
              toast:
                "!rounded-2xl !border !border-gold/25 !bg-[#111A2E]/95 !text-ivory !shadow-glass !backdrop-blur-2xl",
              title: "!text-sm !font-semibold !text-ivory",
              description: "!text-xs !text-ivory/65",
              actionButton: "!bg-gold !text-navy-deep hover:!brightness-110",
              cancelButton: "!bg-white/10 !text-ivory",
              closeButton:
                "!border-gold/20 !bg-[#111A2E] !text-ivory/70 hover:!text-gold",
            },
          }}
        />
      </QueryClientProvider>
    </SessionProvider>
  );
}
