"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

type ProfileData = {
  full_name?: string | null;
  bio?: string | null;
  phone?: string | null;
  wechat_id?: string | null;
  telegram?: string | null;
  show_whatsapp?: boolean | null;
  show_wechat?: boolean | null;
  show_telegram?: boolean | null;
};

export function TeacherProfileForm({ initialData }: { initialData?: ProfileData }) {
  const supabase = createClient();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: initialData?.full_name ?? "",
    bio: initialData?.bio ?? "",
    whatsapp: initialData?.phone ?? "",
    show_whatsapp: initialData?.show_whatsapp ?? false,
    wechat_id: initialData?.wechat_id ?? "",
    show_wechat: initialData?.show_wechat ?? false,
    telegram: initialData?.telegram ?? "",
    show_telegram: initialData?.show_telegram ?? false,
  });

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { error: err } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          bio: form.bio,
          phone: form.whatsapp,
          wechat_id: form.wechat_id,
          telegram: form.telegram,
          show_whatsapp: form.show_whatsapp,
          show_wechat: form.show_wechat,
          show_telegram: form.show_telegram,
        })
        .eq("id", auth.user.id);
      if (err) setError(err.message);
      else setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-6 space-y-5">
      <div>
        <label className="label">Full name</label>
        <input className="input" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
      </div>

      <div>
        <label className="label">Bio</label>
        <textarea
          className="input min-h-[90px] resize-y"
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
        />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="mb-3 text-sm font-semibold text-palace-dark">Contact preferences</p>
        <div className="space-y-4">
          <ContactField
            label="WhatsApp number"
            value={form.whatsapp}
            show={form.show_whatsapp}
            onValue={(v) => set("whatsapp", v)}
            onShow={(v) => set("show_whatsapp", v)}
          />
          <ContactField
            label="WeChat ID"
            value={form.wechat_id}
            show={form.show_wechat}
            onValue={(v) => set("wechat_id", v)}
            onShow={(v) => set("show_wechat", v)}
          />
          <ContactField
            label="Telegram username"
            value={form.telegram}
            show={form.show_telegram}
            onValue={(v) => set("telegram", v)}
            onShow={(v) => set("show_telegram", v)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-600">Saved successfully.</p>}

      <button type="submit" disabled={pending} className="btn-primary w-full justify-center">
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

function ContactField({
  label,
  value,
  show,
  onValue,
  onShow,
}: {
  label: string;
  value: string;
  show: boolean;
  onValue: (v: string) => void;
  onShow: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <label className="label">{label}</label>
        <input className="input" value={value} onChange={(e) => onValue(e.target.value)} />
      </div>
      <label className="mt-7 flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-xs text-palace-dark/60">
        <input
          type="checkbox"
          checked={show}
          onChange={(e) => onShow(e.target.checked)}
          className="accent-palace-red"
        />
        Show to students
      </label>
    </div>
  );
}
