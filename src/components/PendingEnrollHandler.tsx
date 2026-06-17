"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { startCheckout } from "@/components/EnrollButton";

export default function PendingEnrollHandler() {
  useEffect(() => {
    const raw = sessionStorage.getItem("pendingEnroll");
    if (!raw) return;

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      sessionStorage.removeItem("pendingEnroll");
      const { courseLevel, coursePrice, courseName } = JSON.parse(raw);
      startCheckout(courseLevel, coursePrice, courseName);
    });
  }, []);

  return null;
}
