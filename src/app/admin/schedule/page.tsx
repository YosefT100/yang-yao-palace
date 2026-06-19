import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export default async function AdminSchedulePage() {
  const tr = t(getLocale()).pages;
  const supabase = createClient();
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*, group:groups(name, course:courses(level), teacher:profiles(full_name, email)), material:materials(title)")
    .gte("scheduled_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString())
    .order("scheduled_at")
    .limit(100);

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-bold text-palace-dark">{tr.schedule}</h1>

      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-palace-dark/50">
              <th className="py-2">When</th>
              <th className="py-2">Level / Group</th>
              <th className="py-2">Teacher</th>
              <th className="py-2">Type</th>
              <th className="py-2">Material</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(lessons as any[] | null)?.map((l) => (
              <tr key={l.id} className="border-b border-black/5">
                <td className="py-2 whitespace-nowrap">{formatDateTime(l.scheduled_at)}</td>
                <td className="py-2 font-medium">{l.group?.course?.level} · {l.group?.name}</td>
                <td className="py-2">{l.group?.teacher?.full_name || l.group?.teacher?.email || "—"}</td>
                <td className="py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${l.lesson_type === "bonus" ? "bg-palace-gold/20 text-palace-gold" : "bg-palace-red/10 text-palace-red"}`}>
                    {l.lesson_type === "bonus" ? "Bonus" : "Regular"}
                  </span>
                </td>
                <td className="py-2 text-palace-dark/60">{l.material?.title || "—"}</td>
                <td className="py-2 capitalize text-palace-dark/60">{l.status}</td>
              </tr>
            ))}
            {!lessons?.length && (
              <tr><td colSpan={6} className="py-4 text-center text-palace-dark/50">No lessons scheduled yet. Generate a schedule from a group's page.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
