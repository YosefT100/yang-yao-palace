import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export default async function TeacherSchedulePage() {
  const tr = t(getLocale()).pages;
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*, group:groups!inner(name, teacher_id, course:courses(level)), material:materials(title)")
    .eq("group.teacher_id", auth.user!.id)
    .gte("scheduled_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString())
    .order("scheduled_at")
    .limit(50);

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-bold text-palace-dark">{tr.mySchedule}</h1>
      <p className="mb-6 text-sm text-palace-dark/60">
        Open a lesson to choose the presentation/material you'll teach.
      </p>

      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-palace-dark/50">
              <th className="py-2">When</th>
              <th className="py-2">Group</th>
              <th className="py-2">Type</th>
              <th className="py-2">Material</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {(lessons as any[] | null)?.map((l) => (
              <tr key={l.id} className="border-b border-black/5">
                <td className="py-2 whitespace-nowrap">{formatDateTime(l.scheduled_at)}</td>
                <td className="py-2 font-medium">{l.group?.course?.level} · {l.group?.name}</td>
                <td className="py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${l.lesson_type === "bonus" ? "bg-palace-gold/20 text-palace-gold" : "bg-palace-red/10 text-palace-red"}`}>
                    {l.lesson_type === "bonus" ? "Bonus" : "Regular"}
                  </span>
                </td>
                <td className="py-2 text-palace-dark/60">{l.material?.title || "Not selected"}</td>
                <td className="py-2 text-right">
                  <Link href={`/teacher/lessons/${l.id}`} className="text-palace-red hover:underline">
                    Prepare lesson →
                  </Link>
                </td>
              </tr>
            ))}
            {!lessons?.length && (
              <tr><td colSpan={5} className="py-4 text-center text-palace-dark/50">No lessons scheduled yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
