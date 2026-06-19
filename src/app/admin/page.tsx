import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export default async function AdminOverviewPage() {
  const tr = t(getLocale()).pages;
  const supabase = createClient();

  const [{ count: teacherCount }, { count: studentCount }, { count: groupCount }, { data: enrollments }, { data: upcoming }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "teacher"),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("groups").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("enrollments").select("price_amount, price_currency, status"),
      supabase
        .from("lessons")
        .select("*, group:groups(name, course:courses(level))")
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at")
        .limit(6),
    ]);

  const revenue = (enrollments ?? [])
    .filter((e) => e.status === "active")
    .reduce((sum, e) => sum + e.price_amount, 0);
  const currency = enrollments?.[0]?.price_currency || "ILS";

  const stats = [
    { label: "Teachers", value: teacherCount ?? 0, href: "/admin/teachers" },
    { label: "Students", value: studentCount ?? 0, href: "/admin/students" },
    { label: "Active groups", value: groupCount ?? 0, href: "/admin/groups" },
    { label: "Monthly revenue (active)", value: formatPrice(revenue, currency), href: "/admin/payments" },
  ];

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold text-palace-dark">{tr.overview}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card hover:shadow-md">
            <p className="text-sm text-palace-dark/50">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-palace-red">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 card">
        <h2 className="mb-3 text-lg font-semibold">Upcoming lessons</h2>
        {!upcoming?.length && <p className="text-sm text-palace-dark/50">No upcoming lessons scheduled.</p>}
        <ul className="divide-y divide-black/5">
          {upcoming?.map((l: any) => (
            <li key={l.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-medium">{l.group?.course?.level} · {l.group?.name}</p>
                <p className="text-palace-dark/50">{l.title}</p>
              </div>
              <span className="text-palace-dark/60">{formatDateTime(l.scheduled_at)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/admin/courses" className="card text-center hover:shadow-md">
          <p className="font-semibold text-palace-red">Manage HSK courses</p>
          <p className="mt-1 text-sm text-palace-dark/50">Set pricing & weekly cadence</p>
        </Link>
        <Link href="/admin/groups" className="card text-center hover:shadow-md">
          <p className="font-semibold text-palace-red">Manage groups</p>
          <p className="mt-1 text-sm text-palace-dark/50">Assign teachers & students</p>
        </Link>
        <Link href="/admin/schedule" className="card text-center hover:shadow-md">
          <p className="font-semibold text-palace-red">View schedule</p>
        </Link>
      </div>
    </div>
  );
}
