import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { CheckoutButton } from "@/components/CheckoutButton";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export default async function StudentHomePage() {
  const locale = getLocale();
  const tr = t(locale).pages;
  const landing = t(locale).landing;
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from("group_members")
    .select("*, group:groups(*, course:courses(*), teacher:profiles(full_name))")
    .eq("student_id", auth.user!.id);

  const myGroupIds = (memberships ?? []).map((m: any) => m.group_id);

  const { data: enrollments } = myGroupIds.length
    ? await supabase
        .from("enrollments")
        .select("*")
        .eq("student_id", auth.user!.id)
        .in("group_id", myGroupIds)
    : { data: [] };

  const activeGroupIds = (enrollments ?? [])
    .filter((e: any) => e.status === "active")
    .map((e: any) => e.group_id);

  const { data: upcoming } = activeGroupIds.length
    ? await supabase
        .from("lessons")
        .select("*, group:groups(name, course:courses(level))")
        .in("group_id", activeGroupIds)
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at")
        .limit(10)
    : { data: [] };

  const { data: courses } = await supabase.from("courses").select("*").eq("is_active", true).order("sort_order");

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
            return (
              <div key={c.id} className="rounded-xl border border-palace-gold/20 p-4" style={{ borderTop: "2px solid rgba(212,175,55,0.4)" }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-palace-red">{c.level}</h3>
                </div>
                <p className="mb-1 text-xs text-palace-dark/50">/ course</p>
                <p className="mt-1 mb-4 text-sm text-palace-dark/60">{c.name}</p>
                <a
                  href={`https://api.whatsapp.com/send?phone=972528847770&text=${encodeURIComponent(`Hi! I'm interested in the ${c.name} course at Yang Yao Palace. Could you please send me more information about pricing and enrollment?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg py-2 px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#25D366" }}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {landing.contactForPricing}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
