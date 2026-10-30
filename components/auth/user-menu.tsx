"use client";

import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { ChevronDown, LogOut, UserRound } from "lucide-react";

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const user = session?.user;
  const initials = user?.name
    ?.split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-gold/20 bg-white/[0.04] py-1.5 pl-1.5 pr-3 transition hover:border-gold/45 hover:bg-white/[0.07]"
      >
        {user?.image ? (
          <Image
            src={user.image}
            alt=""
            width={34}
            height={34}
            className="size-[34px] rounded-full object-cover"
          />
        ) : (
          <span className="flex size-[34px] items-center justify-center rounded-full bg-gold/15 text-xs font-semibold text-gold-light">
            {initials || <UserRound aria-hidden="true" className="size-4" />}
          </span>
        )}
        <span className="hidden max-w-36 truncate text-sm font-medium sm:block">
          {user?.name || "Akun"}
        </span>
        <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.6rem)] z-30 w-64 rounded-xl border border-gold/20 bg-background/95 p-2 shadow-glass backdrop-blur-2xl"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.name || "Akun Google"}
            </p>
            {user?.email && (
              <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-foreground/80 transition hover:bg-accent hover:text-gold"
          >
            <LogOut aria-hidden="true" className="size-4" />
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}
