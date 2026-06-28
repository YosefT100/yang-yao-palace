"use client";

import { useState } from "react";

type FAQItem = { q: string; a: string };

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className={`rounded-xl border transition-colors ${
            open === i
              ? "border-palace-gold/40 bg-palace-gold/5"
              : "border-black/8 bg-white"
          }`}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <span className={`font-medium ${open === i ? "text-palace-red" : "text-palace-dark"}`}>
              {item.q}
            </span>
            <span
              className={`ml-4 shrink-0 text-xl text-palace-gold transition-transform duration-200 ${
                open === i ? "rotate-45" : ""
              }`}
            >
              +
            </span>
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-sm leading-relaxed text-palace-dark/70">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
