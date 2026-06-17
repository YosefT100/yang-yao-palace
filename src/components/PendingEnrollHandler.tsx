"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PendingEnrollHandler() {
  useEffect(() => {
    const raw = sessionStorage.getItem("pendingEnroll");
    if (!raw) return;

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      sessionStorage.removeItem("pendingEnroll");
      const { courseLevel, coursePrice, courseName } = JSON.parse(raw);
      fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseLevel, coursePrice, courseName }),
      })
        .then(r => r.json())
        .then(({ url }) => { if (url) window.location.href = url; });
    });
  }, []);

  return null;
}
