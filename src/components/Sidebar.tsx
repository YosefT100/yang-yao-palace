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

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        className="fixed left-4 top-4 z-[60] flex h-9 w-9 items-center justify-center rounded-lg shadow-md transition-colors duration-150 md:hidden"
        style={{ backgroundColor: "#1A0A00", color: "#D4AF37" }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
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
        style={{ backgroundColor: "#140800", borderRight: "1px solid rgba(212,175,55,0.12)" }}
      >
        {/* Header */}
        <div className="px-5 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 mb-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="h-8 w-8 rounded-full object-cover" />
            <p className="font-serif text-base font-bold tracking-[0.12em]" style={{ color: "#D4AF37" }}>
              YANG YAO PALACE
            </p>
          </div>
          <p className="mt-0.5 text-[10px] tracking-[0.25em] font-medium" style={{ color: "rgba(212,175,55,0.45)" }}>
            {title.toUpperCase()}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cx(
                  "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer",
                  active
                    ? "text-white bg-white/[0.10] border-l-2 border-palace-gold"
                    : "text-white/55 hover:text-white/90 hover:bg-white/[0.06] border-l-2 border-transparent"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{ backgroundColor: "rgba(212,175,55,0.18)", color: "#D4AF37" }}
            >
              {initials || "?"}
            </div>
            <p className="truncate text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
              {userName}
            </p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-1.5 text-xs font-medium text-left transition-colors duration-150 cursor-pointer"
              style={{ color: "rgba(255,255,255,0.35)" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
            >
              {signOutLabel} →
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
