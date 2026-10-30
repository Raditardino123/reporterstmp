"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";

export function GoogleSignInButton({ callbackUrl }: { callbackUrl: string }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignIn() {
    setIsLoading(true);
    await signIn("google", { callbackUrl });
  }

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={isLoading}
      className="group flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.07] px-5 text-sm font-medium text-ivory shadow-soft backdrop-blur transition hover:border-gold/40 hover:bg-white/[0.11] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-wait disabled:opacity-70"
    >
      {isLoading ? (
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-gold" />
      ) : (
        <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.66 5.94c4.47-4.13 7.11-10.2 7.11-17.59Z" />
          <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.75-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.54 2.56 10.78l7.97-6.19Z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.86l-7.66-5.94c-2.13 1.43-4.85 2.28-8.24 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
        </svg>
      )}
      <span>{isLoading ? "Menghubungkan..." : "Sign in with Google"}</span>
    </button>
  );
}
