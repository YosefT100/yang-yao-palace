import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  const tr = t(locale);

  const ADMIN_NAV = [
    { href: "/admin", label: tr.adminNav.overview },
    { href: "/admin/teachers", label: tr.adminNav.teachers },
    { href: "/admin/courses", label: tr.adminNav.courses },
    { href: "/admin/groups", label: tr.adminNav.groups },
    { href: "/admin/students", label: tr.adminNav.students },
    { href: "/admin/schedule", label: tr.adminNav.schedule },
    { href: "/admin/payments", label: tr.adminNav.payments },
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
        title={tr.sidebar.admin}
        items={ADMIN_NAV}
        userName={profile?.full_name || profile?.email || tr.sidebar.admin}
        signOutLabel={tr.sidebar.signOut}
        locale={locale}
      />
      <main className="min-h-screen flex-1 bg-palace-cream px-6 pb-6 pt-16 md:pt-6">{children}</main>
    </div>
  );
}
