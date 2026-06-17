import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  const tr = t(locale);

  const STUDENT_NAV = [{ href: "/student", label: tr.studentNav.myCourses }];

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
        title={tr.sidebar.student}
        items={STUDENT_NAV}
        userName={profile?.full_name || profile?.email || tr.sidebar.student}
        signOutLabel={tr.sidebar.signOut}
        locale={locale}
      />
      <main className="min-h-screen flex-1 bg-palace-cream px-6 pb-6 pt-16 md:pt-6">{children}</main>
    </div>
  );
}
