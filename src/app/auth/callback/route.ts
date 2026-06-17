import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Preserve enroll params through the OAuth callback
  const enroll = searchParams.get("enroll");
  if (enroll === "1") {
    const level = searchParams.get("level") ?? "";
    const price = searchParams.get("price") ?? "";
    const name = searchParams.get("name") ?? "";
    return NextResponse.redirect(
      `${origin}/?enroll=1&level=${encodeURIComponent(level)}&price=${encodeURIComponent(price)}&name=${encodeURIComponent(name)}`
    );
  }

  return NextResponse.redirect(`${origin}/`);
}
