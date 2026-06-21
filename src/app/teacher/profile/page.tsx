import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateCalendarToken } from "@/lib/calendar-token";
import { TeacherProfileForm } from "@/components/TeacherProfileForm";
import { CopyCalendarLink } from "@/components/CopyCalendarLink";

export default async function TeacherProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, bio, phone, wechat_id, telegram, show_whatsapp, show_wechat, show_telegram")
    .eq("id", user.id)
    .single();

  const token = await getOrCreateCalendarToken(user.id, supabase);
  const calendarUrl = `https://yang-yao-palace.vercel.app/api/calendar/${token}/feed.ics`;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-serif text-2xl font-bold text-palace-dark">My Profile</h1>
      <div className="mt-1 h-0.5 w-12 bg-palace-gold" />

      <TeacherProfileForm initialData={profile ?? undefined} />

      <div className="card mt-6 space-y-3">
        <h2 className="font-semibold text-palace-dark">Calendar Sync</h2>
        <p className="text-sm text-palace-dark/60">
          Add this link as a calendar subscription in Apple Calendar, Outlook, Google Calendar, or
          any calendar app that supports calendar subscriptions (look for &apos;Subscribe to
          Calendar&apos; or &apos;Add Calendar by URL&apos;). Your schedule updates automatically.
        </p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={calendarUrl}
            className="input flex-1 font-mono text-xs"
          />
          <CopyCalendarLink url={calendarUrl} />
        </div>
      </div>
    </div>
  );
}
