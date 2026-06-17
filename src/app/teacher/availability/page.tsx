import { createClient } from "@/lib/supabase/server";
import { addAvailabilityAction, deleteAvailabilityAction } from "@/app/teacher/actions";
import { dayName, formatTime, courseSlotPlan } from "@/lib/utils";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export default async function TeacherAvailabilityPage() {
  const tr = t(getLocale()).pages;
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data: groups } = await supabase
    .from("groups")
    .select("*, course:courses(*)")
    .eq("teacher_id", auth.user!.id)
    .order("name");

  const { data: availability } = await supabase
    .from("availability")
    .select("*, group:groups(name, course:courses(level))")
    .eq("teacher_id", auth.user!.id)
    .order("day_of_week");

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-bold text-palace-dark">{tr.myAvailability}</h1>
      <p className="mb-6 text-sm text-palace-dark/60">
        Set your fixed weekly time slot(s) for each group. These repeat every week and are
        used to generate the lesson schedule.
      </p>

      {!groups?.length && (
        <p className="card text-sm text-palace-dark/50">No groups assigned yet.</p>
      )}

      {(groups as any[] | null)?.map((g) => {
        const slots = courseSlotPlan(g.course.sessions_per_week, g.course.has_bonus_lesson);
        const existing = availability?.filter((a: any) => a.group_id === g.id) ?? [];
        return (
          <div key={g.id} className="card mb-4">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-palace-red/10 px-2.5 py-1 text-xs font-bold text-palace-red">{g.course.level}</span>
              <h2 className="font-semibold">{g.name}</h2>
            </div>
            <p className="mb-3 text-sm text-palace-dark/50">
              Required: {slots.map((s) => s.label).join(", ")}
            </p>

            <ul className="mb-3 divide-y divide-black/5 text-sm">
              {existing.map((a: any) => (
                <li key={a.id} className="flex items-center justify-between py-2">
                  <span>
                    <span className={`mr-2 rounded-full px-2 py-0.5 text-xs font-semibold ${a.slot_type === "bonus" ? "bg-palace-gold/20 text-palace-gold" : "bg-palace-red/10 text-palace-red"}`}>
                      {a.slot_type === "bonus" ? "Bonus" : "Regular"}
                    </span>
                    {dayName(a.day_of_week)} · {formatTime(a.start_time)}–{formatTime(a.end_time)}
                  </span>
                  <form action={deleteAvailabilityAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" className="text-palace-red hover:underline">Remove</button>
                  </form>
                </li>
              ))}
              {!existing.length && <li className="py-2 text-palace-dark/50">No time slots set.</li>}
            </ul>

            <form action={addAvailabilityAction} className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <input type="hidden" name="group_id" value={g.id} />
              <select className="input" name="day_of_week" required>
                {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d, i) => (
                  <option key={d} value={i}>{d}</option>
                ))}
              </select>
              <input className="input" type="time" name="start_time" required />
              <input className="input" type="time" name="end_time" required />
              <select className="input" name="slot_type">
                <option value="regular">Regular</option>
                {g.course.has_bonus_lesson && <option value="bonus">Bonus</option>}
              </select>
              <button type="submit" className="btn-secondary">Add slot</button>
            </form>
          </div>
        );
      })}
    </div>
  );
}
