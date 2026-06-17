import { cookies } from "next/headers";
export function getLocale(): "en" | "zh" | "he" {
  const val = cookies().get("yyp_locale")?.value;
  return (["en", "zh", "he"].includes(val ?? "") ? val : "en") as "en" | "zh" | "he";
}
