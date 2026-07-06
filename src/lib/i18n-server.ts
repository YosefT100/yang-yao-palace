import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n";
export function getLocale(): Locale {
  const val = cookies().get("yyp_locale")?.value;
  return (["en", "zh", "ru", "hi", "fil", "ar", "ja", "es", "pt"].includes(val ?? "") ? val : "en") as Locale;
}
