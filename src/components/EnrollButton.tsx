"use client";

import { createClient } from "@/lib/supabase/client";

const HSK_PRICES: Record<string, number> = {
  HSK1: 460, HSK2: 460, HSK3: 800, HSK4: 800, HSK5: 1800, HSK6: 2000,
  HSK1_1ON1: 765, HSK2_1ON1: 765, HSK3_1ON1: 1320, HSK4_1ON1: 1320, HSK5_1ON1: 3040, HSK6_1ON1: 3360,
  HSK1_1ON1_INST: 192, HSK2_1ON1_INST: 192, HSK3_1ON1_INST: 330, HSK4_1ON1_INST: 330, HSK5_1ON1_INST: 840, HSK6_1ON1_INST: 840,
};

export default function EnrollButton({ level, name, label }: { level: string; name: string; label: string }) {
  const price = HSK_PRICES[level.replace(/\s/g, "")];

  async function handleClick() {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      window.location.href = "/login";
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
    <button onClick={handleClick} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors w-full">
      {label}
    </button>
  );
}
