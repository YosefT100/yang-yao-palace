import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  const tr = t(locale);

  const TEACHER_NAV = [
    { href: "/teacher", label: tr.teacherNav.myGroups },
    { href: "/teacher/schedule", label: tr.teacherNav.schedule },
    { href: "/teacher/availability", label: tr.teacherNav.availability },
    { href: "/teacher/recordings", label: "Recordings" },
    { href: "/teacher/profile", label: "My Profile" },
    { href: "/", label: "← Home" },
  ];

  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", data.user?.id)
    .single();

  return (
    <div className="flex">
      <Sidebar
        title={tr.sidebar.teacher}
        items={TEACHER_NAV}
        userName={profile?.full_name || profile?.email || tr.sidebar.teacher}
        signOutLabel={tr.sidebar.signOut}
        locale={locale}
      />
      <main className="min-h-screen flex-1 bg-palace-cream px-6 pb-10 pt-16 md:px-8 md:pt-8">{children}</main>
    </div>
  );
}
