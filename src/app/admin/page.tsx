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
    { label: "Teachers", value: teacherCount ?? 0, href: "/admin/teachers", accent: "#9a1f2b" },
    { label: "Students", value: studentCount ?? 0, href: "/admin/students", accent: "#9a1f2b" },
    { label: "Active groups", value: groupCount ?? 0, href: "/admin/groups", accent: "#9a1f2b" },
    { label: "Revenue (active)", value: formatPrice(revenue, currency), href: "/admin/payments", accent: "#D4AF37" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">{tr.overview}</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="stat-card cursor-pointer group"
            style={{ borderTop: `3px solid ${s.accent}` }}
          >
            <p className="text-xs font-semibold tracking-wide text-palace-dark/45 uppercase">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-palace-dark group-hover:text-palace-red transition-colors duration-150">
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Upcoming lessons */}
      <div className="card">
        <h2 className="mb-4 text-base font-semibold text-palace-dark">Upcoming lessons</h2>
        {!upcoming?.length && (
          <p className="text-sm text-palace-dark/45 py-4 text-center">No upcoming lessons scheduled.</p>
        )}
        <ul className="divide-y divide-black/[0.05]">
          {upcoming?.map((l: any) => (
            <li key={l.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-semibold text-palace-dark">
                  {l.group?.course?.level}
                  <span className="font-normal text-palace-dark/50"> · {l.group?.name}</span>
                </p>
                <p className="mt-0.5 text-xs text-palace-dark/40">{l.title}</p>
              </div>
              <span className="ml-4 shrink-0 rounded-full bg-palace-cream px-3 py-1 text-xs font-medium text-palace-dark/60">
                {formatDateTime(l.scheduled_at)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/admin/courses" className="card cursor-pointer group text-center" style={{ borderTop: "2px solid rgba(212,175,55,0.3)" }}>
          <p className="font-semibold text-palace-red group-hover:text-[#7a1820] transition-colors duration-150">Manage HSK courses</p>
          <p className="mt-1.5 text-sm text-palace-dark/45">Set pricing &amp; weekly cadence</p>
        </Link>
        <Link href="/admin/groups" className="card cursor-pointer group text-center" style={{ borderTop: "2px solid rgba(212,175,55,0.3)" }}>
          <p className="font-semibold text-palace-red group-hover:text-[#7a1820] transition-colors duration-150">Manage groups</p>
          <p className="mt-1.5 text-sm text-palace-dark/45">Assign teachers &amp; students</p>
        </Link>
        <Link href="/admin/schedule" className="card cursor-pointer group text-center" style={{ borderTop: "2px solid rgba(212,175,55,0.3)" }}>
          <p className="font-semibold text-palace-red group-hover:text-[#7a1820] transition-colors duration-150">View schedule</p>
          <p className="mt-1.5 text-sm text-palace-dark/45">All upcoming lessons</p>
        </Link>
      </div>
    </div>
  );
}
