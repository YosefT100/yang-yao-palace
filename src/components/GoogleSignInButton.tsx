"use client";

import { createClient } from "@/lib/supabase/client";

export default function GoogleSignInButton() {
  async function handleClick() {
    const supabase = createClient();
    // Preserve enroll params through the OAuth redirect
    const search = window.location.search;
    const callbackUrl = `${window.location.origin}/auth/callback${search}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
  }

  return (
    <button
      onClick={handleClick}
      type="button"
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-95"
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.2-2.7-.5-4z"/>
        <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.7 0-14.3 4.4-17.7 11.7z"/>
        <path fill="#FBBC05" d="M24 45c5.5 0 10.5-1.9 14.3-5l-6.6-5.4C29.8 36.2 27 37 24 37c-5.7 0-10.6-3.1-11.8-7.5l-7 5.4C8.6 41.5 15.7 45 24 45z"/>
        <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.6 2.8-2.3 5.1-4.7 6.6l6.6 5.4C41.7 37.4 44.5 31.2 44.5 24c0-1.3-.2-2.7-.5-4z"/>
      </svg>
      Continue with Google
    </button>
  );
}
