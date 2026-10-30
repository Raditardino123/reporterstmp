"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const storageKey = "gmailreporter-theme";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(storageKey);
    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      setIsLight(true);
    }
  }, []);

  function toggleTheme() {
    const nextIsLight = !isLight;
    document.documentElement.classList.toggle("light", nextIsLight);
    document.documentElement.classList.toggle("dark", !nextIsLight);
    window.localStorage.setItem(storageKey, nextIsLight ? "light" : "dark");
    setIsLight(nextIsLight);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Aktifkan mode ${isLight ? "gelap" : "terang"}`}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gold/20 bg-white/[0.04] text-sm text-foreground transition hover:border-gold/50 hover:bg-white/[0.08] ${
        compact ? "size-10" : "px-4"
      }`}
    >
      {isLight ? (
        <Moon aria-hidden="true" className="size-4 text-gold" />
      ) : (
        <Sun aria-hidden="true" className="size-4 text-gold" />
      )}
      {!compact && <span>{isLight ? "Mode gelap" : "Mode terang"}</span>}
    </button>
  );
}
