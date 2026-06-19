import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { CheckoutButton } from "@/components/CheckoutButton";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";
import EnrollButton from "@/components/EnrollButton";

const HSK_PRICES: Record<string, string> = {
  HSK1: "$460", HSK2: "$460", HSK3: "$800", HSK4: "$800", HSK5: "$1,800", HSK6: "$2,000",
};

export default async function StudentHomePage() {
  const tr = t(getLocale()).pages;
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from("group_members")
    .select("*, group:groups(*, course:courses(*), teacher:profiles(full_name))")
    .eq("student_id", auth.user!.id);

  const myGroupIds = (memberships ?? []).map((m: any) => m.group_id);

  const { data: upcoming } = myGroupIds.length
    ? await supabase
        .from("lessons")
        .select("*, group:groups(name, course:courses(level))")
        .in("group_id", myGroupIds)
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at")
        .limit(10)
    : { data: [] };

  const { data: courses } = await supabase.from("courses").select("*").eq("is_active", true).order("sort_order");

  const { data: enrollments } = myGroupIds.length
    ? await supabase
        .from("enrollments")
        .select("*")
        .eq("student_id", auth.user!.id)
        .in("group_id", myGroupIds)
    : { data: [] };

  const enrollmentByGroup = new Map((enrollments ?? []).map((e: any) => [e.group_id, e]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">{tr.myCourses}</h1>
        <p className="mt-1 text-sm text-palace-dark/50">Your enrolled groups and upcoming lessons.</p>
      </div>

      {/* My groups */}
      <div className="card">
        <h2 className="mb-4 text-base font-semibold text-palace-dark">My groups</h2>
        {!memberships?.length && (
          <p className="text-sm text-palace-dark/45 py-4 text-center">You&apos;re not enrolled in a group yet — see available courses below.</p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(memberships as any[] | null)?.map((m) => {
            const enrollment = enrollmentByGroup.get(m.group.id);
            const isActive = enrollment?.status === "active";
            return (
              <div key={m.id} className="rounded-xl border border-black/[0.07] p-5 bg-palace-cream/60">
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-flex items-center rounded-full bg-palace-red/8 px-2.5 py-1 text-xs font-bold text-palace-red">
                    {m.group.course.level}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${isActive ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                    {isActive ? "Active" : "Pending"}
                  </span>
                </div>
                <h3 className="font-semibold text-palace-dark mb-1">{m.group.name}</h3>
                <p className="text-sm text-palace-dark/50 mb-1">Teacher: {m.group.teacher?.full_name || "—"}</p>
                <p className="text-sm font-semibold text-palace-dark/70 mb-4">
                  {formatPrice(m.group.course.price_amount, m.group.course.price_currency)}/mo
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/student/groups/${m.group.id}`} className="btn-secondary" style={{ padding: "0.45rem 1rem", fontSize: "0.8rem" }}>View group</Link>
                  {!isActive && <CheckoutButton groupId={m.group.id} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming lessons */}
      <div className="card">
        <h2 className="mb-4 text-base font-semibold text-palace-dark">Upcoming lessons</h2>
        <ul className="divide-y divide-black/[0.05] text-sm">
          {(upcoming as any[] | null)?.map((l) => (
            <li key={l.id} className="flex items-center justify-between py-3">
              <span className="text-palace-dark/80">{l.group?.course?.level} · {l.group?.name} — {l.title}</span>
              <span className="ml-4 shrink-0 rounded-full bg-palace-cream px-3 py-1 text-xs font-medium text-palace-dark/50">
                {formatDateTime(l.scheduled_at)}
              </span>
            </li>
          ))}
          {!upcoming?.length && (
            <li className="py-4 text-center text-palace-dark/45">No upcoming lessons.</li>
          )}
        </ul>
      </div>

      {/* Available courses */}
      <div className="card">
        <h2 className="mb-4 text-base font-semibold text-palace-dark">Available HSK courses</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses?.map((c) => {
            const levelKey = (c.level as string).replace(/\s/g, "");
            const price = HSK_PRICES[levelKey] ?? formatPrice(c.price_amount, c.price_currency);
            return (
              <div key={c.id} className="rounded-xl border border-palace-gold/20 p-4" style={{ borderTop: "2px solid rgba(212,175,55,0.4)" }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-palace-red">{c.level}</h3>
                  <span className="text-sm font-bold text-palace-gold">{price}</span>
                </div>
                <p className="mb-1 text-xs text-palace-dark/50">/ course</p>
                <p className="mt-1 mb-4 text-sm text-palace-dark/60">{c.name}</p>
                <EnrollButton level={c.level as string} name={c.name as string} label="Enroll" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
