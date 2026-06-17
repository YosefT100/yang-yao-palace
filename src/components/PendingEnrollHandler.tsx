"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PendingEnrollHandler() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("enroll") !== "1") return;

    const level = params.get("level") ?? "";
    const price = Number(params.get("price") ?? "0");
    const name = params.get("name") ?? "";

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseLevel: level, coursePrice: price, courseName: name }),
      })
        .then(r => r.json())
        .then(({ url }) => { if (url) window.location.href = url; });
    });
  }, []);

  return null;
}
