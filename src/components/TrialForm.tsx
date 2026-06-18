"use client";

import { useState } from "react";
import { t, type Locale, LOCALE_COOKIE, DEFAULT_LOCALE } from "@/lib/i18n";

function readLocaleCookie(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const c = match ? decodeURIComponent(match[1]) : "";
  return (c === "en" || c === "zh" || c === "he" ? c : DEFAULT_LOCALE) as Locale;
}

export default function TrialForm() {
  const locale = readLocaleCookie();
  const tr = t(locale).landing;

  const [form, setForm] = useState({ name: "", email: "", level: "HSK 1", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/trial-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? "success" : "error");
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-palace-gold/30 bg-palace-gold/5 px-8 py-10 text-center">
        <p className="text-2xl">🎉</p>
        <p className="mt-3 text-lg font-semibold text-palace-dark">{tr.trialSuccess}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-xl space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">{tr.trialYourName}</label>
          <input className="input" required value={form.name} onChange={e => set("name", e.target.value)} />
        </div>
        <div>
          <label className="label">{tr.trialEmailAddress}</label>
          <input className="input" type="email" required value={form.email} onChange={e => set("email", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">{tr.trialHskLevel}</label>
        <select className="input" value={form.level} onChange={e => set("level", e.target.value)}>
          {["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5","HSK 6"].map(l => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">{tr.trialMessage} <span className="text-palace-dark/40">{tr.trialOptional}</span></label>
        <textarea className="input min-h-[80px] resize-y" value={form.message} onChange={e => set("message", e.target.value)} />
      </div>
      {status === "error" && <p className="text-sm text-red-600">{tr.trialError}</p>}
      <button type="submit" disabled={status === "loading"} className="btn-primary w-full justify-center">
        {status === "loading" ? tr.trialSending : tr.trialSubmit}
      </button>
    </form>
  );
}
