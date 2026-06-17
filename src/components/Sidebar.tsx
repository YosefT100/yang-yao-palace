"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils";
import { signOutAction } from "@/app/actions";
import type { Locale } from "@/lib/i18n";

export interface NavItem {
  href: string;
  label: string;
}

export function Sidebar({
  title,
  items,
  userName,
  signOutLabel = "Sign out",
  locale = "en",
}: {
  title: string;
  items: NavItem[];
  userName: string;
  signOutLabel?: string;
  locale?: Locale;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        className="fixed left-4 top-4 z-[60] flex h-9 w-9 items-center justify-center rounded-lg shadow-md md:hidden"
        style={{ backgroundColor: "#1A0A00", color: "#D4AF37" }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        <span className="text-base font-bold">{open ? "✕" : "☰"}</span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cx(
          "flex h-screen w-64 shrink-0 flex-col",
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300",
          "md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundColor: "#1A0A00" }}
      >
        {/* Header */}
        <div className="border-b border-white/10 px-5 py-5">
          <p className="font-serif text-lg font-bold" style={{ color: "#D4AF37" }}>
            YANG YAO PALACE
          </p>
          <p className="mt-0.5 text-xs tracking-widest" style={{ color: "rgba(212,175,55,0.5)" }}>
            {title.toUpperCase()}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto space-y-1 px-3 py-4">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cx(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-palace-red text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 px-5 py-4 space-y-2">
          <p className="truncate text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            {userName}
          </p>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-sm hover:underline"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {signOutLabel}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
