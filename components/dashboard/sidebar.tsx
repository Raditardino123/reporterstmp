"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  FileText,
  Inbox,
  LayoutDashboard,
  Mail,
  MailPlus,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inbox Analytics", href: "/dashboard/inbox", icon: Inbox },
  { label: "Reports", href: "/dashboard/reports", icon: FileText },
  { label: "Auto Reporter", href: "/dashboard/reporter", icon: Send },
  { label: "Live Log", href: "/dashboard/reporter#live-monitor", icon: Activity },
  { label: "Gmail Accounts", href: "/dashboard/accounts", icon: MailPlus },
];

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
};

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu navigasi"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-navy-deep/70 backdrop-blur-sm md:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-gold/15 bg-background/95 px-4 py-5 shadow-glass backdrop-blur-2xl transition-[width,transform] duration-300 md:sticky md:top-0 md:z-30 md:h-screen md:translate-x-0 md:bg-background/70 md:shadow-none",
          collapsed ? "md:w-[5.5rem]" : "md:w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className={cn("flex h-11 items-center", collapsed ? "md:justify-center" : "justify-between")}>
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-3 overflow-hidden"
            aria-label="GmailReporter overview"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold shadow-glow">
              <Mail aria-hidden="true" className="size-5" />
            </span>
            <span className={cn("whitespace-nowrap font-display text-lg", collapsed && "md:hidden")}>
              GmailReporter
            </span>
          </Link>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Tutup menu"
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent md:hidden"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className={cn("mb-3 mt-10 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70", collapsed && "md:px-0 md:text-center")}>
          <span className={collapsed ? "md:hidden" : undefined}>Workspace</span>
          {collapsed && <span className="hidden md:inline">•••</span>}
        </div>
        <nav aria-label="Dashboard" className="space-y-1">
          {navigation.map(({ label, href, icon: Icon }) => {
            const routeHref = href.split("#")[0];
            const isActive =
              routeHref === "/dashboard"
                ? pathname === routeHref
                : pathname === routeHref ||
                  pathname.startsWith(`${routeHref}/`);

            return (
              <Link
                key={href}
                href={href}
                onClick={onCloseMobile}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={cn(
                  "group relative flex h-11 items-center gap-3 overflow-hidden rounded-xl px-3 text-sm transition duration-200",
                  collapsed && "md:justify-center md:px-0",
                  isActive
                    ? "bg-gold-sheen font-semibold text-navy-deep shadow-gold"
                    : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
                )}
              >
                <Icon aria-hidden="true" className="size-[18px] shrink-0" />
                <span className={cn("whitespace-nowrap", collapsed && "md:hidden")}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div
            className={cn(
              "mb-4 rounded-2xl border border-gold/20 bg-premium-glow p-4",
              collapsed && "md:hidden",
            )}
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <Sparkles aria-hidden="true" className="size-4" />
            </div>
            <p className="mt-3 text-sm font-medium">Inbox, in perspective.</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Insight email Anda, dikurasi dengan elegan.
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden h-10 w-full items-center justify-center gap-2 rounded-xl text-xs text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground md:flex"
            aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          >
            {collapsed ? (
              <ChevronRight aria-hidden="true" className="size-4" />
            ) : (
              <>
                <ChevronLeft aria-hidden="true" className="size-4" />
                <span>Ciutkan menu</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
