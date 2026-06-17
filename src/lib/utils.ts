import { DAY_NAMES } from "@/types/database";

export function formatPrice(amountCents: number, _currency: string, locale?: string) {
  if (locale === "zh") {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 0,
    }).format(amountCents / 100 / 0.52);
  }
  if (locale === "he") {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      minimumFractionDigits: 0,
    }).format(amountCents / 100);
  }
  // default (en + no locale) → USD
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amountCents / 100 / 3.7);
}

export function formatTime(time: string) {
  return time?.slice(0, 5);
}

export function dayName(dayOfWeek: number) {
  return DAY_NAMES[dayOfWeek] ?? "";
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function courseSlotPlan(sessionsPerWeek: number, hasBonusLesson: boolean) {
  const slots: { type: "regular" | "bonus"; label: string }[] = [];
  for (let i = 1; i <= sessionsPerWeek; i++) {
    slots.push({ type: "regular", label: `Regular lesson ${i}` });
  }
  if (hasBonusLesson) {
    slots.push({ type: "bonus", label: "Bonus lesson" });
  }
  return slots;
}
