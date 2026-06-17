"use client";

import { createClient } from "@/lib/supabase/client";

const HSK_PRICES: Record<string, number> = {
  HSK1: 460, HSK2: 460, HSK3: 800, HSK4: 800, HSK5: 1800, HSK6: 2000,
};

export default function EnrollButton({ level, name, label }: { level: string; name: string; label: string }) {
  const levelKey = level.replace(/\s/g, "");
  const price = HSK_PRICES[levelKey];

  async function handleClick() {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      const params = new URLSearchParams({
        enroll: "1",
        level,
        price: String(price),
        name,
      });
      window.location.href = `/login?${params.toString()}`;
      return;
    }

    const res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseLevel: level, coursePrice: price, courseName: name }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  return (
    <button onClick={handleClick} className="btn-primary w-full justify-center text-center">
      {label}
    </button>
  );
}
