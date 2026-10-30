"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";

export function CredentialsSignInForm({
  callbackUrl,
}: {
  callbackUrl: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    try {
      const result = await signIn("credentials", {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        callbackUrl,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Email atau password salah.");
        return;
      }

      router.push(result.url ?? callbackUrl);
      router.refresh();
    } catch {
      setError("Tidak dapat masuk saat ini. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="login-email"
          className="mb-2 block text-sm font-medium text-ivory/80"
        >
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          className="h-12 w-full rounded-xl border border-white/15 bg-navy-deep/65 px-4 text-sm text-ivory outline-none transition placeholder:text-ivory/35 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
          placeholder="nama@email.com"
        />
      </div>
      <div>
        <label
          htmlFor="login-password"
          className="mb-2 block text-sm font-medium text-ivory/80"
        >
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={72}
          className="h-12 w-full rounded-xl border border-white/15 bg-navy-deep/65 px-4 text-sm text-ivory outline-none transition placeholder:text-ivory/35 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
          placeholder="Masukkan password"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-navy-deep shadow-gold transition hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep disabled:cursor-wait disabled:opacity-70"
      >
        {isLoading && (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        )}
        {isLoading ? "Memverifikasi..." : "Masuk dengan Email"}
      </button>
    </form>
  );
}
