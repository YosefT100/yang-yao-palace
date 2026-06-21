import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getOrCreateCalendarToken(
  teacherId: string,
  supabase: SupabaseClient
): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("calendar_token")
    .eq("id", teacherId)
    .single();

  if (data?.calendar_token) return data.calendar_token as string;

  const token = randomBytes(16).toString("hex"); // 32-char hex
  await supabase
    .from("profiles")
    .update({ calendar_token: token })
    .eq("id", teacherId);

  return token;
}
