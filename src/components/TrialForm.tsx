"use client";

import { useState } from "react";

export default function TrialForm() {
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
        <p className="mt-3 text-lg font-semibold text-palace-dark">We'll contact you within 24 hours to schedule your trial!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-xl space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Your name</label>
          <input className="input" required value={form.name} onChange={e => set("name", e.target.value)} />
        </div>
        <div>
          <label className="label">Email address</label>
          <input className="input" type="email" required value={form.email} onChange={e => set("email", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">HSK level interest</label>
        <select className="input" value={form.level} onChange={e => set("level", e.target.value)}>
          {["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5","HSK 6"].map(l => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Message <span className="text-palace-dark/40">(optional)</span></label>
        <textarea className="input min-h-[80px] resize-y" value={form.message} onChange={e => set("message", e.target.value)} />
      </div>
      {status === "error" && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
      <button type="submit" disabled={status === "loading"} className="btn-primary w-full justify-center">
        {status === "loading" ? "Sending…" : "Book My Free Trial"}
      </button>
    </form>
  );
}
