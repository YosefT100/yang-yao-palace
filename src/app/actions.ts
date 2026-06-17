"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const { data } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user!.id)
    .single();

  revalidatePath("/", "layout");
  const dest =
    profile?.role === "admin" ? "/admin" : profile?.role === "teacher" ? "/teacher" : "/student";
  redirect(dest);
}

async function notifyMake(user: { email: string; name?: string }) {
  try {
    await fetch("https://hook.us2.make.com/2z7rkjx310rvqkhfkt42pvvft4y76jmi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        name: user.name ?? "",
        registered_at: new Date().toISOString(),
        level: "",
        status: "new"
      })
    });
  } catch (e) {
    console.error("Make webhook error:", e);
  }
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const fullName = String(formData.get("full_name"));
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  await notifyMake({ email, name: fullName });

  redirect("/login?message=Check your email to confirm your account, then sign in.");
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
