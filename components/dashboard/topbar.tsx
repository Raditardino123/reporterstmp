"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronRight,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";
import { cn } from "@/lib/utils";

const breadcrumbNames: Record<string, string> = {
  dashboard: "Dashboard",
  "inbox-analytics": "Inbox Analytics",
  reports: "Reports",
  reporter: "Auto Reporter",
  accounts: "Gmail Accounts",
  "live-monitor": "Live Log",
};

type TopbarProps = {
  onOpenMobileMenu: () => void;
};

export function Topbar({ onOpenMobileMenu }: TopbarProps) {
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const breadcrumbs = useMemo(
    () =>
      pathname
        .split("/")
        .filter(Boolean)
        .map((segment) => ({
          label:
            breadcrumbNames[segment] ??
            segment.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
        })),
    [pathname],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("dashboard-search")?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-gold/10 bg-background/75 px-4 py-3 backdrop-blur-2xl sm:px-6 lg:px-9">
      <div className="flex min-h-11 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Buka menu navigasi"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-white/[0.04] text-muted-foreground transition hover:border-gold/30 hover:text-foreground md:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>

        <div className="hidden min-w-0 items-center gap-2 text-xs sm:flex">
          <span className="text-muted-foreground/70">Workspace</span>
          {breadcrumbs.map((item, index) => (
            <span key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">
              <ChevronRight aria-hidden="true" className="size-3.5 text-gold/50" />
              <span
                className={cn(
                  "truncate",
                  index === breadcrumbs.length - 1
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </span>
          ))}
        </div>

        <label className="group relative ml-auto flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-3 text-muted-foreground shadow-soft backdrop-blur-xl transition focus-within:border-gold/40 focus-within:ring-1 focus-within:ring-gold/20 sm:ml-auto sm:max-w-xs lg:max-w-sm">
          <Search aria-hidden="true" className="size-4 shrink-0 group-focus-within:text-gold" />
          <input
            id="dashboard-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari email, pengirim..."
            aria-label="Cari email atau pengirim"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Hapus pencarian"
              className="rounded p-0.5 hover:text-foreground"
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          ) : (
            <kbd className="hidden rounded border border-white/10 px-1.5 py-0.5 font-sans text-[10px] text-muted-foreground/70 lg:inline">
              ⌘ K
            </kbd>
          )}
        </label>

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((open) => !open)}
            aria-label="Notifikasi"
            aria-expanded={notificationsOpen}
            className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-white/[0.04] text-muted-foreground transition hover:border-gold/30 hover:text-gold-light"
          >
            <Bell aria-hidden="true" className="size-[18px]" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-72 rounded-2xl border border-gold/20 bg-background/95 p-4 shadow-glass backdrop-blur-2xl">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles aria-hidden="true" className="size-4 text-gold" />
                Semua sudah diperbarui
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Notifikasi laporan dan aktivitas inbox Anda akan muncul di sini.
              </p>
            </div>
          )}
        </div>

        <UserMenu />
      </div>
    </header>
  );
}
