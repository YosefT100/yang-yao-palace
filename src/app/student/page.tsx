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
        <h1 className="mb-1 font-serif text-2xl font-bold text-palace-dark">{tr.myCourses}</h1>
        <p className="text-sm text-palace-dark/60">Your enrolled groups and upcoming lessons.</p>
      </div>

      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">My groups</h2>
        {!memberships?.length && (
          <p className="text-sm text-palace-dark/50">You're not enrolled in a group yet — see available courses below.</p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(memberships as any[] | null)?.map((m) => {
            const enrollment = enrollmentByGroup.get(m.group.id);
            const isActive = enrollment?.status === "active";
            return (
              <div key={m.id} className="card">
                <span className="rounded-full bg-palace-red/10 px-2.5 py-1 text-xs font-bold text-palace-red">
                  {m.group.course.level}
                </span>
                <h3 className="mt-2 font-semibold">{m.group.name}</h3>
                <p className="mt-1 text-sm text-palace-dark/60">Teacher: {m.group.teacher?.full_name || "—"}</p>
                <p className="mt-2 text-sm font-semibold">
                  {formatPrice(m.group.course.price_amount, m.group.course.price_currency)}/mo —{" "}
                  <span className={isActive ? "text-green-700" : "text-yellow-700"}>
                    {isActive ? "Paid" : "Payment pending"}
                  </span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/student/groups/${m.group.id}`} className="btn-secondary">View group</Link>
                  {!isActive && <CheckoutButton groupId={m.group.id} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">Upcoming lessons</h2>
        <ul className="divide-y divide-black/5 text-sm">
          {(upcoming as any[] | null)?.map((l) => (
            <li key={l.id} className="flex items-center justify-between py-2">
              <span>{l.group?.course?.level} · {l.group?.name} — {l.title}</span>
              <span className="text-palace-dark/50">{formatDateTime(l.scheduled_at)}</span>
            </li>
          ))}
          {!upcoming?.length && <li className="py-2 text-palace-dark/50">No upcoming lessons.</li>}
        </ul>
      </div>

      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">Available HSK courses</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses?.map((c) => {
            const levelKey = (c.level as string).replace(/\s/g, "");
            const price = HSK_PRICES[levelKey] ?? formatPrice(c.price_amount, c.price_currency);
            return (
              <div key={c.id} className="rounded-lg border border-black/5 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-palace-red">{c.level}</h3>
                  <span className="text-sm font-semibold text-palace-gold">{price} / course</span>
                </div>
                <p className="mt-1 text-sm text-palace-dark/60">{c.name}</p>
                <div className="mt-3">
                  <EnrollButton level={c.level as string} name={c.name as string} label="Enroll" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
